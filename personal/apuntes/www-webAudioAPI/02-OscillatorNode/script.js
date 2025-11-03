// script.js

const audioCtx = new window.AudioContext();

const btnReproducir = document.getElementById("btnReproducir");
btnReproducir.addEventListener("click", reproducirAudio);

function reproducirAudio() {

  const oscilador01 = new OscillatorNode(audioCtx, {
    type: "sine",
    frequency: 220,
  });

  const oscilador02 = new OscillatorNode(audioCtx, {
    type: "triangle",
    frequency: 210,
  });

  oscilador01.connect(audioCtx.destination);
  oscilador02.connect(audioCtx.destination);

  const now = audioCtx.currentTime;
  
  const inicioOscilador01 = now;
  const inicioOscilador02 = now + 1;
  const duracionOscilador01 = 4;
  const duracionOscilador02 = 3;

  oscilador01.start(inicioOscilador01);
  oscilador01.stop(inicioOscilador01 + duracionOscilador01);

  oscilador02.start(inicioOscilador02);
  oscilador02.stop(inicioOscilador02 + duracionOscilador02);
}







