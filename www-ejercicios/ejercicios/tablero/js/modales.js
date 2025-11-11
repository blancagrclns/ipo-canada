/* ==========================================================================
   MODALES - Gestión de ventanas modales del juego
   ==========================================================================
*/

TABLERO.MODALES = {
  elementos: {},
  estado: {
    modalAyudaCargado: false
  }
};

function mostrarModalVictoria() {
  const modalVictoria = TABLERO.nodos.modalVictoria;

  if (!modalVictoria) {
    console.error('Modal de victoria no encontrado');
    return;
  }

  const movimientosSpan = modalVictoria.querySelector('[data-resumen="movimientos"]');
  const tiempoSpan = modalVictoria.querySelector('[data-resumen="tiempo"]');

  if (movimientosSpan) {
    movimientosSpan.textContent = TABLERO.estado.movimientos;
  }
  if (tiempoSpan) {
    tiempoSpan.textContent = formatearTiempo(TABLERO.estado.tiempo);
  }

  modalVictoria.showModal();
}

function reiniciarJuego() {
  if (TABLERO.nodos.modalVictoria) {
    TABLERO.nodos.modalVictoria.close();
  }
  iniciarJuego();
}

function soloCerrarModal() {
  if (TABLERO.nodos.modalVictoria) {
    TABLERO.nodos.modalVictoria.close();
  }
  limpiarTablero();
  if (TABLERO.nodos.btnInicio) {
    TABLERO.nodos.btnInicio.disabled = false;
  }
}

function limpiarTablero() {
  const contenedor = document.querySelector('.tablero-contenedor');
  if (!contenedor) {
    return;
  }
  contenedor.classList.remove('tablero-contenedor--doble');
  contenedor.innerHTML = '';

  const nuevoTablero = document.createElement('div');
  nuevoTablero.id = 'tablero';
  nuevoTablero.className = 'tablero';
  nuevoTablero.setAttribute('data-tablero', '');
  nuevoTablero.setAttribute('aria-label', 'Tablero de juego');
  contenedor.appendChild(nuevoTablero);

  TABLERO.nodos.tablero = nuevoTablero;
  TABLERO.estado.juegoIniciado = false;
  TABLERO.estado.juegoPausado = false;
  TABLERO.estado.movimientos = 0;
  TABLERO.estado.tiempo = 0;

  actualizarContador();
  if (TABLERO.nodos.temporizador) {
    TABLERO.nodos.temporizador.textContent = '00:00';
  }

  actualizarUI();
}

function mostrarAyuda() {
  const modalExistente = document.querySelector('[data-modal="ayuda"]');

  if (!modalExistente) {
    fetch('modales/modal-ayuda.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('No se pudo cargar el modal de ayuda');
        }
        return response.text();
      })
      .then(html => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const modal = tempDiv.firstElementChild;
        if (!modal) {
          throw new Error('El modal de ayuda está vacío');
        }

        document.body.appendChild(modal);
        const modalAyuda = document.querySelector('[data-modal="ayuda"]');
        if (!modalAyuda) {
          throw new Error('No se pudo inicializar el modal de ayuda');
        }

        const btnCerrarAyuda = modalAyuda.querySelector('[data-accion="cerrar-modal-ayuda"]');
        if (btnCerrarAyuda) {
          btnCerrarAyuda.addEventListener('click', cerrarModalAyuda);
        }

        TABLERO.MODALES.elementos.modalAyuda = modalAyuda;
        TABLERO.MODALES.elementos.btnCerrarModalAyuda = btnCerrarAyuda;

        modalAyuda.showModal();
      })
      .catch(error => {
        console.error('Error:', error);
        alert('No se pudo cargar la ayuda. Por favor, inténtalo de nuevo.');
      });
  } else {
    modalExistente.showModal();
  }
}

function cerrarModalAyuda() {
  const modalAyuda = document.querySelector('[data-modal="ayuda"]');
  if (modalAyuda) {
    modalAyuda.close();
  }
}

function mostrarModalDetenido() {
  const modalExistente = document.querySelector('[data-modal="detenido"]');

  if (!modalExistente) {
    fetch('modales/modal-detenido.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('No se pudo cargar el modal de juego detenido');
        }
        return response.text();
      })
      .then(html => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const modal = tempDiv.firstElementChild;
        if (!modal) {
          throw new Error('El modal de juego detenido está vacío');
        }

        document.body.appendChild(modal);
        const modalDetenido = document.querySelector('[data-modal="detenido"]');
        if (!modalDetenido) {
          throw new Error('No se pudo inicializar el modal de juego detenido');
        }

        const btnCerrarDetenido = modalDetenido.querySelector('[data-accion="cerrar-modal-detenido"]');
        if (btnCerrarDetenido) {
          btnCerrarDetenido.addEventListener('click', cerrarModalDetenido);
        }

        TABLERO.MODALES.elementos.modalDetenido = modalDetenido;
        TABLERO.MODALES.elementos.modalDetenidoTiempo = modalDetenido.querySelector('[data-resumen="tiempo"]');
        TABLERO.MODALES.elementos.modalDetenidoMovimientos = modalDetenido.querySelector('[data-resumen="movimientos"]');
        TABLERO.MODALES.elementos.btnCerrarModalDetenido = btnCerrarDetenido;

        if (document.documentElement.getAttribute('data-theme') === 'dark') {
          modalDetenido.classList.add('modal--dark-theme');
        }

        actualizarEstadisticasModalDetenido(modalDetenido);
        modalDetenido.showModal();
      })
      .catch(error => {
        console.error('Error:', error);
        alert('No se pudo mostrar la información del juego detenido.');
      });
  } else {
    actualizarEstadisticasModalDetenido(modalExistente);
    modalExistente.showModal();
  }
}

function actualizarEstadisticasModalDetenido(modal) {
  const tiempoSpan = modal.querySelector('[data-resumen="tiempo"]');
  const movimientosSpan = modal.querySelector('[data-resumen="movimientos"]');

  if (tiempoSpan) {
    tiempoSpan.textContent = formatearTiempo(TABLERO.estado.tiempo);
  }
  if (movimientosSpan) {
    movimientosSpan.textContent = TABLERO.estado.movimientos;
  }
}

function cerrarModalDetenido() {
  const modalDetenido = document.querySelector('[data-modal="detenido"]');
  if (modalDetenido) {
    modalDetenido.close();
    limpiarTablero();
  }
}

TABLERO.mostrarModalVictoria = mostrarModalVictoria;
TABLERO.reiniciarJuego = reiniciarJuego;
TABLERO.soloCerrarModal = soloCerrarModal;
TABLERO.mostrarAyuda = mostrarAyuda;
TABLERO.cerrarModalAyuda = cerrarModalAyuda;
TABLERO.mostrarModalDetenido = mostrarModalDetenido;
TABLERO.cerrarModalDetenido = cerrarModalDetenido;
TABLERO.limpiarTablero = limpiarTablero;

document.addEventListener('DOMContentLoaded', () => {
  const btnConfig = document.querySelector('[data-accion="abrir-configuracion"]');
  const modalConfig = document.querySelector('[data-modal="configuracion"]');
  const cerrarConfig = document.querySelector('[data-accion="cerrar-configuracion"]');
  const btnGuardar = document.querySelector('[data-accion="guardar-configuracion"]');
  const modalVictoria = document.querySelector('[data-modal="victoria"]');
  const btnReiniciarVictoria = modalVictoria?.querySelector('[data-accion="reiniciar-juego"]');
  const btnCerrarVictoria = modalVictoria?.querySelector('[data-accion="cerrar-modal-victoria"]');

  if (btnConfig && modalConfig && cerrarConfig && btnGuardar) {
    btnConfig.addEventListener('click', () => modalConfig.showModal());
    cerrarConfig.addEventListener('click', () => modalConfig.close());
    btnGuardar.addEventListener('click', () => modalConfig.close());
  }

  if (btnReiniciarVictoria) {
    btnReiniciarVictoria.addEventListener('click', reiniciarJuego);
  }

  if (btnCerrarVictoria) {
    btnCerrarVictoria.addEventListener('click', soloCerrarModal);
  }
});
