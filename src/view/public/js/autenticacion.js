// autenticacion
function verificarAutenticacion(rolPermitido = null) {
  const user = JSON.parse(localStorage.getItem("usuario"));

  if (!user) {
<<<<<<< HEAD
    window.location.replace("/src/login.html");
=======
    window.location.replace("/src/view/public/login.html");
>>>>>>> bd88513e37169740585f71e73c6baca4887e03d1
    return false;
  }

  if (rolPermitido && user.rol !== rolPermitido) {
    alert("No tienes permisos para acceder a esta sección");
<<<<<<< HEAD
    window.location.replace("/src/login.html");
=======
    window.location.replace("/src/view/public/login.html");
>>>>>>> bd88513e37169740585f71e73c6baca4887e03d1
    return false;
  }

  return user;
}

// verificacion de la sesion
function iniciarVerificacionSesion(intervalo = 30000) {
  setInterval(() => {
    const user = localStorage.getItem("usuario");
    if (!user) {
<<<<<<< HEAD
      window.location.replace("/src/login.html");
=======
      window.location.replace("/src/view/public/login.html");
>>>>>>> bd88513e37169740585f71e73c6baca4887e03d1
    }
  }, intervalo);
}