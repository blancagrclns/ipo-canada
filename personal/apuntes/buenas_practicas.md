# 🧪 Demo de Buenas Prácticas Web: Temporizador, Contador, Drag & Drop y Web Audio API

Este proyecto implementa funcionalidades comunes en aplicaciones web modernas, ahora ampliado con la **Web Audio API**:

- **Temporizador automático** usando `setInterval` / `clearInterval`
- **Contador manual** con incremento por botón
- **Arrastrar y soltar (Drag & Drop)** con la API nativa del navegador
- **Web Audio API** con osciladores, parámetros de audio y nodos intermedios

Todo el código sigue rigurosamente las **buenas prácticas** descritas en los documentos:

- `Introducción.pdf`
- `Intervalos.pdf`
- `Color&Fuentes&Espacio.pdf`
- `Re-ubicación.pdf`
- **`webAudioAPI.pdf`** ⭐ NUEVO

---

## 📁 Estructura del Proyecto

```text
.
├── index.html      # Estructura semántica y accesible
├── styles.css      # Diseño cromático, tipográfico y espacial con buenas prácticas
├── script.js       # Lógica modular, segura y documentada
└── README.md       # Este archivo
```

---

## ✅ Principios de Diseño Aplicados

### 1. HTML Semántico y Accesible

- Uso de elementos como `<header>`, `<main>`, `<section>`, `<footer>`
- Atributo `lang="es"` para accesibilidad y SEO
- Atributos `data-*` como puente limpio entre HTML y JavaScript
- `aria-label` y `aria-live="polite"` para compatibilidad con lectores de pantalla

### 2. Comunicación HTML ↔ JavaScript: Atributos `data-*`

> Los atributos `data-*` son un mecanismo limpio y simple de comunicación entre HTML y JavaScript. El navegador los ignora visualmente, pero son accesibles desde JS.

**Ejemplo:**

```html
<button data-accion="iniciar">Iniciar</button>
<button data-audio-accion="reproducir-simple">Reproducir</button>
<span data-tiempo>0</span>
<p data-audio-estado="simple">Estado: Detenido</p>
```

En JavaScript:

```js
document.querySelector('[data-accion="iniciar"]');
document.querySelector('[data-audio-accion="reproducir-simple"]');
element.dataset.tiempo; // o getAttribute("data-tiempo")
```

**Ventajas:**

- Desacopla lógica (JS) de presentación (CSS)
- Evita el uso excesivo de id (que deben ser únicos)
- Permite selección múltiple sin depender de clases
- Patrón consistente: `data-accion` para acciones generales, `data-audio-accion` para audio

### 3. Gestión de Intervalos (`Intervalos.pdf`)

Implementación segura de `setInterval` y `clearInterval`:

- Cada intervalo devuelve un ID entero positivo
- Se guarda en `APP.temporizador` para poder cancelarlo
- Nunca se crea un segundo intervalo si ya hay uno activo (evita fugas)
- Al detener: `clearInterval(id)` + `APP.temporizador = null`

```js
// Iniciar
APP.temporizador = setInterval(callback, 1000);

// Detener
clearInterval(APP.temporizador);
APP.temporizador = null;
```

> ⚠️ Importante: `clearInterval` no elimina la variable; debes hacerlo tú explícitamente.

### 4. Diseño Cromático con HSL y Variables CSS (`Color&Fuentes&Espacio.pdf`)

- Paleta basada en HSL (más intuitivo que RGB)
- Colores complementarios calculados con `calc(var(--tono) + 180)`
- Todas las variables declaradas en `:root`:

```css
:root {
  --tono: 210;
  --color-primario: hsl(var(--tono), 80%, 50%);
  --color-secundario: hsl(calc(var(--tono) + 180), 70%, 45%);
  --color-audio-activo: hsl(120, 60%, 45%);
}
```

Accesibles desde JavaScript:

```js
getComputedStyle(document.documentElement).getPropertyValue("--color-primario");
```

### 5. Tipografía Escalable y Legible

- Unidades `rem` para respetar las preferencias del usuario
- `font-variant-numeric: tabular-nums` para alinear números en contadores
- Herencia tipográfica global desde `body`
- Fuentes genéricas como fallback: "Helvetica Neue", Arial, sans-serif

### 6. Composición Espacial con Flexbox (`Introducción.pdf`)

- Flujo normal (block/inline) solo en "hojas" del árbol DOM (texto, botones)
- Flexbox/Grid en nodos intermedios (`<body>`, `<main>`, `.tarjeta`)
- Uso de `gap` en lugar de `margin` para espaciado coherente (principio de proximidad de la Gestalt)
- `min-height: 100vh` + `flex: 1` para mantener el footer abajo

### 7. Estilos con BEM y Minimalismo

- Notación BEM: `.tarjeta`, `.tarjeta__titulo`, `.tarjeta--audio-simple`
- Clases semánticas, no descriptivas de estilo (`btn--primario`, no `btn-blue`)
- Reset mínimo para consistencia entre navegadores
- Sin `!important`, sin estilos inline, sin `px` en layout (solo en detalles)

### 8. Drag & Drop Nativo (Web APIs)

- Usa la API nativa de Drag and Drop (sin librerías)
- Eventos clave:
  - `dragstart` / `dragend` → en el elemento arrastrable
  - `dragover` / `dragleave` / `drop` → en la zona de destino
- `preventDefault()` es obligatorio en `dragover` y `drop`
- Feedback visual con clases `.drag-item--active` y `.drop-zone--active`
- Accesibilidad: `aria-live="polite"` anuncia cambios tras soltar

### 9. JavaScript Moderno y Seguro

- Espacio de nombres global (`APP`) para evitar contaminar `window`
- Caché de nodos DOM al iniciar → mejora rendimiento
- Uso de `const`/`let` (nunca `var`)
- Event listeners, no atributos `onclick` en HTML
- Separación clara entre estado (`APP.contador`) y presentación (`textContent`)
- Inicialización segura con `DOMContentLoaded` (aunque se use `defer`)

---

## 🎵 Web Audio API: Nuevas Funcionalidades

### 10. AudioContext - Gestión del Contexto de Audio (`webAudioAPI.pdf`)

**Conceptos fundamentales:**

- **AudioContext**: objeto central que gestiona un grafo de nodos de audio
- **BaseAudioContext**: interfaz común que proporciona:
  - `currentTime`: temporizador en segundos desde la creación
  - `destination`: nodo de salida que envía el audio a los altavoces
  - `state`: estado del contexto (`suspended`, `running`, `closed`)

**Buena práctica UX:**

- El contexto comienza en estado `suspended` por defecto
- Evita reproducción automática no deseada
- El usuario DEBE interactuar (clic) para iniciar la reproducción

```js
// Inicialización del contexto (patrón Singleton)
function inicializarAudioContext() {
  if (APP.audioCtx !== null) return;
  APP.audioCtx = new AudioContext();
  console.log("Estado:", APP.audioCtx.state);
}
```

**Estructura del grafo de nodos:**

```
Nodos Fuente (F) → [Nodos Intermedios (I)]* → Nodo Destino (D)
```

### 11. OscillatorNode - Generación de Señales de Audio (`webAudioAPI.pdf`)

**Nodo fuente que genera señales periódicas:**

- Hereda de `AudioScheduledNode` → permite `start()` y `stop()`
- Propiedades principales:
  - `type`: forma de onda (`sine`, `square`, `sawtooth`, `triangle`)
  - `frequency`: frecuencia en Hercios (Hz) - número de ciclos por segundo
  - `detune`: reajuste fino de la frecuencia en cents (centésimas de semitono)

**Formas de onda:**

- **sine**: onda sinusoidal, sonido puro sin armónicos
- **triangle**: timbre más rico que sine
- **square**: timbre brillante y "digital"
- **sawtooth**: timbre completo y "áspero"

**Ejemplo de uso:**

```js
// Método recomendado: constructor
const source = new OscillatorNode(audioCtx, {
  type: "sine",
  frequency: 220, // La3 (220 Hz)
});

source.connect(audioCtx.destination);

const inicio = audioCtx.currentTime;
const duracion = 4;
source.start(inicio);
source.stop(inicio + duracion);
```

> ⚠️ Una vez detenido un oscilador con `stop()`, no puede reanudarse. Hay que crear uno nuevo.

**Frecuencias musicales:**

- 220 Hz = La3 (A3)
- 261.63 Hz = Do4 (C4, Do central del piano)
- 440 Hz = La4 (A4, frecuencia estándar)

### 12. AudioParam - Control Dinámico de Parámetros (`webAudioAPI.pdf`)

**Interfaz para controlar y automatizar parámetros de nodos:**

**a) Cambios instantáneos:**

```js
// setValueAtTime(valor, tiempo)
source.frequency.setValueAtTime(440, audioCtx.currentTime);
```

- Cambio INSTANTÁNEO en un momento específico
- Útil para notas musicales, cambios de volumen discretos

**b) Cambios progresivos lineales:**

```js
// linearRampToValueAtTime(valor, tiempoFinal)
gainNode.gain.linearRampToValueAtTime(0.8, audioCtx.currentTime + 3);
```

- Transición LINEAL desde el valor actual hasta el valor objetivo
- Perceptualmente: cambio constante y predecible
- Útil para: fade-in/fade-out, pitch bends lineales

**c) Cambios progresivos exponenciales:**

```js
// exponentialRampToValueAtTime(valor, tiempoFinal)
source.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 2);
```

- Transición EXPONENCIAL desde el valor actual hasta el valor objetivo
- Perceptualmente: más natural para frecuencias (oído humano es logarítmico)
- **IMPORTANTE**: el valor NO puede ser 0 (matemáticamente indefinido)

**Patrón crítico para rampas:**

Las rampas necesitan un punto de inicio explícito:

```js
// ❌ INCORRECTO: sin punto de inicio
source.frequency.linearRampToValueAtTime(880, tiempo);

// ✅ CORRECTO: fijar punto de inicio antes de la rampa
source.frequency.setValueAtTime(440, tiempo);
source.frequency.linearRampToValueAtTime(880, tiempo + 2);
```

**Orden de ejecución:**

- Los cambios se agendan en orden CRONOLÓGICO, no de aparición en el código
- Ejemplo: `setValueAtTime(440, 2)` se ejecutará antes que `setValueAtTime(330, 3)` aunque aparezca después

### 13. GainNode - Control de Volumen (`webAudioAPI.pdf`)

**Nodo intermedio que controla el volumen (ganancia) de la señal:**

**Propiedad principal: `gain` (objeto AudioParam)**

Valores de gain:

- `gain = 1.0`: sin cambios (valor por defecto)
- `gain > 1.0`: amplifica el sonido (puede causar distorsión/clipping)
- `gain < 1.0`: atenúa el sonido
- `gain = 0.0`: silencio total

**Estructura del grafo:**

```
OscillatorNode → GainNode → AudioContext.destination
```

**Buena práctica:**

- Comenzar con un valor muy bajo (ej. 0.01)
- Subir gradualmente con rampas
- NO llegar a `gain = 1.0` para evitar saturación/clipping
- Valor típico máximo: 0.7 - 0.9

**Ejemplo de fade-in:**

```js
const source = new OscillatorNode(audioCtx, {
  type: "sine",
  frequency: 440,
});

const gainNode = new GainNode(audioCtx, {
  gain: 0.01, // Inicio casi en silencio
});

// Conectar el grafo
source.connect(gainNode);
gainNode.connect(audioCtx.destination);

// Programar fade-in
const now = audioCtx.currentTime;
gainNode.gain.setValueAtTime(0.01, now);
gainNode.gain.linearRampToValueAtTime(0.8, now + 3);

source.start(now);
source.stop(now + 5);
```

**Técnica de fade-in:**

- Evita "clicks" o "pops" al inicio de la reproducción
- Más agradable perceptualmente que inicio abrupto
- Patrón común: `setValueAtTime(0.01, inicio) + linearRamp(0.8, fin)`

### 14. Múltiples Osciladores y Batimento

**Reproducción simultánea:**

- Un contexto puede tener n > 0 nodos fuente
- Cada oscilador es independiente
- Todos pueden conectarse al mismo destino → mezcla automática

**Efecto de batimento (beat):**

Cuando dos frecuencias cercanas suenan juntas:

```js
const osc1 = new OscillatorNode(audioCtx, { frequency: 220 });
const osc2 = new OscillatorNode(audioCtx, { frequency: 210 });
```

- Se produce una "pulsación" o variación de volumen
- Frecuencia del batimento = |f1 - f2| = |220 - 210| = 10 Hz
- Resultado: 10 pulsaciones por segundo

---

## 🧪 Cómo Usar

1. Abre `index.html` en un navegador moderno (Chrome, Edge, Safari reciente)
2. Interactúa con:
   - Los botones de Iniciar/Detener para el temporizador
   - El botón Incrementar para el contador
   - Arrastra el cuadrado a la zona punteada
   - **NUEVO**: Los botones de reproducción de audio

💡 Consejo: abre la consola del navegador para ver los mensajes de depuración detallados.

---

## 📊 Demostraciones de Web Audio API

### Demo 1: Oscilador Simple

- Genera una nota de 220 Hz (La3) durante 4 segundos
- Forma de onda: sinusoidal (tono puro)

### Demo 2: Múltiples Osciladores

- Reproduce dos osciladores simultáneamente
- Oscilador 1: sinusoidal, 220 Hz
- Oscilador 2: triangular, 210 Hz
- Demuestra el efecto de batimento (10 Hz)

### Demo 3: Cambios Instantáneos (setValueAtTime)

- Reproduce las notas del acorde Do Mayor: Do4 → Mi4 → Sol4 → Do5
- Cambios de frecuencia instantáneos cada 1.5 segundos
- Duración total: 6 segundos

### Demo 4: Cambios Progresivos (Rampas)

- Do4 estático → transición exponencial → Mi4 estático → transición lineal → Sol4
- Demuestra la diferencia entre rampas exponenciales y lineales
- Duración total: 9 segundos

### Demo 5: Control de Volumen (GainNode)

- Reproduce una nota de 440 Hz (La4)
- Fade-in progresivo de 3 segundos (gain: 0.01 → 0.8)
- Demuestra el uso de nodos intermedios

---

## 📚 Referencias

### Documentación oficial:

- [MDN: Web Audio API](https://developer.mozilla.org/es/docs/Web/API/Web_Audio_API)
- [MDN: AudioContext](https://developer.mozilla.org/es/docs/Web/API/AudioContext)
- [MDN: OscillatorNode](https://developer.mozilla.org/es/docs/Web/API/OscillatorNode)
- [MDN: AudioParam](https://developer.mozilla.org/es/docs/Web/API/AudioParam)
- [MDN: GainNode](https://developer.mozilla.org/es/docs/Web/API/GainNode)
- [MDN: setInterval / clearInterval](https://developer.mozilla.org/es/docs/Web/API/setInterval)
- [MDN: Drag and Drop API](https://developer.mozilla.org/es/docs/Web/API/HTML_Drag_and_Drop_API)

### Documentos de referencia del curso:

- `webAudioAPI.pdf` – Web Audio API completa
- `Color&Fuentes&Espacio.pdf` – Diseño cromático con HSL
- `Introducción.pdf` – Arquitectura HTML/CSS/JS
- `Intervalos.pdf` – Control asíncrono en JavaScript
- `Re-ubicación.pdf` – Position, Z-index, Transform
- [BEM Methodology](http://getbem.com/)

---

## 🛠️ Tecnologías Usadas

- **HTML5** (semántica, accesibilidad)
- **CSS3** (variables, Flexbox, HSL, BEM)
- **JavaScript moderno** (ES6+, Web APIs, DOM)
- **Web Audio API** (AudioContext, OscillatorNode, GainNode)
- Ninguna librería externa → 100% nativo

---

## 🎓 Conceptos Clave de Web Audio API

### Grafo de Nodos

```
┌─────────────┐
│ Source Node │ (OscillatorNode)
└──────┬──────┘
       │ connect()
┌──────▼──────┐
│ Gain Node   │ (GainNode) [OPCIONAL]
└──────┬──────┘
       │ connect()
┌──────▼──────┐
│ Destination │ (audioCtx.destination)
└─────────────┘
        │
        ▼
   Altavoces
```

### Temporización

- **currentTime**: temporizador del contexto en segundos (iniciado en 0)
- **start(tiempo)**: programa el inicio de la reproducción
- **stop(tiempo)**: programa el fin de la reproducción
- Los tiempos son absolutos, no relativos

### Buenas Prácticas

1. ✅ Crear un solo AudioContext y reutilizarlo
2. ✅ Iniciar el contexto solo tras interacción del usuario
3. ✅ Usar constructores en lugar de métodos factory (`new OscillatorNode()` vs `createOscillator()`)
4. ✅ Fijar puntos de inicio con `setValueAtTime()` antes de usar rampas
5. ✅ No llegar a `gain = 1.0` para evitar saturación
6. ✅ Comenzar fade-ins desde valores muy bajos (0.01)
7. ✅ Usar rampas exponenciales para frecuencias (más natural)
8. ✅ Usar rampas lineales para volumen
9. ❌ No reutilizar osciladores detenidos (crear nuevos)
10. ❌ No usar valores de gain negativos o exponenciales a 0

---

## 🔍 Debugging

### Mensajes de consola:

```js
🚀 Inicializando aplicación con buenas prácticas...
✅ Aplicación lista. Esperando interacciones del usuario.
🎵 AudioContext inicializado. Estado: suspended
🎵 Iniciando reproducción de oscilador simple...
🎵 Oscilador programado: inicio=0.00s, fin=4.00s
🎵 Reproducción simple completada.
```

### Verificar estado del AudioContext:

```js
console.log(APP.audioCtx.state); // 'suspended', 'running', o 'closed'
console.log(APP.audioCtx.currentTime); // Tiempo en segundos
console.log(APP.audioCtx.sampleRate); // Ej: 48000 Hz
```

---

✨ Este proyecto es un ejemplo vivo de cómo aplicar buenas prácticas de desarrollo web frontend de forma coherente, mantenible y accesible, ahora con soporte completo para la Web Audio API.
