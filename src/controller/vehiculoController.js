import Vehiculo from "../model/vehiculoModel.js";

const vehiculoController = {
    getAll: async (req, res) => {
        try {
            const vehiculos = await Vehiculo.getAll();
            res.json(vehiculos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const vehiculo = await Vehiculo.getById(req.params.id);
            if (!vehiculo) {
                return res.status(404).json({ error: "Vehículo no encontrado" });
            }
            res.json(vehiculo);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getByClienteId: async (req, res) => {
        const { cliente_id } = req.params;
        try {
            const vehiculos = await Vehiculo.getByClienteId(cliente_id);
            if (!vehiculos || vehiculos.length === 0){
                return res.status(404).json({ error: "Vehiculos no encontrados" });
            }
            res.json(vehiculos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getByPlaca: async (req, res) => {
        const { placa } = req.params;
        try {
            const vehiculo = await Vehiculo.getByPlaca(placa);
            if (!vehiculo) {
                return res.status(404).json({ error: "Vehículo no encontrado" });
            }
            res.json(vehiculo);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getEstadisticaVehiculos: async (req, res) => {
        try {
            const estadisticas = await Vehiculo.getEstadisticaVehiculos();

            res.json({
                success: true,
                data: {
                    resumen: estadisticas.estadisticas_generales,
                    marcas: estadisticas.cantidad_marca_comun
                }
            });
        } catch (error) {
            console.error("Error en getEstadisticaVehiculos:", error.message);
            res.status(500).json({
                success: false,
                error: "Ocurrió un error al obtener las estadísticas de vehículos."
            });
        }
    },

    create: async (req, res) => {
        try {
            let { cliente_id, marca, modelo, anioo, placa, color, numero_motor, numero_chasis, kilometraje } = req.body;
            const newVehiculo = await Vehiculo.create({ cliente_id, marca, modelo, anioo, placa, color, numero_motor, numero_chasis, kilometraje });
            res.status(201).json(newVehiculo);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const vehiculo = await Vehiculo.getById(req.params.id);
            if (!vehiculo) {
                return res.status(404).json({ error: "Vehículo no encontrado" });
            }
            const updatedVehiculo = await Vehiculo.update(req.params.id, req.body);
            res.json({ message: "Vehículo actualizado", vehiculo: updatedVehiculo });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const vehiculo = await Vehiculo.getById(req.params.id);
            if (!vehiculo) {
                return res.status(404).json({ error: "Vehículo no encontrado" });
            }
            await Vehiculo.delete(req.params.id);
            res.json({ message: "Vehículo eliminado" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

export default vehiculoController;