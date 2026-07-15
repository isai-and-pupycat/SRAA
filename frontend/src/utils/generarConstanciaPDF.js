import { jsPDF } from 'jspdf';
import { obtenerConfig } from '../services/configService';

const AZUL = [11, 31, 75];    // azul institucional del panel
const ORO = [176, 138, 58];   // dorado de los textos
const GRIS = [90, 90, 90];

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

// Convierte una imagen del /public a PNG (para incrustarla en jsPDF).
const cargarImagenPNG = (ruta) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0);
        resolve({ dataURL: canvas.toDataURL('image/png'), w: img.naturalWidth, h: img.naturalHeight });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = ruta;
  });

// Fecha ISO (aaaa-mm-dd) → "23 de abril de 2024"
const fechaLarga = (iso) => {
  if (!iso || !iso.includes('-')) return '';
  const [a, m, d] = iso.split('-').map((n) => parseInt(n, 10));
  if (!a || !m || !d) return '';
  return `${d} de ${MESES[m - 1]} de ${a}`;
};

/**
 * Genera el PDF de Reconocimientos/Constancias en el formato oficial de la UPB,
 * una página por destinatario.
 * @param {object} datos - { tipo, evento, fecha, texto, destinatarios: string[] }
 * @param {object} opciones - { preview: boolean }
 */
export const generarConstanciaPDF = async (datos, opciones = {}) => {
  const { tipo = 'Reconocimiento', evento = '', fecha = '', texto = '' } = datos || {};
  const destinatarios = (datos?.destinatarios || []).filter(Boolean);
  if (destinatarios.length === 0) return;

  let config = {};
  try {
    config = await obtenerConfig();
  } catch {
    config = {};
  }
  const rectorNombre = config.rector_nombre || 'DRA. INGRID CITLALLI SUÁREZ MCLIBERTY';
  const rectorCargo = config.rector_cargo || 'RECTORA DE LA UPB';

  // Logo: usa la imagen personalizada si se envió; si no, la de la UPB.
  const logoSrc = datos?.logo || '/img/logo-vertical-blanco@2x.png';
  const logo = await cargarImagenPNG(logoSrc);

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
  const W = doc.internal.pageSize.getWidth();  // 297
  const H = doc.internal.pageSize.getHeight(); // 210

  const panelW = 82; // ancho del panel azul izquierdo (más angosto)

  const dibujarPagina = (nombre) => {
    // ----- PANEL AZUL IZQUIERDO -----
    doc.setFillColor(...AZUL);
    doc.rect(0, 0, panelW, H, 'F');
    // Acentos diagonales en tonos de azul (3 rayas)
    doc.setFillColor(30, 58, 120);
    doc.triangle(panelW - 30, 0, panelW, 0, panelW, H, 'F');
    doc.setFillColor(37, 99, 175);
    doc.triangle(panelW - 20, 0, panelW, 0, panelW, H, 'F');
    doc.setFillColor(96, 165, 250);
    doc.triangle(panelW - 9, 0, panelW, 0, panelW, H * 0.78, 'F');
    // Logo (personalizado o de la UPB) centrado en el panel
    if (logo) {
      const maxW = 50;
      const maxH = 64;
      const esc = Math.min(maxW / logo.w, maxH / logo.h);
      const w = logo.w * esc;
      const h = logo.h * esc;
      doc.addImage(logo.dataURL, 'PNG', (panelW - 30 - w) / 2 + 4, (H - h) / 2, w, h);
    }

    // ----- MARCO DORADO DERECHO -----
    const mx = panelW + 8;
    const my = 10;
    doc.setDrawColor(...ORO);
    doc.setLineWidth(1.2);
    doc.rect(mx, my, W - mx - 10, H - my * 2);
    doc.setLineWidth(0.4);
    doc.rect(mx + 2, my + 2, W - mx - 14, H - my * 2 - 4);

    const cx = mx + (W - mx - 10) / 2; // centro horizontal del área derecha
    let y = 42;

    // Encabezado dorado (serif)
    doc.setFont('times', 'normal');
    doc.setTextColor(...ORO);
    doc.setFontSize(23);
    doc.text('LA UNIVERSIDAD', cx, y, { align: 'center' });
    y += 10;
    doc.text('POLITÉCNICA DE BACALAR', cx, y, { align: 'center' });
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRIS);
    doc.setFontSize(11);
    doc.text('OTORGA EL PRESENTE', cx, y, { align: 'center' });
    y += 16;

    // Tipo (RECONOCIMIENTO / CONSTANCIA / DIPLOMA)
    doc.setFont('times', 'bold');
    doc.setTextColor(...ORO);
    doc.setFontSize(34);
    doc.text(String(tipo || 'Reconocimiento').toUpperCase(), cx, y, { align: 'center' });
    y += 14;

    // Nombre del destinatario (azul, subrayado)
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...AZUL);
    doc.setFontSize(18);
    doc.text(nombre.toUpperCase(), cx, y, { align: 'center' });
    const anchoNombre = Math.min(doc.getTextWidth(nombre.toUpperCase()) + 20, W - mx - 24);
    doc.setDrawColor(...AZUL);
    doc.setLineWidth(0.8);
    doc.line(cx - anchoNombre / 2, y + 3, cx + anchoNombre / 2, y + 3);
    y += 14;

    // Cuerpo del texto
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70);
    doc.setFontSize(11.5);
    const anchoTexto = W - mx - 34;
    const lineas = doc.splitTextToSize(texto || '', anchoTexto);
    doc.text(lineas, cx, y, { align: 'center', lineHeightFactor: 1.4 });
    y += lineas.length * 5.6 + 3;

    // Evento (negrita)
    if (evento) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40);
      doc.setFontSize(13);
      doc.text(evento.toUpperCase(), cx, y, { align: 'center' });
      y += 9;
    }

    // Fecha y lugar
    const fl = fechaLarga(fecha);
    if (fl) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(90);
      doc.setFontSize(8.5);
      doc.text(`REALIZADO EL DÍA ${fl.toUpperCase()}`, cx, y, { align: 'center' });
      y += 4.5;
      doc.text('BACALAR, Q. ROO', cx, y, { align: 'center' });
    }

    // Firma de la Rectora (parte inferior)
    const yFirma = H - 34;
    doc.setDrawColor(120);
    doc.setLineWidth(0.4);
    doc.line(cx - 45, yFirma, cx + 45, yFirma);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40);
    doc.setFontSize(10);
    doc.text(rectorNombre, cx, yFirma + 6, { align: 'center' });
    doc.setFontSize(8.5);
    doc.setTextColor(90);
    doc.text(rectorCargo, cx, yFirma + 11, { align: 'center' });
  };

  destinatarios.forEach((nombre, i) => {
    if (i > 0) doc.addPage();
    dibujarPagina(nombre);
  });

  if (opciones.preview) {
    // Abre una vista previa en una pestaña nueva.
    doc.output('dataurlnewwindow');
  } else {
    const base = destinatarios.length === 1 ? destinatarios[0].replace(/[^\w]/g, '_') : 'Lote';
    doc.save(`${String(tipo)}-${base}.pdf`);
  }
};
