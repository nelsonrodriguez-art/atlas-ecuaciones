/* ============================================================
   Atlas.App — arranque, enrutamiento por hash, vistas, índice
   lateral, atajos de teclado y modo nocturno.
   Rutas: #mapa, #region-1-1 … #region-1-9, #ciudadela, #talleres
   ============================================================ */
(function (A) {
  'use strict';
  var actual = 'mapa', labs = [], vMapa, vRegion, indice, velo;

  function ordenDe(id) { return A.LUGARES.findIndex(function (l) { return l.id === id; }); }

  /* Cambia de vista. No navega el documento superior: solo el hash propio. */
  function ir(id, sinHash) {
    if (id !== 'mapa' && !A.lugar(id)) id = 'mapa';
    actual = id;
    if (!sinHash) { try { if (window.location.hash !== '#' + id) window.location.hash = id; } catch (e) {} }
    labs.forEach(function (l) { try { l.destruir(); } catch (e) {} }); labs = [];
    cerrarIndice();
    if (id === 'mapa') { vRegion.hidden = true; vRegion.innerHTML = ''; vMapa.hidden = false; A.Mapa.activar(true); A.Mapa.actualizar(); }
    else { vMapa.hidden = true; A.Mapa.activar(false); vRegion.hidden = false; region(id); }
    migas(); pintarListas();
    window.scrollTo(0, 0);
    try { document.title = (id === 'mapa' ? 'Mapa del reino' : A.lugar(id).nombre) + ' · El Atlas de las Ecuaciones'; } catch (e) {}
  }
  A.ir = ir;

  function migas() {
    var m = A.$('.migas');
    if (actual === 'mapa') { m.innerHTML = '<span aria-current="page">Mapa del reino</span>'; return; }
    var l = A.lugar(actual);
    m.innerHTML = '<button type="button" data-ir="mapa">Mapa del reino</button><span class="sep" aria-hidden="true">❧</span><span aria-current="page">' + (l.especial ? '' : l.sec + ' · ') + l.nombre + '</span>';
  }

  /* ---- Vista de una región ---- */
  function region(id) {
    var l = A.lugar(id), i = ordenDe(id), ant = A.LUGARES[i - 1], sig = A.LUGARES[i + 1];
    function viaje(x, cls, rot) { return x ? '<button type="button" class="viaje ' + cls + '" data-ir="' + x.id + '">' + rot + '<small>' + x.nombre + '</small></button>' : '<span></span>'; }
    vRegion.innerHTML = '<article class="pergamino desplegar"><header class="estandarte"><div class="medallon"><svg viewBox="-46 -46 92 92" class="lugar" aria-hidden="true">' + A.Mapa.medallon(l, 42) + '</svg></div>' +
      '<p class="sec">' + (l.especial ? l.sec : 'Sección ' + l.sec + ' del capítulo 1') + '</p><h1>' + l.nombre + '</h1><p class="tema">' + l.tema + '</p></header>' +
      '<nav class="capitulos" aria-label="Partes de esta región"></nav><div class="cuerpo">' + (A.CONTENIDO[id] || '<p>Esta región aún no tiene crónica.</p>') + '</div>' +
      '<footer class="pasos">' + viaje(ant, 'ant', '← Región anterior') + '<button type="button" class="btn-ico" data-ir="mapa" aria-label="Volver al mapa">' + A.BRUJULA + '</button>' + viaje(sig, 'sig', 'Región siguiente →') + '</footer></article>';
    var cuerpo = A.$('.cuerpo', vRegion);

    // capítulos (anclas internas a cada h2)
    var nav = A.$('.capitulos', vRegion);
    A.$$('h2', cuerpo).forEach(function (h) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = h.textContent;
      b.addEventListener('click', function () { h.scrollIntoView({ behavior: A.quieto ? 'auto' : 'smooth', block: 'start' }); });
      nav.appendChild(b);
    });
    // ejemplos con pasos desplegables
    A.$$('.ejemplo', cuerpo).forEach(function (ej, n) {
      var h = document.createElement('h3'); h.textContent = 'Ejemplo ' + (n + 1) + '. ' + (ej.dataset.t || ''); ej.insertBefore(h, ej.firstChild);
      var pasos = A.$$('.paso', ej), vistos = 0;
      pasos.forEach(function (p, k) { p.hidden = true; p.dataset.n = k + 1; });
      var bar = document.createElement('div'); bar.className = 'botonera';
      bar.innerHTML = '<button type="button" class="btn">Revelar el siguiente paso</button><button type="button" class="btn sec">Mostrar todo</button>';
      ej.appendChild(bar);
      var b1 = bar.children[0], b2 = bar.children[1];
      function ver(hasta) { while (vistos < hasta) pasos[vistos++].hidden = false; if (vistos >= pasos.length) { b1.disabled = true; b1.textContent = 'Ejemplo completo'; b2.hidden = true; } }
      b1.addEventListener('click', function () { ver(vistos + 1); });
      b2.addEventListener('click', function () { ver(pasos.length); });
    });
    // pruebas del Guardián: pista y solución plegadas
    A.$$('.prueba', cuerpo).forEach(function (p, n) {
      p.dataset.n = n + 1;
      [['.pista', 'Pedir una pista'], ['.sol', 'Ver la solución']].forEach(function (par) {
        var el = A.$(par[0], p); if (!el) return;
        var d = document.createElement('details'), s = document.createElement('summary'); s.textContent = par[1];
        el.parentNode.insertBefore(d, el); d.appendChild(s); d.appendChild(el);
      });
    });
    A.$$('.quiz', cuerpo).forEach(function (qz) { A.Quiz.montar(qz, id); });
    A.tex(cuerpo);
    A.$$('.lab', cuerpo).forEach(function (h) { var f = A.Labs[h.dataset.lab]; if (f) labs.push(f(h)); });
  }

  /* ---- Índice lateral y bitácora ---- */
  function pintarListas() {
    var filas = A.LUGARES.map(function (l) {
      return '<li><button type="button" data-ir="' + l.id + '"' + (l.id === actual ? ' aria-current="page"' : '') + '><span class="n">' + (l.especial ? '✧' : l.sec) + '</span><span class="nm">' + l.nombre + '</span><span class="sl">' + (A.sellado(l.id) ? '✦' : '') + '</span><span class="tm">' + l.tema + '</span></button></li>';
    }).join('');
    A.$('#indice ol').innerHTML = filas;
    A.$('.ruta').innerHTML = A.LUGARES.map(function (l) {
      return '<li><button type="button" data-ir="' + l.id + '">' + (A.sellado(l.id) ? '<span class="ok">✦ sello ganado</span>' : '') + '<span class="n">' + l.sec + '</span><span class="nm">' + l.nombre + '</span><span class="tm">' + l.tema + '</span></button></li>';
    }).join('');
    var n = A.LUGARES.filter(function (l) { return A.sellado(l.id); }).length;
    A.$('.cuenta-sellos').innerHTML = '<i aria-hidden="true"></i>' + n + ' de ' + A.LUGARES.length + ' sellos';
  }
  function abrirIndice() { indice.classList.add('abierto'); velo.hidden = false; A.$('#btn-indice').setAttribute('aria-expanded', 'true'); var b = A.$('button', indice); if (b) b.focus(); }
  function cerrarIndice() { if (!indice) return; indice.classList.remove('abierto'); velo.hidden = true; A.$('#btn-indice').setAttribute('aria-expanded', 'false'); }

  A.BRUJULA = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 4.5L14.2 12L12 19.5L9.8 12Z"/><path d="M4.5 12H9.8M14.2 12H19.5"/></svg>';

  function iniciar() {
    vMapa = A.$('#vista-mapa'); vRegion = A.$('#vista-region'); indice = A.$('#indice'); velo = A.$('.velo');
    A.$('#btn-mapa').innerHTML = A.BRUJULA;
    A.Mapa.montar(A.$('.mapa-marco'), function (id) { ir(id); });
    if (!A.Almacen.persistente) A.$('.aviso-mem').hidden = false;
    if (A.Almacen.leer('noche', false)) { document.body.classList.add('noche'); A.$('#btn-noche').setAttribute('aria-pressed', 'true'); }

    document.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-ir]') : null;
      if (b) { e.preventDefault(); ir(b.dataset.ir); }
    });
    A.$('#btn-indice').addEventListener('click', function () { indice.classList.contains('abierto') ? cerrarIndice() : abrirIndice(); });
    velo.addEventListener('click', cerrarIndice);
    A.$('#btn-noche').addEventListener('click', function (e) {
      var on = document.body.classList.toggle('noche'); e.currentTarget.setAttribute('aria-pressed', on ? 'true' : 'false'); A.Almacen.guardar('noche', on);
      A.$$('.lab canvas').forEach(function (c) { c.style.height = (c.offsetHeight + 1) + 'px'; setTimeout(function () { c.style.height = ''; }, 30); });
    });
    A.$('.salto').addEventListener('click', function (e) { e.preventDefault(); A.$('#contenido').focus(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { cerrarIndice(); return; }
      var t = e.target.tagName; if (t === 'INPUT' || t === 'SELECT' || t === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'm' || e.key === 'M') ir('mapa');
      if (actual !== 'mapa' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        var x = A.LUGARES[ordenDe(actual) + (e.key === 'ArrowLeft' ? -1 : 1)]; if (x) ir(x.id);
      }
    });
    window.addEventListener('hashchange', function () { var h = window.location.hash.slice(1) || 'mapa'; if (h !== actual) ir(h, true); });
    A.alCambiarProgreso(function () { pintarListas(); A.Mapa.actualizar(); });
    var h0 = ''; try { h0 = window.location.hash.slice(1); } catch (e) {}
    ir(h0 || 'mapa', true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})(Atlas);
