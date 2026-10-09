// Solo para /dev/componentes: rellena el drawer de ejemplo con los datos de la vacante elegida.
document.addEventListener('ty:draweropen', function (e) {
  var trigger = e.detail && e.detail.trigger;
  if (!trigger || e.target.id !== 'demo-drawer') return;
  e.target.querySelector('[data-demo="puesto"]').textContent = trigger.getAttribute('data-puesto');
  e.target.querySelector('[data-demo="empresa"]').textContent = trigger.getAttribute('data-empresa');
  e.target.querySelector('[data-demo="match"]').textContent = 'Match ' + trigger.getAttribute('data-match') + '%';
});
