import fs from 'fs';

const html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');
const lines = html.split('\n');

lines.forEach((l, idx) => {
  if (l.includes('vista-app')) {
    console.log(`L${idx + 1}: ${l}`);
    for (let j = 1; j <= 5; j++) {
      console.log(`  +${j}: ${lines[idx + j]}`);
    }
  }
});
