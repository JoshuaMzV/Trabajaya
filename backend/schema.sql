-- ==============================================================================
-- TRABAJAYA - Schema Extension (PostgreSQL)
-- Standard Migration for Recruitment & AI Interactive Interviews
-- ==============================================================================

BEGIN;

-- 1. Ampliar tabla usuarios con soporte de Roles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'rol'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN rol VARCHAR(20) NOT NULL DEFAULT 'candidato' CHECK (rol IN ('candidato', 'reclutador', 'admin'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'empresa_nombre'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN empresa_nombre VARCHAR(150);
    END IF;
END $$;

-- 2. Tabla de Vacantes (Portal Reclutador)
CREATE TABLE IF NOT EXISTS vacantes (
    id SERIAL PRIMARY KEY,
    reclutador_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    requisitos TEXT,
    competencias_clave JSONB DEFAULT '[]'::jsonb,
    limite_preguntas_ia INTEGER DEFAULT 4,
    foco_star BOOLEAN DEFAULT TRUE,
    estado VARCHAR(20) NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'publicada', 'cerrada')),
    creado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vacantes_reclutador ON vacantes(reclutador_id);
CREATE INDEX IF NOT EXISTS idx_vacantes_estado ON vacantes(estado);

-- 3. Tabla de Postulaciones (Candidato -> Vacante)
CREATE TABLE IF NOT EXISTS postulaciones (
    id SERIAL PRIMARY KEY,
    vacante_id INTEGER NOT NULL REFERENCES vacantes(id) ON DELETE CASCADE,
    candidato_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cv_adaptado_json JSONB,
    score_ats INTEGER DEFAULT 0,
    estado VARCHAR(30) NOT NULL DEFAULT 'postulado' CHECK (estado IN ('postulado', 'en_evaluacion', 'en_terna', 'descartado')),
    notas_reclutador TEXT,
    creado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_candidato_vacante UNIQUE (vacante_id, candidato_id)
);

CREATE INDEX IF NOT EXISTS idx_postulaciones_vacante ON postulaciones(vacante_id);
CREATE INDEX IF NOT EXISTS idx_postulaciones_candidato ON postulaciones(candidato_id);
CREATE INDEX IF NOT EXISTS idx_postulaciones_estado ON postulaciones(estado);

-- 4. Tabla de Sesiones de Entrevista IA (Filtro Inteligente)
CREATE TABLE IF NOT EXISTS entrevistas_ia (
    id SERIAL PRIMARY KEY,
    postulacion_id INTEGER REFERENCES postulaciones(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    vacante_id INTEGER REFERENCES vacantes(id) ON DELETE SET NULL,
    puesto_objetivo VARCHAR(150) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'en_progreso' CHECK (estado IN ('en_progreso', 'completada', 'cancelada')),
    total_preguntas INTEGER DEFAULT 4,
    pregunta_actual INTEGER DEFAULT 1,
    score_global INTEGER DEFAULT 0,
    dictamen_ia TEXT,
    fortalezas JSONB DEFAULT '[]'::jsonb,
    areas_mejora JSONB DEFAULT '[]'::jsonb,
    recomendaciones JSONB DEFAULT '[]'::jsonb,
    creado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    finalizado_en TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_entrevistas_usuario ON entrevistas_ia(usuario_id);
CREATE INDEX IF NOT EXISTS idx_entrevistas_postulacion ON entrevistas_ia(postulacion_id);

-- 5. Tabla de Mensajes / Turnos de la Entrevista IA (Preguntas, Repreguntas y STAR)
CREATE TABLE IF NOT EXISTS entrevista_turnos (
    id SERIAL PRIMARY KEY,
    entrevista_id INTEGER NOT NULL REFERENCES entrevistas_ia(id) ON DELETE CASCADE,
    numero_pregunta INTEGER NOT NULL,
    es_repregunta BOOLEAN DEFAULT FALSE,
    pregunta TEXT NOT NULL,
    competencia_evaluada VARCHAR(100),
    respuesta_texto TEXT,
    evaluacion_star JSONB, -- { situacion: '', tarea: '', accion: '', resultado: '', score: 85, observaciones: '' }
    necesita_repregunta BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_turnos_entrevista ON entrevista_turnos(entrevista_id);

COMMIT;
