/* ============================================================
   Atlas.nucleo — espacio de nombres, datos de las regiones,
   almacenamiento seguro (funciona dentro de iframes con sandbox),
   utilidades y analizador de expresiones matemáticas (sin eval).
   ============================================================ */
var Atlas = window.Atlas || {};
(function (A) {
  'use strict';

  /* ---- Lugares del reino (coordenadas sobre un lienzo 1600 x 1000) ---- */
  A.LUGARES = [
    { id: 'region-1-1', sec: '1.1', nombre: 'El Valle de los Orígenes', tema: 'Modelado mediante ecuaciones diferenciales', dif: 1, pos: [190, 770],
      glifo: 'M0 11V-2M0 1C-8-1-10-8-3-8C0-6 0-2 0 1M0-3C6-5 10-11 3-12C0-10 0-6 0-3M-8 11H8' },
    { id: 'region-1-2', sec: '1.2', nombre: 'El Paso de la Escisión', tema: 'Técnica analítica: separación de variables', dif: 2, pos: [410, 580],
      glifo: 'M-13 9L-6-9L-1 4M1 4L6-9L13 9M-13 9H-1M1 9H13' },
    { id: 'region-1-3', sec: '1.3', nombre: 'Los Prados de las Mil Flechas', tema: 'Técnica cualitativa: campos de pendientes', dif: 1, pos: [240, 350],
      glifo: 'M-11 5l6-5M-2 8l7-3M-9-4l6-2M2-1l7-6M-3-10l6-1M5 9l5-5' },
    { id: 'region-1-4', sec: '1.4', nombre: 'La Senda de los Pasos Contados', tema: 'Técnica numérica: método de Euler', dif: 2, pos: [510, 230],
      glifo: 'M-12 9H-6V4H0V-1H6V-6H12M-12 9Q0 6 12-9' },
    { id: 'region-1-5', sec: '1.5', nombre: 'El Puente de los Destinos Únicos', tema: 'Existencia y unicidad de soluciones', dif: 3, pos: [770, 400],
      glifo: 'M-13 5H13M-13 5V-2M13 5V-2M-13-2Q0-13 13-2M-6 5V-6M0 5V-7.5M6 5V-6' },
    { id: 'region-1-6', sec: '1.6', nombre: 'El Río de los Equilibrios', tema: 'Equilibrios y línea de fase', dif: 2, pos: [700, 680],
      glifo: 'M-12-5q3-4 6 0t6 0t6 0t6 0M-12 1q3-4 6 0t6 0t6 0t6 0M-12 7q3-4 6 0t6 0t6 0t6 0' },
    { id: 'region-1-7', sec: '1.7', nombre: 'La Encrucijada de los Parámetros', tema: 'Bifurcaciones', dif: 3, pos: [980, 790],
      glifo: 'M0 12V1M0 1Q-2-6-10-10M0 1Q2-6 10-10M0 1V-11' },
    { id: 'region-1-8', sec: '1.8', nombre: 'Las Torres de la Superposición', tema: 'Ecuaciones lineales', dif: 2, pos: [1150, 520],
      glifo: 'M-10 11V-3h-1.5v-3h2.5v2h2v-2h2.5v3H-4V11M4 11V-8h-1.5v-3h2.5v2h2v-2h2.5v3H10V11M-13 11H13' },
    { id: 'region-1-9', sec: '1.9', nombre: 'La Forja del Factor Integrante', tema: 'Factores integrantes para ecuaciones lineales', dif: 3, pos: [1010, 250],
      glifo: 'M-11-5H10Q6 0 3 1V5H7V9H-8V5H-4V1Q-9 0-11-5Z' },
    { id: 'ciudadela', sec: 'Repaso', nombre: 'La Ciudadela del Juicio', tema: 'Ejercicios de repaso del capítulo', dif: 3, pos: [1370, 300], especial: true,
      glifo: 'M-12 11V-3h4v3h3V-10h10V0h3v-3h4V11ZM-2 11V5a2 2 0 0 1 4 0V11' },
    { id: 'talleres', sec: 'Talleres', nombre: 'Los Talleres del Alquimista', tema: 'Laboratorios del capítulo', dif: 3, pos: [1380, 720], especial: true,
      glifo: 'M-4-11H4M-2.5-11V-3L-9 8Q-10 11-7 11H7Q10 11 9 8L2.5-3V-11M-6 4H6' }
  ];
  A.lugar = function (id) { return A.LUGARES.find(function (l) { return l.id === id; }); };

  /* ---- Almacenamiento: localStorage si está disponible; si no, memoria ---- */
  var mem = {}, hayLS = false;
  try {
    window.localStorage.setItem('__atlas', '1'); window.localStorage.removeItem('__atlas'); hayLS = true;
  } catch (e) { hayLS = false; }
  A.Almacen = {
    persistente: hayLS,
    leer: function (k, def) {
      try { var v = hayLS ? window.localStorage.getItem('atlas.' + k) : mem[k]; return v == null ? def : JSON.parse(v); }
      catch (e) { return def; }
    },
    guardar: function (k, v) {
      var s = JSON.stringify(v);
      try { if (hayLS) window.localStorage.setItem('atlas.' + k, s); else mem[k] = s; } catch (e) { mem[k] = s; }
    }
  };
  A.progreso = A.Almacen.leer('progreso', { sellos: {} });
  var oyentes = [];
  A.alCambiarProgreso = function (f) { oyentes.push(f); };
  A.sellar = function (id) {
    A.progreso.sellos[id] = true; A.Almacen.guardar('progreso', A.progreso);
    oyentes.forEach(function (f) { f(); });
  };
  A.sellado = function (id) { return !!A.progreso.sellos[id]; };

  /* ---- Utilidades de DOM y formato ---- */
  A.$ = function (s, el) { return (el || document).querySelector(s); };
  A.$$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  A.color = function (v) { return getComputedStyle(document.body).getPropertyValue(v).trim(); };
  A.quieto = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  A.num = function (x, n) {
    if (!isFinite(x)) return '—';
    n = n == null ? 4 : n;
    if (x !== 0 && (Math.abs(x) >= 1e5 || Math.abs(x) < 1e-4)) return x.toExponential(2).replace('e', '·10^');
    return String(+x.toFixed(n));
  };
  /* Renderiza LaTeX (\( \) y \[ \]) dentro de un elemento si KaTeX está cargado */
  A.tex = function (el) {
    if (window.renderMathInElement) {
      window.renderMathInElement(el, { delimiters: [{ left: '\\[', right: '\\]', display: true }, { left: '\\(', right: '\\)', display: false }], throwOnError: false });
    }
  };
  A.texEn = function (el, s, bloque) {
    if (window.katex) { try { window.katex.render(s, el, { displayMode: !!bloque, throwOnError: false }); return; } catch (e) {} }
    el.textContent = s;
  };
  A.sellosvg = function (txt) {
    var p = '';
    for (var i = 0; i < 14; i++) { var a = i / 14 * 6.2832, r = 44 + (i % 2 ? 3 : -2) + (i % 3); p += (i ? 'L' : 'M') + (50 + r * Math.cos(a)).toFixed(1) + ' ' + (50 + r * Math.sin(a)).toFixed(1); }
    return '<svg viewBox="0 0 100 100" class="sello-lacre" role="img" aria-label="Sello de lacre"><path d="' + p + 'Z" fill="#8c2f1e" stroke="#5e1c10" stroke-width="2" stroke-linejoin="round"/>' +
      '<circle cx="50" cy="50" r="31" fill="none" stroke="#c9644f" stroke-width="2"/><circle cx="50" cy="50" r="27" fill="none" stroke="#5e1c10" stroke-width="1"/>' +
      '<text x="50" y="58" text-anchor="middle" font-family="Cinzel,serif" font-weight="700" font-size="22" fill="#f2e6c9">' + txt + '</text></svg>';
  };

  /* ============================================================
     Analizador de expresiones (descenso recursivo). Compila una
     cadena como "y*(1-y) + sin(t)" a una función JS sin usar eval.
     ============================================================ */
  var FUN = { sin: Math.sin, sen: Math.sin, cos: Math.cos, tan: Math.tan, exp: Math.exp, ln: Math.log, log: Math.log,
    sqrt: Math.sqrt, raiz: Math.sqrt, abs: Math.abs, atan: Math.atan, asin: Math.asin, acos: Math.acos,
    sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, cbrt: Math.cbrt, sign: Math.sign };
  var CONST = { pi: Math.PI, e: Math.E };

  A.compilar = function (texto, vars) {
    var s = String(texto).replace(/\s+/g, '').replace(/,/g, '.').replace(/−/g, '-').replace(/·/g, '*').toLowerCase();
    if (!s) throw new Error('Escribe una expresión.');
    var toks = [], i = 0, m;
    while (i < s.length) {
      var c = s[i];
      if ((m = /^\d*\.?\d+(e[+-]?\d+)?/.exec(s.slice(i))) && m[0]) { toks.push({ t: 'n', v: parseFloat(m[0]) }); i += m[0].length; }
      else if ((m = /^[a-zαµ]+/.exec(s.slice(i)))) {
        var id = m[0]; i += id.length;
        if (FUN[id] && s[i] === '(') toks.push({ t: 'f', v: id });
        else if (vars.indexOf(id) >= 0) toks.push({ t: 'v', v: id });
        else if (CONST[id] != null) toks.push({ t: 'n', v: CONST[id] });
        else {
          // intenta partir en trozos conocidos: "ty" -> t*y, "tsin(" -> t*sin(
          var k = 0, ok = true;
          while (k < id.length) {
            var hallado = null, resto = id.slice(k);
            Object.keys(FUN).forEach(function (fn) { if (!hallado && resto === fn && s[i] === '(') hallado = { t: 'f', v: fn }; });
            if (!hallado) vars.forEach(function (vn) { if (!hallado && resto.indexOf(vn) === 0) hallado = { t: 'v', v: vn }; });
            if (!hallado && resto.indexOf('pi') === 0) hallado = { t: 'n', v: Math.PI, len: 2 };
            if (!hallado && resto[0] === 'e') hallado = { t: 'n', v: Math.E, len: 1 };
            if (!hallado) { ok = false; break; }
            toks.push(hallado); k += hallado.len || hallado.v.length;
          }
          if (!ok) throw new Error('No reconozco «' + id + '». Variables permitidas: ' + vars.join(', ') + '.');
        }
      }
      else if ('+-*/^()'.indexOf(c) >= 0) { toks.push({ t: c }); i++; }
      else throw new Error('Símbolo inesperado «' + c + '».');
    }
    var p = 0;
    function ver() { return toks[p]; }
    function expr() {
      var a = term();
      while (ver() && (ver().t === '+' || ver().t === '-')) {
        var op = toks[p++].t, b = term();
        a = (function (a, b, op) { return op === '+' ? function (x) { return a(x) + b(x); } : function (x) { return a(x) - b(x); }; })(a, b, op);
      }
      return a;
    }
    function term() {
      var a = unario();
      for (;;) {
        var k = ver(); if (!k) break;
        if (k.t === '*' || k.t === '/') {
          p++; var b = unario();
          a = (function (a, b, d) { return d ? function (x) { return a(x) / b(x); } : function (x) { return a(x) * b(x); }; })(a, b, k.t === '/');
        } else if (k.t === 'n' || k.t === 'v' || k.t === 'f' || k.t === '(') {   // multiplicación implícita
          var b2 = potencia();
          a = (function (a, b) { return function (x) { return a(x) * b(x); }; })(a, b2);
        } else break;
      }
      return a;
    }
    function unario() {
      if (ver() && ver().t === '-') { p++; var a = unario(); return function (x) { return -a(x); }; }
      if (ver() && ver().t === '+') { p++; return unario(); }
      return potencia();
    }
    function potencia() {
      var a = atomo();
      if (ver() && ver().t === '^') { p++; var b = unario(); return function (x) { return Math.pow(a(x), b(x)); }; }
      return a;
    }
    function atomo() {
      var k = toks[p++];
      if (!k) throw new Error('La expresión está incompleta.');
      if (k.t === 'n') { var v = k.v; return function () { return v; }; }
      if (k.t === 'v') { var nm = k.v; return function (x) { return x[nm]; }; }
      if (k.t === 'f') {
        var f = FUN[k.v];
        if (!ver() || ver().t !== '(') throw new Error('Falta «(» después de ' + k.v + '.');
        p++; var arg = expr(); cerrar();
        return function (x) { return f(arg(x)); };
      }
      if (k.t === '(') { var e = expr(); cerrar(); return e; }
      throw new Error('Revisa la expresión cerca de «' + k.t + '».');
    }
    function cerrar() { if (!ver() || ver().t !== ')') throw new Error('Falta cerrar un paréntesis.'); p++; }
    var raiz = expr();
    if (p < toks.length) throw new Error('Revisa la expresión cerca de «' + (toks[p].v || toks[p].t) + '».');
    return raiz;
  };

  /* Integrador RK4 de un paso */
  A.rk4 = function (f, t, y, h) {
    var k1 = f(t, y), k2 = f(t + h / 2, y + h / 2 * k1), k3 = f(t + h / 2, y + h / 2 * k2), k4 = f(t + h, y + h * k3);
    return y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4);
  };
})(Atlas);
