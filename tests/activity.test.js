import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS } from '../js/assessment.js';
import { ACTIVITY_READY, GUIDED_EXPERIMENTS, createGuidedState, recordPrediction, observeExperiment, submitClosedAnswers, guidedExperiment } from '../js/activity.js';

test('la actividad comienza en predicción y no revela resultados', () => {
  const state = createGuidedState();
  assert.equal(ACTIVITY_READY, true);
  assert.equal(state.stage, 'prediction');
  assert.deepEqual(state.seen, []);
  assert.equal(state.quizAnswers, null);
  assert.throws(() => submitClosedAnswers(state, {}));
  assert.throws(() => observeExperiment(state, 10));
});

test('es obligatorio predecir y observar los experimentos en orden', () => {
  assert.throws(() => recordPrediction(createGuidedState(), 'invalid'), RangeError);
  let s = recordPrediction(createGuidedState(), 'narrow');
  assert.throws(() => observeExperiment(s, 100), RangeError);
  s = observeExperiment(s, 10);
  s = observeExperiment(s, 100);
  assert.equal(s.stage, 'experiments');
  s = observeExperiment(s, 1000);
  assert.equal(s.stage, 'quiz');
  assert.deepEqual(s.seen, GUIDED_EXPERIMENTS);
  assert.throws(() => observeExperiment(s, 1000));
});

test('la evaluación cerrada completa termina el intento', () => {
  let s = recordPrediction(createGuidedState(), 'same');
  for (const n of GUIDED_EXPERIMENTS) s = observeExperiment(s, n);
  assert.throws(() => submitClosedAnswers(s, { parameters: 'b' }), RangeError);
  const answers = Object.fromEntries(QUESTIONS.map(q => [q.id, q.correct]));
  s = submitClosedAnswers(s, answers);
  assert.equal(s.stage, 'completed');
  assert.deepEqual(s.quizAnswers, answers);
  assert.equal(s.prediction, 'same');
  assert.ok(!('reflection' in s) && !('transfer' in s));
});

test('resultados matemáticos de los tres experimentos preservados', () => {
  const results = GUIDED_EXPERIMENTS.map(guidedExperiment);
  assert.deepEqual(results.map(r => [r.alpha, r.beta]), [[9,5],[72,32],[702,302]]);
  assert.ok(results[0].sd > results[1].sd && results[1].sd > results[2].sd);
});
