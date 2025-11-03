/* filepath: c:\Users\usuario\Documents\uni\IPO\repositorio canada\ipo-canada\www-ejercicios\ejercicios\mapa\script.js */

/* ==========================================================================
   1. ESPACIO DE NOMBRES GLOBAL (evita contaminación de window)
   ========================================================================== */
const APP = {
  nodos: {},      // Caché de referencias DOM
  items: []       // Almacén de puntos de interés
};

/* ==========================================================================
   2. ALMACÉN DE DATOS (puntos de interés del mapa)
   ========================================================================== */
/* 
  Cada ítem contiene:
  - id: identificador único
  - nombre: título que se muestra en la leyenda
  - descripcion: texto informativo
  - x, y: coordenadas en porcentaje (0-100) relativas al mapa
*/
const DATOS_MAPA = [
  {
    id: 1,
    nombre: "La Parrilla Argentina",
    descripcion: "Carnes a la brasa y parrilladas. Abierto de 13:00 a 23:00. Especialidad: asado criollo.",
    x: 25,
    y: 35
  },
  {
    id: 2,
    nombre: "Sushi Tokyo",
    descripcion: "Cocina japonesa auténtica. Horario: 12:00 a 22:30. Menú degustación disponible.",
    x: 65,
    y: 28
  },
  {
    id: 3,
    nombre: "Pizzería Napolitana",
    descripcion: "Pizza al horno de leña. Servicio de 12:00 a 00:00. Ingredientes importados de Italia.",
    x: 45,
    y: 55
  },
  {
    id: 4,
    nombre: "Café Literario",
    descripcion: "Café y repostería artesanal. Abierto de 8:00 a 21:00. Wi-Fi gratuito.",
    x: 80,
    y: 65
  },
  {
    id: 5,
    nombre: "El Rincón Vegetariano",
    descripcion: "Comida vegana y vegetariana. Horario: 11:00 a 20:00. Opciones sin gluten.",
    x: 15,
    y: 70
  }
];

/* ==========================================================================
   3. CACHÉ DE NODOS DOM (se ejecuta una sola vez al iniciar)
   ========================================================================== */
function cachearNodos() {
  APP.nodos.mapa = document.querySelector('[data-mapa]');
}

/* ==========================================================================
   4. CREAR ELEMENTO DE ÍTEM (genera el HTML de un punto de interés)
   ========================================================================== */
/* 
  Crea la estructura:
  <div class="mapa__item" data-item-id="X" style="left: Y%; top: Z%;">
    <div class="mapa__marcador"></div>
    <div class="mapa__leyenda">
      <h3>Título</h3>
      <p>Descripción</p>
    </div>
  </div>
*/
function crearItem(item) {
  // Contenedor principal del ítem
  const itemElement = document.createElement('div');
  itemElement.className = 'mapa__item';
  
  // data-item-id permite identificar el ítem desde JS si fuera necesario
  itemElement.setAttribute('data-item-id', item.id);
  
  // Posicionamiento con coordenadas en porcentaje (adaptable al tamaño del mapa)
  itemElement.style.left = `${item.x}%`;
  itemElement.style.top = `${item.y}%`;

  // Marcador visual (círculo)
  const marcador = document.createElement('div');
  marcador.className = 'mapa__marcador';
  
  // Leyenda (tooltip)
  const leyenda = document.createElement('div');
  leyenda.className = 'mapa__leyenda';
  
  // Título de la leyenda
  const titulo = document.createElement('h3');
  titulo.textContent = item.nombre;
  
  // Descripción de la leyenda
  const descripcion = document.createElement('p');
  descripcion.textContent = item.descripcion;
  
  // Ensamblar elementos
  leyenda.appendChild(titulo);
  leyenda.appendChild(descripcion);
  
  itemElement.appendChild(marcador);
  itemElement.appendChild(leyenda);
  
  return itemElement;
}

/* ==========================================================================
   5. RENDERIZAR TODOS LOS ÍTEMS EN EL MAPA
   ========================================================================== */
/* 
  Recorre el almacén de datos y añade cada ítem al DOM
*/
function renderizarItems() {
  // Fragment para optimizar el rendimiento (una sola inserción en el DOM)
  const fragment = document.createDocumentFragment();
  
  DATOS_MAPA.forEach(item => {
    const itemElement = crearItem(item);
    fragment.appendChild(itemElement);
  });
  
  // Insertar todos los ítems de una vez
  APP.nodos.mapa.appendChild(fragment);
  
  console.log(`✅ ${DATOS_MAPA.length} puntos de interés renderizados en el mapa.`);
}

/* ==========================================================================
   6. INICIALIZACIÓN DE LA APLICACIÓN
   ========================================================================== */
function init() {
  console.log("🚀 Inicializando mapa interactivo...");
  
  // Cachear referencias DOM
  cachearNodos();
  
  // Renderizar ítems en el mapa
  renderizarItems();
  
  console.log("✅ Mapa listo. Pasa el cursor sobre los puntos para ver información.");
}

/* ==========================================================================
   7. EJECUCIÓN SEGURA (espera a que el DOM esté listo)
   ========================================================================== */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}