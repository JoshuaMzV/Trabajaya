import { Router } from 'express';
import * as db from '../mocks/admin.js';
import { plataforma } from '../mocks/plataforma.js';
import { packs, precios, costos } from '../mocks/precios.js';
import { soporte as sla } from '../mocks/candidato.js';

// Área de administración (disenos/app/WA-*). Datos en src/mocks/admin.js; los POST son STUBS que modifican
// el estado en memoria. Lo que se guarda en Ajustes (packs, precios, costos, límites, catálogo) es el mismo
// objeto que usan el candidato, la empresa y la landing.
const router = Router();
const hoyHora = () => new Date().toLocaleString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const conParam = (url, k, v) => `${url}${url.includes('?') ? '&' : '?'}${k}=${encodeURIComponent(v)}`;
const cuenta = (id) => db.cuentas.find((c) => c.id === Number(id)) || null;
const ticket = (id) => db.tickets.find((t) => t.id === Number(id)) || null;
const auditar = (id, texto) => { (db.auditoria[id] = db.auditoria[id] || []).unshift({ a: texto, b: hoyHora() }); };

const avisos = {
  suspendida: { variante: 'info', mensaje: 'Suspendimos la cuenta. La persona no podrá entrar hasta que la reactives.' },
  reactivada: { variante: 'success', mensaje: 'Reactivamos la cuenta.' },
  'password-restablecida': { variante: 'success', mensaje: 'Enviamos un enlace para restablecer la contraseña.' },
  verificada: { variante: 'success', mensaje: 'Verificamos la empresa.' },
  'saldo-ajustado': { variante: 'success', mensaje: 'Ajustamos el saldo y lo registramos en la auditoría.' },
  'saldo-error': { variante: 'error', mensaje: 'Escribe una cantidad distinta de 0 y el motivo del ajuste.' },
  'plan-cambiado': { variante: 'success', mensaje: 'Cambiamos el plan de la cuenta.' },
  eliminada: { variante: 'info', mensaje: 'Eliminamos la cuenta de forma permanente.' },
  reembolsada: { variante: 'success', mensaje: 'Registramos el reembolso. La pasarela lo procesará en unos días.' },
  'ajustes-guardados': { variante: 'success', mensaje: 'Guardamos los ajustes. El cambio quedó en el historial.' },
  'ticket-actualizado': { variante: 'success', mensaje: 'Actualizamos el ticket.' },
  'ticket-respondido': { variante: 'success', mensaje: 'Enviamos la respuesta al usuario.' },
  'nota-agregada': { variante: 'info', mensaje: 'Agregamos la nota interna (no la ve el usuario).' },
};

router.use((req, res, next) => {
  Object.assign(res.locals, {
    layout: 'app',
    role: 'admin',
    usuario: db.usuario,
    aviso: avisos[req.query.aviso] || null,
    styles: ['/css/pages/admin.css'],
    scripts: [],
  });
  next();
});

router.get('/', (req, res) => res.redirect('/admin/metricas'));

/* ------------------------------------------------------------- Métricas */
router.get('/metricas', (req, res) => {
  const periodo = db.periodos.some((p) => p.value === req.query.periodo) ? req.query.periodo : '30';
  res.render('admin/metricas', {
    title: 'Métricas y facturación · TrabajaYa',
    active: 'metricas',
    periodo,
    periodos: db.periodos,
    m: db.metricas(periodo),
    transacciones: db.transacciones,
    estados: db.estadosTransaccion,
    scripts: ['/js/pages/charts.js'],
  });
});

const csv = (filas) => filas.map((f) => f.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

router.get('/metricas.csv', (req, res) => {
  const m = db.metricas(req.query.periodo || '30');
  const filas = [['Día', 'Candidatos', 'Empresas', 'Ingresos packs (US$)', 'Ingresos PRO (US$)']];
  m.registros.fechas.forEach((f, i) => filas.push([f.iso, m.registros.series[0].valores[i], m.registros.series[1].valores[i], m.ingresos.series[0].valores[i], m.ingresos.series[1].valores[i]]));
  res.type('text/csv').attachment(`metricas-${m.dias}-dias.csv`).send('﻿' + csv(filas));
});

router.post('/transacciones/:id/reembolsar', (req, res, next) => {
  const t = db.transacciones.find((x) => x.id === Number(req.params.id));
  if (!t || t.estado !== 'pagado') return next();
  // Backend: solicitar el reembolso a la pasarela.
  t.estado = 'reembolsado';
  auditar(t.cuentaId, `Admin reembolsó ${t.concepto} (#${t.id})`);
  res.redirect(303, '/admin/metricas?aviso=reembolsada#facturacion');
});

/* -------------------------------------------------------------- Cuentas */
function detalleCuenta(c) {
  return { c, estado: db.estadosCuenta[c.estado], auditoria: db.auditoria[c.id] || [] };
}

router.get('/cuentas', (req, res) => {
  const sel = cuenta(req.query.cuenta);
  const tipo = req.query.tipo === 'empresas' || (sel && sel.tipo === 'empresa') ? 'empresas' : 'candidatos';
  const lista = db.cuentas.filter((c) => (tipo === 'empresas' ? c.tipo === 'empresa' : c.tipo === 'candidato'));
  res.render('admin/cuentas', {
    title: 'Gestión de cuentas · TrabajaYa',
    active: 'cuentas',
    tipo,
    cuentas: lista,
    conteo: { candidatos: db.cuentas.filter((c) => c.tipo === 'candidato').length, empresas: db.cuentas.filter((c) => c.tipo === 'empresa').length },
    estados: db.estadosCuenta,
    detalle: sel && lista.includes(sel) ? detalleCuenta(sel) : null,
    baseUrl: `/admin/cuentas?tipo=${tipo}`,
  });
});

router.get('/cuentas.csv', (req, res) => {
  const filas = [['ID', 'Tipo', 'Nombre', 'Correo', 'Estado', 'Plan', 'Saldo', 'Vacantes', 'Alta']];
  db.cuentas.forEach((c) => filas.push([c.id, c.tipo, c.nombre, c.correo, db.estadosCuenta[c.estado].label, c.plan, c.saldo, c.vacantes, c.alta]));
  res.type('text/csv').attachment('cuentas.csv').send('﻿' + csv(filas));
});

router.get('/cuentas/:id/detalle', (req, res) => {
  const c = cuenta(req.params.id);
  if (!c) return res.status(404).send('');
  res.render('admin/partials/cuenta-detalle', { layout: false, ...detalleCuenta(c) });
});

const volverCuenta = (c, aviso) => `/admin/cuentas?tipo=${c.tipo === 'empresa' ? 'empresas' : 'candidatos'}&cuenta=${c.id}&aviso=${aviso}`;

router.post('/cuentas/:id/estado', (req, res, next) => {
  const c = cuenta(req.params.id);
  if (!c) return next();
  const suspender = c.estado !== 'suspendido';
  c.estado = suspender ? 'suspendido' : c.tipo === 'empresa' ? 'verificada' : 'activo';
  auditar(c.id, suspender ? 'Admin suspendió la cuenta' : 'Admin reactivó la cuenta');
  res.redirect(303, volverCuenta(c, suspender ? 'suspendida' : 'reactivada'));
});

router.post('/cuentas/:id/password', (req, res, next) => {
  const c = cuenta(req.params.id);
  if (!c) return next();
  auditar(c.id, 'Admin restableció la contraseña');
  res.redirect(303, volverCuenta(c, 'password-restablecida'));
});

router.post('/cuentas/:id/verificar', (req, res, next) => {
  const c = cuenta(req.params.id);
  if (!c || c.tipo !== 'empresa') return next();
  c.estado = 'verificada';
  auditar(c.id, 'Admin verificó la empresa');
  res.redirect(303, volverCuenta(c, 'verificada'));
});

router.post('/cuentas/:id/saldo', (req, res, next) => {
  const c = cuenta(req.params.id);
  if (!c || c.tipo !== 'candidato') return next();
  const monedas = Math.trunc(Number(req.body.monedas));
  const motivo = (req.body.motivo || '').trim();
  if (!monedas || !motivo) return res.redirect(303, volverCuenta(c, 'saldo-error'));
  c.saldo = Math.max(0, c.saldo + monedas);
  auditar(c.id, `Admin ajustó saldo ${monedas > 0 ? '+' : ''}${monedas} (${motivo})`);
  res.redirect(303, volverCuenta(c, 'saldo-ajustado'));
});

router.post('/cuentas/:id/plan', (req, res, next) => {
  const c = cuenta(req.params.id);
  if (!c || c.tipo !== 'candidato') return next();
  c.plan = c.plan === 'PRO' ? 'Gratis' : 'PRO';
  auditar(c.id, `Admin cambió el plan a ${c.plan}`);
  res.redirect(303, volverCuenta(c, 'plan-cambiado'));
});

router.post('/cuentas/:id/eliminar', (req, res, next) => {
  const i = db.cuentas.findIndex((c) => c.id === Number(req.params.id));
  if (i < 0) return next();
  const [c] = db.cuentas.splice(i, 1);
  res.redirect(303, `/admin/cuentas?tipo=${c.tipo === 'empresa' ? 'empresas' : 'candidatos'}&aviso=eliminada`);
});

/* -------------------------------------------------------------- Ajustes */
router.get('/ajustes', (req, res) => {
  const tabs = ['precios', 'soporte', 'ia'];
  const tk = ticket(req.query.ticket) || db.tickets.find((t) => t.estado !== 'Cerrado') || db.tickets[0];
  res.render('admin/ajustes', {
    title: 'Ajustes e IA · TrabajaYa',
    active: 'ajustes',
    tab: tabs.includes(req.query.tab) ? req.query.tab : 'precios',
    packs,
    precios,
    costos,
    plataforma,
    tickets: db.tickets,
    ticketSel: tk,
    agentes: db.agentes,
    estadosTicket: db.estadosTicket,
    iaKpis: db.iaKpis,
    abiertos: db.tickets.filter((t) => t.estado !== 'Cerrado' && t.estado !== 'Respondido').length,
    sla,
    scripts: ['/js/pages/ajustes.js'],
  });
});

const lista = (v) => [].concat(v ?? []);

router.post('/ajustes', (req, res) => {
  const b = req.body;
  // Packs (filas de la tabla; las nuevas llegan sin id).
  const nombres = lista(b.packNombre);
  const nuevos = nombres.map((nombre, i) => ({
    id: lista(b.packId)[i] || `p${Date.now()}${i}`,
    nombre: String(nombre).trim() || `Pack ${i + 1}`,
    monedas: Math.max(1, Number(lista(b.packMonedas)[i]) || 1),
    precio: String(lista(b.packPrecio)[i] || '').trim(),
    desc: String(lista(b.packEtiqueta)[i] || '').trim(),
    activo: lista(b.packActivo).includes(String(lista(b.packId)[i] || `nuevo-${i}`)),
  }));
  if (nuevos.length) {
    nuevos.forEach((p, i) => { p.destacado = packs.find((x) => x.id === p.id)?.destacado || false; if (!p.desc) p.desc = p.nombre; });
    packs.splice(0, packs.length, ...nuevos);
    const activos = packs.filter((p) => p.activo);
    if (activos.length) precios.packDesde = activos.reduce((a, p) => (parseFloat(p.precio.replace(/[^\d.]/g, '')) < parseFloat(a.precio.replace(/[^\d.]/g, '')) ? p : a)).precio;
  }
  if (b.proPrecio) precios.proMensual = String(b.proPrecio).trim();
  if (b.proSla) plataforma.pro.sla = String(b.proSla).trim();
  if (b.proBeneficios !== undefined) plataforma.pro.beneficios = String(b.proBeneficios).trim();
  if (b.seccion === 'precios') {
    plataforma.demo.mostrar = Boolean(b.demoMostrar);
    plataforma.demo.plan = b.demoPlan === 'Gratis' ? 'Gratis' : 'PRO';
    plataforma.demo.monedas = Math.max(0, Number(b.demoMonedas) || 0);
    ['cvAdaptado', 'entrevista', 'postulacion', 'regenerar'].forEach((k) => { if (b[`costo_${k}`] !== undefined) costos[k] = Math.max(0, Number(b[`costo_${k}`]) || 0); });
  }
  if (b.seccion === 'ia') {
    Object.keys(plataforma.limites).forEach((k) => { if (b[`lim_${k}`] !== undefined) plataforma.limites[k] = Math.max(0, Number(b[`lim_${k}`]) || 0); });
    plataforma.voz.idioma = b.idioma || plataforma.voz.idioma;
    plataforma.voz.conservarAudios = Number(b.conservarAudios) || plataforma.voz.conservarAudios;
    plataforma.voz.permitirVoz = Boolean(b.permitirVoz);
    plataforma.voz.noCobrarFallos = Boolean(b.noCobrarFallos);
    const comp = lista(b.competencias).map((c) => String(c).trim()).filter(Boolean);
    plataforma.competencias.splice(0, plataforma.competencias.length, ...comp);
  }
  res.redirect(303, `/admin/ajustes?tab=${b.seccion === 'ia' ? 'ia' : 'precios'}&aviso=ajustes-guardados`);
});

router.post('/tickets/:id', (req, res, next) => {
  const t = ticket(req.params.id);
  if (!t) return next();
  if (db.estadosTicket.includes(req.body.estado)) t.estado = req.body.estado;
  if (db.agentes.includes(req.body.asignado)) t.asignado = req.body.asignado;
  res.redirect(303, `/admin/ajustes?tab=soporte&ticket=${t.id}&aviso=ticket-actualizado`);
});

router.post('/tickets/:id/mensajes', (req, res, next) => {
  const t = ticket(req.params.id);
  if (!t) return next();
  const texto = (req.body.texto || '').trim();
  const nota = req.body.tipo === 'nota';
  if (texto) {
    t.mensajes.push({ tipo: nota ? 'nota' : 'agente', texto, fecha: hoyHora() });
    if (!nota) { t.estado = 'Respondido'; t.sla = 'Respondido'; }
  }
  res.redirect(303, `/admin/ajustes?tab=soporte&ticket=${t.id}&aviso=${nota ? 'nota-agregada' : 'ticket-respondido'}`);
});

export default router;
