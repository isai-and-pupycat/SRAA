const pool = require('../config/db');

// ==========================================
//  LISTAR TODAS LAS FICHAS
//  El docente crea → el coordinador aprueba. Ambos leen de aquí.
// ==========================================
exports.listar = async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM fichas ORDER BY id ASC');
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al listar fichas:', error);
    res.status(500).json({ message: 'Error al obtener las fichas' });
  }
};

// ==========================================
//  CREAR UNA FICHA NUEVA
// ==========================================
exports.crear = async (req, res) => {
  const {
    folio,
    nombre,
    carrera,
    cuatrimestre,
    docente,
    fecha,
    hora,
    tecnica,
    programa,
  } = req.body;

  try {
    const resultado = await pool.query(
      `INSERT INTO fichas
         (folio, nombre, carrera, cuatrimestre, docente, fecha, hora, tecnica, programa)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        folio || null,
        nombre || 'Actividad sin nombre',
        carrera || 'Sin programa',
        cuatrimestre || '2026-1',
        JSON.stringify(docente || {}),
        fecha || null,
        hora || null,
        JSON.stringify(tecnica || {}),
        JSON.stringify(programa || []),
      ]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al crear ficha:', error);
    res.status(500).json({ message: 'Error al crear la ficha' });
  }
};

// ==========================================
//  VALIDAR UNA FICHA (acción del coordinador)
//  El docente envía la Etapa 1 (Ficha Técnica) y la Etapa 2 (Orden del
//  Día) juntas, así que al validar se marcan AMBAS como validadas.
//  La Etapa 3 (Informe/Cierre) se completa después, por eso no se toca.
// ==========================================
exports.validar = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pool.query(
      `UPDATE fichas
          SET etapa1 = 'validado',
              etapa2 = jsonb_set(COALESCE(etapa2, '{}'::jsonb), '{estado}', '"validado"')
        WHERE id = $1
      RETURNING *`,
      [id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Ficha no encontrada' });
    }
    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al validar ficha:', error);
    res.status(500).json({ message: 'Error al validar la ficha' });
  }
};

// ==========================================
//  ACTUALIZAR UNA FICHA (edición por el coordinador)
//  Reemplaza los datos de la Ficha Técnica (Etapa 1) y los campos
//  derivados (nombre, carrera, fecha, hora, programa).
// ==========================================
exports.actualizar = async (req, res) => {
  const { id } = req.params;
  const { folio, nombre, carrera, cuatrimestre, fecha, hora, tecnica, programa } = req.body;

  try {
    const resultado = await pool.query(
      `UPDATE fichas SET
          folio        = COALESCE($1, folio),
          nombre       = COALESCE($2, nombre),
          carrera      = COALESCE($3, carrera),
          cuatrimestre = COALESCE($4, cuatrimestre),
          fecha        = COALESCE($5, fecha),
          hora         = COALESCE($6, hora),
          tecnica      = COALESCE($7, tecnica),
          programa     = COALESCE($8, programa)
        WHERE id = $9
      RETURNING *`,
      [
        folio || null,
        nombre || null,
        carrera || null,
        cuatrimestre || null,
        fecha || null,
        hora || null,
        tecnica ? JSON.stringify(tecnica) : null,
        programa ? JSON.stringify(programa) : null,
        id,
      ]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Ficha no encontrada' });
    }
    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al actualizar ficha:', error);
    res.status(500).json({ message: 'Error al actualizar la ficha' });
  }
};

// ==========================================
//  GUARDAR EL INFORME (Etapa 3 · Cierre y Evidencias)
//  El docente completa el Informe de Actividades una vez validado
//  por el coordinador. Marca la Etapa 3 como 'finalizado'.
// ==========================================
exports.guardarInforme = async (req, res) => {
  const { id } = req.params;
  const { descripcion, logro, responsables, beneficiarios, lugar, fotos } = req.body;

  const informe = {
    estado: 'finalizado',
    descripcion: descripcion || '',
    logro: logro || '',
    responsables: Array.isArray(responsables) ? responsables : [],
    beneficiarios: beneficiarios || '',
    lugar: lugar || '',
    fotos: Array.isArray(fotos) ? fotos : [],
  };

  try {
    const resultado = await pool.query(
      `UPDATE fichas SET etapa3 = $1 WHERE id = $2 RETURNING *`,
      [JSON.stringify(informe), id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Ficha no encontrada' });
    }
    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al guardar informe:', error);
    res.status(500).json({ message: 'Error al guardar el informe' });
  }
};

// ==========================================
//  ELIMINAR / RECHAZAR UNA FICHA
// ==========================================
exports.eliminar = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pool.query('DELETE FROM fichas WHERE id = $1 RETURNING id', [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Ficha no encontrada' });
    }
    res.json({ message: 'Ficha eliminada', id: Number(id) });
  } catch (error) {
    console.error('Error al eliminar ficha:', error);
    res.status(500).json({ message: 'Error al eliminar la ficha' });
  }
};
