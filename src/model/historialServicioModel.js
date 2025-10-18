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