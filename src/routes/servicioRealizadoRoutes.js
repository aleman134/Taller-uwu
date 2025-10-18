import express from "express";
import servicioRealizadoController from "../controller/servicioRealizadoController.js";

const router = express.Router();

router.get("/", servicioRealizadoController.getAll);
<<<<<<< HEAD
router.get("/orden/:orden_trabajo_id", servicioRealizadoController.getByOrden); //historial
router.get("/estadisticas/estadisticas", servicioRealizadoController.getEstadisticas); //reportes
=======
router.get("/orden/:orden_trabajo_id", servicioRealizadoController.getByOrden);
router.get("/estadisticas/estadisticas", servicioRealizadoController.getEstadisticas);
>>>>>>> bd88513e37169740585f71e73c6baca4887e03d1
router.get("/:id", servicioRealizadoController.getById);
router.post("/", servicioRealizadoController.create);
router.put("/:id", servicioRealizadoController.update);
router.delete("/:id", servicioRealizadoController.delete);

export default router;
