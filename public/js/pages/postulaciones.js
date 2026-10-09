// /candidato/postulaciones: filtro por estado (chips) y visibilidad de los chips según la pestaña.
(function () {
  'use strict';
  var filtros = document.querySelector('[data-post-filtros]');
  var lista = document.querySelector('[data-post-lista]');
  var vacio = document.querySelector('[data-post-vacio]');
  if (!filtros || !lista) return;

  var aplicar = function (valor) {
    var visibles = 0;
    lista.querySelectorAll('[data-estado]').forEach(function (card) {
      var ok = valor === 'todas' || card.getAttribute('data-estado') === valor;
      card.hidden = !ok;
      if (ok) visibles++;
    });
    vacio.hidden = visibles > 0;
  };

  filtros.addEventListener('ty:chipchange', function (e) { aplicar(e.detail.value); });

  vacio.querySelector('[data-post-todas]').addEventListener('click', function () {
    filtros.querySelector('[data-value="todas"]').click();
  });

  document.addEventListener('ty:tabchange', function (e) {
    if (!e.target.matches('[data-tabs-param="tab"]')) return;
    filtros.hidden = e.detail.tab.getAttribute('data-value') !== 'postulaciones';
  });
})();
