/*
 * Asistente de vacantes (WR-Asistente): contador de preguntas (−/+), competencias con peso (range),
 * resumen en vivo y autoguardado como borrador (fetch al backend).
 */
(function () {
  'use strict';
  var form = document.querySelector('[data-asistente]');
  if (!form) return;

  var lista = form.querySelector('[data-comp-list]');
  var plantilla = form.querySelector('[data-comp-template]');
  var vacio = form.querySelector('[data-comp-vacio]');
  var stepInput = form.querySelector('[data-step-input]');
  var stepOut = form.querySelector('[data-step-output]');
  var $ = function (s) { return form.querySelector(s); };

  function resumen() {
    var n = Number(stepInput.value);
    $('[data-res-preguntas]').textContent = n + ' preguntas';
    $('[data-res-repreguntas]').textContent = form.elements.repreguntas.value;
    $('[data-res-duracion]').textContent = form.elements.duracion.value;
    var total = lista.querySelectorAll('[data-comp-row]').length;
    $('[data-res-competencias]').textContent = total;
    vacio.hidden = total > 0;
  }

  /* ---------- Nº de preguntas ---------- */
  form.addEventListener('click', function (e) {
    var b = e.target.closest('[data-step]');
    if (!b) return;
    var min = Number(stepInput.getAttribute('data-min'));
    var max = Number(stepInput.getAttribute('data-max'));
    var n = Math.min(max, Math.max(min, Number(stepInput.value) + Number(b.getAttribute('data-step'))));
    stepInput.value = n;
    stepOut.textContent = n;
    form.querySelector('[data-step="-1"]').disabled = n <= min;
    form.querySelector('[data-step="1"]').disabled = n >= max;
    resumen();
    programarGuardado();
  });

  /* ---------- Competencias ---------- */
  function menuItem(nombre) {
    return form.querySelector('[data-add-competencia="' + CSS.escape(nombre) + '"]');
  }

  form.addEventListener('click', function (e) {
    var add = e.target.closest('[data-add-competencia]');
    if (add) {
      var nombre = add.getAttribute('data-add-competencia');
      var html = plantilla.innerHTML.replace(/__i__/g, String(Date.now()));
      var tmp = document.createElement('ul');
      tmp.innerHTML = html.trim();
      var li = tmp.firstElementChild;
      li.querySelector('[data-comp-name]').textContent = nombre;
      li.querySelector('[data-comp-input]').value = nombre;
      li.querySelector('[data-comp-peso]').setAttribute('aria-label', 'Peso de ' + nombre);
      li.querySelector('[data-comp-remove]').setAttribute('aria-label', 'Quitar ' + nombre);
      lista.appendChild(li);
      add.hidden = true;
      li.querySelector('[data-comp-peso]').focus();
      resumen();
      programarGuardado();
      return;
    }
    var quitar = e.target.closest('[data-comp-remove]');
    if (quitar) {
      var row = quitar.closest('[data-comp-row]');
      var item = menuItem(row.querySelector('[data-comp-input]').value);
      if (item) item.hidden = false;
      row.remove();
      form.querySelector('[data-dropdown-toggle][aria-controls="as-comp-menu"]').focus();
      resumen();
      programarGuardado();
    }
  });

  form.addEventListener('input', function (e) {
    if (e.target.matches('[data-comp-peso]')) e.target.closest('[data-comp-row]').querySelector('[data-comp-peso-out]').textContent = e.target.value;
    programarGuardado();
  });
  form.addEventListener('change', function (e) {
    if (e.target.name === 'repreguntas' || e.target.name === 'duracion') resumen();
    programarGuardado();
  });
  form.addEventListener('ty:tagschange', programarGuardado);

  /* ---------- Autoguardado ---------- */
  var url = form.getAttribute('data-autosave-url');
  var estado = form.querySelector('[data-autosave-status]');
  var idInput = form.querySelector('[data-asistente-id]');
  var timer = null;

  function programarGuardado() {
    if (!url) return;
    clearTimeout(timer);
    timer = setTimeout(guardar, 1500);
  }

  function guardar() {
    if (!form.elements.titulo.value.trim()) return;
    estado.textContent = ' · Guardando…';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams(new FormData(form)).toString(),
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.ok) { estado.textContent = ''; return; }
        idInput.value = d.id;
        estado.textContent = ' · Borrador guardado a las ' + d.hora;
      })
      .catch(function () { estado.textContent = ' · No pudimos guardar el borrador'; });
  }

  form.addEventListener('submit', function () { clearTimeout(timer); });
  resumen();
})();
