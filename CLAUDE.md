# TrabajaYa — Frontend (HTML + CSS) para backend Node.js

Plataforma de empleo con entrevista por IA y tres roles: **Candidato** (busca empleo),
**Reclutador/Empresa** (publica vacantes) y **Administrador**.
Tu tarea es convertir los diseños de `/disenos` en vistas HTML/CSS servidas por Express.
**Replica los diseños con fidelidad**: los mismos textos, la misma jerarquía, los mismos
espaciados y los mismos colores. No inventes secciones ni rediseñes.

---

## 1. Qué hay en `/disenos` y cómo leerlo

| Carpeta | Contenido | Fidelidad |
|---|---|---|
| `disenos/landing/` | Sitio público: landing, páginas del navbar y modales de autenticación | **Alta fidelidad: es el estilo visual final** |
| `disenos/app/` | Pantallas internas de los 3 roles (wireframes) | **Baja fidelidad: solo estructura y funcionalidad** |

Los archivos `.dc.html` provienen de una herramienta de diseño. **No se abren directamente en el
navegador**, porque necesitan un runtime propio. Léelos como **código fuente de referencia**:

- **Estilos `style="…"` en línea**: son los valores exactos (colores, tamaños, radios, gaps).
  Extráelos a clases CSS; no dejes estilos en línea en el resultado.
- **`<x-dc>…</x-dc>`**: el contenido de la pantalla. `<helmet>` trae las fuentes de Google y los estilos base.
- **`{{ variable }}`**: dato que viene del bloque `<script type="text/x-dc">` (método `renderVals()`).
  Allí están los **datos de ejemplo** y el **estado de la UI** (pestaña activa, panel abierto, etc.).
- **`<sc-for list="{{items}}" as="x">`**: un bucle. Pásalo a `<% items.forEach(x => { %>` en EJS.
- **`<sc-if value="{{cond}}">`**: un condicional. Pásalo a `<% if (cond) { %>`, o a mostrar/ocultar con JS si depende
  de un clic del usuario.
- **`<dc-import name="WFSide" role="cand" active="muro">`**: un componente incluido. `WFSide.dc.html` es el
  **menú lateral** compartido por las 3 áreas; conviértelo en un partial con parámetros `role` y `active`.
- **`onClick="{{fn}}"` + `this.setState(...)`**: interacción del lado del cliente. Reprodúcela con JS vanilla
  (ver §6).
- **`href="X.dc.html"`**: el mapa de navegación. Tradúcelo a las rutas de §5.
- **Textos entre corchetes** (`[N]`, `[Puesto]`, `[Empresa]`, `[PRECIO]`, `[fecha]`): **datos dinámicos**.
  En la vista deben venir de variables que pase el backend (ver §7), nunca escritos fijos.
- **Selectores con borde punteado y etiqueta "(demo)"** (por ejemplo "Estado de la vista: Sin archivo / Leyendo /
  Cargado") y botones como "Simular subida": **solo sirven para previsualizar estados en el diseño.
  NO los implementes como UI**. El estado real lo decide el backend o el flujo.
- **Textos grises de nota** dentro de los wireframes (por ejemplo "Vacío: … + Limpiar filtros", "Error: …"): son
  especificaciones de estados. Impleméntalos como estados reales y no muestres la nota.
- `disenos/app/00-Indice.dc.html` es solo un índice de pantallas; no forma parte de la app.

---

## 2. Regla de estilo: estructura del wireframe + piel de la landing

Las pantallas de `/disenos/app` están en grises a propósito. Al construirlas, **aplica el sistema visual
de la landing** (§3) siguiendo esta equivalencia:

| Wireframe | Usar en producción |
|---|---|
| Fondo `#F4F4F5` | `--color-bg` `#FBFAFF` |
| Superficie `#FFFFFF` y borde `#D4D4D8` | `--color-surface` + `--color-border` `#E4DDF7` |
| Negro `#18181B` (texto, botón principal, ítem activo) | `--color-ink` `#23153C` |
| Gris de texto `#52525B` / `#3F3F46` | `--color-muted` `#4B3B6B` |
| Relleno `#E4E4E7` (chips, placeholders, barras) | `--color-lilac` `#EAE4FF` o `--color-lilac-2` `#F3F0FC` |
| Bordes de input `#A1A1AA` | `--color-border-strong` `#CFC4F0` |
| Botones con radio 8px | Botones tipo píldora (`border-radius: 999px`) como en la landing |
| Tarjetas con radio 12px | Tarjetas con `--radius-card` (20–24px) |
| Fuente única Figtree 800 en títulos | Títulos en **Bricolage Grotesque**, cuerpo en **Figtree** |

- **Un CTA principal en coral (`--color-accent`) por vista**: por ejemplo "Postularme", "Publicar vacante" o
  "Analizar y generar". El resto de botones primarios van en `--color-ink`; los secundarios, con borde.
- **Cajas grises que representan imágenes** (logos, avatares, PDF): se convierten en `<img>`
  con fallback de iniciales o placeholder.
- **Íconos**: los cuadraditos con borde del menú lateral son marcadores de posición. Usa un set de íconos de trazo
  consistente, en SVG inline o una librería ligera como Lucide; nunca emojis.

---

## 3. Tokens de diseño (extraídos de la landing) → `public/css/tokens.css`

```css
:root{
  /* Color */
  --color-bg:#FBFAFF; --color-surface:#FFFFFF;
  --color-ink:#23153C;        /* texto principal, botones oscuros, bandas oscuras */
  --color-ink-2:#3D2D5C;      /* links del navbar */
  --color-muted:#4B3B6B;      /* texto secundario */
  --color-label:#6A5A8A;      /* etiquetas pequeñas */
  --color-accent:#D13A1C;     /* coral: CTA principal y acento de marca */
  --color-link:#B8321A; --color-link-hover:#8E2412;
  --color-lilac:#EAE4FF; --color-lilac-2:#F3F0FC;
  --color-border:#E4DDF7; --color-border-strong:#CFC4F0;
  --color-ink-soft:#34245A;   /* tarjetas sobre fondo oscuro */
  --color-on-dark:#E4DDF7; --color-on-dark-muted:#CFC4F0;
  --color-accent-soft:#FFE9E3; --color-accent-softer:#FFF4F1; --color-accent-line:#FFD3C7;
  --color-danger:#8A2310; --color-danger-line:#C5341A; --color-danger-bg:#FFF1EE;
  --color-success:#1B5E40; --color-success-bg:#E3F4EC;
  --color-coin:#F2B33D;
  /* Tipografía */
  --font-display:'Bricolage Grotesque', system-ui, sans-serif; /* 600, 800 */
  --font-body:'Figtree', system-ui, sans-serif;                /* 400–700 */
  --fs-hero:80px; --fs-h1:64px; --fs-h2:44px; --fs-h3:26px; --fs-body:17px; --fs-small:14px;
  /* Forma */
  --radius-pill:999px; --radius-card:24px; --radius-band:32px; --radius-input:16px; --radius-sm:12px;
  --shadow-card:0 18px 40px -20px rgba(35,21,60,.30);
  --shadow-modal:0 40px 80px -30px rgba(0,0,0,.50);
  /* Layout */
  --container:1240px; --gutter:32px;
}
```

- **Títulos display**: `letter-spacing` negativo (de −0.02em a −0.045em, según tamaño) y `line-height` de 0.98 a 1.05.
- **Fuentes**: `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Figtree:wght@400;500;600;700&display=swap`
- **Logo**: un cuadrado coral de 36px con una "t" rotada −6°, seguido de "Trabaja" en `--color-ink` y "Ya" en coral.

---

## 4. Stack y estructura

- **Node.js + Express**, plantillas **EJS** (si el equipo elige otro motor, mantén la misma estructura de partials).
- **CSS propio** con variables (sin Tailwind ni Bootstrap) y **JS vanilla** para la interacción. Sin frameworks de frontend.
- **Cero lógica de negocio en el frontend**: las vistas reciben datos y envían formularios o `fetch` al backend.

```
src/
  server.js
  routes/        public.js · auth.js · candidato.js · empresa.js · admin.js
  mocks/         datos de ejemplo por vista (tomados de renderVals); el backend los reemplaza
  views/
    layouts/     public.ejs (header + footer) · app.ejs (menú lateral + contenido)
    partials/    header-public · footer · sidebar · modal · drawer · tabs · badge · toast ·
                 empty-state · score-ring · progress-bar · form-field · table
    public/      landing · empresas · como-funciona · planes · faq · acerca · contacto
    auth/        modal-entrar · modal-registro (paso 1 rol, paso 2 datos) · modal-recuperar
    candidato/   muro · expediente · adaptador · entrevista · postulaciones · modal-packs · panel-soporte
    empresa/     vacantes · modal-asistente · postulantes · perfil
    admin/       metricas · cuentas · ajustes
public/
  css/  tokens.css · base.css · components.css · layout.css · pages/*.css
  js/   ui.js (tabs, modales, drawers, toasts, dropdown) · pages/*.js
```

---

## 5. Mapa de pantallas → rutas

| Diseño | Ruta | Notas |
|---|---|---|
| landing/TY-Landing | `/` | Selector "Busco empleo / Contrato talento" = enlaces a `/` y `/empresas` |
| landing/TY-Landing-Empresas | `/empresas` | |
| landing/TY-Como-Funciona | `/como-funciona` | |
| landing/TY-Planes | `/planes` | Pestañas Candidato/Empresa en el cliente (ver §9) |
| landing/TY-FAQ | `/faq` | Categorías + acordeón (`<details>` o JS) |
| landing/TY-Acerca | `/acerca` | Enlazada desde el footer |
| landing/TY-Contacto | `/contacto` | Formulario `POST /contacto` |
| landing/TY-Entrar | `/entrar` | **Modal** sobre la landing; también se abre desde el header sin recargar |
| landing/TY-Registro-Rol → TY-Registro-Datos | `/registro` | Modal en 2 pasos; el rol elegido viaja al paso 2 |
| landing/TY-Recuperar | `/recuperar` | Modal; tras enviar muestra "Revisa tu correo" |
| app/WC-Muro | `/candidato/muro` | Lista + **drawer** de detalle (`?vacante=:id` abre el drawer) |
| app/WC-Expediente | `/candidato/expediente` | Estados: sin archivo / leyendo / cargado (según los datos) |
| app/WC-Adaptador | `/candidato/adaptador` | 2 columnas; estados de la vista previa |
| app/WC-Sala | `/candidato/entrevista` | 3 fases; `?modo=practica\|postulacion&vacante=:id` |
| app/WC-Postulaciones | `/candidato/postulaciones` | Pestañas + toast "Postulación enviada" (`?enviada=1`) |
| app/WC-Packs | modal global del candidato | Se abre desde el menú de usuario y cuando falta saldo |
| app/WC-Soporte | panel lateral global | Enlace "Ayuda" del menú lateral |
| app/WR-Vacantes | `/empresa/vacantes` | |
| app/WR-Asistente | `/empresa/vacantes/nueva`, `/empresa/vacantes/:id/editar` | **Modal** sobre Mis Vacantes |
| app/WR-Postulantes | `/empresa/postulantes?vacante=:id` | Tabla + drawer + modal de exportar terna |
| app/WR-Empresa | `/empresa/perfil` | |
| app/WA-Metricas | `/admin/metricas` | |
| app/WA-Cuentas | `/admin/cuentas` | Tabla + drawer (`?cuenta=:id`) |
| app/WA-Ajustes | `/admin/ajustes?tab=precios\|soporte\|ia` | |
| app/WFSide | partial `sidebar` | `role` = cand \| rec \| admin; `active` = clave del ítem |

---

## 6. Componentes y comportamientos interactivos (JS vanilla en `ui.js`)

Usa atributos `data-*` en lugar de JS por pantalla siempre que puedas:

- **Tabs**: `role="tablist"`, `aria-selected`, flechas de teclado. Se usan en Planes, Mis Postulaciones, Ajustes,
  el drawer de postulantes y el drawer de cuentas.
- **Modal**: `<dialog>` nativo con fondo `rgba(35,21,60,.62)`, cierre con Esc y el botón ×, y foco atrapado.
  Se usa en auth, packs, asistente, exportar terna y en las confirmaciones (finalizar entrevista, eliminar expediente).
- **Drawer lateral**: en escritorio es una columna a la derecha del listado; en móvil, un panel a pantalla completa.
  Se usa en el muro, los postulantes y las cuentas.
- **Dropdown del usuario** (dentro del sidebar): saldo, "Comprar monedas / PRO", perfil y cerrar sesión.
  Solo el candidato ve el bloque de saldo.
- **Toast**: `role="status"`, se puede cerrar.
- **Sala de entrevista**: stepper de 3 fases (Preparación → Sesión → Dictamen). El modo Práctica muestra el
  feedback y el modo Postulación muestra "enviado" y lleva a Mis Postulaciones. Deja ganchos (`data-action`)
  para grabar/detener audio, enviar respuesta y finalizar. **No implementes la grabación real**: solo la UI y
  los eventos, para que el backend o otro módulo los conecte.
- **Selección para la terna** (máx. 3) en Postulantes: el contador del botón "Exportar terna (n/3)" se actualiza.
- **Contador de preguntas** (−/+) en el Asistente; los sliders de peso son `<input type="range">`.

---

## 7. Datos y conexión con el backend

- Cada ruta renderiza su vista con un objeto de datos. Mientras no exista el backend, toma ese objeto de
  `src/mocks/<vista>.js`, construido a partir de los datos de ejemplo de `renderVals()`.
- Reemplaza cada `[placeholder]` por una variable con nombre claro: `vacante.titulo`, `usuario.saldo`,
  `plan.precio`, etc.
- **Formularios**: usa `method="post"` con `action` a rutas REST evidentes (`/auth/login`, `/candidato/expediente`,
  `/empresa/vacantes`). Muestra los errores de validación en línea, como en `TY-Entrar` y `TY-Registro-Datos`.
- **Estados por vista**: cargando (skeleton), vacío, error y sin saldo. Se eligen por los datos (`estado: 'vacio'|'cargando'|...`),
  no con selectores visibles.

---

## 8. Reglas de calidad

- **Responsive**: diseñado a 1440px, debe funcionar a 390px. El sidebar se apila o pasa a menú hamburguesa, las tablas
  van dentro de un contenedor con `overflow-x:auto`, los grids usan `repeat(auto-fit, minmax(min(Xpx,100%),1fr))` y los drawers ocupan
  la pantalla completa.
- **Accesibilidad**: `<button>`, `<a href>`, `<label>`+`<input>` reales; `aria-label` en los botones de solo ícono;
  foco visible; contraste AA; áreas táctiles ≥ 44px.
- **HTML semántico**: `header`, `nav`, `main`, `aside`, `section`, `footer`, `h1` único por página.
- **Idioma** `lang="es"`. Copia los textos tal cual.
- **No** dejes estilos en línea, emojis, código de los `.dc.html` (`x-dc`, `sc-for`, `support.js`) ni lorem ipsum.

---

## 9. Ajustes de negocio ya decididos (prevalecen sobre los textos del diseño)

- **Solo el candidato paga** (TrabajaCoins o Plan PRO). Las empresas no usan monedas ni planes.
  → En `/empresas`, cambia la banda final ("Paga por uso con TrabajaCoins…") por un mensaje de que publicar es gratis.
  → En `/planes`, quita el selector Candidato/Empresa o deja la pestaña Empresa solo con el texto "Gratis para empresas".
- Una cuenta de reclutador por empresa. Las vacantes se publican sin moderación.
- Al aprobar o descartar a un candidato, solo cambia el estado y se envía un correo; no hay chat interno.
- La entrevista tiene 2 modos: **Práctica** (feedback privado) y **Postulación** (filtro oficial de la empresa, un intento).

---

## 10. Orden de trabajo

Trabaja por fases y detente al final de cada una para que se revise en el navegador:

1. Base: Express + EJS, `tokens.css`, `base.css`, layouts, partials header/footer/sidebar, `ui.js`.
2. Sitio público: las 7 páginas + los modales de auth.
3. Candidato: muro → expediente → adaptador → entrevista → postulaciones + modal de packs + panel de soporte.
4. Empresa: vacantes + asistente → postulantes → perfil.
5. Admin: métricas → cuentas → ajustes.
6. Pase final: responsive a 390px, accesibilidad, textos sin placeholders sueltos.

En cada fase, compara tu HTML con el `.dc.html` correspondiente: mismos textos, mismo orden de secciones
y mismos valores de espaciado y tipografía.
