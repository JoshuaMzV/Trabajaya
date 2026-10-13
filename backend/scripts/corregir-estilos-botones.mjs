import fs from 'fs';

let html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');

// Eliminar el style duplicado que provocaba que los navegadores ignoraran el estilo del diseño
html = html.replace(
  'style="cursor:pointer" aria-current="page" style="',
  'aria-current="page" style="cursor:pointer; '
);

html = html.replace(
  'style="cursor:pointer" style="min-height: 44px; padding: 0 22px; display: flex; align-items: center; border-radius: 999px; color: #4B3B6B;',
  'style="cursor:pointer; min-height: 44px; padding: 0 22px; display: flex; align-items: center; border-radius: 999px; color: #4B3B6B;'
);

html = html.replace(
  'style="cursor:pointer" style="min-height: 44px; padding: 0 22px; display: flex; align-items: center; border-radius: 999px; color: #4B3B6B;',
  'style="cursor:pointer; min-height: 44px; padding: 0 22px; display: flex; align-items: center; border-radius: 999px; color: #4B3B6B;'
);

html = html.replace(
  'style="cursor:pointer" aria-current="page" style="min-height: 44px; padding: 0 22px; display: flex; align-items: center; border-radius: 999px; background: #23153C;',
  'aria-current="page" style="cursor:pointer; min-height: 44px; padding: 0 22px; display: flex; align-items: center; border-radius: 999px; background: #23153C;'
);

fs.writeFileSync('Z:/backend/public/index.html', html, 'utf8');
console.log('Botones de rol corregidos con estilos oficiales');
