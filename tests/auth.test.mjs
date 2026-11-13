import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeIranianMobile, toSupabasePhone } from '../src/phone.ts'

test('Iranian mobile normalization accepts Persian digits and emits E.164', () => {
  assert.equal(normalizeIranianMobile('۰۹۱۲ ۳۴۵ ۶۷۸۹'), '09123456789')
  assert.equal(normalizeIranianMobile('٠٩١٢٣٤٥٦٧٨٩'), '09123456789')
  assert.equal(toSupabasePhone('09123456789'), '+989123456789')
  assert.equal(normalizeIranianMobile('0912345678'), null)
  assert.equal(normalizeIranianMobile('091234567890'), null)
  assert.equal(normalizeIranianMobile('08123456789'), null)
})
