import { recuperaElementoAleatorio } from './utils.js';


// Diccionario bilingüe (inglés-español)
const diccionarioBilingue = {
  0: { 'cat': 'gato', 'dog': 'perro', 'book': 'libro', 'pen': 'bolígrafo', 'house': 'casa', 'car': 'coche', 'tree': 'árbol', 'bird': 'pájaro', 'cup': 'taza', 'door': 'puerta', 'water': 'agua', 'fire': 'fuego', 'earth': 'tierra', 'wind': 'viento', 'sea': 'mar', 'sky': 'cielo', 'mountain': 'montaña', 'river': 'río', 'forest': 'bosque', 'flower': 'flor' },
  1: { 'sun': 'sol', 'bread': 'pan', 'sea': 'mar', 'voice': 'voz', 'salt': 'sal', 'fish': 'pez', 'train': 'tren', 'light': 'luz', 'king': 'rey', 'one': 'uno', 'month': 'mes', 'club': 'club', 'cross': 'cruz', 'thirst': 'sed', 'gas': 'gas', 'end': 'fin', 'two': 'dos', 'three': 'tres', 'good': 'bien' },
  2: { 'clock': 'reloj', 'wall': 'pared', 'health': 'salud', 'hotel': 'hotel', 'channel': 'canal', 'animal': 'animal', 'doctor': 'doctor', 'paper': 'papel', 'sing': 'cantar', 'eat': 'comer', 'blue': 'azul', 'happy': 'feliz', 'actor': 'actor', 'legal': 'legal', 'control': 'control', 'motor': 'motor', 'signal': 'señal', 'natural': 'natural', 'final': 'final', 'ideal': 'ideal' },
  3: { 'bat': 'murciélago', 'telephone': 'teléfono', 'bird': 'pájaro', 'compass': 'brújula', 'fast': 'rápido', 'next': 'próximo', 'proparoxytone': 'esdrújula', 'chemical': 'químico', 'physical': 'físico', 'political': 'político', 'artistic': 'artístico', 'mathematical': 'matemático', 'grammatical': 'gramática', 'technical': 'técnico', 'medical': 'médico', 'plastic': 'plástico', 'musical': 'músico', 'logical': 'lógico', 'economic': 'económico', 'historical': 'histórico' },
  4: { 'tell it to me': 'dígamelo', 'repeat it to him': 'repíteselo', 'tell it to me': 'cuéntamelo', 'return it to me': 'devuélvemelo', 'explain it to him': 'explícaselo', 'deliver it to him': 'entrégaselo', 'bring it to me': 'tráemelo', 'tell it to him': 'díselo', 'show it to me': 'muéstramelo', 'return it to me': 'regrésámelo', 'lend it to me': 'préstamelo', 'confirm it to me': 'confírmamelo', 'remind him of it': 'recuérdaselo', 'take it to him': 'lléváselo', 'send it to him': 'envíáselo', 'understand it for me': 'compréndémelo', 'translate it for me': 'tradúcémelo', 'clarify it for me': 'aclárámelo', 'organize it for me': 'organízámelo', 'solve it for me': 'resuélvémelo' }
};



// Variables compartidas
let gameAPI = null;
let palabraTraduccion = null;
let traduccionCorrecta = null;
let palabraOriginal = null;
let palabraTraducida = null;
let idiomaOrigen = null;
let idiomaDestino = null;


// Exportar función para iniciar test bilingüe
export function iniciarTestBilingue() {
  cambiarPalabraBilingue();
  if (palabraTraduccion) {
    palabraTraduccion.classList.remove('tarjeta__dato--hidden');
  }
}


// Función para ocultar elementos del modo bilingüe
export function ocultarModoBilingue() {
  if (palabraTraduccion) {
    palabraTraduccion.classList.add('tarjeta__dato--hidden');
  }
  if (traduccionCorrecta) {
    traduccionCorrecta.textContent = '?';
    traduccionCorrecta.classList.remove('respuesta--correcta', 'respuesta--incorrecta');
  }
}



// Función para verificar entrada en modo bilingüe
export function verificarEntradaBilingue(event) {
  if (event.key === 'Enter') {
    const entrada = document.getElementById('entrada');
    const palabraTecleada = entrada.value.trim().toLowerCase();


    // Limpieza previa de clases de estado
    entrada.classList.remove('input--ok', 'input--error', 'is-shaking');
    traduccionCorrecta.classList.remove('respuesta--correcta', 'respuesta--incorrecta');


    if (palabraTecleada === palabraTraducida.toLowerCase()) {
      // Correcta
      gameAPI.incrementarCorrectas();


      traduccionCorrecta.textContent = `${palabraTraducida} ✓`;
      traduccionCorrecta.classList.add('respuesta--correcta');
      entrada.classList.add('input--ok');


      setTimeout(() => {
        traduccionCorrecta.classList.remove('respuesta--correcta');
        entrada.classList.remove('input--ok');


        const numPalabrasObjetivo = gameAPI.getNumPalabrasObjetivo();
        const palabrasCorrectas = parseInt(document.getElementById('palabrasCorrectas').textContent);
        if (numPalabrasObjetivo && palabrasCorrectas >= numPalabrasObjetivo) {
          gameAPI.detenerTest();
          gameAPI.mostrarStats();
        } else {
          cambiarPalabraBilingue();
        }
      }, 800);


    } else {
      // Incorrecta
      gameAPI.incrementarFalladas();


      traduccionCorrecta.textContent = `${palabraTraducida} ✗`;
      traduccionCorrecta.classList.add('respuesta--incorrecta');
      entrada.classList.add('input--error', 'is-shaking');


      setTimeout(() => {
        traduccionCorrecta.textContent = '?';
        traduccionCorrecta.classList.remove('respuesta--incorrecta');
        entrada.classList.remove('input--error', 'is-shaking');
      }, 1500);


      entrada.value = '';
    }
  }
}

// Función de inicialización
export function inicializarModoBilingue(api) {
  gameAPI = api;


  const modoBilingueCheckbox = document.getElementById('modoBilingue');
  const opcionesBilingue = document.getElementById('opcionesBilingue');
  idiomaOrigen = document.getElementById('idiomaOrigen');
  idiomaDestino = document.getElementById('idiomaDestino');
  palabraTraduccion = document.getElementById('palabraTraduccion');
  traduccionCorrecta = document.getElementById('traduccionCorrecta');


  if (modoBilingueCheckbox) {
    modoBilingueCheckbox.addEventListener('change', () => {
      const isEnabled = modoBilingueCheckbox.checked;
      if (idiomaOrigen) idiomaOrigen.disabled = !isEnabled;
      if (idiomaDestino) idiomaDestino.disabled = !isEnabled;
      if (opcionesBilingue) {
        opcionesBilingue.classList.toggle('config-container__group--disabled', !isEnabled);
      }
    });
  }


  if (idiomaOrigen && idiomaDestino) {
    idiomaOrigen.addEventListener('change', () => {
      if (idiomaOrigen.value === idiomaDestino.value) {
        idiomaDestino.value = idiomaOrigen.value === 'es' ? 'en' : 'es';
      }
    });
    idiomaDestino.addEventListener('change', () => {
      if (idiomaOrigen.value === idiomaDestino.value) {
        idiomaOrigen.value = idiomaDestino.value === 'es' ? 'en' : 'es';
      }
    });
  }
}

// Función para cambiar la palabra en modo bilingüe
export function cambiarPalabraBilingue(nivelForzado = null) {
  const dificultad = nivelForzado !== null ? nivelForzado : gameAPI.getDificultadActual();
  const palabras = diccionarioBilingue[dificultad];
  const diccionarioAUsar = palabras || diccionarioBilingue[0];
  const pares = Object.entries(diccionarioAUsar);
  const [english, spanish] = recuperaElementoAleatorio(pares);


  const palabraDeMuestra = document.getElementById('palabraDeMuestra');


  if (idiomaOrigen.value === 'en' && idiomaDestino.value === 'es') {
    palabraDeMuestra.textContent = english;
    palabraOriginal = english;
    palabraTraducida = spanish;
  } else {
    palabraDeMuestra.textContent = spanish;
    palabraOriginal = spanish;
    palabraTraducida = english;
  }


  traduccionCorrecta.textContent = '?';
  document.getElementById('entrada').value = '';
}