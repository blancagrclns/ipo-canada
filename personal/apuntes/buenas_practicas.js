/* ==========================================================================
   1. ESPACIO DE NOMBRES GLOBAL → EVITA CONTAMINACIÓN DEL OBJETO WINDOW (Introducción.pdf)
   ==========================================================================
   - APP es un objeto que encapsula todo el estado y lógica de la aplicación.
   - Ventajas:
       * Evita colisiones con otras librerías o scripts.
       * Centraliza el estado → más fácil de depurar y mantener.
       * Mejora la legibilidad: APP.temporizador es más claro que "temp".
   - Se usa const porque el objeto no se reasigna (aunque sus propiedades sí cambian).
*/
const APP = {
  temporizador: null, // ID devuelto por setInterval (Intervalos.pdf). null = inactivo.
  contador: 0, // Estado del contador manual (número entero).
  nodos: {}, // Caché de referencias DOM (mejora rendimiento).

  /* ==========================================================================
     ESTADO DE LA WEB AUDIO API (webAudioAPI.pdf)
     ==========================================================================
     - audioCtx: Contexto de audio compartido por toda la aplicación
     - Se crea una sola vez al inicializar para evitar múltiples contextos
     - El contexto comienza en estado 'suspended' (buena práctica UX)
     - Debe activarse mediante interacción del usuario (ej. clic en botón)
  */
  audioCtx: null, // AudioContext - gestiona el grafo de nodos de audio
};

/* ==========================================================================
   2. CACHÉ DE NODOS DEL DOM → MEJORA RENDIMIENTO Y LEGIBILIDAD (README.md, Introducción.pdf)
   ==========================================================================
   
   REGLA FUNDAMENTAL: ❌ NO USAR `id` PARA SELECCIONAR ELEMENTOS → ✅ USAR `data-*`
   ──────────────────────────────────────────────────────────────────────────────
   
   ❌ MAL - Usando getElementById():
   
   // HTML:
   <button id="btnIniciar">Iniciar</button>
   <dialog id="modal-config">...</dialog>
   
   // JavaScript:
   APP.nodos.btnIniciar = document.getElementById("btnIniciar");
   APP.nodos.modal = document.getElementById("modal-config");
   
   Problemas:
   - Los `id` deben ser únicos en TODO el documento (HTML5 estricto)
   - No es semántico: `id` no indica la función del elemento
   - Acoplamiento fuerte: cambiar el `id` rompe el JavaScript
   - Inconsistencia: mezclar `id` con selectores de clase/atributo
   - No reutilizable: no puedes tener múltiples elementos con el mismo `id`
   
   ✅ BIEN - Usando atributos data-* como selectores:
   
   // HTML:
   <button data-accion="iniciar">Iniciar</button>
   <dialog data-modal="configuracion">...</dialog>
   
   // JavaScript:
   APP.nodos.btnIniciar = document.querySelector('[data-accion="iniciar"]');
   APP.nodos.modal = document.querySelector('[data-modal="configuracion"]');
   
   Ventajas:
   - Semántico: `data-accion` describe la función, `data-modal` el tipo
   - Consistente: todo el código usa el mismo patrón (querySelector + data-*)
   - Desacoplado: CSS usa clases (.btn), JS usa data-* ([data-accion])
   - Reutilizable: puedes tener múltiples botones con data-accion="eliminar"
   - Flexible: fácil seleccionar grupos → querySelectorAll('[data-accion]')
   - Principio de separación de responsabilidades
   
   EXCEPCIONES donde `id` SÍ es aceptable:
   - Elementos <link> y <script> → document.getElementById("dark-theme")
   - Asociación <label for="input-id"> → requiere `id` en el input
   - Fragmentos de URL → #seccion-contacto (navegación interna)
   - ARIA → aria-labelledby="titulo-id" (accesibilidad)
   
   PATRÓN RECOMENDADO para atributos data-*:
   - data-accion: para botones y elementos interactivos
   - data-modal: para modales y diálogos
   - data-control: para inputs y controles de formulario
   - data-output: para elementos que muestran valores calculados
   - data-toast: para mensajes emergentes
   - data-estado: para indicadores de estado visual
   
   ──────────────────────────────────────────────────────────────────────────────
   
   - Se usan selectores basados en atributos data-* (NUNCA id ni clases).
   - Ventajas:
       * Desacopla la lógica de JavaScript del diseño visual (CSS usa clases, JS usa data-*).
       * Permite múltiples elementos con el mismo "rol" sin violar unicidad de id.
       * Más semántico: data-accion="iniciar" es más claro que class="btn-start".
   - Se ejecuta una sola vez al iniciar → evita búsquedas repetidas en el DOM.
*/
function cachearNodos() {
  APP.nodos = {
    // Temporizador
    tiempoSpan: document.querySelector('[data-tiempo]'),
    /* ✅ CORRECTO: usar data-accion para acciones */
    btnIniciar: document.querySelector('[data-accion="iniciar"]'),
    btnDetener: document.querySelector('[data-accion="detener"]'),

    // Contador manual
    cuentaSpan: document.querySelector('[data-cuenta]'),
    btnIncrementar: document.querySelector('[data-accion="incrementar"]'),

    // Drag & Drop
    dropZone: document.querySelector('[data-drop]'),
    dragItem: document.querySelector('[data-drag]'),
    
    /* ==========================================================================
       NODOS PARA WEB AUDIO API (webAudioAPI.pdf)
       ==========================================================================
       - Botones de reproducción para cada demo de audio
       - Elementos para mostrar el estado de reproducción
       - Patrón data-audio-accion para identificar acciones de audio
       - Patrón data-audio-estado para actualizar mensajes de estado
    */
    // Oscilador simple
    btnAudioSimple: document.querySelector('[data-audio-accion="reproducir-simple"]'),
    estadoAudioSimple: document.querySelector('[data-audio-estado="simple"]'),
    
    // Múltiples osciladores
    btnAudioMulti: document.querySelector('[data-audio-accion="reproducir-multi"]'),
    estadoAudioMulti: document.querySelector('[data-audio-estado="multi"]'),
    
    // Acordes (setValueAtTime)
    btnAudioAcordes: document.querySelector('[data-audio-accion="reproducir-acordes"]'),
    estadoAudioAcordes: document.querySelector('[data-audio-estado="acordes"]'),
    
    // Rampas (linear/exponential)
    btnAudioRampas: document.querySelector('[data-audio-accion="reproducir-rampas"]'),
    estadoAudioRampas: document.querySelector('[data-audio-estado="rampas"]'),
    
    // GainNode
    btnAudioGain: document.querySelector('[data-audio-accion="reproducir-gain"]'),
    estadoAudioGain: document.querySelector('[data-audio-estado="gain"]'),
  };
}

/* ==========================================================================
   3. GESTIÓN DEL TEMPORIZADOR → setInterval / clearInterval (Intervalos.pdf)
   ==========================================================================
   - setInterval(callback, ms) → ejecuta callback cada 'ms' milisegundos.
   - Devuelve un ID entero positivo (identificador del intervalo).
   - clearInterval(ID) → cancela la ejecución repetida.
   - Buena práctica: comprobar si ya hay un temporizador activo antes de crear otro.
   - Esto evita fugas de memoria y comportamientos inesperados (ej. doble clic).
*/
function iniciarTemporizador() {
  // Guard clause: si ya hay un intervalo activo, no hacer nada.
  if (APP.temporizador !== null) {
    console.warn(
      "⚠️ El temporizador ya está en ejecución. Ignorando nuevo intento."
    );
    return;
  }

  console.log("✅ Temporizador iniciado. Intervalo de 1 segundo.");
  APP.temporizador = setInterval(() => {
    // Lee el valor actual del <span data-tiempo>, lo convierte a número y lo incrementa.
    const tiempoActual = parseInt(APP.nodos.tiempoSpan.textContent, 10) || 0;
    APP.nodos.tiempoSpan.textContent = tiempoActual + 1;
  }, 1000); // 1000 ms = 1 segundo
}

function detenerTemporizador() {
  if (APP.temporizador === null) {
    console.warn("⚠️ No hay temporizador activo para detener.");
    return;
  }

  clearInterval(APP.temporizador);
  APP.temporizador = null; // Reinicia el estado → evita fugas lógicas.
  console.log("⏹️ Temporizador detenido.");
}

/* ==========================================================================
   4. CONTADOR MANUAL → SEPARACIÓN CLARA ENTRE LÓGICA Y PRESENTACIÓN (Introducción.pdf)
   ==========================================================================
   - El estado (APP.contador) se mantiene en memoria.
   - Solo se actualiza el DOM mediante textContent (nunca innerHTML ni style).
   - Esto evita XSS y mantiene la separación entre capas.
*/
function incrementarContador() {
  APP.contador += 1;
  APP.nodos.cuentaSpan.textContent = APP.contador;
  console.log(`🔢 Contador incrementado: ${APP.contador}`);
}

/* ==========================================================================
   5. DRAG & DROP NATIVO → API ESTÁNDAR DEL NAVEGADOR (Introducción.pdf, Web APIs)
   ==========================================================================
   - No se usan librerías externas → código ligero y estándar.
   - Eventos clave:
       * dragstart / dragend → en el elemento arrastrable (dragItem).
       * dragover / dragleave / drop → en la zona de destino (dropZone).
   - preventDefault() en dragover y drop → obligatorio para permitir el drop.
   - aria-live="polite" → anuncia cambios a lectores de pantalla (accesibilidad).
   - draggable = false → permite soltar solo una vez (comportamiento común en UIs).
*/
function activarDragDrop() {
  const { dropZone, dragItem } = APP.nodos;

  // Al comenzar a arrastrar
  dragItem.addEventListener("dragstart", (e) => {
    // Opcional: pasa datos (aunque no se usen aquí)
    e.dataTransfer.setData("text/plain", "drag-item");
    dragItem.classList.add("drag-item--active");
    dragItem.setAttribute("aria-grabbed", "true");
    console.log("🖱️ Arrastre iniciado.");
  });

  // Al terminar el arrastre (soltar o cancelar)
  dragItem.addEventListener("dragend", () => {
    dragItem.classList.remove("drag-item--active");
    dragItem.setAttribute("aria-grabbed", "false");
  });

  // Permitir soltar en la zona → ¡preventDefault() es obligatorio!
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("drop-zone--active");
  });

  // Al salir del área de drop
  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drop-zone--active");
  });

  // Al soltar el elemento
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drop-zone--active");
    dropZone.textContent = "✅ ¡Elemento soltado correctamente!";

    // Accesibilidad: anuncia el cambio a lectores de pantalla
    dropZone.setAttribute("aria-live", "polite");

    // Opcional: desactiva futuros arrastres
    dragItem.draggable = false;
    dragItem.style.opacity = "0.4";
    dragItem.style.pointerEvents = "none";

    console.log("📦 Elemento soltado. Interacción completada.");
  });
}

/* ==========================================================================
   6. WEB AUDIO API - INICIALIZACIÓN DEL CONTEXTO (webAudioAPI.pdf)
   ==========================================================================
   PRINCIPIOS FUNDAMENTALES:
   
   1. AudioContext (webAudioAPI.pdf - Contexto de audio):
      - Objeto central que gestiona un grafo de nodos de audio
      - Hereda de BaseAudioContext que proporciona:
        * currentTime: temporizador en segundos desde la creación del contexto
        * destination: nodo de salida que envía el audio a los altavoces
        * state: estado del contexto (suspended, running, closed)
   
   2. Buena práctica UX (webAudioAPI.pdf - Contexto de audio: Ejemplo):
      - El contexto comienza en estado 'suspended' por defecto
      - Esto evita reproducción automática no deseada
      - El usuario DEBE interactuar (ej. clic) para iniciar la reproducción
      - Esta función se llama desde los listeners de botones de audio
   
   3. Patrón Singleton:
      - Solo se crea un contexto si no existe (APP.audioCtx === null)
      - Reutilizar el mismo contexto es más eficiente
      - Evita problemas de sincronización entre múltiples contextos
*/
function inicializarAudioContext() {
  // Guard clause: si ya existe el contexto, no crear otro
  if (APP.audioCtx !== null) {
    console.log("ℹ️ AudioContext ya inicializado.");
    return;
  }

  /* 
     Creación del AudioContext (README.md - método recomendado):
     - new AudioContext() es el constructor estándar
     - También existe new window.AudioContext() para compatibilidad
     - El contexto se crea en estado 'suspended'
  */
  APP.audioCtx = new AudioContext();
  console.log("🎵 AudioContext inicializado. Estado:", APP.audioCtx.state);
  console.log("🎵 Frecuencia de muestreo:", APP.audioCtx.sampleRate, "Hz");
}

/* ==========================================================================
   7. WEB AUDIO API - OSCILADOR SIMPLE (webAudioAPI.pdf)
   ==========================================================================
   DEMOSTRACIÓN: Reproducción básica de un tono sinusoidal
   
   CONCEPTOS CLAVE:
   
   1. OscillatorNode (webAudioAPI.pdf - Osciladores):
      - Nodo fuente que genera una señal periódica
      - Hereda de AudioScheduledNode → permite start() y stop()
      - Propiedades principales:
        * type: forma de onda (sine, square, sawtooth, triangle)
        * frequency: frecuencia en Hercios (Hz) - número de ciclos por segundo
        * detune: reajuste fino de la frecuencia en cents (centésimas de semitono)
   
   2. Conexión de nodos (webAudioAPI.pdf - diagrama del grafo):
      - Estructura: OscillatorNode → AudioContext.destination
      - El método connect() establece la conexión entre nodos
      - destination es el nodo final que envía el audio a los altavoces
   
   3. Control temporal (webAudioAPI.pdf - AudioScheduledNode):
      - start(tiempo): inicia la reproducción en el momento especificado
      - stop(tiempo): detiene la reproducción en el momento especificado
      - Los tiempos se basan en AudioContext.currentTime (temporizador del contexto)
      - Una vez detenido un oscilador, no puede reanudarse (hay que crear uno nuevo)
   
   4. Frecuencia musical:
      - 220 Hz = La3 (A3 en notación anglosajona)
      - Frecuencia base del sistema temperado: La4 = 440 Hz (por defecto en OscillatorNode)
*/
function reproducirAudioSimple() {
  // 1. Asegurar que el AudioContext está inicializado
  inicializarAudioContext();

  // 2. Actualizar estado visual en la UI
  APP.nodos.estadoAudioSimple.textContent = "Estado: Reproduciendo...";
  console.log("🎵 Iniciando reproducción de oscilador simple...");

  /* 
     3. Crear el nodo fuente (README.md - Creación mediante constructor):
     - OscillatorNode(contexto, opciones) es el método recomendado
     - Opciones:
       * type: "sine" (onda sinusoidal, sonido puro sin armónicos)
       * frequency: 220 (Hz, La3)
  */
  const source = new OscillatorNode(APP.audioCtx, {
    type: "sine", // Forma de onda sinusoidal (la más simple)
    frequency: 220, // La3 (220 Hz)
  });

  /* 
     4. Conectar el oscilador al destino (altavoces):
     - Grafo resultante: source → audioCtx.destination
     - Sin esta conexión, no se escucharía nada
  */
  source.connect(APP.audioCtx.destination);

  /* 
     5. Programar inicio y fin de la reproducción:
     - currentTime: tiempo actual del contexto en segundos
     - inicio: momento actual (reproducción inmediata)
     - stop: inicio + 4 segundos
     - IMPORTANTE: start() y stop() pueden llamarse antes de que comience la reproducción
       porque se agendan en el motor de audio
  */
  const inicio = APP.audioCtx.currentTime;
  const duracion = 4; // segundos

  source.start(inicio);
  source.stop(inicio + duracion);

  console.log(
    `🎵 Oscilador programado: inicio=${inicio.toFixed(2)}s, fin=${(
      inicio + duracion
    ).toFixed(2)}s`
  );

  /* 
     6. Actualizar UI cuando termine la reproducción:
     - setTimeout se usa para sincronizar la UI con el final del audio
     - duracion * 1000: convertir segundos a milisegundos
     - +100ms de margen para asegurar que el audio ha terminado
  */
  setTimeout(() => {
    APP.nodos.estadoAudioSimple.textContent = "Estado: Detenido";
    console.log("🎵 Reproducción simple completada.");
  }, duracion * 1000 + 100);
}

/* ==========================================================================
   8. WEB AUDIO API - MÚLTIPLES OSCILADORES (webAudioAPI.pdf)
   ==========================================================================
   DEMOSTRACIÓN: Reproducción simultánea de varios osciladores
   
   CONCEPTOS CLAVE:
   
   1. Múltiples nodos fuente:
      - Un contexto puede tener n > 0 nodos fuente (webAudioAPI.pdf - diagrama)
      - Cada oscilador es independiente (diferentes formas de onda, frecuencias)
      - Todos pueden conectarse al mismo destino → mezcla automática
   
   2. Formas de onda (webAudioAPI.pdf - Osciladores):
      - sine: onda sinusoidal, sonido puro, suave
      - triangle: onda triangular, timbre más rico que sine
      - square: onda cuadrada, timbre brillante y "digital"
      - sawtooth: onda de diente de sierra, timbre completo y "áspero"
   
   3. Sincronización temporal:
      - Los osciladores pueden iniciarse en momentos diferentes
      - currentTime como referencia común para todos
      - Permite crear secuencias y armonías complejas
   
   4. Batimento (beat):
      - Cuando dos frecuencias cercanas suenan juntas (220 Hz y 210 Hz)
      - Se produce un efecto de "pulsación" o variación de volumen
      - Frecuencia del batimento = |f1 - f2| = 10 Hz (10 pulsaciones/segundo)
*/
function reproducirAudioMulti() {
  // 1. Inicializar contexto
  inicializarAudioContext();

  // 2. Actualizar UI
  APP.nodos.estadoAudioMulti.textContent = "Estado: Reproduciendo...";
  console.log("🎵 Iniciando reproducción de múltiples osciladores...");

  /* 
     3. Crear primer oscilador (sinusoidal):
     - Frecuencia: 220 Hz (La3)
     - Forma de onda: sinusoidal (tono puro)
  */
  const oscilador01 = new OscillatorNode(APP.audioCtx, {
    type: "sine",
    frequency: 220,
  });

  /* 
     4. Crear segundo oscilador (triangular):
     - Frecuencia: 210 Hz (ligeramente más grave que La3)
     - Forma de onda: triangular (timbre más rico)
     - La diferencia de 10 Hz producirá un efecto de batimento
  */
  const oscilador02 = new OscillatorNode(APP.audioCtx, {
    type: "triangle",
    frequency: 210,
  });

  /* 
     5. Conectar ambos osciladores al destino:
     - Grafo resultante: 
       oscilador01 ↘
                     → audioCtx.destination
       oscilador02 ↗
     - El motor de audio mezcla automáticamente ambas señales
  */
  oscilador01.connect(APP.audioCtx.destination);
  oscilador02.connect(APP.audioCtx.destination);

  /* 
     6. Programar tiempos de reproducción:
     - now: tiempo actual de referencia
     - oscilador01: comienza inmediatamente, dura 4 segundos
     - oscilador02: comienza 1 segundo después, dura 3 segundos
     - Resultado: 1s solo osc01, 3s ambos, 0s solo no hay nada
  */
  const now = APP.audioCtx.currentTime;

  const inicioOscilador01 = now;
  const inicioOscilador02 = now + 1; // Retraso de 1 segundo
  const duracionOscilador01 = 4;
  const duracionOscilador02 = 3;

  // Iniciar oscilador 1
  oscilador01.start(inicioOscilador01);
  oscilador01.stop(inicioOscilador01 + duracionOscilador01);

  // Iniciar oscilador 2 (1 segundo después)
  oscilador02.start(inicioOscilador02);
  oscilador02.stop(inicioOscilador02 + duracionOscilador02);

  console.log(
    `🎵 Oscilador 1: ${inicioOscilador01.toFixed(2)}s → ${(
      inicioOscilador01 + duracionOscilador01
    ).toFixed(2)}s`
  );
  console.log(
    `🎵 Oscilador 2: ${inicioOscilador02.toFixed(2)}s → ${(
      inicioOscilador02 + duracionOscilador02
    ).toFixed(2)}s`
  );

  /* 
     7. Actualizar UI al finalizar:
     - Usar el tiempo máximo (oscilador que termina último)
  */
  const tiempoMaximo = Math.max(
    duracionOscilador01,
    inicioOscilador02 - inicioOscilador01 + duracionOscilador02
  );

  setTimeout(() => {
    APP.nodos.estadoAudioMulti.textContent = "Estado: Detenido";
    console.log("🎵 Reproducción múltiple completada.");
  }, tiempoMaximo * 1000 + 100);
}

/* ==========================================================================
   9. WEB AUDIO API - AudioParam y setValueAtTime (webAudioAPI.pdf)
   ==========================================================================
   DEMOSTRACIÓN: Cambios instantáneos de parámetros de audio
   
   CONCEPTOS CLAVE:
   
   1. AudioParam (webAudioAPI.pdf - Parámetros de audio):
      - Interfaz para controlar y automatizar parámetros de nodos
      - Propiedades como frequency y detune son objetos AudioParam
      - Permite programar cambios de valor en el tiempo
   
   2. setValueAtTime(valor, tiempo):
      - Programa un cambio INSTANTÁNEO en un momento específico
      - El cambio ocurre exactamente en el tiempo especificado
      - Útil para notas musicales, cambios de volumen discretos, etc.
   
   3. Orden de ejecución:
      - Los cambios se agendan en orden CRONOLÓGICO, no de código
      - Ejemplo: setValueAtTime(440, 2) se ejecutará después de setValueAtTime(330, 1)
        aunque aparezca antes en el código
   
   4. Frecuencias musicales (escala temperada):
      - Do4 = 261.63 Hz (C4, Do central del piano)
      - Mi4 = 329.63 Hz (E4, tercera mayor de Do)
      - Sol4 = 392.00 Hz (G4, quinta justa de Do)
      - Do5 = 523.25 Hz (C5, octava de Do4)
      - Estas notas forman el acorde de Do Mayor (C Major)
*/
function reproducirAudioAcordes() {
  // 1. Inicializar contexto
  inicializarAudioContext();

  // 2. Actualizar UI
  APP.nodos.estadoAudioAcordes.textContent = "Estado: Reproduciendo...";
  console.log("🎵 Iniciando reproducción de acorde (setValueAtTime)...");

  /* 
     3. Crear oscilador SIN especificar frecuencia inicial:
     - La frecuencia por defecto es 440 Hz (La4)
     - Se sobrescribirá inmediatamente con setValueAtTime
  */
  const source = new OscillatorNode(APP.audioCtx);
  source.connect(APP.audioCtx.destination);

  /* 
     4. Definir frecuencias del acorde Do Mayor:
     - Valores precisos según el sistema temperado igual
     - Relaciones: Do4 < Mi4 < Sol4 < Do5 (ascendente)
  */
  const do4 = 261.63; // Do central (C4)
  const mi4 = 329.63; // Mi (E4) - tercera mayor
  const sol4 = 392.0; // Sol (G4) - quinta justa
  const do5 = 523.25; // Do alto (C5) - octava

  // Duración de cada nota
  const duracionNota = 1.5; // segundos

  /* 
     5. Programar cambios de frecuencia (setValueAtTime):
     - Se usa una variable 'tiempo' acumulativa
     - Cada setValueAtTime programa un cambio instantáneo
     - Las notas suenan de forma escalonada (no hay transición gradual)
  */
  let tiempo = APP.audioCtx.currentTime;

  // Nota 1: Do4
  source.frequency.setValueAtTime(do4, tiempo);
  console.log(`🎵 ${tiempo.toFixed(2)}s: Do4 (${do4} Hz)`);

  // Nota 2: Mi4 (1.5s después)
  tiempo += duracionNota;
  source.frequency.setValueAtTime(mi4, tiempo);
  console.log(`🎵 ${tiempo.toFixed(2)}s: Mi4 (${mi4} Hz)`);

  // Nota 3: Sol4 (1.5s después)
  tiempo += duracionNota;
  source.frequency.setValueAtTime(sol4, tiempo);
  console.log(`🎵 ${tiempo.toFixed(2)}s: Sol4 (${sol4} Hz)`);

  // Nota 4: Do5 (1.5s después)
  tiempo += duracionNota;
  source.frequency.setValueAtTime(do5, tiempo);
  console.log(`🎵 ${tiempo.toFixed(2)}s: Do5 (${do5} Hz)`);

  /* 
     6. Iniciar y detener el oscilador:
     - start() sin argumentos = inicio inmediato
     - stop() programado al final de la última nota
  */
  source.start();
  tiempo += duracionNota; // Tiempo total = 4 × 1.5s = 6s
  source.stop(tiempo);

  console.log(
    `🎵 Oscilador detenido en ${tiempo.toFixed(2)}s (duración total: ${(
      tiempo - APP.audioCtx.currentTime
    ).toFixed(2)}s)`
  );

  // 7. Actualizar UI
  const duracionTotal = tiempo - APP.audioCtx.currentTime;
  setTimeout(() => {
    APP.nodos.estadoAudioAcordes.textContent = "Estado: Detenido";
    console.log("🎵 Reproducción de acorde completada.");
  }, duracionTotal * 1000 + 100);
}

/* ==========================================================================
   10. WEB AUDIO API - RAMPAS (linear/exponential) (webAudioAPI.pdf)
   ==========================================================================
   DEMOSTRACIÓN: Cambios progresivos de parámetros de audio
   
   CONCEPTOS CLAVE:
   
   1. Rampas vs. Cambios instantáneos:
      - setValueAtTime: cambio inmediato (escalón)
      - linearRampToValueAtTime: cambio gradual lineal (recta)
      - exponentialRampToValueAtTime: cambio gradual exponencial (curva)
   
   2. linearRampToValueAtTime(valor, tiempoFinal):
      - Transición LINEAL desde el valor actual hasta 'valor'
      - La transición termina en 'tiempoFinal'
      - Útil para: cambios de volumen, pitch bends lineales
      - Perceptualmente: cambio constante y predecible
   
   3. exponentialRampToValueAtTime(valor, tiempoFinal):
      - Transición EXPONENCIAL desde el valor actual hasta 'valor'
      - La transición termina en 'tiempoFinal'
      - Útil para: cambios de frecuencia (pitch), filtros
      - Perceptualmente: más natural para frecuencias (oído humano es logarítmico)
      - IMPORTANTE: el valor NO puede ser 0 (matemáticamente indefinido)
   
   4. Punto de inicio de rampas (CRÍTICO):
      - Las rampas necesitan un valor inicial explícito
      - Debe fijarse con setValueAtTime() ANTES de la rampa
      - Sin punto de inicio, el comportamiento es indefinido
      - Patrón típico:
        a) setValueAtTime(valorInicial, tiempo1)  ← fija inicio
        b) tiempo2 = tiempo1 + duracion
        c) linearRamp o exponentialRamp(valorFinal, tiempo2)
   
   5. Secuencia de esta demo:
      - Do4 (estático 2s) → transición exponencial (1.5s) → Mi4 (estático 2s) 
        → transición lineal (1.5s) → Sol4 (estático 2s)
      - Total: 9 segundos
*/
function reproducirAudioRampas() {
  // 1. Inicializar contexto
  inicializarAudioContext();

  // 2. Actualizar UI
  APP.nodos.estadoAudioRampas.textContent = "Estado: Reproduciendo...";
  console.log("🎵 Iniciando reproducción con rampas (linear/exponential)...");

  // 3. Crear oscilador
  const source = new OscillatorNode(APP.audioCtx);
  source.connect(APP.audioCtx.destination);

  // 4. Definir frecuencias
  const do4 = 261.63; // Do central
  const mi4 = 329.63; // Mi (tercera mayor)
  const sol4 = 392.0; // Sol (quinta justa)

  // 5. Definir duraciones de cada sección
  const duracionExponential = 1.5; // Duración de la rampa exponencial
  const duracionEstatica = 2; // Duración de cada nota estática
  const duracionLinear = 1.5; // Duración de la rampa lineal

  /* 
     6. Programar secuencia de cambios:
     
     SECCIÓN 1: Do4 estático (2 segundos)
  */
  let tiempo = APP.audioCtx.currentTime;
  source.frequency.setValueAtTime(do4, tiempo);
  console.log(`🎵 ${tiempo.toFixed(2)}s: Do4 estático (${do4} Hz)`);

  /* 
     SECCIÓN 2: Transición exponencial Do4 → Mi4 (1.5 segundos)
     - Primero: fijar punto de inicio con setValueAtTime
     - Luego: programar rampa exponencial
  */
  tiempo += duracionEstatica;
  // CRÍTICO: fijar valor inicial para la rampa (sin esto, comportamiento indefinido)
  source.frequency.setValueAtTime(do4, tiempo);
  console.log(`🎵 ${tiempo.toFixed(2)}s: Inicio rampa exponencial desde Do4`);

  tiempo += duracionExponential;
  source.frequency.exponentialRampToValueAtTime(mi4, tiempo);
  console.log(
    `🎵 ${tiempo.toFixed(2)}s: Fin rampa exponencial → Mi4 (${mi4} Hz)`
  );

  /* 
     SECCIÓN 3: Mi4 estático (2 segundos)
     - Fija el valor para mantener Mi4 antes de la siguiente rampa
  */
  tiempo += duracionEstatica;
  source.frequency.setValueAtTime(mi4, tiempo);
  console.log(`🎵 ${tiempo.toFixed(2)}s: Mi4 estático (${mi4} Hz)`);

  /* 
     SECCIÓN 4: Transición lineal Mi4 → Sol4 (1.5 segundos)
     - Primero: fijar punto de inicio (ya está en Mi4 pero es buena práctica explicitarlo)
     - Luego: programar rampa lineal
  */
  tiempo += duracionLinear;
  source.frequency.linearRampToValueAtTime(sol4, tiempo);
  console.log(`🎵 ${tiempo.toFixed(2)}s: Fin rampa lineal → Sol4 (${sol4} Hz)`);

  /* 
     SECCIÓN 5: Sol4 estático (2 segundos)
  */
  tiempo += duracionEstatica;
  console.log(`🎵 ${tiempo.toFixed(2)}s: Fin de la secuencia (Sol4 estático)`);

  // 7. Iniciar y detener oscilador
  source.start();
  source.stop(tiempo);

  // 8. Actualizar UI
  const duracionTotal = tiempo - APP.audioCtx.currentTime;
  setTimeout(() => {
    APP.nodos.estadoAudioRampas.textContent = "Estado: Detenido";
    console.log("🎵 Reproducción con rampas completada.");
  }, duracionTotal * 1000 + 100);
}

/* ==========================================================================
   11. WEB AUDIO API - GainNode (Control de Volumen) (webAudioAPI.pdf)
   ==========================================================================
   DEMOSTRACIÓN: Uso de nodos intermedios para modificar el sonido
   
   CONCEPTOS CLAVE:
   
   1. Nodos intermedios (webAudioAPI.pdf - Nodos intermedios: Interfaces):
      - Se sitúan entre los nodos fuente y el destino
      - Modifican la señal de audio sin destruirla
      - Tipos: GainNode (volumen), BiquadFilterNode (filtros), DelayNode (eco), etc.
      - Pueden encadenarse: Source → Gain → Filter → Destination
   
   2. GainNode (webAudioAPI.pdf - Nodos intermedios: GainNode):
      - Controla el volumen (ganancia) de la señal
      - Propiedad principal: gain (objeto AudioParam)
      - Valores de gain:
        * gain = 1.0: sin cambios (valor por defecto)
        * gain > 1.0: amplifica el sonido (puede causar distorsión/clipping)
        * gain < 1.0: atenúa el sonido
        * gain = 0.0: silencio total
   
   3. Estructura del grafo con GainNode:
      - OscillatorNode → GainNode → AudioContext.destination
      - El oscilador genera la señal
      - El GainNode ajusta el volumen
      - El destino envía a los altavoces
   
   4. Buena práctica (webAudioAPI.pdf - ejemplo de GainNode):
      - Comenzar con un valor muy bajo (ej. 0.01)
      - Subir gradualmente con rampas
      - NO llegar a gain = 1.0 para evitar saturación/clipping
      - Valor típico máximo: 0.7 - 0.9
   
   5. Fade-in (aparición gradual):
      - Técnica común para evitar "clicks" al inicio
      - Patrón: setValueAtTime(0.01, inicio) + linearRamp(0.8, fin)
      - Perceptualmente más agradable que inicio abrupto
*/
function reproducirAudioGain() {
  // 1. Inicializar contexto
  inicializarAudioContext();

  // 2. Actualizar UI
  APP.nodos.estadoAudioGain.textContent = "Estado: Reproduciendo...";
  console.log("🎵 Iniciando reproducción con GainNode (fade-in)...");

  /* 
     3. Crear el nodo fuente (oscilador):
     - Frecuencia: 440 Hz (La4, frecuencia estándar)
     - Tipo: sine (onda sinusoidal)
  */
  const source = new OscillatorNode(APP.audioCtx, {
    type: "sine",
    frequency: 440,
  });

  /* 
     4. Crear el GainNode (nodo intermedio):
     - Constructor: new GainNode(contexto, opciones)
     - Opción gain: valor inicial del volumen
     - Comenzamos con 0.01 (casi silencio) para hacer fade-in
  */
  const gainNode = new GainNode(APP.audioCtx, {
    gain: 0.01, // Valor inicial muy bajo
  });

  /* 
     5. Conectar el grafo de nodos:
     - source → gainNode → destination
     - La señal pasa por el GainNode antes de llegar a los altavoces
     - IMPORTANTE: el orden de conexión importa
  */
  source.connect(gainNode); // Oscilador a Gain
  gainNode.connect(APP.audioCtx.destination); // Gain a altavoces

  console.log("🎵 Grafo: OscillatorNode → GainNode → Destination");

  /* 
     6. Programar fade-in (incremento progresivo del volumen):
     - Inicio: gain = 0.01 (casi inaudible)
     - Fin: gain = 0.8 (volumen cómodo, evitando saturación)
     - Duración del fade-in: 3 segundos
     - Método: linearRampToValueAtTime (cambio gradual y constante)
  */
  const now = APP.audioCtx.currentTime;
  const duracionFadeIn = 3; // segundos
  const duracionTotal = 5; // segundos (incluyendo 2s de volumen constante)

  // Fijar punto de inicio del fade-in
  gainNode.gain.setValueAtTime(0.01, now);
  console.log(`🎵 ${now.toFixed(2)}s: Gain inicial = 0.01 (casi silencio)`);

  // Programar rampa lineal de volumen
  gainNode.gain.linearRampToValueAtTime(0.8, now + duracionFadeIn);
  console.log(
    `🎵 ${(now + duracionFadeIn).toFixed(
      2
    )}s: Gain final = 0.8 (volumen cómodo)`
  );

  /* 
     7. Iniciar y detener el oscilador:
     - start(): comienza inmediatamente
     - stop(): se detiene después de 5 segundos (3s fade-in + 2s constante)
  */
  source.start(now);
  source.stop(now + duracionTotal);

  console.log(
    `🎵 Duración total: ${duracionTotal}s (${duracionFadeIn}s fade-in + ${
      duracionTotal - duracionFadeIn
    }s constante)`
  );

  // 8. Actualizar UI al finalizar
  setTimeout(() => {
    APP.nodos.estadoAudioGain.textContent = "Estado: Detenido";
    console.log("🎵 Reproducción con GainNode completada.");
  }, duracionTotal * 1000 + 100);
}

/* ==========================================================================
   12. INICIALIZACIÓN DE LA APLICACIÓN → ÚNICA ENTRADA, ORDENADA Y SEGURA (Introducción.pdf)
   ==========================================================================
   - Función init() agrupa toda la lógica de arranque.
   - Asigna listeners a los botones.
   - Activa funcionalidades modulares (temporizador, contador, drag & drop, audio).
   - Se ejecuta una sola vez → evita duplicados.
*/
function init() {
  console.log("🚀 Inicializando aplicación con buenas prácticas...");
  cachearNodos();

  // Asignar listeners para el temporizador
  APP.nodos.btnIniciar.addEventListener("click", iniciarTemporizador);
  APP.nodos.btnDetener.addEventListener("click", detenerTemporizador);

  // Asignar listener para el contador
  APP.nodos.btnIncrementar.addEventListener("click", incrementarContador);

  // Activar Drag & Drop
  activarDragDrop();

  /* ==========================================================================
     ASIGNAR LISTENERS PARA WEB AUDIO API (webAudioAPI.pdf)
     ==========================================================================
     - Cada botón de audio activa su función correspondiente
     - El AudioContext se inicializa en la primera interacción (buena práctica UX)
     - Los listeners usan el patrón data-audio-accion para claridad
  */
  // Oscilador simple
  APP.nodos.btnAudioSimple.addEventListener("click", reproducirAudioSimple);

  // Múltiples osciladores
  APP.nodos.btnAudioMulti.addEventListener("click", reproducirAudioMulti);

  // Acordes (setValueAtTime)
  APP.nodos.btnAudioAcordes.addEventListener("click", reproducirAudioAcordes);

  // Rampas (linear/exponential)
  APP.nodos.btnAudioRampas.addEventListener("click", reproducirAudioRampas);

  // GainNode
  APP.nodos.btnAudioGain.addEventListener("click", reproducirAudioGain);

  console.log("✅ Aplicación lista. Esperando interacciones del usuario.");

  /*  --------------------------------------------------------------
    ➜ Re-ubicación.pdf — nuevo
    Pequeña utilidad para resetear los contadores de las demos
    (opcional pero útil en clase)
    -------------------------------------------------------------- */
  const resetBtn = document.createElement("button");
  resetBtn.className = "btn btn--secundario";
  resetBtn.textContent = "Resetear demos";
  resetBtn.type = "button";
  resetBtn.addEventListener("click", () => {
    /* temporizador */
    if (APP.temporizador !== null) detenerTemporizador();
    APP.nodos.tiempoSpan.textContent = "0";

    /* contador */
    APP.contador = 0;
    APP.nodos.cuentaSpan.textContent = "0";

    /* drag & drop */
    const { dropZone, dragItem } = APP.nodos;
    dropZone.textContent = "Suelta aquí el cuadrado";
    dropZone.removeAttribute("aria-live");
    dragItem.draggable = true;
    dragItem.style.opacity = "";
    dragItem.style.pointerEvents = "";

    /* audio estados */
    APP.nodos.estadoAudioSimple.textContent = "Estado: Detenido";
    APP.nodos.estadoAudioMulti.textContent = "Estado: Detenido";
    APP.nodos.estadoAudioAcordes.textContent = "Estado: Detenido";
    APP.nodos.estadoAudioRampas.textContent = "Estado: Detenido";
    APP.nodos.estadoAudioGain.textContent = "Estado: Detenido";

    console.log("♻️  Demos restauradas");
  });
  document.querySelector(".pie").prepend(resetBtn);
}

/* ==========================================================================
   13. EJECUCIÓN SEGURA → ESPERAR A QUE EL DOM ESTÉ LISTO (Introducción.pdf)
   ==========================================================================
   - Aunque usamos 'defer', esta comprobación garantiza compatibilidad en todos los casos.
   - Si el DOM ya está cargado (ej. script en línea), ejecuta init() inmediatamente.
   - Si no, espera al evento DOMContentLoaded.
*/
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
