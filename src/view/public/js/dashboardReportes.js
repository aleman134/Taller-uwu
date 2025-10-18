// Determinar el rol del usuario actual
function obtenerRolUsuario() {
  const user = JSON.parse(localStorage.getItem('usuario'));
  return user ? user.rol : null;
}

// Configurar la interfaz según el rol
function configurarInterfazReportesPorRol() {
  const rol = obtenerRolUsuario();
  
  if (rol === 'administrador') {
    mostrarTodosControlesReportes();
  } else if (rol === 'mecanico') {
    ocultarFiltrosYControlesReportes();
  }
}

function mostrarTodosControlesReportes() {
  const filtros = document.querySelector('.filtros-container');
  if (filtros) filtros.style.display = 'block';
  
  const oldStyle = document.getElementById('mecanico-reportes-style');
  if (oldStyle) oldStyle.remove();
}

function ocultarFiltrosYControlesReportes() {
  const oldStyle = document.getElementById('mecanico-reportes-style');
  if (oldStyle) oldStyle.remove();
  
  const style = document.createElement('style');
  style.id = 'mecanico-reportes-style';
  style.textContent = `
    .filtros-container {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}

// =================== Cargar contenido HTML en la sección ===================
function cargarFormularioReportes() {
  const section = document.getElementById('reports');
  if (!section) return;

  section.innerHTML = `
    <div class="filtros-container">
      <h3>Generar Reporte por Período</h3>
      <div class="search-controls">
        <div class="search-group">
          <label for="fechaInicio">Fecha Inicio:</label>
          <input type="date" id="fechaInicio" class="form-control">
        </div>
        <div class="search-group">
          <label for="fechaFin">Fecha Fin:</label>
          <input type="date" id="fechaFin" class="form-control">
        </div>
        <button class="btn-search" onclick="generarResumenPeriodo()">
          <i class="fas fa-chart-bar"></i> Generar Resumen
        </button>
      </div>
    </div>

    <div class="users-section" id="resumenPeriodoSection" style="display: none;">
      <h3>Resumen Global del Período</h3>
      <div class="table-responsive">
        <table class="users-table">
          <thead id="resumenGlobalHead"></thead>
          <tbody id="tablaResumenGlobal"></tbody>
        </table>
      </div>

      <h3 style="margin-top: 20px;">Resumen por Mecánico</h3>
      <div class="table-responsive">
        <table class="users-table">
          <thead id="resumenMecanicoHead"></thead>
          <tbody id="tablaResumenMecanico"></tbody>
        </table>
      </div>

      <h3 style="margin-top: 20px;">Top Clientes</h3>
      <div class="table-responsive">
        <table class="users-table">
          <thead id="topClientesHead"></thead>
          <tbody id="tablaTopClientes"></tbody>
        </table>
      </div>
    </div>

    <div class="users-section">
      <h3>Estadísticas de Vehículos - Resumen</h3>
      <div class="table-responsive">
        <table class="users-table">
          <thead id="vehiculosResumenHead"></thead>
          <tbody id="tablaVehiculosResumen"></tbody>
        </table>
      </div>

      <h3 style="margin-top: 20px;">Vehículos por Marca</h3>
      <div class="table-responsive">
        <table class="users-table">
          <thead id="vehiculosMarcasHead"></thead>
          <tbody id="tablaVehiculosMarcas"></tbody>
        </table>
      </div>
    </div>

    <div class="users-section">
      <h3>Estadísticas de Órdenes de Trabajo</h3>
      <div class="table-responsive">
        <table class="users-table">
          <thead id="ordenesHead"></thead>
          <tbody id="tablaOrdenes"></tbody>
        </table>
      </div>
    </div>

    <div class="users-section">
      <h3>Estadísticas de Servicios - General</h3>
      <div class="table-responsive">
        <table class="users-table">
          <thead id="serviciosGeneralHead"></thead>
          <tbody id="tablaServiciosGeneral"></tbody>
        </table>
      </div>

      <h3 style="margin-top: 20px;">Servicios por Categoría</h3>
      <div class="table-responsive">
        <table class="users-table">
          <thead id="serviciosCategoriaHead"></thead>
          <tbody id="tablaServiciosCategoria"></tbody>
        </table>
      </div>
    </div>

    <div class="users-section">
      <h3>Servicios Realizados</h3>
      <div class="table-responsive">
        <table class="users-table">
          <thead id="serviciosRealizadosHead"></thead>
          <tbody id="tablaServiciosRealizados"></tbody>
        </table>
      </div>
    </div>

    <div class="users-section">
      <h3>Estadísticas de Repuestos Utilizados</h3>
      <div class="table-responsive">
        <table class="users-table">
          <thead id="repuestosHead"></thead>
          <tbody id="tablaRepuestos">
            <tr><td class="no-users">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  configurarInterfazReportesPorRol();
  cargarReportes();
}

// =================== Cargar datos de reportes ===================
async function cargarReportes() {
  try {
    const fechaFin = new Date().toISOString().split('T')[0]; // Hoy
    const fechaInicio = '2025-01-01'; // Desde inicio del año

    const [vehiculos, ordenes, servicios, serviciosRealizados, repuestos] = await Promise.all([
      getEstadisticasVehiculos().catch(err => { console.error("Error vehiculos:", err); return null; }),
      getEstadisticasOrdenes().catch(err => { console.error("Error ordenes:", err); return null; }),
      getEstadisticasServicios().catch(err => { console.error("Error servicios:", err); return null; }),
      getEstadisticasServiciosRealizados().catch(err => { console.error("Error servicios realizados:", err); return null; }),
      getEstadisticasRepuestos(fechaInicio, fechaFin).catch(err => { console.error("Error repuestos:", err); return null; })
    ]);

    // Procesar vehículos
    if (vehiculos && vehiculos.success && vehiculos.data) {
      mostrarReporteEnTabla("tablaVehiculosResumen", "vehiculosResumenHead", [vehiculos.data.resumen]);
      mostrarReporteEnTabla("tablaVehiculosMarcas", "vehiculosMarcasHead", vehiculos.data.marcas);
    }

    // Procesar órdenes
    if (ordenes) {
      mostrarReporteEnTabla("tablaOrdenes", "ordenesHead", [ordenes]);
    }

    // Procesar servicios
    if (servicios) {
      if (servicios.generales) {
        mostrarReporteEnTabla("tablaServiciosGeneral", "serviciosGeneralHead", [servicios.generales]);
      }
      if (servicios.por_categoria) {
        mostrarReporteEnTabla("tablaServiciosCategoria", "serviciosCategoriaHead", servicios.por_categoria);
      }
    }

    // Procesar servicios realizados
    if (serviciosRealizados) {
      const dataServiciosRealizados = Array.isArray(serviciosRealizados) ? serviciosRealizados : 
                                      serviciosRealizados.data ? serviciosRealizados.data : [serviciosRealizados];
      mostrarReporteEnTabla("tablaServiciosRealizados", "serviciosRealizadosHead", dataServiciosRealizados);
    }
    
    if (repuestos && Array.isArray(repuestos) && repuestos.length > 0) {
      mostrarReporteEnTabla("tablaRepuestos", "repuestosHead", repuestos);
    } else if (repuestos && repuestos.data && Array.isArray(repuestos.data) && repuestos.data.length > 0) {
      mostrarReporteEnTabla("tablaRepuestos", "repuestosHead", repuestos.data);
    } else {
      console.warn('No hay datos de repuestos para el período seleccionado');
      const tabla = document.getElementById("tablaRepuestos");
      const thead = document.getElementById("repuestosHead");
      if (tabla) {
        tabla.innerHTML = `<tr><td colspan='10' class='no-users'>No hay estadísticas de repuestos desde ${fechaInicio} hasta ${fechaFin}</td></tr>`;
      }
      if (thead) {
        thead.innerHTML = '';
      }
    }

  } catch (error) {
    console.error("Error al cargar reportes:", error);
  }
}


function mostrarReporteEnTabla(idTabla, idHead, data) {
  const tabla = document.getElementById(idTabla);
  const thead = document.getElementById(idHead);
  
  if (!tabla) {
    console.error(`No se encontró la tabla con id: ${idTabla}`);
    return;
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn(`Sin datos para ${idTabla}`);
    tabla.innerHTML = "<tr><td colspan='10' class='no-users'>Sin datos disponibles</td></tr>";
    if (thead) thead.innerHTML = '';
    return;
  }

  try {
    const keys = Object.keys(data[0]);
    
    // Crear encabezados
    if (thead) {
      thead.innerHTML = `<tr>${keys.map(k => `<th>${formatearNombreColumna(k)}</th>`).join('')}</tr>`;
    }

    // Llenar datos
    tabla.innerHTML = data.map((d, index) => {
      return `
        <tr>
          ${keys.map(k => {
            let valor = d[k];
            
            // Formatear fechas
            if (valor && typeof valor === 'string' && valor.includes('T') && valor.includes('Z')) {
              try {
                valor = new Date(valor).toLocaleDateString('es-GT');
              } catch (e) {
                // Mantener valor original si falla
              }
            }
            
            // Determinar si es campo monetario (excluyendo cantidad y total)
            const esCampoMonetario = (
              k.toLowerCase().includes('costo') || 
              k.toLowerCase().includes('precio') || 
              k.toLowerCase().includes('ingreso') ||
              k.toLowerCase().includes('monto') ||
              k.toLowerCase().includes('valor')
            ) && !k.toLowerCase().includes('cantidad') && !k.toLowerCase().includes('total');
            
            // Formatear valores numéricos de dinero
            if (typeof valor === 'number' && esCampoMonetario) {
              valor = 'Q' + valor.toFixed(2);
            }
            
            // Formatear strings numéricos de dinero
            if (typeof valor === 'string' && !isNaN(valor) && valor.trim() !== '' && esCampoMonetario) {
              valor = 'Q' + parseFloat(valor).toFixed(2);
            }
            
            // Formatear booleanos
            if (typeof valor === 'boolean') {
              valor = valor ? 'Sí' : 'No';
            }
            
            // Manejar null/undefined
            if (valor === null || valor === undefined || valor === '') {
              valor = 'N/A';
            }
            
            return `<td>${valor}</td>`;
          }).join('')}
        </tr>
      `;
    }).join('');
    
  } catch (error) {
    console.error(`Error al procesar datos para ${idTabla}:`, error, data);
    tabla.innerHTML = "<tr><td colspan='10' class='no-users'>Error al procesar los datos</td></tr>";
    if (thead) thead.innerHTML = '';
  }
}



// =================== Reporte por período ===================
async function generarResumenPeriodo() {
  const inicio = document.getElementById("fechaInicio").value;
  const fin = document.getElementById("fechaFin").value;

  if (!inicio || !fin) {
    alert("Por favor, selecciona un rango de fechas válido");
    return;
  }

  if (new Date(inicio) > new Date(fin)) {
    alert("La fecha de inicio debe ser anterior a la fecha fin");
    return;
  }

  try {
    const response = await getResumenPeriodo(inicio, fin);
    
    const section = document.getElementById("resumenPeriodoSection");
    if (section) {
      section.style.display = 'block';
    }

    // El resumen tiene estructura: { global, porMecanico, topClientes }
    if (response) {
      if (response.global) {
        mostrarReporteEnTabla("tablaResumenGlobal", "resumenGlobalHead", [response.global]);
      }
      if (response.porMecanico) {
        mostrarReporteEnTabla("tablaResumenMecanico", "resumenMecanicoHead", response.porMecanico);
      }
      if (response.topClientes) {
        mostrarReporteEnTabla("tablaTopClientes", "topClientesHead", response.topClientes);
      }
    }

  } catch (error) {
    console.error("Error al generar resumen:", error);
    alert("Error al generar el resumen del período");
  }
}

// Función auxiliar para formatear nombres de columnas
function formatearNombreColumna(nombre) {
  return nombre
    .replace(/_/g, ' ')
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
    .join(' ');
}

// =================== Exposición global ===================
window.obtenerRolUsuario = obtenerRolUsuario;
window.configurarInterfazReportesPorRol = configurarInterfazReportesPorRol;
window.cargarFormularioReportes = cargarFormularioReportes;
window.cargarReportes = cargarReportes;
window.generarResumenPeriodo = generarResumenPeriodo;
window.formatearNombreColumna = formatearNombreColumna;