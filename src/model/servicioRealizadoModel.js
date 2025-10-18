import pool from "../config/db.js";

const ServicioRealizado = {
    getAll: async () => {
        const [results] = await pool.query("CALL sp_servicios_realizados_getAll()");
        return results[0];
    },

    getByOrden: async (orden_trabajo_id) => {
        const [results] = await pool.query("CALL sp_servicios_realizados_getByOrden(?)", [orden_trabajo_id]);
        return results[0];
    },

    create: async (servicioRealizado) => {
        const { orden_trabajo_id, servicio_id, descripcion_trabajo, costo, tiempo_empleado } = servicioRealizado;
        const [results] = await pool.query("CALL sp_servicios_realizados_create(?, ?, ?, ?, ?)", [orden_trabajo_id, servicio_id, descripcion_trabajo, costo, tiempo_empleado]);
        return results[0][0];
    },

    getById: async (id) => {
        const [results] = await pool.query("CALL sp_servicios_realizados_getById(?)", [id]);
        return results[0];
    },

    getEstadisticas: async (fecha_inicio = null, fecha_fin = null) => {
        const [results] = await pool.query("CALL sp_servicios_realizados_estadisticas(?, ?)", [fecha_inicio, fecha_fin]);
        return results[0];
    },

    update: async (id, servicioRealizado) => {
        const { descripcion_trabajo, costo, tiempo_empleado } = servicioRealizado;
        const [results] = await pool.query("CALL sp_servicios_realizados_update(?, ?, ?, ?)", [id, descripcion_trabajo, costo, tiempo_empleado]);
        return results[0][0];
    },

    delete: async (id) => {
        const [results] = await pool.query("CALL sp_servicios_realizados_delete(?)", [id]);
        return results[0][0];
    }

};

export default ServicioRealizado;