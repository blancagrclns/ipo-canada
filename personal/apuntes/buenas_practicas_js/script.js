// script.js

let mensajes = document.querySelectorAll("[data-mensaje]");
let btnIncrementar = document.getElementById("btnIncrementar");
let contadorElement = document.getElementById("contador");
let contador = 0;

mensajes.forEach((element, index) => {
  element.textContent = "Hola texto " + (index + 1);
  element.classList.add("resaltado");
});

btnIncrementar.addEventListener("click", incrementarContador);

function incrementarContador() {
  contador++;
  contadorElement.textContent = contador;
}
