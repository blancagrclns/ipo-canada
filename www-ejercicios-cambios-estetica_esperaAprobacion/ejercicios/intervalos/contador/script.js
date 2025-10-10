// Este script utiliza setInterval para ejecutar una función cada segundo
// que incrementa un contador y lo muestra en la consola.
// Cuando el contador llega a 5, se detiene el intervalo.

let contador = 0;
const miIntervalo = setInterval(() => {
  console.log(`Contador: ${contador}`);
  contador++;

  if (contador === 5) {
    // Detiene la ejecución cuando el contador llega a 5
    clearInterval(miIntervalo);
    console.log("¡Intervalo detenido!");
  }
}, 1000);
