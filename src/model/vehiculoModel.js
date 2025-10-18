import pool from "../config/db.js";

const Vehiculo = {
    getAll: async () => {
        try {
            const [results] = await pool.query("CALL sp_vehiculos_getAll()");
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const [results] = await pool.query("CALL sp_vehiculos_getById(?)", [id]);
            return results[0][0];
        } catch (error) {
            throw error;
        }
    },

    getByClienteId: async (cliente_id) => {
        try {
            const [results] = await pool.query("CALL sp_vehiculos_getByCliente(?)", [cliente_id]);
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    getByPlaca: async (placa) => {
        try {
            const [results] = await pool.query("CALL sp_vehiculos_getByPlaca(?)", [placa]);
            return results[0][0];
        } catch (error) {
            throw error;
        }
    },

    getEstadisticaVehiculos: async () => {
        try {
            const [results] = await pool.query("CALL sp_vehiculos_estadisticas()");
            if (!results || results.length < 2) {   
                throw new Error("Resultados inesperados del SP");
            }

            const estadisticasGenerales = results[0][0];
            const cantidadPorMarca = results[1];

            return {
                estadisticas_generales: estadisticasGenerales,
                cantidad_marca_comun: cantidadPorMarca
            };
        } catch (error) {
            console.error("Error al obtener estadísticas de vehículos:", error.message);
            throw error;
        }
    },

    create: async (vehiculo) => {
        const { cliente_id, marca, modelo, anioo, placa, color, numero_motor, numero_chasis, kilometraje } = vehiculo;
        try {
            const [results] = await pool.query("CALL sp_vehiculos_create(?, ?, ?, ?, ?, ?, ?, ?, ?)", [cliente_id, marca, modelo, anioo, placa, color, numero_motor, numero_chasis, kilometraje]);
            return results[0][0];
        } catch (error) {
            throw error;
        }
    },

    update: async (id, vehiculo) => {
        const { marca, modelo, color, kilometraje } = vehiculo;
        try {
            const [results] = await pool.query("CALL sp_vehiculos_update(?, ?, ?, ?, ?)", [id, marca, modelo, color, kilometraje]);
            return results[0][0];
        } catch (error) {
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const [results] = await pool.query("CALL sp_vehiculos_delete(?)", [id]);
            return results[0][0];
        } catch (error) {
            throw error;
        }
    }
};

export default Vehiculo;