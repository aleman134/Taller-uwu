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

        // Limpiar listeners anteriores creando nuevos elementos
        const newBtnAceptar = btnAceptar.cloneNode(true);
        const newBtnCancelar = btnCancelar.cloneNode(true);
        btnAceptar.parentNode.replaceChild(newBtnAceptar, btnAceptar);
        btnCancelar.parentNode.replaceChild(newBtnCancelar, btnCancelar);

        mensajeAlerta.textContent = mensaje;
        newBtnCancelar.style.display = 'none';
        dialogo.showModal();

        const cerrar = async () => {
            await cerrarDialogoAnimado(dialogo);
            resolve();
        };

        newBtnAceptar.addEventListener('click', cerrar, { once: true });
        btnCerrar.addEventListener('click', cerrar, { once: true });
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

        // Limpiar listeners anteriores creando nuevos elementos
        const newBtnAceptar = btnAceptar.cloneNode(true);
        const newBtnCancelar = btnCancelar.cloneNode(true);
        btnAceptar.parentNode.replaceChild(newBtnAceptar, btnAceptar);
        btnCancelar.parentNode.replaceChild(newBtnCancelar, btnCancelar);

        mensajeAlerta.textContent = mensaje;
        newBtnCancelar.style.display = 'inline-block';
        dialogo.showModal();

        const confirmar = async () => {
            await cerrarDialogoAnimado(dialogo);
            resolve(true);
        };

        const cancelar = async () => {
            await cerrarDialogoAnimado(dialogo);
            resolve(false);
        };

        newBtnAceptar.addEventListener('click', confirmar, { once: true });
        newBtnCancelar.addEventListener('click', cancelar, { once: true });
        btnCerrar.addEventListener('click', cancelar, { once: true });
    });
}
window.cerrarDialogoAnimado = cerrarDialogoAnimado;
window.mostrarDialogo = mostrarDialogo;
window.mostrarDialogoConfirmacion = mostrarDialogoConfirmacion;