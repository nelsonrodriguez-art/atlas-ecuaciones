# El Atlas de las Ecuaciones

Sitio web interactivo sobre el **Capítulo 1 (ecuaciones diferenciales de primer orden)** del
texto de Blanchard, Devaney y Hall, *Differential Equations*, 4.ª edición. Las explicaciones,
ejemplos y ejercicios son redacción propia; la numeración de secciones sigue la del libro.

## Qué hay en este paquete

| Archivo | Para qué sirve |
|---|---|
| `atlas-local/index.html` | Página principal. Funciona con doble clic, sin internet. |
| `atlas-local/css/atlas.css` | Estilos (pergamino, mapa, modo nocturno). |
| `atlas-local/js/nucleo.js` | Datos de los lugares, almacenamiento del avance, analizador de expresiones. |
| `atlas-local/js/graficas.js` | Dibujo de gráficas y motor de cuestionarios. |
| `atlas-local/js/laboratorios.js` | Campo de pendientes, Euler, línea de fase/bifurcaciones, caldero. |
| `atlas-local/js/mapa.js` | El mapa del reino (SVG generado por código). |
| `atlas-local/js/contenido.js` | Texto de las 9 regiones, la Ciudadela y los Talleres. |
| `atlas-local/js/app.js` | Navegación, índice, atajos de teclado. |
| `atlas-local/lib/` | KaTeX y fuentes tipográficas, incluidas para uso sin conexión. |
| `atlas-embed.html` | Todo el sitio en **un solo archivo** (carga KaTeX y fuentes desde internet). |

## A. Publicar en GitHub Pages e insertar en Google Sites (recomendado)

1. Entre a <https://github.com> con su cuenta y pulse **New repository**.
   Nombre sugerido: `atlas-ecuaciones`. Visibilidad: **Public**. Pulse **Create repository**.
2. En la página del repositorio vacío pulse **uploading an existing file**.
3. Descomprima `atlas-local.zip` en su computador. Abra la carpeta `atlas-local` y arrastre
   **su contenido** (el archivo `index.html` y las carpetas `css`, `js`, `lib`) a la ventana de
   GitHub. Importante: `index.html` debe quedar en la raíz del repositorio, no dentro de una
   subcarpeta. Si el navegador no sube carpetas al arrastrar, use Chrome o Edge.
4. Pulse **Commit changes**.
5. Vaya a **Settings → Pages**. En *Build and deployment*, elija **Source: Deploy from a
   branch**, **Branch: main**, carpeta **/ (root)**, y pulse **Save**.
6. Espere uno o dos minutos y recargue. Aparecerá la dirección del sitio, con la forma
   `https://SU-USUARIO.github.io/atlas-ecuaciones/`. Ábrala para comprobar que funciona.
7. En Google Sites abra su página, elija **Insertar → Incorporar → pestaña «URL»**, pegue esa
   dirección y pulse **Insertar**.
8. Estire el recuadro: todo el ancho de la página y al menos 800 px de alto. Publique.

Para actualizar el sitio más adelante basta subir de nuevo los archivos modificados al
repositorio; Google Sites mostrará la versión nueva sin tocar nada.

## B. Pegar el archivo único en Google Sites

1. Abra `atlas-embed.html` con un editor de texto (Bloc de notas, VS Code), seleccione todo y copie.
2. En Google Sites: **Insertar → Incorporar → pestaña «Código para insertar»**, pegue y pulse
   **Siguiente → Insertar**.
3. Estire el recuadro igual que en el paso A.8.

Tenga en cuenta dos cosas de esta vía:

- Google Sites muestra el código insertado dentro de un marco aislado. En ese marco el
  navegador puede impedir que se guarde el avance; cuando ocurre, el sitio lo avisa y los
  sellos se conservan solo mientras la página esté abierta.
- Si Google Sites rechaza el código por su tamaño, use la vía A.

## C. Usar el sitio sin internet

Descomprima `atlas-local.zip` y abra `atlas-local/index.html` con doble clic (Chrome, Edge o
Firefox). No necesita servidor ni conexión. Sirve también para copiarlo a una memoria USB o
subirlo como carpeta al aula virtual.

## Cómo modificar el contenido

Los textos están en `js/contenido.js`, como HTML con fórmulas en LaTeX entre `\( … \)` y
`\[ … \]`. Convenciones de marcado:

- `<div class="ejemplo" data-t="Título">` con un `<div class="paso">` por cada paso.
- `<div class="prueba">` con `<div class="pista">` y `<div class="sol">`.
- `<div class="quiz">` con preguntas `<div class="q" data-t="om|vf|num" data-r="…">`:
  `om` = opción múltiple (`data-r` es el índice de la correcta, desde 0), `vf` = verdadero/falso
  (`v` o `f`), `num` = numérica (`data-r` valor, `data-tol` tolerancia).
- `<div class="lab" data-lab="campo|euler|fase|tanque">` inserta un laboratorio.

Dentro de las fórmulas escriba `&lt;` y `&gt;` en lugar de `<` y `>`.

## Atajos de teclado

`←` `→` región anterior y siguiente · `M` volver al mapa · `Esc` cerrar el índice.

## Créditos y licencias

- [KaTeX](https://katex.org) — composición de fórmulas. Licencia MIT.
- Tipografías *Cinzel* y *Cinzel Decorative* (Natanael Gama) y *EB Garamond* (Georg Duffner y
  Octavio Pardo). SIL Open Font License 1.1.
- Ilustraciones, mapa e iconos: dibujados por código para este sitio.
- Referencia: P. Blanchard, R. L. Devaney, G. R. Hall, *Differential Equations*, 4.ª ed.,
  Brooks/Cole, Cengage Learning.
