import { Router } from 'express';
import { authState, renderLanding } from './public.js';
import { cuentas } from '../mocks/sesion.js';

// STUB de autenticación mientras no exista el backend: valida el formulario y simula las respuestas.
// Las cuentas viven en memoria (mocks/sesion.js). No hay sesión: el área de cada rol muestra siempre
// el usuario de ejemplo de ese rol. El backend reemplaza credenciales, sesión, cuentas y correos.
const router = Router();
const isDev = process.env.NODE_ENV !== 'production';

const esCorreo = (v) => /^\S+@\S+\.\S+$/.test(v);
const destinoPorRol = { cand: '/candidato/muro', rec: '/empresa/vacantes', admin: '/admin/metricas' };
const buscarCuenta = (correo) => cuentas.find((c) => c.correo.toLowerCase() === correo.toLowerCase());

router.post('/login', (req, res) => {
  const correo = (req.body.correo || '').trim();
  const password = req.body.password || '';
  const errores = {};
  if (!esCorreo(correo)) errores.correo = 'Escribe un correo válido.';
  if (!password) errores.password = 'Escribe tu contraseña.';

  const cuenta = buscarCuenta(correo);
  if (!Object.keys(errores).length && (!cuenta || cuenta.password !== password)) errores.credenciales = true;

  if (Object.keys(errores).length) {
    return renderLanding(res, authState({ abrir: 'entrar', errores, valores: { correo } }), 422);
  }
  res.redirect(303, destinoPorRol[cuenta.rol]);
});

// Solo en desarrollo: "Acceso rápido demo" del modal Entrar (una cuenta de cada tipo).
router.post('/demo', (req, res, next) => {
  if (!isDev) return next();
  const rol = ['cand', 'rec', 'admin'].includes(req.body.rol) ? req.body.rol : 'cand';
  res.redirect(303, destinoPorRol[rol]);
});

router.post('/registro', (req, res) => {
  const rol = req.body.rol === 'empresa' ? 'empresa' : 'candidato';
  const valores = { nombre: (req.body.nombre || '').trim(), correo: (req.body.correo || '').trim() };
  const password = req.body.password || '';
  const errores = {};
  if (!valores.nombre) errores.nombre = rol === 'empresa' ? 'Escribe tu nombre o el de tu empresa.' : 'Escribe tu nombre completo.';
  if (!esCorreo(valores.correo)) errores.correo = 'Escribe un correo válido.';
  else if (buscarCuenta(valores.correo)) errores.correoExiste = true;
  if (password.length < 8) errores.password = 'Usa al menos 8 caracteres.';
  if (!req.body.terminos) errores.terminos = 'Debes aceptar los Términos y la Política de privacidad.';

  if (Object.keys(errores).length) {
    return renderLanding(res, authState({ abrir: 'registro', paso: 2, rol, errores, valores }), 422);
  }
  const cuenta = { rol: rol === 'empresa' ? 'rec' : 'cand', correo: valores.correo, password, nombre: valores.nombre };
  cuentas.push(cuenta);
  res.redirect(303, destinoPorRol[cuenta.rol]);
});

router.post('/recuperar', (req, res) => {
  const correo = (req.body.correo || '').trim();
  if (!esCorreo(correo)) {
    return renderLanding(res, authState({ abrir: 'recuperar', errores: { correo: 'Escribe un correo válido.' }, valores: { correo } }), 422);
  }
  // Backend: enviar el enlace si la cuenta existe (la respuesta es la misma en ambos casos).
  renderLanding(res, authState({ abrir: 'recuperar', enviado: true, valores: { correo } }));
});

router.get('/google', (req, res) => {
  // Backend: iniciar OAuth con Google.
  res.redirect(303, '/entrar');
});

router.post('/logout', (req, res) => {
  // Backend: destruir la sesión.
  res.redirect(303, '/');
});

export default router;
