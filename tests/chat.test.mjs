import test from 'node:test'
import assert from 'node:assert/strict'
import { groundedAnswer, isMedical, noSource, retrieve } from '../supabase/functions/zuyter-chat/retrieval.ts'

const source = { title: 'سرم نیاسینامید', url: 'https://zuyter.ir/product/serum/', excerpt: 'حجم محصول ۳۰ میلی‌لیتر است.' }

test('retrieval requires matching terms and returns reviewed text only', () => {
  assert.deepEqual(retrieve('زویتر کدام محصول؟', [source]), [])
  assert.deepEqual(retrieve('نياسيناميد چه حجمی دارد؟', [source]), [source])
  assert.equal(groundedAnswer('1', [source]).answer, source.excerpt)
  assert.equal(groundedAnswer('1\nتوصیه ساختگی', [source]).answer, noSource)
  assert.equal(groundedAnswer('4', [source]).answer, noSource)
})

test('medical questions use a fixed response path', () => {
  assert.equal(isMedical('برای درمان اگزما چی استفاده کنم؟'), true)
  assert.equal(isMedical('حجم سرم نیاسینامید چقدر است؟'), false)
})
