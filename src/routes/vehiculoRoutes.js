import express from "express";
import vehiculoController from "../controller/vehiculoController.js";

const router = express.Router();

//Solo admin puede gestionar, mecanicos solo lectura
router.get("/", vehiculoController.getAll);
router.get("/:id", vehiculoController.getById);
router.get("/cliente/:cliente_id", vehiculoController.getByClienteId);
router.get("/placa/:placa", vehiculoController.getByPlaca);
<<<<<<< HEAD
router.get("/estadisticas/estadisticas", vehiculoController.getEstadisticaVehiculos); //reporte
=======
router.get("/estadisticas/estadisticas", vehiculoController.getEstadisticaVehiculos);
>>>>>>> bd88513e37169740585f71e73c6baca4887e03d1
router.post("/", vehiculoController.create);
router.put("/:id", vehiculoController.update);
router.delete("/:id", vehiculoController.delete);

export default router;