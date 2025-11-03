// script.js

const audioCtx = new AudioContext();

const btnReproducir = document.getElementById("btnReproducir");
btnReproducir.addEventListener("click", reproducirAudio);


function reproducirAudio() {

  const source = new OscillatorNode(audioCtx, {
    type: "sine",
    frequency: 220,
  });

  source.connect(audioCtx.destination);

  const inicio= audioCtx.currentTime;
  const duracion = 4;
  
  source.start(inicio);
  source.stop(inicio+duracion);
}




