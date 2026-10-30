/* Reproductor de casos en video · JP-OVA (reuniones con Juan del 27 y del 30/10/2026)
   Juan (30/10/2026): «que siempre salga el video sin lenguaje de señas, pero que tenga un botoncito… para ver el video con
   lenguaje de señas», con la URL lista para poner el video después. Lee la lista de la unidad (script#videos) y muestra el
   pedido en ?video=ID: la versión sin lenguaje de señas por defecto y la otra al pulsar su botón, cada una con sus
   subtítulos (<track kind="subtitles">). Basta copiar el archivo con su nombre en medios/ para que se vea, sin regenerar:
   si la ruta está vacía o el archivo aún no existe, el marco dice «Video en producción», sin errores. Con &revision=1 se
   ven el título, el estado y las rutas previstas. Nunca se inventa el contenido del video. */
(function () {
  'use strict';
  var lista = JSON.parse(document.getElementById('videos').textContent);
  var raiz = document.querySelector('[data-video]');
  var video = raiz.querySelector('video'), fuente = video.querySelector('source'), pista = video.querySelector('track');
  var pendiente = raiz.querySelector('.video-pendiente'), cc = raiz.querySelector('.video-cc');
  var botones = raiz.querySelectorAll('.video-version');
  var params = new URLSearchParams(location.search);
  var pedido = params.get('video'), revision = params.has('revision');
  var actual = lista.filter(function (v) { return v.id === pedido; })[0];
  var ESTADOS = { pendiente_confirmacion: 'Pendiente de confirmación de JP', confirmado: 'Pendiente de entrega del video', entregado: 'Entregado' };
  var AVISOS = {
    normal: ['Video en producción', 'Muy pronto podrás ver aquí este video.'],
    senas: ['Video con lenguaje de señas en producción', 'Mientras tanto, puedes verlo sin lenguaje de señas.']
  };

  function avisar(v, version) {
    var m = v[version] || {}, t = AVISOS[version] || AVISOS.normal;
    video.pause(); video.hidden = true; cc.hidden = true;
    pendiente.hidden = false;
    pendiente.querySelector('.pendiente-titulo').textContent = t[0];
    pendiente.querySelector('.pendiente-detalle').textContent = t[1];
    var ruta = pendiente.querySelector('.pendiente-ruta');
    ruta.hidden = !revision;
    ruta.textContent = v.id ? 'Archivo previsto: ' + (m.src || 'sin ruta') + ' · Subtítulos: ' + (m.subtitulos || 'sin ruta')
      : 'El video «' + pedido + '» no está en la lista de esta unidad.';
  }
  function cargar(v, version) {
    var m = v[version] || {};
    raiz.dataset.version = version;
    botones.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.version === version)); });
    video.pause();
    if (!m.src) { avisar(v, version); return; }
    pendiente.hidden = true; video.hidden = false; cc.hidden = !m.subtitulos;
    fuente.setAttribute('src', m.src);
    /* Una pista nueva por versión: el navegador no siempre recarga una <track> a la que solo se le cambia el src. */
    var nueva = pista.cloneNode(false);
    if (m.subtitulos) nueva.setAttribute('src', m.subtitulos); else nueva.removeAttribute('src');
    nueva.default = !!m.subtitulos;
    nueva.addEventListener('error', function () { cc.hidden = true; });
    video.replaceChild(nueva, pista); pista = nueva;
    video.load();
  }
  /* El archivo que falta o no se puede reproducir avisa en el marco, solo si sigue siendo el de la versión elegida. */
  function fallo() {
    var m = actual && actual[raiz.dataset.version];
    if (m && fuente.getAttribute('src') === m.src) avisar(actual, raiz.dataset.version);
  }
  fuente.addEventListener('error', fallo);
  video.addEventListener('error', fallo);
  video.addEventListener('loadedmetadata', function () {
    if (video.textTracks && video.textTracks[0] && pista.getAttribute('src')) video.textTracks[0].mode = 'showing';
  });

  if (pedido) {
    var v = actual || { id: '' };
    if (revision) {
      raiz.querySelector('.video-cab').hidden = false;
      raiz.querySelector('.video-titulo').textContent = v.titulo || v.ubicacion || 'Título pendiente de JP';
      var estado = raiz.querySelector('.video-estado');
      if (ESTADOS[v.estado]) { estado.hidden = false; estado.textContent = ESTADOS[v.estado]; }
    }
    botones.forEach(function (b) {
      b.addEventListener('click', function () { cargar(v, b.dataset.version); });
    });
    cargar(v, 'normal');
    return;
  }

  /* Sin ?video: lista de revisión con el estado de cada caso de la unidad. */
  raiz.classList.add('modo-lista');
  raiz.querySelector('.video-cab').hidden = false;
  raiz.querySelector('.video-titulo').textContent = 'Videos de casos de la unidad (' + lista.length + ')';
  raiz.querySelector('.video-marco').hidden = true; raiz.querySelector('.video-opciones').hidden = true;
  var nav = raiz.querySelector('.video-lista');
  nav.hidden = false;
  nav.innerHTML = lista.map(function (v) {
    return '<a class="video-item" href="?video=' + encodeURIComponent(v.id) + '&amp;revision=1"><span class="item-id">' + v.id + '</span>' +
      '<span class="item-ubica">' + v.ubicacion + '</span><span class="item-estado e-' + v.estado + '">' + (ESTADOS[v.estado] || 'Entregado') + '</span></a>';
  }).join('');
})();
