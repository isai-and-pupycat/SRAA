import { jsPDF } from 'jspdf';

// Traducción de valores de <select> a texto legible (mismos mapas del sistema).
const MAPA_DOCENTES = {
  isai: 'Ing. Isai Rosas Canto',
  julio: 'Mtro. Julio Manuel Cen Can',
};

const AZUL = [6, 30, 67]; // #061e43
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

// Carga una imagen del /public y la convierte a PNG vía canvas.
// Así funciona con cualquier formato (png, jpg, webp) en jsPDF y
// devuelve también sus dimensiones para conservar la proporción.
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

// dd/mm/yyyy -> { d, m, a }
const parseFecha = (str) => {
  if (!str || !str.includes('/')) return null;
  const [d, m, a] = str.split('/').map((n) => parseInt(n, 10));
  if (!d || !m || !a) return null;
  return { d, m, a };
};

const fechaLarga = (f) =>
  f ? `${String(f.d).padStart(2, '0')} de ${MESES[f.m - 1]} de ${f.a}.` : '';

// Periodo trimestral del reporte SAC según el mes del evento.
const periodoTrimestre = (f) => {
  if (!f) return 'Del 01 de enero al 31 de marzo';
  const a = f.a;
  if (f.m <= 3) return `Del 01 de enero al 31 de marzo ${a}`;
  if (f.m <= 6) return `Del 01 de abril al 30 de junio ${a}`;
  if (f.m <= 9) return `Del 01 de julio al 30 de septiembre ${a}`;
  return `Del 01 de octubre al 31 de diciembre ${a}`;
};

/**
 * Genera y descarga el Informe de Actividades Académicas en el formato
 * oficial de la UPB (SAC), a partir de los datos de la ficha (Etapa 1 + Etapa 3).
 * @param {object} ficha
 */
export const generarInformePDF = async (ficha) => {
  if (!ficha) return;
  const t = ficha.tecnica || {};
  const inf = ficha.etapa3 || {};

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const anchoPagina = doc.internal.pageSize.getWidth();
  const altoPagina = doc.internal.pageSize.getHeight();
  const margen = 18;
  const anchoUtil = anchoPagina - margen * 2;
  let y = margen;

  // Carga los tres logos institucionales (SEP, DGUTyP/UTP y UPB).
  const [logoSep, logoUtp, logoUpb] = await Promise.all([
    cargarImagenPNG('/img/SEP_Logo_2019.svg.webp'),
    cargarImagenPNG('/img/UTyP.png'),
    cargarImagenPNG('/img/logo-vertical-upb@2x.png'),
  ]);

  // Salta de página si no cabe el alto solicitado.
  const asegurarEspacio = (alto) => {
    if (y + alto > altoPagina - margen) {
      doc.addPage();
      y = margen;
    }
  };

  // ---------- ENCABEZADO INSTITUCIONAL (banda de 3 logos) ----------
  // Dibuja un logo ajustado a (maxW, maxH) conservando proporción.
  // alineacion: 'left' | 'center' | 'right'. bandaAlto centra en vertical.
  const bandaAlto = 18;
  const dibujarLogo = (logo, maxW, maxH, alineacion) => {
    if (!logo) return;
    const esc = Math.min(maxW / logo.w, maxH / logo.h);
    const w = logo.w * esc;
    const h = logo.h * esc;
    let x = margen;
    if (alineacion === 'center') x = (anchoPagina - w) / 2;
    else if (alineacion === 'right') x = anchoPagina - margen - w;
    const yImg = y + (bandaAlto - h) / 2;
    doc.addImage(logo.dataURL, 'PNG', x, yImg, w, h);
  };

  dibujarLogo(logoSep, 42, bandaAlto, 'left');
  dibujarLogo(logoUtp, 34, bandaAlto - 2, 'center');
  dibujarLogo(logoUpb, 24, bandaAlto, 'right');
  y += 20;

  // ---------- TÍTULO ----------
  doc.setTextColor(...AZUL);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('INFORME DE ACTIVIDADES ACADÉMICAS', anchoPagina / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(60);
  doc.text(periodoTrimestre(parseFecha(ficha.fecha)), anchoPagina / 2, y, { align: 'center' });
  y += 4;

  // Doble regla azul.
  doc.setDrawColor(...AZUL);
  doc.setLineWidth(0.8);
  doc.line(margen, y, anchoPagina - margen, y);
  doc.setLineWidth(0.3);
  doc.line(margen, y + 1.2, anchoPagina - margen, y + 1.2);
  y += 8;

  // ---------- PROGRAMA EDUCATIVO ----------
  doc.setTextColor(...AZUL);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const programa = (t.programa || ficha.carrera || 'Programa educativo').toUpperCase();
  doc.text(doc.splitTextToSize(`${programa}.`, anchoUtil), margen, y);
  y += 8;

  // ---------- FECHA + TÍTULO DEL EVENTO ----------
  doc.setTextColor(20);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  const fechaEv = fechaLarga(parseFecha(ficha.fecha));
  if (fechaEv) {
    doc.text(fechaEv, margen, y);
    y += 5.5;
  }
  const titulo = `“${(ficha.nombre || 'ACTIVIDAD').toUpperCase()}”`;
  doc.text(doc.splitTextToSize(titulo, anchoUtil), margen, y);
  y += 8;

  // ---------- CAMPO ETIQUETADO (etiqueta en negrita + valor con ajuste) ----------
  const parrafoEtiquetado = (etiqueta, valor) => {
    const lineH = 5.2;
    const texto = String(valor && String(valor).trim() ? valor : 'N/D');
    doc.setFontSize(11);
    doc.setTextColor(30);

    doc.setFont('helvetica', 'bold');
    const etq = `${etiqueta} `;
    const wEtq = doc.getTextWidth(etq);

    asegurarEspacio(lineH);
    doc.text(etq, margen, y);

    doc.setFont('helvetica', 'normal');
    const palabras = texto.split(/\s+/);
    let linea = '';
    let cursorX = margen + wEtq;
    let anchoDisp = anchoUtil - wEtq;

    palabras.forEach((p) => {
      const prueba = linea ? `${linea} ${p}` : p;
      if (doc.getTextWidth(prueba) > anchoDisp && linea) {
        doc.text(linea, cursorX, y);
        y += lineH;
        asegurarEspacio(lineH);
        linea = p;
        cursorX = margen;
        anchoDisp = anchoUtil;
      } else {
        linea = prueba;
      }
    });
    if (linea) {
      doc.text(linea, cursorX, y);
      y += lineH;
    }
    y += 2.5;
  };

  // Responsables: junta la lista del informe (o los docentes de la ficha).
  const responsables =
    (inf.responsables || []).filter(Boolean).length > 0
      ? inf.responsables.filter(Boolean)
      : (t.docentes || []).filter(Boolean).map((d) => MAPA_DOCENTES[d] || d);

  // Beneficiarios: si es un número puro, agrega "alumnos".
  const benef = String(inf.beneficiarios || '').trim();
  const beneficiariosTexto = benef
    ? (/^\d+$/.test(benef) ? `${benef} alumnos` : benef)
    : 'N/D';

  const lugar = inf.lugar || t.lugar || 'N/D';

  parrafoEtiquetado('Objetivo:', t.objetivo);
  parrafoEtiquetado('Descripción:', inf.descripcion);
  parrafoEtiquetado('Responsables:', responsables.join(', '));
  parrafoEtiquetado('Logro:', inf.logro);
  parrafoEtiquetado('Beneficiarios / número:', beneficiariosTexto);
  parrafoEtiquetado('Lugar:', lugar);

  // ---------- IMÁGENES: separadas por tipo ----------
  const fotos = (inf.fotos || []).filter(Boolean);
  // La lista de asistencia es la foto marcada 'asistencia' (o, en datos viejos,
  // la primera del arreglo). El resto es evidencia fotográfica.
  const fotosAsistencia = fotos.filter((f, i) => f.tipo === 'asistencia' || (!f.tipo && i === 0));
  const fotosEvidencia = fotos.filter((f, i) => f.tipo === 'evidencia' || (!f.tipo && i > 0));

  // Título de sección con regla azul debajo.
  const dibujarTituloSeccion = (texto) => {
    asegurarEspacio(12);
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...AZUL);
    doc.text(texto, margen, y);
    y += 2;
    doc.setDrawColor(...AZUL);
    doc.setLineWidth(0.4);
    doc.line(margen, y, anchoPagina - margen, y);
    y += 6;
  };

  // Dibuja una galería de imágenes.
  //  - cols=1  → una imagen grande y centrada (para la lista de asistencia).
  //  - cols=2  → dos por fila con etiqueta "Figura NN" (evidencia).
  const dibujarGaleria = (lista, cols, etiquetaBase, textoPorDefecto) => {
    const gap = 6;
    const celdaW = cols === 1 ? anchoUtil * 0.72 : (anchoUtil - gap) / 2;
    const imgH = cols === 1 ? 88 : 52;
    const capH = 7;
    const bloqueH = imgH + capH + 4;

    for (let i = 0; i < lista.length; i += cols) {
      asegurarEspacio(bloqueH);
      const fila = lista.slice(i, i + cols);
      fila.forEach((foto, j) => {
        const x = cols === 1
          ? margen + (anchoUtil - celdaW) / 2
          : margen + j * (celdaW + gap);
        // Marco de la figura.
        doc.setDrawColor(150);
        doc.rect(x, y, celdaW, imgH);
        try {
          const props = doc.getImageProperties(foto.datos);
          const esc = Math.min((celdaW - 3) / props.width, (imgH - 3) / props.height);
          const w = props.width * esc;
          const h = props.height * esc;
          doc.addImage(foto.datos, props.fileType, x + (celdaW - w) / 2, y + (imgH - h) / 2, w, h);
        } catch {
          // Si la imagen falla, el marco queda vacío.
        }
        // Caption bajo la imagen.
        doc.setDrawColor(120);
        doc.rect(x, y + imgH, celdaW, capH);
        doc.setFontSize(7.5);
        doc.setTextColor(40);
        doc.setFont('helvetica', 'bold');
        const num = String(i + j + 1).padStart(2, '0');
        const cap = etiquetaBase
          ? `${etiquetaBase} ${num}.- ${foto.titulo || textoPorDefecto}`
          : (foto.titulo || textoPorDefecto);
        doc.text(doc.splitTextToSize(cap, celdaW - 4), x + 2, y + imgH + 4.5);
      });
      y += bloqueH;
    }
  };

  // ---------- LISTA DE ASISTENCIA (sección propia) ----------
  if (fotosAsistencia.length) {
    dibujarTituloSeccion('LISTA DE ASISTENCIA');
    dibujarGaleria(fotosAsistencia, 1, '', 'Lista de asistencia del evento');
  }

  // ---------- EVIDENCIA FOTOGRÁFICA (Figuras) ----------
  if (fotosEvidencia.length) {
    dibujarTituloSeccion('EVIDENCIA FOTOGRÁFICA');
    dibujarGaleria(fotosEvidencia, 2, 'Figura', 'Evidencia del evento');
  }

  // ---------- PIE DE PÁGINA (número + regla azul en cada página) ----------
  const totalPaginas = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPaginas; p += 1) {
    doc.setPage(p);
    doc.setDrawColor(...AZUL);
    doc.setLineWidth(0.6);
    doc.line(margen, altoPagina - 12, anchoPagina - margen, altoPagina - 12);
    doc.setFontSize(8);
    doc.setTextColor(90);
    doc.setFont('helvetica', 'normal');
    doc.text(String(p), anchoPagina - margen, altoPagina - 8, { align: 'right' });
  }

  const nombreArchivo = `Informe-Actividades-${(ficha.folio || 'SRAA').replace(/[^\w-]/g, '')}.pdf`;
  doc.save(nombreArchivo);
};
