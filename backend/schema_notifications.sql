-- ==============================================================================
-- TRABAJAYA - Migración: Sistema de Notificaciones & Invitaciones por Correo (EmailJS)
-- ==============================================================================

BEGIN;

-- 1. Tokens de invitación a entrevistas o postulaciones externas (ej. LinkedIn / Outreach)
CREATE TABLE IF NOT EXISTS invitaciones_proceso (
    id SERIAL PRIMARY KEY,
    vacante_id INTEGER NOT NULL REFERENCES vacantes(id) ON DELETE CASCADE,
    reclutador_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    email_destinatario VARCHAR(150) NOT NULL,
    nombre_candidato VARCHAR(120),
    canal_origen VARCHAR(50) DEFAULT 'directo', -- 'linkedin', 'email_directo', 'referido', 'bolsa_externa'
    token_acceso VARCHAR(64) NOT NULL UNIQUE,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'abierto', 'completado', 'expirado')),
    expira_en TIMESTAMP WITHOUT TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
    creado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invitaciones_token ON invitaciones_proceso(token_acceso);
CREATE INDEX IF NOT EXISTS idx_invitaciones_vacante ON invitaciones_proceso(vacante_id);
CREATE INDEX IF NOT EXISTS idx_invitaciones_email ON invitaciones_proceso(email_destinatario);

-- 2. Trazabilidad de notificaciones por email
CREATE TABLE IF NOT EXISTS notificaciones_email (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    invitacion_id INTEGER REFERENCES invitaciones_proceso(id) ON DELETE SET NULL,
    email_destinatario VARCHAR(150) NOT NULL,
    tipo_evento VARCHAR(50) NOT NULL, -- 'INVITACION_ENTREVISTA', 'POSTULACION_CONFIRMADA', 'NOTIFICACION_RECLUTADOR_ENTREVISTA_LISTA', 'CAMBIO_ESTADO_TERNA', 'DESCARTE_NOTIFICADO'
    estado_envio VARCHAR(20) DEFAULT 'enviado' CHECK (estado_envio IN ('pendiente', 'enviado', 'fallido')),
    proveedor VARCHAR(30) DEFAULT 'emailjs',
    payload JSONB,
    error_detalle TEXT,
    creado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notif_email_usuario ON notificaciones_email(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notif_email_tipo ON notificaciones_email(tipo_evento);

COMMIT;
