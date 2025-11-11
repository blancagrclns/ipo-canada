import { recuperaElementoAleatorio } from './utils.js';
import {
  inicializarModoBilingue,
  iniciarTestBilingue,
  verificarEntradaBilingue,
  cambiarPalabraBilingue,
  ocultarModoBilingue
} from './bilingue.js';

// Arrays de palabras por dificultad
const palabrasDefault = ['casa', 'perro', 'gato', 'sol', 'luna', 'agua', 'fuego', 'tierra', 'viento', 'mar', 'cielo', 'montaña', 'río', 'bosque', 'flor', 'árbol', 'piedra', 'estrella', 'nube', 'lluvia'];
const palabrasFaciles = ["sol", "pan", "mar", "voz", "sal", "flor", "pez", "tren", "luz", "rey", "mil", "mes", "club", "cruz", "sed", "gas", "fin", "dos", "tres", "bien"];
const palabrasMedias = ["reloj", "pared", "salud", "hotel", "canal", "animal", "doctor", "papel", "cantar", "comer", "azul", "feliz", "actor", "legal", "control", "motor", "señal", "natural", "final", "ideal", "mesa", "carro", "lunes", "plaza", "libro", "fuerte", "verde", "nube", "cielo", "calle", "puerta", "fruta", "piedra", "silla", "camisa", "ratón", "zapato", "ventana", "cama", "sólido"];
const palabrasDificiles = ["murciélago", "teléfono", "pájaro", "brújula", "rápido", "próximo", "esdrújula", "químico", "físico", "político", "artístico", "matemático", "gramático", "técnico", "médico", "plástico", "músico", "lógico", "económico", "histórico"];
const palabrasMuyDificiles = ["dígamelo", "repíteselo", "cuéntamelo", "devuélvemelo", "explícaselo", "entrégaselo", "tráemelo", "díselo", "muéstramelo", "regrésámelo", "préstamelo", "confírmamelo", "recuérdaselo", "lléváselo", "envíáselo", "compréndémelo", "tradúcémelo", "aclárámelo", "organízámelo", "resuélvémelo"];

// Elementos del DOM - USANDO LOS IDs CORRECTOS DEL HTML
const btnComienzo = document.getElementById('btnComienzo');
const btnPausa = document.getElementById('btnPausa');
const btnFin = document.getElementById('btnFin');
const tiempoSpan = document.getElementById('tiempo');
const palabrasCorrectasSpan = document.getElementById('palabrasCorrectas');
const palabrasIncorrectasSpan = document.getElementById('palabrasIncorrectas');
const palabraDeMuestraSpan = document.getElementById('palabraDeMuestra');
const entrada = document.getElementById('entrada');
const numPalabrasInput = document.getElementById('numPalabras');
const tiempoMaxInput = document.getElementById('tiempoMax');
const statsTiempo = document.getElementById('statsTiempo');
const statsCorrectas = document.getElementById('statsCorrectas');
const statsFalladas = document.getElementById('statsFalladas');

// Variables de estado
let intervaloTemporizador = null;
let tiempoTranscurrido = 0;
let palabrasCorrectas = 0;
let palabrasFalladas = 0;
let palabraActual = '';
let numPalabrasObjetivo = null;
let tiempoMaximo = null;
let pausado = false;
let dificultadActual = 0;
let palabrasActuales = palabrasDefault;
let modoBilingueActivo = false;

// Función para cambiar dificultad
function cambiarDificultad(nivel) {
  dificultadActual = nivel;
  switch (nivel) {
    case 0: palabrasActuales = palabrasDefault; alert('Dificultad: Default'); break;
    case 1: palabrasActuales = palabrasFaciles; alert('Dificultad: Fácil (monosílabos)'); break;
    case 2: palabrasActuales = palabrasMedias; alert('Dificultad: Media (agudas/llanas)'); break;
    case 3: palabrasActuales = palabrasDificiles; alert('Dificultad: Difícil (esdrújulas)'); break;
    case 4: palabrasActuales = palabrasMuyDificiles; alert('Dificultad: Muy difícil (sobresdrújulas/acentos)'); break;
  }
  if (modoBilingueActivo) {
    cambiarPalabraBilingue(nivel);
  } else {
    cambiarPalabra();
  }
}

// Función para iniciar el test
function iniciarTest() {
  console.log('=== INICIANDO TEST ===');
  
  tiempoTranscurrido = 0;
  palabrasCorrectas = 0;
  palabrasFalladas = 0;
  pausado = false;
  tiempoSpan.textContent = tiempoTranscurrido;
  palabrasCorrectasSpan.textContent = palabrasCorrectas;
  palabrasIncorrectasSpan.textContent = palabrasFalladas;
  
  // ✅ Leer configuración del modal
  numPalabrasObjetivo = parseInt(numPalabrasInput.value) || 15;
  tiempoMaximo = parseInt(tiempoMaxInput.value) || null;
  
  console.log('Configuración:', { numPalabrasObjetivo, tiempoMaximo });

  // ✅ Verificar modo bilingüe del checkbox del modal
  const modoBilingueCheckbox = document.getElementById('modoBilingue');
  modoBilingueActivo = modoBilingueCheckbox ? modoBilingueCheckbox.checked : false;
  
  console.log('Modo bilingüe checkbox encontrado:', !!modoBilingueCheckbox);
  console.log('Modo bilingüe activo:', modoBilingueActivo);

  // ✅ Deshabilitar configuración durante el test
  if (modoBilingueCheckbox) {
    modoBilingueCheckbox.disabled = true;
    
    const idiomaOrigen = document.getElementById('idiomaOrigen');
    const idiomaDestino = document.getElementById('idiomaDestino');
    if (idiomaOrigen) idiomaOrigen.disabled = true;
    if (idiomaDestino) idiomaDestino.disabled = true;
  }

  // ✅ Iniciar según el modo
  if (modoBilingueActivo) {
    console.log('Iniciando test bilingüe...');
    iniciarTestBilingue();
  } else {
    console.log('Iniciando test normal...');
    ocultarModoBilingue();
    cambiarPalabra();
  }

  // ✅ Configurar interfaz
  entrada.disabled = false;
  entrada.focus();
  btnComienzo.disabled = true;
  btnPausa.disabled = false;
  btnFin.disabled = false;
  btnPausa.textContent = 'Pausar';

  // ✅ Iniciar temporizador
  intervaloTemporizador = setInterval(() => {
    if (!pausado) {
      tiempoTranscurrido++;
      tiempoSpan.textContent = tiempoTranscurrido;
      if (tiempoMaximo && tiempoTranscurrido >= tiempoMaximo) {
        detenerTest();
        mostrarStats();
      }
    }
  }, 1000);
  
  console.log('Test iniciado correctamente');
}

function togglePausa() {
  pausado = !pausado;
  btnPausa.textContent = pausado ? 'Reanudar' : 'Pausar';
  entrada.disabled = pausado;
}


function cambiarPalabra() {
  palabraActual = recuperaElementoAleatorio(palabrasActuales);
  palabraDeMuestraSpan.textContent = palabraActual;
  entrada.value = '';
}


function verificarEntrada(event) {
  if (event.key === 'Enter') {
    if (modoBilingueActivo) {
      verificarEntradaBilingue(event);
    } else {
      const palabraTecleada = entrada.value.trim();
      // Limpieza de clases de estado
      entrada.classList.remove('input--ok', 'input--error', 'is-shaking');
      palabraDeMuestraSpan.classList.remove('palabra--ok', 'palabra--error', 'tarjeta__palabra--ok', 'tarjeta__palabra--error');


      if (palabraTecleada === palabraActual) {
        palabrasCorrectas++;
        palabrasCorrectasSpan.textContent = palabrasCorrectas;
        mostrarAciertoVisual();
        setTimeout(() => {
          if (numPalabrasObjetivo && palabrasCorrectas >= numPalabrasObjetivo) {
            detenerTest();
            mostrarStats();
          } else {
            cambiarPalabra();
          }
        }, 500);
      } else {
        palabrasFalladas++;
        palabrasIncorrectasSpan.textContent = palabrasFalladas;
        mostrarErrorVisual();
        entrada.value = '';
      }
    }
  }
}

// Función para mostrar feedback visual de acierto
function mostrarAciertoVisual() {
  entrada.classList.add('input--ok');
  palabraDeMuestraSpan.classList.add('tarjeta__palabra--ok');
  setTimeout(() => {
    entrada.classList.remove('input--ok');
    palabraDeMuestraSpan.classList.remove('tarjeta__palabra--ok');
  }, 500);
}


function mostrarErrorVisual() {
  entrada.classList.add('input--error', 'is-shaking');
  palabraDeMuestraSpan.classList.add('tarjeta__palabra--error');
  setTimeout(() => {
    entrada.classList.remove('input--error', 'is-shaking');
    palabraDeMuestraSpan.classList.remove('tarjeta__palabra--error');
  }, 800);
}

// Función para resetear todo el estado del test
function resetearTest() {
  tiempoTranscurrido = 0;
  palabrasCorrectas = 0;
  palabrasFalladas = 0;
  pausado = false;
  palabraActual = '';
  entrada.value = '';

  // Actualizar los elementos visuales
  tiempoSpan.textContent = tiempoTranscurrido;
  palabrasCorrectasSpan.textContent = palabrasCorrectas;
  palabrasIncorrectasSpan.textContent = palabrasFalladas;
  palabraDeMuestraSpan.textContent = 'Palabra';

  // Limpiar clases de estado del input y palabra
  entrada.classList.remove('input--ok', 'input--error', 'is-shaking');
  palabraDeMuestraSpan.classList.remove('tarjeta__palabra--ok', 'tarjeta__palabra--error');

  // Resetear el checkbox de modo bilingüe y sus controles
  const modoBilingueCheckbox = document.getElementById('modoBilingue');
  if (modoBilingueCheckbox) {
    modoBilingueCheckbox.checked = false;
    modoBilingueCheckbox.disabled = false;

    const idiomaOrigen = document.getElementById('idiomaOrigen');
    const idiomaDestino = document.getElementById('idiomaDestino');
    if (idiomaOrigen) idiomaOrigen.disabled = true;
    if (idiomaDestino) idiomaDestino.disabled = true;

    const opcionesBilingue = document.getElementById('opcionesBilingue');
    if (opcionesBilingue) opcionesBilingue.classList.remove('config-container__group--disabled');
  }

  // Limpiar la traducción
  ocultarModoBilingue();
}

// Función para detener el test
function detenerTest() {
  if (intervaloTemporizador) {
    clearInterval(intervaloTemporizador);
    intervaloTemporizador = null;
  }
  entrada.disabled = true;
  btnComienzo.disabled = false;
  btnPausa.disabled = true;
  btnFin.disabled = true;
  modoBilingueActivo = false;

  const modoBilingueCheckbox = document.getElementById('modoBilingue');
  if (modoBilingueCheckbox) {
    modoBilingueCheckbox.disabled = false;
    const idiomaOrigen = document.getElementById('idiomaOrigen');
    const idiomaDestino = document.getElementById('idiomaDestino');
    const isChecked = modoBilingueCheckbox.checked;
    if (idiomaOrigen) idiomaOrigen.disabled = !isChecked;
    if (idiomaDestino) idiomaDestino.disabled = !isChecked;
    const opcionesBilingue = document.getElementById('opcionesBilingue');
    if (opcionesBilingue) opcionesBilingue.classList.remove('config-container__group--disabled');
  }
  ocultarModoBilingue();
}

// Función para mostrar modal de estadísticas
function mostrarStats() {
  if (statsTiempo && statsCorrectas && statsFalladas) {
    statsTiempo.textContent = tiempoTranscurrido;
    statsCorrectas.textContent = palabrasCorrectas;
    statsFalladas.textContent = palabrasFalladas;
  }
  
  // ✅ Usar el modal definido en window
  if (window.modalStats) {
    window.modalStats.showModal();
  }
}


function toggleModal() {
  modalAyuda.classList.toggle('active');
}

function toggleModalConfiguracion() {
  modalConfiguracion.classList.toggle('active');
}

// Event listeners
if (btnComienzo) {
  btnComienzo.addEventListener('click', iniciarTest);
  console.log('Event listener para btnComienzo añadido');
}

if (btnPausa) {
  btnPausa.addEventListener('click', togglePausa);
}

if (btnFin) {
  btnFin.addEventListener('click', () => {
    detenerTest();
    mostrarStats();
  });
}

if (entrada) {
  entrada.addEventListener('keydown', verificarEntrada);
}

// Inicializar modo bilingüe con API
inicializarModoBilingue({
  cambiarPalabra,
  detenerTest,
  mostrarStats,
  getDificultadActual: () => dificultadActual,
  incrementarCorrectas: () => {
    palabrasCorrectas++;
    palabrasCorrectasSpan.textContent = palabrasCorrectas;
  },
  incrementarFalladas: () => {
    palabrasFalladas++;
    palabrasIncorrectasSpan.textContent = palabrasFalladas;
  },
  getNumPalabrasObjetivo: () => numPalabrasObjetivo
});

// Asegurar que el modo bilingüe está oculto al inicio
ocultarModoBilingue();

// Listener para teclas numéricas (dificultad dinámica)
document.addEventListener('keydown', (event) => {
  const key = parseInt(event.key);
  if (key >= 0 && key <= 4) {
    const activeElement = document.activeElement;
    const isEntradaInput = activeElement.id === 'entrada';
    const isOtherInput = (activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'SELECT' ||
      activeElement.tagName === 'TEXTAREA') && !isEntradaInput;

    if (isEntradaInput || !isOtherInput) {
      if (isEntradaInput) {
        event.preventDefault();
      }
      cambiarDificultad(key);
    }
  }
});

// Cerrar modales al hacer clic fuera
window.addEventListener('click', (event) => {
  if (event.target === modalAyuda) {
    toggleModal();
  }
  if (event.target === modalConfiguracion) {
    toggleModalConfiguracion();
  }
  if (event.target === modalStats) {
    modalStats.classList.remove('active');
    resetearTest();
  }
});

// Detener test al cerrar la página
window.addEventListener('beforeunload', detenerTest);

// ==========================================================================
// FIN DEL ARCHIVO - La gestión de modo bilingüe está en theme-toggle.js
// ==========================================================================