import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPriorPosterior, renderComparison } from '../js/charts.js';
import { referenceScenarios } from '../js/bayes.js';

test('la comparación comparte la misma escala Y y representa los tres escenarios', async () => {
  let received;
  globalThis.Plotly = {
    react: async (element, traces, layout) => { received = { element, traces, layout }; }
  };
  const el = {};
  await renderComparison(el, referenceScenarios());
  assert.equal(received.element, el);
  assert.deepEqual(received.traces.map(t => t.name), ['n=10', 'n=100', 'n=1000']);
  assert.equal(received.layout.xaxis.range[0], 0);
  assert.equal(received.layout.xaxis.range[1], 1);
  assert.ok(received.layout.yaxis.range[1] > 20);
  assert.ok(received.traces.every(t => t.x.length === t.y.length));
  delete globalThis.Plotly;
});

test('priori y posterior en la misma escala, valores finitos en los extremos', async () => {
  let traces;
  globalThis.Plotly = { react: async (_, t) => { traces = t; } };
  await renderPriorPosterior({}, { alpha: 0.5, beta: 2 }, { alpha: 7.5, beta: 5 });
  assert.deepEqual(traces.map(t => t.name), ['A priori', 'A posteriori']);
  assert.equal(traces[0].y[0], null);
  assert.ok(traces[1].y.every(y => y === null || Number.isFinite(y)));
  delete globalThis.Plotly;
});

test('si se ocultan todas las curvas aparece un mensaje', async () => {
  const element = { textContent: '', replaceChildren() {} };
  await renderComparison(element, referenceScenarios(), [false, false, false]);
  assert.match(element.textContent, /Selecciona/);
});

test('la ausencia de Plotly se informa de forma clara', async () => {
  delete globalThis.Plotly;
  assert.throws(() => renderPriorPosterior({}, {alpha:2,beta:2}, {alpha:9,beta:5}), /Plotly/);
});
