import OrdenTrabajo from "../model/ordenTrabajoModel.js";

// Definir campos permitidos para actualización
const camposPermitidos = [
    'mecanico_id',
    'fecha_estimada_salida',
    'fecha_real_salida',
    'estado',
    'descripcion_inicial',
    'diagnostico',
    'observaciones',
    'costo_mano_obra',
    'kilometraje_ingreso'
];

const ordenTrabajoController = {
    getAll: async (req, res) => {
        try {
            const ordenes = await OrdenTrabajo.getAll();
            res.json(ordenes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const orden = await OrdenTrabajo.getById(req.params.id);
            if(!orden) {
                return res.status(404).json({ error: "Orden de trabajo no encontrada" });
            }
            res.json(orden);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getByMecanico: async (req, res) => {
        const { mecanico_id } = req.params;
        try {
            const ordenes = await OrdenTrabajo.getByMecanico(mecanico_id);
            if (!ordenes) {
                return res.status(404).json({ error: "Orden no encontrada" });
            }
            res.json(ordenes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getByCliente: async (req, res) => {
        const { cliente_id } = req.params;
        try {
            const ordenes = await OrdenTrabajo.getByCliente(cliente_id);
            if (!ordenes) {
                return res.status(404).json({ error: "Orden no encontrada" });
            }
            res.json(ordenes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getByEstado: async (req, res) => {
        try {
            const ordenes = await OrdenTrabajo.getByEstado(req.params.estado);
            if (!ordenes || ordenes.length === 0) {
                return res.status(404).json({ error: "Orden no encontrada" });
            }
            res.json(ordenes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    create: async (req, res) => {
        const orden = req.body;
        try {
           const newOrden = await OrdenTrabajo.create(orden);
           res.status(201).json(newOrden[0] || newOrden);
        } catch (error) {
           res.status(500).json({ error: error.message });
       }
    },

    update: async (req, res) => {
        try {
            const orden = await OrdenTrabajo.getById(req.params.id);
            if (!orden) {
                return res.status(404).json({ error: "Orden no encontrada" });
            }

            const dataParaActualizar = Object.fromEntries(
                Object.entries(req.body).filter(([key]) => camposPermitidos.includes(key))
            );

            if (Object.keys(dataParaActualizar).length === 0) {
                return res.status(400).json({ error: "No hay campos válidos para actualizar" });
            }

            const updatedOrden = await OrdenTrabajo.update(req.params.id, dataParaActualizar);
            res.json({ message: "Orden actualizada", orden: updatedOrden[0] });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }        
    },

    cambiarEstado: async (req, res) => {
        const { id } = req.params;
        const { nuevo_estado, observaciones } = req.body;
        try {
            const orden = await OrdenTrabajo.getById(id);
            if (!orden) {
                return res.status(404).json({ error: "Orden no encontrada" });
            }

            // Validar que el nuevo estado sea válido
            const estadosValidos = ['pendiente', 'en_proceso', 'en_espera', 'finalizada', 'entregada', 'cancelada'];
            if (!estadosValidos.includes(nuevo_estado)) {
                return res.status(400).json({ error: "Estado no válido" });
            }

            // Si hay autenticación, verificar permisos
            if (req.user) {
                const rol = req.user.rol;
                const userId = req.user.id;

                // Si es mecánico, solo puede cambiar estado de sus órdenes
                if (rol === 'mecanico' && orden.mecanico_id !== userId) {
                    return res.status(403).json({ error: "Solo puedes cambiar el estado de tus propias órdenes" });
                }
            }

            const resultado = await OrdenTrabajo.cambiarEstado(id, nuevo_estado, observaciones);
            res.json({ message: "Estado de la orden actualizado", resultado });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    updateCostos: async (req, res) => {
        const { costo_repuestos, costo_mano_obra } = req.body;
        try {
            if (req.user && req.user.rol !== "administrador") {
                return res.status(403).json({ error: "No tienes permisos para actualizar costos" });
            }
            
            const orden = await OrdenTrabajo.getById(req.params.id);
            if (!orden) {
                return res.status(404).json({ error: "Orden no encontrada" });
            }
            await OrdenTrabajo.updateCostos(req.params.id, costo_repuestos, costo_mano_obra);
            res.json({ message: "Costos de la orden actualizados" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    vencidas: async (req, res) => {
        try {
            const ordenes = await OrdenTrabajo.vencidas();
            res.json(ordenes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    proximasVencer: async (req, res) => {
        const dias = req.params.dias || 3; // Por defecto 3 días
        try {
            const ordenes = await OrdenTrabajo.proximasVencer(dias);
            res.json(ordenes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    historial: async (req, res) => {
        try {
            const ordenes = await OrdenTrabajo.historial(req.params.id);
            res.json(ordenes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    reporteCompleto: async (req, res) => {
        try {
            const reporte = await OrdenTrabajo.reporteCompleto(req.params.id);
            if (!reporte.orden) {
                return res.status(404).json({ error: "Orden de trabajo no encontrada" });
            }
            res.json(reporte);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    resumenPeriodo: async (req, res) => {
        const { fecha_inicio, fecha_fin } = req.body;
        try {
            const resumen = await OrdenTrabajo.resumenPeriodo(fecha_inicio, fecha_fin);
            res.json(resumen);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    estadisticas: async (req, res) => {
        try {
            const estadisticas = await OrdenTrabajo.estadisticas();
            res.json(estadisticas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const orden = await OrdenTrabajo.getById(req.params.id);
            if (!orden) {
                return res.status(404).json({ error: "Orden no encontrada" });
            }
            await OrdenTrabajo.delete(req.params.id);
            res.json({ message: "Orden eliminada" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }        
    }
};

export default ordenTrabajoController;