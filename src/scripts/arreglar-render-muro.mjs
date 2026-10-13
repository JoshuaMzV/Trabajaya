import fs from 'fs';

let s = fs.readFileSync('src/routes/candidato.js', 'utf8');

// Reemplazar la ruta /muro para calcular postulaciones activas y pasar todas las variables esperadas por muro.ejs
const oldMuro = `router.get('/muro', async (req, res) => {
  try {
    const qVacantes = await pool.query(
      \`SELECT v.id, v.titulo, v.descripcion, v.requisitos, v.estado, v.creado_en, 
              u.empresa_nombre, u.nombre as reclutador_nombre
       FROM vacantes v
       JOIN usuarios u ON v.reclutador_id = u.id
       WHERE v.estado = 'publicada'
       ORDER BY v.creado_en DESC\`
    );

    const vacantesReales = qVacantes.rows.map(v => ({
      id: v.id,
      puesto: v.titulo,
      empresa: v.empresa_nombre || v.reclutador_nombre || 'Empresa Confidencial',
      descripcion: v.descripcion,
      requisitos: v.requisitos || '',
      ubicacion: 'Guatemala',
      modalidad: 'Híbrido',
      match: 80,
      dias: Math.floor((Date.now() - new Date(v.creado_en).getTime()) / (1000 * 60 * 60 * 24))
    }));

    const lista = vacantesReales.length ? vacantesReales : mockDb.vacantes;
    const vacanteId = req.query.vacante ? Number(req.query.vacante) : null;
    const vacanteSel = lista.find(v => v.id === vacanteId) || null;

    const u = req.usuario;
    const tieneExpediente = Boolean(u.perfil_maestro && u.perfil_maestro.extracto);

    res.render('candidato/muro', {
      title: 'Muro de empleos · TrabajaYa',
      active: 'muro',
      vacantes: lista,
      vacanteSel,
      total: lista.length,
      expediente: { estado: tieneExpediente ? 'cargado' : 'vacio' },
      filtros: { q: req.query.q || '', ubicacion: 'todas', modalidad: 'todas', area: 'todas', orden: 'match' },
      opciones: mockDb.opcionesFiltros,
      scripts: ['/js/pages/candidato.js']
    });
  } catch (err) {
    console.error('[Error Muro]', err);
    res.status(500).render('404', { title: 'Error cargando vacantes' });
  }
});`;

const newMuro = `router.get('/muro', async (req, res) => {
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
      \`SELECT v.id, v.titulo, v.descripcion, v.requisitos, v.estado, v.creado_en, 
              u.empresa_nombre, u.nombre as reclutador_nombre
       FROM vacantes v
       JOIN usuarios u ON v.reclutador_id = u.id
       WHERE v.estado = 'publicada'
       ORDER BY v.creado_en DESC\`
    );

    const vacantesReales = qVacantes.rows.map(v => ({
      id: v.id,
      puesto: v.titulo,
      empresa: v.empresa_nombre || v.reclutador_nombre || 'Empresa Confidencial',
      descripcion: v.descripcion,
      requisitos: v.requisitos || '',
      ciudad: 'Guatemala',
      ubicacion: 'Guatemala',
      modalidad: 'Híbrido',
      match: 80,
      dias: Math.max(0, Math.floor((Date.now() - new Date(v.creado_en).getTime()) / (1000 * 60 * 60 * 24)))
    }));

    const lista = vacantesReales.length ? vacantesReales : mockDb.vacantes;
    const vacanteId = req.query.vacante ? Number(req.query.vacante) : null;
    const vacanteSel = lista.find(v => v.id === vacanteId) || null;
    const tieneExpediente = Boolean(u.perfil_maestro && u.perfil_maestro.extracto);

    const detalle = vacanteSel ? {
      vacante: vacanteSel,
      tieneExpediente,
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
      opciones: mockDb.opcionesFiltros,
      scripts: ['/js/pages/candidato.js']
    });
  } catch (err) {
    console.error('[Error Muro]', err);
    res.status(500).render('404', { title: 'Error cargando vacantes' });
  }
});`;

s = s.replace(oldMuro, newMuro);
fs.writeFileSync('src/routes/candidato.js', s, 'utf8');
console.log('✅ src/routes/candidato.js corregido con las variables esperadas por muro.ejs (activas, baseUrl, detalle, tieneExpediente)');
