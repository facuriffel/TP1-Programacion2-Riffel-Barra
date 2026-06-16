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
        const respuesta = await consultarAPI(`/obtenerFavoritos/${idUsuario}`, 'GET');
        listaFavoritos.innerHTML = '';

        if (respuesta && respuesta.length > 0) {
            respuesta.forEach(producto => {
                listaFavoritos.innerHTML += `
                    <div class="product-card">
                        <h3>${producto.nombre}</h3>
                        <p>Precio: $${producto.precio}</p>
                        <button onclick="eliminarFavorito(${producto.id})" class="btn-danger">Eliminar de favoritos</button>
                    </div>
                `;
            });
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
        const respuesta = await consultarAPI('/eliminarFavorito', 'DELETE', { idUsuario, idProducto });

        if (respuesta) {
            alert('Producto eliminado de tus favoritos.');
            cargarFavoritos();
        }
    } catch (error) {
        console.error('Error al eliminar favorito:', error);
        alert('No se pudo eliminar el producto.');
    }
}