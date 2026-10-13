import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let ai = null;

if (apiKey && apiKey !== 'TU_GEMINI_API_KEY_AQUI') {
  ai = new GoogleGenAI({ apiKey });
}

export { ai };

// 1. OCR Multimodal de Alta Precisión (soporta texto digital y escaneado)
export async function procesarCvConGemini(fileBuffer, mimeType = 'application/pdf') {
  if (!ai) {
    throw new Error('Servicio de IA (Gemini) no configurado.');
  }

  const base64Data = fileBuffer.toString('base64');
  const prompt = `
Eres un motor de OCR inteligente y analista curricular de alta precisión.
Tu tarea es leer minuciosamente el documento adjunto (incluso si es un escaneo, imagen o PDF con múltiples columnas) y extraer TODO su contenido estructurado fielmente sin inventar datos.

Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura:
{
  "nombre": "Nombre completo del candidato",
  "profesion": "Título profesional o cargo principal",
  "email": "correo electrónico si aparece",
  "telefono": "número de teléfono si aparece",
  "ubicacion": "ciudad y país si aparece",
  "resumen": "Resumen profesional textual o fiel al perfil",
  "habilidades": ["Habilidad acreditada 1", "Habilidad acreditada 2"],
  "experiencia": [
    {
      "cargo": "Puesto",
      "empresa": "Empresa",
      "periodo": "Periodo de tiempo",
      "logros": ["Logro o función 1", "Logro 2"]
    }
  ],
  "educacion": [
    {
      "titulo": "Grado o título obtenido",
      "institucion": "Institución educativa",
      "periodo": "Años"
    }
  ],
  "certificaciones": ["Certificación o curso si aparece"],
  "idiomas": ["Idioma y nivel si aparece"],
  "textoCompleto": "Transcripción textual ordenada de todo el contenido del documento"
}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          { text: prompt }
        ]
      }
    ],
    config: {
      responseMimeType: 'application/json'
    }
  });

  return JSON.parse(response.text.trim());
}

// 2. Adaptación ATS Estricta (resalta transferibilidad, NUNCA inventa habilidades no acreditadas)
export async function adaptarCvConGemini({ masterExtracto, masterDatos, vacanteTitulo, vacanteDescripcion, estilo = 'ats' }) {
  if (!ai) {
    throw new Error('Servicio de IA (Gemini) no configurado.');
  }

  const systemInstruction = `
Eres un Evaluador de Talento y Optimizador Curricular ATS de máxima precisión.
REGLA INQUEBRANTABLE:
Trabaja ÚNICAMENTE con la experiencia, habilidades y logros acreditados en el Expediente Maestro del candidato.
- NUNCA inventes experiencia laboral, certificaciones ni herramientas técnicas que el candidato no posea.
- Ejemplo: Si el candidato tiene experiencia en Java y la vacante pide tecnologías web, PUEDES destacar su sólida base en lógica de programación, arquitectura de backend, POO y diseño modular como habilidades transferibles, pero NUNCA decir que tiene años de experiencia en React o frameworks que no ha usado.
- Identifica brechas con honestidad y transparencia.

ESTILO SOLICITADO: "${estilo === 'ejecutivo' ? 'Formal Ejecutivo' : 'Estándar ATS'}"
`;

  const userPrompt = `
EXPEDIENTE MAESTRO DEL CANDIDATO:
"""
${masterExtracto}
"""

VACANTE: "${vacanteTitulo}"
DESCRIPCIÓN Y REQUISITOS:
"""
${vacanteDescripcion}
"""

Devuelve ÚNICAMENTE un JSON con esta estructura exacta:
{
  "matchScore": 78,
  "resumenAdaptado": "Resumen profesional orientado a la vacante destacando experiencia real acreditada...",
  "puntosFuertes": ["Fortaleza 1 real y comprobable", "Fortaleza 2"],
  "brechasDetectadas": [
    {
      "requisito": "Requisito solicitado en la vacante no encontrado en el expediente",
      "estado": "Faltante",
      "impacto": "Alto o Medio",
      "recomendacion": "Cómo abordar o compensar esta brecha honestamente en la entrevista"
    }
  ],
  "keywords": ["PalabraClave1", "PalabraClave2"],
  "habilidadesDestacadas": ["Habilidad real 1", "Habilidad real 2"]
}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: userPrompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json'
    }
  });

  return JSON.parse(response.text.trim());
}
