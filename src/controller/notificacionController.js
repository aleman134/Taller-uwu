import Notificaciones from "../model/notificacionModel.js";

const notificacionController = {
    create: async (req, res) => {
        try {
            const nueva = await Notificaciones.create(req.body);
            res.status(201).json(nueva);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getByUsuario: async (req, res) => {
        try {
            const { usuario_id } = req.params;
            const { solo_no_leidas } = req.query;
            const notificaciones = await Notificaciones.getByUsuario(usuario_id, solo_no_leidas === "true");
            res.status(200).json(notificaciones);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    marcarLeida: async (req, res) => {
        try {
            const resultado = await Notificaciones.marcarLeida(req.params.id);
            res.status(200).json(resultado);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getPendientes: async (req, res) => {
        try {
            const pendientes = await Notificaciones.getPendientes();
            res.json(pendientes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    limpiarAntiguas: async (req, res) => {
        try {
            const { dias_antiguedad } = req.query;
            const resultado = await Notificaciones.limpiarAntiguas(dias_antiguedad ? parseInt(dias_antiguedad) : 30);
            res.json(resultado);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getAll: async (req, res) => {
        try {
            const notificaciones = await Notificaciones.getAll();

            res.status(200).json({
                success: true,
                message: 'Notificaciones obtenidas exitosamente',
                data: notificaciones,
                count: notificaciones.length
            });
        } catch (error) {
            console.error('Error en getAll notificaciones:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener las notificaciones'
            });
        }
    },

    getByTipo: async (req, res) => {
        try {
            const { tipo } = req.params;

            // Validar tipo
            const tiposValidos = ['cita', 'orden_trabajo', 'mantenimiento', 'sistema'];
            if (!tiposValidos.includes(tipo)) {
                return res.status(400).json({
                    success: false,
                    message: `Tipo inválido. Debe ser: ${tiposValidos.join(', ')}`
                });
            }

            const notificaciones = await Notificaciones.getByTipo(tipo);

            res.status(200).json({
                success: true,
                message: `Notificaciones de tipo '${tipo}' obtenidas exitosamente`,
                data: notificaciones,
                count: notificaciones.length
            });
        } catch (error) {
            console.error('Error en getByTipo notificaciones:', error);
            res.status(500).json({
                success: false,
                message: error.sqlMessage || 'Error al obtener las notificaciones por tipo'
            });
        }
    },

    getLeidas: async (req, res) => {
        try {
            const notificaciones = await Notificaciones.getLeidas();

            res.status(200).json({
                success: true,
                message: 'Notificaciones leídas obtenidas exitosamente',
                data: notificaciones,
                count: notificaciones.length
            });
        } catch (error) {
            console.error('Error en getLeidas notificaciones:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener las notificaciones leídas'
            });
        }
    },

    marcarVariasLeidas: async (req, res) => {
        try {
            const { usuario_id } = req.params;

            if (!usuario_id || isNaN(usuario_id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de usuario inválido'
                });
            }

            const resultado = await Notificaciones.marcarVariasLeidas(usuario_id);

            res.status(200).json({
                success: true,
                message: 'Notificaciones marcadas como leídas',
                data: resultado
            });
        } catch (error) {
            console.error('Error en marcarVariasLeidas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al marcar las notificaciones como leídas'
            });
        }
    }
};
export default notificacionController;