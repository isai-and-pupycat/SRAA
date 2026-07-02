import { useState } from 'react';
import './FichaEventoEtapa2.css';

const FichaEventoEtapa2 = ({ alAvanzar, alRetroceder }) => {
  // Lógica condicional: si requiere o no el orden del día
  const [requiereOrden, setRequiereOrden] = useState('si');
  
  // Arreglo dinámico inicializado con los datos de image_742c15.png
  const [itinerario, setItinerario] = useState([
    {
      horaInicio: '09:00',
      horaFin: '09:10',
      actividad: 'Registro de invitados',
      audiencia: 'Estudiantes de tecnologías de 6to cuatrimestre'
    }
  ]);

  // Agregar una nueva fila vacía al itinerario
  const handleAddFila = () => {
    setItinerario([
      ...itinerario,
      { horaInicio: '', horaFin: '', actividad: '', audiencia: '' }
    ]);
  };

  // Eliminar una fila específica cuidando que no se quede vacío el arreglo
  const handleRemoveFila = (index) => {
    if (itinerario.length > 1) {
      setItinerario(itinerario.filter((_, i) => i !== index));
    }
  };

  // Manejar los cambios de texto en cada input dinámico
  const handleInputChange = (index, field, value) => {
    const nuevoItinerario = [...itinerario];
    nuevoItinerario[index][field] = value;
    setItinerario(nuevoItinerario);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos de la Etapa 2 listos para enviarse:", { requiereOrden, itinerario });
    alAvanzar(); // Pasa a la Etapa 3
  };

  return (
    <div className="sraa-stage2-workspace">
      
      {/* STEPPER DE AVANCE DE LAS TRES ETAPAS */}
      <div className="form-stepper-container">
        <div className="step-item completed">
          <span className="step-number">✓</span>
          <span className="step-label">Etapa 1: Ficha Técnica</span>
        </div>
        <div className="step-line active-line"></div>
        <div className="step-item active">
          <span className="step-number">2</span>
          <span className="step-label">Etapa 2: Estructura del Orden del Día</span>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL BASADO EN image_742c15.png */}
      <form onSubmit={handleSubmit} className="agenda-structure-card">
        <h3>Estructura del Orden del Día</h3>
        
        {/* INTERRUPTOR RADIO BUTTONS */}
        <div className="agenda-radio-row">
          <span>¿Requiere orden del día?</span>
          <label className="radio-label">
            <input 
              type="radio" 
              name="orden_dia_radio" 
              value="si" 
              checked={requiereOrden === 'si'} 
              onChange={() => setRequiereOrden('si')} 
            /> 
            si
          </label>
          <label className="radio-label">
            <input 
              type="radio" 
              name="orden_dia_radio" 
              value="no" 
              checked={requiereOrden === 'no'} 
              onChange={() => setRequiereOrden('no')} 
            /> 
            no
          </label>
        </div>

        {/* LISTA DINÁMICA DE ENTRADAS DE LA AGENDA */}
        {requiereOrden === 'si' && (
          <div className="agenda-rows-container">
            {itinerario.map((item, index) => (
              <div key={index} className="agenda-dynamic-row">
                
                {/* Hora Inicio */}
                <input 
                  type="time" 
                  className="input-time-field"
                  value={item.horaInicio} 
                  onChange={(e) => handleInputChange(index, 'horaInicio', e.target.value)} 
                />

                {/* Hora Fin */}
                <input 
                  type="time" 
                  className="input-time-field"
                  value={item.horaFin} 
                  onChange={(e) => handleInputChange(index, 'horaFin', e.target.value)} 
                />

                {/* Campo Nombre de Actividad */}
                <div className="input-with-hint-box">
                  {index === 0 && <span className="input-hint-label">actividad</span>}
                  <input 
                    type="text" 
                    className="input-text-activity"
                    placeholder="Escribe la actividad..."
                    value={item.actividad} 
                    onChange={(e) => handleInputChange(index, 'actividad', e.target.value)} 
                  />
                </div>

                {/* Campo Audiencia / Detalles */}
                <div className="input-with-hint-box target-group-box">
                  {index === 0 && <span className="input-hint-label">&nbsp;</span>}
                  <input 
                    type="text" 
                    className="input-text-audience"
                    placeholder="Grupo, ponentes o alumnos invitados..."
                    value={item.audiencia} 
                    onChange={(e) => handleInputChange(index, 'audiencia', e.target.value)} 
                  />
                </div>

                {/* Botonera de Control de Filas */}
                <div className="agenda-actions-buttons">
                  {index === 0 ? (
                    <button type="button" className="btn-agenda-add" onClick={handleAddFila}>＋</button>
                  ) : (
                    <button type="button" className="btn-agenda-remove" onClick={() => handleRemoveFila(index)}>✕</button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

        {/* ACCIONES DE NAVEGACIÓN DEL FORMULARIO */}
        <div className="stage2-footer-navigation">
          <button type="button" className="btn-nav-back" onClick={alRetroceder}>Atrás</button>
          <button type="submit" className="btn-nav-next">Siguiente: Etapa 3</button>
        </div>

      </form>
    </div>
  );
};

export default FichaEventoEtapa2;
