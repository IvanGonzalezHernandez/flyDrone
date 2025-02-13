'use strict';

window.onload = () =>{
  generarLluvia();
};

/*Función que mediante la librería de RainyDay.js genera un canvas encima de una imagen y agrega el efecto de gotas de agua */
function generarLluvia() {
  let image = document.getElementById('image');
  // Espera a que la imagen se cargue completamente antes de ejecutar el efecto de lluvia
  image.onload = function () {
    // Crea una nueva instancia de RainyDay.js y la asocia a la imagen cargada
    let engine = new RainyDay({
      image: this  // "this" hace referencia a la imagen que activó el evento "onload"
    });
    // Genera gotas de lluvia con ciertos parámetros
    engine.rain([
      [3, 3, 2]  // [tamaño de la gota, radio de dispersión, velocidad]
    ], 500);  // 500 es el número total de gotas que caerán
  };
  image.src = '../img/background.jpg'; //Añade el atributo src con la imagen de fondo al elemento <img> del DOM. He tenido que meter un fondo con patrones dado que investigando me he dado cuenta que las funciones de la librería RainyDay necesitan contrastes para poder crear el efecto. Con un fondo liso no aplica el efecto. Se soluciona metiendo imagen que no sea un fondo blanco por ejemplo.
}