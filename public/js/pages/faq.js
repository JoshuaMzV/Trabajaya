// /faq: cambio de categoría sin recargar y búsqueda en todas las preguntas.
(function () {
  'use strict';
  var cats = document.querySelector('[data-faq-cats]');
  var search = document.querySelector('[data-faq-search]');
  var empty = document.querySelector('[data-faq-empty]');
  if (!cats) return;
  var groups = Array.prototype.slice.call(document.querySelectorAll('[data-faq-group]'));
  var items = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));
  var actual = (cats.querySelector('[aria-current]') || cats.querySelector('[data-faq-cat]')).getAttribute('data-faq-cat');

  var normalizar = function (s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  };

  var mostrarCategoria = function (key) {
    actual = key;
    cats.querySelectorAll('[data-faq-cat]').forEach(function (a) {
      if (a.getAttribute('data-faq-cat') === key) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    groups.forEach(function (g) { g.hidden = g.getAttribute('data-faq-group') !== key; });
    items.forEach(function (d) { d.hidden = false; });
    empty.hidden = true;
  };

  cats.addEventListener('click', function (e) {
    var link = e.target.closest('[data-faq-cat]');
    if (!link) return;
    e.preventDefault();
    if (search) search.value = '';
    mostrarCategoria(link.getAttribute('data-faq-cat'));
    var url = new URL(window.location.href);
    url.searchParams.set('cat', actual);
    history.replaceState(null, '', url.pathname + url.search);
  });

  if (!search) return;
  search.addEventListener('input', function () {
    var q = normalizar(search.value.trim());
    if (!q) { mostrarCategoria(actual); return; }
    var hay = 0;
    groups.forEach(function (g) { g.hidden = false; });
    items.forEach(function (d) {
      var coincide = normalizar(d.textContent).indexOf(q) !== -1;
      d.hidden = !coincide;
      if (coincide) hay++;
    });
    groups.forEach(function (g) { g.hidden = !g.querySelector('.faq-item:not([hidden])'); });
    empty.hidden = hay > 0;
  });
  // /faq?q=… (búsqueda desde la mesa de ayuda)
  if (search.value.trim()) search.dispatchEvent(new Event('input'));
})();
