// js/header.js
import { consultarAPI } from './api.js';

export async function renderHeader() {
    const header = document.createElement('header');

    // Detectamos dinámicamente si estamos corriendo bajo la carpeta "frontend"
    const basePath = window.location.pathname.includes('/frontend/') ? '/frontend' : '';

    const token = localStorage.getItem('token_jwt');
    const rol = localStorage.getItem('rol');

    header.innerHTML = `
        <div class="logo" style="display: flex; align-items: center; gap: 20px;">
            <h2>Lana &amp; Lino</h2>
            <!-- Desplegable de Productos -->
            <div class="dropdown-menu">
                <a href="${basePath}/index.html" class="dropbtn" style="cursor: pointer; font-weight: 600; color: var(--clr-primary); text-decoration: none; padding: 8px 14px; border-radius: 99px;">Productos ▾</a>
                <div class="dropdown-content" id="dropdown-categorias" style="display:none; position:absolute; background:var(--clr-surface); border:1.5px solid var(--clr-border); border-radius:8px; box-shadow:var(--shadow-md); z-index:2000; min-width:180px; margin-top:5px;">
                    <a href="${basePath}/index.html" style="display:block; padding:10px 16px; text-decoration:none; color:var(--clr-text); font-weight:500;">Todos los productos</a>
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
            <a href="${basePath}/pages/admin.html" id="btn-admin" style="display:none;">Gestionar</a>
            <a href="${token ? '#' : basePath + '/pages/login.html'}" id="btn-login">${token ? 'Cerrar Sesión' : 'Iniciar Sesión'}</a>
        </div>
    `;

    document.body.prepend(header);

    // Mostrar botón gestionar si es administrador
    const btnAdmin = document.getElementById('btn-admin');
    if (token && rol === 'Administrador') {
        btnAdmin.style.display = 'inline-block';
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
                dropdownCategorias.innerHTML += `<a href="${basePath}/index.html?categoria=${cat.id_categoria}" style="display:block; padding:10px 16px; text-decoration:none; color:var(--clr-text); font-weight:500;">${cat.nombre}</a>`;
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
    footer.style = `
        background: var(--clr-surface);
        border-top: 1px solid var(--clr-border);
        padding: 40px 32px 30px;
        margin-top: auto;
        color: var(--clr-text);
        font-family: var(--font-body);
        transition: var(--transition);
        box-shadow: 0 -2px 15px rgba(0,0,0,.03);
    `;
    footer.innerHTML = `
        <div style="max-width: 1280px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 30px; text-align: left;">
            <div style="flex: 1.5; min-width: 250px;">
                <h3 style="font-family: var(--font-display); font-size: 1.4rem; color: var(--clr-primary); margin-bottom: 12px; font-weight: bold;">Lana &amp; Lino</h3>
                <p style="font-size: 0.9rem; opacity: 0.8; max-width: 380px; line-height: 1.6;">Prendas premium de alta calidad tejidas con pasión e historia. La moda más fresca, natural y confortable para vos.</p>
            </div>
            <div style="flex: 1; min-width: 200px;">
                <h4 style="margin-bottom: 12px; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Contacto</h4>
                <p style="font-size: 0.9rem; margin: 6px 0; opacity: 0.85;">📧 Email: contacto@lanaylino.com</p>
                <p style="font-size: 0.9rem; margin: 6px 0; opacity: 0.85;">💬 WhatsApp: +54 341 555-5555</p>
                <p style="font-size: 0.9rem; margin: 6px 0; opacity: 0.85;">📞 Teléfono: 0800-LANA-LINO</p>
            </div>
            <div style="flex: 1; min-width: 150px;">
                <h4 style="margin-bottom: 12px; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Redes Sociales</h4>
                <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.9rem;">
                    <a href="#" style="color: var(--clr-primary); text-decoration: none; font-weight: 500; transition: var(--transition);">📷 Instagram</a>
                    <a href="#" style="color: var(--clr-primary); text-decoration: none; font-weight: 500; transition: var(--transition);">📘 Facebook</a>
                    <a href="#" style="color: var(--clr-primary); text-decoration: none; font-weight: 500; transition: var(--transition);">📌 Pinterest</a>
                </div>
            </div>
        </div>
        <div style="max-width: 1280px; margin: 30px auto 0; padding-top: 20px; border-top: 1px solid var(--clr-border); text-align: center; font-size: 0.85rem; opacity: 0.7;">
            <p>Desarrollada con orgullo por los integrantes del grupo.</p>
            <p style="margin-top: 5px;">&copy; 2026 Lana &amp; Lino. Todos los derechos reservados.</p>
        </div>
    `;
    document.body.appendChild(footer);
}
