// ==========================================================================
// TRABAJAYA - AUTHENTICATION & USER MANAGEMENT
// Manejo de tokens JWT, login, registro, logout y menú de perfil
// ==========================================================================

let currentUser = null;

// Verificación de sesión al recargar página
async function checkSession() {
    const token = localStorage.getItem('tj_token');
    if (!token) {
        renderUnauth();
        return;
    }
    try {
        const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        if (res.ok && data.user) {
            currentUser = data.user;
            renderAuthUser(currentUser);
            
            // Al recargar estando logeado: entrar directo a la herramienta
            const savedView = sessionStorage.getItem('tj_preferred_view');
            if (savedView && ['acerca', 'faq', 'contacto'].includes(savedView)) {
                mostrarVista(savedView);
            } else {
                mostrarVista('app');
            }
        } else {
            renderUnauth();
        }
    } catch (err) {
        renderUnauth();
    }
}

function renderUnauth() {
    currentUser = null;
    document.getElementById('navUnauth').style.display = 'flex';
    document.getElementById('navAuth').style.display = 'none';
    document.getElementById('supportFabBtn').classList.remove('vip-mode');
    document.getElementById('flyoutTicketTab').style.display = 'none';
    document.getElementById('flyoutProBanner').style.display = 'block';
    
    // Si la vista actual es la app pero no está logeado, mostrar inicio
    if (currentView === 'app') {
        mostrarVista('inicio');
    }
}

function renderAuthUser(user) {
    document.getElementById('navUnauth').style.display = 'none';
    document.getElementById('navAuth').style.display = 'flex';

    // Actualizar nombre y plan en el pill
    document.getElementById('userNameDisplay').textContent = user.nombre || user.email.split('@')[0];
    document.getElementById('userAvatarDisplay').textContent = (user.nombre || user.email)[0].toUpperCase();
    
    // Actualizar datos del menú desplegable (Dropdown)
    const ddName = document.getElementById('userDdName');
    const ddEmail = document.getElementById('userDdEmail');
    if (ddName) ddName.textContent = user.nombre || user.email.split('@')[0];
    if (ddEmail) ddEmail.textContent = user.email;

    // Mostrar/ocultar botón de borrar expediente según tenga o no
    const btnDdBorrar = document.getElementById('btnDdBorrarExpediente');
    if (btnDdBorrar) {
        btnDdBorrar.style.display = user.perfil_maestro ? 'flex' : 'none';
    }

    const planTag = document.getElementById('userPlanTag');
    if (user.plan === 'pro') {
        planTag.className = 'user-plan-tag pro';
        planTag.textContent = 'PRO';
        document.getElementById('supportFabBtn').classList.add('vip-mode');
        document.getElementById('flyoutTicketTab').style.display = 'block';
        document.getElementById('flyoutProBanner').style.display = 'none';
    } else {
        planTag.className = 'user-plan-tag free';
        planTag.textContent = 'GRATIS';
        document.getElementById('supportFabBtn').classList.remove('vip-mode');
        document.getElementById('flyoutTicketTab').style.display = 'none';
        document.getElementById('flyoutProBanner').style.display = 'block';
    }

    // Monedas
    const coins = user.monedas !== undefined ? user.monedas : 2;
    document.getElementById('coinCount').textContent = coins;
    const dashCoins = document.getElementById('dashCoinsDisplay');
    if (dashCoins) dashCoins.textContent = coins;

    // Actualizar estado del Expediente Maestro
    actualizarVistaExpediente();
}

// Alternar apertura del menú desplegable de usuario
function toggleUserDropdown(e) {
    if (e) e.stopPropagation();
    const dd = document.getElementById('userDropdownMenu');
    if (!dd) return;
    const isShowing = dd.style.display === 'block';
    dd.style.display = isShowing ? 'none' : 'block';
}

// Modales de Autenticación
function abrirModal(tab) {
    document.getElementById('authModal').style.display = 'flex';
    cambiarTabModal(tab);
}

function cerrarModal() {
    document.getElementById('authModal').style.display = 'none';
}

function cambiarTabModal(tab) {
    const isLogin = tab === 'login';
    document.getElementById('tabLogin').classList.toggle('active', isLogin);
    document.getElementById('tabRegister').classList.toggle('active', !isLogin);
    document.getElementById('nombreGroup').style.display = isLogin ? 'none' : 'block';
    document.getElementById('authBtnSubmit').textContent = isLogin ? 'Ingresar a TrabajaYa' : 'Crear Cuenta';
    document.getElementById('modalFooterText').innerHTML = isLogin
        ? '¿No tienes cuenta? <a href="#" onclick="cambiarTabModal(\'register\'); return false;" style="color: var(--accent); font-weight: 700;">Regístrate gratis</a>'
        : '¿Ya tienes cuenta? <a href="#" onclick="cambiarTabModal(\'login\'); return false;" style="color: var(--accent); font-weight: 700;">Inicia sesión</a>';
}

// Iniciar sesión con la cuenta de Demostración VIP
async function iniciarDemoVIP() {
    document.getElementById('authEmail').value = 'demo@trabajaya.lat';
    document.getElementById('authPassword').value = 'demo123';
    
    // Si estaba en la pestaña de registro, cambiarla a login
    cambiarTabModal('login');

    // Despachar el evento submit
    const authForm = document.getElementById('authForm');
    authForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
}

async function enviarAuthForm(e) {
    e.preventDefault();
    const isLogin = document.getElementById('tabLogin').classList.contains('active');
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    const nombre = document.getElementById('authNombre').value.trim();

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { email, password, nombre };

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error en autenticación');

        localStorage.setItem('tj_token', data.token);
        currentUser = data.user;
        renderAuthUser(currentUser);
        cerrarModal();

        // Al iniciar sesión, dirigir inmediatamente a la herramienta
        mostrarVista('app');
    } catch (err) {
        alert(err.message);
    }
}

function cerrarSesion() {
    localStorage.removeItem('tj_token');
    renderUnauth();
    // Cerrar el dropdown si estuviera abierto
    const dd = document.getElementById('userDropdownMenu');
    if (dd) dd.style.display = 'none';
    mostrarVista('inicio');
}
