// src/app.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Rutas
import loginRoutes from "./routes/loginRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import clienteRoutes from "./routes/clienteRoutes.js";
import vehiculoRoutes from "./routes/vehiculoRoutes.js";
import citaRoutes from "./routes/citaRoutes.js";
import ordenTrabajoRoutes from "./routes/ordenTrabajoRoutes.js";
import repuestoUtilizadoRoutes from "./routes/repuestoUtilizadoRoutes.js";
import servicioRoutes from "./routes/servicioRoutes.js";
import servicioRealizadoRoutes from "./routes/servicioRealizadoRoutes.js";
import historialServicioRoutes from "./routes/historialServicioRoutes.js";
import notificacionesRoutes from "./routes/notificacionesRoutes.js";

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: 'http://127.0.0.1:5500',
  credentials: true
}));

// Configuración de archivos estáticos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../view'))); // Ajustado también

// Rutas
app.use('/api/login', loginRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/ordenes', ordenTrabajoRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/historial', historialServicioRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/repuestos-utilizados', repuestoUtilizadoRoutes);
app.use('/api/servicios-realizados', servicioRealizadoRoutes);

export default app;