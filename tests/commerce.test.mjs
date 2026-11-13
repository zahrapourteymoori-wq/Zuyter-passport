import test from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { orderSnapshot, validSignature } from '../supabase/functions/woocommerce-orders/order.ts'

test('WooCommerce signature covers the original bytes and staged fields exclude personal data', async () => {
  const input = { id: 41, status: 'completed', currency: 'IRR', total: '500', date_modified_gmt: '2026-11-13T10:00:00', billing: { email: 'private@example.test' } }
  const body = new TextEncoder().encode(JSON.stringify(input))
  const secret = 'test-signing-secret'
  const signature = createHmac('sha256', secret).update(body).digest('base64')
  assert.equal(await validSignature(body, signature, secret), true)
  body[0] ^= 1
  assert.equal(await validSignature(body, signature, secret), false)
  assert.deepEqual(Object.keys(orderSnapshot(input)), ['wc_id', 'wc_status', 'wc_currency', 'wc_total', 'wc_modified'])
  assert.equal(orderSnapshot({ ...input, total: '1e4' }), null)
})
