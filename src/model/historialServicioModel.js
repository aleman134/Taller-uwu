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

        create: async (data) => {
        try {
            const [rows] = await db.query(
                `CALL sp_historial_servicios_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    data.vehiculo_id,
                    data.orden_trabajo_id,
                    data.fecha_servicio,
                    data.kilometraje,
                    data.diagnostico_inicial || null,
                    data.reparaciones_realizadas || null,
                    data.recomendaciones_futuras || null,
                    data.proximo_mantenimiento_km || null,
                    data.fecha_proximo_mantenimiento || null,
                    data.observaciones || null
                ]
            );
            return rows[0][0];
        } catch (error) {
            console.error('Error en create:', error);
            throw error;
        }
    },

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