import HistorialServicios from "../model/historialServicioModel.js";

const historialServicioController = {
    getByVehiculo: async (req, res) => {
        try {
            const historial = await HistorialServicios.getByVehiculo(req.params.vehiculo_id);
            res.json(historial);
        } catch (error) {
            res.status(500).json({ error: "Error al obtener el historial de servicios" });
        }
    },

    create: async (req, res) => {
        try {
            const nuevoHistorial = await HistorialServicios.create(req.body);
            res.status(201).json(nuevoHistorial);
        } catch (error) {
            res.status(500).json({ error: "Error al crear el historial de servicios" });
        }
    },

    getProximosMantenimientos: async (req, res) => {
        try {
            const proximosMantenimientos = await HistorialServicios.getProximosMantenimientos();
            res.json(proximosMantenimientos);
        } catch (error) {
            res.status(500).json({ error: "Error al obtener los próximos mantenimientos" });
        }
    }
};

export default historialServicioController;