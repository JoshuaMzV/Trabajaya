/*
 * /candidato/expediente
 * - Subida: arrastrar y soltar, validación de PDF y tamaño (orientativa) y envío automático al elegir archivo.
 * - "Leyendo": consulta el estado al backend y recarga cuando cambia.
 * - Modales de experiencia/educación: se rellenan con data-item al editar.
 */
(function () {
  'use strict';

  /* ---------- Subida del CV ---------- */
  document.querySelectorAll('[data-upload-form]').forEach(function (form) {
    var input = form.querySelector('[data-upload-input]');
    var error = form.querySelector('[data-upload-error]');
    var maxMb = Number(form.getAttribute('data-max-mb')) || 10;
    var zona = form.querySelector('[data-dropzone]');

    var mostrarError = function (msg) {
      if (!error) { window.TY && TY.toast({ mensaje: msg, variante: 'error' }); return; }
      error.textContent = msg;
      error.hidden = !msg;
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    };

    var enviar = function (file) {
      if (!file) return;
      if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) return mostrarError('El archivo debe ser un PDF.');
      if (file.size > maxMb * 1024 * 1024) return mostrarError('El archivo pesa más de ' + maxMb + ' MB.');
      mostrarError('');
      form.submit();
    };

    input.addEventListener('change', function () { enviar(input.files[0]); });

    if (zona) {
      ['dragenter', 'dragover'].forEach(function (ev) {
        zona.addEventListener(ev, function (e) { e.preventDefault(); zona.classList.add('is-over'); });
      });
      ['dragleave', 'drop'].forEach(function (ev) {
        zona.addEventListener(ev, function () { zona.classList.remove('is-over'); });
      });
      zona.addEventListener('drop', function (e) {
        e.preventDefault();
        var files = e.dataTransfer && e.dataTransfer.files;
        if (!files || !files.length) return;
        input.files = files;
        enviar(files[0]);
      });
    }
  });

  /* ---------- Lectura en curso ---------- */
  var poll = document.querySelector('[data-expediente-poll]');
  if (poll) {
    var url = poll.getAttribute('data-expediente-poll');
    var timer = setInterval(function () {
      fetch(url, { headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (d) { if (d.estado !== 'leyendo') { clearInterval(timer); window.location.reload(); } })
        .catch(function () { /* se reintenta en el siguiente ciclo */ });
    }, 2000);
  }

  /* ---------- Modales de experiencia / educación ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-modal-open][data-item]');
    if (!btn) return;
    var dialog = document.getElementById(btn.getAttribute('data-modal-open'));
    if (!dialog || !dialog.hasAttribute('data-item-modal')) return;
    var form = dialog.querySelector('form');
    var raw = btn.getAttribute('data-item');
    var item = raw ? JSON.parse(raw) : {};
    form.reset();
    Array.prototype.forEach.call(form.elements, function (el) {
      if (el.name && el.name in item) el.value = item[el.name];
      if (el.name === 'id') el.value = item.id || '';
    });
    var titulo = dialog.querySelector('[data-title-new]');
    titulo.textContent = raw ? titulo.getAttribute('data-title-edit') : titulo.getAttribute('data-title-new');
  });
})();
