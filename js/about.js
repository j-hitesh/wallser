(function () {
  'use strict';

  var track = document.getElementById('review-track');
  var previous = document.getElementById('review-prev');
  var next = document.getElementById('review-next');
  var counter = document.getElementById('review-count');
  if (!track || !previous || !next || !counter) return;

  var cards = track.querySelectorAll('.about-review-card');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function updateControls() {
    var step = cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap);
    var index = Math.min(cards.length - 1, Math.round(track.scrollLeft / step));
    counter.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0');
    previous.disabled = track.scrollLeft < 2;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  }

  function move(direction) {
    var step = cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap);
    track.scrollBy({ left: direction * step, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }

  previous.addEventListener('click', function () { move(-1); });
  next.addEventListener('click', function () { move(1); });
  track.addEventListener('scroll', updateControls, { passive: true });
  window.addEventListener('resize', updateControls);
  updateControls();
})();
