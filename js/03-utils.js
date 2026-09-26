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
    /* Delegamos en la fórmula compartida de los datos: así el poder que se
       muestra en la campaña es, literalmente, el que entra en combate. */
    if (OU.cardPowerAt) return OU.cardPowerAt(cardId, level);
    var v = valuesAt(cardId, level);
    return Math.round(v.hp * 0.2 + v.atk + v.def * 1.2);
  }

  /* ---------- NIVEL GENERAL DEL EQUIPO ----------
     No es el nivel del jugador (ese solo da gemas). Son DOS medidas de la
     MISMA cosa, la colección completa, para que nunca falle la promesa de
     «subir una carta sube el nivel general»:

       · `total`  suma de todos los niveles. Sube EXACTAMENTE +1 por cada
                  nivel de carta que ganes, aunque la carta esté en el
                  almacén. Es la cifra que se mueve siempre.
       · `lvl`    promedio de esos niveles, redondeado. Es el «Nivel General»
                  que se ve grande en la pantalla: sube por escalones, cada
                  vez que el promedio cruza la mitad del nivel siguiente.

     `pct` y `missing` se miden contra el mismo umbral que `lvl`, así que la
     barra, el número grande y el «faltan X niveles» nunca se contradicen. */

  function teamLevelInfo() {
    var st = OU.STATE && OU.STATE.state;
    var cards = (st && st.cards) || {};
    var ids = Object.keys(cards);
    var n = 0, sum = 0, top = 0;
    ids.forEach(function (id) {
      var rc = cards[id];
      var l = rc && typeof rc.lvl === 'number' ? rc.lvl : 1;
      sum += l; n++;
      if (l > top) top = l;
    });
    if (!n) return { lvl: 1, avg: 0, avg1: 0, pct: 0, missing: 0, total: 0, cards: 0, top: 0, next: 1 };
    var avg = sum / n;
    var lvl = Math.max(1, Math.round(avg));
    /* El nivel general es el promedio redondeado, así que sube cuando el
       promedio llega a lvl + 0.5. La barra y los niveles que faltan se
       miden contra ese mismo umbral para que nunca se contradigan. */
    var lo = lvl - 0.5;
    var pct = Math.max(0, Math.min(100, Math.round((avg - lo) * 100)));
    var need = Math.ceil((lvl + 0.5) * n) - sum;
    return {
      lvl: lvl,
      avg: avg,
      avg1: Math.round(avg * 10) / 10,
      pct: pct,
      missing: Math.max(0, need),
      total: sum,
      cards: n,
      top: top,
      next: lvl + 1
    };
  }

  function teamLevel() { return teamLevelInfo().lvl; }

  /* ---------- PODER DE CAMPAÑA ---------- */

  /** Poder de las 6 cartas equipadas (o el del roster si se pasan ids). */
  function teamPower(ids) {
    var st = OU.STATE && OU.STATE.state;
    var list = ids || ((st && st.team) || []).filter(Boolean);
    return list.reduce(function (s, id) {
      var rc = st && st.cards ? st.cards[id] : null;
      return s + powerOf(id, rc && rc.lvl ? rc.lvl : 1);
    }, 0);
  }

  /** Poder REAL de una fase: el mismo con el que entran sus enemigos. */
  function stagePower(idx) {
    var s = OU.STAGES[idx];
    if (!s) return 0;
    if (typeof s.power === 'number') return s.power;
    return Math.round(s.roster.reduce(function (a, id) { return a + powerOf(id, s.level); }, 0) * s.scale);
  }

  /** Índice de la fase por la que va el jugador (última desbloqueada). */
  function currentStage() {
    var st = OU.STATE && OU.STATE.state;
    return Math.max(0, Math.min((st ? st.stage : 0) | 0, OU.STAGES.length - 1));
  }

  /**
   * Veredicto: compara tu poder con el de la fase. Responde a la pregunta
   * «¿somos fuertes o no?» sin adivinar, con umbrales explícitos.
   */
  var VERDICTS = [
    { k: 'trivial', n: 'TRIVIAL', cls: 'v-trivial', min: 1.9 },
    { k: 'facil', n: 'FÁCIL', cls: 'v-facil', min: 1.35 },
    { k: 'justa', n: 'JUSTA', cls: 'v-justa', min: 1.08 },
    { k: 'aprieto', n: 'AL FILO', cls: 'v-aprieto', min: 0.92 },
    { k: 'dificil', n: 'DIFÍCIL', cls: 'v-dificil', min: 0.78 },
    { k: 'brutal', n: 'BRUTAL', cls: 'v-brutal', min: 0.6 }
  ];

  function verdict(mine, theirs) {
    if (!theirs) return { k: 'vacia', n: 'SIN RIVAL', cls: 'v-trivial', ratio: 0, gap: 0, mine: mine || 0, theirs: 0 };
    var r = (mine || 0) / theirs;
    var v = VERDICTS[VERDICTS.length - 1];
    for (var i = 0; i < VERDICTS.length; i++) {
      if (r >= VERDICTS[i].min) { v = VERDICTS[i]; break; }
    }
    return {
      k: v.k, n: v.n, cls: v.cls,
      ratio: r,
      gap: Math.round((mine || 0) - theirs),
      mine: Math.round(mine || 0),
      theirs: Math.round(theirs)
    };
  }

  /** Veredicto de la fase indicada frente a tu poder actual. */
  function stageVerdict(idx) { return verdict(teamPower(), stagePower(idx)); }

  /**
   * Aviso de una mejora de carta. Recibe el `teamLevelInfo()` de ANTES del
   * gasto y devuelve el sufijo con el crecimiento del equipo: el total de
   * niveles sube siempre +1, y el Nivel General se announce cuando sube de
   * escalón. Así el jugador ve el efecto de mejorar una carta aunque no esté
   * equipada.
   */
  function teamLevelUpNote(before) {
    var now = teamLevelInfo();
    var s = ' · ⭐ ' + before.total + ' → ' + now.total + ' niveles de carta';
    if (now.avg1 !== before.avg1) s += ' (media ' + before.avg1 + ' → ' + now.avg1 + ')';
    if (now.lvl > before.lvl) s += ' · ¡NIVEL GENERAL ' + now.lvl + '!';
    return s;
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
   * Curva ajustada: los primeros niveles son baratos, y aunque el costo sigue
   * creciendo a niveles altos, el exponente es suave y los duplicados se
   * topan — así el final del recorrido (100 niveles) sigue siendo alcanzable
   * con el oro de batallas y del Ágora.
   */
  function upgradeCost(cardId, level) {
    var c = OU.CARD_BY_ID[cardId];
    var F = OU.RARITY_FACTOR[c.r];
    var base = (c.hp * 0.2 + c.atk + c.def * 1.2);
    var lvlFactor = Math.pow(1.008, level) * (1.25 + Math.sqrt(level) * 0.45);
    var gold = Math.max(40, Math.round(base * lvlFactor * (0.5 + F * 0.26)));
    var dupes = Math.max(1, Math.round(Math.min(level, 24) * (0.6 + F * 0.18)));
    return { dupes: dupes, gold: gold };
  }

  /**
   * Costo para subir 1 nivel usando SOLO oro (sin duplicados).
   * Pagas más oro pero no dependes del azar; el recargo es moderado y se
   * aplana a partir del nivel 40 para que nunca se vuelva un muro.
   */
  function goldOnlyCost(cardId, level) {
    var st = upgradeCost(cardId, level);
    var mult = 2.0 + Math.min(level, 40) * 0.018;
    return Math.max(150, Math.round(st.gold * mult));
  }

  /**
   * Costo de entrenamiento: para subir 1 nivel necesitamos acumular XP.
   * El crecimiento es progresivo pero suave: subir de nivel por XP sigue
   * siendo rentable a niveles altos sin volverse inalcanzable.
   */
  function trainCost(cardId, level) {
    var c = OU.CARD_BY_ID[cardId];
    var F = OU.RARITY_FACTOR[c.r];
    var base = (c.hp * 0.2 + c.atk + c.def * 1.2);
    return Math.round(base * 0.44 * Math.pow(level, 0.95) * (0.5 + F * 0.14));
  }

  /* ---------- TECNOLOGÍAS (Templo del Conocimiento) ---------- */

  function techLevel(id) {
    var st = OU.STATE && OU.STATE.state;
    if (!st || !st.techs) return 0;
    return st.techs[id] | 0;
  }

  /** Multiplicadores de combate por tecnología (HP/ATK/DEF). */
  function techPower() {
    return {
      hp: 1 + 0.03 * techLevel('vitalidad'),
      atk: 1 + 0.03 * techLevel('tactica'),
      def: 1 + 0.03 * techLevel('fortaleza')
    };
  }

  function goldMult() { return 1 + 0.04 * techLevel('alquimia'); }
  function xpMult() { return 1 + 0.04 * techLevel('sabiduria'); }

  /** Costo en oro de investigar el siguiente nivel de una tecnología. */
  function techCost(id) {
    var t = null, i;
    for (i = 0; i < OU.TECHS.length; i++) if (OU.TECHS[i].id === id) { t = OU.TECHS[i]; break; }
    if (!t) return 0;
    var lvl = techLevel(id);
    var st = OU.STATE && OU.STATE.state;
    var prg = 0.9 + (st ? st.stage : 0) * 0.02;
    return Math.round(t.base * Math.pow(1.5, lvl) * prg);
  }

  /** Inventa una tecnología: aplica recursos y devuelve true si fue posible. */
  function researchTech(id) {
    var st = OU.STATE.state;
    var t = null, i;
    for (i = 0; i < OU.TECHS.length; i++) if (OU.TECHS[i].id === id) { t = OU.TECHS[i]; break; }
    if (!t) return false;
    var lvl = techLevel(id);
    if (lvl >= t.max) return false;
    var cost = techCost(id);
    if (st.gold < cost) return false;
    st.gold -= cost;
    st.techs[id] = lvl + 1;
    OU.STATE.save();
    return true;
  }

  /* ---------- SOBRES ---------- */

  /** Ponderaciones de un sobre con el bonus de suerte del Augurio. */
  function packWeights(p) {
    var keys = Object.keys(p.w);
    var luck = 0.015 * techLevel('augurio');
    var out = {}, total = 0;
    keys.forEach(function (k) {
      var v = p.w[k];
      if (k === 'normal') v = Math.max(0, v - luck);
      else v += luck;
      out[k] = v;
      total += v;
    });
    return { w: out, total: total };
  }

  function rollRarity(pack) {
    var pw = packWeights(pack);
    var keys = Object.keys(pack.w);
    var r = Math.random() * pw.total, acc = 0;
    for (var i = 0; i < keys.length; i++) {
      acc += pw.w[keys[i]];
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

  /** Rellena con una rareza inferior a la superada (respeta los topes ya alcanzados). */
  function cappedReplacement(p, fromRarity, counts) {
    var keys = Object.keys(OU.RAR);
    var idx = keys.indexOf(fromRarity);
    var avail = keys.slice(0, idx).filter(function (k) {
      return !(p.cap && p.cap[k] !== undefined && (counts[k] || 0) >= p.cap[k]);
    });
    if (!avail.length) avail = keys.slice(0, idx);
    var w = {}, total = 0, i;
    avail.forEach(function (k) { var v = p.w[k] || 0.01; w[k] = v; total += v; });
    var r = Math.random() * total, acc = 0;
    for (i = 0; i < avail.length; i++) {
      acc += w[avail[i]];
      if (r <= acc) return rollRarityCard(avail[i]);
    }
    return rollRarityCard(avail[0]);
  }

  /** Genera las extracciones de un sobre, aplicando garantías y topes por rareza. */
  function generatePulls(p) {
    var arr = [];
    for (var i = 0; i < p.count; i++) arr.push(rollCard(p));
    if (p.cap) {
      var counts = {};
      Object.keys(p.cap).forEach(function (r) { counts[r] = 0; });
      for (var j = 0; j < arr.length; j++) {
        var r = OU.CARD_BY_ID[arr[j]].r;
        var guard = 0;
        while (p.cap[r] !== undefined && counts[r] >= p.cap[r] && guard++ < 8) {
          arr[j] = cappedReplacement(p, r, counts);
          r = OU.CARD_BY_ID[arr[j]].r;
        }
        if (p.cap[r] !== undefined) counts[r]++;
      }
    }
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
      gold: Math.round((260 + s * 150 + s * s * 8) * goldMult()),
      xp: Math.round((60 + s * 30 + s * s * 3) * xpMult())
    };
  }

  function rarityOrder(a, b) {
    var o = OU.RAR[OU.CARD_BY_ID[b].r].order - OU.RAR[OU.CARD_BY_ID[a].r].order;
    return o || (a < b ? 1 : -1);
  }

  function xpNeed(lvl) { return Math.round(80 + lvl * 125); }

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
    teamLevelInfo: teamLevelInfo,
    teamLevel: teamLevel,
    teamPower: teamPower,
    stagePower: stagePower,
    currentStage: currentStage,
    verdict: verdict,
    stageVerdict: stageVerdict,
    teamLevelUpNote: teamLevelUpNote,
    abDesc: abDesc,
    upgradeCost: upgradeCost,
    goldOnlyCost: goldOnlyCost,
    trainCost: trainCost,
    rollRarity: rollRarity,
    rollRarityCard: rollRarityCard,
    rollCard: rollCard,
    generatePulls: generatePulls,
    packWeights: packWeights,
    rewardOf: rewardOf,
    rarityOrder: rarityOrder,
    xpNeed: xpNeed,
    imgAlt: imgAlt,
    techLevel: techLevel,
    techPower: techPower,
    goldMult: goldMult,
    xpMult: xpMult,
    techCost: techCost,
    researchTech: researchTech
  };
})();