import fs from 'fs';

let v = fs.readFileSync('src/views/candidato/adaptador.ejs', 'utf8');
if (v.includes('/candidato/cvs/<%= cv.id %>') && !v.includes('/descargar')) {
  v = v.replace('/candidato/cvs/<%= cv.id %>', '/candidato/cvs/<%= cv.id %>/descargar');
  fs.writeFileSync('src/views/candidato/adaptador.ejs', v, 'utf8');
  console.log('✅ adaptador.ejs actualizado con endpoint /descargar');
} else {
  console.log('Link ya actualizado o no encontrado');
}
