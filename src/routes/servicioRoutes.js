import express from "express";
import servicioController from "../controller/servicioController.js";

const router = express.Router();

router.get("/", servicioController.getAll);
router.get("/activos", servicioController.getActivos);
router.get("/categorias", servicioController.getCategorias);
<<<<<<< HEAD
router.get("/estadisticas/estadisticas", servicioController.getEstadisticas); //reporte
=======
router.get("/estadisticas/estadisticas", servicioController.getEstadisticas);
>>>>>>> bd88513e37169740585f71e73c6baca4887e03d1
router.get("/rango/:precio_min/:precio_max", servicioController.getRangoPrecio);
router.get("/categoria/:categoria", servicioController.getByCategoria);
router.get("/:id", servicioController.getById);

router.post("/", servicioController.create);
router.put("/:id", servicioController.update);
router.delete("/:id", servicioController.delete);

export default router;