import Login from "../model/loginModel.js";

const loginController = {
    login: async (req, res) => {
        try {
            const { correo, contrasenia } = req.body;

            // Validaciones
            if (!correo || !contrasenia) {
                return res.status(400).json({ 
                    success: false,
                    message: "Correo y contraseña son requeridos" 
                });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(correo)) {
                return res.status(400).json({ 
                    success: false,
                    message: "Formato de correo inválido" 
                });
            }

            // Intentar login
            const loginResult = await Login.login(correo, contrasenia);

            if (!loginResult.login_exitoso) {
                return res.status(401).json({ 
                    success: false,
                    message: loginResult.mensaje 
                });
            }

            // Login exitoso
            res.status(200).json({ 
                success: true,
                message: loginResult.mensaje,
                user: {
                    correo: loginResult.correo,
                    rol: loginResult.rol,
                    estado: loginResult.estado 
                }
            });

        } catch (error) {
            res.status(500).json({ message: "Error en el proceso", error: error.message });
        }
    }
};

export default loginController;