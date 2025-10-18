const API_URL_CITAS = API_CONFIG.citas;

// Variable para saber si estamos editando
window.citaEnEdicion = null;

// inicializacion
function inicializarEventosCitas() {
  const form = document.getElementById("citaForm");
  if (!form) {
    console.warn("Formulario de citas no encontrado");
    return;
  }

  // Remover listeners anteriores si existen
  form.removeEventListener("submit", manejarSubmitFormularioCita)
  
  // Agregar el listener del formulario
  form.addEventListener("submit", manejarSubmitFormularioCita);
  
  // Cargar datos para los selectores
  cargarClientesParaSelect();
  cargarMecanicosParaSelect();
  cargarClientesEnSelectBuscar();
  cargarMecanicosEnSelectBuscar();
  
  // Listener para cargar vehículos cuando se selecciona un cliente
  const clienteSelect = document.getElementById("clienteIdCita");
  if (clienteSelect) {
    clienteSelect.addEventListener("change", cargarVehiculosDeCliente);
  }

  configurarValidacionFecha();
  configurarActualizacionMecanicos();
  
  // Intentar sincronizar citas temporales al cargar
  sincronizarCitasTemporales();
}

// configuracion para validar fecha
function configurarValidacionFecha() {
  const inputFecha = document.getElementById("fechaCita");
  
  if (!inputFecha) return;
  
  // Establecer fecha mínima como ahora
  const ahora = new Date();
  const minFecha = ahora.toISOString().slice(0, 16);
  inputFecha.min = minFecha;
  
  // Validar en tiempo real
  inputFecha.addEventListener('change', async function() {
    const validacion = validarFechaHorario(this.value);
    
    if (!validacion.valida) {
      alert(validacion.mensaje);
      this.value = '';
      return;
    }
    
    // Verificar disponibilidad automáticamente
    await verificarDisponibilidadAutomatica();
  });
}

function configurarActualizacionMecanicos() {
  const inputFecha = document.getElementById("fechaCita");
  const inputDuracion = document.getElementById("duracionMinutosCita");
  
  if (!inputFecha || !inputDuracion) return;
  
  inputFecha.addEventListener('change', actualizarMecanicosDisponibles);
  inputDuracion.addEventListener('change', actualizarMecanicosDisponibles);
}

// valida fehca y horario
function validarFechaHorario(fechaInput) {
  if (!fechaInput) {
    return { valida: false, mensaje: "Debe seleccionar una fecha y hora" };
  }

  const fecha = new Date(fechaInput);
  const ahora = new Date();
  
  // Validar fecha pasada
  if (fecha < ahora) {
    return {
      valida: false,
      mensaje: "No se pueden programar citas en fechas pasadas"
    };
  }
  
  // Validar día de la semana (0=Domingo, 6=Sábado)
  const diaSemana = fecha.getDay();
  if (diaSemana === 0 || diaSemana === 6) {
    return {
      valida: false,
      mensaje: "No se pueden programar citas los fines de semana"
    };
  }
  
  // Validar horario laboral (8:00 AM - 6:00 PM)
  const hora = fecha.getHours();
  if (hora < 8 || hora >= 18) {
    return {
      valida: false,
      mensaje: "El horario laboral es de 8:00 AM a 6:00 PM"
    };
  }
  
  return { valida: true, mensaje: "Fecha válida" };
}

// verifica disponibilidad
async function verificarDisponibilidadAutomatica() {
  const fechaCita = document.getElementById("fechaCita").value;
  const duracionMinutos = document.getElementById("duracionMinutosCita").value;
  const mecanicoId = document.getElementById("mecanicoIdCita").value;
  
  if (!fechaCita) return;
  
  try {
    const params = new URLSearchParams({
      fecha_cita: fechaCita,
      duracion_minutos: duracionMinutos || 60
    });
    
    if (mecanicoId) {
      params.append('mecanico_id', mecanicoId);
    }
    
    if (window.citaEnEdicion) {
      params.append('excluir_cita_id', window.citaEnEdicion);
    }
    
    const res = await fetch(`${API_URL_CITAS}/disponibilidad/verificar?${params}`);
    const data = await res.json();
    
    if (!data.disponible) {
      mostrarAlertaDisponibilidad(data);
    }
    
    return data;
  } catch (error) {
    console.error("Error al verificar disponibilidad:", error);
    return null;
  }
}

function mostrarAlertaDisponibilidad(data) {
  const mensaje = data.mensaje || "Horario no disponible";
  const horarios = data.horarios_alternativos || [];
  
  if (horarios.length > 0) {
    const horariosHTML = horarios.map(h => 
      `• ${h.fecha_formateada}`
    ).join('\n');
    
    const respuesta = confirm(
      `${mensaje}\n\nHorarios alternativos disponibles:\n${horariosHTML}\n\n ¿Desea seleccionar uno de estos horarios?`
    );
    
    if (respuesta) {
      mostrarModalHorariosAlternativos(horarios);
    }
  } else {
    alert(mensaje);
  }
}

function mostrarModalHorariosAlternativos(horarios) {
  const opciones = horarios.map((h, index) => 
    `${index + 1}. ${h.fecha_formateada}`
  ).join('\n');
  
  const seleccion = prompt(
    `Seleccione un horario alternativo (ingrese el número):\n\n${opciones}`
  );
  
  if (seleccion) {
    const index = parseInt(seleccion) - 1;
    if (index >= 0 && index < horarios.length) {
      document.getElementById("fechaCita").value = horarios[index].fecha_hora.slice(0, 16);
      actualizarMecanicosDisponibles();
    }
  }
}

// actualiza mecanicos disponibles
async function actualizarMecanicosDisponibles() {
  const fechaCita = document.getElementById("fechaCita").value;
  const duracionMinutos = document.getElementById("duracionMinutosCita").value;
  const selectMecanico = document.getElementById("mecanicoIdCita");
  
  if (!fechaCita || !selectMecanico) return;
  
  try {
    const params = new URLSearchParams({
      fecha_cita: fechaCita,
      duracion_minutos: duracionMinutos || 60
    });
    
    const res = await fetch(`${API_URL_CITAS}/mecanicos/disponibles?${params}`);
    const mecanicos = await res.json();
    
    const valorActual = selectMecanico.value;
    selectMecanico.innerHTML = '<option value="">Sin Mecánico Asignado</option>';
    
    mecanicos.forEach(mecanico => {
      const option = document.createElement('option');
      option.value = mecanico.id;
      option.textContent = `${mecanico.nombre_completo} - ${mecanico.estado_carga}`;
      selectMecanico.appendChild(option);
    });
    
    // Restaurar valor si todavía está disponible
    if (valorActual && Array.from(selectMecanico.options).some(opt => opt.value === valorActual)) {
      selectMecanico.value = valorActual;
    }
    
  } catch (error) {
    console.error("Error al cargar mecánicos disponibles:", error);
  }
}

// maneja submit del formulario
async function manejarSubmitFormularioCita(e) {
  e.preventDefault();

  const fechaCita = document.getElementById("fechaCita").value;
  const duracionMinutos = document.getElementById("duracionMinutosCita").value;
  const mecanicoId = document.getElementById("mecanicoIdCita").value;

  // valida fecha y horario
  const validacion = validarFechaHorario(fechaCita);
  if (!validacion.valida) {
    alert(validacion.mensaje);
    return;
  }

  // verifica disponibilidad
  const disponibilidad = await verificarDisponibilidadAutomatica();
  
  if (disponibilidad && !disponibilidad.disponible) {
    alert("Por favor, seleccione un horario disponible antes de continuar.");
    return;
  }

  const datos = {
    cliente_id: document.getElementById("clienteIdCita").value || null,
    vehiculo_id: document.getElementById("vehiculoIdCita").value || null,
    mecanico_id: mecanicoId || null,
    fecha_cita: fechaCita,
    duracion_minutos: duracionMinutos || null,
    motivo: document.getElementById("motivoCita").value.trim() || null,
    estado: document.getElementById("estadoCita").value || null,
    observaciones: document.getElementById("observacionesCita").value.trim() || null,
  };

  try {
    if (window.citaEnEdicion) {
      // actualiza cita existente
      const res = await fetch(`${API_URL_CITAS}/${window.citaEnEdicion}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      if (res.ok) {
        if (mecanicoId && window.citaMecanicoAnterior !== mecanicoId){
          await notificarMecanicoCambioCita(window.citaEnEdicion, mecanicoId);
        }

        alert("Cita actualizada exitosamente");
        cancelarEdicionCitas();
        cargarCitasCita();
      } else {
        const error = await res.json();
        alert("Error: " + (error.error || error.message || "Error desconocido"));
      }
    } else {
      // CREAR nueva cita
      if (!datos.cliente_id || !datos.vehiculo_id || !datos.fecha_cita || !datos.motivo) {
        alert("Cliente, vehículo, fecha y motivo son obligatorios para crear cita");
        return;
      }
      
      const res = await fetch(API_URL_CITAS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      if (res.ok) {
        const citaCreada = await res.json();
        
        // notifica al mecanico si fue asignado
        if (mecanicoId) {
          await notificarMecanicoAsignacion(citaCreada.id, mecanicoId);
        }
        
        e.target.reset();
        const vehiculoSelectCita = document.getElementById("vehiculoIdCita");
        if (vehiculoSelectCita) vehiculoSelectCita.disabled = true;
        
        cargarCitasCita();
        alert("Cita registrada exitosamente");
      } else {
        const error = await res.json();
        alert("Error: " + (error.error || error.message || "Error desconocido"));
      }
    }
  } catch (err) {
    console.error("Error:", err);
    
    // guarda temporalmente si hay error de conexion
    if (confirm("Error de conexión. ¿Desea guardar la cita localmente para sincronizar después?")) {
      guardarCitaTemporalmente(datos);
    }
  }
}

// guarda temporalmente offline
function guardarCitaTemporalmente(datos) {
  const citasTemporales = JSON.parse(localStorage.getItem('citasTemporales') || '[]');
  citasTemporales.push({
    ...datos,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('citasTemporales', JSON.stringify(citasTemporales));
  alert("Cita guardada temporalmente. Se sincronizará cuando se restablezca la conexión.");
}

async function sincronizarCitasTemporales() {
  const citasTemporales = JSON.parse(localStorage.getItem('citasTemporales') || '[]');
  
  if (citasTemporales.length === 0) return;
  
  let sincronizadas = 0;
  
  for (let i = 0; i < citasTemporales.length; i++) {
    const cita = citasTemporales[i];
    
    try {
      const res = await fetch(API_URL_CITAS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cita)
      });
      
      if (res.ok) {
        citasTemporales.splice(i, 1);
        i--;
        sincronizadas++;
      }
    } catch (error) {
      console.error("Error al sincronizar cita:", error);
    }
  }
  
  localStorage.setItem('citasTemporales', JSON.stringify(citasTemporales));
  
  if (sincronizadas > 0) {
    alert(`${sincronizadas} cita(s) sincronizada(s) exitosamente`);
    cargarCitasCita();
  }
}


// Obtener y mostrar citas
async function cargarCitasCita() {
  const tbody = document.getElementById("citasBodyCitas");
  if (!tbody) {
    console.error("No se encontró el elemento con ID 'citasBodyCitas' en el HTML");
    return;
  }

  try {
    const res = await fetch(API_URL_CITAS);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const citas = await res.json();
    
    if (Array.isArray(citas)) {
      renderCitas(citas);
    } else {
      console.error("La respuesta no es un array:", citas);
      alert("Error: El servidor no devolvió un array de citas");
    }
  } catch (error) {
    console.error("Error al cargar citas:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="no-orders">Error al cargar citas: ${error.message}</td>
      </tr>
    `;
  }
}

// Buscar cita por ID
async function buscarCitaPorId() {
  const inputBuscarCita = document.getElementById("buscarIdCita");
  const id = inputBuscarCita.value.trim();

  if (!id) {
    alert("Ingrese un ID válido");
    return;
  }

  try {
    const res = await fetch(`${API_URL_CITAS}/${id}`);
    
    if (res.ok) {
      const respuesta = await res.json();
      
      let cita;
      if (Array.isArray(respuesta) && respuesta.length > 0) {
        cita = respuesta[0];
      } else if (respuesta && typeof respuesta === 'object') {
        cita = respuesta;
      }
      
      if (cita && (cita.cliente_id || cita.fecha_cita)) {
        renderCitas([cita]);
        inputBuscarCita.value = '';
      } else {
        console.error("No se pudo extraer cita válida de:", respuesta);
        alert("Cita no encontrada o datos incompletos");
      }
    } else if (res.status === 404) {
      alert("Cita no encontrada");
    } else {
      const error = await res.json();
      alert("Error: " + (error.error || error.message || "Error desconocido"));
    }
  } catch (err) {
    console.error("Error al buscar cita:", err);
    alert("Error al buscar cita. Verifica la conexión con el servidor.");
  }
}

// Cargar clientes en el select
async function cargarClientesEnSelectBuscar() {
  const selectCliente = document.getElementById("buscarClienteIdCita");
  
  try {
    const res = await fetch(`${API_URL_CLIENTES}`);
    
    if (res.ok) {
      const clientes = await res.json();
      
      if (Array.isArray(clientes)) {
        clientes.forEach(cliente => {
          const option = document.createElement("option");
          option.value = cliente.id;
          option.textContent = `${cliente.nombre} ${cliente.apellido}`;
          selectCliente.appendChild(option);
        });
      }
    }
  } catch (err) {
    console.error("Error al cargar clientes:", err);
  }
}

// Cargar mecánicos en el select
async function cargarMecanicosEnSelectBuscar() {
  const selectMecanico = document.getElementById("buscarMecanicoIdCita");
  
  try {
    const res = await fetch(`${API_URL_USUARIOS}`); 
    
    if (res.ok) {
      const usuarios = await res.json();
      
      if (Array.isArray(usuarios)) {
        const mecanicos = usuarios.filter(u => 
          (u.rol === 'mecanico') && 
          u.estado === 'activo'
        );
        
        mecanicos.forEach(mecanico => {
          const option = document.createElement("option");
          option.value = mecanico.id;
          option.textContent = `${mecanico.nombre} ${mecanico.apellido}`;
          selectMecanico.appendChild(option);
        });
      }
    }
  } catch (err) {
    console.error("Error al cargar mecánicos:", err);
  }
}

// Buscar citas por cliente
async function buscarCitasPorCliente() {
  const selectClienteCita = document.getElementById("buscarClienteIdCita");
  const clienteIdCita = selectClienteCita.value.trim();

  if (!clienteIdCita) {
    alert("Seleccione un cliente válido");
    return;
  }

  try {
    const res = await fetch(`${API_URL_CITAS}/cliente/${clienteIdCita}`);
    
    if (res.ok) {
      const citas = await res.json();
      
      if (Array.isArray(citas) && citas.length > 0) {
        renderCitas(citas);
        selectClienteCita.value = '';
      } else {
        alert("No se encontraron citas para este cliente");
      }
    } else {
      const error = await res.json();
      alert("Error: " + (error.error || error.message || "Error desconocido"));
    }
  } catch (err) {
    console.error("Error al buscar citas por cliente:", err);
    alert("Error al buscar citas. Verifica la conexión con el servidor.");
  }
}

// Buscar citas por mecánico
async function buscarCitasPorMecanico() {
  const selectMecanicoCita = document.getElementById("buscarMecanicoIdCita");
  const mecanicoIdCita = selectMecanicoCita.value.trim();

  if (!mecanicoIdCita) {
    alert("Seleccione un mecánico válido");
    return;
  }

  try {
    const res = await fetch(`${API_URL_CITAS}/mecanico/${mecanicoIdCita}`);
    
    if (res.ok) {
      const citas = await res.json();
      
      if (Array.isArray(citas) && citas.length > 0) {
        renderCitas(citas);
        selectMecanicoCita.value = '';
      } else {
        alert("No se encontraron citas para este mecánico");
      }
    } else {
      const error = await res.json();
      alert("Error: " + (error.error || error.message || "Error desconocido"));
    }
  } catch (err) {
    console.error("Error al buscar citas por mecánico:", err);
    alert("Error al buscar citas. Verifica la conexión con el servidor.");
  }
}

// Buscar citas por fecha
async function buscarCitasPorFecha() {
  const inputFechaCita = document.getElementById("buscarFechaCita");
  const fechaCita = inputFechaCita.value;

  if (!fechaCita) {
    alert("Seleccione una fecha válida");
    return;
  }

  try {
    const res = await fetch(`${API_URL_CITAS}/fecha/${fechaCita}`);
    
    if (res.ok) {
      const citas = await res.json();
      
      if (Array.isArray(citas) && citas.length > 0) {
        renderCitas(citas);
        inputFechaCita.value = '';
      } else {
        alert("No se encontraron citas para esta fecha");
      }
    } else {
      const error = await res.json();
      alert("Error: " + (error.error || error.message || "Error desconocido"));
    }
  } catch (err) {
    console.error("Error al buscar citas por fecha:", err);
    alert("Error al buscar citas. Verifica la conexión con el servidor.");
  }
}

// Buscar citas por estado
async function buscarCitasPorEstado() {
  const selectEstadoCita = document.getElementById("buscarEstadoCita");
  const estadoCita = selectEstadoCita.value;

  if (!estadoCita) {
    alert("Seleccione un estado válido");
    return;
  }

  try {
    const res = await fetch(`${API_URL_CITAS}/estado/${estadoCita}`);
    
    if (res.ok) {
      const citas = await res.json();
      
      if (Array.isArray(citas) && citas.length > 0) {
        renderCitas(citas);
      } else {
        alert("No se encontraron citas con este estado");
      }
    } else {
      const error = await res.json();
      alert("Error: " + (error.error || error.message || "Error desconocido"));
    }
  } catch (err) {
    console.error("Error al buscar citas por estado:", err);
    alert("Error al buscar citas. Verifica la conexión con el servidor.");
  }
}

// Editar cita
async function editarCita(id) {
  try {
    const res = await fetch(`${API_URL_CITAS}/${id}`);
    if (res.ok) {
      const respuesta = await res.json();
      const cita = Array.isArray(respuesta) ? respuesta[0] : respuesta;

      window.citaMecanicoAnterior = cita.mecanico_id;
      
      // Llenar formulario con datos de la cita
      document.getElementById("clienteIdCita").value = cita.cliente_id || '';
      
      // Cargar vehículos del cliente y luego seleccionar el vehículo
      await cargarVehiculosDeCliente();
      document.getElementById("vehiculoIdCita").value = cita.vehiculo_id || '';
      
      document.getElementById("mecanicoIdCita").value = cita.mecanico_id || '';
      
      // Formatear fecha para input datetime-local
      if (cita.fecha_cita) {
        const fecha = new Date(cita.fecha_cita);
        const fechaFormateada = fecha.toISOString().slice(0, 16);
        document.getElementById("fechaCita").value = fechaFormateada;
      }
      
      document.getElementById("duracionMinutosCita").value = cita.duracion_minutos || '';
      document.getElementById("motivoCita").value = cita.motivo || '';
      document.getElementById("estadoCita").value = cita.estado || '';
      document.getElementById("observacionesCita").value = cita.observaciones || '';
      
      // Cambiar a modo edición
      window.citaEnEdicion = id;
      document.querySelector('button[type="submit"]').textContent = 'Actualizar';
      document.querySelector('.register-container h2').textContent = 'Editar Cita';
      
      // Mostrar botón cancelar si existe
      const cancelBtnCita = document.getElementById("cancelarBtnCita");
      if (cancelBtnCita) cancelBtnCita.style.display = 'inline-block';
      
      // Scroll al formulario
      document.getElementById('citaForm').scrollIntoView({ behavior: 'smooth' });
    }
  } catch (err) {
    console.error("Error al cargar cita para editar:", err);
    alert('Error al cargar cita para editar');
  }
}

// Cambiar estado de cita
async function cambiarEstadoCita(id, nuevoEstado) {
  const observaciones = prompt("Observaciones (opcional):");
  
  try {
    const res = await fetch(`${API_URL_CITAS}/estado/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        nuevo_estado: nuevoEstado,
        observaciones: observaciones 
      }),
    });

    if (res.ok) {
      alert("Estado de la cita actualizado exitosamente");
      cargarCitasCita();
    } else {
      const error = await res.json();
      alert("Error: " + (error.error || error.message || "Error desconocido"));
    }
  } catch (err) {
    console.error("Error al cambiar estado:", err);
    alert("Error al cambiar estado de la cita");
  }
}


// Cancelar edición
function cancelarEdicionCitas() {
  window.citaEnEdicion = null;
  
  document.getElementById("citaForm").reset();
  document.querySelector('button[type="submit"]').textContent = 'Registrar';
  document.querySelector('.register-container h2').textContent = 'Registro de Citas';

  const vehiculoSelect = document.getElementById("vehiculoIdCita");
  if (vehiculoSelect) {
    vehiculoSelect.disabled = true;
    vehiculoSelect.innerHTML = '<option value="">Primero seleccione un cliente</option>';
  }

  const cancelBtnCita = document.getElementById("cancelarBtnCita");
  if (cancelBtnCita) cancelBtnCita.style.display = 'none';
}

// Eliminar cita
async function eliminarCita(id) {
  if (!confirm("¿Seguro que quieres eliminar esta cita?")) return;

  try {
    const res = await fetch(`${API_URL_CITAS}/${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("Cita eliminada exitosamente");
      cargarCitasCita();
    } else {
      const error = await res.json();
      alert("Error al eliminar cita: " + (error.error || error.message));
    }
  } catch (err) {
    console.error("Error al eliminar:", err);
    alert("Error al eliminar cita");
  }
}

// Renderizar citas en la tabla
function renderCitas(citas) {
  const tbody = document.getElementById("citasBodyCitas");
  
  if (!tbody) {
    console.error("No se encontró el elemento con ID 'citasBodyCitas'");
    return;
  }
  
  if (!citas || citas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="no-orders">No hay citas registradas</td></tr>`;
    return;
  }

  let html = "";
  citas.forEach(cita => {
    const citaId = cita.id || 'Sin ID';
    
    let fechaFormateada = 'N/A';
    if (cita.fecha_cita) {
      const fecha = new Date(cita.fecha_cita);
      fechaFormateada = fecha.toLocaleString('es-GT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    const nombreCliente = cita.nombre_cliente ? `${cita.cliente_id} - ${cita.nombre_cliente}` : `${cita.cliente_id}`;
    const vehiculoInfo = cita.vehiculo_info || `${cita.vehiculo_id}`;
    const nombreMecanico = cita.mecanico_id && cita.nombre_mecanico && cita.nombre_mecanico !== 'Sin asignar'
      ? `${cita.mecanico_id} - ${cita.nombre_mecanico}`
      : (cita.nombre_mecanico || 'Sin asignar');
    
    html += `
      <tr>
        <td data-label="ID">${citaId}</td>
        <td data-label="Cliente">${nombreCliente}</td>
        <td data-label="Vehículo">${vehiculoInfo}</td>
        <td data-label="Mecánico">${nombreMecanico}</td>
        <td data-label="Fecha">${fechaFormateada}</td>
        <td data-label="Motivo">${cita.motivo || 'N/A'}</td>
        <td data-label="Estado">
          <span class="status ${cita.estado}">${traducirEstado(cita.estado)}</span>
        </td>
        <td data-label="Observaciones">${cita.observaciones || '-'}</td>
        </td>
        <td data-label="Acciones">
          <button class="btn-edit" onclick="editarCita(${citaId})">Editar</button>
          <button class="btn-delete" onclick="eliminarCita(${citaId})">Eliminar</button>
          ${cita.estado === 'programada' ? `<button class="btn-status" onclick="cambiarEstadoCita(${citaId}, 'confirmada')">Confirmar</button>` : ''}
          ${cita.estado === 'confirmada' || cita.estado === 'programada' ? `<button class="btn-status" onclick="cambiarEstadoCita(${citaId}, 'en_proceso')">Iniciar</button>` : ''}
          ${cita.estado === 'en_proceso' ? `<button class="btn-status" onclick="cambiarEstadoCita(${citaId}, 'completada')">Completar</button>` : ''}
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// Función auxiliar para traducir estados
function traducirEstado(estado) {
  const traducciones = {
    'programada': 'Programada',
    'confirmada': 'Confirmada',
    'en_proceso': 'En Proceso',
    'completada': 'Completada',
    'cancelada': 'Cancelada'
  };
  return traducciones[estado] || estado;
}

// Función para mostrar todas las citas
function mostrarTodasLasCitas() {
  cargarCitasCita();
}

// Cargar clientes para el selector
async function cargarClientesParaSelect() {
  try {
    const res = await fetch(API_CONFIG.clientes || `${API_CONFIG.usuarios.replace('/usuarios', '/clientes')}`);
    
    if (!res.ok) {
      console.error("Error al cargar clientes");
      return;
    }
    
    const clientes = await res.json();
    const select = document.getElementById("clienteIdCita");
    
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccionar Cliente *</option>';
    
    if (Array.isArray(clientes)) {
      clientes.forEach(cliente => {
        const option = document.createElement('option');
        option.value = cliente.id;
        option.textContent = `${cliente.nombre} ${cliente.apellido} - ${cliente.telefono || 'Sin teléfono'}`;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error al cargar clientes:", error);
  }
}

// Cargar vehículos del cliente seleccionado
async function cargarVehiculosDeCliente() {
  const clienteIdCita = document.getElementById("clienteIdCita").value;
  const vehiculoSelectCita = document.getElementById("vehiculoIdCita");
  
  if (!vehiculoSelectCita) return;
  
  vehiculoSelectCita.innerHTML = '<option value="">Seleccionar Vehículo *</option>';
  
  if (!clienteIdCita) {
    vehiculoSelectCita.disabled = true;
    return;
  }
  
  vehiculoSelectCita.disabled = false;
  
  try {
    const res = await fetch(`${API_CONFIG.vehiculos || API_CONFIG.clientes.replace('/clientes', '/vehiculos')}/cliente/${clienteIdCita}`);

    if (!res.ok) {
      console.error("Error al cargar vehículos");
      return;
    }
    
    const vehiculos = await res.json();
    
    if (Array.isArray(vehiculos) && vehiculos.length > 0) {
      vehiculos.forEach(vehiculo => {
        const option = document.createElement('option');
        option.value = vehiculo.id;
        option.textContent = `${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.anioo} - ${vehiculo.placa}`;
        vehiculoSelectCita.appendChild(option);
      });
    } else {
      vehiculoSelectCita.innerHTML = '<option value="">Este cliente no tiene vehículos registrados</option>';
    }
  } catch (error) {
    console.error("Error al cargar vehículos:", error);
    vehiculoSelectCita.innerHTML = '<option value="">Error al cargar vehículos</option>';
  }
}

// Cargar mecánicos para el selector
async function cargarMecanicosParaSelect() {
  try {
    const res = await fetch(API_CONFIG.usuarios);
    
    if (!res.ok) {
      console.error("Error al cargar usuarios");
      return;
    }
    
    const usuarios = await res.json();
    const select = document.getElementById("mecanicoIdCita");
    
    if (!select) return;
    
    select.innerHTML = '<option value="">Sin Mecánico Asignado (Opcional)</option>';
    
    if (Array.isArray(usuarios)) {
      const mecanicos = usuarios.filter(u => 
        (u.rol === 'mecanico') && 
        u.estado === 'activo'
      );
      
      mecanicos.forEach(mecanico => {
        const option = document.createElement('option');
        option.value = mecanico.id;
        option.textContent = `${mecanico.nombre} ${mecanico.apellido} - ${mecanico.rol}`;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error al cargar mecánicos:", error);
  }
}

// Notificar al mecánico cuando se le asigna una cita
async function notificarMecanicoAsignacion(citaId, mecanicoId) {
  try {
    // Obtener información completa de la cita
    const resCita = await fetch(`${API_URL_CITAS}/${citaId}`);
    if (!resCita.ok) {
      console.error('No se pudo obtener información de la cita');
      return;
    }
    
    const citaData = await resCita.json();
    const cita = Array.isArray(citaData) ? citaData[0] : citaData;
    
    // Formatear fecha de la cita
    let fechaFormateada = 'Ver detalles';
    if (cita.fecha_cita) {
      const fecha = new Date(cita.fecha_cita);
      fechaFormateada = fecha.toLocaleString('es-GT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Crear notificación
    const notificacion = {
      usuario_id: mecanicoId,
      tipo: 'cita',
      titulo: `Nueva cita asignada #${cita.id}`,
      mensaje: `Se le ha asignado una nueva cita para el ${fechaFormateada}. Cliente: ${cita.nombre_cliente || 'Ver detalles'}. Vehículo: ${cita.vehiculo_info || 'Ver detalles'}. Motivo: ${cita.motivo || 'No especificado'}.`,
      fecha_programada: `${cita.fecha_cita}`
    };
    
    const res = await fetch(API_CONFIG.notificaciones, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(notificacion)
    });
    
    if (!res.ok) {
      console.error('Error al crear notificación para mecánico');
    } else {
    }
  } catch (error) {
    console.error('Error al notificar mecánico:', error);
  }
}

// Notificar cuando se reasigna un mecánico a una cita existente
async function notificarMecanicoCambioCita(citaId, mecanicoId) {
  try {
    const resCita = await fetch(`${API_URL_CITAS}/${citaId}`);
    if (!resCita.ok) return;
    
    const citaData = await resCita.json();
    const cita = Array.isArray(citaData) ? citaData[0] : citaData;
    
    let fechaFormateada = 'Ver detalles';
    if (cita.fecha_cita) {
      const fecha = new Date(cita.fecha_cita);
      fechaFormateada = fecha.toLocaleString('es-GT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    const notificacion = {
      usuario_id: mecanicoId,
      tipo: 'cita',
      titulo: `Cita reasignada #${cita.id}`,
      mensaje: `Se le ha reasignado una cita programada para el ${fechaFormateada}. Cliente: ${cita.nombre_cliente || 'Ver detalles'}. Vehículo: ${cita.vehiculo_info || 'Ver detalles'}.`,
      fecha_programada: `${cita.fecha_cita}`
    };
    
    const res = await fetch(API_CONFIG.notificaciones, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(notificacion)
    });
    
    if (!res.ok) {
      console.error('Error al crear notificación de reasignación');
    } else {
    }
  } catch (error) {
    console.error('Error al notificar cambio:', error);
  }
}

// EXPORTAR FUNCIONES GLOBALMENTE
window.editarCita = editarCita;
window.eliminarCita = eliminarCita;
window.buscarCitaPorId = buscarCitaPorId;
window.buscarCitasPorCliente = buscarCitasPorCliente;
window.buscarCitasPorMecanico = buscarCitasPorMecanico;
window.buscarCitasPorFecha = buscarCitasPorFecha;
window.buscarCitasPorEstado = buscarCitasPorEstado;
window.cambiarEstadoCita = cambiarEstadoCita;

window.mostrarTodasLasCitas = mostrarTodasLasCitas;
window.cancelarEdicionCitas = cancelarEdicionCitas;
window.inicializarEventosCitas = inicializarEventosCitas;
window.cargarCitasCita = cargarCitasCita;

window.sincronizarCitasTemporales = sincronizarCitasTemporales;
window.notificarMecanicoAsignacion = notificarMecanicoAsignacion;
window.notificarMecanicoCambioCita = notificarMecanicoCambioCita;