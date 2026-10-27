/* Objetos jurídicos ilustrados · Audiencias preliminares · JP-OVA
   Lenguaje de la última versión aprobada de Ley 1826: figuras planas sin contorno, paleta de JP,
   sombra elíptica gris y acento óxido. Cada objeto se dibuja en una caja de 120 × 120 con la base
   en y = 120; las clases .anima-* dan el movimiento (base.css), que se apaga con reduced-motion. */
(function (global) {
  'use strict';
  var C = {
    marino: '#003F5E', teal: '#30615B', oxido: '#AD4D32', coral: '#F0CAC7', crema: '#F2F3B8',
    niebla: '#D7E4E6', hielo: '#E5F2F3', blanco: '#FFFFFF', celeste: '#9DC3CF', madera: '#8A5A3C',
    piso: '#DCEFEA', gris: '#C9D1D2', amarillo: '#E9C46A'
  };
  function sombra(w) { return '<ellipse cx="60" cy="119" rx="' + (w || 46) + '" ry="5" fill="' + C.gris + '" opacity=".7"/>'; }
  var O = {
    tribunal: function () {
      return sombra(56) +
        '<path d="M8 40 L60 12 L112 40 Z" fill="' + C.teal + '"/><rect x="12" y="40" width="96" height="9" fill="' + C.marino + '"/>' +
        '<g fill="' + C.niebla + '"><rect x="20" y="52" width="10" height="50"/><rect x="40" y="52" width="10" height="50"/><rect x="70" y="52" width="10" height="50"/><rect x="90" y="52" width="10" height="50"/></g>' +
        '<rect x="54" y="66" width="12" height="36" rx="5" fill="' + C.oxido + '"/>' +
        '<rect x="10" y="102" width="100" height="8" fill="' + C.marino + '"/><rect x="4" y="110" width="112" height="8" rx="2" fill="' + C.teal + '"/>' +
        '<circle cx="60" cy="30" r="5" fill="' + C.crema + '"/>';
    },
    balanza: function () {
      return sombra(40) +
        '<rect x="56" y="22" width="8" height="86" rx="3" fill="' + C.marino + '"/><path d="M36 116 Q60 98 84 116 Z" fill="' + C.marino + '"/>' +
        '<g class="anima-balanza"><rect x="14" y="26" width="92" height="6" rx="3" fill="' + C.teal + '"/>' +
        '<path d="M22 32 L10 70 M22 32 L34 70 M98 32 L86 70 M98 32 L110 70" stroke="' + C.marino + '" stroke-width="2"/>' +
        '<path d="M6 70 H38 Q36 84 22 84 Q8 84 6 70 Z" fill="' + C.oxido + '"/><path d="M82 70 H114 Q112 84 98 84 Q84 84 82 70 Z" fill="' + C.oxido + '"/></g>' +
        '<circle cx="60" cy="24" r="8" fill="' + C.crema + '" stroke="' + C.marino + '" stroke-width="3"/>';
    },
    mazo: function () {
      return sombra(50) +
        '<rect x="14" y="98" width="92" height="14" rx="5" fill="' + C.marino + '"/><rect x="24" y="88" width="72" height="12" rx="4" fill="' + C.oxido + '"/>' +
        '<g class="anima-mazo"><g transform="rotate(-32 70 54)"><rect x="66" y="44" width="9" height="58" rx="4" fill="' + C.madera + '"/>' +
        '<rect x="38" y="26" width="64" height="24" rx="6" fill="' + C.madera + '"/><rect x="45" y="26" width="10" height="24" fill="' + C.oxido + '"/><rect x="85" y="26" width="10" height="24" fill="' + C.oxido + '"/></g></g>';
    },
    expediente: function () {
      return sombra(46) +
        '<rect x="24" y="22" width="72" height="82" rx="5" fill="' + C.blanco + '"/><rect x="34" y="36" width="50" height="4" rx="2" fill="' + C.celeste + '"/><rect x="34" y="48" width="38" height="4" rx="2" fill="' + C.celeste + '"/>' +
        '<path d="M12 50 H46 L54 58 H108 V112 Q108 117 103 117 H17 Q12 117 12 112 Z" fill="' + C.teal + '"/>' +
        '<rect x="26" y="78" width="66" height="6" rx="3" fill="' + C.blanco + '" opacity=".85"/><rect x="26" y="92" width="44" height="5" rx="2.5" fill="' + C.blanco + '" opacity=".6"/>';
    },
    documento: function () {
      return sombra(36) +
        '<path d="M26 14 Q26 8 32 8 H74 L94 28 V110 Q94 116 88 116 H32 Q26 116 26 110 Z" fill="' + C.blanco + '" stroke="' + C.niebla + '" stroke-width="2"/>' +
        '<path d="M74 8 V28 H94 Z" fill="' + C.niebla + '"/>' +
        '<rect x="38" y="42" width="44" height="5" rx="2" fill="' + C.celeste + '"/><rect x="38" y="56" width="44" height="5" rx="2" fill="' + C.celeste + '"/><rect x="38" y="70" width="30" height="5" rx="2" fill="' + C.celeste + '"/>' +
        '<g class="anima-sello"><circle cx="76" cy="96" r="12" fill="' + C.oxido + '"/><path d="M70 96 l4 4 8 -9" fill="none" stroke="' + C.blanco + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>';
    },
    libros: function () {
      return sombra(50) +
        '<rect x="14" y="98" width="92" height="16" rx="3" fill="' + C.oxido + '"/><rect x="20" y="82" width="82" height="16" rx="3" fill="' + C.teal + '"/>' +
        '<rect x="12" y="66" width="88" height="16" rx="3" fill="' + C.marino + '"/><rect x="24" y="50" width="70" height="16" rx="3" fill="' + C.celeste + '"/>' +
        '<g fill="' + C.blanco + '" opacity=".75"><rect x="22" y="104" width="40" height="3" rx="1.5"/><rect x="30" y="88" width="34" height="3" rx="1.5"/><rect x="22" y="72" width="44" height="3" rx="1.5"/><rect x="32" y="56" width="30" height="3" rx="1.5"/></g>' +
        '<g class="anima-flota"><path d="M44 18 H86 V44 L65 36 L44 44 Z" fill="' + C.crema + '" stroke="' + C.oxido + '" stroke-width="2.5"/></g>';
    },
    reloj: function () {
      return sombra(34) +
        '<circle cx="60" cy="66" r="44" fill="' + C.teal + '"/><circle cx="60" cy="66" r="36" fill="' + C.blanco + '"/>' +
        '<g fill="' + C.marino + '"><rect x="58" y="34" width="4" height="7" rx="2"/><rect x="58" y="91" width="4" height="7" rx="2"/><rect x="28" y="64" width="7" height="4" rx="2"/><rect x="85" y="64" width="7" height="4" rx="2"/></g>' +
        '<g class="anima-aguja"><rect x="58" y="40" width="4" height="28" rx="2" fill="' + C.oxido + '"/></g><rect x="58" y="62" width="20" height="4" rx="2" fill="' + C.marino + '"/>' +
        '<circle cx="60" cy="66" r="5" fill="' + C.marino + '"/><rect x="52" y="14" width="16" height="10" rx="3" fill="' + C.marino + '"/>';
    },
    escudo: function () {
      return sombra(38) +
        '<path d="M60 8 L104 24 V60 Q100 96 60 114 Q20 96 16 60 V24 Z" fill="' + C.marino + '"/>' +
        '<path d="M60 20 L92 32 V60 Q89 88 60 102 Q31 88 28 60 V32 Z" fill="' + C.teal + '"/>' +
        '<g class="anima-sello"><path d="M44 60 l11 11 22 -24" fill="none" stroke="' + C.crema + '" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></g>';
    },
    puertaAbierta: function () {
      return sombra(46) +
        '<rect x="22" y="12" width="76" height="104" rx="4" fill="' + C.marino + '"/><rect x="30" y="20" width="60" height="96" fill="' + C.crema + '"/>' +
        '<g class="anima-puerta"><path d="M30 20 L62 30 V122 L30 116 Z" fill="' + C.oxido + '"/><circle cx="54" cy="72" r="3.5" fill="' + C.crema + '"/></g>' +
        '<path d="M66 100 l10 -6 l10 6" fill="none" stroke="' + C.teal + '" stroke-width="4" stroke-linecap="round"/>';
    },
    puertaCerrada: function () {
      return sombra(46) +
        '<rect x="22" y="12" width="76" height="104" rx="4" fill="' + C.marino + '"/><rect x="30" y="20" width="60" height="96" fill="' + C.oxido + '"/>' +
        '<rect x="38" y="30" width="44" height="30" rx="3" fill="' + C.blanco + '" opacity=".18"/><rect x="38" y="68" width="44" height="38" rx="3" fill="' + C.blanco + '" opacity=".18"/>' +
        '<circle cx="80" cy="68" r="4" fill="' + C.crema + '"/>' +
        '<g class="anima-flota"><rect x="44" y="2" width="58" height="20" rx="10" fill="' + C.teal + '"/><path d="M58 12 h30" stroke="' + C.blanco + '" stroke-width="4" stroke-linecap="round"/></g>';
    },
    megafono: function () {
      return sombra(40) +
        '<path d="M18 52 H40 L92 24 V100 L40 74 H18 Z" fill="' + C.oxido + '"/><rect x="14" y="50" width="12" height="26" rx="4" fill="' + C.marino + '"/>' +
        '<path d="M44 74 L50 106 H62 L58 80" fill="' + C.marino + '"/>' +
        '<g class="anima-ondas" fill="none" stroke="' + C.teal + '" stroke-width="5" stroke-linecap="round"><path d="M100 46 Q110 62 100 78"/><path d="M108 36 Q124 62 108 88"/></g>';
    },
    camara: function () {
      return sombra(44) +
        '<rect x="12" y="44" width="70" height="46" rx="8" fill="' + C.marino + '"/><path d="M82 56 L108 42 V92 L82 78 Z" fill="' + C.teal + '"/>' +
        '<circle cx="34" cy="36" r="12" fill="' + C.teal + '"/><circle cx="62" cy="36" r="12" fill="' + C.teal + '"/>' +
        '<g class="anima-parpadeo"><circle cx="24" cy="56" r="5" fill="' + C.oxido + '"/></g>' +
        '<path d="M46 90 L36 116 M46 90 L56 116" stroke="' + C.marino + '" stroke-width="4"/>';
    },
    telefono: function () {
      return sombra(30) +
        '<rect x="34" y="6" width="52" height="108" rx="10" fill="' + C.marino + '"/><rect x="40" y="18" width="40" height="80" rx="3" fill="' + C.blanco + '"/>' +
        '<g class="anima-mensajes"><rect x="44" y="28" width="26" height="12" rx="6" fill="' + C.celeste + '"/><rect x="50" y="46" width="26" height="12" rx="6" fill="' + C.coral + '"/><rect x="44" y="64" width="22" height="12" rx="6" fill="' + C.celeste + '"/></g>' +
        '<circle cx="60" cy="106" r="4" fill="' + C.crema + '"/>';
    },
    casa: function () {
      return sombra(50) +
        '<path d="M10 56 L60 16 L110 56 Z" fill="' + C.oxido + '"/><rect x="20" y="54" width="80" height="62" fill="' + C.crema + '"/>' +
        '<rect x="50" y="78" width="20" height="38" rx="2" fill="' + C.teal + '"/><rect x="28" y="66" width="16" height="16" rx="2" fill="' + C.celeste + '"/><rect x="76" y="66" width="16" height="16" rx="2" fill="' + C.celeste + '"/>' +
        '<g class="anima-flota"><path d="M92 6 l14 6 v12 q-2 12 -14 18 q-12 -6 -14 -18 v-12 z" fill="' + C.teal + '"/><path d="M86 22 l5 5 9 -10" fill="none" stroke="' + C.crema + '" stroke-width="3" stroke-linecap="round"/></g>';
    },
    lupa: function () {
      return sombra(38) +
        '<g class="anima-lupa"><circle cx="50" cy="50" r="32" fill="' + C.hielo + '" stroke="' + C.marino + '" stroke-width="9"/>' +
        '<path d="M36 44 h28 M36 56 h20" stroke="' + C.celeste + '" stroke-width="5" stroke-linecap="round"/>' +
        '<rect x="74" y="72" width="14" height="40" rx="6" fill="' + C.oxido + '" transform="rotate(-45 81 92)"/></g>';
    },
    comisaria: function () {
      return sombra(52) +
        '<rect x="14" y="40" width="92" height="76" fill="' + C.niebla + '"/><rect x="10" y="32" width="100" height="10" fill="' + C.teal + '"/>' +
        '<g fill="' + C.celeste + '"><rect x="24" y="52" width="16" height="14"/><rect x="52" y="52" width="16" height="14"/><rect x="80" y="52" width="16" height="14"/><rect x="24" y="76" width="16" height="14"/><rect x="80" y="76" width="16" height="14"/></g>' +
        '<rect x="50" y="80" width="20" height="36" fill="' + C.marino + '"/>' +
        '<rect x="58" y="2" width="3" height="32" fill="' + C.marino + '"/><g class="anima-bandera"><path d="M61 4 H88 L82 12 L88 20 H61 Z" fill="' + C.oxido + '"/></g>';
    },
    carpetas: function () {
      return sombra(54) +
        '<g class="anima-abanico">' +
        '<path d="M6 40 H30 L36 46 H58 V112 H6 Z" fill="' + C.oxido + '"/><path d="M34 32 H58 L64 38 H86 V112 H34 Z" fill="' + C.teal + '"/>' +
        '<path d="M62 24 H86 L92 30 H114 V112 H62 Z" fill="' + C.marino + '"/></g>' +
        '<rect x="0" y="104" width="120" height="12" rx="3" fill="' + C.madera + '"/>';
    },
    escalones: function () {
      return sombra(54) +
        '<rect x="8" y="88" width="34" height="28" fill="' + C.celeste + '"/><rect x="42" y="64" width="34" height="52" fill="' + C.teal + '"/><rect x="76" y="40" width="34" height="76" fill="' + C.marino + '"/>' +
        '<g fill="' + C.blanco + '" font-family="Montserrat,Arial,sans-serif" font-weight="800" font-size="15" text-anchor="middle"><text x="25" y="108">i</text><text x="59" y="96">ii</text><text x="93" y="84">iii</text></g>' +
        '<g class="anima-flota"><path d="M93 6 l4 9 10 1 -8 6 3 10 -9 -5 -9 5 3 -10 -8 -6 10 -1 z" fill="' + C.amarillo + '"/></g>';
    },
    corazon: function () {
      return sombra(38) +
        '<path d="M60 8 L104 24 V60 Q100 96 60 114 Q20 96 16 60 V24 Z" fill="' + C.teal + '"/>' +
        '<g class="anima-latido"><path d="M60 92 C30 72 30 44 46 42 C54 41 58 47 60 52 C62 47 66 41 74 42 C90 44 90 72 60 92 Z" fill="' + C.coral + '"/></g>';
    },
    personas: function () {
      var p = function (x, c, h) {
        return '<circle cx="' + x + '" cy="' + (116 - h - 12) + '" r="11" fill="' + C.madera + '"/>' +
          '<path d="M' + (x - 14) + ' 116 V' + (116 - h + 14) + ' Q' + (x - 14) + ' ' + (116 - h) + ' ' + x + ' ' + (116 - h) + ' Q' + (x + 14) + ' ' + (116 - h) + ' ' + (x + 14) + ' ' + (116 - h + 14) + ' V116 Z" fill="' + c + '"/>';
      };
      return sombra(56) + '<g class="anima-flota">' + p(22, C.oxido, 50) + p(60, C.teal, 62) + p(98, C.marino, 54) + '</g>';
    },
    planta: function () {
      return '<path d="M46 116 L50 92 H70 L74 116 Z" fill="' + C.oxido + '"/>' +
        '<g class="anima-planta" fill="' + C.teal + '"><path d="M60 92 Q40 66 46 40 Q62 64 60 92 Z"/><path d="M60 92 Q78 70 82 46 Q66 66 60 92 Z"/><path d="M60 92 Q58 60 62 30 Q70 62 60 92 Z" fill="#4A7F77"/></g>';
    }
  };
  /* Dibuja un objeto en (x, y) con escala s; y es la base. */
  function dibujar(nombre, x, y, s, clase) {
    var f = O[nombre] || O.documento;
    s = s || 1;
    /* La posición va en el grupo exterior; el interior se anima sin perderla. */
    return '<g transform="translate(' + (x - 60 * s) + ' ' + (y - 120 * s) + ') scale(' + s + ')"><g class="objeto ' + (clase || '') + '" data-objeto="' + nombre + '">' + f() + '</g></g>';
  }
  global.Objetos = { C: C, lista: O, dibujar: dibujar };
})(window);
