/* Función exportable al script de firebase.js que una vez que el usuario se logea, 
   crea de forma dinámica una especie de Dashboard de usuario con las funcionalidades de la aplicación */
export function crearPanelUsuario() {
    try {
        // Cambiar el CSS dinámicamente
        let linkCss = document.getElementById("css");
        linkCss.href = "./css/panelUsuarios.css";

        // Crear el contenedor principal del panel con clases de Bootstrap
        let panelUsuario = document.createElement('div');
        panelUsuario.classList.add('container', 'mt-5'); // Uso container y margin-top para la separación(Bootstrap)

        // Crear una fila (row) para centrar los elementos
        let row = document.createElement('div');
        row.classList.add('row', 'justify-content-center');

        // Crear el contenedor del panel dentro de la fila con fondo blanco
        let col = document.createElement('div');
        col.classList.add('col-md-6', 'text-center', 'border', 'p-3', 'rounded', 'bg-white');

        // Agregar el logo (Bootstrap img-fluid para que sea responsive)
        let logo = document.createElement('img');
        logo.src = './img/logoSinFondo.png';
        logo.classList.add('img-fluid');

        // Crear un contenedor para mostrar el mensaje de viabilidad
        let mensajeCiudad = document.createElement('h2');
        mensajeCiudad.classList.add('mb-3');
        mensajeCiudad.id = 'mensajeCiudad';

        // Crear un contenedor para mostrar el mensaje de viabilidad
        let mensajeViabilidad = document.createElement('div');
        mensajeViabilidad.classList.add('mb-3');
        mensajeViabilidad.id = 'mensajeViabilidad';

        // Crear un contenedor para mostrar el mensaje de viabilidad
        let mensajeMapa = document.createElement('div');
        mensajeMapa.classList.add('mb-3');
        mensajeMapa.id = 'mensajeMapa';

        // Crear el botón para verificar viabilidad
        let botonVerificar = document.createElement('button');
        botonVerificar.textContent = "Verificar Viabilidad de Vuelo";
        botonVerificar.classList.add('btn', 'w-100', 'mb-3');
        botonVerificar.id = 'botonVerificar';

        // Botón de cerrar sesión
        let botonCerrarSesion = document.createElement('button');
        botonCerrarSesion.textContent = "Cerrar Sesión";
        botonCerrarSesion.classList.add('btn', 'w-100');
        botonCerrarSesion.id = 'botonCerrarSesion';

        botonCerrarSesion.addEventListener('click', cerrarSesion);

        //Función para cerrar sesión que lo que hace es recargar la página
        function cerrarSesion() {
            alert("Sesión cerrada");
            window.location.reload(); // Recargar la página
        }

        // Crear el panel para la detección de objetos
        let panelTensor = document.createElement('div');


        // H2
        let h2 = document.createElement('h2');
        h2.textContent = "Detección de objetos en el vuelo del dron";
        panelTensor.appendChild(h2);


        // Video
        let video = document.createElement('video');
        video.id = 'video';
        video.classList.add('img-fluid'); // Agrega esta clase para hacerlo responsivo
        video.autoplay = true;
        panelTensor.appendChild(video);


        //Boton iniciar
        let botonIniciar = document.createElement('button');
        botonIniciar.id = 'botonIniciar';
        botonIniciar.textContent = "Iniciar Detección";
        botonIniciar.classList.add('btn', 'w-100', 'mb-3');
        panelTensor.appendChild(botonIniciar);

        //Boton detener
        let botonDetener = document.createElement('button');
        botonDetener.id = 'botonDetener';
        botonDetener.textContent = "Detener Detección";
        botonDetener.classList.add('btn', 'w-100');
        panelTensor.appendChild(botonDetener);

        // Crear la tabla para mostrar los resultados
        let tabla = document.createElement('table');
        tabla.id = 'predictionTable';
        tabla.classList.add('display');

        let thead = document.createElement('thead');
        let tr = document.createElement('tr');
        let th1 = document.createElement('th');
        th1.textContent = "Objeto";
        tr.appendChild(th1);

        let th2 = document.createElement('th');
        th2.textContent = "Probabilidad";
        tr.appendChild(th2);

        thead.appendChild(tr);
        tabla.appendChild(thead);

        let tbody = document.createElement('tbody');
        tabla.appendChild(tbody);

        panelTensor.appendChild(tabla);

        // Asignar los eventos a los botones de detección
        botonIniciar.addEventListener('click', startDetection);
        botonDetener.addEventListener('click', stopDetection);

        // Agregar los elementos al contenedor
        col.appendChild(logo);
        col.appendChild(mensajeCiudad);
        col.appendChild(mensajeViabilidad);
        col.appendChild(mensajeMapa);
        col.appendChild(botonVerificar);
        col.appendChild(panelTensor);
        col.appendChild(botonCerrarSesion);


        // Agregar la columna al contenedor (row)
        row.appendChild(col);

        // Agregar la fila al panel
        panelUsuario.appendChild(row);

        // Agregar el panel al body
        document.body.appendChild(panelUsuario);

    } catch (error) {
        console.error("Ocurrió un error:", error.message);
    }




    // TENSORFLOW. Lo he intentado poner de forma modular en otro script pero tras una serie de errores he decidido dejarlo en el mismo script de panel Usuario para evitar errores de creaciones dinámicas
    let model; // Variable que almacenará el modelo cargado de MobileNet
    let videoStream; // Variable que almacenará el stream de video de la cámara
    let detecting = false; // Variable que controla si la detección está activa o no

    // Función para iniciar la detección
    async function startDetection() {
        const video = document.getElementById('video'); // Obtiene el elemento <video> del DOM

        // Verifica si ya hay un stream activo y se detiene antes de iniciar otro
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop()); // Detiene el stream anterior si existe
        }

        // Detectar si el usuario está en un dispositivo móvil
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        let constraints = { video: true }; // Configuración básica para solicitar el acceso a la cámara

        if (isMobile) {
            // Si es un dispositivo móvil, pregunta al usuario si quiere usar la cámara frontal o posterior
            const useFrontCamera = confirm("¿Quieres usar la cámara frontal? Si quieres usar la cámara posterior cancela el mensaje");
            constraints.video = { facingMode: useFrontCamera ? "user" : "environment" }; // Establece la cámara según la respuesta
        }

        // Solicita acceso a la cámara con la configuración elegida
        videoStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = videoStream; // Asocia el stream de video al elemento <video>

        // Espera a que el video realmente empiece a reproducirse
        video.onloadedmetadata = async () => {
            await video.play(); // Inicia la reproducción del video

            // Carga el modelo MobileNet si aún no está cargado
            if (!model) {
                model = await mobilenet.load(); // Carga el modelo MobileNet
                console.log("Modelo MobileNet cargado"); // Imprime en consola cuando el modelo esté listo
            }

            // Inicializa DataTable para mostrar las predicciones
            $('#predictionTable').DataTable({
                "destroy": true, // Destruye la tabla existente si ya había una
                "paging": false, // Desactiva la paginación
                "scrollY": "400px", // Establece el alto de la tabla con desplazamiento vertical
                "scrollCollapse": true, // Permite que la tabla se ajuste si hay pocos datos
                "info": false, // Desactiva la información de la tabla (como el número de elementos)
                "searching": false // Desactiva la barra de búsqueda
            });

            detecting = true; // Activa el estado de detección
            detectFrame(video); // Comienza la detección de objetos
        };
    }

    // Función para detener la detección
    function stopDetection() {
        const video = document.getElementById('video'); // Obtiene el elemento <video>
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop()); // Detiene todos los tracks del stream
        }
        detecting = false; // Desactiva el estado de detección
    }

    // Función para detectar objetos en cada fotograma
    async function detectFrame(video) {
        if (!detecting) return; // Si la detección no está activa, no hace nada

        const predictions = await model.classify(video); // Clasifica el contenido del video usando el modelo MobileNet
        updateTable(predictions); // Actualiza la tabla con las predicciones obtenidas

        // Solicita el siguiente fotograma para mantener la detección en tiempo real
        requestAnimationFrame(() => detectFrame(video));
    }

    // Función para actualizar la tabla con los resultados de la predicción
    function updateTable(predictions) {
        const table = $('#predictionTable').DataTable(); // Obtiene la instancia de DataTable
        table.clear(); // Limpia la tabla

        predictions.forEach(prediction => {
            // Añade las predicciones a la tabla: clase y probabilidad formateada como porcentaje
            table.row.add([
                prediction.className, // Nombre de la clase detectada
                (prediction.probability * 100).toFixed(2) + '%' // Probabilidad formateada como porcentaje
            ]).draw(); // Dibuja la nueva fila en la tabla
        });
    }






}
