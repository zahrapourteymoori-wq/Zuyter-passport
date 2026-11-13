import test from 'node:test'
import assert from 'node:assert/strict'
import { activeQuestions, cleanAnswers, draftRoutine } from '../src/questionnaire.ts'

test('conditional answer is removed when spots no longer apply', () => {
  assert.equal(activeQuestions({ spots: ['بله'] }).length, 13)
  const cleaned = cleanAnswers({ spots: ['خیر'], spotDuration: ['کمتر از سه ماه'], unexpected: ['x'] })
  assert.equal(Object.keys(cleaned).length, 12)
  assert.equal(cleaned.spotDuration, undefined)
  assert.equal(cleaned.unexpected, undefined)
})

test('behavior determines pattern and reactions trigger specialist review', () => {
  const result = draftRoutine({ oil: ['هیچ‌کدام'], cleanse: ['کشیدگی'], reaction: ['بله'] })
  assert.equal(result.pattern, 'متمایل به خشکی')
  assert.equal(result.review, true)
  assert.ok(result.morning.includes('ضدآفتاب مناسب'))
})
