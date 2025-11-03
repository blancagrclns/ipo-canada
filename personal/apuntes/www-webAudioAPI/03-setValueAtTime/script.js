// script.js

const audioCtx = new window.AudioContext();

const btnReproducir = document.getElementById("btnReproducir");
btnReproducir.addEventListener("click", reproducirAudio);


function reproducirAudio() {

  const source = new OscillatorNode(audioCtx)
  source.connect(audioCtx.destination);

  // Frecuencias del acorde do Mayor: do4, mi4, sol4, do5
  const do4 = 261.63;
  const mi4 = 329.63;
  const sol4 = 392.00;
  const do5 = 523.25;

  const duracionNota = 1.5;

  let tiempo = audioCtx.currentTime;
  source.frequency.setValueAtTime(do4, tiempo);

  tiempo += duracionNota;
  source.frequency.setValueAtTime(mi4, tiempo);

  tiempo += duracionNota;
  source.frequency.setValueAtTime(sol4, tiempo);

  tiempo += duracionNota;
  source.frequency.setValueAtTime(do5, tiempo);
  
  source.start();
  tiempo += duracionNota;
  source.stop(tiempo);

}






