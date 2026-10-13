import fs from 'fs';

// 1. Extraer cuerpo exacto de un .dc.html (solo lo que está dentro de <x-dc>, quitando scripts)
function getDcBody(filePath) {
  let raw = fs.readFileSync(filePath, 'utf8');
  let start = raw.indexOf('<x-dc>');
  if (start !== -1) start += '<x-dc>'.length;
  else start = 0;
  let end = raw.indexOf('<script type="text/x-dc"');
  if (end === -1) end = raw.indexOf('</x-dc>');
  if (end === -1) end = raw.length;
  let content = raw.slice(start, end).trim();
  return content;
}

// 2. Generar el HTML exacto de WFSide para candidato
const sidebarOfficialHtml = `
<aside style="width: 240px; min-width: 240px; min-height: 100vh; box-sizing: border-box; padding: 20px 14px; display: flex; flex-direction: column; gap: 22px; font-family: Figtree, system-ui, sans-serif; font-size: 15px; color: #18181B; background: #FFFFFF; border-right: 1px solid #D4D4D8;">
  <a href="#" onclick="mostrarVista('inicio')" style="display: flex; align-items: center; gap: 10px; padding: 4px 8px; text-decoration: none; color: #18181B">
    <span style="width: 30px; height: 30px; border-radius: 8px; background: #18181B; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-weight: 800">t</span>
    <span style="font-weight: 800; font-size: 18px">TrabajaYa</span>
    <span id="sideRoleBadge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid #A1A1AA; color: #3F3F46">Candidato</span>
  </a>

  <!-- Navegación Candidato -->
  <nav id="navSideCand" aria-label="Menú principal" style="display: flex; flex-direction: column; gap: 4px">
    <button type="button" class="app-side-btn active" id="sideBtn-muro" onclick="seleccionarHerramienta('muro')" style="min-height: 42px; padding: 0 12px; border-radius: 8px; display: flex; align-items: center; gap: 10px; border: 0; cursor: pointer; text-align: left; font-family: inherit; font-size: 15px; background: #18181B; color: #FFFFFF; font-weight: 700;">
      <span style="width: 18px; height: 18px; border-radius: 5px; border: 2px solid currentColor; box-sizing: border-box; display: block; flex-shrink: 0"></span>Muro de empleos
    </button>
    <button type="button" class="app-side-btn" id="sideBtn-expediente" onclick="seleccionarHerramienta('expediente')" style="min-height: 42px; padding: 0 12px; border-radius: 8px; display: flex; align-items: center; gap: 10px; border: 0; cursor: pointer; text-align: left; font-family: inherit; font-size: 15px; background: transparent; color: #3F3F46; font-weight: 600;">
      <span style="width: 18px; height: 18px; border-radius: 5px; border: 2px solid currentColor; box-sizing: border-box; display: block; flex-shrink: 0"></span>Expediente Maestro
    </button>
    <button type="button" class="app-side-btn" id="sideBtn-adaptar" onclick="seleccionarHerramienta('adaptar')" style="min-height: 42px; padding: 0 12px; border-radius: 8px; display: flex; align-items: center; gap: 10px; border: 0; cursor: pointer; text-align: left; font-family: inherit; font-size: 15px; background: transparent; color: #3F3F46; font-weight: 600;">
      <span style="width: 18px; height: 18px; border-radius: 5px; border: 2px solid currentColor; box-sizing: border-box; display: block; flex-shrink: 0"></span>Adaptador ATS
    </button>
    <button type="button" class="app-side-btn" id="sideBtn-entrevistas" onclick="seleccionarHerramienta('entrevistas')" style="min-height: 42px; padding: 0 12px; border-radius: 8px; display: flex; align-items: center; gap: 10px; border: 0; cursor: pointer; text-align: left; font-family: inherit; font-size: 15px; background: transparent; color: #3F3F46; font-weight: 600;">
      <span style="width: 18px; height: 18px; border-radius: 5px; border: 2px solid currentColor; box-sizing: border-box; display: block; flex-shrink: 0"></span>Sala de Entrevista IA
    </button>
    <button type="button" class="app-side-btn" id="sideBtn-mis-postulaciones" onclick="seleccionarHerramienta('mis-postulaciones')" style="min-height: 42px; padding: 0 12px; border-radius: 8px; display: flex; align-items: center; gap: 10px; border: 0; cursor: pointer; text-align: left; font-family: inherit; font-size: 15px; background: transparent; color: #3F3F46; font-weight: 600;">
      <span style="width: 18px; height: 18px; border-radius: 5px; border: 2px solid currentColor; box-sizing: border-box; display: block; flex-shrink: 0"></span>Mis Postulaciones
    </button>
  </nav>

  <!-- Navegación Reclutador -->
  <nav id="navSideRec" aria-label="Menú reclutador" style="display: none; flex-direction: column; gap: 4px">
    <button type="button" class="app-side-btn" id="sideBtn-reclutador-vacantes" onclick="seleccionarHerramienta('reclutador-vacantes')" style="min-height: 42px; padding: 0 12px; border-radius: 8px; display: flex; align-items: center; gap: 10px; border: 0; cursor: pointer; text-align: left; font-family: inherit; font-size: 15px; background: #18181B; color: #FFFFFF; font-weight: 700;">
      <span style="width: 18px; height: 18px; border-radius: 5px; border: 2px solid currentColor; box-sizing: border-box; display: block; flex-shrink: 0"></span>Mis Vacantes
    </button>
    <button type="button" class="app-side-btn" id="sideBtn-reclutador-candidatos-tab" onclick="seleccionarHerramienta('reclutador-candidatos-tab')" style="min-height: 42px; padding: 0 12px; border-radius: 8px; display: flex; align-items: center; gap: 10px; border: 0; cursor: pointer; text-align: left; font-family: inherit; font-size: 15px; background: transparent; color: #3F3F46; font-weight: 600;">
      <span style="width: 18px; height: 18px; border-radius: 5px; border: 2px solid currentColor; box-sizing: border-box; display: block; flex-shrink: 0"></span>Postulantes & Ternas
    </button>
    <button type="button" class="app-side-btn" id="sideBtn-reclutador-metricas" onclick="seleccionarHerramienta('reclutador-metricas')" style="min-height: 42px; padding: 0 12px; border-radius: 8px; display: flex; align-items: center; gap: 10px; border: 0; cursor: pointer; text-align: left; font-family: inherit; font-size: 15px; background: transparent; color: #3F3F46; font-weight: 600;">
      <span style="width: 18px; height: 18px; border-radius: 5px; border: 2px solid currentColor; box-sizing: border-box; display: block; flex-shrink: 0"></span>Métricas y Reportes
    </button>
  </nav>

  <div style="margin-top: auto; display: flex; flex-direction: column; gap: 10px; position: relative">
    <a href="#" onclick="mostrarVista('contacto')" style="min-height: 40px; padding: 0 12px; border-radius: 8px; display: flex; align-items: center; gap: 10px; color: #3F3F46; text-decoration: none; font-weight: 600">
      <span style="width: 18px; height: 18px; border-radius: 50%; border: 2px solid currentColor; box-sizing: border-box; display: block"></span>Ayuda
    </a>

    <!-- Menú popup usuario / wallet -->
    <div id="sideUserDropdown" role="menu" aria-label="Menú de usuario" style="display: none; position: absolute; bottom: 70px; left: 0; right: 0; border: 1px solid #A1A1AA; border-radius: 12px; padding: 14px; flex-direction: column; gap: 10px; background: #FFFFFF; box-shadow: 0 10px 30px rgba(0,0,0,0.12); z-index: 100;">
      <div style="display: flex; flex-direction: column; gap: 6px; padding-bottom: 10px; border-bottom: 1px solid #E4E4E7">
        <div style="display: flex; justify-content: space-between; font-size: 13px; color: #52525B">
          <span id="sidePlanLabel">Plan Gratis</span><span>Saldo</span>
        </div>
        <span style="font-weight: 800; font-size: 20px; text-align: right">
          <span id="sideWalletBalance">2</span> <span style="font-size: 13px; font-weight: 500; color: #52525B">monedas</span>
        </span>
        <a href="#" onclick="abrirModalPacks()" role="menuitem" style="min-height: 40px; border-radius: 8px; background: #18181B; color: #FFFFFF; display: flex; align-items: center; justify-content: center; text-decoration: none; font-weight: 700">Comprar monedas / PRO</a>
        <span style="font-size: 12px; color: #52525B">Últimos movimientos: −1 Entrevista · +2 Pack</span>
      </div>
      <a href="#" onclick="seleccionarHerramienta('expediente'); toggleSideMenu();" role="menuitem" style="min-height: 36px; display: flex; align-items: center; color: #18181B; text-decoration: none; font-weight: 600">Mi perfil y contraseña</a>
      <a href="#" onclick="cerrarSesion()" role="menuitem" style="min-height: 36px; display: flex; align-items: center; color: #D13A1C; text-decoration: none; font-weight: 700">Cerrar sesión</a>
    </div>

    <!-- Botón usuario toggle -->
    <button type="button" onclick="toggleSideMenu()" style="display: flex; align-items: center; gap: 10px; padding: 10px 8px; border: 0; border-top: 1px solid #E4E4E7; background: transparent; font: inherit; color: #18181B; text-align: left; cursor: pointer; min-height: 56px; width: 100%;">
      <span id="sideUserAvatar" style="width: 36px; height: 36px; border-radius: 50%; background: #E4E4E7; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-weight: 700;">U</span>
      <span style="flex: 1; display: flex; flex-direction: column; min-width: 0">
        <span id="sideUserName" style="font-weight: 700; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">[Nombre candidato]</span>
        <span id="sideUserSub" style="font-size: 12px; color: #52525B;">[N] monedas · Gratis</span>
      </span>
      <span aria-hidden="true" style="font-weight: 800">⌃</span>
    </button>
  </div>
</aside>
`;

// 3. Leer componentes exactos
let muroContent = getDcBody('Z:/C1 · Muro de empleos (+ drawer de vacante)-html/WC-Muro.dc.html');
let expContent = getDcBody('Z:/C2 · Expediente Maestro (vacío leyendo cargado)-html/WC-Expediente.dc.html');
let adpContent = getDcBody('Z:/C3 · Adaptador ATS (2 columnas + estados)-html/WC-Adaptador.dc.html');
let salaContent = getDcBody('Z:/C4 · Sala de Entrevista IA (3 fases)-html/WC-Sala.dc.html');
let postContent = getDcBody('Z:/C5 · Mis Postulaciones (+ toast enviada)-html/WC-Postulaciones.dc.html');

// Remover el <div style="flex: 1 1 240px; ..."><dc-import name="WFSide" ...> de cada uno porque ahora el aside es único a la izquierda
function cleanComponent(c) {
  // Quitar el contenedor de WFSide que viene en el template
  return c.replace(/<div style="flex: 1 1 240px;[^>]*><dc-import name="WFSide"[^>]*><\/dc-import><\/div>/g, '');
}

muroContent = cleanComponent(muroContent);
expContent = cleanComponent(expContent);
adpContent = cleanComponent(adpContent);
salaContent = cleanComponent(salaContent);
postContent = cleanComponent(postContent);

// Construir la sección #vista-app exacta
let fullAppSection = `
        <!-- ============================================== -->
        <!-- VISTA 5: APP WORKSPACE (DISEÑO OFICIAL FIEL)   -->
        <!-- ============================================== -->
        <section id="vista-app" class="view-pane" style="background: #F4F4F5; min-height: 100vh; padding: 0;">
            <div style="display: flex; width: 100%; min-height: 100vh; background: #F4F4F5;">
                <!-- SIDEBAR OFICIAL UNIFICADO -->
                ${sidebarOfficialHtml}

                <!-- ÁREA PRINCIPAL DINÁMICA -->
                <div style="flex: 1; min-width: 0; background: #F4F4F5;">
                    <div id="mod-muro" class="module-pane active-module" style="width: 100%;">
                        ${muroContent}
                    </div>
                    <div id="mod-expediente" class="module-pane" style="width: 100%;">
                        ${expContent}
                    </div>
                    <div id="mod-adaptar" class="module-pane" style="width: 100%;">
                        ${adpContent}
                    </div>
                    <div id="mod-entrevistas" class="module-pane" style="width: 100%;">
                        ${salaContent}
                    </div>
                    <div id="mod-mis-postulaciones" class="module-pane" style="width: 100%;">
                        ${postContent}
                    </div>
                </div>
            </div>
        </section>
`;

let html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');
html = html.replace(/\r\n/g, '\n');

// Localizar inicio y fin de #vista-app
const startApp = html.indexOf('<section id="vista-app"');
const endApp = html.indexOf('</section>', html.indexOf('id="mod-mis-postulaciones"')) + '</section>'.length;

if (startApp !== -1 && endApp !== -1) {
  html = html.slice(0, startApp) + fullAppSection + html.slice(endApp);
  console.log('✅ Sección vista-app reemplazada con réplica fiel pixel-perfect');
} else {
  console.log('❌ No se encontró el rango de vista-app');
}

// Ocultar el selector de módulos duplicado del header superior (dejar solo el botón "🌐 Ver Sitio" / "🚀 Herramienta")
// Buscamos #appToolSelector y nos aseguramos de que solo sea un botón toggle si estamos en la app
fs.writeFileSync('Z:/backend/public/index.html', html, 'utf8');
console.log('index.html guardado exitosamente.');
