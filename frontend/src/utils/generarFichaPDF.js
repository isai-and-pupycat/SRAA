import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { obtenerConfig } from '../services/configService';

// Mapas para traducir los valores de los <select> a texto legible.
const MAPA_DOCENTES = {
  isai: 'Ing. Isai Rosas Canto',
  julio: 'Mtro. Julio Cen',
};

const AZUL = [6, 30, 67]; // #061e43
const GRIS_CELDA = [219, 229, 241];

// Carga el logo institucional como dataURL (para incrustarlo en el PDF).
const cargarLogo = async () => {
  try {
    const resp = await fetch('/img/logo-vertical-upb@2x.png');
    const blob = await resp.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

const marcar = (activo) => (activo ? '(X)' : '( )');

/**
 * Genera y descarga la Ficha Técnica en el formato oficial UPB-SAC-LN-03.
 * @param {object} ficha - Registro de ficha (con .tecnica y .programa).
 */
export const generarFichaPDF = async (ficha) => {
  if (!ficha) return;
  const t = ficha.tecnica || {};
  // Firmas configurables (Autoriza / Vo.Bo.); si el backend no responde, se usan los valores por defecto.
  let config = {};
  try {
    config = await obtenerConfig();
  } catch {
    config = {};
  }
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const anchoPagina = doc.internal.pageSize.getWidth();
  const margen = 14;
  const anchoUtil = anchoPagina - margen * 2;
  const logo = await cargarLogo();

  // ---------- ENCABEZADO INSTITUCIONAL ----------
  autoTable(doc, {
    startY: margen,
    margin: { left: margen, right: margen },
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5, valign: 'middle', lineColor: [0, 0, 0], lineWidth: 0.2 },
    body: [
      [
        { content: '', styles: { cellWidth: 32, minCellHeight: 20 } },
        { content: 'Tipo de documento: Formato', styles: { halign: 'center' } },
        { content: 'Código:\nUPB-SAC-LN-03', styles: { cellWidth: 40, fontSize: 6 } },
      ],
      [
        { content: '' },
        { content: 'FICHA TÉCNICA GENERAL', styles: { halign: 'center', fontStyle: 'bold', fontSize: 9 } },
        { content: 'Emisión: 26 nov 2021\nRevisión: 01', styles: { fontSize: 6 } },
      ],
    ],
    didParseCell: (data) => {
      // Fusiona visualmente la primera columna (celda del logo).
      if (data.column.index === 0 && data.row.index === 1) {
        data.cell.styles.minCellHeight = 0.1;
      }
    },
  });

  // Dibuja el logo de la UPB centrado y completo dentro de la primera columna,
  // conservando su proporción (sin recortarlo ni deformarlo).
  if (logo) {
    try {
      const props = doc.getImageProperties(logo);
      const boxX = margen;
      const boxW = 32;
      const boxY = margen;
      const boxH = doc.lastAutoTable.finalY - margen;
      const pad = 2.5;
      const escala = Math.min((boxW - pad * 2) / props.width, (boxH - pad * 2) / props.height);
      const w = props.width * escala;
      const h = props.height * escala;
      doc.addImage(logo, 'PNG', boxX + (boxW - w) / 2, boxY + (boxH - h) / 2, w, h);
    } catch {
      // Si algo falla con la imagen, el encabezado simplemente queda sin logo.
    }
  }

  let y = doc.lastAutoTable.finalY + 4;

  // ---------- TÍTULO DEL EVENTO ----------
  autoTable(doc, {
    startY: y,
    margin: { left: margen, right: margen },
    theme: 'grid',
    styles: { fontSize: 11, fontStyle: 'bold', halign: 'center', fillColor: GRIS_CELDA, textColor: AZUL, lineColor: [0, 0, 0], lineWidth: 0.2 },
    body: [[(ficha.nombre || 'FICHA TÉCNICA').toUpperCase()]],
  });
  y = doc.lastAutoTable.finalY;

  // ---------- DATOS DEL EVENTO ----------
  const etLabel = { fontStyle: 'bold', fillColor: GRIS_CELDA, cellWidth: 38 };
  autoTable(doc, {
    startY: y,
    margin: { left: margen, right: margen },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2, valign: 'middle' },
    body: [
      [{ content: 'FOLIO:', styles: etLabel }, { content: ficha.folio || 'N/D', colSpan: 3 }],
      [{ content: 'FECHA DEL EVENTO:', styles: etLabel }, { content: ficha.fecha || 'N/D', colSpan: 3 }],
      [
        { content: 'HORARIO:', styles: etLabel }, { content: ficha.hora || 'N/D' },
        { content: 'LUGAR:', styles: { ...etLabel, cellWidth: 24 } }, { content: t.lugar || 'N/D' },
      ],
      [
        { content: 'TIPO DE EVENTO:', styles: etLabel },
        {
          content:
            `${marcar(t.tipoEvento === 'Academico')} Académica   ` +
            `${marcar(false)} Administrativas y de Gestión   ${marcar(false)} Vinculación   ` +
            `${marcar(t.tipoEvento === 'Cultural' || t.tipoEvento === 'Deportivo')} Cultural y Deportivo   ${marcar(false)} Otro`,
          colSpan: 3,
        },
      ],
    ],
  });
  y = doc.lastAutoTable.finalY + 4;

  // ---------- Sección auxiliar ----------
  const seccion = (titulo) => {
    autoTable(doc, {
      startY: y,
      margin: { left: margen, right: margen },
      theme: 'plain',
      styles: { fontSize: 8.5, fontStyle: 'bold', textColor: AZUL, fillColor: [239, 243, 248], cellPadding: 1.5 },
      body: [[titulo]],
    });
    y = doc.lastAutoTable.finalY + 1;
  };

  const parrafo = (texto) => {
    doc.setFontSize(9);
    doc.setTextColor(40);
    const lineas = doc.splitTextToSize(texto || 'N/D', anchoUtil);
    doc.text(lineas, margen, y + 4);
    y += lineas.length * 4.5 + 4;
  };

  // OBJETIVO
  seccion('OBJETIVO:');
  parrafo(t.objetivo);

  // INVITADOS ESPECIALES
  const invitados = (t.invitados || []).filter((i) => i.nombre);
  seccion('INVITADOS ESPECIALES:');
  if (invitados.length) {
    doc.setFontSize(9);
    doc.setTextColor(40);
    invitados.forEach((inv, i) => {
      const linea = `${i + 1}. ${inv.nombre}${inv.cargo ? ` — ${inv.cargo}` : ''}`;
      const wrapped = doc.splitTextToSize(linea, anchoUtil - 4);
      doc.text(wrapped, margen + 2, y + 4);
      y += wrapped.length * 4.5;
    });
    y += 4;
  } else {
    parrafo('No se registraron invitados.');
  }

  // PROGRAMA DEL EVENTO
  const programa = ficha.programa || [];
  seccion('PROGRAMA DEL EVENTO:');
  autoTable(doc, {
    startY: y + 1,
    margin: { left: margen, right: margen },
    theme: 'grid',
    headStyles: { fillColor: AZUL, textColor: 255, fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2 },
    head: [['Horario', 'Actividad', 'A cargo de']],
    body: programa.length
      ? programa.map((p) => [
          [p.horaInicio, p.horaFin].filter(Boolean).join(' - ') || '—',
          p.actividad || '—',
          p.responsables || '—',
        ])
      : [['—', 'Sin programa registrado', '—']],
  });
  y = doc.lastAutoTable.finalY + 4;

  // ÁREA / FOLIO
  autoTable(doc, {
    startY: y,
    margin: { left: margen, right: margen },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2 },
    body: [
      [
        { content: 'ÁREA O DEPARTAMENTO QUE SOLICITA:', styles: { fontStyle: 'bold', fillColor: GRIS_CELDA, cellWidth: 60 } },
        { content: t.departamento || 'N/D' },
      ],
    ],
  });
  y = doc.lastAutoTable.finalY + 4;

  // SERVICIOS REQUERIDOS
  const s = t.servicios || {};
  const extras = (t.serviciosExtra || []).filter(Boolean);
  seccion('SERVICIOS REQUERIDOS:');
  const serviciosTexto =
    `${marcar(s.diseno)} Diseño de promocional     ${marcar(s.fotografia)} Fotografía en el evento     ${marcar(s.redes)} Publicación en redes` +
    (extras.length ? `\n${extras.map((e) => `(X) ${e}`).join('     ')}` : '');
  parrafo(serviciosTexto);

  // REQUERIMIENTOS
  seccion('REQUERIMIENTOS:');
  const reqs = (t.requerimientos || '').split('\n').map((r) => r.trim()).filter(Boolean);
  if (reqs.length) {
    doc.setFontSize(9);
    doc.setTextColor(40);
    reqs.forEach((r) => {
      doc.text(`•  ${r}`, margen + 2, y + 4);
      y += 4.5;
    });
    y += 4;
  } else {
    parrafo('Sin requerimientos registrados.');
  }

  // ---------- FIRMAS ----------
  if (y > 235) { doc.addPage(); y = margen; }
  y += 6;
  const docentes = (t.docentes || []).filter(Boolean).map((d) => MAPA_DOCENTES[d] || d);
  const supervisa = docentes[0] || 'Docente Responsable';

  const bloqueFirma = (x, ancho, titulo, nombre, cargo) => {
    doc.setDrawColor(120);
    doc.line(x, y + 14, x + ancho, y + 14);
    doc.setFontSize(7.5);
    doc.setTextColor(90);
    doc.text(titulo, x + ancho / 2, y, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(20);
    doc.setFont('helvetica', 'bold');
    doc.text(doc.splitTextToSize(nombre, ancho), x + ancho / 2, y + 18, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(90);
    doc.text(doc.splitTextToSize(cargo, ancho), x + ancho / 2, y + 22, { align: 'center' });
  };

  bloqueFirma(margen, anchoUtil, 'SUPERVISA:', supervisa, 'Docente responsable del evento');
  y += 34;
  const mitad = anchoUtil / 2 - 4;
  // Autoriza y Vo.Bo. se toman de la configuración editable por el coordinador.
  bloqueFirma(
    margen, mitad, 'AUTORIZA:',
    config.autoriza_nombre || 'MTRO. JULIO MANUEL CEN CAN',
    config.autoriza_cargo || 'Coordinador de las Ingenierías'
  );
  bloqueFirma(
    margen + mitad + 8, mitad, 'Vo.Bo.:',
    config.vobo_nombre || 'MTRA. MARÍA DE LOS ÁNGELES DÍAZ MARTÍN',
    config.vobo_cargo || 'Secretaría Académica de la UPB'
  );

  // ---------- PIE / DESCARGA ----------
  const nombreArchivo = `Ficha-Tecnica-${(ficha.folio || 'SRAA').replace(/[^\w-]/g, '')}.pdf`;
  doc.save(nombreArchivo);
};
