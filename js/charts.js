import { betaPdf } from './bayes.js';

export const CHARTS_READY = true;
const COLORS = { prior: '#b65b00', posterior: '#175ca3', first: '#b65b00', second: '#087e83', third: '#6542a8' };
const X = Array.from({ length: 501 }, (_, i) => i / 500);

function series(alpha, beta) {
  // Los extremos pueden tener densidad infinita para parámetros menores que 1.
  // Plotly no representa infinitos; omitimos esos puntos sin alterar la escala.
  return X.map(x => {
    const y = betaPdf(x, alpha, beta);
    return Number.isFinite(y) ? y : null;
  });
}

function trace(name, alpha, beta, color, dash = 'solid') {
  return {
    x: X, y: series(alpha, beta), name,
    type: 'scatter', mode: 'lines',
    line: { color, width: 3, dash },
    hovertemplate: 'θ=%{x:.3f}<br>f(θ)=%{y:.4f}<extra>' + name + '</extra>'
  };
}

const commonLayout = {
  paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
  font: { family: 'system-ui, sans-serif', color: '#21364c', size: 12 },
  margin: { l: 64, r: 20, t: 22, b: 74 },
  hovermode: 'x unified', showlegend: true,
  legend: { orientation: 'h', y: -0.34, x: 0, font: { size: 12 } },
  xaxis: { title: 'Probabilidad θ (0 a 1)', range: [0, 1], tickformat: '.1f', gridcolor: '#e4eaf1', zeroline: false },
  yaxis: { title: 'Densidad (no probabilidad puntual)', rangemode: 'tozero', gridcolor: '#e4eaf1', zeroline: false }
};

function draw(el, traces) {
  if (!globalThis.Plotly) throw new Error('No se ha podido cargar Plotly. Comprueba la conexión a Internet.');
  // Una escala Y compartida entre las curvas mostradas permite comparar alturas.
  const maxY = Math.max(0.1, ...traces.flatMap(t => t.y.filter(Number.isFinite)));
  const layout = {
    ...commonLayout,
    yaxis: { ...commonLayout.yaxis, range: [0, maxY * 1.1] },
    uirevision: 'reset',
  };
  return globalThis.Plotly.react(el, traces, layout, {
    responsive: true, displaylogo: false, modeBarButtonsToRemove: ['lasso2d', 'select2d']
  });
}

export function renderPriorPosterior(el, prior, posterior) {
  return draw(el, [
    trace('A priori', prior.alpha, prior.beta, COLORS.prior, 'dash'),
    trace('A posteriori', posterior.alpha, posterior.beta, COLORS.posterior)
  ]);
}

export function renderComparison(el, scenarios, enabled = [true, true, true]) {
  const traces = scenarios
    .filter((_, index) => enabled[index])
    .map((item, index) => {
      // Color estable de acuerdo con n, aunque se oculten otros escenarios.
      const color = item.n === 10 ? COLORS.first : item.n === 100 ? COLORS.second : COLORS.third;
      const dash = item.n === 10 ? 'dash' : item.n === 100 ? 'solid' : 'dot';
      return trace('n=' + item.n, item.posterior.alpha, item.posterior.beta, color, dash);
    });
  if (!traces.length) {
    el.replaceChildren();
    el.textContent = 'Selecciona al menos un experimento para mostrar su distribución.';
    return Promise.resolve();
  }
  return draw(el, traces);
}
