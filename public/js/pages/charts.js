/*
 * Gráficos SVG (partials chart-columnas / chart-lineas): capa de hover y teclado.
 * - Columnas: la columna del día es el objetivo (toda la banda); se resalta y muestra el tooltip.
 * - Líneas: una guía vertical sigue al puntero y se ajusta al día más cercano; un tooltip con todas las series.
 * - Teclado: el SVG es enfocable; ← → recorren los días, Esc oculta el tooltip.
 * Los valores salen de la vista de tabla del mismo gráfico (los tooltips nunca son la única vía).
 */
(function () {
  'use strict';

  document.querySelectorAll('[data-chart]').forEach(function (fig) {
    var tipo = fig.getAttribute('data-chart');
    var svg = fig.querySelector('[data-chart-svg]');
    var tip = fig.querySelector('[data-chart-tip]');
    var plot = fig.querySelector('.chart__plot');
    var hits = Array.prototype.slice.call(fig.querySelectorAll('.chart__hits rect'));
    var filas = fig.querySelectorAll('[data-chart-table] tbody tr');
    var cabeceras = Array.prototype.map.call(fig.querySelectorAll('[data-chart-table] thead th'), function (th) { return th.textContent; });
    var cross = fig.querySelector('[data-crosshair]');
    var puntos = fig.querySelectorAll('[data-hover-dot]');
    var actual = -1;

    function mostrar(i) {
      if (i < 0 || i >= hits.length) return;
      actual = i;
      var fila = filas[i];
      var celdas = fila.querySelectorAll('td');
      tip.textContent = '';
      var titulo = document.createElement('div');
      titulo.className = 'chart__tip-title';
      titulo.textContent = fila.querySelector('th').textContent;
      tip.appendChild(titulo);
      celdas.forEach(function (td, k) {
        var esTotal = tipo === 'columnas' && k === celdas.length - 1;
        var row = document.createElement('div');
        row.className = 'chart__tip-row';
        var key = document.createElement('span');
        key.className = 'chart__tip-key' + (esTotal ? '' : ' chart__key--' + (k + 1));
        var val = document.createElement('strong');
        val.textContent = td.textContent;
        var lab = document.createElement('span');
        lab.textContent = cabeceras[k + 1];
        row.append(key, val, lab);
        tip.appendChild(row);
      });
      tip.hidden = false;

      var rect = hits[i];
      var cx = Number(rect.getAttribute('data-cx'));
      var vb = svg.viewBox.baseVal;
      var escala = svg.getBoundingClientRect().width / vb.width;
      var izq = cx * escala;
      var maxIzq = plot.clientWidth - tip.offsetWidth - 4;
      tip.style.left = Math.max(4, Math.min(maxIzq, izq + 12)) + 'px';

      if (tipo === 'columnas') {
        fig.querySelectorAll('.chart__col').forEach(function (g) { g.classList.toggle('is-dim', g.getAttribute('data-i') !== String(i)); });
      } else {
        cross.setAttribute('x1', cx); cross.setAttribute('x2', cx); cross.removeAttribute('hidden');
        puntos.forEach(function (p) {
          p.setAttribute('cx', cx);
          p.setAttribute('cy', rect.getAttribute('data-y' + p.getAttribute('data-hover-dot')));
          p.removeAttribute('hidden');
        });
      }
    }

    function ocultar() {
      actual = -1;
      tip.hidden = true;
      fig.querySelectorAll('.chart__col').forEach(function (g) { g.classList.remove('is-dim'); });
      if (cross) cross.setAttribute('hidden', '');
      puntos.forEach(function (p) { p.setAttribute('hidden', ''); });
    }

    svg.addEventListener('pointermove', function (e) {
      var pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      var p = pt.matrixTransform(svg.getScreenCTM().inverse());
      var mejor = 0, dist = Infinity;
      hits.forEach(function (r, i) {
        var d = Math.abs(Number(r.getAttribute('data-cx')) - p.x);
        if (d < dist) { dist = d; mejor = i; }
      });
      if (mejor !== actual) mostrar(mejor);
    });
    svg.addEventListener('pointerleave', ocultar);
    svg.addEventListener('blur', ocultar);
    svg.addEventListener('focus', function () { mostrar(actual >= 0 ? actual : hits.length - 1); });
    svg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); mostrar(Math.min(hits.length - 1, actual + 1)); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); mostrar(Math.max(0, actual - 1)); }
      else if (e.key === 'Home') { e.preventDefault(); mostrar(0); }
      else if (e.key === 'End') { e.preventDefault(); mostrar(hits.length - 1); }
      else if (e.key === 'Escape') ocultar();
    });
  });
})();
