// components/header.js
import { consultarAPI } from '../js/api.js';

export async function renderHeader() {
    const header = document.createElement('header');
    header.style.position = 'sticky';
    header.style.top = '0';
    header.style.backgroundColor = 'var(--nav-bg)';
    header.style.padding = '15px';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.borderBottom = '1px solid #ccc';
    header.style.zIndex = '1000';

    header.innerHTML = `
        <div class="logo"><h2>Lana & Lino</h2></div>
        <div class="busqueda" style="display:flex; gap:10px;">
            <input type="text" id="input-busqueda" placeholder="Buscar por nombre..." style="padding:5px;">
            <button id="btn-buscar" style="padding:5px;">Buscar</button>
            <select id="select-categorias-header" style="padding:5px;">
                <option value="">Todas las categorías</option>
            </select>
        </div>
        <div class="acciones" style="display:flex; gap:15px; align-items:center;">
            <button id="btn-theme" style="padding:5px; cursor:pointer;"> Modo </button>
            <a href="/frontend/pages/favoritos.html"> Favoritos </a>
            <a href="/frontend/pages/carrito.html"> Carrito </a>
            <a href="/frontend/pages/perfil.html"> Mi Perfil </a>
            <!-- El Admin solo debería verse si es admin, pero lo dejamos maquetado -->
            <a href="/frontend/pages/admin.html" id="btn-admin" style="display:none;"> Gestionar </a>
            <a href="/frontend/pages/login.html" id="btn-login">Iniciar Sesión</a>
        </div>
    `;
    document.body.prepend(header);

    // Lógica Buscador: Redirige al index pasándole el parámetro de búsqueda en la URL
    const btnBuscar = document.getElementById('btn-buscar');
    const inputBusqueda = document.getElementById('input-busqueda');

    const ejecutarBusqueda = () => {
        const termino = inputBusqueda.value.trim();
        window.location.href = `/frontend/index.html?buscar=${termino}`;
    };

    btnBuscar.addEventListener('click', ejecutarBusqueda);
    inputBusqueda.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') ejecutarBusqueda();
    });

    // Lógica Desplegable Categorías
    const selectCategorias = document.getElementById('select-categorias-header');
    selectCategorias.addEventListener('change', (e) => {
        const catId = e.target.value;
        if (catId) {
            window.location.href = `/frontend/index.html?categoria=${catId}`;
        } else {
            window.location.href = `/frontend/index.html`;
        }
    });

    // Lógica del modo oscuro
    document.getElementById('btn-theme').addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    if (localStorage.getItem('theme') === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    }

    // Cargar categorías dinámicas en el header
    try {
        const categorias = await consultarAPI('/obtenerCategorias');
        categorias.forEach(cat => {
            selectCategorias.innerHTML += `<option value="${cat.id_categoria}">${cat.nombre}</option>`;
        });
    } catch (error) {
        console.error("No se pudieron cargar las categorías en el header");
    }
}