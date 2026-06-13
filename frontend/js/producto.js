import { renderHeader } from '../components/header.js';
import { consultarAPI } from './api.js';

renderHeader();

async function cargarDetalle() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const container = document.getElementById('detalle-container');

    if (!id) {
        container.innerHTML = '<p>Producto no encontrado.</p>';
        return;
    }

    try {
        const prod = await consultarAPI(`/obtenerDatosProducto/${id}`); //

        container.innerHTML = `
            <div style="display: flex; gap: 20px;">
                <img src="${prod.imagen || 'https://via.placeholder.com/300'}" style="max-width: 300px;">
                <div>
                    <h2>${prod.nombre}</h2>
                    <p>${prod.descripcion}</p>
                    <h3>$${prod.precio}</h3>
                    
                    <div>
                        <label>Seleccione Cuotas:</label>
                        <select id="selector-cuotas" data-precio="${prod.precio}">
                            <option value="1">1 pago de $${prod.precio}</option>
                            <option value="3">3 cuotas de $${(prod.precio / 3).toFixed(2)}</option>
                            <option value="6">6 cuotas de $${(prod.precio / 6).toFixed(2)}</option>
                            <option value="9">9 cuotas de $${(prod.precio / 9).toFixed(2)}</option>
                            <option value="12">12 cuotas de $${(prod.precio / 12).toFixed(2)}</option>
                        </select>
                    </div>

                    ${prod.stock > 0
                ? `<button id="btn-agregar-carrito" data-id="${prod.id_inventario}">Agregar al Carrito</button>`
                : `<p style="color:red">Sin unidades disponibles</p>`}
                </div>
            </div>
        `;
    } catch (error) {
        container.innerHTML = '<p>Error al cargar el producto.</p>';
    }
}

cargarDetalle();