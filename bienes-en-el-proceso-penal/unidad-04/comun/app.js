/* Motor de escenas · Audiencias preliminares · JP-OVA
   Cada escena trae su texto en SEGMENTOS LITERALES (generar_audiencias.py + diseno_audiencias.py
   comprueban que juntos reproducen la fuente sin omisiones) y bloques de mediación elegidos por la
   intención del contenido: mapa, lámina, giro, fichas, ruta, línea, balanza, empareja y caso.
   Estética de la última versión aprobada de Ley 1826; patrones de Juan: manito en todo lo que abre
   contenido, visto con fa-circle-check, barra de avance, caja clave y celebración al completar.
   ?escena=N muestra una sola escena para el iframe de Genially (767 × 510).
   Unidades 2–4 (producir_unidad.py): párrafos, viñetas y notas al pie de la fuente se conservan al leer;
   las tablas de la fuente se exploran por pestañas (bloque «tabla»). */
(function () {
  'use strict';
  var raiz = document.getElementById('ova');
  var datos = JSON.parse(document.getElementById('contenido').textContent);
  var O = window.Objetos;
  /* Colores del curso para los objetos dibujados (Bienes, 27/10/2026: los de su plantilla de Genially). Sin «paleta» en los
     datos, los objetos conservan la de JP. */
  if (datos.paleta) Object.keys(datos.paleta).forEach(function (k) { O.C[k] = datos.paleta[k]; });
  var fijo = Number(new URLSearchParams(location.search).get('escena'));
  var embebido = Number.isInteger(fijo) && fijo >= 1 && fijo <= datos.scenes.length;
  var actual = embebido ? fijo - 1 : 0;
  var escena, vistos, total, retornoFoco = null;
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  };
  var mano = '<i class="fas fa-hand-pointer" aria-hidden="true"></i>';
  var visto = '<i class="fas fa-circle-check" aria-hidden="true"></i>';
  var guias = {
    mapa: 'Toca cada rama del mapa para descubrirla.',
    lamina: 'Toca los puntos sobre la ilustración.',
    giro: 'Toca cada tarjeta para girarla y leerla.',
    fichas: 'Elige cada ficha para leer su contenido.',
    ruta: 'Recorre la ruta paso a paso.',
    linea: 'Avanza por la historia del caso.',
    balanza: 'Coloca cada criterio en la balanza.',
    empareja: 'Elige un nombre y tócalo sobre su descripción.',
    caso: 'Resuelve el caso del expediente paso a paso.',
    tabla: 'Elige cada pestaña para recorrer la tabla.'
  };
  /* Juan (26–27/10/2026): mayúscula inicial en rótulos, títulos y en todo bloque de texto (párrafo, viñeta, celda, extracto);
     artículos, leyes, sentencias y la Corte se ven y titilan. Solo cambia la letra con que arranca el bloque: si empieza
     con un número no se toca, y la marca de una enumeración («(ii)», «a)», «b.», «1.») se conserva. */
  function may(s) {
    s = String(s);
    var p = /^[\s•«"“'(¿¡*\-–—]*(?:(?:[ivx]{1,5}|[a-j]|\d{1,2})[.)]\s+)?/.exec(s)[0];
    return p + s.slice(p.length).replace(/^\p{Ll}/u, function (c) { return c.toUpperCase(); });
  }
  var REF = /(?:\b[Aa]rt(?:ículos?|\.)\s*\d+[A-Za-z]?(?:\s(?:del|de la)\s(?:CPP|CN|Constitución Política|Ley\s\d+(?:\sde\s\d{4})?))?|\bLey\s\d+(?:\s?(?:de\s|\/)\d{4})?|\b(?:Sentencias?\s)?(?:C|T|SU)-\d+(?:\/\d+|\sde\s\d{4})?|\b(?:STP|STC|AP|SP|STS)\s?\d+[-\/]\d{4}|Corte Constitucional|Corte Suprema de Justicia|Constitución Política|Resolución\s[\d‐-]+\sde\s\d{4}|Directiva\s\d+(?:\sde\s\d{4})?)/g;
  function esRef(s) { REF.lastIndex = 0; var r = REF.test(String(s)); REF.lastIndex = 0; return r; }
  function refc(s) { return esRef(s) ? ' ref' : ''; }
  function rot(s) { return (esRef(s) ? '<i class="fas fa-book-open ref-ico" aria-hidden="true"></i>' : '') + esc(may(s)); }
  /* Cada línea es un párrafo de la fuente; «[^n] …» al inicio es una nota al pie y «[^n]» en el texto, su llamada. */
  function linea(t) {
    var nota = /^\[\^(\d+)\]\s*/.exec(t), cuerpo = may(nota ? t.slice(nota[0].length) : t);
    var h = esc(cuerpo).replace(REF, function (m) { return '<mark class="ref-texto">' + m + '</mark>'; })
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\[\^(\d+)\]/g, '<sup class="llamada">$1</sup>');
    if (nota) return '<span class="parr nota-pie"><sup>' + nota[1] + '</sup> ' + h + '</span>';
    return '<span class="parr' + (/^• /.test(t) ? ' vineta' : '') + '">' + h + '</span>';
  }
  function rico(s) { return String(s).split('\n').map(linea).join(''); }
  function seg(i) { return (escena.vineta && escena.vineta.indexOf(i) >= 0 ? '• ' : '') + escena.segmentos[i]; }
  function segs(a) {
    return (a || []).map(function (i, n) { return (n && escena.parrafo && escena.parrafo.indexOf(i) >= 0 ? '\n' : n ? ' ' : '') + seg(i); }).join('');
  }
  function svgObjeto(nombre, ancho) {
    return '<svg class="obj-svg" viewBox="-6 -6 132 132" width="' + (ancho || 100) + '" aria-hidden="true">' + O.dibujar(nombre, 60, 120, 1) + '</svg>';
  }
  /* Si el texto no cabe junto a la ilustración, la ilustración se achica o se oculta: nunca desplazamiento. */
  function ajustarLectura(caja) {
    caja.classList.remove('apretada', 'sin-arte', 'mini');
    if (caja.scrollHeight > caja.clientHeight + 1) caja.classList.add('apretada');
    if (caja.scrollHeight > caja.clientHeight + 1) caja.classList.add('sin-arte');
    if (caja.scrollHeight > caja.clientHeight + 1) caja.classList.add('mini');
  }
  /* Texto breve en la ruta o la historia: crece hasta 18 px; si no cabe, ajustarLectura achica ilustración y letra. */
  /* ¿Cabe el contenido de la caja con un margen? Se suma la altura real de los hijos (scrollHeight nunca baja de clientHeight). */
  function cabe(caja, margen) {
    var cs = getComputedStyle(caja), libre = caja.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - (margen || 0), alto = 0, n = 0;
    for (var c = caja.firstElementChild; c; c = c.nextElementSibling) {
      var m = getComputedStyle(c);
      if (m.display !== 'none') { alto += c.offsetHeight + parseFloat(m.marginTop) + parseFloat(m.marginBottom); n++; }
    }
    return alto + Math.max(0, n - 1) * (parseFloat(cs.rowGap) || 0) <= libre;
  }
  function crecerLectura(caja) {
    var texto = caja.querySelector('.ruta-texto');
    caja.classList.remove('apretada', 'sin-arte', 'mini');
    if (texto) for (var fs = 18; fs > 14.2; fs -= 0.5) { caja.style.setProperty('--fs', fs + 'px'); if (cabe(texto, 4) && caja.scrollHeight <= caja.clientHeight + 1) return; }
    caja.style.removeProperty('--fs'); ajustarLectura(caja);
  }
  function reanimar(el) { el.classList.remove('aparece'); void el.offsetWidth; el.classList.add('aparece'); }

  /* ---------- Aprovechar el espacio (Juan, R8): texto a un lado e imagen de contexto al otro ----------
     Ilustraciones de Esteban del 27/10/2026, sin balanza ni martillo. Se elige la del tema de la escena y nunca
     la misma en dos escenas seguidas; sin tema reconocible se dibujan en grande los objetos de la escena. */
  var BASE = ((document.currentScript && document.currentScript.src) || '').replace(/app\.js(\?.*)?$/, '') || '../comun/';
  var CONTEXTO = [
    ['fundamento', /enfoques? de g[eé]nero|interseccional|lideresa/i],
    ['investigacion', /investigaci|interceptaci|allanamiento|vigilancia|encubiert|entregas? vigiladas?|b[uú]squeda selectiva|bases? de datos|evidencia|elementos? materia|polic[ií]a judicial|seguimiento/i],
    ['terminos', /vencimiento de t[eé]rminos|\bplazos?\b|caducidad|preclusi/i],
    ['captura', /captur|aprehen|detenci|detenid|privaci[oó]n de (la )?libertad|medidas? de aseguramiento|flagrancia|indiciad/i],
    ['clasificacion', /clasific|categor|\btipos\b|\bclases\b|cat[aá]logo|nominadas|concursos?|rutas? procesal|delimitaci/i],
    ['sustentacion', /sustent|argument|teor[ií]a del caso|motivos fundados|inferencia|controversia|probatori|alegat/i],
    ['fundamento', /fundament|constituci|marco normativo|legal|jurisprudenc|sentencia|corte|principio|garant|finalidad|\bley\b/i]
  ];
  function temaDeTexto(t) { if (datos.ilustraciones) return null; for (var i = 0; i < CONTEXTO.length; i++) if (CONTEXTO[i][1].test(t)) return CONTEXTO[i][0]; return null; }
  /* Un curso con ilustraciones propias («ilustraciones»: carpeta dentro de comun/) trae la de cada escena en «ilustracion»,
     elegida por el generador según el tema; las de Audiencias (assets/contexto) no se usan. */
  function tema(e) {
    if (datos.ilustraciones) return e.ilustracion || null;
    var propio = [e.titulo_genially || '', e.rotulo || ''].concat(e.bloques.reduce(function (a, b) { return a.concat((b.items || []).map(function (x) { return x.label; })); }, [])).join(' ');
    return temaDeTexto(propio) || temaDeTexto((e.seccion || '') + ' ' + datos.heading);
  }
  function srcImagen(t) { return BASE + (datos.ilustraciones ? datos.ilustraciones + '/' + t : 'assets/contexto/' + t + '.webp'); }
  /* Escena con poco contenido: un solo bloque de lámina o giro con 1–2 elementos, mapa con hasta 3 ramas o balanza (U1). */
  function escasa(e) {
    if (e.bloques.length !== 1) return false;
    var b = e.bloques[0], n = (b.items || []).length;
    return ((b.tipo === 'lamina' || b.tipo === 'giro') && n <= 2) || (b.tipo === 'mapa' && n <= 4) || b.tipo === 'balanza';
  }
  function conFigura(e) {
    var b = e.bloques[0];
    return escasa(e) || (e.bloques.length === 1 && b.tipo === 'fichas') || (e.bloques.length === 1 && b.tipo === 'empareja' && b.items.length <= 2);
  }
  var IMAGEN = datos.scenes.map(function (e) { return conFigura(e) ? tema(e) : null; });
  IMAGEN.forEach(function (t, i) { if (t && i && IMAGEN[i - 1] === t) IMAGEN[i] = null; });
  function figura(objs, acomp) {
    var t = IMAGEN[actual];
    if (t) return '<figure class="ctx-arte foto" aria-hidden="true"><img src="' + srcImagen(t) + '" alt=""></figure>';
    var C = O.C, n = Math.min(objs.length, 3), xs = [[150], [98, 206], [66, 150, 236]][n - 1], s = [1.85, 1.25, 0.95][n - 1];
    /* Lámina de un solo punto (segunda pasada de U3–U4): su objeto al centro y, detrás, dos objetos tomados de su mismo texto. */
    if (objs.length === 1 && acomp && acomp.length) {
      return '<figure class="ctx-arte" aria-hidden="true"><svg viewBox="0 0 300 260"><circle cx="150" cy="128" r="112" fill="' + C.hielo + '"/>' +
        '<ellipse cx="150" cy="238" rx="128" ry="12" fill="' + C.piso + '"/>' +
        acomp.slice(0, 2).map(function (o, j) { return O.dibujar(o, j ? 234 : 66, 226, 0.8, 'entra e' + (j + 1)); }).join('') +
        O.dibujar(objs[0], 150, 238, 1.5, 'entra e0') + '</svg></figure>';
    }
    return '<figure class="ctx-arte" aria-hidden="true"><svg viewBox="0 0 300 260"><circle cx="150" cy="128" r="112" fill="' + C.hielo + '"/>' +
      '<ellipse cx="150" cy="238" rx="128" ry="12" fill="' + C.piso + '"/>' + O.dibujar('planta', 24, 238, 0.62, 'deco') +
      objs.slice(0, 3).map(function (o, j) { return O.dibujar(o, xs[j], 238, s, 'entra e' + j); }).join('') + '</svg></figure>';
  }
  /* El texto crece hasta llenar su caja (máx. 22 px) y se reduce si no cabe. Un texto breve lleva encima el objeto del
     punto en grande; si con él el texto quedaría por debajo de 16 px, el objeto se retira; si ni así cabe, la imagen. */
  function encajarTexto(cont, caja) {
    var fs;
    function probar(min) { for (fs = 22; fs >= min; fs -= 0.5) { caja.style.setProperty('--fs', fs + 'px'); if (cabe(caja, 4)) return true; } return false; }
    cont.classList.remove('sin-arte'); caja.classList.remove('sin-icono');
    if (caja.querySelector('.ctx-icono') && probar(16)) return;
    caja.classList.add('sin-icono');
    if (!probar(12.5)) { cont.classList.add('sin-arte'); probar(12.5); }
  }

  /* ---------- Avance, visto y celebración ---------- */
  function marcar(id) {
    if (vistos[id]) return;
    vistos[id] = true;
    raiz.querySelectorAll('[data-id="' + id + '"]').forEach(function (b) { b.classList.add('visto'); });
    var n = Object.keys(vistos).length, barra = raiz.querySelector('.barra i');
    if (!barra) return;
    barra.style.width = (100 * n / total) + '%';
    raiz.querySelector('.avance output').textContent = n + ' / ' + total;
    if (n === total) celebrar();
  }
  function celebrar() {
    var av = raiz.querySelector('.avance');
    av.classList.add('completo');
    av.querySelector('output').innerHTML = visto + ' Exploración completa';
    /* El confeti va en su propia capa, por encima de toda la escena (antes nacía dentro del encabezado y la escena lo
       tapaba): sale del distintivo «Exploración completa», salta y cae sobre la escena. Sin animación si el usuario la reduce. */
    if (!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      var caja = raiz.getBoundingClientRect(), insignia = av.querySelector('output').getBoundingClientRect();
      var c = document.createElement('div');
      c.className = 'confeti'; c.setAttribute('aria-hidden', 'true');
      c.style.left = (insignia.left + insignia.width / 2 - caja.left) + 'px';
      c.style.top = (insignia.top + insignia.height / 2 - caja.top) + 'px';
      for (var k = 0; k < 48; k++) {
        var p = document.createElement('i');
        p.style.setProperty('--x', (-Math.random() * caja.width * 0.75 + 60) + 'px');
        p.style.setProperty('--s', (20 + Math.random() * 60) + 'px');
        p.style.setProperty('--y', (caja.height * (0.35 + Math.random() * 0.6)) + 'px');
        p.style.setProperty('--r', (Math.random() * 900 - 450) + 'deg');
        p.style.setProperty('--t', (Math.random() * 0.25) + 's');
        c.appendChild(p);
      }
      raiz.appendChild(c);
      setTimeout(function () { c.remove(); }, 2400);
    }
    raiz.querySelectorAll('.tras-completar').forEach(function (e) { e.hidden = false; reanimar(e); });
    raiz.querySelectorAll('.ruta-lectura').forEach(crecerLectura);
  }

  /* ---------- Lector superpuesto común ---------- */
  function leer(titulo, texto, obj, desde) {
    var l = raiz.querySelector('.lector');
    retornoFoco = desde || null;
    l.innerHTML = '<div class="lector-caja" role="dialog" aria-modal="true" aria-label="' + esc(may(titulo)) + '" tabindex="-1">' +
      '<button type="button" class="cerrar" aria-label="Cerrar lectura">Cerrar ×</button>' +
      (obj ? '<span class="lector-arte">' + svgObjeto(obj, 78) + '</span>' : '') +
      '<p class="lectura-eyebrow">' + esc(may(titulo)) + '</p><p class="lectura-texto">' + rico(texto) + '</p></div>';
    l.hidden = false;
    reanimar(l.firstChild);
    l.querySelector('.cerrar').onclick = cerrarLector;
    l.firstChild.focus({ preventScroll: true });
  }
  function cerrarLector() {
    var l = raiz.querySelector('.lector');
    if (!l || l.hidden) return false;
    l.hidden = true; l.innerHTML = '';
    if (retornoFoco && retornoFoco.isConnected) retornoFoco.focus({ preventScroll: true });
    return true;
  }

  /* Nada de bloques largos a la vista: un encabezado de bloque breve se muestra; uno largo se abre al tocarlo. */
  function tituloBloque(b, k) {
    if (!b.titulo || !b.titulo.length) return '';
    var t = segs(b.titulo);
    if (t.length <= 110) return '<p class="bloque-titulo">' + esc(may(t)) + '</p>';
    return fichaIntro('bt' + k, b.rotulo || primerasPalabras(t), t, 'documento');
  }
  function primerasPalabras(t) { var w = t.split(/\s+/); return w.length > 6 ? w.slice(0, 6).join(' ') + '…' : t; }
  function fichaIntro(id, rotulo, texto, obj) {
    return '<button type="button" class="intro' + refc(rotulo) + '" data-id="' + id + '" data-rotulo="' + esc(rotulo) + '" data-obj="' + obj + '" data-texto="' + esc(texto) + '">' +
      '<span class="intro-arte">' + svgObjeto(obj, 34) + '</span><span class="intro-rotulo">' + rot(rotulo) + '</span>' +
      '<span class="intro-toca">' + mano + ' Toca para leer</span><span class="intro-visto">' + visto + '</span></button>';
  }

  /* ---------- Bloques ---------- */
  var B = {};

  B.mapa = function (b, k) {
    var centro = b.items.filter(function (x) { return x.centro; })[0], ramas = b.items.filter(function (x) { return !x.centro; });
    var n = ramas.length, nodos = '', lineas = '';
    ramas.forEach(function (r, i) {
      var ang = -Math.PI / 2 + i * 2 * Math.PI / n, x = 50 + 37 * Math.cos(ang), y = 52 + 36 * Math.sin(ang);
      lineas += '<line x1="50" y1="52" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '" style="--d:' + (0.15 + i * 0.1) + 's"/>';
      nodos += boton('rama', r, k, i + 1, 'left:' + x.toFixed(1) + '%;top:' + y.toFixed(1) + '%;--d:' + (0.25 + i * 0.1) + 's');
    });
    return '<div class="mapa"><svg class="mapa-lineas" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' + lineas + '</svg>' +
      boton('nucleo', centro, k, 0, 'left:50%;top:52%') + nodos + '</div>';
  };
  function boton(clase, item, k, i, estilo) {
    return '<button type="button" class="nodo ' + clase + refc(item.label) + '" data-id="' + k + '-' + i + '" data-b="' + k + '" data-i="' + i + '" style="' + estilo + '">' +
      '<span class="nodo-arte">' + svgObjeto(item.obj, clase === 'nucleo' ? 70 : 48) + '</span><span class="nodo-rotulo">' + rot(item.label) + '</span>' +
      '<span class="nodo-marca">' + mano + visto + '</span></button>';
  }
  B.mapa.activar = function (b, k, el) {
    var orden = [b.items.filter(function (x) { return x.centro; })[0]].concat(b.items.filter(function (x) { return !x.centro; }));
    el.querySelectorAll('.nodo').forEach(function (n) {
      n.addEventListener('click', function () {
        var it = orden[Number(n.dataset.i)];
        leer(it.label, segs(it.segs), it.obj, n); marcar(n.dataset.id);
      });
    });
  };

  var LW = 720, LH = 340, LBASE = 300;
  B.lamina = function (b, k) {
    var n = b.items.length, s = n === 1 ? 1.75 : n === 2 ? 1.5 : n === 3 ? 1.62 : n === 4 ? 1.38 : 1.2, C = O.C, xs = [];
    for (var i = 0; i < n; i++) xs.push(n === 1 ? 360 : Math.round(150 + i * (420 / (n - 1))));
    var pared = '<rect width="' + LW + '" height="' + (LBASE - 4) + '" fill="#EEF8F5"/><rect y="' + (LBASE - 70) + '" width="' + LW + '" height="66" fill="#E2F2EE"/>' +
      '<rect x="40" y="26" width="64" height="48" rx="4" fill="' + C.blanco + '" stroke="' + C.niebla + '" stroke-width="4"/><path d="M48 66 L64 48 L76 58 L86 44 L96 66 Z" fill="' + C.celeste + '"/>' +
      '<rect x="616" y="22" width="56" height="62" rx="4" fill="' + C.blanco + '" stroke="' + C.niebla + '" stroke-width="4"/><circle cx="644" cy="46" r="12" fill="' + C.coral + '"/><rect x="628" y="64" width="32" height="5" rx="2" fill="' + C.celeste + '"/>';
    var svg = '<svg class="lamina-svg" viewBox="0 0 ' + LW + ' ' + LH + '" preserveAspectRatio="xMidYMax meet" aria-hidden="true">' + pared +
      '<rect y="' + (LBASE - 4) + '" width="' + LW + '" height="' + (LH - LBASE + 4) + '" fill="' + C.piso + '"/>' +
      O.dibujar('planta', 34, LBASE + 8, 0.7, 'deco') + O.dibujar('planta', 690, LBASE + 8, 0.56, 'deco') +
      b.items.map(function (it, i) { return O.dibujar(it.obj, xs[i], LBASE, s, 'entra e' + i); }).join('') + '</svg>';
    return '<div class="lamina">' + svg + b.items.map(function (it, i) {
      return '<button type="button" class="punto' + refc(it.label) + '" data-id="' + k + '-' + i + '" data-i="' + i + '" data-x="' + xs[i] + '" data-y="' + Math.round(LBASE - 120 * s) + '">' +
        '<span class="punto-n">' + (i + 1) + '</span><span class="punto-rotulo">' + rot(it.label) + '</span>' + mano + '<span class="punto-visto">' + visto + '</span></button>';
    }).join('') + '</div>';
  };
  function posicionarPuntos() {
    raiz.querySelectorAll('.lamina').forEach(function (lam) {
      var svg = lam.querySelector('.lamina-svg'), ctm = svg.getScreenCTM(), r = lam.getBoundingClientRect();
      if (!ctm) return;
      lam.querySelectorAll('.punto').forEach(function (p) {
        var pt = svg.createSVGPoint(); pt.x = Number(p.dataset.x); pt.y = Number(p.dataset.y) - 4;
        var q = pt.matrixTransform(ctm);
        p.style.left = Math.max(p.offsetWidth / 2 + 4, Math.min(r.width - p.offsetWidth / 2 - 4, q.x - r.left)) + 'px';
        p.style.top = Math.max(p.offsetHeight + 4, q.y - r.top) + 'px';
      });
    });
  }
  window.addEventListener('resize', posicionarPuntos);
  B.lamina.activar = function (b, k, el) {
    posicionarPuntos(); requestAnimationFrame(posicionarPuntos);
    if (document.fonts) document.fonts.ready.then(posicionarPuntos);
    var objs = el.querySelectorAll('.objeto:not(.deco)');
    el.querySelectorAll('.punto').forEach(function (p) {
      p.addEventListener('click', function () {
        var i = Number(p.dataset.i), it = b.items[i];
        objs.forEach(function (o, j) { o.classList.toggle('activo', j === i); });
        leer(it.label, segs(it.segs), it.obj, p); marcar(p.dataset.id);
      });
    });
  };

  /* Comienzo literal del texto (sin notas ni marcas) para que la cara de la tarjeta no quede vacía; el texto completo se lee al girarla. */
  function extracto(s, lim) {
    var t = String(s).replace(/\s*\n\s*/g, ' ').replace(/\[\^\d+\]/g, '').replace(/^• /, '').replace(/\*\*/g, '');
    return t.length > lim + 5 ? t.slice(0, lim).replace(/\s+\S*$/, '') + '…' : t;
  }
  B.giro = function (b, k) {
    return tituloBloque(b, k) +
      '<div class="giros n' + b.items.length + (b.compacto ? ' compacto' : '') + '">' + b.items.map(function (it, i) {
        return '<button type="button" class="giro' + refc(it.label) + '" data-id="' + k + '-' + i + '" data-i="' + i + '" style="--d:' + (i * 0.08) + 's"><span class="giro-int">' +
          '<span class="cara frente"><span class="giro-n">' + (i + 1) + '</span><span class="giro-arte">' + svgObjeto(it.obj, b.compacto ? 44 : 96) + '</span>' +
          '<span class="giro-rotulo">' + rot(it.label) + '</span>' + (b.compacto ? '' : '<span class="giro-extracto">' + esc(may(extracto(segs(it.segs), 150))) + '</span>') +
          '<span class="giro-toca">' + mano + ' Toca para girar</span></span>' +
          '<span class="cara dorso"><span class="giro-rotulo">' + rot(it.label) + '</span><span class="giro-leido">' + visto + ' Leído · toca para releer</span></span>' +
          '</span></button>';
      }).join('') + '</div>';
  };
  B.giro.activar = function (b, k, el) {
    el.querySelectorAll('.giro').forEach(function (g) {
      g.addEventListener('click', function () {
        var it = b.items[Number(g.dataset.i)];
        g.classList.add('girada');
        leer(it.label, segs(it.segs), it.obj, g); marcar(g.dataset.id);
      });
    });
  };

  B.fichas = function (b, k) {
    return '<div class="fichas" role="tablist">' + b.items.map(function (it, i) {
      return '<button type="button" role="tab" class="ficha' + refc(it.label) + '" data-id="' + k + '-' + i + '" data-i="' + i + '" aria-selected="false" style="--d:' + (i * 0.07) + 's"><span class="ficha-n">' + (i + 1) + '</span>' + rot(it.label) + '<span class="ficha-visto">' + visto + '</span></button>';
    }).join('') + '</div><div class="panel-fichas' + (conFigura(escena) ? ' con-figura' : '') + '" role="tabpanel" tabindex="-1">' +
      (conFigura(escena) && IMAGEN[actual] ? figura([]) : '<span class="panel-arte"></span>') +
      '<div class="panel-texto"><p class="panel-vacio">' + mano + ' Elige una ficha para leer su contenido.</p></div></div>';
  };
  B.fichas.activar = function (b, k, el) {
    var panel = el.querySelector('.panel-fichas');
    el.querySelectorAll('.ficha').forEach(function (f) {
      f.addEventListener('click', function () {
        var i = Number(f.dataset.i), it = b.items[i];
        el.querySelectorAll('.ficha').forEach(function (o) { o.setAttribute('aria-selected', String(o === f)); });
        var arte = panel.querySelector('.panel-arte'), grande = panel.classList.contains('con-figura');
        if (arte) arte.innerHTML = svgObjeto(it.obj, grande ? 150 : 92);
        panel.querySelector('.panel-texto').innerHTML = '<p class="lectura-eyebrow">' + (i + 1) + ' de ' + b.items.length + ' · ' + esc(may(it.label)) + '</p><p class="lectura-texto">' + rico(segs(it.segs)) + '</p>';
        marcar(f.dataset.id);
        if (grande) encajarTexto(panel, panel.querySelector('.panel-texto'));
        reanimar(panel);
      });
    });
    el.querySelector('.ficha').click();
  };

  function pasos(b, k, clase) {
    return '<div class="' + clase + ' p' + b.items.length + '"><span class="camino" aria-hidden="true"><b></b><i class="ficha-avance"></i></span>' + b.items.map(function (it, i) {
      return '<button type="button" class="paso' + refc(it.label) + '" data-id="' + k + '-' + i + '" data-i="' + i + '" style="--d:' + (i * 0.09) + 's"' + (clase === 'linea' && i > 0 ? ' disabled' : '') + '>' +
        '<span class="paso-arte">' + svgObjeto(it.obj, 56) + '</span><span class="paso-n">' + (i + 1) + '</span>' +
        '<span class="paso-rotulo">' + rot(it.label) + '</span><span class="paso-visto">' + visto + '</span></button>';
    }).join('') + '</div>';
  }
  B.ruta = function (b, k) {
    return '<div class="ruta-lectura" tabindex="-1" aria-live="polite"><p class="panel-vacio">' + mano + ' Empieza por el paso 1.</p></div>' + pasos(b, k, 'ruta') +
      '<div class="ruta-pie"><button type="button" class="btn-siguiente">Siguiente paso <i class="fas fa-arrow-right" aria-hidden="true"></i></button></div>';
  };
  B.ruta.activar = function (b, k, el, linea) {
    var caja = el.querySelector('.ruta-lectura'), n = b.items.length, ficha = el.querySelector('.ficha-avance'), traza = el.querySelector('.camino b'), sig = el.querySelector('.btn-siguiente'), pos = -1;
    function ir(i) {
      pos = i;
      el.querySelectorAll('.paso').forEach(function (o, j) { o.setAttribute('aria-current', String(j === i)); o.classList.toggle('pasado', j < i); if (linea && j === i + 1) o.disabled = false; });
      var pct = n === 1 ? 50 : 100 * i / (n - 1);
      ficha.style.left = pct + '%'; traza.style.width = pct + '%';
      var it = b.items[i];
      caja.innerHTML = '<div class="ruta-texto"><p class="lectura-eyebrow">' + (linea ? 'Momento ' : 'Paso ') + (i + 1) + ' de ' + n + ' · ' + esc(may(it.label)) + '</p><p class="lectura-texto">' + rico(segs(it.segs)) + '</p></div>' +
        '<span class="ruta-arte">' + svgObjeto(it.obj, 150) + '</span>';
      crecerLectura(caja);
      reanimar(caja);
      sig.disabled = i >= n - 1;
      marcar(k + '-' + i);
    }
    el.querySelectorAll('.paso').forEach(function (p) { p.addEventListener('click', function () { ir(Number(p.dataset.i)); }); });
    sig.addEventListener('click', function () { ir(Math.min(n - 1, pos + 1)); });
    ir(0); /* el primer paso abre solo: la escena nunca empieza en blanco */
  };
  B.linea = function (b, k) {
    return pasos(b, k, 'linea') + '<div class="ruta-lectura historia" tabindex="-1" aria-live="polite"><p class="panel-vacio">' + mano + ' Toca el primer momento del caso.</p></div>' +
      '<div class="ruta-pie"><button type="button" class="btn-siguiente">Continuar la historia <i class="fas fa-arrow-right" aria-hidden="true"></i></button></div>';
  };
  B.linea.activar = function (b, k, el) { B.ruta.activar(b, k, el, true); };

  B.balanza = function (b, k) {
    var C = O.C;
    var escala = '<svg class="balanza-svg" viewBox="0 0 360 230" aria-hidden="true"><ellipse cx="180" cy="222" rx="90" ry="6" fill="' + C.gris + '"/>' +
      '<rect x="172" y="40" width="16" height="170" rx="5" fill="' + C.marino + '"/><path d="M120 222 Q180 186 240 222 Z" fill="' + C.marino + '"/>' +
      '<g class="viga" style="transform:rotate(-14deg)"><rect x="40" y="42" width="280" height="10" rx="5" fill="' + C.teal + '"/>' +
      '<path d="M62 52 L38 120 M62 52 L86 120 M298 52 L274 120 M298 52 L322 120" stroke="' + C.marino + '" stroke-width="2.5"/>' +
      '<path d="M28 120 H96 Q92 146 62 146 Q32 146 28 120 Z" fill="' + C.oxido + '"/><path d="M264 120 H332 Q328 146 298 146 Q268 146 264 120 Z" fill="' + C.oxido + '"/>' +
      '<rect x="40" y="100" width="44" height="22" rx="4" fill="' + C.marino + '"/><text x="62" y="115" text-anchor="middle" font-family="Montserrat,Arial" font-weight="800" font-size="9" fill="#fff">Reserva</text>' +
      '<g class="platillo"></g></g><circle cx="180" cy="44" r="13" fill="' + C.crema + '" stroke="' + C.marino + '" stroke-width="4"/></svg>';
    return '<div class="balanza-zona"><div class="pesas">' + tituloBloque(b, k) +
      b.items.map(function (it, i) {
        return '<button type="button" class="pesa" data-id="' + k + '-' + i + '" data-i="' + i + '" style="--d:' + (i * 0.08) + 's"><span class="pesa-n">' + (i + 1) + '</span>' + esc(may(it.label)) + mano + '<span class="pesa-visto">' + visto + '</span></button>';
      }).join('') + '</div><div class="balanza-centro">' + escala + '<ol class="criterios" aria-live="polite"></ol></div></div>';
  };
  /* Juan (26/10/2026): sin balanza como icono. El bloque «balanza» (U1) se presenta como fichas: los mismos criterios y su
     texto íntegro, con el encabezado del bloque, sin la escala. */
  B.criterios = function (b, k) { return tituloBloque(b, k) + B.fichas(b, k); };
  B.criterios.activar = function (b, k, el) { B.fichas.activar(b, k, el); };
  function tipo(b) { return b.tipo === 'balanza' ? 'criterios' : b.tipo; }
  B.balanza.activar = function (b, k, el) {
    var viga = el.querySelector('.viga'), plat = el.querySelector('.platillo'), lista = el.querySelector('.criterios'), puestos = 0, n = b.items.length;
    el.querySelectorAll('.pesa').forEach(function (p) {
      p.addEventListener('click', function () {
        if (p.classList.contains('puesta')) return;
        var it = b.items[Number(p.dataset.i)];
        p.classList.add('puesta'); puestos++;
        viga.style.transform = 'rotate(' + (-14 + 14 * puestos / n) + 'deg)';
        plat.insertAdjacentHTML('beforeend', '<rect class="pesa-svg" x="' + (270 + (puestos - 1) % 2 * 30) + '" y="' + (100 - Math.floor((puestos - 1) / 2) * 16) + '" width="26" height="16" rx="4" fill="' + O.C.marino + '"/>');
        lista.insertAdjacentHTML('beforeend', '<li class="aparece">' + rico(segs(it.segs)) + '</li>');
        marcar(p.dataset.id);
        if (puestos === n) el.querySelector('.balanza-centro').classList.add('equilibrio');
      });
    });
  };

  B.empareja = function (b, k) {
    var orden = b.items.map(function (_, i) { return i; });
    for (var i = orden.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = orden[i]; orden[i] = orden[j]; orden[j] = t; }
    if (orden.every(function (v, i) { return v === i; }) && orden.length > 1) orden.push(orden.shift());
    /* Con espacio (un solo bloque y hasta tres descripciones) el texto completo aparece dentro de la tarjeta. */
    var amplio = escena.bloques.length === 1 && b.items.length <= 3, fig = amplio && conFigura(escena);
    b.amplio = amplio;
    return tituloBloque(b, k) +
      '<div class="empareja' + (amplio ? ' amplio' : '') + (fig ? ' con-figura' : '') + '"><div class="nombres" role="group" aria-label="Nombres para arrastrar">' +
      '<p class="nombres-guia"><i class="fas fa-hand-pointer" aria-hidden="true"></i> Arrastra o toca</p>' + orden.map(function (i) {
        return '<button type="button" class="nombre" data-i="' + i + '" aria-pressed="false"><span class="agarre" aria-hidden="true">⋮⋮</span>' + esc(may(b.items[i].label)) + '</button>';
      }).join('') + '</div><div class="defs n' + b.items.length + '">' + b.items.map(function (it, i) {
        var t = segs(it.segs).replace(/\n/g, ' ').replace(/\[\^\d+\]/g, ''), lim = amplio ? 230 : 100, corto = t.length > lim + 5 ? t.slice(0, lim).replace(/\s+\S*$/, '') + '…' : t;
        return '<button type="button" class="def" data-id="' + k + '-' + i + '" data-i="' + i + '" style="--d:' + (i * 0.08) + 's"><span class="def-arte">' + svgObjeto(it.obj, amplio ? 64 : 36) + '</span>' +
          '<span class="def-texto">' + esc(corto) + '</span><span class="def-ranura">' + mano + ' Suelta aquí el nombre</span></button>';
      }).join('') + '</div>' + (fig ? figura(b.items.map(function (x) { return x.obj; })) : '') + '</div><p class="empareja-aviso" aria-live="polite"></p>';
  };
  B.empareja.activar = function (b, k, el) {
    var elegido = null, aviso = el.querySelector('.empareja-aviso');
    function encabezado(it) { return typeof it.nombre === 'number' ? may(seg(it.nombre)) + ' ' : ''; }
    function elegir(n) {
      el.querySelectorAll('.nombre').forEach(function (o) { o.setAttribute('aria-pressed', String(o === n)); });
      elegido = n; aviso.textContent = 'Ahora suelta o toca «' + n.textContent.replace('⋮⋮', '') + '» sobre su descripción.';
    }
    function intentar(n, d) {
      var i = Number(d.dataset.i), it = b.items[i];
      if (Number(n.dataset.i) === i) {
        d.classList.add('acierto'); n.disabled = true; n.classList.add('usado'); n.setAttribute('aria-pressed', 'false');
        d.querySelector('.def-ranura').innerHTML = visto + ' ' + esc(may(it.label));
        elegido = null;
        if (b.amplio) {
          d.querySelector('.def-texto').innerHTML = '<b>' + esc(encabezado(it)) + '</b>' + rico(segs(it.segs));
          /* Esteban (27/10/2026): la tarjeta que se expande lleva debajo del texto una imagen acorde, de fondo suave, en el
             espacio que sobra (si el texto es largo, se achica o desaparece). La imagen de contexto de la escena, o el objeto
             del elemento en grande si la escena ya muestra su imagen al lado o no tiene tema. */
          if (!d.querySelector('.def-ilus')) {
            var tm = conFigura(escena) ? null : (IMAGEN[actual] || tema(escena));
            d.querySelector('.def-ranura').insertAdjacentHTML('beforebegin', '<span class="def-ilus" aria-hidden="true">' +
              (tm ? '<img src="' + srcImagen(tm) + '" alt="">' : svgObjeto(it.obj, 170)) + '</span>');
          }
          d.classList.add('completa'); enfocar(d); reanimar(d);
          aviso.textContent = '¡Correcto! La descripción completa quedó en la tarjeta.';
        } else {
          aviso.textContent = '¡Correcto! Lee la descripción completa.';
          leer('¡Correcto! · ' + may(it.label), encabezado(it) + segs(it.segs), it.obj, d);
        }
        marcar(d.dataset.id);
      } else {
        d.classList.remove('error'); void d.offsetWidth; d.classList.add('error');
        aviso.textContent = 'Esa descripción no corresponde a «' + n.textContent.replace('⋮⋮', '') + '». Intenta con otra.';
      }
    }
    el.querySelectorAll('.nombre').forEach(function (n) {
      n.addEventListener('click', function () { if (!n.disabled && !n.dataset.arrastrado) elegir(n); delete n.dataset.arrastrado; });
      /* Arrastrar y soltar con puntero (ratón o táctil); el toque sigue funcionando como alternativa. */
      n.addEventListener('pointerdown', function (e) {
        if (n.disabled) return;
        var x0 = e.clientX, y0 = e.clientY, fantasma = null, sobre = null;
        function mover(ev) {
          if (!fantasma && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 6) return;
          if (!fantasma) {
            fantasma = n.cloneNode(true); fantasma.className = 'nombre fantasma'; document.body.appendChild(fantasma);
            n.classList.add('arrastrando'); elegir(n);
          }
          fantasma.style.left = ev.clientX + 'px'; fantasma.style.top = ev.clientY + 'px';
          fantasma.hidden = true; var bajo = document.elementFromPoint(ev.clientX, ev.clientY); fantasma.hidden = false;
          var d = bajo && bajo.closest('.def:not(.acierto)');
          if (sobre && sobre !== d) sobre.classList.remove('sobre');
          sobre = d; if (d) d.classList.add('sobre');
        }
        function soltar() {
          n.removeEventListener('pointermove', mover); n.removeEventListener('pointerup', soltar); n.removeEventListener('pointercancel', soltar);
          if (!fantasma) return;
          fantasma.remove(); n.classList.remove('arrastrando'); n.dataset.arrastrado = '1';
          if (sobre) { sobre.classList.remove('sobre'); intentar(n, sobre); }
        }
        try { n.setPointerCapture(e.pointerId); } catch (er) { /* sin captura */ }
        n.addEventListener('pointermove', mover); n.addEventListener('pointerup', soltar); n.addEventListener('pointercancel', soltar);
      });
    });
    /* La tarjeta en foco se ensancha para leer su texto completo; las demás se compactan. */
    function enfocar(d) {
      var defs = el.querySelector('.defs'), n = b.items.length, i = Number(d.dataset.i);
      el.querySelectorAll('.def').forEach(function (o) { o.classList.toggle('foco', o === d); });
      defs.style.gridTemplateColumns = b.items.map(function (_, j) { return j === i ? (n === 2 ? '1.7fr' : '2.7fr') : '1fr'; }).join(' ');
      setTimeout(recortes, 520); /* tras la transición de las columnas */
    }
    /* Una tarjeta angosta cuyo texto no cabe lo desvanece al pie en vez de cortarlo bajo el borde; se lee completo al enfocarla. */
    function recortes() { el.querySelectorAll('.def-texto').forEach(function (t) { t.classList.toggle('recortado', t.scrollHeight > t.clientHeight + 1); }); }
    if (b.amplio) { setTimeout(recortes, 120); window.addEventListener('resize', recortes); }
    el.querySelectorAll('.def').forEach(function (d) {
      d.addEventListener('click', function () {
        var it = b.items[Number(d.dataset.i)];
        if (d.classList.contains('acierto')) { if (b.amplio) enfocar(d); else leer(it.label, encabezado(it) + segs(it.segs), it.obj, d); return; }
        if (!elegido) { aviso.textContent = 'Primero toma un nombre de la lista y arrástralo hasta aquí.'; reanimar(aviso); return; }
        intentar(elegido, d);
      });
    });
  };

  /* Tabla de la fuente: una pestaña por columna o por grupo de filas; el panel muestra sus celdas con su encabezado. */
  B.tabla = function (b, k) {
    return tituloBloque(b, k) + '<div class="fichas tabla-pestanas" role="tablist">' + b.items.map(function (it, i) {
      return '<button type="button" role="tab" class="ficha' + refc(it.label) + '" data-id="' + k + '-' + i + '" data-i="' + i + '" aria-selected="false" style="--d:' + (i * 0.07) + 's"><span class="ficha-n">' + (i + 1) + '</span>' + rot(it.label) + '<span class="ficha-visto">' + visto + '</span></button>';
    }).join('') + '</div><div class="panel-fichas panel-tabla" role="tabpanel" tabindex="-1"><div class="panel-texto"></div></div>';
  };
  B.tabla.activar = function (b, k, el) {
    var panel = el.querySelector('.panel-fichas');
    function celda(c) { return c === null || c === undefined ? '' : typeof c === 'number' ? seg(c) : c; }
    el.querySelectorAll('.ficha').forEach(function (f) {
      f.addEventListener('click', function () {
        var i = Number(f.dataset.i), it = b.items[i];
        el.querySelectorAll('.ficha').forEach(function (o) { o.setAttribute('aria-selected', String(o === f)); });
        var lista = '<ul class="tabla-filas' + (it.filas.every(function (f) { return f.length === 1 && f[0][0] === null; }) && it.filas.length > 5 ? ' compacta' : '') + '">' + it.filas.map(function (fila) {
          return '<li>' + fila.map(function (par) {
            var enc = celda(par[0]), val = celda(par[1]);
            return '<span class="tabla-celda">' + (enc ? '<b class="tabla-enc">' + esc(enc) + '</b>' : '') + '<span class="lectura-texto">' + rico(val || '–') + '</span></span>';
          }).join('') + '</li>';
        }).join('') + '</ul>';
        /* Tabla comparativa con una fila por pestaña (Bienes 1.3): sus celdas en grande junto al objeto, sin franja vacía. */
        var ficha = it.filas.length === 1 && it.obj;
        if (ficha) lista = '<div class="tabla-ficha"><figure aria-hidden="true">' + svgObjeto(it.obj, 170) + '</figure>' + lista + '</div>';
        var texto = panel.querySelector('.panel-texto');
        texto.classList.toggle('con-ficha', !!ficha);
        texto.innerHTML = '<p class="lectura-eyebrow">' + (i + 1) + ' de ' + b.items.length + ' · ' + esc(may(it.label)) + '</p>' + lista;
        reanimar(panel); marcar(f.dataset.id);
      });
    });
    el.querySelector('.ficha').click();
  };

  /* ---------- Caso de estudio (patrón de Juan, caso1.html; Esteban, 27/10/2026) ----------
     «Aplicación al expediente del curso» como un expediente en páginas: El caso → Su tarea → Su respuesta, con puntos de
     posición y Anterior/Siguiente. Todo el texto de la fuente aparece en su orden: la situación, las preguntas y consignas,
     la pista, la instrucción de respuesta y la nota. Admite los roles fijos de U1 y los párrafos de U2–U4. */
  var ENCABEZADO = /^(Aplicación al expediente del curso)\s*/;
  var TAREA = /¿|\b(analice|determine|clasifique|explique|identifique|examine|deberá encontrar|establezca|indique|describa)\b/i;
  function oraciones(t) { return String(t).split(/(?<=[.?!])\s+(?=[¿¡A-ZÁÉÍÓÚÑ])/).filter(function (x) { return x.trim(); }); }
  function modeloCaso(b) {
    var r = b.roles, m = { encabezado: 'Aplicación al expediente del curso', situacion: [], tareas: [], pista: [], instruccion: [], nota: [] };
    function clasificar(t, porRol) {
      if (/^Responda\b/.test(t)) m.instruccion.push(t);
      else if (/^Adicionalmente\b/.test(t)) m.nota.push(t);
      else if (/^Para ello\b/.test(t)) m.pista.push(t);
      else if (porRol === 'tarea' || TAREA.test(t)) m.tareas.push(t);
      else m.situacion.push(t);
    }
    var titulo = typeof r.titulo === 'number' ? seg(r.titulo) : (r.titulo || ''), resto = titulo.replace(ENCABEZADO, '');
    if (ENCABEZADO.test(titulo)) m.encabezado = ENCABEZADO.exec(titulo)[1];
    if (r.parrafos) {
      if (resto) clasificar(resto);
      r.parrafos.forEach(function (i) { oraciones(seg(i)).forEach(function (o) { clasificar(o); }); });
    } else {
      if (resto) m.situacion.push(resto);
      if (r.hecho !== undefined) m.situacion.push(seg(r.hecho));
      if (r.pregunta !== undefined) m.tareas.push(seg(r.pregunta));
      if (r.pista !== undefined) m.tareas.push(seg(r.pista));
      if (r.instruccion !== undefined) m.instruccion.push(seg(r.instruccion));
      if (r.nota !== undefined) m.nota.push(seg(r.nota));
    }
    /* Una situación que no cierra la frase («En la indagación acerca del caso de …,») se lee junto a la primera tarea. */
    var sit = m.situacion.join(' ');
    if (sit && /[,:;]$/.test(sit.trim()) && m.tareas.length) { m.tareas[0] = sit + ' ' + m.tareas[0]; m.situacion = []; }
    var nombre = /caso de ((?:[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s?){2,4})/.exec(m.situacion.concat(m.tareas).join(' '));
    m.nombre = nombre ? 'Caso de ' + nombre[1].trim() : 'Expediente del curso';
    m.situacion = m.situacion.reduce(function (a, x) { if (a.length && /,$/.test(a[a.length - 1].trim())) a[a.length - 1] += ' ' + x; else a.push(x); return a; }, []);
    /* Caso y tarea breves comparten página («El caso y su tarea»); si no, cada uno tiene la suya. */
    m.junto = m.situacion.length > 0 && (m.situacion.join(' ') + m.tareas.join(' ') + m.pista.join(' ')).length <= 460;
    m.paginas = m.junto ? ['caso', 'respuesta'] : (m.situacion.length ? ['caso'] : []).concat(['tarea', 'respuesta']);
    return m;
  }
  function totalCaso(b) { var m = modeloCaso(b); return m.paginas.length + m.tareas.length; }
  B.caso = function (b, k) {
    /* La imagen del caso sale del texto del propio caso; si no hay tema, del de la escena y la lección. */
    var m = modeloCaso(b), tm = temaDeTexto(m.situacion.concat(m.tareas).join(' ')) || tema(escena) || (datos.ilustraciones ? null : 'fundamento');
    var arte = tm ? '<figure class="ctx-arte foto caso-figura" aria-hidden="true"><img src="' + srcImagen(tm) + '" alt=""></figure>'
      : '<figure class="caso-figura caso-objeto" aria-hidden="true">' + svgObjeto(b.obj || 'expediente', 170) + '</figure>';
    var ficha = '<p class="caso-eyebrow"><i class="fas fa-folder-open" aria-hidden="true"></i> ' + esc(m.encabezado) + '</p><p class="caso-nombre">' + esc(m.nombre) + '</p>';
    var nombres = { caso: m.junto ? 'El caso y su tarea' : 'El caso', tarea: 'Su tarea', respuesta: 'Su respuesta' };
    /* Cada pregunta o consigna es una tarjeta que se marca como revisada; la pista de la fuente va resaltada debajo. */
    function tareasHtml() {
      return m.tareas.map(function (t, i) {
        return '<button type="button" class="caso-tarea" data-id="' + k + '-t' + i + '" aria-pressed="false"><span class="caso-n">' + (i + 1) + '</span><span class="lectura-texto">' + rico(t) + '</span>' +
          '<span class="caso-marca">' + mano + ' Lo tendré en cuenta</span><span class="caso-visto">' + visto + ' Revisado</span></button>';
      }).join('') + m.pista.map(function (t) { return '<p class="caso-pista"><i class="fas fa-lightbulb" aria-hidden="true"></i><span class="lectura-texto">' + rico(t) + '</span></p>'; }).join('');
    }
    var pag = {
      caso: '<div class="caso-hoja">' + ficha + '<div class="caso-situacion caso-encaja">' + m.situacion.map(function (t) { return '<p class="lectura-texto">' + rico(t) + '</p>'; }).join('') +
        (m.junto ? tareasHtml() : '') + '</div></div>' + arte,
      tarea: '<div class="caso-hoja">' + ficha + '<div class="caso-tareas caso-encaja">' + tareasHtml() + '</div></div>' +
        (m.situacion.length ? '<figure class="caso-figura caso-objeto" aria-hidden="true">' + svgObjeto(b.obj && b.obj !== 'expediente' ? b.obj : 'documento', 170) + '</figure>' : arte),
      respuesta: '<div class="caso-escribir">' + m.instruccion.map(function (t) { return '<p class="caso-instruccion">' + rico(t) + '</p>'; }).join('') +
        '<label class="caso-respuesta"><span class="sr-only">Su respuesta</span><textarea placeholder="Escriba aquí su respuesta…"></textarea></label>' +
        '<div class="caso-pie"><span class="caso-cuenta"><output>0</output> / 500 palabras</span><span class="caso-barra"><i></i></span>' +
        '<button type="button" class="caso-copiar"><i class="fas fa-copy" aria-hidden="true"></i> Copiar respuesta</button></div></div>' +
        '<aside class="caso-recuerde"><p class="caso-eyebrow"><i class="fas fa-list-check" aria-hidden="true"></i> Su tarea</p><ol>' +
        m.tareas.map(function (t) { return '<li>' + rico(t) + '</li>'; }).join('') + '</ol>' +
        m.nota.map(function (t) { return '<p class="caja-clave">' + rico(t) + '</p>'; }).join('') + '</aside>'
    };
    return '<div class="caso2" data-paginas="' + m.paginas.length + '">' + m.paginas.map(function (p, i) {
      return '<section class="caso-pagina pag-' + p + (i ? '' : ' activa') + '" data-p="' + i + '" aria-label="' + nombres[p] + '"' + (i ? ' hidden' : '') + '>' + pag[p] + '</section>';
    }).join('') +
      '<nav class="caso-nav" aria-label="Páginas del caso"><button type="button" class="caso-ant"><i class="fas fa-arrow-left" aria-hidden="true"></i> Anterior</button>' +
      '<span class="caso-puntos">' + m.paginas.map(function (p, i) { return '<button type="button" class="caso-punto" data-ir="' + i + '" aria-label="' + nombres[p] + '"><span>' + nombres[p] + '</span></button>'; }).join('') + '</span>' +
      '<button type="button" class="caso-sig">Siguiente <i class="fas fa-arrow-right" aria-hidden="true"></i></button></nav></div>';
  };
  B.caso.activar = function (b, k, el) {
    var paginas = el.querySelectorAll('.caso-pagina'), puntos = el.querySelectorAll('.caso-punto'), ant = el.querySelector('.caso-ant'), sig = el.querySelector('.caso-sig'), pos = 0;
    function ir(i) {
      pos = i;
      paginas.forEach(function (p, j) { p.hidden = j !== i; p.classList.toggle('activa', j === i); });
      puntos.forEach(function (p, j) { p.setAttribute('aria-current', j === i ? 'step' : 'false'); p.classList.toggle('pasado', j < i); });
      ant.disabled = i === 0; sig.disabled = i === paginas.length - 1;
      var pg = paginas[i]; reanimar(pg); marcar(k + '-p' + i);
      pg.querySelectorAll('.caso-encaja').forEach(function (c) { encajarTexto(pg, c); });
    }
    puntos.forEach(function (p) { p.addEventListener('click', function () { ir(Number(p.dataset.ir)); }); });
    ant.addEventListener('click', function () { ir(Math.max(0, pos - 1)); });
    sig.addEventListener('click', function () { ir(Math.min(paginas.length - 1, pos + 1)); });
    el.querySelectorAll('.caso-tarea').forEach(function (t) {
      t.addEventListener('click', function () { t.setAttribute('aria-pressed', 'true'); t.classList.add('visto'); marcar(t.dataset.id); });
    });
    var t = el.querySelector('textarea'), out = el.querySelector('.caso-cuenta output'), barra = el.querySelector('.caso-barra i'), clave = 'ap-respuesta-' + (datos.unit || 1) + '-' + datos.lesson + '-' + actual;
    try { t.value = localStorage.getItem(clave) || ''; } catch (e) { /* sin almacenamiento */ }
    function contar() {
      var palabras = t.value.trim() ? t.value.trim().split(/\s+/) : [];
      if (palabras.length > 500) { t.value = palabras.slice(0, 500).join(' '); palabras.length = 500; }
      out.textContent = palabras.length; barra.style.width = (palabras.length / 5) + '%';
      try { localStorage.setItem(clave, t.value); } catch (e) { /* sin almacenamiento */ }
    }
    t.addEventListener('input', contar); contar();
    var copiar = el.querySelector('.caso-copiar');
    copiar.addEventListener('click', function () {
      function listo() { copiar.innerHTML = visto + ' Respuesta copiada'; setTimeout(function () { copiar.innerHTML = '<i class="fas fa-copy" aria-hidden="true"></i> Copiar respuesta'; }, 1800); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t.value).then(listo, function () { t.select(); try { document.execCommand('copy'); listo(); } catch (e) { /* sin portapapeles */ } });
      else { t.select(); try { document.execCommand('copy'); listo(); } catch (e) { /* sin portapapeles */ } }
    });
    ir(0);
    /* Las tipografías llegan después: se vuelve a encajar el texto de la página visible. */
    function reencajar() { var pg = paginas[pos]; pg.querySelectorAll('.caso-encaja').forEach(function (c) { encajarTexto(pg, c); }); }
    if (document.fonts) document.fonts.ready.then(reencajar);
    window.addEventListener('resize', reencajar);
  };

  /* Escena escasa: los puntos (si hay más de uno) arriba, su texto completo a la vista y la imagen de contexto al lado.
     Reúne la ficha de entrada, el encabezado largo del bloque y los elementos, en el mismo orden y con las mismas marcas de visto. */
  function contexto(k) {
    var b = escena.bloques[k], lista = [], cabeza = '';
    if (escena.lead.length) {
      var primero = seg(escena.lead[0]);
      lista.push({ id: 'lead', label: escena.rotulo || (primero.length <= 70 ? primero : primerasPalabras(primero)), texto: segs(escena.lead), obj: (b.items[0] && b.items[0].obj) || 'documento' });
    }
    if (b.titulo && b.titulo.length) {
      var t = segs(b.titulo);
      if (t.length > 110) lista.push({ id: 'bt' + k, label: b.rotulo || primerasPalabras(t), texto: t, obj: 'documento' }); else cabeza = t;
    }
    var orden = b.tipo === 'mapa' ? b.items.filter(function (x) { return x.centro; }).concat(b.items.filter(function (x) { return !x.centro; })) : b.items;
    orden.forEach(function (it, i) { lista.push({ id: k + '-' + i, label: it.label, texto: segs(it.segs), obj: it.obj, acomp: it.acomp }); });
    var n = lista.length;
    var html = '<div class="contexto n' + n + '">' + (cabeza ? '<p class="bloque-titulo">' + esc(may(cabeza)) + '</p>' : '') +
      (n > 1 ? '<div class="ctx-puntos" role="tablist">' + lista.map(function (it, i) {
        return '<button type="button" role="tab" class="ctx-punto' + refc(it.label) + '" data-id="' + it.id + '" data-i="' + i + '" aria-selected="false" style="--d:' + (i * 0.07) + 's">' +
          '<span class="ctx-n">' + (i + 1) + '</span><span class="ctx-ico">' + svgObjeto(it.obj, 28) + '</span><span class="ctx-rotulo">' + rot(it.label) + '</span><span class="ctx-visto">' + visto + '</span></button>';
      }).join('') + '</div>' : '') +
      '<article class="ctx-texto" tabindex="-1" aria-live="polite"></article>' + figura(lista.map(function (x) { return x.obj; }), n === 1 ? lista[0].acomp : null) + '</div>';
    return { html: html, lista: lista };
  }
  function activarContexto(el, lista) {
    var caja = el.querySelector('.ctx-texto'), cont = el.querySelector('.contexto'), botones = el.querySelectorAll('.ctx-punto'), pos = 0;
    function abrir(i) {
      var it = lista[i]; pos = i;
      botones.forEach(function (o, j) { o.setAttribute('aria-selected', String(j === i)); });
      caja.innerHTML = '<span class="ctx-icono">' + svgObjeto(it.obj, 84) + '</span><p class="lectura-eyebrow">' + (lista.length > 1 ? (i + 1) + ' de ' + lista.length + ' · ' : '') + rot(it.label) + '</p><p class="lectura-texto">' + rico(it.texto) + '</p>';
      marcar(it.id); encajarTexto(cont, caja); reanimar(caja); /* marcar primero: «Exploración completa» cambia la altura */
    }
    botones.forEach(function (o) { o.addEventListener('click', function () { abrir(Number(o.dataset.i)); }); });
    abrir(0); /* la escena nunca empieza en blanco */
    if (document.fonts) document.fonts.ready.then(function () { encajarTexto(cont, caja); });
    window.addEventListener('resize', function () { encajarTexto(cont, caja); });
    var img = el.querySelector('.ctx-arte img');
    if (img && !img.complete) img.addEventListener('load', function () { encajarTexto(cont, caja); });
  }

  /* ---------- Escena ---------- */
  function render() {
    escena = datos.scenes[actual]; vistos = {}; retornoFoco = null;
    total = escena.bloques.reduce(function (a, b) { return a + (b.tipo === 'caso' ? totalCaso(b) : b.items.length) + (b.titulo && b.titulo.length && segs(b.titulo).length > 110 ? 1 : 0); }, 0) + (escena.lead.length ? 1 : 0);
    var ctx = escasa(escena) ? contexto(0) : null;
    var guia = ctx ? (ctx.lista.length > 1 ? 'Elige cada punto y lee su contenido junto a la ilustración.' : 'Lee el contenido junto a la ilustración.') : guias[escena.layout === 'balanza' ? 'fichas' : escena.layout];
    /* Sin nada que explorar (un solo texto a la vista o un caso) no hay barra de avance y la idea clave se ve desde el inicio. */
    var conAvance = total > 0 && !(ctx && ctx.lista.length === 1);
    var cab = '<header class="guia"><p class="guia-texto">' + mano + '<span>' + guia + '</span></p>' +
      (conAvance ? '<div class="avance" role="status"><span class="avance-rotulo">Exploración</span><span class="barra"><i></i></span><output>0 / ' + total + '</output></div>' : '') + '</header>';
    var cuerpo = '';
    if (escena.titulo.length) cuerpo += '<p class="escena-titulo">' + esc(may(segs(escena.titulo))) + '</p>';
    if (escena.lead.length && !ctx) {
      var primero = seg(escena.lead[0]), rotLead = escena.rotulo || (primero.length <= 70 ? primero : primerasPalabras(primero));
      var objLead = (escena.bloques[0].items && escena.bloques[0].items[0] && escena.bloques[0].items[0].obj) || 'documento';
      cuerpo += fichaIntro('lead', rotLead, segs(escena.lead), objLead);
    }
    cuerpo += ctx ? '<div class="bloque bloque-contexto" data-k="0">' + ctx.html + '</div>' :
      escena.bloques.map(function (b, k) { return '<div class="bloque bloque-' + tipo(b) + (b.compacto ? ' es-compacto' : '') + '" data-k="' + k + '">' + B[tipo(b)](b, k) + '</div>'; }).join('');
    if (escena.chips.length) cuerpo += '<ul class="chips' + (escena.layout === 'lamina' && !escena.tail.length ? '' : '') + '">' + escena.chips.map(function (c, i) {
      return '<li style="--d:' + (0.4 + i * 0.1) + 's"><i class="fas fa-circle-check" aria-hidden="true"></i>' + esc(may(c)) + '</li>';
    }).join('') + '</ul>';
    if (escena.tail.length) cuerpo += '<p class="caja-clave' + (conAvance ? ' tras-completar" hidden' : '"') + '><span class="clave-rotulo"><i class="fas fa-star" aria-hidden="true"></i> ' +
      (conAvance ? 'Idea clave desbloqueada' : 'Idea clave') + '</span>' + rico(segs(escena.tail)) + '</p>';
    raiz.className = 'ova layout-' + (ctx ? 'contexto' : escena.layout === 'balanza' ? 'fichas' : escena.layout) + (embebido ? ' embebido' : '');
    raiz.innerHTML = cab + '<section class="escenario" aria-label="Escena ' + (actual + 1) + '">' + cuerpo + '<div class="lector" hidden></div></section>' +
      (embebido ? '' : '<nav class="nav-local" aria-label="Escenas de la lección"><button type="button" data-ir="-1"><i class="fas fa-arrow-left" aria-hidden="true"></i> Anterior</button>' +
        '<span>' + (actual + 1) + ' de ' + datos.scenes.length + '</span><button type="button" data-ir="1">Siguiente <i class="fas fa-arrow-right" aria-hidden="true"></i></button></nav>');
    raiz.querySelectorAll('.bloque').forEach(function (el) {
      var k = Number(el.dataset.k), b = escena.bloques[k];
      if (ctx) activarContexto(el, ctx.lista); else B[tipo(b)].activar(b, k, el);
    });
    raiz.querySelectorAll('.intro').forEach(function (b) {
      b.addEventListener('click', function () { leer(b.dataset.rotulo, b.dataset.texto, b.dataset.obj, b); marcar(b.dataset.id); });
    });
    raiz.querySelector('.lector').addEventListener('click', function (e) { if (e.target.classList.contains('lector')) cerrarLector(); });
    if (!embebido) {
      var nav = raiz.querySelector('.nav-local');
      nav.querySelector('[data-ir="-1"]').disabled = actual === 0;
      nav.querySelector('[data-ir="1"]').disabled = actual === datos.scenes.length - 1;
      nav.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-ir]'); if (!b) return;
        actual = Math.max(0, Math.min(datos.scenes.length - 1, actual + Number(b.dataset.ir))); render();
      });
    }
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarLector(); });
  render();
})();
