// Variable global para almacenar el ID de la orden actual en el modal
let ordenActualId = null;








async function cargarCatalogoServicios() {
  try {
    const res = await fetch(API_CONFIG.servicios, { credentials: 'include'});
    if (!res.ok) throw new Error('Error al cargar catálogo');
    return await res.json();
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// Servicios realizados

async function cargarServiciosRealizados(ordenId) {
  try {
    const res = await fetch(`${API_CONFIG.serviciosRealizados}/orden/${ordenId}`);



    if (!res.ok) throw new Error('Error al cargar servicios');
    return await res.json();
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

async function agregarServicioRealizado(datos) {
  try {

    
    const res = await fetch(API_CONFIG.serviciosRealizados, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
      console.error('Error del servidor:', errorData); // Debug
      throw new Error(errorData.error || errorData.message || 'Error al agregar servicio');
    }
    
    const resultado = await res.json();
    return resultado;
  } catch (error) {
    console.error('Error en agregarServicioRealizado:', error); // Debug

    throw error;
  }
}

async function eliminarServicioRealizado(id) {
  try {
    const res = await fetch(`${API_CONFIG.serviciosRealizados}/${id}`, {
      method: 'DELETE',

    });
    
    if (!res.ok) throw new Error('Error al eliminar servicio');
    return await res.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Repuestos utilizados

async function cargarRepuestosUtilizados(ordenId) {
  try {
    const res = await fetch(`${API_CONFIG.repuestosUtilizados}/orden/${ordenId}`);

  


    if (!res.ok) throw new Error('Error al cargar repuestos');
    return await res.json();
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

async function agregarRepuestoUtilizado(datos) {
  try {
    const res = await fetch(API_CONFIG.repuestosUtilizados, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify(datos)
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(errorData.error || errorData.message || 'Error al agregar repuesto');
    }
    

    return await res.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}


async function eliminarRepuestoUtilizado(id) {
  try {
    const res = await fetch(`${API_CONFIG.repuestosUtilizados}/${id}`, {
      method: 'DELETE',
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(errorData.error || errorData.message || 'Error al eliminar repuesto');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Cambiar estado de la orden
async function cambiarEstadoOrden() {
  const nuevoEstado = document.getElementById('nuevoEstadoOrden').value;
  const observaciones = document.getElementById('observacionesCambioEstado').value.trim();
  
  if (!nuevoEstado) {
    alert('Por favor seleccione un estado');
    return;
  }

  if (!observaciones) {
    alert('Por favor ingrese observaciones antes de cambiar el estado');
    return;
  }
  
  if (!confirm(`¿Está seguro de cambiar el estado a "${formatearEstado(nuevoEstado)}"?`)) {
    return;
  }
  
  try {
    const res = await fetch(`${API_CONFIG.ordenes}/cambiar/${ordenActualId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nuevo_estado: nuevoEstado,
        observaciones: observaciones
      })
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Error al cambiar estado');
    }
    
    cerrarFormularioCambioEstado();
    alert('Estado actualizado exitosamente');
    
    // Recargar la tabla de órdenes si existe
    if (typeof cargarOrdenes === 'function') {
      cargarOrdenes();
    }
    
    await recargarModal();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cambiar estado: ' + error.message);
  }
}

// Mostrar formulario para cambiar estado
function mostrarFormularioCambioEstado(estadoActual) {
  const formHTML = `
    <div id="formCambioEstado" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 10000; max-width: 500px; width: 90%;">
      <h3 style="color: #e67e22; margin-bottom: 20px;">Cambiar Estado de la Orden</h3>
      
      <div style="margin-bottom: 15px; padding: 12px; background: #f8f9fa; border-radius: 6px;">
        <strong>Estado Actual:</strong> <span class="status ${estadoActual}">${formatearEstado(estadoActual)}</span>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Nuevo Estado:*</label>
        <select id="nuevoEstadoOrden" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px;">
          <option value="">Seleccione un estado</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_proceso">En Proceso</option>
          <option value="finalizada">Finalizada</option>
          <option value="entregada">Entregada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Observaciones:</label>
        <textarea id="observacionesCambioEstado" rows="3" placeholder="Motivo o detalles del cambio de estado" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px; font-family: inherit;" required></textarea>
      </div>
      
      <div style="display: flex; gap: 10px;">
        <button onclick="cambiarEstadoOrden()" style="flex: 1; padding: 12px; background: #e67e22; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
          Cambiar Estado
        </button>
        <button onclick="cerrarFormularioCambioEstado()" style="flex: 1; padding: 12px; background: #95a5a6; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
          Cancelar
        </button>
      </div>
    </div>
    <div onclick="cerrarFormularioCambioEstado()" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999;"></div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', formHTML);
}

function cerrarFormularioCambioEstado() {
  const form = document.getElementById('formCambioEstado');
  if (form && form.parentElement) {
    form.parentElement.removeChild(form);
  }
  
  // Limpiar solo los overlays de formularios (z-index: 9999)
  const overlays = document.querySelectorAll('div[style*="z-index: 9999"]:not(#modalReporteGestion)');
  overlays.forEach(o => {
    if (o && o.parentElement) {
      o.parentElement.removeChild(o);
    }
  });
}


// Modal de reporte completo con gestión


async function verReporteCompletoGestion(id) {
  ordenActualId = id;
  
  try {
    // Cargar datos de la orden

    const resOrden = await fetch(`${API_CONFIG.ordenes}/reporte/${id}`);

    if (!resOrden.ok) throw new Error('Error al cargar el reporte');
    
    const reporte = await resOrden.json();
    const { orden } = reporte;
    
    if (!orden) {
      alert('No se encontró información de la orden');
      return;
    }
    
    // Cargar servicios y repuestos
    const servicios = await cargarServiciosRealizados(id);
    const repuestos = await cargarRepuestosUtilizados(id);
    
    mostrarModalGestion(orden, servicios, repuestos);
  } catch (error) {
    console.error("Error al cargar reporte:", error);
    alert('Error al cargar el reporte completo');
  }
}

function mostrarModalGestion(orden, servicios, repuestos) {
  const fechaEstimada = orden.fecha_estimada_salida 
    ? new Date(orden.fecha_estimada_salida).toLocaleDateString('es-GT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    : 'N/A';
  
  const modalHTML = `
    <div id="modalReporteGestion" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center; overflow-y: auto; padding: 20px;" onclick="cerrarModalGestion(event)">
      <div style="background: white; padding: 30px; border-radius: 15px; max-width: 900px; width: 100%; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation()">
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 3px solid #e67e22; padding-bottom: 15px;">
          <h2 style="color: #34495e; margin: 0;">Orden de Trabajo #${orden.numero_orden || 'N/A'}</h2>
          <button onclick="cerrarModalGestion()" style="background: #e74c3c; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">

            ✕

          </button>
        </div>
        
        <!-- Información General -->
        <div style="margin-bottom: 25px; background: #f8f9fa; padding: 20px; border-radius: 10px;">

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="color: #e67e22; margin: 0; font-size: 1.1rem;">Información General</h3>
            <button onclick="mostrarFormularioCambioEstado('${orden.estado}')" style="background: #9b59b6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">
              Cambiar Estado
            </button>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px;">
            <div><strong>Estado:</strong> <span class="status ${orden.estado}">${formatearEstado(orden.estado)}</span></div>
            <div><strong>Cliente:</strong> ${orden.nombre_cliente || orden.cliente_id || 'N/A'}</div>
            <div><strong>Vehículo:</strong> ${orden.vehiculo_completo || 'N/A'}</div>
            <div><strong>Mecánico:</strong> ${orden.mecanico_responsable || orden.nombre_mecanico || 'Sin asignar'}</div>
            <div><strong>Fecha Estimada:</strong> ${fechaEstimada}</div>
            <div><strong>Kilometraje:</strong> ${orden.kilometraje_ingreso || 'N/A'} km</div>
          </div>
          
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
            <div style="margin-bottom: 8px;"><strong>Descripción:</strong> ${orden.descripcion_inicial || 'N/A'}</div>
            <div style="margin-bottom: 8px;"><strong>Diagnóstico:</strong> ${orden.diagnostico || 'N/A'}</div>
            <div><strong>Observaciones:</strong> ${orden.observaciones || 'N/A'}</div>
          </div>
        </div>
        
        <!-- Servicios Realizados -->
        <div style="margin-bottom: 25px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="color: #3498db; margin: 0; font-size: 1.1rem;">
              <i class="fas fa-tools"></i> Servicios Realizados
            </h3>
            <button onclick="mostrarFormularioServicio()" style="background: #3498db; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">

              Agregar Servicio

            </button>
          </div>
          <div id="listaServicios" style="background: #f8f9fa; padding: 15px; border-radius: 8px; min-height: 100px;">
            ${renderizarServicios(servicios)}
          </div>
        </div>
        
        <!-- Repuestos Utilizados -->
        <div style="margin-bottom: 25px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="color: #e67e22; margin: 0; font-size: 1.1rem;">
              <i class="fas fa-cog"></i> Repuestos Utilizados
            </h3>
            <button onclick="mostrarFormularioRepuesto()" style="background: #e67e22; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">

              Agregar Repuesto

            </button>
          </div>
          <div id="listaRepuestos" style="background: #f8f9fa; padding: 15px; border-radius: 8px; min-height: 100px;">
            ${renderizarRepuestos(repuestos)}
          </div>
        </div>
        
        <!-- Resumen de Costos -->
        <div id="resumenCostos" style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 20px; border-radius: 10px; border: 2px solid #e67e22;">
          ${calcularResumenCostos(orden, servicios, repuestos)}
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Renderiza listas






function renderizarServicios(servicios) {
  if (!servicios || servicios.length === 0) {
    return '<p style="color: #95a5a6; font-style: italic; text-align: center; padding: 20px;">No hay servicios registrados</p>';
  }
  
  return servicios.map(s => `
    <div style="background: white; padding: 12px; margin-bottom: 10px; border-radius: 6px; border-left: 4px solid #3498db; display: flex; justify-content: space-between; align-items: center;">
      <div style="flex: 1;">
        <strong style="color: #2c3e50;">${s.nombre_servicio || 'Servicio'}</strong>
        <p style="margin: 5px 0; color: #7f8c8d; font-size: 0.9em;">${s.descripcion_trabajo || 'Sin descripción'}</p>
        <div style="display: flex; gap: 20px; font-size: 0.85em; color: #95a5a6;">
          <span><strong>Costo:</strong> Q${parseFloat(s.costo || 0).toFixed(2)}</span>
          <span><strong>Tiempo:</strong> ${s.tiempo_empleado || 0} min</span>
        </div>
      </div>
      <button onclick="eliminarServicioOrden(${s.id})" style="background: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85em;">

        Eliminar

      </button>
    </div>
  `).join('');
}

function renderizarRepuestos(repuestos) {
  if (!repuestos || repuestos.length === 0) {
    return '<p style="color: #95a5a6; font-style: italic; text-align: center; padding: 20px;">No hay repuestos registrados</p>';
  }
  
  return repuestos.map(r => `
    <div style="background: white; padding: 12px; margin-bottom: 10px; border-radius: 6px; border-left: 4px solid #e67e22; display: flex; justify-content: space-between; align-items: center;">
      <div style="flex: 1;">
        <strong style="color: #2c3e50;">${r.nombre_repuesto || 'Repuesto'}</strong>
        <p style="margin: 5px 0; color: #7f8c8d; font-size: 0.9em;">${r.descripcion || 'Sin descripción'}</p>
        <div style="display: flex; gap: 20px; font-size: 0.85em; color: #95a5a6;">
          <span><strong>Cantidad:</strong> ${r.cantidad || 0}</span>

          <span><strong>Costo Unit.:</strong> Q${parseFloat(r.costo_cliente || 0).toFixed(2)}</span>
          <span><strong>Total:</strong> Q${(parseFloat(r.cantidad || 0) * parseFloat(r.costo_cliente || 0)).toFixed(2)}</span>
          ${r.proveedor ? `<span><strong>Proveedor:</strong> ${r.proveedor}</span>` : ''}
        </div>
      </div>
      <button onclick="eliminarRepuestoOrden(${r.id})" style="background: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85em;">
        Eliminar

      </button>
    </div>
  `).join('');
}

function calcularResumenCostos(orden, servicios, repuestos) {
  const costoServicios = servicios.reduce((sum, s) => sum + parseFloat(s.costo || 0), 0);
  const costoRepuestos = repuestos.reduce((sum, r) => sum + (parseFloat(r.cantidad || 0) * parseFloat(r.costo_cliente || 0)), 0);
  const costoManoObra = parseFloat(orden.costo_mano_obra || 0);
  const total = parseFloat(orden.costo_total || 0) || (costoManoObra + costoServicios + costoRepuestos);
  
  return `
    <h3 style="color: #e67e22; margin-bottom: 15px;">Resumen de Costos</h3>
    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
      <span><strong>Mano de Obra:</strong></span>
      <span>Q${costoManoObra.toFixed(2)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
      <span><strong>Servicios (${servicios.length}):</strong></span>
      <span>Q${costoServicios.toFixed(2)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 2px solid #bdc3c7;">
      <span><strong>Repuestos (${repuestos.length}):</strong></span>
      <span>Q${costoRepuestos.toFixed(2)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 1.3rem; font-weight: bold; color: #2c3e50;">
      <span>TOTAL:</span>
      <span style="color: #e67e22;">Q${total.toFixed(2)}</span>
    </div>
  `;
}

// Formularios

async function mostrarFormularioServicio() {
  const catalogoServicios = await cargarCatalogoServicios();
  
  if (!catalogoServicios || catalogoServicios.length === 0) {
    alert('No hay servicios disponibles en el catálogo');
    return;
  }

  




  const formHTML = `
    <div id="formServicio" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 10000; max-width: 500px; width: 90%;">
      <h3 style="color: #3498db; margin-bottom: 20px;">Agregar Servicio Realizado</h3>
      
      <div style="margin-bottom: 15px;">

        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Servicio:*</label>
        <select id="servicio_id" onchange="cargarDatosServicio()" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px;">
          <option value="">Seleccione un servicio</option>
          ${catalogoServicios.map(s => `<option value="${s.id}" data-precio="${s.precio_base || 0}" data-tiempo="${s.tiempo_estimado || 0}">${s.nombre}</option>`).join('')}

        </select>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Descripción del Trabajo:</label>

        <textarea id="descripcion_trabajo" rows="3" placeholder="Detalles del trabajo realizado..." style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px; font-family: inherit;"></textarea>

      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        <div>

          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Costo (Q):*</label>
          <input type="number" id="costo" step="0.01" min="0" placeholder="0.00" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px;">
        </div>
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Tiempo (min):</label>
          <input type="number" id="tiempo_empleado" min="0" placeholder="0" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px;">

        </div>
      </div>
      
      <div style="display: flex; gap: 10px;">
        <button onclick="guardarServicio()" style="flex: 1; padding: 12px; background: #3498db; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
          Guardar
        </button>
        <button onclick="cerrarFormularioServicio()" style="flex: 1; padding: 12px; background: #95a5a6; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
          Cancelar
        </button>
      </div>
    </div>
    <div onclick="cerrarFormularioServicio()" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999;"></div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', formHTML);
}

function cargarDatosServicio() {
  const select = document.getElementById('servicio_id');

  const costoInput = document.getElementById('costo');
  const tiempoInput = document.getElementById('tiempo_empleado');
  
  if (!select || !costoInput || !tiempoInput) {
    console.error('No se encontraron los elementos del formulario');
    return;
  }
  
  const option = select.options[select.selectedIndex];
  
  if (option && option.value) {
    const precio = option.getAttribute('data-precio');
    const tiempo = option.getAttribute('data-tiempo');
    
    costoInput.value = precio || '';
    tiempoInput.value = tiempo || '';
  
  } else {
    costoInput.value = '';
    tiempoInput.value = '';

  }
}

async function guardarServicio() {

  const servicioId = document.getElementById('servicio_id').value;
  const costo = document.getElementById('costo').value;
  const descripcionTrabajo = document.getElementById('descripcion_trabajo').value;
  const tiempoEmpleado = document.getElementById('tiempo_empleado').value;
  
  // Validación
  if (!servicioId || servicioId === "") {
    alert('Por favor seleccione un servicio');
    return;
  }
  
  if (!costo || parseFloat(costo) <= 0) {
    alert('Por favor ingrese un costo válido');
    return;
  }
  
  const datos = {
    orden_trabajo_id: ordenActualId,
    servicio_id: parseInt(servicioId),
    descripcion_trabajo: descripcionTrabajo || null,
    costo: parseFloat(costo),
    tiempo_empleado: tiempoEmpleado ? parseInt(tiempoEmpleado) : null
  };
  
  try {
    agregarServicioRealizado(datos);
    
    cerrarFormularioServicio();
    alert('Servicio agregado exitosamente');
    await recargarModal();
  } catch (error) {
    console.error('Error completo:', error); // Debug
    alert('Error al agregar servicio: ' + error.message);

  }
}

function cerrarFormularioServicio() {
  const form = document.getElementById('formServicio');

  if (form && form.parentElement) {
    form.parentElement.removeChild(form);
  }
  
  // Limpiar solo los overlays de formularios (z-index: 9999)
  const overlays = document.querySelectorAll('div[style*="z-index: 9999"]:not(#modalReporteGestion)');
  overlays.forEach(o => {
    if (o && o.parentElement) {
      o.parentElement.removeChild(o);
    }
  });

}

async function mostrarFormularioRepuesto() {
  const formHTML = `
    <div id="formRepuesto" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 10000; max-width: 500px; width: 90%;">
      <h3 style="color: #e67e22; margin-bottom: 20px;">Agregar Repuesto Utilizado</h3>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Nombre del Repuesto:*</label>
        <input type="text" id="nombre_repuesto" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px;">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Descripción:</label>
        <textarea id="descripcion" rows="2" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px; font-family: inherit;"></textarea>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Cantidad:*</label>
          <input type="number" id="cantidad" min="1" value="1" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px;">
        </div>
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Costo (Q):*</label>
          <input type="number" id="costo_cliente" step="0.01" min="0" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px;">
        </div>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Proveedor:</label>
        <input type="text" id="proveedor" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px;">
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Observaciones:</label>
        <textarea id="observaciones" rows="2" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px; font-family: inherit;"></textarea>
      </div>
      
      <div style="display: flex; gap: 10px;">
        <button onclick="guardarRepuesto()" style="flex: 1; padding: 12px; background: #e67e22; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
          Guardar
        </button>
        <button onclick="cerrarFormularioRepuesto()" style="flex: 1; padding: 12px; background: #95a5a6; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
          Cancelar
        </button>
      </div>
    </div>
    <div onclick="cerrarFormularioRepuesto()" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999;"></div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', formHTML);
}

async function guardarRepuesto() {
  const datos = {
    orden_trabajo_id: ordenActualId,
    nombre_repuesto: document.getElementById('nombre_repuesto').value,
    descripcion: document.getElementById('descripcion').value,
    cantidad: parseInt(document.getElementById('cantidad').value),
    costo_cliente: parseFloat(document.getElementById('costo_cliente').value),
    proveedor: document.getElementById('proveedor').value,
    observaciones: document.getElementById('observaciones').value
  };
  
  if (!datos.nombre_repuesto || !datos.cantidad || !datos.costo_cliente) {
    alert('Por favor complete los campos obligatorios (*)');
    return;
  }
  
  try {
    await agregarRepuestoUtilizado(datos);
    cerrarFormularioRepuesto();

    alert('Repuesto agregado exitosamente');
    await recargarModal();
  } catch (error) {
    console.error('Error al agregar repuesto:', error);
    alert('Error al agregar repuesto: ' + error.message);

  }
}

function cerrarFormularioRepuesto() {
  const form = document.getElementById('formRepuesto');

  if (form && form.parentElement) {
    form.parentElement.removeChild(form);
  }
  
  // Limpiar solo los overlays de formularios (z-index: 9999)
  const overlays = document.querySelectorAll('div[style*="z-index: 9999"]:not(#modalReporteGestion)');
  overlays.forEach(o => {
    if (o && o.parentElement) {
      o.parentElement.removeChild(o);
    }
  });
}

// Eliminar servicio








async function eliminarServicioOrden(id) {
  if (!confirm('¿Está seguro de eliminar este servicio?')) return;
  
  try {
    await eliminarServicioRealizado(id);

    alert('Servicio eliminado exitosamente');
    await recargarModal();
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    alert('Error al eliminar servicio: ' + error.message);
  }
}

// Eliminar repuesto
async function eliminarRepuestoOrden(id) {
  if (!confirm('¿Está seguro de eliminar este repuesto?')) return;
  
  try {
    await eliminarRepuestoUtilizado(id);
    alert('Repuesto eliminado exitosamente');
    await recargarModal();
  } catch (error) {
    console.error('Error al eliminar repuesto:', error);
    alert('Error al eliminar repuesto: ' + error.message);

  }
}

// Utilidades

async function recargarModal() {
  if (!ordenActualId) {
    console.error('No hay orden actual para recargar');
    return;
  }
  
  const idOrden = ordenActualId; // Guardar el ID antes de cerrar
  
  // Cerrar modal y overlays existentes
  const modal = document.getElementById('modalReporteGestion');
  if (modal) modal.remove();
  
  // Limpiar todos los overlays
  const overlays = document.querySelectorAll('div[style*="z-index: 9999"], div[style*="z-index: 10000"]');
  overlays.forEach(o => o.remove());
  
  // Esperar un poco para que se complete la limpieza
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Recargar el modal con los datos actualizados
  try {
    await verReporteCompletoGestion(idOrden);
  } catch (error) {
    console.error('Error al recargar modal:', error);
    alert('Error al recargar el reporte. Por favor, cierre y vuelva a abrir.');
  }



}

function cerrarModalGestion(event) {
  if (event && event.target.id !== 'modalReporteGestion') return;
  
  const modal = document.getElementById('modalReporteGestion');
  if (modal) modal.remove();

  
  // Limpiar todos los overlays restantes
  const overlays = document.querySelectorAll('div[style*="z-index: 9999"], div[style*="z-index: 10000"]');
  overlays.forEach(o => o.remove());
  

  ordenActualId = null;
}

// Exportar funciones globales
window.verReporteCompletoGestion = verReporteCompletoGestion;
window.mostrarFormularioServicio = mostrarFormularioServicio;
window.mostrarFormularioRepuesto = mostrarFormularioRepuesto;

window.mostrarFormularioCambioEstado = mostrarFormularioCambioEstado;
window.guardarServicio = guardarServicio;
window.guardarRepuesto = guardarRepuesto;
window.cambiarEstadoOrden = cambiarEstadoOrden;
window.eliminarServicioOrden = eliminarServicioOrden;
window.eliminarRepuestoOrden = eliminarRepuestoOrden;
window.cerrarFormularioServicio = cerrarFormularioServicio;
window.cerrarFormularioRepuesto = cerrarFormularioRepuesto;
window.cerrarFormularioCambioEstado = cerrarFormularioCambioEstado;

window.cargarDatosServicio = cargarDatosServicio;
window.cerrarModalGestion = cerrarModalGestion;