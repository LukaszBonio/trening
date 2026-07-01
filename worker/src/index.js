const CLAUDE_API = 'https://api.anthropic.com/v1/messages'

let _jwksCache = null
let _jwksCacheTime = 0
const JWKS_TTL = 3600000

async function fetchJWKS(supabaseUrl) {
  if (_jwksCache && Date.now() - _jwksCacheTime < JWKS_TTL) return _jwksCache
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
    const jwks = await fetchJWKS(supabaseUrl)
    const jwk = jwks.keys.find(k => k.kid === header.kid)
    if (!jwk) return null

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

    let body
    try {
      body = await request.json()
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400)
    }

    const resp = await fetch(CLAUDE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    })

    const data = await resp.text()
    return new Response(data, {
      status: resp.status,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    })
  }
}
