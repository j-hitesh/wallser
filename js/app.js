(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var menuBtn = document.getElementById('menu') || document.getElementById('menu-btn') || document.getElementById('menuToggle');
    var nav = document.getElementById('mainNav') || document.getElementById('nav') || document.getElementById('primaryNav');

    if (menuBtn && nav && !menuBtn.dataset.menuBound) {
      menuBtn.dataset.menuBound = 'true';
      var mobileMenu = window.matchMedia('(max-width: 800px)');
      var header = menuBtn.closest('.header');
      var backdrop = document.createElement('div');
      backdrop.className = 'menu-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.appendChild(backdrop);
      var menuOpen = false;
      var previousOverflow = '';
      var links = nav.querySelectorAll('a');

      menuBtn.setAttribute('aria-controls', nav.id);
      nav.style.setProperty('--menu-header-height', header.getBoundingClientRect().height + 'px');
      links.forEach(function (link, index) {
        link.style.setProperty('--menu-order', String(index));
      });

      function setMenu(open, restoreFocus) {
        open = Boolean(open && mobileMenu.matches);
        if (open && !menuOpen) {
          previousOverflow = document.body.style.overflow;
          document.body.style.overflow = 'hidden';
        } else if (!open && menuOpen) {
          document.body.style.overflow = previousOverflow;
        }
        menuOpen = open;
        nav.classList.toggle('open', open);
        document.body.classList.toggle('menu-open', open);
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        nav.inert = mobileMenu.matches && !open;
        nav.setAttribute('aria-hidden', String(mobileMenu.matches && !open));
        if (open && links.length) {
          nav.scrollTop = 0;
          links[0].focus({ preventScroll: true });
        } else if (restoreFocus) {
          menuBtn.focus({ preventScroll: true });
        }
      }

      menuBtn.addEventListener('click', function () {
        setMenu(!menuOpen, false);
      });
      links.forEach(function (link) {
        link.addEventListener('click', function () { setMenu(false, false); });
      });
      document.addEventListener('pointerdown', function (event) {
        if (menuOpen && !header.contains(event.target)) setMenu(false, false);
      });
      header.querySelectorAll('.logo, .brand, .open-lead').forEach(function (trigger) {
        trigger.addEventListener('click', function () {
          if (menuOpen) setMenu(false, false);
        });
      });
      document.addEventListener('keydown', function (event) {
        if (!menuOpen) return;
        if (event.key === 'Escape') {
          event.preventDefault();
          setMenu(false, true);
        } else if (event.key === 'Tab' && links.length) {
          if (event.shiftKey && document.activeElement === links[0]) {
            event.preventDefault();
            menuBtn.focus();
          } else if (!event.shiftKey && document.activeElement === menuBtn) {
            event.preventDefault();
            links[0].focus();
          }
        }
      });
      mobileMenu.addEventListener('change', function () { setMenu(false, false); });
      setMenu(false, false);
    }

    var filterBtns = document.querySelectorAll('.filter, .filter-btn');
    var cards = document.querySelectorAll('.project-card, .p-card');

    if (filterBtns.length > 0 && cards.length > 0) {
      filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          filterBtns.forEach(function (b) {
            b.classList.remove('active');
          });
          btn.classList.add('active');

          var selected = (btn.dataset.filter || 'all').toLowerCase();
          cards.forEach(function (card) {
            var cardFilter = (card.dataset.filter || card.dataset.cat || '').toLowerCase();
            var shouldShow = selected === 'all' || cardFilter === selected;
            card.hidden = !shouldShow;
            card.style.display = shouldShow ? '' : 'none';
          });
        });
      });
    }

    var planBtns = document.querySelectorAll('[data-plan-tab]');
    var planPanels = document.querySelectorAll('[data-plan-panel]');
    if (planBtns.length > 0 && planPanels.length > 0) {
      planBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var targetId = btn.getAttribute('data-plan-tab');
          planBtns.forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          planPanels.forEach(function (panel) {
            panel.classList.toggle('active', panel.getAttribute('data-plan-panel') === targetId);
          });
        });
      });
    }

    document.querySelectorAll('.open-lead, [data-scroll-contact]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var contactSec = document.getElementById('contact');
        if (contactSec && !document.getElementById('lead-modal') && !document.getElementById('modalOverlay')) {
          contactSec.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Smooth Animated FAQ Accordion for all pages
    var faqs = document.querySelectorAll('details.faq');
    if (faqs.length > 0) {
      var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

      faqs.forEach(function (details) {
        var summary = details.querySelector('summary');
        if (!summary || details.dataset.faqAnimated) return;
        details.dataset.faqAnimated = 'true';

        var animation = null;
        var isClosing = false;
        var isExpanding = false;

        if (details.open) {
          details.classList.add('is-open');
        }

        summary.addEventListener('click', function (e) {
          e.preventDefault();

          if (prefersReducedMotion.matches || typeof details.animate !== 'function') {
            details.open = !details.open;
            details.classList.toggle('is-open', details.open);
            return;
          }

          details.style.overflow = 'hidden';

          if (isClosing || !details.open) {
            openFaq();
          } else if (isExpanding || details.open) {
            shrinkFaq();
          }
        });

        function shrinkFaq() {
          if (isClosing) return;

          var startHeight = details.getBoundingClientRect().height;

          if (isExpanding && animation) {
            animation.cancel();
          }

          isClosing = true;
          isExpanding = false;
          details.classList.add('is-closing');
          details.classList.remove('is-open');
          details.style.overflow = 'hidden';

          var endHeight = summary.getBoundingClientRect().height;

          animation = details.animate({
            height: [startHeight + 'px', endHeight + 'px']
          }, {
            duration: 280,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
          });

          var contents = Array.prototype.slice.call(details.children).filter(function (child) {
            return child !== summary;
          });

          contents.forEach(function (child) {
            child.animate({
              opacity: [1, 0],
              transform: ['translateY(0)', 'translateY(-6px)']
            }, {
              duration: 220,
              easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
            });
          });

          animation.onfinish = function () {
            finishShrink();
          };
          animation.oncancel = function () {
            isClosing = false;
          };
        }

        function finishShrink() {
          details.open = false;
          details.classList.remove('is-closing');
          details.classList.remove('is-open');
          animation = null;
          isClosing = false;
          isExpanding = false;
          details.style.height = '';
          details.style.overflow = '';
        }

        function openFaq() {
          if (isExpanding) return;

          var startHeight = details.getBoundingClientRect().height;

          if (isClosing && animation) {
            animation.cancel();
          }

          isExpanding = true;
          isClosing = false;
          details.classList.remove('is-closing');
          details.classList.add('is-open');

          details.open = true;
          details.style.overflow = 'hidden';
          details.style.height = 'auto';

          var endHeight = details.getBoundingClientRect().height;
          details.style.height = startHeight + 'px';

          animation = details.animate({
            height: [startHeight + 'px', endHeight + 'px']
          }, {
            duration: 320,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
          });

          var contents = Array.prototype.slice.call(details.children).filter(function (child) {
            return child !== summary;
          });

          contents.forEach(function (child) {
            child.animate({
              opacity: [0, 1],
              transform: ['translateY(-6px)', 'translateY(0)']
            }, {
              duration: 320,
              easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
            });
          });

          animation.onfinish = function () {
            finishExpand();
          };
          animation.oncancel = function () {
            isExpanding = false;
          };
        }

        function finishExpand() {
          details.open = true;
          details.classList.add('is-open');
          details.classList.remove('is-closing');
          animation = null;
          isClosing = false;
          isExpanding = false;
          details.style.height = '';
          details.style.overflow = '';
        }
      });
    }
  });
})();
