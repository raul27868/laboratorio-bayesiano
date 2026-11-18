import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BAYES_ENGINE_READY, logGamma, logBeta, betaPdf, betaMean,
  betaVariance, betaSummary, betaBinomialPosterior, referenceScenarios
} from '../js/bayes.js';

function approx(actual, expected, tolerance = 1e-10) {
  assert.ok(Math.abs(actual - expected) <= tolerance,
    `Esperado ${expected}, obtenido ${actual} (tolerancia ${tolerance})`);
}

test('motor disponible y funciones especiales conocidas', () => {
  assert.equal(BAYES_ENGINE_READY, true);
  approx(logGamma(1), 0);
  approx(logGamma(5), Math.log(24));
  approx(logGamma(0.5), 0.5 * Math.log(Math.PI));
  approx(logGamma(0.2), 1.5240638224307845);
  approx(logBeta(2, 3), Math.log(1 / 12));
});

test('Beta(1,1) uniforme; Beta(2,2) simétrica', () => {
  for (const x of [0, 0.1, 0.5, 0.9, 1]) approx(betaPdf(x, 1, 1), 1);
  approx(betaPdf(0.5, 2, 2), 1.5);
  approx(betaMean(2, 2), 0.5);
  approx(betaVariance(2, 2), 0.05);
});

test('límites en los extremos del soporte', () => {
  assert.equal(betaPdf(0, 2, 3), 0);
  assert.equal(betaPdf(0, 1, 3), 3);
  assert.equal(betaPdf(0, 0.5, 3), Infinity);
  assert.equal(betaPdf(1, 3, 2), 0);
  assert.equal(betaPdf(1, 3, 1), 3);
  assert.equal(betaPdf(1, 3, 0.5), Infinity);
});

test('actualización Beta-Binomial y ausencia de datos', () => {
  assert.deepEqual(betaBinomialPosterior(2, 2, 10, 7), { alpha: 9, beta: 5 });
  assert.deepEqual(betaBinomialPosterior(2, 2, 100, 70), { alpha: 72, beta: 32 });
  assert.deepEqual(betaBinomialPosterior(2, 2, 1000, 700), { alpha: 702, beta: 302 });
  assert.deepEqual(betaBinomialPosterior(0.5, 1.5, 0, 0), { alpha: 0.5, beta: 1.5 });
  assert.deepEqual(betaBinomialPosterior(2, 2, 4, 0), { alpha: 2, beta: 6 });
  assert.deepEqual(betaBinomialPosterior(2, 2, 4, 4), { alpha: 6, beta: 2 });
});

test('medias y desviaciones típicas de los experimentos', () => {
  const cases = referenceScenarios();
  assert.deepEqual(cases.map(c => c.n), [10, 100, 1000]);
  [9/14, 72/104, 702/1004].forEach((v, i) => approx(cases[i].posterior.mean, v));
  approx(cases[0].posterior.sd, 0.12371791482634838);
  approx(cases[1].posterior.sd, 0.04504154182839384);
  approx(cases[2].posterior.sd, 0.014466227273597898);
  assert.ok(cases[0].posterior.sd > cases[1].posterior.sd);
  assert.ok(cases[1].posterior.sd > cases[2].posterior.sd);
  assert.equal(betaSummary(2, 2).mean, 0.5);
});

test('integrales de densidad aproximadamente 1: regla del punto medio', () => {
  // Evita los puntos singulares en x=0 y x=1 para alpha o beta < 1.
  for (const [a, b, steps, tolerance] of [[2,2,2000,1e-6], [9,5,6000,1e-6], [72,32,12000,1e-5], [702,302,24000,1e-4], [0.5,0.5,120000,0.003]]) {
    let sum = 0;
    for (let i = 0; i < steps; i++) sum += betaPdf((i + 0.5) / steps, a, b);
    approx(sum / steps, 1, tolerance);
  }
});

test('parámetros inválidos se rechazan explícitamente', () => {
  for (const [a, b] of [[0,1], [1,-1], [NaN,1], [Infinity,1], ['2',2]]) {
    assert.throws(() => betaMean(a,b), RangeError);
    assert.throws(() => betaPdf(0.5,a,b), RangeError);
  }
  for (const [n, x] of [[-1,0], [3,4], [3,-1], [2.5,1], [10,3.5], [NaN,2], [2**54,2]]) {
    assert.throws(() => betaBinomialPosterior(2,2,n,x), RangeError);
  }
  for (const x of [-0.1, 1.1, NaN, Infinity, '0.5']) {
    assert.throws(() => betaPdf(x,2,2), RangeError);
  }
});
