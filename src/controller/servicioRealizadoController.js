import ServicioRealizado from "../model/servicioRealizadoModel.js";

const servicioRealizadoController = {
    getAll: async (req, res) => {
        try {
            const servicios = await ServicioRealizado.getAll();
            res.json(servicios);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getByOrden: async (req, res) => {
        try {
            const servicio = await ServicioRealizado.getByOrden(req.params.orden_trabajo_id);
            res.json(servicio);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    create: async (req, res) => {
        try {
            const nuevoServicio = await ServicioRealizado.create(req.body);
            res.status(201).json(nuevoServicio);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const servicio = await ServicioRealizado.getById(req.params.id);
            if (!servicio) {
                return res.status(404).json({ error: "Servicio no encontrado" });
            }
            res.json(servicio);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getEstadisticas: async (req, res) => {
        try {
            const { fecha_inicio, fecha_fin } = req.query;
            const estadisticas = await ServicioRealizado.getEstadisticas(fecha_inicio, fecha_fin);
            res.json(estadisticas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const servicio = await ServicioRealizado.getById(req.params.id);
            if (!servicio) {
                return res.status(404).json({ error: "Servicio no encontrado" });
            }
            const updatedServicio = await ServicioRealizado.update(req.params.id, req.body);
            res.json({ message: "Servicio actualizado" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const servicio = await ServicioRealizado.getById(req.params.id);
            if (!servicio) {
                return res.status(404).json({ error: "Servicio no encontrado" });
            }
            await ServicioRealizado.delete(req.params.id);
            res.json({ message: "Servicio eliminado" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

export default servicioRealizadoController;