const API_URL_NOTIFICACIONES = API_CONFIG.notificaciones;

// Cargar usuarios en los selects
async function cargarUsuariosEnSelects() {
  try {
    const res = await fetch(API_URL_USUARIOS);
    if (!res.ok) throw new Error('Error al cargar usuarios');
    
    const usuarios = await res.json();
    
    // Select del formulario
    const selectFormulario = document.getElementById('usuarioNotificacion');
    if (selectFormulario) {
      selectFormulario.innerHTML = '<option value="">Seleccionar Usuario *</option>';
      usuarios.forEach(u => {
        if (u.estado === 'activo') {
          selectFormulario.innerHTML += `<option value="${u.id}">${u.nombre} ${u.apellido} (${u.rol})</option>`;
        }
      });
    }
    
    // Select de búsqueda
    const selectBusqueda = document.getElementById('buscarIdUsuarioNotificacion');
    if (selectBusqueda) {
      selectBusqueda.innerHTML = '<option value="">Buscar por Usuario</option>';
      usuarios.forEach(u => {
        if (u.estado === 'activo') {
          selectBusqueda.innerHTML += `<option value="${u.id}">${u.nombre} ${u.apellido}</option>`;
        }
      });
    }
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
  }
}

// función para iniciar la sección de notificaciones
function inicializarEventosNotificaciones() {
  const form = document.getElementById("notificacionForm");
  if (!form) {
    console.warn("Formulario de notificaciones no encontrado");
    return;
  }

  // Remover listeners previos (evita duplicados)
  form.removeEventListener("submit", manejarSubmitFormularioNotificacion);

  form.addEventListener("submit", manejarSubmitFormularioNotificacion);
  
  // Cargar en los selects
  cargarUsuariosEnSelects();
}

// manejar el submit del formulario (crear)
async function manejarSubmitFormularioNotificacion(e) {
  e.preventDefault();

  const fechaProgramada = document.getElementById("fechaNotificacion").value.trim();
  
  const datos = {
    usuario_id: document.getElementById("usuarioNotificacion").value.trim() || null,
    tipo: document.getElementById("tipoNotificacion").value.trim() || null,
    titulo: document.getElementById("tituloNotificacion").value.trim() || null,
    mensaje: document.getElementById("mensajeNotificacion").value.trim() || null,
    fecha_programada: fechaProgramada || null,
  };

  try {
    if (!datos.usuario_id || !datos.titulo || !datos.mensaje || !datos.tipo) {
      alert("Usuario, tipo, título y mensaje son campos obligatorios");
      return;
    }

    const res = await fetch(API_URL_NOTIFICACIONES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    if (res.ok) {
      e.target.reset();
      cargarTodasNotificaciones();
      alert("Notificación creada exitosamente");
    } else {
      const error = await res.json();
      alert("Error: " + (error.error || error.message || "Error desconocido"));
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

// Obtener todas las notificaciones
async function cargarTodasNotificaciones() {
  try {
    const res = await fetch(`${API_URL_NOTIFICACIONES}`);
    const data = await res.json();

    if (res.ok && data.success) {
      renderNotificaciones(data.data);
    } else {
      alert(data.message || "Error al cargar notificaciones");
    }
  } catch (err) {
    console.error("Error al cargar notificaciones:", err);
    alert("Error de conexión con el servidor");
  }
}

// Obtener notificaciones por tipo
async function buscarNotificacionesPorTipo() {
  const selectTipo = document.getElementById("buscarTipoNotificacion");
  const tipo = selectTipo.value.trim();

  if (!tipo) {
    alert("Seleccione un tipo válido");
    return;
  }

  try {
    const res = await fetch(`${API_URL_NOTIFICACIONES}/tipo/${tipo}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      renderNotificaciones(data.data);
    } else {
      alert(`No se encontraron notificaciones de tipo ${tipo}`);
    }
  } catch (err) {
    console.error("Error al buscar por tipo:", err);
  }
}

// Obtener notificaciones leidas
async function cargarNotificacionesLeidas() {
  try {
    const res = await fetch(`${API_URL_NOTIFICACIONES}/leidas`);
    const data = await res.json();

    if (res.ok && data.success) {
      renderNotificaciones(data.data);
    } else {
      alert(data.message || "Error al cargar notificaciones leídas");
    }
  } catch (err) {
    console.error("Error al cargar notificaciones leídas:", err);
  }
}

// obtener todas las notificaciones pendientes
async function cargarNotificacionesPendientes() {
  const tbody = document.getElementById("notificacionesBody");
  if (!tbody) return console.error("No se encontró 'notificacionesBody'");

  try {
    const res = await fetch(`${API_URL_NOTIFICACIONES}/pendientes/pendientes`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const notificaciones = await res.json();
    if (Array.isArray(notificaciones)) {
      renderNotificaciones(notificaciones);
    } else {
      console.error("La respuesta no es un array:", notificaciones);
    }
  } catch (error) {
    console.error("Error al cargar notificaciones:", error);
    tbody.innerHTML = `<tr><td colspan="7" class="no-orders">Error al cargar notificaciones</td></tr>`;
  }
}

// buscar notificaciones por usuario
async function buscarNotificacionesPorUsuario() {
  const selectBuscar = document.getElementById("buscarIdUsuarioNotificacion");
  const id = selectBuscar.value.trim();

  if (!id) {
    alert("Seleccione un usuario válido");
    return;
  }

  try {
    const res = await fetch(`${API_URL_NOTIFICACIONES}/usuario/${id}`);
    if (res.ok) {
      const notificaciones = await res.json();
      renderNotificaciones(Array.isArray(notificaciones) ? notificaciones : [notificaciones]);
      selectBuscar.value = '';
    } else {
      alert("No se encontraron notificaciones para ese usuario");
    }
  } catch (err) {
    console.error("Error al buscar:", err);
    alert("Error al buscar notificaciones");
  }
}

// marcar notificación como leída
async function marcarNotificacionLeida(id) {
  try {
    const res = await fetch(`${API_URL_NOTIFICACIONES}/leida/${id}`, {
      method: "PUT",
    });

    if (res.ok) {
      alert("Notificación marcada como leída");
      cargarTodasNotificaciones();
    } else {
      const error = await res.json();
      alert("Error al marcar como leída: " + (error.error || error.message));
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Error al conectar con el servidor");
  }
}

// Mostrar el botón solo si el usuario es mecánico
function configurarBotonMarcarTodasMecanico() {
  const rol = obtenerRolUsuario();
  const btn = document.getElementById('btnMarcarTodasLeidas');
  if (rol === 'mecanico' && btn) {
    btn.style.display = 'inline-block';
  }
}

// Marcar todas las notificaciones de un usuario leidas
async function marcarTodasNotificacionesLeidasMecanico() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario || !usuario.id) return alert("No se pudo determinar el usuario");

  try {
<<<<<<< HEAD
    const res = await fetch(`${API_URL_NOTIFICACIONES}/usuario/${usuario.id}/leer-todas`, {
=======
    const res = await fetch(`${API_URL_NOTIFICACIONES}/${usuario.id}/leer-todas`, {
>>>>>>> bd88513e37169740585f71e73c6baca4887e03d1
      method: 'GET'
    });
    const data = await res.json();

    if (res.ok && data.success) {
      alert("Todas las notificaciones marcadas como leídas");
      cargarTodasNotificaciones();
    } else {
      alert(data.message || "Error al marcar notificaciones como leídas");
    }
  } catch (err) {
    console.error("Error al marcar todas las notificaciones:", err);
    alert("Error al conectar con el servidor");
  }
}

// limpiar notificaciones antiguas
async function limpiarNotificacionesAntiguas(dias = 30) {
  try {
    const res = await fetch(`${API_URL_NOTIFICACIONES}/limpiar?dias_antiguedad=${dias}`, {
      method: "DELETE",
    });

    if (res.ok) {
      const data = await res.json();
      alert(`Notificaciones antiguas limpiadas (${dias} días)`);
      cargarTodasNotificaciones();
    } else {
      const error = await res.json();
      alert("Error al limpiar: " + (error.error || error.message));
    }
  } catch (err) {
    console.error("Error al limpiar:", err);
    alert("Error al conectar con el servidor");
  }
}

// Formatear fecha
function formatearFecha(fecha) {
  if (!fecha) return 'No programada';
  const f = new Date(fecha);
  if (isNaN(f.getTime())) return 'Fecha inválida';
  
  const opciones = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return f.toLocaleString('es-GT', opciones);
}

// renderizar notificaciones en la tabla
function renderNotificaciones(notificaciones) {
  const tbody = document.getElementById("notificacionesBody");
  if (!tbody) return;

  if (!notificaciones || notificaciones.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="no-orders">No hay notificaciones</td>
      </tr>
    `;
    return;
  }

  let html = "";
  notificaciones.forEach(n => {
    // Nombre del usuario o correo
    const usuarioNombre = `${n.usuario_id} - ${n.nombre_usuario}`;
    
    // Formatear tipo como badge
    const tipoBadge = `<span class="status ${n.tipo}">${n.tipo ? n.tipo.replace('_', ' ') : 'N/A'}</span>`;
    
    html += `
      <tr>
        <td data-label="ID">${n.id || "N/A"}</td>
        <td data-label="Usuario">${usuarioNombre}</td>
        <td data-label="Tipo">${tipoBadge}</td>
        <td data-label="Título">${n.titulo || "N/A"}</td>
        <td data-label="Mensaje">${n.mensaje || "N/A"}</td>
        <td data-label="Fecha">${formatearFecha(n.fecha_programada)}</td>
        <td data-label="Acciones">
          ${
            n.leida
              ? `<button class="btn-seen" disabled>
                  <i class="fas fa-check"></i> Leído
                 </button>`
              : `<button class="btn-read" onclick="marcarNotificacionLeida(${n.id})">
                  <i class="fas fa-check"></i> Marcar Leída
                 </button>`
          }
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}