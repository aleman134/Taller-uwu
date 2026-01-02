const API_URL_SERVICIOS_REALIZADOS = API_CONFIG.serviciosRealizados;
const API_URL_REPUESTOS = API_CONFIG.repuestosUtilizados;
const API_URL_HISTORIAL = API_CONFIG.historial;

//REPORTES 
// Estadísticas de vehículos
async function getEstadisticasVehiculos() {
  try {
    const res = await fetch(`${API_URL_VEHICULOS}/estadisticas/estadisticas`);
    if (!res.ok) throw new Error("Error al obtener estadísticas de vehículos");
    return await res.json();
  } catch (err) {
    console.error("getEstadisticasVehiculos:", err);
    return null;
  }
}

// Estadísticas de órdenes de trabajo
async function getEstadisticasOrdenes() {
  try {
    const res = await fetch(`${API_URL_ORDENES}/estadisticas/estadisticas`);
    if (!res.ok) throw new Error("Error al obtener estadísticas de órdenes");
    return await res.json();
  } catch (err) {
    console.error("getEstadisticasOrdenes:", err);
    return null;
  }
}

// Resumen por período
async function getResumenPeriodo(fecha_inicio, fecha_fin) {
  try {
    const res = await fetch(`${API_URL_ORDENES}/resumen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fecha_inicio, fecha_fin })
    });
    if (!res.ok) throw new Error("Error al obtener resumen por periodo");
    return await res.json();
  } catch (err) {
    console.error("getResumenPeriodo:", err);
    return null;
  }
}

// Estadísticas de servicios
async function getEstadisticasServicios() {
  try {
    const res = await fetch(`${API_URL_SERVICIOS}/estadisticas/estadisticas`);
    if (!res.ok) throw new Error("Error al obtener estadísticas de servicios (API_SERVICIOS)");
    return await res.json();
  } catch (err) {
    console.error("getEstadisticasServicios:", err);
    return null;
  }
}

// Estadísticas de servicios realizados
async function getEstadisticasServiciosRealizados() {
  try {
    const res = await fetch(`${API_URL_SERVICIOS_REALIZADOS}/estadisticas/estadisticas`);
    if (!res.ok) throw new Error("Error al obtener estadísticas de servicios realizados");
    return await res.json();
  } catch (err) {
    console.error("getEstadisticasServiciosRealizados:", err);
    return null;
  }
}

async function getEstadisticasRepuestos(fecha_inicio = null, fecha_fin = null) {
  try {
    const params = new URLSearchParams();
    if (fecha_inicio) params.append("fecha_inicio", fecha_inicio);
    if (fecha_fin) params.append("fecha_fin", fecha_fin);

    const url = `${API_URL_REPUESTOS}/estadisticas/estadisticas?${params.toString()}`;

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) throw new Error("Error al obtener estadísticas de repuestos");
    const data = await res.json();
    
    // Convertir objeto a array si es necesario
    if (data && !Array.isArray(data)) {
      return [data];
    }
    
    return data;
  } catch (err) {
    console.error("getEstadisticasRepuestos:", err);
    return null;
  }
}

// HISTORIAL
// Historial por vehículo 
async function getHistorialPorVehiculo(vehiculo_id) {
  try {
    const res = await fetch(`${API_URL_HISTORIAL}/${vehiculo_id}`);
    if (!res.ok) throw new Error("Error al obtener historial por vehículo");
    return await res.json();
  } catch (err) {
    console.error("getHistorialPorVehiculo:", err);
    return null;
  }
}

// Próximos mantenimientos
async function getProximosMantenimientos() {
  try {
    const res = await fetch(`${API_URL_HISTORIAL}/proximos/proximos`);
    if (!res.ok) throw new Error("Error al obtener próximos mantenimientos");
    return await res.json();
  } catch (err) {
    console.error("getProximosMantenimientos:", err);
    return null;
  }
}

// Servicios realizados por orden
async function getServiciosRealizadosPorOrden(orden_trabajo_id) {
  try {
    const res = await fetch(`${API_URL_SERVICIOS_REALIZADOS}/orden/${orden_trabajo_id}`);
    if (!res.ok) throw new Error("Error al obtener servicios realizados por orden");
    return await res.json();
  } catch (err) {
    console.error("getServiciosRealizadosPorOrden:", err);
    return null;
  }
}

// Repuestos utilizados por orden 
async function getRepuestosPorOrden(orden_trabajo_id) {
  try {
    const res = await fetch(`${API_URL_REPUESTOS}/orden/${orden_trabajo_id}`);
    if (!res.ok) throw new Error("Error al obtener repuestos por orden");
    return await res.json();
  } catch (err) {
    console.error("getRepuestosPorOrden:", err);
    return null;
  }
}

async function getHistorialOrdenPorId(orden_trabajo_id) {
  try {
    const res = await fetch(`${API_URL_ORDENES}/historial/${orden_trabajo_id}`);
    if (!res.ok) throw new Error("Error al obtener historial por orden");
    return await res.json();
  } catch (err) {
    console.error("getHistorialOrdenPorId:", err);
    return null;
  }
}

// Verificar si ya existe historial para una orden
async function verificarHistorialExistente(ordenId) {
  try {
    const res = await fetch(`${API_URL_HISTORIAL}/orden/${ordenId}`);
    if (res.ok) {
      const data = await res.json();
      return data && data.length > 0;
    }
    return false;
  } catch (error) {
    console.error('Error al verificar historial:', error);
    return false;
  }
}

// Crear historial de servicio
async function crearHistorialServicio(datos) {
  try {
    const res = await fetch(API_URL_HISTORIAL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Error al crear historial');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error al crear historial:', error);
    throw error;
  }
}

// Función para mostrar el formulario de historial desde la orden
async function mostrarFormularioHistorial(ordenId) {
  window.ordenActualIdHistorial = ordenId;
  
  try {
    // Obtener información de la orden
    const res = await fetch(`${API_CONFIG.ordenes}/reporte/${ordenId}`);
    if (!res.ok) throw new Error('Error al cargar datos de la orden');
    
    const reporte = await res.json();
    const { orden } = reporte;
    
    if (!orden) {
      await mostrarDialogo('No se encontró información de la orden');
      return;
    }
    
    // Verificar que la orden esté finalizada o entregada
    if (orden.estado !== 'finalizada' && orden.estado !== 'entregada') {
      await mostrarDialogo('Solo se puede crear historial para órdenes finalizadas o entregadas');
      return;
    }
    
    // Verificar si ya existe historial para esta orden
    const historialExistente = await verificarHistorialExistente(ordenId);
    if (historialExistente) {
      await mostrarDialogo('Ya existe un historial registrado para esta orden de trabajo');
      return;
    }
    
    mostrarModalFormularioHistorial(orden);
    
  } catch (error) {
    console.error('Error al mostrar formulario:', error);
    await mostrarDialogo('Error al cargar el formulario de historial');
  }
}

// Mostrar modal con formulario de historial
function mostrarModalFormularioHistorial(orden) {
  // Pre-cargar datos de la orden
  const fechaServicio = orden.fecha_real_salida 
    ? new Date(orden.fecha_real_salida).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];
  
  const diagnosticoInicial = orden.diagnostico || '';
  const kilometrajeActual = orden.kilometraje_ingreso || '';
  
  const modalHTML = `
    <div id="modalHistorialServicio" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center; overflow-y: auto; padding: 20px;" onclick="cerrarModalHistorial(event)">
      <div style="background: white; padding: 30px; border-radius: 15px; max-width: 700px; width: 100%; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation()">
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 3px solid #e67e22; padding-bottom: 15px;">
          <h2 style="color: #34495e; margin: 0;">Registrar Historial de Servicio</h2>
          <button onclick="cerrarModalHistorial()" style="background: #e74c3c; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">
            ✕
          </button>
        </div>
        
        <!-- Información de la orden -->
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 5px 0;"><strong>Orden #:</strong> ${orden.numero_orden}</p>
          <p style="margin: 5px 0;"><strong>Vehículo:</strong> ${orden.vehiculo_info || orden.vehiculo_completo || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Cliente:</strong> ${orden.nombre_cliente || 'N/A'}</p>
        </div>
        
        <!-- Formulario -->
        <form id="formHistorialServicio" style="display: flex; flex-direction: column; gap: 15px;">
          
          <!-- Fecha de servicio -->
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #34495e;">Fecha de Servicio: *</label>
            <input type="date" id="fechaServicio" value="${fechaServicio}" required
              style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 14px;">
          </div>
          
          <!-- Kilometraje -->
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #34495e;">Kilometraje Actual:</label>
            <input type="number" id="kilometraje" value="${kilometrajeActual}" min="0" placeholder="Kilometraje del vehículo"
              style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 14px;">
          </div>
          
          <!-- Diagnóstico inicial -->
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #34495e;">Diagnóstico Inicial:</label>
            <textarea id="diagnosticoInicial" rows="3" placeholder="Diagnóstico realizado..."
              style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 14px; font-family: inherit; resize: vertical;">${diagnosticoInicial}</textarea>
          </div>
          
          <!-- Reparaciones realizadas -->
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #34495e;">Reparaciones Realizadas:</label>
            <textarea id="reparacionesRealizadas" rows="4" placeholder="Detalles de las reparaciones efectuadas..."
              style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 14px; font-family: inherit; resize: vertical;"></textarea>
          </div>
          
          <!-- Recomendaciones futuras -->
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #34495e;">Recomendaciones Futuras:</label>
            <textarea id="recomendacionesFuturas" rows="3" placeholder="Recomendaciones para el cliente..."
              style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 14px; font-family: inherit; resize: vertical;"></textarea>
          </div>
          
          <!-- Próximo mantenimiento -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #34495e;">Próximo Mantenimiento (KM):</label>
              <input type="number" id="proximoMantenimientoKm" min="0" placeholder="Ej: 15000"
                style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 14px;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #34495e;">Fecha Próximo Mantenimiento:</label>
              <input type="date" id="fechaProximoMantenimiento"
                style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 14px;">
            </div>
          </div>
          
          <!-- Observaciones -->
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #34495e;">Observaciones Adicionales:</label>
            <textarea id="observaciones" rows="2" placeholder="Observaciones generales..."
              style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 14px; font-family: inherit; resize: vertical;"></textarea>
          </div>
          
          <!-- Botones -->
          <div style="display: flex; gap: 10px; margin-top: 10px;">
            <button type="submit" style="flex: 1; padding: 12px; background: #27ae60; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 15px;">
              Guardar Historial
            </button>
            <button type="button" onclick="cerrarModalHistorial()" style="flex: 1; padding: 12px; background: #95a5a6; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 15px;">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Agregar evento al formulario
  document.getElementById('formHistorialServicio').addEventListener('submit', guardarHistorialServicio);
}

// Guardar historial de servicio
async function guardarHistorialServicio(e) {
  e.preventDefault();
  
  const datos = {
    vehiculo_id: null, // Se obtendrá de la orden
    orden_trabajo_id: window.ordenActualIdHistorial,
    fecha_servicio: document.getElementById('fechaServicio').value,
    kilometraje: document.getElementById('kilometraje').value || null,
    diagnostico_inicial: document.getElementById('diagnosticoInicial').value.trim() || null,
    reparaciones_realizadas: document.getElementById('reparacionesRealizadas').value.trim() || null,
    recomendaciones_futuras: document.getElementById('recomendacionesFuturas').value.trim() || null,
    proximo_mantenimiento_km: document.getElementById('proximoMantenimientoKm').value || null,
    fecha_proximo_mantenimiento: document.getElementById('fechaProximoMantenimiento').value || null,
    observaciones: document.getElementById('observaciones').value.trim() || null
  };
  
  // Validar campos requeridos
  if (!datos.fecha_servicio) {
    await mostrarDialogo('La fecha de servicio es obligatoria');
    return;
  }
  
  try {
    // Obtener vehiculo_id de la orden
    const resOrden = await fetch(`${API_CONFIG.ordenes}/${datos.orden_trabajo_id}`);
    if (!resOrden.ok) throw new Error('Error al obtener información de la orden');
    
    const ordenData = await resOrden.json();
    const orden = Array.isArray(ordenData) ? ordenData[0] : ordenData;
    datos.vehiculo_id = orden.vehiculo_id;
    
    // Enviar datos al backend usando la función existente
    await crearHistorialServicio(datos);
    
    cerrarModalHistorial();
    await mostrarDialogo('Historial de servicio registrado exitosamente');
    
    // Recargar tabla de órdenes si existe
    if (typeof cargarOrdenes === 'function') {
      cargarOrdenes();
    }
    
  } catch (error) {
    console.error('Error al guardar historial:', error);
    await mostrarDialogo('Error al guardar historial: ' + error.message);
  }
}

// Cerrar modal de historial
function cerrarModalHistorial(event) {
  if (event && event.target.id !== 'modalHistorialServicio') return;
  
  const modal = document.getElementById('modalHistorialServicio');
  if (modal) modal.remove();
  
  window.ordenActualIdHistorial = null;
}

// Ver historial de un vehículo
async function verHistorialVehiculo(vehiculoId) {
  try {
    const historial = await getHistorialPorVehiculo(vehiculoId);
    
    if (!historial || historial.length === 0) {
      await mostrarDialogo('Este vehículo no tiene historial de servicios registrado');
      return;
    }
    
    mostrarModalHistorialVehiculo(historial);
    
  } catch (error) {
    console.error('Error al ver historial:', error);
    await mostrarDialogo('Error al cargar el historial del vehículo');
  }
}

// Mostrar modal con historial del vehículo
function mostrarModalHistorialVehiculo(historial) {
  const primerHistorial = historial[0];
  
  let historialHTML = historial.map(h => {
    const fechaServicio = h.fecha_servicio 
      ? new Date(h.fecha_servicio).toLocaleDateString('es-GT')
      : 'N/A';
    
    const proximoMant = h.proximo_mantenimiento_km 
      ? `${h.proximo_mantenimiento_km} km`
      : (h.fecha_proximo_mantenimiento 
          ? new Date(h.fecha_proximo_mantenimiento).toLocaleDateString('es-GT')
          : 'No programado');
    
    return `
      <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3498db; margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <strong style="color: #2c3e50;">Orden #${h.numero_orden}</strong>
          <span style="color: #7f8c8d;">${fechaServicio}</span>
        </div>
        
        ${h.kilometraje ? `<p style="margin: 5px 0;"><strong>Kilometraje:</strong> ${h.kilometraje} km</p>` : ''}
        ${h.diagnostico_inicial ? `<p style="margin: 5px 0;"><strong>Diagnóstico:</strong> ${h.diagnostico_inicial}</p>` : ''}
        ${h.reparaciones_realizadas ? `<p style="margin: 5px 0;"><strong>Reparaciones:</strong> ${h.reparaciones_realizadas}</p>` : ''}
        ${h.recomendaciones_futuras ? `<p style="margin: 5px 0; color: #f39c12;"><strong>Recomendaciones:</strong> ${h.recomendaciones_futuras}</p>` : ''}
        
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ecf0f1;">
          <strong>Próximo Mantenimiento:</strong> ${proximoMant}
        </div>
        
        ${h.mecanico_responsable ? `<p style="margin: 5px 0; font-size: 0.9em; color: #95a5a6;"><strong>Mecánico:</strong> ${h.mecanico_responsable}</p>` : ''}
      </div>
    `;
  }).join('');
  
  const modalHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;" onclick="this.remove()">
      <div style="background: white; padding: 30px; border-radius: 15px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation()">
        
        <h2 style="color: #34495e; margin-bottom: 20px; border-bottom: 3px solid #3498db; padding-bottom: 10px;">
          Historial de Servicios
        </h2>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 5px 0;"><strong>Vehículo:</strong> ${primerHistorial.vehiculo_info}</p>
          <p style="margin: 5px 0;"><strong>Total de Servicios:</strong> ${historial.length}</p>
        </div>
        
        <div style="max-height: 500px; overflow-y: auto;">
          ${historialHTML}
        </div>
        
        <button onclick="this.closest('div[style*=fixed]').remove()" 
          style="width: 100%; padding: 12px; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; margin-top: 20px;">
          Cerrar
        </button>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Reportes
window.getEstadisticasVehiculos = getEstadisticasVehiculos;
window.getEstadisticasOrdenes = getEstadisticasOrdenes;
window.getResumenPeriodo = getResumenPeriodo;
window.getEstadisticasServicios = getEstadisticasServicios;
window.getEstadisticasServiciosRealizados = getEstadisticasServiciosRealizados;
window.getEstadisticasRepuestos = getEstadisticasRepuestos;

// Historial
window.getHistorialPorVehiculo = getHistorialPorVehiculo;
window.getProximosMantenimientos = getProximosMantenimientos;
window.getServiciosRealizadosPorOrden = getServiciosRealizadosPorOrden;
window.getRepuestosPorOrden = getRepuestosPorOrden;
window.getHistorialOrdenPorId = getHistorialOrdenPorId;

window.verificarHistorialExistente = verificarHistorialExistente;
window.crearHistorialServicio = crearHistorialServicio;
window.mostrarFormularioHistorial = mostrarFormularioHistorial;
window.verHistorialVehiculo = verHistorialVehiculo;
window.cerrarModalHistorial = cerrarModalHistorial;