import fs from 'fs';

const html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('function seleccionarHerramienta')) {
    console.log(lines.slice(i, i + 25).join('\n'));
  }
});
