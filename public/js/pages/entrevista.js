/*
 * /candidato/entrevista · Sala de Entrevista IA (solo UI).
 * La grabación, la transcripción y el análisis NO están implementados aquí. Cada acción emite un evento
 * `ty:entrevista` en document con { accion, sesion, form } para que el módulo de audio/IA se conecte:
 *
 *   document.addEventListener('ty:entrevista', (e) => { if (e.detail.accion === 'grabar') … });
 *
 * Acciones: probar-microfono · grabar · detener · escribir · reintentar · enviar-respuesta · finalizar
 * El módulo puede actualizar la UI con TY.entrevista.transcripcion(texto) y TY.entrevista.micEstado(texto).
 */
(function () {
  'use strict';

  var form = document.querySelector('[data-respuesta-form]');
  var sesion = form ? form.getAttribute('data-sesion') : null;

  function emitir(accion, extra) {
    var detail = { accion: accion, sesion: sesion, form: form };
    if (extra) Object.keys(extra).forEach(function (k) { detail[k] = extra[k]; });
    document.dispatchEvent(new CustomEvent('ty:entrevista', { detail: detail }));
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var accion = btn.getAttribute('data-action');

    if (accion === 'grabar') {
      var grabando = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', grabando ? 'false' : 'true');
      btn.setAttribute('aria-label', grabando ? 'Grabar respuesta' : 'Detener grabación');
      emitir(grabando ? 'detener' : 'grabar');
    } else if (accion === 'escribir') {
      var zona = document.getElementById(btn.getAttribute('aria-controls'));
      var abierto = btn.getAttribute('aria-expanded') === 'true';
      zona.hidden = abierto;
      btn.setAttribute('aria-expanded', abierto ? 'false' : 'true');
      btn.textContent = abierto ? 'Escribir en su lugar' : 'Responder por voz';
      if (!abierto) zona.querySelector('textarea').focus();
      emitir('escribir', { abierto: !abierto });
    } else if (accion === 'reintentar') {
      if (form) form.querySelector('textarea').value = '';
      var t = document.querySelector('[data-transcripcion]');
      if (t) t.textContent = 'La transcripción aparecerá aquí mientras hablas.';
      emitir('reintentar');
    } else if (accion === 'probar-microfono') {
      emitir('probar-microfono');
    }
  });

  if (form) {
    form.addEventListener('submit', function () {
      form.querySelector('[data-enviando]').hidden = false;
      form.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
      emitir('enviar-respuesta');
    });
  }

  var finalizar = document.querySelector('[data-action-form="finalizar"]');
  if (finalizar) finalizar.addEventListener('submit', function () { emitir('finalizar'); });

  // Cronómetro de la pregunta.
  var reloj = document.querySelector('[data-timer]');
  if (reloj) {
    var inicio = Date.now();
    setInterval(function () {
      var s = Math.floor((Date.now() - inicio) / 1000);
      reloj.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    }, 1000);
  }

  window.TY = window.TY || {};
  window.TY.entrevista = {
    transcripcion: function (texto) {
      var t = document.querySelector('[data-transcripcion]');
      if (t) t.textContent = texto;
      if (form) form.querySelector('textarea').value = texto;
    },
    micEstado: function (texto) {
      var b = document.querySelector('[data-mic-status]');
      if (b) b.textContent = texto;
    }
  };
})();
