/**
 * ==== UTILIDADES ====
 * Helpers de cálculo, formato y mecánicas de nivel/daño.
 * @module utils
 */
(function () {
  'use strict';
  var OU = window.OU = window.OU || {};

  var $ = function (s, p) { return (p || document).querySelector(s); };
  var $$ = function (s, p) { return Array.prototype.slice.call((p || document).querySelectorAll(s)); };

  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var rndi = function (a, b) { return Math.floor(rnd(a, b + 1)); };
  var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  var fmt = function (n) { return Math.round(n).toLocaleString('es-ES'); };

  function valuesAt(cardId, level) {
    var c = OU.CARD_BY_ID[cardId], g = 1 + (level - 1) * 0.18;
    return {
      hp: Math.round(c.hp * g),
      atk: Math.round(c.atk * g),
      def: Math.round(c.def * g),
      spd: c.spd
    };
  }

  function powerOf(cardId, level) {
    var v = valuesAt(cardId, level);
    return Math.round(v.hp * 0.2 + v.atk + v.def * 1.2);
  }

  function abDesc(a, cardId) {
    var c = OU.CARD_BY_ID[cardId];
    if (a.t === 'strike') return 'Inflige un golpe devastador que causa ' + Math.round(a.s * 100) + '% del ATK como daño a un enemigo.';
    if (a.t === 'aoe') return 'Golpea a TODOS los enemigos causando ' + Math.round(a.s * 100) + '% del ATK como daño a cada uno.';
    if (a.t === 'heal') return 'Restaura ' + Math.round(a.s * 100) + '% del ATK como vida del aliado más herido.';
    if (a.t === 'shield') return 'Cubre al aliado más vulnerable con un escudo igual a ' + Math.round(6 * a.s) + 'x su DEF.';
    if (a.t === 'buff') return 'Aumenta el ATK de todo el equipo un ' + Math.round(a.s * 30) + '% durante 2 turnos.';
    return '';
  }

  /**
   * Costo para subir de nivel con duplicados + oro.
   * A medida que la carta sube de nivel se encarece MUCHO más rápido
   * (crecimiento cuasi exponencial): las últimas mejoras son las más caras.
   */
  function upgradeCost(cardId, level) {
    var c = OU.CARD_BY_ID[cardId];
    var F = OU.RARITY_FACTOR[c.r];
    var base = (c.hp * 0.2 + c.atk + c.def * 1.2);
    var lvlFactor = Math.pow(1.035, level) * (1.35 + level * 0.52);
    var gold = Math.max(40, Math.round(base * lvlFactor * (0.5 + F * 0.26)));
    var dupes = Math.max(1, Math.round(level * (0.6 + F * 0.18)));
    return { dupes: dupes, gold: gold };
  }

  /**
   * Costo para subir 1 nivel usando SOLO oro (sin duplicados).
   * Perfecto para dioses y titanes, cuyos duplicados son rarísimos:
   * pagas más oro pero no dependes del azar. Un poco más caro por cada nivel.
   */
  function goldOnlyCost(cardId, level) {
    var st = upgradeCost(cardId, level);
    var mult = 2.1 + Math.min(level, 24) * 0.09;
    return Math.max(150, Math.round(st.gold * mult));
  }

  /**
   * Costo de entrenamiento: para subir 1 nivel necesitamos acumular XP.
   * Subir con XP es más lento pero no gasta duplicados.
   */
  function trainCost(cardId, level) {
    var c = OU.CARD_BY_ID[cardId];
    var F = OU.RARITY_FACTOR[c.r];
    var base = (c.hp * 0.2 + c.atk + c.def * 1.2);
    return Math.round(base * 0.45 * Math.pow(level, 1.05) * (0.5 + F * 0.14));
  }

  function rollRarity(pack) {
    var w = pack.w, keys = Object.keys(w);
    var r = Math.random(), acc = 0;
    for (var i = 0; i < keys.length; i++) {
      acc += w[keys[i]];
      if (r <= acc) return keys[i];
    }
    return 'normal';
  }

  function rollRarityCard(r) {
    var pool = OU.CARDS_BY_RAR[r];
    return pick(pool).id;
  }

  function rollCard(p) {
    return rollRarityCard(rollRarity(p));
  }

  /** Genera las extracciones de un sobre, aplicando garantías. */
  function generatePulls(p) {
    var arr = [];
    for (var i = 0; i < p.count; i++) arr.push(rollCard(p));
    if (p.guarantee > 0 && !arr.some(function (id) {
      return OU.RAR[OU.CARD_BY_ID[id].r].order >= p.guarantee;
    })) {
      arr[p.count - 1] = rollRarityCard(Object.keys(OU.RAR)[p.guarantee]);
    }
    return arr;
  }

  function rewardOf(idx) {
    var s = idx + 1;
    return {
      gold: Math.round(260 + s * 150 + s * s * 8),
      xp: Math.round(60 + s * 30 + s * s * 3)
    };
  }

  function rarityOrder(a, b) {
    var o = OU.RAR[OU.CARD_BY_ID[b].r].order - OU.RAR[OU.CARD_BY_ID[a].r].order;
    return o || (a < b ? 1 : -1);
  }

  function xpNeed(lvl) { return Math.round(80 + lvl * 140); }

  function imgAlt(cardId) {
    var chain = OU.IMG[cardId];
    return (chain && chain.length) ? chain[chain.length - 1] : OU.CARD_BY_ID[cardId].ic;
  }

  OU.UTIL = {
    $: $,
    $$: $$,
    sleep: sleep,
    rnd: rnd,
    rndi: rndi,
    pick: pick,
    clamp: clamp,
    fmt: fmt,
    valuesAt: valuesAt,
    powerOf: powerOf,
    abDesc: abDesc,
    upgradeCost: upgradeCost,
    goldOnlyCost: goldOnlyCost,
    trainCost: trainCost,
    rollRarity: rollRarity,
    rollRarityCard: rollRarityCard,
    rollCard: rollCard,
    generatePulls: generatePulls,
    rewardOf: rewardOf,
    rarityOrder: rarityOrder,
    xpNeed: xpNeed,
    imgAlt: imgAlt
  };
})();