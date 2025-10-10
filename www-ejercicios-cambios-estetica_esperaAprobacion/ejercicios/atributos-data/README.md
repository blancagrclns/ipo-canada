# Atributos personales data-\*

Los atributos data-\* son atributos personalizados que pueden figurar en cualquier elemento HTML.

- Se distinguen del resto de atributos por comenzar con el prefijo \*data-\* al que le sigue un nombre. Los atributos pueden ser booleanos (ej. data-item) o no (ej. data-id="id001").

Ejemplo de fragmento HTML con atributos data-\*

```
   <h1 data-titulo> Un titulo </h1>
   <ul data-lista="nombres">
      <li data-item data-id="id001">Pedro</li>
      <li data-item data-id="id002">Ana</li>
      <li data-item data-id="id003">Lucía</li>
   </ul>
```

## Selección de elementos HTML desde JS

Para seleccionar desde JS los elementos HTML con atributos data-\* podemos usar
directamente los selectors CSS de atributos (notación [..]):

```
   const selectorTitulo = "[data-titulo]";
   const tituloElement = document.querySelector(selectorTitulo);

   const selectorLista = "[data-lista='nombres']";
   const listaElement = document.querySelector(selectorLista);

   const itemsElement = listaElement.querySelectorAll("[data-id]");
```

## Consulta y modificación

Para consultar o modificar los valores de los atributos data-\* tenemos la propiedad dataset.
La propiedad dataset ofrece una propiedad para cada atributo data-\*

````
const itemsElement = listaElement.querySelectorAll("[data-id]");

itemsElement.forEach((item) => {
  const idItem = item.dataset.id;
  console.log(idItem, item.textContent);
});

```

Una alternativa a .dataset es la propiedad .getAttributes (setAttribute)
```
const idItem= item.getAttribute("data-id");
````

## Ventajas

Los atributos data-\* son un mecanismo limpio y simple de comunicación entre HTML y JavaScript.
Sus valores pueden servir para enviar información que será aprovechada por JS para realizar 
ciertas funcionalidades o para discriminar los elementos que deberán ser seleccionados por JS 
para establecer interacciones.

Veamos este caso con más detalle:

- Selección única (getElementById/querySelector): En vez de usar el atributo _id_ para seleccionar (getElementById) un único elemento HTML, podemos usar en sustitución un atributo data-id (en este caso mediante querySelector) con la ventaja de que en varios puntos de la página podemos usar el mismo valor para data-id (que no debería ser el caso para id)

```
   <div id="contenedor" data-id="contenedor"><div>

   const contenedorElement = document.getElementById("contenedor")
   const contenedorElement = document.querySelector("[data-id]='contenedor'")
```

- Selección múltiple (querySelectorAll): En vez de usar un atributo class para poder acceder a varios elementos HTML podemos usar un atributo data-\*-

```
   <ul data-lista="nombres">
      <li class="item" data-item">Pedro</li>
      <li class="item" data-item">Ana</li>
      <li class="item" data-item">Lucía</li>
  </ul>

  const itemsLista = document.querySelectorAll("item")
  const itemsLista = document.querySelectorAll("[data-item]")
```
De esta forma no sería necesario los atibutos id ni class para conectar JS y HTML.
El documento HTML nos daría información de quien accedería:
- CSS mediante clases 
- JS mediante atribitutos data-\*.

Por otra parte, el navegador ignora los atributos data-\*, lo que significa que su uso no tienen ningún efecto visual.


