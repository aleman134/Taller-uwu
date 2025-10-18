const API_URL_SERVICIOS = API_CONFIG.servicios;

// Variable para saber si estamos editando
window.servicioEnEdicion = null;

// Función para inicializar eventos (puede ser llamada desde dashboard)
function inicializarEventosServicios() {
  const form = document.getElementById("servicioForm");
  if (!form) {
    console.warn("Formulario de servicios no encontrado");
    return;
  }

  // Remover listeners anteriores si existen
  form.removeEventListener("submit", manejarSubmitFormularioServicio)
  
  // Agregar el listener del formulario
  form.addEventListener("submit", manejarSubmitFormularioServicio);
}

// Función del submit separada para mejor organización
async function manejarSubmitFormularioServicio(e) {
  e.preventDefault();

  const datos = {
    nombre: document.getElementById("nombreServicio").value.trim() || null,
    descripcion: document.getElementById("descripcionServicio").value.trim() || null,
    precio_base: parseFloat(document.getElementById("precioServicio").value) || null,
    tiempo_estimado: parseInt(document.getElementById("tiempoServicio").value) || null,
    categoria: document.getElementById("categoriaServicio").value.trim() || null,
    estado: document.getElementById("estadoServicio").value || 'activo',
  };

  try {
    if (window.servicioEnEdicion) {
      // Actualizar servicio existente
      const res = await fetch(`${API_URL_SERVICIOS}/${window.servicioEnEdicion}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      if (res.ok) {
        alert("Servicio actualizado exitosamente");
        cancelarEdicionServicios();
        cargarServicios();
      } else {
        const error = await res.json();
        alert("Error: " + (error.error || error.message || "Error desconocido"));
      }
    } else {
      // Crear nuevo servicio (requiere campos obligatorios)
      if (!datos.nombre || !datos.precio_base) {
        alert("Nombre y precio base son obligatorios para crear servicio");
        return;
      }
      
      const res = await fetch(API_URL_SERVICIOS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      if (res.ok) {
        e.target.reset();
        cargarServicios();
        alert("Servicio registrado exitosamente");
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

// Cargar servicios al iniciar SOLO si existe el tbody
document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("serviciosBody");
  if (tbody) {
    inicializarEventosServicios();
    cargarServicios();
    cargarCategoriasSelect();
  }
});

// Obtener y mostrar servicios
async function cargarServicios() {
  // Verificar que exista el tbody antes de hacer la petición
  const tbody = document.getElementById("serviciosBody");
  if (!tbody) {
    console.error("No se encontró el elemento con ID 'serviciosBody' en el HTML");
    return;
  }

  try {
    const res = await fetch(API_URL_SERVICIOS);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const servicios = await res.json();
    
    // Verificar si la respuesta es un array
    if (Array.isArray(servicios)) {
      renderServicios(servicios);
    } else {
      console.error("La respuesta no es un array:", servicios);
      alert("Error: El servidor no devolvió un array de servicios");
    }
  } catch (error) {
    console.error("Error al cargar servicios:", error);
    alert("Error al cargar servicios. Verifica que el servidor esté funcionando.");
  }
}

// Cargar servicios activos
async function cargarServiciosActivos() {
  const tbody = document.getElementById("serviciosBody");
  if (!tbody) {
    console.error("No se encontró el elemento con ID 'serviciosBody' en el HTML");
    return;
  }

  try {
    const res = await fetch(`${API_URL_SERVICIOS}/activos`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const servicios = await res.json();
    
    if (Array.isArray(servicios)) {
      renderServicios(servicios);
    } else {
      console.error("La respuesta no es un array:", servicios);
      alert("Error: El servidor no devolvió un array de servicios");
    }
  } catch (error) {
    console.error("Error al cargar servicios activos:", error);
    alert("Error al cargar servicios activos.");
  }
}

// Buscar servicio por ID
async function buscarServicioPorId() {
  const inputBuscar = document.getElementById("buscarIdServicio");
  const id = inputBuscar.value.trim();

  if (!id) {
    alert("Ingrese un ID válido");
    return;
  }

  try {
    const res = await fetch(`${API_URL_SERVICIOS}/${id}`);
    
    if (res.ok) {
      const respuesta = await res.json();
      
      let servicio;
      if (Array.isArray(respuesta) && respuesta.length > 0) {
        servicio = respuesta[0];
      } else if (respuesta && typeof respuesta === 'object') {
        servicio = respuesta;
      }
      
      if (servicio && (servicio.nombre || servicio.id)) {
        renderServicios([servicio]);
        inputBuscar.value = '';
      } else {
        console.error("No se pudo extraer servicio válido de:", respuesta);
        alert("Servicio no encontrado o datos incompletos");
      }
    } else if (res.status === 404) {
      alert("Servicio no encontrado");
    } else {
      const error = await res.json();
      alert("Error: " + (error.error || error.message || "Error desconocido"));
    }
  } catch (err) {
    console.error("Error al buscar servicio:", err);
    alert("Error al buscar servicio. Verifica la conexión con el servidor.");
  }
}

// Buscar servicios por categoría
async function buscarServiciosPorCategoria() {
  const selectCategoria = document.getElementById("filtroCategoria");
  const categoria = selectCategoria.value;

  if (!categoria) {
    cargarServicios();
    return;
  }

  try {
    const res = await fetch(`${API_URL_SERVICIOS}/categoria/${encodeURIComponent(categoria)}`);
    
    if (res.ok) {
      const servicios = await res.json();
      
      if (Array.isArray(servicios)) {
        renderServicios(servicios);
      } else {
        console.error("La respuesta no es un array:", servicios);
        alert("Error al cargar servicios por categoría");
      }
    } else {
      const error = await res.json();
      alert("Error: " + (error.error || error.message || "Error desconocido"));
    }
  } catch (err) {
    console.error("Error al buscar servicios por categoría:", err);
    alert("Error al buscar servicios por categoría.");
  }
}

// Buscar servicios por rango de precio
async function buscarServiciosPorRangoPrecio() {
  const precioMin = document.getElementById("precioMin").value.trim();
  const precioMax = document.getElementById("precioMax").value.trim();

  if (!precioMin || !precioMax) {
    alert("Ingrese ambos valores de precio");
    return;
  }

  if (parseFloat(precioMin) > parseFloat(precioMax)) {
    alert("El precio mínimo no puede ser mayor al precio máximo");
    return;
  }

  try {
    const res = await fetch(`${API_URL_SERVICIOS}/rango/${precioMin}/${precioMax}`);
    
    if (res.ok) {
      const servicios = await res.json();
      
      if (Array.isArray(servicios)) {
        renderServicios(servicios);
      } else {
        console.error("La respuesta no es un array:", servicios);
        alert("Error al cargar servicios por rango de precio");
      }
    } else {
      const error = await res.json();
      alert("Error: " + (error.error || error.message || "Error desconocido"));
    }
  } catch (err) {
    console.error("Error al buscar servicios por rango de precio:", err);
    alert("Error al buscar servicios por rango de precio.");
  }
}

// Cargar categorías en el select del formulario
async function cargarCategoriasSelect() {
  const selectCategoria = document.getElementById("categoriaServicio");
  if (!selectCategoria) return;

  try {
    const res = await fetch(`${API_URL_SERVICIOS}/categorias`);
    
    if (res.ok) {
      const categorias = await res.json();
      
      // Limpiar select y agregar opción por defecto
      selectCategoria.innerHTML = '<option value="">Seleccionar categoría</option>';
      
      if (Array.isArray(categorias)) {
        categorias.forEach(cat => {
          const option = document.createElement('option');
          option.value = cat.categoria;
          option.textContent = `${cat.categoria} (${cat.servicios_activos} activos)`;
          selectCategoria.appendChild(option);
        });
      }
    }
  } catch (err) {
    console.error("Error al cargar categorías:", err);
  }
}


// Editar servicio
async function editarServicio(id) {
  try {
    const res = await fetch(`${API_URL_SERVICIOS}/${id}`);
    if (res.ok) {
      const respuesta = await res.json();
      const servicio = Array.isArray(respuesta) ? respuesta[0] : respuesta;
      
      // Llenar formulario con datos del servicio
      document.getElementById("nombreServicio").value = servicio.nombre || '';
      document.getElementById("descripcionServicio").value = servicio.descripcion || '';
      document.getElementById("precioServicio").value = servicio.precio_base || '';
      document.getElementById("tiempoServicio").value = servicio.tiempo_estimado || '';
      document.getElementById("categoriaServicio").value = servicio.categoria || '';
      document.getElementById("estadoServicio").value = servicio.estado || 'activo';
      
      // Cambiar a modo edición
      window.servicioEnEdicion = id;
      document.querySelector('button[type="submit"]').textContent = 'Actualizar';
      document.querySelector('.register-container h2').textContent = 'Editar Servicio';
      
      // Mostrar botón cancelar si existe
      const cancelBtn = document.getElementById("cancelarBtnServicio");
      if (cancelBtn) cancelBtn.style.display = 'inline-block';
      
      // Scroll al formulario
      document.getElementById('servicioForm').scrollIntoView({ behavior: 'smooth' });
    }
  } catch (err) {
    console.error("Error al cargar servicio para editar:", err);
    alert('Error al cargar servicio para editar');
  }
}

// Cancelar edición
function cancelarEdicionServicios() {
  window.servicioEnEdicion = null;
  
  document.getElementById("servicioForm").reset();
  document.querySelector('button[type="submit"]').textContent = 'Registrar';
  document.querySelector('.register-container h2').textContent = 'Registro de Servicios';

  // Ocultar botón cancelar si existe
  const cancelBtn = document.getElementById("cancelarBtnServicio");
  if (cancelBtn) cancelBtn.style.display = 'none';
}

// Eliminar servicio (desactivar)
async function eliminarServicio(id) {
  if (!confirm("¿Seguro que quieres eliminar este servicio? (Será desactivado)")) return;

  try {
    const res = await fetch(`${API_URL_SERVICIOS}/${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("Servicio eliminado exitosamente");
      cargarServicios();
    } else {
      const error = await res.json();
      alert("Error al eliminar servicio: " + (error.error || error.message));
    }
  } catch (err) {
    console.error("Error al eliminar:", err);
    alert("Error al eliminar servicio");
  }
}

// Renderizar servicios en la tabla
function renderServicios(servicios) {
  const tbody = document.getElementById("serviciosBody");
  
  if (!tbody) {
    console.error("No se encontró el elemento con ID 'serviciosBody'");
    return;
  }
  
  // Validar si hay servicios
  if (!servicios || servicios.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="no-services">No hay servicios registrados</td>
      </tr>
    `;
    return;
  }

  let html = "";
  servicios.forEach(servicio => {
    const servicioId = servicio.id || 'Sin ID';
    const precioFormateado = servicio.precio_base ? `Q${parseFloat(servicio.precio_base).toFixed(2)}` : 'N/A';
    const tiempoFormateado = servicio.tiempo_estimado_formato || servicio.tiempo_estimado + ' min' || 'N/A';
    
    html += `
      <tr>
        <td data-label="ID">${servicioId}</td>
        <td data-label="Nombre">${servicio.nombre || 'N/A'}</td>
        <td data-label="Descripción">${servicio.descripcion || 'Sin descripción'}</td>
        <td data-label="Precio">${precioFormateado}</td>
        <td data-label="Tiempo">${tiempoFormateado}</td>
        <td data-label="Categoría">${servicio.categoria || 'Sin categoría'}</td>
        <td data-label="Estado">
          <span class="status ${servicio.estado}">${servicio.estado || 'N/A'}</span>
        </td>
        <td data-label="Fecha">${servicio.fecha_creacion ? new Date(servicio.fecha_creacion).toLocaleDateString() : 'N/A'}</td>
        <td data-label="Acciones">
          <button class="btn-edit" onclick="editarServicio(${servicioId})">
            Editar
          </button>
          <button class="btn-delete" onclick="eliminarServicio(${servicioId})">
            Eliminar
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// Función para mostrar todos los servicios
function mostrarTodosLosServicios() {
  cargarServicios();
}