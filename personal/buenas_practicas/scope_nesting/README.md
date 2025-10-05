# Estrategias para resolver conflictos CSS

El lenguaje CSS presupone un ánbito global a la hora de aplcar estilos. Esta circunstancia a dado lugar a una gran variedad de propuestas para paliar la dificultad que conlleva esta deción a la hora de organizar los estilos.

Una estrategia muy difundida es imponer normas a la hora de nombrar las clases de los elementos HTML a seleccionar (un ejemplo conocido en la notación BEM).

Sin embargo las versiones modernas de CSS ofrecen una alternativa mejor basada
en @scope o @ layer. Este proyecto muestra el uso de @scope para imponer ámbitos de aplicación en los estilos. Muestra que el anidamiento de forma aislada no es la solución, pero combinando @scope y anidamiento (nesting) se reduce significativamente los problemas y, de paso, desplaza la necesidad de notaciones más o menos engorrosas como propone la notación BEM y similares.

La desventaja es que es una propuesta novedosa que no está disponible en algunos navegadores (Firefox), aunque esta situación es razonable que cambie en poco tiempo.
