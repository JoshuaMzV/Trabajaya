// ==========================================================================
// TRABAJAYA - EXPEDIENTE MAESTRO PERMANENTE
// Subida multimodal con Gemini 3.6 OCR, visualización y gestión de perfil base
// ==========================================================================

function mostrarNombreMaster(input) {
    if (input.files && input.files[0]) {
        document.getElementById('masterFileNameDisplay').textContent = '📄 ' + input.files[0].name;
    }
}

function actualizarVistaExpediente() {
    const estadoVacio = document.getElementById('masterEstadoVacio');
    const estadoCargado = document.getElementById('masterEstadoCargado');
    const bannerAlerta = document.getElementById('masterWarningBanner');
    const previewContainer = document.getElementById('masterPerfilPreview');
    const statusPill = document.getElementById('masterStatusPill');

    const tieneExpediente = !!(currentUser && currentUser.perfil_maestro);

    if (tieneExpediente) {
        if (estadoVacio) estadoVacio.style.display = 'none';
        if (estadoCargado) estadoCargado.style.display = 'block';
        if (bannerAlerta) bannerAlerta.style.display = 'none';

        if (statusPill) {
            statusPill.innerHTML = '🟢 Expediente Maestro Activo';
            statusPill.style.color = '#34d399';
            statusPill.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        }

        // Renderizar un resumen elegante del perfil maestro
        const perfil = currentUser.perfil_maestro;
        if (previewContainer) {
            previewContainer.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.75rem;">
                    <div>
                        <h4 style="font-size: 1.15rem; color: #fff; font-weight: 700;">${perfil.nombre || 'Perfil Profesional'}</h4>
                        <p style="font-size: 0.82rem; color: var(--accent); font-weight: 600;">${perfil.titulo || 'Profesional'} • ${perfil.email || currentUser.email}</p>
                    </div>
                    <span style="background: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 0.72rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 9999px;">GUARDADO EN BD</span>
                </div>
                ${perfil.resumen ? `<p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1rem;">${perfil.resumen}</p>` : ''}
                
                ${perfil.habilidades && perfil.habilidades.length ? `
                    <div style="margin-bottom: 1rem;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: #cbd5e1; text-transform: uppercase;">Competencias Clave:</span>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.4rem;">
                            ${perfil.habilidades.slice(0, 15).map(h => `<span style="background: rgba(255,255,255,0.06); border: 1px solid var(--border); font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 6px; color: #e2e8f0;">${h}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}

                ${perfil.experiencia && perfil.experiencia.length ? `
                    <div>
                        <span style="font-size: 0.75rem; font-weight: 700; color: #cbd5e1; text-transform: uppercase;">Experiencia Registrada:</span>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.4rem;">
                            ${perfil.experiencia.slice(0, 3).map(exp => `
                                <div style="background: rgba(255,255,255,0.02); border-left: 3px solid var(--accent); padding: 0.4rem 0.75rem; border-radius: 4px;">
                                    <strong style="font-size: 0.82rem; color: #fff;">${exp.puesto || 'Puesto'}</strong>
                                    <span style="font-size: 0.75rem; color: var(--text-muted);"> — ${exp.empresa || ''} (${exp.periodo || ''})</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            `;
        }
    } else {
        if (estadoVacio) estadoVacio.style.display = 'block';
        if (estadoCargado) estadoCargado.style.display = 'none';
        if (bannerAlerta) bannerAlerta.style.display = 'flex';

        if (statusPill) {
            statusPill.innerHTML = '⚠️ Sin Expediente Guardado';
            statusPill.style.color = '#fbbf24';
            statusPill.style.borderColor = 'rgba(245, 158, 11, 0.3)';
        }
    }
}

async function guardarPerfilMaestro(e) {
    e.preventDefault();
    if (!currentUser) return abrirModal('login');

    const fileInput = document.getElementById('masterFileInput');
    const rawText = document.getElementById('masterRawText').value.trim();

    if ((!fileInput.files || !fileInput.files[0]) && !rawText) {
        alert('Por favor selecciona tu archivo PDF de CV o pega tu trayectoria laboral.');
        return;
    }

    const btn = document.getElementById('btnGuardarMaster');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '⚡ Analizando y digitalizando con IA...';

    const formData = new FormData();
    if (fileInput.files && fileInput.files[0]) {
        formData.append('cvFile', fileInput.files[0]);
    }
    if (rawText) {
        formData.append('rawText', rawText);
    }

    try {
        const token = localStorage.getItem('tj_token');
        const res = await fetch('/api/cv/master', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            body: formData
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al procesar tu expediente maestro');

        currentUser.perfil_maestro = data.perfil;
        actualizarVistaExpediente();
        alert('¡Éxito! Tu Expediente Maestro ha sido digitalizado y guardado permanentemente.');
        
        // Redirigir a Adaptar CV
        seleccionarHerramienta('adaptar');
    } catch (err) {
        alert(err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// Borrar permanentemente el Expediente Maestro
async function confirmarBorrarExpediente() {
    if (!currentUser || !currentUser.perfil_maestro) return;

    const confirmar = confirm('¿Estás seguro de que deseas eliminar tu Expediente Maestro permanente?\n\nTendrás que subir tu CV nuevamente para poder adaptar postulaciones.');
    if (!confirmar) return;

    try {
        const token = localStorage.getItem('tj_token');
        const res = await fetch('/api/cv/master', {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'No se pudo eliminar el expediente');

        currentUser.perfil_maestro = null;
        actualizarVistaExpediente();

        // Ocultar botón en el dropdown
        const btnDdBorrar = document.getElementById('btnDdBorrarExpediente');
        if (btnDdBorrar) btnDdBorrar.style.display = 'none';

        // Cerrar menú si está abierto
        const dd = document.getElementById('userDropdownMenu');
        if (dd) dd.style.display = 'none';

        alert('Expediente Maestro eliminado correctamente.');
        seleccionarHerramienta('expediente');
    } catch (err) {
        alert('Error: ' + err.message);
    }
}
