import { createClient } from 'npm:@supabase/supabase-js@2.95.3'
import { orderSnapshot, validSignature } from './order.ts'

const maxBytes = 512 * 1024
Deno.serve(async request => {
  const response = (status: number) => new Response(null, { status, headers: { 'Cache-Control': 'no-store' } })
  if (request.method !== 'POST') return response(405)
  const secret = Deno.env.get('WOOCOMMERCE_WEBHOOK_SECRET')
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!secret || !url || !key) return response(503)

  const signature = request.headers.get('x-wc-webhook-signature')
  if (!signature || signature.length !== 44) return response(401)
  const reader = request.body?.getReader()
  if (!reader) return response(400)
  const body = new Uint8Array(maxBytes)
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (size + value.length > maxBytes) {
      await reader.cancel()
      return response(413)
    }
    body.set(value, size)
    size += value.length
  }
  const payload = body.subarray(0, size)
  // Authenticate the raw bytes before parsing. Customer details never enter the database.
  if (!await validSignature(payload, signature, secret)) return response(401)
  const topic = request.headers.get('x-wc-webhook-topic')
  if (topic !== 'order.created' && topic !== 'order.updated') return response(400)
  let parsed: unknown
  try {
    parsed = JSON.parse(new TextDecoder().decode(payload))
  } catch {
    return response(400)
  }
  const snapshot = orderSnapshot(parsed)
  if (!snapshot) return response(400)
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const result = await db.rpc('stage_woocommerce_order', snapshot)
  return response(result.error ? 503 : 204)
})
