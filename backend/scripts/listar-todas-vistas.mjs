import fs from 'fs';

const html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');
const lines = html.split('\n');

lines.forEach((l, idx) => {
  if (l.includes('id="vista-')) {
    console.log(`L${idx+1}: ${l.trim()}`);
  }
});
