import pool from "../config/db.js"

const OrdenTrabajo = {
    getAll: async () => {
        try {
            const [results] = await pool.query("CALL sp_ordenes_trabajo_getAll()");
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const [results] = await pool.query("CALL sp_ordenes_trabajo_getById(?)", [id]);
            return results[0][0];
        } catch (error) {
            throw error;
        }
    },

    getByMecanico: async (mecanico_id) => {
        try {
            const [results] = await pool.query("CALL sp_ordenes_trabajo_getByMecanico(?)", [mecanico_id]);
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    getByCliente: async (cliente_id) => {
        try {
            const [results] = await pool.query("CALL sp_ordenes_trabajo_getByCliente(?)", [cliente_id]);
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    getByEstado: async (estado) => {
        try {
            const [results] = await pool.query("CALL sp_ordenes_trabajo_getByEstado(?)", [estado]);
            return results[0];
        } catch (error) {
            throw error;
        }
    }, 

    create: async (orden) => {
        const { numero_orden, cliente_id, vehiculo_id, mecanico_id, cita_id,
                fecha_estimada_salida, estado, descripcion_inicial, diagnostico,
                observaciones, costo_mano_obra, kilometraje_ingreso } = orden;
        try {
            const [results] = await pool.query("CALL sp_ordenes_trabajo_create(?,?,?,?,?,?,?,?,?,?,?,?)", [numero_orden, cliente_id, vehiculo_id, mecanico_id, cita_id,
                fecha_estimada_salida, estado, descripcion_inicial, diagnostico,
                observaciones, costo_mano_obra, kilometraje_ingreso]);
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    update: async (id, orden) => {
        const { mecanico_id, fecha_estimada_salida, fecha_real_salida, estado, descripcion_inicial, diagnostico, observaciones, costo_mano_obra, kilometraje_ingreso } = orden;
        try {
            const [results] = await pool.query("CALL sp_ordenes_trabajo_update(?,?,?,?,?,?,?,?,?,?)", [id, mecanico_id, fecha_estimada_salida, fecha_real_salida, estado, descripcion_inicial, diagnostico, observaciones, costo_mano_obra, kilometraje_ingreso]);
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    cambiarEstado: async (id, nuevo_estado, observaciones) => {
        try {
            const [results] = await pool.query("CALL sp_ordenes_trabajo_cambiarEstado(?,?,?)", [id, nuevo_estado, observaciones]);
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    updateCostos: async (id, costo_repuestos, costo_mano_obra) => {
        try {
            const [results] = await pool.query("CALL sp_ordenes_trabajo_updateCostos(?,?,?)", [id, costo_repuestos, costo_mano_obra]);
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    vencidas: async () => {
        try {
            const [results] = await pool.query("CALL sp_ordenes_trabajo_vencidas()");
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    proximasVencer: async (dias) => {
        try {
            const [results] = await pool.query("CALL sp_ordenes_trabajo_proximasVencer(?)", [dias]);
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    historial: async (id) => {
        try {
            const [results] = await pool.query("CALL sp_ordenes_trabajo_historial(?)", [id]);
            return results[0]?.[0] || {};
        } catch (error) {
            throw error;
        }
    },

    reporteCompleto: async (id) => {
        try {
            const [results] = await pool.query("CALL sp_reporte_orden_completo(?)", [id]);
            return {
                orden: results[0][0] || null,   // Info básica (1 fila)
                servicios: results[1] || [],    // Servicios realizados
                repuestos: results[2] || []     // Repuestos utilizados
            };
        } catch (error) {
            throw error;
        }
    },

    resumenPeriodo: async (fecha_inicio, fecha_fin) => {
        try {
            const [results] = await pool.query("CALL sp_ordenes_trabajo_resumenPeriodo(?, ?)", [fecha_inicio, fecha_fin]);
            return {
                global: results[0][0] || {},
                porMecanico: results[1] || {},
                topClientes: results[2] || {}
            };
        } catch (error) {
            throw error;
        }
    },

    estadisticas: async () => {
        try {
            const [results] = await pool.query("CALL sp_ordenes_trabajo_estadisticas()");
            return results[0]?.[0] || {};
        } catch (error) {
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const [results] = await pool.query("CALL sp_ordenes_trabajo_delete(?)", [id]);
            return results[0];
        } catch (error) {
            throw error;
        }
    }
};

export default OrdenTrabajo;