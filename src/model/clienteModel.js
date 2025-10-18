import pool from "../config/db.js";

const Cliente = {
    getAll: async () => {
        try {
            const [results] = await pool.query("CALL sp_clientes_getAll()");           
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const [results] = await pool.query("CALL sp_clientes_getById(?)", [id]);
            return results[0][0];
        } catch (error) {
            throw error;
        }
    },

    create: async (cliente) => {
        try {
            const { nombre, apellido, dpi, telefono, correo, direccion } = cliente;
            const [results] = await pool.query("CALL sp_clientes_create(?, ?, ?, ?, ?, ?)", [nombre, apellido, dpi, telefono, correo, direccion]);
            return results[0][0];
        } catch (error) {
            throw error;
        }
    },

    update: async (id, cliente) => {
        try {
            const { nombre, apellido, dpi, telefono, correo, direccion } = cliente;
            const [results] = await pool.query("CALL sp_clientes_update(?, ?, ?, ?, ?, ?, ?)", [id, nombre, apellido, dpi, telefono, correo, direccion]);
            return results[0][0];
        } catch (error) {
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const [results] = await pool.query("CALL sp_clientes_delete(?)", [id]);
            return results[0][0];
        } catch (error) {
            throw error;
        }
    }
};

export default Cliente;