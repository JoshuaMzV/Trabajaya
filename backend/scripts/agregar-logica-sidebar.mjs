import fs from 'fs';

let html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');

// Código JS para controlar el menú lateral exactamente como el diseño
const sideMenuLogic = `
        function toggleSideMenu() {
            const menu = document.getElementById('sideUserDropdown');
            if (!menu) return;
            menu.style.display = (menu.style.display === 'none' || menu.style.display === '') ? 'flex' : 'none';
        }

        // Sincronizar usuario en el sidebar fiel
        function sincronizarUsuarioSidebar(user) {
            if (!user) return;
            const badge = document.getElementById('sideRoleBadge');
            const navCand = document.getElementById('navSideCand');
            const navRec = document.getElementById('navSideRec');
            const avatar = document.getElementById('sideUserAvatar');
            const nameEl = document.getElementById('sideUserName');
            const subEl = document.getElementById('sideUserSub');
            const walletBal = document.getElementById('sideWalletBalance');
            const planLbl = document.getElementById('sidePlanLabel');

            const isRec = (user.rol === 'reclutador');
            if (badge) badge.innerText = isRec ? 'Empresa' : 'Candidato';
            if (navCand) navCand.style.display = isRec ? 'none' : 'flex';
            if (navRec) navRec.style.display = isRec ? 'flex' : 'none';
            if (avatar) avatar.innerText = (user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U');
            if (nameEl) nameEl.innerText = user.nombre || (isRec ? 'Empresa S.A.' : 'Candidato');
            if (subEl) subEl.innerText = isRec ? (user.email || 'Empresa') : ((user.monedas || 0) + ' monedas · ' + (user.plan_activo || 'Gratis'));
            if (walletBal) walletBal.innerText = (user.monedas !== undefined) ? user.monedas : 0;
            if (planLbl) planLbl.innerText = user.plan_activo ? ('Plan ' + user.plan_activo) : 'Plan Gratis';
        }
`;

if (!html.includes('function toggleSideMenu()')) {
  const insertMarker = 'function renderAuthUser(user) {';
  html = html.replace(insertMarker, sideMenuLogic + '\n        ' + insertMarker);
  // Llamar a sincronizarUsuarioSidebar dentro de renderAuthUser
  html = html.replace('function renderAuthUser(user) {', 'function renderAuthUser(user) {\n            sincronizarUsuarioSidebar(user);');
  fs.writeFileSync('Z:/backend/public/index.html', html, 'utf8');
  console.log('Lógica JS del menú lateral fiel agregada.');
} else {
  console.log('toggleSideMenu ya existía');
}
