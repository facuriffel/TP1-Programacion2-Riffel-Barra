import { consultarAPI } from './api.js';

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
        const datos = respuesta.payload && respuesta.payload[0] ? respuesta.payload[0] : respuesta;

        if (datos) {
            // Rellenamos los campos con lo que nos devuelve la base de datos
            document.getElementById('perfil-nombre').value = datos.nombre || '';
            document.getElementById('perfil-apellido').value = datos.apellido || '';
            document.getElementById('perfil-email').value = datos.email || '';
            document.getElementById('perfil-password').value = datos.password || '';
            document.getElementById('perfil-direccion').value = datos.direccion || '';
            document.getElementById('perfil-telefono').value = datos.telefono || '';
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
        apellido: document.getElementById('perfil-apellido').value,
        email: document.getElementById('perfil-email').value,
        password: document.getElementById('perfil-password').value,
        direccion: document.getElementById('perfil-direccion').value,
        telefono: document.getElementById('perfil-telefono').value,
        rol: localStorage.getItem('rol') || 'cliente'
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