const BASE_URL = 'http://localhost:3000/api';

export async function consultarAPI(endpoint, metodo = 'GET', cuerpo = null) {
    const token = localStorage.getItem('token_jwt');
    const opciones = {
        method: metodo,
        headers: { 'Content-Type': 'application/json' }
    };
    if (token) opciones.headers['Authorization'] = token;
    if (cuerpo) opciones.body = JSON.stringify(cuerpo);

    try {
        const respuesta = await fetch(`${BASE_URL}${endpoint}`, opciones);
        return await respuesta.json();
    } catch (error) {
        console.error(`Error en API (${endpoint}):`, error);
        throw error;
    }
}