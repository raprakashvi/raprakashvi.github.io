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
        row.hidden = !(kind === 'all' || row.dataset.kind.split(/\s+/).indexOf(kind) !== -1);
      });
      document.querySelectorAll('#publist .yearmark').forEach(function (heading) {
        var row = heading.nextElementSibling;
        var hasVisiblePaper = false;
        while (row && !row.classList.contains('yearmark')) {
          if (row.matches('.rec') && !row.hidden) hasVisiblePaper = true;
          row = row.nextElementSibling;
        }
        heading.hidden = !hasVisiblePaper;
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
    var rotation = player.querySelector('.player-rotation');
    var timer = null;

    function play(id, name) {
      clearInterval(timer);
      if (rotation) rotation.hidden = true;
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
    var buttons = [].slice.call(reel.querySelectorAll('button[data-video]'));
    function select(button) {
      var name = button.querySelector('span').textContent;
      buttons.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === button));
      });
      player.dataset.player = button.dataset.video;
      if (copy) copy.textContent = name;
      var img = player.querySelector('.player > img, .player-btn img');
      var thumb = button.querySelector('img');
      if (img && thumb) { img.src = thumb.src; img.alt = ''; }
      return name;
    }
    reel.addEventListener('click', function (e) {
      var button = e.target.closest('button[data-video]');
      if (!button) return;
      play(button.dataset.video, select(button));
    });
    if (player.hasAttribute('data-rotate') && rotation) {
      var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      var paused = motion.matches;
      function updateRotation() {
        clearInterval(timer);
        rotation.textContent = paused ? 'Resume previews' : 'Pause previews';
        rotation.setAttribute('aria-pressed', String(paused));
        if (paused || !frame.hidden || document.hidden) return;
        timer = setInterval(function () {
          // Leave the current preview in place while visitors use its controls.
          if (player.matches(':hover') || player.contains(document.activeElement) || reel.contains(document.activeElement)) return;
          var current = buttons.findIndex(function (b) { return b.dataset.video === player.dataset.player; });
          select(buttons[(current + 1) % buttons.length]);
        }, 8000);
      }
      rotation.addEventListener('click', function () { paused = !paused; updateRotation(); });
      motion.addEventListener('change', function () { paused = motion.matches; updateRotation(); });
      document.addEventListener('visibilitychange', updateRotation);
      updateRotation();
    }
  });
})();

// A spring-controlled pixel field: each particle senses displacement and returns home.
(function () {
  var lab = document.querySelector('.pixel-lab');
  if (!lab) return;
  var canvas = lab.querySelector('canvas'), ctx = canvas.getContext('2d');
  if (!ctx) return;
  var stage = lab.querySelector('.pixel-stage'), pause = lab.querySelector('.pixel-pause');
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var scenes = [
    {name:'HELLO, ROBOT', art:[
      '.......22.......','.......22.......','...1111111111...','..111111111111..','..113331133311..','..113031130311..','..113331133311..','..111111111111..','...1112222111...','.....111111.....','..211111111112..','.22111111111122.','.22111222211122.','...1112222111...','...1111111111...','....11....11....','...222....222...']},
    {name:'DEEP SPACE', art:[
      '........33........','.......3333.......','......333333......','......311113......','.....31111113.....','.....31122113.....','.....31200213.....','.....31122113.....','.....31111113.....','....231111132.....','...22311111322....','..2223111113222...','..2223333333222...','.....222222.......','......2442........','......2442........','.......44.........']},
    {name:'CURIOUS CAT', art:[
      '..11........11..','..121......121..','..122111111221..','..111111111111..','.11111111111111.','.11331111331111.','.11031111031111.','.11111121111111.','..111122211111..','...1111111111...','.....111111.....','....11111111....','....11111111..11','....11111111..11','....11222211.111','....11222211111.','...11111111111..']},
    {name:'SMALL SIGNAL', art:[
      '....111...111....','...12221.12221...','..1222221222221..','..1222222222221..','..1222222222221..','...12222222221...','....122222221....','.....1222221.....','......12221......','.......121.......','........1........']}
,
    {"name": "LIFT OFF", "art": [".333.......333.", "33333.....33333", ".333...1...333.", "..2....1....2..", "..22211111222..", ".....13331.....", ".....13031.....", ".....13331.....", "......111......", ".....2...2.....", "....22...22...."]},
    {"name": "RING WORLD", "art": [".......11111.......", ".....112222211.....", "....12222222221....", "...1222332222221...", "...1223333222221.33", "..3122233222221333.", ".333122222221333...", "333.1222221333.....", "33..12221333.......", "....11333221.......", "...33322221........", "..33..111.........."]},
    {"name": "JELLYFISH", "art": [".....11111.....", "...112222211...", "..12223322221..", ".1222333322221.", ".1222222222221.", ".1223022302221.", ".1222222222221.", "..11111111111..", "...2..2..2.2...", "...2.2...2..2..", "..2..2....2.2..", "..2...2...2....", "...2..2..2....."]},
    {"name": "BUTTERFLY", "art": ["11.........11", "1221..1..1221", "12221.1.12221", "1222211122221", ".12221112221.", "..111111111..", ".14421112441.", "1444211124441", "14421.1.12441", ".111..1..111."]},
    {"name": "LITTLE DINO", "art": [".......111111..", "......11111311.", "......11111011.", "......11111111.", "......1111.....", "1....1111111...", "11..11111......", "111111111......", ".11111111......", "..111111.......", "...11111.......", "...11.11.......", "...12.12......."]},
    {"name": "NIGHT OWL", "art": ["..11.......11..", "..12111111121..", "..11111111111..", ".1133311133311.", ".1130311130311.", ".1133311133311.", ".1111114111111.", "..21114441112..", "..22111111122..", "..22211111222..", "...222111222...", "....2222222....", ".....44.44....."]},
    {"name": "GROWING THINGS", "art": ["......444......", ".....44144.....", "....4411144....", ".....44144.....", "......444......", ".......2.......", "...11..2.......", "...121.2.11....", "....1222121....", ".......221.....", ".....33333.....", ".....32223.....", ".....32223.....", "......333......"]},
    {"name": "EIGHT ARMS", "art": [".....111111.....", "...1122222111...", "..112222222211..", "..123322223321..", "..123022223021..", "..122222222221..", "...1222222221...", "....11111111....", "..11.11..11.11..", ".11..11..11..11.", ".1..11....11..1.", "..11........11.."]},
    {"name": "SIGNAL DISH", "art": ["...3............", "...33...........", "...333..........", "...3223.........", "....3223........", "....32223.......", ".....32223..11..", "......3333111...", "........211.....", "........22......", ".......2222.....", "......222222....", ".....33333333..."]},
    {"name": "TINY ADVENTURER", "art": [".....333333.....", "...3333333333...", "..332222222233..", "..332333322233..", "..332300322233..", "..332222222233..", "...3333333333...", ".....333333.....", "..333334433333..", ".33333344333333.", ".33.33333333.33.", "....33333333....", "....333..333....", "....333..333....", "...2222..2222..."]}
  ];
  var colors = ['#1a1c1e','#c6f000','#84a32f','#eeeade','#f5ad69'];
  var particles = [], current = -1, elapsed = 0, previous = 0, raf = 0;
  var paused = motion.matches, visible = true, pointer = null, sweep = 0;
  var W = 352, H = 440;
  var bag = [];
  function nextScene() {
    if (!bag.length) {
      bag = scenes.map(function (_, i) { return i; });
      for (var i = bag.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var swap = bag[i]; bag[i] = bag[j]; bag[j] = swap;
      }
      // Avoid repeating the last artwork at the boundary between shuffles.
      if (bag[bag.length - 1] === current) {
        var first = bag[0]; bag[0] = bag[bag.length - 1]; bag[bag.length - 1] = first;
      }
    }
    select(bag.pop());
  }
  function select(next) {
    current = next % scenes.length; elapsed = 0; sweep = 0;
    var art = scenes[current].art, points = [], size = 16;
    art.forEach(function (row, y) {
      row.split('').forEach(function (c, x) {
        if (c !== '.') points.push({x:(W-row.length*size)/2+x*size,y:(H-art.length*size)/2+y*size,color:colors[Number(c)]});
      });
    });
    particles = points.map(function (point, i) {
      var old = particles[i];
      return {x:old ? old.x : W/2+(Math.random()-.5)*W,y:old ? old.y : Math.random()*H,vx:0,vy:0,tx:point.x,ty:point.y,color:point.color};
    });
    lab.querySelector('[data-pixel-name]').textContent = scenes[current].name;
    stage.setAttribute('aria-label', scenes[current].name + '. Change pixel artwork');
    if (paused || motion.matches) settle();
    draw();
  }
  function settle() { particles.forEach(function(p){p.x=p.tx;p.y=p.ty;p.vx=p.vy=0;}); sweep=W; }
  function draw() {
    ctx.fillStyle='#1a1c1e';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#30332f';
    for(var x=16;x<W;x+=24) for(var y=16;y<H;y+=24) ctx.fillRect(x,y,2,2);
    particles.forEach(function(p){
      ctx.globalAlpha=p.tx>sweep ? .22 : 1;
      ctx.fillStyle=p.color;ctx.fillRect(Math.round(p.x),Math.round(p.y),13,13);
    });ctx.globalAlpha=1;
    if(sweep<W && !paused){
      ctx.fillStyle='rgba(198,240,0,.06)';ctx.fillRect(sweep-28,0,28,H);
      ctx.fillStyle='#c6f000';ctx.fillRect(sweep,0,2,H);
    }
  }
  function frame(now) {
    raf=0;if(paused || !visible || document.hidden)return;
    var dt=previous ? Math.min((now-previous)/16.667,2) : 1;previous=now;
    elapsed+=dt*16.667;sweep=Math.min(W,sweep+dt*12);
    if(elapsed>8000)nextScene();
    particles.forEach(function(p){
      p.vx+=(p.tx-p.x)*.035*dt;p.vy+=(p.ty-p.y)*.035*dt;
      if(pointer){var dx=p.x-pointer.x,dy=p.y-pointer.y,d=Math.hypot(dx,dy);
        if(d<130){var force=(130-d)*.055*dt;p.vx+=dx/Math.max(d,1)*force;p.vy+=dy/Math.max(d,1)*force;}}
      p.vx*=Math.pow(.83,dt);p.vy*=Math.pow(.83,dt);p.x+=p.vx*dt;p.y+=p.vy*dt;
    });draw();raf=requestAnimationFrame(frame);
  }
  function run(){previous=0;if(!raf && !paused && visible && !document.hidden)raf=requestAnimationFrame(frame);}
  function setPaused(value){paused=value;pause.textContent=paused?'Play':'Pause';pause.setAttribute('aria-pressed',String(paused));if(paused){cancelAnimationFrame(raf);raf=0;settle();draw();}else run();}
  stage.addEventListener('click',function(){nextScene();run();});
  stage.addEventListener('pointermove',function(e){var r=canvas.getBoundingClientRect();pointer={x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};});
  stage.addEventListener('pointerleave',function(){pointer=null;});
  stage.addEventListener('pointercancel',function(){pointer=null;});
  pause.addEventListener('click',function(){setPaused(!paused);});
  motion.addEventListener('change',function(){setPaused(motion.matches);});
  document.addEventListener('visibilitychange',run);
  if('IntersectionObserver' in window)new IntersectionObserver(function(entries){visible=entries[0].isIntersecting;if(visible)run();}).observe(lab);
  lab.hidden=false;nextScene();setPaused(paused);
})();
