import { renderHeader } from '../components/header.js';
import { consultarAPI } from './api.js';

renderHeader();

document.getElementById('form-producto').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nuevoProducto = {
        nombre: document.getElementById('prod-nombre').value,
        descripcion: document.getElementById('prod-desc').value,
        precio: parseFloat(document.getElementById('prod-precio').value),
        genero: document.getElementById('prod-genero').value,
        id_categoria: parseInt(document.getElementById('prod-categoria').value),
        imagen: document.getElementById('prod-img').value
    };

    try {
        // Esta ruta requiere Token de admin
        await consultarAPI('/cargarProducto', 'POST', nuevoProducto);
        alert('Producto cargado exitosamente');
        e.target.reset();
    } catch (error) {
        alert('Error al cargar producto. ¿Iniciaste sesión como Admin?');
    }
});