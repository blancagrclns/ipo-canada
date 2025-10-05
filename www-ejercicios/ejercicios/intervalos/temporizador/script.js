//   Temporizador

// Esta aplicación implementa un Termporizador con intervalos JS

// Los intervaloes activos se representa con un entero positivo no nulo
// De partida el valor es cero (indicando que no está activo)

let identificadorIntervalo = 0;

const comienzo = document.getElementById("btnComienzo");
const fin = document.getElementById("btnFin");
const tiempo = document.getElementById("tiempo");

comienzo.addEventListener("click", comenzarTemporizador);
fin.addEventListener("click", detenerTemporizador);

function actualizaTiempo() {
  //  Incrementa en una unidad el contador de tiempo
  let valorTiempo = +tiempo.innerText;
  valorTiempo++;
  tiempo.innerText = valorTiempo.toString();
}

function comenzarTemporizador() {
  // Activa el Intervalo para que se actualiza el tiempo cada segundo (1000msg)
  // La pulsación continuada de Comenzar podría crear y activar varios intervalos.

  if (identificadorIntervalo == 0) {
    tiempo.innerText = 0;

    // Crea un intervalo (asignandole un valor entero positivo no nulo) y lo activa
    // El argumento primero de setInterval es el nombre de la función que será invocada cada segundo (método callback)
    identificadorIntervalo = setInterval(actualizaTiempo, 1000);

    console.log("Intervalo activado:", identificadorIntervalo);
  }
}

function detenerTemporizador() {
  //  Detiene el intervalo y actualiza la variable identificadorIntervalo
  //  a cero, para indicar que no hay activo ningun Intervalo

  clearInterval(identificadorIntervalo);
  console.log("Intervalo desactivado:", identificadorIntervalo);
  console.log(identificadorIntervalo);
  identificadorIntervalo = 0;
}

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
