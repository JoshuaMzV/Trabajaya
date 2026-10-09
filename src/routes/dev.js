import { Router } from 'express';
import { usuarios } from '../mocks/sesion.js';
import datos from '../mocks/dev-componentes.js';

// Rutas de revisión visual. Solo se montan fuera de producción (ver server.js).
const router = Router();

router.get('/componentes', (req, res) => {
  res.render('dev/componentes', {
    title: 'Componentes · TrabajaYa',
    styles: ['/css/pages/dev.css'],
    scripts: ['/js/pages/dev.js'],
    usuarios,
    ...datos,
  });
});

// Vista previa del layout app.ejs: /dev/componentes/app?role=cand|rec|admin&active=<clave>
router.get('/componentes/app', (req, res) => {
  const role = ['cand', 'rec', 'admin'].includes(req.query.role) ? req.query.role : 'cand';
  const active = req.query.active || res.app.locals.navApp[role].items[0].key;
  res.render('dev/app', {
    layout: 'app',
    title: 'Layout app · TrabajaYa',
    styles: ['/css/pages/dev.css'],
    role,
    active,
    usuario: usuarios[role],
    vacantes: datos.vacantes,
    vacanteSel: datos.vacantes.find((v) => String(v.id) === req.query.vacante) ?? null,
  });
});

export default router;
