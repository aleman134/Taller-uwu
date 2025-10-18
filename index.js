import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Rutas
import loginRoutes from "./src/routes/loginRoutes.js";
import usuarioRoutes from "./src/routes/usuarioRoutes.js";
import clienteRoutes from "./src/routes/clienteRoutes.js";
import vehiculoRoutes from "./src/routes/vehiculoRoutes.js";
import citaRoutes from "./src/routes/citaRoutes.js";
import ordenTrabajoRoutes from "./src/routes/ordenTrabajoRoutes.js";
import repuestoUtilizadoRoutes from "./src/routes/repuestoUtilizadoRoutes.js";
import servicioRoutes from "./src/routes/servicioRoutes.js";
import servicioRealizadoRoutes from "./src/routes/servicioRealizadoRoutes.js";
import historialServicioRoutes from "./src/routes/historialServicioRoutes.js";
import notificacionesRoutes from "./src/routes/notificacionesRoutes.js";

// Config dotenv
dotenv.config();

const app = express();

// Middlewares
<<<<<<< HEAD
app.use(express.json());
=======
>>>>>>> bd88513e37169740585f71e73c6baca4887e03d1
app.use(cors({
  origin: 'http://127.0.0.1:5500',
  credentials: true
}));

<<<<<<< HEAD
// Configuración de archivos estáticos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'src/view')));
=======
app.use(express.json());
>>>>>>> bd88513e37169740585f71e73c6baca4887e03d1

// Rutas
app.get('/', (req, res) => {
    res.send('Hola mundo uwu');
});

app.use('/api/login', loginRoutes); //si sirve
app.use('/api/usuarios', usuarioRoutes); //si sirve
app.use('/api/clientes', clienteRoutes); //si sirve
app.use('/api/vehiculos', vehiculoRoutes); //si sirve
app.use('/api/citas', citaRoutes); //si sirve
app.use('/api/ordenes', ordenTrabajoRoutes); //si sirve
app.use('/api/servicios', servicioRoutes); //si sirve
app.use('/api/historial', historialServicioRoutes); //si sirve
app.use('/api/notificaciones', notificacionesRoutes); //si sirve
app.use('/api/repuestos-utilizados', repuestoUtilizadoRoutes); //si sirve
app.use('/api/servicios-realizados', servicioRealizadoRoutes); //si sirve

<<<<<<< HEAD
=======
// Configuración de archivos estáticos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'src/view')));

>>>>>>> bd88513e37169740585f71e73c6baca4887e03d1
// Puerto
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
