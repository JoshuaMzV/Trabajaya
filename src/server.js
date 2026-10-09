import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { layouts } from './lib/layouts.js';
import { icon } from './lib/icons.js';
import { navPublica, navFooter, navApp } from './lib/navegacion.js';
import { plataforma } from './mocks/plataforma.js';

import publicRoutes, { authState } from './routes/public.js';
import authRoutes from './routes/auth.js';
import candidatoRoutes from './routes/candidato.js';
import empresaRoutes from './routes/empresa.js';
import adminRoutes from './routes/admin.js';
import devRoutes from './routes/dev.js';

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

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(layouts({ defaultLayout: 'public' }));

app.use('/', publicRoutes);
app.use('/auth', authRoutes);
app.use('/candidato', candidatoRoutes);
app.use('/empresa', empresaRoutes);
app.use('/admin', adminRoutes);
if (isDev) app.use('/dev', devRoutes);

app.use((req, res) => {
  res.status(404).render('404', { title: 'Página no encontrada · TrabajaYa' });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, (err) => {
  // Express 5 llama a este callback también si falla (p. ej. puerto ocupado).
  if (err) {
    console.error(err.code === 'EADDRINUSE' ? `El puerto ${port} ya está en uso. Cierra el otro servidor o elige otro puerto (PowerShell: $env:PORT=3001).` : err);
    process.exit(1);
  }
  console.log(`TrabajaYa en http://localhost:${port}`);
  if (isDev) console.log(`Componentes: http://localhost:${port}/dev/componentes`);
});
