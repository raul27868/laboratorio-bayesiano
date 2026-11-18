/**
 * Funciones puras para el modelo conjugado Beta-Binomial.
 * Sin dependencias del DOM, de Plotly ni de servicios externos.
 */
export const BAYES_ENGINE_READY = true;

const LANCZOS = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028,
  771.32342877765313, -176.61502916214059, 12.507343278686905,
  -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
];

function positiveFinite(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} debe ser un número finito mayor que cero`);
  }
}

/** ln Γ(z) para z > 0. Aproximación de Lanczos y reflexión en (0, 0.5). */
export function logGamma(z) {
  positiveFinite(z, 'z');
  if (z < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
  }
  const shifted = z - 1;
  let sum = LANCZOS[0];
  for (let i = 1; i < LANCZOS.length; i++) sum += LANCZOS[i] / (shifted + i);
  const t = shifted + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (shifted + 0.5) * Math.log(t) - t + Math.log(sum);
}

/** Logaritmo de B(alpha, beta), estable frente a factoriales grandes. */
export function logBeta(alpha, beta) {
  positiveFinite(alpha, 'alpha');
  positiveFinite(beta, 'beta');
  if (!Number.isFinite(alpha + beta)) throw new RangeError('alpha + beta excede el rango finito');
  return logGamma(alpha) + logGamma(beta) - logGamma(alpha + beta);
}

export function betaMean(alpha, beta) {
  positiveFinite(alpha, 'alpha');
  positiveFinite(beta, 'beta');
  const total = alpha + beta;
  if (!Number.isFinite(total)) throw new RangeError('alpha + beta excede el rango finito');
  return alpha / total;
}

export function betaVariance(alpha, beta) {
  positiveFinite(alpha, 'alpha');
  positiveFinite(beta, 'beta');
  const total = alpha + beta;
  if (!Number.isFinite(total)) throw new RangeError('alpha + beta excede el rango finito');
  const mean = alpha / total;
  return mean * (1 - mean) / (total + 1);
}

/** Densidad Beta, incluyendo límites analíticos en x=0 y x=1. */
export function betaPdf(x, alpha, beta) {
  positiveFinite(alpha, 'alpha');
  positiveFinite(beta, 'beta');
  if (typeof x !== 'number' || !Number.isFinite(x) || x < 0 || x > 1) {
    throw new RangeError('x debe pertenecer a [0, 1]');
  }
  if (x === 0) {
    if (alpha < 1) return Infinity;
    if (alpha > 1) return 0;
    return beta;
  }
  if (x === 1) {
    if (beta < 1) return Infinity;
    if (beta > 1) return 0;
    return alpha;
  }
  const logDensity = (alpha - 1) * Math.log(x)
    + (beta - 1) * Math.log1p(-x) - logBeta(alpha, beta);
  return Math.exp(logDensity);
}

/** Valida un problema binomial y calcula la posterior conjugada. */
export function betaBinomialPosterior(alpha, beta, n, successes) {
  positiveFinite(alpha, 'alpha');
  positiveFinite(beta, 'beta');
  if (!Number.isSafeInteger(n) || n < 0) {
    throw new RangeError('n debe ser un entero seguro no negativo');
  }
  if (!Number.isSafeInteger(successes) || successes < 0 || successes > n) {
    throw new RangeError('successes debe ser un entero entre 0 y n');
  }
  const posteriorAlpha = alpha + successes;
  const posteriorBeta = beta + (n - successes);
  if (!Number.isFinite(posteriorAlpha + posteriorBeta)) {
    throw new RangeError('Los parámetros posteriores exceden el rango finito');
  }
  return { alpha: posteriorAlpha, beta: posteriorBeta };
}

export function betaSummary(alpha, beta) {
  const mean = betaMean(alpha, beta);
  const variance = betaVariance(alpha, beta);
  return { alpha, beta, mean, variance, sd: Math.sqrt(variance) };
}

/** Elabora los tres escenarios de referencia sin redondear sus parámetros. */
export function referenceScenarios() {
  return [10, 100, 1000].map(n => {
    const successes = n * 7 / 10;
    const posterior = betaBinomialPosterior(2, 2, n, successes);
    return { n, successes, posterior: betaSummary(posterior.alpha, posterior.beta) };
  });
}
