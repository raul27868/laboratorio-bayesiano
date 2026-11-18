import { betaBinomialPosterior, betaSummary, referenceScenarios } from './bayes.js';
import { renderComparison } from './charts.js';

/**
 * Actividad guiada (Fase 3).
 * No califica ni guarda respuestas de forma permanente: la evaluación es Fase 4.
 */
export const ACTIVITY_READY = true;
export const GUIDED_STAGES = Object.freeze(['prediction', 'experiments', 'reflection', 'completed']);
export const GUIDED_EXPERIMENTS = Object.freeze([10, 100, 1000]);

export function createGuidedState() {
  return { stage: 'prediction', prediction: null, seen: [], reflection: '', transfer: '' };
}

export function recordPrediction(state, option) {
  if (state.stage !== 'prediction') throw new Error('La predicción solo se registra al inicio.');
  if (!['same', 'mean', 'narrow', 'prior'].includes(option)) throw new RangeError('Predicción no válida.');
  return { ...state, prediction: option, stage: 'experiments', seen: [] };
}

export function observeExperiment(state, n) {
  if (state.stage !== 'experiments') throw new Error('La observación no está disponible en esta fase.');
  if (!GUIDED_EXPERIMENTS.includes(n)) throw new RangeError('Experimento no válido.');
  // La secuencia es deliberada: primero muestras pequeñas, luego grandes.
  const nextExpected = GUIDED_EXPERIMENTS[state.seen.length];
  if (n !== nextExpected) throw new Error('Completa los experimentos en orden.');
  const seen = [...state.seen, n];
  return { ...state, seen, stage: seen.length === GUIDED_EXPERIMENTS.length ? 'reflection' : 'experiments' };
}

export function submitReflection(state, reflection, transfer) {
  if (state.stage !== 'reflection') throw new Error('Aún no corresponde explicar.');
  if (typeof reflection !== 'string' || reflection.trim().length < 30) {
    throw new RangeError('Explica tu razonamiento con al menos 30 caracteres.');
  }
  if (typeof transfer !== 'string' || transfer.trim().length < 30) {
    throw new RangeError('Justifica el efecto de otra priori con al menos 30 caracteres.');
  }
  return { ...state, reflection: reflection.trim(), transfer: transfer.trim(), stage: 'completed' };
}

export function guidedExperiment(n) {
  if (!GUIDED_EXPERIMENTS.includes(n)) throw new RangeError('Experimento no válido.');
  const posterior = betaBinomialPosterior(2, 2, n, n * 0.7);
  return { n, successes: n * 0.7, ...betaSummary(posterior.alpha, posterior.beta) };
}

const format = value => value.toLocaleString('es-ES', { minimumFractionDigits: 4, maximumFractionDigits: 4 });

export function initActivity(root = document) {
  const section = root.querySelector('#actividad-guiada');
  if (!section) return;
  const $ = selector => section.querySelector(selector);
  let state = createGuidedState();

  const pred = $('#guided-prediction');
  const exp = $('#guided-experiments');
  const reflection = $('#guided-reflection');
  const completed = $('#guided-completed');
  const alert = $('#guided-alert');
  const expButton = $('#guided-observe');
  const chart = $('#guided-chart');
  const status = $('#guided-status');
  const tableBody = $('#guided-results-body');

  function showStage() {
    for (const [name, element] of [['prediction', pred], ['experiments', exp], ['reflection', reflection], ['completed', completed]]) {
      element.hidden = name === 'experiments'
        ? !['experiments', 'reflection', 'completed'].includes(state.stage)
        : state.stage !== name;
    }
    expButton.hidden = state.stage !== 'experiments';
    $('#guided-next-label').hidden = state.stage !== 'experiments';
    status.textContent = ({
      prediction: 'Paso 1 de 3 · Predecir',
      experiments: 'Paso 2 de 3 · Experimentar',
      reflection: 'Paso 3 de 3 · Explicar',
      completed: 'Actividad terminada'
    })[state.stage];
    alert.textContent = '';
  }

  $('#guided-prediction-form').addEventListener('submit', event => {
    event.preventDefault();
    const selected = section.querySelector('input[name="guided-option"]:checked');
    if (!selected) { alert.textContent = 'Selecciona una predicción antes de continuar.'; return; }
    state = recordPrediction(state, selected.value);
    showStage();
    showNextExperiment();
  });

  function showNextExperiment() {
    const n = GUIDED_EXPERIMENTS[state.seen.length];
    $('#guided-next-label').textContent = 'Experimento ' + (state.seen.length + 1) +
      ' de 3: ' + n + ' lanzamientos, ' + (n * 0.7) + ' caras';
    expButton.textContent = 'Revelar experimento n=' + n;
  }

  expButton.addEventListener('click', async () => {
    const n = GUIDED_EXPERIMENTS[state.seen.length];
    state = observeExperiment(state, n);
    const result = guidedExperiment(n);
    const tr = document.createElement('tr');
    for (const val of [String(n), String(result.successes), 'Beta(' + result.alpha + ',' + result.beta + ')', format(result.mean), format(result.sd)]) {
      const td = document.createElement('td'); td.textContent = val; tr.append(td);
    }
    tableBody.append(tr);
    $('#guided-progress').textContent = state.seen.length + ' de 3 experimentos observados.';
    chart.hidden = false;
    try {
      const scenarios = referenceScenarios().filter(scenario => state.seen.includes(scenario.n));
      await renderComparison(chart, scenarios, scenarios.map(() => true));
    } catch (error) {
      alert.textContent = 'No se pudo representar el gráfico: ' + error.message + '. Los valores numéricos siguen disponibles.';
    }
    if (state.stage === 'reflection') {
      showStage();
      $('#guided-reflection-context').textContent = 'Has observado los tres experimentos. Compara sus medias y desviaciones típicas y contrasta lo ocurrido con tu predicción.';
      $('#guided-explain').focus();
    } else {
      showNextExperiment();
    }
  });

  $('#guided-reflection-form').addEventListener('submit', event => {
    event.preventDefault();
    try {
      state = submitReflection(state, $('#guided-explain').value, $('#guided-transfer').value);
      showStage();
      $('#guided-prediction-review').textContent = ({
        same: 'Las distribuciones serán prácticamente iguales.',
        mean: 'La media posterior aumentará mucho.',
        narrow: 'Las posteriores se concentrarán progresivamente cerca de 0,7.',
        prior: 'La posterior se acercará a la priori.'
      })[state.prediction];
      $('#guided-reflection-review').textContent = state.reflection;
      $('#guided-transfer-review').textContent = state.transfer;
    } catch (error) { alert.textContent = error.message; }
  });

  $('#guided-restart').addEventListener('click', () => {
    state = createGuidedState();
    $('#guided-prediction-form').reset();
    $('#guided-reflection-form').reset();
    tableBody.replaceChildren();
    $('#guided-progress').textContent = 'Aún no has observado ningún experimento.';
    chart.hidden = true;
    if (globalThis.Plotly) globalThis.Plotly.purge(chart);
    showStage();
    $('#guided-prediction-form').querySelector('input').focus();
  });
  showStage();
}
