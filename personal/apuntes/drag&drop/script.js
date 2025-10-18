// script.js
// Ejemplo de interacción Drag & Drop


// Selección de elementos interactivos
const origen = document.querySelector("[draggable='true']");
const destino= document.querySelector("[data-drop]");

// Eventos Drag&Drop asociados a los elementos de origen y destinoº
origen.addEventListener("dragstart", comienzoArrastre);
origen.addEventListener("dragend", cancelacionArrastre);

destino.addEventListener("dragover", sobrevolandoDestino);
destino.addEventListener("drop", soltadoEnDestino);

destino.addEventListener("dragenter", entradaEnDestino);
destino.addEventListener("dragleave", salidaDeDestino);


// Manejadores de eventos Drag&Drop
function comienzoArrastre(e) {
  console.log("Comienzo de arrastre");
  e.target.classList.toggle("elemento-en-arrastre");
}

function cancelacionArrastre(e) {
  console.log("Cancelacion de arrastre");
  e.target.classList.toggle("elemento-en-arrastre");
}

function sobrevolandoDestino(e) {
  console.log("Sobrevolando destino");
  // Necesario para permitir el drop
  e.preventDefault();
}

function soltadoEnDestino(e) {
  console.log("Elemento soltado en destino");

  // OJO: Algunos navegadores responden con una redirección inmediata
  // al soltar el elemento, para prevenir este coportamiento es recomendable
  // cancelar el evento por defecto
  e.preventDefault();
  e.target.classList.remove("elemento-en-sobrevuelo");
  e.target.classList.add("elemento-soltado");
}


function entradaEnDestino(e) {
  console.log("Entrada en destino");
  e.target.classList.add("elemento-en-sobrevuelo"); 
}

function salidaDeDestino(e) {
  console.log("Salida de destino");
  e.target.classList.remove("elemento-en-sobrevuelo");
}


