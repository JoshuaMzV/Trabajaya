import fs from 'fs';

const html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');
const lines = html.split('\n');

for (let i = 2400; i < 2675; i++) {
  if (lines[i].includes('id="mod-') || lines[i].includes('class="module-pane') || lines[i].includes('supportWidgetWrapper')) {
    console.log(`L${i + 1}: ${lines[i].trim()}`);
  }
}
