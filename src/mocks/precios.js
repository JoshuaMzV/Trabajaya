// Precios y saldos que en el diseño aparecen como [PRECIO] / [N]. Los define Admin › Ajustes › Precios y planes.
// Valores de ejemplo: confirmar con negocio. Son objetos compartidos: lo que guarda el admin lo ven candidato y landing.
export const precios = {
  packDesde: 'US$ 5',
  proMensual: 'US$ 15',
};

export const packs = [
  { id: 'p50', nombre: 'Básico', monedas: 50, desc: 'Para probar', precio: 'US$ 5', activo: true },
  { id: 'p150', nombre: 'Popular', monedas: 150, desc: 'Más popular', precio: 'US$ 12', destacado: true, activo: true },
  { id: 'p400', nombre: 'Grande', monedas: 400, desc: 'Mejor precio por moneda', precio: 'US$ 28', activo: true },
];

// Costo en TrabajaCoins de cada acción del candidato en el plan Gratis (PRO: incluido).
export const costos = {
  analisis: 10,
  cvAdaptado: 15,
  entrevista: 25,   // entrevista de práctica
  postulacion: 25,  // entrevista IA de postulación
  regenerar: 5,     // regenerar un CV adaptado
};
