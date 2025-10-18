import express from "express";
import clienteController from "../controller/clienteController.js";

const router = express.Router();

//Solo admin puede gestionar clientes, mecanicos solo lectura

router.get("/",  clienteController.getAll);
router.get("/:id", clienteController.getById);
router.post("/", clienteController.create);
router.put("/:id", clienteController.update);
router.delete("/:id", clienteController.delete);

export default router;