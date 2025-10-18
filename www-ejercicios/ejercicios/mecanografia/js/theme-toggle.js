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
    btnTema.textContent = 'Tema Oscuro';
  } else {
    html.setAttribute('data-theme', 'dark');
    darkThemeLink.disabled = false;
    btnTema.textContent = 'Tema Claro';
  }
}

// Event listener para el botón de tema
btnTema.addEventListener('click', toggleTema);

// Aplicar el tema guardado al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  const temaGuardado = localStorage.getItem('tema');

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
  btnTema.textContent = 'Tema Claro';
  localStorage.setItem('tema', 'dark');
}

function activarModoClaro() {
  html.removeAttribute('data-theme');
  if (darkThemeLink) darkThemeLink.disabled = true;
  btnTema.textContent = 'Tema Oscuro';
  localStorage.setItem('tema', 'light');
}