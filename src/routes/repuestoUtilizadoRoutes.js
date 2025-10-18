import express from "express";
import repuestoUtilizadoController from "../controller/repuestoUtilizadoController.js";

const router = express.Router();

<<<<<<< HEAD
router.get("/estadisticas/estadisticas", repuestoUtilizadoController.getEstadisticas);//reportes
router.get("/orden/:orden_trabajo_id", repuestoUtilizadoController.getByOrden); //historial

router.get("/", repuestoUtilizadoController.getAll);
router.get("/:id", repuestoUtilizadoController.getById);
router.post("/", repuestoUtilizadoController.create);
router.delete("/:id", repuestoUtilizadoController.delete);
=======
router.get("/", repuestoUtilizadoController.getAll);
router.get("/orden/:orden_trabajo_id", repuestoUtilizadoController.getByOrden);
router.post("/", repuestoUtilizadoController.create);
router.get("/estadisticas/estadisticas", repuestoUtilizadoController.getEstadisticas);
>>>>>>> bd88513e37169740585f71e73c6baca4887e03d1

export default router;