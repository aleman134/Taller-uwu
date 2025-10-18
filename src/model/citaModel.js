import pool from "../config/db.js";

const Cita = {
    getAll: async () => {
        try {
            const [results] = await pool.query("CALL sp_citas_getAll()");
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const [results] = await pool.query("CALL sp_citas_getById(?)", [id]);
            return results[0][0];
        } catch (error) {
            throw error;
        }
    },

    getByClienteId: async (cliente_id) => {
        try {
            const [results] = await pool.query("CALL sp_citas_getByCliente(?)", [cliente_id]);
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    getByMecanicoId: async (mecanico_id) => {
        try {
            const [results] = await pool.query("CALL sp_citas_getByMecanico(?)", [mecanico_id]);
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    getByFecha: async (fecha) => {
        try {
            const [results] = await pool.query("CALL sp_citas_getByFecha(?)", [fecha]);
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    getByEstado: async (estado) => {
        try {
            const [results] = await pool.query("CALL sp_citas_getByEstado(?)", [estado]);
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    create: async (cita) => {
        const { cliente_id, vehiculo_id, mecanico_id, fecha_cita, duracion_minutos, motivo, estado, observaciones } = cita;
        try {
            const [results] = await pool.query("CALL sp_citas_create(?, ?, ?, ?, ?, ?, ?, ?)", [cliente_id, vehiculo_id, mecanico_id, fecha_cita, duracion_minutos, motivo, estado, observaciones]);
            return results[0][0];
        } catch (error) {
            throw error;
        }
    },

    update: async (id, cita) => {
        const { cliente_id, vehiculo_id, mecanico_id, fecha_cita, motivo, estado, observaciones } = cita;
        try {
            const [results] = await pool.query("CALL sp_citas_update(?, ?, ?, ?, ?, ?, ?, ?)", [id, cliente_id, vehiculo_id, mecanico_id, fecha_cita, motivo, estado, observaciones]);
            return results[0][0];
        } catch (error) {
            throw error;
        }
    },

    cambiarEstado: async (id, nuevo_estado, observaciones = null) => {
        try {
            const [results] = await pool.query("CALL sp_citas_cambiarEstado(?, ?, ?)", [id, nuevo_estado, observaciones]);
            return results[0][0];
        } catch (error) {
            throw error;
        }
    },

    getEstadisticas: async () => {
        try {
            const [results] = await pool.query("CALL sp_citas_estadisticas()");
            return results?.[0]?.[0] || {};
        } catch (error) {
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const [results] = await pool.query("CALL sp_citas_delete(?)", [id]);
            return results[0][0];
        } catch (error) {
            throw error;
        }
    },

    getMisCitasDelDia: async (mecanico_id) => {
        try {
            const [results] = await pool.query(
                "CALL sp_citas_misCitasDelDia(?)", [mecanico_id]);
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    getMisProximasCitas: async (mecanico_id, dias = 7) => {
        try {
            const [results] = await pool.query(
                "CALL sp_citas_misProximasCitas(?, ?)", [mecanico_id, dias]);
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    getEstadisticasMecanico: async (mecanico_id) => {
        try {
            const [results] = await pool.query(
                "CALL sp_citas_estadisticasMecanico(?)", [mecanico_id]);
            return results?.[0]?.[0] || {};
        } catch (error) {
            throw error;
        }
    },

    verificarDisponibilidad: async (fecha_cita, duracion_minutos, mecanico_id, excluir_cita_id) => {
        try {
            const [results] = await pool.query(
                "CALL sp_citas_verificarDisponibilidad(?, ?, ?, ?)",
                [fecha_cita, duracion_minutos, mecanico_id, excluir_cita_id]
            );
            return results[0][0];
        } catch (error) {
            throw error;
        }
    },

    horariosAlternativos: async (fecha_cita, duracion_minutos, mecanico_id, cantidad) => {
        try {
            const [results] = await pool.query(
                "CALL sp_citas_horariosAlternativos(?, ?, ?, ?)",
                [fecha_cita, duracion_minutos, mecanico_id, cantidad]
            );
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    mecanicosDisponibles: async (fecha_cita, duracion_minutos) => {
        try {
            const [results] = await pool.query(
                "CALL sp_citas_mecanicosDisponibles(?, ?)",
                [fecha_cita, duracion_minutos]
            );
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    calendarioSemanal: async (fecha_inicio, mecanico_id) => {
        try {
            const [results] = await pool.query(
                "CALL sp_citas_calendarioSemanal(?, ?)",
                [fecha_inicio, mecanico_id]
            );
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    slotsDisponibles: async (fecha, mecanico_id) => {
        try {
            const [results] = await pool.query(
                "CALL sp_citas_slotsDisponibles(?, ?)",
                [fecha, mecanico_id]
            );
            return results[0];
        } catch (error) {
            throw error;
        }
    }
};

export default Cita;