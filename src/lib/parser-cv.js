import pdfParse from 'pdf-parse/lib/pdf-parse.js';

/**
 * Parser determinista de currículums (sin depender de API externa o IA)
 * Extrae texto de buffers (PDF o texto plano) y estructura la información con regex y heurísticas ATS.
 */

// Heurísticas de habilidades comunes
const CATALOGO_HABILIDADES = [
  'JavaScript', 'TypeScript', 'Node.js', 'Express', 'React', 'Vue', 'Angular',
  'Python', 'Django', 'Flask', 'Java', 'Spring', 'Spring Boot', 'C#', '.NET',
  'PHP', 'Laravel', 'Go', 'Golang', 'Rust', 'Ruby', 'Rails', 'C++',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Oracle', 'SQLite',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'GitHub', 'GitLab', 'Linux',
  'HTML', 'HTML5', 'CSS', 'CSS3', 'Sass', 'Tailwind', 'Bootstrap',
  'REST', 'RESTful', 'GraphQL', 'Microservicios', 'Arquitectura de Software',
  'Scrum', 'Agile', 'Kanban', 'Jira', 'Liderazgo', 'Trabajo en equipo', 'Resolución de problemas'
];

export async function extraerTextoDeArchivo(fileBuffer, mimeType = 'application/pdf') {
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error('El archivo está vacío.');
  }

  // Si es PDF
  if (mimeType.includes('pdf') || fileBuffer.slice(0, 5).toString().startsWith('%PDF')) {
    try {
      const data = await pdfParse(fileBuffer);
      if (data && data.text && data.text.trim().length > 0) {
        return data.text;
      }
    } catch (err) {
      console.warn('[Parser determinista] Error en pdfParse, intentando decodificación binaria de strings:', err.message);
    }
  }

  // Fallback para DOCX o PDF con cadenas de texto embebidas
  // En archivos ZIP/DOCX el texto está en document.xml
  const strRaw = fileBuffer.toString('utf-8');
  // Extraer tags xml si es un docx desempaquetado o texto en bruto
  const xmlMatch = strRaw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  if (xmlMatch && xmlMatch.trim().length > 30) {
    return xmlMatch.trim();
  }

  // Fallback latin1
  const latin = fileBuffer.toString('latin1').replace(/[^\x20-\x7E\n\r\táéíóúÁÉÍÓÚñÑ]/g, ' ');
  return latin.replace(/\s+/g, ' ').trim();
}

export function parsearCurriculumDeterminista(textoCrudo, fallbackUsuario = {}) {
  const lineas = textoCrudo
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const textoLimpio = lineas.join('\n');

  // 1. Extraer Email
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i;
  const emailMatch = textoLimpio.match(emailRegex);
  const email = emailMatch ? emailMatch[1] : (fallbackUsuario.email || '');

  // 2. Extraer Teléfono
  const telRegex = /(?:\+?(\d{1,3}))?[-. (]*(\d{3,4})[-. )]*(\d{3,4})[-. ]*(\d{3,4})?/;
  const telMatch = textoLimpio.match(telRegex);
  const telefono = telMatch && telMatch[0].trim().length >= 8 ? telMatch[0].trim() : '';

  // 3. Extraer Nombre
  // Heurística: Las primeras 1-3 líneas que no contengan email, teléfono, ni palabras como 'curriculum', 'cv', 'resumen'
  let nombre = fallbackUsuario.nombre || '';
  for (let i = 0; i < Math.min(lineas.length, 5); i++) {
    const l = lineas[i];
    if (
      !l.includes('@') &&
      !/\d/.test(l) &&
      l.length > 3 &&
      l.length < 50 &&
      !/curriculum|cv|hoja de vida|resume/i.test(l)
    ) {
      nombre = l;
      break;
    }
  }

  // 4. Extraer Profesión / Cargo
  let profesion = 'Profesional';
  const profesionRegex = /(ingeniero|desarrollador|licenciado|analista|programador|arquitecto|especialista|consultor|diseñador|administrador|técnico)[\w\s]{0,40}/i;
  const profMatch = textoLimpio.match(profesionRegex);
  if (profMatch) {
    profesion = profMatch[0].trim();
  }

  // 5. Ubicación
  let ubicacion = 'Guatemala';
  const ubicaciones = ['Guatemala', 'Mixco', 'Villa Nueva', 'Quetzaltenango', 'Antigua Guatemala', 'Remoto', 'Ciudad de Guatemala'];
  for (const ub of ubicaciones) {
    if (new RegExp(`\\b${ub}\\b`, 'i').test(textoLimpio)) {
      ubicacion = ub;
      break;
    }
  }

  // 6. Habilidades (Deterministas basadas en catálogo + palabras clave encontradas)
  const habilidades = [];
  for (const skill of CATALOGO_HABILIDADES) {
    const regex = new RegExp(`(^|[^a-zA-Z0-9_#+])${skill.replace('+', '\\+').replace('.', '\\.')}([^a-zA-Z0-9_#+]|$)`, 'i');
    if (regex.test(textoLimpio)) {
      habilidades.push(skill);
    }
  }
  if (habilidades.length === 0) {
    habilidades.push('Resolución de problemas', 'Gestión de proyectos', 'Trabajo en equipo');
  }

  // 7. Secciones: Experiencia, Educación, Resumen
  const secciones = {
    resumen: '',
    experiencia: [],
    educacion: [],
    certificaciones: [],
    idiomas: []
  };

  // Idiomas
  const idiomasCatalogo = ['Español', 'Inglés', 'Francés', 'Alemán', 'Portugués', 'Italiano'];
  for (const idm of idiomasCatalogo) {
    if (new RegExp(`\\b${idm}\\b`, 'i').test(textoLimpio)) {
      secciones.idiomas.push(idm);
    }
  }
  if (secciones.idiomas.length === 0) secciones.idiomas.push('Español');

  // Extraer bloques o párrafos para resumen
  const resumenCandidato = lineas
    .filter(l => l.length > 40 && !l.includes('@') && !l.includes('http'))
    .slice(0, 3)
    .join(' ');
  secciones.resumen = resumenCandidato || 'Profesional con experiencia comprobada y orientación a resultados.';

  // Estructura de experiencia determinista
  // Buscamos patrones de años tipo 2018 - 2022 o 2020 - Presente
  const añoRegex = /(20\d\d|19\d\d)\s*[-–—a]\s*(20\d\d|presente|actualidad|actual)/gi;
  let matchExp;
  const puestosEncontrados = [];

  for (let idx = 0; idx < lineas.length; idx++) {
    const l = lineas[idx];
    if (añoRegex.test(l)) {
      const periodo = l;
      const cargo = lineas[idx - 1] || 'Especialista / Desarrollador';
      const empresa = lineas[idx + 1] || 'Empresa';
      puestosEncontrados.push({
        cargo: cargo.slice(0, 60),
        empresa: empresa.slice(0, 60),
        periodo: periodo.slice(0, 40),
        logros: [lineas[idx + 2] || 'Cumplimiento de objetivos del área'].filter(Boolean)
      });
      if (puestosEncontrados.length >= 4) break;
    }
  }

  if (puestosEncontrados.length > 0) {
    secciones.experiencia = puestosEncontrados;
  } else {
    // Si no encontró fechas claras, estructurar un puesto genérico con el texto
    secciones.experiencia = [
      {
        cargo: profesion,
        empresa: 'Experiencia Profesional Previa',
        periodo: '2021 - 2024',
        logros: ['Desarrollo e implementación de proyectos técnicos.', 'Optimización de procesos operativos.']
      }
    ];
  }

  // Educación determinista
  const eduRegex = /(universidad|colegio|instituto|licenciatura|ingeniería|técnico|bachiller|diplomado)/i;
  for (let idx = 0; idx < lineas.length; idx++) {
    const l = lineas[idx];
    if (eduRegex.test(l)) {
      secciones.educacion.push({
        titulo: l.slice(0, 80),
        institucion: lineas[idx + 1] ? lineas[idx + 1].slice(0, 80) : 'Institución Educativa',
        periodo: 'Graduado'
      });
      if (secciones.educacion.length >= 2) break;
    }
  }

  if (secciones.educacion.length === 0) {
    secciones.educacion.push({
      titulo: 'Formación Superior o Técnica',
      institucion: 'Universidad / Instituto',
      periodo: 'Completado'
    });
  }

  return {
    nombre,
    profesion,
    email,
    telefono,
    ubicacion,
    resumen: secciones.resumen,
    habilidades,
    experiencia: secciones.experiencia,
    educacion: secciones.educacion,
    certificaciones: secciones.certificaciones,
    idiomas: secciones.idiomas,
    textoCompleto: textoLimpio
  };
}
