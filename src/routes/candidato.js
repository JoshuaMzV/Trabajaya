import { Router } from 'express';
import multer from 'multer';
import pool from '../lib/db.js';
import { requerirRol } from '../lib/auth.js';
import { procesarCvConGemini, adaptarCvConGemini } from '../lib/gemini.js';
import { extraerTextoDeArchivo, parsearCurriculumDeterminista } from '../lib/parser-cv.js';
import { generarPdfCv } from '../lib/pdf.js';
import * as mockDb from '../mocks/candidato.js';

const router = Router();
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB máximo
  fileFilter: (req, file, cb) => {
    const tiposPermitidos = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (tiposPermitidos.includes(file.mimetype) || file.originalname.toLowerCase().endsWith('.pdf') || file.originalname.toLowerCase().endsWith('.docx')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos en formato PDF o DOCX (máximo 10MB).'));
    }
  }
});

// =========================================================================
// PROTECCIÓN ESTRICTA: Todas las rutas de candidato requieren rol 'candidato'
// =========================================================================
router.use(requerirRol('candidato'));

const hoy = () => new Date().toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' });

// Middleware para inyectar datos del usuario real y layout
router.use(async (req, res, next) => {
  const u = req.usuario;
  const saldo = u.trabajacoins_saldo || 0;
  const esPro = (u.plan === 'pro_unlimited' || u.plan === 'PRO');

  // Obtener últimos movimientos reales
  let movimientos = [];
  try {
    const qMovs = await pool.query(
      `SELECT tipo, cantidad, descripcion as concepto, creado_en FROM transacciones_coins 
       WHERE usuario_id = $1 ORDER BY creado_en DESC LIMIT 2`,
      [u.id]
    );
    movimientos = qMovs.rows.map(m => ({
      tipo: m.cantidad < 0 ? 'cargo' : 'abono',
      monedas: Math.abs(m.cantidad),
      concepto: m.concepto
    }));
  } catch (err) {
    console.error('Error fetching movimientos:', err.message);
  }

  res.locals.layout = 'app';
  res.locals.role = 'cand';
  res.locals.usuario = {
    id: u.id,
    nombre: u.nombre,
    correo: u.email,
    avatarUrl: u.foto_url || null,
    plan: esPro ? 'PRO' : 'Gratis',
    saldo: saldo,
    movimientos: movimientos
  };
  res.locals.esPro = esPro;
  res.locals.packsModal = {
    abrir: req.query.packs === '1',
    paso: 1,
    compra: 'pack',
    packs: mockDb.packs.filter(p => p.activo),
    precioPro: mockDb.precios.proMensual,
    volver: req.originalUrl
  };
  res.locals.soporteModal = {
    abrir: req.query.soporte === '1',
    tickets: [],
    estados: mockDb.estadosTicket,
    categorias: mockDb.categoriasSoporte,
    sla: mockDb.soporte || { vip: "menos de 2 horas", estandar: "24 horas" },
    volver: req.originalUrl
  };
  const avisosCandidato = {
    'error-archivo': { titulo: 'Archivo no válido', mensaje: 'Por favor sube un archivo PDF o DOCX de hasta 10 MB.', variante: 'danger' },
    'error-ocr': { titulo: 'Error al procesar el CV', mensaje: 'No pudimos extraer el texto con OCR. Asegúrate de que sea un archivo válido o reinténtalo.', variante: 'danger' },
    'expediente-guardado': { titulo: 'Expediente actualizado', mensaje: 'Tu Expediente Maestro fue procesado y guardado exitosamente.', variante: 'success' },
    'expediente-eliminado': { titulo: 'Expediente eliminado', mensaje: 'Se eliminó tu Expediente Maestro.', variante: 'info' },
    'ya-postulado': { titulo: 'Ya postulado', mensaje: 'Ya enviaste tu postulación para esta vacante.', variante: 'info' },
    'practica-iniciada': { titulo: 'Práctica iniciada', mensaje: 'Comienza tu sesión de práctica.', variante: 'info' }
  };
  res.locals.styles = ['/css/pages/candidato.css'];
  res.locals.aviso = avisosCandidato[req.query.aviso] || null;
  next();
});

// -------------------------------------------------------------
// 1. MURO DE EMPLEOS
// -------------------------------------------------------------
router.get('/muro', async (req, res) => {
  try {
    const u = req.usuario;

    // 1. Contar postulaciones activas reales del candidato en PostgreSQL
    let activas = 0;
    try {
      const qActivas = await pool.query(
        "SELECT COUNT(*) FROM postulaciones WHERE candidato_id = $1 AND estado != 'descartado'",
        [u.id]
      );
      activas = Number(qActivas.rows[0].count) || 0;
    } catch (e) {
      activas = 0;
    }

    // 2. Obtener vacantes publicadas
    const qVacantes = await pool.query(
      `SELECT v.id, v.titulo, v.descripcion, v.requisitos, v.estado, v.creado_en, 
              u.empresa_nombre, u.nombre as reclutador_nombre
       FROM vacantes v
       JOIN usuarios u ON v.reclutador_id = u.id
       WHERE v.estado = 'publicada'
       ORDER BY v.creado_en DESC`
    );

    const toArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      return String(val).split('\n').map(s => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);
    };

    const vacantesReales = qVacantes.rows.map(v => {
      const descArr = toArray(v.descripcion);
      const reqArr = toArray(v.requisitos);
      return {
        id: v.id,
        puesto: v.titulo,
        empresa: v.empresa_nombre || v.reclutador_nombre || 'Empresa Confidencial',
        descripcion: descArr.length ? descArr : ['Sin descripción detallada.'],
        requisitos: reqArr.length ? reqArr : ['Sin requisitos especificados.'],
        competencias: ['Adaptabilidad', 'Comunicación', 'Resolución de problemas'],
        ciudad: 'Guatemala',
        ubicacion: 'Guatemala',
        modalidad: 'Híbrido',
        jornada: 'Tiempo completo',
        salario: 'A convenir',
        sobreEmpresa: 'Empresa verificada en la plataforma TrabajaYa.',
        preguntas: 5,
        duracion: 15,
        match: 85,
        dias: Math.max(0, Math.floor((Date.now() - new Date(v.creado_en).getTime()) / (1000 * 60 * 60 * 24)))
      };
    });

    const lista = vacantesReales.length ? vacantesReales : mockDb.vacantes;
    const vacanteId = req.query.vacante ? Number(req.query.vacante) : null;
    const vacanteSel = lista.find(v => v.id === vacanteId) || null;
    const tieneExpediente = Boolean(u.perfil_maestro && u.perfil_maestro.extracto);

    const detalle = vacanteSel ? {
      vacante: {
        ...vacanteSel,
        descripcion: toArray(vacanteSel.descripcion),
        requisitos: toArray(vacanteSel.requisitos),
        competencias: toArray(vacanteSel.competencias || ['Adaptabilidad', 'Comunicación']),
        jornada: vacanteSel.jornada || 'Tiempo completo',
        salario: vacanteSel.salario || 'A convenir',
        sobreEmpresa: vacanteSel.sobreEmpresa || 'Empresa verificada en TrabajaYa.',
        preguntas: vacanteSel.preguntas || 5,
        duracion: vacanteSel.duracion || 15,
        match: vacanteSel.match || 80
      },
      tieneExpediente,
      estado: null,
      postulado: false,
      costoPostulacion: 1,
      costoEntrevista: 1,
      esPro: res.locals.esPro
    } : null;

    res.render('candidato/muro', {
      title: 'Muro de empleos · TrabajaYa',
      active: 'muro',
      baseUrl: '/candidato/muro',
      vacantes: lista,
      vacanteSel,
      detalle,
      total: lista.length,
      activas,
      tieneExpediente,
      estado: lista.length ? 'ok' : 'vacio',
      hayFiltros: Boolean(req.query.q || req.query.ubicacion || req.query.modalidad || req.query.area),
      masUrl: null,
      filtros: { q: req.query.q || '', ubicacion: req.query.ubicacion || '', modalidad: req.query.modalidad || '', area: req.query.area || '', orden: req.query.orden || 'match' },
      opciones: mockDb.filtrosMuro,
      scripts: ['/js/pages/candidato.js']
    });
  } catch (err) {
    console.error('[Error Muro]', err);
    res.status(500).render('404', { title: 'Error cargando vacantes' });
  }
});

// -------------------------------------------------------------
// 2. EXPEDIENTE MAESTRO (AISLADO, LIMPIO Y OCR MULTIMODAL)
// -------------------------------------------------------------
router.get('/expediente', (req, res) => {
  const u = req.usuario;
  const pm = u.perfil_maestro;

  const estaCargado = Boolean(pm && pm.extracto);

  const rawExp = pm?.datos?.experiencia || [];
  const experienciaMapeada = rawExp.map((x, idx) => ({
    id: x.id || `exp_${idx + 1}`,
    puesto: x.puesto || x.cargo || 'Profesional',
    empresa: x.empresa || 'Empresa',
    desde: x.desde || (x.periodo ? x.periodo.split(/[-–—a]/)[0]?.trim() : '2021'),
    hasta: x.hasta || (x.periodo ? (x.periodo.split(/[-–—a]/)[1]?.trim() || 'Actualidad') : 'Actualidad'),
    descripcion: x.descripcion || (Array.isArray(x.logros) ? x.logros.join('. ') : (x.logros || ''))
  }));

  const rawEdu = pm?.datos?.educacion || [];
  const educacionMapeada = rawEdu.map((d, idx) => ({
    id: d.id || `edu_${idx + 1}`,
    titulo: d.titulo || d.carrera || 'Estudios Superiores',
    institucion: d.institucion || d.universidad || 'Institución Educativa',
    anio: d.anio || d.periodo || 'Graduado'
  }));

  const expediente = {
    personal: {
      nombre: pm?.datos?.nombre || u.nombre || '',
      correo: pm?.datos?.email || u.email || '',
      telefono: pm?.datos?.telefono || '',
      ciudad: pm?.datos?.ubicacion || ''
    },
    resumen: pm?.datos?.resumen || '',
    archivo: {
      nombre: pm?.archivoNombre || 'mi-cv.pdf',
      actualizado: pm?.actualizado || hoy(),
      progreso: 100,
      url: null
    },
    experiencia: experienciaMapeada,
    educacion: educacionMapeada,
    habilidades: pm?.datos?.habilidades || [],
    idiomas: pm?.datos?.idiomas || []
  };

  res.render('candidato/expediente', {
    title: 'Expediente Maestro · TrabajaYa',
    active: 'expediente',
    estado: estaCargado ? 'cargado' : 'sin-archivo',
    maxMb: 10,
    consultarEstado: false,
    expediente,
    scripts: ['/js/pages/candidato.js', '/js/pages/expediente.js']
  });
});

// Carga y procesamiento del CV (Determinista con fallback / IA opcional)
router.post('/expediente/cv', upload.fields([{ name: 'cv', maxCount: 1 }, { name: 'archivo', maxCount: 1 }]), async (req, res) => {
  const file = req.files?.cv?.[0] || req.files?.archivo?.[0] || req.file;
  if (!file) {
    return res.redirect(303, '/candidato/expediente?aviso=error-archivo');
  }

  try {
    const mime = file.mimetype || 'application/pdf';
    let perfilDatos = null;

    // 1. Intentar extracción determinista primero (sin latencia de red ni riesgo de cuota/404)
    try {
      const textoExtraido = await extraerTextoDeArchivo(file.buffer, mime);
      if (textoExtraido && textoExtraido.trim().length > 20) {
        perfilDatos = parsearCurriculumDeterminista(textoExtraido, {
          nombre: req.usuario.nombre,
          email: req.usuario.email
        });
      }
    } catch (parseErr) {
      console.warn('[Parser determinista aviso]', parseErr.message);
    }

    // 2. Si no se pudo extraer texto determinista o si Gemini está disponible y configurado
    if (!perfilDatos) {
      try {
        perfilDatos = await procesarCvConGemini(file.buffer, mime);
      } catch (geminiErr) {
        console.warn('[Gemini OCR no disponible]', geminiErr.message);
      }
    }

    // 3. Fallback de emergencia si el archivo era una imagen o escaneo no reconocido
    if (!perfilDatos) {
      perfilDatos = {
        nombre: req.usuario.nombre || 'Candidato',
        email: req.usuario.email || '',
        telefono: '',
        ubicacion: 'Guatemala',
        profesion: 'Profesional',
        resumen: 'Perfil profesional registrado en TrabajaYa.',
        habilidades: ['Trabajo en equipo', 'Resolución de problemas', 'Responsabilidad profesional'],
        experiencia: [],
        educacion: [],
        certificaciones: [],
        idiomas: ['Español'],
        textoCompleto: ''
      };
    }

    const perfilMaestro = {
      archivoNombre: file.originalname,
      actualizado: hoy(),
      extracto: perfilDatos.textoCompleto || perfilDatos.resumen || '',
      datos: {
        nombre: perfilDatos.nombre || req.usuario.nombre,
        email: perfilDatos.email || req.usuario.email,
        telefono: perfilDatos.telefono || '',
        ubicacion: perfilDatos.ubicacion || '',
        profesion: perfilDatos.profesion || 'Profesional',
        resumen: perfilDatos.resumen || '',
        habilidades: perfilDatos.habilidades || [],
        experiencia: perfilDatos.experiencia || [],
        educacion: perfilDatos.educacion || [],
        certificaciones: perfilDatos.certificaciones || [],
        idiomas: perfilDatos.idiomas || []
      }
    };

    await pool.query(
      `UPDATE usuarios SET perfil_maestro = $1, nombre = COALESCE($2, nombre) WHERE id = $3`,
      [JSON.stringify(perfilMaestro), perfilMaestro.datos.nombre, req.usuario.id]
    );

    res.redirect(303, '/candidato/expediente?aviso=expediente-guardado');
  } catch (err) {
    console.error('[Error procesamiento CV]', err);
    res.redirect(303, '/candidato/expediente?aviso=error-ocr');
  }
});

// Guardar cambios manuales en Expediente
router.post('/expediente', async (req, res) => {
  try {
    const b = req.body;
    const pmActual = req.usuario.perfil_maestro || { datos: {} };

    pmActual.datos = {
      ...pmActual.datos,
      nombre: b.nombre || pmActual.datos.nombre,
      email: b.correo || pmActual.datos.email,
      telefono: b.telefono || pmActual.datos.telefono,
      ubicacion: b.ciudad || pmActual.datos.ubicacion,
      resumen: b.resumen || pmActual.datos.resumen
    };
    pmActual.actualizado = hoy();

    await pool.query(
      `UPDATE usuarios SET perfil_maestro = $1, nombre = COALESCE($2, nombre) WHERE id = $3`,
      [JSON.stringify(pmActual), pmActual.datos.nombre, req.usuario.id]
    );

    res.redirect(303, '/candidato/expediente?aviso=expediente-guardado');
  } catch (err) {
    console.error('[Error guardar expediente]', err);
    res.redirect(303, '/candidato/expediente');
  }
});

// Eliminar Expediente Maestro
router.post('/expediente/eliminar', async (req, res) => {
  try {
    await pool.query('UPDATE usuarios SET perfil_maestro = NULL WHERE id = $1', [req.usuario.id]);
    res.redirect(303, '/candidato/expediente?aviso=expediente-eliminado');
  } catch (err) {
    res.redirect(303, '/candidato/expediente');
  }
});

// -------------------------------------------------------------
// 3. ADAPTADOR ATS (ATÓMICO, SIN INVENTAR HABILIDADES) (F04, F06)
// -------------------------------------------------------------
router.get('/adaptador', async (req, res) => {
  const u = req.usuario;
  const pm = u.perfil_maestro;
  const sinExpediente = !pm || !pm.extracto;

  // Cargar vacantes reales
  const qVacantes = await pool.query(`SELECT id, titulo, descripcion FROM vacantes WHERE estado = 'publicada'`);
  const vacantes = qVacantes.rows.map(v => ({ id: v.id, puesto: v.titulo, empresa: 'Empresa', descripcion: v.descripcion }));
  const listaVacantes = vacantes.length ? vacantes : mockDb.vacantes;

  // Si hay cv en query, cargar de BD
  let cv = null;
  if (req.query.cv) {
    const qCv = await pool.query(
      `SELECT * FROM cvs_adaptados WHERE id = $1 AND candidato_id = $2`,
      [req.query.cv, u.id]
    );
    if (qCv.rows.length > 0) {
      const fila = qCv.rows[0];
      cv = {
        id: fila.id,
        vacanteId: fila.vacante_id,
        estilo: fila.estilo,
        match: fila.match_score,
        fecha: hoy(),
        ...fila.resultado_json
      };
    }
  }

  res.render('candidato/adaptador', {
    title: 'Adaptador ATS · TrabajaYa',
    active: 'adaptador',
    vacantes: listaVacantes,
    vacanteSel: listaVacantes.find(v => v.id === Number(req.query.vacante)) || listaVacantes[0],
    estilos: mockDb.estilosCv,
    estiloSel: req.query.estilo || 'ats',
    costo: 1,
    esPro: res.locals.esPro,
    estado: sinExpediente ? 'sin-expediente' : cv ? 'listo' : 'inicial',
    cv,
    expediente: sinExpediente ? { estado: 'vacio' } : { estado: 'cargado', datos: pm.datos },
    scripts: ['/js/pages/candidato.js', '/js/pages/adaptador.js']
  });
});

// Proceso Atómico de Adaptación (descuento solo tras éxito)
router.post('/adaptador', async (req, res) => {
  const u = req.usuario;
  const pm = u.perfil_maestro;

  if (!pm || !pm.extracto) {
    return res.redirect(303, '/candidato/adaptador?estado=sin-expediente');
  }

  const vacanteId = Number(req.body.vacante);
  const estilo = req.body.estilo === 'ejecutivo' ? 'ejecutivo' : 'ats';

  const esPro = (u.plan === 'pro_unlimited' || u.plan === 'PRO');
  const saldo = u.trabajacoins_saldo || 0;

  if (!esPro && saldo < 1) {
    res.locals.packsModal.abrir = true;
    return res.redirect(303, '/candidato/adaptador?packs=1&aviso=sin-saldo');
  }

  // Obtener descripción de la vacante
  let vacanteTitulo = 'Vacante General';
  let vacanteDesc = '';
  try {
    const qV = await pool.query('SELECT titulo, descripcion FROM vacantes WHERE id = $1', [vacanteId]);
    if (qV.rows.length > 0) {
      vacanteTitulo = qV.rows[0].titulo;
      vacanteDesc = qV.rows[0].descripcion;
    }
  } catch (err) {
    vacanteDesc = 'Requisitos generales de la posición.';
  }

  const client = await pool.connect();
  try {
    // 1. Ejecutar análisis estricto en Gemini (sin inventar habilidades)
    const analisis = await adaptarCvConGemini({
      masterExtracto: pm.extracto,
      masterDatos: pm.datos,
      vacanteTitulo,
      vacanteDescripcion: vacanteDesc,
      estilo
    });

    // 2. Transacción atómica en PostgreSQL: guardar CV y cobrar moneda
    await client.query('BEGIN');

    const insertCv = await client.query(
      `INSERT INTO cvs_adaptados (candidato_id, vacante_id, estilo, match_score, resultado_json)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [u.id, vacanteId || null, estilo, analisis.matchScore || 80, JSON.stringify(analisis)]
    );

    const cvId = insertCv.rows[0].id;

    if (!esPro) {
      const nuevoSaldo = saldo - 1;
      await client.query('UPDATE usuarios SET trabajacoins_saldo = $1 WHERE id = $2', [nuevoSaldo, u.id]);
      await client.query(
        `INSERT INTO transacciones_coins (usuario_id, tipo, cantidad, saldo_resultante, descripcion) 
         VALUES ($1, 'CONSUMO_CV', -1, $2, 'Adaptación de CV con IA')`,
        [u.id, nuevoSaldo]
      );
    }

    await client.query('COMMIT');
    res.redirect(303, `/candidato/adaptador?cv=${cvId}&vacante=${vacanteId}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Error Adaptación ATS]', err);
    res.redirect(303, '/candidato/adaptador?aviso=error-adaptacion');
  } finally {
    client.release();
  }
});

// Descarga real application/pdf (F06)
router.get('/cvs/:id/descargar', async (req, res) => {
  try {
    const qCv = await pool.query(
      `SELECT * FROM cvs_adaptados WHERE id = $1 AND candidato_id = $2`,
      [req.params.id, req.usuario.id]
    );

    if (qCv.rows.length === 0) {
      return res.status(404).send('CV no encontrado o acceso no autorizado.');
    }

    const fila = qCv.rows[0];
    const datos = req.usuario.perfil_maestro?.datos || {};
    const resultado = fila.resultado_json || {};

    const pdfBytes = await generarPdfCv({
      datos: {
        nombre: datos.nombre || req.usuario.nombre,
        email: datos.email || req.usuario.email,
        telefono: datos.telefono || '',
        ubicacion: datos.ubicacion || '',
        profesion: datos.profesion || ''
      },
      resumen: resultado.resumenAdaptado || datos.resumen,
      experiencia: datos.experiencia || [],
      educacion: datos.educacion || [],
      habilidades: resultado.habilidadesDestacadas || datos.habilidades || []
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="CV_Adaptado_${req.usuario.nombre.replace(/\s+/g, '_')}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('[Error Descargar PDF]', err);
    res.status(500).send('Error generando el archivo PDF.');
  }
});

// -------------------------------------------------------------
// 4. POSTULACIONES REALES
// -------------------------------------------------------------
router.get('/postulaciones', async (req, res) => {
  const u = req.usuario;
  try {
    const qPosts = await pool.query(
      `SELECT p.id, p.vacante_id, p.score_ats, p.estado, p.creado_en, p.actualizado_en,
              v.titulo as puesto, u_rec.empresa_nombre, u_rec.nombre as reclutador_nombre
       FROM postulaciones p
       JOIN vacantes v ON p.vacante_id = v.id
       JOIN usuarios u_rec ON v.reclutador_id = u_rec.id
       WHERE p.candidato_id = $1
       ORDER BY p.creado_en DESC`,
      [u.id]
    );

    const postulaciones = qPosts.rows.map(p => ({
      id: p.id,
      vacanteId: p.vacante_id,
      estado: p.estado === 'postulado' ? 'revision' : (p.estado === 'en_terna' ? 'aprobado' : p.estado),
      fecha: new Date(p.creado_en).toLocaleDateString('es-GT'),
      actualizada: new Date(p.actualizado_en).toLocaleDateString('es-GT'),
      vacante: {
        id: p.vacante_id,
        puesto: p.puesto,
        empresa: p.empresa_nombre || p.reclutador_nombre || 'Empresa'
      }
    }));

    // Cargar CVs adaptados reales del usuario
    const qCvs = await pool.query(
      `SELECT c.id, c.vacante_id, c.estilo, c.match_score, c.creado_en, v.titulo as puesto
       FROM cvs_adaptados c
       LEFT JOIN vacantes v ON c.vacante_id = v.id
       WHERE c.candidato_id = $1 ORDER BY c.creado_en DESC`,
      [u.id]
    );

    const cvsAdaptados = qCvs.rows.map(c => ({
      id: c.id,
      vacanteId: c.vacante_id,
      estilo: c.estilo,
      match: c.match_score,
      fecha: new Date(c.creado_en).toLocaleDateString('es-GT'),
      vacante: { puesto: c.puesto || 'Puesto', empresa: 'Empresa' }
    }));

    res.render('candidato/postulaciones', {
      title: 'Mis Postulaciones · TrabajaYa',
      active: 'postulaciones',
      tab: req.query.tab || 'postulaciones',
      postulaciones,
      practicas: [],
      cvs: cvsAdaptados,
      estados: mockDb.estadosPostulacion,
      estilos: mockDb.estilosCv,
      enviada: null,
      scripts: ['/js/pages/candidato.js', '/js/pages/postulaciones.js']
    });
  } catch (err) {
    console.error('[Error Postulaciones]', err);
    res.status(500).render('404', { title: 'Error cargando postulaciones' });
  }
});

// -------------------------------------------------------------
// 5. SALA DE ENTREVISTA IA (PRACTICA Y POSTULACION)
// -------------------------------------------------------------
router.get('/entrevista', async (req, res) => {
  try {
    const u = req.usuario;
    const modo = req.query.modo === 'postulacion' ? 'postulacion' : 'practica';
    const esPro = res.locals.esPro;
    const tieneExpediente = Boolean(u.perfil_maestro && u.perfil_maestro.extracto);

    // Cargar vacantes disponibles
    const qVacantes = await pool.query(`SELECT id, titulo, descripcion FROM vacantes WHERE estado = 'publicada' ORDER BY creado_en DESC`);
    let vacantes = qVacantes.rows.map(v => ({
      id: v.id,
      puesto: v.titulo,
      empresa: 'Empresa',
      preguntas: 5,
      duracion: 15
    }));

    if (!vacantes.length) {
      vacantes = mockDb.vacantes.map(v => ({
        id: v.id,
        puesto: v.puesto,
        empresa: v.empresa,
        preguntas: v.preguntas || 5,
        duracion: v.duracion || 15
      }));
    }

    const vacanteId = req.query.vacante ? Number(req.query.vacante) : vacantes[0]?.id;
    const vacante = vacantes.find(v => v.id === vacanteId) || vacantes[0] || {
      id: 1,
      puesto: 'Vacante general',
      empresa: 'Empresa',
      preguntas: 5,
      duracion: 15
    };

    let bloqueo = null;
    if (modo === 'postulacion') {
      if (!tieneExpediente) {
        bloqueo = 'sin-expediente';
      } else {
        // Verificar si ya se postuló
        const qPost = await pool.query(
          'SELECT id FROM postulaciones WHERE candidato_id = $1 AND vacante_id = $2',
          [u.id, vacante.id]
        );
        if (qPost.rows.length > 0) {
          bloqueo = 'ya-postulado';
        }
      }
    }

    const costo = 1;
    const sinSaldo = !esPro && (u.trabajacoins_saldo || 0) < costo;

    res.render('candidato/entrevista', {
      title: 'Sala de Entrevista IA · TrabajaYa',
      active: 'entrevista',
      fase: 0,
      modo,
      vacante,
      vacantes,
      costo,
      sinSaldo,
      bloqueo,
      scripts: ['/js/pages/candidato.js', '/js/pages/entrevista.js']
    });
  } catch (err) {
    console.error('[Error Entrevista]', err);
    res.status(500).render('404', { title: 'Error cargando sala de entrevista' });
  }
});

router.post('/entrevista', async (req, res) => {
  const { modo, vacante: vacanteId } = req.body;
  const u = req.usuario;
  const esPro = res.locals.esPro;
  const saldo = u.trabajacoins_saldo || 0;

  if (modo === 'postulacion') {
    try {
      // Verificar si ya se postuló
      const qCheck = await pool.query(
        'SELECT id FROM postulaciones WHERE candidato_id = $1 AND vacante_id = $2',
        [u.id, vacanteId]
      );
      if (qCheck.rows.length > 0) {
        return res.redirect(303, `/candidato/entrevista?modo=postulacion&vacante=${vacanteId}&aviso=ya-postulado`);
      }

      // Cobro si no es PRO
      if (!esPro && saldo < 1) {
        return res.redirect(303, `/candidato/entrevista?modo=postulacion&vacante=${vacanteId}&packs=1`);
      }

      if (!esPro) {
        await pool.query('UPDATE usuarios SET trabajacoins_saldo = trabajacoins_saldo - 1 WHERE id = $1', [u.id]);
        await pool.query(
          `INSERT INTO transacciones_coins (usuario_id, tipo, cantidad, saldo_resultante, descripcion) 
           VALUES ($1, 'CONSUMO_ENTREVISTA', -1, $2, 'Entrevista de postulación')`,
          [u.id, saldo - 1]
        );
      }

      await pool.query(
        `INSERT INTO postulaciones (candidato_id, vacante_id, score_ats, estado)
         VALUES ($1, $2, $3, 'postulado')`,
        [u.id, vacanteId, 85]
      );

      return res.redirect(303, `/candidato/postulaciones?enviada=${vacanteId}`);
    } catch (e) {
      console.error('[Error iniciar postulación]', e);
      return res.redirect(303, '/candidato/muro');
    }
  }

  // Si es práctica:
  res.redirect(303, `/candidato/entrevista?modo=practica&vacante=${vacanteId}&aviso=practica-iniciada`);
});

export default router;
