/**********************************************************************/
/*  MODO OSCURO / CLARO - CONTROL GLOBAL                              */
/**********************************************************************/

// Elementos del DOM
const btnTema = document.getElementById('btnTema');
const darkThemeLink = document.getElementById('dark-theme');
const html = document.documentElement;

/**********************************************************************/
/*  FUNCIONES                                                         */
/**********************************************************************/

// Aplica el tema guardado al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  const temaGuardado = localStorage.getItem('tema');

  if (temaGuardado === 'dark') {
    activarModoOscuro();
  } else {
    activarModoClaro();
  }
});

// Activa modo oscuro
function activarModoOscuro() {
  html.setAttribute('data-theme', 'dark');
  if (darkThemeLink) darkThemeLink.disabled = false;
  btnTema.textContent = 'Tema Claro';
  localStorage.setItem('tema', 'dark');
}

// Activa modo claro
function activarModoClaro() {
  html.removeAttribute('data-theme');
  if (darkThemeLink) darkThemeLink.disabled = true;
  btnTema.textContent = 'Tema Oscuro';
  localStorage.setItem('tema', 'light');
}

// Alterna entre los modos
function toggleTema() {
  const isDark = html.getAttribute('data-theme') === 'dark';
  if (isDark) {
    activarModoClaro();
  } else {
    activarModoOscuro();
  }
}

/**********************************************************************/
/*  EVENTOS                                                           */
/**********************************************************************/

if (btnTema) {
  btnTema.addEventListener('click', toggleTema);
}
