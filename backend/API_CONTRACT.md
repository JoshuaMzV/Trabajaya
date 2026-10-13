# TRABAJAYA — Contrato y Especificación de API (Backend ↔ Frontend)

> **Documento de Integración Técnica**
> Base URL: `/api`
> Autenticación: Cabecera HTTP `Authorization: Bearer <jwt_token>` (salvo endpoints públicos).
> Formato por defecto: `application/json`

---

## 1. Módulo Autenticación y Perfil (`/api/auth`)

### 1.1 Registro de Usuario
- **POST** `/api/auth/register`
- **Público**
- **Body**:
  ```json
  {
    "nombre": "Juan Pérez",
    "email": "juan@empresa.com",
    "password": "Password123!",
    "rol": "reclutador", // "candidato" o "reclutador" (opcional, default: "candidato")
    "empresa_nombre": "Tech Solutions" // Requerido si rol == "reclutador"
  }
  ```
- **Respuesta 201**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "nombre": "Juan Pérez",
      "email": "juan@empresa.com",
      "rol": "reclutador",
      "empresa_nombre": "Tech Solutions",
      "trabajacoins_saldo": 2,
      "plan": "free"
    }
  }
  ```

### 1.2 Iniciar Sesión
- **POST** `/api/auth/login`
- **Público**
- **Body**:
  ```json
  {
    "email": "juan@empresa.com",
    "password": "Password123!"
  }
  ```
- **Respuesta 200**: Devuelve token y objeto usuario completo.

### 1.3 Obtener Sesión Actual
- **GET** `/api/auth/me`
- **Requiere Token**
- **Respuesta 200**:
  ```json
  {
    "user": {
      "id": 1,
      "nombre": "Juan Pérez",
      "email": "juan@empresa.com",
      "rol": "reclutador",
      "trabajacoins_saldo": 2,
      "plan": "free",
      "perfil_maestro": { ... }
    }
  }
  ```

---

## 2. Portal Reclutador (`/api/vacantes`)

### 2.1 Crear Vacante
- **POST** `/api/vacantes`
- **Requiere**: Token con rol `reclutador`
- **Body**:
  ```json
  {
    "titulo": "Senior Backend Developer",
    "descripcion": "Buscamos desarrollador Node.js y PostgreSQL...",
    "requisitos": "3+ años de experiencia, Docker, APIs RESTful",
    "competencias_clave": ["Node.js", "PostgreSQL", "Docker", "Resolución de problemas"],
    "limite_preguntas_ia": 4,
    "foco_star": true,
    "estado": "publicada" // "borrador" o "publicada"
  }
  ```
- **Respuesta 201**:
  ```json
  {
    "success": true,
    "vacante": {
      "id": 10,
      "titulo": "Senior Backend Developer",
      "estado": "publicada",
      "creado_en": "2026-09-30T23:00:00.000Z"
    }
  }
  ```

### 2.2 Listar Vacantes de la Empresa
- **GET** `/api/vacantes`
- **Requiere**: Token de reclutador
- **Respuesta 200**:
  ```json
  {
    "vacantes": [
      {
        "id": 10,
        "titulo": "Senior Backend Developer",
        "estado": "publicada",
        "total_candidatos": 5,
        "creado_en": "2026-09-30T23:00:00.000Z"
      }
    ]
  }
  ```

### 2.3 Bandeja de Postulantes por Vacante
- **GET** `/api/vacantes/:id/candidatos?estado=&score_min=`
- **Requiere**: Token de reclutador
- **Filtros Query**:
  - `estado`: `postulado`, `en_evaluacion`, `en_terna`, `descartado` (opcional).
  - `score_min`: número entero (opcional, ej: `80`).
- **Respuesta 200**:
  ```json
  {
    "vacante_id": 10,
    "titulo": "Senior Backend Developer",
    "candidatos": [
      {
        "postulacion_id": 15,
        "candidato_id": 4,
        "nombre": "Carlos Gómez",
        "email": "carlos@email.com",
        "score_ats": 88,
        "score_entrevista_ia": 92,
        "estado": "en_terna",
        "fecha_postulacion": "2026-09-30T23:10:00.000Z"
      }
    ]
  }
  ```

### 2.4 Ficha Síntesis y Dictamen IA del Candidato
- **GET** `/api/vacantes/:vacanteId/candidatos/:candidatoId/resumen`
- **Requiere**: Token de reclutador
- **Respuesta 200**:
  ```json
  {
    "candidato": {
      "id": 4,
      "nombre": "Carlos Gómez",
      "email": "carlos@email.com",
      "perfil_maestro": { ... }
    },
    "postulacion": {
      "id": 15,
      "score_ats": 88,
      "estado": "en_terna",
      "notas_reclutador": ""
    },
    "entrevista_ia": {
      "score_global": 92,
      "dictamen_ia": "Candidato con sólida competencia técnica en arquitectura Node.js...",
      "fortalezas": ["Dominio claro de pooling de conexiones", "Explicación estructurada STAR"],
      "areas_mejora": ["Podría profundizar más en observabilidad con OpenTelemetry"],
      "transcripcion": [
        {
          "pregunta": "¿Cómo manejas la concurrencia en Node.js?",
          "es_repregunta": false,
          "respuesta": "Manejo el Event Loop delegando I/O pesadas...",
          "evaluacion_star": {
            "score": 90,
            "observaciones": "Responde con situación real y resultado medible"
          }
        }
      ]
    }
  }
  ```

### 2.5 Actualizar Estado del Candidato (Mover a Terna o Descartar) con Notificación Automática
- **PATCH** `/api/postulaciones/:id/estado`
- **Requiere**: Token de reclutador
- **Body**:
  ```json
  {
    "estado": "en_terna", // "en_terna" | "descartado" | "en_evaluacion"
    "notas_reclutador": "Aprobado para entrevista presencial",
    "notificar_candidato_email": true // Dispara email vía EmailJS automáticamente
  }
  ```
- **Respuesta 200**:
  ```json
  {
    "success": true,
    "nuevo_estado": "en_terna",
    "email_notificado": true
  }
  ```

### 2.6 Exportar Terna Recomendada
- **GET** `/api/vacantes/:id/exportar-terna`
- **Requiere**: Token de reclutador
- **Respuesta 200**:
  ```json
  {
    "vacante": "Senior Backend Developer",
    "fecha_reporte": "2026-09-30T23:20:00.000Z",
    "terna_recomendada": [
      {
        "nombre": "Carlos Gómez",
        "email": "carlos@email.com",
        "score_ats": 88,
        "score_entrevista_ia": 92,
        "dictamen": "Altamente recomendado..."
      }
    ]
  }
  ```

---

## 3. Integración de Correo & Prospección Externa (LinkedIn / Outbound)

### 3.1 Invitar Candidato Externo a Proceso / Entrevista IA
Permite al reclutador prospectar candidatos de LinkedIn, bolsas de empleo o referidos enviándoles invitación formal por correo.
- **POST** `/api/vacantes/:id/invitar-candidato`
- **Requiere**: Token de reclutador
- **Body**:
  ```json
  {
    "email": "talento.externo@gmail.com",
    "nombre": "Sofía Martínez",
    "canal_origen": "linkedin", // "linkedin" | "email_directo" | "referido"
    "mensaje_personalizado": "Nos encantó tu perfil en LinkedIn y queremos invitarte a nuestro filtro inicial."
  }
  ```
- **Respuesta 201**:
  ```json
  {
    "success": true,
    "mensaje": "Invitación enviada por correo vía EmailJS.",
    "invitacion": {
      "token": "a1b2c3d4e5f6...",
      "enlace_entrevista": "https://trabajaya.lat/entrevista/acceso?token=a1b2c3d4e5f6...",
      "expira_en": "2026-10-07T23:00:00.000Z"
    }
  }
  ```

### 3.2 Validar Token de Invitación Externa (Acceso Candidato sin login previo)
- **GET** `/api/invitaciones/:token`
- **Público**
- **Respuesta 200**:
  ```json
  {
    "valido": true,
    "vacante": {
      "id": 10,
      "titulo": "Senior Backend Developer",
      "empresa": "Tech Solutions"
    },
    "candidato": {
      "nombre": "Sofía Martínez",
      "email": "talento.externo@gmail.com"
    }
  }
  ```

---

## 4. Módulo Entrevista IA Interactiva (`/api/entrevistas`)

### 4.1 Iniciar / Generar Sesión de Entrevista
- **POST** `/api/entrevistas/iniciar`
- **Requiere**: Token de candidato o `token_invitacion` en body.
- **Body**:
  ```json
  {
    "vacante_id": 10, // Opcional si es entrevista libre
    "puesto_objetivo": "Senior Backend Developer",
    "token_invitacion": "a1b2c3d4e5f6..." // Opcional si viene de correo/LinkedIn
  }
  ```
- **Respuesta 201**:
  ```json
  {
    "entrevista_id": 25,
    "pregunta_actual": 1,
    "total_preguntas": 4,
    "estado": "en_progreso",
    "pregunta": {
      "id": 101,
      "numero": 1,
      "texto": "Cuéntame de una situación donde una API en producción presentó alta latencia y cómo lo resolviste.",
      "competencia": "Resolución de problemas técnicos",
      "es_repregunta": false
    }
  }
  ```

### 4.2 Responder Turno (Voz/Texto + Evaluación STAR con Gemini)
- **POST** `/api/entrevistas/:id/responder`
- **Requiere**: Token de candidato
- **Body**:
  ```json
  {
    "turno_id": 101,
    "respuesta_texto": "En mi trabajo anterior detectamos que las consultas a PostgreSQL bloqueaban conexiones..."
  }
  ```
- **Respuesta 200 (Caso Repregunta IA contextual)**:
  ```json
  {
    "tipo": "repregunta",
    "mensaje": "La IA necesita profundizar en tu respuesta anterior.",
    "siguiente_turno": {
      "id": 102,
      "numero": 1,
      "texto": "¿Cuáles fueron las métricas exactas de reducción de latencia que lograste tras aplicar esos índices?",
      "es_repregunta": true
    }
  }
  ```
- **Respuesta 200 (Caso Siguiente Pregunta)**:
  ```json
  {
    "tipo": "siguiente_pregunta",
    "pregunta_actual": 2,
    "total_preguntas": 4,
    "siguiente_turno": {
      "id": 103,
      "numero": 2,
      "texto": "¿Cómo diseñas el esquema de base de datos para garantizar consistencia eventual?",
      "es_repregunta": false
    }
  }
  ```
- **Respuesta 200 (Caso Finalizada / Límite alcanzado)**:
  Al finalizar la entrevista, el backend automáticamente:
  1. Calcula score global y dictamen final con Gemini.
  2. Despacha notificación por correo vía EmailJS al reclutador informándole que hay un nuevo resultado listo.
  ```json
  {
    "tipo": "finalizada",
    "mensaje": "Has completado la entrevista con éxito.",
    "entrevista_id": 25
  }
  ```

### 4.3 Consultar Feedback y Dictamen Final
- **GET** `/api/entrevistas/:id/feedback`
- **Requiere**: Token de usuario
- **Respuesta 200**:
  ```json
  {
    "entrevista_id": 25,
    "score_global": 91,
    "dictamen_ia": "El candidato demuestra alta solidez técnica usando la metodología STAR...",
    "fortalezas": ["Respuestas muy precisas en backend", "Buen análisis de causa raíz"],
    "areas_mejora": ["Detallar un poco más la delegación en equipo"],
    "recomendaciones": ["Preparar ejemplos cuantitativos sobre optimizaciones"]
  }
  ```
