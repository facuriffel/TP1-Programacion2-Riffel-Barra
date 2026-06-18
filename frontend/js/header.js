// js/header.js
import { consultarAPI } from './api.js';

export async function renderHeader() {
    const header = document.createElement('header');

    // Detectamos dinámicamente si estamos corriendo bajo la carpeta "frontend"
    const basePath = window.location.pathname.includes('/frontend/') ? '/frontend' : '';

    const token = localStorage.getItem('token_jwt');
    const rol = localStorage.getItem('rol');

    header.innerHTML = `
        <div class="logo">
            <h2>Lana &amp; Lino</h2>
            <!-- Desplegable de Productos -->
            <div class="dropdown-menu">
                <a href="${basePath}/index.html" class="dropbtn">Productos ▾</a>
                <div class="dropdown-content" id="dropdown-categorias">
                    <a href="${basePath}/index.html">Todos los productos</a>
                </div>
            </div>
        </div>

        <div class="busqueda">
            <input type="text" id="input-busqueda" placeholder="Buscar productos...">
            <button id="btn-buscar">Buscar</button>
        </div>

        <div class="acciones">
            <button id="btn-theme" title="Cambiar tema">☀ Tema</button>
            <a href="${basePath}/pages/favoritos.html">♡ Favoritos</a>
            <a href="${basePath}/pages/carrito.html">🛒 Carrito</a>
            <a href="${basePath}/pages/perfil.html">Mi Perfil</a>
            <a href="${basePath}/pages/admin.html" id="btn-admin">Gestionar</a>
            <a href="${token ? '#' : basePath + '/pages/login.html'}" id="btn-login">${token ? 'Cerrar Sesión' : 'Iniciar Sesión'}</a>
        </div>
    `;

    document.body.prepend(header);

    // Mostrar botón gestionar si es administrador
    const btnAdmin = document.getElementById('btn-admin');
    if (token && rol === 'Administrador') {
        btnAdmin.style.display = 'inline-flex';
    } else {
        btnAdmin.style.display = 'none';
    }

    // Lógica del botón de login/logout
    const btnLogin = document.getElementById('btn-login');
    if (token) {
        btnLogin.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token_jwt');
            localStorage.removeItem('id_usuario');
            localStorage.removeItem('rol');
            alert('Has cerrado sesión con éxito.');
            window.location.href = `${basePath}/index.html`;
        });
    }

    // ── Buscador ──
    const btnBuscar = document.getElementById('btn-buscar');
    const inputBusqueda = document.getElementById('input-busqueda');

    const ejecutarBusqueda = () => {
        const termino = inputBusqueda.value.trim();
        window.location.href = `${basePath}/index.html?buscar=${encodeURIComponent(termino)}`;
    };

    btnBuscar.addEventListener('click', ejecutarBusqueda);
    inputBusqueda.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') ejecutarBusqueda();
    });

    // ── Lógica Hover del Desplegable ──
    const dropdownMenu = header.querySelector('.dropdown-menu');
    const dropdownContent = header.querySelector('.dropdown-content');

    dropdownMenu.addEventListener('mouseenter', () => {
        dropdownContent.style.display = 'block';
    });
    dropdownMenu.addEventListener('mouseleave', () => {
        dropdownContent.style.display = 'none';
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
        const dropdownCategorias = document.getElementById('dropdown-categorias');
        if (Array.isArray(categorias)) {
            categorias.forEach(cat => {
                dropdownCategorias.innerHTML += `<a href="${basePath}/index.html?categoria=${cat.id_categoria}">${cat.nombre}</a>`;
            });
        }
    } catch {
        console.warn('No se pudieron cargar las categorías en el header.');
    }

    // Renderizamos el footer al final de la página
    renderFooter();
}

function renderFooter() {
    // Si ya existe un footer en la página, no duplicar
    if (document.querySelector('footer')) return;

    const footer = document.createElement('footer');
    footer.innerHTML = `
        <div class="footer-container">
            <div class="footer-column large">
                <h3>Lana &amp; Lino</h3>
                <p class="description">Prendas premium de alta calidad tejidas con pasión e historia. La moda más fresca, natural y confortable para vos.</p>
            </div>
            <div class="footer-column">
                <h4>Contacto</h4>
                <p>📧 Email: contacto@lanaylino.com</p>
                <p>💬 WhatsApp: +54 341 555-5555</p>
                <p>📞 Teléfono: 0800-LANA-LINO</p>
            </div>
            <div class="footer-column">
                <h4>Redes Sociales</h4>
                <div class="footer-links">
                    <a href="#">📷 Instagram</a>
                    <a href="#">📘 Facebook</a>
                    <a href="#">📌 Pinterest</a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>Desarrollada con orgullo por los integrantes del grupo.</p>
            <p>&copy; 2026 Lana &amp; Lino. Todos los derechos reservados.</p>
        </div>
    `;
    document.body.appendChild(footer);
}
