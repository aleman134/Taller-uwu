import express from "express";
import ordenTrabajoController from "../controller/ordenTrabajoController.js";

const router = express.Router();

router.get("/vencidas/vencidas", ordenTrabajoController.vencidas);
<<<<<<< HEAD
router.get("/estadisticas/estadisticas", ordenTrabajoController.estadisticas); //reporte
=======
router.get("/estadisticas/estadisticas", ordenTrabajoController.estadisticas);
>>>>>>> bd88513e37169740585f71e73c6baca4887e03d1

router.get("/mecanico/:mecanico_id", ordenTrabajoController.getByMecanico);
router.get("/cliente/:cliente_id", ordenTrabajoController.getByCliente);
router.get("/estado/:estado", ordenTrabajoController.getByEstado);
<<<<<<< HEAD
router.get("/historial/:id", ordenTrabajoController.historial); //historial
=======
router.get("/historial/:id", ordenTrabajoController.historial);
>>>>>>> bd88513e37169740585f71e73c6baca4887e03d1
router.get("/reporte/:id", ordenTrabajoController.reporteCompleto);
router.get("/vencer/:dias", ordenTrabajoController.proximasVencer);

router.get("/", ordenTrabajoController.getAll);
router.get("/:id", ordenTrabajoController.getById);
router.post("/", ordenTrabajoController.create);
router.put("/:id", ordenTrabajoController.update);
router.delete("/:id", ordenTrabajoController.delete);

router.put("/cambiar/:id", ordenTrabajoController.cambiarEstado);
router.put("/costos/:id", ordenTrabajoController.updateCostos);
<<<<<<< HEAD
router.post("/resumen", ordenTrabajoController.resumenPeriodo); //reporte
=======
router.post("/resumen", ordenTrabajoController.resumenPeriodo);
>>>>>>> bd88513e37169740585f71e73c6baca4887e03d1

export default router;