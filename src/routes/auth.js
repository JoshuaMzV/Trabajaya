import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../lib/db.js';
import { generarToken } from '../lib/auth.js';
import { sendEmailViaEmailJS } from '../lib/email.js';
import { authState, renderLanding } from './public.js';

const router = Router();
const esCorreo = (v) => /^\S+@\S+\.\S+$/.test(v);
const destinoPorRol = {
  candidato: '/candidato/muro',
  cand: '/candidato/muro',
  reclutador: '/empresa/vacantes',
  empresa: '/empresa/vacantes',
  rec: '/empresa/vacantes',
  admin: '/admin/metricas'
};

// -------------------------------------------------------------
// 1. LOGIN CON CORREO Y CONTRASEÑA (POSTGRESQL REAL)
// -------------------------------------------------------------
router.post('/login', async (req, res) => {
  const correo = (req.body.correo || req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';
  const errores = {};

  if (!esCorreo(correo)) errores.correo = 'Escribe un correo válido.';
  if (!password) errores.password = 'Escribe tu contraseña.';

  if (Object.keys(errores).length) {
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(422).json({ error: errores.correo || errores.password });
    }
    return renderLanding(res, authState({ abrir: 'entrar', errores, valores: { correo } }), 422);
  }

  try {
    const result = await pool.query(
      `SELECT id, nombre, email, rol, empresa_nombre, password_hash, trabajacoins_saldo, plan, plan_expiracion, foto_url 
       FROM usuarios WHERE email = $1`,
      [correo]
    );

    if (result.rows.length === 0) {
      errores.credenciales = true;
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(401).json({ error: 'El correo o la contraseña no coinciden.' });
      }
      return renderLanding(res, authState({ abrir: 'entrar', errores, valores: { correo } }), 422);
    }

    const usuario = result.rows[0];
    const passwordValido = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValido) {
      errores.credenciales = true;
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(401).json({ error: 'El correo o la contraseña no coinciden.' });
      }
      return renderLanding(res, authState({ abrir: 'entrar', errores, valores: { correo } }), 422);
    }

    const token = generarToken(usuario);

    // Guardar token en cookie httpOnly para navegación y enviar JSON si fue fetch
    res.cookie('tj_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60 * 1000
    });

    if (req.xhr || req.headers.accept?.includes('json')) {
      delete usuario.password_hash;
      return res.json({ success: true, token, user: usuario, redirect: destinoPorRol[usuario.rol] || '/candidato/muro' });
    }

    res.redirect(303, destinoPorRol[usuario.rol] || '/candidato/muro');
  } catch (err) {
    console.error('[Error Login]', err);
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(500).json({ error: 'Error interno en el servidor.' });
    }
    renderLanding(res, authState({ abrir: 'entrar', errores: { credenciales: true }, valores: { correo } }), 500);
  }
});

// -------------------------------------------------------------
// 2. REGISTRO CON CORREO Y CONTRASEÑA (POSTGRESQL REAL)
// -------------------------------------------------------------
router.post('/registro', async (req, res) => {
  const rolInput = req.body.rol === 'empresa' || req.body.rol === 'reclutador' ? 'reclutador' : 'candidato';
  const nombre = (req.body.nombre || '').trim();
  const correo = (req.body.correo || req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';
  const empresaNombre = (req.body.empresa_nombre || (rolInput === 'reclutador' ? nombre : null));

  const errores = {};
  if (!nombre) errores.nombre = rolInput === 'reclutador' ? 'Escribe tu nombre o el de tu empresa.' : 'Escribe tu nombre completo.';
  if (!esCorreo(correo)) errores.correo = 'Escribe un correo válido.';
  if (password.length < 8) errores.password = 'Usa al menos 8 caracteres.';
  if (!req.body.terminos && req.body.terminos !== '1') errores.terminos = 'Debes aceptar los Términos y la Política de privacidad.';

  const valores = { nombre, correo };

  if (Object.keys(errores).length) {
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(422).json({ error: Object.values(errores)[0] });
    }
    return renderLanding(res, authState({ abrir: 'registro', paso: 2, rol: rolInput === 'reclutador' ? 'empresa' : 'candidato', errores, valores }), 422);
  }

  try {
    const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [correo]);
    if (existe.rows.length > 0) {
      errores.correoExiste = true;
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(400).json({ error: 'Este correo ya tiene una cuenta registrada.' });
      }
      return renderLanding(res, authState({ abrir: 'registro', paso: 2, rol: rolInput === 'reclutador' ? 'empresa' : 'candidato', errores, valores }), 422);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const initialCoins = (rolInput === 'reclutador') ? 10 : 2;

    const insertRes = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol, empresa_nombre, trabajacoins_saldo, plan) 
       VALUES ($1, $2, $3, $4, $5, $6, 'free') 
       RETURNING id, nombre, email, rol, empresa_nombre, trabajacoins_saldo, plan`,
      [nombre, correo, passwordHash, rolInput, empresaNombre, initialCoins]
    );

    const newUser = insertRes.rows[0];

    // Bono de bienvenida en historial de transacciones
    await pool.query(
      `INSERT INTO transacciones_coins (usuario_id, tipo, cantidad, saldo_resultante, descripcion) 
       VALUES ($1, 'BONO_BIENVENIDA', $2, $3, 'Bono inicial de bienvenida (${initialCoins} TrabajaCoins)')`,
      [newUser.id, initialCoins, initialCoins]
    );

    // Correo de bienvenida
    await sendEmailViaEmailJS({
      toEmail: newUser.email,
      toName: newUser.nombre,
      subject: '¡Bienvenido a TrabajaYa!',
      templateType: 'POSTULACION_CONFIRMADA',
      variables: {
        mensaje: `Bienvenido a TrabajaYa. Tu cuenta como ${rolInput} ha sido creada con éxito.`
      }
    });

    const token = generarToken(newUser);

    res.cookie('tj_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60 * 1000
    });

    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.json({ success: true, token, user: newUser, redirect: destinoPorRol[newUser.rol] || '/candidato/muro' });
    }

    res.redirect(303, destinoPorRol[newUser.rol] || '/candidato/muro');
  } catch (err) {
    console.error('[Error Registro]', err);
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(500).json({ error: 'Error interno en el servidor.' });
    }
    renderLanding(res, authState({ abrir: 'registro', paso: 2, rol: rolInput === 'reclutador' ? 'empresa' : 'candidato', errores: { general: 'Error en el servidor' }, valores }), 500);
  }
});

// -------------------------------------------------------------
// 3. AUTENTICACIÓN CON GOOGLE (CLIENTE Y CREDENCIALES BD)
// -------------------------------------------------------------
router.post('/google', async (req, res) => {
  try {
    const { email, nombre, googleId, fotoUrl, rol, modo } = req.body;
    if (!email) return res.status(400).json({ error: 'No se recibió correo de Google.' });

    const emailNorm = email.trim().toLowerCase();
    const result = await pool.query(
      `SELECT id, nombre, email, rol, empresa_nombre, trabajacoins_saldo, plan, plan_expiracion, foto_url 
       FROM usuarios WHERE email = $1`,
      [emailNorm]
    );

    let user;

    if (result.rows.length > 0) {
      user = result.rows[0];
      if (googleId || fotoUrl) {
        await pool.query(
          `UPDATE usuarios SET google_id = COALESCE($1, google_id), foto_url = COALESCE($2, foto_url) WHERE id = $3`,
          [googleId, fotoUrl, user.id]
        );
      }
    } else {
      if (modo === 'login') {
        return res.status(404).json({
          error: 'No se encontró cuenta con este correo de Google. Por favor crea tu cuenta primero.'
        });
      }

      const rolAsignado = (rol === 'empresa' || rol === 'reclutador') ? 'reclutador' : 'candidato';
      const initialCoins = rolAsignado === 'reclutador' ? 10 : 2;

      const insertRes = await pool.query(
        `INSERT INTO usuarios (nombre, email, google_id, foto_url, rol, trabajacoins_saldo, plan) 
         VALUES ($1, $2, $3, $4, $5, $6, 'free') 
         RETURNING id, nombre, email, rol, empresa_nombre, trabajacoins_saldo, plan, foto_url`,
        [nombre || 'Usuario Google', emailNorm, googleId, fotoUrl, rolAsignado, initialCoins]
      );
      user = insertRes.rows[0];

      await pool.query(
        `INSERT INTO transacciones_coins (usuario_id, tipo, cantidad, saldo_resultante, descripcion) 
         VALUES ($1, 'BONO_BIENVENIDA_GOOGLE', $2, $3, 'Bono inicial de bienvenida vía Google')`,
        [user.id, initialCoins, initialCoins]
      );
    }

    const token = generarToken(user);

    res.cookie('tj_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      token,
      user,
      redirect: destinoPorRol[user.rol] || '/candidato/muro'
    });
  } catch (err) {
    console.error('[Error Google Auth]', err);
    res.status(500).json({ error: 'Error al autenticar con Google.' });
  }
});

// Configuración de Client ID de Google para el frontend
router.get('/google/config', (req, res) => {
  res.json({
    clientId: process.env.GOOGLE_CLIENT_ID || ''
  });
});

// Cerrar sesión
router.post('/logout', (req, res) => {
  res.clearCookie('tj_token');
  res.redirect(303, '/');
});

router.get('/logout', (req, res) => {
  res.clearCookie('tj_token');
  res.redirect(303, '/');
});

export default router;
