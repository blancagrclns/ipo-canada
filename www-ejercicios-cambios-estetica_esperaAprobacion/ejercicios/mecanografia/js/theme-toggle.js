// Elementos del DOM para el toggle de tema
const btnTema = document.getElementById('btnTema');
const darkThemeLink = document.getElementById('dark-theme');

// Función para toggle tema oscuro
function toggleTema() {
  const html = document.documentElement;
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