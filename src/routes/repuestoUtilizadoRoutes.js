import express from "express";
import repuestoUtilizadoController from "../controller/repuestoUtilizadoController.js";

const router = express.Router();


router.get("/estadisticas/estadisticas", repuestoUtilizadoController.getEstadisticas);//reportes
router.get("/orden/:orden_trabajo_id", repuestoUtilizadoController.getByOrden); //historial

router.get("/", repuestoUtilizadoController.getAll);
router.get("/:id", repuestoUtilizadoController.getById);
router.post("/", repuestoUtilizadoController.create);
router.delete("/:id", repuestoUtilizadoController.delete);


export default router;