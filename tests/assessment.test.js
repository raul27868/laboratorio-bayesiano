import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, PREDICTION_FEEDBACK, RUBRIC, evaluateClosedAnswers, rubricTotal, exportAttempt, validateStoredAttempt } from '../js/assessment.js';

test('cada respuesta cerrada recibe feedback específico, sin revelar nada antes de responder', () => {
  assert.equal(QUESTIONS.length, 2);
  const success = evaluateClosedAnswers({ uncertainty: 'decrease', prior: 'small' });
  assert.equal(success.correct, 2);
  assert.equal(success.total, 2);
  assert.ok(success.details.every(d => d.correct));
  const mistakes = evaluateClosedAnswers({ uncertainty: 'same', prior: 'large' });
  assert.equal(mistakes.correct, 0);
  assert.match(mistakes.details[0].feedback, /proporción/);
  assert.match(PREDICTION_FEEDBACK.mean, /media/);
  assert.throws(() => evaluateClosedAnswers({ uncertainty: 'decrease' }), RangeError);
  assert.throws(() => evaluateClosedAnswers({ uncertainty: 'other', prior: 'small' }), RangeError);
});

test('la rúbrica puntúa 10 puntos, sin corregir automáticamente respuestas abiertas', () => {
  assert.equal(RUBRIC.reduce((sum, c) => sum + c.max, 0), 10);
  assert.equal(rubricTotal({ interpretation: 3, uncertainty: 3, prior: 3, evidence: 1 }), 10);
  assert.equal(rubricTotal({ interpretation: 1, uncertainty: 2, prior: 1, evidence: 0 }), 4);
  assert.throws(() => rubricTotal({ interpretation: 4, uncertainty: 3, prior: 3, evidence: 1 }), RangeError);
  assert.throws(() => rubricTotal({ interpretation: 3, uncertainty: 3, prior: 3 }), RangeError);
});

const finished = {
  stage: 'completed', prediction: 'narrow', seen: [10, 100, 1000],
  reflection: 'El tamaño muestral cambia la precisión de la posterior.',
  transfer: 'Una priori Beta(20,20) influye relativamente más con n pequeño.',
  quizAnswers: { uncertainty: 'decrease', prior: 'small' }
};

test('el informe exportado es reproducible y no contiene identificadores', () => {
  const report = exportAttempt(finished);
  assert.equal(report.schema, 'laboratorio-bayesiano/attempt/v1');
  assert.equal(report.closedFeedback.correct, 2);
  assert.equal(report.rubric, null);
  assert.equal(report.openAnswersRequireHumanReview, true);
  assert.equal(validateStoredAttempt(JSON.parse(JSON.stringify(report))), true);
  assert.ok(!('studentName' in report));
  assert.ok(!('timestamp' in report));
  assert.throws(() => exportAttempt({ ...finished, stage: 'quiz' }));
});

test('el reporte puede incorporar una rúbrica aplicada por el docente', () => {
  const report = exportAttempt(finished, { interpretation: 3, uncertainty: 2, prior: 2, evidence: 1 });
  assert.equal(report.rubric.total, 8);
  assert.equal(report.openAnswersRequireHumanReview, false);
  assert.equal(validateStoredAttempt(report), true);
  assert.throws(() => validateStoredAttempt({ ...report, prediction: 'other' }), RangeError);
});
