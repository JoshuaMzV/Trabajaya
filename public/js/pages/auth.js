/*
 * Modales de auth: pasos del registro (rol → datos) sin recargar y medidor de contraseña.
 * Sin JS, el paso 1 envía GET /registro?paso=2&rol=… y el servidor muestra el paso 2.
 */
(function () {
  'use strict';

  var dialog = document.getElementById('modal-registro');
  if (dialog) {
    var paso1 = dialog.querySelector('[data-registro-paso="1"]');
    var paso2 = dialog.querySelector('[data-registro-paso="2"]');
    var etiquetas = { candidato: 'Busco empleo', empresa: 'Contrato talento' };

    var irAPaso = function (n) {
      paso1.hidden = n !== 1;
      paso2.hidden = n !== 2;
      dialog.setAttribute('data-paso', String(n));
      dialog.setAttribute('aria-labelledby', 'registro-t' + n);
      var foco = n === 2 ? paso2.querySelector('#registro-nombre') : paso1.querySelector('input[name="rol"]:checked');
      if (foco) foco.focus();
    };

    paso1.addEventListener('submit', function (e) {
      e.preventDefault();
      var elegido = paso1.querySelector('input[name="rol"]:checked');
      var rol = elegido ? elegido.value : 'candidato';
      paso2.querySelector('[data-registro-rol-input]').value = rol;
      paso2.querySelector('[data-registro-rol-label]').textContent = etiquetas[rol];
      irAPaso(2);
    });

    dialog.addEventListener('click', function (e) {
      if (e.target.closest('[data-registro-volver]')) {
        e.preventDefault();
        irAPaso(1);
      }
    });

    // Disparadores del modal: sin data-registro-rol empiezan en el paso 1; con él, van directo al paso 2 con ese rol.
    // (ui.js ya abrió el modal en este mismo clic.)
    document.addEventListener('click', function (e) {
      var opener = e.target.closest('[data-modal-open="modal-registro"]');
      if (!opener || !dialog.open) return;
      var rol = opener.getAttribute('data-registro-rol');
      if (rol) {
        var radio = paso1.querySelector('input[name="rol"][value="' + rol + '"]');
        if (radio) radio.checked = true;
        paso2.querySelector('[data-registro-rol-input]').value = rol;
        paso2.querySelector('[data-registro-rol-label]').textContent = etiquetas[rol];
        irAPaso(2);
      } else {
        irAPaso(1);
      }
    });
  }

  // Medidor de seguridad de la contraseña (solo orientativo; la validación real es del backend).
  var mensajes = [
    'Usa al menos 8 caracteres.',
    'Débil. Usa al menos 8 caracteres.',
    'Regular. Combina mayúsculas, minúsculas y números.',
    'Buena. Agrega un símbolo para hacerla más segura.',
    'Muy segura.'
  ];

  function nivel(valor) {
    if (!valor) return 0;
    if (valor.length < 8) return 1;
    var n = 1;
    if (/[a-z]/.test(valor) && /[A-Z]/.test(valor)) n++;
    if (/\d/.test(valor)) n++;
    if (/[^A-Za-z0-9]/.test(valor)) n++;
    return Math.min(n, 4);
  }

  document.querySelectorAll('[data-strength-input]').forEach(function (input) {
    var field = input.closest('.field');
    var barras = field.querySelectorAll('[data-strength-meter] span');
    var texto = field.querySelector('[data-strength-text]');
    var actualizar = function () {
      var n = nivel(input.value);
      barras.forEach(function (b, i) { b.classList.toggle('is-on', i < n); });
      texto.textContent = mensajes[n];
    };
    input.addEventListener('input', actualizar);
    actualizar();
  });
})();
