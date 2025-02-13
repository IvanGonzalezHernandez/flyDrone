// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { crearPanelUsuario } from "./panelUsuario.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDgju-wnEeGMFfdOYj_qe7wwCszQobjCd8",
  authDomain: "flydrone-ac849.firebaseapp.com",
  projectId: "flydrone-ac849",
  storageBucket: "flydrone-ac849.firebasestorage.app",
  messagingSenderId: "172991930574",
  appId: "1:172991930574:web:3394abc364d2eb4120f09f",
  measurementId: "G-ZX7VPRWKJ9"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Obtener elementos del formulario
let email = document.getElementById('email');
let password = document.getElementById('password');
let botonIngresar = document.getElementById('botonIngresar');
let botonRegistrar = document.getElementById('botonRegistrar');
let botonRecuperar = document.getElementById('botonRecuperar');

// Función para iniciar sesión
function loginUser(event) {
  event.preventDefault();  // Evita la recarga de la página al enviar el formulario

  const emailValue = email.value; //Almaceno el valor en la variable
  const passwordValue = password.value; //Almaceno el valor en la variable

  // Validar los campos
  if (!emailValue || !passwordValue) { //Si están vacios... 
    alert("Por favor, ingresa tu correo electrónico y contraseña.");
    return;
  }

  // Iniciar sesión con Firebase Authentication
  /*Es una función asíncrona porque signInWithEmailAndPassword devuelve una promesa, lo que significa que la ejecución no se detiene mientras Firebase procesa la autenticación, sino que continúa y ejecuta .then() cuando la autenticación es exitosa o .catch() si ocurre un error. Esto evita que la interfaz se bloquee esperando una respuesta del servidor. */
  signInWithEmailAndPassword(auth, emailValue, passwordValue)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Usuario logueado:", user);
      alert("Login exitoso");
      desaparecerLogin(); //Desaparece el login
      crearPanelUsuario(); //Se crea la sección de usuario
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error de login:", errorCode, errorMessage);
      alert("Error al iniciar sesión. Verifica tu correo y contraseña.");
    });
}

// Función para registrar un nuevo usuario
function registerUser(event) {
  event.preventDefault(); // Evita la recarga de la página al enviar el formulario

  // Obtener valores de los campos
  const emailValue = document.getElementById("email").value.trim();
  const passwordValue = document.getElementById("password").value.trim();

  // Función para validar el formulario
  function validarFormulario(email, password) {
    // Expresión regular para validar el correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Expresión regular para validar la contraseña (mínimo 6 caracteres)
    const passwordRegex = /^.{6,}$/;

    // Validar los campos
    if (!email || !password) {
      alert("Por favor, ingresa tu correo electrónico y contraseña.");
      return false;
    }

    // Validar correo
    if (!emailRegex.test(email)) {
      alert("Por favor, ingresa un correo electrónico válido.");
      return false;
    }

    // Validar contraseña
    if (!passwordRegex.test(password)) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return false;
    }

    return true; // Todo es válido
  }

  // Si la validación falla, detener el proceso
  if (!validarFormulario(emailValue, passwordValue)) {
    return;
  }

  // Crear cuenta con Firebase Authentication mediante función asíncrona dado que puede tardar en obtener la respuesta y no queremos quese pare la ejecución
  createUserWithEmailAndPassword(auth, emailValue, passwordValue)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Usuario registrado:", user);
      alert("Registro exitoso");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      console.error("Error de registro:", errorCode, errorMessage);

      // Mensajes de error más específicos
      if (errorCode === "auth/email-already-in-use") {
        alert("Este correo ya está registrado. Intenta con otro.");
      } else if (errorCode === "auth/invalid-email") {
        alert("El correo ingresado no es válido.");
      } else {
        alert("Error al registrar el usuario. Inténtalo de nuevo.");
      }
    });
}


// Función para recuperar la contraseña
function recoverPassword(event) {
  event.preventDefault();  // Evita la recarga de la página al enviar el formulario

  const emailValue = email.value;

  if (!emailValue) {
    alert("Por favor, ingresa tu correo electrónico.");
    return;
  }

  // Enviar email para restablecer la contraseña. También de forma asincronada porque envía una solicitud a los servidores de Firebase para enviar un correo electrónico de restablecimiento de contraseña, lo cual puede tardar algún tiempo dependiendo de la red y la respuesta del servidor.
  sendPasswordResetEmail(auth, emailValue)
    .then(() => {
      alert("Se ha enviado un enlace para restablecer tu contraseña.");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error al recuperar contraseña:", errorCode, errorMessage);
      alert("Error al enviar el enlace de recuperación.");
    });
}

//Desaparecer Login
function desaparecerLogin() {
  document.getElementById('login').style.display = 'none';
  document.getElementsByTagName('canvas')[0].style.display = 'none'; // Se ve que la librería de rainyDay.js hace su funcionalidad en un canvas donde pinta la imagen y el efecto. La cosa es que iyecta el código automáticamente y solo se puede ver el canvas mediante F12 y como lo pinta fuera de la sección de login el display = 'none' de la sección no le afecta y hay que hacer otro específico.
}


// Event listeners para los botones
botonIngresar.addEventListener('click', loginUser);
botonRegistrar.addEventListener('click', registerUser);
botonRecuperar.addEventListener('click', recoverPassword);