// Elementos del DOM para el toggle de tema
const btnTema = document.getElementById('btnTema');
const darkThemeLink = document.getElementById('dark-theme');
const html = document.documentElement; // Definir html en ámbito global

// Función para toggle tema oscuro
function toggleTema() {
  const isDark = html.getAttribute('data-theme') === 'dark';
  if (isDark) {
    html.removeAttribute('data-theme');
    darkThemeLink.disabled = true;
    btnTema.textContent = '🌙'; // Luna para activar modo oscuro
    localStorage.setItem('tema', 'light');
  } else {
    html.setAttribute('data-theme', 'dark');
    darkThemeLink.disabled = false;
    btnTema.textContent = '☀️'; // Sol para activar modo claro
    localStorage.setItem('tema', 'dark');
  }
}

// Funciones para gestionar el modo oscuro/claro
function activarModoOscuro() {
  html.setAttribute('data-theme', 'dark');
  if (darkThemeLink) darkThemeLink.disabled = false;
  btnTema.textContent = '☀️'; // Sol cuando está en modo oscuro
  localStorage.setItem('tema', 'dark');
}

function activarModoClaro() {
  html.removeAttribute('data-theme');
  if (darkThemeLink) darkThemeLink.disabled = true;
  btnTema.textContent = '🌙'; // Luna cuando está en modo claro
  localStorage.setItem('tema', 'light');
}

// Event listener para el botón de tema
btnTema.addEventListener('click', toggleTema);

// Aplicar el tema guardado al cargar la página
const temaGuardado = localStorage.getItem('tema');

if (temaGuardado === 'dark') {
  activarModoOscuro();
} else {
  activarModoClaro();
}