import fs from 'fs';

let html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');

// Reemplazar la función mostrarVista completa con una versión limpia y sin errores de sintaxis
const cleanMostrarVista = `        // VISTAS PRINCIPALES (SPA)
        // ==========================================
        function mostrarVista(vistaId) {
            const footerEl = document.getElementById('globalFooter');
            const btnToggleLeft = document.getElementById('txtBtnToggleVista');
            const publicNav = document.getElementById('publicNavMenu');
            const toolSelector = document.getElementById('appToolSelector');
            const headerEl = document.querySelector('header');

            if (vistaId === 'app' && !currentUser) {
                abrirModal('login');
                return;
            }

            // Normalizar si se pide ver sitio
            if (vistaId === 'inicio' || vistaId === 'landing') vistaId = 'inicio';

            document.querySelectorAll('.view-pane').forEach(el => el.classList.remove('active-pane'));
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

            const targetPane = document.getElementById('vista-' + vistaId);
            const targetNav = document.getElementById('nav-' + vistaId);

            if (targetPane) targetPane.classList.add('active-pane');
            if (targetNav) targetNav.classList.add('active');

            currentView = vistaId;
            sessionStorage.setItem('tj_preferred_view', vistaId);
            window.scrollTo({ top: 0, behavior: 'smooth' });

            if (vistaId === 'app') {
                if (btnToggleLeft) btnToggleLeft.innerText = '🌐 Ver Sitio';
                if (footerEl) footerEl.style.display = 'none';
                if (headerEl) headerEl.style.display = 'block';
                if (publicNav) publicNav.style.display = 'none';
                if (toolSelector) toolSelector.style.display = 'none';

                const defaultTool = (currentUser && currentUser.rol === 'reclutador') ? 'reclutador-vacantes' : 'muro';
                seleccionarHerramienta(currentTool || defaultTool);
            } else {
                if (btnToggleLeft) btnToggleLeft.innerText = '🚀 Herramienta';
                if (footerEl) footerEl.style.display = 'block';
                if (headerEl) headerEl.style.display = 'block';
                if (publicNav) publicNav.style.display = 'flex';
                if (toolSelector) toolSelector.style.display = 'none';
            }

            if (vistaId === 'faq') {
                initFaq();
            }
        }`;

// Localizar inicio y fin de mostrarVista
const startIdx = html.indexOf('function mostrarVista(vistaId) {');
const endIdx = html.indexOf('function toggleVistaLandingApp()');

if (startIdx !== -1 && endIdx !== -1) {
  html = html.slice(0, startIdx) + cleanMostrarVista + '\n\n        ' + html.slice(endIdx);
  fs.writeFileSync('Z:/backend/public/index.html', html, 'utf8');
  console.log('✅ mostrarVista limpiada y corregida al 100%');
} else {
  console.log('❌ No se encontró rango para mostrarVista');
}
