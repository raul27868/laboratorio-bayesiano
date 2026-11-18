import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, TOTAL_POINTS, PREDICTION_FEEDBACK, evaluateClosedAnswers, exportAttempt, validateStoredAttempt } from '../js/assessment.js';

const correctAnswers = Object.fromEntries(QUESTIONS.map(q => [q.id, q.correct]));

test('seis preguntas y 10 puntos objetivos', () => {
  assert.equal(QUESTIONS.length, 6);
  assert.equal(TOTAL_POINTS, 10);
  assert.ok(QUESTIONS.every(q => q.choices.length === 4 && q.choices.every(c => c.feedback)));
  assert.equal(new Set(QUESTIONS.map(q => q.id)).size, 6);
});

test('seis respuestas correctas obtienen 10/10', () => {
  const result = evaluateClosedAnswers(correctAnswers);
  assert.equal(result.points, 10);
  assert.equal(result.correct, 6);
  assert.equal(result.total, 6);
  assert.ok(result.details.every(d => d.correct && d.feedback && d.correctLabel));
});

test('cada opción errónea se corrige y muestra la solución correcta', () => {
  for (const question of QUESTIONS) {
    for (const choice of question.choices.filter(c => c.id !== question.correct)) {
      const result = evaluateClosedAnswers({ ...correctAnswers, [question.id]: choice.id });
      assert.equal(result.points, 10 - question.points);
      const detail = result.details.find(d => d.id === question.id);
      assert.equal(detail.correct, false);
      assert.ok(detail.feedback.length > 15);
      assert.equal(detail.correctLabel, question.choices.find(c => c.id === question.correct).label);
    }
  }
});

test('no se admiten cuestionarios incompletos ni respuestas desconocidas', () => {
  assert.throws(() => evaluateClosedAnswers({}), RangeError);
  assert.throws(() => evaluateClosedAnswers({ ...correctAnswers, mean: 'inexistente' }), RangeError);
});

test('informe JSON completo, autocorregido y sin datos personales', () => {
  const state = { stage: 'completed', prediction: 'same', seen: [10, 100, 1000], quizAnswers: correctAnswers };
  const report = exportAttempt(state);
  assert.equal(report.schema, 'laboratorio-bayesiano/attempt/v2');
  assert.equal(report.result.points, 10);
  assert.equal(report.predictionFeedback, PREDICTION_FEEDBACK.same);
  assert.equal(validateStoredAttempt(JSON.parse(JSON.stringify(report))), true);
  assert.ok(!('rubric' in report) && !('reflection' in report) && !('teacherScores' in report));
  assert.throws(() => exportAttempt({ ...state, stage: 'prediction' }));
  assert.throws(() => validateStoredAttempt({ ...report, schema: 'laboratorio-bayesiano/attempt/v1' }), RangeError);
});
