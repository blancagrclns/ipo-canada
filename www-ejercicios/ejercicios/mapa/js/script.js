/* ==========================================================================
   1. ESPACIO DE NOMBRES GLOBAL
   ========================================================================== */
const APP = {
  nodos: {},
  items: [],
  temaOscuro: false,
  vistaActual: 'todos',
  modoAdicion: false,
  itemArrastrando: null,
  configuracion: {
    tamanoMapa: 100,
    escalaMarcar: 1
  }
};

/* ==========================================================================
   2. ALMACÉN DE DATOS (con tipos de puntos de interés)
   ========================================================================== */
const DATOS_MAPA = [
  {
    id: 1,
    tipo: 'restaurante',
    nombre: "La Parrilla Argentina",
    descripcion: "Carnes a la brasa y parrilladas. Abierto de 13:00 a 23:00. Especialidad: asado criollo.",
    x: 25,
    y: 35
  },
  {
    id: 2,
    tipo: 'restaurante',
    nombre: "Sushi Tokyo",
    descripcion: "Cocina japonesa auténtica. Horario: 12:00 a 22:30. Menú degustación disponible.",
    x: 65,
    y: 28
  },
  {
    id: 3,
    tipo: 'restaurante',
    nombre: "Pizzería Napolitana",
    descripcion: "Pizza al horno de leña. Servicio de 12:00 a 00:00. Ingredientes importados de Italia.",
    x: 45,
    y: 55
  },
  {
    id: 4,
    tipo: 'cafe',
    nombre: "Café Literario",
    descripcion: "Café y repostería artesanal. Abierto de 8:00 a 21:00. Wi-Fi gratuito.",
    x: 80,
    y: 65
  },
  {
    id: 5,
    tipo: 'cafe',
    nombre: "El Rincón Vegetariano",
    descripcion: "Comida vegana y vegetariana. Horario: 11:00 a 20:00. Opciones sin gluten.",
    x: 15,
    y: 70
  },
  {
    id: 6,
    tipo: 'bar',
    nombre: "La Taberna del Puerto",
    descripcion: "Tapas y vinos. Ambiente marinero. Abierto de 18:00 a 02:00.",
    x: 50,
    y: 85
  }
];

/* ==========================================================================
   3. CACHÉ DE NODOS DOM
   ========================================================================== */
function cachearNodos() {
  APP.nodos = {
    mapa: document.querySelector('[data-mapa]'),
    btnTema: document.querySelector('[data-accion="tema"]'),
    btnPanel: document.querySelector('[data-accion="panel"]'),
    darkThemeLink: document.getElementById('dark-theme'),
    
    // Panel lateral
    panel: document.querySelector('[data-panel]'),
    btnCerrarPanel: document.querySelector('[data-accion="cerrar-panel"]'),
    botonesVista: document.querySelectorAll('[data-vista]'),
    
    // Controles del panel
    controlTamano: document.querySelector('[data-control="tamano"]'),
    outputTamano: document.querySelector('[data-output="tamano"]'),
    controlMarcador: document.querySelector('[data-control="marcador"]'),
    outputMarcador: document.querySelector('[data-output="marcador"]'),
    
    // Controles rápidos en el mapa
    botonesVistaRapida: document.querySelectorAll('[data-vista-rapida]'),
    
    // Modo adición
    btnActivarAdicion: document.querySelector('[data-accion="activar-adicion"]'),
    modoAdicionDiv: document.querySelector('[data-modo-adicion]'),
    btnCancelarAdicion: document.querySelector('[data-accion="cancelar-adicion"]'),
    
    // Dialog para nuevo ítem
    dialogItem: document.querySelector('[data-dialog-item]'),
    formItem: document.querySelector('[data-form-item]'),
    btnCancelarForm: document.querySelector('[data-accion="cancelar-form"]')
  };
}

/* ==========================================================================
   4. CREAR ELEMENTO DE ÍTEM (con tipos y drag & drop)
   ========================================================================== */
function crearItem(item) {
  const itemElement = document.createElement('div');
  itemElement.className = 'mapa__item';
  itemElement.setAttribute('data-item-id', item.id);
  itemElement.setAttribute('data-tipo', item.tipo);
  itemElement.setAttribute('draggable', 'true');
  itemElement.setAttribute('aria-grabbed', 'false');
  
  itemElement.style.left = `${item.x}%`;
  itemElement.style.top = `${item.y}%`;

  const marcador = document.createElement('div');
  marcador.className = `mapa__marcador mapa__marcador--${item.tipo}`;
  
  // Icono según tipo
  const icono = document.createElement('span');
  icono.className = 'mapa__marcador-icono';
  icono.textContent = obtenerIcono(item.tipo);
  marcador.appendChild(icono);
  
  const leyenda = document.createElement('div');
  leyenda.className = 'mapa__leyenda';
  
  const titulo = document.createElement('h3');
  titulo.textContent = item.nombre;
  
  const descripcion = document.createElement('p');
  descripcion.textContent = item.descripcion;
  
  leyenda.appendChild(titulo);
  leyenda.appendChild(descripcion);
  
  itemElement.appendChild(marcador);
  itemElement.appendChild(leyenda);
  
  // Configurar drag & drop
  configurarDragDrop(itemElement, item);
  
  return itemElement;
}

/* ==========================================================================
   5. OBTENER ICONO SEGÚN TIPO
   ========================================================================== */
function obtenerIcono(tipo) {
  const iconos = {
    restaurante: '🍽️',
    cafe: '☕',
    bar: '🍺'
  };
  return iconos[tipo] || '📍';
}

/* ==========================================================================
   6. RENDERIZAR ÍTEMS EN EL MAPA
   ========================================================================== */
function renderizarItems() {
  APP.nodos.mapa.innerHTML = '';
  const fragment = document.createDocumentFragment();
  
  APP.items.forEach(item => {
    // Filtrar según vista actual
    if (APP.vistaActual === 'todos' || item.tipo === APP.vistaActual) {
      const itemElement = crearItem(item);
      fragment.appendChild(itemElement);
    }
  });
  
  APP.nodos.mapa.appendChild(fragment);
  console.log(`✅ ${APP.items.filter(i => APP.vistaActual === 'todos' || i.tipo === APP.vistaActual).length} puntos renderizados (vista: ${APP.vistaActual}).`);
}

/* ==========================================================================
   7. GESTIÓN DEL TEMA OSCURO
   ========================================================================== */
function alternarTema() {
  APP.temaOscuro = !APP.temaOscuro;
  APP.nodos.darkThemeLink.disabled = !APP.temaOscuro;
  APP.nodos.btnTema.textContent = APP.temaOscuro ? '☀️' : '🌙';
  localStorage.setItem('temaOscuro', APP.temaOscuro);
  console.log(`🎨 Tema ${APP.temaOscuro ? 'oscuro' : 'claro'} activado.`);
}

function cargarPreferenciaTema() {
  const temaGuardado = localStorage.getItem('temaOscuro');
  if (temaGuardado === 'true') {
    APP.temaOscuro = true;
    APP.nodos.darkThemeLink.disabled = false;
    APP.nodos.btnTema.textContent = '☀️';
  }
}

/* ==========================================================================
   8. GESTIÓN DEL PANEL LATERAL
   ========================================================================== */
function alternarPanel() {
  APP.nodos.panel.classList.toggle('panel--abierto');
  const estaAbierto = APP.nodos.panel.classList.contains('panel--abierto');
  APP.nodos.btnPanel.setAttribute('aria-expanded', estaAbierto);
  console.log(`📋 Panel ${estaAbierto ? 'abierto' : 'cerrado'}.`);
}

function cerrarPanel() {
  APP.nodos.panel.classList.remove('panel--abierto');
  APP.nodos.btnPanel.setAttribute('aria-expanded', 'false');
}

/* ==========================================================================
   9. CAMBIAR VISTA DEL MAPA
   ========================================================================== */
function cambiarVista(vista) {
  APP.vistaActual = vista;
  
  // Actualizar botones del panel
  APP.nodos.botonesVista.forEach(btn => {
    const esActivo = btn.dataset.vista === vista;
    btn.classList.toggle('btn--activo', esActivo);
    btn.setAttribute('aria-pressed', esActivo);
  });
  
  // Actualizar botones rápidos
  APP.nodos.botonesVistaRapida.forEach(btn => {
    const esActivo = btn.dataset.vistaRapida === vista;
    btn.classList.toggle('mapa__boton-vista--activo', esActivo);
  });
  
  renderizarItems();
  console.log(`🗺️ Vista cambiada a: ${vista}`);
}

/* ==========================================================================
   10. AJUSTAR PARÁMETROS DE VISUALIZACIÓN
   ========================================================================== */
function ajustarTamanoMapa(valor) {
  APP.configuracion.tamanoMapa = valor;
  APP.nodos.mapa.style.transform = `scale(${valor / 100})`;
  APP.nodos.outputTamano.textContent = `${valor}%`;
  console.log(`📏 Tamaño del mapa: ${valor}%`);
}

function ajustarTamanoMarcador(valor) {
  APP.configuracion.escalaMarcador = valor;
  document.documentElement.style.setProperty('--escala-marcador', valor);
  APP.nodos.outputMarcador.textContent = `${valor}x`;
  console.log(`📍 Escala de marcadores: ${valor}x`);
}

/* ==========================================================================
   11. MODO ADICIÓN DE PUNTOS
   ========================================================================== */
let coordenadasTemporales = null;

function activarModoAdicion() {
  APP.modoAdicion = true;
  APP.nodos.modoAdicionDiv.style.display = 'flex';
  APP.nodos.mapa.style.cursor = 'crosshair';
  console.log('➕ Modo adición activado. Haz clic en el mapa.');
}

function cancelarModoAdicion() {
  APP.modoAdicion = false;
  coordenadasTemporales = null;
  APP.nodos.modoAdicionDiv.style.display = 'none';
  APP.nodos.mapa.style.cursor = '';
  console.log('❌ Modo adición cancelado.');
}

function handleClickMapa(e) {
  if (!APP.modoAdicion) return;
  
  const rect = APP.nodos.mapa.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  
  coordenadasTemporales = { x: x.toFixed(2), y: y.toFixed(2) };
  
  APP.nodos.dialogItem.showModal();
  cancelarModoAdicion();
}

function handleSubmitNuevoItem(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const nuevoItem = {
    id: Date.now(),
    tipo: formData.get('tipo'),
    nombre: formData.get('nombre'),
    descripcion: formData.get('descripcion'),
    x: parseFloat(coordenadasTemporales.x),
    y: parseFloat(coordenadasTemporales.y)
  };
  
  APP.items.push(nuevoItem);
  guardarItems();
  renderizarItems();
  
  APP.nodos.dialogItem.close();
  e.target.reset();
  coordenadasTemporales = null;
  
  console.log('✅ Nuevo punto añadido:', nuevoItem.nombre);
}

/* ==========================================================================
   12. DRAG & DROP PARA REPOSICIONAR ÍTEMS
   ========================================================================== */
function configurarDragDrop(itemElement, item) {
  itemElement.addEventListener('dragstart', (e) => {
    APP.itemArrastrando = item.id;
    itemElement.classList.add('mapa__item--arrastrando');
    itemElement.setAttribute('aria-grabbed', 'true');
    e.dataTransfer.effectAllowed = 'move';
  });
  
  itemElement.addEventListener('dragend', () => {
    itemElement.classList.remove('mapa__item--arrastrando');
    itemElement.setAttribute('aria-grabbed', 'false');
    APP.itemArrastrando = null;
  });
}

function handleDragOverMapa(e) {
  if (APP.itemArrastrando === null) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDropMapa(e) {
  if (APP.itemArrastrando === null) return;
  e.preventDefault();
  
  const rect = APP.nodos.mapa.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  
  const item = APP.items.find(i => i.id === APP.itemArrastrando);
  if (item) {
    item.x = parseFloat(x.toFixed(2));
    item.y = parseFloat(y.toFixed(2));
    guardarItems();
    renderizarItems();
    console.log(`📍 Ítem "${item.nombre}" reposicionado a (${item.x}, ${item.y})`);
  }
}

/* ==========================================================================
   13. PERSISTENCIA EN LOCALSTORAGE
   ========================================================================== */
function guardarItems() {
  localStorage.setItem('mapaItems', JSON.stringify(APP.items));
}

function cargarItems() {
  const itemsGuardados = localStorage.getItem('mapaItems');
  if (itemsGuardados) {
    APP.items = JSON.parse(itemsGuardados);
    console.log(`💾 ${APP.items.length} ítems cargados desde localStorage.`);
  } else {
    APP.items = [...DATOS_MAPA];
    console.log(`📦 ${APP.items.length} ítems cargados desde datos iniciales.`);
  }
}

/* ==========================================================================
   14. INICIALIZACIÓN DE LA APLICACIÓN
   ========================================================================== */
function init() {
  console.log("🚀 Inicializando mapa interactivo con variantes...");
  
  cachearNodos();
  cargarPreferenciaTema();
  cargarItems();
  
  // Event listeners - Tema y panel
  APP.nodos.btnTema.addEventListener('click', alternarTema);
  APP.nodos.btnPanel.addEventListener('click', alternarPanel);
  APP.nodos.btnCerrarPanel.addEventListener('click', cerrarPanel);
  
  // Event listeners - Vistas
  APP.nodos.botonesVista.forEach(btn => {
    btn.addEventListener('click', () => cambiarVista(btn.dataset.vista));
  });
  
  APP.nodos.botonesVistaRapida.forEach(btn => {
    btn.addEventListener('click', () => cambiarVista(btn.dataset.vistaRapida));
  });
  
  // Event listeners - Controles
  APP.nodos.controlTamano.addEventListener('input', (e) => {
    ajustarTamanoMapa(e.target.value);
  });
  
  APP.nodos.controlMarcador.addEventListener('input', (e) => {
    ajustarTamanoMarcador(e.target.value);
  });
  
  // Event listeners - Adición de puntos
  APP.nodos.btnActivarAdicion.addEventListener('click', activarModoAdicion);
  APP.nodos.btnCancelarAdicion.addEventListener('click', cancelarModoAdicion);
  APP.nodos.mapa.addEventListener('click', handleClickMapa);
  
  // Event listeners - Formulario
  APP.nodos.formItem.addEventListener('submit', handleSubmitNuevoItem);
  APP.nodos.btnCancelarForm.addEventListener('click', () => {
    APP.nodos.dialogItem.close();
    APP.nodos.formItem.reset();
  });
  
  // Event listeners - Drag & drop
  APP.nodos.mapa.addEventListener('dragover', handleDragOverMapa);
  APP.nodos.mapa.addEventListener('drop', handleDropMapa);
  
  // Renderizar ítems iniciales
  renderizarItems();
  
  console.log("✅ Mapa listo con todas las variantes implementadas.");
}

/* ==========================================================================
   15. EJECUCIÓN SEGURA
   ========================================================================== */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}