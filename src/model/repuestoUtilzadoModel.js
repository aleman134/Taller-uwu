import pool from "../config/db.js";

const RespuestoUtilizado = {
    getAll: async () => {
        const [results] = await pool.query("CALL sp_repuestos_utilizados_getAll()");
        return results[0];
    },

    getByOrden: async (orden_trabajo_id) => {
        const [results] = await pool.query("CALL sp_repuestos_utilizados_getByOrden(?)", [orden_trabajo_id]);
        return results[0];
    },


    getById: async (id) => {
    const [results] = await pool.query("CALL sp_repuestos_utilizados_getById(?)", [id]);
    return results[0];
    },


    create: async (repuestoUtilizado) => {
        const { orden_trabajo_id, nombre_repuesto, descripcion, cantidad, costo_cliente, proveedor, observaciones } = repuestoUtilizado;
        const [result] = await pool.query("CALL sp_repuestos_utilizados_create(?, ?, ?, ?, ?, ?, ?)", [orden_trabajo_id, nombre_repuesto, descripcion, cantidad, costo_cliente, proveedor, observaciones]);
        return result[0][0];
    },

    getEstadisticas: async (fecha_inicio = null, fecha_fin = null) => {
        const [results] = await pool.query("CALL sp_repuestos_utilizados_estadisticas(?, ?)", [fecha_inicio, fecha_fin]);

        return results[0] || [];
    },

    delete: async (id) => {
        const [result] = await pool.query("CALL sp_repuestos_utilizados_delete(?)", [id]);

        return result[0][0];
        
    }
};

export default RespuestoUtilizado;