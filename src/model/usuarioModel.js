import pool from "../config/db.js";

const Usuario = {
    getAll: async () => {
        try {
            const [results] = await pool.query("CALL sp_usuarios_getAll()");
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const [results] = await pool.query("CALL sp_usuarios_getById(?)", [id]);
            return results[0]?.[0] || null;
        } catch (error) {
            throw error;
        }
    },

    create: async (usuario) => {
        try {
            const { nombre, apellido, correo, telefono, contrasenia, rol, estado } = usuario;
            const [results] = await pool.query("CALL sp_usuarios_create(?, ?, ?, ?, ?, ?, ?)", [nombre, apellido, correo, telefono, contrasenia, rol, estado]);
            return results[0][0];
        } catch (error) {
            throw error;
        }
    },

    update: async (id, usuario) => {
        try {
            const { nombre, apellido, correo, telefono, contrasenia, rol, estado } = usuario;
        
            // Si contrasenia es null o undefined, enviar string vacío al SP
            const contraseniaParam = contrasenia || '';
        
            const [results] = await pool.query(
                "CALL sp_usuarios_update(?, ?, ?, ?, ?, ?, ?, ?)", 
                [id, nombre, apellido, correo, telefono, contraseniaParam, rol, estado]
            );
            return results[0][0];
        } catch (error) {
        throw error;
        }
    },

    delete: async (id) => {
        try {
            const [results] = await pool.query("CALL sp_usuarios_delete(?)", [id]);
            return results[0][0];
        } catch (error) {
            throw error;
        }
    }
};

export default Usuario;