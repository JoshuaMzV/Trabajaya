// ==========================================================================
// TRABAJAYA - MAIN CONTROLLER & EXTRA MODULES
// Simulador de entrevistas, historial, compras/packs, tickets y eventos globales
// ==========================================================================

function guardarRespuestaPractica() {
    alert('✓ Respuesta registrada para tu simulación.');
}

async function generarSimulacionEntrevista() {
    if (!currentUser) return abrirModal('login');

    const puesto = document.getElementById('simPuestoInput').value.trim();
    if (!puesto) {
        alert('Por favor indica el puesto al que aspiras para generar preguntas a tu medida.');
        return;
    }

    const container = document.getElementById('interviewQuestionsList');
    container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-muted);">⚡ Generando simulación interactiva con IA...</div>';

    try {
        const token = localStorage.getItem('tj_token');
        const res = await fetch('/api/interview/start', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ jobTitle: puesto, questionsCount: 3 })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al iniciar simulación');

        if (data.questions && data.questions.length > 0) {
            container.innerHTML = data.questions.map((q, idx) => `
                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem;">
                    <div style="font-weight: 700; font-size: 0.92rem; color: #fff; margin-bottom: 0.5rem;">
                        ${idx + 1}. ${q.pregunta}
                    </div>
                    <p style="font-size: 0.78rem; color: var(--accent); margin-bottom: 0.85rem;">
                        <strong>Enfoque evaluado:</strong> ${q.enfoque || 'Competencia técnica o conductual'}
                    </p>
                    <textarea class="form-input" placeholder="Escribe tu respuesta aquí como si estuvieras en la entrevista..." rows="3"></textarea>
                    <div style="display: flex; justify-content: flex-end; margin-top: 0.5rem;">
                        <button class="btn-auth-outline" style="font-size: 0.75rem; padding: 0.3rem 0.7rem;" onclick="guardarRespuestaPractica()">Guardar Respuesta</button>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        container.innerHTML = '<div style="color: #f87171; padding: 1rem;">Error: ' + err.message + '</div>';
    }
}

async function cargarHistorial() {
    if (!currentUser) return;
    const container = document.getElementById('historialListContainer');
    container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-muted);">Cargando historial...</div>';

    try {
        const token = localStorage.getItem('tj_token');
        const res = await fetch('/api/history', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();

        if (data.history && data.history.length > 0) {
            container.innerHTML = data.history.map(item => `
                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: 12px; padding: 1rem; margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: 700; font-size: 0.92rem; color: #fff;">${item.puesto_oferta || 'Adaptación de CV'}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${new Date(item.created_at).toLocaleDateString()} • Match ATS: ${item.match_score || 85}%</div>
                    </div>
                    <span style="background: rgba(99, 102, 241, 0.15); color: #a5b4fc; font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 6px;">COMPLETADO</span>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-muted);">Aún no tienes postulaciones registradas en tu historial.</div>';
        }
    } catch (err) {
        container.innerHTML = '<div style="color: #f87171; padding: 1rem;">Error al cargar historial.</div>';
    }
}

// Mesa de Ayuda y Tickets
function toggleSupportFlyout() {
    const flyout = document.getElementById('supportFlyout');
    const isShowing = flyout.style.display === 'flex';
    flyout.style.display = isShowing ? 'none' : 'flex';

    if (!isShowing) {
        const isPro = currentUser && currentUser.plan === 'pro';
        const flyoutTab = document.getElementById('flyoutTicketTab');
        const banner = document.getElementById('flyoutProBanner');
        if (isPro) {
            flyoutTab.style.display = 'block';
            banner.style.display = 'none';
        } else {
            flyoutTab.style.display = 'none';
            banner.style.display = 'block';
        }
    }
}

function cerrarFlyoutYLogin() {
    toggleSupportFlyout();
    abrirModal('login');
}

async function enviarTicketFlyout(e) {
    e.preventDefault();
    if (!currentUser) return abrirModal('login');

    const asunto = document.getElementById('flyoutAsunto').value.trim();
    const mensaje = document.getElementById('flyoutMensaje').value.trim();
    if (!asunto || !mensaje) return alert('Por favor llena todos los campos del ticket.');

    try {
        const token = localStorage.getItem('tj_token');
        const res = await fetch('/api/tickets', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ asunto, mensaje, esVip: currentUser.plan === 'pro' })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al enviar ticket');

        alert('✓ Ticket #' + data.ticket.id + ' generado con éxito. Nuestro equipo te responderá a ' + currentUser.email);
        document.getElementById('flyoutAsunto').value = '';
        document.getElementById('flyoutMensaje').value = '';
        toggleSupportFlyout();
    } catch (err) {
        alert(err.message);
    }
}

// Modal de Packs y Compras
function abrirModalPacks() {
    document.getElementById('packsModal').style.display = 'flex';
}

function cerrarModalPacks() {
    document.getElementById('packsModal').style.display = 'none';
}

async function comprarCoinsApp(pack, precio) {
    if (!currentUser) {
        cerrarModalPacks();
        abrirModal('login');
        return;
    }
    const token = localStorage.getItem('tj_token');
    try {
        const res = await fetch('/api/billing/buy-coins', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pack })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error en compra');

        currentUser.monedas = data.monedas;
        renderAuthUser(currentUser);
        cerrarModalPacks();
        alert('🎉 ¡Compra simulada con éxito! Has adquirido ' + (pack === 'pack_5' ? '5' : '15') + ' Monedas de Talento.');
    } catch (err) {
        alert(err.message);
    }
}

async function activarProApp() {
    if (!currentUser) {
        cerrarModalPacks();
        abrirModal('login');
        return;
    }
    const token = localStorage.getItem('tj_token');
    try {
        const res = await fetch('/api/billing/subscribe-pro', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al activar PRO');

        currentUser.plan = 'pro';
        currentUser.monedas = data.monedas;
        renderAuthUser(currentUser);
        cerrarModalPacks();
        alert('👑 ¡Felicidades! Tu cuenta ha sido elevada a PRO. Monedas ilimitadas y soporte VIP activados.');
    } catch (err) {
        alert(err.message);
    }
}

function gestionarCompraInicio(pack, precio) {
    if (!currentUser) {
        abrirModal('login');
    } else {
        comprarCoinsApp(pack, precio);
    }
}

function gestionarProInicio() {
    if (!currentUser) {
        abrirModal('login');
    } else {
        activarProApp();
    }
}

function enviarMensajeContacto(e) {
    e.preventDefault();
    alert('✓ Gracias por tu mensaje. Nos pondremos en contacto contigo a la brevedad.');
    e.target.reset();
}

// Escuchador global de clics para cerrar modales y dropdowns
window.addEventListener('click', (e) => {
    const legal = document.getElementById('legalModal');
    const auth = document.getElementById('authModal');
    const packs = document.getElementById('packsModal');
    const flyout = document.getElementById('supportFlyout');
    const fab = document.getElementById('supportFabBtn');
    const userDropdown = document.getElementById('userDropdownMenu');

    if (e.target === legal) cerrarLegalModal();
    if (e.target === auth) cerrarModal();
    if (e.target === packs) cerrarModalPacks();

    // Cerrar menú dropdown de usuario al hacer clic fuera
    if (userDropdown && userDropdown.style.display === 'block') {
        const userPill = document.querySelector('.user-pill');
        if (!userDropdown.contains(e.target) && (!userPill || !userPill.contains(e.target))) {
            userDropdown.style.display = 'none';
        }
    }

    // Cerrar el flyout de tickets si se hace clic afuera de él y afuera del botón flotante
    if (flyout && flyout.style.display === 'flex') {
        if (!flyout.contains(e.target) && !fab.contains(e.target)) {
            flyout.style.display = 'none';
        }
    }
});

// Inicialización de la aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
});
