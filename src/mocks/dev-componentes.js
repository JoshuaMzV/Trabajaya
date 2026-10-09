// Datos de ejemplo para la página de revisión /dev/componentes (textos tomados de los diseños).
export default {
  colores: [
    ['bg', '#FBFAFF'], ['surface', '#FFFFFF'], ['ink', '#23153C'], ['ink-2', '#3D2D5C'],
    ['muted', '#4B3B6B'], ['label', '#6A5A8A'], ['accent', '#D13A1C'], ['link', '#B8321A'],
    ['link-hover', '#8E2412'], ['lilac', '#EAE4FF'], ['lilac-2', '#F3F0FC'], ['border', '#E4DDF7'],
    ['border-strong', '#CFC4F0'], ['ink-soft', '#34245A'], ['on-dark', '#E4DDF7'], ['on-dark-muted', '#CFC4F0'],
    ['accent-soft', '#FFE9E3'], ['accent-softer', '#FFF4F1'], ['accent-line', '#FFD3C7'], ['danger', '#8A2310'],
    ['danger-line', '#C5341A'], ['danger-bg', '#FFF1EE'], ['success', '#1B5E40'], ['success-bg', '#E3F4EC'],
    ['coin', '#F2B33D'],
  ],
  pasos: [
    { n: '1', t: 'Sube tu CV', d: 'Lo leemos y creamos tu Expediente Maestro. Lo editas cuando quieras.' },
    { n: '2', t: 'Compara con la vacante', d: 'Tu match, lo que te favorece y lo que te falta, con consejos.' },
  ],
  estadosPostulacion: [
    { label: 'Enviada', variante: 'outline' },
    { label: 'En revisión', variante: 'neutral' },
    { label: 'Aprobado para entrevista', variante: 'ink' },
    { label: 'Descartado', variante: 'dashed' },
    { label: 'Entrevista pendiente', variante: 'neutral' },
    { label: 'Activa', variante: 'success' },
    { label: 'Pago rechazado', variante: 'danger' },
    { label: 'PRO · 999 monedas', variante: 'accent' },
  ],
  packs: [
    { id: 'p50', titulo: '50 monedas', desc: 'Para probar', precio: 'US$ 5' },
    { id: 'p150', titulo: '150 monedas', desc: 'Más popular', precio: 'US$ 12', elegido: true },
    { id: 'p400', titulo: '400 monedas', desc: 'Mejor precio por moneda', precio: 'US$ 28' },
  ],
  filtros:['Todas', 'En revisión', 'Aprobado', 'Descartado'],
  etiquetasVacante: ['Remoto', 'Tiempo completo', 'Salario a convenir'],
  vacantes: [
    { id: 1, puesto: 'Analista de Datos Sr.', empresa: 'Andina Logística', ciudad: 'Guatemala', modalidad: 'Híbrido', dias: 2, match: 82 },
    { id: 2, puesto: 'Desarrollador Backend Node.js', empresa: 'Finanzas Claras', ciudad: 'Guatemala', modalidad: 'Remoto', dias: 5, match: 74 },
    { id: 3, puesto: 'Coordinadora de Operaciones', empresa: 'Grupo Sur', ciudad: 'Quetzaltenango', modalidad: 'Presencial', dias: 9, match: 61 },
  ],
};
