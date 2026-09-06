/* Kit — behaviour. No dependencies. Everything degrades to working HTML. */
(function () {
  'use strict';

  /* Legacy hash links (#research, #publication-…) now resolve to real URLs. */
  var LEGACY = ['about', 'research', 'publications', 'teaching', 'portfolio', 'media'];
  var hash = location.hash.slice(1);
  if (hash && location.pathname === '/') {
    if (LEGACY.indexOf(hash) > -1) {
      location.replace('/' + hash + '/');
      return;
    }
    if (hash.indexOf('publication-') === 0) {
      location.replace('/publications/#' + hash);
      return;
    }
    if (hash.indexOf('news-') === 0 || hash.indexOf('media-') === 0) {
      location.replace('/' + (hash.indexOf('media-') === 0 ? 'media' : '') + '/#' + hash);
      return;
    }
  }

  /* Stagger index for the one authored entrance. */
  document.querySelectorAll('.grid').forEach(function (grid) {
    [].forEach.call(grid.children, function (mod, i) {
      mod.style.setProperty('--i', Math.min(i, 9));
    });
  });

  /* Mobile drawer. */
  var toggle = document.querySelector('.bar-toggle');
  var drawer = document.getElementById('drawer');
  if (toggle && drawer) {
    toggle.addEventListener('click', function () {
      var open = drawer.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        drawer.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Menu';
        toggle.focus();
      }
    });
  }

  /* Publication filters. */
  var filters = document.querySelector('.filters');
  if (filters) {
    var rows = [].slice.call(document.querySelectorAll('#publist .rec'));
    filters.addEventListener('click', function (e) {
      var button = e.target.closest('button[data-filter]');
      if (!button) return;
      var kind = button.dataset.filter;
      [].forEach.call(filters.querySelectorAll('button'), function (b) {
        b.setAttribute('aria-pressed', String(b === button));
      });
      rows.forEach(function (row) {
        row.hidden = !(kind === 'all' || row.dataset.kind === kind);
      });
    });
    /* A deep link to one paper must not land inside a filtered-out list. */
    if (location.hash.indexOf('#publication-') === 0) {
      var target = document.getElementById(location.hash.slice(1));
      if (target) target.scrollIntoView();
    }
  }

  /* Video: poster until asked, then load the embed. */
  document.querySelectorAll('[data-player]').forEach(function (player) {
    var frame = player.querySelector('iframe');
    var poster = player.querySelector('.player-btn');
    var copy = player.querySelector('.player-copy b');

    function play(id, name) {
      frame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1';
      frame.title = name;
      frame.hidden = false;
      if (poster) poster.hidden = true;
    }
    if (poster) {
      poster.addEventListener('click', function () {
        play(player.dataset.player, copy ? copy.textContent : 'Research video');
      });
    }
    var reel = player.parentNode.querySelector('.reel');
    if (!reel) return;
    reel.addEventListener('click', function (e) {
      var button = e.target.closest('button[data-video]');
      if (!button) return;
      var name = button.querySelector('span').textContent;
      [].forEach.call(reel.querySelectorAll('button'), function (b) {
        b.setAttribute('aria-pressed', String(b === button));
      });
      player.dataset.player = button.dataset.video;
      if (copy) copy.textContent = name;
      var img = player.querySelector('.player > img, .player-btn img');
      var thumb = button.querySelector('img');
      if (img && thumb) { img.src = thumb.src; img.alt = ''; }
      play(button.dataset.video, name);
    });
  });
})();
