import { betaBinomialPosterior, betaSummary, referenceScenarios } from './bayes.js';
import { renderComparison } from './charts.js';
import { QUESTIONS, TOTAL_POINTS, PREDICTION_FEEDBACK, evaluateClosedAnswers, exportAttempt, validateStoredAttempt } from './assessment.js';

/** Actividad guiada completamente autocorregible. */
export const ACTIVITY_READY = true;
export const GUIDED_STAGES = Object.freeze(['prediction', 'experiments', 'quiz', 'completed']);
export const GUIDED_EXPERIMENTS = Object.freeze([10, 100, 1000]);
export function createGuidedState() {
  return { stage: 'prediction', prediction: null, seen: [], quizAnswers: null };
}
export function recordPrediction(state, choice) {
  if (state.stage !== 'prediction') throw new Error('La predicción se registra al inicio.');
  if (!Object.hasOwn(PREDICTION_FEEDBACK, choice)) throw new RangeError('Predicción no válida.');
  return { ...state, stage: 'experiments', prediction: choice, seen: [] };
}
export function observeExperiment(state, n) {
  if (state.stage !== 'experiments') throw new Error('El experimento no está disponible.');
  if (n !== GUIDED_EXPERIMENTS[state.seen.length]) throw new RangeError('Completa los experimentos en orden.');
  const seen = [...state.seen, n];
  return { ...state, seen, stage: seen.length === GUIDED_EXPERIMENTS.length ? 'quiz' : 'experiments' };
}
export function submitClosedAnswers(state, answers) {
  if (state.stage !== 'quiz') throw new Error('Termina primero los experimentos.');
  evaluateClosedAnswers(answers);
  return { ...state, stage: 'completed', quizAnswers: { ...answers } };
}
export function guidedExperiment(n) {
  if (!GUIDED_EXPERIMENTS.includes(n)) throw new RangeError('Experimento no válido.');
  const p = betaBinomialPosterior(2, 2, n, n * 0.7);
  return { n, successes: n * 0.7, ...betaSummary(p.alpha, p.beta) };
}
const format = n => n.toLocaleString('es-ES', { maximumFractionDigits: 4, minimumFractionDigits: 4 });

export function initActivity(root = document) {
  const section = root.querySelector('#actividad-guiada');
  if (!section) return;
  const $ = selector => section.querySelector(selector);
  const storageKey = 'laboratorio-bayesiano:attempt:v2';
  let state = createGuidedState();
  const stageElements = {
    prediction: $('#guided-prediction'),
    experiments: $('#guided-experiments'),
    quiz: $('#guided-quiz'),
    completed: $('#guided-completed')
  };
  const alert = $('#guided-alert');
  const observeButton = $('#guided-observe');
  const chart = $('#guided-chart');
  const tableBody = $('#guided-results-body');
  const quizForm = $('#guided-quiz-form');

  function showStage() {
    for (const [name, element] of Object.entries(stageElements)) {
      element.hidden = name === 'experiments'
        ? !['experiments', 'quiz', 'completed'].includes(state.stage)
        : state.stage !== name;
    }
    observeButton.hidden = state.stage !== 'experiments';
    $('#guided-next-label').hidden = state.stage !== 'experiments';
    $('#guided-status').textContent = ({
      prediction: 'Paso 1 de 3 · Predecir',
      experiments: 'Paso 2 de 3 · Experimentar',
      quiz: 'Paso 3 de 3 · Interpretar y evaluar',
      completed: 'Actividad completada'
    })[state.stage];
    alert.textContent = '';
  }

  function nextLabel() {
    const n = GUIDED_EXPERIMENTS[state.seen.length];
    $('#guided-next-label').textContent = 'Experimento ' + (state.seen.length + 1) +
      ' de 3: ' + n + ' lanzamientos, ' + n * 0.7 + ' caras';
    observeButton.textContent = 'Revelar experimento n=' + n;
  }

  function addResult(n) {
    const r = guidedExperiment(n);
    const tr = document.createElement('tr');
    for (const value of [n, r.successes, 'Beta(' + r.alpha + ',' + r.beta + ')', format(r.mean), format(r.sd)]) {
      const td = document.createElement('td');
      td.textContent = String(value);
      tr.append(td);
    }
    tableBody.append(tr);
  }

  function drawSeen() {
    chart.hidden = state.seen.length === 0;
    if (!state.seen.length) return;
    const scenarios = referenceScenarios().filter(s => state.seen.includes(s.n));
    void renderComparison(chart, scenarios).catch(error => {
      alert.textContent = 'No se pudo representar el gráfico: ' + error.message + '. La tabla sigue disponible.';
    });
  }

  function renderQuestions() {
    quizForm.replaceChildren();
    for (const [index, question] of QUESTIONS.entries()) {
      const fieldset = document.createElement('fieldset');
      fieldset.className = 'guided-options';
      const legend = document.createElement('legend');
      legend.textContent = (index + 1) + '. ' + question.prompt + ' (' + question.points + ' ' + (question.points === 1 ? 'punto' : 'puntos') + ')';
      fieldset.append(legend);
      for (const choice of question.choices) {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'quiz-' + question.id;
        input.value = choice.id;
        input.required = true;
        label.append(input, document.createTextNode(' ' + choice.label));
        fieldset.append(label);
      }
      quizForm.append(fieldset);
    }
    const button = document.createElement('button');
    button.className = 'guided-button';
    button.type = 'submit';
    button.textContent = 'Corregir mi actividad';
    quizForm.append(button);
  }

  function showReview() {
    const initial = ({
      same: 'Las distribuciones serán prácticamente iguales.',
      mean: 'La media posterior aumentará mucho y sin estabilizarse.',
      narrow: 'Las distribuciones se concentrarán progresivamente cerca de 0,7.',
      prior: 'Las distribuciones se acercarán a la priori Beta(2,2).'
    })[state.prediction];
    $('#guided-prediction-review').textContent = initial;
    $('#guided-prediction-feedback').textContent = PREDICTION_FEEDBACK[state.prediction];
    const result = evaluateClosedAnswers(state.quizAnswers);
    $('#guided-score').textContent = result.points + ' / ' + result.maxPoints + ' puntos';
    $('#guided-quiz-summary').textContent = result.correct + ' de ' + result.total +
      ' respuestas correctas. Cada cuestión muestra su valoración y una explicación.';
    const list = $('#guided-feedback-list');
    list.replaceChildren();
    for (const [index, detail] of result.details.entries()) {
      const article = document.createElement('article');
      article.className = 'feedback-item';
      const heading = document.createElement('h4');
      heading.textContent = (index + 1) + '. ' + detail.topic + ' · ' +
        detail.points + '/' + detail.maxPoints + ' puntos';
      const selected = document.createElement('p');
      selected.textContent = 'Tu respuesta: ' + detail.selectedLabel;
      const feedback = document.createElement('p');
      feedback.textContent = detail.feedback;
      article.append(heading, selected, feedback);
      if (!detail.correct) {
        const correct = document.createElement('p');
        correct.textContent = 'Respuesta correcta: ' + detail.correctLabel;
        article.append(correct);
      }
      list.append(article);
    }
  }

  $('#guided-prediction-form').addEventListener('submit', event => {
    event.preventDefault();
    const option = section.querySelector('input[name="guided-option"]:checked');
    if (!option) { alert.textContent = 'Debes seleccionar una predicción.'; return; }
    state = recordPrediction(state, option.value);
    showStage();
    nextLabel();
  });

  observeButton.addEventListener('click', () => {
    const n = GUIDED_EXPERIMENTS[state.seen.length];
    state = observeExperiment(state, n);
    addResult(n);
    $('#guided-progress').textContent = state.seen.length + ' de 3 experimentos observados.';
    drawSeen();
    showStage();
    if (state.stage === 'experiments') nextLabel();
    else quizForm.querySelector('input')?.focus();
  });

  quizForm.addEventListener('submit', event => {
    event.preventDefault();
    try {
      const answers = {};
      for (const question of QUESTIONS) {
        const chosen = section.querySelector('input[name="quiz-' + question.id + '"]:checked');
        if (chosen) answers[question.id] = chosen.value;
      }
      state = submitClosedAnswers(state, answers);
      showStage();
      showReview();
    } catch (error) { alert.textContent = error.message; }
  });

  $('#guided-download').addEventListener('click', () => {
    if (state.stage !== 'completed') return;
    const blob = new Blob([JSON.stringify(exportAttempt(state), null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'laboratorio-bayesiano-resultados.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  $('#guided-save').addEventListener('click', () => {
    if (state.stage !== 'completed') return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(exportAttempt(state)));
      $('#guided-storage-message').textContent = 'Intento guardado en este navegador.';
      $('#guided-restore').hidden = false;
    } catch { $('#guided-storage-message').textContent = 'No se pudo guardar; descarga el JSON.'; }
  });

  $('#guided-forget').addEventListener('click', () => {
    try {
      localStorage.removeItem(storageKey);
      $('#guided-storage-message').textContent = 'Copia local eliminada.';
      $('#guided-restore').hidden = true;
    } catch { $('#guided-storage-message').textContent = 'No se pudo borrar la copia local.'; }
  });

  $('#guided-restore').addEventListener('click', () => {
    try {
      const report = JSON.parse(localStorage.getItem(storageKey));
      validateStoredAttempt(report);
      state = {
        stage: 'completed', prediction: report.prediction,
        seen: [...report.experiments], quizAnswers: { ...report.answers }
      };
      tableBody.replaceChildren();
      state.seen.forEach(addResult);
      $('#guided-progress').textContent = '3 de 3 experimentos observados.';
      drawSeen();
      showStage();
      showReview();
      $('#guided-storage-message').textContent = 'Intento recuperado.';
    } catch (error) { alert.textContent = 'No se pudo recuperar: ' + error.message; }
  });

  $('#guided-restart').addEventListener('click', () => {
    state = createGuidedState();
    $('#guided-prediction-form').reset();
    quizForm.reset();
    tableBody.replaceChildren();
    $('#guided-progress').textContent = 'Aún no has observado ningún experimento.';
    chart.hidden = true;
    if (globalThis.Plotly) globalThis.Plotly.purge(chart);
    $('#guided-storage-message').textContent = '';
    showStage();
    $('#guided-prediction-form').querySelector('input')?.focus();
  });

  renderQuestions();
  try { $('#guided-restore').hidden = localStorage.getItem(storageKey) === null; }
  catch { $('#guided-restore').hidden = true; }
  showStage();
}
