# Laboratorio Bayesiano

**¿Más datos significan cambiar de opinión?**

Aplicación educativa interactiva para explorar la inferencia bayesiana, con especial atención a la actualización Beta-Binomial, el papel de la distribución a priori y el efecto del tamaño muestral sobre la incertidumbre posterior.

## Estado del proyecto

**v0.4.0 — Fase 3: actividad guiada.** La exploración libre se mantiene; se incorpora una actividad secuenciada de predicción, tres observaciones y dos explicaciones escritas. Pendiente de validación manual. Las calificaciones y el feedback detallado corresponden a la Fase 4.

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

HTML, CSS y JavaScript (módulos ES), sin backend. Los gráficos utilizan Plotly.js desde CDN (requiere conexión a Internet para representarlos). Los cálculos se ejecutan localmente; los resultados numéricos no dependen de Plotly. La aplicación se diseñará para alojarse en GitHub Pages.

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

Requiere una versión moderna de Node.js. Hay pruebas de estructura, motor Beta-Binomial, lógica del laboratorio y preparación de gráficos. Las pruebas de interfaz deben completarse manualmente en un navegador.

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
tests/laboratory.test.js
tests/charts.test.js
tests/activity.test.js
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

## Validación local de la Fase 2

1. `git pull origin main`.
2. `npm test` para comprobar los módulos.
3. `python3 -m http.server 8000` y abrir `http://localhost:8000`.
4. Comprobar las curvas a priori y a posteriori para α=β=2, n=10, x=7.
5. Cambiar n a 100 y x a 70: verificar posterior Beta(72,32), media 0,6923 y desviación típica 0,0450.
6. Cambiar n a 1000 y x a 700: verificar Beta(702,302), media 0,6992 y desviación típica 0,0145.
7. Modificar α, β; usar Restablecer parámetros; activar y desactivar curvas comparativas.
8. Probar también n=0, x=0 (priori y posterior idénticas) y parámetros extremos como α=0,5.
9. Comprobar navegación mediante teclado y ventana estrecha.

**Nota:** los gráficos se descargan desde el CDN de Plotly; con conexión desactivada aparecerá una advertencia, pero las estadísticas se seguirán calculando.

## Validación local de la Fase 3

Ejecuta `git pull origin main`, `npm test` y `python3 -m http.server 8000`. Abre `http://localhost:8000`.

1. La actividad guiada comienza mostrando la pregunta de predicción y **sin resultados** en su sección.
2. No permite continuar sin seleccionar una respuesta. Tras seleccionarla queda registrada.
3. Solo revela los casos n=10, n=100 y n=1000 en ese orden, con posterior Beta(9,5), Beta(72,32) y Beta(702,302).
4. Las curvas se acumulan; al pasar a las preguntas abiertas, la tabla y el gráfico permanecen visibles.
5. Dos respuestas de al menos 30 caracteres permiten finalizar; respuestas muy cortas no.
6. Se muestran la predicción original y las dos respuestas sin calificarlas automáticamente.
7. «Empezar de nuevo» borra el intento de la pantalla.
8. El laboratorio de exploración libre conserva su funcionalidad y los controles de la Fase 2.
9. Comprueba teclado, pantalla estrecha y visualización en Firefox.

**Nota docente:** la exploración libre es accesible por separado. Para recoger predicciones genuinas, solicita a los estudiantes que comiencen en el modo guiado sin consultar previamente el modo libre. La Fase 4 añadirá opciones de presentación que reduzcan ese riesgo.
