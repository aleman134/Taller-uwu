async function logout() {
  const confirmado = await mostrarDialogoConfirmacion('¿Estás seguro de que deseas cerrar sesión?');
  
  if (confirmado) {
    localStorage.removeItem("usuario");

    window.location.replace("/index.html");
    
  }
}