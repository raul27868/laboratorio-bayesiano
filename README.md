# Laboratorio Bayesiano

**¿Más datos significan cambiar de opinión?**

Aplicación educativa interactiva para explorar la inferencia bayesiana, con especial atención a la actualización Beta-Binomial, el papel de la distribución a priori y el efecto del tamaño muestral sobre la incertidumbre posterior.

## Estado del proyecto

**v0.2.0 — Fase 1: motor Beta-Binomial.** El motor matemático y sus pruebas están implementados; la interfaz de exploración y las actividades se incorporarán en fases posteriores.

## Objetivos de aprendizaje

- Distinguir entre distribución a priori, verosimilitud y distribución a posteriori.
- Interpretar la actualización de una distribución Beta a partir de observaciones binomiales.
- Explicar la influencia del tamaño muestral sobre la estimación y la incertidumbre.
- Contrastar predicciones con resultados, argumentando las diferencias.
- Comparar el efecto de diferentes distribuciones a priori.

## Organización del laboratorio

1. **Predecir:** formular una hipótesis antes de visualizar el resultado.
2. **Experimentar:** modificar parámetros y observar sus consecuencias.
3. **Explicar:** interpretar las diferencias entre predicción y evidencia.
4. **Evaluar:** responder preguntas y recibir retroalimentación.

Se contemplan dos modos: **exploración libre** y **actividad guiada**.

## Tecnología

HTML, CSS y JavaScript (módulos ES), sin backend. Los gráficos se desarrollarán con Plotly.js, cargado únicamente cuando sea necesario. La aplicación se diseñará para alojarse en GitHub Pages.

## Ejecución local

Se recomienda servir el directorio mediante un servidor HTTP local para admitir módulos ES:

```bash
python3 -m http.server 8000
```

Abrir `http://localhost:8000`.

## Pruebas

```bash
node --test tests/*.test.js
```

Requiere una versión moderna de Node.js. Hay pruebas básicas de estructura y pruebas numéricas del motor Beta-Binomial.

## Estructura

```text
index.html
css/styles.css
js/bayes.js
js/charts.js
js/laboratory.js
js/activity.js
js/main.js
tests/structure.test.js
tests/bayes.test.js
assets/infografia/.gitkeep
docs/proyecto.md
docs/decisiones-pedagogicas.md
docs/prompts-ia.md
docs/evidencias/.gitkeep
```

## Hoja de ruta

| Versión | Objetivo |
| --- | --- |
| 0.1.0 | Estructura, documentación y portada |
| 0.2.0 | Motor matemático Beta-Binomial y pruebas numéricas |
| 0.3.0 | Visualización y exploración interactiva |
| 0.4.0 | Secuencia de predicción, experimentación y explicación |
| 0.5.0 | Evaluación, feedback y modo profesor |
| 0.6.0 | Material visual y accesibilidad |
| 1.0.0 | Publicación y validación integral |

Los detalles y criterios de aceptación se mantienen en [docs/proyecto.md](docs/proyecto.md).

## Privacidad

El diseño inicial no contempla cuentas de estudiantes ni envío de respuestas a un servidor. Las preguntas abiertas no serán calificadas automáticamente por un modelo generativo sin una validación explícita.

## Licencia

Código bajo licencia MIT. Los futuros recursos gráficos o materiales educativos podrán incorporar condiciones específicas indicadas junto al recurso.
