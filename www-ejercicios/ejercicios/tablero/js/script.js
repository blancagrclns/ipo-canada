/* ==========================================================================
   PROYECTO TABLERO - Script principal
   ==========================================================================
*/

// Espacio de nombres global para la aplicación
const TABLERO = {
  // Estado del juego
  config: {
    ladoTablero: 3,
    tamanoFicha: 'mediana',
    formaFicha: 'cuadrado',
    modoJuego: 'normal'
  },
  estado: {
    movimientos: 0,
    tiempo: 0,
    timerInterval: null,
    juegoIniciado: false,
    juegoPausado: false,
    fichaArrastrada: null,
    fichaDestino: null,
    colores: []
  },

  // Cache de nodos del DOM
  nodos: {},

  // Contenedor para modos de juego (lo rellena modos-juego.js)
  MODOS: {}
};

/* ==========================================================================
   INICIALIZACIÓN - Punto de entrada de la aplicación
   ========================================================================== */

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializar);

/**
 * Inicializa la aplicación
 * - Cachea elementos DOM
 * - Configura event listeners
 * - Prepara la interfaz inicial
 */
function inicializar() {
  // Cachear elementos del DOM
  TABLERO.nodos = {
    tablero: document.querySelector('[data-tablero]'),
    controlTamanoTablero: document.querySelector('[data-configuracion="tamano-tablero"]'),
    controlTamanoFicha: document.querySelector('[data-configuracion="tamano-ficha"]'),
    controlFormaFicha: document.querySelector('[data-configuracion="forma-ficha"]'),
    controlModoJuego: document.querySelector('[data-configuracion="modo-juego"]'),
    btnInicio: document.querySelector('[data-control="iniciar"]'),
    btnPausa: document.querySelector('[data-control="pausar"]'),
    btnDetener: document.querySelector('[data-control="detener"]'),
    contadorMovimientos: document.querySelector('[data-estado="movimientos"]'),
    temporizador: document.querySelector('[data-estado="tiempo"]'),
    modalVictoria: document.querySelector('[data-modal="victoria"]'),
    btnAyuda: document.querySelector('[data-accion="mostrar-ayuda"]')
  };

  // Configurar event listeners
  if (TABLERO.nodos.btnInicio) {
    TABLERO.nodos.btnInicio.addEventListener('click', iniciarJuego);
  }
  if (TABLERO.nodos.btnPausa) {
    TABLERO.nodos.btnPausa.addEventListener('click', togglePausaJuego);
  }
  if (TABLERO.nodos.btnDetener) {
    TABLERO.nodos.btnDetener.addEventListener('click', detenerJuego);
  }
  if (TABLERO.nodos.btnAyuda) {
    TABLERO.nodos.btnAyuda.addEventListener('click', TABLERO.mostrarAyuda);
  }
  
  // Event listener para prevenir cierre de página durante juego
  window.addEventListener('beforeunload', (e) => {
    if (TABLERO.estado.juegoIniciado) {
      // Mensaje que se mostrará al usuario
      const mensaje = '¿Estás seguro de que quieres salir? El progreso del juego se perderá.';
      e.returnValue = mensaje;
      return mensaje;
    }
  });
  
  // Inicialización inicial
  actualizarUI();
}

/* ==========================================================================
   GESTIÓN DEL JUEGO - Control del ciclo de vida del juego
   ========================================================================== */

/**
 * Inicia un nuevo juego
 * - Resetea el estado
 * - Lee la configuración seleccionada
 * - Genera el tablero
 * - Inicia el temporizador
 */
function iniciarJuego() {
  // Detener temporizador si existe
  if (TABLERO.estado.timerInterval) {
    clearInterval(TABLERO.estado.timerInterval);
  }
  
  // Resetear estado
  TABLERO.estado.movimientos = 0;
  TABLERO.estado.tiempo = 0;
  TABLERO.estado.juegoIniciado = true;
  TABLERO.estado.juegoPausado = false;
  
  // Leer configuración actual
  TABLERO.config.ladoTablero = parseInt(TABLERO.nodos.controlTamanoTablero.value, 10);
  TABLERO.config.tamanoFicha = TABLERO.nodos.controlTamanoFicha.value;
  TABLERO.config.formaFicha = TABLERO.nodos.controlFormaFicha.value;
  TABLERO.config.modoJuego = TABLERO.nodos.controlModoJuego.value;
  
  // Validar tamano de tablero
  if (TABLERO.config.ladoTablero < 2 || TABLERO.config.ladoTablero > 7) {
    TABLERO.config.ladoTablero = 3;
    TABLERO.nodos.controlTamanoTablero.value = 3;
  }
  
  // Actualizar UI
  actualizarUI();
  
  // Activar botones de control
  TABLERO.nodos.btnPausa.disabled = false;
  TABLERO.nodos.btnPausa.textContent = 'Pausar';
  TABLERO.nodos.btnDetener.disabled = false;
  
  // Generar tablero según el modo de juego seleccionado
  switch(TABLERO.config.modoJuego) {
    case 'dosTableros':
      TABLERO.MODOS.generarDosTableros();
      break;
    case 'rompecabezas':
      TABLERO.MODOS.generarTableroRompecabezas();
      break;
    default:
      // Modo normal (original)
      generarTablero();
  }
  
  // Añadir clase tablero--activo a TODOS los tableros para ocultar el mensaje
  const todosLosTableros = document.querySelectorAll('.tablero');
  todosLosTableros.forEach(tablero => {
    tablero.classList.add('tablero--activo');
  });
  
  // Iniciar temporizador
  iniciarTemporizador();

  TABLERO.nodos.btnInicio.disabled = true;

}

/**
 * Alterna entre pausar y reanudar el juego
 */
function togglePausaJuego() {
  if (!TABLERO.estado.juegoIniciado) return;
  
  if (TABLERO.estado.juegoPausado) {
    // Reanudar juego
    TABLERO.estado.juegoPausado = false;
    TABLERO.nodos.btnPausa.textContent = 'Pausar';
    iniciarTemporizador();
    
    // Habilitar arrastre de fichas
    const fichas = document.querySelectorAll('[data-ficha]');
    fichas.forEach(ficha => {
      ficha.draggable = true;
    });
  } else {
    // Pausar juego
    TABLERO.estado.juegoPausado = true;
    TABLERO.nodos.btnPausa.textContent = 'Reanudar';
    clearInterval(TABLERO.estado.timerInterval);
    TABLERO.estado.timerInterval = null;
    
    // Deshabilitar arrastre de fichas
    const fichas = document.querySelectorAll('[data-ficha]');
    fichas.forEach(ficha => {
      ficha.draggable = false;
    });
  }
}

/**
 * Detiene el juego actual y muestra el modal de juego detenido
 * Diferente al modal de victoria que se muestra al completar el tablero
 */
function detenerJuego() {
  // Detener temporizador si existe
  if (TABLERO.estado.timerInterval) {
    clearInterval(TABLERO.estado.timerInterval);
    TABLERO.estado.timerInterval = null;
  }
  
  // Actualizar estado del juego
  TABLERO.estado.juegoIniciado = false;
  
  // Remover clase tablero--activo de TODOS los tableros para mostrar el mensaje nuevamente
  const todosLosTableros = document.querySelectorAll('.tablero');
  todosLosTableros.forEach(tablero => {
    tablero.classList.remove('tablero--activo');
  });
  
  // Actualizar UI para reflejar fin de juego
  actualizarUI();
  
  // Mostrar modal de juego detenido
  TABLERO.mostrarModalDetenido();
  
  // Limpiar tablero después de mostrar modal
  TABLERO.limpiarTablero();

  TABLERO.nodos.btnInicio.disabled = false;

}

/**
 * Actualiza la interfaz según el estado del juego
 * - Actualiza contador de movimientos
 * - Habilita/deshabilita controles según estado
 */
function actualizarUI() {
  // Actualizar contador de movimientos
  TABLERO.nodos.contadorMovimientos.textContent = TABLERO.estado.movimientos;
  
  // Deshabilitar/habilitar controles según el estado del juego
  const estaJugando = TABLERO.estado.juegoIniciado;
  
  // Deshabilitar configuración mientras se juega
  TABLERO.nodos.controlTamanoTablero.disabled = estaJugando;
  TABLERO.nodos.controlTamanoFicha.disabled = estaJugando;
  TABLERO.nodos.controlFormaFicha.disabled = estaJugando;
  TABLERO.nodos.controlModoJuego.disabled = estaJugando;
  
  // Gestionar visibilidad de botones de control
  TABLERO.nodos.btnInicio.disabled = estaJugando;
  TABLERO.nodos.btnPausa.disabled = !estaJugando;
  TABLERO.nodos.btnDetener.disabled = !estaJugando;
}

/**
 * Finaliza el juego cuando se completa el tablero
 * Este es el modal de victoria, diferente al de detener juego
 */
function finalizarJuego() {
  // Detener temporizador
  if (TABLERO.estado.timerInterval) {
    clearInterval(TABLERO.estado.timerInterval);
    TABLERO.estado.timerInterval = null;
  }
  
  // Actualizar estado del juego
  TABLERO.estado.juegoIniciado = false;
  
  // Actualizar UI para reflejar fin de juego
  actualizarUI();
  
  // Mostrar modal de victoria con estadísticas
  TABLERO.mostrarModalVictoria();
  
  // Preparar contenedor del modal para estadísticas
  const modalVictoria = TABLERO.nodos.modalVictoria;
  const estadisticasContainer = modalVictoria ? modalVictoria.querySelector('.modal__estadisticas') : null;
  const botonesContainer = modalVictoria ? modalVictoria.querySelector('.modal__botones') : null;
  
  if (estadisticasContainer) {
    estadisticasContainer.innerHTML = `
      <p>Has completado el tablero en <span id="modal-movimientos">${TABLERO.estado.movimientos}</span> movimientos.</p>
      <p>Tiempo: <span id="modal-tiempo">${formatearTiempo(TABLERO.estado.tiempo)}</span></p>
    `;
  }
  
  if (botonesContainer) {
    botonesContainer.innerHTML = `
      <button id="cerrar-modal" class="modal__boton">Jugar de nuevo</button>
      <button id="solo-cerrar-modal" class="modal__boton modal__boton--secundario">Volver al menú</button>
    `;
    
    // Asignar event listeners a los botones
    const btnReiniciar = modalVictoria ? modalVictoria.querySelector('#cerrar-modal') : null;
    const btnSoloCerrar = modalVictoria ? modalVictoria.querySelector('#solo-cerrar-modal') : null;
    if (btnReiniciar) {
      btnReiniciar.addEventListener('click', TABLERO.reiniciarJuego);
    }
    if (btnSoloCerrar) {
      btnSoloCerrar.addEventListener('click', TABLERO.soloCerrarModal);
    }
  }
}

/* ==========================================================================
   GENERACIÓN DEL TABLERO - Creación dinámica de fichas y colores
   ========================================================================== */

/**
 * Genera el tablero de juego con fichas aleatorias
 */
function generarTablero() {
  TABLERO.nodos.tablero.innerHTML = '';
  
  // Añadir clase tablero--activo para ocultar el mensaje
  TABLERO.nodos.tablero.classList.add('tablero--activo');
  
  generarColores();
  
  const n = TABLERO.config.ladoTablero;
  TABLERO.nodos.tablero.classList.remove('tablero--cols-2', 'tablero--cols-3', 'tablero--cols-4', 'tablero--cols-5', 'tablero--cols-6', 'tablero--cols-7');
  TABLERO.nodos.tablero.classList.add(`tablero--cols-${n}`);
  
  const fichas = [];
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const ficha = document.createElement('div');
      ficha.className = `ficha ficha--${TABLERO.config.formaFicha}`;
      ficha.classList.add(`ficha--size-${TABLERO.config.tamanoFicha}`);
      ficha.classList.add(`ficha--color-${i}`);
      ficha.setAttribute('data-ficha', '');
      ficha.setAttribute('data-fila', i);
      ficha.setAttribute('data-columna', j);
      ficha.setAttribute('data-color', i);
      ficha.draggable = true;
      
      ficha.addEventListener('dragstart', iniciarArrastre);
      ficha.addEventListener('dragend', finalizarArrastre);
      ficha.addEventListener('dragover', permitirSoltar);
      ficha.addEventListener('dragleave', cancelarSoltar);
      ficha.addEventListener('drop', soltarFicha);
      
      fichas.push(ficha);
    }
  }
  
  fichas.sort(() => Math.random() - 0.5);
  
  fichas.forEach(ficha => {
    TABLERO.nodos.tablero.appendChild(ficha);
  });
}

/**
 * Genera los colores para cada fila del tablero
 */
function generarColores() {
  const n = TABLERO.config.ladoTablero;
  TABLERO.estado.colores = [];
  
  // Usar variables CSS predefinidas para los colores
  for (let i = 0; i < n; i++) {
    if (i < 7) {
      TABLERO.estado.colores.push(`var(--color-ficha-${i+1})`);
    } else {
      // Si necesitamos más de 7 colores, generamos algunos aleatorios
      const hue = Math.floor(Math.random() * 360);
      TABLERO.estado.colores.push(`hsl(${hue}, 70%, 50%)`);
    }
  }
}

/* ==========================================================================
   DRAG & DROP - Interacción para mover fichas con API nativa
   ========================================================================== */

/**
 * Inicia el arrastre de una ficha
 * @param {DragEvent} e - Evento de arrastre
 */
function iniciarArrastre(e) {
  if (!TABLERO.estado.juegoIniciado || TABLERO.estado.juegoPausado) return;
  
  TABLERO.estado.fichaArrastrada = this;
  this.classList.add('ficha--arrastrando');
  
  // Almacenar datos para transferencia
  e.dataTransfer.setData('text/plain', this.dataset.color);
  e.dataTransfer.effectAllowed = 'move';
}

/**
 * Finaliza el arrastre de una ficha
 */
function finalizarArrastre() {
  if (!TABLERO.estado.juegoIniciado || TABLERO.estado.juegoPausado) return;
  
  this.classList.remove('ficha--arrastrando');
  TABLERO.estado.fichaArrastrada = null;
  
  // Limpiar cualquier ficha destino resaltada
  const fichasDestino = document.querySelectorAll('.ficha--destino');
  fichasDestino.forEach(f => f.classList.remove('ficha--destino'));
}

/**
 * Permite soltar una ficha en este elemento
 * @param {DragEvent} e - Evento de arrastre
 */
function permitirSoltar(e) {
  if (!TABLERO.estado.juegoIniciado || TABLERO.estado.juegoPausado || this === TABLERO.estado.fichaArrastrada) return;
  
  e.preventDefault(); // Necesario para permitir el drop
  this.classList.add('ficha--destino');
  TABLERO.estado.fichaDestino = this;
}

/**
 * Cancela el efecto visual de "ficha destino" cuando sale del área
 */
function cancelarSoltar() {
  if (!TABLERO.estado.juegoIniciado || TABLERO.estado.juegoPausado) return;
  
  this.classList.remove('ficha--destino');
  if (TABLERO.estado.fichaDestino === this) {
    TABLERO.estado.fichaDestino = null;
  }
}

/**
 * Gestiona el evento de soltar una ficha arrastrada
 * @param {DragEvent} e - Evento de soltar
 */
function soltarFicha(e) {
  if (!TABLERO.estado.juegoIniciado || TABLERO.estado.juegoPausado || !TABLERO.estado.fichaArrastrada) return;
  
  e.preventDefault();
  this.classList.remove('ficha--destino');
  
  // Intercambiar fichas
  intercambiarFichas(TABLERO.estado.fichaArrastrada, this);
  
  // Incrementar contador de movimientos
  TABLERO.estado.movimientos++;
  actualizarContador();
  
  // Verificar si el juego está completado
  if (verificarVictoria()) {
    finalizarJuego();
  }
}

/**
 * Intercambia las propiedades entre dos fichas
 * @param {HTMLElement} ficha1 - Primera ficha
 * @param {HTMLElement} ficha2 - Segunda ficha
 */
function intercambiarFichas(ficha1, ficha2) {
  const color1 = ficha1.dataset.color;
  const color2 = ficha2.dataset.color;
  
  ficha1.dataset.color = color2;
  ficha2.dataset.color = color1;
  ficha1.className = ficha1.className.replace(/ficha--color-\d+/, `ficha--color-${color2}`);
  ficha2.className = ficha2.className.replace(/ficha--color-\d+/, `ficha--color-${color1}`);
}

/**
 * Verifica si se ha completado el tablero
 * @returns {boolean} true si todas las filas tienen fichas del mismo color
 */
function verificarVictoria() {
  // Para modos especiales, usar sus propias funciones de verificación
  if (TABLERO.config.modoJuego === 'dosTableros' && TABLERO.MODOS.verificarVictoriaDosTableros) {
    return TABLERO.MODOS.verificarVictoriaDosTableros();
  } else if (TABLERO.config.modoJuego === 'rompecabezas' && TABLERO.MODOS.verificarVictoriaRompecabezas) {
    return TABLERO.MODOS.verificarVictoriaRompecabezas();
  }
  
  // Modo normal (original)
  const n = TABLERO.config.ladoTablero;
  const fichas = TABLERO.nodos.tablero.querySelectorAll('.ficha');
  
  // Para cada fila, verificar que todas sus fichas tengan el mismo color
  for (let i = 0; i < n; i++) {
    const coloresFila = new Set();
    
    // Recoger colores de esta fila
    for (let j = 0; j < n; j++) {
      const indice = i * n + j;
      coloresFila.add(fichas[indice].dataset.color);
    }
    
    // Si hay más de un color en la fila, no hay victoria
    if (coloresFila.size > 1) {
      return false;
    }
  }
  
  // Si llegamos aquí, todas las filas tienen un solo color
  return true;
}

/* ==========================================================================
   TEMPORIZADOR - Gestión del tiempo de juego
   ========================================================================== */

/**
 * Inicia el temporizador del juego
 */
function iniciarTemporizador() {
  // Limpiar temporizador existente
  if (TABLERO.estado.timerInterval) {
    clearInterval(TABLERO.estado.timerInterval);
  }
  
  TABLERO.estado.timerInterval = setInterval(() => {
    TABLERO.estado.tiempo++;
    actualizarTemporizador();
  }, 1000);
}

/**
 * Actualiza la visualización del temporizador
 */
function actualizarTemporizador() {
  TABLERO.nodos.temporizador.textContent = formatearTiempo(TABLERO.estado.tiempo);
}

/**
 * Convierte segundos a formato mm:ss
 * @param {number} segundos - Tiempo en segundos
 * @returns {string} Tiempo formateado como "mm:ss"
 */
function formatearTiempo(segundos) {
  const mins = Math.floor(segundos / 60).toString().padStart(2, '0');
  const segs = (segundos % 60).toString().padStart(2, '0');
  return `${mins}:${segs}`;
}

/* ==========================================================================
   INTERFAZ DE USUARIO - Funciones auxiliares para actualizar la UI
   ========================================================================== */

/**
 * Actualiza todos los elementos de la interfaz de usuario
 */
function actualizarUI() {
  // Actualizar contador de movimientos
  TABLERO.nodos.contadorMovimientos.textContent = TABLERO.estado.movimientos;
  
  // Deshabilitar/habilitar controles según el estado del juego
  const estaJugando = TABLERO.estado.juegoIniciado;
  
  // Deshabilitar configuración mientras se juega
  TABLERO.nodos.controlTamanoTablero.disabled = estaJugando;
  TABLERO.nodos.controlTamanoFicha.disabled = estaJugando;
  TABLERO.nodos.controlFormaFicha.disabled = estaJugando;
  TABLERO.nodos.controlModoJuego.disabled = estaJugando;
  
  // Gestionar visibilidad de botones de control
  TABLERO.nodos.btnPausa.disabled = !estaJugando;
  TABLERO.nodos.btnDetener.disabled = !estaJugando;
}

/**
 * Actualiza el contador de movimientos
 */
function actualizarContador() {
  TABLERO.nodos.contadorMovimientos.textContent = TABLERO.estado.movimientos;
}
