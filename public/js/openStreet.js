'use strict';

document.addEventListener("DOMContentLoaded", function () {
    // Espera a que el DOM se haya cargado completamente antes de ejecutar el código

    /**
     * Obtiene la ubicación actual del usuario.
     * @returns {Promise<object>} - Contiene la latitud y longitud del usuario.
     */
    function getCurrentLocation() {
        // Se devuelve una promesa que se resuelve con la latitud y longitud
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                // Si el navegador soporta la geolocalización
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        });
                    },
                    (error) => {
                        reject("Error al obtener la ubicación."); // Si hay un error, rechaza la promesa
                    }
                );
            } else {
                reject("El navegador no soporta la geolocalización."); // Si no soporta la geolocalización, rechaza la promesa
            }
        });
    }

    /**
     * Obtiene la ciudad a partir de las coordenadas usando OpenStreetMap (Nominatim).
     * @param {number} latitud - Latitud del usuario.
     * @param {number} longitud - Longitud del usuario.
     * @returns {Promise<string>} - Nombre de la ciudad o mensaje de error.
     */
    // Función asíncrona que obtiene la ciudad del usuario
    async function obtenerCiudad(latitud, longitud) {
        // URL para realizar la consulta a OpenStreetMap usando las coordenadas
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitud}&lon=${longitud}&zoom=10&addressdetails=1`;

        try {
            // Realiza la petición fetch a la API de OpenStreetMap
            const respuesta = await fetch(url); // Se espera la respuesta de la API
            const datos = await respuesta.json(); // Se espera que los datos sean parseados a JSON
            console.log("Datos obtenidos:", datos);  // Depuración

            // Verifica si los datos contienen el nombre de la ciudad y la retorna
            return datos.address.city || datos.address.town || datos.address.village || "Ciudad desconocida";
        } catch (error) {
            console.error("Error al obtener la ciudad:", error);  // Si hay un error, se imprime en la consola
            return "No se pudo determinar la ciudad.";  // Se retorna un mensaje de error
        }
    }

    /**
     * Muestra la ciudad en el contenedor mensajeCiudad.
     */
    async function mostrarCiudad() {
        try {
            console.log("Obteniendo ubicación..."); // Depuración

            // Llama a la función getCurrentLocation, que es asincrónica y espera a obtener la ubicación
            const ubicacion = await getCurrentLocation();  // Usamos 'await' para esperar la resolución de la promesa
            console.log("Ubicación obtenida:", ubicacion);  // Depuración

            // Llama a la función obtenerCiudad que es asincrónica y espera la respuesta de la API
            const ciudad = await obtenerCiudad(ubicacion.latitude, ubicacion.longitude); // Usamos 'await' para esperar el nombre de la ciudad

            // Verifica si el contenedor 'mensajeCiudad' existe en el DOM y actualiza su contenido
            const mensajeCiudad = document.getElementById("mensajeCiudad");
            if (mensajeCiudad) {
                mensajeCiudad.innerHTML = `${ciudad}`;  // Muestra la ciudad en el contenedor
            } else {
                console.error("El contenedor 'mensajeCiudad' no existe.");
            }
        } catch (error) {
            console.error("Error al obtener la ciudad:", error);  // Si ocurre un error, se imprime en la consola
            const mensajeCiudad = document.getElementById("mensajeCiudad");
            if (mensajeCiudad) {
                mensajeCiudad.textContent = "Error al obtener la ubicación.";  // Muestra un mensaje de error en el contenedor
            }
        }
    }

    // Delegación de eventos: escucha el clic en el botón con id "botonVerificar"
    document.body.addEventListener("click", function (event) {
        if (event.target && event.target.id === "botonVerificar") {
            mostrarCiudad();  // Llama a la función mostrarCiudad() al hacer clic en el botón
            console.log("Botón Verificar presionado, mostrando ciudad");  // Depuración
        }
    });
});
