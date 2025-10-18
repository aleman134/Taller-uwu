import pool from "../config/db.js";

const HistorialServicios = {
    getByVehiculo: async (vehiculo_id) => {
        try {
            const [results] = await pool.query("CALL sp_historial_servicios_getByVehiculo(?)", [vehiculo_id]);
            return results[0];
        } catch (error) {
            throw error;
        }
    },

<<<<<<< HEAD
=======
    create: async (historial) => {
        try {
            const { vehiculo_id, orden_trabajo_id, fecha_servicio, kilometraje, diagnostico_inicial, reparaciones_realizadas, recomendaciones_futuras, proximo_mantenimiento_km, fecha_proximo_mantenimiento, observaciones } = historial;
            const [results] = await pool.query("CALL sp_historial_servicios_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [vehiculo_id, orden_trabajo_id, fecha_servicio, kilometraje, diagnostico_inicial, reparaciones_realizadas, recomendaciones_futuras, proximo_mantenimiento_km, fecha_proximo_mantenimiento, observaciones]);
            return results[0][0];
        } catch (error) {
            throw error;
        }
    },

>>>>>>> bd88513e37169740585f71e73c6baca4887e03d1
    getProximosMantenimientos: async () => {
        try {
            const [results] = await pool.query("CALL sp_historial_servicios_proximosMantenimiento()");
            return results[0];
        } catch (error) {
            throw error;
        }
    }
};

export default HistorialServicios;