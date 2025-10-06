import { recuperaElementoAleatorio } from './utils.js';
import { inicializarModoBilingue, iniciarTestBilingue, verificarEntradaBilingue } from './bilingue.js';

// Exponer funciones globalmente de forma inmediata
window.iniciarTestBilingue = iniciarTestBilingue;
window.verificarEntradaBilingue = verificarEntradaBilingue;

// Arrays de palabras por dificultad 
const palabrasDefault = [
  'casa', 'perro', 'gato', 'sol', 'luna', 'agua', 'fuego', 'tierra', 'viento', 'mar',
  'cielo', 'montaña', 'río', 'bosque', 'flor', 'árbol', 'piedra', 'estrella', 'nube', 'lluvia'
];

const palabrasFaciles = ["sol", "pan", "mar", "voz", "sal",
  "flor", "pez", "tren", "luz", "rey",
  "mil", "mes", "club", "cruz", "sed",
  "gas", "fin", "dos", "tres", "bien"]; // Monosílabos

const palabrasMedias = ["reloj", "pared", "salud", "hotel", "canal",
  "animal", "doctor", "papel", "cantar", "comer",
  "azul", "feliz", "actor", "legal", "control",
  "motor", "señal", "natural", "final", "ideal", "mesa", "carro", "lunes", "plaza", "libro",
  "fuerte", "verde", "nube", "cielo", "calle",
  "puerta", "fruta", "piedra", "silla", "camisa",
  "ratón", "zapato", "ventana", "cama", "sólido"]; // Agudas/llanas

const palabrasDificiles = ["murciélago", "teléfono", "pájaro", "brújula", "rápido",
  "próximo", "esdrújula", "químico", "físico", "político",
  "artístico", "matemático", "gramático", "técnico", "médico",
  "plástico", "músico", "lógico", "económico", "histórico"]; // Esdrújulas

const palabrasMuyDificiles = ["dígamelo", "repíteselo", "cuéntamelo", "devuélvemelo", "explícaselo",
  "entrégaselo", "tráemelo", "díselo", "muéstramelo", "regrésamelo",
  "préstamelo", "confírmamelo", "recuérdaselo", "llévaselo", "envíaselo",
  "compréndemelo", "tradúcemelo", "acláramelo", "organízamelo", "resuélvemelo"]; // Sobresdrújulas

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
let dificultadActual = 0; // 0: default, 1: fácil, etc.
let palabrasActuales = palabrasDefault; // Array actual basado en dificultad

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
  // Actualizar palabra inmediatamente al cambiar dificultad
  cambiarPalabra();
}

// Función para iniciar el test
function iniciarTest() {
  tiempoTranscurrido = 0;
  palabrasCorrectas = 0;
  palabrasFalladas = 0;
  pausado = false;
  tiempoSpan.textContent = tiempoTranscurrido;
  palabrasCorrectasSpan.textContent = palabrasCorrectas;
  numPalabrasObjetivo = parseInt(numPalabrasInput.value) || null;
  tiempoMaximo = parseInt(tiempoMaxInput.value) || null;
  
  // Verificar si estamos en modo bilingüe
  const modoBilingueCheckbox = document.getElementById('modoBilingue');
  const estamosEnModoBilingue = modoBilingueCheckbox && modoBilingueCheckbox.checked;
  
  if (estamosEnModoBilingue) {
    try {
      // Usar nuestra función importada en lugar de window.iniciarTestBilingue
      iniciarTestBilingue();
    } catch (error) {
      console.error("Error al iniciar el test bilingüe:", error);
      // Fallback al modo normal
      cambiarPalabra();
    }
  } else {
    // Modo normal: usar la función original
    cambiarPalabra();
  }
  
  entrada.disabled = false;
  entrada.focus();
  btnComienzo.disabled = true;
  btnPausa.disabled = false;
  btnFin.disabled = false;
  btnPausa.textContent = 'Pausar';

  // Iniciar temporizador con setInterval (inspirado en intervalos)
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

// Función para cambiar la palabra de muestra (usa utils.js y dificultad actual)
function cambiarPalabra() {
  palabraActual = recuperaElementoAleatorio(palabrasActuales);
  palabraDeMuestraSpan.textContent = palabraActual;
  entrada.value = '';
}

// Función para verificar la entrada del usuario (evento keydown para Enter)
function verificarEntrada(event) {
  if (event.key === 'Enter') {
    // Verificar si estamos en modo bilingüe
    const modoBilingueCheckbox = document.getElementById('modoBilingue');
    
    if (modoBilingueCheckbox && modoBilingueCheckbox.checked) {
      try {
        // Usar nuestra función importada en lugar de window.verificarEntradaBilingue
        verificarEntradaBilingue(event);
      } catch (error) {
        console.error("Error al verificar entrada bilingüe:", error);
        // Fallback: comportamiento normal
        const palabraTecleada = entrada.value.trim();
        if (palabraTecleada === palabraActual) {
          palabrasCorrectas++;
          palabrasCorrectasSpan.textContent = palabrasCorrectas;
          if (numPalabrasObjetivo && palabrasCorrectas >= numPalabrasObjetivo) {
            detenerTest();
            mostrarStats();
          } else {
            cambiarPalabra();
          }
        } else {
          palabrasFalladas++;
          alert('Palabra incorrecta. Inténtalo de nuevo.');
          entrada.value = '';
        }
      }
    } else {
      // Modo normal: verificación estándar
      const palabraTecleada = entrada.value.trim();
      if (palabraTecleada === palabraActual) {
        palabrasCorrectas++;
        palabrasCorrectasSpan.textContent = palabrasCorrectas;
        if (numPalabrasObjetivo && palabrasCorrectas >= numPalabrasObjetivo) {
          detenerTest();
          mostrarStats();
        } else {
          cambiarPalabra();
        }
      } else {
        palabrasFalladas++;
        alert('Palabra incorrecta. Inténtalo de nuevo.');
        entrada.value = '';
      }
    }
  }
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
  
  // Volver a habilitar el checkbox de modo bilingüe
  const modoBilingueCheckbox = document.getElementById('modoBilingue');
  if (modoBilingueCheckbox) {
    modoBilingueCheckbox.disabled = false;
    
    // También volver a habilitar los selectores de idioma
    const idiomaOrigen = document.getElementById('idiomaOrigen');
    const idiomaDestino = document.getElementById('idiomaDestino');
    if (idiomaOrigen) idiomaOrigen.disabled = false;
    if (idiomaDestino) idiomaDestino.disabled = false;
    
    // Quitar clase de estilo visual deshabilitado
    const opcionesBilingue = document.getElementById('opcionesBilingue');
    if (opcionesBilingue) {
      opcionesBilingue.classList.remove('config-container__group--disabled');
    }
  }
  
  // Ocultar elementos del modo bilingüe si estuviera activo
  const palabraTraduccion = document.getElementById('palabraTraduccion');
  if (palabraTraduccion) {
    palabraTraduccion.classList.add('test-container__info--hidden');
  }
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
  
  // Inicializar modo bilingüe inmediatamente
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
    },
    getNumPalabrasObjetivo: () => numPalabrasObjetivo
  });
  /*
  // Implementación básica del cambio de tema
  const btnTema = document.getElementById('btnTema');
  const darkThemeCSS = document.getElementById('dark-theme');
  
  if (btnTema) {
    btnTema.addEventListener('click', () => {
      darkThemeCSS.disabled = !darkThemeCSS.disabled;
      btnTema.textContent = darkThemeCSS.disabled ? 'Tema Oscuro' : 'Tema Claro';
    });
  }
    */
});

// Listener para teclas numéricas (dificultad dinámica) - Evita entrada en input
document.addEventListener('keydown', (event) => {
  const key = parseInt(event.key);
  if (key >= 0 && key <= 4) {
    event.preventDefault(); // Evita que entre en input
    cambiarDificultad(key);
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
