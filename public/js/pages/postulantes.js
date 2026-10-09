/*
 * /empresa/postulantes
 * - Agregar/quitar de la terna sin recargar (máx. 3): actualiza el contador "Exportar terna (n/3)",
 *   el estado de la fila y la lista del modal de exportación.
 * - Modal "Exportar terna": reordenar con ↑/↓ (accesible por teclado).
 * - Audio de la transcripción: solo emite ty:audio (la reproducción la conecta otro módulo).
 */
(function () {
  'use strict';
  var lista = document.querySelector('[data-terna-lista]');
  var botonExportar = document.querySelector('[data-terna-boton]');

  function badgeHtml(estado) {
    var span = document.createElement('span');
    span.className = 'badge' + (estado.variante && estado.variante !== 'neutral' ? ' badge--' + estado.variante : '');
    span.textContent = estado.label;
    return span;
  }

  function renumerar() {
    lista.querySelectorAll('[data-terna-item]').forEach(function (li, i) {
      li.querySelector('[data-terna-pos]').textContent = i + 1;
      li.querySelector('[data-terna-mover="-1"]').disabled = i === 0;
      li.querySelector('[data-terna-mover="1"]').disabled = !li.nextElementSibling;
    });
  }

  function pintarTerna(items) {
    lista.textContent = '';
    items.forEach(function (c) {
      var li = document.createElement('li');
      li.className = 'terna-item';
      li.setAttribute('data-terna-item', c.id);
      li.innerHTML = '<span class="terna-item__pos" data-terna-pos></span><span class="terna-item__body"><strong></strong><span class="text-muted text-small"></span></span>'
        + '<input type="hidden" name="orden"><span class="terna-item__move">'
        + '<button type="button" class="btn-icon btn-icon--outline btn-icon--sm" data-terna-mover="-1"><svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg></button>'
        + '<button type="button" class="btn-icon btn-icon--outline btn-icon--sm" data-terna-mover="1"><svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button></span>';
      li.querySelector('strong').textContent = c.nombre;
      li.querySelector('.text-small').textContent = 'ATS ' + c.ats + ' · Entrevista ' + (c.entrevista == null ? '—' : c.entrevista);
      li.querySelector('input').value = c.id;
      li.querySelector('[data-terna-mover="-1"]').setAttribute('aria-label', 'Subir a ' + c.nombre);
      li.querySelector('[data-terna-mover="1"]').setAttribute('aria-label', 'Bajar a ' + c.nombre);
      lista.appendChild(li);
    });
    renumerar();
  }

  if (lista) {
    renumerar();
    lista.addEventListener('click', function (e) {
      var b = e.target.closest('[data-terna-mover]');
      if (!b) return;
      var li = b.closest('li');
      if (b.getAttribute('data-terna-mover') === '-1' && li.previousElementSibling) li.parentNode.insertBefore(li, li.previousElementSibling);
      else if (b.getAttribute('data-terna-mover') === '1' && li.nextElementSibling) li.parentNode.insertBefore(li.nextElementSibling, li);
      renumerar();
      var foco = li.querySelector('[data-terna-mover="' + b.getAttribute('data-terna-mover') + '"]');
      (foco.disabled ? li.querySelector('button:not([disabled])') : foco).focus();
    });
  }

  // Agregar / quitar de la terna (el formulario vive dentro del drawer, que puede recargarse por fetch).
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('[data-terna-toggle]');
    if (!form) return;
    e.preventDefault();
    var btn = form.querySelector('[data-terna-label]');
    btn.disabled = true;
    fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        btn.disabled = false;
        if (!d.ok) {
          TY.toast({ mensaje: d.error === 'terna-llena' ? 'La terna ya tiene 3 candidatos. Quita uno para agregar otro.' : 'No se puede agregar a un candidato descartado.', variante: 'error' });
          return;
        }
        btn.textContent = d.enTerna ? 'Quitar de la terna' : 'Agregar a la terna';
        document.querySelectorAll('[data-terna-count]').forEach(function (el) { el.textContent = d.total; });
        if (botonExportar) botonExportar.disabled = d.total === 0;
        var id = form.action.match(/postulantes\/(\d+)\//)[1];
        var fila = document.querySelector('[data-postulante-row="' + id + '"]');
        if (fila) {
          var grupos = (fila.getAttribute('data-grupo') || '').split(' ').filter(function (g) { return g !== 'terna'; });
          if (d.enTerna) grupos.push('terna');
          fila.setAttribute('data-grupo', grupos.join(' '));
          var celda = fila.querySelector('[data-estado-cell]');
          celda.textContent = '';
          celda.appendChild(badgeHtml(d.estado));
        }
        var estadoDrawer = document.querySelector('[data-drawer-estado]');
        if (estadoDrawer) { estadoDrawer.textContent = ''; estadoDrawer.appendChild(badgeHtml(d.estado)); }
        if (lista) pintarTerna(d.terna);
        TY.toast({ mensaje: d.enTerna ? 'Agregado a la terna.' : 'Quitado de la terna.', variante: 'success', timeout: 3000 });
      })
      .catch(function () { form.submit(); });
  });

  document.addEventListener('click', function (e) {
    var play = e.target.closest('[data-action="reproducir-audio"]');
    if (play) document.dispatchEvent(new CustomEvent('ty:audio', { detail: { boton: play } }));
  });
})();
