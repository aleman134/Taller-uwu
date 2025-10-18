import RespuestoUtilizado from "../model/repuestoUtilzadoModel.js";

const repuestoUtilizadoController = {
    getAll: async (req, res) => {
        try {
            const repuesto = await RespuestoUtilizado.getAll();
            res.json(repuesto);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getByOrden: async (req, res) => {
        try {
            const repuesto = await RespuestoUtilizado.getByOrden(req.params.orden_trabajo_id);
            res.json(repuesto);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

<<<<<<< HEAD
    getById: async (req, res) => {
        try {
            const repuesto = await RespuestoUtilizado.getById(req.params.id);
            if (!repuesto) {
                return res.status(404).json({ error: "Repuesto utilizado no encontrado" });
            }
            res.json(repuesto);
        } catch (error) {
            console.error('Error en getById repuesto:', error);
            res.status(500).json({ error: error.message });
        }
    },

=======
>>>>>>> bd88513e37169740585f71e73c6baca4887e03d1
    create: async (req, res) => {
        try {
            const repuesto = await RespuestoUtilizado.create(req.body);
            res.status(201).json(repuesto);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getEstadisticas: async (req, res) => {
        try {
            const { fecha_inicio, fecha_fin } = req.query;
<<<<<<< HEAD
            const estadisticas = await RespuestoUtilizado.getEstadisticas(fecha_inicio, fecha_fin);
=======
            const estadisticas = await RespuestoUtilizado.getEstadisticas();
>>>>>>> bd88513e37169740585f71e73c6baca4887e03d1
            res.json(estadisticas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
<<<<<<< HEAD
    },
    
    delete: async (req, res) => {
        try {
            const repuesto = await RespuestoUtilizado.getById(req.params.id);
            if (!repuesto) {
                return res.status(404).json({ error: "Repuesto utilizado no encontrado" });
            }

            const resultado = await RespuestoUtilizado.delete(req.params.id);
            res.json({ message: "Repuesto eliminado exitosamente", resultado });
        } catch (error) {
            console.error('Error en delete repuesto:', error);
            res.status(500).json({ error: error.message });
        }
=======
>>>>>>> bd88513e37169740585f71e73c6baca4887e03d1
    }
};

export default repuestoUtilizadoController;