import { renderHeader } from './header.js';
import { consultarAPI } from './api.js';

// Bloqueo de acceso si no es administrador
const token = localStorage.getItem('token_jwt');
const rol = localStorage.getItem('rol');

if (!token || rol !== 'Administrador') {
    alert('Acceso denegado: se requiere rol de Administrador.');
    window.location.href = '../index.html';
}

renderHeader();

const form = document.getElementById('form-producto');
const btnCancelar = document.getElementById('btn-cancelar-edicion');
const tituloFormulario = document.getElementById('titulo-formulario');

let loadedInventarios = []; // guardamos los registros del producto buscado

document.getElementById('btn-buscar-modificar').addEventListener('click', async () => {
    const id = document.getElementById('buscar-id-prod').value;
    const msj = document.getElementById('msj-busqueda');

    if (!id) return;

    try {
        msj.innerText = "Buscando producto...";
        msj.style.color = "var(--text-color)";

        const res = await consultarAPI(`/obtenerDatosProducto/${id}`);
        let items = res.payload || res;

        // Fallback si no tiene inventario
        if (!Array.isArray(items) || items.length === 0) {
            const allRes = await consultarAPI('/obtenerProductos');
            const allProds = allRes.payload || allRes;
            const found = allProds.find(p => p.idProducto == id);
            if (found) {
                items = [{
                    idProducto: found.idProducto,
                    producto: found.producto,
                    nombre: found.producto,
                    descripcion: found.descripcion,
                    precio: found.precio,
                    genero: found.genero,
                    ulrImagen: found.ulrImagen || found.urlImagen || found.imagen,
                    idCategoria: found.idCategoria,
                    talle: null,
                    color: null,
                    stock: 0,
                    idInventario: null
                }];
            }
        }

        if (!items || items.length === 0) {
            throw new Error("Producto no encontrado");
        }

        const prod = items[0];
        loadedInventarios = items.filter(item => item.idInventario !== null);

        // Llenamos el formulario con los datos viejos
        document.getElementById('prod-id').value = prod.idProducto || id;
        document.getElementById('prod-nombre').value = prod.producto || prod.nombre || '';
        document.getElementById('prod-desc').value = prod.descripcion || '';
        document.getElementById('prod-precio').value = prod.precio || 0;
        document.getElementById('prod-genero').value = prod.genero || '';
        document.getElementById('prod-color').value = prod.color || '';
        document.getElementById('prod-categoria').value = prod.idCategoria || prod.id_categoria || '';
        document.getElementById('prod-stock').value = prod.stock || 0;

        tituloFormulario.innerText = `Modificando Producto #${id}`;
        btnCancelar.style.display = 'inline-block';
        msj.innerText = "Producto cargado para edición.";
        msj.style.color = "var(--success)";
    } catch (error) {
        msj.innerText = "Producto no encontrado.";
        msj.style.color = "var(--danger)";
    }
});

btnCancelar.addEventListener('click', () => {
    form.reset();
    document.getElementById('prod-id').value = '';
    tituloFormulario.innerText = "Cargar Nuevo Producto";
    btnCancelar.style.display = 'none';
    document.getElementById('msj-busqueda').innerText = "";
    loadedInventarios = [];
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const idExistente = document.getElementById('prod-id').value;

    const nombre = document.getElementById('prod-nombre').value;
    const descripcion = document.getElementById('prod-desc').value;
    const precio = parseFloat(document.getElementById('prod-precio').value);
    const genero = document.getElementById('prod-genero').value;
    const color = document.getElementById('prod-color').value;
    const id_categoria = parseInt(document.getElementById('prod-categoria').value);
    const stock = parseInt(document.getElementById('prod-stock').value);

    try {
        if (idExistente) {
            // Modificación:
            // 1. Si el producto ya tiene un registro de inventario, actualizamos el stock del mismo
            if (loadedInventarios.length > 0) {
                const primaryInv = loadedInventarios[0];
                await consultarAPI('/modificarStock', 'PUT', {
                    id_inventario: primaryInv.idInventario,
                    stock: stock
                });
            } else {
                // 2. Si no tiene inventario, creamos uno con el stock indicado
                await consultarAPI('/crearInventario', 'POST', {
                    talle: 'Único',
                    color: color || 'Único',
                    stock: stock,
                    id_producto: parseInt(idExistente)
                });
            }
            alert('¡El stock del producto se actualizó con éxito en la base de datos! (Los demás campos se simularon en el cliente de acuerdo a los límites del backend).');
        } else {
            // Creación:
            // 1. Cargamos el producto
            const createRes = await consultarAPI('/cargarProducto', 'POST', {
                nombre,
                descripcion,
                precio,
                genero,
                id_categoria,
                imagen: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80' // imagen por defecto
            });

            const payload = createRes.payload || createRes;
            const newId = payload && payload[0] ? (payload[0].idProducto || payload[0].id_producto) : null;

            // 2. Si se ingresó stock, creamos el inventario para el producto creado
            if (newId && stock > 0) {
                await consultarAPI('/crearInventario', 'POST', {
                    talle: 'Único',
                    color: color || 'Único',
                    stock: stock,
                    id_producto: parseInt(newId)
                });
            }
            alert('¡Producto creado con éxito en la base de datos (se asignó el stock correspondiente)!');
        }

        btnCancelar.click();
    } catch (error) {
        console.error('Error al guardar producto:', error);
        alert('Error al guardar. Verifica si el backend está corriendo y si tienes permisos.');
    }
});