/* ==========================================================================
   MODALES - Gestión de ventanas modales del juego
   ==========================================================================
   - Contiene funcionalidad para los modales de victoria y ayuda
   - Separado para mejorar mantenibilidad y reducir tamaño de script.js
   - Usa el espacio de nombres TABLERO para compartir estado con la aplicación
*/

// Espacio de nombres MODALES dentro del namespace global TABLERO
TABLERO.MODALES = {
  // Elementos DOM de modales que se cargan dinámicamente
  elementos: {},
  
  // Estado de los modales
  estado: {
    modalAyudaCargado: false
  }
};

/* ==========================================================================
   MODAL DE VICTORIA/ESTADÍSTICAS - Gestión del modal al completar el juego
   ========================================================================== */

/**
 * Muestra el modal de victoria/estadísticas con los resultados del juego
 */
function mostrarModalVictoria() {
  // Actualizar información del modal
  TABLERO.elementos.modalMovimientos.textContent = TABLERO.estado.movimientos;
  TABLERO.elementos.modalTiempo.textContent = formatearTiempo(TABLERO.estado.tiempo);
  
  // Mostrar modal
  TABLERO.elementos.modalVictoria.showModal();
}

/**
 * Cierra el modal de victoria y reinicia el juego
 */
function reiniciarJuego() {
  TABLERO.elementos.modalVictoria.close();
  // Reiniciar juego automáticamente
  iniciarJuego();
}

/**
 * Cierra el modal de victoria sin reiniciar el juego
 */
function soloCerrarModal() {
  TABLERO.elementos.modalVictoria.close();
  // No reiniciar el juego, solo cerrar el modal
}

/* ==========================================================================
   MODAL DE AYUDA - Carga dinámica del modal desde archivo externo
   ========================================================================== */

/**
 * Carga y muestra el modal de ayuda
 * Si ya está cargado, solo lo muestra
 */
function mostrarAyuda() {
  // Verificar si el modal ya está en el DOM
  if (!document.getElementById('modal-ayuda')) {
    // Si no existe, cargar el archivo HTML del modal
    fetch('modales/modal-ayuda.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('No se pudo cargar el modal de ayuda');
        }
        return response.text();
      })
      .then(html => {
        // Crear un contenedor temporal para procesar el HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Añadir el modal al body
        const modal = tempDiv.firstChild;
        document.body.appendChild(modal);
        
        // Cachear el elemento del modal y su botón de cierre
        TABLERO.MODALES.elementos.modalAyuda = document.getElementById('modal-ayuda');
        TABLERO.MODALES.elementos.btnCerrarModalAyuda = document.getElementById('cerrar-modal-ayuda');
        
        // Añadir event listener al botón de cerrar
        TABLERO.MODALES.elementos.btnCerrarModalAyuda.addEventListener('click', cerrarModalAyuda);
        
        // Aplicar tema oscuro si está activo
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
          TABLERO.MODALES.elementos.modalAyuda.classList.add('dark-theme');
        }
        
        // Marcar como cargado
        TABLERO.MODALES.estado.modalAyudaCargado = true;
        
        // Mostrar el modal
        TABLERO.MODALES.elementos.modalAyuda.showModal();
      })
      .catch(error => {
        console.error('Error:', error);
        alert('No se pudo cargar la ayuda. Por favor, inténtalo de nuevo.');
      });
  } else {
    // Si el modal ya existe, simplemente mostrarlo
    document.getElementById('modal-ayuda').showModal();
  }
}

/**
 * Cierra el modal de ayuda
 */
function cerrarModalAyuda() {
  const modalAyuda = document.getElementById('modal-ayuda');
  if (modalAyuda) {
    modalAyuda.close();
  }
}

/* ==========================================================================
   MODAL DE JUEGO DETENIDO - Gestión del modal al detener manualmente el juego
   ========================================================================== */

/**
 * Carga y muestra el modal de juego detenido
 * Muestra estadísticas del tiempo jugado y movimientos realizados
 */
function mostrarModalDetenido() {
  // Verificar si el modal ya está en el DOM
  if (!document.getElementById('modal-detenido')) {
    // Si no existe, cargar el archivo HTML del modal
    fetch('modales/modal-detenido.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('No se pudo cargar el modal de juego detenido');
        }
        return response.text();
      })
      .then(html => {
        // Crear un contenedor temporal para procesar el HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Añadir el modal al body
        const modal = tempDiv.firstChild;
        document.body.appendChild(modal);
        
        // Cachear el modal y sus elementos
        TABLERO.MODALES.elementos.modalDetenido = document.getElementById('modal-detenido');
        TABLERO.MODALES.elementos.modalDetenidoTiempo = document.getElementById('modal-detenido-tiempo');
        TABLERO.MODALES.elementos.modalDetenidoMovimientos = document.getElementById('modal-detenido-movimientos');
        TABLERO.MODALES.elementos.btnCerrarModalDetenido = document.getElementById('cerrar-modal-detenido');
        
        // Añadir event listener al botón cerrar
        TABLERO.MODALES.elementos.btnCerrarModalDetenido.addEventListener('click', cerrarModalDetenido);
        
        // Aplicar tema oscuro si está activo
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
          TABLERO.MODALES.elementos.modalDetenido.classList.add('dark-theme');
        }
        
        // Actualizar información del modal
        TABLERO.MODALES.elementos.modalDetenidoTiempo.textContent = formatearTiempo(TABLERO.estado.tiempo);
        TABLERO.MODALES.elementos.modalDetenidoMovimientos.textContent = TABLERO.estado.movimientos;
        
        // Mostrar modal
        TABLERO.MODALES.elementos.modalDetenido.showModal();
      })
      .catch(error => {
        console.error('Error:', error);
        alert('No se pudo mostrar la información del juego detenido.');
      });
  } else {
    // Si ya existe, actualizar información y mostrarlo
    document.getElementById('modal-detenido-tiempo').textContent = formatearTiempo(TABLERO.estado.tiempo);
    document.getElementById('modal-detenido-movimientos').textContent = TABLERO.estado.movimientos;
    document.getElementById('modal-detenido').showModal();
  }
}

/**
 * Cierra el modal de juego detenido
 */
function cerrarModalDetenido() {
  const modalDetenido = document.getElementById('modal-detenido');
  if (modalDetenido) {
    modalDetenido.close();
  }
}

// Exponer funciones al espacio global
// Esto permite que las funciones sean accesibles desde script.js
TABLERO.mostrarModalVictoria = mostrarModalVictoria;
TABLERO.reiniciarJuego = reiniciarJuego;
TABLERO.soloCerrarModal = soloCerrarModal;
TABLERO.mostrarAyuda = mostrarAyuda;
TABLERO.cerrarModalAyuda = cerrarModalAyuda;
TABLERO.mostrarModalDetenido = mostrarModalDetenido;
TABLERO.cerrarModalDetenido = cerrarModalDetenido;