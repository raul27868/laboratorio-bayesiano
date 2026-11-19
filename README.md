# Laboratorio Bayesiano

**¿Más datos significan cambiar de opinión?**

Aplicación educativa interactiva para explorar la inferencia bayesiana, con especial atención a la actualización Beta-Binomial, el papel de la distribución a priori y el efecto del tamaño muestral sobre la incertidumbre posterior.

## Estado del proyecto

**v0.6.0 — Fase 5: diseño visual y accesibilidad.** Infografía SVG basada en las posteriores verificadas, estilos y navegación renovados, gráficos con trazos diferenciables y explicaciones textuales. Pendiente de validación local de la interfaz y las visualizaciones.

## Objetivos de aprendizaje

- Distinguir entre distribución a priori, verosimilitud y distribución a posteriori.
- Interpretar la actualización de una distribución Beta a partir de observaciones binomiales.
- Explicar la influencia del tamaño muestral sobre la estimación y la incertidumbre.
- Contrastar predicciones con resultados, argumentando las diferencias.
- Comparar el efecto de diferentes distribuciones a priori.

## Organización del laboratorio

1. **Predecir:** formular una hipótesis antes de visualizar el resultado.
2. **Experimentar:** modificar parámetros y observar sus consecuencias.
3. **Interpretar:** contrastar los experimentos a través de preguntas tipo test.
4. **Autocorregir:** conocer la puntuación y comprender los errores.

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
js/assessment.js
js/main.js
tests/structure.test.js
tests/bayes.test.js
tests/laboratory.test.js
tests/charts.test.js
tests/activity.test.js
tests/assessment.test.js
assets/infografia/mas-datos-menos-incertidumbre.svg
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

## Evaluación y privacidad (v0.5.1)

- **Seis preguntas de respuesta única, todas obligatorias**, con un total de **10 puntos**. La pregunta inicial de predicción es una hipótesis formativa y **no se penaliza**.
- El cuestionario exige interpretar los experimentos: distribución posterior, media, incertidumbre, comparación de tamaños muestrales, efecto de la priori y evidencia numérica. Cada pregunta ofrece cuatro distractores y un feedback específico tras terminar.
- No hay textos abiertos, rúbrica docente ni calificación manual. La evaluación y el feedback se calculan en el propio navegador.
- Las tablas y curvas experimentales permanecen visibles durante las preguntas. Las soluciones y correcciones no se muestran hasta entregar el test.
- El JSON de resultados usa el esquema `laboratorio-bayesiano/attempt/v2`. La versión anterior `v1` contenía respuestas abiertas y no se recupera automáticamente: inicia un intento nuevo.
- La exportación JSON y el guardado opcional en `localStorage` no incluyen identificadores personales. Puedes borrar una copia local o descargar los resultados. Ningún dato de respuestas se envía a un servidor.
- Los gráficos usan Plotly mediante CDN y requieren Internet.

## Pruebas locales de la Fase 4 revisada

```bash
git pull origin main
npm test
python3 -m http.server 8000
```

Abre http://localhost:8000 y comprueba:

1. Antes de la predicción no se muestran gráficas ni correcciones de la actividad guiada.
2. No puedes avanzar sin elegir predicción.
3. Los experimentos se revelan en orden y las curvas se acumulan.
4. Al terminar el tercer experimento aparecen seis preguntas cerradas, sin áreas de texto libre.
5. No puedes finalizar si falta alguna respuesta.
6. Puedes consultar las curvas y la tabla durante el cuestionario.
7. Con todas las respuestas correctas obtienes **10/10**, con seis explicaciones.
8. Si fallas alguna pregunta disminuye la nota y se muestra la opción correcta y el feedback específico.
9. Reiniciar permite un nuevo intento. El JSON exportado muestra puntuación y respuestas sin rúbrica ni textos abiertos.
10. Guardar en navegador, recuperar y borrar registro funcionan; la exploración libre no cambia.

**Nota:** esta autocorrección funciona como herramienta formativa. En un sitio estático público, las respuestas correctas están incluidas en el código y no constituyen un sistema de examen seguro.

## Mejoras de la Fase 5 (v0.6.0)

- Infografía descargable y editable en formato SVG, con las tres posteriores, medias y desviaciones típicas matemáticamente verificadas.
- Aviso didáctico: las curvas de la infografía se **reescalan verticalmente por separado** para facilitar la comparación de anchuras; **no** se deben comparar sus alturas. Los gráficos interactivos continúan utilizando una escala vertical común entre curvas de cada gráfico.
- Mayor jerarquía visual, botones de acceso directo, navegación de secciones y estilos responsivos.
- Diferenciación de curvas mediante color **y patrón de línea**, más explicaciones textuales de ejes y tablas accesibles.
- Estilos de foco visible, respeto a `prefers-reduced-motion` y ajustes de contraste.

### Validación local de la Fase 5

```bash
git pull origin main
npm test
python3 -m http.server 8000
```

En Firefox, comprueba que:

1. La portada ofrece accesos directos y navegación a actividad, exploración y resumen visual.
2. La infografía SVG se muestra completa, sin cortes, y se puede descargar.
3. La infografía muestra las medias 0,6429 / 0,6923 / 0,6992 y desviaciones típicas 0,1237 / 0,0450 / 0,0145.
4. Los gráficos de la exploración libre se dibujan correctamente, con líneas continuas/discontinuas y una leyenda legible.
5. En pantalla estrecha no aparecen desbordamientos horizontales ni controles ocultos.
6. La navegación mediante Tab tiene foco visible y los controles de los formularios son accesibles con teclado.
7. El acordeón explicativo de densidad se abre y se cierra correctamente.
8. El cuestionario de seis preguntas sigue autocorrigiéndose a 10 puntos y se conservan exportación, guardado y reinicio.
9. Activar la preferencia de movimiento reducido del sistema evita desplazamientos animados.
10. Las tablas y descripciones textuales permiten interpretar los resultados sin distinguir los colores.

El recurso gráfico se incluye localmente, sin depender de otros servicios. Los gráficos interactivos continúan cargando Plotly desde su CDN.
