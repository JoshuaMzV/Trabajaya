import fs from 'fs';

let cf = fs.readFileSync('Z:/backend/public/como-funciona.html', 'utf8');

const targetSection = '<section style="max-width: 1240px; margin: 0 auto; padding: 48px 32px 40px; display: flex; flex-direction: column; align-items: center; gap: 20px; text-align: center">';

const replacementHeader = `<section style="max-width: 1240px; margin: 0 auto; padding: 48px 32px 40px; display: flex; flex-direction: column; align-items: center; gap: 20px; text-align: center">
<div id="cf-role-nav" style="display: flex; gap: 4px; padding: 6px; border-radius: 999px; background: #EAE4FF; margin: 0 auto; width: fit-content;">
  <button id="btn-cf-cand" onclick="toggleCfRole('cand')" style="min-height: 44px; padding: 0 22px; display: flex; align-items: center; border-radius: 999px; background: #FFFFFF; color: #23153C; border: none; font-family: inherit; font-size: 16px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 6px rgba(35,21,60,0.08); transition: all 0.2s;">Si buscas empleo</button>
  <button id="btn-cf-emp" onclick="toggleCfRole('emp')" style="min-height: 44px; padding: 0 22px; display: flex; align-items: center; border-radius: 999px; background: transparent; color: #4B3B6B; border: none; font-family: inherit; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s;">Si contratas</button>
</div>
<h1 id="cf-title" style="margin: 0; font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 64px; line-height: 1; letter-spacing: -0.04em; max-width: 820px; text-wrap: balance">Así funciona TrabajaYa</h1>
<p id="cf-desc" style="margin: 0; font-size: 20px; color: #4B3B6B; max-width: 600px">Dos caminos que se encuentran en la entrevista IA.</p>
</section>`;

// Quitar la sección original del hero y nav de salto
const heroRegex = /<section style="max-width: 1240px; margin: 0 auto; padding: 48px 32px 40px;[\s\S]*?<\/section>/i;
cf = cf.replace(heroRegex, replacementHeader);

// Ocultar sección empresas por defecto en vez de tenerla apilada debajo
cf = cf.replace('id="empresas" style="max-width: 1240px;', 'id="empresas" style="display: none; max-width: 1240px;');

// Script interactivo
const script = `
<script>
function toggleCfRole(role) {
  const bCand = document.getElementById('btn-cf-cand');
  const bEmp = document.getElementById('btn-cf-emp');
  const secCand = document.getElementById('candidatos');
  const secEmp = document.getElementById('empresas');
  const title = document.getElementById('cf-title');
  const desc = document.getElementById('cf-desc');

  if (role === 'cand') {
    bCand.style.background = '#FFFFFF';
    bCand.style.color = '#23153C';
    bCand.style.fontWeight = '700';
    bCand.style.boxShadow = '0 2px 6px rgba(35,21,60,0.08)';

    bEmp.style.background = 'transparent';
    bEmp.style.color = '#4B3B6B';
    bEmp.style.fontWeight = '600';
    bEmp.style.boxShadow = 'none';

    if (title) title.innerText = 'Así funciona TrabajaYa';
    if (desc) desc.innerText = 'Dos caminos que se encuentran en la entrevista IA.';

    if (secCand) secCand.style.display = 'flex';
    if (secEmp) secEmp.style.display = 'none';
  } else {
    bEmp.style.background = '#23153C';
    bEmp.style.color = '#FFFFFF';
    bEmp.style.fontWeight = '700';
    bEmp.style.boxShadow = '0 2px 6px rgba(35,21,60,0.12)';

    bCand.style.background = 'transparent';
    bCand.style.color = '#4B3B6B';
    bCand.style.fontWeight = '600';
    bCand.style.boxShadow = 'none';

    if (title) title.innerText = 'Contrata a quien ya demostró que puede.';
    if (desc) desc.innerText = 'Publica tu vacante, define qué evalúa la IA y recibe a cada candidato con score y dictamen.';

    if (secCand) secCand.style.display = 'none';
    if (secEmp) secEmp.style.display = 'flex';
  }
}
</script>
`;

cf = cf.replace('</body>', script + '\n</body>');
fs.writeFileSync('Z:/backend/public/como-funciona.html', cf, 'utf8');
console.log('como-funciona.html actualizado correctamente con alternancia directa');
