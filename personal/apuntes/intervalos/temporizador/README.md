# Intervalos

Los intervalos permiten la ejecución de una función cada cierto intervalo de tiempo (medido en milisengundos).

La consola muestra la activación/desactivación del temporizador

La implementación se apoya en:

1. una variable identificadorTemporizador  
    let identificadorTemporizador = <n>
   Los intervalos se identifican mediante un entero positivo no nulo n (un programa puede tener activo más de un temporizador).

2. una funcion _setInterval_  
    idetificadorTemporizador = setInterval(unaFuncion,intervalo)
   Activa un temporizador indicando la función (callback) que debe ser ejecutada cada cierto tiempo en milisegundos (intervalo)

3. una función _clearInterval_  
    clearInterval(idetificadoTemporizador)
   Cancela la ejecución de la función asociada al temporizador (OJO: el temporizador persiste salvo que lo desactivemos)

# Referencias

[MDN: setInterval](https://developer.mozilla.org/en-US/docs/Web/API/setInterval)
[MDN: clearInterval] (https://developer.mozilla.org/en-US/docs/Web/API/clearInterval)
