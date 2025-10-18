// script.js

const selectorTitulo = "[data-titulo]";
const tituloElement = document.querySelector(selectorTitulo);
console.log(tituloElement.textContent);

const selectorLista = "[data-lista='nombres']";
const listaElement = document.querySelector(selectorLista);
listaElement.classList.add("destacado");

const itemsElement = listaElement.querySelectorAll("[data-item]");

itemsElement.forEach((item) => {
  const idItem = item.dataset.id;
  console.log(idItem, item.textContent);
});
