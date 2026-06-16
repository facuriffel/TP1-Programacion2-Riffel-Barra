import { renderHeader } from './header.js';
import { consultarAPI } from './api.js';

renderHeader();

async function cargarDetalle() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const container = document.getElementById('detalle-container');
    const idUsuario = localStorage.getItem('id_usuario');
    const token = localStorage.getItem('token_jwt');

    if (!id) {
        container.innerHTML = '<p>Producto no encontrado.</p>';
        return;
    }

    try {
        container.innerHTML = '<p>Cargando detalles...</p>';
        const respuesta = await consultarAPI(`/obtenerDatosProducto/${id}`);
        let items = respuesta.payload || respuesta;

        // Fallback si no tiene inventario y devuelve vacío
        if (!Array.isArray(items) || items.length === 0) {
            const allRes = await consultarAPI('/obtenerProductos');
            const allProds = allRes.payload || allRes;
            const found = allProds.find(p => p.idProducto == id);
            if (found) {
                items = [{
                    producto: found.producto,
                    descripcion: found.descripcion,
                    precio: found.precio,
                    ulrImagen: found.ulrImagen || found.urlImagen || found.imagen,
                    idCategoria: found.idCategoria,
                    categoria: found.categoria,
                    talle: null,
                    color: null,
                    stock: 0,
                    idInventario: null
                }];
            }
        }

        if (!items || items.length === 0) {
            container.innerHTML = '<p>Producto no encontrado.</p>';
            return;
        }

        const first = items[0];
        const prod = {
            id_producto: id,
            nombre: first.producto || first.nombre || '',
            descripcion: first.descripcion || '',
            precio: parseFloat(first.precio || 0),
            imagen: first.ulrImagen || first.urlImagen || first.imagen || 'https://via.placeholder.com/300'
        };

        // Filtramos y normalizamos items válidos de inventario
        const rawInventory = items.filter(item => 
            (item.idInventario !== null && item.idInventario !== undefined) || 
            (item.id_inventario !== null && item.id_inventario !== undefined)
        );
        const inventory = rawInventory.map(item => ({
            ...item,
            idInventario: item.idInventario || item.id_inventario,
            talle: item.talle,
            color: item.color,
            stock: parseInt(item.stock || 0)
        }));
        const uniqueSizes = [...new Set(inventory.map(item => item.talle))].filter(Boolean);
        const uniqueColors = [...new Set(inventory.map(item => item.color))].filter(Boolean);

        // Verificamos si es favorito
        let esFavorito = false;
        if (idUsuario) {
            try {
                const favsRes = await consultarAPI(`/obtenerFavoritos/${idUsuario}`);
                const favs = favsRes.payload || favsRes;
                esFavorito = favs.some(f => (f.idProducto || f.id_producto) == id);
            } catch (err) {
                console.warn("Error al consultar favoritos", err);
            }
        }

        // Renderizado del detalle
        container.innerHTML = `
            <div class="product-detail-card" style="display: flex; gap: 40px; flex-wrap: wrap; margin-top: 20px;">
                <div class="product-detail-image" style="flex: 1; max-width: 450px;">
                    <img src="${prod.imagen}" style="max-width: 100%; border-radius: 8px; box-shadow: var(--shadow);">
                </div>
                <div class="product-detail-info" style="flex: 1.5; min-width: 300px;">
                    <h2>${prod.nombre}</h2>
                    <p style="margin: 15px 0; font-size: 1.1em; color: var(--text-color); opacity: 0.8;">${prod.descripcion}</p>
                    <h3 style="font-size: 2em; margin-bottom: 20px; color: var(--text-color);">$${prod.precio.toLocaleString()}</h3>
                    
                    <div class="opciones-seleccion" style="margin-bottom: 20px;">
                        ${uniqueColors.length > 0 ? `
                            <div style="margin-bottom: 15px;">
                                <label style="display:block; margin-bottom:5px; font-weight:bold;">Seleccione Color:</label>
                                <select id="selector-color" style="padding:8px; border-radius:4px; width:100%; max-width:300px;">
                                    ${uniqueColors.map(c => `<option value="${c}">${c}</option>`).join('')}
                                </select>
                            </div>
                        ` : ''}

                        ${uniqueSizes.length > 0 ? `
                            <div style="margin-bottom: 15px;">
                                <label style="display:block; margin-bottom:5px; font-weight:bold;">Seleccione Talle:</label>
                                <select id="selector-talle" style="padding:8px; border-radius:4px; width:100%; max-width:300px;">
                                    ${uniqueSizes.map(s => `<option value="${s}">${s}</option>`).join('')}
                                </select>
                            </div>
                        ` : ''}
                    </div>

                    <div style="margin-bottom: 25px;">
                        <label style="display:block; margin-bottom:5px; font-weight:bold;">Plan de Cuotas:</label>
                        <select id="selector-cuotas" style="padding:8px; border-radius:4px; width:100%; max-width:300px;">
                            <option value="1">1 pago de $${prod.precio.toFixed(2)} (Sin interés)</option>
                            <option value="3">3 cuotas de $${(prod.precio / 3).toFixed(2)}</option>
                            <option value="6">6 cuotas de $${(prod.precio / 6).toFixed(2)}</option>
                            <option value="9">9 cuotas de $${(prod.precio / 9).toFixed(2)}</option>
                            <option value="12">12 cuotas de $${(prod.precio / 12).toFixed(2)}</option>
                        </select>
                    </div>

                    <div id="indicador-stock" style="margin-bottom: 20px; font-weight: bold;"></div>

                    <div class="detail-actions" style="display: flex; gap: 15px; flex-wrap: wrap;">
                        <button id="btn-agregar-carrito" class="btn-primary" style="padding:12px 24px; font-size:1.1em;" disabled>
                            Agregar al Carrito
                        </button>
                        <button id="btn-favorito" class="btn-secondary" style="padding:12px 24px; font-size:1.1em;">
                            ${esFavorito ? '♥ Quitar de Favoritos' : '♡ Agregar a Favoritos'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Elementos interactivos
        const colorSel = document.getElementById('selector-color');
        const talleSel = document.getElementById('selector-talle');
        const stockEl = document.getElementById('indicador-stock');
        const cartBtn = document.getElementById('btn-agregar-carrito');
        const favBtn = document.getElementById('btn-favorito');

        let selectedInventory = null;

        // Función para actualizar el stock y el botón del carrito según selección de color/talle
        const actualizarOpciones = () => {
            if (inventory.length === 0) {
                stockEl.innerHTML = '<span style="color:var(--danger);">Sin unidades disponibles</span>';
                cartBtn.disabled = true;
                return;
            }

            const colorVal = colorSel ? colorSel.value : null;
            const talleVal = talleSel ? talleSel.value : null;

            // Buscamos coincidencia en el inventario
            selectedInventory = inventory.find(item => 
                (!colorVal || item.color === colorVal) && 
                (!talleVal || item.talle === talleVal)
            );

            if (selectedInventory && selectedInventory.stock > 0) {
                stockEl.innerHTML = `<span style="color:var(--success);">¡Stock disponible: ${selectedInventory.stock} unidades!</span>`;
                cartBtn.disabled = false;
                cartBtn.setAttribute('data-id', selectedInventory.idInventario);
            } else {
                stockEl.innerHTML = '<span style="color:var(--danger);">Sin unidades disponibles para esta combinación</span>';
                cartBtn.disabled = true;
                selectedInventory = null;
            }
        };

        // Escuchar cambios
        if (colorSel) colorSel.addEventListener('change', actualizarOpciones);
        if (talleSel) talleSel.addEventListener('change', actualizarOpciones);

        // Inicializar
        actualizarOpciones();

        // Agregar al carrito event
        cartBtn.addEventListener('click', async () => {
            if (!idUsuario) {
                alert('Debés iniciar sesión para agregar productos al carrito.');
                window.location.href = 'login.html';
                return;
            }

            if (!selectedInventory) return;

            try {
                const response = await consultarAPI('/agregarACarrito', 'POST', {
                    id_inventario: selectedInventory.idInventario,
                    id_usuario: parseInt(idUsuario)
                });
                
                if (response && response.codigo === 200) {
                    alert('¡Producto agregado al carrito con éxito!');
                } else {
                    alert(response.mensaje || 'Error al agregar al carrito.');
                }
            } catch (err) {
                console.error("Error al agregar al carrito", err);
                alert('No se pudo agregar al carrito.');
            }
        });

        // Agregar/Quitar de Favoritos event
        favBtn.addEventListener('click', async () => {
            if (!idUsuario) {
                alert('Debés iniciar sesión para administrar tus favoritos.');
                window.location.href = 'login.html';
                return;
            }

            try {
                if (esFavorito) {
                    // Quitar favorito
                    const response = await consultarAPI('/eliminarFavorito', 'DELETE', {
                        id_usuario: parseInt(idUsuario),
                        id_producto: parseInt(id)
                    });
                    if (response) {
                        alert('Eliminado de favoritos.');
                        esFavorito = false;
                        favBtn.textContent = '♡ Agregar a Favoritos';
                    }
                } else {
                    // Agregar favorito
                    const response = await consultarAPI('/agregarFavorito', 'POST', {
                        id_producto: parseInt(id),
                        id_usuario: parseInt(idUsuario)
                    });
                    if (response && response.codigo === 200) {
                        alert('Agregado a favoritos.');
                        esFavorito = true;
                        favBtn.textContent = '♥ Quitar de Favoritos';
                    }
                }
            } catch (err) {
                console.error("Error favoritos action", err);
                alert('No se pudo actualizar favoritos.');
            }
        });

    } catch (error) {
        console.error("Error al cargar detalles del producto", error);
        container.innerHTML = '<p>Error al cargar el producto.</p>';
    }
}

cargarDetalle();