const CLAUDE_API = 'https://api.anthropic.com/v1/messages'

// Twarde limity — Worker to proxy płacące naszym kluczem, a rejestracja jest otwarta.
// Bez tego dowolny zalogowany user mógłby podać własny model / max_tokens / prompt.
// sonnet-4-6 zostaje na whiteliście przejściowo, żeby redeploy Workera był niezależny
// od kolejności wdrożenia frontendu (stary front nadal działa po redeployu).
const ALLOWED_MODELS = new Set(['claude-sonnet-5', 'claude-sonnet-4-6'])
const MAX_TOKENS_CAP = 4096
const MAX_PROMPT_CHARS = 100000  // ~25k tokenów wejścia — z zapasem na katalog ćwiczeń

// Rate-limit per użytkownik (fixed window w KV). Chroni przed nadużyciem naszego
// klucza przy otwartej rejestracji. Wymaga bindingu KV `RATE_LIMIT` (patrz wrangler.toml);
// bez bindingu limit jest nieaktywny (bezpieczny no-op), więc deploy działa przed konfiguracją.
const RATE_LIMIT_MAX = 40         // żądań na okno
const RATE_LIMIT_WINDOW = 3600    // sekund (1h)

async function checkRateLimit(env, userId) {
  if (!env.RATE_LIMIT || !userId) return { ok: true }
  const nowSec = Math.floor(Date.now() / 1000)
  const window = Math.floor(nowSec / RATE_LIMIT_WINDOW)
  const key = `rl:${userId}:${window}`
  const current = parseInt(await env.RATE_LIMIT.get(key), 10) || 0
  if (current >= RATE_LIMIT_MAX) {
    return { ok: false, retryAfter: RATE_LIMIT_WINDOW - (nowSec % RATE_LIMIT_WINDOW) }
  }
  // TTL czyści licznik po zamknięciu okna (bez ręcznego sprzątania).
  await env.RATE_LIMIT.put(key, String(current + 1), { expirationTtl: RATE_LIMIT_WINDOW })
  return { ok: true }
}

let _jwksCache = null
let _jwksCacheTime = 0
const JWKS_TTL = 3600000

async function fetchJWKS(supabaseUrl, force = false) {
  if (!force && _jwksCache && Date.now() - _jwksCacheTime < JWKS_TTL) return _jwksCache
  const resp = await fetch(`${supabaseUrl}/auth/v1/.well-known/jwks.json`)
  if (!resp.ok) throw new Error('JWKS fetch failed')
  _jwksCache = await resp.json()
  _jwksCacheTime = Date.now()
  return _jwksCache
}

async function verifyJWT(token, supabaseUrl) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const header = JSON.parse(b64Decode(parts[0]))
    let jwks = await fetchJWKS(supabaseUrl)
    let jwk = jwks.keys.find(k => k.kid === header.kid)
    if (!jwk) {
      // Nietrafiony kid — prawdopodobnie rotacja kluczy Supabase. Odśwież JWKS raz
      // (pomijając cache), zanim odrzucimy ważny token.
      jwks = await fetchJWKS(supabaseUrl, true)
      jwk = jwks.keys.find(k => k.kid === header.kid)
      if (!jwk) return null
    }

    const key = await crypto.subtle.importKey(
      'jwk', jwk,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false, ['verify']
    )
    const sig = b64DecodeBytes(parts[2])
    const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    const valid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      key, sig, data
    )
    if (!valid) return null

    const payload = JSON.parse(b64Decode(parts[1]))
    if (payload.exp && payload.exp < Date.now() / 1000) return null

    return payload
  } catch {
    return null
  }
}

function b64Decode(str) {
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'))
}

function b64DecodeBytes(str) {
  const bin = b64Decode(str)
  return Uint8Array.from(bin, c => c.charCodeAt(0))
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
  })
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() })
    }
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405)
    }

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonResponse({ error: 'Missing authorization' }, 401)
    }
    const payload = await verifyJWT(authHeader.slice(7), env.SUPABASE_URL)
    if (!payload) {
      return jsonResponse({ error: 'Invalid or expired token' }, 401)
    }

    const rl = await checkRateLimit(env, payload.sub)
    if (!rl.ok) {
      return new Response(
        JSON.stringify({ error: 'Przekroczono limit zapytań — spróbuj za chwilę' }),
        { status: 429, headers: { ...corsHeaders(), 'Content-Type': 'application/json', 'Retry-After': String(rl.retryAfter) } }
      )
    }

    let body
    try {
      body = await request.json()
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400)
    }

    // Walidacja + sanityzacja: przepuszczamy tylko whitelistowane pola i limity,
    // żeby nie dało się nadużyć naszego klucza (dowolny model/rozmiar/prompt).
    if (!ALLOWED_MODELS.has(body?.model)) {
      return jsonResponse({ error: 'Model not allowed' }, 400)
    }
    if (!Array.isArray(body?.messages) || body.messages.length === 0) {
      return jsonResponse({ error: 'Invalid messages' }, 400)
    }
    const promptChars = JSON.stringify(body.messages).length + (body.system ? String(body.system).length : 0)
    if (promptChars > MAX_PROMPT_CHARS) {
      return jsonResponse({ error: 'Prompt too large' }, 413)
    }
    const maxTokens = Math.min(Number(body.max_tokens) || 1024, MAX_TOKENS_CAP)
    const safeBody = {
      model: body.model,
      max_tokens: maxTokens,
      messages: body.messages,
      ...(typeof body.system === 'string' ? { system: body.system } : {}),
      ...(Array.isArray(body.tools) ? { tools: body.tools } : {}),
      ...(body.tool_choice ? { tool_choice: body.tool_choice } : {}),
      ...(body.thinking ? { thinking: body.thinking } : {})
    }

    const resp = await fetch(CLAUDE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(safeBody)
    })

    const data = await resp.text()
    return new Response(data, {
      status: resp.status,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    })
  }
}
