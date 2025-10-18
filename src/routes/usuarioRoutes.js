import express from "express";
import usuarioController from "../controller/usuarioController.js";

const router = express.Router();

//solo admin puede gestionar usuarios
router.get("/", usuarioController.getAll);
router.get("/:id", usuarioController.getById);
router.post("/", usuarioController.create);
router.put("/:id", usuarioController.update);
router.delete("/:id", usuarioController.delete);

export default router;