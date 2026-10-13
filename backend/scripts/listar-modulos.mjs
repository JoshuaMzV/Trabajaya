import fs from 'fs';

const html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');
const lines = html.split('\n');
console.log('Total lines:', lines.length);

lines.forEach((l, idx) => {
  if (l.includes('id="mod-')) {
    console.log(`Line ${idx + 1}: ${l.trim()}`);
  }
});
