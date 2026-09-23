/**
 * ==== ESTADO DEL JUGADOR ====
 * Carga y guarda la partida en localStorage, con reloj (timestamps) para
 * entrenamiento e ingreso pasivo offline.
 * @module state
 */
(function () {
  'use strict';
  var OU = window.OU = window.OU || {};

  function defaultState() {
    return {
      gold: OU.CONST.INITIAL_GOLD,
      gems: OU.CONST.INITIAL_GEMS,
      lvl: 1,
      xp: 0,
      cards: {},
      team: new Array(OU.CONST.MAX_TEAM).fill(null),
      stage: 0,
      trainSlots: [],
      trainCard: null,          // legacy: id en entrenamiento (pre-multi)
      trainUntil: 0,            // legacy: timestamp de fin
      trainType: null,          // legacy: tipo
      incomeLast: Date.now(),   // último cobro de ingreso pasivo
      incomeAcc: 0,             // oro acumulado pendiente de recoger
      shopRefresh: 0,           // timestamp de renovación de ofertas
      shopItems: [],            // ofertas actuales del Bazar
      freeDaily: '',            // día (YYYY-MM-DD) en que se regaló la carta gratuita del Bazar
      boostUntil: 0,            // multiplicador de ingreso activo hasta aquí
      seen: {},                 // ids descubiertos (aunque se vendan)
      techs: {},                // niveles de tecnologías del Templo (id → nivel)
      daily: { last: '', streak: 0 },       // recompensa diaria por entrar al juego
      creatorFollows: { github: false, instagram: false }, // confirmaciones "sigo al creador"
      _tutorial: false          // guía de bienvenida mostrada (o no)
    };
  }

  /** Garantiza que todas las tecnologías existan en el estado. */
  function initTechs() {
    var d = state.techs = state.techs || {};
    (OU.TECHS || []).forEach(function (t) {
      if (typeof d[t.id] !== 'number' || d[t.id] < 0) d[t.id] = 0;
    });
  }

  var state = defaultState();

  /** Poder bruto (sin niveles), para ordenar sin depender de OU.UTIL. */
  function estimatePower(id) {
    var c = OU.CARD_BY_ID[id];
    return c ? c.hp * 0.2 + c.atk + c.def * 1.2 : 0;
  }

  /** Recompone el equipo a la formación 1-2-2-1 respetando los topes por rol. */
  function normalizeTeam() {
    var byRole = { tanque: [], guerrero: [], mago: [], soporte: [] };
    (state.team || []).forEach(function (id) {
      if (id && state.cards[id] && OU.CARD_BY_ID[id]) byRole[OU.CARD_BY_ID[id].role].push(id);
    });
    ['tanque', 'guerrero', 'mago', 'soporte'].forEach(function (r) {
      byRole[r].sort(function (a, b) { return estimatePower(b) - estimatePower(a); });
      byRole[r] = byRole[r].slice(0, OU.CONST.ROLE_CAPS[r]);
    });
    state.team = OU.CONST.TEAM_SLOT_ROLES.map(function (r) {
      return byRole[r].length ? byRole[r].shift() : null;
    });
  }

  function applyDefaults() {
    var d = defaultState();
    Object.keys(d).forEach(function (k) {
      if (state[k] === undefined || state[k] === null) {
        state[k] = d[k];
      }
    });
    if (!state.team || state.team.length < OU.CONST.MAX_TEAM) {
      var t = new Array(OU.CONST.MAX_TEAM).fill(null);
      (state.team || []).forEach(function (id, i) { if (id) t[i] = id; });
      state.team = t;
    }
    if (!state.seen) state.seen = {};
    if (!state.techs) state.techs = {};
    initTechs();
    if (!Array.isArray(state.trainSlots)) state.trainSlots = [];
    // Migración desde el entrenamiento único de versiones anteriores.
    if (state.trainCard && state.trainCard !== null && (!state.trainSlots.length)) {
      state.trainSlots.push({
        cardId: state.trainCard,
        type: state.trainType || 'quick',
        until: state.trainUntil || 0
      });
    }
    state.trainCard = null;
    state.trainUntil = 0;
    state.trainType = null;
    if (!Array.isArray(state.shopItems)) state.shopItems = [];
    if (!state.daily) state.daily = { last: '', streak: 0 };
    if (!state.creatorFollows || typeof state.creatorFollows !== 'object') state.creatorFollows = { github: false, instagram: false };
    if (typeof state._tutorial !== 'boolean') state._tutorial = false;
    normalizeTeam();
  }

  function load() {
    try {
      var raw = localStorage.getItem(OU.CONST.SAVE_KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && typeof s.gold === 'number') {
          state = Object.assign(defaultState(), s);
          applyDefaults();
          // Seed inicial: regala 3 cartas de arranque en la primera partida
          if (!s._seeded) {
            OU.CONST.START_CARDS.forEach(function (id) {
              if (!state.cards[id]) state.cards[id] = { lvl: 1, dup: 0, xp: 0 };
              state.seen[id] = true;
            });
            state._seeded = true;
            seedIncome();
            save();
          }
          return;
        }
      }
    } catch (e) { /* guard corrupto: reiniciar */ }
    state = defaultState();
    state._seeded = true;
    OU.CONST.START_CARDS.forEach(function (id) {
      state.cards[id] = { lvl: 1, dup: 0, xp: 0 };
      state.seen[id] = true;
    });
  }

  function save() {
    try { localStorage.setItem(OU.CONST.SAVE_KEY, JSON.stringify(state)); } catch (e) { /* quota */ }
  }

  // Reclama el oro generado mientras estuviéramos fuera.
  function seedIncome() {
    tickIncome();
    save();
  }

  // Calcula el oro pasivo acumulado hasta ahora y lo suma al pendiente.
  function tickIncome() {
    var C = OU.CONST;
    var ratePerMin = C.INCOME_BASE + state.stage * C.INCOME_PER_STAGE;
    var now = Date.now();
    var mins = (now - (state.incomeLast || now)) / 60000;
    if (mins <= 0) return 0;
    state.incomeLast = now;
    var earned = Math.floor(mins * ratePerMin);
    if (earned > 0) {
      state.incomeAcc = Math.min(C.INCOME_CAP, state.incomeAcc + earned);
    }
    save();
    return earned;
  }

  function claimIncome() {
    var acc = state.incomeAcc;
    state.incomeAcc = 0;
    if (acc > 0) { state.gold += acc; }
    save();
    return acc;
  }

  function ownedList() {
    return Object.keys(state.cards);
  }

  function todayStr(offsetDays) {
    return new Date(Date.now() - (offsetDays || 0) * 86400000).toISOString().slice(0, 10);
  }

  /** Recompensa diaria: 2 + racha (hasta DAILY_GEMS_CAP) gemas una vez por día. */
  function checkDaily() {
    var d = state.daily = state.daily || { last: '', streak: 0 };
    var today = todayStr(0);
    if (d.last === today) return { reward: 0, streak: d.streak };
    if (d.last === todayStr(1)) d.streak++; else d.streak = 1;
    d.last = today;
    var reward = Math.min(OU.CONST.DAILY_GEMS_BASE + d.streak, OU.CONST.DAILY_GEMS_CAP);
    state.gems += reward;
    save();
    return { reward: reward, streak: d.streak };
  }

  function reset() {
    try { localStorage.removeItem(OU.CONST.SAVE_KEY); } catch (e) {}
    state = defaultState();
    state._seeded = true;
    OU.CONST.START_CARDS.forEach(function (id) {
      state.cards[id] = { lvl: 1, dup: 0, xp: 0 };
      state.seen[id] = true;
    });
  }

  OU.STATE = {
    get state() { return state; },
    defaultState: defaultState,
    load: load,
    save: save,
    tickIncome: tickIncome,
    claimIncome: claimIncome,
    ownedList: ownedList,
    checkDaily: checkDaily,
    todayStr: todayStr,
    reset: reset
  };
})();