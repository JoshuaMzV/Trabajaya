// Menús del sitio público y del menú lateral (WFSide). Las claves son las del diseño.

export const navPublica = [
  { key: 'como-funciona', label: 'Cómo funciona', href: '/como-funciona' },
  { key: 'empresas', label: 'Empresas', href: '/empresas' },
  { key: 'planes', label: 'Planes', href: '/planes' },
  { key: 'faq', label: 'FAQ', href: '/faq' },
  { key: 'contacto', label: 'Contacto', href: '/contacto' },
];

export const navFooter = [
  {
    titulo: 'Producto',
    links: [
      { key: 'como-funciona', label: 'Cómo funciona', href: '/como-funciona' },
      { key: 'empresas', label: 'Para empresas', href: '/empresas' },
      { key: 'planes', label: 'Planes', href: '/planes' },
    ],
  },
  {
    titulo: 'Ayuda',
    links: [
      { key: 'faq', label: 'Preguntas frecuentes', href: '/faq' },
      { key: 'contacto', label: 'Contacto', href: '/contacto' },
    ],
  },
  {
    titulo: 'TrabajaYa',
    links: [
      { key: 'acerca', label: 'Acerca de', href: '/acerca' },
      { key: 'terminos', label: 'Términos', href: '/terminos' },
      { key: 'privacidad', label: 'Privacidad', href: '/privacidad' },
    ],
  },
];

// role: cand | rec | admin
export const navApp = {
  cand: {
    etiqueta: 'Candidato',
    perfil: { label: 'Mi perfil y contraseña', href: '/candidato/expediente' },
    ayuda: true,
    billetera: true,
    items: [
      { key: 'muro', label: 'Muro de empleos', href: '/candidato/muro', icon: 'briefcase-business' },
      { key: 'expediente', label: 'Expediente Maestro', href: '/candidato/expediente', icon: 'file-user' },
      { key: 'adaptador', label: 'Adaptador ATS', href: '/candidato/adaptador', icon: 'wand-sparkles' },
      { key: 'sala', label: 'Sala de Entrevista IA', href: '/candidato/entrevista', icon: 'mic' },
      { key: 'postulaciones', label: 'Mis Postulaciones', href: '/candidato/postulaciones', icon: 'list-checks' },
    ],
  },
  rec: {
    etiqueta: 'Empresa',
    perfil: { label: 'Perfil de empresa', href: '/empresa/perfil' },
    ayuda: true,
    billetera: false,
    items: [
      { key: 'vacantes', label: 'Mis Vacantes', href: '/empresa/vacantes', icon: 'briefcase-business' },
      { key: 'postulantes', label: 'Postulantes', href: '/empresa/postulantes', icon: 'users' },
      { key: 'empresa', label: 'Perfil de empresa', href: '/empresa/perfil', icon: 'building-2' },
    ],
  },
  admin: {
    etiqueta: 'Admin',
    perfil: { label: 'Mi cuenta', href: '/admin/ajustes' },
    ayuda: false,
    billetera: false,
    items: [
      { key: 'metricas', label: 'Métricas y facturación', href: '/admin/metricas', icon: 'chart-column' },
      { key: 'cuentas', label: 'Gestión de cuentas', href: '/admin/cuentas', icon: 'user-cog' },
      { key: 'ajustes', label: 'Ajustes e IA', href: '/admin/ajustes', icon: 'settings' },
    ],
  },
};
