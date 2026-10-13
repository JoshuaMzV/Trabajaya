import fs from 'fs';

let html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');

// 1. Quitar el límite de ancho (max-width: 1280px y padding) de .app-viewport cuando estamos en modo app
// En el CSS agregamos que vista-app se extienda a pantalla completa real 100vw y 0 margin:
const oldViewportCss = `.app-viewport {
            flex: 1;
            position: relative;
            z-index: 10;
            padding: 1.5rem 1.25rem 3.5rem;
            max-width: 1280px;
            margin: 0 auto;
            width: 100%;
        }`;

const newViewportCss = `.app-viewport {
            flex: 1;
            position: relative;
            z-index: 10;
            width: 100%;
            margin: 0 auto;
        }
        body.app-mode .app-viewport {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
        }
        body:not(.app-mode) .app-viewport {
            max-width: 1280px;
            padding: 1.5rem 1.25rem 3.5rem;
        }`;

html = html.replace(oldViewportCss, newViewportCss);

// 2. Modificar mostrarVista(vistaId) para:
//    - Ocultar COMPLETAMENTE el footer cuando vistaId === 'app'
//    - Ocultar COMPLETAMENTE el botón flotante de soporte (#supportWidgetWrapper)
//    - Asegurar que la barra superior tenga el botón de "🌐 Ver Sitio"
//    - Activar/desactivar la clase body.app-mode
const oldMostrarVistaLogic = `            if (vistaId === 'app') {
                const headerEl = document.querySelector('header');
                if (headerEl) headerEl.style.display = 'none'; // La app tiene su propia barra y menú lateral completo a pantalla completa
                const supportWidget = document.getElementById('supportWidgetWrapper');
                if (supportWidget) supportWidget.style.display = 'none'; // Quitar widget flotante VIP de la esquina como pidió el usuario
                publicNav.style.display = 'none';
                toolSelector.style.display = 'flex';
                if (btnToggleLeft) btnToggleLeft.innerText = '🌐 Ver Sitio';
                const defaultTool = (currentUser && currentUser.rol === 'reclutador') ? 'reclutador-vacantes' : 'muro';
                seleccionarHerramienta(currentTool || defaultTool);
            } else {
                const headerEl = document.querySelector('header');
                if (headerEl) headerEl.style.display = 'block';
                publicNav.style.display = 'flex';
                toolSelector.style.display = 'none';
                if (btnToggleLeft) btnToggleLeft.innerText = '🚀 Herramienta';
            }`;

const newMostrarVistaLogic = `            const footerEl = document.querySelector('footer');
            const headerEl = document.querySelector('header');
            const supportWidget = document.getElementById('supportWidgetWrapper');

            if (vistaId === 'app') {
                document.body.classList.add('app-mode');
                // Mantener header superior limpio donde está "🌐 Ver Sitio"
                if (headerEl) headerEl.style.display = 'block';
                if (btnToggleLeft) {
                    btnToggleLeft.style.display = 'inline-flex';
                    btnToggleLeft.innerText = '🌐 Ver Sitio';
                }
                publicNav.style.display = 'none';
                toolSelector.style.display = 'none'; // No repetimos los botones que ya están en el menú lateral de los wireframes

                // Quitar footer por completo en modo herramienta
                if (footerEl) footerEl.style.display = 'none';
                // Quitar botón flotante de soporte VIP de la esquina
                if (supportWidget) supportWidget.style.display = 'none';

                const defaultTool = (currentUser && currentUser.rol === 'reclutador') ? 'reclutador-vacantes' : 'muro';
                seleccionarHerramienta(currentTool || defaultTool);
            } else {
                document.body.classList.remove('app-mode');
                if (headerEl) headerEl.style.display = 'block';
                publicNav.style.display = 'flex';
                toolSelector.style.display = 'none';
                if (btnToggleLeft) {
                    btnToggleLeft.style.display = 'inline-flex';
                    btnToggleLeft.innerText = '🚀 Herramienta';
                }

                // Mostrar footer oficial en landing y vistas públicas
                if (footerEl) footerEl.style.display = 'block';
                if (supportWidget) supportWidget.style.display = 'none';
            }`;

html = html.replace(oldMostrarVistaLogic, newMostrarVistaLogic);

// 3. Asegurar que .btn-nav-toggle-left se muestre siempre
html = html.replace('.btn-nav-toggle-left {\n            display: none;', '.btn-nav-toggle-left {\n            display: inline-flex;');

fs.writeFileSync('Z:/backend/public/index.html', html, 'utf8');
console.log('✅ index.html adaptado: Pantalla completa sin márgenes laterales en app, sin footer en app, sin botón de soporte VIP flotante, y con botón "Ver Sitio" activo en la barra superior.');
