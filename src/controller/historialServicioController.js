import HistorialServicios from "../model/historialServicioModel.js";

const historialServicioController = {
    getByVehiculo: async (req, res) => {
        try {
            const { vehiculo_id } = req.params;
            
            if (!vehiculo_id || isNaN(vehiculo_id)) {
                return res.status(400).json({ error: "ID de vehículo inválido" });
            }

            const historial = await HistorialServicios.getByVehiculo(vehiculo_id);
            res.json(historial);
        } catch (error) {
            console.error('Error en getByVehiculo:', error);
            res.status(500).json({ 
                error: "Error al obtener el historial de servicios",
                detalle: error.message 
            });
        }
    },

    create: async (req, res) => {
        try {
            const { vehiculo_id, orden_trabajo_id, fecha_servicio } = req.body;

            // Validaciones básicas
            if (!vehiculo_id || !orden_trabajo_id || !fecha_servicio) {
                return res.status(400).json({ 
                    error: "Faltan campos requeridos: vehiculo_id, orden_trabajo_id, fecha_servicio" 
                });
            }

            const nuevoHistorial = await HistorialServicios.create(req.body);
            res.status(201).json(nuevoHistorial);
        } catch (error) {
            console.error('Error en create:', error);
            
            // Manejar errores específicos del SP
            if (error.sqlMessage) {
                return res.status(400).json({ 
                    error: error.sqlMessage 
                });
            }
            
            res.status(500).json({ 
                error: "Error al crear el historial de servicios",
                detalle: error.message 
            });
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