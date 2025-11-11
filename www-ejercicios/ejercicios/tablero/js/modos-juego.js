/* ==========================================================================
   MODOS DE JUEGO - Implementación de modos alternativos
   ==========================================================================
   - Modo normal (ya implementado en script.js)
   - Modo de dos tableros (intercambio entre tableros)
   - Modo rompecabezas (imagen dividida)
*/

// Ampliamos el espacio de nombres TABLERO con los modos de juego adicionales
TABLERO.MODOS = {
  // Estado específico para modos alternativos
  estado: {
    imagenCargada: false,
    imagenRompecabezas: null,
    tableroOrigen: null,
    tableroDestino: null
  }
};

/* ==========================================================================
   MODO DOS TABLEROS - Intercambio entre dos tableros
   ========================================================================== */

/**
 * Genera dos tableros para el modo de intercambio entre tableros
 */
function generarDosTableros() {
  // Limpiar contenedor de tablero y adaptarlo para tener dos tableros
  const contenedorTablero = document.querySelector('.tablero-contenedor');
  contenedorTablero.innerHTML = '';
  contenedorTablero.classList.add('tablero-contenedor--doble');
  
  // Crear contenedores para los dos tableros
  const tableroOrigen = document.createElement('div');
  tableroOrigen.id = 'tablero-origen';
  tableroOrigen.className = 'tablero tablero--origen';
  tableroOrigen.setAttribute('aria-label', 'Tablero origen');
  
  const tableroDestino = document.createElement('div');
  tableroDestino.id = 'tablero-destino';
  tableroDestino.className = 'tablero tablero--destino';
  tableroDestino.setAttribute('aria-label', 'Tablero destino');
  
  // Etiquetas para los tableros
  const etiquetaOrigen = document.createElement('div');
  etiquetaOrigen.className = 'tablero__etiqueta';
  etiquetaOrigen.textContent = 'Origen';
  
  const etiquetaDestino = document.createElement('div');
  etiquetaDestino.className = 'tablero__etiqueta';
  etiquetaDestino.textContent = 'Destino';
  
  // Crear contenedores con etiquetas
  const contenedorOrigen = document.createElement('div');
  contenedorOrigen.className = 'tablero-wrapper';
  contenedorOrigen.appendChild(etiquetaOrigen);
  contenedorOrigen.appendChild(tableroOrigen);
  
  const contenedorDestino = document.createElement('div');
  contenedorDestino.className = 'tablero-wrapper';
  contenedorDestino.appendChild(etiquetaDestino);
  contenedorDestino.appendChild(tableroDestino);
  
  // Añadir tableros al contenedor principal
  contenedorTablero.appendChild(contenedorOrigen);
  contenedorTablero.appendChild(contenedorDestino);
  
  // Guardar referencias para uso posterior
  TABLERO.MODOS.estado.tableroOrigen = tableroOrigen;
  TABLERO.MODOS.estado.tableroDestino = tableroDestino;
  
  // Configurar CSS Grid para ambos tableros
  const n = TABLERO.config.ladoTablero;
  tableroOrigen.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
  tableroDestino.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
  
  // Generar colores para las filas
  generarColores();
  
  // Determinar tamano de fichas
  let tamanoFichaCss = obtenerTamanoFichaCss();
  
  // Generar fichas para tablero origen
  generarFichasTableroOrigen(tableroOrigen, tamanoFichaCss);
  
  // Inicialmente el tablero destino está vacío
  generarCeldasVaciasDestino(tableroDestino, tamanoFichaCss);
}

/**
 * Genera fichas para el tablero origen en el modo de dos tableros
 * @param {HTMLElement} tablero - Elemento DOM del tablero origen
 * @param {string} tamanoFichaCss - Tamano CSS para las fichas
 */
function generarFichasTableroOrigen(tablero, tamanoFichaCss) {
  const n = TABLERO.config.ladoTablero;
  
  // Para cada fila y columna
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      // Crear ficha con color según la fila
      const ficha = document.createElement('div');
      ficha.className = `ficha ficha--${TABLERO.config.formaFicha}`;
      ficha.classList.add(`ficha--size-${TABLERO.config.tamanoFicha}`);
      ficha.classList.add(`ficha--color-${i}`);
      ficha.setAttribute('data-ficha', '');
      ficha.setAttribute('data-fila', i);
      ficha.setAttribute('data-columna', j);
      ficha.setAttribute('data-color', i);
      ficha.draggable = true;
      
      // Event listeners para arrastrar
      ficha.addEventListener('dragstart', iniciarArrastreEntreTabladores);
      ficha.addEventListener('dragend', finalizarArrastre);
      
      // Añadir ficha al tablero origen
      tablero.appendChild(ficha);
    }
  }
}

/**
 * Genera celdas vacías en el tablero destino
 * @param {HTMLElement} tablero - Elemento DOM del tablero destino
 * @param {string} tamanoFichaCss - Tamano CSS para las celdas
 */
function generarCeldasVaciasDestino(tablero, tamanoFichaCss) {
  const n = TABLERO.config.ladoTablero;
  
  // Para cada fila y columna
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      // Crear celda vacía
      const celda = document.createElement('div');
      celda.className = 'celda-vacia';
      celda.classList.add(`celda--size-${TABLERO.config.tamanoFicha}`);
      celda.setAttribute('data-fila', i);
      celda.setAttribute('data-columna', j);
      
      // Event listeners para soltar fichas
      celda.addEventListener('dragover', permitirSoltarEnDestino);
      celda.addEventListener('dragleave', cancelarSoltar);
      celda.addEventListener('drop', soltarFichaEnDestino);
      
      // Añadir celda al tablero destino
      tablero.appendChild(celda);
    }
  }
}

/**
 * Inicia el arrastre de una ficha en el modo de dos tableros
 * @param {DragEvent} e - Evento de arrastre
 */
function iniciarArrastreEntreTabladores(e) {
  if (!TABLERO.estado.juegoIniciado || TABLERO.estado.juegoPausado) return;
  
  TABLERO.estado.fichaArrastrada = this;
  this.classList.add('ficha--arrastrando');
  
  // Almacenar datos para transferencia
  e.dataTransfer.setData('text/plain', this.dataset.color);
  e.dataTransfer.effectAllowed = 'move';
}

/**
 * Permite soltar una ficha en una celda vacía del tablero destino
 * @param {DragEvent} e - Evento de arrastre
 */
function permitirSoltarEnDestino(e) {
  if (!TABLERO.estado.juegoIniciado || TABLERO.estado.juegoPausado) return;
  
  e.preventDefault(); // Necesario para permitir el drop
  this.classList.add('celda-vacia--destino');
}

/**
 * Gestiona el evento de soltar una ficha en el tablero destino
 * @param {DragEvent} e - Evento de soltar
 */
function soltarFichaEnDestino(e) {
  if (!TABLERO.estado.juegoIniciado || TABLERO.estado.juegoPausado || !TABLERO.estado.fichaArrastrada) return;
  
  e.preventDefault();
  this.classList.remove('celda-vacia--destino');
  
  // Comprobar si la celda ya tiene una ficha
  if (this.querySelector('.ficha')) {
    return; // No permitir soltar si ya hay una ficha
  }
  
  // Mover la ficha al tablero destino
  const ficha = TABLERO.estado.fichaArrastrada;
  ficha.classList.remove('ficha--arrastrando');
  
  // Actualizar atributos de posición
  ficha.setAttribute('data-fila', this.dataset.fila);
  ficha.setAttribute('data-columna', this.dataset.columna);
  
  // Eliminar event listeners originales y añadir los nuevos
  ficha.removeEventListener('dragstart', iniciarArrastreEntreTabladores);
  ficha.addEventListener('dragstart', iniciarArrastreDesdeTableroDestino);
  
  // Mover ficha al nuevo tablero
  this.appendChild(ficha);
  
  // Incrementar contador de movimientos
  TABLERO.estado.movimientos++;
  actualizarContador();
  
  // Verificar si el juego está completado
  if (verificarVictoriaDosTableros()) {
    finalizarJuego();
  }
}

/**
 * Inicia el arrastre de una ficha desde el tablero destino de vuelta al origen
 * @param {DragEvent} e - Evento de arrastre
 */
function iniciarArrastreDesdeTableroDestino(e) {
  if (!TABLERO.estado.juegoIniciado || TABLERO.estado.juegoPausado) return;
  
  TABLERO.estado.fichaArrastrada = this;
  this.classList.add('ficha--arrastrando');
  
  // Almacenar datos para transferencia
  e.dataTransfer.setData('text/plain', this.dataset.color);
  e.dataTransfer.effectAllowed = 'move';
}

/**
 * Verifica si se ha completado el juego en modo dos tableros
 * @returns {boolean} true si el tablero destino tiene las fichas ordenadas por filas del mismo color
 */
function verificarVictoriaDosTableros() {
  const n = TABLERO.config.ladoTablero;
  const tableroDestino = TABLERO.MODOS.estado.tableroDestino;
  
  // Comprobar que todas las celdas tienen fichas
  const celdasConFichas = tableroDestino.querySelectorAll('.ficha').length;
  if (celdasConFichas < n * n) {
    return false; // No están todas las fichas colocadas
  }
  
  // Para cada fila, verificar que todas sus fichas tengan el mismo color
  for (let i = 0; i < n; i++) {
    const coloresFila = new Set();
    
    // Buscar fichas en esta fila
    for (let j = 0; j < n; j++) {
      const ficha = tableroDestino.querySelector(`.ficha[data-fila="${i}"][data-columna="${j}"]`);
      if (ficha) {
        coloresFila.add(ficha.dataset.color);
      }
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
   MODO ROMPECABEZAS - Imagen dividida en fichas
   ========================================================================== */

/**
 * Carga la imagen para el modo rompecabezas
 * @returns {Promise} Promesa que se resuelve cuando la imagen está cargada
 */
function cargarImagenRompecabezas() {
  return new Promise((resolve, reject) => {
    const imagen = new Image();
    imagen.crossOrigin = "Anonymous"; // Agregar para evitar problemas CORS
    
    imagen.onload = () => {
      TABLERO.MODOS.estado.imagenRompecabezas = imagen;
      TABLERO.MODOS.estado.imagenCargada = true;
      resolve();
    };
    
    imagen.onerror = (err) => {
      console.error('Error al cargar la imagen del rompecabezas:', err);
      // En caso de error, usamos una imagen de fallback
      alert('No se pudo cargar la imagen del rompecabezas. Se usará un tablero de colores.');
      TABLERO.config.modoJuego = 'normal';
      generarTablero(); // Fallback al modo normal
      reject(err);
    };
    
    // Asegurar que la ruta es correcta usando ruta absoluta y añadiendo timestamp
    imagen.src = 'images/paisaje1.jpg?' + new Date().getTime();
  });
}

/**
 * Genera un tablero con una imagen dividida para el modo rompecabezas
 */
function generarTableroRompecabezas() {
  // Limpiar tablero existente
  TABLERO.nodos.tablero.innerHTML = '';
  
  // Eliminar clases de modo dos tableros si existieran
  document.querySelector('.tablero-contenedor').classList.remove('tablero-contenedor--doble');
  
  // Configurar CSS Grid para el tablero
  const n = TABLERO.config.ladoTablero;
  TABLERO.nodos.tablero.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
  
  // Determinar tamano de fichas
  let tamanoFichaCss = obtenerTamanoFichaCss();
  
  // Mostrar mensaje de carga
  TABLERO.nodos.tablero.innerHTML = '<div class="cargando-mensaje">Cargando imagen del rompecabezas...</div>';
  
  // Si la imagen no está cargada, cargarla
  if (!TABLERO.MODOS.estado.imagenCargada) {
    cargarImagenRompecabezas()
      .then(() => {
        // Limpiar mensaje de carga
        TABLERO.nodos.tablero.innerHTML = '';
        crearFichasRompecabezas(n, tamanoFichaCss);
      })
      .catch(() => {
        // El error ya está manejado en la función cargarImagenRompecabezas
      });
  } else {
    // Limpiar mensaje de carga
    TABLERO.nodos.tablero.innerHTML = '';
    crearFichasRompecabezas(n, tamanoFichaCss);
  }
}

/**
 * Crea las fichas para el modo rompecabezas con segmentos de la imagen
 * @param {number} n - Tamano del tablero
 * @param {string} tamanoFichaCss - Tamano CSS para las fichas
 */
function crearFichasRompecabezas(n, tamanoFichaCss) {
  const fichas = [];
  const imagen = TABLERO.MODOS.estado.imagenRompecabezas;
  const anchoPieza = imagen.width / n;
  const altoPieza = imagen.height / n;
  
  // Para cada posición correcta, crear una ficha con el fragmento correspondiente
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const ficha = document.createElement('div');
      ficha.className = `ficha ficha--${TABLERO.config.formaFicha} ficha--rompecabezas`;
      ficha.classList.add(`ficha--size-${TABLERO.config.tamanoFicha}`);
      ficha.classList.add(`ficha--puzzle-position-${i}-${j}`);
      ficha.setAttribute('data-ficha', '');
      ficha.setAttribute('data-fila', i);
      ficha.setAttribute('data-columna', j);
      ficha.setAttribute('data-posicion-correcta', `${i}-${j}`);
      
      ficha.draggable = true;
      
      // Event listeners para arrastrar y soltar
      ficha.addEventListener('dragstart', iniciarArrastre);
      ficha.addEventListener('dragend', finalizarArrastre);
      ficha.addEventListener('dragover', permitirSoltar);
      ficha.addEventListener('dragleave', cancelarSoltar);
      ficha.addEventListener('drop', soltarFichaRompecabezas);
      
      fichas.push(ficha);
    }
  }
  
  // Desordenar fichas aleatoriamente
  fichas.sort(() => Math.random() - 0.5);
  
  // Asignar posiciones actuales
  let index = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      fichas[index].setAttribute('data-fila-actual', i);
      fichas[index].setAttribute('data-columna-actual', j);
      index++;
    }
  }
  
  // Agregar fichas al tablero
  fichas.forEach(ficha => {
    TABLERO.nodos.tablero.appendChild(ficha);
  });
}

/**
 * Gestiona el evento de soltar una ficha en el modo rompecabezas
 * @param {DragEvent} e - Evento de soltar
 */
function soltarFichaRompecabezas(e) {
  if (!TABLERO.estado.juegoIniciado || TABLERO.estado.juegoPausado || !TABLERO.estado.fichaArrastrada) return;
  
  e.preventDefault();
  this.classList.remove('ficha--destino');
  
  // Intercambiar fichas
  intercambiarFichasRompecabezas(TABLERO.estado.fichaArrastrada, this);
  
  // Incrementar contador de movimientos
  TABLERO.estado.movimientos++;
  actualizarContador();
  
  // Verificar si el rompecabezas está completado
  if (verificarVictoriaRompecabezas()) {
    finalizarJuego();
  }
}

/**
 * Intercambia las posiciones de dos fichas en el tablero de rompecabezas
 * @param {HTMLElement} ficha1 - Primera ficha
 * @param {HTMLElement} ficha2 - Segunda ficha
 */
function intercambiarFichasRompecabezas(ficha1, ficha2) {
  // Intercambiar atributos de posición actual
  const fila1 = ficha1.getAttribute('data-fila-actual');
  const columna1 = ficha1.getAttribute('data-columna-actual');
  const fila2 = ficha2.getAttribute('data-fila-actual');
  const columna2 = ficha2.getAttribute('data-columna-actual');
  
  ficha1.setAttribute('data-fila-actual', fila2);
  ficha1.setAttribute('data-columna-actual', columna2);
  ficha2.setAttribute('data-fila-actual', fila1);
  ficha2.setAttribute('data-columna-actual', columna1);
  
  // Intercambiar posiciones físicas en el DOM
  const parent = ficha1.parentNode;
  const nextSibling = ficha2.nextSibling;
  
  if (nextSibling === ficha1) {
    parent.insertBefore(ficha1, ficha2);
  } else {
    parent.insertBefore(ficha2, ficha1);
    if (nextSibling) {
      parent.insertBefore(ficha1, nextSibling);
    } else {
      parent.appendChild(ficha1);
    }
  }
}

/**
 * Verifica si el rompecabezas está completado correctamente
 * @returns {boolean} true si todas las fichas están en su posición correcta
 */
function verificarVictoriaRompecabezas() {
  const fichas = TABLERO.nodos.tablero.querySelectorAll('.ficha');
  
  for (const ficha of fichas) {
    const filaActual = ficha.getAttribute('data-fila-actual');
    const columnaActual = ficha.getAttribute('data-columna-actual');
    const posicionCorrecta = ficha.getAttribute('data-posicion-correcta');
    
    if (posicionCorrecta !== `${filaActual}-${columnaActual}`) {
      return false; // Al menos una ficha está fuera de lugar
    }
  }
  
  return true; // Todas las fichas están en su posición correcta
}

/* ==========================================================================
   FUNCIONES UTILITARIAS - Compartidas entre modos
   ========================================================================== */

/**
 * Obtiene el tamano CSS para las fichas según la configuración actual
 * @returns {string} Tamano CSS de la ficha
 */
function obtenerTamanoFichaCss() {
  switch (TABLERO.config.tamanoFicha) {
    case 'pequena':
      return 'var(--ficha-pequena)';
    case 'grande':
      return 'var(--ficha-grande)';
    default:
      return 'var(--ficha-mediana)';
  }
}

// Exportar funciones para ser utilizadas desde script.js
TABLERO.MODOS.generarDosTableros = generarDosTableros;
TABLERO.MODOS.generarTableroRompecabezas = generarTableroRompecabezas;
TABLERO.MODOS.verificarVictoriaDosTableros = verificarVictoriaDosTableros;
TABLERO.MODOS.verificarVictoriaRompecabezas = verificarVictoriaRompecabezas;