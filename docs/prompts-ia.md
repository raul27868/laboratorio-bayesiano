# Registro de asistencia de IA en el desarrollo

Este documento recogerá los prompts relevantes, el objetivo de cada solicitud, las decisiones de revisión y los resultados contrastados. No se registrarán datos personales.

## Fase 0 — definición de arquitectura

**Encargo resumido:** preparar un laboratorio educativo estático en HTML, CSS y módulos JavaScript sobre el modelo Beta-Binomial, con dos modos previstos (exploración libre y actividad guiada), una portada responsiva, documentación, estructura de pruebas y separación estricta entre los componentes matemáticos, gráficos y pedagógicos.

**Restricciones:** no implementar todavía el motor matemático; no simular que actividades inacabadas están disponibles; diseñar accesibilidad desde el inicio; no incorporar servicios de seguimiento de usuarios ni backend.

**Revisión:** se reserva `bayes.js` para cálculos puros y comprobables, y se mantiene separada la evaluación del motor matemático. El material se plantea como una secuencia de predicción, experimentación, explicación y evaluación.

## Próximas fases

Documentar los prompts concretos de implementación y las correcciones que surjan en las pruebas; distinguir siempre código generado, revisión y validación docente.

## Fase 1 — motor matemático

**Encargo resumido:** implementar funciones puras del modelo Beta-Binomial con validación de parámetros, densidad Beta, momentos, actualización conjugada y los tres escenarios de referencia.

**Restricciones:** separar cálculos e interfaz, no usar factoriales directos para densidades, evaluar la densidad mediante logGamma y logBeta, contemplar los extremos del soporte y proporcionar pruebas automáticas.

**Verificación:** pruebas unitarias de identidades de la función Gamma y Beta, Beta uniforme, casos conjugados, valores de media y desviación típica, normalización numérica y rechazo de entradas inválidas. En la primera ejecución se detectaron dos constantes de desviación típica escritas manualmente con errores; se recalcularon con la fórmula analítica y la batería superó las siete pruebas del módulo.

## Fase 2 — interfaz de exploración

**Encargo resumido:** conectar el motor matemático a controles de α, β, n y éxitos; representar en la misma escala priori y posterior; comparar 10, 100 y 1000 observaciones y mostrar los valores numéricos en una tabla.

**Decisiones:** módulo de cálculo independiente de la interfaz; comprobar que éxitos ≤ n; permitir n=0; mostrar interpretación textual; conservar una comparación fija de referencia separada de los controles libres. Se usa Plotly.js mediante CDN; los valores matemáticos se obtienen del motor local.

**Validación pendiente:** pruebas manuales de renderizado, teclado, estrechamiento de pantalla y conexión del navegador, además de pruebas automatizadas de lógica y trazas.

## Fase 3 — actividad guiada

**Encargo:** implementar un recorrido secuenciado donde el alumno elige una predicción antes de revelar datos, descubre progresivamente las posteriores para n=10, 100 y 1000, compara las distribuciones y formula dos explicaciones.

**Criterios didácticos y técnicos:** bloquear las gráficas y tablas de la actividad hasta registrar una predicción; impedir saltarse observaciones; mantener resultados visibles al interpretar; añadir pregunta de transferencia Beta(20,20); evitar calificaciones automáticas prematuras; permitir reiniciar y no enviar respuestas a servidores.

**Comprobación:** batería automatizada para transición de estados, orden de experimentos, cálculo de las posteriores, condiciones para finalizar y ausencia de calificación. Validación de la interfaz y accesibilidad pendiente de revisión local en Firefox.

## Fase 4 — evaluación y retroalimentación

**Encargo:** añadir corrección automática y feedback individual de dos preguntas cerradas posteriores a la reflexión, sin atribuir notas automáticas a razonamientos abiertos. Incluir una rúbrica con máximos 3+3+3+1 que pueda aplicar el profesor, consulta posterior de criterios y respuesta modelo, exportación local JSON y guardado opcional en el navegador.

**Restricciones:** retroalimentación solo tras completar el cuestionario; evitar presentar 2/2 como calificación total del aprendizaje; no pedir datos personales ni transmitir respuestas; una vista de profesor en web estática no supone autenticación. Mantener la exploración libre y el orden de la actividad validada.

**Verificación requerida:** pruebas de transiciones, respuestas válidas/inválidas, corrección cerrada, suma y límites de rúbrica, exportación y recuperación de datos. Verificación visual y de almacenamiento en Firefox, pendiente de revisión del usuario.
