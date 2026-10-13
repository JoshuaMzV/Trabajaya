import fs from 'fs';

// 1. En src/routes/candidato.js: agregar sla a soporteModal
let cand = fs.readFileSync('src/routes/candidato.js', 'utf8');
cand = cand.replace(
  'categorias: mockDb.categoriasSoporte,',
  'categorias: mockDb.categoriasSoporte,\n    sla: mockDb.soporte || { vip: "menos de 2 horas", estandar: "24 horas" },'
);
fs.writeFileSync('src/routes/candidato.js', cand, 'utf8');

// 2. En src/routes/empresa.js: agregar sla a soporteModal
let emp = fs.readFileSync('src/routes/empresa.js', 'utf8');
emp = emp.replace(
  'categorias: mockDb.soporte.categorias,',
  'categorias: mockDb.soporte.categorias,\n    sla: mockDb.soporte.sla || { vip: "menos de 2 horas", estandar: "24 horas" },'
);
fs.writeFileSync('src/routes/empresa.js', emp, 'utf8');

console.log('✅ Objeto sla inyectado en soporteModal para candidato y empresa');
