const API_URL_VEHICULOS = API_CONFIG.vehiculos;

// Variable para saber si estamos editando
window.vehiculoEnEdicion = null;

// Cargar clientes en el select del formulario
async function cargarClientesEnSelectFormulario() {
  const selectCliente = document.getElementById("clienteIdVehiculo");
  
  if (!selectCliente) return;
  
  try {
    const res = await fetch(API_URL_CLIENTES);
    
    if (res.ok) {
      const clientes = await res.json();
      
      if (Array.isArray(clientes)) {
        clientes.forEach(cliente => {
          const option = document.createElement("option");
          option.value = cliente.id;
          option.textContent = `${cliente.id} - ${cliente.nombre} ${cliente.apellido}`;
          selectCliente.appendChild(option);
        });
      }
    }
  } catch (err) {
    console.error("Error al cargar clientes:", err);
  }
}

// Cargar clientes en el select de búsqueda
async function cargarClientesEnSelectBusqueda() {
  const selectCliente = document.getElementById("buscarClienteIdVehiculo");
  
  if (!selectCliente) return;
  
  try {
    const res = await fetch(API_URL_CLIENTES);
    
    if (res.ok) {
      const clientes = await res.json();
      
      if (Array.isArray(clientes)) {
        clientes.forEach(cliente => {
          const option = document.createElement("option");
          option.value = cliente.id;
          option.textContent = `${cliente.id} - ${cliente.nombre} ${cliente.apellido}`;
          selectCliente.appendChild(option);
        });
      }
    }
  } catch (err) {
    console.error("Error al cargar clientes:", err);
  }
}

// Funcion para inicializar eventos
function inicializarEventosVehiculos() {
  const form = document.getElementById("vehiculoForm");
  if (!form) {
    console.warn("Formulario de vehículos no encontrado");
    return;
  }

  cargarClientesEnSelectFormulario();
  cargarClientesEnSelectBusqueda();

  // Remover listeners anteriores si existen
  form.removeEventListener("submit", manejarSubmitFormularioVehiculo)
  
  // Agregar el listener del formulario
  form.addEventListener("submit", manejarSubmitFormularioVehiculo);
}

// Funcion del submit separada para mejor organización
async function manejarSubmitFormularioVehiculo(e) {
  e.preventDefault();

  const datos = {
    cliente_id: document.getElementById("clienteIdVehiculo").value.trim(),
    marca: document.getElementById("marcaVehiculo").value.trim(),
    modelo: document.getElementById("modeloVehiculo").value.trim(),
    anioo: document.getElementById("anioVehiculo").value.trim(),
    placa: document.getElementById("placaVehiculo").value.trim(),
    color: document.getElementById("colorVehiculo").value.trim(),
    numero_motor: document.getElementById("numeroMotorVehiculo").value.trim(),
    numero_chasis: document.getElementById("numeroChasisVehiculo").value.trim(),
    kilometraje: document.getElementById("kilometrajeVehiculo").value.trim()
  };

  try {
    if (window.vehiculoEnEdicion) {
      // Actualizar vehiculo existente (solo marca, modelo, color, kilometraje)
      const datosActualizacion = {
        marca: datos.marca,
        modelo: datos.modelo,
        color: datos.color,
        kilometraje: datos.kilometraje
      };

      const res = await fetch(`${API_URL_VEHICULOS}/${window.vehiculoEnEdicion}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosActualizacion),
      });

      if (res.ok) {
        alert("Vehículo actualizado exitosamente");
        cancelarEdicionVehiculo();
        cargarVehiculos();
      } else {
        const error = await res.json();
        alert("Error: " + (error.error || error.message || "Error desconocido"));
      }
    } else {
      // Crear nuevo vehículo campos obligatorios
      if (!datos.cliente_id || !datos.marca || !datos.modelo || !datos.anioo || !datos.placa) {
        alert("Cliente ID, marca, modelo, año y placa son obligatorios");
        return;
      }

      const res = await fetch(API_URL_VEHICULOS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      if (res.ok) {
        e.target.reset();
        cargarVehiculos();
        alert("Vehículo registrado exitosamente");
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

// Obtener y mostrar todos los vehi­culos
async function cargarVehiculos() {
  const tbody = document.getElementById("vehiculosBody");
  
  if (!tbody) {
    console.error("No se encontró el elemento con ID 'vehiculosBody' en el HTML");
    return;
  }
  
  try {
    const res = await fetch(API_URL_VEHICULOS);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const respuesta = await res.json();
    
    // Manejar diferentes formatos de respuesta
    let vehiculos;
    
    if (Array.isArray(respuesta)) {
      vehiculos = respuesta;
    } else if (respuesta.data && Array.isArray(respuesta.data)) {
      vehiculos = respuesta.data;
    } else if (respuesta.vehiculos && Array.isArray(respuesta.vehiculos)) {
      vehiculos = respuesta.vehiculos;
    } else {
      console.error("Formato de respuesta no reconocido:", respuesta);
      tbody.innerHTML = `
        <tr>
          <td colspan="11" class="no-users">Error: Formato de datos inesperado</td>
        </tr>
      `;
      return;
    }

    renderVehiculos(vehiculos);
    
  } catch (error) {
    console.error("Error al cargar vehículos:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="11" class="no-users">Error al cargar vehículos: ${error.message}</td>
      </tr>
    `;
  }
}

// Buscar vehículo por ID
async function buscarVehiculoPorId() {
  const inputBuscar = document.getElementById("buscarIdVehiculo");
  const id = inputBuscar.value.trim();

  if (!id) {
    alert("Ingrese un ID válido");
    return;
  }

  try {
    const res = await fetch(`${API_URL_VEHICULOS}/${id}`);
    
    if (res.ok) {
      const vehiculo = await res.json();
      
      if (vehiculo && vehiculo.placa) {
        renderVehiculos([vehiculo]);
        inputBuscar.value = '';
      } else {
        alert("Vehículo no encontrado o datos incompletos");
      }
    } else if (res.status === 404) {
      alert("Vehículo no encontrado");
    } else {
      const error = await res.json();
      alert("Error: " + (error.error || error.message || "Error desconocido"));
    }
  } catch (err) {
    console.error("Error al buscar vehículo:", err);
    alert("Error al buscar vehículo. Verifica la conexión con el servidor.");
  }
}

// Buscar vehículos por cliente ID
async function buscarVehiculosPorCliente() {
  const selectBuscar = document.getElementById("buscarClienteIdVehiculo");
  const cliente_id = selectBuscar.value.trim();

  if (!cliente_id) {
    alert("Seleccione un cliente válido");
    return;
  }

  try {
    const res = await fetch(`${API_URL_VEHICULOS}/cliente/${cliente_id}`);
    
    if (res.ok) {
      const vehiculos = await res.json();
      
      if (Array.isArray(vehiculos)) {
        renderVehiculos(vehiculos);
        selectBuscar.value = '';
      } else {
        renderVehiculos([]);
        alert("No se encontraron vehículos para este cliente");
      }
    } else {
      let mensajeError = "Error al buscar vehículos";
      try {
        const error = await res.json();
        mensajeError = error.error || error.message || mensajeError;
      } catch (e) {}
      
      renderVehiculos([]);
      alert(mensajeError);
    }
  } catch (err) {
    console.error("Error al buscar vehículos por cliente:", err);
    renderVehiculos([]);
    alert("Error al buscar vehículos.");
  }
}

// Buscar vehículo por placa
async function buscarVehiculoPorPlaca() {
  const inputBuscar = document.getElementById("buscarPlacaVehiculo");
  const placa = inputBuscar.value.trim();

  if (!placa) {
    alert("Ingrese una placa válida");
    return;
  }

  try {
    const res = await fetch(`${API_URL_VEHICULOS}/placa/${placa}`);
    
    if (res.ok) {
      const respuesta = await res.json();
      
      let vehiculo;
      if (Array.isArray(respuesta) && respuesta.length > 0) {
        vehiculo = respuesta[0];
      } else if (respuesta && typeof respuesta === 'object') {
        vehiculo = respuesta;
      }
      
      if (vehiculo && vehiculo.placa) {
        renderVehiculos([vehiculo]);
        inputBuscar.value = '';
      } else {
        alert("Vehículo no encontrado");
      }
    } else if (res.status === 404) {
      alert("Vehículo no encontrado");
    } else {
      const error = await res.json();
      alert("Error: " + (error.error || error.message || "Error desconocido"));
    }
  } catch (err) {
    console.error("Error al buscar vehículo por placa:", err);
    alert("Error al buscar vehículo. Verifica la conexión con el servidor.");
  }
}

// Editar vehículo
async function editarVehiculo(id) {
  try {
    const res = await fetch(`${API_URL_VEHICULOS}/${id}`);
    if (res.ok) {
      const respuesta = await res.json();
      const vehiculo = Array.isArray(respuesta) ? respuesta[0] : respuesta;

      // Llenar formulario con datos del vehi­culo
      document.getElementById("clienteIdVehiculo").value = vehiculo.cliente_id || '';
      document.getElementById("marcaVehiculo").value = vehiculo.marca || '';
      document.getElementById("modeloVehiculo").value = vehiculo.modelo || '';
      document.getElementById("anioVehiculo").value = vehiculo.anioo || '';
      document.getElementById("placaVehiculo").value = vehiculo.placa || '';
      document.getElementById("colorVehiculo").value = vehiculo.color || '';
      document.getElementById("numeroMotorVehiculo").value = vehiculo.numero_motor || '';
      document.getElementById("numeroChasisVehiculo").value = vehiculo.numero_chasis || '';
      document.getElementById("kilometrajeVehiculo").value = vehiculo.kilometraje || '';
      
      // Deshabilitar campos que no se pueden editar
      document.getElementById("clienteIdVehiculo").disabled = true;
      document.getElementById("anioVehiculo").disabled = true;
      document.getElementById("placaVehiculo").disabled = true;
      document.getElementById("numeroMotorVehiculo").disabled = true;
      document.getElementById("numeroChasisVehiculo").disabled = true;
      
      // Cambiar a modo edicion
      window.vehiculoEnEdicion = id;
      document.querySelector('button[type="submit"]').textContent = 'Actualizar';
      document.querySelector('.register-container h2').textContent = 'Editar Vehículo';

      // Mostrar boton cancelar
      const cancelBtn = document.getElementById("cancelarBtnVehiculo");
      if (cancelBtn) cancelBtn.style.display = 'inline-block';
      
      // Scroll al formulario
      document.getElementById('vehiculoForm').scrollIntoView({ behavior: 'smooth' });
    }
  } catch (err) {
    console.error("Error al cargar vehículo para editar:", err);
    alert('Error al cargar vehículo para editar');
  }
}

// Cancelar edición
function cancelarEdicionVehiculo() {
  window.vehiculoEnEdicion = null;
  
  const form = document.getElementById("vehiculoForm");
  if (form) form.reset();
  
  // Rehabilitar campos
  const clienteId = document.getElementById("clienteIdVehiculo");
  const anio = document.getElementById("anioVehiculo");
  const placa = document.getElementById("placaVehiculo");
  const motor = document.getElementById("numeroMotorVehiculo");
  const chasis = document.getElementById("numeroChasisVehiculo");
  
  if (clienteId) clienteId.disabled = false;
  if (anio) anio.disabled = false;
  if (placa) placa.disabled = false;
  if (motor) motor.disabled = false;
  if (chasis) chasis.disabled = false;
  
  const submitBtn = document.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.textContent = 'Registrar';
  
  const titulo = document.querySelector('.register-container h2');
  if (titulo) titulo.textContent = 'Registro de Vehículos';
  
  // Ocultar boton cancelar
  const cancelBtn = document.getElementById("cancelarBtnVehiculo");
  if (cancelBtn) cancelBtn.style.display = 'none';
}

// Eliminar vehículo
async function eliminarVehiculo(id) {
  if (!confirm("¿Seguro que quieres eliminar este vehículo?")) return;

  try {
    const res = await fetch(`${API_URL_VEHICULOS}/${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("Vehículo eliminado exitosamente");
      cargarVehiculos();
    } else {
      const error = await res.json();
      alert("Error al eliminar vehículo: " + (error.error || error.message));
    }
  } catch (err) {
    console.error("Error al eliminar:", err);
    alert("Error al eliminar vehículo");
  }
}

// Renderizar vehículos en la tabla
function renderVehiculos(vehiculos) {
  const tbody = document.getElementById("vehiculosBody");
  
  if (!tbody) {
    console.error("No se encontró el elemento con ID 'vehiculosBody'");
    return;
  }

  // Validar si hay vehículos
  if (!vehiculos || vehiculos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" class="no-users">No hay vehículos registrados</td>
      </tr>
    `;
    return;
  }

  let html = "";
  vehiculos.forEach(vehiculo => {
    const vehiculoId = vehiculo.id || 'Sin ID';
    
    // Mostrar cliente como "ID - Nombre"
    const clienteInfo = vehiculo.nombre_cliente 
      ? `${vehiculo.cliente_id} - ${vehiculo.nombre_cliente}` 
      : (vehiculo.cliente_id || 'N/A');
    
    html += `
      <tr>
        <td data-label="ID">${vehiculoId}</td>
        <td data-label="Cliente">${clienteInfo}</td>
        <td data-label="Marca">${vehiculo.marca || 'N/A'}</td>
        <td data-label="Modelo">${vehiculo.modelo || 'N/A'}</td>
        <td data-label="Año">${vehiculo.anioo || 'N/A'}</td>
        <td data-label="Placa">${vehiculo.placa || 'N/A'}</td>
        <td data-label="Color">${vehiculo.color || 'N/A'}</td>
        <td data-label="N° Motor">${vehiculo.numero_motor || 'N/A'}</td>
        <td data-label="N° Chasis">${vehiculo.numero_chasis || 'N/A'}</td>
        <td data-label="Kilometraje">${vehiculo.kilometraje || 'N/A'}</td>
        <td data-label="Acciones">
          <button class="btn-edit" onclick="editarVehiculo(${vehiculoId})">
            Editar
          </button>
          <button class="btn-delete" onclick="eliminarVehiculo(${vehiculoId})">
            Eliminar
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// Funcion para mostrar todos los vehÃ­culos
function mostrarTodosLosVehiculos() {
  cargarVehiculos();
}

// Exportar funciones globalmente
window.editarVehiculo = editarVehiculo;
window.eliminarVehiculo = eliminarVehiculo;
window.buscarVehiculoPorId = buscarVehiculoPorId;
window.buscarVehiculosPorCliente = buscarVehiculosPorCliente;
window.buscarVehiculoPorPlaca = buscarVehiculoPorPlaca;
window.mostrarTodosLosVehiculos = mostrarTodosLosVehiculos;
window.cancelarEdicionVehiculo = cancelarEdicionVehiculo;
window.inicializarEventosVehiculos = inicializarEventosVehiculos;
window.cargarVehiculos = cargarVehiculos;