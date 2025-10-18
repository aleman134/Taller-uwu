const API_URL_CLIENTES = API_CONFIG.clientes;

// Variable para saber si estamos editando
window.clienteEnEdicion = null;

// Función para inicializar eventos
function inicializarEventosClientes() {
  const form = document.getElementById("clienteForm");
  if (!form) {
    console.warn("Formulario de clientes no encontrado");
    return;
  }

  // Remover listeners anteriores si existen
  form.removeEventListener("submit", manejarSubmitFormularioClientes)
  
  // Agregar el listener del formulario
  form.addEventListener("submit", manejarSubmitFormularioClientes);
}

// Función del submit separada para mejor organización
async function manejarSubmitFormularioClientes(e) {
  e.preventDefault();

  const datos = {
    nombre: document.getElementById("nombreCliente").value.trim(),
    apellido: document.getElementById("apellidoCliente").value.trim(),
    dpi: document.getElementById("dpiCliente").value.trim(),
    telefono: document.getElementById("telefonoCliente").value.trim(),
    correo: document.getElementById("correoCliente").value.trim(),
    direccion: document.getElementById("direccionCliente").value.trim()
  };

  // Validar campos obligatorios
  if (!datos.nombre || !datos.apellido || !datos.dpi || !datos.telefono || !datos.correo || !datos.direccion) {
    await mostrarDialogo("Todos los campos son obligatorios");
    return;
  }

  // Validar formato de correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(datos.correo)) {
    await mostrarDialogo("Por favor ingrese un correo electrónico válido");
    return;
  }

  try {
    if (window.clienteEnEdicion) {
      // Actualizar cliente existente
      const res = await fetch(`${API_URL_CLIENTES}/${window.clienteEnEdicion}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      if (res.ok) {
        await mostrarDialogo("Cliente actualizado exitosamente");
        cancelarEdicionCliente();
        cargarClientes();
      } else {
        const error = await res.json();
        await mostrarDialogo("Error al actualizar el cliente");
      }
    } else {
      // Crear nuevo cliente
      const res = await fetch(API_URL_CLIENTES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      if (res.ok) {
        e.target.reset();
        cargarClientes();
        await mostrarDialogo("Cliente registrado exitosamente");
      } else {
        const error = await res.json();
        await mostrarDialogo("Error al registrar el cliente");
      }
    }
  } catch (err) {
    console.error("Error:", err);
    await mostrarDialogo("Error en la operación. Intente nuevamente");
  }
}

// Obtener y mostrar clientes
async function cargarClientes() {
  const tbody = document.getElementById("clientesBody");
  if (!tbody) {
    console.error("No se encontró el elemento con ID 'clientesBody' en el HTML");
    return;
  }

  try {
    const res = await fetch(API_URL_CLIENTES);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const clientes = await res.json();
    
    if (Array.isArray(clientes)) {
      renderClientes(clientes);
    } else {
      console.error("La respuesta no es un array:", clientes);
    }
  } catch (error) {
    console.error("Error al cargar clientes:", error);
    await mostrarDialogo("Error al cargar los clientes");
  }
}

// Buscar cliente por ID
async function buscarClientePorId() {
  const inputBuscar = document.getElementById("buscarId");
  const id = inputBuscar.value.trim();

  if (!id) {
    await mostrarDialogo("Ingrese un ID válido");
    return;
  }

  try {
    const res = await fetch(`${API_URL_CLIENTES}/${id}`);
    
    if (res.ok) {
      const respuesta = await res.json();
      
      let cliente;
      if (Array.isArray(respuesta) && respuesta.length > 0) {
        cliente = respuesta[0];
      } else if (respuesta && typeof respuesta === 'object') {
        cliente = respuesta;
      }
      
      if (cliente && (cliente.nombre || cliente.correo)) {
        renderClientes([cliente]);
        inputBuscar.value = '';
      } else {
        console.error("No se pudo extraer cliente válido de:", respuesta);
        await mostrarDialogo("Cliente no encontrado o datos incompletos");
      }
    } else if (res.status === 404) {
      await mostrarDialogo("Cliente no encontrado");
    } else {
      const error = await res.json();
      await mostrarDialogo("Error en la búsqueda");
    }
  } catch (err) {
    console.error("Error al buscar cliente:", err);
    await mostrarDialogo("Error al buscar el cliente");
  }
}

// Editar cliente
async function editarCliente(id) {
  try {
    const res = await fetch(`${API_URL_CLIENTES}/${id}`);
    if (res.ok) {
      const respuesta = await res.json();
      const cliente = Array.isArray(respuesta) ? respuesta[0] : respuesta;
      
      // Llenar formulario con datos del cliente
      document.getElementById("nombreCliente").value = cliente.nombre || '';
      document.getElementById("apellidoCliente").value = cliente.apellido || '';
      document.getElementById("dpiCliente").value = cliente.dpi || '';
      document.getElementById("telefonoCliente").value = cliente.telefono || '';
      document.getElementById("correoCliente").value = cliente.correo || '';
      document.getElementById("direccionCliente").value = cliente.direccion || '';
      
      // Cambiar a modo edición
      window.clienteEnEdicion = id;
      document.querySelector('button[type="submit"]').textContent = 'Actualizar';
      document.querySelector('.register-container h2').textContent = 'Editar Cliente';
      
      // Mostrar botón cancelar
      const cancelBtn = document.getElementById("cancelarBtnClientes");
      if (cancelBtn) cancelBtn.style.display = 'inline-block';
      
      // Scroll al formulario
      document.getElementById('clienteForm').scrollIntoView({ behavior: 'smooth' });
    }
  } catch (err) {
    console.error("Error al cargar cliente para editar:", err);
    await mostrarDialogo("Error al cargar el cliente");
  }
}

// Cancelar edición
function cancelarEdicionCliente() {
  window.clienteEnEdicion = null;
  
  const form = document.getElementById("clienteForm");
  if (form) form.reset();
  
  const submitBtn = document.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.textContent = 'Registrar';
  
  const titulo = document.querySelector('.register-container h2');
  if (titulo) titulo.textContent = 'Registro de Clientes';
  
  // Ocultar botón cancelar
  const cancelBtn = document.getElementById("cancelarBtnClientes");
  if (cancelBtn) cancelBtn.style.display = 'none';
}

// Eliminar cliente
async function eliminarCliente(id) {
  const confirmado = await mostrarDialogoConfirmacion("¿Seguro que quieres eliminar este cliente?");
  
  if (!confirmado) return;

  try {
    const res = await fetch(`${API_URL_CLIENTES}/${id}`, { method: "DELETE" });
    if (res.ok) {
      await mostrarDialogo("Cliente eliminado exitosamente");
      cargarClientes();
    } else {
      const error = await res.json();
      await mostrarDialogo("Error al eliminar el cliente");
    }
  } catch (err) {
    console.error("Error al eliminar:", err);
    await mostrarDialogo("Error al eliminar el cliente");
  }
}

// Renderizar clientes en la tabla
function renderClientes(clientes) {
  const tbody = document.getElementById("clientesBody");
  
  if (!tbody) {
    console.error("No se encontró el elemento con ID 'clientesBody'");
    return;
  }
  
  // Validar si hay clientes
  if (!clientes || clientes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="no-users">No hay clientes registrados</td>
      </tr>
    `;
    return;
  }

  let html = "";
  clientes.forEach(cliente => {
    const clienteId = cliente.id || 'Sin ID';
    html += `
      <tr>
        <td data-label="ID">${clienteId}</td>
        <td data-label="Nombre">${cliente.nombre || ''}</td>
        <td data-label="Apellido">${cliente.apellido || ''}</td>
        <td data-label="DPI">${cliente.dpi || ''}</td>
        <td data-label="Teléfono">${cliente.telefono || ''}</td>
        <td data-label="Correo">${cliente.correo || ''}</td>
        <td data-label="Dirección">${cliente.direccion || ''}</td>
        <td data-label="Acciones">
          <button class="btn-edit" data-id="${clienteId}">
            Editar
          </button>
          <button class="btn-delete" data-id="${clienteId}">
            Eliminar
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
  
  // Agregar event listeners DESPUÉS de insertar el HTML
  tbody.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      editarCliente(id);
    });
  });
  
  tbody.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      eliminarCliente(id);
    });
  });
}

// Función para mostrar todos los clientes
function mostrarTodosLosClientes() {
  cargarClientes();
}

// Exportar funciones globalmente
window.editarCliente = editarCliente;
window.eliminarCliente = eliminarCliente;
window.buscarClientePorId = buscarClientePorId;
window.mostrarTodosLosClientes = mostrarTodosLosClientes;
window.cancelarEdicionCliente = cancelarEdicionCliente;
window.inicializarEventosClientes = inicializarEventosClientes;
window.cargarClientes = cargarClientes;