function logout() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    localStorage.removeItem("usuario");

    window.location.replace("/index.html");

  }
}  