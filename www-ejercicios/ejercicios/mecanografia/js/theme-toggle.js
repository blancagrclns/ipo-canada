// ==========================================================================
// FUNCIONALIDAD ESPECÍFICA DE MECANOGRAFÍA
// La funcionalidad general de navegación está en global-navigation.js
// ==========================================================================

// Exportar modal de stats para uso en script.js
const modalStats = document.getElementById('modalStats');
window.modalStats = modalStats;

// Cerrar modal de estadísticas al hacer clic en el backdrop
if (modalStats) {
  modalStats.addEventListener('click', (e) => {
    const rect = modalStats.getBoundingClientRect();
    const isInDialog = (
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width
    );
    if (!isInDialog) {
      modalStats.close();
    }
  });
}