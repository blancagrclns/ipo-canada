// Elementos del DOM para el toggle de tema
const btnTema = document.getElementById('btnTema');
const darkThemeLink = document.getElementById('dark-theme');
const html = document.documentElement;

// Función para toggle tema oscuro
function toggleTema() {
  const isDark = html.getAttribute('data-theme') === 'dark';
  if (isDark) {
    activarModoClaro();
  } else {
    activarModoOscuro();
  }
}

// Event listener para el botón de tema
btnTema.addEventListener('click', toggleTema);

// Aplicar el tema guardado al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  const temaGuardado = localStorage.getItem('tema-tablero');

  if (temaGuardado === 'dark') {
    activarModoOscuro();
  } else {
    activarModoClaro();
  }
});

// Funciones para gestionar el modo oscuro/claro
function activarModoOscuro() {
  html.setAttribute('data-theme', 'dark');
  if (darkThemeLink) darkThemeLink.disabled = false;
  btnTema.innerHTML = '☀️';
  btnTema.setAttribute('aria-label', 'Cambiar al modo claro');
  btnTema.setAttribute('title', 'Cambiar al modo claro'); 
  localStorage.setItem('tema-tablero', 'dark');
}

function activarModoClaro() {
  html.removeAttribute('data-theme');
  if (darkThemeLink) darkThemeLink.disabled = true;
  btnTema.innerHTML = '🌙';
  btnTema.setAttribute('aria-label', 'Cambiar al modo oscuro');
  btnTema.setAttribute('title', 'Cambiar al modo oscuro'); 
  localStorage.setItem('tema-tablero', 'light');
}