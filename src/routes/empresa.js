import { Router } from 'express';
import pool from '../lib/db.js';
import { requerirRol } from '../lib/auth.js';
import * as mockDb from '../mocks/empresa.js';

const router = Router();
const hoy = () => new Date().toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' });

// =========================================================================
// PROTECCIÓN ESTRICTA: Todas las rutas de empresa requieren rol 'reclutador'
// =========================================================================
router.use(requerirRol('reclutador'));

// Middleware de datos del usuario reclutador
router.use((req, res, next) => {
  const u = req.usuario;
  res.locals.layout = 'app';
  res.locals.role = 'rec';
  res.locals.usuario = {
    id: u.id,
    nombre: u.empresa_nombre || u.nombre,
    correo: u.email,
    avatarUrl: u.foto_url || null,
    plan: 'Empresa',
    saldo: u.trabajacoins_saldo || 10,
    movimientos: []
  };
  res.locals.soporteModal = {
    abrir: req.query.soporte === '1',
    tickets: [],
    estados: mockDb.soporte?.estadosTicket || { abierto: { label: 'Abierto', variante: 'accent' } },
    categorias: ['Cuenta', 'Vacantes', 'Postulantes', 'Facturación', 'Otro'],
    sla: { vip: "menos de 2 horas", estandar: "24 horas" },
    volver: req.originalUrl
  };
  res.locals.styles = ['/css/pages/empresa.css'];
  res.locals.aviso = null;
  next();
});

// -------------------------------------------------------------
// 1. MIS VACANTES (AISLADAS POR RECLUTADOR_ID)
// -------------------------------------------------------------
router.get('/vacantes', async (req, res) => {
  try {
    const qVac = await pool.query(
      `SELECT v.*, COUNT(p.id) as total_postulantes
       FROM vacantes v
       LEFT JOIN postulaciones p ON v.id = p.vacante_id
       WHERE v.reclutador_id = $1
       GROUP BY v.id
       ORDER BY v.creado_en DESC`,
      [req.usuario.id]
    );

    const vacantes = qVac.rows.map(v => ({
      id: v.id,
      titulo: v.titulo,
      estado: v.estado,
      postulantes: Number(v.total_postulantes) || 0,
      publicada: v.creado_en ? new Date(v.creado_en).toLocaleDateString('es-GT') : null,
      cierre: null,
      cerradaEl: null,
      editada: hoy(),
      tipo: 'Tiempo completo',
      modalidad: 'Híbrido',
      preguntasCount: v.limite_preguntas_ia || 4,
      descripcion: v.descripcion,
      metricas: {
        postulantes: Number(v.total_postulantes) || 0,
        entrevistas: 0,
        sinRevisar: Number(v.total_postulantes) || 0,
        enTerna: 0
      }
    }));

    const conteo = {
      todas: vacantes.length,
      publicada: vacantes.filter(v => v.estado === 'publicada').length,
      borrador: vacantes.filter(v => v.estado === 'borrador').length,
      cerrada: vacantes.filter(v => v.estado === 'cerrada').length
    };

    let asistenteVacante = {
      id: 0, estado: 'nueva', titulo: '', area: 'Tecnología', experiencia: '1–2 años', ubicacion: 'Guatemala',
      modalidad: 'Híbrido', jornada: 'Tiempo completo', cierre: '', salarioMin: '', salarioMax: '',
      mostrarSalario: false, descripcion: '', requisitos: '', skills: [], beneficios: '',
      competencias: [{ nombre: 'Adaptabilidad', peso: 3 }], repreguntas: 2, duracion: 20,
      respuesta: 'Voz y texto', star: true, criterios: '', preguntaObligatoria: ''
    };

    if (req.query.vacante) {
      const vExistente = vacantes.find(v => v.id === Number(req.query.vacante));
      if (vExistente) {
        asistenteVacante = {
          ...asistenteVacante,
          ...vExistente,
          skills: [],
          competencias: [{ nombre: 'Adaptabilidad', peso: 3 }]
        };
      }
    }

    res.render('empresa/vacantes', {
      title: 'Mis Vacantes · TrabajaYa',
      active: 'vacantes',
      vacantes,
      conteo,
      empresa: {
        nombre: req.usuario.empresa_nombre || req.usuario.nombre
      },
      kpis: {
        activas: conteo.publicada,
        nuevos: 0,
        pendientes: 0,
        terna: 0
      },
      asistente: {
        abrir: req.query.asistente === '1' || req.path.endsWith('/nueva'),
        vacante: asistenteVacante,
        errores: {}
      },
      opciones: mockDb.opciones,
      limites: { duracionMax: 45, preguntasMin: 3, preguntasMax: 10, repreguntasMax: 3 },
      catalogo: ['Adaptabilidad', 'Comunicación', 'Liderazgo', 'Resolución de problemas', 'Orientación a resultados', 'Trabajo en equipo'],
      estados: mockDb.estadosVacante,
      styles: ['/css/pages/empresa.css'],
      scripts: ['/js/pages/asistente.js']
    });
  } catch (err) {
    console.error('[Error Vacantes Empresa]', err);
    res.status(500).render('404', { title: 'Error cargando vacantes' });
  }
});

// Redirigir /vacantes/nueva al asistente abierto
router.get('/vacantes/nueva', (req, res) => {
  res.redirect(303, '/empresa/vacantes?asistente=1');
});

// Editar vacante existente
router.get('/vacantes/:id/editar', (req, res) => {
  res.redirect(303, `/empresa/vacantes?asistente=1&vacante=${req.params.id}`);
});

// Ver o redirigir vacante por id
router.get('/vacantes/:id', (req, res) => {
  res.redirect(303, `/empresa/postulantes?vacante=${req.params.id}`);
});

// Crear o publicar vacante
router.post('/vacantes', async (req, res) => {
  const { id, titulo, descripcion, requisitos, accion } = req.body;
  if (!titulo || !descripcion) {
    return res.redirect(303, '/empresa/vacantes?aviso=error-campos');
  }

  const estado = accion === 'borrador' ? 'borrador' : 'publicada';

  try {
    const vacanteId = id ? Number(id) : null;
    if (vacanteId) {
      // Si ya se había autoguardado como borrador, se actualiza y publica en lugar de duplicar
      await pool.query(
        `UPDATE vacantes SET titulo = $1, descripcion = $2, requisitos = $3, estado = $4, actualizado_en = CURRENT_TIMESTAMP
         WHERE id = $5 AND reclutador_id = $6`,
        [titulo.trim(), descripcion.trim(), requisitos ? requisitos.trim() : null, estado, vacanteId, req.usuario.id]
      );
    } else {
      await pool.query(
        `INSERT INTO vacantes (reclutador_id, titulo, descripcion, requisitos, estado)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.usuario.id, titulo.trim(), descripcion.trim(), requisitos ? requisitos.trim() : null, estado]
      );
    }

    res.redirect(303, `/empresa/vacantes?aviso=${estado === 'borrador' ? 'borrador-guardado' : 'vacante-publicada'}`);
  } catch (err) {
    console.error('[Error crear vacante]', err);
    res.redirect(303, '/empresa/vacantes?aviso=error');
  }
});

// Actualizar vacante existente (POST /empresa/vacantes/:id)
router.post('/vacantes/:id', async (req, res) => {
  const { titulo, descripcion, requisitos, accion } = req.body;
  if (!titulo || !descripcion) {
    return res.redirect(303, '/empresa/vacantes?aviso=error-campos');
  }

  const estado = accion === 'borrador' ? 'borrador' : 'publicada';

  try {
    await pool.query(
      `UPDATE vacantes SET titulo = $1, descripcion = $2, requisitos = $3, estado = $4, actualizado_en = CURRENT_TIMESTAMP
       WHERE id = $5 AND reclutador_id = $6`,
      [titulo.trim(), descripcion.trim(), requisitos ? requisitos.trim() : null, estado, req.params.id, req.usuario.id]
    );

    res.redirect(303, '/empresa/vacantes?aviso=vacante-actualizada');
  } catch (err) {
    console.error('[Error actualizar vacante]', err);
    res.redirect(303, '/empresa/vacantes?aviso=error');
  }
});

// Autoguardado de borrador vía fetch
router.post('/autoguardado', async (req, res) => {
  const { id, titulo, descripcion, requisitos } = req.body;
  if (!titulo) return res.json({ ok: false });

  try {
    let vacanteId = id ? Number(id) : null;
    if (vacanteId) {
      await pool.query(
        `UPDATE vacantes SET titulo = $1, descripcion = COALESCE($2, descripcion), requisitos = $3, actualizado_en = CURRENT_TIMESTAMP
         WHERE id = $4 AND reclutador_id = $5`,
        [titulo.trim(), descripcion ? descripcion.trim() : null, requisitos ? requisitos.trim() : null, vacanteId, req.usuario.id]
      );
    } else {
      const q = await pool.query(
        `INSERT INTO vacantes (reclutador_id, titulo, descripcion, requisitos, estado)
         VALUES ($1, $2, $3, $4, 'borrador') RETURNING id`,
        [req.usuario.id, titulo.trim(), (descripcion || 'Borrador sin descripción').trim(), requisitos ? requisitos.trim() : null]
      );
      vacanteId = q.rows[0].id;
    }

    const hora = new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
    res.json({ ok: true, id: vacanteId, hora });
  } catch (e) {
    res.json({ ok: false });
  }
});

// Publicar vacante
router.post('/vacantes/:id/publicar', async (req, res) => {
  try {
    await pool.query(
      `UPDATE vacantes SET estado = 'publicada', actualizado_en = CURRENT_TIMESTAMP WHERE id = $1 AND reclutador_id = $2`,
      [req.params.id, req.usuario.id]
    );
    res.redirect(303, '/empresa/vacantes?aviso=vacante-publicada');
  } catch (err) {
    res.redirect(303, '/empresa/vacantes');
  }
});

// Cerrar vacante
router.post('/vacantes/:id/cerrar', async (req, res) => {
  try {
    await pool.query(
      `UPDATE vacantes SET estado = 'cerrada', actualizado_en = CURRENT_TIMESTAMP WHERE id = $1 AND reclutador_id = $2`,
      [req.params.id, req.usuario.id]
    );
    res.redirect(303, '/empresa/vacantes?aviso=vacante-cerrada');
  } catch (err) {
    res.redirect(303, '/empresa/vacantes');
  }
});

// Duplicar vacante
router.post('/vacantes/:id/duplicar', async (req, res) => {
  try {
    const qOrig = await pool.query(
      `SELECT titulo, descripcion, requisitos FROM vacantes WHERE id = $1 AND reclutador_id = $2`,
      [req.params.id, req.usuario.id]
    );
    if (qOrig.rows.length > 0) {
      const orig = qOrig.rows[0];
      await pool.query(
        `INSERT INTO vacantes (reclutador_id, titulo, descripcion, requisitos, estado)
         VALUES ($1, $2, $3, $4, 'borrador')`,
        [req.usuario.id, `${orig.titulo} (Copia)`, orig.descripcion, orig.requisitos]
      );
    }
    res.redirect(303, '/empresa/vacantes?aviso=vacante-duplicada');
  } catch (err) {
    console.error('[Error duplicar vacante]', err);
    res.redirect(303, '/empresa/vacantes');
  }
});

// Eliminar vacante o borrador
router.post('/vacantes/:id/eliminar', async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM vacantes WHERE id = $1 AND reclutador_id = $2`,
      [req.params.id, req.usuario.id]
    );
    res.redirect(303, '/empresa/vacantes?aviso=vacante-eliminada');
  } catch (err) {
    console.error('[Error eliminar vacante]', err);
    res.redirect(303, '/empresa/vacantes');
  }
});

// -------------------------------------------------------------
// 2. BANDEJA DE POSTULANTES (SOLO VACANTES PROPIAS)
// -------------------------------------------------------------
router.get('/postulantes', async (req, res) => {
  try {
    // Vacantes del reclutador
    const qVac = await pool.query(
      `SELECT id, titulo FROM vacantes WHERE reclutador_id = $1 ORDER BY creado_en DESC`,
      [req.usuario.id]
    );

    const vacantes = qVac.rows;
    if (vacantes.length === 0) {
      return res.render('empresa/postulantes', {
        title: 'Postulantes · TrabajaYa',
        active: 'postulantes',
        vacantes: [],
        vacante: null,
        postulantes: [],
        estado: 'vacio',
        terna: [],
        detalle: null,
        baseUrl: '/empresa/postulantes',
        scripts: ['/js/pages/postulantes.js']
      });
    }

    const vacanteId = req.query.vacante ? Number(req.query.vacante) : vacantes[0].id;
    const vacanteSel = vacantes.find(v => v.id === vacanteId) || vacantes[0];

    const qPost = await pool.query(
      `SELECT p.id, p.score_ats, p.estado, p.creado_en, u.nombre, u.email, u.foto_url
       FROM postulaciones p
       JOIN usuarios u ON p.candidato_id = u.id
       JOIN vacantes v ON p.vacante_id = v.id
       WHERE p.vacante_id = $1 AND v.reclutador_id = $2
       ORDER BY p.score_ats DESC`,
      [vacanteSel.id, req.usuario.id]
    );

    const postulantes = qPost.rows.map(p => ({
      id: p.id,
      nombre: p.nombre,
      correo: p.email,
      ats: p.score_ats || 75,
      entrevista: 80,
      estado: p.estado === 'postulado' ? 'revision' : (p.estado === 'en_terna' ? 'terna' : p.estado),
      estadoVista: { clave: p.estado, label: p.estado.toUpperCase() },
      enTerna: p.estado === 'en_terna'
    }));

    res.render('empresa/postulantes', {
      title: 'Postulantes · TrabajaYa',
      active: 'postulantes',
      vacantes: vacantes.map(v => ({ id: v.id, titulo: v.titulo, total: postulantes.length })),
      vacante: vacanteSel,
      postulantes,
      estado: postulantes.length ? 'ok' : 'vacio',
      terna: postulantes.filter(p => p.enTerna),
      detalle: null,
      baseUrl: `/empresa/postulantes?vacante=${vacanteSel.id}`,
      scripts: ['/js/pages/postulantes.js']
    });
  } catch (err) {
    console.error('[Error Postulantes Empresa]', err);
    res.status(500).render('404', { title: 'Error cargando postulantes' });
  }
});

// -------------------------------------------------------------
// 3. PERFIL DE EMPRESA (AISLADO EN POSTGRESQL)
// -------------------------------------------------------------
router.get('/perfil', async (req, res) => {
  const u = req.usuario;
  const ep = u.empresa_perfil || {};
  res.render('empresa/perfil', {
    title: 'Perfil de empresa · TrabajaYa',
    active: 'empresa',
    perfil: {
      nombre: u.empresa_nombre || u.nombre,
      correo: u.email,
      sector: ep.sector || 'Tecnología',
      tamano: ep.tamano || '1–10 personas',
      sitio: ep.sitio || '',
      ubicacion: ep.ubicacion || 'Guatemala',
      telefono: ep.telefono || '',
      descripcion: ep.descripcion || '',
      logoUrl: ep.logoUrl || null
    },
    opciones: mockDb.opciones,
    errores: {},
    scripts: ['/js/pages/perfil.js']
  });
});

router.post('/perfil', async (req, res) => {
  const { nombre, sector, tamano, sitio, ubicacion, telefono, descripcion } = req.body;
  try {
    const nombreFinal = (nombre || req.usuario.empresa_nombre || req.usuario.nombre).trim();
    const epActual = req.usuario.empresa_perfil || {};
    const nuevoPerfil = {
      ...epActual,
      sector: (sector || epActual.sector || '').trim(),
      tamano: (tamano || epActual.tamano || '').trim(),
      sitio: (sitio || epActual.sitio || '').trim(),
      ubicacion: (ubicacion || epActual.ubicacion || '').trim(),
      telefono: (telefono || epActual.telefono || '').trim(),
      descripcion: (descripcion || epActual.descripcion || '').trim()
    };

    await pool.query(
      'UPDATE usuarios SET empresa_nombre = $1, empresa_perfil = $2 WHERE id = $3',
      [nombreFinal, JSON.stringify(nuevoPerfil), req.usuario.id]
    );

    res.redirect(303, '/empresa/perfil?aviso=perfil-guardado');
  } catch (err) {
    console.error('[Error guardar perfil empresa]', err);
    res.redirect(303, '/empresa/perfil');
  }
});

export default router;
