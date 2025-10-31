// script.js

// 1. Registrar el Service Worker
// (Esta parte queda EXACTAMENTE IGUAL)
window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registrado con éxito:', registration.scope);
            })
            .catch(error => {
                console.error('Error al registrar el Service Worker:', error);
            });
    }
});

// 2. Consumir la API de ExchangeRate
document.addEventListener('DOMContentLoaded', () => {
    const dataContainer = document.getElementById('api-data');

    // -----------------------------------------------------
    // CAMBIO 1: La nueva URL de la API
    // -----------------------------------------------------
    // Esta API nos da las tasas de cambio tomando USD como base (1 USD = X)
    const API_URL = 'https://open.er-api.com/v6/latest/USD';

    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // -----------------------------------------------------
            // CAMBIO 2: Cómo procesamos los datos
            // -----------------------------------------------------
            // El JSON de esta API es diferente. Los datos están en "data.rates"
            // Puedes ver la estructura de 'data' haciendo un console.log(data)

            if (data.result === 'success') {
                const rates = data.rates;
                const lastUpdate = new Date(data.time_last_update_utc).toLocaleString();

                // Creamos una lista HTML solo con algunas monedas
                // ¡Agregué ARS (Peso Argentino) para ti!
                dataContainer.innerHTML = `
                    <p><strong>Base:</strong> ${data.base_code}</p>
                    <p><strong>Última actualización:</strong> ${lastUpdate}</p>
                    <hr>
                    <ul style="list-style: none; padding-left: 0;">
                        <li><h3>🇪🇺 EUR: ${rates.EUR.toFixed(2)}</h3></li>
                        <li><h3>🇦🇷 ARS: ${rates.ARS.toFixed(2)}</h3></li>
                        <li><h3>🇧🇷 BRL: ${rates.BRL.toFixed(2)}</h3></li>
                        <li><h3>🇯🇵 JPY: ${rates.JPY.toFixed(2)}</h3></li>
                    </ul>
                `;
            } else {
                dataContainer.innerHTML = '<p>Error: No se pudieron obtener las tasas.</p>';
            }
        })
        .catch(error => {
            console.error('Error al fetchear datos:', error);
            // Este mensaje de error es el que se verá en modo offline
            dataContainer.innerHTML = '<p>No se pudieron cargar los datos. Revisa la conexión.</p>';
        });
});