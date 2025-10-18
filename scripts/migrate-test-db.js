// scripts/migrate-test-db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

async function migrateTestDatabase() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'admin123',
      multipleStatements: true
    });

    console.log('Conectado a MySQL');

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'taller_test'}`);
    await connection.query(`USE ${process.env.DB_NAME || 'taller_test'}`);

    console.log('✓ Base de datos seleccionada');

    // Eliminar tablas existentes
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    const tablasAEliminar = [
      'notificaciones', 'historial_servicios', 'repuestos_utilizados',
      'servicios_realizados', 'ordenes_trabajo', 'servicios', 'citas',
      'vehiculos', 'clientes', 'usuarios'
    ];
    
    for (const tabla of tablasAEliminar) {
      await connection.query(`DROP TABLE IF EXISTS ${tabla}`);
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Tablas anteriores eliminadas');

    // Crear tabla usuarios
    await connection.query(`
      CREATE TABLE usuarios (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100) NOT NULL,
        correo VARCHAR(150) UNIQUE NOT NULL,
        telefono VARCHAR(20),
        contrasenia VARCHAR(255) NOT NULL,
        rol ENUM('administrador', 'mecanico') NOT NULL,
        estado ENUM('activo', 'inactivo') DEFAULT 'activo',
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla clientes
    await connection.query(`
      CREATE TABLE clientes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100) NOT NULL,
        dpi VARCHAR(20) UNIQUE,
        telefono VARCHAR(20),
        correo VARCHAR(150),
        direccion TEXT,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla vehiculos
    await connection.query(`
      CREATE TABLE vehiculos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        cliente_id INT NOT NULL,
        marca VARCHAR(50) NOT NULL,
        modelo VARCHAR(50) NOT NULL,
        anioo YEAR,
        placa VARCHAR(20) UNIQUE NOT NULL,
        color VARCHAR(30),
        numero_motor VARCHAR(50),
        numero_chasis VARCHAR(50),
        kilometraje INT DEFAULT 0,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
      )
    `);

    // Crear tabla citas
    await connection.query(`
      CREATE TABLE citas (
        id INT PRIMARY KEY AUTO_INCREMENT,
        cliente_id INT NOT NULL,
        vehiculo_id INT NOT NULL,
        mecanico_id INT,
        fecha_cita TIMESTAMP NOT NULL,
        motivo TEXT,
        estado ENUM('programada', 'confirmada', 'en_proceso', 'completada', 'cancelada') DEFAULT 'programada',
        observaciones TEXT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id),
        FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id),
        FOREIGN KEY (mecanico_id) REFERENCES usuarios(id)
      )
    `);

    // Crear tabla servicios
    await connection.query(`
      CREATE TABLE servicios (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        precio_base DECIMAL(10,2),
        tiempo_estimado INT,
        categoria VARCHAR(50),
        estado ENUM('activo', 'inactivo') DEFAULT 'activo',
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla ordenes_trabajo
    await connection.query(`
      CREATE TABLE ordenes_trabajo (
        id INT PRIMARY KEY AUTO_INCREMENT,
        numero_orden VARCHAR(20) UNIQUE NOT NULL,
        cliente_id INT NOT NULL,
        vehiculo_id INT NOT NULL,
        mecanico_id INT,
        cita_id INT,
        fecha_ingreso DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_estimada_salida DATETIME,
        fecha_real_salida DATETIME,
        estado ENUM('pendiente', 'en_proceso', 'finalizada', 'entregada', 'cancelada') DEFAULT 'pendiente',
        descripcion_inicial TEXT,
        diagnostico TEXT,
        observaciones TEXT,
        costo_mano_obra DECIMAL(10,2) DEFAULT 0,
        costo_total DECIMAL(10,2) DEFAULT 0,
        kilometraje_ingreso INT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id),
        FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id),
        FOREIGN KEY (mecanico_id) REFERENCES usuarios(id),
        FOREIGN KEY (cita_id) REFERENCES citas(id)
      )
    `);

    // Crear tabla servicios_realizados
    await connection.query(`
      CREATE TABLE servicios_realizados (
        id INT PRIMARY KEY AUTO_INCREMENT,
        orden_trabajo_id INT NOT NULL,
        servicio_id INT NOT NULL,
        descripcion_trabajo TEXT,
        costo DECIMAL(10,2) NOT NULL,
        tiempo_empleado INT,
        fecha_realizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (orden_trabajo_id) REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
        FOREIGN KEY (servicio_id) REFERENCES servicios(id)
      )
    `);

    // Crear tabla repuestos_utilizados
    await connection.query(`
      CREATE TABLE repuestos_utilizados (
        id INT PRIMARY KEY AUTO_INCREMENT,
        orden_trabajo_id INT NOT NULL,
        nombre_repuesto VARCHAR(100) NOT NULL,
        descripcion TEXT,
        cantidad INT NOT NULL,
        costo_cliente DECIMAL(10,2),
        proveedor VARCHAR(100),
        observaciones TEXT,
        fecha_utilizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (orden_trabajo_id) REFERENCES ordenes_trabajo(id) ON DELETE CASCADE
      )
    `);

    // Crear tabla historial_servicios
    await connection.query(`
      CREATE TABLE historial_servicios (
        id INT PRIMARY KEY AUTO_INCREMENT,
        vehiculo_id INT NOT NULL,
        orden_trabajo_id INT NOT NULL,
        fecha_servicio DATE NOT NULL,
        kilometraje INT,
        diagnostico_inicial TEXT,
        reparaciones_realizadas TEXT,
        recomendaciones_futuras TEXT,
        proximo_mantenimiento_km INT,
        fecha_proximo_mantenimiento DATE,
        observaciones TEXT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id),
        FOREIGN KEY (orden_trabajo_id) REFERENCES ordenes_trabajo(id)
      )
    `);

    // Crear tabla notificaciones
    await connection.query(`
      CREATE TABLE notificaciones (
        id INT PRIMARY KEY AUTO_INCREMENT,
        usuario_id INT NOT NULL,
        tipo ENUM('cita', 'orden_trabajo', 'mantenimiento', 'sistema') NOT NULL,
        titulo VARCHAR(200) NOT NULL,
        mensaje TEXT,
        leida BOOLEAN DEFAULT FALSE,
        fecha_programada DATETIME,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      )
    `);

    console.log('Todas las tablas creadas exitosamente');

    // Insertar datos de prueba
    await connection.query(`
      INSERT INTO servicios (nombre, descripcion, precio_base, tiempo_estimado, categoria) VALUES
      ('Cambio de aceite', 'Cambio de aceite y filtro', 150.00, 30, 'mantenimiento'),
      ('Alineación y balanceo', 'Alineación y balanceo de neumáticos', 200.00, 60, 'suspension'),
      ('Revisión de frenos', 'Inspección completa del sistema de frenos', 100.00, 45, 'frenos')
    `);

    console.log('Datos de prueba insertados');
    console.log('Migración completada exitosamente');

  } catch (error) {
    console.error('Error durante la migración:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

migrateTestDatabase();