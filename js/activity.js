import { betaBinomialPosterior, betaSummary, referenceScenarios } from './bayes.js';
import { renderComparison } from './charts.js';
import { QUESTIONS, RUBRIC, PREDICTION_FEEDBACK, evaluateClosedAnswers, rubricTotal, exportAttempt, validateStoredAttempt } from './assessment.js';

/**
 * Actividad guiada y evaluación formativa (Fase 4).
 * La evaluación cerrada es automática; la abierta requiere valoración docente.
 */
export const ACTIVITY_READY = true;
export const GUIDED_STAGES = Object.freeze(['prediction', 'experiments', 'reflection', 'quiz', 'completed']);
export const GUIDED_EXPERIMENTS = Object.freeze([10, 100, 1000]);

export function createGuidedState() {
  return { stage: 'prediction', prediction: null, seen: [], reflection: '', transfer: '', quizAnswers: null };
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
  return { ...state, reflection: reflection.trim(), transfer: transfer.trim(), stage: 'quiz' };
}

export function submitClosedAnswers(state, answers) {
  if (state.stage !== 'quiz') throw new Error('Debes completar la reflexión antes de evaluar.');
  evaluateClosedAnswers(answers);
  return { ...state, quizAnswers: { ...answers }, stage: 'completed' };
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
  const quiz = $('#guided-quiz');
  let teacherScores = null;
  const storageKey = 'laboratorio-bayesiano:attempt:v1';
  const alert = $('#guided-alert');
  const expButton = $('#guided-observe');
  const chart = $('#guided-chart');
  const status = $('#guided-status');
  const tableBody = $('#guided-results-body');

  function showStage() {
    for (const [name, element] of [['prediction', pred], ['experiments', exp], ['reflection', reflection], ['quiz', quiz], ['completed', completed]]) {
      element.hidden = name === 'experiments'
        ? !['experiments', 'reflection', 'quiz', 'completed'].includes(state.stage)
        : state.stage !== name;
    }
    expButton.hidden = state.stage !== 'experiments';
    $('#guided-next-label').hidden = state.stage !== 'experiments';
    status.textContent = ({
      prediction: 'Paso 1 de 4 · Predecir',
      experiments: 'Paso 2 de 4 · Experimentar',
      reflection: 'Paso 3 de 4 · Explicar',
      quiz: 'Paso 4 de 4 · Comprobar comprensión',
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
    addResultRow(n);
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
      $('#guided-quiz').querySelector('input').focus();
    } catch (error) { alert.textContent = error.message; }
  });

  $('#guided-quiz-form').addEventListener('submit', event => {
    event.preventDefault();
    try {
      const answers = {};
      for (const question of QUESTIONS) {
        const selected = section.querySelector('input[name="quiz-' + question.id + '"]:checked');
        if (selected) answers[question.id] = selected.value;
      }
      state = submitClosedAnswers(state, answers);
      showStage();
      populateReview();
    } catch (error) { alert.textContent = error.message; }
  });

  function populateReview() {
    const predictionText = ({
      same: 'Las distribuciones serán prácticamente iguales.',
      mean: 'La media posterior aumentará mucho.',
      narrow: 'Las posteriores se concentrarán progresivamente cerca de 0,7.',
      prior: 'La posterior se acercará a la priori.'
    })[state.prediction];
    $('#guided-prediction-review').textContent = predictionText;
    $('#guided-reflection-review').textContent = state.reflection;
    $('#guided-transfer-review').textContent = state.transfer;
    $('#guided-prediction-feedback').textContent = PREDICTION_FEEDBACK[state.prediction];
    const result = evaluateClosedAnswers(state.quizAnswers);
    $('#guided-quiz-summary').textContent = 'Preguntas de comprobación: ' + result.correct + ' de ' + result.total + ' correctas. Esta puntuación formativa es independiente de la rúbrica de 10 puntos de las respuestas abiertas.';
    const list = $('#guided-feedback-list');
    list.replaceChildren();
    for (const item of result.details) {
      const p = document.createElement('p');
      p.textContent = (item.correct ? 'Correcta: ' : 'Para revisar: ') + item.feedback;
      list.append(p);
    }
  }

  function completedReport() {
    return exportAttempt(state, teacherScores);
  }

  $('#guided-download').addEventListener('click', () => {
    if (state.stage !== 'completed') return;
    const blob = new Blob([JSON.stringify(completedReport(), null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'laboratorio-bayesiano-respuestas.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  $('#guided-save').addEventListener('click', () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(completedReport()));
      $('#guided-storage-message').textContent = 'Intento guardado en este navegador. No se ha enviado al servidor.';
      $('#guided-restore').hidden = false;
    } catch {
      $('#guided-storage-message').textContent = 'No se pudo guardar. Puedes descargar el archivo JSON.';
    }
  });

  $('#guided-forget').addEventListener('click', () => {
    try {
      localStorage.removeItem(storageKey);
      $('#guided-storage-message').textContent = 'Registro local eliminado.';
      $('#guided-restore').hidden = true;
    } catch { $('#guided-storage-message').textContent = 'No se pudo acceder al almacenamiento local.'; }
  });

  function restoreReport(report) {
    validateStoredAttempt(report);
    state = {
      stage: 'completed', prediction: report.prediction,
      seen: [...report.experiments], reflection: report.reflection,
      transfer: report.transfer, quizAnswers: { ...report.closedAnswers }
    };
    teacherScores = report.rubric ? { ...report.rubric.scores } : null;
    tableBody.replaceChildren();
    for (const n of GUIDED_EXPERIMENTS) addResultRow(n);
    $('#guided-progress').textContent = '3 de 3 experimentos observados.';
    chart.hidden = false;
    const scenarios = referenceScenarios();
    void renderComparison(chart, scenarios).catch(e => {
      alert.textContent = 'No se pudo representar el gráfico: ' + e.message;
    });
    showStage();
    populateReview();
    $('#guided-teacher').open = false;
    $('#guided-storage-message').textContent = 'Intento recuperado de este navegador.';
  }

  $('#guided-restore').addEventListener('click', () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) throw new Error('No existe un intento guardado.');
      restoreReport(JSON.parse(raw));
    } catch (e) { alert.textContent = 'No se pudo recuperar el intento: ' + e.message; }
  });

  const rubricFields = $('#guided-rubric-fields');
  for (const item of RUBRIC) {
    const label = document.createElement('label');
    label.className = 'rubric-row';
    const description = document.createElement('span');
    description.textContent = item.label + ' (máx. ' + item.max + '): ' + item.guidance;
    const select = document.createElement('select');
    select.name = item.id;
    select.setAttribute('aria-label', item.label);
    for (let value = 0; value <= item.max; value++) {
      const option = document.createElement('option');
      option.value = String(value);
      option.textContent = String(value);
      select.append(option);
    }
    label.append(description, select);
    rubricFields.append(label);
  }
  $('#guided-rubric-apply').addEventListener('click', () => {
    const scores = Object.fromEntries(RUBRIC.map(item => [item.id, Number(rubricFields.elements[item.id].value)]));
    try {
      const score = rubricTotal(scores);
      teacherScores = scores;
      $('#guided-rubric-result').textContent = 'Valoración docente provisional: ' + score + '/10 (respuestas abiertas).';
    } catch (e) { alert.textContent = e.message; }
  });

  function addResultRow(n) {
    const result = guidedExperiment(n);
    const tr = document.createElement('tr');
    for (const val of [String(n), String(result.successes), 'Beta(' + result.alpha + ',' + result.beta + ')', format(result.mean), format(result.sd)]) {
      const td = document.createElement('td'); td.textContent = val; tr.append(td);
    }
    tableBody.append(tr);
  }

  $('#guided-restart').addEventListener('click', () => {
    state = createGuidedState();
    $('#guided-prediction-form').reset();
    $('#guided-reflection-form').reset();
    $('#guided-quiz-form').reset();
    teacherScores = null;
    $('#guided-teacher').open = false;
    $('#guided-rubric-result').textContent = 'Pendiente de valoración docente.';
    $('#guided-storage-message').textContent = '';
    tableBody.replaceChildren();
    $('#guided-progress').textContent = 'Aún no has observado ningún experimento.';
    chart.hidden = true;
    if (globalThis.Plotly) globalThis.Plotly.purge(chart);
    showStage();
    $('#guided-prediction-form').querySelector('input').focus();
  });
  try { $('#guided-restore').hidden = localStorage.getItem(storageKey) === null; }
  catch { $('#guided-restore').hidden = true; }
  showStage();
}
