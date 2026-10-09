/*
 * TrabajaYa · comportamientos de UI con atributos data-* (sin frameworks).
 *
 * Tabs      [role=tablist] > [role=tab][aria-controls]       · data-tabs-param="tab" sincroniza ?tab= en la URL
 * Modal     <dialog class="modal" id="x">                     · abrir: [data-modal-open="x"] · cerrar: [data-modal-close]
 *           data-modal-autoopen (abre al cargar) · data-modal-return="/ruta" (URL que se deja al cerrar)
 * Drawer    <aside class="drawer" id="x" hidden>              · abrir: [data-drawer-open="x"] · cerrar: [data-drawer-close]
 *           data-drawer-url en el disparador / data-drawer-close-url en el drawer actualizan la URL sin recargar
 *           data-drawer-src="/ruta/fragmento" carga el contenido del drawer con fetch (con skeleton mientras carga)
 * Dropdown  [data-dropdown] > [data-dropdown-toggle] + [data-dropdown-menu]
 * Toast     [data-toast] > [data-toast-close] · data-toast-timeout="ms" · JS: TY.toast({ titulo, mensaje, variante })
 *           Disparador declarativo: [data-toast-trigger][data-toast-message][data-toast-title][data-toast-variant]
 * Chips     [data-chip-group] > .chip[aria-pressed] (selección única; emite ty:chipchange)
 * Confirmar [data-confirm] en un botón submit abre #modal-confirmar (partial modal-confirmar)
 * Filtros   [data-filter-list] + controles [data-filter-for][data-filter-key] (tabs, chips, select, búsqueda)
 * Etiquetas [data-tags][data-tags-name] > [data-tags-list] + [data-tags-input] · [data-tags-remove]
 * Ordenar   table[data-sortable] th[aria-sort] > button[data-sort="clave"] (filas con data-<clave>)
 * Menú      [data-nav-toggle][aria-controls="x"] abre/cierra el panel x (menú lateral y header en móvil) · [data-nav-close]
 * Otros     [data-password-toggle][aria-controls="input"] · img[data-avatar-img] cae a iniciales si falla
 */
(function () {
  'use strict';

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function focusables(root) {
    return Array.prototype.filter.call(root.querySelectorAll(FOCUSABLE), function (el) {
      return el.offsetParent !== null || el === document.activeElement;
    });
  }

  function replaceUrl(url) {
    if (url && window.history && history.replaceState) history.replaceState(null, '', url);
  }

  function setParam(name, value) {
    var url = new URL(window.location.href);
    if (value === null || value === undefined || value === '') url.searchParams.delete(name);
    else url.searchParams.set(name, value);
    replaceUrl(url.pathname + url.search + url.hash);
  }

  /* ---------------------------------------------------------------- Tabs */
  function tabsOf(list) {
    return Array.prototype.filter.call(list.querySelectorAll('[role="tab"]'), function (t) {
      return t.closest('[role="tablist"]') === list;
    });
  }

  function selectTab(tab, opts) {
    var list = tab.closest('[role="tablist"]');
    if (!list) return;
    tabsOf(list).forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = t.getAttribute('aria-controls') && document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    if (opts && opts.focus) tab.focus();
    var param = list.getAttribute('data-tabs-param');
    if (param && !(opts && opts.silent)) setParam(param, tab.getAttribute('data-value') || tab.id);
    list.dispatchEvent(new CustomEvent('ty:tabchange', { bubbles: true, detail: { tab: tab } }));
  }

  function initTabs(root) {
    root.querySelectorAll('[role="tablist"]').forEach(function (list) {
      var tabs = tabsOf(list);
      if (!tabs.length) return;
      var current = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
      selectTab(current, { silent: true });
    });
  }

  document.addEventListener('click', function (e) {
    var tab = e.target.closest('[role="tab"]');
    if (tab && tab.closest('[role="tablist"]')) {
      if (tab.tagName === 'A') e.preventDefault();
      selectTab(tab);
    }
  });

  document.addEventListener('keydown', function (e) {
    var tab = e.target.closest && e.target.closest('[role="tab"]');
    if (!tab) return;
    var list = tab.closest('[role="tablist"]');
    var tabs = tabsOf(list);
    var i = tabs.indexOf(tab);
    var vertical = list.getAttribute('aria-orientation') === 'vertical';
    var next = { ArrowRight: !vertical, ArrowDown: vertical };
    var prev = { ArrowLeft: !vertical, ArrowUp: vertical };
    var target = null;
    if (next[e.key]) target = tabs[(i + 1) % tabs.length];
    else if (prev[e.key]) target = tabs[(i - 1 + tabs.length) % tabs.length];
    else if (e.key === 'Home') target = tabs[0];
    else if (e.key === 'End') target = tabs[tabs.length - 1];
    if (target) {
      e.preventDefault();
      selectTab(target, { focus: true });
    }
  });

  /* --------------------------------------------------------------- Modal */
  var modalOpeners = new WeakMap();
  var modalReturns = new WeakMap();
  var modalSwitching = new WeakSet();

  function openModal(dialog, opener, returnUrl) {
    if (typeof dialog === 'string') dialog = document.getElementById(dialog);
    if (!dialog || typeof dialog.showModal !== 'function') return false;
    if (dialog.open) return true;
    modalOpeners.set(dialog, opener || document.activeElement);
    if (returnUrl) modalReturns.set(dialog, returnUrl);
    dialog.showModal();
    // Foco inicial: [autofocus], o el primer campo de formulario visible, o el primer elemento enfocable.
    var fields = focusables(dialog).filter(function (el) { return el.matches('input:not([type="hidden"]), select, textarea'); });
    var first = dialog.querySelector('[autofocus]') || fields[0] || focusables(dialog)[0];
    // En un grupo de radios, el foco va a la opción marcada.
    if (first && first.type === 'radio' && first.name) {
      first = dialog.querySelector('input[type="radio"][name="' + first.name + '"]:checked') || first;
    }
    if (first) first.focus();
    dialog.dispatchEvent(new CustomEvent('ty:modalopen', { bubbles: true }));
    return true;
  }

  function closeModal(dialog, value) {
    if (typeof dialog === 'string') dialog = document.getElementById(dialog);
    if (dialog && dialog.open) dialog.close(value);
  }

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-modal-open]');
    if (opener) {
      var target = document.getElementById(opener.getAttribute('data-modal-open'));
      // Si el modal no existe en esta página, el enlace navega a su ruta como respaldo.
      if (!target || typeof target.showModal !== 'function') return;
      e.preventDefault();
      var current = opener.closest('dialog[open]');
      if (current && current !== target) {
        // Cambio entre modales (Entrar ↔ Registro ↔ Recuperar): se cierra uno y se abre el otro,
        // conservando el elemento que abrió el primero y la URL de retorno.
        var origin = modalOpeners.get(current);
        var ret = modalReturns.get(current);
        modalSwitching.add(current);
        current.close();
        openModal(target, origin, ret);
      } else {
        openModal(target, opener);
      }
      return;
    }
    var closer = e.target.closest('[data-modal-close]');
    if (closer) {
      var dlg = closer.closest('dialog');
      if (dlg) {
        e.preventDefault();
        closeModal(dlg);
      }
      return;
    }
    // Clic en el fondo (fuera del recuadro del diálogo).
    if (e.target.tagName === 'DIALOG' && e.target.classList.contains('modal') && e.target.open) {
      var r = e.target.getBoundingClientRect();
      var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside && !e.target.hasAttribute('data-modal-static')) closeModal(e.target);
    }
  });

  // Foco atrapado dentro del modal abierto.
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var dialog = document.querySelector('dialog[open]');
    if (!dialog || !dialog.matches(':modal')) return;
    var items = focusables(dialog);
    if (!items.length) { e.preventDefault(); return; }
    var first = items[0];
    var last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
      e.preventDefault(); first.focus();
    }
  });

  document.addEventListener('close', function (e) {
    var dialog = e.target;
    if (!(dialog instanceof HTMLDialogElement)) return;
    var switching = modalSwitching.has(dialog);
    var ret = modalReturns.get(dialog);
    modalSwitching.delete(dialog);
    modalReturns.delete(dialog);
    var opener = modalOpeners.get(dialog);
    modalOpeners.delete(dialog);
    if (!switching) {
      if (ret) replaceUrl(ret);
      if (opener && document.contains(opener) && typeof opener.focus === 'function') opener.focus();
    }
    dialog.dispatchEvent(new CustomEvent('ty:modalclose', { bubbles: true }));
  }, true);

  /* -------------------------------------------------------------- Drawer */
  var drawerOpeners = new WeakMap();

  function openDrawer(drawer, trigger) {
    if (typeof drawer === 'string') drawer = document.getElementById(drawer);
    if (!drawer) return false;
    drawer.hidden = false;
    drawerOpeners.set(drawer, trigger || document.activeElement);
    document.querySelectorAll('[data-drawer-open="' + drawer.id + '"]').forEach(function (t) {
      var on = t === trigger;
      if (t.hasAttribute('aria-pressed')) t.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (t.hasAttribute('aria-expanded')) t.setAttribute('aria-expanded', on ? 'true' : 'false');
      if (t.hasAttribute('data-drawer-current')) { if (on) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current'); }
    });
    if (trigger && trigger.getAttribute('data-drawer-url')) replaceUrl(trigger.getAttribute('data-drawer-url'));
    var focusTarget = drawer.querySelector('[data-drawer-focus]') || drawer.querySelector('h2, h3') || drawer;
    if (!focusTarget.hasAttribute('tabindex') && !focusTarget.matches(FOCUSABLE)) focusTarget.setAttribute('tabindex', '-1');
    focusTarget.focus({ preventScroll: window.matchMedia('(min-width: 1101px)').matches });
    drawer.dispatchEvent(new CustomEvent('ty:draweropen', { bubbles: true, detail: { trigger: trigger } }));
    return true;
  }

  function closeDrawer(drawer) {
    if (typeof drawer === 'string') drawer = document.getElementById(drawer);
    if (!drawer || drawer.hidden) return;
    drawer.hidden = true;
    document.querySelectorAll('[data-drawer-open="' + drawer.id + '"]').forEach(function (t) {
      if (t.hasAttribute('aria-pressed')) t.setAttribute('aria-pressed', 'false');
      if (t.hasAttribute('aria-expanded')) t.setAttribute('aria-expanded', 'false');
      if (t.hasAttribute('data-drawer-current')) t.removeAttribute('aria-current');
    });
    if (drawer.getAttribute('data-drawer-close-url')) replaceUrl(drawer.getAttribute('data-drawer-close-url'));
    var opener = drawerOpeners.get(drawer);
    if (opener && document.contains(opener) && typeof opener.focus === 'function') opener.focus();
    drawer.dispatchEvent(new CustomEvent('ty:drawerclose', { bubbles: true }));
  }

  // Con data-drawer-src el contenido se pide al servidor (fragmento HTML) antes de mostrarlo.
  // Si falla, se sigue el href del disparador (el servidor abre el drawer con ?param=:id).
  var SKELETON = '<div class="drawer__loading" role="status" aria-label="Cargando"><span class="skeleton skeleton--title"></span><span class="skeleton"></span><span class="skeleton skeleton--90"></span><span class="skeleton skeleton--70"></span></div>';

  function loadDrawer(drawer, trigger) {
    var src = trigger.getAttribute('data-drawer-src');
    drawer.setAttribute('aria-busy', 'true');
    drawer.innerHTML = SKELETON;
    openDrawer(drawer, trigger);
    fetch(src, { headers: { 'X-Requested-With': 'fetch' }, credentials: 'same-origin' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (html) {
        drawer.innerHTML = html;
        drawer.removeAttribute('aria-busy');
        initTabs(drawer);
        var focusTarget = drawer.querySelector('[data-drawer-focus]') || drawer.querySelector('h2, h3');
        if (focusTarget) {
          if (!focusTarget.hasAttribute('tabindex')) focusTarget.setAttribute('tabindex', '-1');
          focusTarget.focus({ preventScroll: true });
        }
        drawer.dispatchEvent(new CustomEvent('ty:drawerload', { bubbles: true, detail: { trigger: trigger } }));
      })
      .catch(function () {
        if (trigger.href) window.location.href = trigger.href;
      });
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-drawer-open]');
    if (trigger) {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return; // abrir en otra pestaña
      var target = document.getElementById(trigger.getAttribute('data-drawer-open'));
      if (!target) return;
      e.preventDefault();
      if (trigger.hasAttribute('data-drawer-src')) loadDrawer(target, trigger);
      else openDrawer(target, trigger);
      return;
    }
    var closer = e.target.closest('[data-drawer-close]');
    if (closer) {
      var drawer = closer.getAttribute('data-drawer-close') ? document.getElementById(closer.getAttribute('data-drawer-close')) : closer.closest('.drawer');
      if (drawer) {
        e.preventDefault();
        closeDrawer(drawer);
      }
    }
  });

  /* ------------------------------------------------------------ Dropdown */
  function menuItems(menu) {
    return Array.prototype.slice.call(menu.querySelectorAll('[role="menuitem"]'));
  }

  function setDropdown(dd, open, opts) {
    var toggle = dd.querySelector('[data-dropdown-toggle]');
    var menu = dd.querySelector('[data-dropdown-menu]');
    if (!toggle || !menu) return;
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      document.querySelectorAll('[data-dropdown]').forEach(function (other) {
        if (other !== dd) setDropdown(other, false);
      });
      if (opts && opts.focusFirst) {
        var first = menuItems(menu)[0] || focusables(menu)[0];
        if (first) first.focus();
      }
    } else if (opts && opts.returnFocus) {
      toggle.focus();
    }
  }

  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-dropdown-toggle]');
    if (toggle) {
      var dd = toggle.closest('[data-dropdown]');
      setDropdown(dd, toggle.getAttribute('aria-expanded') !== 'true', { focusFirst: e.detail === 0 });
      return;
    }
    document.querySelectorAll('[data-dropdown]').forEach(function (dd) {
      if (!dd.contains(e.target)) setDropdown(dd, false);
    });
  });

  document.addEventListener('keydown', function (e) {
    var dd = e.target.closest && e.target.closest('[data-dropdown]');
    if (!dd) return;
    var menu = dd.querySelector('[data-dropdown-menu]');
    if (e.key === 'Escape' && menu && !menu.hidden) {
      e.preventDefault();
      setDropdown(dd, false, { returnFocus: true });
      return;
    }
    // Flechas solo en menús con role="menu".
    if (!menu || menu.hidden || menu.getAttribute('role') !== 'menu') return;
    var items = menuItems(menu);
    var i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    else if (e.key === 'Home') { e.preventDefault(); items[0].focus(); }
    else if (e.key === 'End') { e.preventDefault(); items[items.length - 1].focus(); }
  });

  document.addEventListener('focusout', function (e) {
    var dd = e.target.closest && e.target.closest('[data-dropdown]');
    if (dd && e.relatedTarget && !dd.contains(e.relatedTarget)) setDropdown(dd, false);
  });

  /* --------------------------------------------------------------- Toast */
  var ICONS = {
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    success: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    error: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>'
  };

  function svg(inner, size) {
    return '<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + inner + '</svg>';
  }

  function dismissToast(el) {
    if (!el || el.classList.contains('is-leaving')) return;
    el.classList.add('is-leaving');
    setTimeout(function () { el.remove(); }, 200);
  }

  function scheduleToast(el) {
    var ms = parseInt(el.getAttribute('data-toast-timeout'), 10);
    if (ms > 0) setTimeout(function () { dismissToast(el); }, ms);
  }

  function toast(opts) {
    opts = opts || {};
    var variante = opts.variante || 'info';
    var region = document.querySelector('[data-toast-region]');
    if (!region) {
      region = document.createElement('div');
      region.className = 'toast-region';
      region.setAttribute('data-toast-region', '');
      document.body.appendChild(region);
    }
    var el = document.createElement('div');
    el.className = 'toast toast--' + variante;
    el.setAttribute('role', variante === 'error' ? 'alert' : 'status');
    el.setAttribute('data-toast', '');
    var timeout = opts.timeout === undefined ? 6000 : opts.timeout;
    if (timeout) el.setAttribute('data-toast-timeout', String(timeout));

    var body = document.createElement('span');
    body.className = 'toast__body';
    body.innerHTML = svg(ICONS[variante] || ICONS.info, 20);
    var text = document.createElement('span');
    body.appendChild(text);

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'btn-icon btn-icon--on-dark';
    close.setAttribute('data-toast-close', '');
    close.setAttribute('aria-label', 'Cerrar aviso');
    close.innerHTML = svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', 16);

    el.appendChild(body);
    el.appendChild(close);
    region.appendChild(el);

    // El texto se inserta después para que los lectores de pantalla anuncien el cambio.
    requestAnimationFrame(function () {
      if (opts.titulo) {
        var strong = document.createElement('strong');
        strong.textContent = opts.titulo;
        text.appendChild(strong);
        text.appendChild(document.createTextNode(' '));
      }
      text.appendChild(document.createTextNode(opts.mensaje || ''));
    });
    scheduleToast(el);
    return el;
  }

  document.addEventListener('click', function (e) {
    var close = e.target.closest('[data-toast-close]');
    if (close) {
      dismissToast(close.closest('[data-toast]'));
      return;
    }
    var trigger = e.target.closest('[data-toast-trigger]');
    if (trigger) {
      toast({
        titulo: trigger.getAttribute('data-toast-title'),
        mensaje: trigger.getAttribute('data-toast-message'),
        variante: trigger.getAttribute('data-toast-variant') || 'info'
      });
    }
  });

  /* ---------------------------------- Menú móvil (sidebar y header público) */
  function setNav(toggle, open, opts) {
    var panel = document.getElementById(toggle.getAttribute('aria-controls'));
    if (!panel) return;
    if (open) panel.setAttribute('data-open', '');
    else panel.removeAttribute('data-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if (open) {
      var first = panel.querySelector('[aria-current="page"]') || focusables(panel)[0];
      if (first) setTimeout(function () { first.focus(); }, 50);
    } else if (opts && opts.returnFocus) {
      toggle.focus();
    }
  }

  function openNavToggles() {
    return Array.prototype.filter.call(document.querySelectorAll('[data-nav-toggle]'), function (t) {
      return t.getAttribute('aria-expanded') === 'true';
    });
  }

  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-nav-toggle]');
    if (toggle) {
      setNav(toggle, toggle.getAttribute('aria-expanded') !== 'true');
      return;
    }
    var closer = e.target.closest('[data-nav-close]');
    openNavToggles().forEach(function (t) {
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (closer && panel && panel.contains(closer)) setNav(t, false, { returnFocus: true });
      else if (panel && !panel.contains(e.target)) setNav(t, false);
    });
  });

  /* ------------------------------------- Chips de filtro (selección única) */
  document.addEventListener('click', function (e) {
    var chip = e.target.closest('[data-chip-group] [aria-pressed]');
    if (!chip) return;
    var group = chip.closest('[data-chip-group]');
    group.querySelectorAll('[aria-pressed]').forEach(function (c) {
      c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
    });
    group.dispatchEvent(new CustomEvent('ty:chipchange', { bubbles: true, detail: { chip: chip, value: chip.getAttribute('data-value') || chip.textContent.trim() } }));
  });

  /* ------------------------------------------------- Contraseña y avatares */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-password-toggle]');
    if (!btn) return;
    var input = document.getElementById(btn.getAttribute('aria-controls'));
    if (!input) return;
    var show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.textContent = show ? 'Ocultar' : 'Mostrar';
    btn.setAttribute('aria-pressed', show ? 'true' : 'false');
  });

  document.addEventListener('error', function (e) {
    if (e.target.matches && e.target.matches('img[data-avatar-img]')) e.target.remove();
  }, true);

  /* ------------------------------- Envío automático (form[data-autosubmit]) */
  // Envía el formulario al cambiar un <select> (filtros del muro, vacante de la Sala o de Postulantes, periodo).
  document.addEventListener('change', function (e) {
    var f = e.target.matches('select') && e.target.closest('form[data-autosubmit]');
    if (f) f.requestSubmit ? f.requestSubmit() : f.submit();
  });

  /* ------------------------------------------- Confirmación ([data-confirm]) */
  var pendingForm = null;
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-confirm]');
    if (!btn || !btn.form) return;
    var dialog = document.getElementById('modal-confirmar');
    if (!dialog) return;
    e.preventDefault();
    pendingForm = { form: btn.form, submitter: btn };
    var slot = function (n) { return dialog.querySelector('[data-confirm-slot="' + n + '"]'); };
    slot('title').textContent = btn.getAttribute('data-confirm-title') || '¿Confirmar?';
    slot('text').textContent = btn.getAttribute('data-confirm-text') || '';
    var ok = slot('ok');
    ok.textContent = btn.getAttribute('data-confirm-label') || btn.textContent.trim();
    ok.className = 'btn ' + (btn.getAttribute('data-confirm-variante') === 'danger' ? 'btn--danger' : 'btn--ink');
    var match = btn.getAttribute('data-confirm-match');
    var campo = slot('match');
    var input = campo.querySelector('input');
    campo.hidden = !match;
    input.value = '';
    slot('match-text').textContent = match || '';
    ok.disabled = Boolean(match);
    input.oninput = function () { ok.disabled = input.value.trim() !== match; };
    openModal(dialog, btn);
    if (match) input.focus();
  });
  document.addEventListener('click', function (e) {
    var ok = e.target.closest('#modal-confirmar [data-confirm-slot="ok"]');
    if (!ok || !pendingForm) return;
    var p = pendingForm;
    pendingForm = null;
    closeModal('modal-confirmar');
    // Conserva name/value del botón que disparó la confirmación.
    if (p.submitter.name) {
      var h = document.createElement('input');
      h.type = 'hidden'; h.name = p.submitter.name; h.value = p.submitter.value;
      p.form.appendChild(h);
    }
    if (p.submitter.formAction && p.submitter.hasAttribute('formaction')) p.form.action = p.submitter.formAction;
    p.form.submit();
  });

  /* ------------------------------------- Filtros de listas ([data-filter-list]) */
  // Controles con data-filter-for="<id de la lista>" y data-filter-key="<atributo>":
  //   tablist (data-value de la pestaña) · [data-chip-group] · <select> · <input type="search"> (key "q": texto)
  //   data-filter-min en un control compara numéricamente (item >= valor).
  // Ítems: [data-filter-item] con data-<key>. Vacío: [data-filter-empty="<id>"].
  var filtros = {};
  var TODOS = { '': 1, todas: 1, todos: 1 };

  function aplicarFiltro(id) {
    var lista = document.getElementById(id);
    if (!lista) return;
    var f = filtros[id] || {};
    var visibles = 0;
    lista.querySelectorAll('[data-filter-item]').forEach(function (item) {
      var ok = Object.keys(f).every(function (key) {
        var c = f[key];
        if (c.valor === '' || TODOS[c.valor]) return true;
        if (key === 'q') return item.textContent.toLowerCase().indexOf(c.valor.toLowerCase()) !== -1;
        var v = item.getAttribute('data-' + key);
        if (c.min) return Number(v) >= Number(c.valor);
        return (v || '').split(' ').indexOf(c.valor) !== -1;
      });
      item.hidden = !ok;
      if (ok) visibles++;
    });
    var vacio = document.querySelector('[data-filter-empty="' + id + '"]');
    if (vacio) vacio.hidden = visibles > 0;
  }

  function setFiltro(control, valor) {
    var id = control.getAttribute('data-filter-for');
    if (!id) return;
    filtros[id] = filtros[id] || {};
    filtros[id][control.getAttribute('data-filter-key') || 'q'] = { valor: valor, min: control.hasAttribute('data-filter-min') };
    aplicarFiltro(id);
  }

  document.addEventListener('ty:tabchange', function (e) {
    if (e.target.hasAttribute && e.target.hasAttribute('data-filter-for')) setFiltro(e.target, e.detail.tab.getAttribute('data-value') || '');
  });
  document.addEventListener('ty:chipchange', function (e) {
    if (e.target.hasAttribute('data-filter-for')) setFiltro(e.target, e.detail.value);
  });
  document.addEventListener('input', function (e) {
    if (e.target.matches('input[data-filter-for]')) setFiltro(e.target, e.target.value.trim());
  });
  document.addEventListener('change', function (e) {
    if (e.target.matches('select[data-filter-for]')) setFiltro(e.target, e.target.value);
  });

  /* ------------------------------------------- Etiquetas ([data-tags]) */
  // <div data-tags data-tags-name="skills"><ul data-tags-list>…</ul><input data-tags-input></div>
  // Cada etiqueta lleva un input hidden name=<data-tags-name>. Enter o coma añade; × quita.
  var X_SVG = '<svg class="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

  function agregarTag(box, texto) {
    texto = texto.trim();
    if (!texto) return;
    var name = box.getAttribute('data-tags-name');
    var lista = box.querySelector('[data-tags-list]');
    var existe = Array.prototype.some.call(lista.querySelectorAll('input[type="hidden"]'), function (i) { return i.value.toLowerCase() === texto.toLowerCase(); });
    if (existe) return;
    var li = document.createElement('li');
    li.className = 'skill-chip';
    var span = document.createElement('span');
    span.textContent = texto;
    var hidden = document.createElement('input');
    hidden.type = 'hidden'; hidden.name = name; hidden.value = texto;
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'skill-chip__x'; btn.setAttribute('data-tags-remove', '');
    btn.setAttribute('aria-label', 'Quitar ' + texto);
    btn.innerHTML = X_SVG;
    li.append(span, hidden, btn);
    lista.appendChild(li);
    box.dispatchEvent(new CustomEvent('ty:tagschange', { bubbles: true }));
  }

  document.addEventListener('keydown', function (e) {
    var input = e.target.closest && e.target.closest('[data-tags-input]');
    if (!input || (e.key !== 'Enter' && e.key !== ',')) return;
    e.preventDefault();
    agregarTag(input.closest('[data-tags]'), input.value);
    input.value = '';
  });
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-tags-remove]');
    if (!btn) return;
    var box = btn.closest('[data-tags]');
    var li = btn.closest('li');
    var siguiente = li.nextElementSibling || li.previousElementSibling;
    li.remove();
    (siguiente ? siguiente.querySelector('button') : box.querySelector('[data-tags-input]')).focus();
    box.dispatchEvent(new CustomEvent('ty:tagschange', { bubbles: true }));
  });

  /* ------------------------------------------- Tablas ordenables ([data-sortable]) */
  // <th aria-sort="none"><button data-sort="ats">ATS</button></th>; las filas llevan data-ats.
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('table[data-sortable] [data-sort]');
    if (!btn) return;
    var table = btn.closest('table');
    var th = btn.closest('th');
    var key = btn.getAttribute('data-sort');
    var asc = th.getAttribute('aria-sort') === 'descending';
    table.querySelectorAll('th[aria-sort]').forEach(function (h) { h.setAttribute('aria-sort', 'none'); });
    th.setAttribute('aria-sort', asc ? 'ascending' : 'descending');
    var tbody = table.tBodies[0];
    var filas = Array.prototype.slice.call(tbody.rows);
    filas.sort(function (a, b) {
      var va = Number(a.getAttribute('data-' + key)); var vb = Number(b.getAttribute('data-' + key));
      if (isNaN(va)) va = -1; if (isNaN(vb)) vb = -1;
      return asc ? va - vb : vb - va;
    });
    filas.forEach(function (f) { tbody.appendChild(f); });
  });

  /* ------------------------------------------------- Escape global y carga */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    if (document.querySelector('dialog[open]')) return; // el <dialog> nativo gestiona su Escape
    var navs = openNavToggles();
    if (navs.length) {
      navs.forEach(function (t) { setNav(t, false, { returnFocus: true }); });
      return;
    }
    var drawer = e.target.closest && e.target.closest('.drawer:not([hidden])');
    if (!drawer && window.matchMedia('(max-width: 1100px)').matches) drawer = document.querySelector('.drawer:not([hidden])');
    if (drawer) closeDrawer(drawer);
  });

  function init() {
    initTabs(document);
    document.querySelectorAll('img[data-avatar-img]').forEach(function (img) {
      if (img.complete && img.naturalWidth === 0) img.remove();
    });
    document.querySelectorAll('[data-toast]').forEach(scheduleToast);
    var auto = document.querySelector('dialog[data-modal-autoopen]');
    if (auto) openModal(auto, null, auto.getAttribute('data-modal-return'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.TY = {
    toast: toast,
    openModal: openModal,
    closeModal: closeModal,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    selectTab: selectTab
  };
})();
