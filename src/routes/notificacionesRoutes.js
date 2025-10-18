import express from "express";
import notificacionController from "../controller/notificacionController.js";

const router = express.Router();

router.get("/pendientes/pendientes", notificacionController.getPendientes);
router.delete("/limpiar", notificacionController.limpiarAntiguas);
router.put("/leida/:id", notificacionController.marcarLeida);
router.get("/leidas", notificacionController.getLeidas);

router.get("/", notificacionController.getAll);
router.post("/", notificacionController.create);
router.get("/usuario/:usuario_id", notificacionController.getByUsuario);
router.get("/tipo/:tipo", notificacionController.getByTipo);
router.get("/usuario/:usuario_id/leer-todas", notificacionController.marcarVariasLeidas);


export default router;