import { renderHeader } from '../components/header.js';
import { consultarAPI } from './api.js';

renderHeader();

async function cargarCatalogo() {
    try {
        const contenedor = document.getElementById('grilla-productos');
        contenedor.innerHTML = '<p>Cargando productos...</p>';

        // Llamada al backend
        const res = await consultarAPI('/obtenerProductos'); //
        const productos = res.data || res; // Ajustar según respuesta exacta de la API

        contenedor.innerHTML = '';
        productos.forEach(prod => {
            contenedor.innerHTML += `
                <div class="card">
                    <img src="${prod.imagen || 'https://via.placeholder.com/150'}" alt="${prod.nombre}">
                    <h3>${prod.nombre}</h3>
                    <p>$${prod.precio}</p>
                    <a href="/pages/producto.html?id=${prod.id_producto}">Ver detalles</a>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error al cargar productos", error);
    }
}

cargarCatalogo();