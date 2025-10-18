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
    fichaArrastrada: null,
    fichaDestino: null,
    colores: []
  },
  
  // Cache de elementos DOM
  elementos: {}
};

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializar);

function inicializar() {
  // Cachear elementos del DOM
  TABLERO.elementos = {
    tablero: document.getElementById('tablero'),
    tamañoTablero: document.getElementById('tamañoTablero'),
    tamañoFicha: document.getElementById('tamañoFicha'),
    formaFicha: document.getElementById('formaFicha'),
    btnInicio: document.getElementById('inicio'),
    contadorMovimientos: document.getElementById('contadorMovimientos'),
    temporizador: document.getElementById('temporizador'),
    modalVictoria: document.getElementById('modal-victoria'),
    modalMovimientos: document.getElementById('modal-movimientos'),
    modalTiempo: document.getElementById('modal-tiempo'),
    btnCerrarModal: document.getElementById('cerrar-modal'),
    btnAyuda: document.getElementById('ayuda')
  };

  // Configurar event listeners
  TABLERO.elementos.btnInicio.addEventListener('click', iniciarJuego);
  TABLERO.elementos.btnCerrarModal.addEventListener('click', cerrarModal);
  TABLERO.elementos.btnAyuda.addEventListener('click', mostrarAyuda);
  
  // Inicialización inicial
  actualizarUI();
}

function iniciarJuego() {
  // Detener temporizador si existe
  if (TABLERO.estado.timerInterval) {
    clearInterval(TABLERO.estado.timerInterval);
  }
  
  // Resetear estado
  TABLERO.estado.movimientos = 0;
  TABLERO.estado.tiempo = 0;
  TABLERO.estado.juegoIniciado = true;
  
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
  
  // Generar tablero
  generarTablero();
  
  // Iniciar temporizador
  iniciarTemporizador();
}

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

// Funciones para el Drag & Drop
function iniciarArrastre(e) {
  if (!TABLERO.estado.juegoIniciado) return;
  
  TABLERO.estado.fichaArrastrada = this;
  this.classList.add('ficha--arrastrando');
  
  // Almacenar datos para transferencia
  e.dataTransfer.setData('text/plain', this.dataset.color);
  e.dataTransfer.effectAllowed = 'move';
}

function finalizarArrastre() {
  if (!TABLERO.estado.juegoIniciado) return;
  
  this.classList.remove('ficha--arrastrando');
  TABLERO.estado.fichaArrastrada = null;
  
  // Limpiar cualquier ficha destino resaltada
  const fichasDestino = document.querySelectorAll('.ficha--destino');
  fichasDestino.forEach(f => f.classList.remove('ficha--destino'));
}

function permitirSoltar(e) {
  if (!TABLERO.estado.juegoIniciado || this === TABLERO.estado.fichaArrastrada) return;
  
  e.preventDefault(); // Necesario para permitir el drop
  this.classList.add('ficha--destino');
  TABLERO.estado.fichaDestino = this;
}

function cancelarSoltar() {
  if (!TABLERO.estado.juegoIniciado) return;
  
  this.classList.remove('ficha--destino');
  if (TABLERO.estado.fichaDestino === this) {
    TABLERO.estado.fichaDestino = null;
  }
}

function soltarFicha(e) {
  if (!TABLERO.estado.juegoIniciado || !TABLERO.estado.fichaArrastrada) return;
  
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

function finalizarJuego() {
  // Detener temporizador
  clearInterval(TABLERO.estado.timerInterval);
  TABLERO.estado.timerInterval = null;
  TABLERO.estado.juegoIniciado = false;
  
  // Actualizar información del modal
  TABLERO.elementos.modalMovimientos.textContent = TABLERO.estado.movimientos;
  TABLERO.elementos.modalTiempo.textContent = formatearTiempo(TABLERO.estado.tiempo);
  
  // Mostrar modal de victoria
  TABLERO.elementos.modalVictoria.showModal();
}

function cerrarModal() {
  TABLERO.elementos.modalVictoria.close();
  // Reiniciar juego automáticamente
  iniciarJuego();
}

function mostrarAyuda() {
  alert("Objetivo: Intercambia las fichas mediante arrastre para conseguir que cada fila contenga fichas del mismo color.\n\n" +
        "1. Configura el tamaño del tablero y las fichas\n" +
        "2. Pulsa 'Comenzar Juego' para iniciar\n" +
        "3. Arrastra y suelta para intercambiar fichas\n" +
        "4. Completa el tablero con el menor número de movimientos posible");
}

// Funciones del temporizador
function iniciarTemporizador() {
  TABLERO.estado.tiempo = 0;
  actualizarTemporizador();
  
  TABLERO.estado.timerInterval = setInterval(() => {
    TABLERO.estado.tiempo++;
    actualizarTemporizador();
  }, 1000);
}

function actualizarTemporizador() {
  TABLERO.elementos.temporizador.textContent = formatearTiempo(TABLERO.estado.tiempo);
}

function formatearTiempo(segundos) {
  const mins = Math.floor(segundos / 60).toString().padStart(2, '0');
  const segs = (segundos % 60).toString().padStart(2, '0');
  return `${mins}:${segs}`;
}

// Funciones de actualización de UI
function actualizarUI() {
  actualizarContador();
  actualizarTemporizador();
}

function actualizarContador() {
  TABLERO.elementos.contadorMovimientos.textContent = TABLERO.estado.movimientos;
}