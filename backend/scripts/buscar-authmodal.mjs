import fs from 'fs';

const html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');
const lines = html.split('\n');

for (let i = 1935; i < lines.length; i++) {
  if (lines[i].includes('MODAL DE AUTENTICACIÓN') || lines[i].includes('id="authModal"')) {
    console.log(`L${i + 1}: ${lines[i]}`);
    console.log(`  prev 3:`, lines.slice(i - 3, i));
    break;
  }
}
