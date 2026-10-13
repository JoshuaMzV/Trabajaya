import fs from 'fs';

const html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');
const lines = html.split('\n');

for (let i = 2390; i < lines.length; i++) {
  if (lines[i].includes('id="vista-') || lines[i].includes('<footer') || lines[i].includes('id="authModal"')) {
    console.log(`L${i+1}: ${lines[i].trim()}`);
  }
}
