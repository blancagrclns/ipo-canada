// script.js

const audioCtx = new window.AudioContext();

const btnReproducir = document.getElementById("btnReproducir");
btnReproducir.addEventListener("click", reproducirAudio);


function reproducirAudio() {

  const oscilador = new OscillatorNode(audioCtx, {
    type: "sine",
    frequency: 300,
  });

  // Se fija de primero un valor menor que 1, para subirlo después 
  // sin llegar a uno, para evitar que el sonido se sobresature.
  const ganancia = new GainNode(audioCtx, {
    gain: 0.2,
  });

  oscilador.connect(ganancia);
  ganancia.connect(audioCtx.destination);

  const inicio = audioCtx.currentTime;
  const tiempoGanancia = inicio + 2;
  const tiempoFinal = tiempoGanancia + 2;

  ganancia.gain.setValueAtTime(0.9, tiempoGanancia);

  oscilador.start(inicio);
  oscilador.stop(tiempoFinal);

} 




