import pool from "../config/db.js";

const Notificaciones = {
    create: async (notificacion) => {
        try {
            const { usuario_id, tipo, titulo, mensaje, fecha_programada } = notificacion;
            const [results] = await pool.query("CALL sp_notificaciones_create(?, ?, ?, ?, ?)", [usuario_id, tipo, titulo, mensaje, fecha_programada]);
            return results[0][0];
        } catch (error) {
            throw error;
        }
    },

    getByUsuario: async (usuario_id, solo_no_leidas = false) => {
        try{
            const [results] = await pool.query("CALL sp_notificaciones_getByUsuario(?, ?)", [usuario_id, solo_no_leidas]);
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    marcarLeida: async (id) => {
        try {
            const [results] = await pool.query("CALL sp_notificaciones_marcarLeida(?)", [id]);
            return results[0][0];
        } catch (error) {
            throw error;
        }
    },

    getPendientes: async () => {
        try {
            const [results] = await pool.query("CALL sp_notificaciones_pendientes()");
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    limpiarAntiguas: async (dias_antiguedad) => {
        try {
            const [results] = await pool.query("CALL sp_limpiar_notificaciones_antiguas(?)", [dias_antiguedad]);
            return results[0][0];
        } catch (error) {
            throw error;
        }
    },

    getAll: async () => {
        try {
            const [results] = await pool.query("CALL sp_notificaciones_getAll()");
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    getByTipo: async (tipo) => {
        try {
            const [results] = await pool.query("CALL sp_notificaciones_getByTipo(?)", [tipo]);
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    getLeidas: async () => {
        try {
            const [results] = await pool.query("CALL sp_notificaciones_getLeidas()");
            return results[0];
        } catch (error) {
            throw error;
        }
    },
    
    marcarVariasLeidas: async (usuario_id) => {
        try {
            const [results] = await pool.query("CALL sp_notificaciones_marcarVariasLeidas(?)", [usuario_id]);
            return results[0][0];
        } catch (error) {
            throw error;
        }
    }    
};
export default Notificaciones;