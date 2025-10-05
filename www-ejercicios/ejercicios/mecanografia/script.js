import { recuperaElementoAleatorio } from './utils.js';

// Array de palabras para el test (ejemplo; expándelo según necesidades)
const palabras = [
  'casa', 'perro', 'gato', 'sol', 'luna', 'agua', 'fuego', 'tierra', 'viento', 'mar',
  'cielo', 'montaña', 'rio', 'bosque', 'flor', 'arbol', 'piedra', 'estrella', 'nube', 'lluvia'
];

// Elementos del DOM (buenas prácticas: constantes para evitar reasignaciones)
const btnComienzo = document.getElementById('btnComienzo');
const btnPausa = document.getElementById('btnPausa');
const btnAyuda = document.getElementById('btnAyuda');
const cerrarModal = document.getElementById('cerrarModal');
const modalAyuda = document.getElementById('modalAyuda');
const tiempoSpan = document.getElementById('tiempo');
const palabrasCorrectasSpan = document.getElementById('palabrasCorrectas');
const palabraDeMuestraSpan = document.getElementById('palabraDeMuestra');
const entrada = document.getElementById('entrada');
const numPalabrasInput = document.getElementById('numPalabras');
const tiempoMaxInput = document.getElementById('tiempoMax');

// Variables de estado (buenas prácticas: let para mutabilidad controlada)
let intervaloTemporizador = null;
let tiempoTranscurrido = 0;
let palabrasCorrectas = 0;
let palabraActual = '';
let numPalabrasObjetivo = null;
let tiempoMaximo = null;
let pausado = false;

// Función para iniciar el test (buenas prácticas: función pura y modular)
function iniciarTest() {
  tiempoTranscurrido = 0;
  palabrasCorrectas = 0;
  pausado = false;
  tiempoSpan.textContent = tiempoTranscurrido;
  palabrasCorrectasSpan.textContent = palabrasCorrectas;
  numPalabrasObjetivo = parseInt(numPalabrasInput.value) || null;
  tiempoMaximo = parseInt(tiempoMaxInput.value) || null;
  cambiarPalabra();
  entrada.disabled = false;
  entrada.focus();
  btnComienzo.disabled = true;
  btnPausa.disabled = false;
  btnPausa.textContent = 'Pausar';

  // Iniciar temporizador con setInterval (inspirado en intervalos)
  intervaloTemporizador = setInterval(() => {
    if (!pausado) {
      tiempoTranscurrido++;
      tiempoSpan.textContent = tiempoTranscurrido;
      if (tiempoMaximo && tiempoTranscurrido >= tiempoMaximo) {
        detenerTest();
        alert(`Tiempo máximo alcanzado. Palabras correctas: ${palabrasCorrectas}`);
      }
    }
  }, 1000);
}

// Función para pausar/reanudar
function togglePausa() {
  pausado = !pausado;
  btnPausa.textContent = pausado ? 'Reanudar' : 'Pausar';
  entrada.disabled = pausado;
}

// Función para cambiar la palabra de muestra (usa utils.js)
function cambiarPalabra() {
  palabraActual = recuperaElementoAleatorio(palabras);
  palabraDeMuestraSpan.textContent = palabraActual;
  entrada.value = '';
}

// Función para verificar la entrada del usuario (evento keydown para Enter)
function verificarEntrada(event) {
  if (event.key === 'Enter') {
    const palabraTecleada = entrada.value.trim();
    if (palabraTecleada === palabraActual) {
      palabrasCorrectas++;
      palabrasCorrectasSpan.textContent = palabrasCorrectas;
      if (numPalabrasObjetivo && palabrasCorrectas >= numPalabrasObjetivo) {
        detenerTest();
        alert(`Objetivo alcanzado. Tiempo: ${tiempoTranscurrido}s`);
      } else {
        cambiarPalabra();
      }
    } else {
      alert('Palabra incorrecta. Inténtalo de nuevo.');
      entrada.value = '';
    }
  }
}

// Función para detener el test (buenas prácticas: limpieza de intervalos)
function detenerTest() {
  if (intervaloTemporizador) {
    clearInterval(intervaloTemporizador);
    intervaloTemporizador = null;
  }
  entrada.disabled = true;
  btnComienzo.disabled = false;
  btnPausa.disabled = true;
}

// Función para mostrar/ocultar modal
function toggleModal() {
  modalAyuda.style.display = modalAyuda.style.display === 'flex' ? 'none' : 'flex';
}

// Event listeners (buenas prácticas: delegación y separación de concerns)
btnComienzo.addEventListener('click', iniciarTest);
btnPausa.addEventListener('click', togglePausa);
btnAyuda.addEventListener('click', toggleModal);
cerrarModal.addEventListener('click', toggleModal);
entrada.addEventListener('keydown', verificarEntrada);

// Cerrar modal al hacer clic fuera
window.addEventListener('click', (event) => {
  if (event.target === modalAyuda) {
    toggleModal();
  }
});

// Detener test al cerrar la página (buenas prácticas: limpieza)
window.addEventListener('beforeunload', detenerTest);
