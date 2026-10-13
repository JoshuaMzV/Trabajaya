import fs from 'fs';

const html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');
const lines = html.split('\n');

for (let i = 2450; i < 2600; i++) {
  if (lines[i] && lines[i].includes('</section>')) {
    console.log(`L${i + 1}: ${lines[i]}`);
    console.log(`  prev: ${lines[i - 1]}`);
    console.log(`  next: ${lines[i + 1]}`);
  }
}
