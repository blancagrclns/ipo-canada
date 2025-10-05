# Proyecto mecanografía

El proyecto consiste en una aplicación web para testar la velocidad en mecanografía.

El objetivo de la actividad es el aprendizaje de las siguientes técnicas:

- realizar composiciones apoyándose en flexbox/grid
- manejo de intervalos
- interacción con el usuario mediante teclado

# Consideraciones

En pantalla se muestra una palabra de muestra (id="palabraDeMuestra") y un campo de entrada (id="entrada") para que el usuario teclee. También se muestra un boton id="btnComienzo" para dar comienzo al test de velocidad. El botón activará un temporizador
que contabiliza y muestra en id="tiempo" el tiempo transcurrido en segundos.

Si la palabra tecleada coincide con la palabra de muestra entonces:

- se incrementa el número de palabras correctas (id="palabrasCorrectas")
- se cambia la palabra de muestra.

NOTA: En el módulo utils.js se exporta una función **recuperaElementoAleatorio(array)** que puede ser empleada para seleccionar la palabra de muestra que será mostrada en id="palabraDeMuestra" durante el transcurso del test (considerando que las todas las palabras disponibles están almacenadas en un array.)

Se incluye un fichero index.html con los elementos HTML básicos del ejercicios. El ejercicio debe completarse con la estructura de la página para crear la composición final propuesta.
La composición irá acompañada de su correspondiente hoja de estilos (style.css) y el guión (script.js) encargado de los los aspectos interactivos y funcionales.

# Teclado

[MDN input_event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event)
El contenido del campo de entrada input responde a distitnos eventos que nos permiten controlar su contenido

# Intervalos

[MDN: setInterval](https://developer.mozilla.org/en-US/docs/Web/API/setInterval)
[MDN: clearInterval] (https://developer.mozilla.org/en-US/docs/Web/API/clearInterval)

Para calcular los segundos empleados durante el test de mecanografia se hará uso de un intervalos.
Los intervalos permiten la ejecución de una función cada cierto intervalo de tiempo (medido en milisengundos).

La implementación se apoya en:

- una variable identificadorIntervalo  
   Los temporizadores se identifican mediante un entero positivo no nulo
  (un programa puede tener activo más de un temporizador). y dos funciones: y
- una funcion _setInterval_ idetificadorTemporizador = setInterval(unaFuncion,intervalo)
  Activa un temporizador indicando la función que debe ser ejecutada cada cierto tiempo en milisegundos (intervalo)
- una función _clearInterval_ clearInterval(idetificadoTemporizador)
  Cancela la ejecución de la función asociada al temporizador (OJO: el temporizador persiste salvo que lo desactivemos)

# Variantes

- Permitir que el usuario puede pausar temporalmente el test
- Fijar de antemano el número de palabras que deben ser mecanografiadas
- Facilitar distintos juegos de palabras
- Poder fijar un tiempo máximo (para medir cuantas palabras correctas se han mecanografiado en dicho tiempo)
- Test bilingue: la palabra se muestra en un idioma (ej: inglés) y se debe mecanografiar otro (ej: español)
- Asociar acciones a teclas numéricas (ej: Cada número es un nivel de dificultad de las palabras)
- Añadir un componente explicativo mediante una ventana modal
