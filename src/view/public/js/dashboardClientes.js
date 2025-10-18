// Determinar el rol del usuario actual
function obtenerRolUsuario() {
  const user = JSON.parse(localStorage.getItem('usuario'));
  return user ? user.rol : null;
}

// Configurar la interfaz según el rol
function configurarInterfazClientesPorRol() {
  const rol = obtenerRolUsuario();
  
  if (rol === 'administrador') {
    mostrarTodosControlesClientes();
  } else if (rol === 'mecanico') {
    ocultarBotonesEdicionClientes();
    ocultarFormularioRegistroClientes();
  }
}

function mostrarTodosControlesClientes() {
  const registerContainer = document.querySelector('.register-container');
  if (registerContainer) {
    registerContainer.style.display = 'block';
  }
  
  const oldStyle = document.getElementById('mecanico-clientes-styles');
  if (oldStyle) oldStyle.remove();
}

function ocultarBotonesEdicionClientes() {
  const oldStyle = document.getElementById('mecanico-clientes-styles');
  if (oldStyle) oldStyle.remove();
  
  const style = document.createElement('style');
  style.id = 'mecanico-clientes-styles';
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

function ocultarFormularioRegistroClientes() {
  const registerContainer = document.querySelector('.register-container');
  if (registerContainer) {
    registerContainer.style.display = 'none';
  }
}

function inicializarVistaClientes() {
  
  
  setTimeout(() => {
    configurarInterfazClientesPorRol();
    
    if (typeof inicializarEventosClientes === 'function') {
      inicializarEventosClientes();
    }
    
    if (typeof cargarClientes === 'function') {
      cargarClientes();
    }
  }, 150);
}

async function cargarFormularioClientes() {
  const clientsSection = document.getElementById("clients");
  
  if (!clientsSection) {
    console.error('No se encontró la sección clients');
    return;
  }
  
  try {
    const response = await fetch('../Dashboard/FormClientes.html');
    const html = await response.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const content = doc.querySelector('.register-container');
    
    if (content) {
      clientsSection.innerHTML = content.outerHTML;
      inicializarVistaClientes();
    } else {
      throw new Error('No se encontró el contenido de clientes');
    }
  } catch (error) {
    console.error('Error al cargar vista de clientes:', error);
    clientsSection.innerHTML = '<p class="error-message">Error al cargar clientes. Por favor, recarga la página.</p>';
  }
}

window.obtenerRolUsuario = obtenerRolUsuario;
window.configurarInterfazClientesPorRol = configurarInterfazClientesPorRol;