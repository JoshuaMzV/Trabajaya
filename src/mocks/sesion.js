// Usuario en sesión por rol (datos del menú lateral WFSide). El backend los reemplaza.
export const usuarios = {
  cand: {
    nombre: 'María José López',
    correo: 'maria.lopez@correo.com',
    avatarUrl: null,
    plan: 'Gratis',
    saldo: 120,
    movimientos: [
      { tipo: 'cargo', monedas: 15, concepto: 'Entrevista' },
      { tipo: 'abono', monedas: 100, concepto: 'Pack' },
    ],
  },
  rec: {
    nombre: 'Andina Logística S.A.',
    correo: 'talento@andinalogistica.com',
    avatarUrl: null,
  },
  admin: {
    nombre: 'Equipo TrabajaYa',
    correo: 'admin@trabajaya.com',
    avatarUrl: null,
  },
};

// STUB: cuentas para entrar mientras no exista el backend. Una de cada tipo + las que se registren
// desde /registro (solo en memoria: se pierden al reiniciar el servidor).
export const PASSWORD_DEMO = 'Trabaja2026';
export const cuentas = [
  { rol: 'cand', correo: usuarios.cand.correo, password: PASSWORD_DEMO, nombre: usuarios.cand.nombre },
  { rol: 'rec', correo: usuarios.rec.correo, password: PASSWORD_DEMO, nombre: usuarios.rec.nombre },
  { rol: 'admin', correo: usuarios.admin.correo, password: PASSWORD_DEMO, nombre: usuarios.admin.nombre },
];
