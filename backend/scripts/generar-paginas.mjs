import fs from 'fs';
import path from 'path';

const publicDir = 'Z:/backend/public';

const pages = [
  { src: 'Z:/Landing · Busco empleo-html/TY-Landing.dc.html', dest: path.join(publicDir, 'inicio.html') },
  { src: 'Z:/Landing · Contrato talento (Empresas)-html/TY-Landing-Empresas.dc.html', dest: path.join(publicDir, 'empresas.html') },
  { src: 'Z:/Cómo funciona-html/TY-Como-Funciona.dc.html', dest: path.join(publicDir, 'como-funciona.html') },
  { src: 'Z:/Planes-html/TY-Planes.dc.html', dest: path.join(publicDir, 'planes.html') }
];

pages.forEach(p => {
  let content = fs.readFileSync(p.src, 'utf8');
  content = content.replaceAll('href="TY-Landing.dc.html"', 'href="/"');
  content = content.replaceAll('href="TY-Landing-Empresas.dc.html"', 'href="/empresas"');
  content = content.replaceAll('href="TY-Como-Funciona.dc.html"', 'href="/como-funciona"');
  content = content.replaceAll('href="TY-Planes.dc.html"', 'href="/planes"');
  content = content.replaceAll('href="TY-FAQ.dc.html"', 'href="/faq"');
  content = content.replaceAll('href="TY-Contacto.dc.html"', 'href="/contacto"');
  content = content.replaceAll('href="TY-Acerca.dc.html"', 'href="/acerca"');
  
  content = content.replaceAll('src="./vendor/', 'src="/vendor/');
  content = content.replaceAll('src="./support.js"', 'src="/support.js"');
  
  // Reemplazar enlaces '#' para ir a /app (login o registro)
  content = content.replaceAll('href="#"', 'href="/app"');

  fs.writeFileSync(p.dest, content, 'utf8');
  console.log('Generado:', p.dest);
});
