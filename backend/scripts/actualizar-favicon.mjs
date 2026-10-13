import fs from 'fs';

const files = [
  'Z:/backend/public/inicio.html',
  'Z:/backend/public/como-funciona.html',
  'Z:/backend/public/empresas.html',
  'Z:/backend/public/planes.html',
  'Z:/backend/public/index.html'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    if (!c.includes('/assets/favicon.svg')) {
      c = c.replace('<head>', '<head>\n<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">');
      fs.writeFileSync(f, c, 'utf8');
      console.log('Favicon link añadido a:', f);
    } else {
      console.log('Favicon ya configurado en:', f);
    }
  }
});
