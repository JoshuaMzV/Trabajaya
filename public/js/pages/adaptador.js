// /candidato/adaptador: estado "cargando" mientras el backend genera el CV, e impresión de la hoja A4.
(function () {
  'use strict';
  var form = document.querySelector('[data-adaptador-form]');
  var estado = document.querySelector('[data-preview-state]');
  var cargando = document.querySelector('[data-preview-loading]');

  if (form) {
    form.addEventListener('submit', function () {
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = btn.getAttribute('data-submit-label') || btn.textContent;
      if (estado) estado.hidden = true;
      if (cargando) cargando.hidden = false;
    });
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-action="imprimir"]')) window.print();
  });
})();
