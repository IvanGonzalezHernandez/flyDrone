'use strict';

document.addEventListener("DOMContentLoaded", function () {

    // Función para obtener la ubicación actual del usuario
    function getCurrentLocation() {
        // Retorna una Promesa que intenta obtener la ubicación del usuario
        return new Promise((resolve, reject) => {
            // Verifica si el navegador soporta la API de geolocalización
            if (navigator.geolocation) {
                // Si soporta, obtiene la ubicación actual del usuario
                navigator.geolocation.getCurrentPosition(
                    // Si se obtiene la ubicación con éxito, resuelve la Promesa con las coordenadas
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,   // Latitud
                            longitude: position.coords.longitude, // Longitud
                        });
                    },
                    // Si hay un error, rechaza la Promesa con un mensaje de error
                    (error) => {
                        reject({ error: 'Error al obtener la ubicación.' });
                    }
                );
            } else {
                // Si el navegador no soporta geolocalización, rechaza la Promesa con un mensaje
                reject({ error: 'El navegador no soporta la geolocalización.' });
            }
        });
    }

    // Función para obtener los datos meteorológicos desde Open-Meteo
    async function obtenerDatosMeteorologicos(latitud, longitud) {
        // Construcción de la URL para la API Open-Meteo con las coordenadas del usuario
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,visibility,pressure_msl&timezone=auto`;

        try {
            // Realiza una solicitud HTTP para obtener los datos meteorológicos
            const respuesta = await fetch(url);
            // Parseo de los datos obtenidos en formato JSON
            const datos = await respuesta.json();

            // Retorna un objeto con los datos meteorológicos relevantes
            return {
                latitud,
                longitud,
                temperaturaActual: datos.hourly.temperature_2m[0], // Temperatura actual
                humedad: datos.hourly.relativehumidity_2m[0],     // Humedad relativa
                viento: datos.hourly.windspeed_10m[0],            // Velocidad del viento
                visibilidad: datos.hourly.visibility[0],          // Visibilidad
                presion: datos.hourly.pressure_msl[0],            // Presión atmosférica
            };

        } catch (error) {
            // Si ocurre un error, lo muestra en la consola y retorna null
            console.error("Error al obtener los datos meteorológicos:", error);
            return null;
        }
    }

    // Función para asignar colores a las celdas de acuerdo con las condiciones meteorológicas
    function asignarColor(valor, tipo) {
        let color = 'white'; // Color por defecto

        // Evaluación según el tipo de valor para determinar el color
        switch (tipo) {
            case 'viento':
                if (valor < 5) color = 'green';      // Viento bajo
                else if (valor >= 5 && valor <= 10) color = 'orange'; // Viento moderado
                else color = 'red';                 // Viento alto
                break;
            case 'temperatura':
                if (valor >= 10 && valor <= 30) color = 'green';  // Temperatura ideal
                else if ((valor >= 0 && valor < 10) || (valor > 30 && valor <= 40)) color = 'orange'; // Temperatura aceptable
                else color = 'red';                // Temperatura extrema
                break;
            case 'humedad':
                if (valor >= 40 && valor <= 60) color = 'green';   // Humedad ideal
                else if ((valor >= 30 && valor < 40) || (valor > 60 && valor <= 70)) color = 'orange'; // Humedad moderada
                else color = 'red';                // Humedad extrema
                break;
            case 'visibilidad':
                if (valor > 5000) color = 'green';  // Visibilidad alta
                else if (valor >= 1000 && valor <= 5000) color = 'orange'; // Visibilidad moderada
                else color = 'red';                // Visibilidad baja
                break;
            case 'presion':
                if (valor >= 1010 && valor <= 1020) color = 'green';  // Presión atmosférica normal
                else if ((valor >= 1000 && valor < 1010) || (valor > 1020 && valor <= 1030)) color = 'orange'; // Presión moderada
                else color = 'red';                // Presión mala
                break;
        }
        return color;
    }

    // Función que evalúa si las condiciones meteorológicas son aptas para volar un dron
    function evaluarCondiciones(clima) {
        let mensaje = "Las condiciones no son favorables para volar un dron.";  // Mensaje predeterminado
        let advertencias = [];

        if (clima) {
            // Evaluamos las condiciones meteorológicas importantes y asignamos colores
            let condiciones = [
                { nombre: "Temperatura", valor: clima.temperaturaActual, tipo: "temperatura" },
                { nombre: "Humedad", valor: clima.humedad, tipo: "humedad" },
                { nombre: "Viento", valor: clima.viento, tipo: "viento" },
                { nombre: "Visibilidad", valor: clima.visibilidad, tipo: "visibilidad" },
                { nombre: "Presión", valor: clima.presion, tipo: "presion" }
            ];

            let todoEnVerde = true; // Indicador de si todas las condiciones son favorables

            // Recorre las condiciones y evalúa cada una
            condiciones.forEach(condicion => {
                let color = asignarColor(condicion.valor, condicion.tipo);  // Asigna color según el valor
                if (color === 'orange' || color === 'red') {   // Si la condición no es verde, se agrega a las advertencias
                    todoEnVerde = false;
                    advertencias.push(`${condicion.nombre} en nivel ${color === 'orange' ? "moderado" : "peligroso"}`);
                }
            });

            // Mensajes según las condiciones evaluadas
            if (todoEnVerde) {
                mensaje = "Las condiciones de vuelo son ideales para volar un dron. ¡Adelante!";
            } else if (advertencias.length > 0) {
                mensaje = `Las condiciones de vuelo son aceptables, pero ten cuidado con: ${advertencias.join(", ")}.`;
            }
        }

        return mensaje;
    }

    // Función que muestra los datos meteorológicos en la tabla dentro de mensajeViabilidad
    async function mostrarClima() {
        try {
            // Obtiene la ubicación actual y los datos meteorológicos asociados
            const ubicacion = await getCurrentLocation();
            const clima = await obtenerDatosMeteorologicos(ubicacion.latitude, ubicacion.longitude);

            if (clima) {
                const mensajeViabilidad = document.getElementById("mensajeViabilidad");
                mensajeViabilidad.innerHTML = ''; // Limpiar contenido previo

                // Llamar a la función que evalúa las condiciones y mostrar el mensaje
                const mensaje = evaluarCondiciones(clima);
                mensajeViabilidad.textContent = mensaje;

                // Crear la tabla con los datos meteorológicos
                const tabla = document.createElement("table");
                tabla.id = "tablaClima";
                tabla.classList.add("display");

                // Crear el encabezado de la tabla
                tabla.innerHTML = `
                    <thead>
                        <tr>
                            <th>Temperatura</th>
                            <th>Humedad</th>
                            <th>Viento</th>
                            <th>Visibilidad</th>
                            <th>Presión</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="background-color: ${asignarColor(clima.temperaturaActual, 'temperatura')}">${clima.temperaturaActual}°C</td>
                            <td style="background-color: ${asignarColor(clima.humedad, 'humedad')}">${clima.humedad}%</td>
                            <td style="background-color: ${asignarColor(clima.viento, 'viento')}">${clima.viento} m/s</td>
                            <td style="background-color: ${asignarColor(clima.visibilidad, 'visibilidad')}">${clima.visibilidad} m</td>
                            <td style="background-color: ${asignarColor(clima.presion, 'presion')}">${clima.presion} hPa</td>
                        </tr>
                    </tbody>
                `;

                mensajeViabilidad.appendChild(tabla);

                // Inicializar DataTables para mejorar la visualización de la tabla
                $(document).ready(function () {
                    $('#tablaClima').DataTable({
                        paging: false,
                        searching: false,
                        ordering: false,
                        info: false,
                        responsive: true
                    });
                });
            }
        } catch (error) {
            // Si ocurre un error, muestra un mensaje de error en la interfaz
            document.getElementById("mensajeViabilidad").textContent = "Error al obtener el clima.";
        }
    }

    // Delegación de eventos: escucha el clic en cualquier parte del body.
    document.body.addEventListener("click", function (event) {
        // Si el clic es en el botón con id "botonVerificar", ejecuta la función mostrarClima
        if (event.target && event.target.id === "botonVerificar") {
            mostrarClima();
            console.log("Botón Verificar presionado mostrarclima()");
        }
    });
});
