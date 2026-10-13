import fs from 'fs';

// 1. Restaurar server.js para que '/' sirva index.html
let serverCode = fs.readFileSync('Z:/backend/server.js', 'utf8');

const oldRoutes = `// Rutas de páginas públicas individuales (diseño oficial)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'inicio.html'));
});

app.get('/empresas', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'empresas.html'));
});

app.get('/como-funciona', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'como-funciona.html'));
});

app.get('/planes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'planes.html'));
});

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fallback a API 404 o frontend
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: \`Ruta API no encontrada: \${req.method} \${req.originalUrl}\` });
  }
  res.sendFile(path.join(__dirname, 'public', 'inicio.html'));
});`;

const newRoutes = `// Servir directamente la SPA completa con todas sus vistas integradas
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fallback a API 404
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: \`Ruta API no encontrada: \${req.method} \${req.originalUrl}\` });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});`;

if (serverCode.includes(oldRoutes)) {
  serverCode = serverCode.replace(oldRoutes, newRoutes);
  fs.writeFileSync('Z:/backend/server.js', serverCode, 'utf8');
  console.log('✅ server.js restaurado para servir index.html directamente en /');
} else {
  console.log('⚠️ No encontró bloque oldRoutes exacto, reemplazando fallback');
  serverCode = serverCode.replace("res.sendFile(path.join(__dirname, 'public', 'inicio.html'));", "res.sendFile(path.join(__dirname, 'public', 'index.html'));");
  serverCode = serverCode.replace("res.sendFile(path.join(__dirname, 'public', 'inicio.html'));", "res.sendFile(path.join(__dirname, 'public', 'index.html'));");
  fs.writeFileSync('Z:/backend/server.js', serverCode, 'utf8');
}
