// script.js

const audioCtx = new window.AudioContext();

const btnReproducir = document.getElementById("btnReproducir");
btnReproducir.addEventListener("click", reproducirAudio);

function reproducirAudio() {

  const source = new OscillatorNode(audioCtx);
  source.connect(audioCtx.destination);

  // Frecuencias del acorde do Mayor: do4, mi4, sol4
  const do4 = 261.63;
  const mi4 = 329.63;
  const sol4 = 392.00;

  const duracionExponential = 1.5; 
  const duracionEstatica = 2; 
  const duracionLinear = 1.5; 

  let tiempo = audioCtx.currentTime;
  source.frequency.setValueAtTime(do4, tiempo);

  // Fija tiempo de inicio para el cambio exponecial
  tiempo += duracionEstatica;
  source.frequency.setValueAtTime(do4, tiempo);

  tiempo += duracionExponential;  
  source.frequency.exponentialRampToValueAtTime(mi4, tiempo);

    // Fija tiempo de inicio para el cambio lineal
  tiempo += duracionEstatica;
  source.frequency.setValueAtTime(mi4, tiempo);

  tiempo += duracionLinear;
  source.frequency.linearRampToValueAtTime(sol4, tiempo);

  source.start();
  tiempo += duracionEstatica;
  source.stop(tiempo);

}


