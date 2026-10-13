import fs from 'fs';

let html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');

const sidebarBlock = `<section id="vista-app" class="view-pane">
            <div class="app-workspace-layout">
                <!-- SIDEBAR LATERAL OFICIAL (WFSide.dc.html) -->
                <aside class="app-sidebar-official">
                    <a href="#" onclick="mostrarVista('inicio')" class="app-sidebar-brand">
                        <span class="logo-box">t</span>
                        <span class="brand-title">Trabaja<span style="color:#D13A1C">Ya</span></span>
                        <span class="role-badge" id="sidebarRoleBadge">Candidato</span>
                    </a>

                    <!-- Navegación Candidato -->
                    <nav class="app-sidebar-nav" id="sidebarNavCandidato">
                        <button type="button" class="app-side-btn active" id="sideBtn-muro" onclick="seleccionarHerramienta('muro')">
                            <span class="icon">💼</span> Muro de Empleos
                        </button>
                        <button type="button" class="app-side-btn" id="sideBtn-expediente" onclick="seleccionarHerramienta('expediente')">
                            <span class="icon">📂</span> Expediente Maestro
                        </button>
                        <button type="button" class="app-side-btn" id="sideBtn-adaptar" onclick="seleccionarHerramienta('adaptar')">
                            <span class="icon">⚡</span> Adaptador ATS
                        </button>
                        <button type="button" class="app-side-btn" id="sideBtn-entrevistas" onclick="seleccionarHerramienta('entrevistas')">
                            <span class="icon">🎙️</span> Entrevista IA
                        </button>
                        <button type="button" class="app-side-btn" id="sideBtn-mis-postulaciones" onclick="seleccionarHerramienta('mis-postulaciones')">
                            <span class="icon">📨</span> Mis Postulaciones
                        </button>
                    </nav>

                    <!-- Navegación Reclutador -->
                    <nav class="app-sidebar-nav" id="sidebarNavReclutador" style="display:none;">
                        <button type="button" class="app-side-btn" id="sideBtn-reclutador-vacantes" onclick="seleccionarHerramienta('reclutador-vacantes')">
                            <span class="icon">📋</span> Mis Vacantes
                        </button>
                        <button type="button" class="app-side-btn" id="sideBtn-reclutador-candidatos" onclick="seleccionarHerramienta('reclutador-candidatos-tab')">
                            <span class="icon">👥</span> Postulantes & Ternas
                        </button>
                        <button type="button" class="app-side-btn" id="sideBtn-reclutador-metricas" onclick="seleccionarHerramienta('reclutador-metricas')">
                            <span class="icon">📊</span> Métricas & Reportes
                        </button>
                    </nav>

                    <!-- Footer lateral con Monedas, Soporte y Cerrar sesión -->
                    <div class="app-sidebar-footer">
                        <button type="button" onclick="abrirModalPacks()" style="width:100%; min-height:44px; border-radius:12px; background:#F3F0FC; border:1px solid #E4DDF7; display:flex; justify-content:space-between; align-items:center; padding:0 14px; font:inherit; font-weight:700; color:#23153C; cursor:pointer;">
                            <span>🪙 Mis Monedas</span>
                            <span style="color:#D13A1C;" id="sidebarMonedasSaldo">--</span>
                        </button>

                        <button type="button" onclick="mostrarVista('contacto')" style="width:100%; min-height:40px; border-radius:12px; background:transparent; border:none; display:flex; align-items:center; gap:10px; font:inherit; font-weight:600; color:#4B3B6B; cursor:pointer;">
                            <span>💬</span> Ayuda & Soporte
                        </button>

                        <button type="button" onclick="cerrarSesion()" style="width:100%; min-height:40px; border-radius:12px; background:#FFF4F1; border:1px solid #FFD3C7; color:#D13A1C; display:flex; align-items:center; justify-content:center; gap:8px; font:inherit; font-weight:700; cursor:pointer;">
                            <span>🚪</span> Cerrar sesión
                        </button>
                    </div>
                </aside>

                <!-- CONTENIDO PRINCIPAL -->
                <main class="app-main-content-official">`;

// Normalizar CRLF
html = html.replace(/\r\n/g, '\n');
const openTargetNorm = '<section id="vista-app" class="view-pane">\n            <div class="app-container">';
const closeTargetNorm = '</div>\n                </div>\n\n            </div>\n        </section>';
const closeReplacementNorm = '</div>\n                </div>\n\n            </main>\n            </div>\n        </section>';

if (html.includes(openTargetNorm) && html.includes(closeTargetNorm)) {
  html = html.replace(openTargetNorm, sidebarBlock);
  html = html.replace(closeTargetNorm, closeReplacementNorm);
  fs.writeFileSync('Z:/backend/public/index.html', html, 'utf8');
  console.log('Sidebar oficial integrado con éxito en index.html');
} else {
  console.log('Targets no encontrados en normalización');
}
