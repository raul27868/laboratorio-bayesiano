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
