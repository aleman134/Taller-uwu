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

// =================== Cargar contenido HTML en la sección ===================
function cargarFormularioHistorial() {
  const section = document.getElementById('history');
  if (!section) return;

  section.innerHTML = `
    <div class="search-section">
      <h3>Buscar Historial por Orden</h3>
      <div class="search-controls">
        <div class="search-group">
          <input type="number" id="ordenInput" placeholder="Ingrese ID de Orden" class="form-control">
          <button class="btn-search" onclick="buscarHistorialOrden()">
            <i class="fas fa-search"></i> Buscar
          </button>
        </div>
        <button class="btn-show-all" onclick="cargarProximosMantenimientos()">
          <i class="fas fa-calendar-alt"></i> Ver Próximos Mantenimientos
        </button>
      </div>
    </div>

    <div class="users-section">
      <h3>Detalles del Historial</h3>
      <div class="table-responsive">
        <table class="users-table">
          <thead>
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
              <td colspan="8" class="no-users">Ingrese un ID de orden para buscar o vea los próximos mantenimientos</td>
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

    <div class="users-section" id="proximosSection" style="display: none;">
      <h3>Próximos Mantenimientos</h3>
      <div class="table-responsive">
        <table class="users-table">
          <thead id="proximosTableHead"></thead>
          <tbody id="tablaProximos">
            <tr><td class="no-users">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  configurarInterfazHistorialPorRol();
}

// =================== Buscar historial por orden ===================
async function buscarHistorialOrden() {
  const ordenId = document.getElementById("ordenInput").value;
  if (!ordenId) {
    alert("Por favor, ingrese un ID de orden");
    return;
  }

  try {
    const response = await getHistorialOrdenPorId(ordenId);
    
    const tbody = document.getElementById("historialBody");
    const detalleSection = document.getElementById("detalleOrdenSection");
    const proximosSection = document.getElementById("proximosSection");
    
    if (proximosSection) proximosSection.style.display = 'none';

    // La respuesta es UN OBJETO con los datos de UNA orden
    if (!response || !response.id) {
      tbody.innerHTML = '<tr><td colspan="8" class="no-users">No se encontró historial para esta orden</td></tr>';
      if (detalleSection) detalleSection.style.display = 'none';
      return;
    }

    const orden = response;

    // Mostrar la orden en la tabla (convertir objeto a array de 1 elemento)
    tbody.innerHTML = `
      <tr>
        <td>${orden.numero_orden || 'N/A'}</td>
        <td>${orden.nombre_cliente || 'N/A'}</td>
        <td>${orden.vehiculo_completo || orden.placa || 'N/A'}</td>
        <td>${orden.fecha_ingreso ? new Date(orden.fecha_ingreso).toLocaleDateString('es-GT') : 'N/A'}</td>
        <td>${orden.fecha_real_salida ? new Date(orden.fecha_real_salida).toLocaleDateString('es-GT') : 'Pendiente'}</td>
        <td><span class="badge badge-${orden.estado?.toLowerCase()}">${orden.estado || 'N/A'}</span></td>
        <td>Q${parseFloat(orden.costo_total || 0).toFixed(2)}</td>
        <td>
        </td>
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

    // Mostrar información detallada de la orden si está disponible
    if (ordenData) {
      const infoDetalle = document.getElementById("infoOrdenDetalle");
      if (infoDetalle) {
        infoDetalle.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
            <div><strong>Mecánico:</strong> ${ordenData.nombre_mecanico || 'N/A'}</div>
            <div><strong>Teléfono Mecánico:</strong> ${ordenData.telefono_mecanico || 'N/A'}</div>
            <div><strong>Kilometraje Ingreso:</strong> ${ordenData.kilometraje_ingreso || 'N/A'} km</div>
            <div><strong>Días de Duración:</strong> ${ordenData.dias_duracion || 0} días</div>
            <div><strong>Costo Mano de Obra:</strong> Q${parseFloat(ordenData.costo_mano_obra || 0).toFixed(2)}</div>
            <div><strong>Descripción Inicial:</strong> ${ordenData.descripcion_inicial || 'N/A'}</div>
            <div><strong>Diagnóstico:</strong> ${ordenData.diagnostico || 'N/A'}</div>
            <div style="grid-column: 1 / -1;"><strong>Observaciones:</strong><br>${(ordenData.observaciones || 'Sin observaciones').replace(/\n/g, '<br>')}</div>
          </div>
        `;
      }
    }

    // Procesar servicios (ya viene como array)
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

    // Procesar repuestos (ya viene como array)
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
    alert("Error al cargar el detalle de la orden");
  }
}

// =================== Cargar próximos mantenimientos ===================
async function cargarProximosMantenimientos() {
  try {
    const response = await getProximosMantenimientos();
    
    const tbody = document.getElementById("tablaProximos");
    const thead = document.getElementById("proximosTableHead");
    const proximosSection = document.getElementById("proximosSection");
    const detalleSection = document.getElementById("detalleOrdenSection");
    const historialBody = document.getElementById("historialBody");

    if (proximosSection) proximosSection.style.display = 'block';
    if (detalleSection) detalleSection.style.display = 'none';

    if (historialBody) {
      historialBody.innerHTML = '<tr><td colspan="8" class="no-users">Mostrando próximos mantenimientos</td></tr>';
    }

    const proximos = Array.isArray(response) ? response : [];

    if (proximos.length === 0) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="no-users">No hay mantenimientos próximos programados</td></tr>';
      if (thead) thead.innerHTML = '';
      return;
    }

    const keys = Object.keys(proximos[0]);
    if (thead) {
      thead.innerHTML = `<tr>${keys.map(k => `<th>${formatearNombreColumna(k)}</th>`).join('')}</tr>`;
    }

    if (tbody) {
      tbody.innerHTML = proximos.map(p => `
        <tr>
          ${keys.map(k => `<td>${p[k] !== null && p[k] !== undefined ? p[k] : 'N/A'}</td>`).join('')}
        </tr>
      `).join('');
    }

  } catch (error) {
    console.error("Error al cargar próximos mantenimientos:", error);
    const tbody = document.getElementById("tablaProximos");
    if (tbody) {
      tbody.innerHTML = '<tr><td class="no-users">Error al cargar próximos mantenimientos</td></tr>';
    }
  }
}

// Función auxiliar para formatear nombres
function formatearNombreColumna(nombre) {
  return nombre
    .replace(/_/g, ' ')
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
    .join(' ');
}

// =================== Exposición global ===================
window.obtenerRolUsuario = obtenerRolUsuario;
window.configurarInterfazHistorialPorRol = configurarInterfazHistorialPorRol;
window.cargarFormularioHistorial = cargarFormularioHistorial;
window.buscarHistorialOrden = buscarHistorialOrden;
window.verDetalleOrden = verDetalleOrden;
window.cargarProximosMantenimientos = cargarProximosMantenimientos;
window.formatearNombreColumna = formatearNombreColumna;