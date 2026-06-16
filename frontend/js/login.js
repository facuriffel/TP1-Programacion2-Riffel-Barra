
const formLogin = document.getElementById('form-login');
const formRegister = document.getElementById('form-register');


formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const respuesta = await consultarAPI('/login', 'POST', { email, password });

        if (respuesta && respuesta.token) {
            localStorage.setItem('token_jwt', respuesta.token);
            localStorage.setItem('id_usuario', respuesta.usuario.id);

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
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
        const respuesta = await consultarAPI('/registrarUsuario', 'POST', { nombre, email, password });

        if (respuesta) {
            alert('¡Registro exitoso! Ahora podés iniciar sesión.');
            formRegister.reset();
        }
    } catch (error) {
        console.error('Error en el registro:', error);
        alert('Hubo un problema al crear la cuenta.');
    }
});