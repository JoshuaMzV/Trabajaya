import fs from 'fs';

let html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');

// Eliminar la declaración duplicada de footerEl
const duplicateBlock = `            const footerEl = document.getElementById('globalFooter');
            if (footerEl) {
                footerEl.style.display = (vistaId === 'app') ? 'none' : 'block';
            }`;

html = html.replace(duplicateBlock, '');

fs.writeFileSync('Z:/backend/public/index.html', html, 'utf8');
console.log('✅ footerEl duplicado eliminado');
