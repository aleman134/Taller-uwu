import pool from "../config/db.js";

const Servicio = {
    getAll: async () => {
        const [results] = await pool.query("CALL sp_servicios_getAll()");
       return results[0];
    },

    getById: async (id) => {
        const [results] = await pool.query("CALL sp_servicios_getById(?)", [id]);
        return results[0][0];
    },

    create: async (servicio) => {
        const { nombre, descripcion, precio_base, tiempo_estimado, categoria, estado } = servicio;
        const [results] = await pool.query("CALL sp_servicios_create(?, ?, ?, ?, ?, ?)", [nombre, descripcion, precio_base, tiempo_estimado, categoria, estado]);
        return results[0][0];
    },

    update: async (id, servicio) => {
        const { nombre, descripcion, precio_base, tiempo_estimado, categoria, estado } = servicio;
        const [results] = await pool.query("CALL sp_servicios_update(?, ?, ?, ?, ?, ?, ?)", [id, nombre, descripcion, precio_base, tiempo_estimado, categoria, estado]);
        return results[0][0];
    },

    delete: async (id) => {
        const [results] = await pool.query("CALL sp_servicios_delete(?)", [id]);
        return results[0][0];
    },

    getActivos: async () => {
        const [results] = await pool.query("CALL sp_servicios_getActivos()");
        return results[0];
    },

    getByCategoria: async (categoria) => {
        const [results] = await pool.query("CALL sp_servicios_getByCategoria(?)", [categoria]);
        return results[0];
    },

    getCategorias: async () => {
        const [results] = await pool.query("CALL sp_servicios_getCategorias()");
        return results[0];
    },

    getEstadisticas: async () => {
        const [results] = await pool.query("CALL sp_servicios_estadisticas()");
        return {
            generales: results[0][0],
            por_categoria: results[1]
        };
    },

    getRangoPrecio: async (precio_min, precio_max) => {
        const [results] = await pool.query("CALL sp_servicios_getRangoPrecio(?, ?)", [precio_min, precio_max]);
        return results[0];
    }
};

export default Servicio;