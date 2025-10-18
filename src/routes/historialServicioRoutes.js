import express from "express";
import historialServicioController from "../controller/historialServicioController.js";

const router = express.Router();


router.get("/:vehiculo_id", historialServicioController.getByVehiculo); //historial
router.get("/proximos/proximos", historialServicioController.getProximosMantenimientos); //historial


export default router;