const API_URL_LOGIN = API_CONFIG.login;
window.addEventListener('DOMContentLoaded', () => {
  const usuario = localStorage.getItem('usuario');
  if (usuario) {
    const userData = JSON.parse(usuario);
    if (userData.rol === 'administrador') {
<<<<<<< HEAD
      window.location.replace('./src/view/public/admin/dashboard.html');
    } else if (userData.rol === 'mecanico') {
      window.location.replace('./src/view/public/mecanico/dashboard.html');
=======
      window.location.replace('../public/admin/dashboard.html');
    } else if (userData.rol === 'mecanico') {
      window.location.replace('../public/mecanico/dashboard.html');
>>>>>>> bd88513e37169740585f71e73c6baca4887e03d1
    }
  }
});

document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();

  const data = {
    correo: e.target.correo.value,
    contrasenia: e.target.contrasenia.value
  };

  try {
    const res = await fetch(`${API_URL_LOGIN}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const json = await res.json();

    if (res.ok && json.success) {
      localStorage.setItem('usuario', JSON.stringify(json.user));

      if (json.user.rol === 'administrador') {
<<<<<<< HEAD
        window.location.replace('./src/view/public/admin/dashboard.html');
      } else {
        window.location.replace('./src/view/mecanico/admin/dashboard.html');
=======
        window.location.replace('../public/admin/dashboard.html');
      } else {
        window.location.replace('../public/mecanico/dashboard.html');
>>>>>>> bd88513e37169740585f71e73c6baca4887e03d1
      }

    } else {
      alert(json.message || 'Usuario o contraseña incorrectos');
    }

  } catch (err) {
    console.error(err);
    alert('Error de conexión con el servidor');
  }
});