import fs from 'fs';

// ============================================================
// Extrae el cuerpo de un archivo .dc.html (todo dentro de <x-dc> hasta el script)
// ============================================================
function extractBody(filepath) {
  const raw = fs.readFileSync(filepath, 'utf8');
  // Obtener todo entre <x-dc> y el primer <script type="text/x-dc"
  const start = raw.indexOf('<x-dc>') + '<x-dc>'.length;
  const end = raw.indexOf('<script type="text/x-dc"');
  if (end === -1) return raw.slice(start).replace(/<\/x-dc>/, '').trim();
  return raw.slice(start, end).trim();
}

// ============================================================
// Reemplaza el contenido de un div#mod-XXX en index.html
// ============================================================
function replaceModuleContent(html, modId, newContent) {
  // Buscar apertura del div del módulo
  const openTag = `<div id="${modId}" class="module-pane"`;
  const activeTag = `<div id="${modId}" class="module-pane active-module"`;
  
  let startTag = html.includes(openTag) ? openTag : activeTag;
  let idx = html.indexOf(startTag);
  if (idx === -1) {
    console.log(`No encontrado: ${modId}`);
    return html;
  }
  
  // Avanzar hasta el > que cierra la apertura del div
  let closeOfOpenTag = html.indexOf('>', idx) + 1;
  
  // Encontrar el div de cierre correspondiente (contando anidamiento)
  let depth = 1;
  let pos = closeOfOpenTag;
  while (depth > 0 && pos < html.length) {
    const nextOpen = html.indexOf('<div', pos);
    const nextClose = html.indexOf('</div>', pos);
    if (nextClose === -1) break;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      pos = nextOpen + 4;
    } else {
      depth--;
      if (depth === 0) {
        // Reemplazar el contenido dentro del div
        const before = html.slice(0, closeOfOpenTag);
        const after = html.slice(nextClose + '</div>'.length);
        html = before + '\n' + newContent + '\n' + after;
        console.log(`✓ Reemplazado: ${modId} (${newContent.length} chars)`);
        return html;
      }
      pos = nextClose + 6;
    }
  }
  
  console.log(`No se encontró cierre para: ${modId}`);
  return html;
}

// ============================================================
// Ejecutar inyección de los 5 módulos del candidato
// ============================================================
let html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');

// Normalizar CRLF
html = html.replace(/\r\n/g, '\n');

const mods = [
  {
    id: 'mod-muro',
    file: 'Z:/C1 · Muro de empleos (+ drawer de vacante)-html/WC-Muro.dc.html'
  },
  {
    id: 'mod-expediente',
    file: 'Z:/C2 · Expediente Maestro (vacío leyendo cargado)-html/WC-Expediente.dc.html'
  },
  {
    id: 'mod-adaptar',
    file: 'Z:/C3 · Adaptador ATS (2 columnas + estados)-html/WC-Adaptador.dc.html'
  },
  {
    id: 'mod-entrevistas',
    file: 'Z:/C4 · Sala de Entrevista IA (3 fases)-html/WC-Sala.dc.html'
  },
  {
    id: 'mod-mis-postulaciones',
    file: 'Z:/C5 · Mis Postulaciones (+ toast enviada)-html/WC-Postulaciones.dc.html'
  }
];

for (const mod of mods) {
  const body = extractBody(mod.file);
  html = replaceModuleContent(html, mod.id, body);
}

fs.writeFileSync('Z:/backend/public/index.html', html, 'utf8');
console.log('\n✅ Todos los módulos del candidato inyectados desde los archivos de diseño.');
