/* ============================================================
   Atlas.Labs — laboratorios interactivos
     campo  : campo de pendientes con trazado de soluciones (RK4)
     euler  : método de Euler animado, tabla y gráfica log-log del error
     fase   : línea de fase, clasificación de equilibrios y bifurcaciones
     tanque : problema de mezcla animado («caldero del alquimista»)
   Cada laboratorio devuelve { destruir() } para liberar recursos.
   ============================================================ */
(function (A) {
  'use strict';
  var L = A.Labs = {};
  function nf(v, d) { v = parseFloat(v); return isFinite(v) ? v : d; }
  function q(host, s) { return host.querySelector(s); }

  /* ---------------------------------------------------------
     1. Campo de pendientes
     --------------------------------------------------------- */
  L.campo = function (host) {
    var d = host.dataset;
    var ini = { f: d.f || 'y - t', tmin: nf(d.tmin, -4), tmax: nf(d.tmax, 4), ymin: nf(d.ymin, -4), ymax: nf(d.ymax, 4) };
    var EJ = [['y - t', 'y − t'], ['y*(1 - y)', 'y(1 − y)  · logística'], ['-2*t*y', '−2ty'], ['t^2 - y', 't² − y'],
      ['sin(t) - y', 'sen t − y'], ['y^2 - t', 'y² − t'], ['-t/y', '−t / y'], ['cos(t*y)', 'cos(ty)'], ['cbrt(y)', 'y^(1/3)  · no unicidad'], ['-y + 2cos(3t)', '−y + 2cos 3t']];
    host.innerHTML = '<h3>Laboratorio · Campo de pendientes</h3><div class="controles">' +
      '<label>dy/dt = f(t, y)<input type="text" data-k="f" size="20" spellcheck="false" autocomplete="off"></label>' +
      '<label>Ejemplos<select data-k="ej"><option value="">— elegir —</option>' + EJ.map(function (e) { return '<option value="' + e[0] + '">' + e[1] + '</option>'; }).join('') + '</select></label>' +
      '<label>t mín<input type="number" step="any" data-k="tmin"></label><label>t máx<input type="number" step="any" data-k="tmax"></label>' +
      '<label>y mín<input type="number" step="any" data-k="ymin"></label><label>y máx<input type="number" step="any" data-k="ymax"></label>' +
      '<label>Densidad de flechas<input type="range" min="10" max="36" value="22" data-k="den"></label>' +
      '<button type="button" class="btn" data-a="dib">Dibujar</button><button type="button" class="btn sec" data-a="bor">Borrar curvas</button><button type="button" class="btn sec" data-a="res">Restaurar</button></div>' +
      '<p class="error" role="alert"></p><canvas class="clic" role="img" aria-label="Campo de pendientes. Haz clic para trazar la solución que pasa por un punto."></canvas>' +
      '<p class="lectura">\u00a0</p><p class="lectura">Haz clic sobre el campo para trazar la solución que pasa por ese punto. Funciones: sin, cos, tan, exp, ln, sqrt, abs, cbrt. Potencias con ^.</p>';
    var cv = q(host, 'canvas'), err = q(host, '.error'), f = null, curvas = [];
    var g = new A.Grafica(cv, { lectura: q(host, '.lectura'), extra: function (t, y) { return f ? 'pendiente = ' + A.num(f(t, y), 3) : ''; } });
    function campoDe(k) { return q(host, '[data-k=' + k + ']'); }
    function cargar(o) { ['f', 'tmin', 'tmax', 'ymin', 'ymax'].forEach(function (k) { campoDe(k).value = o[k]; }); }
    function leer() {
      err.textContent = '';
      try {
        var e = A.compilar(campoDe('f').value, ['t', 'y']);
        f = function (t, y) { return e({ t: t, y: y }); };
        var a = nf(campoDe('tmin').value, -4), b = nf(campoDe('tmax').value, 4), c = nf(campoDe('ymin').value, -4), dd = nf(campoDe('ymax').value, 4);
        if (!(a < b) || !(c < dd)) throw new Error('Revisa la ventana: el mínimo debe ser menor que el máximo.');
        g.xmin = a; g.xmax = b; g.ymin = c; g.ymax = dd;
      } catch (ex) { err.textContent = ex.message; f = null; }
    }
    function solucion(t0, y0) {
      var h = (g.xmax - g.xmin) / 600, R = (g.ymax - g.ymin), pts = [[t0, y0]], t, y, s;
      for (s = -1; s <= 1; s += 2) {
        t = t0; y = y0; var parte = [];
        for (var i = 0; i < 1200; i++) {
          y = A.rk4(f, t, y, s * h); t += s * h;
          if (!isFinite(y) || y > g.ymax + R || y < g.ymin - R || t > g.xmax + h || t < g.xmin - h) break;
          parte.push([t, y]);
        }
        pts = s < 0 ? parte.reverse().concat(pts) : pts.concat(parte);
      }
      return pts;
    }
    function dibujar() {
      g.ejes(); if (!f) return;
      var n = +campoDe('den').value, ancho = g.w - g.m.l - g.m.r, alto = g.h - g.m.t - g.m.b;
      var celda = ancho / n, filas = Math.max(4, Math.round(alto / celda)), ux = ancho / (g.xmax - g.xmin), uy = alto / (g.ymax - g.ymin);
      g.recortar(function (c) {
        c.strokeStyle = A.color('--tinta2'); c.lineWidth = 1.15; c.lineCap = 'round'; c.beginPath();
        for (var i = 0; i < n; i++) for (var j = 0; j < filas; j++) {
          var t = g.xmin + (i + .5) / n * (g.xmax - g.xmin), y = g.ymin + (j + .5) / filas * (g.ymax - g.ymin), s = f(t, y), dx, dy;
          if (isNaN(s)) continue;
          if (!isFinite(s)) { dx = 0; dy = 1; } else { dx = ux; dy = -s * uy; var m = Math.hypot(dx, dy); dx /= m; dy /= m; }
          var r = celda * .36, px = g.X(t), py = g.Y(y);
          c.moveTo(px - dx * r, py - dy * r); c.lineTo(px + dx * r, py + dy * r);
        }
        c.stroke();
      });
      var colores = [A.color('--lacre'), A.color('--bosque'), A.color('--agua'), A.color('--oro-osc')];
      curvas.forEach(function (p, i) { g.curva(solucion(p[0], p[1]), colores[i % 4], 2.4); g.punto(p[0], p[1], colores[i % 4], 4); });
    }
    g.alDibujar = dibujar;
    cv.addEventListener('click', function (ev) { var p = g.desdeEvento(ev); if (p && f) { curvas.push(p); dibujar(); } });
    host.addEventListener('click', function (ev) {
      var a = ev.target.dataset && ev.target.dataset.a;
      if (a === 'dib') { leer(); dibujar(); }
      if (a === 'bor') { curvas = []; dibujar(); }
      if (a === 'res') { cargar(ini); campoDe('den').value = 22; campoDe('ej').value = ''; curvas = []; leer(); dibujar(); }
    });
    campoDe('ej').addEventListener('change', function (e) { if (e.target.value) { campoDe('f').value = e.target.value; curvas = []; leer(); dibujar(); } });
    campoDe('den').addEventListener('input', dibujar);
    campoDe('f').addEventListener('keydown', function (e) { if (e.key === 'Enter') { leer(); dibujar(); } });
    cargar(ini); leer(); dibujar();
    return { destruir: function () { g.destruir(); } };
  };

  /* ---------------------------------------------------------
     2. Método de Euler animado
     --------------------------------------------------------- */
  L.euler = function (host) {
    var PRE = [
      { n: 'dy/dt = y,  y(0) = 1', f: 'y', y0: 1, T: 2, ex: function (t) { return Math.exp(t); } },
      { n: 'dy/dt = −2ty,  y(0) = 1', f: '-2*t*y', y0: 1, T: 2.5, ex: function (t) { return Math.exp(-t * t); } },
      { n: 'dy/dt = 2y(1 − y),  y(0) = 0.1', f: '2*y*(1-y)', y0: .1, T: 4, ex: function (t) { return 1 / (1 + 9 * Math.exp(-2 * t)); } },
      { n: 'dy/dt = t − y,  y(0) = 1', f: 't - y', y0: 1, T: 3, ex: function (t) { return t - 1 + 2 * Math.exp(-t); } },
      { n: 'dy/dt = y²,  y(0) = 1  (explota en t = 1)', f: 'y^2', y0: 1, T: 1.5, tErr: .8, ymax: 14, ex: function (t) { return t < 1 ? 1 / (1 - t) : NaN; } },
      { n: 'dy/dt = −10y,  y(0) = 1  (paso inestable)', f: '-10*y', y0: 1, T: 2, ymin: -3, ymax: 3, ex: function (t) { return Math.exp(-10 * t); } },
      { n: 'Personalizada…', libre: true, f: 'cos(t) - y', y0: 0, T: 6 }
    ];
    var DT = [1, .5, .25, .2, .1, .05, .025, .01];
    host.innerHTML = '<h3>Laboratorio · Método de Euler</h3><div class="controles">' +
      '<label>Problema de valor inicial<select data-k="pre">' + PRE.map(function (p, i) { return '<option value="' + i + '">' + p.n + '</option>'; }).join('') + '</select></label>' +
      '<label data-libre hidden>f(t, y)<input type="text" data-k="f" size="14" spellcheck="false"></label>' +
      '<label data-libre hidden>y(0)<input type="number" step="any" data-k="y0"></label><label data-libre hidden>t final<input type="number" step="any" data-k="T"></label>' +
      '<label><span>Paso Δt = <output data-k="dtv"></output></span><input type="range" min="0" max="7" step="1" value="1" data-k="dt"></label>' +
      '<button type="button" class="btn" data-a="ani">Animar paso a paso</button><button type="button" class="btn sec" data-a="res">Restaurar</button></div>' +
      '<p class="error" role="alert"></p><div class="dos"><div><canvas role="img" aria-label="Aproximación de Euler frente a la solución de referencia"></canvas><p class="lectura">\u00a0</p></div>' +
      '<div><canvas role="img" aria-label="Error frente al tamaño de paso en escala logarítmica"></canvas><p class="lectura">\u00a0</p></div></div>' +
      '<div class="leyenda"><span><i style="background:var(--lacre)"></i>Euler</span><span><i style="background:var(--bosque)"></i><span data-k="refn">Solución exacta</span></span><span><i style="background:var(--oro)"></i>Error en t final para distintos Δt</span></div>' +
      '<div class="tabla"><table><thead><tr><th>k</th><th>t_k</th><th>y_k (Euler)</th><th>referencia</th><th>error</th></tr></thead><tbody></tbody></table></div>';
    var cvs = host.querySelectorAll('canvas'), lec = host.querySelectorAll('.lectura'), err = q(host, '.error');
    var g1 = new A.Grafica(cvs[0], { lectura: lec[0] });
    var g2 = new A.Grafica(cvs[1], { lectura: lec[1], xl: 'Δt', yl: 'error', fx: function (v) { return A.num(Math.pow(10, v), 4); }, fy: function (v) { return A.num(Math.pow(10, v), 5); } });
    var f, ref, P, pts = [], visibles = 0, reloj = null;
    function k(n) { return q(host, '[data-k=' + n + ']'); }
    function euler(dt, T) { var n = Math.max(1, Math.round(T / dt)), h = T / n, t = 0, y = P.y0, r = [[0, y]]; for (var i = 0; i < n; i++) { y += h * f(t, y); t += h; r.push([t, y]); } return r; }
    function preparar() {
      err.textContent = '';
      var base = PRE[+k('pre').value]; P = { f: base.f, y0: base.y0, T: base.T, ex: base.ex, tErr: base.tErr, ymin: base.ymin, ymax: base.ymax };
      A.$$('[data-libre]', host).forEach(function (e) { e.hidden = !base.libre; });
      if (base.libre) { P.f = k('f').value || base.f; P.y0 = nf(k('y0').value, 0); P.T = Math.max(.1, nf(k('T').value, 6)); }
      try { var e = A.compilar(P.f, ['t', 'y']); f = function (t, y) { return e({ t: t, y: y }); }; } catch (ex) { err.textContent = ex.message; return false; }
      if (P.ex) { ref = P.ex; k('refn').textContent = 'Solución exacta'; }
      else {   // referencia numérica fina con RK4
        var N = 4000, h = P.T / N, ys = [P.y0], y = P.y0;
        for (var i = 0; i < N; i++) { y = A.rk4(f, i * h, y, h); ys.push(y); }
        ref = function (t) { var x = Math.min(N, Math.max(0, t / h)), a = Math.floor(x), b = Math.min(N, a + 1); return ys[a] + (ys[b] - ys[a]) * (x - a); };
        k('refn').textContent = 'Referencia (RK4 con paso muy fino)';
      }
      return true;
    }
    function calcular() {
      var dt = DT[+k('dt').value]; k('dtv').textContent = dt;
      pts = euler(dt, P.T);
      var filas = '';
      pts.slice(0, 401).forEach(function (p, i) { var r = ref(p[0]); filas += '<tr><td>' + i + '</td><td>' + A.num(p[0], 4) + '</td><td>' + A.num(p[1], 5) + '</td><td>' + A.num(r, 5) + '</td><td>' + A.num(Math.abs(p[1] - r), 5) + '</td></tr>'; });
      q(host, 'tbody').innerHTML = filas;
    }
    function dibujar() {
      if (!f) return;
      var lo = Infinity, hi = -Infinity, i;
      for (i = 0; i <= 200; i++) { var v = ref(P.T * i / 200); if (isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }
      pts.forEach(function (p) { if (isFinite(p[1])) { lo = Math.min(lo, p[1]); hi = Math.max(hi, p[1]); } });
      if (P.ymax != null) hi = P.ymax; if (P.ymin != null) lo = P.ymin;
      var pad = (hi - lo) * .08 || 1; g1.xmin = 0; g1.xmax = P.T; g1.ymin = lo - pad; g1.ymax = hi + pad;
      g1.ejes(); g1.funcion(ref, A.color('--bosque'), 2.2);
      var vis = pts.slice(0, visibles + 1), col = A.color('--lacre');
      g1.curva(vis, col, 2);
      g1.recortar(function () { vis.forEach(function (p) { if (isFinite(p[1])) g1.punto(p[0], p[1], col, 3.2); }); });
      // --- log-log del error ---
      var tE = P.tErr || P.T, datos = [], dtAct = DT[+k('dt').value];
      for (i = 1; i <= 10; i++) { var h = tE / Math.pow(2, i), e = Math.abs(euler(h, tE).pop()[1] - ref(tE)); if (e > 0 && isFinite(e)) datos.push([Math.log10(h), Math.log10(e)]); }
      if (!datos.length) { g2.ejes(); return; }
      var eAct = Math.abs(euler(dtAct, tE).pop()[1] - ref(tE)), act = (eAct > 0 && isFinite(eAct)) ? [Math.log10(tE / Math.max(1, Math.round(tE / dtAct))), Math.log10(eAct)] : null;
      var xs = datos.map(function (p) { return p[0]; }), ys = datos.map(function (p) { return p[1]; });
      if (act) { xs.push(act[0]); ys.push(act[1]); }
      g2.xmin = Math.min.apply(0, xs) - .3; g2.xmax = Math.max.apply(0, xs) + .3; g2.ymin = Math.min.apply(0, ys) - .5; g2.ymax = Math.max.apply(0, ys) + .5;
      g2.ejes();
      var u = datos[datos.length - 1];
      g2.curva([[g2.xmin, u[1] + (g2.xmin - u[0])], [g2.xmax, u[1] + (g2.xmax - u[0])]], A.color('--tinta2'), 1.2, [5, 5]);
      g2.curva(datos, A.color('--oro'), 2);
      datos.forEach(function (p) { g2.punto(p[0], p[1], A.color('--oro'), 3.5); });
      if (act) g2.punto(act[0], act[1], A.color('--lacre'), 6, true);
      var c = g2.ctx; c.fillStyle = A.color('--tinta2'); c.font = 'italic 13px "EB Garamond", Georgia, serif'; c.textAlign = 'left'; c.textBaseline = 'top';
      c.fillText('línea punteada: pendiente 1 (error ∝ Δt)', g2.m.l + 8, g2.m.t + 6);
    }
    function todo() { parar(); if (preparar()) { calcular(); visibles = pts.length; dibujar(); } }
    function parar() { if (reloj) { clearInterval(reloj); reloj = null; } }
    g1.alDibujar = g2.alDibujar = dibujar;
    k('pre').addEventListener('change', function () { var b = PRE[+k('pre').value]; if (b.libre) { k('f').value = b.f; k('y0').value = b.y0; k('T').value = b.T; } todo(); });
    k('dt').addEventListener('input', todo);
    ['f', 'y0', 'T'].forEach(function (n) { k(n).addEventListener('change', todo); });
    host.addEventListener('click', function (ev) {
      var a = ev.target.dataset && ev.target.dataset.a;
      if (a === 'ani') {
        parar(); if (!preparar()) return; calcular(); visibles = 0; dibujar();
        if (A.quieto) { visibles = pts.length; dibujar(); return; }
        reloj = setInterval(function () { visibles++; dibujar(); if (visibles >= pts.length - 1) parar(); }, Math.max(35, 2400 / pts.length));
      }
      if (a === 'res') { k('pre').value = 0; k('dt').value = 1; todo(); }
    });
    todo();
    return { destruir: function () { parar(); g1.destruir(); g2.destruir(); } };
  };

  /* ---------------------------------------------------------
     3. Línea de fase y bifurcaciones
     --------------------------------------------------------- */
  /* Equilibrios de f en [a, b]: cambios de signo (bisección) y tangencias (nodos) */
  function equilibrios(f, a, b, N) {
    N = N || 600; var r = [], h = (b - a) / N, d = h * .5, i, y0, y1, f0, f1, prev;
    function tipo(y) { var s1 = f(y - d), s2 = f(y + d); return (s1 > 0 && s2 < 0) ? 'sumidero' : (s1 < 0 && s2 > 0) ? 'fuente' : 'nodo'; }
    y0 = a; f0 = f(a); prev = f(a - h);
    for (i = 1; i <= N; i++) {
      y1 = a + i * h; f1 = f(y1);
      if (f0 === 0) { r.push({ y: y0, tipo: tipo(y0) }); }
      else if (f0 * f1 < 0) {
        var lo = y0, hi = y1, flo = f0;
        for (var k = 0; k < 50; k++) { var m = (lo + hi) / 2, fm = f(m); if (flo * fm <= 0) hi = m; else { lo = m; flo = fm; } }
        r.push({ y: (lo + hi) / 2, tipo: tipo((lo + hi) / 2) });
      } else if (isFinite(f0) && isFinite(f1) && prev * f0 > 0 && Math.abs(f0) < Math.abs(prev) && Math.abs(f0) <= Math.abs(f1)) {
        // mínimo local de |f| sin cambio de signo: ¿toca el cero? (sección áurea)
        var u = y0 - h, v = y1, gr = .618034;
        for (var j = 0; j < 60; j++) { var c1 = v - gr * (v - u), c2 = u + gr * (v - u); if (Math.abs(f(c1)) < Math.abs(f(c2))) v = c2; else u = c1; }
        var ym = (u + v) / 2;
        if (Math.abs(f(ym)) < 1e-9) r.push({ y: ym, tipo: 'nodo' });
      }
      prev = f0; y0 = y1; f0 = f1;
    }
    return r;
  }
  L._equilibrios = equilibrios;

  L.fase = function (host) {
    var FAM = [
      { n: 'y² + α  ·  silla-nodo', f: 'y^2 + a', a: [-4, 4], y: [-3, 3], a0: -1, bif: [0] },
      { n: 'αy − y²  ·  transcrítica', f: 'a*y - y^2', a: [-3, 3], y: [-3.5, 3.5], a0: 1.5, bif: [0] },
      { n: 'αy − y³  ·  horquilla', f: 'a*y - y^3', a: [-3, 3], y: [-2.5, 2.5], a0: 1, bif: [0] },
      { n: 'y(1 − y) − α  ·  logística con cosecha', f: 'y*(1-y) - a', a: [0, .5], y: [-.5, 1.5], a0: .1, bif: [.25] },
      { n: 'y²(1 − y) + α  ·  nodo en α = 0', f: 'y^2*(1-y) + a', a: [-.5, .5], y: [-1, 2], a0: 0, bif: [-4 / 27, 0] },
      { n: 'sen y + α', f: 'sin(y) + a', a: [-2, 2], y: [-7, 7], a0: .5, bif: [-1, 1] },
      { n: 'Personalizada…', libre: true, f: 'y^3 - 3y + a', a: [-4, 4], y: [-3, 3], a0: 0 }
    ];
    var inicial = nf(host.dataset.familia, 0), vista0 = host.dataset.vista || 'bif';
    host.innerHTML = '<h3>Laboratorio · Línea de fase y bifurcaciones</h3><div class="controles">' +
      '<label><span>Familia dy/dt = f<sub>α</sub>(y)</span><select data-k="fam">' + FAM.map(function (p, i) { return '<option value="' + i + '">' + p.n + '</option>'; }).join('') + '</select></label>' +
      '<label>f(y, a)  ·  a es el parámetro α<input type="text" data-k="f" size="16" spellcheck="false"></label>' +
      '<label><span>Parámetro α = <output data-k="av"></output></span><input type="range" min="0" max="400" step="1" data-k="a"></label>' +
      '<label>Panel derecho<select data-k="vista"><option value="bif">Diagrama de bifurcación</option><option value="sol">Soluciones y(t)</option></select></label>' +
      '<button type="button" class="btn sec" data-a="res">Restaurar</button></div><p class="error" role="alert"></p>' +
      '<div class="dos"><div><canvas role="img" aria-label="Gráfica de f(y) con la línea de fase sobre el eje horizontal"></canvas><p class="lectura">\u00a0</p></div>' +
      '<div><canvas role="img" aria-label="Diagrama de bifurcación o soluciones"></canvas><p class="lectura">\u00a0</p></div></div>' +
      '<div class="leyenda"><span><i style="background:var(--bosque)"></i>Sumidero</span><span><i style="background:var(--perg);box-shadow:inset 0 0 0 3px var(--lacre)"></i>Fuente</span><span><i style="background:var(--oro)"></i>Nodo</span><span data-k="eqs"></span></div>';
    var cvs = host.querySelectorAll('canvas'), lec = host.querySelectorAll('.lectura'), err = q(host, '.error');
    var g1 = new A.Grafica(cvs[0], { lectura: lec[0], xl: 'y', yl: 'f(y)' });
    var g2 = new A.Grafica(cvs[1], { lectura: lec[1] });
    var F, fam, alfa, eqs = [], ramas = null, bifs = [], raf = null, fase = 0;
    function k(n) { return q(host, '[data-k=' + n + ']'); }
    function fy(a) { return function (y) { return F({ y: y, a: a }); }; }
    function cargarFamilia(i) { fam = FAM[i]; k('fam').value = i; k('f').value = fam.f; k('a').value = Math.round((fam.a0 - fam.a[0]) / (fam.a[1] - fam.a[0]) * 400); compilar(); }
    function compilar() {
      err.textContent = '';
      try { F = A.compilar(k('f').value, ['y', 'a']); } catch (ex) { err.textContent = ex.message; F = null; return; }
      // ramas del diagrama de bifurcación
      ramas = []; var cuenta = [], M = 240, i;
      for (i = 0; i <= M; i++) { var a = fam.a[0] + (fam.a[1] - fam.a[0]) * i / M, e = equilibrios(fy(a), fam.y[0], fam.y[1], 300); cuenta.push(e.length); e.forEach(function (p) { ramas.push([a, p.y, p.tipo]); }); }
      if (k('f').value.replace(/\s/g, '') === fam.f.replace(/\s/g, '') && fam.bif) bifs = fam.bif.slice();
      else { bifs = []; for (i = 1; i <= M; i++) if (cuenta[i] !== cuenta[i - 1]) bifs.push(fam.a[0] + (fam.a[1] - fam.a[0]) * (i - .5) / M); }
      actualizar();
    }
    function actualizar() {
      if (!F) return;
      alfa = fam.a[0] + (fam.a[1] - fam.a[0]) * (+k('a').value) / 400; k('av').textContent = A.num(alfa, 3);
      eqs = equilibrios(fy(alfa), fam.y[0], fam.y[1]);
      k('eqs').textContent = eqs.length ? 'Equilibrios: ' + eqs.map(function (e) { return 'y = ' + A.num(e.y, 3) + ' (' + e.tipo + ')'; }).join(',  ') : 'No hay equilibrios en la ventana.';
      dibujar();
    }
    function colorDe(t) { return A.color(t === 'sumidero' ? '--bosque' : t === 'fuente' ? '--lacre' : '--oro'); }
    function dibujar() {
      if (!F) return;
      var f = fy(alfa), lo = 0, hi = 0, i;
      for (i = 0; i <= 200; i++) { var v = f(fam.y[0] + (fam.y[1] - fam.y[0]) * i / 200); if (isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }
      var tope = 12; lo = Math.max(lo, -tope); hi = Math.min(hi, tope); var pad = (hi - lo) * .12 || 1;
      g1.xmin = fam.y[0]; g1.xmax = fam.y[1]; g1.ymin = lo - pad; g1.ymax = hi + pad;
      g1.ejes(); g1.funcion(f, A.color('--tinta'), 2.2);
      // línea de fase sobre el eje f = 0
      var c = g1.ctx, y0 = g1.Y(0), cortes = [fam.y[0]].concat(eqs.map(function (e) { return e.y; })).concat([fam.y[1]]);
      g1.recortar(function () {
        c.strokeStyle = A.color('--oro'); c.lineWidth = 5; c.globalAlpha = .55; c.beginPath(); c.moveTo(g1.m.l, y0); c.lineTo(g1.w - g1.m.r, y0); c.stroke(); c.globalAlpha = 1;
        for (i = 0; i < cortes.length - 1; i++) {
          var a = cortes[i], b = cortes[i + 1], s = Math.sign(f((a + b) / 2)); if (!s || b - a < 1e-6) continue;
          var xa = g1.X(a), xb = g1.X(b), n = Math.max(1, Math.floor((xb - xa) / 46)), col = A.color('--tinta');
          for (var j = 0; j < n; j++) {
            var u = (j + (A.quieto ? .5 : fase)) / n; u = s > 0 ? u : 1 - u; var x = xa + (xb - xa) * u;
            c.fillStyle = col; c.beginPath(); c.moveTo(x + 7 * s, y0); c.lineTo(x - 5 * s, y0 - 6); c.lineTo(x - 5 * s, y0 + 6); c.closePath(); c.fill();
          }
        }
      });
      eqs.forEach(function (e) { g1.punto(e.y, 0, colorDe(e.tipo), 7, e.tipo === 'fuente'); });
      // panel derecho
      if (k('vista').value === 'bif') {
        g2.xl = 'α'; g2.yl = 'y*'; g2.xmin = fam.a[0]; g2.xmax = fam.a[1]; g2.ymin = fam.y[0]; g2.ymax = fam.y[1]; g2.ejes();
        g2.recortar(function (c2) {
          ramas.forEach(function (p) { c2.fillStyle = colorDe(p[2]); c2.globalAlpha = p[2] === 'fuente' ? .75 : 1; c2.beginPath(); c2.arc(g2.X(p[0]), g2.Y(p[1]), p[2] === 'fuente' ? 1.5 : 2.3, 0, 6.2832); c2.fill(); });
          c2.globalAlpha = 1;
        });
        bifs.forEach(function (b) { g2.vertical(b, A.color('--tinta2'), [2, 4], 'α ≈ ' + A.num(b, 3)); });
        g2.vertical(alfa, A.color('--oro'), [], '');
        eqs.forEach(function (e) { g2.punto(alfa, e.y, colorDe(e.tipo), 6, e.tipo === 'fuente'); });
      } else {
        g2.xl = 't'; g2.yl = 'y'; g2.xmin = 0; g2.xmax = 8; g2.ymin = fam.y[0]; g2.ymax = fam.y[1]; g2.ejes();
        var ft = function (t, y) { return f(y); };
        for (i = 0; i <= 14; i++) {
          var y = fam.y[0] + (fam.y[1] - fam.y[0]) * (i + .5) / 15, pts = [[0, y]], h = 8 / 500;
          for (var s2 = 0; s2 < 500; s2++) { y = A.rk4(ft, 0, y, h); if (!isFinite(y) || Math.abs(y) > 1e3) break; pts.push([(s2 + 1) * h, y]); }
          g2.curva(pts, A.color('--agua'), 1.6);
        }
        eqs.forEach(function (e) { g2.curva([[0, e.y], [8, e.y]], colorDe(e.tipo), 2.6, e.tipo === 'fuente' ? [7, 5] : []); });
      }
    }
    function animar() { fase = (fase + .012) % 1; dibujar(); raf = requestAnimationFrame(animar); }
    g1.alDibujar = g2.alDibujar = dibujar;
    k('fam').addEventListener('change', function () { cargarFamilia(+k('fam').value); });
    k('f').addEventListener('change', compilar);
    k('f').addEventListener('keydown', function (e) { if (e.key === 'Enter') compilar(); });
    k('a').addEventListener('input', actualizar);
    k('vista').addEventListener('change', dibujar);
    host.addEventListener('click', function (ev) { if (ev.target.dataset && ev.target.dataset.a === 'res') { k('vista').value = vista0; cargarFamilia(inicial); } });
    k('vista').value = vista0; cargarFamilia(inicial);
    if (!A.quieto) raf = requestAnimationFrame(animar);
    return { destruir: function () { if (raf) cancelAnimationFrame(raf); g1.destruir(); g2.destruir(); } };
  };

  /* ---------------------------------------------------------
     4. Mezcla en tanques: el caldero del alquimista
        dQ/dt = r_e c_e − r_s Q / (V0 + (r_e − r_s) t)
     --------------------------------------------------------- */
  L.tanque = function (host) {
    var CAP = 600, DEF = { V0: 200, Q0: 10, re: 6, ce: .4, rs: 6 };
    function desl(kk, rot, min, max, paso, uni) { return '<label><span>' + rot + ' = <output data-o="' + kk + '"></output> ' + uni + '</span><input type="range" data-k="' + kk + '" min="' + min + '" max="' + max + '" step="' + paso + '"></label>'; }
    host.innerHTML = '<h3>Laboratorio · El caldero del alquimista (problemas de mezcla)</h3><div class="controles">' +
      desl('V0', 'Volumen inicial V₀', 50, 500, 10, 'L') + desl('Q0', 'Sal inicial Q₀', 0, 100, 1, 'kg') +
      desl('re', 'Caudal de entrada', 0, 20, .5, 'L/min') + desl('ce', 'Concentración de entrada', 0, 1, .05, 'kg/L') + desl('rs', 'Caudal de salida', 0, 20, .5, 'L/min') +
      '<button type="button" class="btn" data-a="ini">Iniciar</button><button type="button" class="btn sec" data-a="res">Restaurar</button></div>' +
      '<div class="dos"><div><canvas role="img" aria-label="Caldero con el nivel y el color del líquido según la concentración"></canvas></div>' +
      '<div><canvas role="img" aria-label="Cantidad de sal Q(t)"></canvas><p class="lectura">\u00a0</p></div></div>' +
      '<div class="datos"><div><b>Tiempo</b><span data-d="t"></span></div><div><b>Volumen</b><span data-d="V"></span></div><div><b>Sal disuelta</b><span data-d="Q"></span></div><div><b>Concentración</b><span data-d="c"></span></div></div>' +
      '<p class="lectura" data-d="fin"></p><div class="formulas"></div>';
    var cvs = host.querySelectorAll('canvas'), cT = cvs[0], ctx = cT.getContext('2d');
    var g = new A.Grafica(cvs[1], { lectura: q(host, '.lectura'), yl: 'Q (kg)', xl: 't (min)' });
    var p = {}, tFin = 60, t = 0, corre = false, raf = null, ultimo = 0, burb = [], motivo = '';
    function k(n) { return q(host, '[data-k=' + n + ']'); }
    function V(t) { return p.V0 + (p.re - p.rs) * t; }
    function Q(t) {
      var d = p.re - p.rs, c = p.ce;
      if (Math.abs(d) < 1e-9) return p.rs === 0 ? p.Q0 : c * p.V0 + (p.Q0 - c * p.V0) * Math.exp(-p.rs * t / p.V0);
      var v = Math.max(V(t), 0);
      return c * v + (p.Q0 - c * p.V0) * Math.pow(v / p.V0, -p.rs / d);
    }
    function leer() {
      ['V0', 'Q0', 're', 'ce', 'rs'].forEach(function (n) { p[n] = +k(n).value; q(host, '[data-o=' + n + ']').textContent = p[n]; });
      var d = p.re - p.rs;
      if (d > 1e-9) { tFin = (CAP - p.V0) / d; motivo = 'El caldero se llena (capacidad ' + CAP + ' L) en t = ' + A.num(tFin, 2) + ' min.'; }
      else if (d < -1e-9) { tFin = p.V0 / -d; motivo = 'El caldero se vacía en t = ' + A.num(tFin, 2) + ' min.'; }
      else if (p.rs > 0) { tFin = 5 * p.V0 / p.rs; motivo = 'Volumen constante. Se muestran 5 constantes de tiempo (τ = V₀/r = ' + A.num(p.V0 / p.rs, 2) + ' min); Q tiende a c·V₀ = ' + A.num(p.ce * p.V0, 2) + ' kg.'; }
      else { tFin = 60; motivo = 'Sin caudales no hay cambio: Q es constante.'; }
      q(host, '[data-d=fin]').textContent = motivo;
      formulas(); t = 0; corre = false; q(host, '[data-a=ini]').textContent = 'Iniciar'; pintar();
    }
    function formulas() {
      var d = p.re - p.rs, n = A.num, el = q(host, '.formulas'), s;
      var ent = n(p.re * p.ce, 3);
      if (Math.abs(d) < 1e-9 && p.rs > 0) {
        s = '\\begin{aligned}\\frac{dQ}{dt} &= \\underbrace{' + n(p.re) + '\\cdot' + n(p.ce) + '}_{\\text{entra}} - \\underbrace{\\frac{' + n(p.rs) + '}{' + n(p.V0) + '}\\,Q}_{\\text{sale}} = ' + ent + ' - \\frac{Q}{' + n(p.V0 / p.rs, 3) + '}, \\qquad Q(0)=' + n(p.Q0) + '\\\\' +
          '\\mu(t) &= e^{t/' + n(p.V0 / p.rs, 3) + '} \\;\\Longrightarrow\\; Q(t) = ' + n(p.ce * p.V0, 3) + (p.Q0 - p.ce * p.V0 >= 0 ? ' + ' : ' - ') + n(Math.abs(p.Q0 - p.ce * p.V0), 3) + '\\,e^{-t/' + n(p.V0 / p.rs, 3) + '}\\end{aligned}';
      } else if (Math.abs(d) < 1e-9) {
        s = '\\frac{dQ}{dt} = 0 \\;\\Longrightarrow\\; Q(t) = ' + n(p.Q0);
      } else {
        var vol = n(p.V0) + (d > 0 ? ' + ' : ' - ') + n(Math.abs(d)) + 't', ex = n(p.rs / d, 4), K = p.Q0 - p.ce * p.V0;
        s = '\\begin{aligned}V(t) &= ' + vol + ',\\qquad \\frac{dQ}{dt} = ' + ent + ' - \\frac{' + n(p.rs) + '\\,Q}{' + vol + '}, \\qquad Q(0)=' + n(p.Q0) + '\\\\' +
          '\\mu(t) &= \\left(' + vol + '\\right)^{' + ex + '} \\;\\Longrightarrow\\; Q(t) = ' + n(p.ce) + '\\left(' + vol + '\\right) ' + (K >= 0 ? '+ ' : '- ') + n(Math.abs(K), 3) + '\\left(\\frac{' + n(p.V0) + '}{' + vol + '}\\right)^{' + ex + '}\\end{aligned}';
      }
      A.texEn(el, s, true);
    }
    function mezcla(f) {   // color del líquido según la concentración relativa f en [0,1]
      f = Math.max(0, Math.min(1, f));
      var a = [190, 222, 228], b = [112, 28, 84];
      return 'rgb(' + a.map(function (v, i) { return Math.round(v + (b[i] - v) * f); }).join(',') + ')';
    }
    function pintar() {
      var r = cT.getBoundingClientRect(), dpr = window.devicePixelRatio || 1, w = Math.max(r.width, 50), h = Math.max(r.height, 50);
      if (cT.width !== Math.round(w * dpr) || cT.height !== Math.round(h * dpr)) { cT.width = Math.round(w * dpr); cT.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      var tinta = A.color('--tinta'), v = Math.max(0, Math.min(CAP, V(t))), qq = Math.max(0, Q(t)), conc = v > 1e-6 ? qq / v : 0;
      var cmax = Math.max(p.ce, p.Q0 / p.V0, .05), col = mezcla(conc / cmax);
      var cx = w / 2, W = Math.min(w * .62, 300), top = h * .2, H = h * .58, fondo = top + H;
      function olla() {
        ctx.beginPath(); ctx.moveTo(cx - W * .4, top);
        ctx.bezierCurveTo(cx - W * .62, top + H * .35, cx - W * .55, top + H * .95, cx - W * .25, fondo);
        ctx.lineTo(cx + W * .25, fondo);
        ctx.bezierCurveTo(cx + W * .55, top + H * .95, cx + W * .62, top + H * .35, cx + W * .4, top); ctx.closePath();
      }
      // fuego
      for (var i = -2; i <= 2; i++) {
        var fh = 14 + 8 * Math.sin(ultimo / 160 + i * 1.7) * (A.quieto ? 0 : 1);
        ctx.fillStyle = i % 2 ? '#d9772b' : '#b8892b'; ctx.beginPath();
        ctx.moveTo(cx + i * 22 - 10, fondo + 30); ctx.quadraticCurveTo(cx + i * 22, fondo + 30 - fh * 2, cx + i * 22 + 10, fondo + 30); ctx.fill();
      }
      ctx.strokeStyle = tinta; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx - W * .3, fondo - 6); ctx.lineTo(cx - W * .38, fondo + 30); ctx.moveTo(cx + W * .3, fondo - 6); ctx.lineTo(cx + W * .38, fondo + 30); ctx.stroke();
      // líquido
      var nivel = fondo - (v / CAP) * H * .96;
      ctx.save(); olla(); ctx.clip(); ctx.fillStyle = col; ctx.fillRect(0, nivel, w, fondo - nivel + 2);
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      burb.forEach(function (b) { var by = fondo - ((ultimo / 1000 * b.v + b.o) % 1) * (fondo - nivel); if (by > nivel + 3) { ctx.beginPath(); ctx.arc(cx + b.x * W * .4, by, b.r, 0, 6.2832); ctx.fill(); } });
      ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, nivel); ctx.lineTo(w, nivel); ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = tinta; ctx.lineWidth = 3.5; olla(); ctx.stroke();
      ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - W * .46, top); ctx.lineTo(cx + W * .46, top); ctx.stroke(); ctx.lineCap = 'butt';
      // tubería de entrada
      ctx.lineWidth = 3; ctx.strokeStyle = tinta; ctx.strokeRect(cx - W * .3 - 9, 6, 18, top - 26);
      if (p.re > 0 && corre) { ctx.fillStyle = mezcla(p.ce / cmax); ctx.fillRect(cx - W * .3 - 2 - p.re / 5, top - 20, 4 + p.re / 2.5, nivel - top + 20); }
      // caño de salida
      ctx.strokeRect(cx + W * .5, fondo - H * .22, 34, 12);
      if (p.rs > 0 && corre && v > 1) { ctx.fillStyle = col; ctx.fillRect(cx + W * .5 + 30 - p.rs / 5, fondo - H * .22 + 12, 3 + p.rs / 2.5, H * .22 + 18); }
      ctx.fillStyle = tinta; ctx.font = '13px "EB Garamond", Georgia, serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('entra: ' + p.re + ' L/min a ' + p.ce + ' kg/L', cx - W * .3 + 16, 8);
      ctx.textAlign = 'right'; ctx.fillText('sale: ' + p.rs + ' L/min', w - 6, fondo - H * .22 - 20);
      // gráfica de Q(t)
      var qm = 0, pts = [], j; for (j = 0; j <= 300; j++) { var tt = tFin * j / 300, val = Q(tt); pts.push([tt, val]); if (isFinite(val)) qm = Math.max(qm, val); }
      g.xmin = 0; g.xmax = tFin; g.ymin = 0; g.ymax = Math.max(qm * 1.12, 1); g.ejes();
      if (Math.abs(p.re - p.rs) < 1e-9 && p.rs > 0) g.curva([[0, p.ce * p.V0], [tFin, p.ce * p.V0]], A.color('--bosque'), 1.3, [6, 5]);
      g.curva(pts, A.color('--perg3'), 2, [3, 4]);
      g.curva(pts.filter(function (x) { return x[0] <= t + 1e-9; }), A.color('--lacre'), 2.8);
      g.punto(t, Q(t), A.color('--lacre'), 5.5);
      function dato(n, s) { q(host, '[data-d=' + n + ']').textContent = s; }
      dato('t', A.num(t, 2) + ' min'); dato('V', A.num(v, 1) + ' L'); dato('Q', A.num(qq, 3) + ' kg'); dato('c', A.num(conc, 4) + ' kg/L');
    }
    function cuadro(ahora) {
      var dtReal = Math.min(.1, (ahora - ultimo) / 1000 || 0); ultimo = ahora;
      if (corre) { t += dtReal * tFin / 14; if (t >= tFin) { t = tFin; corre = false; q(host, '[data-a=ini]').textContent = 'Repetir'; } }
      pintar(); raf = requestAnimationFrame(cuadro);
    }
    for (var b = 0; b < 14; b++) burb.push({ x: Math.random() * 2 - 1, r: 1.5 + Math.random() * 3, v: .15 + Math.random() * .3, o: Math.random() });
    g.alDibujar = pintar;
    function poner(o) { for (var n in o) k(n).value = o[n]; leer(); }
    A.$$('input[type=range]', host).forEach(function (e) { e.addEventListener('input', leer); });
    host.addEventListener('click', function (ev) {
      var a = ev.target.dataset && ev.target.dataset.a;
      if (a === 'ini') {
        if (t >= tFin) t = 0;
        if (A.quieto) { t = tFin; pintar(); return; }
        corre = !corre; ev.target.textContent = corre ? 'Pausar' : 'Continuar';
      }
      if (a === 'res') poner(DEF);
    });
    poner(DEF);
    if (A.quieto) pintar(); else raf = requestAnimationFrame(cuadro);
    return { destruir: function () { if (raf) cancelAnimationFrame(raf); g.destruir(); } };
  };
})(Atlas);
