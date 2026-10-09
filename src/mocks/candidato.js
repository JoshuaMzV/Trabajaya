// Datos de ejemplo del área del candidato (disenos/app/WC-*.dc.html).
// STUB: estado en memoria para recorrer los flujos sin backend; se reinicia al reiniciar el servidor.
import { usuarios } from './sesion.js';
import { packs, precios, costos } from './precios.js';

export const usuario = usuarios.cand; // mismo objeto que usa el menú lateral (saldo, plan)

export const vacantes = [
  {
    id: 1, puesto: 'Analista de Datos Sr.', empresa: 'Andina Logística', logoUrl: null, ciudad: 'Guatemala', modalidad: 'Híbrido',
    jornada: 'Tiempo completo', salario: 'Q 14,000 – 17,000', area: 'Datos', dias: 2, match: 82,
    descripcion: ['Buscamos a una persona que convierta los datos de operación en decisiones de negocio para nuestras rutas de distribución.', 'Trabajarás con el equipo de planeación para construir tableros, modelos de demanda y alertas de desempeño.'],
    requisitos: ['3+ años en análisis de datos', 'SQL avanzado y Power BI', 'Python para automatización (deseable)', 'Inglés intermedio'],
    sobreEmpresa: 'Andina Logística mueve carga para más de 300 comercios en Centroamérica.',
    competencias: ['Adaptabilidad', 'Experiencia', 'Implementación técnica'], preguntas: 6, duracion: 20,
  },
  {
    id: 2, puesto: 'Desarrollador Backend Node.js', empresa: 'Finanzas Claras', logoUrl: null, ciudad: 'Ciudad de Guatemala', modalidad: 'Remoto',
    jornada: 'Tiempo completo', salario: 'Q 18,000 – 22,000', area: 'Tecnología', dias: 5, match: 74,
    descripcion: ['Diseñarás y mantendrás las APIs de nuestra plataforma de pagos.', 'Colaborarás con producto y QA en entregas semanales.'],
    requisitos: ['Node.js y Express en producción', 'Bases de datos SQL', 'Pruebas automatizadas', 'Buenas prácticas de seguridad'],
    sobreEmpresa: 'Finanzas Claras ayuda a pequeñas empresas a cobrar y pagar en línea.',
    competencias: ['Resolución de problemas', 'Experiencia', 'Comunicación'], preguntas: 5, duracion: 18,
  },
  {
    id: 3, puesto: 'Coordinadora de Operaciones', empresa: 'Grupo Sur', logoUrl: null, ciudad: 'Quetzaltenango', modalidad: 'Presencial',
    jornada: 'Tiempo completo', salario: 'Q 9,000 – 11,000', area: 'Operaciones', dias: 9, match: 61,
    descripcion: ['Coordinarás los turnos y la logística diaria de dos centros de distribución.'],
    requisitos: ['2+ años coordinando equipos', 'Manejo de indicadores operativos', 'Excel avanzado'],
    sobreEmpresa: 'Grupo Sur distribuye productos de consumo en el occidente del país.',
    competencias: ['Liderazgo', 'Organización', 'Adaptabilidad'], preguntas: 6, duracion: 20,
  },
  {
    id: 4, puesto: 'Analista BI', empresa: 'Retail Uno', logoUrl: null, ciudad: 'Mixco', modalidad: 'Híbrido',
    jornada: 'Tiempo completo', salario: 'Q 12,000 – 14,000', area: 'Datos', dias: 3, match: 79,
    descripcion: ['Mantendrás los tableros comerciales y apoyarás a las tiendas con reportes semanales.'],
    requisitos: ['Power BI o Tableau', 'SQL intermedio', 'Comunicación con áreas de negocio'],
    sobreEmpresa: 'Retail Uno opera 45 tiendas de conveniencia.',
    competencias: ['Comunicación', 'Experiencia', 'Implementación técnica'], preguntas: 5, duracion: 15,
  },
  {
    id: 5, puesto: 'Especialista en Atención al Cliente', empresa: 'Conecta Telecom', logoUrl: null, ciudad: 'Remoto', modalidad: 'Remoto',
    jornada: 'Medio tiempo', salario: 'Q 5,500 – 6,500', area: 'Servicio al cliente', dias: 1, match: 68,
    descripcion: ['Atenderás a clientes por chat y teléfono y darás seguimiento a sus casos.'],
    requisitos: ['Experiencia en atención al cliente', 'Redacción clara', 'Disponibilidad por las tardes'],
    sobreEmpresa: 'Conecta Telecom ofrece internet residencial en 12 departamentos.',
    competencias: ['Empatía', 'Comunicación', 'Resolución de problemas'], preguntas: 5, duracion: 15,
  },
  {
    id: 6, puesto: 'Científica de Datos', empresa: 'Salud Más', logoUrl: null, ciudad: 'Ciudad de Guatemala', modalidad: 'Híbrido',
    jornada: 'Tiempo completo', salario: 'Q 20,000 – 25,000', area: 'Datos', dias: 12, match: 57,
    descripcion: ['Construirás modelos predictivos de demanda hospitalaria.'],
    requisitos: ['Python y scikit-learn', 'Estadística aplicada', 'Experiencia con datos clínicos (deseable)'],
    sobreEmpresa: 'Salud Más administra una red de clínicas privadas.',
    competencias: ['Pensamiento analítico', 'Implementación técnica', 'Comunicación'], preguntas: 7, duracion: 25,
  },
  {
    id: 7, puesto: 'Ejecutivo de Ventas B2B', empresa: 'Andina Logística', logoUrl: null, ciudad: 'Guatemala', modalidad: 'Presencial',
    jornada: 'Tiempo completo', salario: 'Q 8,000 + comisiones', area: 'Ventas', dias: 6, match: 48,
    descripcion: ['Abrirás nuevas cuentas corporativas para el servicio de distribución.'],
    requisitos: ['2+ años en ventas consultivas', 'Licencia de conducir', 'Manejo de CRM'],
    sobreEmpresa: 'Andina Logística mueve carga para más de 300 comercios en Centroamérica.',
    competencias: ['Negociación', 'Comunicación', 'Orientación a resultados'], preguntas: 5, duracion: 15,
  },
  {
    id: 8, puesto: 'Product Designer', empresa: 'Finanzas Claras', logoUrl: null, ciudad: 'Remoto', modalidad: 'Remoto',
    jornada: 'Tiempo completo', salario: 'Q 16,000 – 19,000', area: 'Tecnología', dias: 15, match: 52,
    descripcion: ['Diseñarás flujos de pago claros para usuarios de pequeñas empresas.'],
    requisitos: ['Portafolio de producto digital', 'Figma', 'Investigación con usuarios'],
    sobreEmpresa: 'Finanzas Claras ayuda a pequeñas empresas a cobrar y pagar en línea.',
    competencias: ['Empatía', 'Comunicación', 'Implementación técnica'], preguntas: 5, duracion: 18,
  },
];

export const filtrosMuro = {
  ubicaciones: ['Guatemala', 'Ciudad de Guatemala', 'Mixco', 'Quetzaltenango', 'Remoto'],
  modalidades: ['Remoto', 'Híbrido', 'Presencial'],
  areas: ['Datos', 'Tecnología', 'Operaciones', 'Servicio al cliente', 'Ventas'],
};

export const expediente = {
  estado: 'cargado', // 'sin-archivo' | 'leyendo' | 'cargado' | 'error'
  archivo: { nombre: 'cv-maria-jose-lopez.pdf', url: null, actualizado: '12/09/2026', progreso: 60 },
  personal: { nombre: 'María José López', correo: 'maria.lopez@correo.com', telefono: '+502 5555 0142', ciudad: 'Guatemala' },
  resumen: 'Analista de datos con 5 años de experiencia en logística y retail. Construyo tableros en Power BI y automatizo reportes con SQL.',
  experiencia: [
    { id: 'e1', puesto: 'Analista de Datos', empresa: 'Distribuidora Central', desde: 'Mar 2022', hasta: 'Actualidad', descripcion: 'Tableros de ventas y modelos de reabastecimiento para 120 rutas.' },
    { id: 'e2', puesto: 'Analista de Reportes', empresa: 'Retail Uno', desde: 'Ene 2020', hasta: 'Feb 2022', descripcion: 'Automaticé el cierre semanal y reduje su tiempo de 2 días a 3 horas.' },
  ],
  educacion: [
    { id: 'd1', titulo: 'Ingeniería Industrial', institucion: 'Universidad de San Carlos', anio: '2019' },
    { id: 'd2', titulo: 'Certificación PL-300 Power BI', institucion: 'Microsoft', anio: '2023' },
  ],
  habilidades: ['SQL', 'Power BI', 'Excel avanzado', 'Python básico', 'Inglés · B2', 'Portugués · A2'],
};

export const estadosPostulacion = {
  enviada: { label: 'Enviada', variante: 'outline' },
  revision: { label: 'En revisión', variante: 'neutral' },
  aprobado: { label: 'Aprobado para entrevista', variante: 'ink' },
  descartado: { label: 'Descartado', variante: 'dashed' },
};

export const postulaciones = [
  { id: 101, vacanteId: 2, estado: 'enviada', fecha: '09/10/2026', actualizada: '09/10/2026' },
  { id: 102, vacanteId: 4, estado: 'revision', fecha: '02/10/2026', actualizada: '05/10/2026' },
  { id: 103, vacanteId: 3, estado: 'aprobado', fecha: '25/09/2026', actualizada: '01/10/2026' },
  { id: 104, vacanteId: 7, estado: 'descartado', fecha: '20/09/2026', actualizada: '28/09/2026' },
];

export const estilosCv = {
  ats: { label: 'Estándar ATS', desc: 'Una columna, sin gráficos' },
  ejecutivo: { label: 'Formal Ejecutivo', desc: 'Jerarquía visual sobria' },
};

export const cvsAdaptados = [
  { id: 301, vacanteId: 1, estilo: 'ats', match: 82, fecha: '08/10/2026' },
  { id: 302, vacanteId: 4, estilo: 'ejecutivo', match: 79, fecha: '01/10/2026' },
];

export const tickets = [
  { id: 1042, asunto: 'No puedo subir mi CV', estado: 'abierto', actualizado: '08/10/2026' },
  { id: 1031, asunto: 'Cobro de una entrevista', estado: 'respondido', actualizado: '03/10/2026' },
  { id: 1017, asunto: 'Cambiar mi correo', estado: 'cerrado', actualizado: '21/09/2026' },
];
export const estadosTicket = {
  abierto: { label: 'Abierto', variante: 'accent' },
  respondido: { label: 'Respondido', variante: 'neutral' },
  cerrado: { label: 'Cerrado', variante: 'outline' },
};
export const categoriasSoporte = ['Cuenta', 'Pagos y monedas', 'Entrevista IA', 'Expediente / CV', 'Otro'];
export const soporte = { vip: 'menos de 2 horas', estandar: '24 horas' }; // POR DEFINIR: SLA del soporte estándar

// Resultado de ejemplo de una práctica (dictamen privado).
function resultadoEjemplo(vacante) {
  return {
    score: 78,
    competencias: vacante.competencias.map((nombre, i) => ({ nombre, valor: [78, 86, 64][i] ?? 70 })),
    fortalezas: ['Ejemplos concretos con resultados medibles', 'Buen dominio de SQL y tableros'],
    mejorar: ['Respuestas largas en la parte de contexto', 'Poca mención del trabajo en equipo'],
    recomendaciones: ['Usa STAR y cierra con el resultado en una frase', 'Prepara un ejemplo de conflicto con un compañero'],
    respuestas: [
      { pregunta: 'Cuéntame de un proyecto donde cambiaste de herramienta.', resumen: 'Migró los reportes de Excel a Power BI en 3 meses.', comentario: 'Clara y con impacto; faltó mencionar a los usuarios.' },
      { pregunta: '¿Qué obstáculo encontraste en esa migración?', resumen: 'Resistencia del equipo comercial; organizó capacitaciones cortas.', comentario: 'Buena repregunta resuelta con un ejemplo concreto.' },
      { pregunta: '¿Cómo validas la calidad de un tablero antes de publicarlo?', resumen: 'Cuadra contra el cierre contable y pide revisión a un usuario clave.', comentario: 'Sólida; podrías nombrar las métricas de control.' },
    ],
  };
}

export const practicas = [
  { id: 201, vacanteId: 1, score: 78, fecha: '07/10/2026' },
  { id: 202, vacanteId: 5, score: 71, fecha: '30/09/2026' },
];

// Sesiones de entrevista (Sala). Las prácticas ya hechas tienen su resultado.
export const sesiones = new Map(practicas.map((p) => {
  const v = vacantes.find((x) => x.id === p.vacanteId);
  return [p.id, { id: p.id, modo: 'practica', vacanteId: p.vacanteId, indice: 0, preguntas: [], estado: 'finalizada', resultado: { ...resultadoEjemplo(v), score: p.score } }];
}));

export function preguntasPara(vacante) {
  return [
    { texto: 'Cuéntame de un proyecto donde cambiaste de herramienta.', competencia: vacante.competencias[0], repregunta: false },
    { texto: '¿Qué obstáculo encontraste en esa migración y cómo lo resolviste?', competencia: vacante.competencias[0], repregunta: true, fragmento: 'migré los reportes de Excel a Power BI' },
    { texto: '¿Cómo validas la calidad de un análisis antes de presentarlo?', competencia: vacante.competencias[1], repregunta: false },
    { texto: 'Describe una situación en la que tuviste que explicar datos complejos a alguien sin formación técnica.', competencia: vacante.competencias[2], repregunta: false },
  ];
}

export { resultadoEjemplo, packs, precios, costos };

// Resultado de ejemplo del Adaptador ATS.
export function adaptacionEjemplo(vacante, estilo) {
  return {
    id: Date.now(), vacanteId: vacante.id, estilo, match: vacante.match,
    keywords: [
      { k: 'SQL', ok: true }, { k: 'Power BI', ok: true }, { k: 'Tableros', ok: true }, { k: 'Logística', ok: true },
      { k: 'Python', ok: false }, { k: 'Modelos de demanda', ok: false },
    ],
    fortalezas: [
      { t: 'SQL y Power BI', evidencia: '5 años construyendo tableros' },
      { t: 'Experiencia en logística', evidencia: '120 rutas en Distribuidora Central' },
      { t: 'Automatización de reportes', evidencia: 'cierre semanal de 2 días a 3 horas' },
    ],
    brechas: [
      { t: 'Python', accion: 'menciona tus scripts de limpieza o toma un curso corto' },
      { t: 'Modelos de demanda', accion: 'describe tu modelo de reabastecimiento con ese nombre' },
    ],
  };
}
