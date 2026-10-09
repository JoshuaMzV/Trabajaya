// Datos de ejemplo del área de administración (disenos/app/WA-*.dc.html).
// STUB: estado en memoria para recorrer los flujos sin backend; se reinicia al reiniciar el servidor.
import { usuarios } from './sesion.js';

export const usuario = usuarios.admin;

export const periodos = [
  { value: '7', label: 'Últimos 7 días' },
  { value: '30', label: 'Últimos 30 días' },
  { value: '90', label: 'Últimos 90 días' },
];

// Serie diaria determinista (sin aleatoriedad) para que los gráficos no cambien entre recargas.
function serie(dias, base, amplitud, tendencia, fase = 0) {
  return Array.from({ length: dias }, (_, i) => Math.max(0, Math.round(base + tendencia * i + amplitud * Math.sin((i + fase) / 2.3) + (i % 7 === 5 || i % 7 === 6 ? -amplitud * 0.8 : 0))));
}
function fechas(dias) {
  const fin = new Date(2026, 9, 9); // 09/10/2026
  return Array.from({ length: dias }, (_, i) => {
    const d = new Date(fin); d.setDate(fin.getDate() - (dias - 1 - i));
    return { iso: d.toISOString().slice(0, 10), corta: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}` };
  });
}

export function metricas(periodo) {
  const dias = Number(periodo) || 30;
  const f = fechas(dias);
  const cand = serie(dias, 38, 9, 0.6);
  const emp = serie(dias, 4, 2, 0.05, 3);
  const packs = serie(dias, 260, 70, 2.5, 1);
  const pro = serie(dias, 150, 30, 3.2, 4);
  const suma = (a) => a.reduce((n, x) => n + x, 0);
  const escala = dias / 30;
  return {
    dias,
    kpis: [
      { label: 'Candidatos', valor: 4820 + Math.round(suma(cand) * 0.3), delta: 12.4, bueno: 'up' },
      { label: 'Empresas', valor: 312 + Math.round(suma(emp) * 0.2), delta: 6.1, bueno: 'up' },
      { label: 'Vacantes activas', valor: 486, delta: 3.8, bueno: 'up' },
      { label: 'Entrevistas IA', valor: Math.round(2140 * escala), delta: 18.2, bueno: 'up' },
      { label: 'Ingresos', valor: suma(packs) + suma(pro), moneda: true, delta: 9.7, bueno: 'up' },
      { label: 'Suscriptores PRO', valor: 638, delta: 4.5, bueno: 'up' },
      { label: 'Pagos fallidos', valor: Math.round(23 * escala), delta: -11.0, bueno: 'down' },
      { label: 'Tickets abiertos', valor: 14, delta: 16.7, bueno: 'down' },
    ],
    registros: { fechas: f, series: [{ key: 'candidatos', label: 'Candidatos', valores: cand }, { key: 'empresas', label: 'Empresas', valores: emp }] },
    ingresos: { fechas: f, series: [{ key: 'packs', label: 'Packs de monedas', valores: packs }, { key: 'pro', label: 'Plan PRO', valores: pro }] },
    usoIA: [
      { modulo: 'Lectura de CV (OCR)', usos: Math.round(1840 * escala), costo: Math.round(92 * escala) },
      { modulo: 'Adaptador ATS', usos: Math.round(1420 * escala), costo: Math.round(213 * escala) },
      { modulo: 'Entrevistas de práctica', usos: Math.round(1610 * escala), costo: Math.round(402 * escala) },
      { modulo: 'Entrevistas de postulación', usos: Math.round(2230 * escala), costo: Math.round(557 * escala) },
    ],
  };
}

export const estadosTransaccion = {
  pagado: { label: 'Pagado', variante: 'success' },
  fallido: { label: 'Fallido', variante: 'danger' },
  reembolsado: { label: 'Reembolsado', variante: 'dashed' },
};

export const transacciones = [
  { id: 98213, fecha: '09/10 10:42', cuentaId: 1, usuario: 'María José López', tipo: 'pack', concepto: 'Pack 150 monedas', importe: 'US$ 12', estado: 'pagado' },
  { id: 98207, fecha: '09/10 09:15', cuentaId: 2, usuario: 'Diego Ramírez', tipo: 'pro', concepto: 'Plan PRO · mensual', importe: 'US$ 15', estado: 'pagado' },
  { id: 98199, fecha: '08/10 22:03', cuentaId: 4, usuario: 'Carlos Pérez', tipo: 'pack', concepto: 'Pack 50 monedas', importe: 'US$ 5', estado: 'fallido' },
  { id: 98185, fecha: '08/10 17:30', cuentaId: 5, usuario: 'Sofía Castillo', tipo: 'pro', concepto: 'Plan PRO · alta', importe: 'US$ 15', estado: 'reembolsado' },
  { id: 98170, fecha: '08/10 11:12', cuentaId: 3, usuario: 'Ana Herrera', tipo: 'pack', concepto: 'Pack 400 monedas', importe: 'US$ 28', estado: 'pagado' },
  { id: 98166, fecha: '07/10 19:48', cuentaId: 6, usuario: 'Jorge Molina', tipo: 'pack', concepto: 'Pack 150 monedas', importe: 'US$ 12', estado: 'pagado' },
  { id: 98150, fecha: '07/10 08:05', cuentaId: 2, usuario: 'Diego Ramírez', tipo: 'pack', concepto: 'Pack 50 monedas', importe: 'US$ 5', estado: 'pagado' },
];

export const estadosCuenta = {
  activo: { label: 'Activo', variante: 'neutral' },
  suspendido: { label: 'Suspendido', variante: 'ink' },
  pendiente: { label: 'Pendiente verificación', variante: 'dashed' },
  verificada: { label: 'Verificada', variante: 'success' },
};

export const cuentas = [
  {
    id: 1, tipo: 'candidato', nombre: 'María José López', correo: 'maria.lopez@correo.com', estado: 'activo', plan: 'Gratis', saldo: 120, alta: '12/03/26', ultimoAcceso: '09/10/2026',
    actividad: [{ a: 'Postulación · Desarrollador Backend Node.js', b: 'Enviada · 09/10/2026' }, { a: 'Práctica · Analista de Datos Sr.', b: 'Score 78' }, { a: 'CV adaptado · Analista de Datos Sr.', b: '08/10/2026' }],
    transacciones: [{ a: 'Pack 150 monedas', b: 'US$ 12 · 09/10/2026' }, { a: 'Consumo · Entrevista', b: '−25 · 07/10/2026' }],
  },
  {
    id: 2, tipo: 'candidato', nombre: 'Diego Ramírez', correo: 'diego@correo.com', estado: 'activo', plan: 'PRO', saldo: 40, alta: '02/05/26', ultimoAcceso: '09/10/2026',
    actividad: [{ a: 'Postulación · Analista de Datos Sr.', b: 'En revisión · 07/10/2026' }], transacciones: [{ a: 'Plan PRO · mensual', b: 'US$ 15 · 09/10/2026' }],
  },
  {
    id: 3, tipo: 'candidato', nombre: 'Ana Herrera', correo: 'ana@correo.com', estado: 'activo', plan: 'Gratis', saldo: 380, alta: '21/06/26', ultimoAcceso: '08/10/2026',
    actividad: [{ a: 'Postulación · Analista de Datos Sr.', b: 'En terna · 06/10/2026' }], transacciones: [{ a: 'Pack 400 monedas', b: 'US$ 28 · 08/10/2026' }],
  },
  {
    id: 4, tipo: 'candidato', nombre: 'Carlos Pérez', correo: 'carlos@correo.com', estado: 'suspendido', plan: 'Gratis', saldo: 5, alta: '30/07/26', ultimoAcceso: '08/10/2026',
    actividad: [{ a: 'Práctica · Analista Financiero', b: 'Score 64' }], transacciones: [{ a: 'Pack 50 monedas', b: 'Fallido · 08/10/2026' }],
  },
  {
    id: 5, tipo: 'candidato', nombre: 'Sofía Castillo', correo: 'sofia@correo.com', estado: 'activo', plan: 'Gratis', saldo: 60, alta: '15/08/26', ultimoAcceso: '05/10/2026',
    actividad: [{ a: 'Postulación · Analista de Datos Sr.', b: 'Entrevista pendiente' }], transacciones: [{ a: 'Plan PRO · alta', b: 'Reembolsado · 08/10/2026' }],
  },
  {
    id: 6, tipo: 'candidato', nombre: 'Jorge Molina', correo: 'jorge@correo.com', estado: 'activo', plan: 'PRO', saldo: 0, alta: '03/09/26', ultimoAcceso: '07/10/2026',
    actividad: [{ a: 'Postulación · Analista de Datos Sr.', b: 'Descartado · 03/10/2026' }], transacciones: [{ a: 'Pack 150 monedas', b: 'US$ 12 · 07/10/2026' }],
  },
  {
    id: 101, tipo: 'empresa', nombre: 'Andina Logística S.A.', correo: 'talento@andinalogistica.com', estado: 'verificada', vacantes: 6, alta: '10/01/26', ultimoAcceso: '09/10/2026',
    vacantesLista: [{ a: 'Analista de Datos Sr. · Publicada', b: '7 postulantes' }, { a: 'Asistente de Logística · Cerrada', b: '0 postulantes' }],
    postulantes: [{ a: 'Total de postulantes', b: '10' }, { a: 'Aprobados para entrevista', b: '1' }],
  },
  {
    id: 102, tipo: 'empresa', nombre: 'Finanzas Claras', correo: 'rrhh@finanzasclaras.com', estado: 'pendiente', vacantes: 2, alta: '28/09/26', ultimoAcceso: '08/10/2026',
    vacantesLista: [{ a: 'Desarrollador Backend Node.js · Publicada', b: '12 postulantes' }], postulantes: [{ a: 'Total de postulantes', b: '12' }, { a: 'Aprobados para entrevista', b: '0' }],
  },
  {
    id: 103, tipo: 'empresa', nombre: 'Grupo Sur', correo: 'talento@gruposur.com', estado: 'suspendido', vacantes: 1, alta: '14/04/26', ultimoAcceso: '20/09/2026',
    vacantesLista: [{ a: 'Coordinadora de Operaciones · Publicada', b: '5 postulantes' }], postulantes: [{ a: 'Total de postulantes', b: '5' }, { a: 'Aprobados para entrevista', b: '1' }],
  },
  {
    id: 104, tipo: 'empresa', nombre: 'Retail Uno', correo: 'empleo@retailuno.com', estado: 'verificada', vacantes: 3, alta: '05/02/26', ultimoAcceso: '07/10/2026',
    vacantesLista: [{ a: 'Analista BI · Publicada', b: '9 postulantes' }], postulantes: [{ a: 'Total de postulantes', b: '9' }, { a: 'Aprobados para entrevista', b: '2' }],
  },
];

// Auditoría por cuenta (lo agrega cada acción del admin).
export const auditoria = {
  1: [{ a: 'Admin ajustó saldo +20 (ticket #1031)', b: '03/10/2026 16:20' }, { a: 'Admin restableció contraseña', b: '21/09/2026 10:05' }],
  101: [{ a: 'Admin verificó la empresa', b: '11/01/2026 09:30' }],
};

export const agentes = ['Sin asignar', 'Andrea Paz', 'Luis Morales', 'Equipo TrabajaYa'];
export const estadosTicket = ['Abierto', 'En espera', 'Respondido', 'Cerrado'];

export const tickets = [
  {
    id: 1042, asunto: 'No puedo subir mi CV', categoria: 'Expediente / CV', cuentaId: 1, usuario: 'María José López', perfil: 'Candidato · Gratis', vip: false,
    estado: 'Abierto', asignado: 'Sin asignar', sla: 'Respuesta en 18 h',
    mensajes: [{ tipo: 'usuario', texto: 'Al subir mi CV en PDF se queda en "leyendo" y no termina.', fecha: '08/10 09:12' }],
  },
  {
    id: 1039, asunto: 'Me cobraron dos veces un pack', categoria: 'Pagos y monedas', cuentaId: 2, usuario: 'Diego Ramírez', perfil: 'Candidato · PRO', vip: true,
    estado: 'Abierto', asignado: 'Andrea Paz', sla: 'Vence en 01:20',
    mensajes: [
      { tipo: 'usuario', texto: 'Compré el pack de 50 monedas y aparecen dos cargos en mi tarjeta.', fecha: '09/10 08:40' },
      { tipo: 'agente', texto: 'Hola Diego, ya estamos revisando con la pasarela. Te confirmamos en menos de 2 horas.', fecha: '09/10 08:55' },
      { tipo: 'nota', texto: 'La pasarela muestra un cargo duplicado; pedir reembolso del segundo.', fecha: '09/10 09:02' },
    ],
  },
  {
    id: 1036, asunto: 'La entrevista se cortó a la mitad', categoria: 'Entrevista IA', cuentaId: 3, usuario: 'Ana Herrera', perfil: 'Candidato · Gratis', vip: false,
    estado: 'En espera', asignado: 'Luis Morales', sla: 'Respuesta en 6 h',
    mensajes: [{ tipo: 'usuario', texto: 'Iba en la pregunta 3 y se cerró la sesión. ¿Me devuelven las monedas?', fecha: '08/10 17:10' }],
  },
  {
    id: 1033, asunto: 'Verificación de la empresa', categoria: 'Empresa · vacante', cuentaId: 102, usuario: 'Finanzas Claras', perfil: 'Empresa', vip: false,
    estado: 'Respondido', asignado: 'Equipo TrabajaYa', sla: 'Respondido',
    mensajes: [
      { tipo: 'usuario', texto: '¿Cuánto tarda la verificación de nuestra cuenta?', fecha: '07/10 11:00' },
      { tipo: 'agente', texto: 'Hasta 2 días hábiles. Te avisaremos por correo.', fecha: '07/10 12:15' },
    ],
  },
  {
    id: 1031, asunto: 'Cobro de una entrevista', categoria: 'Pagos y monedas', cuentaId: 1, usuario: 'María José López', perfil: 'Candidato · Gratis', vip: false,
    estado: 'Cerrado', asignado: 'Andrea Paz', sla: 'Cerrado',
    mensajes: [{ tipo: 'usuario', texto: 'La IA falló y me descontaron monedas.', fecha: '03/10 15:40' }, { tipo: 'agente', texto: 'Te devolvimos 20 monedas. ¡Gracias por avisar!', fecha: '03/10 16:20' }],
  },
];

export const iaKpis = [
  { label: 'Entrevistas IA (30 días)', valor: '2,140' },
  { label: 'Tiempo medio de respuesta', valor: '1.8 s' },
  { label: 'Tasa de error', valor: '0.6 %' },
  { label: 'Costo de IA', valor: 'US$ 1,264' },
];
