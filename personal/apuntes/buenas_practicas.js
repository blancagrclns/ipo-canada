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
  temporizador: null,   // ID devuelto por setInterval (Intervalos.pdf). null = inactivo.
  contador: 0,          // Estado del contador manual (número entero).
  nodos: {}             // Caché de referencias DOM (mejora rendimiento).
};

/* ==========================================================================
   2. CACHÉ DE NODOS DEL DOM → MEJORA RENDIMIENTO Y LEGIBILIDAD (README.md, Introducción.pdf)
   ==========================================================================
   - Se usan selectores basados en atributos data-* (no en clases ni id).
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
    btnIniciar: document.querySelector('[data-accion="iniciar"]'),
    btnDetener: document.querySelector('[data-accion="detener"]'),

    // Contador manual
    cuentaSpan: document.querySelector('[data-cuenta]'),
    btnIncrementar: document.querySelector('[data-accion="incrementar"]'),

    // Drag & Drop
    dropZone: document.querySelector('[data-drop]'),
    dragItem: document.querySelector('[data-drag]')
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
    console.warn("⚠️ El temporizador ya está en ejecución. Ignorando nuevo intento.");
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
  dragItem.addEventListener('dragstart', (e) => {
    // Opcional: pasa datos (aunque no se usen aquí)
    e.dataTransfer.setData('text/plain', 'drag-item');
    dragItem.classList.add('drag-item--active');
    dragItem.setAttribute('aria-grabbed', 'true');
    console.log("🖱️ Arrastre iniciado.");
  });

  // Al terminar el arrastre (soltar o cancelar)
  dragItem.addEventListener('dragend', () => {
    dragItem.classList.remove('drag-item--active');
    dragItem.setAttribute('aria-grabbed', 'false');
  });

  // Permitir soltar en la zona → ¡preventDefault() es obligatorio!
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drop-zone--active');
  });

  // Al salir del área de drop
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drop-zone--active');
  });

  // Al soltar el elemento
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drop-zone--active');
    dropZone.textContent = "✅ ¡Elemento soltado correctamente!";
    
    // Accesibilidad: anuncia el cambio a lectores de pantalla
    dropZone.setAttribute('aria-live', 'polite');
    
    // Opcional: desactiva futuros arrastres
    dragItem.draggable = false;
    dragItem.style.opacity = '0.4';
    dragItem.style.pointerEvents = 'none';

    console.log("📦 Elemento soltado. Interacción completada.");
  });
}

/* ==========================================================================
   6. INICIALIZACIÓN DE LA APLICACIÓN → ÚNICA ENTRADA, ORDENADA Y SEGURA (Introducción.pdf)
   ==========================================================================
   - Función init() agrupa toda la lógica de arranque.
   - Asigna listeners a los botones.
   - Activa funcionalidades modulares (temporizador, contador, drag & drop).
   - Se ejecuta una sola vez → evita duplicados.
*/
function init() {
  console.log("🚀 Inicializando aplicación con buenas prácticas...");
  cachearNodos();

  // Asignar listeners para el temporizador
  APP.nodos.btnIniciar.addEventListener('click', iniciarTemporizador);
  APP.nodos.btnDetener.addEventListener('click', detenerTemporizador);

  // Asignar listener para el contador
  APP.nodos.btnIncrementar.addEventListener('click', incrementarContador);

  // Activar Drag & Drop
  activarDragDrop();

  console.log("✅ Aplicación lista. Esperando interacciones del usuario.");
}

/* ==========================================================================
   7. EJECUCIÓN SEGURA → ESPERAR A QUE EL DOM ESTÉ LISTO (Introducción.pdf)
   ==========================================================================
   - Aunque usamos 'defer', esta comprobación garantiza compatibilidad en todos los casos.
   - Si el DOM ya está cargado (ej. script en línea), ejecuta init() inmediatamente.
   - Si no, espera al evento DOMContentLoaded.
*/
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}