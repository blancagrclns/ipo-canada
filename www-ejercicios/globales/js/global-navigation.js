// ==========================================================================
// NAVEGACIÓN GLOBAL - Gestión unificada de botones y componentes
// ==========================================================================

class GlobalNavigation {
  constructor() {
    this.init();
  }

  init() {
    this.setupThemeToggle();
    this.setupConfigPanel();
    this.setupHelpModal();
    this.setupEscapeKey();
    this.setupCrossPageThemeSync(); // Nueva funcionalidad
  }

  // ==========================================================================
  // SINCRONIZACIÓN DE TEMA ENTRE PÁGINAS
  // ==========================================================================
  
  setupCrossPageThemeSync() {
    // Escuchar cambios de localStorage desde otras ventanas/pestañas
    window.addEventListener('storage', (e) => {
      if (e.key === 'tema') {
        this.aplicarTemaDesdeStorage(e.newValue);
      }
    });

    // Escuchar eventos personalizados dentro de la misma página
    window.addEventListener('themeChanged', (e) => {
      this.aplicarTema(e.detail.theme);
    });
  }

  aplicarTemaDesdeStorage(nuevoTema) {
    const html = document.documentElement;
    const darkThemeLink = document.getElementById('dark-theme');
    
    if (nuevoTema === 'dark') {
      this.activarModoOscuro(html, darkThemeLink);
    } else {
      this.activarModoClaro(html, darkThemeLink);
    }
  }

  aplicarTema(tema) {
    const html = document.documentElement;
    const darkThemeLink = document.getElementById('dark-theme');
    
    if (tema === 'dark') {
      this.activarModoOscuro(html, darkThemeLink);
    } else {
      this.activarModoClaro(html, darkThemeLink);
    }
  }

  // ==========================================================================
  // GESTIÓN DEL TEMA OSCURO (Modificado)
  // ==========================================================================
  
  setupThemeToggle() {
    const btnTema = document.querySelector('[data-accion="cambiar-tema"]');
    const darkThemeLink = document.getElementById('dark-theme');
    const html = document.documentElement;

    if (!btnTema || !darkThemeLink) return;

    // Aplicar tema guardado al cargar
    const temaGuardado = localStorage.getItem('tema');
    if (temaGuardado === 'dark') {
      this.activarModoOscuro(html, darkThemeLink);
    } else {
      this.activarModoClaro(html, darkThemeLink);
    }

    // Event listener para toggle (modificado)
    btnTema.addEventListener('click', () => {
      this.toggleTema(html, darkThemeLink);
    });
  }

  toggleTema(html, darkThemeLink) {
    const isDark = html.getAttribute('data-theme') === 'dark';
    const nuevoTema = isDark ? 'light' : 'dark';
    
    if (isDark) {
      this.activarModoClaro(html, darkThemeLink);
    } else {
      this.activarModoOscuro(html, darkThemeLink);
    }
    
    // Disparar evento para sincronización en la misma página
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: nuevoTema }
    }));
  }

  activarModoOscuro(html, darkThemeLink) {
    html.setAttribute('data-theme', 'dark');
    if (darkThemeLink) darkThemeLink.disabled = false;
    localStorage.setItem('tema', 'dark');
  }

  activarModoClaro(html, darkThemeLink) {
    html.removeAttribute('data-theme');
    if (darkThemeLink) darkThemeLink.disabled = true;
    localStorage.setItem('tema', 'light');
  }

  // ==========================================================================
  // GESTIÓN DEL PANEL DE CONFIGURACIÓN
  // ==========================================================================

  setupConfigPanel() {
    const panelConfig = document.getElementById('panel-config');
    const btnConfiguracion = document.querySelector('[data-accion="abrir-configuracion"]');
    const btnCerrarPanel = document.querySelector('[data-accion="cerrar-panel"]');

    if (!panelConfig || !btnConfiguracion) return;

    // Abrir panel
    btnConfiguracion.addEventListener('click', () => {
      panelConfig.classList.add('panel-config--abierto');
      this.cargarConfiguracionGuardada();
    });

    // Cerrar panel
    if (btnCerrarPanel) {
      btnCerrarPanel.addEventListener('click', () => {
        panelConfig.classList.remove('panel-config--abierto');
      });
    }

    // Cerrar panel al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (panelConfig.classList.contains('panel-config--abierto') && 
          !panelConfig.contains(e.target) && 
          !btnConfiguracion.contains(e.target)) {
        panelConfig.classList.remove('panel-config--abierto');
      }
    });

    // Configurar funcionalidad del panel
    this.setupConfigurationControls();
  }

  cargarConfiguracionGuardada() {
    const checkboxBilingue = document.getElementById('modoBilingue');
    const selectOrigen = document.getElementById('idiomaOrigen');
    const selectDestino = document.getElementById('idiomaDestino');

    if (!checkboxBilingue || !selectOrigen || !selectDestino) return;

    // Cargar valores guardados
    const bilingueGuardado = localStorage.getItem('modoBilingue') === 'true';
    const origenGuardado = localStorage.getItem('idiomaOrigen') || 'en';
    const destinoGuardado = localStorage.getItem('idiomaDestino') || 'es';
    
    checkboxBilingue.checked = bilingueGuardado;
    selectOrigen.value = origenGuardado;
    selectDestino.value = destinoGuardado;
    
    this.actualizarEstadoSelectores();
  }

  setupConfigurationControls() {
    const checkboxBilingue = document.getElementById('modoBilingue');
    const selectOrigen = document.getElementById('idiomaOrigen');
    const selectDestino = document.getElementById('idiomaDestino');

    if (!checkboxBilingue || !selectOrigen || !selectDestino) return;

    // Listener para checkbox bilingüe
    checkboxBilingue.addEventListener('change', () => {
      this.actualizarEstadoSelectores();
      localStorage.setItem('modoBilingue', checkboxBilingue.checked);
    });

    // Listeners para selectores de idioma
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

    // Guardar otros controles si existen
    const numPalabras = document.getElementById('numPalabras');
    const tiempoMax = document.getElementById('tiempoMax');

    if (numPalabras) {
      numPalabras.addEventListener('change', () => {
        localStorage.setItem('numPalabras', numPalabras.value);
      });
      
      // Cargar valor guardado
      const palabrasGuardadas = localStorage.getItem('numPalabras');
      if (palabrasGuardadas) {
        numPalabras.value = palabrasGuardadas;
      }
    }

    if (tiempoMax) {
      tiempoMax.addEventListener('change', () => {
        localStorage.setItem('tiempoMax', tiempoMax.value);
      });
      
      // Cargar valor guardado
      const tiempoGuardado = localStorage.getItem('tiempoMax');
      if (tiempoGuardado) {
        tiempoMax.value = tiempoGuardado;
      }
    }
  }

  actualizarEstadoSelectores() {
    const checkboxBilingue = document.getElementById('modoBilingue');
    const selectOrigen = document.getElementById('idiomaOrigen');
    const selectDestino = document.getElementById('idiomaDestino');

    if (!checkboxBilingue || !selectOrigen || !selectDestino) return;

    const isChecked = checkboxBilingue.checked;
    selectOrigen.disabled = !isChecked;
    selectDestino.disabled = !isChecked;
  }

  // ==========================================================================
  // GESTIÓN DEL MODAL DE AYUDA
  // ==========================================================================

  setupHelpModal() {
    const modalAyuda = document.getElementById('modal-ayuda');
    const btnAyuda = document.querySelector('[data-accion="mostrar-ayuda"]');

    if (!modalAyuda || !btnAyuda) return;

    // Abrir modal
    btnAyuda.addEventListener('click', () => {
      modalAyuda.showModal();
    });

    // Cerrar modal al hacer clic en el backdrop
    modalAyuda.addEventListener('click', (e) => {
      const rect = modalAyuda.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        modalAyuda.close();
      }
    });
  }

  // ==========================================================================
  // GESTIÓN DE TECLAS GLOBALES
  // ==========================================================================

  setupEscapeKey() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Cerrar panel de configuración
        const panelConfig = document.getElementById('panel-config');
        if (panelConfig && panelConfig.classList.contains('panel-config--abierto')) {
          panelConfig.classList.remove('panel-config--abierto');
          e.preventDefault();
          return;
        }

        // Cerrar modal de ayuda
        const modalAyuda = document.getElementById('modal-ayuda');
        if (modalAyuda && modalAyuda.open) {
          modalAyuda.close();
          e.preventDefault();
          return;
        }

        // Cerrar otros modales si existen
        const modalStats = document.getElementById('modalStats');
        if (modalStats && modalStats.open) {
          modalStats.close();
          e.preventDefault();
          return;
        }
      }
    });
  }

  // ==========================================================================
  // MÉTODOS PÚBLICOS PARA INTEGRACIÓN CON OTRAS PÁGINAS
  // ==========================================================================

  // Método para cerrar todos los elementos abiertos
  closeAllOpenElements() {
    const panelConfig = document.getElementById('panel-config');
    if (panelConfig) {
      panelConfig.classList.remove('panel-config--abierto');
    }

    const modalAyuda = document.getElementById('modal-ayuda');
    if (modalAyuda && modalAyuda.open) {
      modalAyuda.close();
    }
  }

  // Método para obtener configuración actual
  getCurrentConfiguration() {
    return {
      tema: localStorage.getItem('tema') || 'light',
      modoBilingue: localStorage.getItem('modoBilingue') === 'true',
      idiomaOrigen: localStorage.getItem('idiomaOrigen') || 'en',
      idiomaDestino: localStorage.getItem('idiomaDestino') || 'es',
      numPalabras: localStorage.getItem('numPalabras') || '15',
      tiempoMax: localStorage.getItem('tiempoMax') || '60'
    };
  }

  // Método para establecer configuración
  setConfiguration(config) {
    Object.keys(config).forEach(key => {
      localStorage.setItem(key, config[key]);
    });
    
    // Recargar configuración si el panel está abierto
    const panelConfig = document.getElementById('panel-config');
    if (panelConfig && panelConfig.classList.contains('panel-config--abierto')) {
      this.cargarConfiguracionGuardada();
    }
  }
}

// ==========================================================================
// INICIALIZACIÓN AUTOMÁTICA
// ==========================================================================

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.globalNavigation = new GlobalNavigation();
  });
} else {
  window.globalNavigation = new GlobalNavigation();
}

// Exportar para uso en otros scripts
window.GlobalNavigation = GlobalNavigation;
