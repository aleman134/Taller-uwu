const API_URL_ORDENES = API_CONFIG.ordenes;

// Variable para saber si estamos editando
window.ordenEnEdicion = null;

// Obtener rol de usuario
function obtenerRolUsuario() {
  const user = JSON.parse(localStorage.getItem('usuario'));
  return user ? user.rol : null;
}

// Función para inicializar eventos
function inicializarEventosOrdenes() {
  const form = document.getElementById("ordenForm");
  if (!form) {
    console.warn("Formulario de órdenes no encontrado");
    return;
  }

  // Remover listeners anteriores si existen
  form.removeEventListener("submit", manejarSubmitFormularioOrden)
  
  // Agregar el listener del formulario
  form.addEventListener("submit", manejarSubmitFormularioOrden);
  
  // Evento para Enter en búsqueda
  const buscarInputOrden = document.getElementById("buscarIdOrden");
  if (buscarInputOrden) {
    buscarInputOrden.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        buscarOrdenPorId();
      }
    });
  }

  cargarClientesOrden();
  cargarMecanicos();
  cargarCitasOrden();
  
  const clienteSelect = document.getElementById('cliente_id');
  if (clienteSelect) {
    clienteSelect.addEventListener('change', (e) => {
      const clienteId = e.target.value;
      if (clienteId) {
        cargarVehiculosOrdenes(clienteId);
        cargarCitasOrden(clienteId);
      } else {
        cargarVehiculosOrdenes();
        cargarCitasOrden();
      }
    });
  }

  const citaSelect = document.getElementById('cita_id');
  if (citaSelect) {
    citaSelect.addEventListener('change', (e) => {
      const citaId = e.target.value;
      if (citaId) {
        cargarMecanicoDeCita(citaId);
      } else {
        cargarMecanicos();
      }
    });
  }
}

// Manejar el submit del formulario
async function manejarSubmitFormularioOrden(e) {
  e.preventDefault();

  const rol = obtenerRolUsuario();
  
  // Si es mecánico, solo enviar campos permitidos
  let datos;

  if (rol === 'mecanico' && window.ordenEnEdicion) {
    // Mecánico solo puede actualizar estos campos
    datos = {
      diagnostico: document.getElementById("diagnostico").value.trim() || null,
      observaciones: document.getElementById("observaciones").value.trim() || null,
      costo_mano_obra: parseFloat(document.getElementById("costo_mano_obra").value) || 0,
      estado: document.getElementById("estadoOrden").value || null
    };
  } else {
    // Administrador puede actualizar todos los campos
    datos = {
      cliente_id: parseInt(document.getElementById("cliente_id").value) || null,
      vehiculo_id: parseInt(document.getElementById("vehiculo_id").value) || null,
      mecanico_id: parseInt(document.getElementById("mecanico_id").value) || null,
      cita_id: parseInt(document.getElementById("cita_id").value) || null,
      fecha_estimada_salida: document.getElementById("fecha_estimada_salida").value || null,
      estado: document.getElementById("estadoOrden").value || null,
      descripcion_inicial: document.getElementById("descripcion_inicial").value.trim() || null,
      diagnostico: document.getElementById("diagnostico").value.trim() || null,
      observaciones: document.getElementById("observaciones").value.trim() || null,
      costo_mano_obra: parseFloat(document.getElementById("costo_mano_obra").value) || 0,
      kilometraje_ingreso: parseInt(document.getElementById("kilometraje_ingreso").value) || 0
    };
  }

  try {
    if (window.ordenEnEdicion) {
      // Actualizar orden existente
      const res = await fetch(`${API_URL_ORDENES}/${window.ordenEnEdicion}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(datos),
      });

      if (res.ok) {
        const ordenActualizada = await res.json();

        if (rol === 'administrador' && datos.mecanico_id){
          const ordenOriginal = await fetch(`${API_URL_ORDENES}/${window.ordenEnEdicion}`);
          const ordenOriginalData = await ordenOriginal.json();
          const ordenData = Array.isArray(ordenOriginalData) ? ordenOriginalData[0] : ordenOriginalData;

          if (parseInt(ordenData.mecanico_id) !== parseInt(datos.mecanico_id)) {
            await crearNotificacionCambioMecanico(datos.mecanico_id, ordenActualizada);
          }
        }

        alert("Orden actualizada exitosamente");
        cancelarEdicionOrdenes();
        cargarOrdenes();
      } else {
        const error = await res.json();
        alert("Error: " + (error.error || error.message || "Error desconocido"));
      }
    } else {
      // Crear nueva orden (validar campos obligatorios)
      if (!datos.cliente_id || !datos.vehiculo_id || !datos.cita_id || !datos.estado) {
        alert("Cliente, vehículo, cita y estado son obligatorios");
        return;
      }
      
      const res = await fetch(API_URL_ORDENES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(datos),
      });

      if (res.ok) {
        const ordenCreada = await res.json();
        const orden = Array.isArray(ordenCreada) ? ordenCreada[0] : ordenCreada;

        if (datos.mecanico_id){
          await crearNotificacionNuevaOrden(datos.mecanico_id, orden);
        }

        e.target.reset();
        cargarOrdenes();
        alert("Orden registrada exitosamente");
      } else {
        const error = await res.json();
        alert("Error: " + (error.error || error.message || "Error desconocido"));
      }
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Error de conexión con el servidor");
  }
}

// Crear notificación para mecánico cuando se le asigna una orden
async function crearNotificacionNuevaOrden(mecanicoId, ordenCreada) {
  try {
    const notificacion = {
      usuario_id: mecanicoId,
      tipo: 'orden_trabajo',
      titulo: `Nueva orden de trabajo asignada #${ordenCreada.numero_orden || ordenCreada.id || 'Nueva'}`,
      mensaje: `Se le ha asignado una nueva orden de trabajo. Cliente: ${ordenCreada.nombre_cliente}. Vehículo: ${ordenCreada.vehiculo_completo}. Por favor revise los detalles en el sistema.`,
      fecha_programada: `${ordenCreada.fecha_estimada_salida}`
    };
    
    const res = await fetch(API_CONFIG.notificaciones, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify(notificacion)
    });
    
    if (res.ok) {
    } else {
      console.error('Error al crear notificación');
    }
  } catch (error) {
    console.error('Error al crear notificación:', error);
  }
}

// Notificar cuando se reasigna un mecánico
async function crearNotificacionCambioMecanico(mecanicoId, ordenData) {
  try {
    const orden = Array.isArray(ordenData) ? ordenData[0] : ordenData;
    
    if (!orden) {
      console.error('No se pudo obtener información de la orden');
      return;
    }
    
    const numeroOrden = orden.numero_orden;
    const clienteInfo = orden.nombre_cliente;
    const vehiculoInfo = orden.vehiculo_completo;
    const fechaProgramada = orden.fecha_estimada_salida;
    
    const notificacion = {
      usuario_id: mecanicoId,
      tipo: 'orden_trabajo',
      titulo: `Orden de trabajo reasignada #${numeroOrden}`,
      mensaje: `Se le ha reasignado la orden de trabajo #${numeroOrden}. Cliente: ${clienteInfo}. Vehículo: ${vehiculoInfo}. Por favor revise los detalles en el sistema.`,
      fecha_programada: `${fechaProgramada}`
    };
    
    const res = await fetch(API_CONFIG.notificaciones, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify(notificacion)
    });
    
    if (res.ok) {
    } else {
      console.error('Error al crear notificación de reasignación');
    }
  } catch (error) {
    console.error('Error al crear notificación:', error);
  }
}

// Cargar todas las órdenes
async function cargarOrdenes() {
  const tbody = document.getElementById("ordenesBody");
  if (!tbody) {
    console.error("No se encontró el elemento con ID 'ordenesBody' en el HTML");
    return;
  }

  try {
    const res = await fetch(API_URL_ORDENES);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const ordenes = await res.json();
    
    if (Array.isArray(ordenes)) {
      renderOrdenes(ordenes);
    } else {
      console.error("La respuesta no es un array:", ordenes);
      alert("Error: El servidor no devolvió un array de órdenes");
    }
  } catch (error) {
    console.error("Error al cargar órdenes:", error);
    alert("Error al cargar órdenes. Verifica que el servidor esté funcionando.");
  }
}

// Cargar órdenes por estado
async function cargarOrdenesPorEstado(estado) {
  const tbody = document.getElementById("ordenesBody");
  if (!tbody) return;

  try {

    const res = await fetch(`${API_URL_ORDENES}/estado/${estado}`);

    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const ordenes = await res.json();
    
    if (Array.isArray(ordenes)) {
      renderOrdenes(ordenes);
    } else {
      console.error("La respuesta no es un array:", ordenes);
      tbody.innerHTML = '<tr><td colspan="9" class="no-orders">No se encontraron órdenes</td></tr>';
    }
  } catch (error) {
    console.error("Error al filtrar por estado:", error);
    alert("Error al filtrar órdenes por estado");
  }
}

// Cargar órdenes por mecánico
async function cargarOrdenesPorMecanico(mecanicoId) {
  const tbody = document.getElementById("ordenesBody");
  if (!tbody) return;

  try {

    const res = await fetch(`${API_URL_ORDENES}/mecanico/${mecanicoId}`);

  
    if (res.ok) {
      const ordenes = await res.json();
      
      if (Array.isArray(ordenes) && ordenes.length > 0) {
        renderOrdenes(ordenes);
      } else {
        tbody.innerHTML = '<tr><td colspan="9" class="no-orders">No se encontraron órdenes para ese mecánico</td></tr>';
      }
    } else if (res.status === 404) {
      tbody.innerHTML = '<tr><td colspan="9" class="no-orders">No se encontraron órdenes para ese mecánico</td></tr>';
    } else {
      const error = await res.json();
      alert("Error: " + (error.error || error.message || "Error desconocido"));
    }
  } catch (error) {
    console.error("Error al filtrar por mecánico:", error);
    alert("Error al filtrar órdenes por mecánico");
  }
}

// Cargar órdenes por cliente
async function cargarOrdenesPorCliente(clienteId) {
  const tbody = document.getElementById("ordenesBody");
  if (!tbody) return;

  try {

    const res = await fetch(`${API_URL_ORDENES}/cliente/${clienteId}`);

    if (res.ok) {
      const ordenes = await res.json();
      
      if (Array.isArray(ordenes) && ordenes.length > 0) {
        renderOrdenes(ordenes);
      } else {
        tbody.innerHTML = '<tr><td colspan="9" class="no-orders">No se encontraron órdenes para ese cliente</td></tr>';
      }
    } else if (res.status === 404) {
      tbody.innerHTML = '<tr><td colspan="9" class="no-orders">No se encontraron órdenes para ese cliente</td></tr>';
    } else {
      const error = await res.json();
      alert("Error: " + (error.error || error.message || "Error desconocido"));
    }
  } catch (error) {
    console.error("Error al filtrar por cliente:", error);
    alert("Error al filtrar órdenes por cliente");
  }
}

// Cargar órdenes vencidas
async function cargarOrdenesVencidas() {
  const tbody = document.getElementById("ordenesBody");
  if (!tbody) return;

  try {

    const res = await fetch(`${API_URL_ORDENES}/vencidas/vencidas`);

    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const ordenes = await res.json();
    
    if (Array.isArray(ordenes)) {
      if (ordenes.length > 0) {
        renderOrdenes(ordenes);
      } else {
        tbody.innerHTML = '<tr><td colspan="9" class="no-orders">No hay órdenes vencidas</td></tr>';
      }
    }
  } catch (error) {
    console.error("Error al cargar órdenes vencidas:", error);
    alert("Error al cargar órdenes vencidas");
  }
}

// Cargar órdenes próximas a vencer
async function cargarOrdenesProximasAVencer(dias = 3) {
  const tbody = document.getElementById("ordenesBody");
  if (!tbody) return;

  try {

    const res = await fetch(`${API_URL_ORDENES}/vencer/${dias}`);

    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const ordenes = await res.json();
    
    if (Array.isArray(ordenes)) {
      if (ordenes.length > 0) {
        renderOrdenes(ordenes);
      } else {
        tbody.innerHTML = '<tr><td colspan="9" class="no-orders">No hay órdenes próximas a vencer</td></tr>';
      }
    }
  } catch (error) {
    console.error("Error al cargar órdenes próximas a vencer:", error);
    alert("Error al cargar órdenes próximas a vencer");
  }
}

// Buscar orden por ID 
async function buscarOrdenPorId() {
  const inputBuscarOrden = document.getElementById("buscarIdOrden");
  const id = inputBuscarOrden.value.trim();

  if (!id) {
    alert("Ingrese un ID válido");
    return;
  }

  try {

    const res = await fetch(`${API_URL_ORDENES}/${id}`);

    
    if (res.ok) {
      const respuesta = await res.json();
      
      let orden;
      if (Array.isArray(respuesta) && respuesta.length > 0) {
        orden = respuesta[0];
      } else if (respuesta && typeof respuesta === 'object') {
        orden = respuesta;
      }
      
      if (orden && (orden.numero_orden || orden.orden_id || orden.id)) {
        renderOrdenes([orden]);
        inputBuscarOrden.value = '';
      } else {
        console.error("No se pudo extraer orden válida de:", respuesta);
        alert("Orden no encontrada o datos incompletos");
      }
    } else if (res.status === 404) {
      alert("Orden no encontrada");
    } else {
      const error = await res.json();
      alert("Error: " + (error.error || error.message || "Error desconocido"));
    }
  } catch (err) {
    console.error("Error al buscar orden:", err);
    alert("Error al buscar orden. Verifica la conexión con el servidor.");
  }
}

// Mostrar todas las órdenes (limpiar filtros)
function mostrarTodasLasOrdenes() {
  const filtroEstado = document.getElementById("filtroEstado");
  const filtroMecanico = document.getElementById("filtroMecanico");
  const filtroCliente = document.getElementById("filtroCliente");
  const buscarIdOrden = document.getElementById("buscarIdOrden");
  
  if (filtroEstado) filtroEstado.value = '';
  if (filtroMecanico) filtroMecanico.value = '';
  if (filtroCliente) filtroCliente.value = '';
  if (buscarIdOrden) buscarIdOrden.value = '';
  
  cargarOrdenes();
}

// Editar orden
async function editarOrden(id) {
  try {

    const res = await fetch(`${API_URL_ORDENES}/${id}`);

    if (res.ok) {
      const respuesta = await res.json();
      const orden = Array.isArray(respuesta) ? respuesta[0] : respuesta;
      
      // Llenar formulario con datos de la orden
      document.getElementById("cliente_id").value = orden.cliente_id || '';
      document.getElementById("vehiculo_id").value = orden.vehiculo_id || '';
      document.getElementById("mecanico_id").value = orden.mecanico_id || '';
      document.getElementById("cita_id").value = orden.cita_id || '';
      document.getElementById("fecha_estimada_salida").value = orden.fecha_estimada_salida ? orden.fecha_estimada_salida.split('T')[0] : '';
      document.getElementById("estadoOrden").value = orden.estado || '';
      document.getElementById("descripcion_inicial").value = orden.descripcion_inicial || '';
      document.getElementById("diagnostico").value = orden.diagnostico || '';
      document.getElementById("observaciones").value = orden.observaciones || '';
      document.getElementById("costo_mano_obra").value = orden.costo_mano_obra || 0;
      document.getElementById("kilometraje_ingreso").value = orden.kilometraje_ingreso || 0;
      
      // Cambiar a modo edición
      window.ordenEnEdicion = id;
      document.querySelector('button[type="submit"]').textContent = 'Actualizar';
      document.querySelector('.register-container h2').textContent = 'Actualizar Orden de Trabajo';
      
      // Mostrar botón cancelar si existe
      const cancelBtn = document.getElementById("cancelarBtnOrden");
      if (cancelBtn) cancelBtn.style.display = 'inline-block';
      
      // Re-aplicar restricciones de rol si es mecánico
      if (typeof configurarCamposParaMecanico === 'function') {
        configurarCamposParaMecanico();
      }
      
      // Scroll al formulario
      document.getElementById('ordenForm').scrollIntoView({ behavior: 'smooth' });
    }
  } catch (err) {
    console.error("Error al cargar orden para editar:", err);
    alert('Error al cargar orden para editar');
  }
}

// Cancelar edición
function cancelarEdicionOrdenes() {
  window.ordenEnEdicion = null;
  
  document.getElementById("ordenForm").reset();
  document.querySelector('button[type="submit"]').textContent = 'Registrar';
  document.querySelector('.register-container h2').textContent = 'Registro de Órdenes';
  
  // Ocultar botón cancelar si existe
  const cancelBtn = document.getElementById("cancelarBtnOrden");
  if (cancelBtn) cancelBtn.style.display = 'none';
  
  // Re-habilitar campos si estaban deshabilitados
  const campos = ['cliente_id', 'vehiculo_id', 'mecanico_id', 'cita_id', 
                  'fecha_estimada_salida', 'descripcion_inicial', 'costo_mano_obra', 'kilometraje_ingreso'];
  campos.forEach(campoId => {
    const campo = document.getElementById(campoId);
    if (campo) {
      campo.removeAttribute('readonly');
      campo.style.backgroundColor = '#ffffff';
      campo.style.cursor = 'text';
    }
  });
}

// Eliminar orden (solo administrador)
async function eliminarOrden(id) {
  const rol = obtenerRolUsuario();
  
  // Verificar que sea administrador
  if (rol !== 'administrador') {
    alert("No tienes permisos para eliminar órdenes");
    return;
  }
  
  if (!confirm("¿Seguro que quieres eliminar esta orden de trabajo?")) return;

  try {

    const res = await fetch(`${API_URL_ORDENES}/${id}`, { method: "DELETE"});

    if (res.ok) {
      alert("Orden eliminada exitosamente");
      cargarOrdenes();
    } else {
      const error = await res.json();
      alert("Error al eliminar orden: " + (error.error || error.message));
    }
  } catch (err) {
    console.error("Error al eliminar:", err);
    alert("Error al eliminar orden");
  }
}

// Renderizar órdenes en la tabla
function renderOrdenes(ordenes) {
  const tbody = document.getElementById("ordenesBody");
  
  if (!tbody) {
    console.error("No se encontró el elemento con ID 'ordenesBody'");
    return;
  }
  
  // Validar si hay ordenes
  if (!ordenes || ordenes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="no-orders">No hay órdenes registradas</td>
      </tr>
    `;
    return;
  }

  let html = "";
  ordenes.forEach(orden => {
    // Usar el ID correcto que viene del backend
    const ordenId = orden.id || 'Sin ID';
    const numeroOrden = orden.numero_orden || 'N/A';
    
    // Mostrar nombre del cliente
    const clienteInfo = orden.nombre_cliente 
      ? `${orden.cliente_id} - ${orden.nombre_cliente}` 
      : (orden.cliente_id || 'N/A');
    
    // Mostrar información del vehículo (marca, modelo, año y placa)

    const vehiculoInfo = orden.vehiculo_info || `${orden.vehiculo_id || 'N/A'}`;
    
    // Mostrar nombre del mecánico o ID
    const mecanicoInfo = orden.nombre_mecanico || (orden.mecanico_id ? `${orden.mecanico_id}` : 'N/A');

    
    // Calcular costo total (usar el que viene del backend si existe)
    const costoTotal = orden.costo_total 
      ? parseFloat(orden.costo_total).toFixed(2)
      : (parseFloat(orden.costo_mano_obra || 0)).toFixed(2);
    
    // Formatear fecha
    const fechaEstimada = orden.fecha_estimada_salida 
      ? new Date(orden.fecha_estimada_salida).toLocaleDateString('es-GT', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      : 'N/A';
    
    const estadoClase = orden.estado || 'pendiente';
    const estadoTexto = formatearEstado(orden.estado);
    
    html += `
      <tr>
        <td data-label="ID">${ordenId}</td>
        <td data-label="Número">${numeroOrden}</td>
        <td data-label="Cliente">${clienteInfo}</td>
        <td data-label="Vehículo">${vehiculoInfo}</td>
        <td data-label="Mecánico">${mecanicoInfo}</td>
        <td data-label="Estado">
          <span class="status ${estadoClase}">${estadoTexto}</span>
        </td>
        <td data-label="Fecha Estimada">${fechaEstimada}</td>
        <td data-label="Costo Total">Q${costoTotal}</td>
        <td data-label="Acciones">
          <button class="btn-edit" onclick="editarOrden(${ordenId})">EDITAR</button>
          <button class="btn-delete" onclick="eliminarOrden(${ordenId})">ELIMINAR</button>
          <button class="btn-info" onclick="verReporteCompletoGestion(${ordenId})">Gestionar</button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// Formatear estado para mostrar
function formatearEstado(estado) {
  const estados = {
    'pendiente': 'Pendiente',
    'en_proceso': 'En Proceso',
    'en_espera': 'En Espera',
    'finalizada': 'Finalizada',
    'entregada': 'Entregada',
    'cancelada': 'Cancelada'
  };
  return estados[estado] || estado || 'N/A';
}

// Ver reporte completo de una orden
async function verReporteCompleto(id) {
  try {

    const res = await fetch(`${API_URL_ORDENES}/reporte/${id}`);

    
    if (!res.ok) {
      throw new Error('Error al cargar el reporte');
    }
    
    const reporte = await res.json();
    mostrarModalReporte(reporte);
  } catch (error) {
    console.error("Error al cargar reporte:", error);
    alert('Error al cargar el reporte completo');
  }
}

// Mostrar modal con el reporte
function mostrarModalReporte(reporte) {
  const { orden, servicios, repuestos } = reporte;
  
  if (!orden) {
    alert('No se encontró información de la orden');
    return;
  }
  
  // Combinar servicios y repuestos en una sola lista
  let trabajosHTML = '';
  
  // Agregar servicios
  if (servicios && servicios.length > 0) {
    trabajosHTML += '<div style="margin-bottom: 15px;"><strong style="color: #3498db;">Servicios:</strong></div>';
    servicios.forEach(s => {
      trabajosHTML += `<li style="padding: 8px; border-left: 3px solid #3498db; margin-bottom: 8px; background: #f8f9fa;">
        <strong>${s.nombre_servicio || 'Servicio'}</strong><br>
        <span style="color: #666; font-size: 0.9em;">Precio: Q${s.precio || '0.00'}</span>
      </li>`;
    });
  }
  
  // Agregar repuestos
  if (repuestos && repuestos.length > 0) {
    trabajosHTML += '<div style="margin-top: 20px; margin-bottom: 15px;"><strong style="color: #e67e22;">Repuestos:</strong></div>';
    repuestos.forEach(r => {
      trabajosHTML += `<li style="padding: 8px; border-left: 3px solid #e67e22; margin-bottom: 8px; background: #f8f9fa;">
        <strong>${r.nombre_repuesto || 'Repuesto'}</strong><br>
        <span style="color: #666; font-size: 0.9em;">Cantidad: ${r.cantidad || 0} | Precio Total: Q${r.precio_total || '0.00'}</span>
      </li>`;
    });
  }
  
  // Si no hay servicios ni repuestos
  if ((!servicios || servicios.length === 0) && (!repuestos || repuestos.length === 0)) {
    trabajosHTML = '<li style="color: #95a5a6; font-style: italic;">No hay trabajos registrados</li>';
  }
  
  const costoTotal = orden.costo_total 
    ? parseFloat(orden.costo_total).toFixed(2)
    : (parseFloat(orden.costo_mano_obra || 0)).toFixed(2);
  const fechaEstimada = orden.fecha_estimada_salida 
    ? new Date(orden.fecha_estimada_salida).toLocaleDateString('es-GT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    : 'N/A';
  
  const modalHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center;" onclick="this.remove()">
      <div style="background: white; padding: 30px; border-radius: 15px; max-width: 700px; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation()">
        <h2 style="color: #34495e; margin-bottom: 20px; border-bottom: 3px solid #e67e22; padding-bottom: 10px;">
          Reporte Completo - Orden #${orden.numero_orden || 'N/A'}
        </h2>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #e67e22; margin-bottom: 10px;">Información General</h3>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
            <p style="margin: 5px 0;"><strong>Estado:</strong> <span class="status ${orden.estado}">${formatearEstado(orden.estado)}</span></p>
            <p style="margin: 5px 0;"><strong>Cliente:</strong> ${orden.nombre_cliente || orden.cliente_id || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Vehículo:</strong> ${orden.vehiculo_info || orden.vehiculo_id || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Mecánico:</strong> ${orden.nombre_mecanico || orden.mecanico_id || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Fecha Estimada:</strong> ${fechaEstimada}</p>
            <p style="margin: 5px 0;"><strong>Kilometraje:</strong> ${orden.kilometraje_ingreso || 'N/A'} km</p>
          </div>
        </div>
<<<<<<< HEAD
        info
=======
        
>>>>>>> bd88513e37169740585f71e73c6baca4887e03d1
        <div style="margin-bottom: 20px;">
          <h3 style="color: #e67e22; margin-bottom: 10px;">Descripción y Diagnóstico</h3>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
            <p style="margin: 5px 0;"><strong>Descripción:</strong> ${orden.descripcion_inicial || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Diagnóstico:</strong> ${orden.diagnostico || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Observaciones:</strong> ${orden.observaciones || 'N/A'}</p>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #e67e22; margin-bottom: 10px;">Trabajos Realizados</h3>
          <ul style="list-style: none; padding-left: 0;">
            ${trabajosHTML}
          </ul>
        </div>
        
        <div style="margin-bottom: 20px; padding: 20px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 8px; border: 2px solid #e67e22;">
          <h3 style="color: #e67e22; margin-bottom: 15px;">Resumen de Costos</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span><strong>Mano de Obra:</strong></span>
            <span>Q${orden.costo_mano_obra || '0.00'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 2px solid #bdc3c7;">
            <span><strong>Repuestos:</strong></span>
            <span>Q${(parseFloat(costoTotal) - parseFloat(orden.costo_mano_obra || 0)).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 1.3rem; font-weight: bold; color: #2c3e50;">
            <span>TOTAL:</span>
            <span style="color: #e67e22;">Q${costoTotal}</span>
          </div>
        </div>
        
        <button onclick="this.closest('div[style*=fixed]').remove()" 
          style="width: 100%; padding: 14px; background: #e67e22; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; transition: background 0.3s;">
          Cerrar
        </button>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

async function cargarClientesOrden() {
  try {

    const res = await fetch(API_CONFIG.clientes);

    const clientes = await res.json();
    
    const select = document.getElementById('cliente_id');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccione Cliente *</option>';
    
    clientes.forEach(c => {
      const option = document.createElement('option');
      option.value = c.id;
      option.textContent = `${c.nombre} ${c.apellido} - ${c.telefono || 'Sin teléfono'}`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error al cargar clientes:', error);
  }
}

async function cargarVehiculosOrdenes(clienteId = null) {
  try {
    const url = clienteId 
      ? `${API_CONFIG.vehiculos}/cliente/${clienteId}` 
      : API_CONFIG.vehiculos;
    

    const res = await fetch(url);

    const vehiculos = await res.json();
    
    const select = document.getElementById('vehiculo_id');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccione Vehículo *</option>';
    
    vehiculos.forEach(v => {
      const option = document.createElement('option');
      option.value = v.id;
      option.textContent = `${v.marca} ${v.modelo} ${v.anioo} - ${v.placa}`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error al cargar vehículos:', error);
  }
}

async function cargarMecanicos() {
  try {

    const res = await fetch(API_CONFIG.usuarios);

    const usuarios = await res.json();
    
    const mecanicos = usuarios.filter(u => u.rol === 'mecanico' && u.estado === 'activo');

    const select = document.getElementById('mecanico_id');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccione Mecánico *</option>';
    
    mecanicos.forEach(m => {
      const option = document.createElement('option');
      option.value = m.id;
      option.textContent = `${m.nombre} ${m.apellido}`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error al cargar mecánicos:', error);
  }
}

async function cargarCitasOrden(clienteId = null) {
  try {
    const url = clienteId 
      ? `${API_CONFIG.citas}/cliente/${clienteId}` 
      : API_CONFIG.citas;
    

    const res = await fetch(url);

    const citas = await res.json();
    
    const select = document.getElementById('cita_id');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccione una cita</option>';

    const citasValidas = citas.filter(c => {
      const fechaCita = new Date(c.fecha_cita);
      const ahora = new Date();
      const estadosInvalidos = ['cancelada', 'completada', 'terminada', 'finalizada'];
      const estadoValido = !estadosInvalidos.includes(c.estado?.toLowerCase());
      const fechaValida = fechaCita >= ahora;

      return estadoValido && fechaValida;
    });
    
    if (citasValidas.length === 0) {
      select.innerHTML = '<option value="">No hay citas disponibles</option>';
      return;
    }
    
    citasValidas.forEach(c => {
      const option = document.createElement('option');
      option.value = c.id;
      const fecha = new Date(c.fecha_cita).toLocaleDateString('es-GT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      option.textContent = `${fecha} - ${c.motivo || 'Sin motivo'}`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error al cargar citas:', error);
  }
}

// Exportar funciones globalmente
window.editarOrden = editarOrden;
window.eliminarOrden = eliminarOrden;
window.buscarOrdenPorId = buscarOrdenPorId;
window.mostrarTodasLasOrdenes = mostrarTodasLasOrdenes;
window.cancelarEdicionOrdenes = cancelarEdicionOrdenes;
window.cargarOrdenes = cargarOrdenes;
window.cargarOrdenesPorEstado = cargarOrdenesPorEstado;
window.cargarOrdenesPorMecanico = cargarOrdenesPorMecanico;
window.cargarOrdenesPorCliente = cargarOrdenesPorCliente;
window.cargarOrdenesVencidas = cargarOrdenesVencidas;
window.cargarOrdenesProximasAVencer = cargarOrdenesProximasAVencer;
window.verReporteCompleto = verReporteCompleto;
window.crearNotificacionNuevaOrden = crearNotificacionNuevaOrden;
window.crearNotificacionCambioMecanico = crearNotificacionCambioMecanico;