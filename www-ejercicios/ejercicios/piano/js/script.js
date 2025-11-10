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
  // NUEVO: Guardado temporal de configuración antes de abrir el modal
  configuracionTemporal: null,
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
  APP.nodos.btnControles = document.querySelector('[data-accion="abrir-controles"]');
  APP.nodos.btnTema = document.querySelector('[data-accion="cambiar-tema"]');
  APP.nodos.btnAyuda = document.querySelector('[data-accion="mostrar-ayuda"]');
  APP.nodos.modalControles = document.querySelector('[data-modal="controles"]');
  APP.nodos.modalAyuda = document.querySelector('[data-modal="ayuda"]');
  // ELIMINADO: APP.nodos.btnCerrarControles → ya no usamos el botón "×"
  APP.nodos.btnCerrarAyuda = document.querySelector('[data-accion="cerrar-ayuda"]');
  APP.nodos.btnAceptarControles = document.querySelector('[data-accion="aceptar-controles"]');
  APP.nodos.btnCancelarControles = document.querySelector('[data-accion="cancelar-controles"]');
  
  /* EXCEPCIÓN: id para <link> del tema */
  APP.nodos.darkThemeLink = document.getElementById("dark-theme");

  console.log("✅ Nodos del DOM cacheados correctamente.");
}

function obtenerNumeroDeCSS(nombreVariable, fallback = 0) {
  const valor = getComputedStyle(document.documentElement).getPropertyValue(
    nombreVariable
  );
  const numero = parseFloat(valor);
  return Number.isNaN(numero) ? fallback : numero;
}

function recalcularDimensionesTeclas() {
  if (!APP.nodos.piano) {
    return;
  }

  const totalTeclasBlancas = obtenerNumeroDeCSS("--total-teclas-blancas", 0);
  if (!totalTeclasBlancas) {
    return;
  }

  /* 
     CRÍTICO: Medir el CONTENEDOR PADRE, no el piano
     - El piano tiene justify-content: center → su width se adapta al contenido
     - Necesitamos medir el espacio DISPONIBLE en el contenedor padre
     - Esto permite que el piano crezca cuando hay más espacio
  */
  const contenedor = APP.nodos.piano.parentElement;
  if (!contenedor) {
    return;
  }

  // Forzar reflow
  contenedor.offsetWidth;
  
  const rect = contenedor.getBoundingClientRect();
  if (!rect.width) {
    return;
  }

  const estilos = getComputedStyle(APP.nodos.piano);
  const paddingLeft = parseFloat(estilos.paddingLeft) || 0;
  const paddingRight = parseFloat(estilos.paddingRight) || 0;
  const gap = parseFloat(estilos.gap || estilos.columnGap || 0);

  // Restar padding del contenedor también
  const estilosContenedor = getComputedStyle(contenedor);
  const contenedorPaddingLeft = parseFloat(estilosContenedor.paddingLeft) || 0;
  const contenedorPaddingRight = parseFloat(estilosContenedor.paddingRight) || 0;

  /* 
     Ancho disponible = ancho del contenedor - paddings
     Usamos un 95% del ancho disponible para dejar un pequeño margen
  */
  const anchoDisponible = rect.width - contenedorPaddingLeft - contenedorPaddingRight;
  const anchoUtil = anchoDisponible * 0.95; // 95% del espacio disponible
  
  const espacioGaps = gap * Math.max(0, totalTeclasBlancas - 1);
  const espacioPaddings = paddingLeft + paddingRight;
  const anchoParaTeclas = anchoUtil - espacioGaps - espacioPaddings;

  if (anchoParaTeclas <= 0) {
    return;
  }

  const anchoMin = obtenerNumeroDeCSS("--tecla-blanca-ancho-min", 24);
  const anchoMax = obtenerNumeroDeCSS("--tecla-blanca-ancho-max", 60);
  const relacionBlanca = obtenerNumeroDeCSS("--relacion-tecla-blanca", 4.4);
  const relacionNegraAncho = obtenerNumeroDeCSS(
    "--relacion-tecla-negra-ancho",
    0.62
  );
  const relacionNegraAlto = obtenerNumeroDeCSS(
    "--relacion-tecla-negra-alto",
    0.65
  );

  // Calcular ancho óptimo dentro de los límites min/max
  const anchoCalculado = Math.max(
    anchoMin,
    Math.min(anchoMax, anchoParaTeclas / totalTeclasBlancas)
  );
  const altoBlanca = anchoCalculado * relacionBlanca;
  const anchoNegra = anchoCalculado * relacionNegraAncho;
  const altoNegra = altoBlanca * relacionNegraAlto;

  const root = document.documentElement;
  
  // Siempre establecer los valores
  root.style.setProperty("--tecla-blanca-ancho", `${anchoCalculado}px`);
  root.style.setProperty("--tecla-blanca-alto", `${altoBlanca}px`);
  root.style.setProperty("--tecla-negra-ancho", `${anchoNegra}px`);
  root.style.setProperty("--tecla-negra-alto", `${altoNegra}px`);
  
  console.log(`📐 Contenedor: ${rect.width.toFixed(0)}px | Teclas: blanca=${anchoCalculado.toFixed(1)}×${altoBlanca.toFixed(1)}px, negra=${anchoNegra.toFixed(1)}×${altoNegra.toFixed(1)}px`);
}

function actualizarVariablesDeTeclas(totalBlancas) {
  if (!totalBlancas) {
    return;
  }
  document.documentElement.style.setProperty(
    "--total-teclas-blancas",
    totalBlancas
  );
  recalcularDimensionesTeclas();
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

  // Conjunto para evitar asignar la misma tecla física a varias notas
  const usedKeys = new Set();

  // Mapeo de teclas ÚNICO por nota musical (no por octava)
  // Cada nota musical se asigna a UNA SOLA tecla del ordenador
  // TERCERA OCTAVA: Usamos teclas de la fila superior sin Shift (más accesibles)
  const MAPEO_UNICO = {
    // Primera octava (octava 0)
    "C-0": "A", "C#-0": "W", "D-0": "S", "D#-0": "E", "E-0": "D", 
    "F-0": "F", "F#-0": "T", "G-0": "G", "G#-0": "Y", "A-0": "H", "A#-0": "U", "B-0": "J",
    
    // Segunda octava (octava 1)
    "C-1": "Z", "C#-1": "Q", "D-1": "X", "D#-1": "R", "E-1": "C", 
    "F-1": "V", "F#-1": "I", "G-1": "B", "G#-1": "O", "A-1": "N", "A#-1": "P", "B-1": "M",
    
    // Tercera octava (octava 2) - TECLAS ACCESIBLES SIN SHIFT
    // Fila de números (1-9) y algunas teclas adicionales (0, -, =)
    "C-2": "1",  // Do
    "C#-2": "2", // Do# (número 2 en lugar de !)
    "D-2": "3",  // Re
    "D#-2": "4", // Re# (número 4 en lugar de @)
    "E-2": "5",  // Mi
    "F-2": "6",  // Fa
    "F#-2": "7", // Fa# (número 7 en lugar de $)
    "G-2": "8",  // Sol
    "G#-2": "9", // Sol# (número 9 en lugar de %)
    "A-2": "0",  // La (número 0 en lugar de 6)
    "A#-2": "-", // La# (guión en lugar de ^)
    "B-2": "+"   // Si (igual en lugar de 7)
  };

  for (let octava = 0; octava < numOctavas; octava++) {
    const octavaActual = octavaInicial + octava;

    NOTAS_BASE.forEach((notaBase, index) => {
      const frecuencia = notaBase.frecuencia * Math.pow(2, octava);
      const nota = `${notaBase.nota}${octavaActual}`;

      // Crear clave única para buscar en el mapeo: "nota-octava"
      const claveMapeo = `${notaBase.nota}-${octava}`;
      const teclaPC = MAPEO_UNICO[claveMapeo] || "";

      // Solo asignar si hay tecla y no está ya usada
      let teclaFinal = "";
      if (teclaPC && !usedKeys.has(teclaPC.toLowerCase())) {
        teclaFinal = teclaPC;
        usedKeys.add(teclaPC.toLowerCase());
      }

      const boton = document.createElement("button");
      boton.className = `tecla tecla--${notaBase.tipo}`;
      boton.dataset.nota = nota;
      boton.dataset.frecuencia = frecuencia;
      if (teclaFinal) boton.dataset.teclaPc = teclaFinal.toLowerCase();
      boton.setAttribute("aria-label", `${notaBase.nombre} (${nota})`);

      // Posicionamiento de teclas negras según patrón real de piano
      if (notaBase.tipo === "negra") {
        // Calcular posición relativa dentro de la octava actual
        const posicionEnOctava = notaBase.posicion;
        const posicionAbsoluta = (octava * 7) + posicionEnOctava;
        boton.classList.add(`tecla--negra-${posicionAbsoluta}`);
      } else {
        contadorBlancas++;
      }

      // Contenido de la tecla - MANTENER NOMBRES EN ESPAÑOL
      const etiqueta = document.createElement("span");
      etiqueta.className = "tecla__etiqueta";
      etiqueta.textContent = notaBase.nombre; // Do, Re, Mi, etc.

      // Añadir etiqueta de tecla del ordenador SOLO si existe
      if (teclaFinal) {
        const teclaSpan = document.createElement("span");
        teclaSpan.className = "tecla__tecla-pc";
        teclaSpan.textContent = teclaFinal.toUpperCase();
        boton.appendChild(teclaSpan);
      }

      boton.appendChild(etiqueta);
      APP.nodos.piano.appendChild(boton);
    });
  }

  actualizarVariablesDeTeclas(contadorBlancas);

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

  console.log(`🎹 Piano generado con ${numOctavas} octava(s), ${contadorBlancas} teclas blancas`);
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

  // Buscar en todas las teclas generadas usando data-tecla-pc
  APP.nodos.teclas.forEach((boton) => {
    const teclaDataset = boton.dataset.teclaPc; // Importante: dataset convierte 'tecla-pc' a 'teclaPc'
    if (teclaDataset && teclaDataset === teclaPC) {
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
    const teclaDataset = boton.dataset.teclaPc; // Importante: dataset convierte 'tecla-pc' a 'teclaPc'
    if (teclaDataset && teclaDataset === teclaPC) {
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
  // ELIMINADO: mostrarToast → solo mostrar al guardar cambios
}

function cambiarNumOctavas(e) {
  APP.configuracion.numOctavas = parseInt(e.target.value);
  // NOTA: No regenerar el piano aquí, solo actualizar la configuración
  // Se regenerará al guardar los cambios
  console.log(`🎹 Octavas seleccionadas: ${APP.configuracion.numOctavas}`);
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
    if (APP.nodos.btnTema) {
      APP.nodos.btnTema.textContent = "\u2600";
      APP.nodos.btnTema.setAttribute("aria-label", "Cambiar a tema claro");
    }
    localStorage.setItem("tema", "oscuro");
    mostrarToast("Tema oscuro activado");
    console.log("🌙 Tema oscuro activado");
  } else {
    APP.nodos.darkThemeLink.disabled = true;
    if (APP.nodos.btnTema) {
      APP.nodos.btnTema.textContent = "\u263D";
      APP.nodos.btnTema.setAttribute("aria-label", "Cambiar a tema oscuro");
    }
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
  // Guardar configuración actual antes de abrir el modal
  APP.configuracionTemporal = {
    formaOnda: APP.formaOnda,
    numOctavas: APP.configuracion.numOctavas,
    volumen: APP.configuracion.volumen,
    filtroFreq: APP.configuracion.filtroFreq,
    reverbMix: APP.configuracion.reverbMix,
  };
  
  console.log("💾 Configuración guardada temporalmente:", APP.configuracionTemporal);
  APP.nodos.modalControles.showModal();
  console.log("🎛️ Modal de controles abierta");
}

function aceptarControles() {
  // Verificar si el número de octavas cambió
  const octavasCambiaron = 
    APP.configuracionTemporal.numOctavas !== APP.configuracion.numOctavas;
  
  if (octavasCambiaron) {
    // Regenerar el piano con el nuevo número de octavas
    generarPiano(APP.configuracion.numOctavas);
    console.log(`🎹 Piano regenerado con ${APP.configuracion.numOctavas} octava(s)`);
  }
  
  // Limpiar configuración temporal
  APP.configuracionTemporal = null;
  
  // Cerrar el modal
  APP.nodos.modalControles.close();
  
  // Mostrar confirmación
  const texto = APP.configuracion.numOctavas === 1 ? "octava" : "octavas";
  mostrarToast(`✓ Cambios guardados (${APP.configuracion.numOctavas} ${texto})`);
  console.log("✓ Cambios de controles aceptados y aplicados");
}

function cancelarControles() {
  // Restaurar la configuración guardada (descartar cambios)
  if (APP.configuracionTemporal) {
    console.log("↶ Restaurando configuración anterior:", APP.configuracionTemporal);
    
    // Restaurar valores en el objeto APP
    APP.formaOnda = APP.configuracionTemporal.formaOnda;
    APP.configuracion.numOctavas = APP.configuracionTemporal.numOctavas;
    APP.configuracion.volumen = APP.configuracionTemporal.volumen;
    APP.configuracion.filtroFreq = APP.configuracionTemporal.filtroFreq;
    APP.configuracion.reverbMix = APP.configuracionTemporal.reverbMix;
    
    // Restaurar valores en los controles del DOM
    APP.nodos.selectFormaOnda.value = APP.configuracionTemporal.formaOnda;
    APP.nodos.selectOctavas.value = APP.configuracionTemporal.numOctavas;
    APP.nodos.sliderVolumen.value = Math.round(APP.configuracionTemporal.volumen * 100);
    APP.nodos.sliderFiltro.value = APP.configuracionTemporal.filtroFreq;
    APP.nodos.sliderReverb.value = Math.round(APP.configuracionTemporal.reverbMix * 100);
    
    // Restaurar valores visuales de los outputs
    APP.nodos.outputVolumen.textContent = `${Math.round(APP.configuracionTemporal.volumen * 100)}%`;
    APP.nodos.outputFiltro.textContent = `${APP.configuracionTemporal.filtroFreq} Hz`;
    APP.nodos.outputReverb.textContent = `${Math.round(APP.configuracionTemporal.reverbMix * 100)}%`;
    
    // Restaurar valores en el AudioContext si está inicializado
    if (APP.nodosAudio.masterGain) {
      APP.nodosAudio.masterGain.gain.setValueAtTime(
        APP.configuracionTemporal.volumen,
        APP.audioContext.currentTime
      );
    }
    
    if (APP.nodosAudio.filter) {
      APP.nodosAudio.filter.frequency.setValueAtTime(
        APP.configuracionTemporal.filtroFreq,
        APP.audioContext.currentTime
      );
    }
    
    if (APP.nodosAudio.dryGain && APP.nodosAudio.wetGain) {
      APP.nodosAudio.dryGain.gain.setValueAtTime(
        1 - APP.configuracionTemporal.reverbMix,
        APP.audioContext.currentTime
      );
      APP.nodosAudio.wetGain.gain.setValueAtTime(
        APP.configuracionTemporal.reverbMix,
        APP.audioContext.currentTime
      );
    }
    
    // Mostrar confirmación ANTES de limpiar
    mostrarToast("Cambios descartados");
    console.log("✕ Cambios descartados, configuración restaurada");
    
    // Limpiar configuración temporal AL FINAL
    APP.configuracionTemporal = null;
  }
  
  // Cerrar el modal
  APP.nodos.modalControles.close();
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
  
  /* 
     RESPONSIVIDAD MEJORADA: Recalcular dimensiones al redimensionar ventana
     - Se usa requestAnimationFrame para optimizar el rendimiento
     - Se cancelan cálculos pendientes antes de programar uno nuevo
     - Esto funciona tanto al reducir como al agrandar la ventana
  */
  let resizeRAF = null;
  
  window.addEventListener("resize", () => {
    // Cancelar cálculo pendiente si existe
    if (resizeRAF) {
      cancelAnimationFrame(resizeRAF);
    }
    
    // Programar nuevo cálculo en el próximo frame de animación
    resizeRAF = requestAnimationFrame(() => {
      recalcularDimensionesTeclas();
      resizeRAF = null;
    });
  });
  
  // Calcular dimensiones iniciales después de un pequeño delay
  // para asegurar que el DOM esté completamente renderizado
  requestAnimationFrame(() => {
    recalcularDimensionesTeclas();
  });

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
  if (APP.nodos.btnControles) {
    APP.nodos.btnControles.addEventListener("click", abrirControles);
    console.log("✅ Listener de 'Abrir Controles' añadido");
  }
  if (APP.nodos.btnTema) {
    APP.nodos.btnTema.addEventListener("click", alternarTema);
    console.log("✅ Listener de 'Cambiar Tema' añadido");
  }
  if (APP.nodos.btnAyuda) {
    APP.nodos.btnAyuda.addEventListener("click", abrirAyuda);
    console.log("✅ Listener de 'Abrir Ayuda' añadido");
  }
  
  // CRÍTICO: Verificar que los botones existen antes de añadir listeners
  if (APP.nodos.btnAceptarControles) {
    APP.nodos.btnAceptarControles.addEventListener("click", aceptarControles);
    console.log("✅ Listener de 'Aceptar Controles' añadido");
  } else {
    console.error("❌ ERROR: No se encontró el botón de aceptar controles");
  }
  
  if (APP.nodos.btnCancelarControles) {
    APP.nodos.btnCancelarControles.addEventListener("click", cancelarControles);
    console.log("✅ Listener de 'Cancelar Controles' añadido");
  } else {
    console.error("❌ ERROR: No se encontró el botón de cancelar controles");
  }
  
  if (APP.nodos.btnCerrarAyuda) {
    APP.nodos.btnCerrarAyuda.addEventListener("click", cerrarAyuda);
    console.log("✅ Listener de 'Cerrar Ayuda' añadido");
  }

  // Interceptar Escape para descartar cambios
  APP.nodos.modalControles.addEventListener("cancel", (e) => {
    e.preventDefault(); // Prevenir cierre automático
    cancelarControles(); // Descartar cambios y cerrar
    console.log("✕ Modal de controles cerrada con Escape (cambios descartados)");
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