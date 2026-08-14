(function () {
  'use strict';

  var WHATSAPP_NUMBER = '593980106467';

  /* ---------------------------------------------------------------------
     Header: sombra al hacer scroll
  --------------------------------------------------------------------- */
  var header = document.querySelector('.site-header');
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------------------------------------------------------------------
     Menú móvil
  --------------------------------------------------------------------- */
  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  function closeMobileNav() {
    if (!mobileNav || !navToggle) return;
    mobileNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMobileNav);
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMobileNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 960) closeMobileNav();
    });
  }

  /* ---------------------------------------------------------------------
     Resaltar enlace de navegación activo
  --------------------------------------------------------------------- */
  (function markActiveNav() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-list a, .mobile-nav-list a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        a.setAttribute('aria-current', 'page');
      }
    });
  })();

  /* ---------------------------------------------------------------------
     Reveal on scroll
  --------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------------------
     Año del footer
  --------------------------------------------------------------------- */
  var yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     Catálogo de servicios: filtros por categoría
  --------------------------------------------------------------------- */
  var filterBar = document.querySelector('.filter-bar');
  var serviceCards = document.querySelectorAll('[data-service-card], [data-project-card]');
  var filterCount = document.querySelector('.filter-count');
  var filterLabelSingular = (filterCount && filterCount.getAttribute('data-label-singular')) || 'servicio encontrado';
  var filterLabelPlural = (filterCount && filterCount.getAttribute('data-label-plural')) || 'servicios encontrados';

  function applyFilter(filter) {
    var visible = 0;
    serviceCards.forEach(function (card) {
      var cats = (card.getAttribute('data-categories') || '').split(' ');
      var show = filter === 'todos' || cats.indexOf(filter) !== -1;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    if (filterCount) {
      filterCount.textContent = visible + ' ' + (visible === 1 ? filterLabelSingular : filterLabelPlural);
    }

    var groups = document.querySelectorAll('[data-service-group]');
    if (groups.length) {
      var visibleGroups = 0;
      groups.forEach(function (group) {
        var hasVisible = !!group.querySelector('[data-service-card]:not([style*="display: none"])');
        group.style.display = hasVisible ? '' : 'none';
        if (hasVisible) visibleGroups++;
      });
      var divider = document.querySelector('[data-service-divider]');
      if (divider) divider.style.display = visibleGroups > 1 ? '' : 'none';
    }
  }

  if (filterBar && serviceCards.length) {
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filterBar.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      applyFilter(btn.getAttribute('data-filter'));
    });
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('categoria');
    if (initial) {
      var targetBtn = filterBar.querySelector('[data-filter="' + initial + '"]');
      if (targetBtn) targetBtn.click();
      else applyFilter('todos');
    } else {
      applyFilter('todos');
    }
  }

  /* ---------------------------------------------------------------------
     Modal de detalle de servicio
  --------------------------------------------------------------------- */
  var serviceModal = document.getElementById('service-modal');
  if (serviceModal) {
    var modalIcon = serviceModal.querySelector('[data-modal-icon]');
    var modalTitle = serviceModal.querySelector('[data-modal-title]');
    var modalTags = serviceModal.querySelector('[data-modal-tags]');
    var modalIncludes = serviceModal.querySelector('[data-modal-includes]');
    var modalBenefits = serviceModal.querySelector('[data-modal-benefits]');
    var modalQuoteLink = serviceModal.querySelector('[data-modal-quote]');

    document.querySelectorAll('[data-service-card]').forEach(function (card) {
      var trigger = card.querySelector('[data-open-modal]');
      if (!trigger) return;
      trigger.addEventListener('click', function () {
        var name = card.getAttribute('data-name');
        var iconHTML = card.querySelector('.service-card__icon').innerHTML;
        var includes = (card.getAttribute('data-includes') || '').split('|').filter(Boolean);
        var benefits = (card.getAttribute('data-benefits') || '').split('|').filter(Boolean);
        var tagLabels = card.querySelectorAll('.service-card__tags .tag');

        modalIcon.innerHTML = iconHTML;
        modalTitle.textContent = name;
        modalTags.innerHTML = '';
        tagLabels.forEach(function (t) {
          var span = document.createElement('span');
          span.className = t.className;
          span.textContent = t.textContent;
          modalTags.appendChild(span);
        });
        modalIncludes.innerHTML = includes.map(function (item) {
          return '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg><span>' + item + '</span></li>';
        }).join('');
        modalBenefits.innerHTML = benefits.map(function (item) {
          return '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.6 6.6L22 10l-5.6 4.6L18 22l-6-4-6 4 1.6-7.4L2 10l7.4-1.4z"></path></svg><span>' + item + '</span></li>';
        }).join('');
        if (modalQuoteLink) {
          modalQuoteLink.href = 'contacto.html?servicio=' + encodeURIComponent(name);
        }
        if (typeof serviceModal.showModal === 'function') serviceModal.showModal();
      });
    });

    serviceModal.addEventListener('click', function (e) {
      var rect = serviceModal.getBoundingClientRect();
      var inside = rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                   rect.left <= e.clientX && e.clientX <= rect.left + rect.width;
      if (!inside) serviceModal.close();
    });
    serviceModal.querySelectorAll('[data-close-modal]').forEach(function (btn) {
      btn.addEventListener('click', function () { serviceModal.close(); });
    });
  }

  /* ---------------------------------------------------------------------
     Lightbox de galería
  --------------------------------------------------------------------- */
  var lightbox = document.getElementById('lightbox');
  if (lightbox) {
    var lightboxImg = lightbox.querySelector('img');
    var lightboxCaption = lightbox.querySelector('.lightbox__caption');
    document.querySelectorAll('.gallery-item:not(.gallery-item--placeholder)').forEach(function (item) {
      item.addEventListener('click', function () {
        var img = item.querySelector('img');
        if (!img) return;
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = img.alt;
        if (typeof lightbox.showModal === 'function') lightbox.showModal();
      });
    });
    lightbox.addEventListener('click', function (e) {
      var rect = lightbox.getBoundingClientRect();
      var inside = rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                   rect.left <= e.clientX && e.clientX <= rect.left + rect.width;
      if (!inside) lightbox.close();
    });
    var lbClose = lightbox.querySelector('[data-close-modal]');
    if (lbClose) lbClose.addEventListener('click', function () { lightbox.close(); });
  }

  /* ---------------------------------------------------------------------
     Formulario de cotización
  --------------------------------------------------------------------- */
  var quoteForm = document.getElementById('quote-form');
  if (quoteForm) {
    var serviceSelect = quoteForm.querySelector('#servicio');
    var params2 = new URLSearchParams(window.location.search);
    var preselected = params2.get('servicio');
    if (preselected && serviceSelect) {
      var opt = Array.from(serviceSelect.options).find(function (o) { return o.value === preselected; });
      if (!opt) {
        opt = document.createElement('option');
        opt.value = preselected;
        opt.textContent = preselected;
        serviceSelect.appendChild(opt);
      }
      serviceSelect.value = preselected;
    }

    quoteForm.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('blur', function () { field.setAttribute('data-touched', 'true'); });
    });

    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = quoteForm.querySelectorAll('input, select, textarea');
      var valid = true;
      fields.forEach(function (f) { f.setAttribute('data-touched', 'true'); });
      quoteForm.querySelectorAll('[required]').forEach(function (f) {
        if (!f.checkValidity()) valid = false;
      });

      var feedback = quoteForm.querySelector('.form-feedback');

      if (!valid) {
        if (feedback) {
          feedback.classList.remove('is-visible');
        }
        var firstInvalid = quoteForm.querySelector(':invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var data = Object.fromEntries(new FormData(quoteForm).entries());
      var lines = [
        'Hola LIMPIAZEN, quisiera solicitar una cotización:',
        'Nombre: ' + (data.nombre || ''),
        data.empresa ? 'Empresa: ' + data.empresa : null,
        'Teléfono: ' + (data.telefono || ''),
        'Correo: ' + (data.correo || ''),
        'Servicio de interés: ' + (data.servicio || ''),
        'Mensaje: ' + (data.mensaje || '')
      ].filter(Boolean).join('\n');

      var waUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines);

      if (feedback) {
        feedback.classList.add('is-visible');
      }
      window.open(waUrl, '_blank', 'noopener');
    });
  }

  /* ---------------------------------------------------------------------
     Botones "Solicitar cotización por WhatsApp" con texto contextual
  --------------------------------------------------------------------- */
  document.querySelectorAll('[data-wa-service]').forEach(function (btn) {
    var service = btn.getAttribute('data-wa-service');
    var text = service
      ? 'Hola LIMPIAZEN, quisiera más información sobre: ' + service
      : 'Hola LIMPIAZEN, quisiera solicitar una cotización.';
    btn.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
  });
})();
