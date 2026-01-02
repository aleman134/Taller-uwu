// Determinar el rol del usuario actual
function obtenerRolUsuario() {
  const user = JSON.parse(localStorage.getItem('usuario'));
  return user ? user.rol : null;
}

// Configurar interfaz según rol
function configurarInterfazHistorialPorRol() {
  const rol = obtenerRolUsuario();

  if (rol === 'administrador') {
    mostrarTodosControlesHistorial();
  } else if (rol === 'mecanico') {
    ocultarControlesEdicionHistorial();
  }
}

function mostrarTodosControlesHistorial() {
  const controls = document.querySelector('.controls-container');
  if (controls) controls.style.display = 'block';

  const oldStyle = document.getElementById('mecanico-historial-style');
  if (oldStyle) oldStyle.remove();
}

function ocultarControlesEdicionHistorial() {
  const oldStyle = document.getElementById('mecanico-historial-style');
  if (oldStyle) oldStyle.remove();

  const style = document.createElement('style');
  style.id = 'mecanico-historial-style';
  style.textContent = `
    .controls-container {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}

//Cargar contenido HTML en la sección
function cargarFormularioHistorial() {
  const section = document.getElementById('history');
  if (!section) return;

  section.innerHTML = `
    <div class="search-section">
      <h3>Buscar Historial</h3>
      <div class="search-controls">
        <div class="search-group">
          <select id="tipoBusqueda" class="form-control" onchange="cambiarTipoBusqueda()">
            <option value="orden">Por Orden de Trabajo</option>
            <option value="vehiculo">Por Vehículo</option>
          </select>
        </div>
        <div class="search-group" id="searchInputGroup">
          <input type="number" id="ordenInput" placeholder="Ingrese ID de Orden" class="form-control">
          <button class="btn-search" onclick="buscarHistorial()">
            <i class="fas fa-search"></i> Buscar
          </button>
        </div>
        <button class="btn-show-all" onclick="cargarProximosMantenimientos()">
          <i class="fas fa-calendar-alt"></i> Ver Próximos Mantenimientos
        </button>
      </div>
    </div>

    <div class="users-section">
      <h3 id="tituloTablaHistorial">Detalles del Historial</h3>
      <div class="table-responsive">
        <table class="users-table">
          <thead id="historialHead">
            <tr>
              <th>Número Orden</th>
              <th>Cliente</th>
              <th>Vehículo</th>
              <th>Fecha Ingreso</th>
              <th>Fecha Salida</th>
              <th>Estado</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody id="historialBody">
            <tr>
              <td colspan="8" class="no-users">Seleccione un tipo de búsqueda e ingrese los datos</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="users-section" id="detalleOrdenSection" style="display: none;">
      <h3>Información Detallada de la Orden</h3>
      <div id="infoOrdenDetalle" style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <!-- Se llenará dinámicamente -->
      </div>

      <h3>Servicios Realizados</h3>
      <div class="table-responsive">
        <table class="users-table">
          <thead>
            <tr>
              <th>ID Servicio</th>
              <th>Descripción</th>
              <th>Costo</th>
            </tr>
          </thead>
          <tbody id="tablaServiciosOrden">
            <tr><td colspan="3" class="no-users">Sin servicios</td></tr>
          </tbody>
        </table>
      </div>

      <h3 style="margin-top: 20px;">Repuestos Utilizados</h3>
      <div class="table-responsive">
        <table class="users-table">
          <thead>
            <tr>
              <th>ID Repuesto</th>
              <th>Nombre</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody id="tablaRepuestosOrden">
            <tr><td colspan="5" class="no-users">Sin repuestos</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  configurarInterfazHistorialPorRol();
}

// =================== Cambiar tipo de búsqueda ===================
function cambiarTipoBusqueda() {
  const tipo = document.getElementById("tipoBusqueda").value;
  const inputGroup = document.getElementById("searchInputGroup");
  const thead = document.getElementById("historialHead");
  
  if (tipo === "orden") {
    inputGroup.innerHTML = `
      <input type="number" id="ordenInput" placeholder="Ingrese ID de Orden" class="form-control">
      <button class="btn-search" onclick="buscarHistorial()">
        <i class="fas fa-search"></i> Buscar
      </button>
    `;
    
    if (thead) {
      thead.innerHTML = `
        <tr>
          <th>Número Orden</th>
          <th>Cliente</th>
          <th>Vehículo</th>
          <th>Fecha Ingreso</th>
          <th>Fecha Salida</th>
          <th>Estado</th>
          <th>Total</th>
        </tr>
      `;
    }
  } else if (tipo === "vehiculo") {
    inputGroup.innerHTML = `
      <input type="number" id="vehiculoInput" placeholder="Ingrese ID de Vehículo" class="form-control">
      <button class="btn-search" onclick="buscarHistorial()">
        <i class="fas fa-search"></i> Buscar
      </button>
    `;
    
    if (thead) {
      thead.innerHTML = `
        <tr>
          <th>Número Orden</th>
          <th>Mecánico</th>
          <th>Kilometraje</th>
          <th>Fecha Servicio</th>
          <th>Próximo Mant.</th>
          <th>Estado</th>
          <th>Total</th>
        </tr>
      `;
    }
  }

  // Limpiar resultados previos
  const tbody = document.getElementById("historialBody");
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="8" class="no-users">Seleccione un tipo de búsqueda e ingrese los datos</td></tr>';
  }
  
  const detalleSection = document.getElementById("detalleOrdenSection");
  if (detalleSection) detalleSection.style.display = 'none';
}

// =================== Buscar historial (unificado) ===================
async function buscarHistorial() {
  const tipo = document.getElementById("tipoBusqueda").value;
  
  if (tipo === "orden") {
    await buscarHistorialOrden();
  } else if (tipo === "vehiculo") {
    await buscarHistorialVehiculo();
  }
}

// =================== Buscar historial por orden ===================
async function buscarHistorialOrden() {
  const ordenId = document.getElementById("ordenInput").value;
  if (!ordenId) {
    await mostrarDialogo("Por favor, ingrese un ID de orden");
    return;
  }

  try {
    const response = await getHistorialOrdenPorId(ordenId);
    
    const tbody = document.getElementById("historialBody");
    const detalleSection = document.getElementById("detalleOrdenSection");
    const titulo = document.getElementById("tituloTablaHistorial");
    
    if (titulo) titulo.textContent = "Detalles de la Orden";

    if (!response || !response.id) {
      tbody.innerHTML = '<tr><td colspan="8" class="no-users">No se encontró historial para esta orden</td></tr>';
      if (detalleSection) detalleSection.style.display = 'none';
      return;
    }

    const orden = response;

    tbody.innerHTML = `
      <tr>
        <td>${orden.numero_orden || 'N/A'}</td>
        <td>${orden.nombre_cliente || 'N/A'}</td>
        <td>${orden.vehiculo_completo || orden.placa || 'N/A'}</td>
        <td>${orden.fecha_ingreso ? new Date(orden.fecha_ingreso).toLocaleDateString('es-GT') : 'N/A'}</td>
        <td>${orden.fecha_real_salida ? new Date(orden.fecha_real_salida).toLocaleDateString('es-GT') : 'Pendiente'}</td>
        <td><span class="badge badge-${orden.estado?.toLowerCase()}">${orden.estado || 'N/A'}</span></td>
        <td>Q${parseFloat(orden.costo_total || 0).toFixed(2)}</td>
      </tr>
    `;

    // Cargar detalle automáticamente
    await verDetalleOrden(orden.id, orden);

  } catch (error) {
    console.error("Error al buscar historial:", error);
    const tbody = document.getElementById("historialBody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="8" class="no-users">Error: ${error.message || 'Error al buscar el historial'}</td></tr>`;
    }
  }
}

// =================== Buscar historial por vehículo ===================
async function buscarHistorialVehiculo() {
  const vehiculoId = document.getElementById("vehiculoInput").value;
  if (!vehiculoId) {
    await mostrarDialogo("Por favor, ingrese un ID de vehículo");
    return;
  }

  try {
    const response = await getHistorialPorVehiculo(vehiculoId);
    
    const tbody = document.getElementById("historialBody");
    const detalleSection = document.getElementById("detalleOrdenSection");
    const titulo = document.getElementById("tituloTablaHistorial");

    const historial = Array.isArray(response) ? response : [];

    if (historial.length === 0) {
      if (titulo) titulo.textContent = `Historial del Vehículo ID: ${vehiculoId}`;
      tbody.innerHTML = '<tr><td colspan="8" class="no-users">No se encontró historial para este vehículo</td></tr>';
      if (detalleSection) detalleSection.style.display = 'none';
      return;
    }

    // Obtener información del vehículo del primer registro
    const primerRegistro = historial[0];
    let tituloVehiculo = `Vehículo ID: ${vehiculoId}`;
    
    // Ahora tenemos marca y modelo desde el SP
    if (primerRegistro.vehiculo_info) {
      tituloVehiculo = primerRegistro.vehiculo_info;
    } else if (primerRegistro.marca && primerRegistro.modelo) {
      tituloVehiculo = `${primerRegistro.marca} ${primerRegistro.modelo}`;
    }
    
    if (primerRegistro.placa) {
      tituloVehiculo += ` (${primerRegistro.placa})`;
    }
    
    if (titulo) titulo.textContent = `Historial del ${tituloVehiculo}`;

    tbody.innerHTML = historial.map(h => `
      <tr>
        <td>${h.numero_orden || 'N/A'}</td>
        <td>${h.mecanico_responsable || 'N/A'}</td>
        <td>${h.kilometraje ? h.kilometraje.toLocaleString('es-GT') + ' km' : 'N/A'}</td>
        <td>${h.fecha_servicio ? new Date(h.fecha_servicio).toLocaleDateString('es-GT') : 'N/A'}</td>
        <td>${h.fecha_proximo_mantenimiento ? new Date(h.fecha_proximo_mantenimiento).toLocaleDateString('es-GT') : 'N/A'}</td>
        <td><span class="badge badge-${h.estado_orden?.toLowerCase()}">${h.estado_orden || 'N/A'}</span></td>
        <td>Q${parseFloat(h.costo_total || 0).toFixed(2)}</td>
      </tr>
    `).join('');

    // Mostrar detalles del primer servicio automáticamente
    if (historial.length > 0) {
      await verDetalleHistorialVehiculo(historial[0].orden_trabajo_id, historial[0]);
    }

  } catch (error) {
    console.error("Error al buscar historial por vehículo:", error);
    const tbody = document.getElementById("historialBody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="8" class="no-users">Error: ${error.message || 'Error al buscar el historial del vehículo'}</td></tr>`;
    }
  }
}


// =================== Ver detalle de orden ===================
async function verDetalleOrden(ordenId, ordenData = null) {
  try {
    const [serviciosResponse, repuestosResponse] = await Promise.all([
      getServiciosRealizadosPorOrden(ordenId),
      getRepuestosPorOrden(ordenId)
    ]);

    const detalleSection = document.getElementById("detalleOrdenSection");
    if (detalleSection) {
      detalleSection.style.display = 'block';
    }

    // Mostrar información detallada de la orden
    if (ordenData) {
      const infoDetalle = document.getElementById("infoOrdenDetalle");
      if (infoDetalle) {
        infoDetalle.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
            <div><strong>Número de Orden:</strong> ${ordenData.numero_orden || 'N/A'}</div>
            <div><strong>Cliente:</strong> ${ordenData.nombre_cliente || 'N/A'}</div>
            <div><strong>Vehículo:</strong> ${ordenData.vehiculo_completo || ordenData.placa || 'N/A'}</div>
            <div><strong>Mecánico:</strong> ${ordenData.nombre_mecanico || 'N/A'}</div>
            <div><strong>Teléfono Mecánico:</strong> ${ordenData.telefono_mecanico || 'N/A'}</div>
            <div><strong>Kilometraje Ingreso:</strong> ${ordenData.kilometraje_ingreso || 'N/A'} km</div>
            <div><strong>Días de Duración:</strong> ${ordenData.dias_duracion || 0} días</div>
            <div><strong>Costo Mano de Obra:</strong> Q${parseFloat(ordenData.costo_mano_obra || 0).toFixed(2)}</div>
            <div style="grid-column: 1 / -1;"><strong>Descripción Inicial:</strong> ${ordenData.descripcion_inicial || 'N/A'}</div>
            <div style="grid-column: 1 / -1;"><strong>Diagnóstico:</strong> ${ordenData.diagnostico || 'N/A'}</div>
            <div style="grid-column: 1 / -1;"><strong>Observaciones:</strong><br>${(ordenData.observaciones || 'Sin observaciones').replace(/\n/g, '<br>')}</div>
          </div>
        `;
      }
    }

    // Procesar servicios
    const servicios = Array.isArray(serviciosResponse) ? serviciosResponse : [];

    const tbodyServicios = document.getElementById("tablaServiciosOrden");
    if (tbodyServicios) {
      if (servicios.length === 0) {
        tbodyServicios.innerHTML = '<tr><td colspan="3" class="no-users">No hay servicios registrados</td></tr>';
      } else {
        tbodyServicios.innerHTML = servicios.map(s => `
          <tr>
            <td>${s.servicio_realizado_id || s.servicio_id || s.id || 'N/A'}</td>
            <td>${s.descripcion || s.nombre_servicio || s.nombre || 'N/A'}</td>
            <td>Q${parseFloat(s.costo || s.precio || s.precio_servicio || 0).toFixed(2)}</td>
          </tr>
        `).join('');
      }
    }

    // Procesar repuestos
    const repuestos = Array.isArray(repuestosResponse) ? repuestosResponse : [];

    const tbodyRepuestos = document.getElementById("tablaRepuestosOrden");
    if (tbodyRepuestos) {
      if (repuestos.length === 0) {
        tbodyRepuestos.innerHTML = '<tr><td colspan="5" class="no-users">No hay repuestos utilizados</td></tr>';
      } else {
        tbodyRepuestos.innerHTML = repuestos.map(r => `
          <tr>
            <td>${r.id || r.repuesto_utilizado_id || r.repuesto_id || 'N/A'}</td>
            <td>${r.nombre_repuesto || r.nombre || 'N/A'}</td>
            <td>${r.cantidad || 0}</td>
            <td>Q${parseFloat(r.costo_cliente || r.precio_unitario || r.precio || 0).toFixed(2)}</td>
            <td>Q${parseFloat(r.costo_total_repuesto || (r.cantidad * (r.costo_cliente || r.precio_unitario || r.precio || 0)) || 0).toFixed(2)}</td>
          </tr>
        `).join('');
      }
    }

  } catch (error) {
    console.error("Error al cargar detalle de orden:", error);
    await mostrarDialogo("Error al cargar el detalle de la orden");
  }
}

// =================== Ver detalle de historial de vehículo ===================
async function verDetalleHistorialVehiculo(ordenId, historialData = null) {
  try {
    const [serviciosResponse, repuestosResponse] = await Promise.all([
      getServiciosRealizadosPorOrden(ordenId),
      getRepuestosPorOrden(ordenId)
    ]);

    const detalleSection = document.getElementById("detalleOrdenSection");
    if (detalleSection) {
      detalleSection.style.display = 'block';
    }

    // Mostrar información del historial
    if (historialData) {
      const infoDetalle = document.getElementById("infoOrdenDetalle");
      if (infoDetalle) {
        infoDetalle.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
            <div><strong>Número de Orden:</strong> ${historialData.numero_orden || 'N/A'}</div>
            <div><strong>Mecánico:</strong> ${historialData.mecanico_responsable || 'N/A'}</div>
            <div><strong>Fecha Servicio:</strong> ${historialData.fecha_servicio ? new Date(historialData.fecha_servicio).toLocaleDateString('es-GT') : 'N/A'}</div>
            <div><strong>Kilometraje:</strong> ${historialData.kilometraje ? historialData.kilometraje.toLocaleString('es-GT') + ' km' : 'N/A'}</div>
            <div><strong>Próximo Mantenimiento:</strong> ${historialData.fecha_proximo_mantenimiento ? new Date(historialData.fecha_proximo_mantenimiento).toLocaleDateString('es-GT') : 'No programado'}</div>
            <div><strong>Próximo Mantenimiento (km):</strong> ${historialData.proximo_mantenimiento_km ? historialData.proximo_mantenimiento_km.toLocaleString('es-GT') + ' km' : 'No definido'}</div>
            <div style="grid-column: 1 / -1;"><strong>Diagnóstico Inicial:</strong> ${historialData.diagnostico_inicial || 'No especificado'}</div>
            <div style="grid-column: 1 / -1;"><strong>Reparaciones Realizadas:</strong><br>${(historialData.reparaciones_realizadas || 'No especificadas').replace(/\n/g, '<br>')}</div>
            <div style="grid-column: 1 / -1;"><strong>Recomendaciones Futuras:</strong><br>${(historialData.recomendaciones_futuras || 'Sin recomendaciones').replace(/\n/g, '<br>')}</div>
            ${historialData.observaciones ? `<div style="grid-column: 1 / -1;"><strong>Observaciones:</strong><br>${historialData.observaciones.replace(/\n/g, '<br>')}</div>` : ''}
          </div>
        `;
      }
    }

    // Procesar servicios
    const servicios = Array.isArray(serviciosResponse) ? serviciosResponse : [];

    const tbodyServicios = document.getElementById("tablaServiciosOrden");
    if (tbodyServicios) {
      if (servicios.length === 0) {
        tbodyServicios.innerHTML = '<tr><td colspan="3" class="no-users">No hay servicios registrados</td></tr>';
      } else {
        tbodyServicios.innerHTML = servicios.map(s => `
          <tr>
            <td>${s.servicio_realizado_id || s.servicio_id || s.id || 'N/A'}</td>
            <td>${s.descripcion || s.nombre_servicio || s.nombre || 'N/A'}</td>
            <td>Q${parseFloat(s.costo || s.precio || s.precio_servicio || 0).toFixed(2)}</td>
          </tr>
        `).join('');
      }
    }

    // Procesar repuestos
    const repuestos = Array.isArray(repuestosResponse) ? repuestosResponse : [];

    const tbodyRepuestos = document.getElementById("tablaRepuestosOrden");
    if (tbodyRepuestos) {
      if (repuestos.length === 0) {
        tbodyRepuestos.innerHTML = '<tr><td colspan="5" class="no-users">No hay repuestos utilizados</td></tr>';
      } else {
        tbodyRepuestos.innerHTML = repuestos.map(r => `
          <tr>
            <td>${r.id || r.repuesto_utilizado_id || r.repuesto_id || 'N/A'}</td>
            <td>${r.nombre_repuesto || r.nombre || 'N/A'}</td>
            <td>${r.cantidad || 0}</td>
            <td>Q${parseFloat(r.costo_cliente || r.precio_unitario || r.precio || 0).toFixed(2)}</td>
            <td>Q${parseFloat(r.costo_total_repuesto || (r.cantidad * (r.costo_cliente || r.precio_unitario || r.precio || 0)) || 0).toFixed(2)}</td>
          </tr>
        `).join('');
      }
    }

  } catch (error) {
    console.error("Error al cargar detalle del historial:", error);
    await mostrarDialogo("Error al cargar el detalle del historial");
  }
}

//Cargar próximos mantenimientos 
async function cargarProximosMantenimientos() {
  try {
    const response = await getProximosMantenimientos();
    
    const tbody = document.getElementById("historialBody");
    const thead = document.getElementById("historialHead");
    const detalleSection = document.getElementById("detalleOrdenSection");
    const titulo = document.getElementById("tituloTablaHistorial");

    if (detalleSection) detalleSection.style.display = 'none';
    if (titulo) titulo.textContent = "Próximos Mantenimientos";

    console.log("Respuesta de próximos mantenimientos:", response);

    const proximos = Array.isArray(response) ? response : [];

    if (proximos.length === 0) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="11" class="no-users">No hay mantenimientos próximos programados</td></tr>';
      if (thead) {
        thead.innerHTML = `
          <tr>
            <th>ID Vehículo</th>
            <th>Vehículo</th>
            <th>Cliente</th>
            <th>Teléfono</th>
            <th>Km Actual</th>
            <th>Próximo Mant. (km)</th>
            <th>Km Restantes</th>
            <th>Fecha Próximo</th>
            <th>Días Restantes</th>
            <th>Recomendaciones</th>
            <th>Último Servicio</th>
          </tr>
        `;
      }
      return;
    }

    // Crear encabezados según el SP
    if (thead) {
      thead.innerHTML = `
        <tr>
          <th>ID Vehículo</th>
          <th>Vehículo</th>
          <th>Cliente</th>
          <th>Teléfono</th>
          <th>Km Actual</th>
          <th>Próximo Mant. (km)</th>
          <th>Km Restantes</th>
          <th>Fecha Próximo</th>
          <th>Días Restantes</th>
          <th>Recomendaciones</th>
          <th>Último Servicio</th>
        </tr>
      `;
    }

    if (tbody) {
      tbody.innerHTML = proximos.map(p => `
        <tr>
          <td>${p.vehiculo_id || 'N/A'}</td>
          <td>${p.vehiculo_info || 'N/A'}</td>
          <td>${p.nombre_cliente || 'N/A'}</td>
          <td>${p.telefono_cliente || 'N/A'}</td>
          <td>${p.kilometraje_actual ? p.kilometraje_actual.toLocaleString('es-GT') + ' km' : 'N/A'}</td>
          <td>${p.proximo_mantenimiento_km ? p.proximo_mantenimiento_km.toLocaleString('es-GT') + ' km' : 'N/A'}</td>
          <td>${p.km_restantes !== null && p.km_restantes !== undefined ? p.km_restantes.toLocaleString('es-GT') + ' km' : 'N/A'}</td>
          <td>${p.fecha_proximo_mantenimiento ? new Date(p.fecha_proximo_mantenimiento).toLocaleDateString('es-GT') : 'N/A'}</td>
          <td>${p.dias_restantes !== null && p.dias_restantes !== undefined ? p.dias_restantes + ' días' : 'N/A'}</td>
          <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${p.recomendaciones_futuras || 'Sin recomendaciones'}">${p.recomendaciones_futuras || 'Sin recomendaciones'}</td>
          <td>${p.ultimo_servicio ? new Date(p.ultimo_servicio).toLocaleDateString('es-GT') : 'N/A'}</td>
        </tr>
      `).join('');
    }

  } catch (error) {
    console.error("Error al cargar próximos mantenimientos:", error);
    const tbody = document.getElementById("historialBody");
    const thead = document.getElementById("historialHead");
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="11" class="no-users">Error al cargar próximos mantenimientos: ' + error.message + '</td></tr>';
    }
    if (thead) {
      thead.innerHTML = `
        <tr>
          <th>ID Vehículo</th>
          <th>Vehículo</th>
          <th>Cliente</th>
          <th>Teléfono</th>
          <th>Km Actual</th>
          <th>Próximo Mant. (km)</th>
          <th>Km Restantes</th>
          <th>Fecha Próximo</th>
          <th>Días Restantes</th>
          <th>Recomendaciones</th>
          <th>Último Servicio</th>
        </tr>
      `;
    }
  }
}

// =================== Exposición global ===================
window.obtenerRolUsuario = obtenerRolUsuario;
window.configurarInterfazHistorialPorRol = configurarInterfazHistorialPorRol;
window.cargarFormularioHistorial = cargarFormularioHistorial;
window.cambiarTipoBusqueda = cambiarTipoBusqueda;
window.buscarHistorial = buscarHistorial;
window.buscarHistorialOrden = buscarHistorialOrden;
window.buscarHistorialVehiculo = buscarHistorialVehiculo;
window.verDetalleOrden = verDetalleOrden;
window.verDetalleHistorialVehiculo = verDetalleHistorialVehiculo;
window.cargarProximosMantenimientos = cargarProximosMantenimientos;