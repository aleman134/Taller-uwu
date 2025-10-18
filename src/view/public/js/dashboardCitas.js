// Determinar el rol del usuario actual
function obtenerRolUsuario() {
  const user = JSON.parse(localStorage.getItem('usuario'));
  return user ? user.rol : null;
}

// Configurar la interfaz según el rol
function configurarInterfazCitasPorRol() {
  const rol = obtenerRolUsuario();
  
  if (rol === 'administrador') {
    mostrarTodosControlesCitas();
  } else if (rol === 'mecanico') {
    ocultarBotonesEdicionCitas();
    ocultarFormularioRegistroCitas();
  }
}

function mostrarTodosControlesCitas() {
  const registerContainer = document.querySelector('.register-container');
  if (registerContainer) {
    registerContainer.style.display = 'block';
  }
  
  const oldStyle = document.getElementById('mecanico-citas-styles');
  if (oldStyle) oldStyle.remove();
}

function ocultarBotonesEdicionCitas() {
  const oldStyle = document.getElementById('mecanico-citas-styles');
  if (oldStyle) oldStyle.remove();
  
  const style = document.createElement('style');
  style.id = 'mecanico-citas-styles';
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

function ocultarFormularioRegistroCitas() {
  const registerContainer = document.querySelector('.register-container');
  if (registerContainer) {
    registerContainer.style.display = 'none';
  }
}

function inicializarVistaCitas() {
  setTimeout(() => {
    configurarInterfazCitasPorRol();
    
    if (typeof inicializarEventosCitas === 'function') {
      inicializarEventosCitas();
    }
    
    if (typeof cargarCitasCita === 'function') {
      cargarCitasCita();
    }
  }, 150);
}

async function cargarFormularioCitas() {
  const citasSection = document.getElementById('appointments');
  
  if (!citasSection) {
    console.error('No se encontró la sección appointments');
    return;
  }
  
  try {
    const response = await fetch('../Dashboard/FormCitas.html');
    const html = await response.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const content = doc.querySelector('.ordenes-container');
    
    if (content) {
      citasSection.innerHTML = content.outerHTML;
      inicializarVistaCitas();
    } else {
      throw new Error('No se encontró el contenido de citas');
    }
  } catch (error) {
    console.error('Error al cargar vista de citas:', error);
    citasSection.innerHTML = '<p class="error-message">Error al cargar citas. Por favor, recarga la página.</p>';
  }
}

window.obtenerRolUsuario = obtenerRolUsuario;
window.configurarInterfazCitasPorRol = configurarInterfazCitasPorRol;