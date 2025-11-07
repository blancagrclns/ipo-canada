/* ==========================================================================
   1. ESPACIO DE NOMBRES GLOBAL
   ========================================================================== */
const APP = {
  nodos: {},
  audioContext: null,
  formaOnda: "sine",
  notasActivas: new Map(),
  temaOscuro: false,
  configuracion: {
    numOctavas: 2,
    volumen: 0.7,
    filtroFreq: 8000,
    reverbMix: 0,
  },
  nodosAudio: {
    masterGain: null,
    filter: null,
    convolver: null,
    dryGain: null,
    wetGain: null,
  },
  toastTimeout: null, // Para controlar el timeout del toast
};

/* ==========================================================================
   2. DATOS DE NOTAS MUSICALES
   ========================================================================== */
const NOTAS_BASE = [
  { nota: "C", nombre: "Do", frecuencia: 261.63, teclaPC: "A", tipo: "blanca" },
  {
    nota: "C#",
    nombre: "Do#",
    frecuencia: 277.18,
    teclaPC: "W",
    tipo: "negra",
    posicion: 1,
  },
  { nota: "D", nombre: "Re", frecuencia: 293.66, teclaPC: "S", tipo: "blanca" },
  {
    nota: "D#",
    nombre: "Re#",
    frecuencia: 311.13,
    teclaPC: "E",
    tipo: "negra",
    posicion: 2,
  },
  { nota: "E", nombre: "Mi", frecuencia: 329.63, teclaPC: "D", tipo: "blanca" },
  { nota: "F", nombre: "Fa", frecuencia: 349.23, teclaPC: "F", tipo: "blanca" },
  {
    nota: "F#",
    nombre: "Fa#",
    frecuencia: 369.99,
    teclaPC: "T",
    tipo: "negra",
    posicion: 4,
  },
  { nota: "G", nombre: "Sol", frecuencia: 392.0, teclaPC: "G", tipo: "blanca" },
  {
    nota: "G#",
    nombre: "Sol#",
    frecuencia: 415.3,
    teclaPC: "Y",
    tipo: "negra",
    posicion: 5,
  },
  { nota: "A", nombre: "La", frecuencia: 440.0, teclaPC: "H", tipo: "blanca" },
  {
    nota: "A#",
    nombre: "La#",
    frecuencia: 466.16,
    teclaPC: "U",
    tipo: "negra",
    posicion: 6,
  },
  { nota: "B", nombre: "Si", frecuencia: 493.88, teclaPC: "J", tipo: "blanca" },
];

// Mapeo adicional para segunda octava
const TECLAS_OCTAVA_2 = {
  z: "C",
  x: "D",
  c: "E",
  v: "F",
  b: "G",
  n: "A",
  m: "B",
  ",": "C",
  q: "C#",
  r: "D#",
  i: "F#",
  o: "G#",
  p: "A#",
};

// Mapeo adicional para tercera octava
const TECLAS_OCTAVA_3 = {
  1: "C",
  2: "D",
  3: "E",
  4: "F",
  5: "G",
  6: "A",
  7: "B",
  8: "C",
};

/* ==========================================================================
   3. CACHEAR NODOS DEL DOM
   ========================================================================== */
function cachearNodos() {
  APP.nodos.piano = document.querySelector("[data-piano]");
  APP.nodos.selectFormaOnda = document.querySelector(
    '[data-control="forma-onda"]'
  );
  APP.nodos.selectOctavas = document.querySelector('[data-control="octavas"]');
  APP.nodos.sliderVolumen = document.querySelector('[data-control="volumen"]');
  APP.nodos.sliderFiltro = document.querySelector('[data-control="filtro"]');
  APP.nodos.sliderReverb = document.querySelector('[data-control="reverb"]');
  APP.nodos.outputVolumen = document.querySelector('[data-output="volumen"]');
  APP.nodos.outputFiltro = document.querySelector('[data-output="filtro"]');
  APP.nodos.outputReverb = document.querySelector('[data-output="reverb"]');
  APP.nodos.toast = document.querySelector("[data-toast]");
  APP.nodos.toastMensaje = document.querySelector("[data-toast-mensaje]");
  APP.nodos.btnControles = document.getElementById("btnControles");
  APP.nodos.btnTema = document.getElementById("btnTema");
  APP.nodos.btnAyuda = document.getElementById("btnAyuda");
  APP.nodos.modalControles = document.querySelector("[data-modal-controles]");
  APP.nodos.modalAyuda = document.querySelector("[data-modal-ayuda]");
  APP.nodos.btnCerrarControles = document.querySelector(
    '[data-accion="cerrar-controles"]'
  );
  APP.nodos.btnCerrarAyuda = document.querySelector(
    '[data-accion="cerrar-ayuda"]'
  );
  APP.nodos.darkThemeLink = document.getElementById("dark-theme");

  console.log("✅ Nodos del DOM cacheados correctamente.");
}

/* ==========================================================================
   4. INICIALIZAR WEB AUDIO API CON CADENA DE EFECTOS
   ========================================================================== */
function inicializarAudio() {
  if (!APP.audioContext) {
    APP.audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Crear cadena de audio: Oscilador → Filtro → Reverb (dry/wet) → Master Gain → Destination

    // 1. Filtro paso-bajo
    APP.nodosAudio.filter = APP.audioContext.createBiquadFilter();
    APP.nodosAudio.filter.type = "lowpass";
    APP.nodosAudio.filter.frequency.value = APP.configuracion.filtroFreq;
    APP.nodosAudio.filter.Q.value = 1;

    // 2. Master Gain (volumen general)
    APP.nodosAudio.masterGain = APP.audioContext.createGain();
    APP.nodosAudio.masterGain.gain.value = APP.configuracion.volumen;

    // 3. Reverb (simulado con ConvolverNode + impulse response)
    APP.nodosAudio.convolver = APP.audioContext.createConvolver();
    APP.nodosAudio.convolver.buffer = crearImpulseResponse();

    // 4. Dry/Wet mix para reverb
    APP.nodosAudio.dryGain = APP.audioContext.createGain();
    APP.nodosAudio.dryGain.gain.value = 1 - APP.configuracion.reverbMix;

    APP.nodosAudio.wetGain = APP.audioContext.createGain();
    APP.nodosAudio.wetGain.gain.value = APP.configuracion.reverbMix;

    // Conectar cadena:
    // Filtro → DryGain → Master → Destination
    // Filtro → Convolver → WetGain → Master → Destination
    APP.nodosAudio.filter.connect(APP.nodosAudio.dryGain);
    APP.nodosAudio.filter.connect(APP.nodosAudio.convolver);
    APP.nodosAudio.convolver.connect(APP.nodosAudio.wetGain);

    APP.nodosAudio.dryGain.connect(APP.nodosAudio.masterGain);
    APP.nodosAudio.wetGain.connect(APP.nodosAudio.masterGain);

    APP.nodosAudio.masterGain.connect(APP.audioContext.destination);

    console.log(
      "🎵 AudioContext creado con cadena de efectos:",
      APP.audioContext.state
    );
    mostrarToast("Audio inicializado correctamente");
  }

  if (APP.audioContext.state === "suspended") {
    APP.audioContext.resume();
  }
}

/* ==========================================================================
   5. CREAR IMPULSE RESPONSE PARA REVERB
   ========================================================================== */
function crearImpulseResponse() {
  const sampleRate = APP.audioContext.sampleRate;
  const length = sampleRate * 2; // 2 segundos de reverb
  const impulse = APP.audioContext.createBuffer(2, length, sampleRate);
  const impulseL = impulse.getChannelData(0);
  const impulseR = impulse.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const decay = Math.pow(1 - i / length, 2);
    impulseL[i] = (Math.random() * 2 - 1) * decay;
    impulseR[i] = (Math.random() * 2 - 1) * decay;
  }

  return impulse;
}

/* ==========================================================================
   6. GENERAR PIANO DINÁMICAMENTE
   ========================================================================== */
function generarPiano(numOctavas) {
  APP.nodos.piano.innerHTML = ""; // Limpiar piano existente

  const octavaInicial = 4;
  let contadorBlancas = 0;

  for (let octava = 0; octava < numOctavas; octava++) {
    const octavaActual = octavaInicial + octava;

    NOTAS_BASE.forEach((notaBase, index) => {
      const frecuencia = notaBase.frecuencia * Math.pow(2, octava);
      const nota = `${notaBase.nota}${octavaActual}`;

      // Determinar tecla del PC según la octava
      let teclaPC = notaBase.teclaPC;
      if (octava === 1) {
        const teclaOctava2 = Object.entries(TECLAS_OCTAVA_2).find(
          ([key, val]) => val === notaBase.nota.replace("#", "")
        );
        teclaPC = teclaOctava2 ? teclaOctava2[0].toUpperCase() : "";
      } else if (octava === 2) {
        const teclaOctava3 = Object.entries(TECLAS_OCTAVA_3).find(
          ([key, val]) => val === notaBase.nota.replace("#", "")
        );
        teclaPC = teclaOctava3 ? teclaOctava3[0] : "";
      }

      const boton = document.createElement("button");
      boton.className = `tecla tecla--${notaBase.tipo}`;
      boton.dataset.nota = nota;
      boton.dataset.frecuencia = frecuencia;
      boton.setAttribute("aria-label", `${notaBase.nombre} (${nota})`);

      // Posicionamiento de teclas negras
      if (notaBase.tipo === "negra") {
        const posicion =
          notaBase.posicion + (contadorBlancas - (index > 4 ? 1 : 0));
        boton.classList.add(`tecla--negra-${posicion}`);
        boton.style.left = `calc(var(--espaciado-base) * 2 + (var(--tecla-blanca-ancho) + 2px) * ${
          posicion - 1
        } - var(--tecla-negra-ancho) / 2)`;
      } else {
        contadorBlancas++;
      }

      // Contenido de la tecla
      const etiqueta = document.createElement("span");
      etiqueta.className = "tecla__etiqueta";
      etiqueta.textContent = notaBase.nombre;

      if (teclaPC) {
        const teclaSpan = document.createElement("span");
        teclaSpan.className = "tecla__tecla-pc";
        teclaSpan.textContent = teclaPC;
        boton.appendChild(teclaSpan);
      }

      boton.appendChild(etiqueta);
      APP.nodos.piano.appendChild(boton);
    });
  }

  // Re-cachear teclas y añadir event listeners
  APP.nodos.teclas = document.querySelectorAll(".tecla");
  APP.nodos.teclas.forEach((tecla) => {
    tecla.addEventListener("click", handleClickTecla);
    tecla.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClickTecla({ currentTarget: tecla });
      }
    });
  });

  console.log(`🎹 Piano generado con ${numOctavas} octava(s)`);
}

/* ==========================================================================
   7. TOCAR NOTA MUSICAL
   ========================================================================== */
function tocarNota(frecuencia, nota) {
  inicializarAudio();

  if (APP.notasActivas.has(nota)) {
    return;
  }

  const oscilador = APP.audioContext.createOscillator();
  oscilador.type = APP.formaOnda;
  oscilador.frequency.setValueAtTime(frecuencia, APP.audioContext.currentTime);

  const ganancia = APP.audioContext.createGain();
  ganancia.gain.setValueAtTime(0.3, APP.audioContext.currentTime);

  // Conectar a la cadena de efectos
  oscilador.connect(ganancia);
  ganancia.connect(APP.nodosAudio.filter);

  oscilador.start();

  APP.notasActivas.set(nota, { oscilador, ganancia });

  console.log(`🎹 Tocando ${nota} (${frecuencia.toFixed(2)} Hz)`);
  mostrarToast(`♪ ${nota} (${frecuencia.toFixed(2)} Hz)`);
}
/* ==========================================================================
   8. DETENER NOTA MUSICAL
   ========================================================================== */
function detenerNota(nota) {
  if (!APP.notasActivas.has(nota)) {
    return;
  }

  const { oscilador, ganancia } = APP.notasActivas.get(nota);
  const tiempoActual = APP.audioContext.currentTime;

  ganancia.gain.setValueAtTime(ganancia.gain.value, tiempoActual);
  ganancia.gain.exponentialRampToValueAtTime(0.001, tiempoActual + 0.1);

  oscilador.stop(tiempoActual + 0.1);

  APP.notasActivas.delete(nota);
}

/* ==========================================================================
   9. MANEJAR CLICK EN TECLA
   ========================================================================== */
function handleClickTecla(e) {
  const tecla = e.currentTarget;
  const nota = tecla.dataset.nota;
  const frecuencia = parseFloat(tecla.dataset.frecuencia);

  tecla.classList.add("tecla--activa");
  tocarNota(frecuencia, nota);

  setTimeout(() => {
    tecla.classList.remove("tecla--activa");
    detenerNota(nota);
  }, 200);
}

/* ==========================================================================
   10. MANEJAR TECLAS DEL ORDENADOR
   ========================================================================== */
function handleKeyDown(e) {
  if (e.repeat) return;

  const teclaPC = e.key.toLowerCase();
  let notaBuscada = null;

  // Buscar en todas las teclas generadas
  APP.nodos.teclas.forEach((boton) => {
    const teclaBoton = boton.querySelector(".tecla__tecla-pc");
    if (teclaBoton && teclaBoton.textContent.toLowerCase() === teclaPC) {
      notaBuscada = boton;
    }
  });

  if (!notaBuscada) return;

  const nota = notaBuscada.dataset.nota;
  const frecuencia = parseFloat(notaBuscada.dataset.frecuencia);

  notaBuscada.classList.add("tecla--activa");
  tocarNota(frecuencia, nota);
}

function handleKeyUp(e) {
  const teclaPC = e.key.toLowerCase();
  let notaBuscada = null;

  APP.nodos.teclas.forEach((boton) => {
    const teclaBoton = boton.querySelector(".tecla__tecla-pc");
    if (teclaBoton && teclaBoton.textContent.toLowerCase() === teclaPC) {
      notaBuscada = boton;
    }
  });

  if (!notaBuscada) return;

  const nota = notaBuscada.dataset.nota;
  notaBuscada.classList.remove("tecla--activa");
  detenerNota(nota);
}

/* ==========================================================================
   11. CONTROLES DE SONIDO
   ========================================================================== */
function cambiarFormaOnda(e) {
  APP.formaOnda = e.target.value;
  console.log(`🎛️ Forma de onda: ${APP.formaOnda}`);
  mostrarToast(`Forma de onda: ${obtenerNombreOnda(APP.formaOnda)}`);
}

function cambiarNumOctavas(e) {
  APP.configuracion.numOctavas = parseInt(e.target.value);
  generarPiano(APP.configuracion.numOctavas);
  const texto = APP.configuracion.numOctavas === 1 ? "octava" : "octavas";
  mostrarToast(`Piano con ${APP.configuracion.numOctavas} ${texto}`);
  console.log(`🎹 Octavas: ${APP.configuracion.numOctavas}`);
}

function cambiarVolumen(e) {
  const volumen = parseInt(e.target.value) / 100;
  APP.configuracion.volumen = volumen;

  if (APP.nodosAudio.masterGain) {
    APP.nodosAudio.masterGain.gain.setValueAtTime(
      volumen,
      APP.audioContext.currentTime
    );
  }

  APP.nodos.outputVolumen.textContent = `${e.target.value}%`;
  console.log(`🔊 Volumen: ${e.target.value}%`);
}

function cambiarFiltro(e) {
  const frecuencia = parseInt(e.target.value);
  APP.configuracion.filtroFreq = frecuencia;

  if (APP.nodosAudio.filter) {
    APP.nodosAudio.filter.frequency.setValueAtTime(
      frecuencia,
      APP.audioContext.currentTime
    );
  }

  APP.nodos.outputFiltro.textContent = `${frecuencia} Hz`;
  console.log(`🎛️ Filtro: ${frecuencia} Hz`);
}

function cambiarReverb(e) {
  const mix = parseInt(e.target.value) / 100;
  APP.configuracion.reverbMix = mix;

  if (APP.nodosAudio.dryGain && APP.nodosAudio.wetGain) {
    APP.nodosAudio.dryGain.gain.setValueAtTime(
      1 - mix,
      APP.audioContext.currentTime
    );
    APP.nodosAudio.wetGain.gain.setValueAtTime(
      mix,
      APP.audioContext.currentTime
    );
  }

  APP.nodos.outputReverb.textContent = `${e.target.value}%`;
  console.log(`✨ Reverb: ${e.target.value}%`);
}

function obtenerNombreOnda(tipo) {
  const nombres = {
    sine: "Sinusoidal",
    triangle: "Triangular",
    square: "Cuadrada",
    sawtooth: "Diente de sierra",
  };
  return nombres[tipo] || tipo;
}

/* ==========================================================================
   12. SISTEMA DE TOAST (MENSAJES EMERGENTES)
   ========================================================================== */
function mostrarToast(mensaje, duracion = 2500) {
  // Limpiar timeout anterior si existe
  if (APP.toastTimeout) {
    clearTimeout(APP.toastTimeout);
  }

  // Actualizar mensaje
  APP.nodos.toastMensaje.textContent = mensaje;

  // Mostrar toast
  APP.nodos.toast.classList.add("toast--visible");

  // Ocultar después de la duración especificada
  APP.toastTimeout = setTimeout(() => {
    APP.nodos.toast.classList.remove("toast--visible");
  }, duracion);
}

/* ==========================================================================
   13. DETENER TODAS LAS NOTAS
   ========================================================================== */
function detenerTodasLasNotas() {
  APP.notasActivas.forEach((_, nota) => {
    detenerNota(nota);
  });
  console.log("🛑 Todas las notas detenidas.");
}

/* ==========================================================================
   14. ALTERNAR TEMA OSCURO
   ========================================================================== */
function alternarTema() {
  APP.temaOscuro = !APP.temaOscuro;

  if (APP.temaOscuro) {
    APP.nodos.darkThemeLink.disabled = false;
    APP.nodos.btnTema.textContent = "☀️";
    APP.nodos.btnTema.setAttribute("aria-label", "Cambiar a tema claro");
    localStorage.setItem("tema", "oscuro");
    mostrarToast("Tema oscuro activado");
    console.log("🌙 Tema oscuro activado");
  } else {
    APP.nodos.darkThemeLink.disabled = true;
    APP.nodos.btnTema.textContent = "🌙";
    APP.nodos.btnTema.setAttribute("aria-label", "Cambiar a tema oscuro");
    localStorage.setItem("tema", "claro");
    mostrarToast("Tema claro activado");
    console.log("☀️ Tema claro activado");
  }
}

function cargarPreferenciaTema() {
  const temaGuardado = localStorage.getItem("tema");
  if (temaGuardado === "oscuro") {
    APP.temaOscuro = false;
    alternarTema();
  }
}

/* ==========================================================================
   15. MODALES
   ========================================================================== */
function abrirControles() {
  APP.nodos.modalControles.showModal();
  console.log("🎛️ Modal de controles abierta");
}

function cerrarControles() {
  APP.nodos.modalControles.close();
  console.log("✕ Modal de controles cerrada");
}
function abrirAyuda() {
  APP.nodos.modalAyuda.showModal();
  console.log("❓ Modal de ayuda abierta");
}

function cerrarAyuda() {
  APP.nodos.modalAyuda.close();
  console.log("✕ Modal de ayuda cerrada");
}

/* ==========================================================================
   16. INICIALIZACIÓN DE LA APLICACIÓN
   ========================================================================== */
function init() {
  console.log("🚀 Inicializando piano interactivo avanzado...");

  cachearNodos();
  cargarPreferenciaTema();
  generarPiano(APP.configuracion.numOctavas);

  // Event listeners - Controles
  APP.nodos.selectFormaOnda.addEventListener("change", cambiarFormaOnda);
  APP.nodos.selectOctavas.addEventListener("change", cambiarNumOctavas);
  APP.nodos.sliderVolumen.addEventListener("input", cambiarVolumen);
  APP.nodos.sliderFiltro.addEventListener("input", cambiarFiltro);
  APP.nodos.sliderReverb.addEventListener("input", cambiarReverb);

  // Event listeners - Teclado del ordenador
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  // Event listeners - Modales y tema
  APP.nodos.btnControles.addEventListener("click", abrirControles);
  APP.nodos.btnTema.addEventListener("click", alternarTema);
  APP.nodos.btnAyuda.addEventListener("click", abrirAyuda);
  APP.nodos.btnCerrarControles.addEventListener("click", cerrarControles);
  APP.nodos.btnCerrarAyuda.addEventListener("click", cerrarAyuda);

  // Cerrar modales con tecla Escape (funcionalidad nativa de <dialog>)
  APP.nodos.modalControles.addEventListener("cancel", () => {
    console.log("✕ Modal de controles cerrada con Escape");
  });

  APP.nodos.modalAyuda.addEventListener("cancel", () => {
    console.log("✕ Modal de ayuda cerrada con Escape");
  });

  // Detener todo al cambiar de pestaña
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      detenerTodasLasNotas();
    }
  });

  // Inicializar audio con primer click/tecla
  document.addEventListener("click", inicializarAudio, { once: true });
  document.addEventListener("keydown", inicializarAudio, { once: true });

  console.log("✅ Piano avanzado listo.");
  mostrarToast("¡Piano listo! Haz clic para empezar 🎹");
}

/* ==========================================================================
   17. EJECUTAR CUANDO EL DOM ESTÉ LISTO
   ========================================================================== */
init();
