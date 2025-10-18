import Servicio from "../model/servicioModel.js";

const servicioController = {
    getAll: async (req, res) => {
        try {
            const servicios = await Servicio.getAll();
            res.json(servicios);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const servicio = await Servicio.getById(req.params.id);
            if(!servicio) {
                return res.status(404).json({ error: "Servicio no encontrado" });
            }
            res.json(servicio);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    create: async (req, res) => {
        try {
            const nuevoServicio = await Servicio.create(req.body);
            res.status(201).json(nuevoServicio);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const updatedServicio = await Servicio.update(req.params.id, req.body);
            res.json(updatedServicio);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const servicio = await Servicio.getById(req.params.id);
            if (!servicio) {
                return res.status(404).json({ error: "Servicio no encontrado" });
            }
            await Servicio.delete(req.params.id);
            res.json({ message: "Servicio eliminado" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getActivos: async (req, res) => {
        try {
            const serviciosActivos = await Servicio.getActivos();
            res.json(serviciosActivos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getByCategoria: async (req, res) => {
        try {
            const servicios = await Servicio.getByCategoria(req.params.categoria);
            res.json(servicios);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getCategorias: async (req, res) => {
        try {
            const categorias = await Servicio.getCategorias();
            res.json(categorias);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getEstadisticas: async (req, res) => {
        try {
            const estadisticas = await Servicio.getEstadisticas();
            res.json(estadisticas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getRangoPrecio: async (req, res) => {
        try {
            const { precio_min, precio_max } = req.params;
            const servicios = await Servicio.getRangoPrecio(precio_min, precio_max);
            res.json(servicios);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

export default servicioController;