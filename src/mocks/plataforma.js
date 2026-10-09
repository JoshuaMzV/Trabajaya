// Configuración de la plataforma (Admin › Ajustes). STUB en memoria: la usan el asistente de vacantes,
// la Sala de entrevista y el modal Entrar. El backend la reemplaza.
export const plataforma = {
  pro: { sla: '2 horas', beneficios: 'Uso ilimitado · Soporte VIP' },
  demo: { mostrar: true, plan: 'PRO', monedas: 999 }, // "Acceso rápido demo" en Entrar (solo fuera de producción)
  limites: { preguntasMin: 3, preguntasMax: 15, repreguntasMax: 3, duracionMax: 30, preguntasPractica: 5, practicasDia: 3 },
  voz: { idioma: 'Español', conservarAudios: 30, permitirVoz: true, noCobrarFallos: true },
  idiomas: ['Español', 'Inglés', 'Portugués'],
  retencion: [7, 30, 90, 180],
  competencias: ['Adaptabilidad', 'Experiencia', 'Implementación técnica', 'Comunicación', 'Trabajo en equipo', 'Liderazgo', 'Resolución de problemas', 'Orientación a resultados'],
};
