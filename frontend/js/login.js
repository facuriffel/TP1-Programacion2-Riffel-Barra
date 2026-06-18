import { consultarAPI } from './api.js';

const formLogin = document.getElementById('form-login');
const formRegister = document.getElementById('form-register');


formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const respuesta = await consultarAPI('/login', 'POST', { email, password });

        if (respuesta && respuesta.codigo === 200 && respuesta.jwt) {
            localStorage.setItem('token_jwt', respuesta.jwt);
            const user = respuesta.payload && respuesta.payload[0] ? respuesta.payload[0] : null;
            if (user && user.id_usuario) {
                localStorage.setItem('id_usuario', user.id_usuario);
                localStorage.setItem('rol', user.rol || 'cliente');
            }

            alert('¡Inicio de sesión exitoso!');
            window.location.href = '../index.html';
        } else {
            alert('Error al iniciar sesión. Revisa tus credenciales.');
        }
    } catch (error) {
        console.error('Error en el login:', error);
    }
});

formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('reg-nombre').value;
    const apellido = document.getElementById('reg-apellido').value;
    const direccion = document.getElementById('reg-direccion').value;
    const telefono = document.getElementById('reg-telefono').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const adminSecret = document.getElementById('reg-admin-secret').value.trim();

    try {
        const datosRegistro = {
            nombre,
            apellido,
            direccion,
            telefono,
            email,
            password,
            rol: adminSecret ? 'Administrador' : 'cliente'
        };

        if (adminSecret) {
            datosRegistro.adminSecret = adminSecret;
        }

        const respuesta = await consultarAPI('/registrarUsuario', 'POST', datosRegistro);

        if (respuesta && respuesta.codigo === 200) {
            alert('¡Registro exitoso! Ahora podés iniciar sesión.');
            formRegister.reset();
        } else if (respuesta && respuesta.mensaje) {
            alert(respuesta.mensaje);
        } else {
            alert('Hubo un problema al crear la cuenta.');
        }
    } catch (error) {
        console.error('Error en el registro:', error);
        alert('Hubo un problema al crear la cuenta.');
    }
});