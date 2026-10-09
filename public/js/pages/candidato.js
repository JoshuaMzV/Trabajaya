/*
 * Comportamientos comunes del área del candidato:
 * - Modal de packs: pasos 1 (elegir) → 2 (pagar) en el cliente. El pago lo procesa el backend/pasarela.
 * - Adjuntos: muestra el nombre del archivo elegido en [data-attach-input].
 */
(function () {
  'use strict';

  /* ---------- Modal de packs ---------- */
  var packs = document.getElementById('modal-packs');
  var form = packs && packs.querySelector('[data-packs-form]');
  if (form) {
    var paso1 = form.querySelector('[data-packs-paso="1"]');
    var paso2 = form.querySelector('[data-packs-paso="2"]');
    var tipo = form.querySelector('[data-packs-tipo]');
    var pasos = packs.querySelectorAll('[data-packs-stepper] li');

    var marcarPaso = function (n) {
      packs.setAttribute('data-paso', String(n));
      pasos.forEach(function (li, i) {
        li.classList.toggle('is-done', i + 1 < n);
        if (i + 1 === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
    };

    var seleccion = function () {
      if (tipo.value === 'pro') {
        var pro = document.getElementById('packs-pro');
        return { resumen: pro.getAttribute('data-resumen'), precio: pro.getAttribute('data-precio') };
      }
      var radio = form.querySelector('input[name="pack"]:checked');
      return { resumen: radio.getAttribute('data-resumen'), precio: radio.getAttribute('data-precio') };
    };

    var irA = function (n, opts) {
      paso1.hidden = n !== 1;
      paso2.hidden = n !== 2;
      marcarPaso(n);
      if (n === 2) {
        var s = seleccion();
        form.querySelector('[data-packs-resumen]').textContent = s.resumen;
        form.querySelectorAll('[data-packs-precio]').forEach(function (el) { el.textContent = s.precio; });
        packs.dispatchEvent(new CustomEvent('ty:pasarela', { bubbles: true, detail: { tipo: tipo.value, precio: s.precio } }));
      }
      if (opts && opts.sinFoco) return;
      var foco = n === 1 ? (form.querySelector('input[name="pack"]:checked') || paso1.querySelector('button')) : paso2.querySelector('button');
      if (foco) foco.focus();
    };

    packs.addEventListener('ty:tabchange', function (e) {
      tipo.value = e.detail.tab.getAttribute('data-value');
    });
    form.querySelector('[data-packs-next]').addEventListener('click', function () { irA(2); });
    form.querySelector('[data-packs-prev]').addEventListener('click', function () { irA(1); });
    // Al reabrir el modal se empieza de nuevo en el paso 1.
    packs.addEventListener('ty:modalopen', function () { irA(1, { sinFoco: true }); });
  }

  /* ---------- Adjuntos ---------- */
  document.querySelectorAll('[data-attach-input]').forEach(function (input) {
    var label = input.closest('label').querySelector('[data-attach-label]');
    var original = label.textContent;
    input.addEventListener('change', function () {
      label.textContent = input.files && input.files[0] ? input.files[0].name : original;
    });
  });
})();
