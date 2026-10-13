import fs from 'fs';

let html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');

// Eliminar la llave de cierre extra '}' después de toggleVistaLandingApp
const badChunk = `        function toggleVistaLandingApp() {
            if (currentView === 'app') {
                mostrarVista('inicio');
            } else {
                mostrarVista('app');
            }
        }
        }`;

const goodChunk = `        function toggleVistaLandingApp() {
            if (currentView === 'app') {
                mostrarVista('inicio');
            } else {
                mostrarVista('app');
            }
        }`;

html = html.replace(badChunk, goodChunk);
fs.writeFileSync('Z:/backend/public/index.html', html, 'utf8');
console.log('✅ Llave extra eliminada');
