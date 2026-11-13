import { Webhook } from 'npm:svix@1.76.0'

// Supabase Auth sends a signed hook payload. The provider credentials and URL
// remain project secrets, so this function can be deployed from source safely.
Deno.serve(async request => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const hookSecret = Deno.env.get('SEND_SMS_HOOK_SECRET')?.replace(/^v1,whsec_/, '')
  const patternUrl = Deno.env.get('MELIPAYAMAK_PATTERN_URL')
  const username = Deno.env.get('MELIPAYAMAK_USERNAME')
  const password = Deno.env.get('MELIPAYAMAK_PASSWORD')
  const bodyId = Deno.env.get('MELIPAYAMAK_BODY_ID')
  if (!hookSecret || !patternUrl || !username || !password || !bodyId) {
    return new Response(JSON.stringify({ error: 'SMS service is not configured' }), { status: 503 })
  }

  try {
    const raw = await request.text()
    const headers = Object.fromEntries(request.headers)
    const { user, sms } = new Webhook(hookSecret).verify(raw, headers) as {
      user: { phone?: string }
      sms: { otp?: string }
    }
    if (!/^\+989[0-9]{9}$/.test(user.phone ?? '') || !/^[0-9]{4,8}$/.test(sms.otp ?? '')) {
      return new Response(JSON.stringify({ error: 'Invalid SMS hook payload' }), { status: 400 })
    }

    // The URL and request schema are configurable because provider accounts
    // can expose different regional endpoints. Never log this request body.
    const response = await fetch(patternUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        bodyId,
        to: user.phone,
        args: [sms.otp],
      }),
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) return new Response(JSON.stringify({ error: 'SMS provider rejected the request' }), { status: 502 })
    return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch {
    return new Response(JSON.stringify({ error: 'SMS provider request failed' }), { status: 502 })
  }
})
