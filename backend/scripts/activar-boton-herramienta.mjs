import fs from 'fs';

let html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');

// 1. Asegurar que en el navbar superior SIEMPRE aparezca el botón "🚀 Herramienta" cuando estás en la landing
// y "🌐 Ver Sitio" cuando estás en la herramienta, para que puedas entrar con un solo clic:
const oldBtn = `<button class="btn-nav-toggle-left" id="btnToggleVistaLeft" onclick="toggleVistaLandingApp()">
                    <span id="txtBtnToggleVista">🌐 Ver Sitio</span>
                </button>`;

const newBtn = `<button class="btn-nav-toggle-left" id="btnToggleVistaLeft" onclick="toggleVistaLandingApp()" style="display: inline-flex !important; align-items: center; gap: 6px; padding: 7px 16px; border-radius: 999px; border: 1px solid #CFC4F0; background: #FFFFFF; font-weight: 700; font-size: 14px; color: #23153C; cursor: pointer; box-shadow: 0 2px 6px rgba(35,21,60,0.08); margin-left: 12px;">
                    <span id="txtBtnToggleVista">🚀 Herramienta</span>
                </button>`;

html = html.replace(/<button class="btn-nav-toggle-left" id="btnToggleVistaLeft"[\s\S]*?<\/button>/, newBtn);

// 2. Modificar toggleVistaLandingApp para que funcione directamente:
const toggleFunc = `
        function toggleVistaLandingApp() {
            if (currentView === 'app') {
                mostrarVista('inicio');
            } else {
                mostrarVista('app');
            }
        }
`;

html = html.replace(/function toggleVistaLandingApp\(\)[\s\S]*?\}\n/, toggleFunc);

// 3. Ajustar mostrarVista para actualizar el texto del botón y mostrar el footer solo en landing
const oldMostrar = "function mostrarVista(vistaId) {";
const updateMostrar = `function mostrarVista(vistaId) {
            const footerEl = document.getElementById('globalFooter');
            const btnToggleLeft = document.getElementById('txtBtnToggleVista');

            if (vistaId === 'app') {
                if (btnToggleLeft) btnToggleLeft.innerText = '🌐 Ver Sitio';
                if (footerEl) footerEl.style.display = 'none';
            } else {
                if (btnToggleLeft) btnToggleLeft.innerText = '🚀 Herramienta';
                if (footerEl) footerEl.style.display = 'block';
            }
`;

html = html.replace(oldMostrar, updateMostrar);

fs.writeFileSync('Z:/backend/public/index.html', html, 'utf8');
console.log('✅ Botón de cambio de vista restablecido y visible en la barra superior');
