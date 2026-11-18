# Plan del proyecto

## Propósito

Diseñar un laboratorio interactivo y evaluable de inferencia bayesiana centrado inicialmente en el modelo conjugado Beta-Binomial.

## Alcance inicial

Modelo: una probabilidad desconocida θ, priori Beta(α,β), datos binomiales con n ensayos y x éxitos. Los escenarios centrales tendrán la misma proporción x/n = 0,7 y n ∈ {10, 100, 1000}, partiendo de Beta(2,2).

## Fases y criterios de aceptación

### Fase 0 — v0.1.0
- [x] Repositorio organizado con módulos ES, estilos, pruebas y documentación.
- [x] Página de inicio responsiva con recorrido pedagógico y dos modos previstos.
- [x] Sin presentar como funcional ninguna característica todavía no implementada.
- [x] Documentación inicial de decisiones pedagógicas y arquitectura.

### Fase 1 — v0.2.0: matemáticas
- [x] Validación de α, β > 0; n entero no negativo; x entero con 0 ≤ x ≤ n.
- [x] Posterior Beta(α+x, β+n−x).
- [x] Media y varianza de la Beta.
- [x] Densidades numéricamente estables y tratamiento apropiado de extremos.
- [x] Pruebas de referencia para n = 10, 100 y 1000; comprobación de normalización y casos límite.

### Fase 2 — v0.3.0: exploración
- [ ] Controles de α, β, n y x accesibles con teclado.
- [ ] Gráficos de priori y posterior con escalas adecuadas; no inducir a errores por autoescala.
- [ ] Valores numéricos e interpretación textual de los resultados.
- [ ] Comparación simultánea de escenarios y opción de reiniciar.

### Fase 3 — v0.4.0: actividad guiada
- [ ] Predicción inicial antes de revelar resultados.
- [ ] Experimentos de 10, 100 y 1000 observaciones con 70 % de éxitos.
- [ ] Explicación escrita y contraste con la predicción.
- [ ] Pregunta de transferencia para otra priori.

### Fase 4 — v0.5.0: evaluación
- [ ] Respuestas cerradas con feedback específico por error.
- [ ] Preguntas abiertas con criterios de valoración y revisión humana.
- [ ] Registro local sin datos personales.
- [ ] Modo profesor con soluciones y modo estudiante sin revelación prematura.

### Fase 5 — v0.6.0: material y usabilidad
- [ ] Infografía basada en datos matemáticos verificados.
- [ ] Navegación y visualización responsiva.
- [ ] Contraste, accesibilidad con teclado y alternativas textuales.

### Fase 6 — v1.0.0: publicación
- [ ] GitHub Pages habilitado.
- [ ] Pruebas matemáticas, funcionales y de accesibilidad revisadas.
- [ ] Documentación y ejemplos de uso actualizados.

## Arquitectura

Aplicación estática; HTML y CSS sin framework; JavaScript modular. `bayes.js` permanece independiente de la interfaz, `charts.js` gestiona visualización, `laboratory.js` coordina exploración y `activity.js` gestiona secuencia formativa. Sin servidor ni envío de datos personales.

## Política de versiones

Trabajar por fases y realizar commits descriptivos. Validar funciones antes de integrar en `main`. La numeración de versiones sirve como referencia de hitos, no implica publicación automática de etiquetas Git.
