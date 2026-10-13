import jwt from 'jsonwebtoken';
import pool from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'trabajaya_jwt_security_secret_key_2026_umg';

export function generarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      nombre: usuario.nombre
    },
    JWT_SECRET,
    { expiresIn: '365d' }
  );
}

export function verificarToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Middleware global: extrae token de cookie o Bearer y carga datos frescos desde PostgreSQL
export async function authMiddleware(req, res, next) {
  const token = req.cookies?.tj_token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  if (!token) {
    req.usuario = null;
    res.locals.usuarioActual = null;
    return next();
  }

  const payload = verificarToken(token);
  if (!payload || !payload.id) {
    res.clearCookie('tj_token');
    req.usuario = null;
    res.locals.usuarioActual = null;
    return next();
  }

  try {
    const q = await pool.query(
      `SELECT id, nombre, email, rol, empresa_nombre, empresa_perfil, trabajacoins_saldo, plan, plan_expiracion, foto_url, perfil_maestro 
       FROM usuarios WHERE id = $1`,
      [payload.id]
    );

    if (q.rows.length === 0) {
      res.clearCookie('tj_token');
      req.usuario = null;
      res.locals.usuarioActual = null;
      return next();
    }

    const u = q.rows[0];
    req.usuario = u;
    res.locals.usuarioActual = u;
    next();
  } catch (err) {
    console.error('[authMiddleware DB Error]', err);
    req.usuario = null;
    res.locals.usuarioActual = null;
    next();
  }
}

// Requerir rol específico con redirección /entrar y 403
export function requerirRol(rolEsperado) {
  return (req, res, next) => {
    if (!req.usuario) {
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(401).json({ error: 'Debes iniciar sesión.' });
      }
      return res.redirect(303, '/entrar');
    }

    const rol = req.usuario.rol;
    const esValido = 
      (rolEsperado === 'candidato' && (rol === 'candidato' || rol === 'cand')) ||
      (rolEsperado === 'reclutador' && (rol === 'reclutador' || rol === 'empresa' || rol === 'rec')) ||
      (rolEsperado === 'admin' && rol === 'admin');

    if (!esValido) {
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(403).json({ error: 'Acceso no autorizado para este rol.' });
      }
      return res.status(403).render('404', { 
        layout: 'public', 
        title: 'Acceso denegado (403) · TrabajaYa',
        encabezado: 'Acceso denegado (403)',
        mensaje: 'No tienes los permisos requeridos para acceder a esta área.' 
      });
    }

    next();
  };
}
