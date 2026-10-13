import fs from 'fs';

let s = fs.readFileSync('src/routes/candidato.js', 'utf8');

// En src/mocks/candidato.js el objeto se llama filtrosMuro, no opcionesFiltros
s = s.replace('opciones: mockDb.opcionesFiltros,', 'opciones: mockDb.filtrosMuro,');

fs.writeFileSync('src/routes/candidato.js', s, 'utf8');
console.log('✅ Corregido opciones: mockDb.filtrosMuro');
