import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generarPdfCv({ datos, resumen, experiencia, educacion, habilidades }) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  let y = height - 50;

  // Encabezado
  const nombre = datos?.nombre || 'Candidato';
  page.drawText(nombre, {
    x: 50,
    y,
    size: 20,
    font: fontBold,
    color: rgb(0.14, 0.08, 0.24) // #23153C
  });
  y -= 22;

  const subtitulo = [datos?.profesion, datos?.email, datos?.telefono, datos?.ubicacion].filter(Boolean).join(' | ');
  page.drawText(subtitulo, {
    x: 50,
    y,
    size: 10,
    font: fontRegular,
    color: rgb(0.3, 0.23, 0.42)
  });
  y -= 28;

  // Línea separadora
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: rgb(0.89, 0.87, 0.97)
  });
  y -= 24;

  // Resumen Profesional
  if (resumen) {
    page.drawText('RESUMEN PROFESIONAL', {
      x: 50,
      y,
      size: 11,
      font: fontBold,
      color: rgb(0.14, 0.08, 0.24)
    });
    y -= 16;

    // Split de texto simple para PDF
    const lineas = resumen.match(/.{1,90}(\s|$)/g) || [resumen];
    for (const linea of lineas.slice(0, 4)) {
      page.drawText(linea.trim(), {
        x: 50,
        y,
        size: 9.5,
        font: fontRegular,
        color: rgb(0.15, 0.15, 0.15)
      });
      y -= 14;
    }
    y -= 14;
  }

  // Habilidades
  if (habilidades && habilidades.length) {
    page.drawText('HABILIDADES CLAVE', {
      x: 50,
      y,
      size: 11,
      font: fontBold,
      color: rgb(0.14, 0.08, 0.24)
    });
    y -= 16;

    const listaHabs = habilidades.join(' • ');
    const lineasHabs = listaHabs.match(/.{1,90}(\s|$)/g) || [listaHabs];
    for (const l of lineasHabs.slice(0, 3)) {
      page.drawText(l.trim(), {
        x: 50,
        y,
        size: 9.5,
        font: fontRegular,
        color: rgb(0.15, 0.15, 0.15)
      });
      y -= 14;
    }
    y -= 14;
  }

  // Experiencia Laboral
  if (experiencia && experiencia.length) {
    page.drawText('EXPERIENCIA LABORAL', {
      x: 50,
      y,
      size: 11,
      font: fontBold,
      color: rgb(0.14, 0.08, 0.24)
    });
    y -= 18;

    for (const exp of experiencia.slice(0, 4)) {
      const cargoEmpresa = `${exp.cargo || exp.puesto || 'Puesto'} — ${exp.empresa || 'Empresa'}`;
      page.drawText(cargoEmpresa, {
        x: 50,
        y,
        size: 10,
        font: fontBold,
        color: rgb(0.15, 0.15, 0.15)
      });

      if (exp.periodo) {
        page.drawText(exp.periodo, {
          x: width - 180,
          y,
          size: 9,
          font: fontRegular,
          color: rgb(0.4, 0.4, 0.4)
        });
      }
      y -= 14;

      if (exp.logros && exp.logros.length) {
        for (const l of exp.logros.slice(0, 2)) {
          page.drawText(`- ${String(l).slice(0, 95)}`, {
            x: 60,
            y,
            size: 9,
            font: fontRegular,
            color: rgb(0.2, 0.2, 0.2)
          });
          y -= 13;
        }
      }
      y -= 10;
    }
    y -= 10;
  }

  // Educación y Certificaciones
  if (educacion && educacion.length) {
    page.drawText('EDUCACIÓN Y CERTIFICACIONES', {
      x: 50,
      y,
      size: 11,
      font: fontBold,
      color: rgb(0.14, 0.08, 0.24)
    });
    y -= 18;

    for (const edu of educacion.slice(0, 4)) {
      const tituloInst = `${edu.titulo || edu.carrera || 'Estudios'} — ${edu.institucion || 'Institución'}`;
      page.drawText(tituloInst, {
        x: 50,
        y,
        size: 10,
        font: fontBold,
        color: rgb(0.15, 0.15, 0.15)
      });

      if (edu.periodo || edu.anio) {
        page.drawText(String(edu.periodo || edu.anio), {
          x: width - 180,
          y,
          size: 9,
          font: fontRegular,
          color: rgb(0.4, 0.4, 0.4)
        });
      }
      y -= 14;
    }
  }

  return await doc.save();
}
