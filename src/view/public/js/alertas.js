// Animación de cierre con promesa
function cerrarDialogoAnimado(dialogo) {
    return new Promise(resolve => {
        dialogo.classList.add('cerrando');
        dialogo.addEventListener('animationend', () => {
            dialogo.classList.remove('cerrando');
            dialogo.close();
            resolve();
        }, { once: true });
    });
}

// Alerta simple (OK)
function mostrarDialogo(mensaje) {
    return new Promise(resolve => {
        const dialogo = document.getElementById('dialogo-alerta');
        const mensajeAlerta = document.getElementById('mensaje-alerta');
        const btnAceptar = document.getElementById('btnAceptarDialogo');
        const btnCancelar = document.getElementById('btnCancelarDialogo');
        const btnCerrar = dialogo.querySelector('.cerrar-alerta');

        mensajeAlerta.textContent = mensaje;
        btnCancelar.style.display = 'none';
        dialogo.showModal();

        const cerrar = async () => {
            await cerrarDialogoAnimado(dialogo);
            resolve();
        };

        btnAceptar.onclick = cerrar;
        btnCerrar.onclick = cerrar;
    });
}

// Alerta de confirmación (Aceptar / Cancelar)
function mostrarDialogoConfirmacion(mensaje) {
    return new Promise(resolve => {
        const dialogo = document.getElementById('dialogo-alerta');
        const mensajeAlerta = document.getElementById('mensaje-alerta');
        const btnAceptar = document.getElementById('btnAceptarDialogo');
        const btnCancelar = document.getElementById('btnCancelarDialogo');
        const btnCerrar = dialogo.querySelector('.cerrar-alerta');

        mensajeAlerta.textContent = mensaje;
        btnCancelar.style.display = 'inline-block';
        dialogo.showModal();

        const confirmar = async () => {
            await cerrarDialogoAnimado(dialogo);
            resolve(true);
        };

        const cancelar = async () => {
            await cerrarDialogoAnimado(dialogo);
            resolve(false);
        };

        btnAceptar.onclick = confirmar;
        btnCancelar.onclick = cancelar;
        btnCerrar.onclick = cancelar;
    });
}