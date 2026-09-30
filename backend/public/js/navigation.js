// ==========================================================================
// TRABAJAYA - NAVIGATION & VIEW CONTROLLER
// Control de vistas Landing (Inicio, Acerca, FAQ, Contacto) y Herramientas
// ==========================================================================

let currentView = 'inicio';
let currentTool = localStorage.getItem('tj_active_tool') || 'adaptar';

function mostrarVista(vistaId) {
    currentView = vistaId;
    sessionStorage.setItem('tj_preferred_view', vistaId);

    // Ocultar todos los panes de vista
    document.querySelectorAll('.view-pane').forEach(el => el.classList.remove('active'));
    
    // Desactivar todos los ítems del menú central
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    const targetPane = document.getElementById('view-' + vistaId);
    if (targetPane) targetPane.classList.add('active');

    // Activar el botón correspondiente en la barra superior
    const navBtn = document.getElementById('nav-' + vistaId);
    if (navBtn) navBtn.classList.add('active');

    // Botón de alternar al lado del logo
    const btnToggle = document.getElementById('btnToggleVistaLeft');
    if (btnToggle) {
        if (vistaId === 'app') {
            btnToggle.innerHTML = '← Ver Sitio';
            btnToggle.title = 'Volver al Sitio Informativo';
        } else {
            btnToggle.innerHTML = '⚡ Abrir Herramienta';
            btnToggle.title = 'Ir directo a la plataforma de IA';
        }
    }

    // Scroll arriba suave
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleVistaLandingApp() {
    if (currentView === 'app') {
        mostrarVista('inicio');
    } else {
        irALaHerramienta();
    }
}

function clickLogoBrand() {
    if (currentUser) {
        mostrarVista('app');
    } else {
        mostrarVista('inicio');
    }
}

function irALaHerramienta() {
    if (!currentUser) {
        abrirModal('login');
        return;
    }
    mostrarVista('app');
}

function seleccionarHerramienta(toolId) {
    currentTool = toolId;
    localStorage.setItem('tj_active_tool', toolId);

    // Actualizar tabs
    document.querySelectorAll('.tool-tab-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById('btnTool-' + toolId);
    if (btn) btn.classList.add('active');

    // Actualizar panes
    document.querySelectorAll('.tool-pane').forEach(pane => pane.classList.remove('active'));
    const target = document.getElementById('pane-' + toolId);
    if (target) target.classList.add('active');

    // Si entra a historial, refrescarlo
    if (toolId === 'historial') {
        cargarHistorial();
    }
}

// FAQ Accordion
function toggleFaq(el) {
    el.classList.toggle('open');
}

// Modales Legales
function abrirLegalModal(seccion) {
    document.getElementById('legalModal').style.display = 'flex';
    cambiarTabLegal(seccion);
}

function cerrarLegalModal() {
    document.getElementById('legalModal').style.display = 'none';
}

function cambiarTabLegal(tab) {
    const tabTerminos = document.getElementById('tabLegalTerminos');
    const tabPrivacidad = document.getElementById('tabLegalPrivacidad');
    const contentTerminos = document.getElementById('legalContentTerminos');
    const contentPrivacidad = document.getElementById('legalContentPrivacidad');

    if (tab === 'terminos') {
        tabTerminos.classList.add('active');
        tabPrivacidad.classList.remove('active');
        contentTerminos.style.display = 'block';
        contentPrivacidad.style.display = 'none';
    } else {
        tabPrivacidad.classList.add('active');
        tabTerminos.classList.remove('active');
        contentPrivacidad.style.display = 'block';
        contentTerminos.style.display = 'none';
    }
}
