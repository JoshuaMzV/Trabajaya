// ==========================================================================
// TRABAJAYA - ADAPTADOR ATS & ESTILOS DE CV
// Personalización semántica de currículum contra ofertas de empleo y análisis de brechas
// ==========================================================================

let selectedStyleFormat = 'ats';

// Selección de estilo visual (ATS vs Formal)
function selectStyleOption(style) {
    selectedStyleFormat = style;
    document.querySelectorAll('.style-card-option').forEach(el => el.classList.remove('selected'));
    const selectedCard = document.getElementById('styleCard-' + style);
    if (selectedCard) selectedCard.classList.add('selected');
}

// Ejecutar Adaptación de CV con IA
async function ejecutarAdaptacionCv(e) {
    e.preventDefault();
    if (!currentUser) return abrirModal('login');

    // Validar que tenga expediente maestro
    if (!currentUser.perfil_maestro) {
        alert('⚠️ Primero debes guardar tu Expediente Maestro permanente en el sistema.');
        seleccionarHerramienta('expediente');
        return;
    }

    const jobDesc = document.getElementById('jobDescriptionInput').value.trim();
    if (!jobDesc) {
        alert('Por favor ingresa la oferta de empleo o puesto al que aspiras.');
        return;
    }

    const btn = document.getElementById('btnSubmitTailor');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '⚡ Optimizando y calibrando ATS con Gemini 3.6...';

    // Mostrar estado de carga en la columna derecha
    const stateLoading = document.getElementById('tailorStateLoading');
    const stateEmpty = document.getElementById('tailorStateEmpty');
    const stateResult = document.getElementById('tailorStateResult');
    
    if (stateEmpty) stateEmpty.style.display = 'none';
    if (stateResult) stateResult.style.display = 'none';
    if (stateLoading) stateLoading.style.display = 'flex';

    try {
        const token = localStorage.getItem('tj_token');
        const res = await fetch('/api/cv/tailor', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jobDescription: jobDesc,
                styleFormat: selectedStyleFormat
            })
        });

        const data = await res.json();
        if (!res.ok) {
            if (res.status === 402) {
                abrirModalPacks();
                throw new Error(data.error || 'Monedas insuficientes.');
            }
            throw new Error(data.error || 'Error al adaptar CV');
        }

        // Actualizar monedas del usuario si se consumió
        if (data.monedasRestantes !== undefined) {
            currentUser.monedas = data.monedasRestantes;
            renderAuthUser(currentUser);
        }

        // Renderizar los resultados
        renderizarResultadosAdaptacion(data);

        if (stateLoading) stateLoading.style.display = 'none';
        if (stateResult) stateResult.style.display = 'block';

    } catch (err) {
        alert(err.message);
        if (stateLoading) stateLoading.style.display = 'none';
        if (stateEmpty) stateEmpty.style.display = 'flex';
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

function renderizarResultadosAdaptacion(data) {
    // 1. Match Score y Barra
    const scoreVal = data.matchScore || 85;
    const scoreText = document.getElementById('tailorScoreVal');
    const scoreBar = document.getElementById('tailorScoreBar');
    if (scoreText) scoreText.textContent = scoreVal + '%';
    if (scoreBar) scoreBar.style.width = scoreVal + '%';

    // 2. Puntos Fuertes
    const puntosContainer = document.getElementById('tailorPuntosFuertesList');
    if (puntosContainer && data.puntosFuertes) {
        puntosContainer.innerHTML = data.puntosFuertes.map(p => `
            <div style="background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; padding: 0.5rem 0.75rem; font-size: 0.78rem; color: #a7f3d0;">
                <strong style="color: #34d399;">✓</strong> ${p}
            </div>
        `).join('');
    }

    // 3. Brechas detectadas ("De qué carece para calificar")
    const brechasContainer = document.getElementById('tailorBrechasList');
    if (brechasContainer) {
        if (data.brechasDetectadas && data.brechasDetectadas.length > 0) {
            brechasContainer.innerHTML = data.brechasDetectadas.map(b => `
                <div class="gap-item-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                        <span style="font-weight: 700; font-size: 0.82rem; color: #fecaca;">${b.requisito || 'Requisito Crítico'}</span>
                        <span class="gap-badge-missing">${b.nivel || 'Carencia Detectada'}</span>
                    </div>
                    <div class="gap-rec-box">
                        <strong style="color: #f87171;">💡 Consejo de Superación:</strong> ${b.recomendacion || 'Demuestra proyectos afines o cursos complementarios durante la entrevista.'}
                    </div>
                </div>
            `).join('');
        } else {
            brechasContainer.innerHTML = `
                <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 10px; padding: 0.75rem; font-size: 0.8rem; color: #34d399;">
                    ✓ ¡Excelente! No se detectaron carencias críticas. Tu expediente cumple con los requisitos del perfil.
                </div>
            `;
        }
    }

    // 4. Hoja A4 con CV Adaptado
    const sheet = document.getElementById('cvSheetA4');
    if (sheet) {
        if (selectedStyleFormat === 'formal') {
            sheet.className = 'cv-sheet-a4 cv-formal-layout';
        } else {
            sheet.className = 'cv-sheet-a4';
        }

        // Inyectar HTML generado por IA
        sheet.innerHTML = data.cvHtml || '<p>Error al renderizar el documento.</p>';
    }
}

// Imprimir / Guardar como PDF
function imprimirCvAdaptado() {
    const sheet = document.getElementById('cvSheetA4');
    if (!sheet) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(
        '<!DOCTYPE html>' +
        '<html>' +
        '<head>' +
        '<title>Currículum Vitae Optimizado - TrabajaYa</title>' +
        '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">' +
        '<link rel="stylesheet" href="/css/cv.css">' +
        '<style>' +
        '@page { size: A4 portrait; margin: 1.2cm; }' +
        'body { background: #fff !important; color: #1e293b !important; margin: 0; font-family: "Plus Jakarta Sans", sans-serif; }' +
        '.cv-sheet-a4 { box-shadow: none !important; padding: 0 !important; width: 100% !important; min-height: auto !important; }' +
        '</style>' +
        '</head>' +
        '<body>' +
        sheet.outerHTML +
        '<' + 'script' + '>' +
        'window.onload = function() { window.print(); window.close(); };' +
        '<' + '/script' + '>' +
        '</body>' +
        '</html>'
    );
    printWindow.document.close();
}

function copiarTextoCv() {
    const sheet = document.getElementById('cvSheetA4');
    if (!sheet) return;
    navigator.clipboard.writeText(sheet.innerText).then(() => {
        alert('✓ Contenido del CV copiado al portapapeles.');
    });
}
