import { renderHeader } from './header.js';
import { consultarAPI } from './api.js';

renderHeader();

const form = document.getElementById('form-producto');
const btnCancelar = document.getElementById('btn-cancelar-edicion');
const tituloFormulario = document.getElementById('titulo-formulario');


document.getElementById('btn-buscar-modificar').addEventListener('click', async () => {
    const id = document.getElementById('buscar-id-prod').value;
    const msj = document.getElementById('msj-busqueda');

    if (!id) return;

    try {
        const prod = await consultarAPI(`/obtenerDatosProducto/${id}`);

        // Llenamos el formulario con los datos viejos
        document.getElementById('prod-id').value = prod.id_producto || id;
        document.getElementById('prod-nombre').value = prod.nombre;
        document.getElementById('prod-desc').value = prod.descripcion;
        document.getElementById('prod-precio').value = prod.precio;
        document.getElementById('prod-genero').value = prod.genero;
        document.getElementById('prod-color').value = prod.color || '';
        document.getElementById('prod-categoria').value = prod.id_categoria;
        document.getElementById('prod-stock').value = prod.stock || 0; //[cite: 1]

        tituloFormulario.innerText = `Modificando Producto #${id}`;
        btnCancelar.style.display = 'inline-block';
        msj.innerText = "Producto cargado para edición.";
        msj.style.color = "green";
    } catch (error) {
        msj.innerText = "Producto no encontrado.";
        msj.style.color = "red";
    }
});


btnCancelar.addEventListener('click', () => {
    form.reset();
    document.getElementById('prod-id').value = '';
    tituloFormulario.innerText = "Cargar Nuevo Producto";
    btnCancelar.style.display = 'none';
    document.getElementById('msj-busqueda').innerText = "";
});


form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const idExistente = document.getElementById('prod-id').value;

    const datosProducto = {
        nombre: document.getElementById('prod-nombre').value,
        descripcion: document.getElementById('prod-desc').value,
        precio: parseFloat(document.getElementById('prod-precio').value),
        genero: document.getElementById('prod-genero').value,
        color: document.getElementById('prod-color').value,
        id_categoria: parseInt(document.getElementById('prod-categoria').value),
        stock: parseInt(document.getElementById('prod-stock').value)
    };

    try {
        if (idExistente) {

            await consultarAPI(`/modificarProducto/${idExistente}`, 'PUT', datosProducto); // Ajustar URL exacta según profesores
            alert('Producto modificado con éxito!');
        } else {

            await consultarAPI('/cargarProducto', 'POST', datosProducto);
            alert('Producto creado con éxito!');
        }

        btnCancelar.click();
    } catch (error) {
        alert('Error al guardar. Revisá si el backend está corriendo y si tenés permisos.');
    }
});