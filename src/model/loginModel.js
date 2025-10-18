import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

const Login = {
    login: async (correo, contrasenia) => {
        try {
            const [results] = await pool.query("CALL sp_usuarios_login(?)", [correo]);   
            const userData = results[0][0];
            
            if (!userData || !userData.usuario_encontrado) {
                return {
                    login_exitoso: false,
                    mensaje: userData ? userData.mensaje : 'Usuario no encontrado o cuenta inactiva'
                };
            }
            
            const contraseniaValida = await bcrypt.compare(contrasenia, userData.contrasenia);
            
            if (!contraseniaValida) {
                return {
                    login_exitoso: false,
                    mensaje: 'Contraseña incorrecta'
                };
            }
                        
            return {
                login_exitoso: true,
                mensaje: 'Login exitoso',
                id: userData.id,
                nombre: userData.nombre,
                apellido: userData.apellido,
                correo: userData.correo,
                telefono: userData.telefono,
                rol: userData.rol,
                estado: userData.estado
            };
            
        } catch (error) {
            res.status(500).json({ message: "Error en el proceso", error: error.message });
        }
    }
};

export default Login;