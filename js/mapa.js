/* ============================================================
   Atlas.Mapa — el mapa ilustrado del reino (SVG procedural).
   Todo el dibujo se genera aquí: montañas, bosques, río, costa,
   rosa de los vientos, camino y medallones de cada lugar.
   ============================================================ */
(function (A) {
  'use strict';
  var M = A.Mapa = {}, W = 1600, H = 1000, svg, marco, ficha, polvoRAF = null, activo = true;

  /* Generador pseudoaleatorio con semilla: el mapa es siempre el mismo */
  var semilla = 20261;
  function azar() { semilla = (semilla * 16807) % 2147483647; return semilla / 2147483647; }

  function montana(x, y, s) {
    var w = 26 * s, h = 34 * s;
    return '<path class="tinta" stroke-width="1.6" fill="var(--perg)" d="M' + (x - w) + ' ' + y + 'L' + (x - w * .15) + ' ' + (y - h) + 'L' + (x + w * .1) + ' ' + (y - h * .8) + 'L' + (x + w) + ' ' + y + '"/>' +
      '<path class="tinta" stroke-width="1" opacity=".7" d="M' + (x - w * .1) + ' ' + (y - h * .85) + 'l' + (w * .25) + ' ' + (h * .45) + 'M' + (x + w * .12) + ' ' + (y - h * .6) + 'l' + (w * .3) + ' ' + (h * .45) + 'M' + (x - w * .02) + ' ' + (y - h * .5) + 'l' + (w * .2) + ' ' + (h * .4) + '"/>';
  }
  function arbol(x, y, s) {
    return '<path class="tinta" stroke-width="1.2" fill="var(--bosque)" fill-opacity=".28" d="M' + x + ' ' + y + 'v' + (-5 * s) + 'M' + (x - 6 * s) + ' ' + (y - 5 * s) + 'q' + (6 * s) + ' ' + (-20 * s) + ' ' + (12 * s) + ' 0Z"/>';
  }
  function dispersar(zonas, n, dibujar, libres) {
    var items = [], guardia = 0;
    while (items.length < n && guardia++ < n * 40) {
      var z = zonas[Math.floor(azar() * zonas.length)], a = azar() * 6.2832, r = Math.sqrt(azar());
      var x = z[0] + Math.cos(a) * r * z[2], y = z[1] + Math.sin(a) * r * z[3];
      if (libres.some(function (p) { return Math.abs(p[0] - x) < p[2] && Math.abs(p[1] - y) < p[3]; })) continue;
      items.push([x, y, .8 + azar() * .5]);
    }
    items.sort(function (p, q) { return p[1] - q[1]; });
    return items.map(function (p) { return dibujar(p[0], p[1], p[2]); }).join('');
  }
  /* Tramos Catmull-Rom → Bézier, uno por cada par de lugares consecutivos */
  function tramos(pts) {
    var r = [];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      r.push('M' + p1[0] + ' ' + p1[1] + 'C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' +
        (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' + p2[0] + ' ' + p2[1]);
    }
    return r;
  }
  M.medallon = function (l, r) {
    r = r || 34;
    return '<circle class="disco" r="' + r + '"/><circle class="aro" r="' + (r - 5) + '"/><g transform="scale(' + (r / 22).toFixed(2) + ')"><path class="glifo" d="' + l.glifo + '"/></g>';
  };

  function construir() {
    var L = A.LUGARES, i, s = '';
    var libres = L.map(function (l) { return [l.pos[0], l.pos[1] + 20, 150, 75]; });
    libres.push([440, 75, 420, 70]);
    var rio = 'M850 215C800 290 790 340 770 400S735 560 700 680S650 850 590 1000';
    s += '<defs><filter id="papel" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="3" seed="7"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .32  0 0 0 0 .15  .55 0 0 0 -.12"/></filter></defs>';
    s += '<rect width="' + W + '" height="' + H + '" fill="var(--perg)"/><rect width="' + W + '" height="' + H + '" filter="url(#papel)" opacity=".5"/>';
    // costa y mar
    s += '<path d="M1600 800C1530 800 1500 850 1470 890S1440 960 1400 1000H1600Z" fill="var(--agua)" opacity=".28"/><path class="tinta" stroke-width="2" d="M1600 800C1530 800 1500 850 1470 890S1440 960 1400 1000"/>';
    for (i = 0; i < 9; i++) s += '<path class="tinta" stroke-width="1" opacity=".5" d="M' + (1500 + (i % 3) * 30) + ' ' + (850 + i * 16) + 'q6 -6 12 0t12 0"/>';
    // río
    s += '<path class="rio dibujar" style="--len:900" d="' + rio + '"/><path class="rio2" d="' + rio + '"/>';
    // relieve
    s += '<g class="relieve">' + dispersar([[905, 150, 130, 70], [325, 610, 55, 70], [505, 520, 55, 45], [1260, 400, 90, 60], [110, 540, 70, 110], [1500, 520, 60, 110]], 62, montana, libres) + '</g>';
    s += '<g class="arboleda">' + dispersar([[540, 850, 170, 90], [1180, 900, 190, 60], [1270, 620, 80, 50], [120, 200, 80, 70], [900, 580, 80, 60], [330, 900, 120, 60], [700, 250, 60, 50], [1180, 120, 120, 60]], 170, arbol, libres) + '</g>';
    // capa con paralaje: aves y nubes de tinta
    s += '<g id="capa-cielo">';
    [[620, 330], [1120, 370], [300, 720], [1300, 180], [880, 690]].forEach(function (p) { s += '<path class="tinta" stroke-width="1.4" d="M' + p[0] + ' ' + p[1] + 'q6 -7 12 0q6 -7 12 0M' + (p[0] + 30) + ' ' + (p[1] + 12) + 'q5 -6 10 0q5 -6 10 0"/>'; });
    s += '</g>';
    // camino: entrada → 1.1 → … → 1.9 → Ciudadela, y ramal 1.8 → Talleres
    var ruta = [[20, 930]].concat(L.slice(0, 10).map(function (l) { return l.pos; })), tr = tramos(ruta);
    tr.push('M1150 520C1230 560 1300 640 1380 720');
    tr.forEach(function (d, j) { s += '<path class="camino" d="' + d + '"/><path class="camino luz" data-tramo="' + j + '" d="' + d + '" hidden/>'; });
    // cartela del título
    s += '<g><text class="titulo-mapa" x="60" y="84" font-size="42">El Atlas de las Ecuaciones</text>' +
      '<path class="tinta" stroke="var(--oro)" stroke-width="2" d="M60 100H770M60 106H560"/>' +
      '<text x="60" y="134" font-size="19" font-style="italic" style="font-family:var(--f-txt)">Reino del Cambio — ecuaciones diferenciales de primer orden</text></g>';
    // rosa de los vientos
    s += '<g transform="translate(1505 905)"><circle r="46" fill="var(--perg)" stroke="var(--tinta)" stroke-width="1.5"/><circle r="38" class="tinta" stroke-width=".8"/>';
    for (i = 0; i < 8; i++) s += '<path transform="rotate(' + i * 45 + ')" d="M0 ' + (i % 2 ? -26 : -44) + 'L' + (i % 2 ? 5 : 8) + ' 0H' + (i % 2 ? -5 : -8) + 'Z" fill="' + (i % 2 ? 'var(--oro)' : 'var(--tinta)') + '" stroke="var(--tinta)" stroke-width=".8"/>';
    s += '<circle r="4" fill="var(--lacre)"/><text y="-50" text-anchor="middle" font-size="15" font-weight="700">N</text></g>';
    // lugares
    L.forEach(function (l) {
      var anchoCinta = l.nombre.length * 8.3 + 26;
      s += '<g class="lugar" id="nodo-' + l.id + '" data-id="' + l.id + '" tabindex="0" role="button" aria-label="' + (l.especial ? '' : 'Sección ' + l.sec + '. ') + l.nombre + '. ' + l.tema + '" transform="translate(' + l.pos[0] + ' ' + l.pos[1] + ')">' +
        '<circle r="46" fill="transparent"/>' + M.medallon(l, l.especial ? 40 : 34) +
        '<rect class="cinta" x="' + (-anchoCinta / 2) + '" y="' + (l.especial ? 48 : 42) + '" width="' + anchoCinta + '" height="25" rx="2"/>' +
        '<text y="' + (l.especial ? 66 : 60) + '" text-anchor="middle" font-size="14.5" font-weight="700">' + l.nombre + '</text>' +
        (l.especial ? '' : '<g transform="translate(27 -27)"><circle r="14" fill="var(--tinta)"/><text y="4.5" text-anchor="middle" font-size="12" style="fill:var(--perg)">' + l.sec + '</text></g>') +
        '<g class="marca-sello" transform="translate(-28 -26)" hidden><circle class="lacre" r="11"/><text y="4.5" text-anchor="middle" font-size="12" style="fill:#f2e6c9">✦</text></g></g>';
    });
    return s;
  }

  M.montar = function (cont, alIr) {
    marco = cont;
    cont.innerHTML = '<div class="mapa-desliz"><svg class="mapa-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" role="group" aria-label="Mapa del reino. Cada medallón abre una sección del capítulo.">' + construir() + '</svg></div><canvas class="polvo" aria-hidden="true"></canvas><div class="ficha" hidden></div>';
    svg = A.$('svg', cont); ficha = A.$('.ficha', cont);
    A.$$('.lugar', svg).forEach(function (n) {
      var l = A.lugar(n.dataset.id);
      function viajar() {
        ficha.hidden = true;
        if (A.quieto) { alIr(l.id); return; }
        svg.style.transformOrigin = (l.pos[0] / W * 100) + '% ' + (l.pos[1] / H * 100) + '%';
        svg.style.transform = 'scale(3.2)'; svg.classList.add('zoom');
        setTimeout(function () { alIr(l.id); svg.style.transform = ''; svg.classList.remove('zoom'); }, 620);
      }
      n.addEventListener('click', viajar);
      n.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); viajar(); } });
      function mostrar() {
        var r = n.getBoundingClientRect(), m = marco.getBoundingClientRect();
        ficha.innerHTML = '<b>' + l.nombre + '</b>' + (l.especial ? '' : 'Sección ' + l.sec + ' — ') + l.tema +
          '<br><span class="est" aria-hidden="true">' + '★★★'.slice(0, l.dif) + '☆☆☆'.slice(0, 3 - l.dif) + '</span> dificultad ' + ['', 'baja', 'media', 'alta'][l.dif] +
          '<br>' + (A.sellado(l.id) ? 'Sello ganado ✦' : 'Sello pendiente');
        ficha.hidden = false;
        var x = r.left - m.left + r.width / 2 - 130, y = r.top - m.top - ficha.offsetHeight - 6;
        if (y < 6) y = r.bottom - m.top + 6;
        ficha.style.left = Math.max(6, Math.min(m.width - 266, x)) + 'px'; ficha.style.top = y + 'px';
      }
      n.addEventListener('mouseenter', mostrar); n.addEventListener('focus', mostrar);
      n.addEventListener('mouseleave', function () { ficha.hidden = true; }); n.addEventListener('blur', function () { ficha.hidden = true; });
    });
    // paralaje suave de la capa del cielo
    if (!A.quieto) cont.addEventListener('mousemove', function (e) {
      var m = marco.getBoundingClientRect(), dx = (e.clientX - m.left) / m.width - .5, dy = (e.clientY - m.top) / m.height - .5;
      A.$('#capa-cielo', svg).setAttribute('transform', 'translate(' + (dx * -26).toFixed(1) + ' ' + (dy * -18).toFixed(1) + ')');
      A.$('.relieve', svg).setAttribute('transform', 'translate(' + (dx * 7).toFixed(1) + ' ' + (dy * 5).toFixed(1) + ')');
    });
    M.actualizar(); polvo();
  };

  /* Ilumina los tramos cuyo destino ya tiene sello y marca los medallones */
  M.actualizar = function () {
    if (!svg) return;
    var L = A.LUGARES;
    A.$$('.camino.luz', svg).forEach(function (p) {
      var j = +p.dataset.tramo, destino = j <= 9 ? L[j].id : 'talleres';
      p.toggleAttribute('hidden', !A.sellado(destino));
    });
    A.$$('.lugar', svg).forEach(function (n) {
      var ok = A.sellado(n.dataset.id); n.classList.toggle('sellado', ok);
      A.$('.marca-sello', n).toggleAttribute('hidden', !ok);
    });
  };
  M.activar = function (v) { activo = v; if (v && !polvoRAF) polvo(); };

  /* Partículas de polvo dorado sobre el mapa */
  function polvo() {
    if (A.quieto) return;
    var cv = A.$('.polvo', marco), c = cv.getContext('2d'), ps = [];
    for (var i = 0; i < 46; i++) ps.push({ x: Math.random(), y: Math.random(), r: .6 + Math.random() * 1.8, v: .008 + Math.random() * .02, f: Math.random() * 6.28 });
    var previo = 0;
    (function cuadro(t) {
      if (!activo) { polvoRAF = null; return; }
      var r = cv.getBoundingClientRect(), d = window.devicePixelRatio || 1, dt = Math.min(.05, (t - previo) / 1000 || 0); previo = t;
      if (cv.width !== Math.round(r.width * d)) { cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); }
      c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, r.width, r.height);
      ps.forEach(function (p) {
        p.y -= p.v * dt; p.x += Math.sin(t / 1900 + p.f) * .0004; if (p.y < -.02) { p.y = 1.02; p.x = Math.random(); }
        c.globalAlpha = .25 + .45 * Math.abs(Math.sin(t / 900 + p.f)); c.fillStyle = '#d9b25a';
        c.beginPath(); c.arc(p.x * r.width, p.y * r.height, p.r, 0, 6.2832); c.fill();
      });
      polvoRAF = requestAnimationFrame(cuadro);
    })(0);
  }
})(Atlas);
