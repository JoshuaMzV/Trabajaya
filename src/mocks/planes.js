// disenos/landing/TY-Planes.dc.html · renderVals() (solo la variante de candidato: las empresas no pagan, CLAUDE.md §9)
import { precios, packs, costos } from './precios.js';

export default {
  precios,
  packs,
  gratis: [
    'Expediente Maestro con lectura OCR',
    'Historial de postulaciones',
    'Análisis, CV adaptado y entrevistas con TrabajaCoins',
    'Mesa de ayuda',
  ],
  proLead: 'Prepárate para todas las vacantes que quieras.',
  pro: [
    'Análisis de match ilimitados',
    'CVs adaptados ilimitados',
    'Entrevistas IA ilimitadas',
    'Soporte VIP en menos de 2 horas',
  ],
  costos: [
    { accion: 'Análisis de match con una vacante', gratis: `${costos.analisis} TrabajaCoins`, pro: 'Incluido' },
    { accion: 'CV adaptado (ATS o Formal Ejecutivo)', gratis: `${costos.cvAdaptado} TrabajaCoins`, pro: 'Incluido' },
    { accion: 'Entrevista IA con feedback', gratis: `${costos.entrevista} TrabajaCoins`, pro: 'Incluido' },
    { accion: 'Soporte', gratis: 'Mesa de ayuda', pro: 'VIP · menos de 2 h' },
  ],
  // [POLÍTICA DE CANCELACIÓN] · texto de ejemplo, POR DEFINIR con negocio.
  politicaCancelacion: 'Sí. Cancelas cuando quieras desde tu cuenta y conservas PRO hasta el final del mes pagado.',
};
