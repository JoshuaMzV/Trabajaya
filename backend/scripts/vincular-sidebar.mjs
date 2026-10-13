import fs from 'fs';

let html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');

const oldCode = `            document.querySelectorAll('.tool-tab-btn').forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.getElementById('btnTool-' + toolId);
            if (activeBtn) activeBtn.classList.add('active');`;

const newCode = `            document.querySelectorAll('.tool-tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.app-side-btn').forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.getElementById('btnTool-' + toolId);
            if (activeBtn) activeBtn.classList.add('active');
            const activeSideBtn = document.getElementById('sideBtn-' + toolId);
            if (activeSideBtn) activeSideBtn.classList.add('active');`;

html = html.replace(oldCode, newCode);

// También actualizar renderAuthUser para ajustar roles y saldo en el sidebar
const oldRender = 'function renderAuthUser(user) {';
const newRenderExtra = `        function sincronizarSidebarAuth(user) {
            if (!user) return;
            const badge = document.getElementById('sidebarRoleBadge');
            const navCand = document.getElementById('sidebarNavCandidato');
            const navRec = document.getElementById('sidebarNavReclutador');
            const saldoEl = document.getElementById('sidebarMonedasSaldo');

            if (badge) badge.innerText = (user.rol === 'reclutador') ? 'Empresa' : 'Candidato';
            if (navCand) navCand.style.display = (user.rol === 'reclutador') ? 'none' : 'flex';
            if (navRec) navRec.style.display = (user.rol === 'reclutador') ? 'flex' : 'none';
            if (saldoEl) saldoEl.innerText = (user.monedas !== undefined) ? user.monedas : '0';
        }

        function renderAuthUser(user) {
            sincronizarSidebarAuth(user);`;

html = html.replace(oldRender, newRenderExtra);

fs.writeFileSync('Z:/backend/public/index.html', html, 'utf8');
console.log('Sidebar sincronizado perfectamente en index.html');
