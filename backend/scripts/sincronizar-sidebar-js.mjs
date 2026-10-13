import fs from 'fs';

let html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');

// Actualizar seleccionarHerramienta para activar los botones del sidebar también
const selToolFunc = `        function seleccionarHerramienta(herramienta) {
            currentTool = herramienta;

            // Ocultar todos los módulos
            document.querySelectorAll('.module-pane').forEach(el => el.classList.remove('active-module'));
            // Desactivar botones superiores y laterales
            document.querySelectorAll('.tool-tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.app-side-btn').forEach(btn => btn.classList.remove('active'));

            const targetMod = document.getElementById('mod-' + herramienta);
            const targetBtn = document.getElementById('btnTool-' + herramienta);
            const targetSideBtn = document.getElementById('sideBtn-' + herramienta);

            if (targetMod) targetMod.classList.add('active-module');
            if (targetBtn) targetBtn.classList.add('active');
            if (targetSideBtn) targetSideBtn.classList.add('active');

            // Cargar datos según la herramienta elegida
            if (herramienta === 'muro') cargarVacantesMuro();
            if (herramienta === 'expediente') cargarExpedienteMaestro();
            if (herramienta === 'adaptar') cargarVacantesParaAdaptar();
            if (herramienta === 'mis-postulaciones') cargarMisPostulaciones();
            if (herramienta === 'reclutador-vacantes') cargarVacantesReclutador();
            if (herramienta === 'reclutador-metricas') cargarMetricasReclutador();
            if (herramienta === 'reclutador-candidatos-tab') cargarVacantesParaTabCandidatos();
        }`;

// Buscar la función original y reemplazarla
const regexSel = /function seleccionarHerramienta\(herramienta\)[\s\S]*?cargarVacantesParaTabCandidatos\(\);[\s\S]*?\}/i;
if (regexSel.test(html)) {
  html = html.replace(regexSel, selToolFunc);
  fs.writeFileSync('Z:/backend/public/index.html', html, 'utf8');
  console.log('seleccionarHerramienta actualizada con sincronización de sidebar');
} else {
  console.log('Regex para seleccionarHerramienta no coincidió');
}
