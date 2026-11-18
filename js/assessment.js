/**
 * Evaluación formativa determinista.
 * Las preguntas cerradas se corrigen automáticamente; las abiertas se valoran con rúbrica.
 */
export const RUBRIC = Object.freeze([
  { id: 'interpretation', label: 'Interpretación de la distribución posterior', max: 3,
    guidance: 'Identifica correctamente las medias posteriores y la tendencia hacia 0,7.' },
  { id: 'uncertainty', label: 'Efecto del tamaño muestral sobre la incertidumbre', max: 3,
    guidance: 'Justifica la disminución de la desviación típica y la concentración de la densidad.' },
  { id: 'prior', label: 'Influencia de la distribución a priori', max: 3,
    guidance: 'Explica por qué Beta(20,20) ejerce mayor influencia que Beta(2,2), sobre todo con n pequeño.' },
  { id: 'evidence', label: 'Uso de evidencias numéricas y gráficas', max: 1,
    guidance: 'Apoya sus conclusiones con valores de los experimentos, no solo afirmaciones generales.' }
]);

export const QUESTIONS = Object.freeze([
  {
    id: 'uncertainty',
    prompt: 'Al pasar de 10 a 1000 observaciones con la misma proporción de caras, ¿qué sucede con la incertidumbre posterior?',
    choices: [
      { id: 'grow', label: 'Aumenta porque hay más resultados posibles.' },
      { id: 'decrease', label: 'Disminuye; la distribución se concentra en torno a 0,7.' },
      { id: 'same', label: 'No cambia porque la proporción de caras es idéntica.' }
    ],
    correct: 'decrease',
    feedback: {
      grow: 'Más observaciones aportan información: en este modelo la desviación típica disminuye.',
      decrease: 'Correcto: la desviación típica pasa aproximadamente de 0,1237 a 0,0145.',
      same: 'La misma proporción no implica la misma precisión; compara las desviaciones típicas.'
    }
  },
  {
    id: 'prior',
    prompt: 'Si cambiamos la priori Beta(2,2) por Beta(20,20), ¿en qué escenario influye proporcionalmente más esa información previa?',
    choices: [
      { id: 'small', label: 'Con 10 observaciones, porque los datos aportan menos información relativa.' },
      { id: 'large', label: 'Con 1000 observaciones, porque la priori se acumula con cada dato.' },
      { id: 'equal', label: 'Influye por igual en ambos escenarios.' }
    ],
    correct: 'small',
    feedback: {
      small: 'Correcto: la priori más concentrada pesa mucho más cuando la muestra es pequeña.',
      large: 'Con 1000 observaciones, la verosimilitud domina relativamente más a la priori.',
      equal: 'La importancia relativa de la priori depende de su concentración y de n.'
    }
  }
]);

export const PREDICTION_FEEDBACK = Object.freeze({
  narrow: 'Tu predicción es coherente con los resultados: la posterior se concentra cerca de 0,7, y su media se aproxima a ese valor.',
  same: 'Una proporción muestral idéntica no implica igual incertidumbre. Compara las desviaciones típicas.',
  mean: 'La media posterior cambia, pero se aproxima a 0,7 y no crece sin límite. El cambio más notable es la reducción de incertidumbre.',
  prior: 'Al aumentar n, los datos ganan peso relativo: la posterior no regresa a la priori Beta(2,2).'
});

/** Exige respuestas válidas para todas las preguntas. */
export function evaluateClosedAnswers(answers) {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    throw new RangeError('Debes responder todas las preguntas.');
  }
  const details = QUESTIONS.map(question => {
    const selected = answers[question.id];
    if (!question.choices.some(choice => choice.id === selected)) {
      throw new RangeError('Falta responder: ' + question.prompt);
    }
    return {
      id: question.id, selected, correct: selected === question.correct,
      correctChoice: question.correct, feedback: question.feedback[selected]
    };
  });
  return { correct: details.filter(d => d.correct).length, total: QUESTIONS.length, details };
}

export function rubricTotal(scores) {
  if (!scores || typeof scores !== 'object' || Array.isArray(scores)) {
    throw new RangeError('Faltan las valoraciones docentes.');
  }
  return RUBRIC.reduce((sum, item) => {
    const value = scores[item.id];
    if (!Number.isInteger(value) || value < 0 || value > item.max) {
      throw new RangeError('Valor no válido para ' + item.label);
    }
    return sum + value;
  }, 0);
}

export function exportAttempt(state, rubricScores = null) {
  if (state.stage !== 'completed') throw new Error('Solo se puede exportar un intento terminado.');
  const closed = evaluateClosedAnswers(state.quizAnswers);
  const report = {
    schema: 'laboratorio-bayesiano/attempt/v1',
    version: '0.5.0',
    prediction: state.prediction,
    experiments: [...state.seen],
    reflection: state.reflection,
    transfer: state.transfer,
    closedAnswers: { ...state.quizAnswers },
    closedFeedback: closed,
    rubric: rubricScores ? { scores: { ...rubricScores }, total: rubricTotal(rubricScores), max: 10 } : null,
    openAnswersRequireHumanReview: rubricScores === null
  };
  return report;
}

export function validateStoredAttempt(value) {
  if (!value || typeof value !== 'object' || value.schema !== 'laboratorio-bayesiano/attempt/v1') {
    throw new RangeError('El registro no tiene un formato compatible.');
  }
  if (!['same', 'mean', 'narrow', 'prior'].includes(value.prediction)) throw new RangeError('Predicción no válida.');
  if (JSON.stringify(value.experiments) !== JSON.stringify([10, 100, 1000])) throw new RangeError('Experimentos incompletos.');
  if (typeof value.reflection !== 'string' || value.reflection.trim().length < 30 ||
      typeof value.transfer !== 'string' || value.transfer.trim().length < 30) {
    throw new RangeError('Respuestas abiertas incompletas.');
  }
  evaluateClosedAnswers(value.closedAnswers);
  if (value.rubric) rubricTotal(value.rubric.scores);
  return true;
}
