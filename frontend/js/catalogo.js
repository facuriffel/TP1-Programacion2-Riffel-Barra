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
        const rawProductos = res.payload || res.data || res;

        // Consultamos en paralelo el inventario de cada producto para obtener talles, colores y stock
        todosLosProductos = await Promise.all(rawProductos.map(async (p) => {
            const currentId = p.idProducto || p.id_producto;
            try {
                const detailRes = await consultarAPI(`/obtenerDatosProducto/${currentId}`);
                const details = detailRes.payload || detailRes;
                
                // Extraer colores y talles únicos
                const colors = Array.isArray(details) ? details.map(d => d.color).filter(Boolean) : [];
                const sizes = Array.isArray(details) ? details.map(d => d.talle).filter(Boolean) : [];
                const stockSum = Array.isArray(details) ? details.reduce((sum, d) => sum + (d.stock || 0), 0) : 0;
                
                return {
                    id_producto: currentId,
                    nombre: p.producto || p.nombre,
                    descripcion: p.descripcion,
                    precio: p.precio,
                    genero: p.genero,
                    imagen: p.ulrImagen || p.urlImagen || p.imagen || 'https://via.placeholder.com/150',
                    id_categoria: p.idCategoria || p.id_categoria,
                    categoria: p.categoria,
                    color: [...new Set(colors)].join(', '),
                    talles: [...new Set(sizes)],
                    stock: stockSum
                };
            } catch (err) {
                console.error("Error al traer inventario del producto:", currentId, err);
                return {
                    id_producto: currentId,
                    nombre: p.producto || p.nombre,
                    descripcion: p.descripcion,
                    precio: p.precio,
                    genero: p.genero,
                    imagen: p.ulrImagen || p.urlImagen || p.imagen || 'https://via.placeholder.com/150',
                    id_categoria: p.idCategoria || p.id_categoria,
                    categoria: p.categoria,
                    color: '',
                    talles: [],
                    stock: 0
                };
            }
        }));

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

function getColorHex(colorStr) {
    if (!colorStr) return '#ccc';
    const map = {
        'beige': '#E5D3B3',
        'negro': '#1A1A1A',
        'blanco': '#FFFFFF',
        'rojo': '#E53E3E',
        'azul': '#3182CE',
        'verde': '#38A169',
        'gris': '#718096',
        'amarillo': '#ECC94B',
        'rosa': '#ED64A5',
        'natural': '#F5F5DC'
    };
    const clean = colorStr.toLowerCase().trim().split(',')[0];
    return map[clean] || '#8B6E5A';
}

function renderizarProductos(productos) {
    const contenedor = document.getElementById('grilla-productos');
    contenedor.innerHTML = '';

    if (productos.length === 0) {
        contenedor.innerHTML = '<p>No se encontraron productos con esos filtros.</p>';
        return;
    }

    const basePath = window.location.pathname.includes('/frontend/') ? '/frontend' : '';
    const pagePath = '/pages/producto.html';

    productos.forEach(prod => {
        const primaryColor = prod.color ? prod.color.split(',')[0].trim() : 'N/A';
        const colorHex = getColorHex(primaryColor);
        
        contenedor.innerHTML += `
            <div class="card" onclick="window.location.href='${basePath}${pagePath}?id=${prod.id_producto}'">
                <div class="card-image-wrapper">
                    <img src="${prod.imagen || 'https://via.placeholder.com/150'}" alt="${prod.nombre}">
                    ${prod.categoria ? `<span class="card-category">${prod.categoria}</span>` : ''}
                </div>
                <div class="card-content">
                    <h3 class="card-title">${prod.nombre}</h3>
                    <div class="card-meta">
                        <span class="card-color">
                            <span class="dot" style="background-color: ${colorHex};"></span>
                            ${prod.color || 'Sin color'}
                        </span>
                    </div>
                    <div class="card-footer">
                        <div class="card-price">
                            <span class="price-label">Precio</span>
                            <span class="price-val">$${prod.precio.toLocaleString()}</span>
                        </div>
                        <span class="card-btn-action">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </span>
                    </div>
                </div>
            </div>
        `;
    });
}

iniciarCatalogo();