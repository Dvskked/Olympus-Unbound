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
      boostUntil: 0,            // multiplicador de ingreso activo hasta aquí
      seen: {}                  // ids descubiertos (aunque se vendan)
    };
  }

  var state = defaultState();

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
    reset: reset
  };
})();