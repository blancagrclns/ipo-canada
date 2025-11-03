/* ==========================================================================
   1. ESPACIO DE NOMBRES GLOBAL (evita contaminación de window)
   ========================================================================== */
const APP = {
  nodos: {},           // Caché de referencias DOM
  items: [],           // Almacén de puntos de interés
  temaOscuro: false    // Estado del tema (false = claro, true = oscuro)
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
  APP.nodos = {
    mapa: document.querySelector('[data-mapa]'),
    btnTema: document.querySelector('[data-accion="tema"]'),
    darkThemeLink: document.getElementById('dark-theme')
  };
}

/* ==========================================================================
   4. CREAR ELEMENTO DE ÍTEM (genera el HTML de un punto de interés)
   ========================================================================== */
/* 
  Crea la estructura DOM:
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
  
  // data-item-id permite identificar el ítem si fuera necesario
  itemElement.setAttribute('data-item-id', item.id);
  
  // Posicionamiento con coordenadas en porcentaje (adaptable al tamaño)
  itemElement.style.left = `${item.x}%`;
  itemElement.style.top = `${item.y}%`;

  // Marcador visual (círculo pulsante)
  const marcador = document.createElement('div');
  marcador.className = 'mapa__marcador';
  
  // Leyenda (tooltip que aparece al hover)
  const leyenda = document.createElement('div');
  leyenda.className = 'mapa__leyenda';
  
  // Título de la leyenda
  const titulo = document.createElement('h3');
  titulo.textContent = item.nombre;
  
  // Descripción de la leyenda
  const descripcion = document.createElement('p');
  descripcion.textContent = item.descripcion;
  
  // Ensamblar elementos (composición DOM)
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
  Usa DocumentFragment para optimizar el rendimiento (una sola inserción)
*/
function renderizarItems() {
  // Fragment para evitar múltiples reflows
  const fragment = document.createDocumentFragment();
  
  DATOS_MAPA.forEach(item => {
    const itemElement = crearItem(item);
    fragment.appendChild(itemElement);
  });
  
  // Insertar todos los ítems de una vez en el DOM
  APP.nodos.mapa.appendChild(fragment);
  
  console.log(`✅ ${DATOS_MAPA.length} puntos de interés renderizados en el mapa.`);
}

/* ==========================================================================
   6. GESTIÓN DEL TEMA OSCURO
   ========================================================================== */
/* 
  Alterna entre tema claro y oscuro activando/desactivando la hoja de estilos
  El tema se guarda en localStorage para persistencia entre sesiones
*/
function alternarTema() {
  APP.temaOscuro = !APP.temaOscuro;
  
  // Activar o desactivar la hoja de estilos del tema oscuro
  APP.nodos.darkThemeLink.disabled = !APP.temaOscuro;
  
  // Cambiar el emoji del botón
  APP.nodos.btnTema.textContent = APP.temaOscuro ? '☀️' : '🌙';
  
  // Guardar preferencia en localStorage
  localStorage.setItem('temaOscuro', APP.temaOscuro);
  
  console.log(`🎨 Tema ${APP.temaOscuro ? 'oscuro' : 'claro'} activado.`);
}

/* 
  Cargar preferencia de tema desde localStorage al iniciar
*/
function cargarPreferenciaTema() {
  const temaGuardado = localStorage.getItem('temaOscuro');
  
  if (temaGuardado === 'true') {
    APP.temaOscuro = true;
    APP.nodos.darkThemeLink.disabled = false;
    APP.nodos.btnTema.textContent = '☀️';
    console.log('🎨 Tema oscuro cargado desde localStorage.');
  }
}

/* ==========================================================================
   7. INICIALIZACIÓN DE LA APLICACIÓN
   ========================================================================== */
function init() {
  console.log("🚀 Inicializando mapa interactivo...");
  
  // Cachear referencias DOM
  cachearNodos();
  
  // Cargar preferencia de tema guardada
  cargarPreferenciaTema();
  
  // Asignar event listener al botón de tema
  APP.nodos.btnTema.addEventListener('click', alternarTema);
  
  // Renderizar ítems en el mapa
  renderizarItems();
  
  console.log("✅ Mapa listo. Pasa el cursor sobre los puntos para ver información.");
}

/* ==========================================================================
   8. EJECUCIÓN SEGURA (espera a que el DOM esté listo)
   ========================================================================== */
/* 
  Comprueba si el DOM ya está cargado
  Si no, espera al evento DOMContentLoaded
*/
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}