const API_URL_USUARIOS = API_CONFIG.usuarios;

// Variable para saber si estamos editando
window.usuarioEnEdicion = null;

// Función para inicializar eventos (puede ser llamada desde dashboard)
function inicializarEventosUsuarios() {
  const form = document.getElementById("usuarioForm");
  if (!form) {
    console.warn("Formulario de usuarios no encontrado");
    return;
  }

  // Remover listeners anteriores si existen
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);
  
  // Agregar el listener del formulario
  newForm.addEventListener("submit", manejarSubmitFormularioUsuario);
}

// Función del submit separada para mejor organización
async function manejarSubmitFormularioUsuario(e) {
  e.preventDefault();

  const datos = {
    nombre: document.getElementById("nombreUsuario").value.trim() || null,
    apellido: document.getElementById("apellidoUsuario").value.trim() || null,
    correo: document.getElementById("correoUsuario").value.trim() || null,
    telefono: document.getElementById("telefonoUsuario").value.trim() || null,
    rol: document.getElementById("rol").value || null,
    estado: document.getElementById("estadoUsuario").value || null,
  };

  // Solo agregar contraseña si no está vacía
  const contrasenia = document.getElementById("contraseniaUsuario").value.trim();
  if (contrasenia) {
    datos.contrasenia = contrasenia;
  }

  try {
    if (window.usuarioEnEdicion) {
      // Actualizar usuario existente
      const res = await fetch(`${API_URL_USUARIOS}/${window.usuarioEnEdicion}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      if (res.ok) {
        alert("Usuario actualizado exitosamente");
        cancelarEdicionUsuarios();
        cargarUsuarios();
      } else {
        const error = await res.json();
        alert("Error: " + (error.error || error.message || "Error desconocido"));
      }
    } else {
      // CREAR nuevo usuario (requiere campos obligatorios)
      if (!datos.nombre || !datos.apellido || !datos.correo || !contrasenia || !datos.rol) {
        alert("Nombre, apellido, correo, contraseña y rol son obligatorios para crear usuario");
        return;
      }
      
      const res = await fetch(API_URL_USUARIOS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      if (res.ok) {
        e.target.reset();
        cargarUsuarios();
        alert("Usuario registrado exitosamente");
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

// Cargar usuarios al iniciar SOLO si existe el tbody
document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("usuariosBody");
  if (tbody) {
    inicializarEventosUsuarios();
    cargarUsuarios();
  }
});

// Obtener y mostrar usuarios
async function cargarUsuarios() {
  // Verificar que exista el tbody antes de hacer la petición
  const tbody = document.getElementById("usuariosBody");
  if (!tbody) {
    console.error("No se encontró el elemento con ID 'usuariosBody' en el HTML");
    return;
  }

  try {
    const res = await fetch(API_URL_USUARIOS);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const usuarios = await res.json();
    
    // Verificar si la respuesta es un array
    if (Array.isArray(usuarios)) {
      renderUsuarios(usuarios);
    } else {
      console.error("La respuesta no es un array:", usuarios);
      alert("Error: El servidor no devolvió un array de usuarios");
    }
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
    alert("Error al cargar usuarios. Verifica que el servidor esté funcionando.");
  }
}

// Buscar usuario por ID
async function buscarUsuarioPorId() {
  const inputBuscar = document.getElementById("buscarIdUsuario");
  const id = inputBuscar.value.trim();

  if (!id) {
    alert("Ingrese un ID válido");
    return;
  }

  try {
    const res = await fetch(`${API_URL_USUARIOS}/${id}`);
    
    if (res.ok) {
      const respuesta = await res.json();
      
      let usuario;
      if (Array.isArray(respuesta) && respuesta.length > 0) {
        usuario = respuesta[0];
      } else if (respuesta && typeof respuesta === 'object') {
        usuario = respuesta;
      }
      
      if (usuario && (usuario.nombre || usuario.correo)) {
        renderUsuarios([usuario]);
        inputBuscar.value = '';
      } else {
        console.error("No se pudo extraer usuario válido de:", respuesta);
        alert("Usuario no encontrado o datos incompletos");
      }
    } else if (res.status === 404) {
      alert("Usuario no encontrado");
    } else {
      const error = await res.json();
      alert("Error: " + (error.error || error.message || "Error desconocido"));
    }
  } catch (err) {
    console.error("Error al buscar usuario:", err);
    alert("Error al buscar usuario. Verifica la conexión con el servidor.");
  }
}

// Editar usuario
async function editarUsuario(id) {
  try {
    const res = await fetch(`${API_URL_USUARIOS}/${id}`);
    if (res.ok) {
      const respuesta = await res.json();
      const usuario = Array.isArray(respuesta) ? respuesta[0] : respuesta;
      
      // Llenar formulario con datos del usuario
      document.getElementById("nombreUsuario").value = usuario.nombre || '';
      document.getElementById("apellidoUsuario").value = usuario.apellido || '';
      document.getElementById("correoUsuario").value = usuario.correo || '';
      document.getElementById("telefonoUsuario").value = usuario.telefono || '';
      document.getElementById("contraseniaUsuario").value = ''; // Vacía por seguridad
      document.getElementById("rol").value = usuario.rol || '';
      document.getElementById("estadoUsuario").value = usuario.estado || '';
      
      // Cambiar a modo edición
      window.usuarioEnEdicion = id;
      document.querySelector('button[type="submit"]').textContent = 'Actualizar';
      document.querySelector('.register-container h2').textContent = 'Editar Usuario';
      
      // Cambiar placeholders para indicar que son opcionales
      document.getElementById("contraseniaUsuario").removeAttribute("required");
      document.getElementById("contraseniaUsuario").placeholder = "Dejar vacío para mantener actual";
      
      // Mostrar botón cancelar si existe
      const cancelBtn = document.getElementById("cancelarBtnUsuarios");
      if (cancelBtn) cancelBtn.style.display = 'inline-block';
      
      // Scroll al formulario
      document.getElementById('usuarioForm').scrollIntoView({ behavior: 'smooth' });
    }
  } catch (err) {
    console.error("Error al cargar usuario para editar:", err);
    alert('Error al cargar usuario para editar');
  }
}

// Cancelar edición
function cancelarEdicionUsuarios() {
  window.usuarioEnEdicion = null;
  
  document.getElementById("usuarioForm").reset();
  document.querySelector('button[type="submit"]').textContent = 'Registrar';
  document.querySelector('.register-container h2').textContent = 'Registro de Usuarios';
  
  // Restaurar placeholder original
  document.getElementById("contraseniaUsuario").setAttribute("required", "");
  document.getElementById("contraseniaUsuario").placeholder = "Contraseña";

  // Ocultar botón cancelar si existe
  const cancelBtn = document.getElementById("cancelarBtnUsuarios");
  if (cancelBtn) cancelBtn.style.display = 'none';
}

// Eliminar usuario
async function eliminarUsuario(id) {
  if (!confirm("¿Seguro que quieres eliminar este usuario?")) return;

  try {
    const res = await fetch(`${API_URL_USUARIOS}/${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("Usuario eliminado exitosamente");
      cargarUsuarios();
    } else {
      const error = await res.json();
      alert("Error al eliminar usuario: " + (error.error || error.message));
    }
  } catch (err) {
    console.error("Error al eliminar:", err);
    alert("Error al eliminar usuario");
  }
}

// Renderizar usuarios en la tabla
function renderUsuarios(usuarios) {
  const tbody = document.getElementById("usuariosBody");
  
  if (!tbody) {
    console.error("No se encontró el elemento con ID 'usuariosBody'");
    return;
  }
  
  // Validar si hay usuarios
  if (!usuarios || usuarios.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="no-users">No hay usuarios registrados</td>
      </tr>
    `;
    return;
  }

  let html = "";
  usuarios.forEach(usuario => {
    const usuarioId = usuario.id || 'Sin ID';
    
    html += `
      <tr>
        <td data-label="ID">${usuarioId}</td>
        <td data-label="Nombre">${usuario.nombre || 'N/A'}</td>
        <td data-label="Apellido">${usuario.apellido || 'N/A'}</td>
        <td data-label="Correo">${usuario.correo || 'N/A'}</td>
        <td data-label="Teléfono">${usuario.telefono || 'N/A'}</td>
        <td data-label="Rol">${usuario.rol || 'N/A'}</td>
        <td data-label="Estado">
          <span class="status ${usuario.estado}">${usuario.estado || 'N/A'}</span>
        </td>
        <td data-label="Acciones">
          <button class="btn-edit" onclick="editarUsuario(${usuarioId})">
            Editar
          </button>
          <button class="btn-delete" onclick="eliminarUsuario(${usuarioId})">
            Eliminar
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// Función para mostrar todos los usuarios
function mostrarTodosLosUsuarios() {
  cargarUsuarios();
}