import test from 'node:test'
import assert from 'node:assert/strict'
import { activeQuestions, answerSummary, chooseAnswer, draftRoutine } from '../src/questionnaire.ts'

test('integrated HTML branches on pigmentation and discards the hidden answer', () => {
  let answers = chooseAnswer('q9', {}, 'sun')
  assert.equal(activeQuestions(answers).length, 13)
  answers = chooseAnswer('q9a', answers, 'mid')
  answers = chooseAnswer('q9', answers, 'none')
  assert.equal(activeQuestions(answers).length, 12)
  assert.equal(answers.q9a, undefined)
})

test('multiple symptoms can be selected while current routine uses a single answer', () => {
  const first = chooseAnswer('q6', {}, 'red')
  const second = chooseAnswer('q6', first, 'itch')
  assert.deepEqual(second.q6, ['red', 'itch'])
  assert.deepEqual(chooseAnswer('q10', { q10: ['wash'] }, 'simple').q10, ['simple'])
})

test('pattern and specialist review use integrated answers and older snapshots remain readable', () => {
  const result = draftRoutine({ q3: ['dry'], q11: ['yes'], q5: ['no'] })
  assert.equal(result.pattern, 'خشک')
  assert.equal(result.review, true)
  assert.ok(result.morning.includes('ضدآفتاب مناسب'))
  assert.deepEqual(answerSummary({ oil: ['پیشانی و بینی'] }, 'draft-1')[0].values, ['پیشانی و بینی'])
  assert.equal(answerSummary({ q3: ['dry'] }, 'integrated-1')[0].values.length, 1)
})
