/**
 * ==== ENTRENAMIENTO E INGRESO PASIVO ====
 * Entrena hasta MAX_TRAIN cartas a la vez (tiempo real, progreso offline)
 * para ganar XP, oro y gemas. Además, el Ágora genera oro pasivo que se
 * recoge con un toque, y puede potenciarse con el Bazar (boost).
 * @module training
 */
(function () {
  'use strict';
  var OU = window.OU = window.OU || {};
  var U = OU.UTIL, I = OU.UI;

  /* ---------- INGRESO PASIVO (ÁGORA) ---------- */

  /**
   * El oro pasivo se acumula constantemente y puede recogerse.
   * Con el boost del Bazar activo, la tasa se multiplica.
   */
  function incomeRate() {
    var st = OU.STATE.state;
    var base = OU.CONST.INCOME_BASE + st.stage * OU.CONST.INCOME_PER_STAGE;
    if (st.boostUntil && st.boostUntil > Date.now()) return Math.round(base * OU.CONST.BOOST_MULT);
    return base;
  }

  function incomeBannerHTML() {
    var st = OU.STATE.state;
    var rate = incomeRate();
    var pct = Math.min(100, Math.round(st.incomeAcc / OU.CONST.INCOME_CAP * 100));
    var boosted = st.boostUntil && st.boostUntil > Date.now();
    return '<div class="income-banner">' +
      '<div class="ib-left">' +
      '<div class="ib-title">🏛️ Ágora · Ingreso pasivo' + (boosted ? ' <span class="ib-boost">✚' + Math.round((OU.CONST.BOOST_MULT - 1) * 100) + '%</span>' : '') + '</div>' +
      '<div class="ib-sub">' + U.fmt(rate) + ' 🪙/min · tope ' + U.fmt(OU.CONST.INCOME_CAP) + '</div>' +
      '<div class="ib-bar"><div class="ib-fill" style="width:' + pct + '%"></div></div>' +
      '</div>' +
      '<button class="btn btn-gold btn-sm" id="claimInc">Recoger ' + U.fmt(st.incomeAcc) + ' 🪙</button>' +
      '</div>';
  }

  function bindIncome(root) {
    var btn = U.$('#claimInc', root);
    if (btn) btn.addEventListener('click', function () {
      var acc = OU.STATE.claimIncome();
      I.updateTopRes();
      I.toast(acc > 0 ? 'Recogiste ' + U.fmt(acc) + ' 🪙 del Ágora' : 'El Ágora aún no genera oro');
      OU.MAIN.render();
    });
  }

  /* ---------- ENTRENAMIENTO (multi-ranura) ---------- */

  function slotCount() { return OU.STATE.state.trainSlots.length; }
  function activeSlots() {
    var now = Date.now();
    return OU.STATE.state.trainSlots.filter(function (s) { return s.until > now; });
  }
  function readySlots() {
    var now = Date.now();
    return OU.STATE.state.trainSlots.filter(function (s) { return s.until <= now; });
  }
  function hasFreeSlot() { return slotCount() < OU.CONST.MAX_TRAIN; }

  /** Costo en gemas para terminar de inmediato una sesión activa. */
  function finishCost(slot) {
    var minsLeft = Math.max(1, (slot.until - Date.now()) / 60000);
    return Math.max(1, Math.ceil(minsLeft / 6));
  }

  function slotHTML(s, i) {
    var st = OU.STATE.state;
    var c = OU.CARD_BY_ID[s.cardId], r = OU.RAR[c.r];
    var active = s.until > Date.now();
    var inner = active
      ? activeInnerHTML(s, c, r, i)
      : readyInnerHTML(s, c, r, i);
    return '<div class="train-slot ' + (active ? 'active' : 'ready') + '" data-slot="' + i + '">' + inner + '</div>';
  }

  function emptySlotHTML(i) {
    return '<div class="train-slot empty" data-slot="' + i + '">' +
      '<div class="t-empty">⚡ Ranura ' + (i + 1) + ' libre<br><span>Toca una carta abajo para entrenarla</span></div>' +
      '</div>';
  }

  function activeInnerHTML(s, c, r, i) {
    var minsLeft = Math.max(1, Math.ceil((s.until - Date.now()) / 60000));
    var cost = finishCost(s);
    var b = OU.TRAIN[s.type] ? OU.TRAIN[s.type].name : 'Ritual';
    return '<div class="t-art">' + I.artHTML(s.cardId, 'train-img') + '</div>' +
      '<div class="t-info">' +
      '<div class="t-name" style="color:' + r.color + '">' + c.n + '</div>' +
      '<div class="t-meta">Entrenando: <b>' + b + '</b></div>' +
      '<div class="t-timer">⏳ ' + minsLeft + ' min restantes</div>' +
      '<button class="btn btn-sm btn-blue finish-now" data-finish="' + i + '" style="margin-top:8px">⚡ Completar ahora · 💎 ' + cost + '</button>' +
      '</div>';
  }

  function readyInnerHTML(s, c, r, i) {
    var p = OU.TRAIN[s.type] || OU.TRAIN.quick;
    return '<div class="t-art">' + I.artHTML(s.cardId, 'train-img') + '</div>' +
      '<div class="t-info">' +
      '<div class="t-name" style="color:' + r.color + '">' + c.n + '</div>' +
      '<div class="t-meta">¡Entrenamiento completado!</div>' +
      '<div class="t-rewards">' +
      '<span class="reward-pill r-gold">🪙 +' + U.fmt(p.gold) + '</span>' +
      '<span class="reward-pill r-xp">🏋️ +' + p.xp + ' XP</span>' +
      (p.gems ? '<span class="reward-pill r-gem">💎 +' + p.gems + '</span>' : '') +
      '</div>' +
      '<button class="btn btn-gold btn-sm" data-collect="' + i + '" style="margin-top:8px">Recoger recompensa</button>' +
      '</div>';
  }

  function viewTraining() {
    var st = OU.STATE.state;
    var html = incomeBannerHTML();

    html += '<div class="sec-title">Entrenamiento</div>' +
      '<p class="battle-hint">Hasta <b>' + OU.CONST.MAX_TRAIN + ' cartas a la vez</b>. Cada sesión avanza aunque cierres el juego.</p>';

    var slots = st.trainSlots || [];
    var waiters = Math.max(0, OU.CONST.MAX_TRAIN - slots.length); // ranuras que quedan libres

    if (slots.length) {
      html += '<div class="train-slots">' + slots.map(function (s, i) { return slotHTML(s, i); }).join('') + '</div>';
    }
    for (var f = 0; f < (OU.CONST.MAX_TRAIN - slots.length); f++) {
      html += emptySlotHTML(slots.length + f);
    }

    if (waiters > 0) {
      var cards = OU.STATE.ownedList();
      if (!cards.length) {
        html += '<div class="empty-msg">Abre sobres primero para tener cartas que entrenar 🏛️</div>';
      } else {
        var rows = cards.sort(function (a, b) { return U.rarityOrder(a, b); }).map(function (id) {
          var cc = OU.CARD_BY_ID[id], r = OU.RAR[cc.r], rc2 = st.cards[id];
          var lvl = rc2.lvl;
          var t = U.trainCost(id, lvl);
          var pct = Math.min(100, Math.round((rc2.xp || 0) / t * 100));
          return '<div class="train-row" data-card="' + id + '">' +
            '<div class="tr-icon" style="border-color:' + r.color + '">' + I.artHTML(id, 'pick-art') + '</div>' +
            '<div class="tr-info">' +
            '<div class="tr-name" style="color:' + r.color + '">' + cc.n + '</div>' +
            '<div class="tr-meta">Nivel ' + lvl + ' · ' + r.name + ' · Poder ' + U.fmt(U.powerOf(id, lvl)) + '</div>' +
            '<div class="tr-bar"><div class="tr-fill" style="width:' + pct + '%"></div></div>' +
            '<div class="tr-xp">🏋️ ' + (rc2.xp || 0) + ' / ' + t + ' XP</div>' +
            '</div>' +
            '<div class="tr-cta">Entrenar ➜</div>' +
            '</div>';
        }).join('');
        html += '<p class="battle-hint">Escoge una carta y elige la duración. Al terminar gana XP, 🪙 y a veces 💎.</p>' +
          '<div class="train-list">' + rows + '</div>';
      }
    } else {
      html += '<p class="battle-hint">Todas las ranuras están ocupadas. Recolecta una cuando termine para liberar espacio.</p>';
    }

    html += '<div class="sec-title">Subir de nivel con XP</div>' +
      '<p class="battle-hint">Cuando el XP de entrenamiento de una carta llega al tope, puedes subirla un nivel sin gastar duplicados. Tócala en la colección para mejorarla. Puedes <b>completar sesiones al instante</b> con gemas 💎.</p>';
    return html;
  }

  function openTrainPicker(cardId) {
    var st = OU.STATE.state;
    var c = OU.CARD_BY_ID[cardId], r = OU.RAR[c.r];
    var types = Object.keys(OU.TRAIN).filter(function (k) { return OU.TRAIN[k] && typeof OU.TRAIN[k].mins === 'number'; }).map(function (k) {
      var p = OU.TRAIN[k];
      return '<button class="btn btn-ghost btn-block train-opt" data-type="' + k + '" style="margin-bottom:8px">' +
        '<span style="font-weight:900;color:var(--gold2)">' + p.name + '</span><br>' +
        '<span style="font-size:11px;color:var(--dim)">⏳ ' + p.mins + ' min · 🪙 +' + U.fmt(p.gold) + ' · 🏋️ +' + p.xp + ' XP' + (p.gems ? ' · 💎 +' + p.gems : '') + '</span>' +
        '</button>';
    }).join('');
    I.openModal(
      '<div class="sec-title" style="margin-top:8px">Entrenar a ' + c.n + '</div>' +
      '<div class="detail-ig"><div class="t-art" style="width:120px;height:170px">' + I.artHTML(cardId, 'train-img') + '</div>' +
      '<div class="detail-name" style="color:' + r.color + '">' + c.n + '</div></div>' +
      types, true);
    U.$$('[data-type]', U.$('#overlay')).forEach(function (b) {
      b.addEventListener('click', function () {
        var started = startTraining(cardId, b.dataset.type);
        I.closeModal();
        OU.MAIN.render();
        if (!started) I.toast('No quedan ranuras libres (máx ' + OU.CONST.MAX_TRAIN + ')');
      });
    });
  }

  /** Inicia una sesión en la primera ranura libre. Devuelve true si se asignó. */
  function startTraining(cardId, type) {
    var st = OU.STATE.state;
    if (activeSlots().length >= OU.CONST.MAX_TRAIN) return false;
    var freeIdx = -1;
    for (var i = 0; i < OU.CONST.MAX_TRAIN; i++) {
      if (i >= st.trainSlots.length) { freeIdx = i; break; }
      if (!st.trainSlots[i] || st.trainSlots[i].until <= Date.now()) { freeIdx = i; break; }
    }
    if (freeIdx < 0) return false;
    var t = OU.TRAIN[type];
    var slot = { cardId: cardId, type: type, until: Date.now() + t.mins * 60000 };
    st.trainSlots[freeIdx] = slot;
    OU.STATE.save();
    I.toast('🏋️ ' + OU.CARD_BY_ID[cardId].n + ' comenzó ' + t.name);
    return true;
  }

  /** Recoge UNA ranura ya terminada. Devuelve el oro ganado. */
  function collectSlot(i) {
    var st = OU.STATE.state;
    var slot = st.trainSlots[i];
    if (!slot) return 0;
    if (slot.until > Date.now()) {
      I.toast('Aún no termina. Usa «Completar ahora» o espera.');
      return 0;
    }
    var t = OU.TRAIN[slot.type] || OU.TRAIN.quick;
    var rc = st.cards[slot.cardId];
    if (!rc) { st.trainSlots.splice(i, 1); OU.STATE.save(); return 0; }
    rc.xp = (rc.xp || 0) + t.xp;
    st.gold += t.gold;
    if (t.gems) st.gems += t.gems;
    st.trainSlots.splice(i, 1);
    checkTrainUp(slot.cardId);
    OU.STATE.save();
    I.updateTopRes();
    I.toast('🏋️ ' + OU.CARD_BY_ID[slot.cardId].n + ' +' + t.xp + ' XP · +' + U.fmt(t.gold) + ' 🪙' + (t.gems ? ' · +' + t.gems + ' 💎' : ''));
    return t.gold;
  }

  /** Recoge todas las ranuras ya terminadas. Devuelve el oro total ganado. */
  function collectTraining() {
    var st = OU.STATE.state;
    var total = 0;
    for (var i = st.trainSlots.length - 1; i >= 0; i--) {
      var slot = st.trainSlots[i];
      if (slot && slot.until <= Date.now()) total += collectSlot(i);
    }
    if (total === 0) I.toast('No hay sesiones listas para recoger');
    return total;
  }

  /** Completa al instante (gasta gemas) y recoge la ranura. */
  function finishNow(i) {
    var st = OU.STATE.state;
    var slot = st.trainSlots[i];
    if (!slot) return;
    if (slot.until > Date.now()) {
      var cost = finishCost(slot);
      if (st.gems < cost) return I.toast('Necesitas 💎 ' + cost);
      st.gems -= cost;
    }
    slot.until = Date.now();
    collectSlot(i);
    OU.MAIN.render();
  }

  /** Si el XP de entrenamiento llena el tope, sube de nivel sin duplicados. */
  function checkTrainUp(cardId) {
    var st = OU.STATE.state;
    var rc = st.cards[cardId];
    var c = OU.CARD_BY_ID[cardId];
    var ups = 0;
    while (rc.lvl < OU.CONST.MAX_LEVEL) {
      var need = U.trainCost(cardId, rc.lvl);
      if (rc.xp < need) break;
      rc.xp -= need;
      rc.lvl++;
      ups++;
    }
    if (ups > 0) setTimeout(function () {
      I.toast('⭐ ' + c.n + ' subió a nivel ' + rc.lvl + ' gracias al entrenamiento!');
    }, 900);
  }

  function bindTraining(root) {
    bindIncome(root);
    U.$$('[data-card]', root).forEach(function (r) {
      r.addEventListener('click', function () { openTrainPicker(r.dataset.card); });
    });
    U.$$('[data-collect]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        collectSlot(parseInt(b.dataset.collect, 10));
        OU.MAIN.render();
      });
    });
    U.$$('[data-finish]', root).forEach(function (b) {
      b.addEventListener('click', function () { finishNow(parseInt(b.dataset.finish, 10)); });
    });
  }

  /* Reloj: actualiza la vista de entrenamiento mientras hay sesión activa. */
  var timer = null;
  function startTimer() {
    if (timer) return;
    timer = setInterval(function () {
      var st = OU.STATE.state;
      if (!st.trainSlots || !st.trainSlots.length) return;
      if (OU.MAIN.currentTab === 'training' || OU.MAIN.currentTab === 'home') {
        OU.MAIN.render();
      }
    }, 20000);
  }

  // Fusionamos la API sobre la config para no perder los tipos.
  var T = OU.TRAIN || {};
  T.incomeRate = incomeRate;
  T.incomeBannerHTML = incomeBannerHTML;
  T.bindIncome = bindIncome;
  T.viewTraining = viewTraining;
  T.bindTraining = bindTraining;
  T.openTrainPicker = openTrainPicker;
  T.startTraining = startTraining;
  T.collectSlot = collectSlot;
  T.collectTraining = collectTraining;
  T.finishNow = finishNow;
  T.finishCost = finishCost;
  T.slotCount = slotCount;
  T.activeSlots = activeSlots;
  T.readySlots = readySlots;
  T.hasFreeSlot = hasFreeSlot;
  T.startTimer = startTimer;
  OU.TRAIN = T;
})();