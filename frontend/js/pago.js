import { consultarAPI } from './api.js';

const formPago = document.getElementById('form-pago');
const metodoPago = document.getElementById('metodo-pago');
const datosTarjeta = document.getElementById('datos-tarjeta');
const resumenItems = document.getElementById('resumen-items');
const totalPagoEl = document.getElementById('total-pago');
const btnPagar = document.getElementById('btn-pagar');

const numTarjeta = document.getElementById('num-tarjeta');
const vencimientoTarjeta = document.getElementById('vencimiento-tarjeta');
const titularTarjeta = document.getElementById('titular-tarjeta');

const idUsuario = localStorage.getItem('id_usuario');

document.addEventListener('DOMContentLoaded', async () => {
    if (!idUsuario) {
        alert('Debés iniciar sesión para finalizar tu compra.');
        window.location.href = 'login.html';
        return;
    }
    await cargarResumenCompra();
    validarFormulario();
});

async function cargarResumenCompra() {
    try {
        const respuesta = await consultarAPI(`/obtenerProductosCarrito/${idUsuario}`, 'GET');
        resumenItems.innerHTML = '';
        let total = 0;

        const items = respuesta.payload || respuesta;

        if (items && items.length > 0) {
            // Group items to count quantity (cantidad)
            const grouped = {};
            items.forEach(item => {
                const key = item.idInventario || item.id_inventario;
                if (!grouped[key]) {
                    grouped[key] = {
                        nombre: item.producto || item.nombre || '',
                        precio: parseFloat(item.precio || 0),
                        cantidad: 0
                    };
                }
                grouped[key].cantidad += 1;
            });

            const groupedItems = Object.values(grouped);

            groupedItems.forEach(item => {
                const subtotal = item.precio * item.cantidad;
                total += subtotal;

                const itemDiv = document.createElement('div');
                itemDiv.className = 'summary-item';
                itemDiv.innerHTML = `
                    <span>${item.nombre} (x${item.cantidad})</span>
                    <span>$${subtotal.toLocaleString()}</span>
                `;
                resumenItems.appendChild(itemDiv);
            });

            totalPagoEl.innerText = total.toLocaleString();
        } else {
            resumenItems.innerHTML = '<p>No hay productos en el carrito.</p>';
            totalPagoEl.innerText = '0';
            btnPagar.disabled = true;
        }
    } catch (error) {
        console.error('Error al cargar resumen:', error);
        resumenItems.innerHTML = '<p>Error al cargar el resumen de compra.</p>';
    }
}

// Lógica de visualización y validación dinámica
metodoPago.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'debito' || val === 'credito') {
        datosTarjeta.style.display = 'block';
    } else {
        datosTarjeta.style.display = 'none';
        // Limpiamos los campos para evitar mantener datos basura
        numTarjeta.value = '';
        vencimientoTarjeta.value = '';
        titularTarjeta.value = '';
    }
    validarFormulario();
});

// Registrar eventos de teclado/input para validar
[metodoPago, numTarjeta, vencimientoTarjeta, titularTarjeta].forEach(el => {
    el.addEventListener('input', validarFormulario);
    el.addEventListener('change', validarFormulario);
});

function validarFormulario() {
    const metodo = metodoPago.value;

    if (!metodo) {
        btnPagar.disabled = true;
        return;
    }

    if (metodo === 'transferencia') {
        btnPagar.disabled = false;
        return;
    }

    if (metodo === 'debito' || metodo === 'credito') {
        const numVal = numTarjeta.value.replace(/\s+/g, ''); // eliminar espacios
        const vencVal = vencimientoTarjeta.value.trim();
        const titularVal = titularTarjeta.value.trim();

        // Validación básica de tarjeta
        const esNumValido = numVal.length === 16 && /^\d+$/.test(numVal);
        const esVencValido = vencVal.length >= 4 && vencVal.includes('/');
        const esTitularValido = titularVal.length >= 3;

        if (esNumValido && esVencValido && esTitularValido) {
            btnPagar.disabled = false;
        } else {
            btnPagar.disabled = true;
        }
    }
}

formPago.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('¡Pago aprobado con éxito! Gracias por tu compra en Lana & Lino.');
    window.location.href = '../index.html';
});