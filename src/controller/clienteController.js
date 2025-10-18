import Cliente from "../model/clienteModel.js";

const clienteController = {
    getAll: async (req, res) => {
        try {
            const clientes = await Cliente.getAll();
            res.json(clientes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getById: async (req, res) => {
        const { id } = req.params;
        try {
            const cliente = await Cliente.getById(id);
            if (!cliente) {
                return res.status(404).json({ error: "Cliente no encontrado" });
            }
            res.json(cliente);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    create: async (req, res) => {
        try {
            let { nombre, apellido, dpi, telefono, correo, direccion } = req.body;

            if (!nombre || !apellido || !dpi || !telefono || !correo || !direccion) {
                return res.status(400).json({ error: "Todos los campos son obligatorios" });
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (correo && !emailRegex.test(correo)) {
                return res.status(400).json({ error: "Correo electrónico inválido" });
            }
            const newCliente = await Cliente.create({ nombre, apellido, dpi, telefono, correo, direccion });
            res.status(201).json(newCliente);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    update: async (req, res) => {
        try {
            if (!req.user || req.user.rol !== "administrador") {
                return res.status(403).json({ error: "No tienes permisos para modificar clientes" });
            }
            const cliente = await Cliente.getById(req.params.id);
            if (!cliente) {
                return res.status(404).json({ error: "Cliente no encontrado" });
            }
            const updatedCliente = await Cliente.update(req.params.id, req.body);
            res.json(updatedCliente);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const cliente = await Cliente.getById(req.params.id);
            if (!cliente) {
                return res.status(404).json({ error: "Cliente no encontrado" });
            }
            await Cliente.delete(req.params.id);
            res.json({ message: "Cliente eliminado" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

export default clienteController;