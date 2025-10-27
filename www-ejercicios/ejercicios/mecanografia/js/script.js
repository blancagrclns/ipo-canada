import { recuperaElementoAleatorio } from './utils.js';
import { 
  inicializarModoBilingue, 
  iniciarTestBilingue, 
  verificarEntradaBilingue, 
  cambiarPalabraBilingue,
  ocultarModoBilingue 
} from './bilingue.js';

// Arrays de palabras por dificultad 
const palabrasDefault = [
  'casa', 'perro', 'gato', 'sol', 'luna', 'agua', 'fuego', 'tierra', 'viento', 'mar',
  'cielo', 'montaña', 'río', 'bosque', 'flor', 'árbol', 'piedra', 'estrella', 'nube', 'lluvia'
];

const palabrasFaciles = ["sol", "pan", "mar", "voz", "sal",
  "flor", "pez", "tren", "luz", "rey",
  "mil", "mes", "club", "cruz", "sed",
  "gas", "fin", "dos", "tres", "bien"];

const palabrasMedias = ["reloj", "pared", "salud", "hotel", "canal",
  "animal", "doctor", "papel", "cantar", "comer",
  "azul", "feliz", "actor", "legal", "control",
  "motor", "señal", "natural", "final", "ideal", "mesa", "carro", "lunes", "plaza", "libro",
  "fuerte", "verde", "nube", "cielo", "calle",
  "puerta", "fruta", "piedra", "silla", "camisa",
  "ratón", "zapato", "ventana", "cama", "sólido"];

const palabrasDificiles = ["murciélago", "teléfono", "pájaro", "brújula", "rápido",
  "próximo", "esdrújula", "químico", "físico", "político",
  "artístico", "matemático", "gramático", "técnico", "médico",
  "plástico", "músico", "lógico", "económico", "histórico"];

const palabrasMuyDificiles = ["dígamelo", "repíteselo", "cuéntamelo", "devuélvemelo", "explícaselo",
  "entrégaselo", "tráemelo", "díselo", "muéstramelo", "regrésámelo",
  "préstamelo", "confírmamelo", "recuérdaselo", "lléváselo", "envíáselo",
  "compréndémelo", "tradúcémelo", "aclárámelo", "organízámelo", "resuélvémelo"];

// Elementos del DOM 
const btnComienzo = document.getElementById('btnComienzo');
const btnPausa = document.getElementById('btnPausa');
const btnFin = document.getElementById('btnFin');
const btnAyuda = document.getElementById('btnAyuda');
const cerrarModal = document.getElementById('cerrarModal');
const modalAyuda = document.getElementById('modalAyuda');
const cerrarStats = document.getElementById('cerrarStats');
const modalStats = document.getElementById('modalStats');
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
let modoBilingueActivo = false; // Nueva variable para rastrear el estado del modo bilingüe

// Función para cambiar dificultad
function cambiarDificultad(nivel) {
  dificultadActual = nivel;
  switch (nivel) {
    case 0:
      palabrasActuales = palabrasDefault;
      alert('Dificultad: Default');
      break;
    case 1:
      palabrasActuales = palabrasFaciles;
      alert('Dificultad: Fácil (monosílabos)');
      break;
    case 2:
      palabrasActuales = palabrasMedias;
      alert('Dificultad: Media (agudas/llanas)');
      break;
    case 3:
      palabrasActuales = palabrasDificiles;
      alert('Dificultad: Difícil (esdrújulas)');
      break;
    case 4:
      palabrasActuales = palabrasMuyDificiles;
      alert('Dificultad: Muy difícil (sobresdrújulas/acentos)');
      break;
  }
  
  // Solo cambiar palabra bilingüe si el modo está activo
  if (modoBilingueActivo) {
    cambiarPalabraBilingue(nivel);
  } else {
    cambiarPalabra();
  }
}

// Función para iniciar el test
function iniciarTest() {
  tiempoTranscurrido = 0;
  palabrasCorrectas = 0;
  palabrasFalladas = 0;
  pausado = false;
  tiempoSpan.textContent = tiempoTranscurrido;
  palabrasCorrectasSpan.textContent = palabrasCorrectas;
  palabrasIncorrectasSpan.textContent = palabrasFalladas;
  numPalabrasObjetivo = parseInt(numPalabrasInput.value) || null;
  tiempoMaximo = parseInt(tiempoMaxInput.value) || null;
  
  const modoBilingueCheckbox = document.getElementById('modoBilingue');
  modoBilingueActivo = modoBilingueCheckbox && modoBilingueCheckbox.checked;
  
  // Deshabilitar configuración durante el test
  if (modoBilingueCheckbox) {
    modoBilingueCheckbox.disabled = true;
    
    const idiomaOrigen = document.getElementById('idiomaOrigen');
    const idiomaDestino = document.getElementById('idiomaDestino');
    if (idiomaOrigen) idiomaOrigen.disabled = true;
    if (idiomaDestino) idiomaDestino.disabled = true;
    
    const opcionesBilingue = document.getElementById('opcionesBilingue');
    if (opcionesBilingue) {
      opcionesBilingue.classList.add('config-container__group--disabled');
    }
  }
  
  // Iniciar en el modo correspondiente
  if (modoBilingueActivo) {
    iniciarTestBilingue();
  } else {
    ocultarModoBilingue(); // Asegurar que el modo bilingüe está oculto
    cambiarPalabra();
  }
  
  entrada.disabled = false;
  entrada.focus();
  btnComienzo.disabled = true;
  btnPausa.disabled = false;
  btnFin.disabled = false;
  btnPausa.textContent = 'Pausar';

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
}

// Función para pausar/reanudar
function togglePausa() {
  pausado = !pausado;
  btnPausa.textContent = pausado ? 'Reanudar' : 'Pausar';
  entrada.disabled = pausado;
}

// Función para cambiar la palabra de muestra
function cambiarPalabra() {
  palabraActual = recuperaElementoAleatorio(palabrasActuales);
  palabraDeMuestraSpan.textContent = palabraActual;
  entrada.value = '';
}

// Función para verificar la entrada del usuario
function verificarEntrada(event) {
  if (event.key === 'Enter') {
    // Verificar si el modo bilingüe está activo
    if (modoBilingueActivo) {
      verificarEntradaBilingue(event);
    } else {
      // Lógica para modo normal
      const palabraTecleada = entrada.value.trim();
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
  entrada.style.borderColor = "var(--color-exito)";
  entrada.style.backgroundColor = "hsla(140, 50%, 45%, 0.1)";
  palabraDeMuestraSpan.style.color = "var(--color-exito)";
  
  setTimeout(() => {
    entrada.style.borderColor = "";
    entrada.style.backgroundColor = "";
    palabraDeMuestraSpan.style.color = "";
  }, 500);
}

// Función para mostrar feedback visual de error
function mostrarErrorVisual() {
  entrada.style.borderColor = "var(--color-error)";
  entrada.style.backgroundColor = "hsla(0, 70%, 50%, 0.1)";
  palabraDeMuestraSpan.style.color = "var(--color-error)";
  
  entrada.style.animation = "shake 0.3s";
  
  setTimeout(() => {
    entrada.style.borderColor = "";
    entrada.style.backgroundColor = "";
    palabraDeMuestraSpan.style.color = "";
    entrada.style.animation = "";
  }, 800);
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
  modoBilingueActivo = false; // Resetear el estado
  
  // Re-habilitar configuración
  const modoBilingueCheckbox = document.getElementById('modoBilingue');
  if (modoBilingueCheckbox) {
    modoBilingueCheckbox.disabled = false;
    
    const idiomaOrigen = document.getElementById('idiomaOrigen');
    const idiomaDestino = document.getElementById('idiomaDestino');
    
    // Solo habilitar selectores si el checkbox está marcado
    const isChecked = modoBilingueCheckbox.checked;
    if (idiomaOrigen) idiomaOrigen.disabled = !isChecked;
    if (idiomaDestino) idiomaDestino.disabled = !isChecked;
    
    const opcionesBilingue = document.getElementById('opcionesBilingue');
    if (opcionesBilingue) {
      opcionesBilingue.classList.remove('config-container__group--disabled');
    }
  }
  
  // Ocultar elementos del modo bilingüe
  ocultarModoBilingue();
}

// Función para mostrar modal de estadísticas
function mostrarStats() {
  statsTiempo.textContent = tiempoTranscurrido;
  statsCorrectas.textContent = palabrasCorrectas;
  statsFalladas.textContent = palabrasFalladas;
  modalStats.style.display = 'flex';
}

// Función para mostrar/ocultar modal de ayuda
function toggleModal() {
  modalAyuda.style.display = modalAyuda.style.display === 'flex' ? 'none' : 'flex';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  btnComienzo.addEventListener('click', iniciarTest);
  btnPausa.addEventListener('click', togglePausa);
  btnFin.addEventListener('click', () => {
    detenerTest();
    mostrarStats();
  });
  btnAyuda.addEventListener('click', toggleModal);
  cerrarModal.addEventListener('click', toggleModal);
  cerrarStats.addEventListener('click', () => {
    modalStats.style.display = 'none';
  });
  entrada.addEventListener('keydown', verificarEntrada);
  
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
});

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
  if (event.target === modalStats) {
    modalStats.style.display = 'none';
  }
});

// Detener test al cerrar la página
window.addEventListener('beforeunload', detenerTest);