# PROYECTO Tablero

El proyecto consiste en una aplicación web para completar un juego de fichas dispuestas en un tablero cuadrado NxN.
La mecánica del juego consiste en intecambiar la posición de dos fichas con el objetivo de
situar las fichas en el tablero de forma que cada una de sus filas contenga todas las fichas del mismo color.


Se incluye un fichero index.html con los elementos básicos del proyecto que deberá completarse para crear la composición final propuesta.  El proyecto deberá ir acompañado de su correspondiente hoja de estilos (style.css) y el guión (script.js) 
encargado de los los aspectos interactivos y funcionales. Se incluye una hoja de estilos con un estilo mínimo y orientativo que deberá 
ser rediseñado. 

## Objetivos
Los objetivos de esta actividad son el aprendizaje de las siguientes técnicas:

- Composiciones apoyándose en Flexbox & Grid
- Interaccion mediante la API Drag & Drop (y dataTransfer)

Se deben tener presentes en el diseño: 
- los aspectos estilísticos (diseño cromático y tipográfico, gestión del espacio y la composición)
- los aspectos interactivos (apoyar visualmente las interacciones para facilitar su comprensión)


## Elementos relevantes en la interacción 

La página HTML incluye los siguientes elementos:
- Un pararrafo <p> encargado de la identificación del proyecto
- Un contenedor [data-ficha] para representar las fichas del tablero mediante un atributo data-*. El número de contenedores ficha depende del valor de la entrada id="tamañoTablero". 
- Un boton id="inicio" que dará comienzo a un nuevo juego. 
- Un control id="tamañoFicha" para seleccionar el tamaño de las fichas. 
- Un contro id="tamañoTablero" para modificar el tamaño NxN del tablero.

Debe tenerse en cuenta que:
- Se incluye un estilo .ficha en la hoja style.css para estilizar las fichas. El estilo incluído es orientativo y sujeto a los cambios que se consideren oportunos.
- Los cambios en el tamaño de las fichas o del tablero no se harán efectivos hasta pulsar el boto inicio
- La respuesta a pulsar el botón de inicio conlleva varias implicaciones:
    -- La generación de una nueva distribución - coherente pero aleatoria - de las fichas en el tablero.
    -- Modificar la estrucutura del tablero atendiendo a los valores del tamaño nxn y del tamaño de las fichas.  
- El intercambio de las fichas se realizará arrastrando y soltando fichas del tablero.
- Las fichas incluyen un atributo global data-ficha para facilitar su acceso en JavaScript 


## Variantes

- Permitir cambiar la forma de las fichas (círculos, cuadrados, triángulos, etc)
- Añadir un componente explicativo del juego mediante una ventana modal
- Mostrar el número de intercambios efectuados.
- Añadir un temporizador que registre el tiempo empleado para resolver el juego
- Mostrar dos tableros, de forma que los intercambios de fichas sean de un tablero al otro.
- Comprobar que el tablero ha sido completado con éxito y hacer patente esta información
- Modificar la mecánica del juego (un ejemplo simple sería que las fichas unidas representaran una imagen)


## Referencias
