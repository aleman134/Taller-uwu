// autenticacion
async function verificarAutenticacion(rolPermitido = null) {
  const user = JSON.parse(localStorage.getItem("usuario"));

  if (!user) {

    window.location.replace("/index.html");

    return false;
  }

  if (rolPermitido && user.rol !== rolPermitido) {
    await mostrarDialogo("No tienes permisos para acceder a esta sección");

    window.location.replace("/index.html");

    return false;
  }

  return user;
}

// verificacion de la sesion
function iniciarVerificacionSesion(intervalo = 30000) {
  setInterval(() => {
    const user = localStorage.getItem("usuario");
    if (!user) {

      window.location.replace("/index.html");

    }
  }, intervalo);
}