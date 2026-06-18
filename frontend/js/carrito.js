import { consultarAPI } from './api.js';

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

        const items = respuesta.payload || respuesta;

        if (items && items.length > 0) {
            // Group items by idInventario to count quantity (cantidad)
            const grouped = {};
            items.forEach(item => {
                const key = item.idInventario || item.id_inventario;
                if (!grouped[key]) {
                    grouped[key] = {
                        idInventario: key,
                        nombre: item.producto || item.nombre || '',
                        precio: parseFloat(item.precio || 0),
                        imagen: item.urlImagen || item.ulrImagen || item.imagen || '',
                        talle: item.talle || '',
                        color: item.color || '',
                        cantidad: 0
                    };
                }
                grouped[key].cantidad += 1;
            });

            const groupedItems = Object.values(grouped);

            groupedItems.forEach(item => {
                const subtotal = item.precio * item.cantidad;
                total += subtotal;

                const card = document.createElement('div');
                card.className = 'cart-item';
                card.innerHTML = `
                    <div class="cart-item-info">
                        ${item.imagen ? `<img src="${item.imagen}" class="cart-item-img" alt="${item.nombre}">` : ''}
                        <div class="cart-item-details">
                            <h4>${item.nombre}</h4>
                            <p>Talle: ${item.talle} | Color: ${item.color} | Precio: $${item.precio.toLocaleString()}</p>
                        </div>
                    </div>
                    <div class="cart-item-actions">
                        <span class="cart-item-qty">Cant: ${item.cantidad}</span>
                        <span class="cart-item-subtotal">$${subtotal.toLocaleString()}</span>
                        <button class="btn-danger btn-eliminar-item" data-inv="${item.idInventario}">Eliminar</button>
                    </div>
                `;
                listaCarrito.appendChild(card);
            });

            totalCarritoEl.innerText = total.toLocaleString();
            btnPagar.disabled = false;

            // Attach event listeners to all delete buttons
            document.querySelectorAll('.btn-eliminar-item').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const idInventario = e.target.getAttribute('data-inv');
                    if (confirm('¿Estás seguro de que querés eliminar este producto del carrito?')) {
                        try {
                            const res = await consultarAPI('/eliminarProductoCarrito', 'DELETE', {
                                id_usuario: parseInt(idUsuario),
                                id_inventario: parseInt(idInventario)
                            });
                            alert('Producto eliminado con éxito.');
                            cargarCarrito(); // reload
                        } catch (err) {
                            console.error('Error al eliminar', err);
                            alert('No se pudo eliminar el producto del carrito.');
                        }
                    }
                });
            });

        } else {
            listaCarrito.innerHTML = '<p>Tu carrito está vacío.</p>';
            totalCarritoEl.innerText = '0';
            btnPagar.disabled = true;
        }
    } catch (error) {
        console.error('Error al cargar el carrito:', error);
        listaCarrito.innerHTML = '<p>Hubo un problema al cargar tu carrito.</p>';
    }
}

btnPagar.addEventListener('click', () => {
    window.location.href = 'pago.html';
});