# TrabajaYa · Frontend

Plataforma de empleo con entrevista por IA y tres roles: **Candidato**, **Empresa** (reclutador) y **Administrador**.
Este repositorio contiene **solo el frontend**: vistas HTML/CSS renderizadas en el servidor con Express + EJS, y JS vanilla para la interacción.
Los datos vienen de *mocks* en memoria y los formularios llegan a rutas *stub*. **El backend reemplaza ambos sin tocar las vistas.**

---

## Herramientas

| Herramienta | Uso |
|---|---|
| **Node.js ≥ 20** | Entorno de ejecución |
| **Express 5** | Servidor, rutas y archivos estáticos |
| **EJS 7** | Plantillas; layouts propios en `src/lib/layouts.js` |
| **lucide-static** | Íconos SVG inline (`icon('nombre')` en las vistas) |
| **CSS propio** | Tokens de diseño en variables CSS, sin Tailwind ni Bootstrap |
| **JavaScript vanilla** | Comportamientos con atributos `data-*` en `public/js/ui.js`, sin frameworks |
| **Google Fonts** | Bricolage Grotesque (títulos) y Figtree (cuerpo) |

No hay paso de compilación: lo que hay en `public/` se sirve tal cual.

## Puesta en marcha

```bash
npm install
npm run dev     # http://localhost:3000 (se reinicia al cambiar src/)
npm start       # sin modo watch
```

En Windows, si `node` solo está disponible en PowerShell, ejecuta estos comandos desde PowerShell.
Para usar otro puerto en PowerShell: `$env:PORT=3001; npm run dev`.

### Cuentas de prueba

Todas usan la contraseña `Trabaja2026`. Fuera de producción, el modal **Entrar** muestra también un *Acceso rápido demo* con una cuenta de cada rol.

| Rol | Correo |
|---|---|
| Candidato | `maria.lopez@correo.com` |
| Empresa | `talento@andinalogistica.com` |
| Admin | `admin@trabajaya.com` |

Las cuentas creadas desde **Crear cuenta** viven en memoria y se pierden al reiniciar el servidor.

### Rutas útiles en desarrollo

- `/dev/componentes` es el catálogo de componentes y tokens.
- `?_estado=vacio|error|sin-saldo|sin-expediente|leyendo|…` fuerza el estado de una vista para revisarlo (solo fuera de producción).

---

## Estructura

```
src/
  server.js            Express: estáticos, parsers, layouts y montaje de rutas
  lib/                 layouts EJS, íconos, configuración de menús
  routes/              public · auth · candidato · empresa · admin · dev   ← STUBS (los reemplaza el backend)
  mocks/               datos de ejemplo por área                          ← los reemplaza el backend
  views/
    layouts/           public.ejs (header + footer) · app.ejs (menú lateral + contenido)
    partials/          sidebar, form-field, badge, toast, modales, gráficos…
    public/ auth/ candidato/ empresa/ admin/
public/
  css/                 tokens · base · components · layout · pages/*.css
  js/                  ui.js (comportamientos genéricos) · pages/*.js
disenos/               diseños de referencia (.dc.html)
```

---

## Cómo se conecta el backend

### 1. Principio

**Cero lógica de negocio en el frontend.** Las vistas reciben un objeto de datos y lo pintan. Los formularios hacen `POST` (o `fetch`) a rutas REST.
Cálculos, permisos, cobros, IA y correos son responsabilidad del backend.

### 2. Qué reemplazar

| Hoy (stub) | Backend |
|---|---|
| `src/mocks/*.js` | Consultas a la base de datos / servicios |
| Handlers de `src/routes/*.js` | Controladores reales; se conservan **las mismas rutas y los mismos nombres de variables** que reciben las vistas |
| `res.locals.usuario` fijo por rol | Usuario de la sesión autenticada |

Cada `res.render('vista', datos)` documenta su contrato: las variables que usa la vista son exactamente las que hoy entrega el stub.
Por ejemplo, `candidato/muro` recibe `vacantes`, `filtros`, `estado`, `detalle`…
La cabecera de cada partial también lista sus parámetros.

### 3. Autenticación y sesión

- `POST /auth/login`, `POST /auth/registro` (con `rol` = `candidato` | `empresa`), `POST /auth/recuperar`, `POST /auth/logout` y `GET /auth/google` (OAuth).
- Hoy **no hay sesión**. El backend debe:
  - crearla;
  - proteger `/candidato/*`, `/empresa/*` y `/admin/*` según el rol;
  - poner en `res.locals.usuario` los datos que pinta el menú lateral: `nombre`, `correo`, `avatarUrl` y, para el candidato, también `plan`, `saldo` y `movimientos`.
- Si hay errores de validación, renderiza la misma vista con `422` y el objeto `auth = { abrir, errores, valores }` (ver `authState()` en `routes/public.js`). El modal se reabre con los mensajes en línea.

### 4. Formularios, errores y avisos

- **Patrón POST → redirect (303).** Tras una acción correcta se redirige con `?aviso=<clave>`, y el layout muestra el *toast* correspondiente (mapas `avisos` en cada router). El backend puede sustituirlo por mensajes *flash* en sesión.
- **Errores de validación.** Se renderiza la misma vista con `422` y un objeto `errores` por campo. El partial `form-field` pinta el error y marca `aria-invalid`.
- **Archivos.** CV, logo y adjuntos de tickets se envían como `multipart/form-data`; el backend necesita un parser, por ejemplo *multer*.

### 5. Endpoints que el frontend consume con `fetch`

| Endpoint | Respuesta esperada |
|---|---|
| `GET /candidato/vacantes/:id/detalle` | Fragmento HTML del drawer de vacante |
| `GET /empresa/postulantes/:id/detalle` | Fragmento HTML del drawer de postulante |
| `GET /admin/cuentas/:id/detalle` | Fragmento HTML del drawer de cuenta |
| `GET /candidato/expediente/estado` | `{ "estado": "leyendo" \| "cargado" \| "error" }` (polling durante el OCR) |
| `POST /empresa/autoguardado` | `{ "ok": true, "id": 12, "hora": "10:42" }` (borrador del asistente) |
| `POST /empresa/postulantes/:id/terna` con `Accept: application/json` | `{ ok, error, enTerna, total, estado, terna: [...] }` |

Si un `fetch` de drawer falla, el frontend navega al `href` del enlace, por ejemplo `?vacante=3`. Por eso esas rutas también deben renderizar la página con el drawer abierto.

### 6. Puntos de integración sin implementar

- **Entrevista IA (grabación, transcripción, repreguntas).** La Sala solo tiene la UI. Cada acción emite el evento `ty:entrevista` con `{ accion, sesion, form }`:

  ```js
  document.addEventListener('ty:entrevista', (e) => {
    // acciones: probar-microfono · grabar · detener · escribir · reintentar · enviar-respuesta · finalizar
  });
  TY.entrevista.transcripcion('texto…');   // actualiza la transcripción en vivo
  TY.entrevista.micEstado('Permiso concedido');
  ```

  Las respuestas se envían con `POST /candidato/entrevista/:id/respuestas`.
- **Pasarela de pago.** Se monta en `[data-pasarela]` dentro del modal de packs (evento `ty:pasarela` con el pack elegido). Al confirmar, se redirige con `?packs=confirmado&compra=pack|pro`.
- **PDFs.** `GET /candidato/cvs/:id` y `GET /empresa/terna` hoy muestran páginas imprimibles; el backend debe devolver el PDF real.
- **Audio de transcripciones.** El evento `ty:audio` se emite al pulsar reproducir en el drawer del postulante.
- **Correos.** Se envían al aprobar o descartar postulantes, al recuperar la contraseña, para los comprobantes de pago y para las respuestas de soporte.

### 7. Configuración de la plataforma

Admin › Ajustes edita `src/mocks/plataforma.js` y `src/mocks/precios.js`: packs, precio PRO, costo por acción, límites de entrevista, catálogo de competencias y acceso demo.
Esa configuración la leen la landing, el candidato y el asistente de vacantes; en el backend debe vivir en la base de datos con historial de cambios.

### 8. Reglas de negocio ya reflejadas en la UI

- Solo el candidato paga (TrabajaCoins o Plan PRO); las empresas no tienen monedas ni planes.
- Una cuenta de reclutador por empresa; las vacantes se publican sin moderación.
- Entrevista en modo **Práctica** (feedback privado) o **Postulación** (un intento, el dictamen va a la empresa).
- Terna de máximo 3 candidatos por vacante.

---

## Convenciones del frontend

- **Estilos:** sin estilos en línea. Colores, radios y tipografías salen de `public/css/tokens.css`.
- **Comportamientos:** se declaran con `data-*` y los resuelve `ui.js`: modales, drawers, tabs, dropdowns, toasts, confirmaciones, filtros de listas, etiquetas y tablas ordenables. La referencia está al inicio del archivo.
- **Accesibilidad:** HTML semántico, `lang="es"`, foco visible y áreas táctiles de 44 px o más.
- **Responsive:** diseñado a 1440 px y probado a 390 px.
