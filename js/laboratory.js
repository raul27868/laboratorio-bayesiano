import { betaBinomialPosterior, betaSummary, referenceScenarios } from './bayes.js';
import { renderPriorPosterior, renderComparison } from './charts.js';

export const PROJECT_VERSION = '0.4.0';
export const LABORATORY_READY = true;

export const DEFAULTS = Object.freeze({ alpha: 2, beta: 2, n: 10, successes: 7 });

export function normalizeInputs(values) {
  const { alpha, beta, n, successes } = values;
  if (!Number.isFinite(alpha) || alpha <= 0 || alpha > 100 ||
      !Number.isFinite(beta) || beta <= 0 || beta > 100) {
    throw new RangeError('Los parámetros α y β deben estar entre 0,1 y 100.');
  }
  if (!Number.isSafeInteger(n) || n < 0 || n > 1000) {
    throw new RangeError('El número de observaciones debe ser un entero entre 0 y 1000.');
  }
  if (!Number.isSafeInteger(successes) || successes < 0 || successes > n) {
    throw new RangeError('Los éxitos deben estar entre 0 y el número de observaciones.');
  }
  return { alpha, beta, n, successes };
}

export function evaluateExperiment(values) {
  const input = normalizeInputs(values);
  const posterior = betaBinomialPosterior(input.alpha, input.beta, input.n, input.successes);
  return {
    input, prior: betaSummary(input.alpha, input.beta),
    posterior: betaSummary(posterior.alpha, posterior.beta),
    observedRate: input.n ? input.successes / input.n : null
  };
}

export function explainExperiment({ input, prior, posterior, observedRate }) {
  if (input.n === 0) return 'Sin observaciones, la distribución posterior coincide con la distribución a priori.';
  const change = posterior.mean - prior.mean;
  const direction = Math.abs(change) < 1e-12 ? 'se mantiene' : change > 0 ? 'aumenta' : 'disminuye';
  return 'Con ' + input.n + ' observaciones y una proporción de éxitos de ' +
    (observedRate * 100).toFixed(1).replace('.', ',') +
    ' %, la media posterior ' + direction +
    ' respecto de la priori. La desviación típica pasa de ' +
    prior.sd.toFixed(4).replace('.', ',') + ' a ' +
    posterior.sd.toFixed(4).replace('.', ',') +
    '. La curva posterior representa la incertidumbre sobre θ después de observar los datos.';
}

const $ = (root, selector) => root.querySelector(selector);
const format = n => n.toLocaleString('es-ES', { maximumFractionDigits: 4, minimumFractionDigits: 4 });

export function initLaboratory(root = document) {
  const section = $(root, '#laboratorio');
  if (!section) return;
  const form = $(section, '#controls');
  const error = $(section, '#control-error');
  const nControl = $(section, '#n');
  const successControl = $(section, '#successes');
  const comparisonChecks = [...section.querySelectorAll('[data-compare]')];
  const getValues = () => ({
    alpha: Number(form.elements.alpha.value),
    beta: Number(form.elements.beta.value),
    n: Number(form.elements.n.value),
    successes: Number(form.elements.successes.value)
  });

  function updateSuccessMax() {
    const n = Math.max(0, Number(nControl.value) || 0);
    successControl.max = String(n);
    if (Number(successControl.value) > n) successControl.value = String(n);
  }
  async function update() {
    try {
      updateSuccessMax();
      const outcome = evaluateExperiment(getValues());
      error.textContent = '';
      const { prior, posterior, input, observedRate } = outcome;
      $(section, '#prior-params').textContent = 'Beta(' + input.alpha + ', ' + input.beta + ')';
      $(section, '#posterior-params').textContent = 'Beta(' + posterior.alpha + ', ' + posterior.beta + ')';
      $(section, '#prior-mean').textContent = format(prior.mean);
      $(section, '#posterior-mean').textContent = format(posterior.mean);
      $(section, '#prior-sd').textContent = format(prior.sd);
      $(section, '#posterior-sd').textContent = format(posterior.sd);
      $(section, '#observed-rate').textContent = observedRate == null ? 'Sin observaciones' : format(observedRate * 100) + ' %';
      $(section, '#interpretation').textContent = explainExperiment(outcome);
      await renderPriorPosterior($(section, '#main-chart'), prior, posterior);
    } catch (e) {
      error.textContent = e.message;
    }
  }

  async function updateComparison() {
    try {
      await renderComparison($(section, '#comparison-chart'), referenceScenarios(),
        comparisonChecks.map(checkbox => checkbox.checked));
    } catch (e) {
      error.textContent = e.message;
    }
  }

  form.addEventListener('input', () => { void update(); });
  form.addEventListener('change', () => { void update(); });
  $(section, '#reset-controls').addEventListener('click', () => {
    for (const [key, value] of Object.entries(DEFAULTS)) form.elements[key].value = value;
    void update();
  });
  for (const checkbox of comparisonChecks) {
    checkbox.addEventListener('change', () => { void updateComparison(); });
  }

  // Sin resultados gráficos de la actividad guiada: solo exploración libre.
  void update();
  void updateComparison();
}
