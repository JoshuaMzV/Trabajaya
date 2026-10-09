// Datos de ejemplo del área de la empresa (disenos/app/WR-*.dc.html).
// STUB: estado en memoria para recorrer los flujos sin backend; se reinicia al reiniciar el servidor.
import { usuarios } from './sesion.js';

export const usuario = usuarios.rec; // mismo objeto que usa el menú lateral

export const perfil = {
  nombre: 'Andina Logística S.A.',
  sector: 'Logística y transporte',
  tamano: '201–500 personas',
  sitio: 'https://andinalogistica.com',
  ubicacion: 'Guatemala, Guatemala',
  telefono: '+502 2200 1500',
  descripcion: 'Movemos carga para más de 300 comercios en Centroamérica con una red de 6 centros de distribución.',
  logoUrl: null,
  correo: usuarios.rec.correo,
};

export const opciones = {
  areas: ['Datos', 'Tecnología', 'Operaciones', 'Ventas', 'Servicio al cliente', 'Finanzas'],
  experiencia: ['Sin experiencia', '1–2 años', '3–5 años', '5+ años'],
  ubicaciones: ['Guatemala', 'Mixco', 'Quetzaltenango', 'Remoto'],
  modalidades: ['Presencial', 'Híbrido', 'Remoto'],
  jornadas: ['Tiempo completo', 'Medio tiempo', 'Por proyecto'],
  respuesta: ['Voz y texto', 'Solo voz', 'Solo texto'],
  tamanos: ['1–10 personas', '11–50 personas', '51–200 personas', '201–500 personas', '500+ personas'],
};

export const estadosVacante = {
  publicada: { label: 'Publicada', variante: 'ink' },
  borrador: { label: 'Borrador', variante: 'dashed' },
  cerrada: { label: 'Cerrada', variante: 'neutral' },
};

const base = {
  salarioMin: '', salarioMax: '', mostrarSalario: false, beneficios: '', repreguntas: 2, duracion: 20,
  respuesta: 'Voz y texto', star: true, criterios: '', preguntaObligatoria: '',
};

export const vacantes = [
  {
    ...base, id: 1, estado: 'publicada', titulo: 'Analista de Datos Sr.', area: 'Datos', experiencia: '3–5 años', ubicacion: 'Guatemala',
    modalidad: 'Híbrido', jornada: 'Tiempo completo', cierre: '2026-10-31', salarioMin: '14000', salarioMax: '17000', mostrarSalario: true,
    descripcion: 'Convertirás los datos de operación en decisiones de negocio para nuestras rutas de distribución.',
    requisitos: '* 3+ años en análisis de datos\n* SQL avanzado y Power BI\nPython para automatización\nInglés intermedio',
    skills: ['SQL', 'Power BI', 'Python'], beneficios: 'Seguro médico · Bono anual · 2 días remotos',
    competencias: [{ nombre: 'Adaptabilidad', peso: 3 }, { nombre: 'Experiencia', peso: 5 }, { nombre: 'Implementación técnica', peso: 4 }],
    preguntas: 6, criterios: 'Priorizar experiencia con modelos de demanda.', publicada: '01/10/2026', editada: '01/10/2026',
  },
  {
    ...base, id: 2, estado: 'publicada', titulo: 'Ejecutivo de Ventas B2B', area: 'Ventas', experiencia: '1–2 años', ubicacion: 'Guatemala',
    modalidad: 'Presencial', jornada: 'Tiempo completo', cierre: '2026-11-15',
    descripcion: 'Abrirás nuevas cuentas corporativas para el servicio de distribución.',
    requisitos: '* 2+ años en ventas consultivas\n* Licencia de conducir\nManejo de CRM',
    skills: ['Negociación', 'CRM'], competencias: [{ nombre: 'Comunicación', peso: 5 }, { nombre: 'Orientación a resultados', peso: 4 }],
    preguntas: 5, publicada: '24/09/2026', editada: '24/09/2026',
  },
  {
    ...base, id: 3, estado: 'publicada', titulo: 'Coordinador de Bodega', area: 'Operaciones', experiencia: '3–5 años', ubicacion: 'Mixco',
    modalidad: 'Presencial', jornada: 'Tiempo completo', cierre: '2026-10-20',
    descripcion: 'Coordinarás inventario, recepción y despacho en el centro de distribución de Mixco.',
    requisitos: '* Experiencia en bodegas o centros de distribución\n* Manejo de WMS\nLiderazgo de equipos de 10+ personas',
    skills: ['WMS', 'Excel'], competencias: [{ nombre: 'Liderazgo', peso: 4 }, { nombre: 'Resolución de problemas', peso: 4 }],
    preguntas: 5, publicada: '15/09/2026', editada: '18/09/2026',
  },
  {
    ...base, id: 4, estado: 'borrador', titulo: 'Analista de Facturación', area: 'Finanzas', experiencia: '1–2 años', ubicacion: 'Guatemala',
    modalidad: 'Híbrido', jornada: 'Tiempo completo', cierre: '',
    descripcion: 'Emitirás y conciliarás la facturación mensual de clientes corporativos.', requisitos: 'Contabilidad o finanzas\nExcel avanzado',
    skills: ['Excel'], competencias: [{ nombre: 'Experiencia', peso: 3 }], preguntas: 5, editada: '07/10/2026',
  },
  {
    ...base, id: 5, estado: 'borrador', titulo: 'Desarrollador de Integraciones', area: 'Tecnología', experiencia: '', ubicacion: 'Remoto',
    modalidad: 'Remoto', jornada: '', cierre: '', descripcion: '', requisitos: '', skills: [], competencias: [], preguntas: 6, editada: '05/10/2026',
  },
  {
    ...base, id: 6, estado: 'cerrada', titulo: 'Asistente de Logística', area: 'Operaciones', experiencia: 'Sin experiencia', ubicacion: 'Guatemala',
    modalidad: 'Presencial', jornada: 'Tiempo completo', cierre: '2026-08-31',
    descripcion: 'Apoyarás la programación de rutas y el seguimiento de entregas.', requisitos: 'Bachillerato\nManejo de Excel',
    skills: ['Excel'], competencias: [{ nombre: 'Organización', peso: 3 }, { nombre: 'Comunicación', peso: 3 }],
    preguntas: 5, publicada: '01/08/2026', editada: '01/08/2026', cerradaEl: '31/08/2026',
  },
];

// Estados del postulante: sin-revisar · pendiente (entrevista sin completar) · aprobado · descartado. La terna es aparte.
export const estadosPostulante = {
  'sin-revisar': { label: 'Sin revisar', variante: 'neutral' },
  pendiente: { label: 'Entrevista pendiente', variante: 'outline' },
  aprobado: { label: 'Aprobado 1ra entrevista', variante: 'success' },
  descartado: { label: 'Descartado', variante: 'dashed' },
  terna: { label: 'En terna', variante: 'ink' },
};

const dictamenBase = (rec, ats, ent) => ({
  recomendacion: rec,
  resumen: 'Perfil con experiencia comprobable en análisis operativo. Responde con ejemplos concretos y resultados medibles; se extiende en el contexto.',
  competencias: [{ nombre: 'Adaptabilidad', valor: Math.min(95, ent - 4) }, { nombre: 'Experiencia', valor: Math.min(98, ats + 4) }, { nombre: 'Implementación técnica', valor: Math.max(40, ent - 12) }],
  fortalezas: 'SQL avanzado, tableros en Power BI, experiencia en logística',
  brechas: 'Python básico, poca exposición a modelos predictivos',
  validar: 'Ejemplo de un modelo de demanda que haya puesto en producción',
});

const qaBase = [
  { tag: 'P1 · voz', pregunta: 'Cuéntame de un proyecto donde cambiaste de herramienta.', duracion: '1:48', resumen: 'Migró los reportes de Excel a Power BI en 3 meses y capacitó al equipo comercial.', transcripcion: 'En mi trabajo anterior teníamos más de veinte reportes en Excel que se actualizaban a mano cada semana. Propuse migrarlos a Power BI, armé un piloto con ventas y en tres meses quedaron todos automatizados.' },
  { tag: 'P1.1 · repregunta', pregunta: '¿Qué obstáculo encontraste en esa migración?', duracion: '1:12', resumen: 'Resistencia del equipo comercial; la resolvió con capacitaciones cortas.', transcripcion: 'El principal obstáculo fue que el equipo comercial confiaba en sus hojas. Hice sesiones de quince minutos los lunes y mantuve los dos formatos un mes.' },
  { tag: 'P2 · texto', pregunta: '¿Cómo validas la calidad de un tablero antes de publicarlo?', duracion: null, resumen: 'Cuadra contra el cierre contable y pide revisión a un usuario clave.', transcripcion: 'Comparo los totales contra el cierre contable del mes y le pido a un usuario clave que lo revise antes de publicarlo.' },
];

function postulante(id, vacanteId, nombre, puesto, anios, ats, ent, estado, fecha, rec) {
  return {
    id, vacanteId, nombre, puesto, anios, ats, entrevista: ent, estado, fecha,
    correo: `${nombre.split(' ')[0].toLowerCase()}@correo.com`, telefono: '+502 5555 01' + String(id).padStart(2, '0'), ciudad: 'Guatemala',
    avatarUrl: null, cvUrl: null,
    dictamen: ent == null ? null : dictamenBase(rec, ats, ent),
    qa: ent == null ? [] : qaBase,
  };
}

export const postulantes = [
  postulante(11, 1, 'Lucía Méndez', 'Analista BI', 6, 91, 88, 'sin-revisar', '08/10', 'Recomendado'),
  postulante(12, 1, 'Diego Ramírez', 'Analista de Datos', 4, 86, 82, 'sin-revisar', '07/10', 'Recomendado'),
  postulante(13, 1, 'Ana Herrera', 'Ingeniera de Datos', 5, 84, 79, 'sin-revisar', '06/10', 'Con reservas'),
  postulante(14, 1, 'Carlos Pérez', 'Analista Financiero', 3, 72, 70, 'sin-revisar', '05/10', 'Con reservas'),
  postulante(15, 1, 'Sofía Castillo', 'Analista Jr.', 2, 68, null, 'pendiente', '05/10', null),
  postulante(16, 1, 'Jorge Molina', 'Asistente de Datos', 1, 55, 48, 'descartado', '03/10', 'No recomendado'),
  postulante(17, 1, 'María José López', 'Analista de Datos', 5, 82, 78, 'aprobado', '02/10', 'Recomendado'),
  postulante(21, 2, 'Pablo Ortiz', 'Ejecutivo Comercial', 3, 77, 81, 'sin-revisar', '06/10', 'Recomendado'),
  postulante(22, 2, 'Valeria Ruiz', 'Asesora de Ventas', 2, 70, 66, 'sin-revisar', '04/10', 'Con reservas'),
  postulante(31, 3, 'Luis Gómez', 'Jefe de Bodega', 6, 80, 74, 'sin-revisar', '01/10', 'Recomendado'),
];

// Terna por vacante (máx. 3), en orden de presentación.
export const ternas = { 1: [11, 12, 13], 2: [], 3: [], 6: [] };

export const soporte = {
  tickets: [
    { id: 2051, asunto: 'Cambiar el correo de acceso de la empresa', estado: 'respondido', actualizado: '04/10/2026' },
  ],
};
