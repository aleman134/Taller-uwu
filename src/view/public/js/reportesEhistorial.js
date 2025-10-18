const API_URL_SERVICIOS_REALIZADOS = API_CONFIG.serviciosRealizados;
const API_URL_REPUESTOS = API_CONFIG.repuestosUtilizados;
const API_URL_HISTORIAL = API_CONFIG.historial;

// ========================== REPORTES ==========================

// Estadísticas de vehículos
async function getEstadisticasVehiculos() {
  try {
    const res = await fetch(`${API_URL_VEHICULOS}/estadisticas/estadisticas`);
    if (!res.ok) throw new Error("Error al obtener estadísticas de vehículos");
    return await res.json();
  } catch (err) {
    console.error("getEstadisticasVehiculos:", err);
    return null;
  }
}

// Estadísticas de órdenes de trabajo
async function getEstadisticasOrdenes() {
  try {
    const res = await fetch(`${API_URL_ORDENES}/estadisticas/estadisticas`);
    if (!res.ok) throw new Error("Error al obtener estadísticas de órdenes");
    return await res.json();
  } catch (err) {
    console.error("getEstadisticasOrdenes:", err);
    return null;
  }
}

// Resumen por período
async function getResumenPeriodo(fecha_inicio, fecha_fin) {
  try {
    const res = await fetch(`${API_URL_ORDENES}/resumen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fecha_inicio, fecha_fin })
    });
    if (!res.ok) throw new Error("Error al obtener resumen por periodo");
    return await res.json();
  } catch (err) {
    console.error("getResumenPeriodo:", err);
    return null;
  }
}

// Estadísticas de servicios
async function getEstadisticasServicios() {
  try {
    const res = await fetch(`${API_URL_SERVICIOS}/estadisticas/estadisticas`);
    if (!res.ok) throw new Error("Error al obtener estadísticas de servicios (API_SERVICIOS)");
    return await res.json();
  } catch (err) {
    console.error("getEstadisticasServicios:", err);
    return null;
  }
}

// Estadísticas de servicios realizados
async function getEstadisticasServiciosRealizados() {
  try {
    const res = await fetch(`${API_URL_SERVICIOS_REALIZADOS}/estadisticas/estadisticas`);
    if (!res.ok) throw new Error("Error al obtener estadísticas de servicios realizados");
    return await res.json();
  } catch (err) {
    console.error("getEstadisticasServiciosRealizados:", err);
    return null;
  }
}

async function getEstadisticasRepuestos(fecha_inicio = null, fecha_fin = null) {
  try {
    const params = new URLSearchParams();
    if (fecha_inicio) params.append("fecha_inicio", fecha_inicio);
    if (fecha_fin) params.append("fecha_fin", fecha_fin);

    const url = `${API_URL_REPUESTOS}/estadisticas/estadisticas?${params.toString()}`;

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) throw new Error("Error al obtener estadísticas de repuestos");
    const data = await res.json();
    
    // Convertir objeto a array si es necesario
    if (data && !Array.isArray(data)) {
      return [data];
    }
    
    return data;
  } catch (err) {
    console.error("getEstadisticasRepuestos:", err);
    return null;
  }
}

// ========================== HISTORIAL ==========================

// Historial por vehículo 
async function getHistorialPorVehiculo(vehiculo_id) {
  try {
    const res = await fetch(`${API_URL_HISTORIAL}/${vehiculo_id}`);
    if (!res.ok) throw new Error("Error al obtener historial por vehículo");
    return await res.json();
  } catch (err) {
    console.error("getHistorialPorVehiculo:", err);
    return null;
  }
}

// Próximos mantenimientos
async function getProximosMantenimientos() {
  try {
    const res = await fetch(`${API_URL_HISTORIAL}/proximos/proximos`);
    if (!res.ok) throw new Error("Error al obtener próximos mantenimientos");
    return await res.json();
  } catch (err) {
    console.error("getProximosMantenimientos:", err);
    return null;
  }
}

// Servicios realizados por orden
async function getServiciosRealizadosPorOrden(orden_trabajo_id) {
  try {
    const res = await fetch(`${API_URL_SERVICIOS_REALIZADOS}/orden/${orden_trabajo_id}`);
    if (!res.ok) throw new Error("Error al obtener servicios realizados por orden");
    return await res.json();
  } catch (err) {
    console.error("getServiciosRealizadosPorOrden:", err);
    return null;
  }
}

// Repuestos utilizados por orden 
async function getRepuestosPorOrden(orden_trabajo_id) {
  try {
    const res = await fetch(`${API_URL_REPUESTOS}/orden/${orden_trabajo_id}`);
    if (!res.ok) throw new Error("Error al obtener repuestos por orden");
    return await res.json();
  } catch (err) {
    console.error("getRepuestosPorOrden:", err);
    return null;
  }
}

async function getHistorialOrdenPorId(orden_trabajo_id) {
  try {
    const res = await fetch(`${API_URL_ORDENES}/historial/${orden_trabajo_id}`);
    if (!res.ok) throw new Error("Error al obtener historial por orden");
    return await res.json();
  } catch (err) {
    console.error("getHistorialOrdenPorId:", err);
    return null;
  }
}

window.getEstadisticasVehiculos = getEstadisticasVehiculos;
window.getEstadisticasOrdenes = getEstadisticasOrdenes;
window.getResumenPeriodo = getResumenPeriodo;
window.getEstadisticasServicios = getEstadisticasServicios;
window.getEstadisticasServiciosRealizados = getEstadisticasServiciosRealizados;
window.getEstadisticasRepuestos = getEstadisticasRepuestos;

window.getHistorialPorVehiculo = getHistorialPorVehiculo;
window.getProximosMantenimientos = getProximosMantenimientos;
window.getServiciosRealizadosPorOrden = getServiciosRealizadosPorOrden;
window.getRepuestosPorOrden = getRepuestosPorOrden;
window.getHistorialOrdenPorId = getHistorialOrdenPorId;
