const formPago = document.getElementById('form-pago');
const metodoPago = document.getElementById('metodo-pago');
const datosTarjeta = document.getElementById('datos-tarjeta');

metodoPago.addEventListener('change', (e) => {
    if (e.target.value === 'tarjeta') {
        datosTarjeta.style.display = 'block';
    } else {
        datosTarjeta.style.display = 'none';
    }
});

formPago.addEventListener('submit', (e) => {
    e.preventDefault();

    const metodo = metodoPago.value;

    if (metodo === 'tarjeta') {
        const numTarjeta = document.getElementById('num-tarjeta').value;
        const titular = document.getElementById('titular-tarjeta').value;

        if (numTarjeta.length !== 16 || isNaN(numTarjeta)) {
            alert('El número de tarjeta debe tener 16 dígitos numéricos.');
            return;
        }
        if (titular.trim() === '') {
            alert('Debés ingresar el nombre del titular.');
            return;
        }
    }

    alert('¡Pago procesado con éxito! Gracias por tu compra en Lana & Lino.');
    window.location.href = '../index.html';
});