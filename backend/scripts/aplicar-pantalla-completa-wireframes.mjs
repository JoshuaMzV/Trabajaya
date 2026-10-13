import fs from 'fs';

let html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');

// 1. Ocultar #headerApp cuando estamos en la app (solo dejarlo si está en vistas públicas, o quitar la barra de módulos repetida)
// El usuario pidió: "quita esto [el navbar superior con píldoras moradas de la app y el botón de soporte vip en la esquina], deja solo el botón de ver sitio y herramienta, y que los wireframes cubran la pantalla completa".

// Buscar el contenedor de header y modificar el comportamiento
// Primero, asegurarnos de que la barra superior se oculte o simplifique cuando vistaId === 'app'
const oldMostrarVista = "if (vistaId === 'app') {";
const newMostrarVista = `if (vistaId === 'app') {
                const headerEl = document.querySelector('header');
                if (headerEl) headerEl.style.display = 'none'; // La app tiene su propia barra y menú lateral completo a pantalla completa
                const supportWidget = document.getElementById('supportWidgetWrapper');
                if (supportWidget) supportWidget.style.display = 'none'; // Quitar widget flotante VIP de la esquina como pidió el usuario
`;

html = html.replace(oldMostrarVista, newMostrarVista);

// En el else de mostrarVista:
const oldElse = "} else {\n                publicNav.style.display = 'flex';";
const newElse = `} else {
                const headerEl = document.querySelector('header');
                if (headerEl) headerEl.style.display = 'block';
                publicNav.style.display = 'flex';`;

html = html.replace(oldElse, newElse);

// 2. En el sidebar de WFSide, agregar el botón "🌐 Ver Sitio" arriba para que el usuario pueda volver en cualquier momento:
const oldBrandInSidebar = `<a href="#" onclick="mostrarVista('inicio')" style="display: flex; align-items: center; gap: 10px; padding: 4px 8px; text-decoration: none; color: #18181B">
    <span style="width: 30px; height: 30px; border-radius: 8px; background: #18181B; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-weight: 800">t</span>
    <span style="font-weight: 800; font-size: 18px">TrabajaYa</span>
    <span id="sideRoleBadge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid #A1A1AA; color: #3F3F46">Candidato</span>
  </a>`;

const newBrandInSidebar = `<div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 8px;">
    <a href="#" onclick="mostrarVista('inicio')" style="display: flex; align-items: center; gap: 10px; text-decoration: none; color: #18181B">
      <span style="width: 30px; height: 30px; border-radius: 8px; background: #18181B; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-weight: 800">t</span>
      <span style="font-weight: 800; font-size: 18px">TrabajaYa</span>
      <span id="sideRoleBadge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid #A1A1AA; color: #3F3F46">Candidato</span>
    </a>
    <button onclick="mostrarVista('inicio')" title="Volver al sitio público" style="border: 1px solid #E4E4E7; background: #F4F4F5; border-radius: 8px; padding: 6px 10px; font-size: 12px; font-weight: 700; cursor: pointer; color: #18181B;">
      🌐 Ver Sitio
    </button>
  </div>`;

html = html.replace(oldBrandInSidebar, newBrandInSidebar);

// 3. Asegurar que #supportWidgetWrapper esté oculto por defecto
html = html.replace('id="supportWidgetWrapper" style="display: none;"', 'id="supportWidgetWrapper" style="display: none !important;"');

fs.writeFileSync('Z:/backend/public/index.html', html, 'utf8');
console.log('✅ Barra superior y widget flotante ocultados en modo app. Pantalla completa dedicada para los wireframes.');
