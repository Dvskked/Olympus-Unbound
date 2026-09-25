// Arte de las cartas: se usan SOLO las imagenes locales de la carpeta /img
// (creadas a mano), sin referencias externas. Si no hay imagen, se muestra emoji.
// Organización de carpetas: img/personajes/<rareza>/<id>.png, img/minijuegos/,
// img/sobres/, img/extras/.
(function () {
  "use strict";
  var OU = window.OU = window.OU || {};
  OU.IMG = {
    "hop": ["img/hop.png", "img/hop.jpg", "img/hop.webp"],
    "gt": ["img/gt.png", "img/gt.jpg", "img/gt.webp"],
    "arq": ["img/arq.png", "img/arq.jpg", "img/arq.webp"],
    "pela": ["img/pela.png", "img/pela.jpg", "img/pela.webp"],
    "sat": ["img/sat.png", "img/sat.jpg", "img/sat.webp"],
    "delf": ["img/delf.png", "img/delf.jpg", "img/delf.webp"],
    "gc": ["img/gc.png", "img/gc.jpg", "img/gc.webp"],
    "mirm": ["img/mirm.png", "img/mirm.jpg", "img/mirm.webp"],
    "ant": ["img/ant.png", "img/ant.jpg", "img/ant.webp"],
    "pal": ["img/pal.png", "img/pal.jpg", "img/pal.webp"],
    "cas": ["img/cas.png", "img/cas.jpg", "img/cas.webp"],
    "tel": ["img/tel.png", "img/tel.jpg", "img/tel.webp"],
    "lan": ["img/lan.png", "img/lan.jpg", "img/lan.webp"],
    "pirit": ["img/pirit.png", "img/pirit.jpg", "img/pirit.webp"],
    "pod": ["img/pod.png", "img/pod.jpg", "img/pod.webp"],
    "mac": ["img/mac.png", "img/mac.jpg", "img/mac.webp"],
    "prt": ["img/prt.png", "img/prt.jpg", "img/prt.webp"],
    "dri": ["img/dri.png", "img/dri.jpg", "img/dri.webp"],
    // ---- HÉROES: arte local en img/personajes/heroes/ (transparente) ----
    "aqu":   ["img/personajes/heroes/aquiles-removebg-preview.png", "img/aqu.png", "img/aqu.jpg", "img/aqu.webp"],
    "her":   ["img/personajes/heroes/hercules-removebg-preview.png", "img/her.png", "img/her.jpg", "img/her.webp"],
    "per":   ["img/personajes/heroes/perseo-removebg-preview.png", "img/per.png", "img/per.jpg", "img/per.webp"],
    "tes":   ["img/personajes/heroes/teseo-removebg-preview.png", "img/tes.png", "img/tes.jpg", "img/tes.webp"],
    "uli":   ["img/personajes/heroes/ulises-removebg-preview.png", "img/uli.png", "img/uli.jpg", "img/uli.webp"],
    "ata":   ["img/personajes/heroes/atalanta-removebg-preview.png", "img/ata.png", "img/ata.jpg", "img/ata.webp"],
    "orf":   ["img/personajes/heroes/orfeo-removebg-preview.png", "img/orf.png", "img/orf.jpg", "img/orf.webp"],
    "and":   ["img/personajes/heroes/andromeda-removebg-preview%20(1).png", "img/and.png", "img/and.jpg", "img/and.webp"],
    "jas":   ["img/personajes/heroes/jason-removebg-preview%20(1).png", "img/jas.png", "img/jas.jpg", "img/jas.webp"],
    "hec":   ["img/personajes/heroes/hector-removebg-preview.png", "img/hec.png", "img/hec.jpg", "img/hec.webp"],
    "ajx":   ["img/personajes/heroes/ayax-removebg-preview.png", "img/ajx.png", "img/ajx.jpg", "img/ajx.webp"],
    "dim":   ["img/personajes/heroes/diomedes-removebg-preview.png", "img/dim.png", "img/dim.jpg", "img/dim.webp"],
    "men":   ["img/personajes/heroes/menelao-removebg-preview.png", "img/men.png", "img/men.jpg", "img/men.webp"],
    "bel":   ["img/personajes/heroes/belerofonte-removebg-preview.png", "img/bel.png", "img/bel.jpg", "img/bel.webp"],
    "ene":   ["img/personajes/heroes/eneas-removebg-preview.png", "img/ene.png", "img/ene.jpg", "img/ene.webp"],
    "pele":  ["img/personajes/heroes/peleo-removebg-preview.png", "img/pele.png", "img/pele.jpg", "img/pele.webp"],
    "mele":  ["img/personajes/heroes/meleagro-removebg-preview.png", "img/mele.png", "img/mele.jpg", "img/mele.webp"],
    "anti":  ["img/personajes/heroes/antiope-removebg-preview.png", "img/anti.png", "img/anti.jpg", "img/anti.webp"],
    "cent":  ["img/personajes/heroes/quiron-removebg-preview.png", "img/cent.png", "img/cent.jpg", "img/cent.webp"],
    "sire":  ["img/personajes/heroes/sirena-removebg-preview.png", "img/sire.png", "img/sire.jpg", "img/sire.webp"],
    "arp":   ["img/personajes/heroes/arpia-removebg-preview.png", "img/arp.png", "img/arp.jpg", "img/arp.webp"],
    "gor":   ["img/personajes/heroes/gorgona-removebg-preview.png", "img/gor.png", "img/gor.jpg", "img/gor.webp"],
    "qui":   ["img/personajes/heroes/filoctetes-removebg-preview.png", "img/qui.png", "img/qui.jpg", "img/qui.webp"],
    "fil":   ["img/personajes/heroes/nestor-removebg-preview.png", "img/fil.png", "img/fil.jpg", "img/fil.webp"],
    "zus": ["img/personajes/dioses/zeus-removebg-preview.png", "img/zus.png", "img/zus.jpg", "img/zus.webp"],
    "pos": ["img/personajes/dioses/poseidon-removebg-preview.png", "img/pos.png", "img/pos.jpg", "img/pos.webp"],
    "had": ["img/personajes/dioses/hades-removebg-preview.png", "img/had.png", "img/had.jpg", "img/had.webp"],
    "ate": ["img/personajes/dioses/atenea-removebg-preview.png", "img/ate.png", "img/ate.jpg", "img/ate.webp"],
    "ars": ["img/personajes/dioses/ares-removebg-preview.png", "img/ars.png", "img/ars.jpg", "img/ars.webp"],
    "art": ["img/personajes/dioses/artemisa-removebg-preview.png", "img/art.png", "img/art.jpg", "img/art.webp"],
    "hef": ["img/personajes/dioses/hefesto-removebg-preview.png", "img/hef.png", "img/hef.jpg", "img/hef.webp"],
    "apo": ["img/personajes/dioses/apolo-removebg-preview.png", "img/apo.png", "img/apo.jpg", "img/apo.webp"],
    "hera": ["img/personajes/dioses/hera-removebg-preview.png", "img/hera.png", "img/hera.jpg", "img/hera.webp"],
    "herm": ["img/personajes/dioses/hermes-removebg-preview.png", "img/herm.png", "img/herm.jpg", "img/herm.webp"],
    "dion": ["img/personajes/dioses/dioniso-removebg-preview.png", "img/dion.png", "img/dion.jpg", "img/dion.webp"],
    "dem": ["img/personajes/dioses/demeter-removebg-preview.png", "img/dem.png", "img/dem.jpg", "img/dem.webp"],
    "afr": ["img/personajes/dioses/afrodita-removebg-preview.png", "img/afr.png", "img/afr.jpg", "img/afr.webp"],
    "eol": ["img/personajes/dioses/eolo-removebg-preview.png", "img/eol.png", "img/eol.jpg", "img/eol.webp"],
    "eos": ["img/personajes/dioses/eos-removebg-preview.png", "img/eos.png", "img/eos.jpg", "img/eos.webp"],
    "iris": ["img/personajes/dioses/iris-removebg-preview.png", "img/iris.png", "img/iris.jpg", "img/iris.webp"],
    "cro": ["img/personajes/titanes/cronos.png", "img/cro.png", "img/cro.jpg", "img/cro.webp"],
    "oce": ["img/personajes/titanes/oceano.png", "img/oce.png", "img/oce.jpg", "img/oce.webp"],
    "hip": ["img/personajes/titanes/hiperion.png", "img/hip.png", "img/hip.jpg", "img/hip.webp"],
    "jap": ["img/personajes/titanes/japeto.png", "img/jap.png", "img/jap.jpg", "img/jap.webp"],
    "atl": ["img/personajes/titanes/atlas.png", "img/atl.png", "img/atl.jpg", "img/atl.webp"],
    "cri": ["img/personajes/titanes/crio.png", "img/cri.png", "img/cri.jpg", "img/cri.webp"],
    "gaya": ["img/personajes/primordiales/gea.png", "img/gaya.png", "img/gaya.jpg", "img/gaya.webp"],
    "our": ["img/personajes/primordiales/urano.png", "img/our.png", "img/our.jpg", "img/our.webp"],
    "nix": ["img/personajes/primordiales/nix.png", "img/nix.png", "img/nix.jpg", "img/nix.webp"],
    "ereb": ["img/personajes/primordiales/erebo.png", "img/ereb.png", "img/ereb.jpg", "img/ereb.webp"],
    "tar": ["img/personajes/primordiales/tartaro.png", "img/tar.png", "img/tar.jpg", "img/tar.webp"],
    "teth": ["img/personajes/titanes/tetis.png", "img/teth.png", "img/teth.jpg", "img/teth.webp"],
    "thes": ["img/personajes/titanes/temis.png", "img/thes.png", "img/thes.jpg", "img/thes.webp"],
    "mnem": ["img/personajes/titanes/mnemosine.png", "img/mnem.png", "img/mnem.jpg", "img/mnem.webp"],
    "rhoa": ["img/personajes/titanes/rea.png", "img/rhoa.png", "img/rhoa.jpg", "img/rhoa.webp"],
    "phoeb": ["img/personajes/titanes/febe.png", "img/phoeb.png", "img/phoeb.jpg", "img/phoeb.webp"],
    "prom": ["img/personajes/titanes/prometeo.png", "img/prom.png", "img/prom.jpg", "img/prom.webp"],
    "epim": ["img/personajes/titanes/epimeteo.png", "img/epim.png", "img/epim.jpg", "img/epim.webp"],
    "astra": ["img/personajes/titanes/astro.png", "img/astra.png", "img/astra.jpg", "img/astra.webp"],
    "pers": ["img/personajes/titanes/perses.png", "img/pers.png", "img/pers.jpg", "img/pers.webp"],
    "dion2": ["img/personajes/titanes/dione.png", "img/dion2.png", "img/dion2.jpg", "img/dion2.webp"],
    "ponto": ["img/personajes/primordiales/ponto.png", "img/ponto.png", "img/ponto.jpg", "img/ponto.webp"],
    "teu": ["img/teu.png", "img/teu.jpg", "img/teu.webp"],
    "frix": ["img/frix.png", "img/frix.jpg", "img/frix.webp"],
    "hele": ["img/hele.png", "img/hele.jpg", "img/hele.webp"],
    "teocl": ["img/teocl.png", "img/teocl.jpg", "img/teocl.webp"],
    "ido": ["img/ido.png", "img/ido.jpg", "img/ido.webp"],
    "polix": ["img/polix.png", "img/polix.jpg", "img/polix.webp"],
    "pan": ["img/personajes/dioses/pan-removebg-preview.png", "img/pan.png", "img/pan.jpg", "img/pan.webp"],
    "hekat": ["img/personajes/dioses/hecate-removebg-preview.png", "img/hekat.png", "img/hekat.jpg", "img/hekat.webp"],
    "nike": ["img/personajes/dioses/nike-removebg-preview.png", "img/nike.png", "img/nike.jpg", "img/nike.webp"],
    "eris": ["img/personajes/dioses/eris-removebg-preview.png", "img/eris.png", "img/eris.jpg", "img/eris.webp"],
    "hebe": ["img/personajes/dioses/hebe-removebg-preview.png", "img/hebe.png", "img/hebe.jpg", "img/hebe.webp"],
    "hipno": ["img/personajes/dioses/hipnos-removebg-preview.png", "img/hipno.png", "img/hipno.jpg", "img/hipno.webp"],
    "chaos": ["img/personajes/primordiales/caos.png", "img/chaos.png", "img/chaos.jpg", "img/chaos.webp"],
    "eter": ["img/personajes/primordiales/eter.png", "img/eter.png", "img/eter.jpg", "img/eter.webp"],
    "hemer": ["img/personajes/primordiales/hemera.png", "img/hemer.png", "img/hemer.jpg", "img/hemer.webp"],
    "eros": ["img/personajes/primordiales/eros.png", "img/eros.png", "img/eros.jpg", "img/eros.webp"],
    "anank": ["img/personajes/primordiales/ananke.png", "img/anank.png", "img/anank.jpg", "img/anank.webp"],
    "tifon": ["img/personajes/titanes/tifon.png", "img/tifon.png", "img/tifon.jpg", "img/tifon.webp"],
    "ofion": ["img/personajes/titanes/ofion.png", "img/ofion.png", "img/ofion.jpg", "img/ofion.webp"],
    "eurin": ["img/personajes/titanes/eurinome.png", "img/eurin.png", "img/eurin.jpg", "img/eurin.webp"],
    "fanes": ["img/personajes/primordiales/fanes.png", "img/fanes.png", "img/fanes.jpg", "img/fanes.webp"],
    "ekidna": ["img/personajes/titanes/equidna.png", "img/ekidna.png", "img/ekidna.jpg", "img/ekidna.webp"],
    "andre": ["img/personajes/creador/creador.png", "img/andre.png", "img/creator.png", "img/andres.png"]
  };

  /**
   * Sprites animados de batalla (hoja 6 columnas × 5 filas, PNG transparente).
   * Cada personaje con sprite tiene su hoja en img/sprites/<id>/sprite.png.
   * `frames` son los 30 rectángulos [x, y, ancho, alto] de cada celda, en orden
   * de filas: FILA 1 reposo, 2 avance, 3 ataque, 4 daño(1-3)+muerte(4-6), 5 habilidad.
   * Mientras el retrato de la carta sigue en img/, aquí SOLO vive el combate.
   */
  // Sprites animados: hoja 6 col × 5 filas (548×455) sobre la misma cuadrícula.
  // FILA 1 reposo, 2 avance, 3 ataque, 4 daño(1-3)+muerte(4-6), 5 habilidad.
  var gridFrames = [
    [22, 13, 48, 91], [112, 13, 48, 78], [205, 13, 48, 91], [296, 13, 48, 78], [387, 13, 48, 91], [478, 13, 48, 78],
    [27, 104, 51, 77], [115, 104, 56, 78], [202, 104, 58, 89], [293, 104, 59, 78], [384, 104, 59, 89], [479, 104, 55, 89],
    [22, 199, 90, 84], [112, 194, 90, 89], [202, 193, 70, 90], [279, 195, 103, 78], [382, 193, 53, 80], [474, 193, 49, 80],
    [22, 283, 90, 88], [112, 283, 49, 88], [205, 283, 48, 88], [283, 289, 99, 71], [382, 312, 91, 51], [473, 296, 64, 68],
    [22, 371, 90, 83], [112, 371, 90, 83], [202, 371, 77, 83], [279, 372, 103, 82], [382, 371, 91, 79], [473, 371, 71, 83]
  ];
  OU.SPRITES = {
    andre: { src: 'img/sprites/creador/creador.png', frames: gridFrames },
    ponto: { src: 'img/sprites/primordial/ponto.png', frames: gridFrames }
  };
})();