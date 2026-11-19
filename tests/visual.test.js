import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { referenceScenarios } from '../js/bayes.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const svg = readFileSync(new URL('../assets/infografia/mas-datos-menos-incertidumbre.svg', import.meta.url), 'utf8');
const css = readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');

test('infografía vectorial incluye metadatos, ecuaciones y medidas verificadas', () => {
  assert.match(svg, /<svg /);
  assert.match(svg, /<title id="title">/);
  assert.match(svg, /<desc id="desc">/);
  assert.match(svg, /Priori Beta\(2,2\)/);
  const ref = referenceScenarios();
  for (const item of ref) {
    const comma = v => v.toFixed(4).replace('.', ',');
    assert.ok(svg.includes('Beta(' + item.posterior.alpha + ',' + item.posterior.beta + ')'));
    assert.ok(svg.includes('Media: ' + comma(item.posterior.mean)));
    assert.ok(svg.includes('Desv. típica: ' + comma(item.posterior.sd)));
  }
  assert.match(svg, /Curvas reescaladas en altura/);
});

test('la página incluye infografía accesible, navegación y explicaciones de gráficos', () => {
  assert.match(html, /id="infografia"/);
  assert.match(html, /src="\.\/assets\/infografia\/mas-datos-menos-incertidumbre\.svg"/);
  assert.match(html, /aria-label="Navegación principal"/);
  for (const id of ['guided-chart-note','main-chart-note','comparison-chart-note']) {
    assert.match(html, new RegExp('id="' + id + '"'));
    assert.match(html, new RegExp('aria-describedby="' + id + '"'));
  }
  assert.match(html, /no se deben comparar las alturas/);
});

test('estilos accesibles y modos de reducción de movimiento y alto contraste', () => {
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /prefers-contrast:more/);
  assert.match(css, /focus-visible/);
  assert.match(css, /@media\(max-width:480px\)/);
});
