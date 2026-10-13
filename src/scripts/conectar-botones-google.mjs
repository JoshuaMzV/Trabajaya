import fs from 'fs';

// 1. Conectar botón de Google en modal-entrar.ejs
let entrar = fs.readFileSync('src/views/auth/modal-entrar.ejs', 'utf8');
entrar = entrar.replace(
  'href="/auth/google"',
  'href="#" onclick="event.preventDefault(); iniciarConGoogle(\'login\');"'
);
fs.writeFileSync('src/views/auth/modal-entrar.ejs', entrar, 'utf8');
console.log('✅ modal-entrar.ejs actualizado con iniciarConGoogle("login")');

// 2. Conectar botón de Google en modal-registro.ejs
let registro = fs.readFileSync('src/views/auth/modal-registro.ejs', 'utf8');
registro = registro.replace(
  'href="/auth/google"',
  'href="#" onclick="event.preventDefault(); iniciarConGoogle(\'register\');"'
);
fs.writeFileSync('src/views/auth/modal-registro.ejs', registro, 'utf8');
console.log('✅ modal-registro.ejs actualizado con iniciarConGoogle("register")');
