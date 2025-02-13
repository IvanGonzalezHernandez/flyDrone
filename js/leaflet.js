document.addEventListener("DOMContentLoaded", function () {
    'use strict';

    // Función para obtener la ubicación actual del usuario
    function getCurrentLocation() {
        //Devuelve una promesa.
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        });
                    },
                    (error) => {
                        reject({ error: 'Error al obtener la ubicación.' });
                    }
                );
            } else {
                reject({ error: 'El navegador no soporta la geolocalización.' });
            }
        });
    }

    /**
     * Muestra un mapa con la ubicación del usuario dentro del contenedor mensajeMapa.
     */
    async function mostrarMapa() {
        try {
            const ubicacion = await getCurrentLocation();

            // Crear el contenedor donde se renderiza el mapa (con el id 'mapa')
            let mapaContenedor = document.createElement('div');
            mapaContenedor.id = 'mapa';
            mapaContenedor.style.cssText = 'width: 100%; height: 400px; z-index: 1;'; // Añadimos estilo de tamaño y z-index

            // Obtener el contenedor mensajeMapa y agregarlo al DOM
            let mensajeMapa = document.getElementById('mensajeMapa');
            mensajeMapa.innerHTML = ''; // Limpiar cualquier contenido previo
            mensajeMapa.appendChild(mapaContenedor); // Agregar el contenedor de mapa dentro de 'mensajeMapa'

            // Crear el mapa y establecer la vista
            const mapa = L.map('mapa').setView([ubicacion.latitude, ubicacion.longitude], 13);

            // Agregar capa de mapa de OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(mapa);

            // Agregar marcador con coordenadas del usuario
            L.marker([ubicacion.latitude, ubicacion.longitude])
                .addTo(mapa)
                .bindPopup("Tu ubicación actual")
                .openPopup();

        } catch (error) {
            console.error("Error al mostrar el mapa:", error);
        }
    }

    // Delegación de eventos: escucha el clic en el botón con id "botonVerificar". Esta técnica se llama delegación de eventos porque no añadp orejones directamente a cada botón en la página, sino que estamos delegando el manejo de eventos al elemento padre (body en este caso). El evento se "propaga" desde el objetivo del evento (el botón) hasta el body y luego se comprueba si el evento proviene del elemento deseado. Esto lo he hecho porque al crear los elementos del DOM de forma dinámica sin esta solución los recoge como indefinidos dado que no se pintaban.
    document.body.addEventListener("click", function (event) {
        if (event.target && event.target.id === "botonVerificar") {
            mostrarMapa();
            console.log("Botón Verificar presionado, mostrando mapa");
        }
    });
});
