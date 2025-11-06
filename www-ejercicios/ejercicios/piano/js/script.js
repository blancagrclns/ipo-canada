
/* ==========================================================================
   1. ESPACIO DE NOMBRES GLOBAL
   ========================================================================== */
const APP = {
  nodos: {},
  audioContext: null,
  formaOnda: 'sine',
  notasActivas: new Map(), // Almacena osciladores activos por nota
  mapaTeclado: {
    // Mapeo de teclas del PC a notas musicales
    'a': 'C4',
    's': 'D4',
    'd': 'E4',
    'f': 'F4',
    'g': 'G4',
    'h': 'A4',
    'j': 'B4',
    'k': 'C5',
    'w': 'C#4',
    'e': 'D#4',
    't': 'F#4',
    'y': 'G#4',
    'u': 'A#4'
  }
};

/* ==========================================================================
   2. CACHEAR NODOS DEL DOM
   ========================================================================== */
function cachearNodos() {
  APP.nodos.piano = document.querySelector('[data-piano]');
  APP.nodos.teclas = document.querySelectorAll('.tecla');
  APP.nodos.selectFormaOnda = document.querySelector('[data-control="forma-onda"]');
  APP.nodos.infoEstado = document.querySelector('[data-info-estado]');
  
  console.log('✅ Nodos del DOM cacheados correctamente.');
}

/* ==========================================================================
   3. INICIALIZAR WEB AUDIO API
   ========================================================================== */
function inicializarAudio() {
  // Crear AudioContext solo cuando el usuario interactúe
  // (política de navegadores modernos para prevenir autoplay)
  if (!APP.audioContext) {
    APP.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    console.log('🎵 AudioContext creado:', APP.audioContext.state);
    
    actualizarEstado('Audio inicializado correctamente');
  }
  
  // Si está suspendido, resumir (necesario en algunos navegadores)
  if (APP.audioContext.state === 'suspended') {
    APP.audioContext.resume();
  }
}

/* ==========================================================================
   4. TOCAR NOTA MUSICAL
   ========================================================================== */
function tocarNota(frecuencia, nota) {
  // Inicializar audio si no está listo
  inicializarAudio();
  
  // Prevenir múltiples osciladores de la misma nota
  if (APP.notasActivas.has(nota)) {
    console.log(`⚠️ Nota ${nota} ya está sonando.`);
    return;
  }
  
  // Crear oscilador (generador de sonido)
  const oscilador = APP.audioContext.createOscillator();
  oscilador.type = APP.formaOnda;
  oscilador.frequency.setValueAtTime(frecuencia, APP.audioContext.currentTime);
  
  // Crear ganancia (control de volumen) para fade out
  const ganancia = APP.audioContext.createGain();
  ganancia.gain.setValueAtTime(0.3, APP.audioContext.currentTime); // Volumen 30%
  
  // Conectar: Oscilador → Ganancia → Destino (altavoces)
  oscilador.connect(ganancia);
  ganancia.connect(APP.audioContext.destination);
  
  // Iniciar oscilador
  oscilador.start();
  
  // Guardar en el mapa de notas activas
  APP.notasActivas.set(nota, { oscilador, ganancia });
  
  console.log(`🎹 Tocando ${nota} (${frecuencia.toFixed(2)} Hz) con onda ${APP.formaOnda}`);
  actualizarEstado(`Tocando: ${nota} (${frecuencia.toFixed(2)} Hz)`);
}

/* ==========================================================================
   5. DETENER NOTA MUSICAL
   ========================================================================== */
function detenerNota(nota) {
  if (!APP.notasActivas.has(nota)) {
    return;
  }
  
  const { oscilador, ganancia } = APP.notasActivas.get(nota);
  const tiempoActual = APP.audioContext.currentTime;
  
  // Fade out suave (0.1 segundos)
  ganancia.gain.setValueAtTime(ganancia.gain.value, tiempoActual);
  ganancia.gain.exponentialRampToValueAtTime(0.001, tiempoActual + 0.1);
  
  // Detener oscilador después del fade out
  oscilador.stop(tiempoActual + 0.1);
  
  // Limpiar del mapa
  APP.notasActivas.delete(nota);
  
  console.log(`🛑 Deteniendo ${nota}`);
  actualizarEstado('Listo para tocar');
}

/* ==========================================================================
   6. MANEJAR CLICK EN TECLA
   ========================================================================== */
function handleClickTecla(e) {
  const tecla = e.currentTarget;
  const nota = tecla.dataset.nota;
  const frecuencia = parseFloat(tecla.dataset.frecuencia);
  
  // Añadir clase visual activa
  tecla.classList.add('tecla--activa');
  
  // Tocar nota
  tocarNota(frecuencia, nota);
  
  // Remover clase después de 200ms
  setTimeout(() => {
    tecla.classList.remove('tecla--activa');
    detenerNota(nota);
  }, 200);
}

/* ==========================================================================
   7. MANEJAR TECLAS DEL ORDENADOR
   ========================================================================== */
function handleKeyDown(e) {
  // Prevenir repetición si se mantiene presionada
  if (e.repeat) return;
  
  const teclaPC = e.key.toLowerCase();
  const nota = APP.mapaTeclado[teclaPC];
  
  if (!nota) return; // Tecla no mapeada
  
  // Buscar botón correspondiente
  const botonTecla = document.querySelector(`[data-nota="${nota}"]`);
  if (!botonTecla) return;
  
  const frecuencia = parseFloat(botonTecla.dataset.frecuencia);
  
  // Añadir clase visual
  botonTecla.classList.add('tecla--activa');
  
  // Tocar nota
  tocarNota(frecuencia, nota);
  
  console.log(`⌨️ Tecla presionada: ${teclaPC.toUpperCase()} → ${nota}`);
}

function handleKeyUp(e) {
  const teclaPC = e.key.toLowerCase();
  const nota = APP.mapaTeclado[teclaPC];
  
  if (!nota) return;
  
  // Buscar botón correspondiente
  const botonTecla = document.querySelector(`[data-nota="${nota}"]`);
  if (!botonTecla) return;
  
  // Remover clase visual
  botonTecla.classList.remove('tecla--activa');
  
  // Detener nota
  detenerNota(nota);
}

/* ==========================================================================
   8. CAMBIAR FORMA DE ONDA
   ========================================================================== */
function cambiarFormaOnda(e) {
  APP.formaOnda = e.target.value;
  console.log(`🎛️ Forma de onda cambiada a: ${APP.formaOnda}`);
  actualizarEstado(`Forma de onda: ${obtenerNombreOnda(APP.formaOnda)}`);
}

function obtenerNombreOnda(tipo) {
  const nombres = {
    sine: 'Sinusoidal',
    triangle: 'Triangular',
    square: 'Cuadrada',
    sawtooth: 'Diente de sierra'
  };
  return nombres[tipo] || tipo;
}

/* ==========================================================================
   9. ACTUALIZAR ESTADO EN UI
   ========================================================================== */
function actualizarEstado(mensaje) {
  APP.nodos.infoEstado.textContent = `Estado: ${mensaje}`;
}

/* ==========================================================================
   10. DETENER TODAS LAS NOTAS (útil para emergencias)
   ========================================================================== */
function detenerTodasLasNotas() {
  APP.notasActivas.forEach((_, nota) => {
    detenerNota(nota);
  });
  console.log('🛑 Todas las notas detenidas.');
}

/* ==========================================================================
   11. INICIALIZACIÓN DE LA APLICACIÓN
   ========================================================================== */
function init() {
  console.log('🚀 Inicializando piano interactivo...');
  
  cachearNodos();
  
  // Event listeners - Click en teclas
  APP.nodos.teclas.forEach(tecla => {
    tecla.addEventListener('click', handleClickTecla);
    
    // Accesibilidad: permitir Enter/Space para activar tecla
    tecla.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClickTecla({ currentTarget: tecla });
      }
    });
  });
  
  // Event listeners - Teclado del ordenador
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  
  // Event listeners - Cambio de forma de onda
  APP.nodos.selectFormaOnda.addEventListener('change', cambiarFormaOnda);
  
  // Event listener - Detener todo al cambiar de pestaña
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      detenerTodasLasNotas();
    }
  });
  
  // Inicializar audio con primer click/tecla
  document.addEventListener('click', inicializarAudio, { once: true });
  document.addEventListener('keydown', inicializarAudio, { once: true });
  
  console.log('✅ Piano listo. Toca una tecla o presiona una letra del teclado.');
  actualizarEstado('Listo para tocar');
}

/* ==========================================================================
   12. EJECUTAR CUANDO EL DOM ESTÉ LISTO
   ========================================================================== */
// defer en el <script> garantiza que el DOM está listo
init();