// Elementos del DOM para el toggle de tema
const btnTema = document.querySelector('[data-accion="cambiar-tema"]');
const darkThemeLink = document.getElementById('dark-theme');
const html = document.documentElement;

// Función para toggle tema oscuro
function toggleTema() {
  const isDark = html.getAttribute('data-theme') === 'dark';
  if (isDark) {
    html.removeAttribute('data-theme');
    darkThemeLink.disabled = true;
    localStorage.setItem('tema', 'light');
  } else {
    html.setAttribute('data-theme', 'dark');
    darkThemeLink.disabled = false;
    localStorage.setItem('tema', 'dark');
  }
}

// Funciones para gestionar el modo oscuro/claro
function activarModoOscuro() {
  html.setAttribute('data-theme', 'dark');
  if (darkThemeLink) darkThemeLink.disabled = false;
  localStorage.setItem('tema', 'dark');
}

function activarModoClaro() {
  html.removeAttribute('data-theme');
  if (darkThemeLink) darkThemeLink.disabled = true;
  localStorage.setItem('tema', 'light');
}

// Event listener para el botón de tema
if (btnTema) {
  btnTema.addEventListener('click', toggleTema);
}

// Aplicar el tema guardado al cargar la página
const temaGuardado = localStorage.getItem('tema');

if (temaGuardado === 'dark') {
  activarModoOscuro();
} else {
  activarModoClaro();
}


const modalConfig = document.getElementById('modal-config');
const modalAyuda = document.getElementById('modal-ayuda');
const modalStats = document.getElementById('modalStats');

// Botones que abren modales
const btnConfiguracion = document.querySelector('[data-accion="abrir-configuracion"]');
const btnAyuda = document.querySelector('[data-accion="mostrar-ayuda"]');

// Abrir modales
if (btnConfiguracion && modalConfig) {
  btnConfiguracion.addEventListener('click', () => modalConfig.showModal());
}

if (btnAyuda && modalAyuda) {
  btnAyuda.addEventListener('click', () => modalAyuda.showModal());
}

// Cerrar modal al hacer clic en el backdrop
[modalConfig, modalAyuda, modalStats].forEach(modal => {
  if (modal) {
    modal.addEventListener('click', (e) => {
      const rect = modal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        modal.close();
      }
    });
  }
});

// ==========================================================================
// GESTIÓN DEL MODO BILINGÜE EN CONFIGURACIÓN
// ==========================================================================

const checkboxBilingue = document.getElementById('modoBilingue');
const selectOrigen = document.getElementById('idiomaOrigen');
const selectDestino = document.getElementById('idiomaDestino');

// Función para actualizar el estado de los selectores
function actualizarEstadoSelectores() {
  const isChecked = checkboxBilingue.checked;
  selectOrigen.disabled = !isChecked;
  selectDestino.disabled = !isChecked;
}

// Habilitar/deshabilitar selectores según checkbox
if (checkboxBilingue && selectOrigen && selectDestino) {
  // Restaurar estado guardado al abrir el modal
  if (btnConfiguracion) {
    btnConfiguracion.addEventListener('click', () => {
      // Cargar configuración guardada
      const bilingueGuardado = localStorage.getItem('modoBilingue') === 'true';
      const origenGuardado = localStorage.getItem('idiomaOrigen') || 'en';
      const destinoGuardado = localStorage.getItem('idiomaDestino') || 'es';
      
      checkboxBilingue.checked = bilingueGuardado;
      selectOrigen.value = origenGuardado;
      selectDestino.value = destinoGuardado;
      
      // Actualizar estado de selectores
      actualizarEstadoSelectores();
    });
  }
  
  // Listener para cambios en el checkbox
  checkboxBilingue.addEventListener('change', () => {
    actualizarEstadoSelectores();
    localStorage.setItem('modoBilingue', checkboxBilingue.checked);
  });
  
  // Guardar cambios en los selectores
  selectOrigen.addEventListener('change', () => {
    if (selectOrigen.value === selectDestino.value) {
      selectDestino.value = selectOrigen.value === 'es' ? 'en' : 'es';
    }
    localStorage.setItem('idiomaOrigen', selectOrigen.value);
    localStorage.setItem('idiomaDestino', selectDestino.value);
  });

  selectDestino.addEventListener('change', () => {
    if (selectDestino.value === selectOrigen.value) {
      selectOrigen.value = selectDestino.value === 'es' ? 'en' : 'es';
    }
    localStorage.setItem('idiomaOrigen', selectOrigen.value);
    localStorage.setItem('idiomaDestino', selectDestino.value);
  });
}

// Exportar modal de stats para uso en script.js
window.modalStats = modalStats;