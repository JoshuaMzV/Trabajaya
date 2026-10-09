// /empresa/perfil: vista previa local del logo elegido (la subida real la hace el backend).
(function () {
  'use strict';
  var input = document.querySelector('[data-logo-input]');
  var preview = document.querySelector('[data-logo-preview]');
  if (!input || !preview) return;
  input.addEventListener('change', function () {
    var file = input.files && input.files[0];
    if (!file || !/^image\//.test(file.type)) return;
    var img = preview.querySelector('img') || document.createElement('img');
    img.alt = '';
    img.src = URL.createObjectURL(file);
    preview.appendChild(img);
  });
})();
