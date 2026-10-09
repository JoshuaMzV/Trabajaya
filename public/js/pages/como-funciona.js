// /como-funciona: resalta en el selector "Si buscas empleo / Si contratas" la sección visible.
(function () {
  'use strict';
  var nav = document.querySelector('[data-anchor-nav]');
  if (!nav || !('IntersectionObserver' in window)) return;
  var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));

  var activar = function (id) {
    links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + id); });
  };

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) activar(entry.target.id);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  links.forEach(function (a) {
    var section = document.querySelector(a.getAttribute('href'));
    if (section) observer.observe(section);
    a.addEventListener('click', function () { activar(section.id); });
  });
})();
