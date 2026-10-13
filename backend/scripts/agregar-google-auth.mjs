import fs from 'fs';

let html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');

const googleFunction = `
        // Autenticación con Google Identity Services
        async function iniciarConGoogle() {
            try {
                const cfgRes = await fetch('/api/auth/google/config');
                const cfg = await cfgRes.json();
                const clientId = cfg.clientId;

                if (!clientId || clientId === 'TU_GOOGLE_CLIENT_ID_AQUI') {
                    alert('⚠️ Configuración pendiente:\\nDebes colocar tu GOOGLE_CLIENT_ID en el archivo backend/.env.');
                    return;
                }

                if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
                    alert('Cargando servicios de Google, por favor reintenta en un momento.');
                    return;
                }

                const tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: clientId,
                    scope: 'email profile openid',
                    callback: async (tokenResponse) => {
                        if (tokenResponse.error) {
                            console.error('Google OAuth Error:', tokenResponse);
                            return;
                        }

                        try {
                            const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                                headers: { 'Authorization': 'Bearer ' + tokenResponse.access_token }
                            }).then(r => r.json());

                            const pStep2 = document.getElementById('authPaneRegStep2');
                            const isRegister = (pStep2 && pStep2.style.display !== 'none');
                            const modo = isRegister ? 'register' : 'login';

                            let rol = rolRegistroSeleccionado || 'candidato';
                            let empresa_nombre = null;

                            if (isRegister && rol === 'reclutador') {
                                empresa_nombre = document.getElementById('regEmpresaInputOficial')?.value?.trim();
                                if (!empresa_nombre) {
                                    alert('⚠️ Para registrarte como Reclutador, por favor escribe el nombre de tu empresa antes de continuar con Google.');
                                    return;
                                }
                            }

                            const res = await fetch('/api/auth/google', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    email: userInfo.email,
                                    nombre: userInfo.name,
                                    fotoUrl: userInfo.picture,
                                    googleId: userInfo.sub,
                                    rol,
                                    empresa_nombre,
                                    modo
                                })
                            });

                            const data = await res.json();
                            if (res.ok && data.success) {
                                localStorage.setItem('tj_token', data.token);
                                currentUser = data.user;
                                cerrarModal();
                                renderAuthUser(currentUser);
                                mostrarVista('app');
                                if (data.isNewUser) {
                                    alert('🎉 ¡Bienvenido ' + data.user.nombre + '! Cuenta creada con Google (' + data.user.email + ').');
                                }
                            } else {
                                if (res.status === 404 && modo === 'login') {
                                    alert('⚠️ No tienes una cuenta registrada con este correo de Google (' + userInfo.email + '). Te dirigimos al registro para que elijas tu rol.');
                                    abrirModalAuthStep1('candidato');
                                } else {
                                    alert('Error: ' + (data.error || 'No se pudo procesar tu cuenta con Google.'));
                                }
                            }
                        } catch (err) {
                            console.error('Error procesando Google:', err);
                            alert('Error al obtener datos de Google.');
                        }
                    }
                });

                tokenClient.requestAccessToken({ prompt: 'select_account' });
            } catch (err) {
                console.error('Error Google OAuth:', err);
                alert('No se pudo abrir la ventana de Google.');
            }
        }
`;

const insertPoint = 'async function enviarLoginOficial(e) {';
if (!html.includes('async function iniciarConGoogle()')) {
  html = html.replace(insertPoint, googleFunction + '\n        ' + insertPoint);
  fs.writeFileSync('Z:/backend/public/index.html', html, 'utf8');
  console.log('iniciarConGoogle integrado exitosamente');
} else {
  console.log('Ya existía');
}
