import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACTIVITY_READY, GUIDED_EXPERIMENTS, createGuidedState,
  recordPrediction, observeExperiment, submitReflection, guidedExperiment
} from '../js/activity.js';

test('la actividad comienza sin resultados ni predicción guardada', () => {
  const s = createGuidedState();
  assert.equal(ACTIVITY_READY, true);
  assert.equal(s.stage, 'prediction');
  assert.equal(s.prediction, null);
  assert.deepEqual(s.seen, []);
});

test('no se permite revelar experimentos antes de predecir', () => {
  assert.throws(() => observeExperiment(createGuidedState(), 10));
  assert.throws(() => recordPrediction(createGuidedState(), 'invalid'), RangeError);
  const s = recordPrediction(createGuidedState(), 'narrow');
  assert.equal(s.stage, 'experiments');
  assert.equal(s.prediction, 'narrow');
  assert.throws(() => recordPrediction(s, 'prior'));
});

test('los experimentos siguen el orden y no se pueden saltar ni repetir', () => {
  let s = recordPrediction(createGuidedState(), 'same');
  assert.throws(() => observeExperiment(s, 100));
  s = observeExperiment(s, 10);
  assert.deepEqual(s.seen, [10]);
  assert.throws(() => observeExperiment(s, 10));
  s = observeExperiment(s, 100);
  assert.equal(s.stage, 'experiments');
  s = observeExperiment(s, 1000);
  assert.equal(s.stage, 'reflection');
  assert.deepEqual(s.seen, GUIDED_EXPERIMENTS);
  assert.throws(() => observeExperiment(s, 1000));
});

test('resultados matemáticos en los tres escenarios', () => {
  const cases = GUIDED_EXPERIMENTS.map(guidedExperiment);
  assert.deepEqual(cases.map(s => [s.alpha, s.beta]), [[9,5],[72,32],[702,302]]);
  assert.ok(cases[0].mean < cases[1].mean && cases[1].mean < cases[2].mean);
  assert.ok(cases[0].sd > cases[1].sd && cases[1].sd > cases[2].sd);
  assert.throws(() => guidedExperiment(25), RangeError);
});

test('la reflexión requiere dos argumentos razonados y no califica automáticamente', () => {
  let s = recordPrediction(createGuidedState(), 'narrow');
  for (const n of GUIDED_EXPERIMENTS) s = observeExperiment(s, n);
  assert.throws(() => submitReflection(s, 'breve', 'breve'), RangeError);
  const done = submitReflection(s,
    'Con más datos la incertidumbre posterior disminuye claramente.',
    'Con una priori Beta(20,20) la muestra pequeña pesa proporcionalmente menos.');
  assert.equal(done.stage, 'completed');
  assert.ok(!('score' in done));
  assert.equal(done.prediction, 'narrow');
});
