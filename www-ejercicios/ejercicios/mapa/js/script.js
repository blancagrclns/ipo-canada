/* ==========================================================================
   1. ESPACIO DE NOMBRES GLOBAL
   ========================================================================== */
const APP = {
  nodos: {},
  items: [],
  // Eliminar temaOscuro y temaMapa, solo usar tema global
  vistaActual: 'todos',
  categoriasActivas: new Set(['todos']),
  modoAdicion: false,
  itemArrastrando: null,
  configuracion: {
    tamanoMapa: 100,
    escalaMarcar: 1.2,
    gridBase: 36
  },
  tiposPersonalizados: {},
  coloresPersonalizados: {} 
};

/* ==========================================================================
   2. ALMACÉN DE DATOS 
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
    x: 58,
    y: 44
  }
];

/* ==========================================================================
   3. CACHÉ DE NODOS DOM
   ========================================================================== */
function cachearNodos() {
  APP.nodos = {
    mapa: document.querySelector('[data-mapa]'),
    panel: document.getElementById('panel-config'),
    btnPanel: document.querySelector('[data-accion="abrir-configuracion"]'),
    btnCerrarPanel: document.querySelector('[data-accion="cerrar-panel"]'),
    controlTamano: document.getElementById('tamanoMapa'),
    outputTamano: document.querySelector('[data-output="tamano"]'),
    controlMarcador: document.getElementById('tamanoMarcador'),
    outputMarcador: document.querySelector('[data-output="marcador"]'),
    btnActivarAdicion: document.querySelector('[data-accion="activar-adicion"]'),
    btnCancelarAdicion: document.querySelector('[data-accion="cancelar-adicion"]'),
    modoAdicionDiv: document.querySelector('[data-modo-adicion]'),
    dialogItem: document.querySelector('[data-dialog-item]'),
    formItem: document.querySelector('[data-form-item]'),
    btnCancelarForm: document.querySelector('[data-accion="cancelar-form"]'),
    selectTipo: document.querySelector('[data-select-tipo]'),
    campoNuevoTipo: document.querySelector('[data-campo-nuevo-tipo]'),
    inputNuevoTipo: document.querySelector('[data-input-nuevo-tipo]'),
    inputIcono: document.querySelector('[data-input-icono]')
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
  
  // Aplicar color personalizado
  const color = generarColorPorTipo(item.tipo);
  // Aplicar color mediante variable CSS (evitar manipular background directo)
  marcador.style.setProperty('--color-marcador', generarColorPorTipo(item.tipo));
  
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
  
  // Añadir event listener para eliminar marcador
  itemElement.addEventListener('click', handleEliminarMarcador);

  return itemElement;
}

/* ==========================================================================
   5. OBTENER ICONO SEGÚN TIPO
   ========================================================================== */
function obtenerIcono(tipo) {
  const iconos = {
    restaurante: '🍽️',
    cafe: '☕',
    bar: '🍺',
    ...APP.tiposPersonalizados
  };
  return iconos[tipo] || '📍';
}

/* ==========================================================================
   GENERAR COLOR ÚNICO PARA CATEGORÍA
   ========================================================================== */
function generarColorPorTipo(tipo) {
  // Si ya tiene color asignado, devolverlo
  if (APP.coloresPersonalizados[tipo]) {
    return APP.coloresPersonalizados[tipo];
  }
  
  // Paleta de colores predefinidos para tipos base
  const coloresBase = {
    restaurante: 'hsl(10, 70%, 60%)',   // Rojo-naranja
    cafe: 'hsl(30, 65%, 55%)',          // Marrón-naranja
    bar: 'hsl(200, 60%, 55%)'           // Azul
  };
  
  if (coloresBase[tipo]) {
    return coloresBase[tipo];
  }
  
  // Para tipos personalizados, generar color basado en hash del nombre
  let hash = 0;
  for (let i = 0; i < tipo.length; i++) {
    hash = tipo.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generar HSL con buena saturación y luminosidad
  const hue = Math.abs(hash % 360);
  const saturation = 60 + (Math.abs(hash % 20)); // 60-80%
  const lightness = 50 + (Math.abs(hash % 15));  // 50-65%
  
  const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  
  // Guardar el color para este tipo
  APP.coloresPersonalizados[tipo] = color;
  guardarColoresPersonalizados();
  
  return color;
}

/* ==========================================================================
   6. RENDERIZAR ÍTEMS EN EL MAPA
   ========================================================================== */
function renderizarItems() {
  APP.nodos.mapa.innerHTML = '';
  
  const itemsFiltrados = APP.items.filter(item => {
    // Si 'todos' está activo, mostrar todos
    if (APP.categoriasActivas.has('todos')) {
      return true;
    }
    // Sino, mostrar solo los que pertenecen a categorías activas
    return APP.categoriasActivas.has(item.tipo);
  });
  
  itemsFiltrados.forEach(item => {
    const itemElement = crearItem(item);
    APP.nodos.mapa.appendChild(itemElement);
    configurarDragDrop(itemElement, item);
  });
}

/* ==========================================================================
   8. GESTIÓN DEL PANEL LATERAL
   ========================================================================== */
function alternarPanel() {
  APP.nodos.panel.classList.toggle('panel--abierto');
  const estaAbierto = APP.nodos.panel.classList.contains('panel--abierto');
  if (APP.nodos.btnPanel) {
    APP.nodos.btnPanel.setAttribute('aria-expanded', estaAbierto);
  }
}

function cerrarPanel() {
  APP.nodos.panel.classList.remove('panel--abierto');
  if (APP.nodos.btnPanel) {
    APP.nodos.btnPanel.setAttribute('aria-expanded', 'false');
  }
}

/* ==========================================================================
   9. CAMBIAR VISTA DEL MAPA 
   ========================================================================== */
function cambiarVista(categoria) {
  // Si se selecciona "todos", limpiar todo y activar solo "todos"
  if (categoria === 'todos') {
    APP.categoriasActivas.clear();
    APP.categoriasActivas.add('todos');
  } else {
    // Si "todos" estaba activo, quitarlo
    if (APP.categoriasActivas.has('todos')) {
      APP.categoriasActivas.clear();
    }
    
    // Toggle: si ya está activa, desactivarla; si no, activarla
    if (APP.categoriasActivas.has(categoria)) {
      APP.categoriasActivas.delete(categoria);
      
      // Si no queda ninguna, activar "todos"
      if (APP.categoriasActivas.size === 0) {
        APP.categoriasActivas.add('todos');
      }
    } else {
      APP.categoriasActivas.add(categoria);
    }
  }
  
  // Actualizar estilos de botones del panel
  document.querySelectorAll('[data-vista]').forEach(btn => {
    const cat = btn.dataset.vista;
    const activo = APP.categoriasActivas.has(cat);
    btn.setAttribute('aria-pressed', activo);
    btn.classList.toggle('btn--filtro-activo', activo);
  });
  
  // Actualizar estilos de botones rápidos 
  document.querySelectorAll('[data-vista-rapida]').forEach(btn => {
    const cat = btn.dataset.vistaRapida;
    const activo = APP.categoriasActivas.has(cat);
    btn.classList.toggle('mapa__boton-vista--activo', activo);
  });
  
  renderizarItems();
}

/* ==========================================================================
   10. AJUSTE PARÁMETROS DE VISUALIZACIÓN
   ========================================================================== */
function ajustarTamanoMapa(valor) {
  APP.configuracion.tamanoMapa = parseFloat(valor);
  // Usar variable CSS para controlar la anchura del mapa (mantenido en CSS)
  APP.nodos.mapa.style.setProperty('--map-width', `${valor}%`);
  // Ajustar tamaño de la rejilla: basamos el cálculo en gridBase (px) y la escala %
  const base = APP.configuracion.gridBase || 36;
  const nueva = Math.max(8, Math.round(base * (parseFloat(valor) / 100))); // mínimo 8px
  APP.nodos.mapa.style.setProperty('--grid-size', `${nueva}px`);
  APP.nodos.outputTamano.textContent = `${valor}%`;
}

function ajustarTamanoMarcador(valor) {
  APP.configuracion.escalaMarcar = parseFloat(valor);
  document.documentElement.style.setProperty('--escala-marcador', valor);
  APP.nodos.outputMarcador.textContent = `${valor}x`;
}

/* ==========================================================================
   11. MODO ADICIÓN DE PUNTOS 
   ========================================================================== */
let coordenadasTemporales = null;

function activarModoAdicion() {
  APP.modoAdicion = true;
  // Mostrar indicador de modo adición mediante clase (CSS controla display)
  APP.nodos.modoAdicionDiv.classList.add('mapa__modo-adicion--visible');
  APP.nodos.mapa.classList.add('mapa--modo-adicion');
}

function cancelarModoAdicion() {
  APP.modoAdicion = false;
  coordenadasTemporales = null; 
  APP.nodos.modoAdicionDiv.classList.remove('mapa__modo-adicion--visible');
  APP.nodos.mapa.classList.remove('mapa--modo-adicion');
}

function handleClickMapa(e) {
  if (!APP.modoAdicion) return;
  
  // Evitar que se active si se hace clic en los controles
  if (e.target.closest('[data-controles-mapa]') || e.target.closest('[data-modo-adicion]')) {
    return;
  }
  
  const rect = APP.nodos.mapa.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  
  coordenadasTemporales = { x: x.toFixed(2), y: y.toFixed(2) };
  
  APP.nodos.dialogItem.showModal();
  
  // Solo ocultar el modal de adición, NO resetear coordenadas
  APP.modoAdicion = false;
  APP.nodos.modoAdicionDiv.classList.remove('mapa__modo-adicion--visible');
  APP.nodos.mapa.classList.remove('mapa--modo-adicion');
}

function handleSubmitNuevoItem(e) {
  e.preventDefault();
  
  // Validación de seguridad
  if (!coordenadasTemporales) {
    alert('Error: No se han capturado las coordenadas. Por favor, intenta de nuevo.');
    APP.nodos.dialogItem.close();
    return;
  }
  
  const formData = new FormData(e.target);
  let tipo = formData.get('tipo');
  
  // Si seleccionó "nuevo", usar el tipo personalizado
  if (tipo === 'nuevo') {
    const nuevoTipoNombre = formData.get('nuevoTipo')?.trim().toLowerCase();
    const nuevoIcono = formData.get('iconoNuevo')?.trim() || '📍';
    
    if (!nuevoTipoNombre) {
      alert('Por favor, ingresa un nombre para el nuevo tipo (en plural).');
      return;
    }
    
    tipo = nuevoTipoNombre;
    APP.tiposPersonalizados[tipo] = nuevoIcono;
    
    // Añadir opción al select para futuros usos
    agregarOpcionTipo(tipo, nuevoIcono);
    
    // Añadir botón de vista rápida
    agregarBotonVistaRapida(tipo, nuevoIcono);
    
    // Añadir botón al panel lateral
    agregarBotonPanel(tipo, nuevoIcono);
    
    // Guardar tipos personalizados
    guardarTiposPersonalizados();
  }
  
  const nuevoItem = {
    id: Date.now(),
    tipo: tipo,
    nombre: formData.get('nombre'),
    descripcion: formData.get('descripcion'),
    x: parseFloat(coordenadasTemporales.x),
    y: parseFloat(coordenadasTemporales.y)
  };
  
  APP.items.push(nuevoItem);
  guardarItems();
  
  // Cerrar modal y limpiar
  APP.nodos.dialogItem.close();
  e.target.reset();
  
  // IMPORTANTE: Ocultar campo de nuevo tipo al resetear
  APP.nodos.campoNuevoTipo.classList.remove('formulario-item__campo--visible');
  APP.nodos.campoNuevoTipo.classList.add('formulario-item__campo--oculto');
  APP.nodos.inputNuevoTipo.required = false;
  
  // Resetear coordenadas DESPUÉS de usarlas
  coordenadasTemporales = null;
  
  // Activar automáticamente la categoría del nuevo item
  if (!APP.categoriasActivas.has('todos')) {
    APP.categoriasActivas.add(tipo);
    cambiarVista(tipo);
  } else {
    renderizarItems();
  }
}

/* ==========================================================================
   12. DRAG & DROP PARA REPOSICIONAR ÍTEMS
   ========================================================================== */
function configurarDragDrop(itemElement, item) {
  // Evento dragstart
  itemElement.addEventListener('dragstart', (e) => {
    APP.itemArrastrando = item;
    itemElement.setAttribute('aria-grabbed', 'true');
  // Indicar arrastre con clase (CSS define estilos visuales)
  itemElement.classList.add('mapa__item--arrastrando');
    
    // Guardar referencia del elemento en el dataTransfer
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
  });
  
  // Evento dragend
  itemElement.addEventListener('dragend', (e) => {
    itemElement.setAttribute('aria-grabbed', 'false');
  itemElement.classList.remove('mapa__item--arrastrando');
    APP.itemArrastrando = null;
  });
}

function handleDragOverMapa(e) {
  // Permitir drop solo si hay un ítem siendo arrastrado
  if (APP.itemArrastrando) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }
}

function handleDropMapa(e) {
  e.preventDefault();
  
  if (!APP.itemArrastrando) return;
  
  // Calcular nueva posición relativa al mapa
  const rect = APP.nodos.mapa.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  
  // Actualizar posición del ítem en el array
  const itemIndex = APP.items.findIndex(i => i.id === APP.itemArrastrando.id);
  if (itemIndex !== -1) {
    APP.items[itemIndex].x = parseFloat(x.toFixed(2));
    APP.items[itemIndex].y = parseFloat(y.toFixed(2));
    
    guardarItems();
    renderizarItems();
  }
  
  APP.itemArrastrando = null;
}

/* ==========================================================================
   GESTIÓN DE TIPOS PERSONALIZADOS
   ========================================================================== */
function agregarOpcionTipo(tipo, icono) {
  // Verificar si ya existe
  const opcionExistente = Array.from(APP.nodos.selectTipo.options).find(
    opt => opt.value === tipo
  );
  
  if (opcionExistente) return;
  
  // Crear nueva opción antes de "Crear nuevo tipo..."
  const nuevaOpcion = document.createElement('option');
  nuevaOpcion.value = tipo;
  nuevaOpcion.textContent = `${icono} ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
  
  // Insertar antes de la última opción (la de "nuevo")
  const opcionNuevo = APP.nodos.selectTipo.querySelector('[value="nuevo"]');
  APP.nodos.selectTipo.insertBefore(nuevaOpcion, opcionNuevo);
}

function agregarBotonVistaRapida(tipo, icono) {
  // Verificar si ya existe
  const botonExistente = document.querySelector(`[data-vista-rapida="${tipo}"]`);
  if (botonExistente) return;
  
  const controlesMapa = document.querySelector('[data-controles-mapa]');
  const nuevoBoton = document.createElement('button');
  nuevoBoton.className = 'mapa__boton-vista';
  nuevoBoton.setAttribute('data-vista-rapida', tipo);
  nuevoBoton.setAttribute('aria-label', `Solo ${tipo}s`);
  nuevoBoton.textContent = icono;
  
  // NO añadir event listener aquí - usar delegación de eventos
  controlesMapa.appendChild(nuevoBoton);
}

function agregarBotonPanel(tipo, icono) {
  // Verificar si ya existe
  const botonExistente = document.querySelector(`[data-vista="${tipo}"]`);
  if (botonExistente) return;
  
  const panelControles = document.querySelector('.panel__controles');
  const nuevoBoton = document.createElement('button');
  nuevoBoton.className = 'btn btn--filtro';
  nuevoBoton.setAttribute('data-vista', tipo);
  nuevoBoton.setAttribute('aria-pressed', 'false');
  nuevoBoton.textContent = `${icono} ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
  
  // NO añadir event listener aquí - usar delegación de eventos
  panelControles.appendChild(nuevoBoton);
}

function guardarTiposPersonalizados() {
  localStorage.setItem('tiposPersonalizados', JSON.stringify(APP.tiposPersonalizados));
}

function guardarColoresPersonalizados() {
  localStorage.setItem('coloresPersonalizados', JSON.stringify(APP.coloresPersonalizados));
}

function cargarTiposPersonalizados() {
  const tipos = localStorage.getItem('tiposPersonalizados');
  if (tipos) {
    APP.tiposPersonalizados = JSON.parse(tipos);
    
    // Añadir opciones al select, botones de vista y panel
    Object.entries(APP.tiposPersonalizados).forEach(([tipo, icono]) => {
      agregarOpcionTipo(tipo, icono);
      agregarBotonVistaRapida(tipo, icono);
      agregarBotonPanel(tipo, icono);
    });
  } else {
    
  }
  
  // Cargar colores personalizados
  const colores = localStorage.getItem('coloresPersonalizados');
  if (colores) {
    APP.coloresPersonalizados = JSON.parse(colores);
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
  } else {
    APP.items = [...DATOS_MAPA];
  }
}

/* ==========================================================================
   14. INICIALIZACIÓN DE LA APLICACIÓN
   ========================================================================== */
function init() {
  cachearNodos();
  cargarTiposPersonalizados();
  cargarItems();
  
  // Inicializar valor del control de marcadores
  APP.nodos.controlMarcador.value = APP.configuracion.escalaMarcar;
  APP.nodos.outputMarcador.textContent = `${APP.configuracion.escalaMarcar}x`;
  document.documentElement.style.setProperty('--escala-marcador', APP.configuracion.escalaMarcar);
  // Inicializar control de tamaño del mapa y la rejilla
  if (APP.nodos.controlTamano) {
    APP.nodos.controlTamano.value = APP.configuracion.tamanoMapa;
    ajustarTamanoMapa(APP.configuracion.tamanoMapa);
  }
  
  // Event listeners - Tema y panel
  if (APP.nodos.btnPanel) {
    APP.nodos.btnPanel.addEventListener('click', alternarPanel);
  }
  if (APP.nodos.btnCerrarPanel) {
    APP.nodos.btnCerrarPanel.addEventListener('click', cerrarPanel);
  }
  
  // Event listeners - Vistas (USANDO DELEGACIÓN DE EVENTOS)
  document.querySelector('.panel__controles').addEventListener('click', (e) => {
    const boton = e.target.closest('[data-vista]');
    if (boton) {
      e.stopPropagation();
      cambiarVista(boton.dataset.vista);
    }
  });
  
  document.querySelector('[data-controles-mapa]').addEventListener('click', (e) => {
    const boton = e.target.closest('[data-vista-rapida]');
    if (boton) {
      e.stopPropagation();
      cambiarVista(boton.dataset.vistaRapida);
    }
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
    
    // Asegurar que el campo se oculta al cancelar
    APP.nodos.campoNuevoTipo.classList.remove('formulario-item__campo--visible');
    APP.nodos.campoNuevoTipo.classList.add('formulario-item__campo--oculto');
    APP.nodos.inputNuevoTipo.required = false;
    
    coordenadasTemporales = null;
  });
  
  // Event listener - Select de tipo 
  APP.nodos.selectTipo.addEventListener('change', (e) => {
    if (e.target.value === 'nuevo') {
      // Mostrar campos para nuevo tipo
      APP.nodos.campoNuevoTipo.classList.remove('formulario-item__campo--oculto');
      APP.nodos.campoNuevoTipo.classList.add('formulario-item__campo--visible');
      APP.nodos.inputNuevoTipo.required = true;
    } else {
      // Ocultar campos para nuevo tipo
      APP.nodos.campoNuevoTipo.classList.remove('formulario-item__campo--visible');
      APP.nodos.campoNuevoTipo.classList.add('formulario-item__campo--oculto');
      APP.nodos.inputNuevoTipo.required = false;
      
      // Limpiar valores de los campos ocultos
      APP.nodos.inputNuevoTipo.value = '';
      APP.nodos.inputIcono.value = '';
    }
  });
  
  // Event listeners - Drag & drop
  APP.nodos.mapa.addEventListener('dragover', handleDragOverMapa);
  APP.nodos.mapa.addEventListener('drop', handleDropMapa);
  
  // Renderizar ítems iniciales
  renderizarItems();
}

/* ==========================================================================
   15. EJECUCIÓN SEGURA
   ========================================================================== */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Activar modo eliminación
let modoEliminacion = false;

// Activar modo eliminación
const btnFlotanteDel = document.querySelector('.btn-flotante-del');
if (btnFlotanteDel) {
  btnFlotanteDel.addEventListener('click', () => {
    modoEliminacion = true;
    document.body.classList.add('modo-eliminacion-activo');
  });
}

// Eliminar marcador al hacer clic en él si está activo el modo eliminación
function handleEliminarMarcador(e) {
  if (!modoEliminacion) return;
  const itemElement = e.currentTarget;
  const itemId = parseInt(itemElement.getAttribute('data-item-id'));
  const idx = APP.items.findIndex(i => i.id === itemId);
  if (idx !== -1) {
    const nombre = APP.items[idx].nombre;
    APP.items.splice(idx, 1);
    guardarItems();
    renderizarItems();
  }
  modoEliminacion = false;
  document.body.classList.remove('modo-eliminacion-activo');
}
