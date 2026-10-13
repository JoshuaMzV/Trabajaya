// public/js/google-auth.js
// Manejo del popup oficial de Google Identity Services conectado a /auth/google

window.iniciarConGoogle = async function(modo = 'login') {
  try {
    const cfgRes = await fetch('/auth/google/config');
    const cfg = await cfgRes.json();
    const clientId = cfg.clientId;

    if (!clientId) {
      alert('Configuración de Google Client ID no encontrada en el servidor.');
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
            headers: { Authorization: 'Bearer ' + tokenResponse.access_token }
          }).then(r => r.json());

          // Detectar rol si estamos en registro
          const rolInput = document.querySelector('input[data-registro-rol-input]');
          const rol = rolInput ? rolInput.value : 'candidato';

          const res = await fetch('/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: userInfo.email,
              nombre: userInfo.name,
              fotoUrl: userInfo.picture,
              googleId: userInfo.sub,
              rol,
              modo
            })
          });

          const data = await res.json();
          if (res.ok && data.success) {
            window.location.href = data.redirect || '/';
          } else {
            alert(data.error || 'No se pudo iniciar sesión con Google.');
          }
        } catch (err) {
          console.error('Error al procesar token de Google:', err);
          alert('Error de conexión al autenticar con Google.');
        }
      }
    });

    tokenClient.requestAccessToken();
  } catch (err) {
    console.error('Error en iniciarConGoogle:', err);
    alert('Error al conectar con Google.');
  }
};
