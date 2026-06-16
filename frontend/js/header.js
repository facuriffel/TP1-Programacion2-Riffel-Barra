// js/header.js
import { consultarAPI } from './api.js';

export async function renderHeader() {
    const header = document.createElement('header');

    // Detectamos dinámicamente si estamos corriendo bajo la carpeta "frontend"
    const basePath = window.location.pathname.includes('/frontend/') ? '/frontend' : '';

    header.innerHTML = `
        <div class="logo"><h2>Lana &amp; Lino</h2></div>

        <div class="busqueda">
            <input type="text" id="input-busqueda" placeholder="Buscar productos...">
            <button id="btn-buscar">Buscar</button>
            <select id="select-categorias-header">
                <option value="">Todas las categorías</option>
            </select>
        </div>

        <div class="acciones">
            <button id="btn-theme" title="Cambiar tema">☀ Tema</button>
            <a href="${basePath}/pages/favoritos.html">♡ Favoritos</a>
            <a href="${basePath}/pages/carrito.html">🛒 Carrito</a>
            <a href="${basePath}/pages/perfil.html">Mi Perfil</a>
            <a href="${basePath}/pages/admin.html" id="btn-admin" style="display:none;">Gestionar</a>
            <a href="${basePath}/pages/login.html" id="btn-login">Iniciar Sesión</a>
        </div>
    `;

    document.body.prepend(header);

    // ── Buscador ──
    const btnBuscar    = document.getElementById('btn-buscar');
    const inputBusqueda = document.getElementById('input-busqueda');

    const ejecutarBusqueda = () => {
        const termino = inputBusqueda.value.trim();
        window.location.href = `${basePath}/index.html?buscar=${encodeURIComponent(termino)}`;
    };

    btnBuscar.addEventListener('click', ejecutarBusqueda);
    inputBusqueda.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') ejecutarBusqueda();
    });

    // ── Categorías ──
    const selectCategorias = document.getElementById('select-categorias-header');
    selectCategorias.addEventListener('change', (e) => {
        const catId = e.target.value;
        window.location.href = catId
            ? `${basePath}/index.html?categoria=${catId}`
            : `${basePath}/index.html`;
    });

    // ── Tema oscuro ──
    const btnTheme = document.getElementById('btn-theme');
    const applyTheme = (theme) => {
        document.body.setAttribute('data-theme', theme);
        btnTheme.textContent = theme === 'dark' ? '☀ Tema' : '🌙 Tema';
    };

    btnTheme.addEventListener('click', () => {
        const current = document.body.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', next);
        applyTheme(next);
    });

    if (localStorage.getItem('theme') === 'dark') applyTheme('dark');

    // ── Categorías dinámicas ──
    try {
        const respuesta = await consultarAPI('/obtenerCategorias');
        const categorias = respuesta.payload || respuesta;
        if (Array.isArray(categorias)) {
            categorias.forEach(cat => {
                selectCategorias.innerHTML += `<option value="${cat.id_categoria}">${cat.nombre}</option>`;
            });
        }
    } catch {
        console.warn('No se pudieron cargar las categorías en el header.');
    }
}
