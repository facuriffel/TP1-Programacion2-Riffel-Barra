const listaCarrito = document.getElementById('lista-carrito');
const totalCarritoEl = document.getElementById('total-carrito');
const btnPagar = document.getElementById('btn-pagar');
const idUsuario = localStorage.getItem('id_usuario');

document.addEventListener('DOMContentLoaded', async () => {
    if (!idUsuario) {
        alert('Debés iniciar sesión para ver tu carrito.');
        window.location.href = 'login.html';
        return;
    }
    cargarCarrito();
});

async function cargarCarrito() {
    try {
        const respuesta = await consultarAPI(`/obtenerProductosCarrito/${idUsuario}`, 'GET');
        listaCarrito.innerHTML = '';
        let total = 0;

        if (respuesta && respuesta.length > 0) {
            respuesta.forEach(item => {
                total += item.precio * item.cantidad;
                listaCarrito.innerHTML += `
                    <div class="cart-item">
                        <h4>${item.nombre}</h4>
                        <p>Precio: $${item.precio} | Cantidad: ${item.cantidad}</p>
                    </div>
                `;
            });
            totalCarritoEl.innerText = total;
            btnPagar.disabled = false;
        } else {
            listaCarrito.innerHTML = '<p>Tu carrito está vacío.</p>';
            btnPagar.disabled = true;
        }
    } catch (error) {
        console.error('Error al cargar el carrito:', error);
    }
}

btnPagar.addEventListener('click', () => {
    window.location.href = 'pago.html';
});