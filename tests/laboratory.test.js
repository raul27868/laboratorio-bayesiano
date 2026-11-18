import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, LABORATORY_READY, evaluateExperiment, explainExperiment, normalizeInputs } from '../js/laboratory.js';
import { CHARTS_READY } from '../js/charts.js';

test('módulos del laboratorio activos', () => {
  assert.equal(LABORATORY_READY, true);
  assert.equal(CHARTS_READY, true);
});

test('escenario inicial: Beta(2,2), 7 caras de 10', () => {
  const r = evaluateExperiment(DEFAULTS);
  assert.deepEqual([r.posterior.alpha, r.posterior.beta], [9,5]);
  assert.equal(r.observedRate, 0.7);
  assert.ok(Math.abs(r.posterior.mean - 9/14) < 1e-12);
  assert.match(explainExperiment(r), /10 observaciones/);
});

test('sin observaciones, la posterior coincide con la priori', () => {
  const r = evaluateExperiment({ alpha: 0.5, beta: 2, n: 0, successes: 0 });
  assert.equal(r.observedRate, null);
  assert.equal(r.posterior.mean, r.prior.mean);
  assert.match(explainExperiment(r), /Sin observaciones/);
});

test('validación de parámetros y recuentos', () => {
  for (const bad of [
    { alpha: 0, beta: 2, n: 10, successes: 7 },
    { alpha: 2, beta: 101, n: 10, successes: 7 },
    { alpha: 2, beta: 2, n: 1001, successes: 7 },
    { alpha: 2, beta: 2, n: 2, successes: 3 },
    { alpha: 2, beta: 2, n: 3.3, successes: 1 }
  ]) assert.throws(() => normalizeInputs(bad), RangeError);
});
