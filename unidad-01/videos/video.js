/* Reproductor de casos en video · JP-OVA (reunión con Juan, 27/10/2026)
   Lee la lista de videos de la unidad (script#videos) y muestra el pedido en ?video=ID: versión normal y versión con
   interpretación en lengua de señas, cada una con sus subtítulos (<track kind="subtitles">). Mientras JP no entregue
   los archivos, el marco anuncia el recurso pendiente y la ruta prevista; nunca se inventa el contenido del video. */
(function () {
  'use strict';
  var lista = JSON.parse(document.getElementById('videos').textContent);
  var raiz = document.querySelector('[data-video]');
  var video = raiz.querySelector('video'), fuente = video.querySelector('source'), pista = video.querySelector('track');
  var pendiente = raiz.querySelector('.video-pendiente'), botones = raiz.querySelectorAll('.video-version');
  var pedido = new URLSearchParams(location.search).get('video');
  var actual = lista.filter(function (v) { return v.id === pedido; })[0];
  var ESTADOS = { pendiente_confirmacion: 'Pendiente de confirmación de JP', confirmado: 'Pendiente de entrega del video', entregado: '' };

  function mostrarPendiente(v, version, motivo) {
    var m = v[version] || {};
    pendiente.hidden = false; video.hidden = true;
    pendiente.querySelector('.pendiente-titulo').textContent = motivo;
    pendiente.querySelector('.pendiente-detalle').textContent = 'Archivo previsto: ' + (m.src || '—') + ' · Subtítulos: ' + (m.subtitulos || '—');
  }
  function cargar(v, version) {
    var m = v[version] || {};
    botones.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.version === version)); });
    video.pause();
    if (!m.src || v.estado !== 'entregado') {
      mostrarPendiente(v, version, v.estado === 'pendiente_confirmacion' ? 'Caso pendiente de confirmación de JP' : 'Video pendiente de entrega');
      return;
    }
    pendiente.hidden = true; video.hidden = false;
    fuente.src = m.src;
    if (m.subtitulos) { pista.src = m.subtitulos; pista.default = true; } else pista.removeAttribute('src');
    video.load();
    video.textTracks && video.textTracks[0] && (video.textTracks[0].mode = 'showing');
  }
  /* Si el archivo no existe o no se puede reproducir, se informa en el marco en lugar de dejar un reproductor vacío. */
  fuente.addEventListener('error', function () { if (actual) mostrarPendiente(actual, raiz.dataset.version, 'No se encontró el archivo del video'); });
  video.addEventListener('error', function () { if (actual) mostrarPendiente(actual, raiz.dataset.version, 'No se encontró el archivo del video'); });

  if (actual) {
    raiz.querySelector('.video-titulo').textContent = actual.titulo || 'Título pendiente de JP';
    var estado = raiz.querySelector('.video-estado');
    if (ESTADOS[actual.estado]) { estado.hidden = false; estado.textContent = ESTADOS[actual.estado]; }
    botones.forEach(function (b) {
      b.addEventListener('click', function () { raiz.dataset.version = b.dataset.version; cargar(actual, b.dataset.version); });
    });
    raiz.dataset.version = 'normal';
    cargar(actual, 'normal');
    return;
  }

  /* Sin ?video: lista de revisión con el estado de cada caso de la unidad. */
  raiz.classList.add('modo-lista');
  raiz.querySelector('.video-titulo').textContent = 'Videos de casos de la unidad (' + lista.length + ')';
  raiz.querySelector('.video-marco').hidden = true; raiz.querySelector('.video-opciones').hidden = true;
  var nav = raiz.querySelector('.video-lista');
  nav.hidden = false;
  nav.innerHTML = lista.map(function (v) {
    return '<a class="video-item" href="?video=' + encodeURIComponent(v.id) + '"><span class="item-id">' + v.id + '</span>' +
      '<span class="item-ubica">' + v.ubicacion + '</span><span class="item-estado e-' + v.estado + '">' + (ESTADOS[v.estado] || 'Entregado') + '</span></a>';
  }).join('');
})();
