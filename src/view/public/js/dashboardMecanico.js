// Sidebar
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  sidebar.classList.toggle("collapsed");
  mainContent.classList.toggle("expanded");
}

// Cerrar sidebar en móvil al hacer clic fuera
document.addEventListener('click', (e) => {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.querySelector(".toggle-btn");
  
  if (window.innerWidth <= 768 && 
      !sidebar.contains(e.target) && 
      !toggleBtn.contains(e.target)) {
    sidebar.classList.remove("show");
  }
});

// cambio de seccion
function showSection(sectionId) {
  const title = document.getElementById("pageTitle");
  const sections = document.querySelectorAll(".section");

  sections.forEach(section => {
    section.style.display = "none";
  });

  const selectedSection = document.getElementById(sectionId);
  if (selectedSection) {
    selectedSection.style.display = "block";
  }

  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.remove("active");
  });
  
  const activeLink = document.querySelector(`[onclick*="showSection('${sectionId}')"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }

  switch (sectionId) {
    case "dashboard":
      title.textContent = "Mi Dashboard";
      break;
    case "clients":
      title.textContent = "Clientes";
      cargarFormularioClientes();
      break;      
    case "vehicles":
      title.textContent = "Vehiculos";
      cargarFormularioVehiculos();
      break;
    case "services":
      title.textContent = "Gestión de Servicios";
      cargarVistaServicios();
      break;              
    case "my-orders":
      title.textContent = "Gestión de Órdenes";
      cargarFormularioOrdenes();
      break;
    case "appointments":
      title.textContent = "Mis Citas";
      cargarFormularioCitas();
      break;
    case "history":
      title.textContent = "Historial";
      break;
    case "reports":
      title.textContent = "Reportes";
      break;
    case "users":
      title.textContent = "Gestión de Usuarios";
      cargarFormularioUsuarios();
      break;
    default:
      title.textContent = "Mi Dashboard";
  }
}

// datos usuarios
document.addEventListener("DOMContentLoaded", () => {
  const user = verificarAutenticacion('mecanico');
  
  if (user) {
    iniciarVerificacionSesion();
    
    document.getElementById("userName").textContent = user.correo;
    document.getElementById("userRole").textContent = user.rol;
    document.querySelector(".user-avatar").textContent =
      user.correo.charAt(0).toUpperCase();
    
    showSection("dashboard");
  }
});

// modales
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("show");
    modal.focus();
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("show");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("show");
      }
    });
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.show').forEach(modal => {
        modal.classList.remove('show');
      });
    }
  });
});