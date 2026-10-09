import { Router } from 'express';
import * as db from '../mocks/candidato.js';

// Área del candidato (disenos/app/WC-*). Los datos salen de src/mocks/candidato.js; los POST son STUBS
// que modifican ese estado en memoria para poder recorrer los flujos. El backend reemplaza ambos.
const router = Router();
const isDev = process.env.NODE_ENV !== 'production';
const PAGINA = 6;

// Solo en desarrollo: ?_estado=… fuerza un estado de la vista para revisarlo (no hay selector visible).
const estadoForzado = (req) => (isDev && typeof req.query._estado === 'string' ? req.query._estado : null);

const vacante = (id) => db.vacantes.find((v) => v.id === Number(id)) || null;
const hoy = () => new Date().toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' });
const esPro = () => db.usuario.plan === 'PRO';
const alcanza = (costo) => esPro() || db.usuario.saldo >= costo;
const cobrar = (costo, concepto) => {
  if (esPro()) return;
  db.usuario.saldo -= costo;
  db.usuario.movimientos = [{ tipo: 'cargo', monedas: costo, concepto }, ...(db.usuario.movimientos || [])].slice(0, 2);
};

// URL local segura para volver tras un POST (sin parámetros de modales ni avisos).
function urlVolver(valor, porDefecto = '/candidato/muro') {
  if (typeof valor !== 'string' || !valor.startsWith('/') || valor.startsWith('//')) return porDefecto;
  const url = new URL(valor, 'http://x');
  ['packs', 'soporte', 'aviso', 'compra', '_estado'].forEach((p) => url.searchParams.delete(p));
  return url.pathname + url.search;
}
const conParam = (url, clave, valor) => `${url}${url.includes('?') ? '&' : '?'}${clave}=${encodeURIComponent(valor)}`;

const avisos = {
  'expediente-guardado': { variante: 'success', mensaje: 'Guardamos los cambios de tu Expediente Maestro.' },
  'expediente-eliminado': { variante: 'info', mensaje: 'Eliminamos tu Expediente Maestro de forma permanente.' },
  'item-guardado': { variante: 'success', mensaje: 'Guardamos el cambio en tu expediente.' },
  'ticket-enviado': { variante: 'success', titulo: 'Ticket enviado.', mensaje: 'Te responderemos por correo y en Mis tickets.' },
};

// Datos comunes del layout app para el candidato: menú lateral, modal de packs y panel de soporte.
router.use((req, res, next) => {
  const volver = urlVolver(req.originalUrl);
  Object.assign(res.locals, {
    layout: 'app',
    role: 'cand',
    usuario: db.usuario,
    volver,
    aviso: avisos[req.query.aviso] || null,
    packsModal: {
      abrir: req.query.packs === '1' || req.query.packs === 'confirmado',
      paso: req.query.packs === 'confirmado' ? 3 : 1,
      compra: req.query.compra === 'pro' ? 'pro' : 'pack',
      packs: db.packs.filter((p) => p.activo),
      precioPro: db.precios.proMensual,
      volver,
    },
    soporteModal: {
      abrir: req.query.soporte === '1',
      tickets: db.tickets,
      estados: db.estadosTicket,
      categorias: db.categoriasSoporte,
      sla: db.soporte,
      volver,
    },
    styles: ['/css/pages/candidato.css'],
    scripts: ['/js/pages/candidato.js'],
  });
  next();
});

router.get('/', (req, res) => res.redirect('/candidato/muro'));

/* ---------------------------------------------------------------- Muro */
function estadoVacante(id) {
  const post = db.postulaciones.find((p) => p.vacanteId === id);
  if (post) return { tipo: 'postulado', postulacion: post, ...db.estadosPostulacion[post.estado] };
  if (db.practicas.some((p) => p.vacanteId === id)) return { tipo: 'practica', label: 'Práctica hecha', variante: 'neutral' };
  return null;
}

function detalleVacante(v) {
  return { vacante: v, estado: estadoVacante(v.id), tieneExpediente: db.expediente.estado === 'cargado' };
}

router.get('/muro', (req, res) => {
  const f = {
    q: (req.query.q || '').trim(),
    ubicacion: req.query.ubicacion || '',
    modalidad: req.query.modalidad || '',
    area: req.query.area || '',
    orden: req.query.orden === 'recientes' ? 'recientes' : 'match',
  };
  const forzado = estadoForzado(req);
  const q = f.q.toLowerCase();
  let lista = db.vacantes.filter((v) =>
    (!q || [v.puesto, v.empresa, ...v.requisitos, ...v.competencias].join(' ').toLowerCase().includes(q))
    && (!f.ubicacion || v.ciudad === f.ubicacion)
    && (!f.modalidad || v.modalidad === f.modalidad)
    && (!f.area || v.area === f.area));
  lista = lista.sort((a, b) => (f.orden === 'recientes' ? a.dias - b.dias : b.match - a.match));
  if (forzado === 'vacio') lista = [];

  const pagina = Math.max(1, Number(req.query.pagina) || 1);
  const params = new URLSearchParams(Object.entries(f).filter(([, v]) => v));
  const baseUrl = `/candidato/muro${params.toString() ? `?${params}` : ''}`;
  const sel = vacante(req.query.vacante);
  const tieneExpediente = forzado !== 'sin-expediente' && db.expediente.estado === 'cargado';

  res.render('candidato/muro', {
    title: 'Muro de empleos · TrabajaYa',
    active: 'muro',
    filtros: f,
    opciones: db.filtrosMuro,
    estado: forzado === 'error' ? 'error' : lista.length ? 'ok' : 'vacio',
    hayFiltros: Boolean(f.q || f.ubicacion || f.modalidad || f.area),
    vacantes: lista.slice(0, pagina * PAGINA).map((v) => ({ ...v, estadoCand: estadoVacante(v.id) })),
    masUrl: lista.length > pagina * PAGINA ? conParam(baseUrl, 'pagina', pagina + 1) : null,
    baseUrl,
    activas: db.postulaciones.filter((p) => p.estado !== 'descartado').length,
    tieneExpediente,
    detalle: sel ? { ...detalleVacante(sel), tieneExpediente } : null,
  });
});

// Fragmento del drawer para abrirlo sin recargar (ui.js: data-drawer-src).
router.get('/vacantes/:id/detalle', (req, res) => {
  const v = vacante(req.params.id);
  if (!v) return res.status(404).send('');
  res.render('candidato/partials/vacante-detalle', { layout: false, ...detalleVacante(v) });
});

/* ---------------------------------------------------------- Expediente */
function estadoExpediente(req) {
  const e = db.expediente;
  if (e.estado === 'leyendo' && e.leyendoHasta && Date.now() > e.leyendoHasta) {
    e.estado = 'cargado';
    e.archivo.actualizado = hoy();
  }
  return estadoForzado(req) || e.estado;
}

router.get('/expediente', (req, res) => {
  res.render('candidato/expediente', {
    title: 'Expediente Maestro · TrabajaYa',
    active: 'expediente',
    estado: estadoExpediente(req),
    consultarEstado: !estadoForzado(req), // con ?_estado= no se consulta (evita recargas en bucle)
    expediente: db.expediente,
    maxMb: 10,
    scripts: ['/js/pages/candidato.js', '/js/pages/expediente.js'],
  });
});

router.get('/expediente/estado', (req, res) => res.json({ estado: estadoExpediente(req) }));

router.post('/expediente/cv', (req, res) => {
  // Backend: recibir el PDF (multipart), guardarlo y lanzar la lectura OCR.
  Object.assign(db.expediente, { estado: 'leyendo', leyendoHasta: Date.now() + 4000 });
  db.expediente.archivo = { ...db.expediente.archivo, nombre: 'mi-cv.pdf', progreso: 60 };
  res.redirect(303, '/candidato/expediente');
});

router.post('/expediente/cancelar', (req, res) => {
  db.expediente.estado = 'sin-archivo';
  res.redirect(303, '/candidato/expediente');
});

router.post('/expediente/eliminar', (req, res) => {
  db.expediente.estado = 'sin-archivo';
  res.redirect(303, '/candidato/expediente?aviso=expediente-eliminado');
});

router.post('/expediente', (req, res) => {
  const b = req.body;
  const e = db.expediente;
  e.personal = { nombre: b.nombre ?? e.personal.nombre, correo: b.correo ?? e.personal.correo, telefono: b.telefono ?? e.personal.telefono, ciudad: b.ciudad ?? e.personal.ciudad };
  e.resumen = b.resumen ?? e.resumen;
  e.habilidades = [].concat(b.habilidades || []).map((h) => h.trim()).filter(Boolean);
  res.redirect(303, '/candidato/expediente?aviso=expediente-guardado');
});

router.post(['/expediente/experiencia', '/expediente/educacion'], (req, res) => {
  const clave = req.path.endsWith('experiencia') ? 'experiencia' : 'educacion';
  const lista = db.expediente[clave];
  const campos = clave === 'experiencia' ? ['puesto', 'empresa', 'desde', 'hasta', 'descripcion'] : ['titulo', 'institucion', 'anio'];
  const item = Object.fromEntries(campos.map((c) => [c, (req.body[c] || '').trim()]));
  const actual = lista.find((i) => i.id === req.body.id);
  if (actual) Object.assign(actual, item);
  else lista.push({ id: `n${Date.now()}`, ...item });
  res.redirect(303, '/candidato/expediente?aviso=item-guardado');
});

/* ----------------------------------------------------------- Adaptador */
const adaptaciones = new Map(db.cvsAdaptados.map((c) => [c.id, { ...db.adaptacionEjemplo(vacante(c.vacanteId), c.estilo), id: c.id, match: c.match }]));

function renderAdaptador(req, res, extra = {}, status = 200) {
  const cv = adaptaciones.get(Number(req.query.cv)) || null;
  const forzado = estadoForzado(req);
  const sinExpediente = db.expediente.estado !== 'cargado';
  const vacanteId = Number(extra.vacanteId || req.query.vacante || cv?.vacanteId || db.vacantes[0].id);
  res.status(status).render('candidato/adaptador', {
    title: 'Adaptador ATS · TrabajaYa',
    active: 'adaptador',
    vacantes: db.vacantes,
    vacanteSel: vacante(vacanteId),
    estilos: db.estilosCv,
    estiloSel: extra.estilo || cv?.estilo || (req.query.estilo === 'ejecutivo' ? 'ejecutivo' : 'ats'),
    costo: db.costos.cvAdaptado,
    esPro: esPro(),
    estado: forzado || extra.estado || (sinExpediente ? 'sin-expediente' : cv ? 'listo' : 'inicial'),
    cv,
    expediente: db.expediente,
    scripts: ['/js/pages/candidato.js', '/js/pages/adaptador.js'],
  });
}

router.get('/adaptador', (req, res) => renderAdaptador(req, res));

router.post('/adaptador', (req, res) => {
  const v = vacante(req.body.vacante);
  const estilo = req.body.estilo === 'ejecutivo' ? 'ejecutivo' : 'ats';
  if (!v) return res.redirect(303, '/candidato/adaptador');
  if (db.expediente.estado !== 'cargado') return renderAdaptador(req, res, { estado: 'sin-expediente', vacanteId: v.id, estilo }, 409);
  if (!alcanza(db.costos.cvAdaptado)) return renderAdaptador(req, res, { estado: 'sin-saldo', vacanteId: v.id, estilo }, 402);
  cobrar(db.costos.cvAdaptado, 'CV adaptado');
  const cv = db.adaptacionEjemplo(v, estilo);
  adaptaciones.set(cv.id, cv);
  db.cvsAdaptados.unshift({ id: cv.id, vacanteId: v.id, estilo, match: cv.match, fecha: hoy() });
  res.redirect(303, `/candidato/adaptador?cv=${cv.id}`);
});

// STUB de la descarga: el backend genera el PDF. Aquí se muestra la hoja lista para imprimir.
router.get('/cvs/:id', (req, res) => {
  const cv = adaptaciones.get(Number(req.params.id));
  if (!cv) return res.status(404).render('404', { layout: 'public', title: 'CV no encontrado · TrabajaYa' });
  res.render('candidato/cv-imprimible', { layout: false, cv, vacante: vacante(cv.vacanteId), expediente: db.expediente, estilos: db.estilosCv });
});

/* --------------------------------------------------- Sala de entrevista */
function renderPreparacion(req, res, extra = {}, status = 200) {
  const modo = (extra.modo || req.query.modo) === 'postulacion' ? 'postulacion' : 'practica';
  const v = vacante(extra.vacanteId || req.query.vacante) || (modo === 'practica' ? db.vacantes[0] : null);
  const yaPostulado = v && db.postulaciones.some((p) => p.vacanteId === v.id);
  let bloqueo = null;
  if (modo === 'postulacion' && !v) bloqueo = 'sin-vacante';
  else if (modo === 'postulacion' && db.expediente.estado !== 'cargado') bloqueo = 'sin-expediente';
  else if (modo === 'postulacion' && yaPostulado) bloqueo = 'ya-postulado';
  res.status(status).render('candidato/entrevista', {
    title: 'Sala de Entrevista IA · TrabajaYa',
    active: 'sala',
    fase: 0,
    modo,
    vacante: v,
    vacantes: db.vacantes,
    costo: modo === 'postulacion' ? db.costos.postulacion : db.costos.entrevista,
    esPro: esPro(),
    bloqueo,
    sinSaldo: extra.sinSaldo || estadoForzado(req) === 'sin-saldo',
    scripts: ['/js/pages/candidato.js', '/js/pages/entrevista.js'],
  });
}

router.get('/entrevista', (req, res) => renderPreparacion(req, res));

router.post('/entrevista', (req, res) => {
  const modo = req.body.modo === 'postulacion' ? 'postulacion' : 'practica';
  const v = vacante(req.body.vacante);
  if (!v) return res.redirect(303, '/candidato/entrevista');
  const costo = modo === 'postulacion' ? db.costos.postulacion : db.costos.entrevista;
  if (!alcanza(costo)) {
    // Sin saldo: se vuelve a la preparación con el modal de compra abierto.
    res.locals.packsModal.abrir = true;
    return renderPreparacion(req, res, { modo, vacanteId: v.id, sinSaldo: true }, 402);
  }
  cobrar(costo, modo === 'postulacion' ? 'Postulación' : 'Entrevista');
  const id = Date.now();
  db.sesiones.set(id, { id, modo, vacanteId: v.id, indice: 0, preguntas: db.preguntasPara(v), respuestas: [], estado: 'en-curso' });
  res.redirect(303, `/candidato/entrevista/${id}`);
});

function finalizar(s) {
  if (s.estado === 'finalizada') return;
  s.estado = 'finalizada';
  const v = vacante(s.vacanteId);
  s.resultado = db.resultadoEjemplo(v);
  if (s.modo === 'practica') {
    db.practicas.unshift({ id: s.id, vacanteId: v.id, score: s.resultado.score, fecha: hoy() });
  } else {
    const id = Date.now();
    db.postulaciones.unshift({ id, vacanteId: v.id, estado: 'enviada', fecha: hoy(), actualizada: hoy() });
    s.postulacionId = id;
  }
}

router.get('/entrevista/:id', (req, res, next) => {
  const s = db.sesiones.get(Number(req.params.id));
  if (!s) return next();
  res.render('candidato/entrevista', {
    title: 'Sala de Entrevista IA · TrabajaYa',
    active: 'sala',
    fase: s.estado === 'finalizada' ? 2 : 1,
    modo: s.modo,
    sesion: s,
    vacante: vacante(s.vacanteId),
    pregunta: s.preguntas[s.indice] || null,
    scripts: ['/js/pages/candidato.js', '/js/pages/entrevista.js'],
  });
});

router.post('/entrevista/:id/respuestas', (req, res, next) => {
  const s = db.sesiones.get(Number(req.params.id));
  if (!s) return next();
  if (s.estado === 'en-curso') {
    // Backend: guardar audio/texto, transcribir y decidir la siguiente pregunta o repregunta.
    s.respuestas.push({ indice: s.indice, texto: (req.body.respuesta || '').trim() });
    s.indice += 1;
    if (s.indice >= s.preguntas.length) finalizar(s);
  }
  res.redirect(303, `/candidato/entrevista/${s.id}`);
});

router.post('/entrevista/:id/finalizar', (req, res, next) => {
  const s = db.sesiones.get(Number(req.params.id));
  if (!s) return next();
  finalizar(s);
  res.redirect(303, `/candidato/entrevista/${s.id}`);
});

/* ------------------------------------------------------ Postulaciones */
router.get('/postulaciones', (req, res) => {
  const vacio = estadoForzado(req) === 'vacio';
  const conVacante = (lista) => (vacio ? [] : lista.map((x) => ({ ...x, vacante: vacante(x.vacanteId) })));
  const enviada = db.postulaciones.find((p) => p.id === Number(req.query.enviada));
  const tabs = ['postulaciones', 'practicas', 'cvs'];
  res.render('candidato/postulaciones', {
    title: 'Mis Postulaciones · TrabajaYa',
    active: 'postulaciones',
    tab: tabs.includes(req.query.tab) ? req.query.tab : 'postulaciones',
    postulaciones: conVacante(db.postulaciones),
    practicas: conVacante(db.practicas),
    cvs: conVacante(db.cvsAdaptados),
    estados: db.estadosPostulacion,
    estilos: db.estilosCv,
    enviada: enviada ? { ...enviada, vacante: vacante(enviada.vacanteId) } : null,
    scripts: ['/js/pages/candidato.js', '/js/pages/postulaciones.js'],
  });
});

/* ------------------------------------------------ Pagos y soporte (stubs) */
router.post('/pagos', (req, res) => {
  // Backend: confirmar el pago con la pasarela antes de acreditar.
  const volver = urlVolver(req.body.volver);
  if (req.body.tipo === 'pro') {
    db.usuario.plan = 'PRO';
    return res.redirect(303, conParam(conParam(volver, 'packs', 'confirmado'), 'compra', 'pro'));
  }
  const pack = db.packs.find((p) => p.id === req.body.pack) || db.packs[0];
  db.usuario.saldo += pack.monedas;
  db.usuario.movimientos = [{ tipo: 'abono', monedas: pack.monedas, concepto: 'Pack' }, ...(db.usuario.movimientos || [])].slice(0, 2);
  res.redirect(303, conParam(conParam(volver, 'packs', 'confirmado'), 'compra', 'pack'));
});

router.post('/soporte/tickets', (req, res) => {
  // El formulario es multipart (adjunto). Backend: parsearlo (p. ej. multer) y crear el ticket.
  // Este stub no lee el cuerpo multipart: vuelve a la página de origen (Referer).
  const body = req.body || {};
  let volver = body.volver;
  if (!volver && req.get('referer')) {
    try { const ref = new URL(req.get('referer')); if (ref.host === req.get('host')) volver = ref.pathname + ref.search; } catch { /* sin referer válido */ }
  }
  const asunto = (body.asunto || '').trim() || 'Consulta enviada desde la mesa de ayuda';
  db.tickets.unshift({ id: Math.max(...db.tickets.map((t) => t.id)) + 1, asunto, estado: 'abierto', actualizado: hoy() });
  res.redirect(303, conParam(urlVolver(volver), 'aviso', 'ticket-enviado'));
});

export default router;
