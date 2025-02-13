/* Función exportable al script de firebase.js que una vez que el usuario se logea, 
   crea de forma dinámica una especie de Dashboard de usuario con las funcionalidades de la aplicación */
export function crearPanelUsuario() {
    try {
        // Cambiar el CSS dinámicamente
        let linkCss = document.getElementById("css");
        linkCss.href = "../css/panelUsuarios.css";

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
        logo.src = '../img/logoSinFondo.png';
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

        //Video
        let video = document.createElement('video');
        video.id = 'video';
        video.width = 640;
        video.height = 480;
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
        const video = document.getElementById('video');

        // Verifica si ya hay un stream activo y se detiene antes de inciar otro
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
        }

        // Solicita acceso a la cámara
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true }); // Esperamos a que el usuario de permisos
        video.srcObject = videoStream; //Asigna ese flujo al <video>

        // Esperar a que el video realmente empiece a reproducirse
        video.onloadedmetadata = async () => {
            await video.play(); // Asegura que el video comience

            // Cargar el modelo MobileNet si aún no está cargado
            if (!model) {
                model = await mobilenet.load();
                console.log("Modelo MobileNet cargado"); //Una vez se carga depuramos con un mensaje
            }

            // Inicializa DataTable
            $('#predictionTable').DataTable({
                "destroy": true,
                "paging": false,
                "scrollY": "400px",
                "scrollCollapse": true,
                "info": false,
                "searching": false
            });

            detecting = true;
            detectFrame(video); // Inicia la detección inmediatamente
        };
    }


    // Función para detener la detección
    function stopDetection() {
        const video = document.getElementById('video'); // Obtiene el elemento video del DOM
        videoStream.getTracks().forEach(track => track.stop()); // Detiene todos los tracks del video (detiene la cámara)
        detecting = false; // Cambia el estado de detección a falso
    }

    // Función para detectar objetos en cada fotograma
    async function detectFrame(video) {
        if (!detecting) return; // Si no estamos detectando, la función se detiene inmediatamente

        // Llama al modelo para clasificar el fotograma del video de forma asincrónica
        const predictions = await model.classify(video); // `await` hace que la ejecución espere a que se obtengan las predicciones
        updateTable(predictions); // Actualiza la tabla con las predicciones obtenidas

        // Llama nuevamente a la función `detectFrame` después de un pequeño retraso (aproximadamente 100ms)
        requestAnimationFrame(() => detectFrame(video)); // `requestAnimationFrame` asegura que la función se llame de manera continua
    }

    // Función para actualizar la tabla con los resultados de la predicción
    function updateTable(predictions) {
        const table = $('#predictionTable').DataTable(); // Obtiene la tabla de predicciones del DOM
        table.clear(); // Limpia la tabla antes de agregar nuevos resultados

        // Añade nuevas filas con los objetos detectados en cada predicción
        predictions.forEach(prediction => {
            table.row.add([
                prediction.className,  // Nombre del objeto detectado
                (prediction.probability * 100).toFixed(2) + '%'  // Probabilidad de la predicción (formateado a porcentaje)
            ]).draw(); // Añade la fila a la tabla y la dibuja
        });
    }




}
