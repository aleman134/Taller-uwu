import Cita from "../model/citaModel.js";

const citaController = {
    getAll: async (req, res) => {
        try {
            const citas = await Cita.getAll();
            res.json(citas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

   getById: async (req, res) => {
       try {
           const cita = await Cita.getById(req.params.id);
           if (!cita) {
               return res.status(404).json({ error: "Cita no encontrada" });
           }
           res.json(cita);
       } catch (error) {
           res.status(500).json({ error: error.message });
       }
   },

   getByClienteId: async (req, res) => {
       const { cliente_id } = req.params;
       try {
           const citas = await Cita.getByClienteId(cliente_id);
           res.json(citas);
       } catch (error) {
           res.status(500).json({ error: error.message });
       }
   },

   getByMecanicoId: async (req, res) => {
       const { mecanico_id } = req.params;
       try {
           const citas = await Cita.getByMecanicoId(mecanico_id);
           res.json(citas);
       } catch (error) {
           res.status(500).json({ error: error.message });
       }
   },

   getByFecha: async (req, res) => {
       const { fecha } = req.params;
       try {
           const citas = await Cita.getByFecha(fecha);
           res.json(citas);
       } catch (error) {
           res.status(500).json({ error: error.message });
       }
   },

   getByEstado: async (req, res) => {
       const { estado } = req.params;
       try {
           const citas = await Cita.getByEstado(estado);
           res.json(citas);
       } catch (error) {
           res.status(500).json({ error: error.message });
       }
   },

   create: async (req, res) => {
       const cita = req.body;
       try {
           const newCita = await Cita.create(cita);
           res.status(201).json(newCita);
       } catch (error) {
           res.status(500).json({ error: error.message });
       }
   },

   update: async (req, res) => {
       try {
           const cita = await Cita.getById(req.params.id);
           if (!cita) {
               return res.status(404).json({ error: "Cita no encontrada" });
           }
           const citaActualizada = await Cita.update(req.params.id, req.body);
           res.json({ message: "Cita actualizada" });
       } catch (error) {
           res.status(500).json({ error: error.message });
       }
   },

   cambiarEstado: async (req, res) => {
       const { nuevo_estado, observaciones } = req.body;
       try {
           const citaActualizada = await Cita.cambiarEstado(req.params.id, nuevo_estado, observaciones);
           res.json({ message: "Estado de la cita actualizado", cita: citaActualizada });
       } catch (error) {
           res.status(500).json({ error: error.message });
       }
   },

   getEstadisticas: async (req, res) => {
       try {
           const estadisticas = await Cita.getEstadisticas();
           res.json(estadisticas);
       } catch (error) {
           res.status(500).json({ error: error.message });
       }
   },

   delete: async (req, res) => {
       try {
           const cita = await Cita.getById(req.params.id);
           if (!cita) {
               return res.status(404).json({ error: "Cita no encontrada" });
           }
           await Cita.delete(req.params.id);
           res.json({ message: "Cita eliminada" });
       } catch (error) {
           res.status(500).json({ error: error.message });
       }
   },

    getMisCitasDelDia: async (req, res) => {
        const { mecanico_id } = req.params;
        
        try {
            if (!mecanico_id || isNaN(mecanico_id)) {
                return res.status(400).json({ 
                    error: "ID de mecánico inválido" 
                });
            }

            const mecanicoIdNum = parseInt(mecanico_id);
            const citas = await Cita.getMisCitasDelDia(mecanicoIdNum);
            
            // Calcular resumen
            const resumen = {
                total: citas.length,
                pendientes: citas.filter(c => c.estado === 'programada' || c.estado === 'confirmada').length,
                en_proceso: citas.filter(c => c.estado === 'en_proceso').length,
                completadas: citas.filter(c => c.estado === 'completada').length
            };
            
            res.json({
                success: true,
                mecanico_id: mecanicoIdNum,
                fecha: new Date().toISOString().split('T')[0],
                resumen: resumen,
                citas: citas
            });
        } catch (error) {
            res.status(500).json({ 
                error: "Error al obtener citas del día",
                details: error.message 
            });
        }
    },

    // Obtener próximas citas de un mecánico
    getMisProximasCitas: async (req, res) => {
        const { mecanico_id, dias } = req.params;
        
        try {
            // Validar parámetros
            if (!mecanico_id || isNaN(mecanico_id)) {
                return res.status(400).json({ 
                    error: "ID de mecánico inválido" 
                });
            }

            const mecanicoIdNum = parseInt(mecanico_id);
            const diasNum = parseInt(dias) || 7;

            const citas = await Cita.getMisProximasCitas(mecanicoIdNum, diasNum);
            
            res.json({
                success: true,
                mecanico_id: mecanicoIdNum,
                dias: diasNum,
                total: citas.length,
                citas: citas
            });
        } catch (error) {
            res.status(500).json({ 
                error: "Error al obtener próximas citas",
                details: error.message 
            });
        }
    },

    // Obtener estadísticas de un mecánico
    getMisEstadisticas: async (req, res) => {
        const { mecanico_id } = req.params;
        
        try {
            if (!mecanico_id || isNaN(mecanico_id)) {
                return res.status(400).json({ 
                    error: "ID de mecánico inválido" 
                });
            }

            const mecanicoIdNum = parseInt(mecanico_id);
            const estadisticas = await Cita.getEstadisticasMecanico(mecanicoIdNum);
            
            // Calcular tasas si hay datos
            let tasas = {};
            if (estadisticas.total_ultimo_mes > 0) {
                tasas = {
                    tasa_completado: ((estadisticas.completadas_ultimo_mes / estadisticas.total_ultimo_mes) * 100).toFixed(1),
                    tasa_cancelado: ((estadisticas.canceladas_ultimo_mes / estadisticas.total_ultimo_mes) * 100).toFixed(1)
                };
            }
            
            res.json({
                success: true,
                mecanico_id: mecanicoIdNum,
                estadisticas: estadisticas,
                tasas: tasas
            });
        } catch (error) {
            res.status(500).json({ 
                error: "Error al obtener estadísticas",
                details: error.message 
            });
        }
    },

    verificarDisponibilidad: async (req, res) => {
        try {
            const { fecha_cita, duracion_minutos, mecanico_id } = req.query;
            const excluir_cita_id = req.query.excluir_cita_id || null;

            if (!fecha_cita) {
                return res.status(400).json({ 
                    error: "El parámetro 'fecha_cita' es obligatorio" 
                });
            }

            const resultado = await Cita.verificarDisponibilidad(
                fecha_cita,
                duracion_minutos || 60,
                mecanico_id || null,
                excluir_cita_id
            );

            // Si NO está disponible, obtener horarios alternativos
            if (!resultado.disponible) {
                const alternativos = await Cita.horariosAlternativos(
                    fecha_cita,
                    duracion_minutos || 60,
                    mecanico_id || null,
                    3
                );

                return res.status(200).json({
                    ...resultado,
                    horarios_alternativos: alternativos
                });
            }

            res.status(200).json(resultado);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener horarios alternativos
    horariosAlternativos: async (req, res) => {
        try {
            const { fecha_cita, duracion_minutos, mecanico_id, cantidad } = req.query;

            if (!fecha_cita) {
                return res.status(400).json({ 
                    error: "El parámetro 'fecha_cita' es obligatorio" 
                });
            }

            const horarios = await Cita.horariosAlternativos(
                fecha_cita,
                duracion_minutos || 60,
                mecanico_id || null,
                cantidad || 3
            );

            res.status(200).json(horarios);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener mecánicos disponibles
    mecanicosDisponibles: async (req, res) => {
        try {
            const { fecha_cita, duracion_minutos } = req.query;

            if (!fecha_cita) {
                return res.status(400).json({ 
                    error: "El parámetro 'fecha_cita' es obligatorio" 
                });
            }

            const mecanicos = await Cita.mecanicosDisponibles(
                fecha_cita,
                duracion_minutos || 60
            );

            res.status(200).json(mecanicos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener vista de calendario semanal
    calendarioSemanal: async (req, res) => {
        try {
            const { fecha_inicio, mecanico_id } = req.query;
            
            // Si no se proporciona fecha, usar la fecha actual
            const fecha = fecha_inicio || new Date().toISOString().split('T')[0];

            const calendario = await Cita.calendarioSemanal(
                fecha,
                mecanico_id || null
            );

            res.status(200).json(calendario);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener slots disponibles para un día
    slotsDisponibles: async (req, res) => {
        try {
            const { fecha, mecanico_id } = req.query;

            if (!fecha) {
                return res.status(400).json({ 
                    error: "El parámetro 'fecha' es obligatorio" 
                });
            }

            const slots = await Cita.slotsDisponibles(
                fecha,
                mecanico_id || null
            );

            res.status(200).json(slots);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

export default citaController;