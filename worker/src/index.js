const CLAUDE_API = 'https://api.anthropic.com/v1/messages'

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
    const payload = await verifyJWT(authHeader.slice(7), env.SUPABASE_JWT_SECRET)
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

async function verifyJWT(token, secret) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    const sig = base64UrlDecode(parts[2])
    const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    const valid = await crypto.subtle.verify('HMAC', key, sig, data)
    if (!valid) return null

    const payload = JSON.parse(base64UrlDecodeString(parts[1]))
    if (payload.exp && payload.exp < Date.now() / 1000) return null

    return payload
  } catch {
    return null
  }
}

function base64UrlDecode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(padded)
  return Uint8Array.from(bin, c => c.charCodeAt(0))
}

function base64UrlDecodeString(str) {
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'))
}
