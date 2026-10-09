// /admin/ajustes: fila nueva de pack, sección del formulario según la pestaña y filtro inicial de tickets.
(function () {
  'use strict';
  var tabs = document.querySelector('[data-ajustes-tabs]');
  var guardar = document.querySelector('[data-ajustes-guardar]');
  var seccion = document.querySelector('[data-ajustes-seccion]');

  if (tabs) {
    tabs.addEventListener('ty:tabchange', function (e) {
      var v = e.detail.tab.getAttribute('data-value');
      guardar.hidden = v === 'soporte';
      if (v !== 'soporte') seccion.value = v;
    });
  }

  var nuevo = document.querySelector('[data-pack-nuevo]');
  var cuerpo = document.querySelector('[data-packs-body]');
  var plantilla = document.querySelector('[data-pack-template]');
  if (nuevo && cuerpo && plantilla) {
    nuevo.addEventListener('click', function () {
      var fila = plantilla.content.firstElementChild.cloneNode(true);
      fila.querySelector('input[name="packActivo"]').value = 'nuevo-' + cuerpo.rows.length;
      cuerpo.appendChild(fila);
      fila.querySelector('input[name="packNombre"]').focus();
    });
  }

  // La lista de tickets empieza filtrada por "Abiertos" (el chip ya viene marcado desde el servidor).
  var chips = document.querySelector('[data-filter-for="lista-tickets"]');
  if (chips) chips.dispatchEvent(new CustomEvent('ty:chipchange', { bubbles: true, detail: { value: 'abiertos' } }));
})();
