// Determinar el rol del usuario actual
function obtenerRolUsuario() {

  const user = sessionStorage.getItem('usuario');
  if (!user) return null;
  try {
    return JSON.parse(user).rol || null;
  } catch {
    return null;
  }

}

// Configurar la interfaz según el rol
function configurarInterfazPorRol() {
  const rol = obtenerRolUsuario();
  
  if (rol === 'administrador') {
    const adminFilters = document.getElementById('adminFilters');
    if (adminFilters) {
      adminFilters.style.display = 'flex';
    }
  } else if (rol === 'mecanico') {
    ocultarBotonesEliminar();
    configurarCamposParaMecanico();
  }
}

// Ocultar botones de eliminar para mecánicos
function ocultarBotonesEliminar() {
  const oldStyle = document.getElementById('mecanico-styles');
  if (oldStyle) oldStyle.remove();
  
  const style = document.createElement('style');
  style.id = 'mecanico-styles';
  style.textContent = `
    .btn-delete {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}

// Configurar campos según permisos del mecánico
function configurarCamposParaMecanico() {
  // Campos que el mecánico NO puede editar (solo lectura)
  const camposReadOnly = [
    'numero_orden',
    'cliente_id',
    'vehiculo_id',
    'mecanico_id',
    'cita_id',
    'fecha_estimada_salida',
    'descripcion_inicial',
    'kilometraje_ingreso'
  ];
  
  // Campos que el mecánico SÍ puede editar
  const camposEditables = [
    'costo_mano_obra',
    'diagnostico',
    'observaciones',
    'estadoOrden'
  ];
  
  const rol = obtenerRolUsuario();
  if (rol === 'mecanico') {
    // Deshabilitar campos que no puede editar
    camposReadOnly.forEach(campoId => {
      const campo = document.getElementById(campoId);
      if (campo) {
        campo.setAttribute('readonly', 'true');
        campo.setAttribute('disabled', 'true');
        campo.style.backgroundColor = '#f5f5f5';
        campo.style.cursor = 'not-allowed';
        campo.title = 'Este campo no puede ser modificado';
      }
    });
    
    // Asegurar que los campos editables estén habilitados
    camposEditables.forEach(campoId => {
      const campo = document.getElementById(campoId);
      if (campo) {
        campo.removeAttribute('readonly');
        campo.removeAttribute('disabled');
        campo.style.backgroundColor = '#ffffff';
        campo.style.cursor = 'text';
      }
    });
    
    // Cambiar título del formulario si estamos en modo edición
    const titulo = document.querySelector('.register-container h2');
    if (titulo) {


      if (window.ordenEnEdicion) {

        titulo.textContent = 'Actualizar Orden de Trabajo';
      } else {
        titulo.textContent = 'Registro de Orden (Campos limitados)';
      }
    }
    
    // Cambiar texto del botón submit
    const submitBtn = document.querySelector('button[type="submit"]');

    if (submitBtn && !window.ordenEnEdicion) {

      submitBtn.textContent = 'Registrar Orden';
    }
  }
}

async function cargarMecanicoDeCita() {
  const citaIdOrden = document.getElementById("cita_id").value;
  const selectMecanico = document.getElementById("mecanico_id");

  // Resetear selección
  selectMecanico.value = "";

  if (!citaIdOrden) return;

  try {
    // Obtener los datos de la cita
    const resCita = await fetch(`${API_CONFIG.citas}/${citaIdOrden}`);
    if (!resCita.ok) throw new Error("No se pudo obtener la cita");

    const cita = await resCita.json();
    const mecanicoIdOrden = cita.mecanico_id;

    if (mecanicoIdOrden) {
      // Verificar que ese mecánico exista en el select
      const option = Array.from(selectMecanico.options)
        .find(opt => opt.value == mecanicoIdOrden);

      if (option) {
        selectMecanico.value = mecanicoIdOrden; // Selecciona automáticamente
      } else {
        // Si el mecánico no está en el select, se puede agregar
        const newOption = document.createElement("option");
        newOption.value = mecanicoIdOrden;
        newOption.text = cita.mecanico_nombre || "Mecánico asignado";
        selectMecanico.add(newOption);
        selectMecanico.value = mecanicoIdOrden;
      }
    }
    // Si no hay mecánico asignado, el select queda vacío y el usuario puede elegir
  } catch (error) {
    console.error("Error al cargar mecánico:", error);
  }
}






function filtrarPorEstado() {
const select = document.getElementById('filtroEstado');
  if (!select) return;
  
  const estado = select.value;
  
  if (estado) {
    if (typeof cargarOrdenesPorEstado === 'function') {
      cargarOrdenesPorEstado(estado);
    } else {
      console.error('cargarOrdenesPorEstado no está disponible');
    }
  } else {
    if (typeof cargarOrdenes === 'function') {
      cargarOrdenes();
    } else {
      console.error('cargarOrdenes no está disponible');
    }
  }
}

// Cargar mecánicos en el filtro (solo activos)
async function cargarFiltroMecanicos() {
  try {
    const res = await fetch(API_CONFIG.usuarios, { credentials: 'include' });
    const usuarios = await res.json();
    const mecanicos = usuarios.filter(u => u.rol === 'mecanico' && u.estado === 'activo');

    const select = document.getElementById('filtroMecanico');
    if (!select) return;

    select.innerHTML = '<option value="">Filtrar por Mecánico</option>';

    mecanicos.forEach(m => {
      const option = document.createElement('option');
      option.value = m.id;
      option.textContent = `${m.nombre} ${m.apellido}`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error al cargar mecánicos para filtro:', error);
  }
}

// Cargar clientes en el filtro
async function cargarFiltroClientes() {
  try {
    const res = await fetch(API_CONFIG.clientes, { credentials: 'include' });
    const clientes = await res.json();

    const select = document.getElementById('filtroCliente');
    if (!select) return;

    select.innerHTML = '<option value="">Filtrar por Cliente</option>';

    clientes.forEach(c => {
      const option = document.createElement('option');
      option.value = c.id;
      option.textContent = `${c.nombre} ${c.apellido}`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error al cargar clientes para filtro:', error);
  }
}

// Filtrar por mecánico (solo admin)
function filtrarPorMecanico() {
  const select = document.getElementById('filtroMecanico');
  if (!select) return;

  const mecanicoId = select.value;

  if (mecanicoId) {
    if (typeof cargarOrdenesPorMecanico === 'function') {
      cargarOrdenesPorMecanico(mecanicoId);
    }
  } else {
    if (typeof cargarOrdenes === 'function') {
      cargarOrdenes();
    }
  }
}

// Filtrar por cliente (solo admin)
function filtrarPorCliente() {
  const select = document.getElementById('filtroCliente');
  if (!select) return;

  const clienteId = select.value;

  if (clienteId) {
    if (typeof cargarOrdenesPorCliente === 'function') {
      cargarOrdenesPorCliente(clienteId);
    }
  } else {
    if (typeof cargarOrdenes === 'function') {
      cargarOrdenes();
    }
  }
}

// Inicializar vista de órdenes
function inicializarVistaOrdenes() {
  setTimeout(() => {
    configurarInterfazPorRol();
    
    if (typeof inicializarEventosOrdenes === 'function') {
      inicializarEventosOrdenes();
    }
    
    if (typeof cargarOrdenes === 'function') {
      cargarOrdenes();
    }

    if (obtenerRolUsuario() === 'administrador') {
      cargarFiltroMecanicos();
      cargarFiltroClientes();
    }

  }, 150);
}

// Cargar vista de órdenes desde archivo HTML externo
async function cargarFormularioOrdenes() {
  const myOrdersSection = document.getElementById('my-orders');
  
  if (!myOrdersSection) {
    console.error('No se encontró la sección my-orders');
    return;
  }
  
  try {
    const response = await fetch('../Dashboard/FormOrdenes.html');
    const html = await response.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const content = doc.querySelector('.ordenes-container');
    
    if (content) {
      myOrdersSection.innerHTML = content.outerHTML;
      inicializarVistaOrdenes();
    } else {
      throw new Error('No se encontró el contenido de órdenes');
    }
  } catch (error) {
    console.error('Error al cargar vista de órdenes:', error);
    myOrdersSection.innerHTML = '<p class="error-message">Error al cargar órdenes. Por favor, recarga la página.</p>';
  }
}

// Exportar funciones para uso global
window.filtrarPorEstado = filtrarPorEstado;
window.filtrarPorMecanico = filtrarPorMecanico;
window.filtrarPorCliente = filtrarPorCliente;
window.obtenerRolUsuario = obtenerRolUsuario;
window.cargarMecanicoDeCita = cargarMecanicoDeCita;
window.configurarInterfazPorRol = configurarInterfazPorRol;