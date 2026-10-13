import fs from 'fs';

const html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');
const lines = html.split('\n');

lines.forEach((l, idx) => {
  if (l.includes('<header') || l.includes('lang=') || l.includes('es">') || l.includes('<!doctype') || l.includes('<html')) {
    console.log(`L${idx + 1}: ${l.slice(0, 90)}`);
  }
});
