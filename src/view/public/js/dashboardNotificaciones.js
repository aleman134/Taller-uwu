// Determinar el rol del usuario actual
function obtenerRolUsuario() {
  const user = JSON.parse(localStorage.getItem('usuario'));
  return user ? user.rol : null;
}

// Configurar la interfaz según el rol
function configurarInterfazNotificacionesPorRol() {
  const rol = obtenerRolUsuario();
  
  if (rol === 'administrador') {
    mostrarTodosControlesNotificaciones();
  } else if (rol === 'mecanico') {
    ocultarBotonesEdicionNotificaciones();
    ocultarFormularioRegistroNotificaciones();
  }
}

function mostrarTodosControlesNotificaciones() {
  const registerContainer = document.querySelector('.register-container');
  if (registerContainer) {
    registerContainer.style.display = 'block';
  }
  
  const oldStyle = document.getElementById('mecanico-notificaciones-styles');
  if (oldStyle) oldStyle.remove();
}

function ocultarBotonesEdicionNotificaciones() {
  const oldStyle = document.getElementById('mecanico-notificaciones-styles');
  if (oldStyle) oldStyle.remove();
  
  const style = document.createElement('style');
  style.id = 'mecanico-notificaciones-styles';
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

function ocultarFormularioRegistroNotificaciones() {
  const registerContainer = document.querySelector('.register-container');
  if (registerContainer) {
    registerContainer.style.display = 'none';
  }
}

function inicializarVistaNotificaciones() {
  setTimeout(() => {
    // Verificar que el tbody existe antes de continuar
    const tbody = document.getElementById('notificacionesBody');
    if (!tbody) {
      console.error('ERROR: No se encontró notificacionesBody después de cargar el HTML');
      return;
    }
    
    configurarInterfazNotificacionesPorRol();
    
    if (typeof inicializarEventosNotificaciones === 'function') {
      inicializarEventosNotificaciones();
    } else {
      console.error('inicializarEventosNotificaciones no está definida');
    }
    
    if (typeof cargarTodasNotificaciones === 'function') {
      cargarTodasNotificaciones();
    } else {
      console.error('cargarNotificaciones no está definida');
    }
  }, 200);
}

async function cargarFormularioNotificaciones() {
  const notificacionesSection = document.getElementById('notifications');
  
  if (!notificacionesSection) {
    console.error('No se encontró la sección notifications');
    return;
  }
  
  try {
    const response = await fetch('../Dashboard/FormNotificaciones.html');
    const html = await response.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Buscar todo el contenido, no solo .register-container
    const registerContainer = doc.querySelector('.register-container');
    const searchSection = doc.querySelector('.search-section');
    const ordersSection = doc.querySelector('.orders-section');
    
    if (registerContainer && searchSection && ordersSection) {
      // Insertar todo el contenido HTML
      notificacionesSection.innerHTML = 
        registerContainer.outerHTML + 
        searchSection.outerHTML + 
        ordersSection.outerHTML;
      inicializarVistaNotificaciones();
    } else {
      throw new Error('No se encontró el contenido completo de notificaciones');
    }
  } catch (error) {
    console.error('Error al cargar vista de notificaciones:', error);
    notificacionesSection.innerHTML = '<p class="error-message">Error al cargar notificaciones. Por favor, recarga la página.</p>';
  }
}

window.obtenerRolUsuario = obtenerRolUsuario;
window.configurarInterfazNotificacionesPorRol = configurarInterfazNotificacionesPorRol;