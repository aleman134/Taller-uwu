// Determinar el rol del usuario actual
function obtenerRolUsuario() {
  const user = JSON.parse(localStorage.getItem('usuario'));
  return user ? user.rol : null;
}

// Configurar la interfaz según el rol
function configurarInterfazUsuariosPorRol() {
  const rol = obtenerRolUsuario();
  
  if (rol === 'administrador') {
    mostrarTodosControlesUsuarios();
  } else if (rol === 'mecanico') {
    ocultarBotonesEdicionUsuarios();
    ocultarFormularioRegistroUsuarios();
  }
}

function mostrarTodosControlesUsuarios() {
  const registerContainer = document.querySelector('.register-container');
  if (registerContainer) {
    registerContainer.style.display = 'block';
  }
  
  const oldStyle = document.getElementById('mecanico-usuarios-styles');
  if (oldStyle) oldStyle.remove();
}

function ocultarBotonesEdicionUsuarios() {
  const oldStyle = document.getElementById('mecanico-usuarios-styles');
  if (oldStyle) oldStyle.remove();
  
  const style = document.createElement('style');
  style.id = 'mecanico-usuarios-styles';
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

function ocultarFormularioRegistroUsuarios() {
  const registerContainer = document.querySelector('.register-container');
  if (registerContainer) {
    registerContainer.style.display = 'none';
  }
}

function inicializarVistaUsuarios() {
  setTimeout(() => {
    configurarInterfazUsuariosPorRol();
    
    if (typeof inicializarEventosUsuarios === 'function') {
      inicializarEventosUsuarios();
    }
    
    if (typeof cargarUsuarios === 'function') {
      cargarUsuarios();
    }
  }, 150);
}

async function cargarFormularioUsuarios() {
  const usuariosContainer = document.getElementById('usuariosContainer');
  
  if (!usuariosContainer) {
    console.error('No se encontró la sección usuariosContainer');
    return;
  }
  
  try {
    const response = await fetch('../Dashboard/FormUsuarios.html');
    const html = await response.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const content = doc.querySelector('.register-container');
    
    if (content) {
      usuariosContainer.innerHTML = content.outerHTML;
      inicializarVistaUsuarios();
    } else {
      throw new Error('No se encontró el contenido de usuarios');
    }
  } catch (error) {
    console.error('Error al cargar vista de usuarios:', error);
    usuariosContainer.innerHTML = '<p class="error-message">Error al cargar usuarios. Por favor, recarga la página.</p>';
  }
}

window.obtenerRolUsuario = obtenerRolUsuario;
window.configurarInterfazUsuariosPorRol = configurarInterfazUsuariosPorRol;