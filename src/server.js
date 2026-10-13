import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';

import { layouts } from './lib/layouts.js';
import { icon } from './lib/icons.js';
import { navPublica, navFooter, navApp } from './lib/navegacion.js';
import { plataforma } from './mocks/plataforma.js';
import { authMiddleware } from './lib/auth.js';

import publicRoutes, { authState } from './routes/public.js';
import authRoutes from './routes/auth.js';
import candidatoRoutes from './routes/candidato.js';
import empresaRoutes from './routes/empresa.js';
import adminRoutes from './routes/admin.js';
import devRoutes from './routes/dev.js';
import { asegurarTablasExtra } from './lib/schema-sync.js';

asegurarTablasExtra().catch(console.error);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const isDev = app.get('env') !== 'production';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Helpers y datos disponibles en todas las vistas.
Object.assign(app.locals, {
  icon,
  navPublica,
  navFooter,
  navApp,
  anio: new Date().getFullYear(),
  isDev,
  plataforma,
  styles: [],
  scripts: [],
  auth: authState(), // estado por defecto de los modales de auth en el layout público
});

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: https://*.googleusercontent.com; connect-src 'self' https://accounts.google.com https://www.googleapis.com https://cloudflareinsights.com; frame-src 'self' https://accounts.google.com;"
  );
  next();
});

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(authMiddleware);
app.use(layouts({ defaultLayout: 'public' }));

app.use('/', publicRoutes);
app.use('/auth', authRoutes);
app.use('/candidato', candidatoRoutes);
app.use('/empresa', empresaRoutes);
app.use('/admin', adminRoutes);
if (isDev) app.use('/dev', devRoutes);

// 404 - No encontrada
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Página no encontrada · TrabajaYa',
    layout: req.usuario ? 'app' : 'public',
    usuario: req.usuario ? {
      nombre: req.usuario.empresa_nombre || req.usuario.nombre,
      correo: req.usuario.email,
      plan: req.usuario.rol === 'reclutador' ? 'Empresa' : (req.usuario.plan === 'PRO' ? 'PRO' : 'Gratis'),
      saldo: req.usuario.trabajacoins_saldo || 0
    } : null
  });
});

// 500 - Error interno del servidor
app.use((err, req, res, next) => {
  console.error('[Error del Servidor]', err);
  res.status(500).render('404', {
    title: 'Error del servidor · TrabajaYa',
    layout: req.usuario ? 'app' : 'public',
    usuario: req.usuario ? {
      nombre: req.usuario.empresa_nombre || req.usuario.nombre,
      correo: req.usuario.email,
      plan: req.usuario.rol === 'reclutador' ? 'Empresa' : (req.usuario.plan === 'PRO' ? 'PRO' : 'Gratis'),
      saldo: req.usuario.trabajacoins_saldo || 0
    } : null
  });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, (err) => {
  if (err) {
    console.error(err.code === 'EADDRINUSE' ? `El puerto ${port} ya está en uso.` : err);
    process.exit(1);
  }
  console.log(`TrabajaYa en http://localhost:${port}`);
  if (isDev) console.log(`Componentes: http://localhost:${port}/dev/componentes`);
});
