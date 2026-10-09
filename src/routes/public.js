import { Router } from 'express';

import landing from '../mocks/landing.js';
import empresas from '../mocks/empresas.js';
import comoFunciona from '../mocks/como-funciona.js';
import planes from '../mocks/planes.js';
import faq from '../mocks/faq.js';
import acerca from '../mocks/acerca.js';
import contacto from '../mocks/contacto.js';

const router = Router();

// Estado por defecto de los modales de auth (ver views/auth/*). Todas las páginas públicas los incluyen.
export function authState(extra = {}) {
  return { abrir: null, paso: 1, rol: 'candidato', errores: {}, valores: {}, enviado: false, ...extra };
}

// La landing es el fondo de los modales /entrar, /registro y /recuperar.
export function renderLanding(res, auth = authState(), status = 200) {
  res.status(status).render('public/landing', {
    title: 'TrabajaYa · Busco empleo',
    description: 'Sube tu CV una vez, adáptalo a cada vacante y ensaya con una IA que te repregunta y te dice en qué mejorar.',
    auth,
    ...landing,
  });
}

const rolValido = (rol) => (rol === 'empresa' ? 'empresa' : 'candidato');

router.get('/', (req, res) => renderLanding(res));

router.get('/empresas', (req, res) => {
  res.render('public/empresas', { title: 'TrabajaYa · Contrato talento', navActive: 'empresas', ...empresas });
});

router.get('/como-funciona', (req, res) => {
  res.render('public/como-funciona', { title: 'TrabajaYa · Cómo funciona', navActive: 'como-funciona', scripts: ['/js/pages/como-funciona.js'], ...comoFunciona });
});

router.get('/planes', (req, res) => {
  res.render('public/planes', {
    title: 'TrabajaYa · Planes',
    navActive: 'planes',
    para: req.query.para === 'empresa' ? 'empresa' : 'candidato',
    ...planes,
    packs: planes.packs.filter((p) => p.activo),
  });
});

router.get('/faq', (req, res) => {
  const cat = faq.categorias.some((c) => c.key === req.query.cat) ? req.query.cat : faq.categoriaInicial;
  res.render('public/faq', { title: 'TrabajaYa · Preguntas frecuentes', navActive: 'faq', scripts: ['/js/pages/faq.js'], categoriaActiva: cat, busqueda: typeof req.query.q === 'string' ? req.query.q.slice(0, 80) : '', ...faq });
});

router.get('/acerca', (req, res) => {
  res.render('public/acerca', { title: 'TrabajaYa · Acerca de', navActive: 'acerca', ...acerca });
});

function renderContacto(res, extra = {}, status = 200) {
  res.status(status).render('public/contacto', {
    title: 'TrabajaYa · Contacto',
    navActive: 'contacto',
    valores: { tipo: 'candidato', asunto: 'cuenta' },
    errores: {},
    enviado: false,
    ...contacto,
    ...extra,
  });
}

router.get('/contacto', (req, res) => renderContacto(res));

router.post('/contacto', (req, res) => {
  const valores = {
    tipo: req.body.tipo || 'candidato',
    nombre: (req.body.nombre || '').trim(),
    correo: (req.body.correo || '').trim(),
    asunto: req.body.asunto || 'cuenta',
    mensaje: (req.body.mensaje || '').trim(),
  };
  const errores = {};
  if (!valores.nombre) errores.nombre = 'Escribe tu nombre.';
  if (!/^\S+@\S+\.\S+$/.test(valores.correo)) errores.correo = 'Escribe un correo válido.';
  if (!valores.mensaje) errores.mensaje = 'Cuéntanos en qué te ayudamos.';

  if (Object.keys(errores).length) return renderContacto(res, { valores, errores }, 422);
  // Backend: enviar el mensaje a la mesa de ayuda.
  renderContacto(res, { enviado: true });
});

// Modales de auth con ruta propia: se muestran sobre la landing.
router.get('/entrar', (req, res) => renderLanding(res, authState({ abrir: 'entrar' })));
router.get('/recuperar', (req, res) => renderLanding(res, authState({ abrir: 'recuperar' })));
router.get('/registro', (req, res) => {
  renderLanding(res, authState({ abrir: 'registro', paso: req.query.paso === '2' ? 2 : 1, rol: rolValido(req.query.rol) }));
});

export default router;
