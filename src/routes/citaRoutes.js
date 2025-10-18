import express from "express";
import citaController from "../controller/citaController.js";

const router = express.Router();


router.get("/estadisticas", citaController.getEstadisticas); //reportes


// Rutas de búsqueda por criterios
router.get("/fecha/:fecha", citaController.getByFecha);
router.get("/estado/:estado", citaController.getByEstado);
router.get("/cliente/:cliente_id", citaController.getByClienteId);
router.get("/mecanico/:mecanico_id", citaController.getByMecanicoId);

// Rutas específicas para mecánicos
router.get("/mis-citas-hoy/:mecanico_id", citaController.getMisCitasDelDia);
router.get("/mis-proximas-citas/:mecanico_id/:dias", citaController.getMisProximasCitas);

router.get("/mis-estadisticas/:mecanico_id", citaController.getMisEstadisticas); //reportes


// Verificar disponibilidad de horarios
router.get("/disponibilidad/verificar", citaController.verificarDisponibilidad);

// Obtener horarios alternativos
router.get("/disponibilidad/alternativos", citaController.horariosAlternativos);

// Obtener mecánicos disponibles
router.get("/mecanicos/disponibles", citaController.mecanicosDisponibles);

// Obtener vista de calendario semanal
router.get("/calendario/semanal", citaController.calendarioSemanal);

// Obtener slots disponibles para un día
router.get("/slots/disponibles", citaController.slotsDisponibles);

// Cambiar estado de cita
router.put("/estado/:id", citaController.cambiarEstado);

// admin gestion completa de citas, mecanico solo ver y actualizar
router.get("/", citaController.getAll);
router.get("/:id", citaController.getById);
router.post("/", citaController.create);
router.put("/:id", citaController.update);
router.delete("/:id", citaController.delete);

export default router;