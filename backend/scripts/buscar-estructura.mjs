import fs from 'fs';

const html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');
const lines = html.split('\n');

lines.forEach((l, idx) => {
  if (l.includes('<main') || l.includes('</main>') || l.includes('<footer') || l.includes('supportWidgetWrapper')) {
    console.log(`L${idx + 1}: ${l.trim()}`);
  }
});
