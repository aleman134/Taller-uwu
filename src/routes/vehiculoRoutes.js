import express from "express";
import vehiculoController from "../controller/vehiculoController.js";

const router = express.Router();

//Solo admin puede gestionar, mecanicos solo lectura
router.get("/", vehiculoController.getAll);
router.get("/:id", vehiculoController.getById);
router.get("/cliente/:cliente_id", vehiculoController.getByClienteId);
router.get("/placa/:placa", vehiculoController.getByPlaca);

router.get("/estadisticas/estadisticas", vehiculoController.getEstadisticaVehiculos); //reporte

router.post("/", vehiculoController.create);
router.put("/:id", vehiculoController.update);
router.delete("/:id", vehiculoController.delete);

export default router;