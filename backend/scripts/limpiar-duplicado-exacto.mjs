import fs from 'fs';

const html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');
const lines = html.split('\n');

let cutIndex = -1;
for (let i = 2380; i < 2420; i++) {
  if (lines[i] && lines[i].includes('"es">')) {
    cutIndex = i;
    break;
  }
}

if (cutIndex !== -1) {
  const cleanLines = ['<!DOCTYPE html>', '<html lang="es">', ...lines.slice(cutIndex + 1)];
  fs.writeFileSync('Z:/backend/public/index.html', cleanLines.join('\n'), 'utf8');
  console.log('✅ Archivo limpiado. Total de líneas restantes:', cleanLines.length);
} else {
  console.log('❌ No se encontró cutIndex');
}
