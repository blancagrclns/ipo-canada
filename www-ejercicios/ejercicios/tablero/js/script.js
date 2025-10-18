/* ==========================================================================
   PROYECTO TABLERO - Script principal
   ==========================================================================
*/

// Espacio de nombres global para la aplicación
const TABLERO = {
  // Estado del juego
  config: {
    tamañoTablero: 3,
    tamañoFicha: 'mediana',
    formaFicha: 'cuadrado',
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
  
  // Cache de elementos DOM
  elementos: {}
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
  TABLERO.elementos = {
    tablero: document.getElementById('tablero'),
    tamañoTablero: document.getElementById('tamañoTablero'),
    tamañoFicha: document.getElementById('tamañoFicha'),
    formaFicha: document.getElementById('formaFicha'),
    btnInicio: document.getElementById('inicio'),
    btnPausa: document.getElementById('btnPausa'),
    btnDetener: document.getElementById('btnDetener'),
    contadorMovimientos: document.getElementById('contadorMovimientos'),
    temporizador: document.getElementById('temporizador'),
    modalVictoria: document.getElementById('modal-victoria'),
    modalMovimientos: document.getElementById('modal-movimientos'),
    modalTiempo: document.getElementById('modal-tiempo'),
    btnCerrarModal: document.getElementById('cerrar-modal'),
    btnSoloCerrarModal: document.getElementById('solo-cerrar-modal'),
    btnAyuda: document.getElementById('btnAyuda')
  };

  // Configurar event listeners
  TABLERO.elementos.btnInicio.addEventListener('click', iniciarJuego);
  TABLERO.elementos.btnPausa.addEventListener('click', togglePausaJuego);
  TABLERO.elementos.btnDetener.addEventListener('click', detenerJuego);
  TABLERO.elementos.btnCerrarModal.addEventListener('click', TABLERO.reiniciarJuego); // Usa función del módulo modales.js
  TABLERO.elementos.btnSoloCerrarModal.addEventListener('click', TABLERO.soloCerrarModal); // Usa función del módulo modales.js
  TABLERO.elementos.btnAyuda.addEventListener('click', TABLERO.mostrarAyuda); // Usa función del módulo modales.js
  
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
  TABLERO.config.tamañoTablero = parseInt(TABLERO.elementos.tamañoTablero.value, 10);
  TABLERO.config.tamañoFicha = TABLERO.elementos.tamañoFicha.value;
  TABLERO.config.formaFicha = TABLERO.elementos.formaFicha.value;
  
  // Validar tamaño de tablero
  if (TABLERO.config.tamañoTablero < 2 || TABLERO.config.tamañoTablero > 7) {
    TABLERO.config.tamañoTablero = 3;
    TABLERO.elementos.tamañoTablero.value = 3;
  }
  
  // Actualizar UI
  actualizarUI();
  
  // Activar botones de control
  TABLERO.elementos.btnPausa.disabled = false;
  TABLERO.elementos.btnPausa.textContent = 'Pausar';
  TABLERO.elementos.btnDetener.disabled = false;
  
  // Generar tablero
  generarTablero();
  
  // Iniciar temporizador
  iniciarTemporizador();
}

/**
 * Alterna entre pausar y reanudar el juego
 */
function togglePausaJuego() {
  if (!TABLERO.estado.juegoIniciado) return;
  
  if (TABLERO.estado.juegoPausado) {
    // Reanudar juego
    TABLERO.estado.juegoPausado = false;
    TABLERO.elementos.btnPausa.textContent = 'Pausar';
    iniciarTemporizador();
    
    // Habilitar arrastre de fichas
    const fichas = document.querySelectorAll('[data-ficha]');
    fichas.forEach(ficha => {
      ficha.draggable = true;
    });
  } else {
    // Pausar juego
    TABLERO.estado.juegoPausado = true;
    TABLERO.elementos.btnPausa.textContent = 'Reanudar';
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
  if (!TABLERO.estado.juegoIniciado) return;
  
  // Detener temporizador
  clearInterval(TABLERO.estado.timerInterval);
  TABLERO.estado.timerInterval = null;
  TABLERO.estado.juegoIniciado = false;
  
  // Deshabilitar botones de control
  TABLERO.elementos.btnPausa.disabled = true;
  TABLERO.elementos.btnDetener.disabled = true;
  
  // Mostrar modal de juego detenido (no el de victoria)
  TABLERO.mostrarModalDetenido();
}

/**
 * Finaliza el juego cuando se completa el tablero
 * Este es el modal de victoria, diferente al de detener juego
 */
function finalizarJuego() {
  // Detener temporizador
  clearInterval(TABLERO.estado.timerInterval);
  TABLERO.estado.timerInterval = null;
  TABLERO.estado.juegoIniciado = false;
  
  // Deshabilitar botones de control
  TABLERO.elementos.btnPausa.disabled = true;
  TABLERO.elementos.btnDetener.disabled = true;
  
  // Mostrar modal de victoria (no el de juego detenido)
  TABLERO.mostrarModalVictoria();
}

/* ==========================================================================
   GENERACIÓN DEL TABLERO - Creación dinámica de fichas y colores
   ========================================================================== */

/**
 * Genera el tablero de juego con fichas aleatorias
 */
function generarTablero() {
  // Limpiar tablero existente
  TABLERO.elementos.tablero.innerHTML = '';
  
  // Generar colores para las filas (cada fila tiene un color específico)
  generarColores();
  
  // Configurar CSS Grid para el tablero
  const n = TABLERO.config.tamañoTablero;
  TABLERO.elementos.tablero.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
  
  // Determinar tamaño de fichas en CSS
  let tamañoFichaCss;
  switch (TABLERO.config.tamañoFicha) {
    case 'pequeña':
      tamañoFichaCss = 'var(--ficha-pequeña)';
      break;
    case 'grande':
      tamañoFichaCss = 'var(--ficha-grande)';
      break;
    default:
      tamañoFichaCss = 'var(--ficha-mediana)';
  }
  
  // Generar fichas en orden aleatorio pero manteniendo coherencia
  // (el mismo número de fichas de cada color)
  const fichas = [];
  
  // Para cada fila
  for (let i = 0; i < n; i++) {
    // Para cada columna
    for (let j = 0; j < n; j++) {
      // Crear ficha con el color correspondiente a la fila
      const ficha = document.createElement('div');
      ficha.className = `ficha ficha--${TABLERO.config.formaFicha}`;
      ficha.setAttribute('data-ficha', '');
      ficha.setAttribute('data-fila', i);
      ficha.setAttribute('data-columna', j);
      ficha.setAttribute('data-color', i); // Asignamos el color correspondiente a la fila
      ficha.style.width = tamañoFichaCss;
      ficha.style.height = tamañoFichaCss;
      ficha.style.backgroundColor = TABLERO.estado.colores[i];
      ficha.draggable = true;
      
      // Event listeners para arrastrar y soltar
      ficha.addEventListener('dragstart', iniciarArrastre);
      ficha.addEventListener('dragend', finalizarArrastre);
      ficha.addEventListener('dragover', permitirSoltar);
      ficha.addEventListener('dragleave', cancelarSoltar);
      ficha.addEventListener('drop', soltarFicha);
      
      fichas.push(ficha);
    }
  }
  
  // Desordenar fichas aleatoriamente
  fichas.sort(() => Math.random() - 0.5);
  
  // Agregar fichas al tablero
  fichas.forEach(ficha => {
    TABLERO.elementos.tablero.appendChild(ficha);
  });
}

/**
 * Genera los colores para cada fila del tablero
 */
function generarColores() {
  const n = TABLERO.config.tamañoTablero;
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
  // Guardar valores originales
  const color1 = ficha1.dataset.color;
  const color2 = ficha2.dataset.color;
  const bg1 = ficha1.style.backgroundColor;
  const bg2 = ficha2.style.backgroundColor;
  
  // Intercambiar colores
  ficha1.dataset.color = color2;
  ficha2.dataset.color = color1;
  ficha1.style.backgroundColor = bg2;
  ficha2.style.backgroundColor = bg1;
}

/**
 * Verifica si se ha completado el tablero
 * @returns {boolean} true si todas las filas tienen fichas del mismo color
 */
function verificarVictoria() {
  const n = TABLERO.config.tamañoTablero;
  const fichas = TABLERO.elementos.tablero.querySelectorAll('.ficha');
  
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
  TABLERO.elementos.temporizador.textContent = formatearTiempo(TABLERO.estado.tiempo);
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
  actualizarContador();
  actualizarTemporizador();
}

/**
 * Actualiza el contador de movimientos
 */
function actualizarContador() {
  TABLERO.elementos.contadorMovimientos.textContent = TABLERO.estado.movimientos;
}