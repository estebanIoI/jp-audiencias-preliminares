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
    giro: 'Pasa el cursor o toca cada tarjeta para girarla y leerla.',
    fichas: 'Elige cada ficha para leer su contenido.',
    ruta: 'Recorre la ruta paso a paso.',
    linea: 'Avanza por la historia del caso.',
    balanza: 'Coloca cada criterio en la balanza.',
    empareja: 'Elige un nombre y tócalo sobre su descripción.',
    caso: 'Resuelve el caso del expediente paso a paso.',
    tabla: 'Elige cada pestaña para recorrer la tabla.',
    rejilla: 'Abre cada ventana para ver su contenido.',
    acordeon: 'Despliega cada apartado para leerlo.',
    puntos: 'Toca los puntos sobre la ilustración.',
    mental: 'Explora cada rama del mapa mental.',
    esquema: 'Recorre el mapa conceptual.',
    compara: 'Toca cada columna para compararla.',
    eje: 'Toca cada categoría del eje y compara las dos columnas.',
    red: 'Abre cada institución de la red: al leerla se revela su papel en el sistema.',
    conexiones: 'Lee cada fragmento: cada uno revela una conexión del mapa.',
    condiciones: 'Lee los fragmentos y marca si cada requisito se cumple: la consecuencia cambia.',
    actividad: 'Elige una respuesta: si no es la correcta, lee la retroalimentación e inténtalo de nuevo.'
  };
  /* Juan (26–27/10/2026): mayúscula inicial en rótulos, títulos y en todo bloque de texto (párrafo, viñeta, celda, extracto);
     artículos, leyes, sentencias y la Corte se ven y titilan. Solo cambia la letra con que arranca el bloque: si empieza
     con un número no se toca, y la marca de una enumeración («(ii)», «a)», «b.», «1.») se conserva. Una dirección web
     («https://…», «www.…») tampoco: «Https://» no es la dirección de la ficha (SRPA, U2-L1-E06). */
  function may(s) {
    s = String(s);
    var p = /^[\s•«"“'(¿¡*\-–—]*(?:(?:[ivx]{1,5}|[a-j]|\d{1,2})[.)]\s+)?/.exec(s)[0];
    if (/^(?:https?:\/\/|www\.)/i.test(s.slice(p.length))) return s;
    return p + s.slice(p.length).replace(/^\p{Ll}/u, function (c) { return c.toUpperCase(); });
  }
  var REF = /(?:\b[Aa]rt(?:ículos?|\.)\s*\d+[A-Za-z]?(?:\s(?:del|de la)\s(?:CPP|CN|Constitución Política|Ley\s\d+(?:\sde\s\d{4})?))?|\bLey\s\d+(?:\s?(?:de\s|\/)\d{4})?|\b(?:Sentencias?\s)?(?:C|T|SU)-\d+(?:\/\d+|\sde\s\d{4})?|\b(?:STP|STC|AP|SP|STS)\s?\d+[-\/]\d{4}|Corte Constitucional|Corte Suprema de Justicia|Constitución Política|Resolución\s[\d‐-]+\sde\s\d{4}|Directiva\s\d+(?:\sde\s\d{4})?)/g;
  function esRef(s) { REF.lastIndex = 0; var r = REF.test(String(s)); REF.lastIndex = 0; return r; }
  function refc(s) { return esRef(s) ? ' ref' : ''; }
  function rot(s) { return (esRef(s) ? '<i class="fas fa-book-open ref-ico" aria-hidden="true"></i>' : '') + esc(may(s)); }
  /* Cada línea es un párrafo de la fuente; «[^n] …» al inicio es una nota al pie y «[^n]» en el texto, su llamada. */
  function marcado(s) {
    return esc(s).replace(REF, function (m) { return '<mark class="ref-texto">' + m + '</mark>'; })
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\[\^(\d+)\]/g, '<sup class="llamada">$1</sup>');
  }
  /* Párrafos con aire (Bienes, revisión de Juan: «que haga respirar un poquitico el párrafo»): con datos.respiro (caracteres
     por tramo), un párrafo largo se muestra en tramos de pocas oraciones, cada uno como párrafo visual, sin cambiar una
     letra. No corta tras abreviaturas, numerales de lista («1.»), iniciales ni dentro de una negrita. */
  var FIN_ORACION = /(?:[.!?][”’»")\]]*\s+(?=[«“"(¿¡A-ZÁÉÍÓÚÑ]|\d{1,2}\.\s)|:\s+(?=\d{1,2}\.\s))/g;
  /* Antes de la abreviatura no puede haber una letra: «\b» de JavaScript no reconoce las tildes y tomaría «acción.» por «n.». */
  var NO_CORTA = /(?:(?<![A-Za-zÁÉÍÓÚÜÑáéíóúüñ])(?:art|arts|núm|num|inc|lit|par|No|p|pp|M\.P|Rad|ss|cfr|Cfr|ibid|Ibid|vgr|etc|S\.A|Dr|Sr|Sra|aprox|ed|Ed|vol|n|N|ord|cap|Ob|cit|op)|(?:^|\s)\d{1,2}|(?:^|[\s(«“"])[A-ZÁÉÍÓÚÑ])\.\s+$/;
  function tramos(t) {
    var lim = datos.respiro;
    if (!lim || t.length <= lim * 1.3) return [t];
    var oraciones = [], desde = 0, m;
    FIN_ORACION.lastIndex = 0;
    while ((m = FIN_ORACION.exec(t))) {
      var hasta = m.index + m[0].length, previo = t.slice(0, hasta);
      if (NO_CORTA.test(previo) || previo.split('**').length % 2 === 0) continue;
      oraciones.push(t.slice(desde, hasta).trim());
      desde = hasta;
    }
    oraciones.push(t.slice(desde).trim());
    /* Una oración muy larga (citas legales) se divide en sus punto y coma, que la cierran a medias: el texto no cambia. */
    oraciones = oraciones.reduce(function (a, o) {
      if (o.length <= lim * 1.3) return a.concat([o]);
      return a.concat(o.split(/(?<=;)\s+/).filter(function (x) { return x; }));
    }, []);
    /* datos.partirComas (SRPA, 30/10/2026: párrafos de una sola oración de hasta 1 000 caracteres, sin punto ni punto y coma):
       la oración que sigue siendo muy larga se divide en las comas que abren una cláusula («, ya que», «, por el contrario»,
       «, es decir»…) o, si no hay, en cualquier coma, en tramos de hasta «respiro». El texto no cambia: solo descansa. */
    if (datos.partirComas) oraciones = oraciones.reduce(function (a, o) {
      if (o.length <= lim * 1.3) return a.concat([o]);
      var CLAUSULA = /,\s+(?=(?:por el contrario|ya que|es decir|lo cual|lo que|según|sino|pues|porque|mientras|aunque|toda vez que|en tanto|así como|de manera que|dado que|puesto que|sin embargo|no obstante|por lo tanto|por tanto|en consecuencia|razón por la cual|con lo cual|además|igualmente|siempre que|siempre y cuando|tal como|de acuerdo con|conforme|en el que|en la que|en los que|en las que|en donde|donde|cuando|quienes?|el cual|la cual|los cuales|las cuales|cuy[oa]s?|con el fin|a fin de|para que|de modo que|de forma que|en especial|particularmente|esto es|en (?:este|ese|tal) sentido|por ello|por esta razón|de ahí que|pero|o sea)\b)/gi;
      /* También los dos puntos que abren una cita o una enumeración («en dos grandes categorías: “…”»). */
      var cortes = [], comas = [], m, re = /[,:]\s+/g;
      CLAUSULA.lastIndex = 0;
      while ((m = CLAUSULA.exec(o))) cortes.push(m.index + 1);
      while ((m = re.exec(o))) comas.push(m.index + 1);
      var piezas = [], desde = 0, sigue = false, espacios = [];
      re = /\s+/g;
      while ((m = re.exec(o))) espacios.push(m.index);
      function enVentana(c) { return c - desde >= lim * 0.35 && c - desde <= lim * 1.15; }
      while (o.length - desde > lim * 1.3) {
        /* Primero una coma de cláusula dentro del tramo; si no hay, cualquier coma dentro del tramo. */
        var dentro = cortes.filter(enVentana), enEspacio = false;
        if (!dentro.length) dentro = comas.filter(enVentana);
        /* Sin coma en el tramo, la más cercana con un margen mayor: una oración de 658 caracteres quedaba entera (U1-L3-E07). */
        if (!dentro.length) dentro = comas.filter(function (c) { return c - desde >= lim * 0.25 && c - desde <= lim * 1.3; });
        /* Último recurso: una oración casi sin comas (U2-L3-E13, 1 132 caracteres a la vista) se reparte en un espacio y la
           continuación empieza con «…», en minúscula (convención de AGENTS.md). Solo para leer: el texto no cambia. */
        if (!dentro.length) { dentro = espacios.filter(function (c) { return c - desde >= lim * 0.6 && c - desde <= lim * 1.1; }); enEspacio = true; }
        if (!dentro.length) break;
        var c = enEspacio ? dentro[dentro.length - 1]
          : dentro.reduce(function (b, x) { return Math.abs(x - desde - lim * 0.85) < Math.abs(b - desde - lim * 0.85) ? x : b; });
        piezas.push((sigue ? '…' : '') + o.slice(desde, c).trim()); desde = c; sigue = enEspacio;
      }
      piezas.push((sigue ? '…' : '') + o.slice(desde).trim());
      return a.concat(piezas.filter(function (x) { return x && x !== '…'; }));
    }, []);
    var out = [];
    oraciones.forEach(function (o) {
      var u = out.length - 1;
      var junto = u >= 0 ? out[u].length + o.length + 1 : Infinity;
      if (u >= 0 && (junto <= lim || (out[u].length < lim * 0.6 && junto <= lim * 1.3))) out[u] += ' ' + o; else out.push(o);
    });
    var ultimo = out[out.length - 1];
    if (out.length > 1 && ultimo.length < lim * 0.35 && out[out.length - 2].length + ultimo.length + 1 <= lim * 1.3) out[out.length - 2] += ' ' + out.pop();
    return out;
  }
  function linea(t) {
    var nota = /^\[\^(\d+)\]\s*/.exec(t), cuerpo = may(nota ? t.slice(nota[0].length) : t);
    /* La nota al pie también descansa en tramos (la nota del artículo 534 en Ley 1826 L3 era un bloque de 1 500 caracteres
       que ni la lectura por partes podía repartir; pulido del 29/10/2026): la llamada va en el primero. */
    if (nota) return tramos(cuerpo).map(function (x, i) {
      return '<span class="parr nota-pie' + (i ? ' tramo' : '') + '">' + (i ? '' : '<sup>' + nota[1] + '</sup> ') + marcado(x) + '</span>';
    }).join('');
    var vin = /^• /.test(t);
    return tramos(cuerpo).map(function (x, i) {
      return '<span class="parr' + (vin ? (i ? ' tramo vineta-sigue' : ' vineta') : i ? ' tramo' : '') + '">' + marcado(x) + '</span>';
    }).join('');
  }
  /* Cuatro o más viñetas breves seguidas (los porcentajes del artículo 91 en Bienes) van en dos columnas: una por renglón
     dejaba vacía la mitad derecha de la lectura (QA del pulido, 29/10/2026). El texto no cambia. */
  function rico(s) {
    var lineas = String(s).split('\n'), out = [], k = 0;
    while (k < lineas.length) {
      var j = k;
      // Una palabra de 20 caracteres o más («indagación/investigación.») no cabe en media columna y se montaba sobre la
      // vecina (Estándares U5 al regenerar; revisión de choques, 30/10/2026): esas viñetas siguen en una columna.
      while (j < lineas.length && /^• /.test(lineas[j]) && lineas[j].length <= 72 && !/\S{20,}/.test(lineas[j])) j++;
      if (j - k >= 4) { out.push('<span class="vinetas-breves">' + lineas.slice(k, j).map(linea).join('') + '</span>'); k = j; }
      else { out.push(linea(lineas[k])); k++; }
    }
    return out.join('');
  }
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
  /* ---------- Sin espacios en blanco (Esteban, 28/10/2026: «recuerda no dejar esos espacios en blanco») ----------
     Con datos.sinHuecos, la letra de las cajas de lectura de alto fijo crece hasta 25 px (antes 22) y, si con ella queda bajo el
     texto un hueco de 110 px o más, la caja recibe allí la ilustración de relleno de la escena (escena.relleno: aprobada,
     del tema del texto y distinta de las que la escena ya muestra). */
  /* Marco ancho (SRPA, iframe de 1113 × 448): solo el curso que lo declara en datos.marco. Las reglas de base.css para ese
     marco van con .marco-ancho dentro de su @container: un curso de 767 × 510 abierto en una pestaña ancha (la que abre
     «Pantalla completa» sin permiso) no cambia de composición (revisión de choques, 30/10/2026). */
  function marcoAncho() { return !!(datos.marco && datos.marco[0] >= 900); }
  function anchoReal() { return marcoAncho() && raiz.clientWidth >= 900; }
  function topeLetra(normal) { return datos.sinHuecos ? Math.max(normal, 25) : normal; }
  /* Holgura del encaje: con datos.sinHuecos se deja 4 px libres, porque otro navegador dibuja la misma fuente 1–3 px más alta y
     el panel abriría una barra de desplazamiento. */
  function holgura() { return datos.sinHuecos ? -3 : 1; }
  /* ¿Cabe el contenido de la caja? Sin desplazamiento y, con datos.sinHuecos, con el texto terminando al menos 3 px antes de su
     borde de abajo. scrollHeight nunca baja de clientHeight: con la holgura negativa, «scrollHeight <= clientHeight − 3» no se
     cumplía nunca y la letra bajaba siempre al mínimo, con un hueco debajo (Esteban, 28/10/2026, U1-L1-E04: «ese espacio
     debajo… tiene que ser rellenado»). Sin datos.sinHuecos, la misma prueba de antes. */
  function entra(caja) {
    if (caja.scrollHeight > caja.clientHeight + 1) return false;
    if (holgura() >= 0) return true;
    var cs = getComputedStyle(caja), r = caja.getBoundingClientRect(), e = caja.offsetHeight ? r.height / caja.offsetHeight : 1;
    var fondo = r.bottom - (parseFloat(cs.paddingBottom) + parseFloat(cs.borderBottomWidth)) * e, fin = -Infinity;
    var w = document.createTreeWalker(caja, NodeFilter.SHOW_TEXT), n, rg = document.createRange(), q;
    while ((n = w.nextNode())) {
      if (!n.textContent.trim() || !n.parentElement || !n.parentElement.getClientRects().length) continue;
      rg.selectNodeContents(n); q = rg.getBoundingClientRect();
      if (q.height > 0) fin = Math.max(fin, q.bottom);
    }
    return fin <= fondo + holgura() * e;
  }
  function alturaContenido(caja) {
    var arriba = Infinity, abajo = -Infinity, w = document.createTreeWalker(caja, NodeFilter.SHOW_TEXT), n, r = document.createRange();
    function sumar(b) { if (b.width > 0 && b.height > 0) { arriba = Math.min(arriba, b.top); abajo = Math.max(abajo, b.bottom); } }
    while ((n = w.nextNode())) {
      if (!n.textContent.trim() || !n.parentElement || !n.parentElement.getClientRects().length) continue;
      r.selectNodeContents(n); sumar(r.getBoundingClientRect());
    }
    caja.querySelectorAll('img,svg').forEach(function (m) { if (m.getClientRects().length && !m.closest('svg svg')) sumar(m.getBoundingClientRect()); });
    return abajo > arriba ? abajo - arriba : 0;
  }
  function quitarRelleno(caja) {
    if (!caja) return;
    [].slice.call(caja.querySelectorAll('.relleno-arte')).forEach(function (f) { caja.dataset.tuvoRelleno = '1'; f.remove(); });
    caja.classList.remove('con-relleno');
  }
  /* «columna»: dónde va la ilustración dentro de la caja (el texto de la ruta o de las fichas); por omisión, la caja. */
  function rellenar(caja, columna) {
    quitarRelleno(caja);
    if (!datos.sinHuecos || !datos.ilustraciones || !escena.relleno || !caja || !caja.getClientRects().length) return;
    var cs = getComputedStyle(caja), disp = caja.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom), usado = alturaContenido(caja);
    if (disp < 160 || disp - usado < 110) return;
    var dentro = columna || caja, f = document.createElement('figure');
    f.className = 'relleno-arte'; f.setAttribute('aria-hidden', 'true');
    // Al re-encajar (cambio de tamaño, fuentes) la ilustración que ya estaba no vuelve a entrar con su animación: parpadeaba.
    if (caja.dataset.tuvoRelleno) f.style.animation = 'none';
    f.innerHTML = '<img src="' + srcImagen(escena.relleno) + '" alt="">';
    dentro.classList.add('con-relleno'); dentro.appendChild(f);
  }
  function crecerLectura(caja) {
    var texto = caja.querySelector('.ruta-texto');
    caja.classList.remove('apretada', 'sin-arte', 'mini');
    quitarRelleno(caja);
    if (texto) for (var fs = topeLetra(24); fs > 14.2; fs -= 0.5) { caja.style.setProperty('--fs', fs + 'px'); if (cabe(texto, 4) && caja.scrollHeight <= caja.clientHeight + 1) { rellenar(caja, texto); return; } }
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
  function arteEn(pos) { return !!(datos.ilustraciones && escena && escena.arte && escena.arte.pos === pos); }
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
  /* «minimo»: letra más pequeña aceptable (12,5 px por omisión); la bitácora del marco ancho pide 14 y, si no cabe, se reparte en partes. */
  function encajarTexto(cont, caja, minimo) {
    quitarRelleno(caja);
    encajarTextoBase(cont, caja, minimo);
    rellenar(caja);
  }
  function encajarTextoBase(cont, caja, minimo) {
    var fs, min = minimo || 12.5;
    function probar(min) { for (fs = topeLetra(22); fs >= min; fs -= 0.5) { caja.style.setProperty('--fs', fs + 'px'); if (cabe(caja, 4)) return true; } return false; }
    cont.classList.remove('sin-arte'); caja.classList.remove('sin-icono');
    if (caja.querySelector('.ctx-icono') && probar(16)) return;
    caja.classList.add('sin-icono');
    if (!probar(min)) { cont.classList.add('sin-arte'); probar(min); }
  }

  /* ---------- Avance, visto y celebración ---------- */
  /* Leer el 100 % antes de avanzar (Estándares interamericanos; Esteban, 28/10/2026: «cuando hay uno de seguir leyendo… que no
     lo dejes seguir a la siguiente página… hey, no has leído el 100 %… tienes que completar el 100 % para poder avanzar»).
     Con datos.completar, lo que se abre en una lectura por partes queda visto al llegar a su última parte: el toque que abre
     y marca un elemento es un solo «turno», y la lectura creada en ese turno decide cuándo se marca. Sin datos.completar,
     marcar() es marcarYa(), como antes. */
  var turno = 0, ultimaLectura = null, generacion = 0;
  document.addEventListener('pointerdown', function () { turno++; }, true);
  document.addEventListener('keydown', function () { turno++; }, true);
  function marcar(id) {
    if (vistos[id]) return;
    if (!datos.completar) { marcarYa(id); return; }
    var t = turno, g = generacion;
    setTimeout(function () {
      if (g !== generacion) return;
      var L = ultimaLectura;
      if (L && L.turno === t && !L.completa) L.alCompletar.push(function () { if (g === generacion) marcarYa(id); });
      else marcarYa(id);
    }, 0);
  }
  function marcarYa(id) {
    if (vistos[id]) return;
    vistos[id] = true;
    raiz.querySelectorAll('[data-id="' + id + '"]').forEach(function (b) { b.classList.add('visto'); });
    /* Las familias que cambian al leer (red, conexiones) escuchan este aviso en su bloque. */
    var origen = raiz.querySelector('[data-id="' + id + '"]');
    if (origen) origen.dispatchEvent(new CustomEvent('ova-visto', { bubbles: true, detail: id }));
    if (datos.sinHuecos) midiendo(function () { encajarTarjetas(); ajustarExtractos(); });
    var n = Object.keys(vistos).length, barra = raiz.querySelector('.barra i');
    if (!barra) return;
    barra.style.width = (100 * n / total) + '%';
    raiz.querySelector('.avance output').textContent = n + ' / ' + total;
    /* Con el visto diferido, «Exploración completa» llega después de encajar los textos: se vuelven a encajar. */
    if (n === total) { celebrar(); if (datos.completar) window.dispatchEvent(new Event('resize')); }
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
  /* Textos que descansan (Juan y Esteban, 27/10/2026: «donde había textos largos hay que dejarlos descansar… un texto
     larguísimo le hace dormir el cerebro»): con datos.pagina (caracteres por parte), una lectura más larga se muestra por
     partes de uno o dos tramos, con «Seguir leyendo» y su posición; nada se recorta y todo queda en la página. «ajustar»
     vuelve a encajar la letra en cada parte. */
  function dosificar(caja, ajustar, limite) {
    var lim = limite || datos.pagina, t = caja && caja.querySelector('.lectura-texto'), viejo = caja && caja.querySelector('.lectura-paginas');
    if (viejo) viejo.remove();
    if (caja) caja.classList.remove('lectura-pendiente');
    if (!lim || !t) return false;
    var partes = [].slice.call(t.querySelectorAll('.parr')), total = 0;
    partes.forEach(function (x) { x.hidden = false; total += x.textContent.length; });
    if (total <= lim * 1.08) return false;
    var paginas = [[]], largo = 0;
    partes.forEach(function (x) {
      var L = x.textContent.length;
      if (paginas[paginas.length - 1].length && largo + L > lim && (largo >= lim * 0.3 || largo + L > lim * 1.08)) { paginas.push([]); largo = 0; }
      paginas[paginas.length - 1].push(x); largo += L;
    });
    if (paginas.length < 2) return false;
    var pos = 0, nav = document.createElement('div');
    nav.className = 'lectura-paginas';
    nav.innerHTML = '<button type="button" class="pag-anterior" aria-label="Parte anterior"><i class="fas fa-arrow-left" aria-hidden="true"></i></button>' +
      '<span class="pag-puntos" aria-hidden="true">' + paginas.map(function () { return '<i></i>'; }).join('') + '</span><span class="pag-estado" aria-live="polite"></span>' +
      '<button type="button" class="pag-siguiente">Seguir leyendo <i class="fas fa-arrow-right" aria-hidden="true"></i></button>';
    t.parentNode.insertBefore(nav, t.nextSibling);
    /* Partes leídas de esta lectura (datos.completar): el visto y los «Siguiente» esperan a la última. */
    var L = { partes: paginas.length, leidas: {}, completa: false, turno: turno, alCompletar: [], sig: nav.querySelector('.pag-siguiente') };
    nav.lectura = L;
    if (datos.completar) { ultimaLectura = L; caja.classList.add('lectura-pendiente'); }
    function ir(i) {
      pos = i;
      L.leidas[i] = true;
      if (!L.completa && Object.keys(L.leidas).length === L.partes) {
        L.completa = true; caja.classList.remove('lectura-pendiente');
        L.alCompletar.splice(0).forEach(function (f) { f(); });
        caja.dispatchEvent(new CustomEvent('lectura-completa', { bubbles: true }));
      }
      paginas.forEach(function (pg, j) { pg.forEach(function (x) { x.hidden = j !== i; }); });
      nav.querySelector('.pag-estado').textContent = 'Parte ' + (i + 1) + ' de ' + paginas.length;
      nav.querySelectorAll('.pag-puntos i').forEach(function (d, j) { d.classList.toggle('activo', j <= i); });
      nav.querySelector('.pag-anterior').disabled = i === 0;
      nav.querySelector('.pag-siguiente').disabled = i === paginas.length - 1;
      if (ajustar) ajustar();
      reanimar(t);
    }
    nav.querySelector('.pag-anterior').addEventListener('click', function (e) { e.stopPropagation(); ir(Math.max(0, pos - 1)); });
    nav.querySelector('.pag-siguiente').addEventListener('click', function (e) { e.stopPropagation(); ir(Math.min(paginas.length - 1, pos + 1)); });
    ir(0);
    return true;
  }
  /* Cajas de varios párrafos (el caso de la «Actividad de aprendizaje») que no caben ni a 15 px: sus párrafos se reparten en
     partes con «Seguir leyendo», igual que dosificar(), sin recortar nada (Esteban, 28/10/2026: «que no aparezca letra así
     cortada»). Si un párrafo solo no cabe, la letra baja hasta 13 px. «medida»: la caja de alto fijo que no debe desbordarse, si
     no es la misma que reparte (las celdas de una fila de tabla dentro de su panel). Devuelve si hizo partes. */
  function quitarPartes(caja) {
    [].slice.call(caja.children).forEach(function (x) { if (x.classList.contains('lectura-paginas')) x.remove(); else x.classList.remove('parte-oculta'); });
    caja.classList.remove('lectura-pendiente');
  }
  function partirBloques(caja, medida) {
    quitarPartes(caja);
    medida = medida || caja;
    var unidades = [].slice.call(caja.children);
    if (unidades.length < 2) return false;
    var nav = document.createElement('div');
    nav.className = 'lectura-paginas';
    nav.innerHTML = '<button type="button" class="pag-anterior" aria-label="Parte anterior"><i class="fas fa-arrow-left" aria-hidden="true"></i></button>' +
      '<span class="pag-puntos" aria-hidden="true"></span><span class="pag-estado" aria-live="polite">Parte 1 de 2</span>' +
      '<button type="button" class="pag-siguiente">Seguir leyendo <i class="fas fa-arrow-right" aria-hidden="true"></i></button>';
    caja.appendChild(nav);
    function desborda() { return medida.scrollHeight > medida.clientHeight + 1; }
    var paginas;
    for (var fs = 15; fs >= 13; fs -= 1) {
      caja.style.setProperty('--fs', fs + 'px');
      paginas = [[]];
      unidades.forEach(function (x) { x.classList.add('parte-oculta'); });
      unidades.forEach(function (x) {
        var pg = paginas[paginas.length - 1];
        x.classList.remove('parte-oculta');
        if (pg.length && desborda()) { pg.forEach(function (y) { y.classList.add('parte-oculta'); }); paginas.push([x]); }
        else pg.push(x);
      });
      var caben = paginas.every(function (pg) {
        unidades.forEach(function (x) { x.classList.toggle('parte-oculta', pg.indexOf(x) < 0); });
        return !desborda();
      });
      if (caben) break;
    }
    if (paginas.length < 2) { nav.remove(); unidades.forEach(function (x) { x.classList.remove('parte-oculta'); }); return false; }
    nav.querySelector('.pag-puntos').innerHTML = paginas.map(function () { return '<i></i>'; }).join('');
    var L = { partes: paginas.length, leidas: {}, completa: false, turno: turno, alCompletar: [], sig: nav.querySelector('.pag-siguiente') }, pos = 0;
    nav.lectura = L;
    /* Una página ya leída completa no vuelve a pedir lectura al regresar a ella. */
    if (caja.dataset.leida) L.completa = true;
    else if (datos.completar) { ultimaLectura = L; caja.classList.add('lectura-pendiente'); }
    function ir(i) {
      pos = i;
      L.leidas[i] = true;
      if (!L.completa && Object.keys(L.leidas).length === L.partes) {
        L.completa = true; caja.dataset.leida = '1'; caja.classList.remove('lectura-pendiente');
        L.alCompletar.splice(0).forEach(function (f) { f(); });
        caja.dispatchEvent(new CustomEvent('lectura-completa', { bubbles: true }));
      }
      paginas.forEach(function (pg, j) { pg.forEach(function (x) { x.classList.toggle('parte-oculta', j !== i); }); });
      nav.querySelector('.pag-estado').textContent = 'Parte ' + (i + 1) + ' de ' + paginas.length;
      nav.querySelectorAll('.pag-puntos i').forEach(function (d, j) { d.classList.toggle('activo', j <= i); });
      nav.querySelector('.pag-anterior').disabled = i === 0;
      nav.querySelector('.pag-siguiente').disabled = i === paginas.length - 1;
      reanimar(caja);
    }
    nav.querySelector('.pag-anterior').addEventListener('click', function (e) { e.stopPropagation(); ir(Math.max(0, pos - 1)); });
    nav.querySelector('.pag-siguiente').addEventListener('click', function (e) { e.stopPropagation(); ir(Math.min(paginas.length - 1, pos + 1)); });
    ir(0);
    return true;
  }
  /* Lectura por partes sin terminar a la vista dentro de «cont», o null (siempre null sin datos.completar). */
  function faltaLeer(cont) {
    if (!datos.completar || !cont) return null;
    var navs = cont.querySelectorAll('.lectura-paginas');
    for (var i = 0; i < navs.length; i++) { var L = navs[i].lectura; if (L && !L.completa && navs[i].offsetParent !== null) return L; }
    return null;
  }
  function textoFalta(L, que) {
    var leidas = Object.keys(L.leidas).length, faltan = L.partes - leidas;
    return 'Aún no has leído el 100 % de ' + que + ': llevas el ' + Math.round(100 * leidas / L.partes) + ' % y ' +
      (faltan === 1 ? 'te falta 1 parte' : 'te faltan ' + faltan + ' partes') + '. Usa «Seguir leyendo» para completarla y poder avanzar.';
  }
  /* Aviso breve sobre la mediación (o la tarjeta); «pulsar», el «Seguir leyendo» pendiente, late para mostrar qué falta. */
  function avisar(lugar, texto, pulsar) {
    var a = null;
    [].forEach.call(lugar.children, function (c) { if (c.classList.contains('aviso-completar')) a = c; });
    if (!a) { a = document.createElement('p'); a.className = 'aviso-completar'; a.setAttribute('role', 'alert'); lugar.appendChild(a); }
    a.innerHTML = '<i class="fas fa-lock" aria-hidden="true"></i><span>' + esc(texto) + '</span>';
    a.classList.remove('sale'); void a.offsetWidth; a.classList.add('sale');
    clearTimeout(a.reloj); a.reloj = setTimeout(function () { a.classList.remove('sale'); }, 4500);
    if (pulsar) { pulsar.classList.remove('llamar'); void pulsar.offsetWidth; pulsar.classList.add('llamar'); pulsar.focus({ preventScroll: true }); }
  }
  /* «Siguiente» con candado: sigue activo para explicar qué falta, pero no avanza. */
  function candado(boton, si) { boton.classList.toggle('bloqueado', !!si); boton.setAttribute('aria-disabled', String(!!si)); }
  var alCerrarLector = null;
  function leer(titulo, texto, obj, desde, hoja) {
    var l = raiz.querySelector('.lector');
    if (alCerrarLector && !hoja) { var f0 = alCerrarLector; alCerrarLector = null; f0(); }
    retornoFoco = desde || null;
    /* «hoja»: {izq}, la ventana como hoja de cuaderno a la derecha de la tarjeta que se abre (B.giro). */
    l.classList.toggle('en-hoja', !!hoja);
    if (hoja) l.style.setProperty('--hoja-izq', hoja.izq + 'px'); else l.style.removeProperty('--hoja-izq');
    var cerrar = '<button type="button" class="cerrar" aria-label="Cerrar lectura">Cerrar ×</button>', arte = obj ? '<span class="lector-arte">' + svgObjeto(obj, 78) + '</span>' : '';
    l.innerHTML = '<div class="lector-caja" role="dialog" aria-modal="true" aria-label="' + esc(may(titulo)) + '" tabindex="-1">' + (hoja
      /* La hoja de cuaderno del giro (Esteban, 30/10/2026: «en el de seguir leyendo, en la vista escritorio, que sea scroll»): el
         texto completo se desplaza dentro de la hoja, con su avance; queda leído al llegar al final. */
      ? '<div class="hoja-cab"><p class="lectura-eyebrow">' + esc(may(titulo)) + '</p>' + arte + cerrar + '</div>' +
        '<div class="lectura-texto hoja-texto desplazable" tabindex="0">' + rico(texto) + '</div><p class="hoja-pie" aria-live="polite"></p>'
      : cerrar + arte + '<p class="lectura-eyebrow">' + esc(may(titulo)) + '</p><p class="lectura-texto">' + rico(texto) + '</p>') + '</div>';
    l.hidden = false;
    /* La ventana también se escribe letra por letra y, al terminar cada parte, «Seguir leyendo» dice «¡Sigue aquí!» (Esteban,
       31/10/2026: prioridad 1 del diagnóstico de detalles, el lector del esquema, los puntos, la lámina, el mapa mental y el mapa).
       Las letras se envuelven antes de medir y repartir la lectura, para que nada cambie de lugar al escribirse. */
    var lt = !hoja && !quieto ? l.firstChild.querySelector('.lectura-texto') : null, letras = lt ? envolverLetras(lt) : null, partes = false;
    if (hoja) leerDesplazando(l.firstChild);
    else if (!(partes = !!dosificar(l.firstChild, function () { encajarLector(l.firstChild); }))) encajarLector(l.firstChild);
    if (!animarApertura(l, desde)) reanimar(l.firstChild);
    if (letras) escribirVentana(lt, letras, partes);
    /* Lo que se abrió y aún no está visto (le falta una parte) late hasta completarse: el estudiante sabe dónde le falta leer. */
    if (desde && desde.classList) desde.classList.add('abierta');
    l.querySelector('.cerrar').onclick = cerrarLector;
    l.firstChild.focus({ preventScroll: true });
  }
  /* La ventana nace del elemento que la abre y se expande al centro con un rebote breve; su contenido entra escalonado (Esteban,
     30/10/2026: «que aparezca el modal… de forma animada, bien chévere»). Web Animations API, sin bibliotecas; nada con «reducir
     movimiento». Dura menos de 0,4 s, para que la lectura esté quieta al medirla. */
  var quieto = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function animarApertura(l, desde) {
    var caja = l.firstChild;
    if (quieto || !caja || !caja.animate || !desde || !desde.getBoundingClientRect) return false;
    var o = desde.getBoundingClientRect(), c = caja.getBoundingClientRect();
    if (!o.width || !c.width) return false;
    var dx = o.left + o.width / 2 - (c.left + c.width / 2), dy = o.top + o.height / 2 - (c.top + c.height / 2);
    var s = Math.max(0.15, Math.min(1, o.width / c.width, o.height / c.height));
    l.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
    if (l.classList.contains('en-hoja')) {
      caja.animate([{ transform: 'translateX(-70px) rotate(-4deg) scale(.96)', opacity: 0 }, { transform: 'translateX(4px) rotate(.2deg)', opacity: 1, offset: 0.75 },
        { transform: 'rotate(-.4deg)', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.9,.3,1)' });
    } else caja.animate([{ transform: 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) scale(' + s.toFixed(3) + ')', opacity: 0.35 },
      { transform: 'translate(0,0) scale(1.015)', opacity: 1, offset: 0.78 }, { transform: 'none', opacity: 1 }],
      { duration: 340, easing: 'cubic-bezier(.2,.9,.3,1)' });
    [].forEach.call(caja.querySelectorAll('.lector-arte,.lectura-eyebrow,.lectura-texto,.lectura-paginas,.cerrar,.hoja-pie'), function (x, i) {
      x.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }],
        { duration: 220, delay: Math.min(130, 70 + i * 30), easing: 'ease-out', fill: 'backwards' });
    });
    return true;
  }
  /* Lectura con desplazamiento dentro de la hoja: un indicador dice cuánto falta («Desliza para seguir leyendo · 40 %») y la línea del
     margen se llena con lo leído. Con datos.completar, el visto llega al llegar al final del texto (leer el 100 %). */
  function leerDesplazando(caja) {
    var t = caja.querySelector('.hoja-texto'), pie = caja.querySelector('.hoja-pie');
    var L = { partes: 1, leidas: {}, completa: false, turno: turno, alCompletar: [] };
    if (datos.completar) ultimaLectura = L;
    var escribiendo = true;
    function revisar() {
      if (!t.isConnected) return;
      if (escribiendo) {
        pie.innerHTML = '<i class="fas fa-pen-nib" aria-hidden="true"></i> Escribiendo… toca la hoja para verla completa';
        return;
      }
      var sobra = t.scrollHeight - t.clientHeight, pct = sobra <= 2 ? 100 : Math.min(100, Math.round(100 * (t.scrollTop + t.clientHeight) / t.scrollHeight));
      caja.style.setProperty('--leido', pct + '%');
      if (sobra - t.scrollTop <= 4) {
        if (!L.completa) { L.completa = true; L.alCompletar.splice(0).forEach(function (f) { f(); }); }
        caja.classList.add('hoja-leida');
        pie.innerHTML = visto + ' Leído completo';
      } else pie.innerHTML = '<i class="fas fa-angles-down" aria-hidden="true"></i> Desliza para seguir leyendo · ' + pct + ' %';
    }
    t.addEventListener('scroll', revisar, { passive: true });
    revisar();
    escribir(t, function () { escribiendo = false; revisar(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(revisar);
  }
  /* El texto de la hoja se va escribiendo, palabra por palabra, con un cursor que parpadea, y la hoja baja sola siguiéndolo
     (Esteban, 30/10/2026: «que las letras no aparezcan de una, que se vaya escribiendo, así el usuario va leyendo»). Tocar la hoja,
     girar la rueda o usar el teclado lo muestra completo de una vez. El texto está entero en el documento desde el principio (los
     lectores de pantalla lo leen completo); con «reducir movimiento» aparece de una vez. */
  function escribir(t, fin) {
    if (quieto) { fin(); return; }
    escribirLetras(t, envolverLetras(t), fin);
  }
  /* Cada carácter del texto en su propia letra («l»), sin cambiar el texto: se hace antes de medir y repartir la lectura. */
  function envolverLetras(t) {
    /* Escritura real (Esteban, 31/10/2026: «ponle como escritura real, la animación de aparición está muy lag»): letra por
       letra, con el texto ya en su lugar (cada letra existe desde el principio y solo se hace visible: nada se reacomoda) y un
       cursor que se desliza detrás de la última letra. Va con requestAnimationFrame, sin temporizadores a saltos. */
    var letras = [], nodos = [], n, w = document.createTreeWalker(t, NodeFilter.SHOW_TEXT);
    while ((n = w.nextNode())) if (n.nodeValue.trim()) nodos.push(n);
    nodos.forEach(function (nodo) {
      /* Un resaltado (referencia jurídica, caja) no se ve vacío antes de tiempo: aparece con su primera letra. */
      var pa = nodo.parentNode;
      if (pa !== t && pa.nodeType === 1) {
        var cs = getComputedStyle(pa);
        if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.borderBottomStyle !== 'none' || cs.boxShadow !== 'none') pa.classList.add('caja-letras');
      }
      var frag = document.createDocumentFragment();
      Array.from(nodo.nodeValue).forEach(function (ch) {
        var s = document.createElement('span');
        s.className = 'l'; s.textContent = ch; frag.appendChild(s); letras.push(s);
      });
      nodo.parentNode.replaceChild(frag, nodo);
    });
    return letras;
  }
  /* Las letras se hacen visibles al ritmo de lectura; si la siguiente está en una parte oculta (lectura por partes), la
     escritura espera hasta que esa parte se muestre con «Seguir leyendo». */
  function escribirLetras(t, letras, fin) {
    if (!letras || !letras.length) { fin(); return; }
    /* Al ritmo de quien lee con fluidez (Esteban, 31/10/2026): en español, unas 220 palabras o 1 000 caracteres por minuto
       (IReST): 58 ms por carácter, con una variación mínima, una pausa breve tras la coma y otra mayor al cerrar la oración. */
    var cuando = [], acum = 250;
    letras.forEach(function (s, k) {
      cuando.push(acum);
      var ch = s.textContent, sig = letras[k + 1] ? letras[k + 1].textContent : ' ';
      acum += 58 * (0.85 + 0.3 * ((k * 7919) % 13) / 12);
      if (/\s/.test(sig)) { if (/[,;:]/.test(ch)) acum += 180; else if (/[.?!…]/.test(ch)) acum += 320; }
    });
    var cursor = document.createElement('span');
    cursor.className = 'cursor-escritura'; cursor.setAttribute('aria-hidden', 'true');
    t.appendChild(cursor);
    t.classList.add('escribiendo');
    var i = 0, tiempo = 0, ultimo = null, cuadro = null, listo = false, esperando = false;
    /* Terminada una parte (Esteban, 31/10/2026: «que cuando termine le indique al usuario que tiene que darle seguir»): «Seguir
       leyendo» late y un globo dice «¡Sigue aquí!» hasta que lo toca. */
    function seguirAqui(si) {
      var cont = t.parentNode, sig = null;
      for (var k = 0; k < 4 && cont && !sig; k++, cont = cont.parentNode) sig = cont.querySelector && cont.querySelector('.pag-siguiente');
      if (!sig) return;
      sig.classList.toggle('sigue-aqui', si);
    }
    function terminar() {
      if (listo) return;
      listo = true; cancelAnimationFrame(cuadro);
      if (esperando) seguirAqui(false);
      t.classList.remove('escribiendo'); cursor.remove();
      ['click', 'wheel', 'touchstart', 'keydown'].forEach(function (e) { t.removeEventListener(e, terminar); });
      fin();
    }
    ['click', 'wheel', 'touchstart', 'keydown'].forEach(function (e) { t.addEventListener(e, terminar, { passive: true }); });
    function cuadroDe(ahora) {
      if (!t.isConnected || listo) return;
      var dt = ultimo === null ? 0 : Math.min(100, ahora - ultimo), antes = i;
      ultimo = ahora;
      if (i < letras.length && !letras[i].offsetParent) {   // parte oculta: espera y le indica al estudiante que siga
        if (!esperando) { esperando = true; seguirAqui(true); }
        cuadro = requestAnimationFrame(cuadroDe); return;
      }
      if (esperando) { esperando = false; seguirAqui(false); }
      tiempo += dt;
      while (i < letras.length && cuando[i] <= tiempo && letras[i].offsetParent) {
        var pa = letras[i].parentNode;
        if (pa.classList && pa.classList.contains('caja-letras')) pa.classList.add('con-letra');
        letras[i++].classList.add('vista');
      }
      if (i > antes) {
        var ult = letras[i - 1], r = ult.getBoundingClientRect(), c = t.getBoundingClientRect();
        cursor.style.transform = 'translate(' + (r.right - c.left + t.scrollLeft).toFixed(1) + 'px,' + (r.top - c.top + t.scrollTop).toFixed(1) + 'px)';
        cursor.style.height = r.height + 'px';
        if (r.bottom > c.bottom - 8) t.scrollTop += r.bottom - c.bottom + 30;   // la hoja baja con lo que se escribe
      }
      if (i >= letras.length) { setTimeout(terminar, 450); return; }
      cuadro = requestAnimationFrame(cuadroDe);
    }
    cuadro = requestAnimationFrame(cuadroDe);
  }
  /* Escribe la lectura de una ventana (lector, comparación). Con datos.completar y sin partes, queda leída al terminar de
     escribirse, como la hoja del giro; con partes, al pasar la última. Tocar el texto lo muestra completo. */
  function escribirVentana(t, letras, conPartes) {
    var L = null;
    if (datos.completar && !conPartes) { L = { partes: 1, leidas: {}, completa: false, turno: turno, alCompletar: [] }; ultimaLectura = L; }
    escribirLetras(t, letras, function () { if (L && !L.completa) { L.completa = true; L.alCompletar.splice(0).forEach(function (f) { f(); }); } });
  }
  /* Al cerrar una lectura sin terminarla, un aviso lo dice por escrito (Esteban, 31/10/2026: «que le diga que le falta leer… ya que
     ahora solo titilan»). No tapa nada que se pueda tocar y se va solo. */
  function avisarFalta(titulo) {
    var v = raiz.querySelector('.aviso-falta');
    if (v) v.remove();
    v = document.createElement('p');
    v.className = 'aviso-falta'; v.setAttribute('role', 'status');
    v.innerHTML = '<i class="fas fa-book-open" aria-hidden="true"></i><span>Te falta leer' + (titulo ? ' «' + esc(titulo) + '»' : '') + '. Ábrela de nuevo para terminar.</span>';
    raiz.appendChild(v);
    setTimeout(function () { v.classList.add('sale'); setTimeout(function () { v.remove(); }, 400); }, 3400);
  }
  /* Estado escrito de lo que abre una lectura: «Por leer», «Te falta leer» (abierta sin terminar) o «Leída» (base.css). */
  var estado = '<span class="estado-lectura"><span class="est-por">Por leer</span><span class="est-falta"><i class="fas fa-book-open" aria-hidden="true"></i> Te falta leer</span>' +
    '<span class="est-leida"><i class="fas fa-circle-check" aria-hidden="true"></i> Leída</span></span>';
  /* Si el texto no cabe en el lector, la letra baja de a medio punto (hasta 12 px): nunca desplazamiento. */
  function encajarLector(caja) {
    var t = caja.querySelector('.lectura-texto'), fs = parseFloat(getComputedStyle(t).fontSize);
    while (caja.scrollHeight > caja.clientHeight + 1 && fs > 12) { fs -= 0.5; t.style.fontSize = fs + 'px'; }
  }
  function cerrarLector() {
    var l = raiz.querySelector('.lector');
    if (!l || l.hidden) return false;
    var d = retornoFoco, titulo = l.firstChild && l.firstChild.getAttribute && l.firstChild.getAttribute('aria-label'), hoja = l.classList.contains('en-hoja');
    l.hidden = true; l.innerHTML = '';
    if (alCerrarLector) { var f = alCerrarLector; alCerrarLector = null; f(); }
    if (!hoja && datos.completar && d && d.dataset && d.dataset.id && !vistos[d.dataset.id]) avisarFalta(titulo);
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
      '<span class="nodo-marca">' + mano + visto + '</span>' + estado + '</button>';
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
        '<span class="punto-n">' + (i + 1) + '</span><span class="punto-rotulo">' + rot(it.label) + '</span>' + mano + '<span class="punto-visto">' + visto + '</span>' + estado + '</button>';
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
  /* Ninguna letra cortada (Esteban, 28/10/2026: «que no aparezca letra así cortada… déjalo en directrices»): un extracto que no
     cabe en sus líneas se acorta por palabras completas y termina en «…» (el texto completo está en su lector); si no caben ni
     tres palabras, no se muestra. Reemplaza el corte de -webkit-line-clamp, que dejaba palabras partidas. */
  function ajustarExtractos() {
    raiz.querySelectorAll('.giro-extracto,.rama-extracto,.esquema-extracto').forEach(function (e) {
      if (!e.dataset.completo) e.dataset.completo = e.textContent;
      var base = e.dataset.completo, puntos = /…$/.test(base), palabras = base.replace(/…$/, '').split(/\s+/), lo = 0, hi = palabras.length;
      function poner(n) { e.textContent = palabras.slice(0, n).join(' ') + (n < palabras.length || puntos ? '…' : ''); }
      var caja = e.closest('.cara') || e.closest('button');
      function cabe() { return e.scrollHeight <= e.clientHeight + 1 && e.scrollWidth <= e.clientWidth + 1 && (!caja || caja.scrollHeight <= caja.clientHeight + 1); }
      e.style.display = ''; e.style.fontSize = ''; e.style.webkitLineClamp = '';
      poner(hi);
      /* Con datos.sinHuecos, el extracto completo crece (hasta 17 px) mientras quepa en su tarjeta: la tarjeta no queda medio
         vacía con letra pequeña («no dejar esos espacios en blanco»). */
      var tarjeta = e.closest('.cara') || e.closest('button');
      if (datos.sinHuecos && tarjeta && !e.classList.contains('giro-extracto') && cabe()) {
        var fs0 = parseFloat(getComputedStyle(e).fontSize), mejor = 0;
        e.style.webkitLineClamp = 'unset';
        for (var fs = 17; fs > fs0; fs -= 0.5) {
          e.style.fontSize = fs + 'px';
          if (tarjeta.scrollHeight <= tarjeta.clientHeight + 1 && cabe()) { mejor = fs; break; }
        }
        if (!mejor) { e.style.fontSize = ''; e.style.webkitLineClamp = ''; }
        return;
      }
      if (cabe()) return;
      while (lo < hi) { var m = Math.ceil((lo + hi) / 2); poner(m); if (cabe()) lo = m; else hi = m - 1; }
      if (lo < 3) { e.style.display = 'none'; return; }
      poner(lo);
    });
  }
  /* Giro en dos filas (Esteban, 28/10/2026, sobre las cinco tarjetas angostas de U1-L3-E28: «organizarla de una distinta
     manera… para que no queden así esas líneas largas… agradable a la vista»): con datos.sinHuecos, si cada tarjeta quedaría de
     menos de 150 px de ancho, van en dos filas (3 + 2 centradas, 2 + 2, 3 + 3), con el dibujo más pequeño. */
  function organizarGiros() {
    raiz.querySelectorAll('.giros').forEach(function (g) {
      var n = g.children.length;
      g.style.removeProperty('--c'); g.classList.remove('dos-filas');
      if (!datos.sinHuecos || n < 4 || g.clientWidth / n >= 150) return;
      g.classList.add('dos-filas');
      g.style.setProperty('--c', String(Math.ceil(n / 2) * 2));
    });
  }
  /* Si la tarjeta aún no cabe (rótulo largo), primero se quita el dibujo de la cara y luego baja la letra del rótulo hasta
     10 px: el rótulo nunca queda cortado. */
  /* El borde que late en lo no visto (::after con «latido», que escala hasta 1,35) agranda el scrollHeight de su tarjeta según
     el momento de la animación: medida a destiempo, la tarjeta «no cabía» y perdía su dibujo y su extracto (SRPA U2-L3-E10
     al cargar en Genially, 30/10/2026). Mientras se mide, ese borde se oculta; la medida y la vuelta ocurren sin pintar. */
  function midiendo(fn) { raiz.classList.add('midiendo'); try { fn(); } finally { raiz.classList.remove('midiendo'); } }
  function encajarTarjetas() {
    raiz.querySelectorAll('.giro .cara, .nodo-esquema').forEach(function (t) {
      var r = t.querySelector('.giro-rotulo, .esquema-rotulo'), arte = t.querySelector('.giro-arte'), ex = t.querySelector('.giro-extracto, .esquema-extracto');
      if (!r) return;
      /* El rótulo y el dibujo se ajustan sin el extracto; luego ajustarExtractos() le da al extracto lo que queda. */
      var antes = ex ? ex.style.display : null;
      if (ex) ex.style.display = 'none';
      encajarRotulo(t, r, arte);
      if (ex) ex.style.display = antes;
    });
  }
  function encajarRotulo(t, r, arte) {
    (function () {
      r.style.fontSize = ''; r.style.overflowWrap = ''; if (arte) arte.style.display = '';
      /* Ancho útil de la tarjeta: una palabra larga («Responsabilización») no puede ser más ancha que ella. */
      var cs = getComputedStyle(t), ancho = t.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      function cabe() { return t.scrollHeight <= t.clientHeight + 1 && r.scrollWidth <= ancho + 1; }
      if (cabe()) return;
      if (arte) { arte.style.display = 'none'; if (cabe()) return; }
      for (var fs = parseFloat(getComputedStyle(r).fontSize) - 0.5; fs >= 10.5; fs -= 0.5) { r.style.fontSize = fs + 'px'; if (cabe()) return; }
      /* Último recurso: la palabra se parte (con guion donde el navegador sabe hacerlo) antes que cortarse. */
      r.style.overflowWrap = 'anywhere';
      for (fs = 12; fs >= 10.5; fs -= 0.5) { r.style.fontSize = fs + 'px'; if (cabe()) return; }
    })();
  }
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
          '<span class="giro-toca">' + mano + ' Toca para girar</span>' +
          '<span class="giro-releer">' + visto + ' Leída · toca para releer</span>' +
          '<span class="giro-pendiente"><i class="fas fa-book-open" aria-hidden="true"></i> Te falta leer · toca para seguir</span>' +
          '<span class="giro-sello" aria-hidden="true">' + visto + ' Leída</span>' +
          '<span class="giro-carga" aria-hidden="true"></span><span class="destello" aria-hidden="true"></span></span>' +
          '<span class="cara dorso"><span class="giro-rotulo">' + rot(it.label) + '</span><span class="giro-leido">' + visto + ' Leído · toca para releer</span>' +
          '<span class="giro-falta"><i class="fas fa-book-open" aria-hidden="true"></i> Te falta leer · toca para seguir</span><span class="destello" aria-hidden="true"></span></span>' +
          '</span></button>';
      }).join('') + '</div>' +
      /* Celular: las mismas tarjetas como lista que se desplaza; cada una lleva su texto completo, que se revela al pasar. */
      '<ol class="giro-lista desplazable" tabindex="0" aria-label="Tarjetas: desliza para leerlas">' +
      /* En celular, la ilustración de la escena encabeza la lista (en el iframe ancho va al lado de las tarjetas). */
      (datos.ilustraciones && ((escena.arte && escena.arte.img) || escena.ilustracion) ? '<li class="giro-lista-arte" aria-hidden="true"><img src="' + srcImagen((escena.arte && escena.arte.img) || escena.ilustracion) + '" alt=""></li>' : '') +
      b.items.map(function (it, i) {
        return '<li class="giro-paso' + refc(it.label) + '" data-id="' + k + '-' + i + '"><p class="giro-paso-cab"><span class="giro-n">' + (i + 1) + '</span>' +
          '<span class="giro-arte">' + svgObjeto(it.obj, 34) + '</span><span class="giro-rotulo">' + rot(it.label) + '</span><span class="giro-paso-visto">' + visto + '</span></p>' +
          '<div class="giro-paso-texto">' + rico(segs(it.segs)) + '</div><span class="giro-fin" aria-hidden="true"></span></li>';
      }).join('') + '<li class="giro-mas" aria-hidden="true"><i class="fas fa-chevron-down"></i></li></ol>';
  };
  B.giro.activar = function (b, k, el) {
    el.querySelectorAll('.giro').forEach(function (g) {
      g.addEventListener('click', function () {
        if (g.classList.contains('volteando')) return;
        var it = b.items[Number(g.dataset.i)], porCursor = g._porCursor;
        g._porCursor = false;
        voltear(g, function () {
          var h = aLaEsquina(g);
          leer(it.label, segs(it.segs), it.obj, g, h); marcar(g.dataset.id);
          /* Al cerrar, la tarjeta da la vuelta de regreso y muestra otra vez su cara (icono, rótulo, extracto) con su estado:
             leída, en otro color y con su sello; a medias, «Te falta leer» (Esteban, 31/10/2026: «que después de leído quede de
             otro color pero con la información que tiene cuando no está volteada… y los identificativos de lectura claros»). */
          if (!h) alCerrarLector = function () { g.classList.remove('girada'); g._calma = performance.now() + 1500; };
          if (porCursor) vigilarCursor(g);
        });
      });
    });
    giroConCursor(el);
    giroAlDesplazar(el);
    var gs = el.querySelector('.giros');
    if (gs) setTimeout(function () { gs.classList.add('ya-entraron'); }, 1300);
  };
  /* El giro, protagonista (Esteban, 30/10/2026: «al pasar el cursor no se ve la animación de la tarjeta al voltearse… que sea épico,
     premium»): la tarjeta sale hacia el frente y gira en 3D con perspectiva, creciendo a mitad de la vuelta; la cruza un destello y
     saltan chispas con los colores del curso. Solo al terminar la vuelta pasa a la esquina y sale la hoja. Una tarjeta ya girada
     abre su hoja de una vez; con «reducir movimiento», todo directo. */
  function voltear(g, listo) {
    var int = g.querySelector('.giro-int');
    if (g.classList.contains('girada') || quieto || !int || !int.animate) { g.classList.add('girada'); listo(); return; }
    g.classList.add('volteando', 'girada');
    var a = int.animate([
      { transform: 'translateZ(0) rotateY(0deg) scale(1)' },
      { transform: 'translateZ(50px) rotateY(-16deg) scale(1.06)', offset: 0.14 },
      { transform: 'translateZ(110px) rotateY(96deg) scale(1.16)', offset: 0.56 },
      { transform: 'translateZ(30px) rotateY(194deg) scale(1.04)', offset: 0.86 },
      { transform: 'translateZ(0) rotateY(180deg) scale(1)' }
    ], { duration: 680, easing: 'cubic-bezier(.45,.05,.25,1)' });
    chispas(g);
    var hecho = false;
    a.onfinish = a.oncancel = function () { if (hecho) return; hecho = true; g.classList.remove('volteando'); listo(); };
  }
  /* Chispas desde el centro de `g` o, con `o`, desde el punto {x, y} de la pantalla (n, distancia d y retraso en ms). */
  function chispas(g, o) {
    o = o || {};
    var r = g.getBoundingClientRect(), base = raiz.getBoundingClientRect(), n = o.n || 16;
    var cx = (o.x != null ? o.x : r.left + r.width / 2) - base.left, cy = (o.y != null ? o.y : r.top + r.height / 2) - base.top;
    var colores = ['var(--coral)', 'var(--niebla)', 'var(--marino)', 'var(--crema)', 'var(--teal)'];
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span'), ang = (i / n) * Math.PI * 2 + (i % 2) * 0.2, d = (o.d || 70) + (i % 4) * (o.d ? o.d * 0.4 : 28);
      s.className = 'chispa'; s.setAttribute('aria-hidden', 'true');
      s.style.left = cx + 'px'; s.style.top = cy + 'px';
      s.style.background = colores[i % colores.length];
      raiz.appendChild(s);
      var fin = 'translate(calc(-50% + ' + (Math.cos(ang) * d).toFixed(1) + 'px),calc(-50% + ' + (Math.sin(ang) * d * 0.85).toFixed(1) + 'px))';
      s.animate([{ transform: 'translate(-50%,-50%) scale(0)', opacity: 1 }, { transform: fin + ' scale(1)', opacity: 1, offset: 0.55 },
        { transform: fin + ' scale(.3)', opacity: 0 }], { duration: 640, delay: o.retraso != null ? o.retraso : 260, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'both' })
        .onfinish = (function (x) { return function () { x.remove(); }; })(s);
    }
  }
  /* La tarjeta que se abre gira, pasa a la primera posición (la esquina izquierda) y las demás se apartan; a su lado sale la
     hoja con su texto, que no tapa el giro (Esteban, 30/10/2026: «que la tarjeta gira y se posicione de primera… hacia la
     esquina… y que el cajón de información… como un cuadernito, una hoja de esas antiguas»). Al cerrar, todo vuelve a su sitio.
     Sin espacio para la hoja (una sola tarjeta muy ancha), la ventana va al centro, como antes. */
  function aLaEsquina(g) {
    if (alCerrarLector) { var f = alCerrarLector; alCerrarLector = null; f(); }   // la tarjeta anterior vuelve a su sitio
    var giros = g.closest('.giros'), esc = raiz.querySelector('.escenario');
    if (!giros || !esc || !g.offsetParent) return null;
    var G = giros.getBoundingClientRect(), r = g.getBoundingClientRect(), E = esc.getBoundingClientRect();
    var izq = G.left - E.left + r.width + 18;
    if (E.width - izq < 420) return null;
    /* Posición en la rejilla (offsetLeft/Top no cambian con la animación): al reabrir, la tarjeta puede estar aún volviendo. */
    var primera = giros.querySelector('.giro');
    g.style.setProperty('--dx', (primera.offsetLeft - g.offsetLeft) + 'px');
    g.style.setProperty('--dy', (primera.offsetTop - g.offsetTop) + 'px');
    giros.classList.add('con-hoja'); g.classList.add('al-frente');
    /* Al cerrar, la tarjeta vuelve a su lugar; si el cursor quedó ahí, no se reabre sola: hay que salir y volver a entrar. */
    alCerrarLector = function () { giros.classList.remove('con-hoja'); g.classList.remove('al-frente', 'girada'); g._calma = performance.now() + 1500; };
    return { izq: Math.round(izq) };
  }
  /* Con ratón (Esteban, 30/10/2026: «que ese modal salga cuando le pase el cursor por encima… en todas las partes donde tenga
     esta mediación»): posar el cursor un momento sobre una tarjeta la gira y abre su ventana, como el clic. La ventana abierta así
     se cierra sola cuando el cursor sale de ella y de su tarjeta, salvo que se use: un clic dentro («Seguir leyendo») la deja fija.
     Tocar y el teclado, como antes; con datos.completar, el visto sigue llegando al leer la última parte. */
  function giroConCursor(el) {
    if (!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches)) return;
    var espera = null;
    el.querySelectorAll('.giro').forEach(function (g) {
      g.addEventListener('pointerenter', function (e) {
        if (e.pointerType !== 'mouse' || !raiz.querySelector('.lector').hidden || el.querySelector('.volteando')) return;
        clearTimeout(espera);
        g.classList.add('por-abrir');   // una barra se llena: la tarjeta está por abrirse
        espera = setTimeout(function () {
          g.classList.remove('por-abrir');
          if (!g.isConnected || !g.offsetParent || !g.matches(':hover') || !raiz.querySelector('.lector').hidden || el.querySelector('.volteando') || performance.now() < (g._calma || 0)) return;
          turno++;   // un «turno» propio: el visto diferido de esta lectura no se cuelga de la anterior
          g._porCursor = true;
          g.click();
        }, 400);
      });
      g.addEventListener('pointerleave', function () { clearTimeout(espera); g.classList.remove('por-abrir'); });
    });
  }
  function vigilarCursor(g) {
    var l = raiz.querySelector('.lector'), caja = l.querySelector('.lector-caja'), reloj = null;
    if (!caja) return;
    function dentro(r, e) { return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; }
    function fin() { clearTimeout(reloj); document.removeEventListener('pointermove', mover, true); caja.removeEventListener('pointerdown', fin, true); }
    function mover(e) {
      if (l.hidden || !caja.isConnected) { fin(); return; }
      if (dentro(caja.getBoundingClientRect(), e) || dentro(g.getBoundingClientRect(), e)) { clearTimeout(reloj); reloj = null; return; }
      if (!reloj) reloj = setTimeout(function () { fin(); if (!l.hidden && caja.isConnected) cerrarLector(); }, 450);
    }
    document.addEventListener('pointermove', mover, true);
    caja.addEventListener('pointerdown', fin, true);
  }
  /* Celular (Esteban, 30/10/2026: «que cuando esté haciendo scroll estas se vayan revelando a medida que va haciendo scroll, así
     ya va haciendo el scroll y leyendo a la vez»): en pantalla angosta las tarjetas son una lista que se desplaza; cada una se
     revela con su texto completo al entrar en pantalla y queda vista cuando su final pasa por la pantalla (leer el 100 %). Es la
     única excepción, pedida por Esteban, a la regla de no desplazar dentro de la escena. */
  function giroAlDesplazar(el) {
    var lista = el.querySelector('.giro-lista');
    if (!lista) return;
    if (!('IntersectionObserver' in window)) { lista.classList.add('sin-observador'); return; }
    var revela = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('revelada'); });
    }, { root: lista, threshold: 0.15 });
    var lee = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var p = e.target.closest('.giro-paso'); if (e.isIntersecting && p && lista.offsetParent) marcar(p.dataset.id); });
    }, { root: lista, threshold: 1, rootMargin: '0px 0px 8px 0px' });   // el final de 1 px justo en el borde también cuenta
    lista.querySelectorAll('.giro-paso').forEach(function (p) { revela.observe(p); lee.observe(p.querySelector('.giro-fin')); });
    /* La flecha «hay más» solo hasta el primer desplazamiento: después taparía el texto que se va leyendo. */
    function final() {
      lista.classList.toggle('al-final', lista.scrollTop + lista.clientHeight >= lista.scrollHeight - 6);
      if (lista.scrollTop > 8) lista.classList.add('desplazada');
      /* Al llegar al final de la lista, la última tarjeta queda vista: su final ya pasó (QA del 31/10: quedaba 3 / 4 cuando el
         final de la última se detenía en el borde). */
      var pasos = lista.querySelectorAll('.giro-paso'), u = pasos[pasos.length - 1];
      if (lista.classList.contains('al-final') && lista.classList.contains('desplazada') && u && lista.offsetParent) marcar(u.dataset.id);
    }
    lista.addEventListener('scroll', final, { passive: true });
    final();
  }

  B.fichas = function (b, k) {
    return '<div class="fichas" role="tablist">' + b.items.map(function (it, i) {
      return '<button type="button" role="tab" class="ficha' + refc(it.label) + '" data-id="' + k + '-' + i + '" data-i="' + i + '" aria-selected="false" style="--d:' + (i * 0.07) + 's"><span class="ficha-n">' + (i + 1) + '</span>' +
        '<span class="ficha-arte" aria-hidden="true">' + svgObjeto(it.obj, 30) + '</span>' + rot(it.label) + '<span class="ficha-visto">' + visto + '</span>' +
        '<span class="ficha-estado ficha-por-leer">Por leer</span><span class="ficha-estado ficha-falta"><i class="fas fa-book-open" aria-hidden="true"></i> Te falta leer</span>' +
        '<span class="ficha-estado ficha-leida"><i class="fas fa-circle-check" aria-hidden="true"></i> Leída</span></button>';
    }).join('') + '</div><div class="panel-fichas' + (conFigura(escena) ? ' con-figura' : '') + '" role="tabpanel" tabindex="-1">' +
      (conFigura(escena) && IMAGEN[actual] ? figura([]) : '<span class="panel-arte"></span>') +
      '<div class="panel-texto"><p class="panel-vacio">' + mano + ' Elige una ficha para leer su contenido.</p></div></div>';
  };
  B.fichas.activar = function (b, k, el) {
    var panel = el.querySelector('.panel-fichas'), reajuste = null, primera = true;
    window.addEventListener('resize', function () { if (reajuste) reajuste(); });
    el.querySelectorAll('.ficha').forEach(function (f) {
      f.addEventListener('click', function () {
        if (panel.classList.contains('volteando')) return;
        /* Giro premium (Esteban, 31/10/2026: «aquí también dame un giro premium»): la ficha se hunde y rebota con chispas; el
           panel gira en 3D como una página (se va la ficha anterior, entra la nueva con un leve rebote y un destello) y después
           empieza a escribirse. La primera, al cargar, sin vuelta; con «reducir movimiento», directo. */
        if (quieto || primera || !panel.animate) { primera = false; mostrar(f, true); return; }
        panel.classList.add('volteando');
        /* En el marco ancho la ficha elegida se monta un poco sobre el panel (base.css). El panel conserva su giro de golpe (se va
           la ficha anterior y entra la nueva con un rebote) y, en el golpe, choca contra la ficha montada, que lo detiene: la
           ficha acusa el golpe y saltan chispas en el punto de contacto (Esteban, 31/10/2026: «que parezca que cuando voltea y
           llega, la ficha de la sección es la que lo detiene… pero conserva el giro de golpe»). En pantalla angosta, sin choque. */
        var montada = getComputedStyle(panel.parentNode).display === 'grid';
        el.querySelectorAll('.ficha').forEach(function (o) { o.setAttribute('aria-selected', String(o === f)); });
        f.animate([{ transform: 'scale(1)' }, { transform: 'scale(.94)' }, { transform: 'scale(1.03)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' });
        if (!montada) chispas(f);
        var ida = panel.animate([{ transform: 'perspective(1100px) rotateY(0deg)', opacity: 1 }, { transform: 'perspective(1100px) rotateY(88deg) scale(.96)', opacity: 0.55 }],
          { duration: 230, easing: 'cubic-bezier(.5,0,.8,.4)', fill: 'forwards' });
        ida.onfinish = function () {
          mostrar(f, false);
          ida.cancel();
          var brillo = document.createElement('span');
          brillo.className = 'panel-destello'; brillo.setAttribute('aria-hidden', 'true'); panel.appendChild(brillo);
          brillo.animate([{ opacity: 0, backgroundPosition: '120% 0' }, { opacity: 1, offset: 0.3 }, { opacity: 0, backgroundPosition: '-60% 0' }], { duration: 640, easing: 'ease-out' });
          var dur = 430, vuelta = panel.animate([{ transform: 'perspective(1100px) rotateY(-88deg) scale(.96)', opacity: 0.55 },
            { transform: 'perspective(1100px) rotateY(7deg) scale(1.01)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }],
            { duration: dur, easing: 'cubic-bezier(.2,.9,.3,1)' });
          if (montada) {
            /* Con esta curva el borde del panel alcanza la ficha a un quinto de la vuelta (medido: 80 ms de 430): ahí es el golpe. */
            var golpe = dur * 0.2, r = f.getBoundingClientRect();
            f.animate([{ transform: 'none' }, { transform: 'translateX(6px) rotate(-1.4deg) scale(1.04)', offset: 0.28 }, { transform: 'translateX(-2px) rotate(.4deg)', offset: 0.62 }, { transform: 'none' }],
              { duration: 360, delay: golpe, easing: 'ease-out' });
            chispas(f, { x: r.right - 3, y: r.top + r.height / 2, n: 12, d: 34, retraso: golpe });   // en el borde de la ficha, donde llega el panel
          }
          vuelta.onfinish = vuelta.oncancel = function () { panel.classList.remove('volteando'); setTimeout(function () { brillo.remove(); }, 300); };
        };
      });
    });
    function mostrar(f, animar) {
      var i = Number(f.dataset.i), it = b.items[i];
      el.querySelectorAll('.ficha').forEach(function (o) { o.setAttribute('aria-selected', String(o === f)); });
      f.classList.add('abierta');   // abierta y sin leer completa: «Te falta leer» (base.css)
      var arte = panel.querySelector('.panel-arte'), grande = panel.classList.contains('con-figura');
      if (arte) arte.innerHTML = svgObjeto(it.obj, grande ? 150 : 92);
      panel.querySelector('.panel-texto').innerHTML = '<p class="lectura-eyebrow">' + (i + 1) + ' de ' + b.items.length + ' · ' + esc(may(it.label)) + '</p><p class="lectura-texto">' + rico(segs(it.segs)) + '</p>';
      /* El texto no aparece de golpe: se escribe letra por letra, como en la hoja del giro (Esteban, 31/10/2026). Las letras se
         envuelven antes de medir y repartir la lectura, para que nada cambie de lugar al escribirse. */
      var lt = panel.querySelector('.panel-texto .lectura-texto'), letras = quieto ? null : envolverLetras(lt);
      marcar(f.dataset.id);
      var pt = panel.querySelector('.panel-texto'), ajustar = grande ? function () { encajarTexto(panel, pt); } : null;
      reajuste = ajustar;
      if (!dosificar(pt, ajustar) && ajustar) ajustar();
      if (animar) reanimar(panel);
      if (letras) escribirLetras(lt, letras, function () {});
    }
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
      el.querySelectorAll('.paso').forEach(function (o, j) { o.setAttribute('aria-current', String(j === i)); o.classList.toggle('pasado', j < i); if (linea && j === i + 1 && !datos.completar) o.disabled = false; });
      var pct = n === 1 ? 50 : 100 * i / (n - 1);
      ficha.style.left = pct + '%'; traza.style.width = pct + '%';
      var it = b.items[i];
      caja.innerHTML = '<div class="ruta-texto"><p class="lectura-eyebrow">' + (linea ? 'Momento ' : 'Paso ') + (i + 1) + ' de ' + n + ' · ' + esc(may(it.label)) + '</p><p class="lectura-texto">' + rico(segs(it.segs)) + '</p></div>' +
        '<span class="ruta-arte">' + svgObjeto(it.obj, 150) + '</span>';
      if (!dosificar(caja.querySelector('.ruta-texto'), function () { crecerLectura(caja); })) crecerLectura(caja);
      reanimar(caja);
      sig.disabled = i >= n - 1;
      marcar(k + '-' + i);
      if (datos.completar) { if (faltaLeer(caja)) candado(sig, !sig.disabled); else listo(); }
    }
    /* Paso leído completo: se quita el candado y, en la historia, se abre el momento siguiente. */
    function listo() {
      candado(sig, false);
      var o = linea && el.querySelectorAll('.paso')[pos + 1];
      if (o) o.disabled = false;
    }
    caja.addEventListener('lectura-completa', listo);
    el.querySelectorAll('.paso').forEach(function (p) { p.addEventListener('click', function () { ir(Number(p.dataset.i)); }); });
    sig.addEventListener('click', function () {
      var L = faltaLeer(caja);
      if (L) { avisar(raiz.querySelector('.escenario'), textoFalta(L, linea ? 'este momento' : 'este paso'), L.sig); return; }
      ir(Math.min(n - 1, pos + 1));
    });
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
        var t = segs(it.segs).replace(/\n/g, ' ').replace(/\[\^\d+\]/g, ''), lim = amplio ? 230 : 100;
        /* La descripción no empieza con su propio término («• Duplicación de términos: Los plazos…» regalaba la respuesta;
           pulido del 29/10/2026): antes de acertar se ve desde los dos puntos; al acertar, el texto completo con el término. */
        var pre = t.match(/^[\s•\-–]*(?:\(?[ivx\d]+[.)]\s*)?([^:.;]{3,60}):\s+/i);
        if (pre && it.label && pre[1].trim().toLowerCase() === String(it.label).trim().toLowerCase()) t = may(t.slice(pre[0].length));
        var corto = t.length > lim + 5 ? t.slice(0, lim).replace(/\s+\S*$/, '') + '…' : t;
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
  /* Tabla breve (Esteban, 28/10/2026, sobre los nueve artículos de U1-L3-E22: «siento que hay demasiado de artículos»): con
     datos.sinHuecos, si cada fila es una sola celda y todo junto cabe a la vista (de 2 a 12 filas y 640 caracteres), la tabla se
     muestra completa, con su encabezado, en vez de una pestaña por fila con un panel casi vacío. Nada que abrir de a una: no
     cuenta en la exploración. Desde 2 filas (Esteban, 28/10/2026, sobre U1-L1-E04, «Respetar» y «Garantizar»: «ese espacio
     debajo… tiene que ser rellenado acorde con lo del contenido»); debajo entra la ilustración de relleno del tema. */
  function celdaTexto(c) { return c === null || c === undefined ? '' : typeof c === 'number' ? seg(c) : c; }
  function tablaBreve(b) {
    if (!datos.sinHuecos || !b || b.tipo !== 'tabla' || b.items.length < 2 || b.items.length > 12) return false;
    if (!b.items.every(function (it) { return it.filas.length === 1 && it.filas[0].length === 1; })) return false;
    return b.items.reduce(function (a, it) { return a + String(it.label).length + celdaTexto(it.filas[0][0][1]).length; }, 0) <= 640;
  }
  function tablaCompleta(b, k) {
    var encs = b.items.map(function (it) { return celdaTexto(it.filas[0][0][0]); }), comun = encs.every(function (e) { return e === encs[0]; }) ? encs[0] : '';
    var primera = b.titulo && b.titulo.length ? segs(b.titulo) : '';
    return '<div class="tabla-breve-caja"><table class="tabla-breve">' +
      (primera || comun ? '<thead><tr><th scope="col">' + esc(may(primera)) + '</th><th scope="col">' + esc(may(comun)) + '</th></tr></thead>' : '') +
      '<tbody>' + b.items.map(function (it, i) {
        return '<tr style="--d:' + (i * 0.05) + 's"><th scope="row">' + rot(it.label) + '</th><td>' + (comun ? '' : '<b class="tabla-enc">' + esc(may(encs[i])) + '</b> ') +
          '<span class="lectura-texto">' + rico(celdaTexto(it.filas[0][0][1]) || '–') + '</span></td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  function encajarTablaBreve(el) {
    var c = el.querySelector('.tabla-breve-caja');
    if (!c) return;
    quitarRelleno(c);
    for (var fs = 21; fs >= 12; fs -= 0.5) { c.style.setProperty('--fs', fs + 'px'); if (c.scrollHeight <= c.clientHeight + 1) break; }
    rellenar(c);
  }
  B.tabla = function (b, k) {
    if (tablaBreve(b)) return tablaCompleta(b, k);
    return tituloBloque(b, k) + '<div class="fichas tabla-pestanas" role="tablist">' + b.items.map(function (it, i) {
      return '<button type="button" role="tab" class="ficha' + refc(it.label) + '" data-id="' + k + '-' + i + '" data-i="' + i + '" aria-selected="false" style="--d:' + (i * 0.07) + 's"><span class="ficha-n">' + (i + 1) + '</span>' + rot(it.label) + '<span class="ficha-visto">' + visto + '</span></button>';
    }).join('') + '</div><div class="panel-fichas panel-tabla" role="tabpanel" tabindex="-1"><div class="panel-texto"></div></div>';
  };
  /* La fila en grande (19 px) baja de a medio punto hasta caber en el panel; si a 14,5 px aún no cabe, la figura cede su
     sitio (Estándares interamericanos: pestañas con rótulos largos dejan menos alto). Nunca desplazamiento. */
  function encajarTabla(panel) {
    var f = panel.querySelector('.tabla-ficha');
    if (!f) return;
    f.classList.remove('sin-figura');
    function encajar() {
      for (var fs = topeLetra(19); fs >= 12; fs -= 0.5) {
        f.style.setProperty('--fs', fs + 'px');
        if (entra(panel)) return;
        if (fs <= 14.5 && !f.classList.contains('sin-figura')) { f.classList.add('sin-figura'); fs = 17.5; }
      }
    }
    encajar();
    /* La ilustración apilada a la que la letra grande deja menos de 100 px sale (diminuta parece un error) y la letra vuelve
       a encajar sin ella. */
    var fig = f.classList.contains('apilada') && !f.classList.contains('sin-figura') && f.querySelector('.relleno-arte');
    if (fig && fig.getBoundingClientRect().height < 100) { f.classList.add('sin-figura'); encajar(); }
  }
  /* Fila de varios campos (datos.sinHuecos): la letra crece hasta 17 px y baja hasta caber en el panel; nunca desplazamiento. */
  function encajarFilas(panel) {
    var l = panel.querySelector('.tabla-filas');
    if (!datos.sinHuecos || !l) return;
    for (var fs = 17; fs >= 11.5; fs -= 0.5) { l.style.setProperty('--fs', fs + 'px'); if (entra(panel)) return; }
  }
  B.tabla.activar = function (b, k, el) {
    if (tablaBreve(b)) {
      encajarTablaBreve(el);
      if (document.fonts) document.fonts.ready.then(function () { encajarTablaBreve(el); });
      window.addEventListener('resize', function () { encajarTablaBreve(el); });
      return;
    }
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
        /* Con datos.sinHuecos, la figura es la ilustración de relleno de la escena, del tema del texto (Esteban, 28/10/2026:
           «tener algo relacionado al tema»), en vez del objeto genérico. */
        var conImg = datos.sinHuecos && datos.ilustraciones && escena.relleno;
        /* Tabla comparativa con una fila por pestaña (Bienes 1.3): sus celdas en grande junto al objeto, sin franja vacía. Con la
           ilustración de relleno, también la fila sin objeto. */
        var ficha = it.filas.length === 1 && (it.obj || conImg);
        quitarRelleno(panel);
        /* Apilada: la celda arriba, con letra grande, y la ilustración del tema llenando el resto del panel (sin franjas vacías
           arriba y abajo de una celda breve centrada). */
        if (ficha) lista = conImg ? '<div class="tabla-ficha apilada">' + lista + '<figure class="relleno-arte" aria-hidden="true"><img src="' + srcImagen(escena.relleno) + '" alt=""></figure></div>'
          : '<div class="tabla-ficha"><figure aria-hidden="true">' + svgObjeto(it.obj, 170) + '</figure>' + lista + '</div>';
        var texto = panel.querySelector('.panel-texto');
        texto.classList.toggle('con-ficha', !!ficha);
        texto.innerHTML = '<p class="lectura-eyebrow">' + (i + 1) + ' de ' + b.items.length + ' · ' + esc(may(it.label)) + '</p>' + lista;
        if (ficha) encajarTabla(panel); else { encajarFilas(panel); rellenar(panel); }   // varias filas breves: el tema debajo
        /* Una fila que ni con la letra más pequeña cabe en el panel (U3-L1 de Delitos: cuatro columnas de texto largo) reparte sus
           celdas en partes con «Seguir leyendo», sin la ilustración: nunca letra cortada ni desplazamiento. */
        var li = panel.querySelector('.tabla-filas li');
        if (li && li.children.length > 1 && !entra(panel)) {
          var tf = panel.querySelector('.tabla-ficha');
          if (tf) tf.classList.add('sin-figura');
          quitarRelleno(panel);
          partirBloques(li, panel);
        }
        reanimar(panel); marcar(f.dataset.id);
      });
    });
    el.querySelector('.ficha').click();
  };

  /* Matriz en un eje (Juan, reunión del 30/10/2026, sobre la matriz comparativa de SRPA: «te coloque la categoría como un eje
     y te dé un pop-up… para comparar las dos dimensiones»): las categorías de la primera columna son nodos de un eje vertical
     (en dos columnas si son más de seis) y, al lado, las dos dimensiones que se comparan. Cada nodo abre una ventana con las
     dos columnas lado a lado, con su encabezado; marca visto. Las filas usan el formato de la tabla (filas: [[enc, valor], …]).
     Sin categorías (tabla de dos columnas), el rótulo del nodo es el comienzo literal de la primera celda. */
  B.eje = function (b, k) {
    var dims = (b.dims || []).map(function (d) { return celdaTexto(d); }), esquina = b.titulo && b.titulo.length ? segs(b.titulo) : '';
    var dos = b.items.length > 6;
    return '<div class="eje' + (dos ? ' dos-col' : '') + '"><div class="eje-cuerpo">' + (esquina ? '<p class="eje-esquina"><i class="fas fa-arrows-up-down" aria-hidden="true"></i>' + esc(may(esquina)) + '</p>' : '') +
      '<ol class="eje-lista n' + b.items.length + '">' + b.items.map(function (it, i) {
        return '<li style="--d:' + (i * 0.05) + 's"><button type="button" class="eje-nodo' + refc(it.label) + '" data-id="' + k + '-' + i + '" data-i="' + i + '">' +
          '<span class="eje-punto" aria-hidden="true">' + (i + 1) + '</span><span class="eje-rotulo">' + rot(it.label) + '</span>' +
          '<span class="eje-marca">' + mano + visto + '</span>' + estado + '</button></li>';
      }).join('') + '</ol></div>' +
      '<div class="eje-dims" aria-hidden="true">' + dims.map(function (d, j) {
        return (j ? '<span class="eje-vs">frente a</span>' : '') + '<p class="eje-dim d' + (j + 1) + '"><span class="eje-dim-arte">' + svgObjeto(j ? 'escudo' : 'documento', 54) + '</span><span>' + esc(may(d)) + '</span></p>';
      }).join('') + '<p class="eje-toca">' + mano + ' Elige una categoría</p></div></div>';
  };
  function leerComparado(titulo, columnas, desde) {
    var l = raiz.querySelector('.lector');
    retornoFoco = desde || null;
    l.innerHTML = '<div class="lector-caja lector-eje" role="dialog" aria-modal="true" aria-label="' + esc(may(titulo)) + '" tabindex="-1">' +
      '<button type="button" class="cerrar" aria-label="Cerrar comparación">Cerrar ×</button><p class="lectura-eyebrow">' + esc(may(titulo)) + '</p>' +
      '<div class="eje-comparado">' + columnas.map(function (c, j) {
        return '<div class="eje-col d' + (j + 1) + '">' + (c[0] ? '<p class="eje-col-cab">' + esc(may(c[0])) + '</p>' : '') + '<p class="lectura-texto">' + rico(c[1] || '–') + '</p></div>';
      }).join('') + '</div></div>';
    l.hidden = false;
    var caja = l.firstChild, textos = caja.querySelectorAll('.lectura-texto');
    /* La letra crece hasta 22 px si el texto es breve y baja de a medio punto (hasta 12 px) hasta caber: nunca desplazamiento. */
    for (var fs = topeLetra(22); fs >= 12; fs -= 0.5) {
      textos.forEach(function (t) { t.style.fontSize = fs + 'px'; });
      if (caja.scrollHeight <= caja.clientHeight + 1) break;
    }
    reanimar(caja);
    if (desde && desde.classList) desde.classList.add('abierta');
    var cmp = caja.querySelector('.eje-comparado'), letras = quieto ? null : envolverLetras(cmp);
    if (letras) escribirVentana(cmp, letras, false);
    l.querySelector('.cerrar').onclick = cerrarLector;
    caja.focus({ preventScroll: true });
  }
  B.eje.activar = function (b, k, el) {
    el.querySelectorAll('.eje-nodo').forEach(function (n) {
      n.addEventListener('click', function () {
        var i = Number(n.dataset.i), it = b.items[i], fila = it.filas[0] || [];
        var cols = fila.map(function (par) { return [celdaTexto(par[0]), celdaTexto(par[1])]; });
        leerComparado((i + 1) + ' de ' + b.items.length + ' · ' + it.label, cols, n);
        marcar(n.dataset.id);
      });
    });
  };

  /* ---------- Mediaciones para variar (Juan, 27/10/2026: «varíe con mapas conceptuales, mapa mental, acordeones, grids,
     una imagen de fondo con hotspots») ----------
     Rejilla que llena el marco, acordeón, puntos sobre la ilustración aprobada, mapa mental y mapa conceptual jerárquico.
     Salvo el acordeón, que despliega el texto en su sitio, todas lo abren completo en el lector y marcan visto. */
  function centroTitulo() { return String(escena.titulo_genially || datos.heading || '').replace(/\s*\(\d+ de \d+\)$/, ''); }
  function abreLector(el, b) {
    el.querySelectorAll('button[data-i]').forEach(function (c) {
      c.addEventListener('click', function () {
        /* El botón se hunde y rebota, y saltan chispas, mientras la ventana nace de él (Esteban, 31/10/2026: apertura premium). */
        if (!quieto && c.animate) { c.animate([{ scale: '1' }, { scale: '.95' }, { scale: '1.03' }, { scale: '1' }], { duration: 380, easing: 'ease-out' }); chispas(c, { n: 10, d: 44, retraso: 60 }); }
        var it = b.items[Number(c.dataset.i)]; leer(it.label, segs(it.segs), it.obj, c); marcar(c.dataset.id);
      });
    });
  }

  /* Rejilla en collage (Esteban, 27/10/2026: «unos recuadros… con una imagen… al tocarlos se abre un modal con el texto…
     como un collage»): ventanas de distinto tamaño que llenan el marco, cada una con su rótulo arriba y, debajo, una
     ilustración aprobada distinta («ilus», la elige el generador); el texto nunca va sobre la imagen. Al tocarla, el texto
     completo se abre en el lector. Sin «ilus» (otros cursos) se dibuja su objeto. */
  B.rejilla = function (b, k) {
    return tituloBloque(b, k) + '<div class="rejilla n' + b.items.length + '">' + b.items.map(function (it, i) {
      return '<button type="button" class="celda' + refc(it.label) + '" data-id="' + k + '-' + i + '" data-i="' + i + '" style="--d:' + (i * 0.07) + 's">' +
        '<span class="celda-cab"><span class="celda-n">' + (i + 1) + '</span><span class="celda-rotulo">' + rot(it.label) + '</span>' +
        '<span class="celda-marca">' + mano + visto + '</span></span>' +
        (it.ilus ? '<span class="celda-foto"><img src="' + srcImagen(it.ilus) + '" alt=""></span>' : '<span class="celda-foto sin-foto">' + svgObjeto(it.obj, 96) + '</span>') + '</button>';
    }).join('') + '</div>';
  };
  B.rejilla.activar = function (b, k, el) { abreLector(el, b); };

  B.acordeon = function (b, k) {
    return tituloBloque(b, k) + '<div class="acordeon">' + b.items.map(function (it, i) {
      return '<div class="acordeon-item" style="--d:' + (i * 0.06) + 's"><button type="button" class="acordeon-cab' + refc(it.label) + '" data-id="' + k + '-' + i + '" data-n="' + i + '" aria-expanded="false">' +
        '<span class="acordeon-num">' + (i + 1) + '</span><span class="acordeon-ico">' + svgObjeto(it.obj, 28) + '</span><span class="acordeon-rotulo">' + rot(it.label) + '</span>' +
        '<span class="acordeon-visto">' + visto + '</span><i class="fas fa-chevron-down acordeon-flecha" aria-hidden="true"></i></button>' +
        '<div class="acordeon-panel" hidden><p class="lectura-texto">' + rico(segs(it.segs)) + '</p></div></div>';
    }).join('') + '</div>';
  };
  /* El apartado abierto ocupa el espacio que dejan los demás; la letra crece si el texto es breve (hasta 22 px) y se reduce hasta que cabe: nunca desplazamiento. */
  function encajarPanel(p) {
    quitarRelleno(p);
    for (var fs = topeLetra(22); fs >= 11.5; fs -= 0.5) { p.style.setProperty('--fs', fs + 'px'); if (entra(p)) break; }
    rellenar(p);
  }
  B.acordeon.activar = function (b, k, el) {
    var cabs = el.querySelectorAll('.acordeon-cab');
    function abrir(c) {
      cabs.forEach(function (o) {
        var si = o === c;
        if (!si) quitarRelleno(o.nextElementSibling);   // el que se cierra suelta su ilustración: con ella seguía a la vista
        o.setAttribute('aria-expanded', String(si)); o.nextElementSibling.hidden = !si; o.parentNode.classList.toggle('abierto', si);
      });
      var p = c.nextElementSibling;
      if (!dosificar(p, function () { encajarPanel(p); })) encajarPanel(p);
      reanimar(p); marcar(c.dataset.id);
    }
    cabs.forEach(function (c) { c.addEventListener('click', function () { abrir(c); }); });
    abrir(cabs[0]); /* la escena nunca empieza en blanco */
    window.addEventListener('resize', function () { var p = el.querySelector('.acordeon-panel:not([hidden])'); if (p) encajarPanel(p); });
  };

  /* Puntos sobre la ilustración aprobada de la escena: círculos numerados sobre los objetos (nunca en las cabezas) y, al
     lado, la leyenda con los rótulos, para que ningún texto tape a los personajes. Las posiciones vienen en
     datos.anclas[imagen] = {r: ancho/alto, p: [[x %, y %], …]}; el lienzo toma la proporción de la imagen para que cada
     punto quede sobre su objeto con cualquier tamaño de iframe. Círculo y rótulo abren el mismo texto; con teclado se
     recorre la leyenda. */
  B.puntos = function (b, k) {
    var img = escena.ilustracion, a = (datos.anclas && datos.anclas[img]) || { r: 1.5, p: [] }, n = b.items.length, circulos = '', leyenda = '';
    b.items.forEach(function (it, i) {
      var p = a.p[i] || [12 + 76 * i / Math.max(1, n - 1), 90], id = k + '-' + i;
      circulos += '<button type="button" class="hotspot" data-id="' + id + '" data-i="' + i + '" tabindex="-1" aria-hidden="true" style="left:' + p[0] + '%;top:' + p[1] + '%;--d:' + (0.25 + i * 0.12) + 's">' +
        '<span class="hotspot-n">' + (i + 1) + '</span></button>';
      leyenda += '<li><button type="button" class="punto-leyenda' + refc(it.label) + '" data-id="' + id + '" data-i="' + i + '" style="--d:' + (0.2 + i * 0.08) + 's">' +
        '<span class="hotspot-n">' + (i + 1) + '</span><span class="leyenda-rotulo">' + rot(it.label) + '</span><span class="hotspot-visto">' + visto + '</span>' + estado + '</button></li>';
    });
    return tituloBloque(b, k) + '<div class="puntos-escena"><div class="puntos-marco"><div class="puntos-lienzo" data-r="' + a.r + '"><img src="' + srcImagen(img) + '" alt="">' +
      circulos + '</div></div><ol class="puntos-leyenda">' + leyenda + '</ol></div>';
  };
  function ajustarLienzo(el) {
    var c = el.querySelector('.puntos-marco'), l = el.querySelector('.puntos-lienzo');
    if (!c || !l || !c.clientWidth || !c.clientHeight) return;
    var r = Number(l.dataset.r) || 1.5, w = Math.min(c.clientWidth - 8, (c.clientHeight - 8) * r);
    l.style.width = w + 'px'; l.style.height = (w / r) + 'px';
  }
  B.puntos.activar = function (b, k, el) {
    ajustarLienzo(el);
    if (window.ResizeObserver) new ResizeObserver(function () { ajustarLienzo(el); }).observe(el.querySelector('.puntos-marco'));
    else window.addEventListener('resize', function () { ajustarLienzo(el); });
    abreLector(el, b);
  };

  /* Mapa mental: la idea central (título de la escena) y sus ramas a izquierda y derecha, con trazos curvos. */
  B.mental = function (b, k) {
    /* Con 2–3 ramas cada una muestra además el comienzo de su texto, para que el mapa no quede vacío. */
    var n = b.items.length, izq = Math.ceil(n / 2), lineas = '', nodos = '', conTexto = n <= 3;
    b.items.forEach(function (it, i) {
      var der = i >= izq, fila = der ? i - izq : i, filas = der ? n - izq : izq;
      var y = filas === 1 ? 50 : conTexto ? 25 + 50 * fila / (filas - 1) : 13 + 74 * fila / (filas - 1), x = der ? 82 : 18, borde = der ? 66 : 34;
      lineas += '<path d="M50 50 C ' + (der ? 60 : 40) + ' 50, ' + (der ? 60 : 40) + ' ' + y.toFixed(1) + ', ' + borde + ' ' + y.toFixed(1) + '" style="--d:' + (0.15 + i * 0.1) + 's"/>';
      nodos += '<button type="button" class="rama-mental' + (der ? ' der' : '') + refc(it.label) + '" data-id="' + k + '-' + i + '" data-i="' + i + '" style="left:' + x + '%;top:' + y.toFixed(1) + '%;--d:' + (0.3 + i * 0.1) + 's">' +
        '<span class="rama-arte">' + svgObjeto(it.obj, 40) + '</span><span class="rama-rotulo">' + rot(it.label) + '</span><span class="rama-marca">' + mano + visto + '</span>' +
        (conTexto ? '<span class="rama-extracto">' + esc(may(extracto(segs(it.segs), n <= 2 ? 330 : 130))) + '</span>' : '') + estado + '</button>';
    });
    return '<div class="mental n' + n + (conTexto ? ' con-extracto' : '') + '"><svg class="mental-lineas" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' + lineas + '</svg>' +
      '<div class="mental-centro">' + (arteEn('centro') ? '<img class="mental-arte" src="' + srcImagen(escena.arte.img) + '" alt="">' : '<i class="fas fa-lightbulb" aria-hidden="true"></i>') +
      (datos.tituloFuera ? '' : '<span>' + esc(may(centroTitulo())) + '</span>') + '</div>' + nodos + '</div>';
  };
  B.mental.activar = function (b, k, el) { abreLector(el, b); };

  /* Mapa conceptual jerárquico: el concepto de la escena arriba y, unidos por conectores, sus elementos debajo. Con
     datos.tituloFuera (Delitos informáticos; Esteban, 29/10/2026: el título de la escena «va en la plantilla de Genially… no
     mezcles más la información»), la raíz no repite ese título: es la ilustración aprobada de la escena, y el título queda en
     Genially, encima o al lado del HTML. */
  B.esquema = function (b, k) {
    var n = b.items.length, xs = b.items.map(function (_, i) { return (i + 0.5) * 100 / n; });
    var arte = !!(datos.tituloFuera && datos.ilustraciones && escena.ilustracion);
    /* Sin ilustración aprobada del tema (SRPA: solo cinco), la raíz es el objeto dibujado del tema («objeto_raiz»), no el
       título: el título ya está en la barra de Genially (Esteban, 29/10/2026: «no mezcles más la información»). */
    var objeto = !arte && datos.tituloFuera && escena.objeto_raiz, y = arte || objeto ? [31, 36, 41] : [21, 31, 40];
    var lineas = '<line x1="50" y1="' + y[0] + '" x2="50" y2="' + y[1] + '"/>' + (n > 1 ? '<line x1="' + xs[0] + '" y1="' + y[1] + '" x2="' + xs[n - 1] + '" y2="' + y[1] + '"/>' : '') +
      xs.map(function (x) { return '<line x1="' + x + '" y1="' + y[1] + '" x2="' + x + '" y2="' + y[2] + '"/>'; }).join('');
    var cabeza = arte ? '<div class="esquema-raiz con-arte" aria-hidden="true"><img src="' + srcImagen(escena.ilustracion) + '" alt=""></div>'
      : objeto ? '<div class="esquema-raiz con-arte con-objeto" aria-hidden="true">' + svgObjeto(escena.objeto_raiz, 120) + '</div>'
      : '<div class="esquema-raiz"><span>' + esc(may(centroTitulo())) + '</span></div>';
    return '<div class="esquema n' + n + '"><svg class="esquema-lineas" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' + lineas + '</svg>' +
      cabeza + '<div class="esquema-hijos">' + b.items.map(function (it, i) {
        return '<button type="button" class="nodo-esquema' + refc(it.label) + '" data-id="' + k + '-' + i + '" data-i="' + i + '" style="--d:' + (0.3 + i * 0.08) + 's">' +
          '<span class="esquema-arte">' + svgObjeto(it.obj, 46) + '</span><span class="esquema-rotulo">' + rot(it.label) + '</span>' +
          '<span class="esquema-extracto">' + esc(may(extracto(segs(it.segs), n <= 2 ? 330 : n <= 3 ? 170 : 105))) + '</span>' +
          '<span class="esquema-marca"><span class="marca-ver">' + mano + ' Ver más</span><span class="marca-falta"><i class="fas fa-book-open" aria-hidden="true"></i> Te falta leer</span>' +
          '<span class="marca-leida">' + visto + ' Leída</span></span></button>';
      }).join('') + '</div></div>';
  };
  B.esquema.activar = function (b, k, el) { abreLector(el, b); };

  /* ---------- Familias de la segunda pasada (SRPA, 30/10/2026) ----------
     Conservan el recorrido de Juan (entrada breve, exploración, texto íntegro en la ventana, visto y avance) y cambian la acción
     según lo que la ficha permite hacer con su información. Cada rótulo, papel, conexión, requisito o consecuencia es una frase
     literal de la ficha (el generador lo comprueba) y cada elemento abre su texto completo en el lector. */

  /* Red de instituciones: la norma al centro y, alrededor, las instituciones que la ficha nombra con la referencia que les da
     («el numeral 5°»). Al leer cada una, su enlace se completa y aparece en la red el papel que la ficha le asigna («la dirección
     de las investigaciones»): al terminar queda a la vista quién integra el sistema y qué hace cada uno. */
  B.red = function (b, k) {
    var n = b.items.length, izq = Math.ceil(n / 2), lineas = '', nodos = '';
    b.items.forEach(function (it, i) {
      var der = i >= izq, fila = der ? i - izq : i, filas = der ? n - izq : izq;
      var y = filas === 1 ? 50 : 22 + 56 * fila / (filas - 1), x = der ? 82 : 18, borde = der ? 66 : 34;
      lineas += '<path data-id="' + k + '-' + i + '" d="M50 50 C ' + (der ? 58 : 42) + ' 50, ' + (der ? 58 : 42) + ' ' + y.toFixed(1) + ', ' + borde + ' ' + y.toFixed(1) + '"/>';
      nodos += '<button type="button" class="red-nodo' + (der ? ' der' : '') + refc(it.label) + '" data-id="' + k + '-' + i + '" data-i="' + i + '" style="left:' + x + '%;top:' + y.toFixed(1) + '%;--d:' + (0.2 + i * 0.1) + 's">' +
        '<span class="red-cab"><span class="red-arte">' + svgObjeto(it.obj, 34) + '</span><span class="red-rotulo">' + rot(it.label) + '</span><span class="red-marca">' + mano + visto + '</span></span>' +
        (it.norma ? '<span class="red-norma">' + esc(may(it.norma)) + '</span>' : '') +
        (it.papel ? '<span class="red-papel"><span class="red-pista">Ábrela para completar la red</span><span class="red-revela">' + esc(may(it.papel)) + '</span></span>' : '') + '</button>';
    });
    return '<div class="red n' + n + '"><svg class="red-lineas" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' + lineas + '</svg>' +
      '<div class="red-centro"><i class="fas fa-sitemap" aria-hidden="true"></i><span>' + esc(may(b.centro || centroTitulo())) + '</span></div>' + nodos + '</div>';
  };
  B.red.activar = function (b, k, el) { abreLector(el, b); };

  /* Conexiones: a un lado, los conceptos que la ficha nombra, todavía sin unir; al otro, los fragmentos que los relacionan. Al
     leer cada fragmento aparece la conexión que la ficha establece, con sus palabras («guarda una íntima conexión con»), y se
     cuentan las conexiones descubiertas. El mapa es una síntesis visual: el texto íntegro está en cada fragmento y cada conexión
     nueva se anuncia también en texto. */
  B.conexiones = function (b, k) {
    var C = b.conceptos || [], E = b.enlaces || [], pos = {};
    C.forEach(function (c, i) {
      var a = -Math.PI / 2 + 2 * Math.PI * i / C.length;
      pos[c.id] = [c.x != null ? c.x : 50 + 33 * Math.cos(a), c.y != null ? c.y : 50 + 34 * Math.sin(a)];
    });
    var lineas = E.map(function (e) {
      var p = pos[e.de], q = pos[e.a];
      return '<line data-id="' + k + '-' + e.item + '" x1="' + p[0] + '" y1="' + p[1] + '" x2="' + q[0] + '" y2="' + q[1] + '"/>';
    }).join('');
    var frases = E.map(function (e) {
      var p = pos[e.de], q = pos[e.a], m = e.medio || [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
      return '<span class="cx-frase" data-id="' + k + '-' + e.item + '" style="left:' + m[0] + '%;top:' + m[1] + '%">' + esc(may(e.frase)) + '</span>';
    }).join('');
    var conceptos = C.map(function (c, i) {
      var ids = E.filter(function (e) { return e.de === c.id || e.a === c.id; }).map(function (e) { return k + '-' + e.item; });
      return '<span class="cx-concepto" data-items="' + ids.join(' ') + '" style="left:' + pos[c.id][0] + '%;top:' + pos[c.id][1] + '%;--d:' + (0.15 + i * 0.08) + 's">' + esc(may(c.texto)) + '</span>';
    }).join('');
    var fuentes = b.items.map(function (it, i) {
      var n = E.filter(function (e) { return e.item === i; }).length;
      return '<button type="button" class="cx-fuente' + refc(it.label) + '" data-id="' + k + '-' + i + '" data-i="' + i + '" style="--d:' + (0.2 + i * 0.08) + 's">' +
        '<span class="cx-n">' + (i + 1) + '</span><span class="cx-rotulo">' + rot(it.label) + '</span><span class="cx-marca">' + mano + visto + '</span>' +
        (n ? '<span class="cx-chip"><i class="fas fa-link" aria-hidden="true"></i> ' + (n === 1 ? 'Revela 1 conexión' : 'Revela ' + n + ' conexiones') + '</span>' : '') + '</button>';
    }).join('');
    /* En pantalla angosta el mapa no cabe: cada conexión es una fila «concepto · frase · concepto» que se completa al leer. */
    var T = {};
    C.forEach(function (c) { T[c.id] = c.texto; });
    var filas = E.map(function (e) {
      return '<li class="cx-fila" data-id="' + k + '-' + e.item + '"><span class="cx-c">' + esc(may(T[e.de])) + '</span><span class="cx-f"><span class="cx-f-pista">· · ·</span><span class="cx-f-texto">' +
        esc(e.frase) + '</span></span><span class="cx-c">' + esc(may(T[e.a])) + '</span></li>';
    }).join('');
    return '<div class="conexiones n' + b.items.length + '"><div class="cx-mapa" aria-hidden="true"><svg class="cx-lineas" viewBox="0 0 100 100" preserveAspectRatio="none">' + lineas + '</svg>' +
      frases + conceptos + '<ul class="cx-lista">' + filas + '</ul><p class="cx-cuenta"></p></div><div class="cx-fuentes">' + fuentes + '</div><p class="sr-only cx-anuncio" aria-live="polite"></p></div>';
  };
  B.conexiones.activar = function (b, k, el) {
    abreLector(el, b);
    var E = b.enlaces || [], T = {};
    (b.conceptos || []).forEach(function (c) { T[c.id] = c.texto; });
    function pintar(id) {
      el.querySelectorAll('.cx-concepto').forEach(function (c) {
        if (c.dataset.items.split(' ').some(function (x) { return x && vistos[x]; })) c.classList.add('unido');
      });
      var hechas = E.filter(function (e) { return vistos[k + '-' + e.item]; }).length, cuenta = el.querySelector('.cx-cuenta');
      if (cuenta) cuenta.innerHTML = '<i class="fas fa-link" aria-hidden="true"></i> Conexiones descubiertas: ' + hechas + ' de ' + E.length;
      if (id) el.querySelector('.cx-anuncio').textContent = E.filter(function (e) { return k + '-' + e.item === id; })
        .map(function (e) { return may(T[e.de]) + ': ' + e.frase + ' ' + T[e.a]; }).join('. ');
    }
    pintar();
    el.addEventListener('ova-visto', function (ev) { pintar(ev.detail); });
  };

  /* Requisitos y consecuencia: los escenarios que la ficha distingue (U5-L3: inciso 1 e inciso 3 del artículo 187), cada uno con
     sus requisitos y «Se cumple» / «No se cumple». Cuando todos los requisitos de un escenario se cumplen aparece, citada, la
     consecuencia que la ficha le asigna («…tendrá una duración desde 2 hasta 8 años»); cuando cada escenario tiene alguno que no
     se cumple, la que la ficha prevé para los demás casos. La ficha manda: no se decide nada que ella no diga. Los fragmentos se
     leen completos desde la lista; en pantalla angosta cada requisito se abrevia por palabras completas («…»). */
  B.condiciones = function (b, k) {
    var S = b.escenarios || [], O = b.otro;
    var lista = b.items.map(function (it, i) {
      return '<button type="button" class="cond-fuente' + refc(it.label) + '" data-id="' + k + '-' + i + '" data-i="' + i + '" style="--d:' + (0.15 + i * 0.07) + 's">' +
        '<span class="cond-arte">' + svgObjeto(it.obj, 30) + '</span><span class="cond-rotulo">' + rot(it.label) + '</span><span class="cond-marca">' + mano + visto + '</span></button>';
    }).join('');
    var escenarios = S.map(function (s, j) {
      return '<div class="cond-esc" data-e="' + j + '" style="--d:' + (0.2 + j * 0.1) + 's"><p class="cond-esc-titulo">' + rot(s.titulo) +
        '<span class="cond-esc-marca"><i class="fas fa-circle-check" aria-hidden="true"></i></span></p><ul class="cond-reqs">' +
        s.requisitos.map(function (r, q) {
          var nombre = esc(may(r));
          return '<li class="cond-req"><span class="cond-req-texto"><span class="cond-largo">' + nombre + '</span><span class="cond-corto" aria-hidden="true">' + esc(may(extracto(r, 34))) + '</span></span>' +
            '<span class="cond-opciones" role="group" aria-label="' + nombre + '">' +
            '<button type="button" class="cond-op si" data-e="' + j + '" data-q="' + q + '" data-v="1" aria-pressed="false" aria-label="Se cumple"><span class="cond-op-l">Se cumple</span><span class="cond-op-c" aria-hidden="true">Sí</span></button>' +
            '<button type="button" class="cond-op no" data-e="' + j + '" data-q="' + q + '" data-v="0" aria-pressed="false" aria-label="No se cumple"><span class="cond-op-l">No se cumple</span><span class="cond-op-c" aria-hidden="true">No</span></button></span></li>';
        }).join('') + '</ul></div>';
    }).join('');
    var cita = function (t) { return '«…' + esc(t) + (/[.;:]$/.test(t) ? '' : '…') + '»'; };
    var resultado = '<div class="cond-resultado" data-estado="pendiente"><span class="cond-icono"><i class="fas fa-lock" aria-hidden="true"></i></span><div class="cond-res-texto" aria-live="polite">' +
      '<p class="cond-pista">Marca si se cumple cada requisito para ver la consecuencia que prevé la ficha.</p>' +
      S.map(function (s, j) { return '<p class="cond-cons" data-e="' + j + '" hidden><span class="cond-cons-de">' + esc(may(s.titulo)) + '</span> ' + cita(s.consecuencia) + '</p>'; }).join('') +
      (O ? '<p class="cond-cons otro" data-e="otro" hidden>' + cita(O.consecuencia) + '</p>' : '') + '</div></div>';
    return '<div class="condiciones"><div class="cond-lista">' + lista + '</div><div class="cond-panel"><div class="cond-escenarios n' + S.length + '">' + escenarios + '</div>' + resultado + '</div></div>';
  };
  B.condiciones.activar = function (b, k, el) {
    abreLector(el, b);
    var S = b.escenarios || [], marca = {}, res = el.querySelector('.cond-resultado');
    function estado() {
      var cumple = S.map(function (s, j) { return s.requisitos.every(function (_, q) { return marca[j + '-' + q] === '1'; }); });
      var falla = S.map(function (s, j) { return s.requisitos.some(function (_, q) { return marca[j + '-' + q] === '0'; }); });
      var e = cumple.some(Boolean) ? 'si' : falla.every(Boolean) ? 'no' : 'pendiente';
      res.dataset.estado = e;
      res.querySelector('.cond-icono i').className = 'fas ' + (e === 'si' ? 'fa-lock-open' : e === 'no' ? 'fa-lock' : 'fa-lock');
      res.querySelector('.cond-pista').hidden = e !== 'pendiente';
      res.querySelectorAll('.cond-cons').forEach(function (p) { p.hidden = p.dataset.e === 'otro' ? e !== 'no' : !cumple[Number(p.dataset.e)]; });
      el.querySelectorAll('.cond-esc').forEach(function (c, j) { c.classList.toggle('cumple', cumple[j]); c.classList.toggle('falla', falla[j]); });
    }
    el.querySelectorAll('.cond-op').forEach(function (o) {
      o.addEventListener('click', function () {
        marca[o.dataset.e + '-' + o.dataset.q] = o.dataset.v;
        el.querySelectorAll('.cond-op[data-e="' + o.dataset.e + '"][data-q="' + o.dataset.q + '"]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === o)); });
        estado(); reanimar(res);
      });
    });
    estado();
  };
  /* Comparador (contenido que contrasta figuras: «a diferencia de…», «buena fe simple y… exenta de culpa», «frente al
     comiso»): columnas lado a lado; la que se toca se ensancha con su texto completo y las demás se compactan. Usa los
     estilos .columnas del motor. */
  B.compara = function (b, k) {
    return tituloBloque(b, k) + '<div class="columnas comparador c' + b.items.length + '">' + b.items.map(function (it, i) {
      return '<div class="columna tono' + (i % 3 + 1) + refc(it.label) + '" data-id="' + k + '-' + i + '" data-i="' + i + '" style="--d:' + (i * 0.08) + 's">' +
        '<button type="button" class="col-boton" aria-expanded="false"><span class="col-cabeza"><span class="col-n">' + (i + 1) + '</span>' +
        '<span class="col-visto">' + visto + ' Leído</span></span><span class="col-arte">' + svgObjeto(it.obj, 104) + '</span>' +
        '<span class="col-rotulo">' + rot(it.label) + '</span><span class="col-toca">' + mano + ' Comparar</span></button>' +
        '<div class="col-lectura" hidden></div></div>';
    }).join('') + '</div>';
  };
  B.compara.activar = function (b, k, el) {
    var cont = el.querySelector('.columnas'), cols = el.querySelectorAll('.columna'), n = b.items.length;
    function abrir(c) {
      var i = Number(c.dataset.i);
      cols.forEach(function (o, j) {
        var si = j === i, lec = o.querySelector('.col-lectura');
        o.classList.toggle('abierta', si);
        o.querySelector('.col-boton').setAttribute('aria-expanded', String(si));
        if (!si) quitarRelleno(lec);   // la columna que se cierra no guarda la ilustración de relleno de cuando estuvo abierta
        lec.hidden = !si;
        lec.innerHTML = si ? '<p class="lectura-texto">' + rico(segs(b.items[j].segs)) + '</p>' : '';
      });
      cont.classList.add('con-abierta');
      cont.style.gridTemplateColumns = b.items.map(function (_, j) { return j === i ? (n === 2 ? '2.6fr' : '3.2fr') : '1fr'; }).join(' ');
      var lec = c.querySelector('.col-lectura');
      if (!dosificar(lec, function () { encajarPanel(lec); })) encajarPanel(lec);
      reanimar(lec); marcar(c.dataset.id);
    }
    cols.forEach(function (c) { c.querySelector('.col-boton').addEventListener('click', function () { abrir(c); }); });
    abrir(cols[0]); /* la escena nunca empieza en blanco */
    window.addEventListener('resize', function () { var l = el.querySelector('.columna.abierta .col-lectura'); if (l) encajarPanel(l); });
  };

  /* ---------- Actividad con retroalimentación (Estándares interamericanos; reunión con Juan del 28/10/2026) ----------
     Las actividades que el autor de la ficha preparó para H5P (pregunta de opción múltiple, conjunto de preguntas, decisiones,
     verdadero o falso, escenario de decisiones encadenadas, clasificación). Juan: «en cuanto el estudiante presione una
     respuesta incorrecta, le dé la retroalimentación para que él estudie y vuelva y responda la pregunta y si responde bien
     pues pasa a la siguiente». Páginas: introducción (si la hay) → una pregunta por página → cierre. La retroalimentación se
     abre en el lector; «Siguiente» se habilita al acertar. Tras acertar, cada opción vuelve a abrir la suya para repasar.
     Datos (producir_estandares.py): intro y cierre [{tipo: p|li|rot|tabla, segs | filas}], preguntas [{cab, enunciado,
     caption, opciones [{seg | texto, letra, ok, cab, retro}], respuesta, cab_retro, retro, fuente}]; modo «clasifica»: cada
     afirmación con las categorías de la matriz de solución como opciones. */
  function textoLineas(ls) {
    return ls.map(function (l) {
      if (l.tipo === 'tabla') return l.filas.map(function (f) { return f.map(seg).join(' · '); }).join('\n');
      return segs(l.segs);
    }).join('\n');
  }
  /* En la hoja de la actividad (introducción, situación, cierre), con datos.sinHuecos, los rótulos breves seguidos («Actividad
     inicial», «Pregunta») van en una sola línea separados por « · », en el orden de la ficha: uno bajo otro dejaban una franja
     vacía a su derecha (U3-L3-E05, U5-L1-E03). */
  function lineasHoja(ls) {
    if (!datos.sinHuecos) return textoLineas(ls);
    var out = [], rot = [];
    ls.forEach(function (l) {
      if (l.tipo === 'rot' && segs(l.segs).length <= 60) { rot.push(segs(l.segs)); return; }
      if (rot.length) { out.push(rot.join(' · ')); rot = []; }
      out.push(textoLineas([l]));
    });
    if (rot.length) out.push(rot.join(' · '));
    return out.join('\n');
  }
  /* ---------- Tarjeta de retroalimentación con memes (Estándares interamericanos; Esteban, 28/10/2026, tras la reunión con Juan:
     «cuando le dé una opción que es incorrecta le aparezca la imagen y le dé como para volver… si le da otra incorrecta le vuelve
     a aparecer otra imagen según el meme… y solo cuando elige la correcta ya lo deja avanzar a la siguiente pregunta») ----------
     Con datos.retro {reacciones, frases, acierto, rotulo}, en el lector:
     · «meme»: la tarjeta aprobada de ese error (imagen con su texto dibujado, que va también como texto alternativo), con botones
       reales sobre su «Vuelve a intentarlo» y su cierre, y «Leer la retroalimentación de la ficha», con el texto literal;
     · «mal»: el mismo diseño en HTML, con un personaje de reacción distinto en cada intento, su globo, la lección, «¿La opción B?»
       y la retroalimentación literal de la ficha;
     · «bien»: «¡Respuesta correcta!», la retroalimentación, la respuesta y la fuente; su botón lleva a la página siguiente.
     Escape o el cierre vuelven a la misma pregunta. */
  function encajarTarjeta(caja) {
    var zona = caja.querySelector('.tr-texto'), t = zona && zona.querySelector('.lectura-texto');
    if (!t) return;
    /* Con datos.sinHuecos, la retroalimentación breve crece hasta 24 px y llena su zona (sin franja vacía sobre el botón). */
    for (var fs = datos.sinHuecos ? 24 : 17; fs >= 11.5; fs -= 0.5) {
      t.style.fontSize = fs + 'px';
      if (zona.scrollHeight <= zona.clientHeight + 1 && caja.scrollHeight <= caja.clientHeight + 1) return;
    }
  }
  function tarjeta(op) {
    var l = raiz.querySelector('.lector'), RR = datos.retro, n = op.idx || 0, html;
    retornoFoco = op.desde || null;
    if (op.tipo === 'meme') {
      html = '<div class="lector-caja tarjeta-retro con-meme" role="dialog" aria-modal="true" aria-label="Respuesta incorrecta" tabindex="-1">' +
        '<div class="tr-meme"><img src="' + srcImagen(op.meme.img) + '" alt="' + esc(op.meme.alt) + '">' +
        '<button type="button" class="tr-volver-img">' + esc(op.boton) + '</button>' +
        '<button type="button" class="tr-x-img" aria-label="Cerrar y volver a la pregunta"></button></div>' +
        (op.texto ? '<p class="tr-pie"><button type="button" class="tr-leer"><i class="fas fa-book-open" aria-hidden="true"></i> Leer la retroalimentación de la ficha</button></p>' : '') +
        '</div>';
    } else {
      var bien = op.tipo === 'bien';
      var pers = bien ? RR.acierto[n % RR.acierto.length] : RR.reacciones[n % RR.reacciones.length];
      var globo = bien ? ['¡Muy bien!', '¡Eso es!', '¡Así es!'][n % 3] : RR.frases[n % RR.frases.length];
      var titulo = bien ? '¡Respuesta <b>correcta!</b>' : op.clasifica ? '¿Esa <b>categoría?</b>' : '¿La opción <b>' + esc(op.letra) + '?</b>';
      var sub = bien ? (op.texto ? 'Así lo explica la ficha:' : '¡Muy bien!') : op.clasifica ? '¡Esa no es la clasificación!' : '¡No es la respuesta! Revisa por qué:';
      /* Sin texto de la ficha: el acierto nombra la categoría elegida; nunca muestra el aviso de error (antes, «¡Respuesta
         correcta!» con «Esta afirmación no corresponde a esa categoría…», en las clasificaciones de U5). */
      var texto = op.texto || (bien ? (op.categoria ? 'Esta afirmación corresponde a la categoría «' + op.categoria + '».' : '')
        : op.clasifica ? 'Esta afirmación no corresponde a esa categoría. Vuelve a leerla e inténtalo de nuevo.'
        : 'Vuelve a leer la pregunta e inténtalo de nuevo.');
      html = '<div class="lector-caja tarjeta-retro ' + (bien ? 'bien' : 'mal') + '" role="dialog" aria-modal="true" aria-label="' +
        (bien ? 'Respuesta correcta' : 'Respuesta incorrecta') + '" tabindex="-1">' +
        '<div class="tr-izq" aria-hidden="true"><span class="tr-globo">' + esc(globo) + '</span><img class="tr-personaje" src="' + srcImagen(pers) + '" alt=""></div>' +
        '<div class="tr-der"><p class="tr-chip">' + esc(op.chip) + '</p>' +
        '<button type="button" class="tr-x" aria-label="Cerrar y volver a la pregunta"><i class="fas fa-xmark" aria-hidden="true"></i></button>' +
        '<p class="tr-titulo">' + titulo + '</p><span class="tr-linea" aria-hidden="true"></span><p class="tr-sub">' + esc(sub) + '</p>' +
        '<div class="tr-texto"><p class="lectura-texto">' + rico(texto) + '</p></div>' +
        '<button type="button" class="tr-boton">' + esc(op.boton) + ' <i class="fas fa-' + (bien ? 'arrow-right' : 'rotate-left') + '" aria-hidden="true"></i></button></div></div>';
    }
    l.innerHTML = html;
    l.hidden = false;
    var caja = l.firstChild;
    function salir() {
      var L = op.alBoton && faltaLeer(caja);
      if (L) { avisar(caja, textoFalta(L, 'la retroalimentación'), L.sig); return; }
      cerrarLector(); if (op.alBoton) op.alBoton();
    }
    caja.querySelectorAll('.tr-volver-img,.tr-boton').forEach(function (x) { x.addEventListener('click', salir); });
    caja.querySelectorAll('.tr-x-img,.tr-x').forEach(function (x) { x.addEventListener('click', cerrarLector); });
    var leerFicha = caja.querySelector('.tr-leer');
    if (leerFicha) leerFicha.addEventListener('click', function () {
      tarjeta({ tipo: 'mal', idx: n, chip: op.chip, letra: op.letra, texto: op.texto, boton: op.boton, desde: op.desde, clasifica: op.clasifica });
    });
    if (op.tipo !== 'meme') {
      var zona = caja.querySelector('.tr-texto');
      /* La tarjeta tiene menos alto que un panel: su retroalimentación se parte en tramos de 300 caracteres, para que
         «Seguir leyendo» nunca quede cortado al fondo. */
      if (!dosificar(zona, function () { encajarTarjeta(caja); }, datos.sinHuecos ? 300 : null)) encajarTarjeta(caja);
      var bt = caja.querySelector('.tr-boton');
      if (op.alBoton && faltaLeer(caja)) { candado(bt, true); caja.addEventListener('lectura-completa', function () { candado(bt, false); }); }
    }
    reanimar(caja);
    var foco = caja.querySelector('.tr-volver-img,.tr-boton');
    (foco || caja).focus({ preventScroll: true });
  }
  function sinMarca(t) { return String(t).replace(/^(?:Opción\s+)?[A-Da-d][.:)]\s+/, ''); }
  B.actividad = function (b, k) {
    var paginas = [];
    if (b.intro.length) paginas.push('intro');
    /* Una pregunta con su propia situación («Segunda situación. …» y sus hechos) la lee antes, en su página («x»). */
    b.preguntas.forEach(function (q, i) { if (q.contexto && q.contexto.length) paginas.push('x' + i); paginas.push('q' + i); });
    if (b.cierre.length) paginas.push('cierre');
    b.paginas = paginas;
    var nombre = b.modo === 'clasifica' ? 'Afirmación ' : 'Pregunta ';
    var html = paginas.map(function (p, n) {
      var cuerpo;
      if (p === 'intro' || p === 'cierre' || p[0] === 'x') {
        var ls = p === 'intro' ? b.intro : p === 'cierre' ? b.cierre : b.preguntas[Number(p.slice(1))].contexto;
        var rotulo = p === 'intro' ? 'Actividad' : p === 'cierre' ? 'Para cerrar la actividad' : 'Antes de la pregunta ' + (Number(p.slice(1)) + 1);
        cuerpo = '<div class="act-hoja act-encaja"><p class="act-eyebrow"><i class="fas ' + (p === 'cierre' ? 'fa-flag-checkered' : p === 'intro' ? 'fa-puzzle-piece' : 'fa-folder-open') + '" aria-hidden="true"></i> ' +
          rotulo + '</p><p class="lectura-texto">' + rico(lineasHoja(ls)) + '</p></div>' +
          '<figure class="act-figura" aria-hidden="true">' + (datos.ilustraciones && escena.ilustracion ? '<img src="' + srcImagen(escena.ilustracion) + '" alt="">'
            : svgObjeto(p === 'cierre' ? 'libros' : p === 'intro' ? 'expediente' : 'documento', 150)) + '</figure>';
      } else {
        var i = Number(p.slice(1)), q = b.preguntas[i], dos = q.opciones.length <= 2;
        cuerpo = '<div class="act-pregunta act-encaja"><p class="act-eyebrow"><i class="fas fa-circle-question" aria-hidden="true"></i> ' + nombre + (i + 1) + ' de ' + b.preguntas.length + '</p>' +
          (q.cab !== null && q.cab !== undefined ? '<p class="act-cab">' + marcado(may(seg(q.cab))) + '</p>' : '') +
          (q.enunciado.length ? '<p class="lectura-texto act-enunciado">' + rico(segs(q.enunciado)) + '</p>' : '') +
          (q.caption !== null && q.caption !== undefined ? '<p class="act-caption">' + esc(may(seg(q.caption))) + '</p>' : '') +
          '<div class="act-opciones' + (dos ? ' en-fila' : '') + '" role="group" aria-label="Opciones">' + q.opciones.map(function (o, j) {
            var t = o.seg !== undefined && o.seg !== null ? sinMarca(seg(o.seg)) : o.texto;
            return '<button type="button" class="act-opcion" data-q="' + i + '" data-j="' + j + '" style="--d:' + (j * 0.06) + 's"><span class="act-letra">' + esc(o.letra) + '</span>' +
              '<span class="act-texto">' + marcado(may(t)) + '</span><span class="act-marca" aria-hidden="true"></span></button>';
          }).join('') + '</div><p class="act-aviso" aria-live="polite"></p></div>';
      }
      return '<section class="act-pagina pag-' + (p[0] === 'q' ? 'pregunta' : p[0] === 'x' ? 'contexto' : p) + '" data-p="' + n + '"' + (n ? ' hidden' : '') + '>' + cuerpo + '</section>';
    }).join('');
    return '<div class="actividad" data-modo="' + b.modo + '">' + html +
      '<nav class="act-nav" aria-label="Partes de la actividad"><button type="button" class="act-ant"><i class="fas fa-arrow-left" aria-hidden="true"></i> Anterior</button>' +
      '<span class="act-puntos">' + paginas.map(function (p, n) {
        var r = p === 'intro' ? 'Introducción' : p === 'cierre' ? 'Cierre' : p[0] === 'x' ? 'Situación de la ' + nombre.toLowerCase() + (Number(p.slice(1)) + 1) : nombre + (Number(p.slice(1)) + 1);
        return '<button type="button" class="act-punto' + (p[0] === 'x' ? ' contexto' : '') + '" data-ir="' + n + '" aria-label="' + r + '"><span>' + (p[0] === 'q' ? Number(p.slice(1)) + 1 : p === 'intro' ? '<i class="fas fa-play" aria-hidden="true"></i>' : p[0] === 'x' ? '<i class="fas fa-folder-open" aria-hidden="true"></i>' : '<i class="fas fa-flag" aria-hidden="true"></i>') + '</span></button>';
      }).join('') + '</span><button type="button" class="act-sig">Siguiente <i class="fas fa-arrow-right" aria-hidden="true"></i></button></nav></div>';
  };
  /* La letra de la página baja de a medio punto hasta que todo cabe (nunca desplazamiento); el texto breve crece hasta 19 px. */
  function encajarAct(pg) {
    var c = pg.querySelector('.act-encaja'), ops = pg.querySelector('.act-opciones');
    if (!c) return;
    pg.classList.remove('sin-arte');
    quitarRelleno(c);
    if (ops) ops.classList.toggle('en-fila', ops.children.length <= 2);
    for (var fs = datos.sinHuecos ? 22 : 19; fs >= 11.5; fs -= 0.5) {
      c.style.setProperty('--fs', fs + 'px');
      if (c.scrollHeight <= c.clientHeight + 1 && pg.scrollHeight <= pg.clientHeight + 1) { if (!ops && c.classList.contains('act-hoja')) rellenar(c); return; }
      if (fs <= 14 && !pg.classList.contains('sin-arte') && pg.querySelector('.act-figura')) { pg.classList.add('sin-arte'); fs = 19.5; }
      /* Opciones largas que no caben una debajo de otra: van en dos columnas. */
      else if (fs <= 12.5 && ops && !ops.classList.contains('en-fila')) { ops.classList.add('en-fila'); fs = 16.5; }
    }
  }
  B.actividad.activar = function (b, k, el) {
    var pags = el.querySelectorAll('.act-pagina'), puntos = el.querySelectorAll('.act-punto'), ant = el.querySelector('.act-ant'), sig = el.querySelector('.act-sig');
    var pos = 0, resueltas = {}, leidas = {};
    function pregunta(n) { var p = b.paginas[n]; return p && p[0] === 'q' ? Number(p.slice(1)) : null; }
    /* No se pasa de una pregunta sin acertarla («no lo deja pasar si no responde lo que es») ni, con datos.completar, de una
       página sin leerla completa. */
    function cerrada(n) { for (var m = 0; m < n; m++) { var q = pregunta(m); if (q !== null ? !resueltas[q] : datos.completar && !leidas[m]) return true; } return false; }
    /* Qué falta para avanzar desde la página actual (datos.completar): la respuesta correcta o alguna parte de la lectura. */
    function falta() {
      var q = pregunta(pos);
      if (q !== null && !resueltas[q]) return { texto: 'Aún no has completado esta página: ' + (b.modo === 'clasifica' ? 'ubica la afirmación en su categoría correcta' : 'elige la respuesta correcta') + ' para poder avanzar.' };
      var L = !leidas[pos] && faltaLeer(pags[pos]);
      return L ? { texto: textoFalta(L, 'esta página'), pulsar: L.sig } : null;
    }
    function estado() {
      puntos.forEach(function (p, j) { p.disabled = cerrada(j); });
      if (datos.completar) { sig.disabled = pos === pags.length - 1; candado(sig, !sig.disabled && falta()); }
    }
    function ir(n) {
      if (cerrada(n)) return;
      pos = n;
      pags.forEach(function (p, j) { p.hidden = j !== n; });
      puntos.forEach(function (p, j) { p.setAttribute('aria-current', j === n ? 'step' : 'false'); p.classList.toggle('pasado', j < n); });
      var q = pregunta(n);
      ant.disabled = n === 0;
      sig.disabled = n === pags.length - 1 || (q !== null && !resueltas[q]);
      var pg = pags[n];
      if (b.paginas[n][0] !== 'q') {
        var hoja = pg.querySelector('.act-hoja');
        if (!dosificar(hoja, function () { encajarAct(pg); })) encajarAct(pg);
        if (!faltaLeer(pg)) leidas[n] = true;
      } else encajarAct(pg);
      estado();
      reanimar(pg);
    }
    el.addEventListener('lectura-completa', function () { if (pregunta(pos) === null) leidas[pos] = true; estado(); });
    var intentos = 0, aciertos = 0, R = datos.retro;
    /* Qué ofrece el botón de la tarjeta de acierto: la página que sigue. */
    function rotuloSiguiente() {
      var p = b.paginas[pos + 1];
      return !p ? 'Terminar' : p[0] === 'q' ? 'Siguiente pregunta' : p[0] === 'x' ? 'Siguiente situación' : p === 'cierre' ? 'Ir al cierre' : 'Continuar';
    }
    el.querySelectorAll('.act-opcion').forEach(function (o) {
      o.addEventListener('click', function () {
        var i = Number(o.dataset.q), q = b.preguntas[i], op = q.opciones[Number(o.dataset.j)], aviso = o.closest('.act-pregunta').querySelector('.act-aviso');
        var propia = (op.cab !== null && op.cab !== undefined ? seg(op.cab) + '\n' : '') + (op.retro ? segs(op.retro) : '');
        var cabRetro = q.cab_retro !== null && q.cab_retro !== undefined ? seg(q.cab_retro) : '', retroGeneral = segs(q.retro || []);
        var general = [cabRetro, retroGeneral].filter(Boolean).join('\n');
        var fuente = (q.fuente || []).length ? '\n' + segs(q.fuente) : '';
        var clave = q.respuesta !== null && q.respuesta !== undefined ? seg(q.respuesta) : '';
        var chip = R ? R.rotulo + ' · ' + (b.modo === 'clasifica' ? 'Afirmación ' : 'Pregunta ') + (i + 1) : '';
        var categoria = b.modo === 'clasifica' ? (op.seg !== undefined && op.seg !== null ? sinMarca(seg(op.seg)) : op.texto || '') : '';
        /* En el orden de la ficha: «Retroalimentación automática», la de la opción, la general y «Respuesta correcta: …». */
        var textoBien = [cabRetro, propia.trim(), retroGeneral, clave].filter(Boolean).join('\n') + fuente;
        var textoMal = ((propia.trim() || general) + fuente).trim();
        if (resueltas[i]) {
          /* Repaso: cada opción abre su propia retroalimentación. */
          var t = op.ok ? textoBien : textoMal;
          if (R && (t.trim() || op.meme || (op.ok && categoria))) tarjeta({ tipo: op.ok ? 'bien' : op.meme ? 'meme' : 'mal', idx: op.ok ? aciertos : intentos, meme: op.meme, chip: chip,
            letra: op.letra, texto: t, boton: 'Volver a la pregunta', desde: o, clasifica: b.modo === 'clasifica', categoria: categoria });
          else if (t.trim()) leer((op.ok ? 'Respuesta correcta · ' : 'Repaso · ') + 'opción ' + op.letra, t, null, o);
          return;
        }
        if (op.ok) {
          resueltas[i] = true;
          o.classList.add('acierto');
          o.querySelector('.act-marca').innerHTML = visto;
          o.closest('.act-opciones').classList.add('resuelta');
          aviso.className = 'act-aviso bien';
          aviso.innerHTML = visto + ' ¡Correcto! ' + (pos < pags.length - 1 ? 'Ya puedes continuar.' : '');
          marcarYa(k + '-' + i);
          sig.disabled = pos === pags.length - 1;
          estado();
          /* Solo la respuesta correcta deja avanzar: su tarjeta lleva el botón a la página siguiente. */
          if (R) tarjeta({ tipo: 'bien', idx: aciertos++, chip: chip, letra: op.letra, texto: textoBien, desde: o, clasifica: b.modo === 'clasifica',
            categoria: categoria, boton: rotuloSiguiente(), alBoton: function () { if (pos < pags.length - 1) ir(pos + 1); } });
          else if (textoBien.trim()) leer('¡Correcto! · ' + (b.modo === 'clasifica' ? 'Afirmación ' : 'Pregunta ') + (i + 1), textoBien, null, o);
        } else {
          o.classList.remove('error'); void o.offsetWidth; o.classList.add('error', 'intentada');
          o.querySelector('.act-marca').innerHTML = '<i class="fas fa-xmark" aria-hidden="true"></i>';
          aviso.className = 'act-aviso mal';
          aviso.textContent = 'Respuesta incorrecta. ' + (textoMal || op.meme ? 'Lee la retroalimentación y vuelve a intentarlo.' : 'Vuelve a intentarlo.');
          /* Cada error trae otra imagen: el meme aprobado de ese error o, si no lo hay, otro personaje de reacción. */
          if (R) tarjeta({ tipo: op.meme ? 'meme' : 'mal', idx: intentos++, meme: op.meme, chip: chip, letra: op.letra, texto: textoMal, desde: o,
            clasifica: b.modo === 'clasifica', boton: 'Vuelve a intentarlo' });
          else if (textoMal) leer('Respuesta incorrecta · opción ' + op.letra, textoMal, null, o);
        }
      });
    });
    puntos.forEach(function (p) { p.addEventListener('click', function () { ir(Number(p.dataset.ir)); }); });
    ant.addEventListener('click', function () { ir(Math.max(0, pos - 1)); });
    sig.addEventListener('click', function () {
      var f = datos.completar && falta();
      if (f) { avisar(raiz.querySelector('.escenario'), f.texto, f.pulsar); return; }
      ir(Math.min(pags.length - 1, pos + 1));
    });
    ir(0);
    if (document.fonts) document.fonts.ready.then(function () { encajarAct(pags[pos]); });
    window.addEventListener('resize', function () { encajarAct(pags[pos]); });
  };

  /* Ver en pantalla completa (Juan, 27/10/2026: en todas las mediaciones, como prueba). Si el navegador o el iframe no lo
     permiten (sin allowfullscreen), la escena se abre en una pestaña nueva. */
  function pantallaCompleta() {
    var d = document, el = d.documentElement;
    if (d.fullscreenElement || d.webkitFullscreenElement) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); return; }
    var pedir = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!pedir || d.fullscreenEnabled === false) { window.open(location.href, '_blank', 'noopener'); return; }
    var p = pedir.call(el);
    if (p && p.catch) p.catch(function () { window.open(location.href, '_blank', 'noopener'); });
  }
  /* En pantalla completa la escena conserva la composición del iframe (767 × 510) y crece con zoom, que vuelve a dibujar
     la letra nítida en vez de agrandar una imagen (base.css centra la escena). En una pantalla más pequeña que el iframe,
     como un celular acostado (844 × 390), se reduce hasta caber completa: si no, se cortaba abajo con el botón «Salir».
     «datos.marco» = [ancho, alto] del iframe de un curso con otro marco (SRPA: 1113 × 448, todo el recuadro de la plantilla);
     su tema-curso.css fija ese tamaño en pantalla completa. */
  function zoomPantalla() {
    var on = document.documentElement.classList.contains('en-pantalla-completa'), m = datos.marco || [767, 510];
    raiz.style.zoom = on ? String(Math.min(innerWidth / m[0], innerHeight / m[1])) : '';
  }
  function estadoPantalla() {
    var on = !!(document.fullscreenElement || document.webkitFullscreenElement), b = raiz.querySelector('.pantalla-completa');
    document.documentElement.classList.toggle('en-pantalla-completa', on);
    zoomPantalla();
    if (!b) return;
    b.querySelector('i').className = 'fas ' + (on ? 'fa-compress' : 'fa-expand');
    b.querySelector('span').textContent = on ? 'Salir' : 'Pantalla completa';
    b.setAttribute('aria-label', on ? 'Salir de pantalla completa' : 'Ver en pantalla completa');
  }
  document.addEventListener('fullscreenchange', estadoPantalla);
  document.addEventListener('webkitfullscreenchange', estadoPantalla);
  window.addEventListener('resize', zoomPantalla);
  window.addEventListener('resize', function () { midiendo(function () { organizarGiros(); encajarTarjetas(); ajustarExtractos(); }); });

  /* ---------- Caso de estudio (patrón de Juan, caso1.html; Esteban, 27/10/2026) ----------
     «Aplicación al expediente del curso» como un expediente en páginas: El caso → Su tarea → Su respuesta, con puntos de
     posición y Anterior/Siguiente. Todo el texto de la fuente aparece en su orden: la situación, las preguntas y consignas,
     la pista, la instrucción de respuesta y la nota. Admite los roles fijos de U1 y los párrafos de U2–U4. */
  var ENCABEZADO = /^(Aplicación al expediente del curso)\s*/;
  var TAREA = /¿|\b(analice|determine|clasifique|explique|identifique|examine|deberá encontrar|establezca|indique|describa)\b/i;
  function oraciones(t) { return String(t).split(/(?<=[.?!])\s+(?=[¿¡A-ZÁÉÍÓÚÑ])/).filter(function (x) { return x.trim(); }); }
  function modeloCaso(b) {
    /* «encabezado» y «nombre» del bloque (Estándares interamericanos: «Actividad de aprendizaje») reemplazan los de Audiencias. */
    var r = b.roles, m = { encabezado: b.encabezado || 'Aplicación al expediente del curso', situacion: [], tareas: [], pista: [], instruccion: [], nota: [] };
    function clasificar(t, porRol) {
      /* «Tome nota de sus respuestas…» (bitácoras de SRPA) es la instrucción para responder: va junto al espacio de respuesta. */
      if (/^Responda\b/.test(t) || (datos.bitacora && /^(?:Tome (?:atenta )?nota|Escr[ií]balas|Justifique (?:su|la) respuesta|Reflexione sobre)\b/i.test(t))) m.instruccion.push(t);
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
    m.nombre = b.nombre || (nombre ? 'Caso de ' + nombre[1].trim() : 'Expediente del curso');
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
      encajarCaso(pg, true);
      if (datos.completar) candado(sig, !sig.disabled && !!faltaLeer(pg));
    }
    /* Al entrar a la página, el texto que no cabe ni a 15 px se reparte en partes; al cambiar el tamaño, solo se reencaja. */
    function encajarCaso(pg, entrada) {
      pg.querySelectorAll('.caso-encaja').forEach(function (c) {
        var partido = [].some.call(c.children, function (x) { return x.classList.contains('lectura-paginas'); });
        if (partido && !entrada) return;
        if (partido) { quitarPartes(c); c.style.removeProperty('--fs'); }
        /* En el marco ancho (SRPA, 1113 × 448) la letra no baja de 14 px: lo que no cabe se lee por partes. El desborde se
           confirma con la suma de los bloques: la ilustración de relleno entra con «aparece» (translateY de 8 px) y ese
           movimiento inflaba scrollHeight, de modo que la página perdía su imagen y quedaba un hueco (SRPA U2-L3-E23). */
        encajarTexto(pg, c, anchoReal() ? 14 : 0);
        if (c.scrollHeight > c.clientHeight + 1 && !cabe(c, 0)) { quitarRelleno(c); pg.classList.add('sin-arte'); partirBloques(c); }
        /* Una sola pregunta llena la hoja del marco ancho (la tarjeta se estira): su letra se mide contra el alto de la propia
           tarjeta, de 25 px hacia abajo, para que nunca quede cortada (SRPA U1-L3-E31). */
        var tareas = c.querySelectorAll('.caso-tarea');
        var sola = tareas.length === 1 && [].every.call(c.children, function (x) { return x === tareas[0] || x.classList.contains('relleno-arte'); }) && tareas[0];
        if (sola && anchoReal()) {
          quitarRelleno(c);   // la tarjeta ocupa todo el alto; la ilustración de relleno la dejaba pequeña (U1-L3-E19)
          // La tarjeta crece con su texto (flex con min-height automático): se mide también la caja que la contiene.
          for (var fs = 25; fs >= 12.5; fs -= 0.5) {
            c.style.setProperty('--fs', fs + 'px');
            if (sola.scrollHeight <= sola.clientHeight + 1 && c.scrollHeight <= c.clientHeight + 1) break;
          }
        }
      });
    }
    el.addEventListener('lectura-completa', function () { if (datos.completar) candado(sig, false); });
    /* Con datos.completar, no se pasa a otra página del caso sin leer todas las partes de la actual. */
    function pendiente(j) {
      var L = j > pos && faltaLeer(paginas[pos]);
      if (L) avisar(raiz.querySelector('.escenario'), textoFalta(L, 'esta página'), L.sig);
      return !!L;
    }
    puntos.forEach(function (p) { p.addEventListener('click', function () { var j = Number(p.dataset.ir); if (!pendiente(j)) ir(j); }); });
    ant.addEventListener('click', function () { ir(Math.max(0, pos - 1)); });
    sig.addEventListener('click', function () { if (!pendiente(pos + 1)) ir(Math.min(paginas.length - 1, pos + 1)); });
    el.querySelectorAll('.caso-tarea').forEach(function (t) {
      t.addEventListener('click', function () { t.setAttribute('aria-pressed', 'true'); t.classList.add('visto'); marcar(t.dataset.id); });
    });
    /* «Su tarea» junto a la respuesta (Esteban, 28/10/2026: «no dejar esos espacios en blanco»): la lista crece hasta 17 px y,
       si aún sobra espacio, lleva la ilustración de relleno debajo. */
    function encajarRecuerde() {
      var a = el.querySelector('.caso-recuerde'), ol = a && a.querySelector('ol');
      if (!ol || !datos.sinHuecos || !a.getClientRects().length) return;
      quitarRelleno(a);
      for (var fs = 17; fs >= 12; fs -= 0.5) { ol.style.fontSize = fs + 'px'; if (a.scrollHeight <= a.clientHeight + 1) break; }
      rellenar(a);
    }
    paginas.forEach(function (pg) { if (pg.classList.contains('pag-respuesta')) new MutationObserver(function () { if (!pg.hidden) encajarRecuerde(); }).observe(pg, { attributes: true, attributeFilter: ['hidden'] }); });
    window.addEventListener('resize', encajarRecuerde);
    var t = el.querySelector('textarea'), out = el.querySelector('.caso-cuenta output'), barra = el.querySelector('.caso-barra i'), clave = 'ap-respuesta-' + (datos.clave_curso ? datos.clave_curso + '-' : '') + (datos.unit || 1) + '-' + datos.lesson + '-' + actual;
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
    function reencajar() { encajarCaso(paginas[pos], false); }
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
          '<span class="ctx-n">' + (i + 1) + '</span><span class="ctx-ico">' + svgObjeto(it.obj, 28) + '</span><span class="ctx-rotulo">' + rot(it.label) + '</span><span class="ctx-visto">' + visto + '</span>' + estado + '</button>';
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
      if (botones[i]) botones[i].classList.add('abierta');
      /* El texto se escribe letra por letra, como en las fichas (Esteban, 31/10/2026: detalles en las 5 unidades). */
      var lt = caja.querySelector('.lectura-texto'), letras = quieto || !lt ? null : envolverLetras(lt);
      marcar(it.id); /* marcar primero: «Exploración completa» cambia la altura */
      if (!dosificar(caja, function () { encajarTexto(cont, caja); })) encajarTexto(cont, caja);
      reanimar(caja);
      if (letras) escribirLetras(lt, letras, function () {});
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
    escena = datos.scenes[actual]; vistos = {}; retornoFoco = null; generacion++; ultimaLectura = null;
    total = escena.bloques.reduce(function (a, b) { return a + (b.tipo === 'caso' ? totalCaso(b) : tablaBreve(b) ? 0 : b.items.length) + (b.titulo && b.titulo.length && segs(b.titulo).length > 110 ? 1 : 0); }, 0) + (escena.lead.length ? 1 : 0);
    var ctx = escasa(escena) ? contexto(0) : null;
    var guia = ctx ? (ctx.lista.length > 1 ? 'Elige cada punto y lee su contenido junto a la ilustración.' : 'Lee el contenido junto a la ilustración.') : guias[escena.layout === 'balanza' ? 'fichas' : escena.layout];
    if (escena.guia) guia = escena.guia;
    /* La tabla breve se ve completa: no hay pestañas que elegir. */
    if (escena.layout === 'tabla' && escena.bloques.length && escena.bloques.every(tablaBreve)) guia = 'Lee la tabla completa.';
    /* Sin nada que explorar (un solo texto a la vista o un caso) no hay barra de avance y la idea clave se ve desde el inicio. */
    var conAvance = total > 0 && !(ctx && ctx.lista.length === 1);
    /* En pantalla angosta las tarjetas que giran se recorren desplazándose (B.giro): su guía lo dice. */
    var angosta = escena.layout === 'giro' && !escena.guia ? '<span class="guia-angosta">Desliza hacia abajo: cada tarjeta se revela y se lee al pasar.</span>' : '';
    var cab = '<header class="guia"><p class="guia-texto">' + mano + '<span' + (angosta ? ' class="guia-ancha"' : '') + '>' + guia + '</span>' + angosta + '</p>' +
      (conAvance ? '<div class="avance" role="status"><span class="avance-rotulo">Exploración</span><span class="barra"><i></i></span><output>0 / ' + total + '</output></div>' : '') +
      '<button type="button" class="pantalla-completa" aria-label="Ver en pantalla completa"><i class="fas fa-expand" aria-hidden="true"></i><span>Pantalla completa</span></button></header>';
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
    raiz.className = 'ova layout-' + (ctx ? 'contexto' : escena.layout === 'balanza' ? 'fichas' : escena.layout) + (embebido ? ' embebido' : '') + (datos.sinHuecos ? ' sin-huecos' : '') +
      (marcoAncho() ? ' marco-ancho' : '') + (escena.siluetas ? ' con-siluetas' : '');
    /* Ilustración de la escena en un lugar que varía (Estándares interamericanos; Esteban, 28/10/2026: «a la izquierda, a la
       derecha, en el medio o atrás… de forma embebida para que no sea invasivo»). «arte» = {img, pos}: «izq» o «der», una columna
       propia junto a la mediación; «fondo», la ilustración tenue en la esquina inferior, detrás y sin recibir clics; «centro», en
       el nodo central del mapa mental. En las mediaciones que ya muestran la ilustración (texto con ilustración, fichas), «izq»
       la pasa a la izquierda del texto. Sin «arte», la escena queda como antes. */
    var claseArte = '';
    if (datos.tituloFuera && escena.layout === 'esquema') { /* la ilustración es la raíz del mapa conceptual */ }
    else if (arteEn('izq') || arteEn('der')) {
      if (IMAGEN[actual]) claseArte = ' arte-volteado';
      else {
        cuerpo = '<figure class="arte-escena" aria-hidden="true"><img src="' + srcImagen(escena.arte.img) + '" alt=""></figure><div class="escenario-contenido">' + cuerpo + '</div>';
        claseArte = ' arte-lado arte-' + escena.arte.pos;
      }
    } else if (arteEn('fondo')) {
      cuerpo = '<figure class="arte-escena arte-fondo-fig" aria-hidden="true"><img src="' + srcImagen(escena.arte.img) + '" alt=""></figure>' + cuerpo;
      claseArte = ' arte-fondo';
    }
    raiz.innerHTML = cab + '<section class="escenario' + claseArte + '" aria-label="Escena ' + (actual + 1) + '">' + cuerpo + '<div class="lector" hidden></div></section>' +
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
    raiz.querySelector('.pantalla-completa').addEventListener('click', pantallaCompleta);
    estadoPantalla();
    midiendo(function () { organizarGiros(); encajarTarjetas(); ajustarExtractos(); });
    /* Con las fuentes ya cargadas (Roboto es más ancha que la de reserva), todo se vuelve a encajar: el texto que cabía con la
       fuente de reserva podía quedar cortado. */
    if (document.fonts) document.fonts.ready.then(function () { window.dispatchEvent(new Event('resize')); });
    /* En una carga en frío (el iframe de Genially) una fuente puede terminar después de fonts.ready: se vuelve a encajar al
       terminar cada carga de fuentes. Las funciones de encaje parten siempre de cero, así que repetirlas no acumula cambios. */
    if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', function () { window.dispatchEvent(new Event('resize')); });
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
