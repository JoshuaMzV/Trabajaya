// Íconos Lucide como SVG inline. En las vistas: <%- icon('briefcase', { size: 20 }) %>
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const iconsDir = path.join(path.dirname(require.resolve('lucide-static/package.json')), 'icons');
const cache = new Map();

function load(name) {
  if (!cache.has(name)) {
    const svg = readFileSync(path.join(iconsDir, `${name}.svg`), 'utf8');
    // Se queda solo con el contenido interno (<path>, <circle>…) para reconstruir el <svg>.
    const inner = svg.replace(/<!--[\s\S]*?-->/g, '').replace(/^[\s\S]*?<svg[^>]*>|<\/svg>\s*$/g, '').replace(/\s+/g, ' ').trim();
    cache.set(name, inner);
  }
  return cache.get(name);
}

export function icon(name, { size = 20, strokeWidth = 2, className = '', label } = {}) {
  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true" focusable="false"';
  const cls = ['icon', className].filter(Boolean).join(' ');
  return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" ${a11y}>${load(name)}</svg>`;
}
