import express from "express";
import historialServicioController from "../controller/historialServicioController.js";

const router = express.Router();

<<<<<<< HEAD
router.get("/:vehiculo_id", historialServicioController.getByVehiculo); //historial
router.get("/proximos/proximos", historialServicioController.getProximosMantenimientos); //historial
=======
router.get("/:vehiculo_id", historialServicioController.getByVehiculo);
router.post("/", historialServicioController.create);
router.get("/proximos/proximos", historialServicioController.getProximosMantenimientos);
>>>>>>> bd88513e37169740585f71e73c6baca4887e03d1

export default router;