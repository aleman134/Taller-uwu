function logout() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    localStorage.removeItem("usuario");
<<<<<<< HEAD
    window.location.replace("/index.html");
=======
    window.location.replace("/src/view/public/login.html");
>>>>>>> bd88513e37169740585f71e73c6baca4887e03d1
  }
}  