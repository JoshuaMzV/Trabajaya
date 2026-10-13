import fs from 'fs';

let html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');

// 1. Eliminar completamente el elemento HTML del botón flotante #supportWidgetWrapper
const fabStart = html.indexOf('<div id="supportWidgetWrapper"');
const fabEnd = html.indexOf('</div>\n    </div>\n    </div>', fabStart) + '</div>\n    </div>\n    </div>'.length;
if (fabStart !== -1 && fabEnd !== -1) {
  html = html.slice(0, fabStart) + html.slice(fabEnd);
  console.log('✅ Elemento #supportWidgetWrapper eliminado físicamente del DOM.');
} else {
  // Intentar regex
  html = html.replace(/<div id="supportWidgetWrapper"[\s\S]*?<!-- Modal de Autenticación/i, '<!-- Modal de Autenticación');
  console.log('✅ Elemento #supportWidgetWrapper removido vía fallback.');
}

// 2. Limpiar todas las llamadas JS que intenten mostrar #supportWidgetWrapper
html = html.replace(/document\.getElementById\('supportWidgetWrapper'\)\.style\.display = [^;]+;/g, '');
html = html.replace(/const supportWidget = document\.getElementById\('supportWidgetWrapper'\);[\s\S]*?if \(supportWidget\)[\s\S]*?\}/g, '');

// 3. Quitar max-width forzado en main.app-viewport para que los wireframes ocupen toda la pantalla de orilla a orilla
html = html.replace(/max-width:\s*1280px;/g, 'max-width: 100%;');
html = html.replace(/padding:\s*1\.5rem 1\.25rem 3\.5rem;/g, 'padding: 0;');

// 4. Asegurarse de que el footer NUNCA se muestre si la vista activa es 'app'
// Localizamos el tag <footer> y le ponemos un id="globalFooter"
html = html.replace('<footer style="', '<footer id="globalFooter" style="');

// En mostrarVista, aseguramos que globalFooter se oculte en 'app'
const findMostrarVista = 'function mostrarVista(vistaId) {';
const fixFooterLogic = `function mostrarVista(vistaId) {
            const footerEl = document.getElementById('globalFooter');
            if (footerEl) {
                footerEl.style.display = (vistaId === 'app') ? 'none' : 'block';
            }
`;
html = html.replace(findMostrarVista, fixFooterLogic);

// 5. Garantizar que en la barra superior el botón "🌐 Ver Sitio" (cuando está en la app) y "🚀 Herramienta" (cuando está en la landing) esté siempre visible y funcional
const btnToggleBlock = `
                <!-- Botón de cambio rápido: Ver Sitio / Herramienta -->
                <button class="btn-nav-toggle-left" id="btnToggleVistaLeft" onclick="toggleVistaLandingApp()" style="display: inline-flex !important; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 999px; border: 1px solid #CFC4F0; background: #FFFFFF; font-weight: 700; font-size: 14px; color: #23153C; cursor: pointer; box-shadow: 0 2px 5px rgba(35,21,60,0.06);">
                    <span id="txtBtnToggleVista">🌐 Ver Sitio</span>
                </button>
`;

// Reemplazar la definición de btnToggleVistaLeft
html = html.replace(/<button class="btn-nav-toggle-left" id="btnToggleVistaLeft"[\s\S]*?<\/button>/, btnToggleBlock.trim());

// 6. Eliminar el navbar intermedio que se repetía en el header (#appToolSelector) para que no ocupe espacio arriba
const hideAppToolSelectorCss = `
        #appToolSelector { display: none !important; }
`;
html = html.replace('/* VIEWPORT & PANES */', hideAppToolSelectorCss + '\n        /* VIEWPORT & PANES */');

fs.writeFileSync('Z:/backend/public/index.html', html, 'utf8');
console.log('✅ Cambios aplicados con éxito en index.html');
