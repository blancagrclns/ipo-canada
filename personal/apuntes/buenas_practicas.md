# 🧪 Demo de Buenas Prácticas Web: Temporizador, Contador y Drag & Drop

Este proyecto implementa tres funcionalidades comunes en aplicaciones web modernas:

- **Temporizador automático** usando `setInterval` / `clearInterval`.
- **Contador manual** con incremento por botón.
- **Arrastrar y soltar (Drag & Drop)** con la API nativa del navegador.

Todo el código sigue rigurosamente las **buenas prácticas** descritas en los documentos: - `Introducción.pdf` - `Intervalos.pdf` - `Color&Fuentes&Espacio.pdf` - `README.md` sobre atributos `data-*` y estrategias CSS

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

- Uso de elementos como `<header>`, `<main>`, `<section>`, `<footer>`.
- Atributo `lang="es"` para accesibilidad y SEO.
- Atributos `data-*` como puente limpio entre HTML y JavaScript (ver más abajo).
- `aria-label` y `aria-live="polite"` para compatibilidad con lectores de pantalla.

### 2. Comunicación HTML ↔ JavaScript: Atributos `data-*`

> Los atributos `data-*` son un mecanismo limpio y simple de comunicación entre HTML y JavaScript. El navegador los ignora visualmente, pero son accesibles desde JS.

**Ejemplo:**

```html
<button data-accion="iniciar">Iniciar</button>
<span data-tiempo>0</span>
<div data-drop></div>
```

En JavaScript:

```js
document.querySelector('[data-accion="iniciar"]');
element.dataset.tiempo; // o getAttribute("data-tiempo")
```

**Ventajas:**

- Desacopla lógica (JS) de presentación (CSS).
- Evita el uso excesivo de id (que deben ser únicos).
- Permite selección múltiple sin depender de clases.

### 3. Gestión de Intervalos (`Intervalos.pdf`)

Implementación segura de `setInterval` y `clearInterval`:

- Cada intervalo devuelve un ID entero positivo.
- Se guarda en `APP.temporizador` para poder cancelarlo.
- Nunca se crea un segundo intervalo si ya hay uno activo (evita fugas).
- Al detener: `clearInterval(id)` + `APP.temporizador = null`.

```js
// Iniciar
APP.temporizador = setInterval(callback, 1000);

// Detener
clearInterval(APP.temporizador);
APP.temporizador = null;
```

> ⚠️ Importante: `clearInterval` no elimina la variable; debes hacerlo tú explícitamente.

### 4. Diseño Cromático con HSL y Variables CSS (`Color&Fuentes&Espacio.pdf`)

- Paleta basada en HSL (más intuitivo que RGB).
- Colores complementarios calculados con `calc(var(--tono) + 180)`.
- Todas las variables declaradas en `:root`:

```css
:root {
  --tono: 210;
  --color-primario: hsl(var(--tono), 80%, 50%);
  --color-secundario: hsl(calc(var(--tono) + 180), 70%, 45%);
}
```

Accesibles desde JavaScript:

```js
getComputedStyle(document.documentElement).getPropertyValue("--color-primario");
```

### 5. Tipografía Escalable y Legible

- Unidades `rem` para respetar las preferencias del usuario.
- `font-variant-numeric: tabular-nums` para alinear números en contadores.
- Herencia tipográfica global desde `body`.
- Fuentes genéricas como fallback: "Helvetica Neue", Arial, sans-serif.

### 6. Composición Espacial con Flexbox (`Introducción.pdf`)

- Flujo normal (block/inline) solo en "hojas" del árbol DOM (texto, botones).
- Flexbox/Grid en nodos intermedios (`<body>`, `<main>`, `.tarjeta`).
- Uso de `gap` en lugar de `margin` para espaciado coherente (principio de proximidad de la Gestalt).
- `min-height: 100vh` + `flex: 1` para mantener el footer abajo.

### 7. Estilos con BEM y Minimalismo

- Notación BEM: `.tarjeta`, `.tarjeta__titulo`, `.tarjeta--tempo`.
- Clases semánticas, no descriptivas de estilo (`btn--primario`, no `btn-blue`).
- Reset mínimo para consistencia entre navegadores.
- Sin `!important`, sin estilos inline, sin `px` en layout (solo en detalles).

### 8. Drag & Drop Nativo (Web APIs)

- Usa la API nativa de Drag and Drop (sin librerías).
- Eventos clave:
  - `dragstart` / `dragend` → en el elemento arrastrable.
  - `dragover` / `dragleave` / `drop` → en la zona de destino.
- `preventDefault()` es obligatorio en `dragover` y `drop`.
- Feedback visual con clases `.drag-item--active` y `.drop-zone--active`.
- Accesibilidad: `aria-live="polite"` anuncia cambios tras soltar.

### 9. JavaScript Moderno y Seguro

- Espacio de nombres global (`APP`) para evitar contaminar `window`.
- Caché de nodos DOM al iniciar → mejora rendimiento.
- Uso de `const`/`let` (nunca `var`).
- Event listeners, no atributos `onclick` en HTML.
- Separación clara entre estado (`APP.contador`) y presentación (`textContent`).
- Inicialización segura con `DOMContentLoaded` (aunque se use `defer`).

---

### 🔭 Novedades añadidas desde «Re-ubicación.pdf»

| Tema                                            | Ubicación en la demo                    | Fichero(s) afectados              |
| ----------------------------------------------- | --------------------------------------- | --------------------------------- |
| `position` (relative, absolute, fixed, sticky)  | Sección «Position & Stacking context»   | `index.html` ➜ nueva sección      |
| `z-index` y _stacking context_                  | Cajas superpuestas con valores 10-20-30 | `styles.css` ➜ `.demo-zindex`     |
| `transform` (translate / rotate / scale / skew) | Cuatrito de cada tipo                   | `styles.css` ➜ `.demo-transforms` |
| `::before` & `::after` + `attr()`               | Cita con comillas y tooltip             | `styles.css` ➜ `.demo-pseudos`    |
| Reset funcional de demos                        | Botón «Resetear demos»                  | `script.js` ➜ pequeño helper      |

## 🧪 Cómo Usar

1. Abre `index.html` en un navegador moderno (Chrome, Edge, Safari reciente).
2. Interactúa con:
   - Los botones de Iniciar/Detener para el temporizador.
   - El botón Incrementar para el contador.
   - Arrastra el cuadrado a la zona punteada.

💡 Consejo: abre la consola del navegador para ver los mensajes de depuración.

---

## 📚 Referencias

- [MDN: setInterval / clearInterval](https://developer.mozilla.org/es/docs/Web/API/setInterval)
- [MDN: Drag and Drop API](https://developer.mozilla.org/es/docs/Web/API/HTML_Drag_and_Drop_API)
- `Color&Fuentes&Espacio.pdf` – Diseño cromático con HSL
- `Introducción.pdf` – Arquitectura HTML/CSS/JS
- `Intervalos.pdf` – Control asíncrono en JavaScript
- [BEM Methodology](http://getbem.com/)

---

## 🛠️ Tecnologías Usadas

- **HTML5** (semántica, accesibilidad)
- **CSS3** (variables, Flexbox, HSL, BEM)
- **JavaScript moderno** (ES6+, Web APIs, DOM)
- Ninguna librería externa → 100% nativo

---

✨ Este proyecto es un ejemplo vivo de cómo aplicar buenas prácticas de desarrollo web frontend de forma coherente, mantenible y accesible.
