const formPerfil = document.getElementById('form-perfil');
// Recuperamos el ID del usuario que guardamos en el Login
const idUsuario = localStorage.getItem('id_usuario');

// 1. Cargar los datos ni bien carga la página
document.addEventListener('DOMContentLoaded', async () => {
    // Si no hay ID, lo pateamos al login
    if (!idUsuario) {
        alert('Debés iniciar sesión para ver tu perfil.');
        window.location.href = 'login.html';
        return;
    }

    try {
        // Pedimos los datos del usuario al backend
        const respuesta = await consultarAPI(`/obtenerUsuario/${idUsuario}`, 'GET');

        if (respuesta) {
            // Rellenamos los campos con lo que nos devuelve la base de datos
            document.getElementById('perfil-nombre').value = respuesta.nombre || '';
            document.getElementById('perfil-email').value = respuesta.email || '';
            document.getElementById('perfil-direccion').value = respuesta.direccion || '';
            document.getElementById('perfil-telefono').value = respuesta.telefono || '';
        }
    } catch (error) {
        console.error('Error al cargar el perfil:', error);
    }
});

// 2. Modificar los datos al enviar el formulario
formPerfil.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Capturamos lo nuevo que escribió el usuario
    const datosActualizados = {
        nombre: document.getElementById('perfil-nombre').value,
        direccion: document.getElementById('perfil-direccion').value,
        telefono: document.getElementById('perfil-telefono').value
    };

    try {
        const respuesta = await consultarAPI(`/modificarUsuario/${idUsuario}`, 'PUT', datosActualizados);

        if (respuesta) {
            alert('¡Tus datos se actualizaron correctamente!');
        }
    } catch (error) {
        console.error('Error al actualizar:', error);
        alert('Hubo un problema al guardar los cambios.');
    }
});