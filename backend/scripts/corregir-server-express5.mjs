import fs from 'fs';

let serverCode = fs.readFileSync('Z:/backend/server.js', 'utf8');

// En Express 5, app.get('*') requiere nombre o usar app.use con fallback
serverCode = serverCode.replace("app.get('*', (req, res, next) => {", "app.get('/{0,}', (req, res, next) => {");
if (serverCode.includes("app.get('*'")) {
  serverCode = serverCode.replace("app.get('*'", "app.get('/{0,}'");
}

// O mejor aún, la forma canónica de Express 5 para atrapar todas las rutas:
const canonicalCatchAll = `// Fallback a API 404 o SPA frontend (Express 5 compatible)
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: \`Ruta API no encontrada: \${req.method} \${req.originalUrl}\` });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});`;

// Limpiar cualquier app.get('*') o app.get('/{0,}') previo antes de app.use
serverCode = serverCode.replace(/app\.get\('\/\*?'[\s\S]*?res\.sendFile[\s\S]*?\}\);\n/g, '');
serverCode = serverCode.replace(/app\.get\('\/\{0,\}'[\s\S]*?res\.sendFile[\s\S]*?\}\);\n/g, '');

const endAppUseIdx = serverCode.indexOf('// Fallback a API 404');
if (endAppUseIdx !== -1) {
  const listenIdx = serverCode.indexOf('const PORT =');
  serverCode = serverCode.slice(0, endAppUseIdx) + canonicalCatchAll + '\n\n' + serverCode.slice(listenIdx);
}

fs.writeFileSync('Z:/backend/server.js', serverCode, 'utf8');
console.log('✅ server.js corregido para compatibilidad con Express 5');
