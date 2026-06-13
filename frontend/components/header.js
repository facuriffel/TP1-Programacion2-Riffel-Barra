export function renderHeader() {
    const header = document.createElement('header');
    header.style.position = 'sticky';
    header.style.top = '0';
    header.style.backgroundColor = 'var(--nav-bg)';
    header.style.padding = '15px';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.borderBottom = '1px solid #ccc';

    header.innerHTML = `
        <div class="logo"><h2>Lana & Lino</h2></div>
        <div class="busqueda">
            <input type="text" id="input-busqueda" placeholder="Buscar producto...">
            <button id="btn-buscar">Buscar</button>
            <select id="select-categorias"><option value="">Todas las categorías</option></select>
        </div>
        <div class="acciones">
            <button id="btn-theme"> Modo </button>
            <a href="/pages/favoritos.html"> Favoritos </a>
            <a href="/pages/carrito.html"> Carrito </a>
            <a href="/pages/perfil.html"> Mi Perfil </a>
            <a href="/pages/login.html" id="btn-login">  Iniciar Sesión </a>
        </div>
    `;
    document.body.prepend(header);

    // Lógica del modo oscuro
    document.getElementById('btn-theme').addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Mantener estado del modo oscuro al recargar
    if (localStorage.getItem('theme') === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    }
}