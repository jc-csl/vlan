'use strict';

(() => {
  const button = document.getElementById('presentation-toggle');
  const status = document.getElementById('presentation-status');

  function update() {
    const active = document.fullscreenElement === document.documentElement;
    button.textContent = active ? '⛶ Salir de presentación' : '⛶ Modo presentación';
    button.setAttribute('aria-pressed', String(active));
  }

  if (!document.fullscreenEnabled || !document.documentElement.requestFullscreen) {
    button.disabled = true;
    status.textContent = 'La pantalla completa no está disponible en este navegador.';
    return;
  }

  document.addEventListener('fullscreenchange', update);
  button.addEventListener('click', async () => {
    status.textContent = '';
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (error) {
      console.error('No se pudo cambiar el modo de pantalla completa:', error);
      status.textContent = 'No se pudo cambiar a pantalla completa. Comprueba los permisos del navegador.';
    }
  });
})();
