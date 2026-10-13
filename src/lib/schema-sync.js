import pool from '../lib/db.js';

export async function asegurarTablasExtra() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cvs_adaptados (
        id SERIAL PRIMARY KEY,
        candidato_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        vacante_id INTEGER REFERENCES vacantes(id) ON DELETE SET NULL,
        estilo VARCHAR(30) DEFAULT 'ats',
        match_score INTEGER DEFAULT 0,
        resultado_json JSONB NOT NULL,
        creado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_cvs_adaptados_candidato ON cvs_adaptados(candidato_id);

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'usuarios' AND column_name = 'empresa_perfil'
        ) THEN
          ALTER TABLE usuarios ADD COLUMN empresa_perfil JSONB DEFAULT '{}'::jsonb;
        END IF;
      END $$;
    `);
    console.log('[DB] Tablas y columnas adicionales verificadas con éxito.');
  } catch (err) {
    console.warn('[DB Warning] Verificación de tabla cvs_adaptados:', err.message);
  }
}
