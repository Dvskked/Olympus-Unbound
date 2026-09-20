/**
 * ==== ENTRENAMIENTO E INGRESO PASIVO ====
 * Entrena cartas (tiempo real, progreso offline) para ganar XP, oro y gemas.
 * Además, el Ágora genera oro pasivo que se recoge con un toque.
 * @module training
 */
(function () {
  'use strict';
  var OU = window.OU = window.OU || {};
  var U = OU.UTIL, I = OU.UI;

  /* ---------- INGRESO PASIVO (ÁGORA) ---------- */

  /**
   * El oro pasivo se acumula constantemente y puede recogerse.
   * Se calcula con timestamps para que trabaje incluso sin conexión... eh, sin abrir.
   */
  function incomeRate() {
    return OU.CONST.INCOME_BASE + OU.STATE.state.stage * OU.CONST.INCOME_PER_STAGE;
  }

  function incomeBannerHTML() {
    var st = OU.STATE.state;
    var rate = incomeRate();
    var pct = Math.min(100, Math.round(st.incomeAcc / OU.CONST.INCOME_CAP * 100));
    return '<div class="income-banner">' +
      '<div class="ib-left">' +
      '<div class="ib-title">🏛️ Ágora · Ingreso pasivo</div>' +
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

  /* ---------- ENTRENAMIENTO ---------- */

  function viewTraining() {
    var st = OU.STATE.state;
    var active = st.trainCard && st.trainUntil > Date.now();
    var uid = st.trainCard;
    var c = uid ? OU.CARD_BY_ID[uid] : null;
    var rc = uid ? st.cards[uid] : null;
    var html = incomeBannerHTML();

    html += '<div class="sec-title">Entrenamiento</div>';

    if (active && c && rc) {
      var minsLeft = Math.max(0, Math.ceil((st.trainUntil - Date.now()) / 60000));
      html += '<div class="train-active">' +
        '<div class="train-card">' +
        '<div class="t-art">' + I.artHTML(uid, 'train-img') + '</div>' +
        '<div class="t-info">' +
        '<div class="t-name" style="color:' + OU.RAR[c.r].color + '">' + c.n + '</div>' +
        '<div class="t-meta">Entrenando: <b>' + OU.TRAIN[st.trainType].name + '</b></div>' +
        '<div class="t-timer">⏳ ' + minsLeft + ' min restantes</div>' +
        '</div>' +
        '</div>' +
        '<p class="battle-hint">Vuelve cuando termine el reloj para recoger la recompensa. El progreso se guarda aunque cierres el juego.</p>' +
        '</div>';
    } else if (uid && c && rc && st.trainUntil > 0 && st.trainUntil <= Date.now()) {
      var p = OU.TRAIN[st.trainType] || OU.TRAIN.quick;
      html += '<div class="train-ready">' +
        '<div class="train-card">' +
        '<div class="t-art">' + I.artHTML(uid, 'train-img') + '</div>' +
        '<div class="t-info">' +
        '<div class="t-name" style="color:' + OU.RAR[c.r].color + '">' + c.n + '</div>' +
        '<div class="t-meta">¡Entrenamiento completado!</div>' +
        '</div>' +
        '</div>' +
        '<div class="t-rewards">' +
        '<span class="reward-pill r-gold">🪙 +' + U.fmt(p.gold) + '</span>' +
        '<span class="reward-pill r-xp">🏋️ +' + p.xp + ' XP</span>' +
        (p.gems ? '<span class="reward-pill r-gem">💎 +' + p.gems + '</span>' : '') +
        '</div>' +
        '<button class="btn btn-gold btn-block" id="collectTrain">Recoger recompensa</button>' +
        '</div>';
    } else {
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
    }

    html += '<div class="sec-title">Subir de nivel con XP</div>' +
      '<p class="battle-hint">Cuando el XP de entrenamiento de una carta llega al tope, puedes subirla un nivel sin gastar duplicados. Tócala en la colección para mejorarla.</p>';
    return html;
  }

  function openTrainPicker(cardId) {
    var st = OU.STATE.state;
    var c = OU.CARD_BY_ID[cardId], r = OU.RAR[c.r];
    var types = Object.keys(OU.TRAIN).map(function (k) {
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
        startTraining(cardId, b.dataset.type);
        I.closeModal();
        OU.MAIN.render();
      });
    });
  }

  function startTraining(cardId, type) {
    var st = OU.STATE.state;
    if (st.trainCard && st.trainUntil > Date.now()) {
      return I.toast('Ya hay una carta entrenando');
    }
    var t = OU.TRAIN[type];
    st.trainCard = cardId;
    st.trainType = type;
    st.trainUntil = Date.now() + t.mins * 60000;
    OU.STATE.save();
    I.toast('🏋️ ' + OU.CARD_BY_ID[cardId].n + ' comenzó ' + t.name);
  }

  function collectTraining() {
    var st = OU.STATE.state;
    var cardId = st.trainCard;
    var type = st.trainType;
    if (!cardId || !type) return;
    var t = OU.TRAIN[type] || OU.TRAIN.quick;
    var rc = st.cards[cardId];
    rc.xp = (rc.xp || 0) + t.xp;
    st.gold += t.gold;
    if (t.gems) st.gems += t.gems;
    st.trainCard = null;
    st.trainType = null;
    st.trainUntil = 0;
    checkTrainUp(cardId);
    OU.STATE.save();
    I.updateTopRes();
    var msg = '🏋️ ' + OU.CARD_BY_ID[cardId].n + ' +' + t.xp + ' XP · +' + U.fmt(t.gold) + ' 🪙' + (t.gems ? ' · +' + t.gems + ' 💎' : '');
    I.toast(msg);
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
    var col = U.$('#collectTrain', root);
    if (col) col.addEventListener('click', function () {
      collectTraining();
      OU.MAIN.render();
    });
  }

  /* Reloj: actualiza la vista de entrenamiento mientras hay sesión activa. */
  var timer = null;
  function startTimer() {
    if (timer) return;
    timer = setInterval(function () {
      var st = OU.STATE.state;
      if (!st.trainCard || st.trainUntil <= 0) return;
      if (OU.MAIN.currentTab === 'training') {
        OU.MAIN.render();
      } else if (OU.MAIN.currentTab === 'home') {
        OU.MAIN.render();
      }
    }, 20000);
  }

  OU.TRAIN = {
    incomeBannerHTML: incomeBannerHTML,
    bindIncome: bindIncome,
    viewTraining: viewTraining,
    bindTraining: bindTraining,
    startTraining: startTraining,
    collectTraining: collectTraining,
    startTimer: startTimer
  };
})();