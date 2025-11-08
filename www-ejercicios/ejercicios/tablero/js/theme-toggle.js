// Toggle del modo oscuro/claro basado en data-atributos
const btnTema = document.querySelector('[data-accion="cambiar-tema"]');
const darkThemeLink = document.getElementById('dark-theme');
const html = document.documentElement;

function toggleTema() {
  if (!btnTema) {
    return;
  }
  const isDark = html.getAttribute('data-theme') === 'dark';
  if (isDark) {
    activarModoClaro();
  } else {
    activarModoOscuro();
  }
}

if (btnTema) {
  btnTema.addEventListener('click', toggleTema);
}

document.addEventListener('DOMContentLoaded', () => {
  const temaGuardado = localStorage.getItem('tema-tablero');
  if (temaGuardado === 'dark') {
    activarModoOscuro();
  } else {
    activarModoClaro();
  }
});

function activarModoOscuro() {
  html.setAttribute('data-theme', 'dark');
  if (darkThemeLink) {
    darkThemeLink.disabled = false;
  }
  if (btnTema) {
    btnTema.textContent = '☀️';
    btnTema.setAttribute('aria-label', 'Cambiar al modo claro');
    btnTema.setAttribute('title', 'Cambiar al modo claro');
  }
  localStorage.setItem('tema-tablero', 'dark');
}

function activarModoClaro() {
  html.removeAttribute('data-theme');
  if (darkThemeLink) {
    darkThemeLink.disabled = true;
  }
  if (btnTema) {
    btnTema.textContent = '🌙';
    btnTema.setAttribute('aria-label', 'Cambiar al modo oscuro');
    btnTema.setAttribute('title', 'Cambiar al modo oscuro');
  }
  localStorage.setItem('tema-tablero', 'light');
}
