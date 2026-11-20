/* ============================================================
   Atlas.Grafica — ayudante de dibujo sobre <canvas>:
   escala con devicePixelRatio, se redimensiona con ResizeObserver,
   dibuja ejes etiquetados y muestra las coordenadas del cursor.
   Atlas.Quiz — motor de cuestionarios («Sello de la región»).
   ============================================================ */
(function (A) {
  'use strict';

  function pasoBonito(rango, n) {
    var bruto = rango / (n || 6), p = Math.pow(10, Math.floor(Math.log10(bruto))), f = bruto / p;
    return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * p;
  }

  A.Grafica = function (canvas, o) {
    var g = this;
    g.c = canvas; g.ctx = canvas.getContext('2d');
    g.xmin = -1; g.xmax = 1; g.ymin = -1; g.ymax = 1; g.xl = 't'; g.yl = 'y';
    g.m = { l: 48, r: 14, t: 24, b: 38 };
    g.fx = null; g.fy = null; g.lectura = null; g.alDibujar = null; g.extra = null;
    for (var k in o) g[k] = o[k];
    g.w = 300; g.h = 200;
    g._ro = new ResizeObserver(function () { g.ajustar(); if (g.alDibujar) g.alDibujar(); });
    g._ro.observe(canvas);
    canvas.addEventListener('mousemove', function (ev) {
      if (!g.lectura) return;
      var p = g.desdeEvento(ev);
      if (!p) { g.lectura.textContent = ' '; return; }
      var tx = g.fx ? g.fx(p[0]) : A.num(p[0], 3), ty = g.fy ? g.fy(p[1]) : A.num(p[1], 3);
      g.lectura.textContent = g.xl + ' = ' + tx + '   ' + g.yl + ' = ' + ty + (g.extra ? '   ' + g.extra(p[0], p[1]) : '');
    });
    canvas.addEventListener('mouseleave', function () { if (g.lectura) g.lectura.textContent = ' '; });
    g.ajustar();
  };
  var P = A.Grafica.prototype;
  P.ajustar = function () {
    var r = this.c.getBoundingClientRect(), d = window.devicePixelRatio || 1;
    this.w = Math.max(r.width, 50); this.h = Math.max(r.height, 50);
    this.c.width = Math.round(this.w * d); this.c.height = Math.round(this.h * d);
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
  };
  P.X = function (x) { return this.m.l + (x - this.xmin) / (this.xmax - this.xmin) * (this.w - this.m.l - this.m.r); };
  P.Y = function (y) { return this.h - this.m.b - (y - this.ymin) / (this.ymax - this.ymin) * (this.h - this.m.t - this.m.b); };
  P.desdeEvento = function (ev) {
    var r = this.c.getBoundingClientRect(), px = ev.clientX - r.left, py = ev.clientY - r.top;
    if (px < this.m.l || px > this.w - this.m.r || py < this.m.t || py > this.h - this.m.b) return null;
    return [this.xmin + (px - this.m.l) / (this.w - this.m.l - this.m.r) * (this.xmax - this.xmin),
            this.ymin + (this.h - this.m.b - py) / (this.h - this.m.t - this.m.b) * (this.ymax - this.ymin)];
  };
  /* Limpia y dibuja rejilla, ejes, marcas y rótulos */
  P.ejes = function () {
    var g = this, c = g.ctx, tinta = A.color('--tinta'), suave = A.color('--perg3');
    c.clearRect(0, 0, g.w, g.h);
    c.font = '13px "EB Garamond", Georgia, serif'; c.lineWidth = 1;
    var sx = pasoBonito(g.xmax - g.xmin, g.w / 90), sy = pasoBonito(g.ymax - g.ymin, g.h / 60), v;
    if (g.fx) sx = Math.max(1, Math.round(sx)); if (g.fy) sy = Math.max(1, Math.round(sy));   // escalas log: marcas en potencias enteras
    c.textAlign = 'center'; c.textBaseline = 'top';
    for (v = Math.ceil(g.xmin / sx - 1e-9) * sx; v <= g.xmax + 1e-9; v += sx) {
      c.strokeStyle = suave; c.beginPath(); c.moveTo(g.X(v), g.m.t); c.lineTo(g.X(v), g.h - g.m.b); c.stroke();
      c.fillStyle = tinta; c.fillText(g.fx ? g.fx(v) : A.num(v, 6), g.X(v), g.h - g.m.b + 5);
    }
    c.textAlign = 'right'; c.textBaseline = 'middle';
    for (v = Math.ceil(g.ymin / sy - 1e-9) * sy; v <= g.ymax + 1e-9; v += sy) {
      c.strokeStyle = suave; c.beginPath(); c.moveTo(g.m.l, g.Y(v)); c.lineTo(g.w - g.m.r, g.Y(v)); c.stroke();
      c.fillStyle = tinta; c.fillText(g.fy ? g.fy(v) : A.num(v, 6), g.m.l - 6, g.Y(v));
    }
    c.strokeStyle = tinta; c.lineWidth = 1.2;
    if (g.xmin < 0 && g.xmax > 0 && !g.fx) { c.beginPath(); c.moveTo(g.X(0), g.m.t); c.lineTo(g.X(0), g.h - g.m.b); c.stroke(); }
    if (g.ymin < 0 && g.ymax > 0 && !g.fy) { c.beginPath(); c.moveTo(g.m.l, g.Y(0)); c.lineTo(g.w - g.m.r, g.Y(0)); c.stroke(); }
    c.strokeRect(g.m.l, g.m.t, g.w - g.m.l - g.m.r, g.h - g.m.t - g.m.b);
    c.font = 'italic 15px "EB Garamond", Georgia, serif'; c.fillStyle = tinta;
    c.textAlign = 'right'; c.textBaseline = 'bottom'; c.fillText(g.xl, g.w - g.m.r - 2, g.h - 3);
    c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText(g.yl, 6, 3);
  };
  P.recortar = function (f) {
    var g = this, c = g.ctx; c.save(); c.beginPath();
    c.rect(g.m.l, g.m.t, g.w - g.m.l - g.m.r, g.h - g.m.t - g.m.b); c.clip(); f(c); c.restore();
  };
  /* Curva a partir de puntos [x, y]; se interrumpe en valores no finitos */
  P.curva = function (pts, color, ancho, dash) {
    var g = this;
    g.recortar(function (c) {
      c.strokeStyle = color; c.lineWidth = ancho || 2; c.setLineDash(dash || []); c.lineJoin = 'round';
      var lim = (g.ymax - g.ymin) * 20, abierto = false;
      c.beginPath();
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (!isFinite(p[1]) || Math.abs(p[1] - g.ymin) > lim) { abierto = false; continue; }
        if (abierto) c.lineTo(g.X(p[0]), g.Y(p[1])); else { c.moveTo(g.X(p[0]), g.Y(p[1])); abierto = true; }
      }
      c.stroke(); c.setLineDash([]);
    });
  };
  P.funcion = function (f, color, ancho, dash) {
    var pts = [], n = 400;
    for (var i = 0; i <= n; i++) { var x = this.xmin + (this.xmax - this.xmin) * i / n; pts.push([x, f(x)]); }
    this.curva(pts, color, ancho, dash);
  };
  P.punto = function (x, y, color, r, hueco) {
    var c = this.ctx; c.beginPath(); c.arc(this.X(x), this.Y(y), r || 4, 0, 6.2832);
    if (hueco) { c.fillStyle = A.color('--perg'); c.fill(); c.strokeStyle = color; c.lineWidth = 2; c.stroke(); }
    else { c.fillStyle = color; c.fill(); }
  };
  P.vertical = function (x, color, dash, rotulo) {
    var c = this.ctx; c.strokeStyle = color; c.lineWidth = 1.5; c.setLineDash(dash || [5, 4]);
    c.beginPath(); c.moveTo(this.X(x), this.m.t); c.lineTo(this.X(x), this.h - this.m.b); c.stroke(); c.setLineDash([]);
    if (rotulo) { c.fillStyle = color; c.font = '13px "EB Garamond", Georgia, serif'; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText(rotulo, this.X(x) + 4, this.m.t + 3); }
  };
  P.destruir = function () { this._ro.disconnect(); };

  /* ============================================================
     Motor de cuestionarios.
     Marcado esperado:
       <div class="quiz"> <div class="q" data-t="om|vf|num" data-r="…" [data-tol="…"]>
         <p>pregunta</p> <ul><li>opción</li>…</ul> <div class="exp">explicación</div> </div> … </div>
     data-r: índice (desde 0) de la opción correcta, «v»/«f», o el valor numérico.
     ============================================================ */
  A.Quiz = {
    montar: function (quiz, idLugar) {
      var qs = A.$$('.q', quiz), estado = [];
      qs.forEach(function (q, i) {
        var tipo = q.dataset.t, exp = A.$('.exp', q), ul = A.$('ul', q), cont = document.createElement('div');
        exp.hidden = true; exp.setAttribute('aria-live', 'polite');
        var num = document.createElement('span'); num.className = 'veredicto'; num.textContent = 'Pregunta ' + (i + 1) + ' de ' + qs.length;
        q.insertBefore(num, q.firstChild);
        estado[i] = { resp: null, ok: null };
        if (tipo === 'num') {
          cont.innerHTML = '<label>Tu respuesta: <input type="text" inputmode="decimal" aria-label="Respuesta numérica de la pregunta ' + (i + 1) + '"></label>';
          A.$('input', cont).addEventListener('input', function (e) { estado[i].resp = e.target.value; });
        } else {
          cont.className = 'ops'; cont.setAttribute('role', 'group');
          var ops = tipo === 'vf' ? ['Verdadero', 'Falso'] : A.$$('li', ul).map(function (li) { return li.innerHTML; });
          ops.forEach(function (h, j) {
            var b = document.createElement('button'); b.type = 'button'; b.className = 'op'; b.setAttribute('aria-pressed', 'false');
            b.innerHTML = '<span>' + 'abcdef'[j] + ')</span><span>' + h + '</span>';
            b.addEventListener('click', function () {
              if (estado[i].ok !== null) return;
              A.$$('.op', cont).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
              b.setAttribute('aria-pressed', 'true'); estado[i].resp = j;
            });
            cont.appendChild(b);
          });
          if (ul) ul.remove();
        }
        q.insertBefore(cont, exp);
      });
      var pie = document.createElement('div');
      pie.innerHTML = '<div class="botonera"><button type="button" class="btn" data-a="calificar">Comprobar respuestas</button>' +
        '<button type="button" class="btn sec" data-a="reiniciar" hidden>Intentar de nuevo</button></div><div class="resultado" aria-live="polite"></div>';
      quiz.appendChild(pie);
      var res = A.$('.resultado', pie), bCal = A.$('[data-a=calificar]', pie), bRe = A.$('[data-a=reiniciar]', pie);
      if (A.sellado(idLugar)) res.innerHTML = A.sellosvg('✦') + '<p>Ya ganaste el sello de este lugar. Puedes repetir la prueba cuando quieras.</p>';

      bCal.addEventListener('click', function () {
        var faltan = estado.some(function (e) { return e.resp === null || e.resp === ''; });
        if (faltan) { res.innerHTML = '<p>Responde todas las preguntas antes de comprobar.</p>'; return; }
        var buenas = 0;
        qs.forEach(function (q, i) {
          var tipo = q.dataset.t, r = q.dataset.r, exp = A.$('.exp', q), ok;
          if (tipo === 'num') {
            var v = parseFloat(String(estado[i].resp).replace(',', '.'));
            ok = isFinite(v) && Math.abs(v - parseFloat(r)) <= parseFloat(q.dataset.tol || '0.01');
            A.$('input', q).disabled = true;
          } else {
            var correcta = tipo === 'vf' ? (r === 'v' ? 0 : 1) : parseInt(r, 10);
            ok = estado[i].resp === correcta;
            A.$$('.op', q).forEach(function (b, j) { if (j === correcta) b.classList.add('bien'); else if (j === estado[i].resp) b.classList.add('mal'); });
          }
          estado[i].ok = ok; if (ok) buenas++;
          exp.hidden = false; exp.classList.toggle('mal', !ok);
          if (!exp.dataset.listo) { exp.innerHTML = '<b>' + (ok ? 'Correcto. ' : 'No es correcto. ') + '</b>' + exp.innerHTML; exp.dataset.listo = '1'; }
          else A.$('b', exp).textContent = ok ? 'Correcto. ' : 'No es correcto. ';
        });
        var aprobado = buenas / qs.length >= 0.7;
        bCal.hidden = true; bRe.hidden = false;
        if (aprobado) {
          var nuevo = !A.sellado(idLugar); A.sellar(idLugar);
          res.innerHTML = A.sellosvg('✦') + '<p><b>' + buenas + ' de ' + qs.length + '.</b> ' + (nuevo ? 'El Guardián estampa su sello: el camino del mapa se ilumina hasta aquí.' : 'Conservas el sello de este lugar.') + '</p>';
          if (nuevo) A.$('.sello-lacre', res).classList.add('estampar');
        } else {
          res.innerHTML = '<p><b>' + buenas + ' de ' + qs.length + '.</b> Necesitas al menos el 70 % para ganar el sello. Lee las explicaciones e inténtalo de nuevo.</p>';
        }
      });
      bRe.addEventListener('click', function () {
        qs.forEach(function (q, i) {
          estado[i] = { resp: null, ok: null };
          A.$('.exp', q).hidden = true;
          A.$$('.op', q).forEach(function (b) { b.classList.remove('bien', 'mal'); b.setAttribute('aria-pressed', 'false'); });
          var inp = A.$('input', q); if (inp) { inp.disabled = false; inp.value = ''; }
        });
        res.innerHTML = ''; bCal.hidden = false; bRe.hidden = true;
        quiz.scrollIntoView({ block: 'start' });
      });
    }
  };
})(Atlas);
