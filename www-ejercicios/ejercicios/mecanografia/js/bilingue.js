import { recuperaElementoAleatorio } from './utils.js';

// Diccionario bilingüe (inglés-español)
const diccionarioBilingue = {
  // Nivel 0: Default
  0: {
    'cat': 'gato',
    'dog': 'perro',
    'book': 'libro',
    'pen': 'bolígrafo',
    'house': 'casa',
    'car': 'coche',
    'tree': 'árbol',
    'bird': 'pájaro',
    'cup': 'taza',
    'door': 'puerta',
    'water': 'agua',
    'fire': 'fuego',
    'earth': 'tierra',
    'wind': 'viento',
    'sea': 'mar',
    'sky': 'cielo',
    'mountain': 'montaña',
    'river': 'río',
    'forest': 'bosque',
    'flower': 'flor'
  },
  // Nivel 1: Fácil (monosílabos)
  1: {
    'sun': 'sol',
    'bread': 'pan',
    'sea': 'mar',
    'voice': 'voz',
    'salt': 'sal',
    'fish': 'pez',
    'train': 'tren',
    'light': 'luz',
    'king': 'rey',
    'one': 'uno',
    'month': 'mes',
    'club': 'club',
    'cross': 'cruz',
    'thirst': 'sed',
    'gas': 'gas',
    'end': 'fin',
    'two': 'dos',
    'three': 'tres',
    'good': 'bien'
  },
  // Nivel 2: Medio (agudas/llanas)
  2: {
    'clock': 'reloj',
    'wall': 'pared',
    'health': 'salud',
    'hotel': 'hotel',
    'channel': 'canal',
    'animal': 'animal',
    'doctor': 'doctor',
    'paper': 'papel',
    'sing': 'cantar',
    'eat': 'comer',
    'blue': 'azul',
    'happy': 'feliz',
    'actor': 'actor',
    'legal': 'legal',
    'control': 'control',
    'motor': 'motor',
    'signal': 'señal',
    'natural': 'natural',
    'final': 'final',
    'ideal': 'ideal'
  },
  // Nivel 3: Difícil (esdrújulas)
  3: {
    'bat': 'murciélago',
    'telephone': 'teléfono',
    'bird': 'pájaro',
    'compass': 'brújula',
    'fast': 'rápido',
    'next': 'próximo',
    'proparoxytone': 'esdrújula',
    'chemical': 'químico',
    'physical': 'físico',
    'political': 'político',
    'artistic': 'artístico',
    'mathematical': 'matemático',
    'grammatical': 'gramática',
    'technical': 'técnico',
    'medical': 'médico',
    'plastic': 'plástico',
    'musical': 'músico',
    'logical': 'lógico',
    'economic': 'económico',
    'historical': 'histórico'
  },
  // Nivel 4: Muy difícil (sobresdrújulas)
  4: {
    'tell it to me': 'dígamelo',
    'repeat it to him': 'repíteselo',
    'tell it to me': 'cuéntamelo',
    'return it to me': 'devuélvemelo',
    'explain it to him': 'explícaselo',
    'deliver it to him': 'entrégaselo',
    'bring it to me': 'tráemelo',
    'tell it to him': 'díselo',
    'show it to me': 'muéstramelo',
    'return it to me': 'regrésamelo',
    'lend it to me': 'préstamelo',
    'confirm it to me': 'confírmamelo',
    'remind him of it': 'recuérdaselo',
    'take it to him': 'lléváselo',
    'send it to him': 'envíáselo',
    'understand it for me': 'compréndemelo',
    'translate it for me': 'tradúcemelo',
    'clarify it for me': 'acláramelo',
    'organize it for me': 'organízámelo',
    'solve it for me': 'resuélvemelo'
  }
};

// Variables compartidas
let gameAPI = null;
let palabraTraduccion = null;
let traduccionCorrecta = null;
let palabraOriginal = null;
let palabraTraducida = null;
let idiomaOrigen = null;
let idiomaDestino = null;

// Exportar funciones para uso global
export function iniciarTestBilingue() {
  cambiarPalabraBilingue();
}

export function verificarEntradaBilingue(event) {
  if (event.key === 'Enter') {
    const entrada = document.getElementById('entrada');
    const palabraTecleada = entrada.value.trim().toLowerCase();
    
    if (palabraTecleada === palabraTraducida.toLowerCase()) {
      // Correcta
      gameAPI.incrementarCorrectas();
      
      // Mostrar brevemente la respuesta correcta como refuerzo positivo
      traduccionCorrecta.textContent = palabraTraducida + " ✓";
      traduccionCorrecta.style.color = "var(--color-exito)";
      traduccionCorrecta.style.fontWeight = "bold";
      
      // Feedback visual positivo en el input
      entrada.style.borderColor = "var(--color-exito)";
      entrada.style.backgroundColor = "hsla(140, 50%, 45%, 0.1)";
      
      setTimeout(() => {
        // Restaurar estilos
        traduccionCorrecta.style.color = "";
        traduccionCorrecta.style.fontWeight = "";
        entrada.style.borderColor = "";
        entrada.style.backgroundColor = "";
        
        // Pasar a la siguiente palabra después de un breve momento
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
      
      // Mostrar la traducción correcta brevemente como retroalimentación
      traduccionCorrecta.textContent = palabraTraducida + " ✗";
      traduccionCorrecta.style.color = "var(--color-error)";
      traduccionCorrecta.style.fontWeight = "bold";
      
      // Feedback visual adicional en el input
      entrada.style.borderColor = "var(--color-error)";
      entrada.style.backgroundColor = "hsla(0, 70%, 50%, 0.1)";
      
      // Efecto de vibración
      entrada.style.animation = "shake 0.3s";
      
      setTimeout(() => {
        traduccionCorrecta.textContent = "?";
        traduccionCorrecta.style.color = "";
        traduccionCorrecta.style.fontWeight = "";
        entrada.style.borderColor = "";
        entrada.style.backgroundColor = "";
        entrada.style.animation = "";
      }, 1500);
      
      entrada.value = '';
    }
  }
}

// Función de inicialización que será llamada desde script.js
export function inicializarModoBilingue(api) {
  gameAPI = api;
  
  // Crear elementos HTML necesarios inmediatamente
  crearElementosHTML();
  
  // Referencias a los elementos del DOM
  const modoBilingueCheckbox = document.getElementById('modoBilingue');
  const opcionesBilingue = document.getElementById('opcionesBilingue');
  idiomaOrigen = document.getElementById('idiomaOrigen');
  idiomaDestino = document.getElementById('idiomaDestino');
  palabraTraduccion = document.getElementById('palabraTraduccion');
  traduccionCorrecta = document.getElementById('traduccionCorrecta');
  
  // Habilitar/deshabilitar opciones de idioma
  if (modoBilingueCheckbox) {
    modoBilingueCheckbox.addEventListener('change', () => {
      const isEnabled = modoBilingueCheckbox.checked;
      if (idiomaOrigen) idiomaOrigen.disabled = !isEnabled;
      if (idiomaDestino) idiomaDestino.disabled = !isEnabled;
    });
  }
  
  // Evento para cambiar idiomas
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
  
  // Exponer funciones globalmente
  window.iniciarTestBilingue = iniciarTestBilingue;
  window.verificarEntradaBilingue = verificarEntradaBilingue;
  window.cambiarPalabraBilingue = cambiarPalabraBilingue;
}

// Crear elementos necesarios si no existen en el HTML
function crearElementosHTML() {
  // Crear elemento para mostrar traducción
  palabraTraduccion = document.createElement('p');
  palabraTraduccion.id = 'palabraTraduccion';
  palabraTraduccion.className = 'test-container__info test-container__info--hidden';
  palabraTraduccion.innerHTML = 'Traducción: <span id="traduccionCorrecta" class="test-container__span">?</span>';
  
  // Añadir después de la palabra de muestra
  const palabraDeMuestraContainer = document.querySelector('.test-container__info:last-of-type');
  if (palabraDeMuestraContainer) {
    palabraDeMuestraContainer.parentNode.insertBefore(
      palabraTraduccion, 
      palabraDeMuestraContainer.nextSibling
    );
  }
  
  traduccionCorrecta = document.getElementById('traduccionCorrecta');
  
  // Crear selectores de idioma si no existen
  if (!document.getElementById('idiomaOrigen')) {
    const opcionesBilingue = document.getElementById('opcionesBilingue');
    if (opcionesBilingue) {
      const selectGroup = document.createElement('div');
      selectGroup.className = 'config-container__select-group';
      
      // Selector de idioma origen
      idiomaOrigen = document.createElement('select');
      idiomaOrigen.id = 'idiomaOrigen';
      idiomaOrigen.className = 'config-container__select';
      
      const optionEn = document.createElement('option');
      optionEn.value = 'en';
      optionEn.textContent = 'Inglés';
      optionEn.selected = true;
      
      const optionEs = document.createElement('option');
      optionEs.value = 'es';
      optionEs.textContent = 'Español';
      
      idiomaOrigen.appendChild(optionEn);
      idiomaOrigen.appendChild(optionEs);
      
      // Flecha
      const arrow = document.createElement('span');
      arrow.className = 'config-container__arrow';
      arrow.textContent = '→';
      
      // Selector de idioma destino
      idiomaDestino = document.createElement('select');
      idiomaDestino.id = 'idiomaDestino';
      idiomaDestino.className = 'config-container__select';
      
      const optionEn2 = document.createElement('option');
      optionEn2.value = 'en';
      optionEn2.textContent = 'Inglés';
      
      const optionEs2 = document.createElement('option');
      optionEs2.value = 'es';
      optionEs2.textContent = 'Español';
      optionEs2.selected = true;
      
      idiomaDestino.appendChild(optionEn2);
      idiomaDestino.appendChild(optionEs2);
      
      // Añadir todo al grupo
      selectGroup.appendChild(idiomaOrigen);
      selectGroup.appendChild(arrow);
      selectGroup.appendChild(idiomaDestino);
      opcionesBilingue.appendChild(selectGroup);
    }
  }
}

// Función para cambiar la palabra en modo bilingüe
export function cambiarPalabraBilingue(nivelForzado = null) {
  // Usar el nivel forzado si se proporciona, de lo contrario usar el nivel actual del juego
  const dificultad = nivelForzado !== null ? nivelForzado : gameAPI.getDificultadActual();
  const palabras = diccionarioBilingue[dificultad];
  
  // Si no hay diccionario para esta dificultad, usar nivel 0 (default)
  const diccionarioAUsar = palabras || diccionarioBilingue[0];
  
  // Obtener par de palabras aleatorio
  const pares = Object.entries(diccionarioAUsar);
  const [english, spanish] = recuperaElementoAleatorio(pares);
  
  const palabraDeMuestra = document.getElementById('palabraDeMuestra');
  
  // Determinar qué palabra mostrar según dirección de traducción
  if (idiomaOrigen.value === 'en' && idiomaDestino.value === 'es') {
    // Inglés → Español
    palabraDeMuestra.textContent = english;
    palabraOriginal = english;
    palabraTraducida = spanish;
  } else {
    // Español → Inglés
    palabraDeMuestra.textContent = spanish;
    palabraOriginal = spanish;
    palabraTraducida = english;
  }
  
  // Ocultar la traducción correcta - NO mostrarla de antemano
  traduccionCorrecta.textContent = "?";
  
  // Mostrar sección de traducción pero sin revelar la respuesta
  palabraTraduccion.classList.remove('test-container__info--hidden');
  
  // Limpiar entrada
  document.getElementById('entrada').value = '';
}