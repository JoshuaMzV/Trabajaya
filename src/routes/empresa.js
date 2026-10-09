import { Router } from 'express';
import * as db from '../mocks/empresa.js';
import { plataforma } from '../mocks/plataforma.js';
import { estadosTicket, soporte as slaSoporte } from '../mocks/candidato.js';

// Área de la empresa (disenos/app/WR-*). Datos en src/mocks/empresa.js; los POST son STUBS que modifican
// ese estado en memoria. Las empresas no pagan (CLAUDE.md §9). El backend reemplaza ambos.
const router = Router();
const isDev = process.env.NODE_ENV !== 'production';
const estadoForzado = (req) => (isDev && typeof req.query._estado === 'string' ? req.query._estado : null);
const hoy = () => new Date().toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' });
const quiereJson = (req) => (req.get('accept') || '').includes('application/json');
const conParam = (url, k, v) => `${url}${url.includes('?') ? '&' : '?'}${k}=${encodeURIComponent(v)}`;
const lista = (v) => [].concat(v ?? []).map((x) => String(x).trim()).filter(Boolean);

const vacante = (id) => db.vacantes.find((v) => v.id === Number(id)) || null;
const postulante = (id) => db.postulantes.find((p) => p.id === Number(id)) || null;
const terna = (vacanteId) => (db.ternas[vacanteId] = db.ternas[vacanteId] || []);

const avisos = {
  'vacante-publicada': { variante: 'success', mensaje: 'Publicamos tu vacante. Ya aparece en el muro de los candidatos.' },
  'vacante-borrador': { variante: 'info', mensaje: 'Guardamos la vacante como borrador.' },
  'vacante-actualizada': { variante: 'success', mensaje: 'Guardamos los cambios de la vacante.' },
  'vacante-duplicada': { variante: 'info', mensaje: 'Duplicamos la vacante como borrador.' },
  'vacante-cerrada': { variante: 'info', mensaje: 'Cerramos la vacante. Ya no recibe postulaciones.' },
  'vacante-eliminada': { variante: 'info', mensaje: 'Eliminamos el borrador.' },
  aprobado: { variante: 'success', mensaje: 'Aprobaste al candidato para la primera entrevista. Le enviamos un correo con el nuevo estado.' },
  descartado: { variante: 'info', mensaje: 'Descartaste al candidato. Le enviamos un correo con el nuevo estado.' },
  'terna-llena': { variante: 'error', mensaje: 'La terna ya tiene 3 candidatos. Quita uno para agregar otro.' },
  'perfil-guardado': { variante: 'success', mensaje: 'Guardamos el perfil de tu empresa.' },
  'password-cambiada': { variante: 'success', mensaje: 'Actualizamos tu contraseña.' },
  'ticket-enviado': { variante: 'success', titulo: 'Ticket enviado.', mensaje: 'Te responderemos por correo y en Mis tickets.' },
};

router.use((req, res, next) => {
  const url = new URL(req.originalUrl, 'http://x');
  ['soporte', 'aviso', '_estado'].forEach((p) => url.searchParams.delete(p));
  Object.assign(res.locals, {
    layout: 'app',
    role: 'rec',
    usuario: db.usuario,
    aviso: avisos[req.query.aviso] || null,
    soporteModal: {
      abrir: req.query.soporte === '1',
      tickets: db.soporte.tickets,
      estados: estadosTicket,
      categorias: ['Cuenta', 'Vacantes', 'Entrevista IA', 'Postulantes', 'Otro'],
      sla: slaSoporte,
      volver: url.pathname + url.search,
      accion: '/empresa/soporte/tickets',
      plan: null,
    },
    styles: ['/css/pages/empresa.css'],
    scripts: [],
  });
  next();
});

router.get('/', (req, res) => res.redirect('/empresa/vacantes'));

/* ------------------------------------------------------------- Vacantes */
function metricas(v) {
  const ps = db.postulantes.filter((p) => p.vacanteId === v.id);
  return {
    postulantes: ps.length,
    entrevistas: ps.filter((p) => p.entrevista != null).length,
    sinRevisar: ps.filter((p) => p.estado === 'sin-revisar').length,
    enTerna: terna(v.id).length,
  };
}

function nuevaVacante() {
  return {
    id: null, estado: 'nueva', titulo: '', area: '', experiencia: '', ubicacion: '', modalidad: '', jornada: '', cierre: '',
    salarioMin: '', salarioMax: '', mostrarSalario: false, descripcion: '', requisitos: '', skills: [], beneficios: '',
    competencias: [], preguntas: 6, repreguntas: 2, duracion: 20, respuesta: 'Voz y texto', star: true, criterios: '', preguntaObligatoria: '',
  };
}

function validar(v, accion) {
  const e = {};
  if (!v.titulo) e.titulo = 'Escribe el título del puesto.';
  if (accion === 'publicar') {
    if (!v.area) e.area = 'Elige un área.';
    if (!v.experiencia) e.experiencia = 'Elige la experiencia requerida.';
    if (!v.ubicacion) e.ubicacion = 'Elige la ubicación.';
    if (!v.modalidad) e.modalidad = 'Elige la modalidad.';
    if (!v.jornada) e.jornada = 'Elige la jornada.';
    if (!v.descripcion) e.descripcion = 'Describe el puesto y sus responsabilidades.';
    if (!v.competencias.length) e.competencias = 'Agrega al menos una competencia para el filtro IA.';
  }
  if (v.salarioMin && v.salarioMax && Number(v.salarioMin) > Number(v.salarioMax)) e.salarioMax = 'El máximo debe ser mayor que el mínimo.';
  return e;
}

function leerVacante(body, actual) {
  const nombres = lista(body.competencias);
  const pesos = [].concat(body.pesos ?? []);
  const { preguntasMin, preguntasMax, repreguntasMax, duracionMax } = plataforma.limites;
  const num = (v, min, max, def) => Math.min(max, Math.max(min, Number(v) || def));
  const { id, estado, ...resto } = actual; // id y estado no vienen del formulario
  return {
    ...resto,
    titulo: (body.titulo || '').trim(), area: body.area || '', experiencia: body.experiencia || '', ubicacion: body.ubicacion || '',
    modalidad: body.modalidad || '', jornada: body.jornada || '', cierre: body.cierre || '',
    salarioMin: (body.salarioMin || '').trim(), salarioMax: (body.salarioMax || '').trim(), mostrarSalario: Boolean(body.mostrarSalario),
    descripcion: (body.descripcion || '').trim(), requisitos: (body.requisitos || '').trim(), skills: lista(body.skills), beneficios: (body.beneficios || '').trim(),
    competencias: nombres.map((nombre, i) => ({ nombre, peso: num(pesos[i], 1, 5, 3) })),
    preguntas: num(body.preguntas, preguntasMin, preguntasMax, 6), repreguntas: num(body.repreguntas, 0, repreguntasMax, 2),
    duracion: num(body.duracion, 5, duracionMax, 20), respuesta: body.respuesta || 'Voz y texto', star: Boolean(body.star),
    criterios: (body.criterios || '').trim(), preguntaObligatoria: (body.preguntaObligatoria || '').trim(),
  };
}

function renderVacantes(req, res, asistente = { abrir: false }, status = 200) {
  const vacio = estadoForzado(req) === 'vacio';
  const lista = vacio ? [] : db.vacantes.map((v) => ({ ...v, metricas: metricas(v) }));
  const publicadas = db.vacantes.filter((v) => v.estado === 'publicada');
  res.status(status).render('empresa/vacantes', {
    title: 'Mis Vacantes · TrabajaYa',
    active: 'vacantes',
    empresa: db.perfil,
    vacantes: lista,
    estados: db.estadosVacante,
    conteo: { todas: lista.length, publicada: lista.filter((v) => v.estado === 'publicada').length, borrador: lista.filter((v) => v.estado === 'borrador').length, cerrada: lista.filter((v) => v.estado === 'cerrada').length },
    kpis: vacio ? null : {
      activas: publicadas.length,
      nuevos: db.postulantes.filter((p) => publicadas.some((v) => v.id === p.vacanteId)).length,
      pendientes: db.postulantes.filter((p) => p.estado === 'sin-revisar').length,
      terna: Object.values(db.ternas).reduce((n, t) => n + t.length, 0),
    },
    asistente: { abrir: false, vacante: nuevaVacante(), errores: {}, ...asistente },
    opciones: db.opciones,
    limites: plataforma.limites,
    catalogo: plataforma.competencias,
    scripts: ['/js/pages/asistente.js'],
  });
}

router.get('/vacantes', (req, res) => renderVacantes(req, res));
router.get('/vacantes/nueva', (req, res) => renderVacantes(req, res, { abrir: true }));
router.get('/vacantes/:id/editar', (req, res, next) => {
  const v = vacante(req.params.id);
  if (!v) return next();
  const errores = req.query.completar ? validar(v, 'publicar') : {};
  renderVacantes(req, res, { abrir: true, vacante: v, errores });
});

function guardar(req, res, actual) {
  const accion = req.body.accion === 'publicar' ? 'publicar' : 'borrador';
  const datos = leerVacante(req.body, actual || nuevaVacante());
  const errores = validar(datos, accion);
  if (Object.keys(errores).length) {
    return renderVacantes(req, res, { abrir: true, vacante: { ...datos, id: actual?.id ?? null, estado: actual?.estado ?? 'nueva' }, errores }, 422);
  }

  const eraPublicada = actual && actual.estado === 'publicada';
  const estado = accion === 'publicar' ? 'publicada' : (actual ? actual.estado : 'borrador');
  const v = Object.assign(actual || { id: Math.max(...db.vacantes.map((x) => x.id)) + 1 }, datos, { estado, editada: hoy() });
  if (estado === 'publicada' && !v.publicada) v.publicada = hoy();
  if (!actual) db.vacantes.unshift(v);
  const aviso = eraPublicada ? 'vacante-actualizada' : accion === 'publicar' ? 'vacante-publicada' : 'vacante-borrador';
  res.redirect(303, `/empresa/vacantes?aviso=${aviso}`);
}

router.post('/vacantes', (req, res) => {
  // Si el autoguardado ya creó el borrador, se actualiza ese.
  const actual = req.body.id ? vacante(req.body.id) : null;
  guardar(req, res, actual);
});
router.post('/vacantes/:id', (req, res, next) => {
  const v = vacante(req.params.id);
  if (!v) return next();
  guardar(req, res, v);
});

// Autoguardado del asistente (fetch): crea o actualiza el borrador sin validar campos obligatorios.
router.post('/autoguardado', (req, res) => {
  let v = req.body.id ? vacante(req.body.id) : null;
  if (v && v.estado !== 'borrador') return res.json({ ok: false });
  const datos = leerVacante(req.body, v || nuevaVacante());
  if (!datos.titulo) return res.json({ ok: false });
  if (!v) {
    v = { id: Math.max(...db.vacantes.map((x) => x.id)) + 1 };
    db.vacantes.unshift(v);
  }
  Object.assign(v, datos, { estado: 'borrador', editada: hoy() });
  res.json({ ok: true, id: v.id, hora: new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }) });
});

router.post('/vacantes/:id/duplicar', (req, res, next) => {
  const v = vacante(req.params.id);
  if (!v) return next();
  const copia = { ...structuredClone(v), id: Math.max(...db.vacantes.map((x) => x.id)) + 1, titulo: `${v.titulo} (copia)`, estado: 'borrador', editada: hoy(), publicada: null, cerradaEl: null };
  db.vacantes.unshift(copia);
  res.redirect(303, '/empresa/vacantes?aviso=vacante-duplicada');
});
router.post('/vacantes/:id/publicar', (req, res, next) => {
  const v = vacante(req.params.id);
  if (!v) return next();
  if (Object.keys(validar(v, 'publicar')).length) return res.redirect(303, `/empresa/vacantes/${v.id}/editar?completar=1`);
  Object.assign(v, { estado: 'publicada', publicada: v.publicada || hoy(), cerradaEl: null });
  res.redirect(303, '/empresa/vacantes?aviso=vacante-publicada');
});
router.post('/vacantes/:id/cerrar', (req, res, next) => {
  const v = vacante(req.params.id);
  if (!v) return next();
  Object.assign(v, { estado: 'cerrada', cerradaEl: hoy() });
  res.redirect(303, '/empresa/vacantes?aviso=vacante-cerrada');
});
router.post('/vacantes/:id/eliminar', (req, res, next) => {
  const i = db.vacantes.findIndex((v) => v.id === Number(req.params.id) && v.estado === 'borrador');
  if (i < 0) return next();
  db.vacantes.splice(i, 1);
  res.redirect(303, '/empresa/vacantes?aviso=vacante-eliminada');
});

/* ---------------------------------------------------------- Postulantes */
function estadoPostulante(p) {
  if (p.estado !== 'descartado' && terna(p.vacanteId).includes(p.id)) return { clave: 'terna', ...db.estadosPostulante.terna };
  return { clave: p.estado, ...db.estadosPostulante[p.estado] };
}
const conEstado = (p) => ({ ...p, estadoVista: estadoPostulante(p), enTerna: terna(p.vacanteId).includes(p.id) });

router.get('/postulantes', (req, res) => {
  const forzado = estadoForzado(req);
  const conPostulantes = db.vacantes.filter((v) => v.estado !== 'borrador');
  const v = vacante(req.query.vacante) || conPostulantes[0];
  const ps = forzado === 'vacio' || forzado === 'error' ? [] : db.postulantes.filter((p) => p.vacanteId === v.id).map(conEstado);
  const sel = postulante(req.query.postulante);
  const baseUrl = `/empresa/postulantes?vacante=${v.id}`;
  res.render('empresa/postulantes', {
    title: 'Postulantes · TrabajaYa',
    active: 'postulantes',
    vacantes: conPostulantes.map((x) => ({ ...x, total: db.postulantes.filter((p) => p.vacanteId === x.id).length })),
    vacante: v,
    postulantes: ps,
    estado: forzado === 'error' ? 'error' : ps.length ? 'ok' : 'vacio',
    terna: terna(v.id).map(postulante).filter(Boolean).map(conEstado),
    detalle: sel && sel.vacanteId === v.id && !forzado ? conEstado(sel) : null,
    baseUrl,
    scripts: ['/js/pages/postulantes.js'],
  });
});

router.get('/postulantes/:id/detalle', (req, res) => {
  const p = postulante(req.params.id);
  if (!p) return res.status(404).send('');
  res.render('empresa/partials/postulante-detalle', { layout: false, p: conEstado(p), ternaLlena: terna(p.vacanteId).length >= 3 });
});

router.post('/postulantes/:id/terna', (req, res, next) => {
  const p = postulante(req.params.id);
  if (!p) return next();
  const t = terna(p.vacanteId);
  const i = t.indexOf(p.id);
  let error = null;
  if (i >= 0) t.splice(i, 1);
  else if (t.length >= 3) error = 'terna-llena';
  else if (p.estado === 'descartado') error = 'descartado';
  else t.push(p.id);
  const vuelta = `/empresa/postulantes?vacante=${p.vacanteId}&postulante=${p.id}`;
  if (quiereJson(req)) {
    return res.status(error ? 409 : 200).json({
      ok: !error, error, enTerna: t.includes(p.id), total: t.length, estado: estadoPostulante(p),
      terna: t.map(postulante).filter(Boolean).map((x) => ({ id: x.id, nombre: x.nombre, ats: x.ats, entrevista: x.entrevista })),
    });
  }
  res.redirect(303, error === 'terna-llena' ? conParam(vuelta, 'aviso', 'terna-llena') : vuelta);
});

router.post('/postulantes/:id/estado', (req, res, next) => {
  const p = postulante(req.params.id);
  if (!p || !['aprobado', 'descartado'].includes(req.body.estado)) return next();
  // Backend: guardar el estado y enviar el correo al candidato (no hay chat interno, CLAUDE.md §9).
  p.estado = req.body.estado;
  if (p.estado === 'descartado') {
    const t = terna(p.vacanteId);
    if (t.includes(p.id)) t.splice(t.indexOf(p.id), 1);
  }
  res.redirect(303, `/empresa/postulantes?vacante=${p.vacanteId}&postulante=${p.id}&aviso=${p.estado}`);
});

// STUB de la exportación: el backend genera el PDF. Aquí se muestra la terna lista para imprimir.
router.get('/terna', (req, res, next) => {
  const v = vacante(req.query.vacante);
  if (!v) return next();
  const orden = lista(req.query.orden).map(Number);
  const ids = orden.length ? orden.filter((id) => terna(v.id).includes(id)) : terna(v.id);
  const incluir = new Set(lista(req.query.incluir));
  res.render('empresa/terna-imprimible', { layout: false, vacante: v, empresa: db.perfil, candidatos: ids.map(postulante).filter(Boolean), incluir });
});

/* --------------------------------------------------------------- Perfil */
router.get('/perfil', (req, res) => {
  res.render('empresa/perfil', {
    title: 'Perfil de empresa · TrabajaYa',
    active: 'empresa',
    perfil: db.perfil,
    opciones: db.opciones,
    errores: {},
    scripts: ['/js/pages/perfil.js'],
  });
});

router.post('/perfil', (req, res) => {
  // Backend: el logo llega como multipart; este stub solo guarda los campos de texto (urlencoded).
  const b = req.body || {};
  ['nombre', 'sector', 'tamano', 'sitio', 'ubicacion', 'telefono', 'descripcion'].forEach((k) => { if (b[k] !== undefined) db.perfil[k] = String(b[k]).trim(); });
  if (db.perfil.nombre) db.usuario.nombre = db.perfil.nombre;
  res.redirect(303, '/empresa/perfil?aviso=perfil-guardado');
});

router.post('/perfil/password', (req, res) => {
  const b = req.body || {};
  const errores = {};
  if (!b.actual) errores.actual = 'Escribe tu contraseña actual.';
  if ((b.nueva || '').length < 8) errores.nueva = 'Usa al menos 8 caracteres.';
  else if (b.nueva !== b.confirmar) errores.confirmar = 'Las contraseñas no coinciden.';
  if (Object.keys(errores).length) {
    return res.status(422).render('empresa/perfil', {
      title: 'Perfil de empresa · TrabajaYa', active: 'empresa', perfil: db.perfil, opciones: db.opciones, errores, abrirPassword: true,
      scripts: ['/js/pages/perfil.js'],
    });
  }
  res.redirect(303, '/empresa/perfil?aviso=password-cambiada');
});

router.post('/perfil/eliminar', (req, res) => {
  // Backend: eliminar la cuenta, sus vacantes y cerrar la sesión.
  res.redirect(303, '/');
});

router.post('/soporte/tickets', (req, res) => {
  const body = req.body || {};
  let volver = body.volver;
  if (!volver && req.get('referer')) {
    try { const ref = new URL(req.get('referer')); if (ref.host === req.get('host')) volver = ref.pathname + ref.search; } catch { /* sin referer */ }
  }
  if (typeof volver !== 'string' || !volver.startsWith('/empresa')) volver = '/empresa/vacantes';
  db.soporte.tickets.unshift({ id: 2100 + db.soporte.tickets.length, asunto: (body.asunto || '').trim() || 'Consulta enviada desde la mesa de ayuda', estado: 'abierto', actualizado: hoy() });
  res.redirect(303, conParam(volver, 'aviso', 'ticket-enviado'));
});

export default router;
