import { consultarAPI } from './api.js';

const listaFavoritos = document.getElementById('lista-favoritos');
const idUsuario = localStorage.getItem('id_usuario');

document.addEventListener('DOMContentLoaded', async () => {
    if (!idUsuario) {
        alert('Debés iniciar sesión para ver tus favoritos.');
        window.location.href = 'login.html';
        return;
    }

    cargarFavoritos();
});


async function cargarFavoritos() {
    try {
        listaFavoritos.innerHTML = '<p>Cargando favoritos...</p>';
        const respuesta = await consultarAPI(`/obtenerFavoritos/${idUsuario}`, 'GET');
        const favList = respuesta.payload || respuesta; // [{ idProducto: 2 }, ...]

        if (favList && favList.length > 0) {
            const favIds = favList.map(f => f.idProducto);

            // Obtenemos todos los productos del catálogo para cruzar datos
            const prodsRes = await consultarAPI('/obtenerProductos');
            const allProds = prodsRes.payload || prodsRes;

            const favoritosData = allProds.filter(p => favIds.includes(p.idProducto));

            listaFavoritos.innerHTML = '';

            if (favoritosData.length > 0) {
                // Detectar ruta basePath
                const basePath = window.location.pathname.includes('/frontend/') ? '/frontend' : '';

                favoritosData.forEach(producto => {
                    const imagen = producto.ulrImagen || producto.urlImagen || producto.imagen || 'https://via.placeholder.com/150';
                    const card = document.createElement('div');
                    card.className = 'product-card';
                    card.style = 'display:flex; gap:15px; border-bottom:1px solid var(--border-color); padding:10px; align-items:center; justify-content:space-between; margin-bottom:10px;';
                    card.innerHTML = `
                        <div style="display:flex; align-items:center; gap:15px; cursor:pointer;" class="btn-ir-detalle" data-id="${producto.idProducto}">
                            <img src="${imagen}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;">
                            <div>
                                <h4 style="margin:0;">${producto.producto}</h4>
                                <p style="margin:5px 0 0; font-weight:bold;">$${parseFloat(producto.precio).toLocaleString()}</p>
                            </div>
                        </div>
                        <button class="btn-danger btn-eliminar-fav" data-id="${producto.idProducto}">Eliminar</button>
                    `;
                    listaFavoritos.appendChild(card);
                });

                // Escuchadores para redirección al detalle
                document.querySelectorAll('.btn-ir-detalle').forEach(div => {
                    div.addEventListener('click', (e) => {
                        const prodId = div.getAttribute('data-id');
                        window.location.href = `producto.html?id=${prodId}`;
                    });
                });

                // Escuchadores para eliminar de favoritos
                document.querySelectorAll('.btn-eliminar-fav').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const prodId = btn.getAttribute('data-id');
                        await eliminarFavorito(prodId);
                    });
                });

            } else {
                listaFavoritos.innerHTML = '<p>No tenés ningún producto guardado en favoritos todavía.</p>';
            }
        } else {
            listaFavoritos.innerHTML = '<p>No tenés ningún producto guardado en favoritos todavía.</p>';
        }
    } catch (error) {
        console.error('Error al cargar favoritos:', error);
        listaFavoritos.innerHTML = '<p>Hubo un error al cargar tus favoritos.</p>';
    }
}

async function eliminarFavorito(idProducto) {
    try {
        const respuesta = await consultarAPI('/eliminarFavorito', 'DELETE', { 
            id_usuario: parseInt(idUsuario), 
            id_producto: parseInt(idProducto) 
        });

        if (respuesta) {
            alert('Producto eliminado de tus favoritos.');
            cargarFavoritos();
        }
    } catch (error) {
        console.error('Error al eliminar favorito:', error);
        alert('No se pudo eliminar el producto.');
    }
}