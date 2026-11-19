import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PROJECT_VERSION } from "../js/laboratory.js";
import { BAYES_ENGINE_READY } from "../js/bayes.js";

test("la estructura de la fase 5 declara la versión correcta", () => {
  assert.equal(PROJECT_VERSION, "0.6.0");
  assert.equal(BAYES_ENGINE_READY, true);
});

test("la portada tiene idioma, título, entrada JS y estilos", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /<html lang="es">/);
  assert.match(html, /Más datos significan/);
  assert.match(html, /\.\/js\/main\.js/);
  assert.match(html, /\.\/css\/styles\.css/);
  assert.match(html, /id="laboratorio"/);
  assert.match(html, /id="main-chart"/);
  assert.match(html, /id="comparison-chart"/);
  assert.match(html, /id="actividad-guiada"/);
  assert.match(html, /id="guided-prediction-form"/);
  assert.match(html, /id="guided-quiz-form"/);
  assert.doesNotMatch(html, /id="guided-teacher"/);
  assert.match(html, /id="guided-download"/);
  assert.match(html, /id="guided-score"/);
  assert.doesNotMatch(html, /id="guided-explain"/);
});
