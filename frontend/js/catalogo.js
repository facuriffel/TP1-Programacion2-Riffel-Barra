import { renderHeader } from './header.js';
import { consultarAPI } from './api.js';

let todosLosProductos = [];

async function iniciarCatalogo() {
    await renderHeader();

    try {
        const contenedor = document.getElementById('grilla-productos');
        contenedor.innerHTML = '<p>Cargando productos...</p>';

        // Traemos todo del backend
        const res = await consultarAPI('/obtenerProductos');
        todosLosProductos = res.payload || res.data || res;

        aplicarFiltrosDesdeURL();

    } catch (error) {
        console.error("Error al cargar productos", error);
        document.getElementById('grilla-productos').innerHTML = '<p>Error al cargar el servidor.</p>';
    }

    // Event listener del botón de la barra de filtros
    document.getElementById('btn-aplicar-filtros').addEventListener('click', () => {
        filtrarYRenderizar();
    });
}

function aplicarFiltrosDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    const busqueda = params.get('buscar') ? params.get('buscar').toLowerCase() : null;
    const categoria = params.get('categoria');

    let productosFiltrados = todosLosProductos;


    if (busqueda) {
        productosFiltrados = productosFiltrados.filter(p => p.nombre.toLowerCase().includes(busqueda));
    }


    if (categoria) {
        // Asumiendo que el id de categoría en el producto se llama id_categoria
        productosFiltrados = productosFiltrados.filter(p => p.id_categoria == categoria);
    }

    renderizarProductos(productosFiltrados);
}

function filtrarYRenderizar() {
    const generoVal = document.getElementById('filtro-genero').value;
    const colorVal = document.getElementById('filtro-color').value.toLowerCase();

    let filtrados = todosLosProductos;

    if (generoVal) filtrados = filtrados.filter(p => p.genero === generoVal); //[cite: 1]
    if (colorVal) filtrados = filtrados.filter(p => p.color && p.color.toLowerCase().includes(colorVal)); //[cite: 1]

    renderizarProductos(filtrados);
}

function renderizarProductos(productos) {
    const contenedor = document.getElementById('grilla-productos');
    contenedor.innerHTML = '';

    if (productos.length === 0) {
        contenedor.innerHTML = '<p>No se encontraron productos con esos filtros.</p>';
        return;
    }

    const basePath = window.location.pathname.includes('/frontend/') ? '/frontend' : '';

    productos.forEach(prod => {
        contenedor.innerHTML += `
            <div class="card">
                <img src="${prod.imagen || 'https://via.placeholder.com/150'}" alt="${prod.nombre}">
                <h3>${prod.nombre}</h3>
                <p>Color: ${prod.color || 'N/A'}</p>
                <p><strong>$${prod.precio}</strong></p>
                <a href="${basePath}/pages/producto.html?id=${prod.id_producto}">Ver detalles</a>
            </div>
        `;
    });
}

iniciarCatalogo();