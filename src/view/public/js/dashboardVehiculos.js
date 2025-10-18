// Determinar el rol del usuario actual
function obtenerRolUsuario() {
  const user = JSON.parse(localStorage.getItem('usuario'));
  return user ? user.rol : null;
}

// Configurar la interfaz según el rol
function configurarInterfazVehiculosPorRol() {
  const rol = obtenerRolUsuario();
  
  if (rol === 'administrador') {
    mostrarTodosControlesVehiculos();
  } else if (rol === 'mecanico') {
    ocultarBotonesEdicionVehiculos();
    ocultarFormularioRegistroVehiculos();
  }
}

function mostrarTodosControlesVehiculos() {
  const registerContainer = document.querySelector('.register-container');
  if (registerContainer) {
    registerContainer.style.display = 'block';
  }
  
  const oldStyle = document.getElementById('mecanico-vehiculos-styles');
  if (oldStyle) oldStyle.remove();
}

function ocultarBotonesEdicionVehiculos() {
  const oldStyle = document.getElementById('mecanico-vehiculos-styles');
  if (oldStyle) oldStyle.remove();
  
  const style = document.createElement('style');
  style.id = 'mecanico-vehiculos-styles';
  style.textContent = `
    .btn-edit,
    .btn-delete {
      display: none !important;
    }
    .register-container {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}

function ocultarFormularioRegistroVehiculos() {
  const registerContainer = document.querySelector('.register-container');
  if (registerContainer) {
    registerContainer.style.display = 'none';
  }
}

function inicializarVistaVehiculos() {
  setTimeout(() => {
    configurarInterfazVehiculosPorRol();
    
    if (typeof inicializarEventosVehiculos === 'function') {
      inicializarEventosVehiculos();
    }
    
    if (typeof cargarVehiculos === 'function') {
      cargarVehiculos();
    }
  }, 150);
}

async function cargarFormularioVehiculos() {
  const vehiclesSection = document.getElementById('vehicles');
  
  if (!vehiclesSection) {
    console.error('No se encontró la sección vehicles');
    return;
  }
  
  try {
    const response = await fetch('../Dashboard/FormVehiculos.html');
    const html = await response.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const content = doc.querySelector('.register-container');
    
    if (content) {
      vehiclesSection.innerHTML = content.outerHTML;
      inicializarVistaVehiculos();
    } else {
      throw new Error('No se encontró el contenido de vehículos');
    }
  } catch (error) {
    console.error('Error al cargar vista de vehículos:', error);
    vehiclesSection.innerHTML = '<p class="error-message">Error al cargar vehículos. Por favor, recarga la página.</p>';
  }
}

window.obtenerRolUsuario = obtenerRolUsuario;
window.configurarInterfazVehiculosPorRol = configurarInterfazVehiculosPorRol;