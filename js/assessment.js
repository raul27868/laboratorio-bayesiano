/**
 * Evaluación autocorregible del laboratorio Beta-Binomial.
 * Seis preguntas objetivas: 10 puntos en total. La predicción inicial es formativa.
 */
export const ASSESSMENT_VERSION = '0.5.1';
export const QUESTIONS = Object.freeze([
  {
    id: 'parameters', points: 2, topic: 'Actualización posterior',
    prompt: 'Con una priori Beta(2,2) y 100 lanzamientos con 70 caras, ¿cuál es la distribución posterior?',
    choices: [
      { id: 'a', label: 'Beta(70,30)', feedback: 'La frecuencia aporta 70 éxitos y 30 fracasos, pero hay que sumar también los parámetros de la priori.' },
      { id: 'b', label: 'Beta(72,32)', feedback: 'Se suman éxitos y fracasos a la priori: (2+70, 2+30).' },
      { id: 'c', label: 'Beta(32,72)', feedback: 'Se han intercambiado los parámetros asociados a éxitos y fracasos.' },
      { id: 'd', label: 'Beta(102,102)', feedback: 'Los datos no aportan el mismo número de éxitos que de fracasos.' }
    ], correct: 'b'
  },
  {
    id: 'mean', points: 1, topic: 'Interpretación de la media',
    prompt: 'Las muestras tienen un 70 % de caras. ¿Cómo evoluciona la media posterior para n=10, 100 y 1000 con priori Beta(2,2)?',
    choices: [
      { id: 'a', label: 'Permanece exactamente en 0,7 en los tres casos.', feedback: 'La media posterior combina la priori con los datos; para muestras pequeñas no coincide exactamente con 0,7.' },
      { id: 'b', label: 'Se mantiene siempre en 0,5.', feedback: 'La media de la priori es 0,5, pero la evidencia modifica la media posterior.' },
      { id: 'c', label: 'Se aproxima progresivamente a 0,7.', feedback: 'Las medias son aproximadamente 0,6429, 0,6923 y 0,6992.' },
      { id: 'd', label: 'Supera 0,7 a partir de n=100.', feedback: 'Partimos de una priori centrada en 0,5; las medias posteriores siguen por debajo de 0,7.' }
    ], correct: 'c'
  },
  {
    id: 'uncertainty', points: 2, topic: 'Incertidumbre',
    prompt: '¿Qué sucede con la incertidumbre posterior al pasar de 10 a 1000 observaciones manteniendo el 70 % de caras?',
    choices: [
      { id: 'a', label: 'Disminuye y la curva se concentra.', feedback: 'La desviación típica baja aproximadamente de 0,1237 a 0,0145.' },
      { id: 'b', label: 'No cambia porque la proporción es igual.', feedback: 'La proporción no determina por sí sola la precisión: importa también n.' },
      { id: 'c', label: 'Aumenta porque hay más observaciones.', feedback: 'Una mayor cantidad de datos aumenta la información sobre θ en este modelo.' },
      { id: 'd', label: 'Se anula exactamente cuando n llega a 1000.', feedback: 'La incertidumbre disminuye, pero sigue siendo positiva con una muestra finita.' }
    ], correct: 'a'
  },
  {
    id: 'same-rate', points: 2, topic: 'Interpretación conjunta',
    prompt: 'Dos experimentos producen el 70 % de caras: 7/10 y 700/1000. ¿Qué afirmación describe mejor sus posteriores?',
    choices: [
      { id: 'a', label: 'Tienen la misma distribución porque la proporción coincide.', feedback: 'Con tamaños distintos se obtienen parámetros y dispersiones diferentes.' },
      { id: 'b', label: 'La muestra pequeña tiene menor dispersión por tener menos observaciones.', feedback: 'Con menos observaciones la incertidumbre posterior es mayor, no menor.' },
      { id: 'c', label: 'Ambas tienen la misma media posterior y diferente varianza.', feedback: 'Las medias también difieren: aproximadamente 0,6429 y 0,6992.' },
      { id: 'd', label: 'Difieren tanto en la media como en la dispersión; la grande es más precisa.', feedback: 'Las medias son aproximadamente 0,6429 y 0,6992 y la desviación típica disminuye con n.' }
    ], correct: 'd'
  },
  {
    id: 'prior', points: 2, topic: 'Influencia de la priori',
    prompt: 'Al sustituir Beta(2,2) por Beta(20,20), ambas centradas en 0,5, ¿en qué situación influye relativamente más el cambio de priori?',
    choices: [
      { id: 'a', label: 'Con 1000 datos, porque se repite la influencia previa.', feedback: 'La concentración de la priori no crece con el tamaño muestral; los datos ganan peso relativo.' },
      { id: 'b', label: 'Con 10 datos, porque la información previa tiene más peso relativo.', feedback: 'Beta(20,20) aporta mayor concentración previa; su efecto es especialmente visible con pocos datos.' },
      { id: 'c', label: 'Influye exactamente igual para n=10 y n=1000.', feedback: 'Su influencia relativa disminuye cuando se acumula evidencia.' },
      { id: 'd', label: 'No influye nunca porque ambas prioris tienen media 0,5.', feedback: 'Dos prioris con igual media pueden tener concentración muy diferente.' }
    ], correct: 'b'
  },
  {
    id: 'evidence', points: 1, topic: 'Uso de evidencias',
    prompt: '¿Qué comparación numérica apoya que n=1000 proporciona mayor precisión que n=10?',
    choices: [
      { id: 'a', label: 'Las proporciones son 0,7 en ambos casos.', feedback: 'Esto compara las frecuencias, pero no demuestra una diferencia de incertidumbre.' },
      { id: 'b', label: 'La media a priori es 0,5 en ambos casos.', feedback: 'La media de la priori no cuantifica el cambio de precisión posterior.' },
      { id: 'c', label: 'La desviación típica baja aproximadamente de 0,1237 a 0,0145.', feedback: 'Una menor desviación típica posterior indica una distribución más concentrada.' },
      { id: 'd', label: 'La posterior de n=10 tiene parámetros Beta(9,5).', feedback: 'Un solo par de parámetros no compara directamente la precisión de ambos experimentos.' }
    ], correct: 'c'
  }
]);
export const TOTAL_POINTS = QUESTIONS.reduce((total, q) => total + q.points, 0);

export const PREDICTION_FEEDBACK = Object.freeze({
  narrow: 'La predicción encaja con la evidencia: la posterior se concentra cerca de 0,7 mientras su media se aproxima a ese valor.',
  same: 'Una proporción idéntica no implica la misma incertidumbre. Compara las desviaciones típicas de las tres posteriores.',
  mean: 'La media cambia, pero se aproxima a 0,7 sin crecer indefinidamente; destaca también la reducción de dispersión.',
  prior: 'La evidencia gana peso frente a la priori cuando aumenta el tamaño muestral.'
});

export function evaluateClosedAnswers(answers) {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) throw new RangeError('Debes responder todas las preguntas.');
  const details = QUESTIONS.map(q => {
    const selected = answers[q.id];
    if (!q.choices.some(c => c.id === selected)) throw new RangeError('Falta responder: ' + q.prompt);
    const correct = selected === q.correct;
    return {
      id: q.id, topic: q.topic, selected, correct, points: correct ? q.points : 0,
      maxPoints: q.points, correctChoice: q.correct,
      correctLabel: q.choices.find(c => c.id === q.correct).label,
      selectedLabel: q.choices.find(c => c.id === selected).label,
      feedback: q.choices.find(c => c.id === selected).feedback
    };
  });
  const points = details.reduce((sum, d) => sum + d.points, 0);
  return { points, maxPoints: TOTAL_POINTS, correct: details.filter(d => d.correct).length, total: QUESTIONS.length, details };
}

const SCHEMA = 'laboratorio-bayesiano/attempt/v2';
export function exportAttempt(state) {
  if (state.stage !== 'completed') throw new Error('Solo se puede exportar un intento terminado.');
  const result = evaluateClosedAnswers(state.quizAnswers);
  return {
    schema: SCHEMA, version: ASSESSMENT_VERSION, prediction: state.prediction,
    experiments: [...state.seen], answers: { ...state.quizAnswers }, result,
    predictionFeedback: PREDICTION_FEEDBACK[state.prediction]
  };
}

export function validateStoredAttempt(value) {
  if (!value || typeof value !== 'object' || value.schema !== SCHEMA) throw new RangeError('Formato de intento incompatible. Crea un nuevo intento.');
  if (!Object.hasOwn(PREDICTION_FEEDBACK, value.prediction)) throw new RangeError('Predicción no válida.');
  if (JSON.stringify(value.experiments) !== JSON.stringify([10,100,1000])) throw new RangeError('Experimentos incompletos.');
  evaluateClosedAnswers(value.answers);
  return true;
}
