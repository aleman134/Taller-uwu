import Usuario from "../model/usuarioModel.js";
import bcrypt from "bcryptjs";

const usuarioController = {
    getAll: async (req, res) => {
        try {
            const usuarios = await Usuario.getAll();
            res.json(usuarios);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const usuario = await Usuario.getById(req.params.id);
            if (!usuario) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }
            res.json(usuario);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    create: async (req, res) => {
        try {
            let { nombre, apellido, correo, telefono, contrasenia, rol, estado } = req.body;

            if (!nombre || !apellido || !correo || !telefono || !contrasenia || !rol || !estado) {
                return res.status(400).json({ error: "Todos los campos son obligatorios" });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(correo)) {
                return res.status(400).json({ error: "Correo no es valido" });
            }

            const hashedPassword = await bcrypt.hash(contrasenia, 10);
            const nuevoUsuario = { nombre, apellido, correo, telefono, contrasenia: hashedPassword, rol, estado };
            const createdUsuario = await Usuario.create(nuevoUsuario);
            res.status(201).json(createdUsuario);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const usuario = await Usuario.getById(req.params.id);
            if (!usuario) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            // Validar email si se está actualizando
            if (req.body.correo) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(req.body.correo)) {
                    return res.status(400).json({ error: "Correo no es válido" });
                }
            }

            // Preparar datos para actualización
            let datosActualizacion = {
                nombre: req.body.nombre || null,
                apellido: req.body.apellido || null,
                correo: req.body.correo || null,
                telefono: req.body.telefono || null,
                rol: req.body.rol || null,
                estado: req.body.estado || null,
                contrasenia: null // Por defecto null (no actualizar)
            };

            // hashear si se envía una nueva contraseña
            if (req.body.contrasenia && req.body.contrasenia.trim() !== '') {
                datosActualizacion.contrasenia = await bcrypt.hash(req.body.contrasenia, 10);
            }

            const updatedUsuario = await Usuario.update(req.params.id, datosActualizacion);
            res.json(updatedUsuario);
        } catch (error) {
            // Manejar error de correo duplicado
            if (error.message.includes('correo electrónico ya está registrado')) {
                return res.status(409).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const usuario = await Usuario.getById(req.params.id);
            if (!usuario) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }
            await Usuario.delete(req.params.id);
            res.json({ message: "Usuario inactivo" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

export default usuarioController;