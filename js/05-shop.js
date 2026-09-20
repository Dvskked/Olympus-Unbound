/**
 * ==== TIENDA ====
 * Compra de sobres, animación de apertura (carta por carta) y canje de gemas.
 * Además, el BAZAR ofrece artículos de 12 horas (comodín de oro y gemas).
 * @module shop
 */
(function () {
  'use strict';
  var OU = window.OU = window.OU || {};
  var U = OU.UTIL, I = OU.UI;

  var openingBusy = false;

  /* ---------- BAZAR (ofertas de 12 h) ---------- */

  var OFFER_WEIGHTS = [
    { t: 'card', w: 30 },
    { t: 'gold', w: 15 },
    { t: 'gems', w: 13 },
    { t: 'xpAll', w: 15 },
    { t: 'upgrade', w: 13 },
    { t: 'boost', w: 14 }
  ];

  function weightedType() {
    var total = OFFER_WEIGHTS.reduce(function (a, o) { return a + o.w; }, 0);
    var r = Math.random() * total;
    for (var i = 0; i < OFFER_WEIGHTS.length; i++) {
      r -= OFFER_WEIGHTS[i].w;
      if (r <= 0) return OFFER_WEIGHTS[i].t;
    }
    return 'card';
  }

  function pickRarity() {
    var r = Math.random();
    if (r < 0.30) return 'normal';
    if (r < 0.70) return 'hero';
    if (r < 0.90) return 'god';
    if (r < 0.98) return 'titan';
    return 'primordial';
  }

  /** Genera un artículo del Bazar. */
  function makeOffer(type) {
    var st = OU.STATE.state;
    var maxLvlPower = 0;
    var owned = OU.STATE.ownedList();
    owned.forEach(function (id) { maxLvlPower = Math.max(maxLvlPower, U.powerOf(id, st.cards[id].lvl)); });
    var prg = 1 + st.stage * 0.06 + Math.min(st.lvl, 30) * 0.04;
    if (type === 'card') {
      var rar = pickRarity();
      var pool = OU.CARDS_BY_RAR[rar];
      var card = U.pick(pool);
      var priceMul = { normal: 1.2, hero: 1.6, god: 2.3, titan: 3.4, primordial: 5.5 }[rar];
      var price = Math.max(250, Math.round(U.powerOf(card.id, 1) * priceMul * prg / 3));
      return { t: 'card', id: card.id, cost: { gold: U.clamp(price, 250, 40000) }, tag: rar };
    }
    if (type === 'gold') {
      var gAmt = Math.round((1800 + st.lvl * 90 + st.stage * 120) * prg / 2);
      return { t: 'gold', g: U.clamp(gAmt, 1500, 60000), cost: { gems: Math.max(6, Math.round(gAmt / 380)) } };
    }
    if (type === 'gems') {
      var gm = Math.max(6, Math.round((8 + st.lvl * 0.6 + st.stage * 0.8) * prg / 2));
      return { t: 'gems', g: U.clamp(gm, 6, 60), cost: { gold: Math.round(gm * 90) } };
    }
    if (type === 'xpAll') {
      var xpN = Math.round((450 + st.lvl * 40 + st.stage * 30) * prg / 2);
      return { t: 'xpAll', xp: U.clamp(xpN, 500, 20000), cost: { gold: Math.round(xpN * 1.5) } };
    }
    if (type === 'upgrade') {
      return { t: 'upgrade', cost: { gold: Math.round(2000 * prg) }, cid: null };
    }
    // boost
    return { t: 'boost', cost: { gold: Math.round(2600 * prg) } };
  }

  /** Asegura que el Bazar esté generado y vigente (12 h). */
  function ensureBazaar() {
    var st = OU.STATE.state;
    if (st.shopItems.length && st.shopRefresh > Date.now()) return;
    var items = [];
    for (var i = 0; i < 4; i++) items.push(makeOffer(weightedType()));
    st.shopItems = items;
    st.shopRefresh = Date.now() + OU.CONST.SHOP_REFRESH_MS;
    OU.STATE.save();
  }

  function refreshBazaar() {
    var st = OU.STATE.state;
    if (st.gems < OU.CONST.SHOP_REFRESH_GEMS) return I.toast('Necesitas 💎 ' + OU.CONST.SHOP_REFRESH_GEMS);
    st.gems -= OU.CONST.SHOP_REFRESH_GEMS;
    st.shopItems = [];
    ensureBazaar();
    I.updateTopRes();
    I.toast('El Bazar se renovó con nuevas ofertas 🛒');
    OU.MAIN.render();
  }

  function offerHTML(o, i) {
    if (o.t === 'card') {
      var c = OU.CARD_BY_ID[o.id], r = OU.RAR[c.r];
      return '<div class="offer-card o-card" data-offer="' + i + '">' +
        '<div class="oc-badge ' + r.order + '">' + r.name.toUpperCase() + '</div>' +
        '<div class="oc-art" style="border-color:' + r.color + '">' + I.artHTML(o.id, 'pick-art') + '</div>' +
        '<div class="oc-name" style="color:' + r.color + '">' + c.n + '</div>' +
        '<div class="oc-cost gold">🪙 ' + U.fmt(o.cost.gold) + '</div>' +
        '<div class="oc-cta">Comprar ➜</div>' +
        '</div>';
    }
    if (o.t === 'gold') {
      return '<div class="offer-card" data-offer="' + i + '">' +
        '<div class="oc-ic">🪙</div>' +
        '<div class="oc-name">Lote de oro</div>' +
        '<div class="oc-desc">+ ' + U.fmt(o.g) + ' oro al instante</div>' +
        '<div class="oc-cost gem">💎 ' + U.fmt(o.cost.gems) + '</div>' +
        '<div class="oc-cta">Comprar ➜</div>' +
        '</div>';
    }
    if (o.t === 'gems') {
      return '<div class="offer-card" data-offer="' + i + '">' +
        '<div class="oc-ic">💎</div>' +
        '<div class="oc-name">Ánfora de gemas</div>' +
        '<div class="oc-desc">+ ' + o.g + ' gemas al instante</div>' +
        '<div class="oc-cost gold">🪙 ' + U.fmt(o.cost.gold) + '</div>' +
        '<div class="oc-cta">Comprar ➜</div>' +
        '</div>';
    }
    if (o.t === 'xpAll') {
      return '<div class="offer-card" data-offer="' + i + '">' +
        '<div class="oc-ic">📚</div>' +
        '<div class="oc-name">Plenilunio de Musas</div>' +
        '<div class="oc-desc">+ ' + U.fmt(o.xp) + ' XP a TODAS tus cartas</div>' +
        '<div class="oc-cost gold">🪙 ' + U.fmt(o.cost.gold) + '</div>' +
        '<div class="oc-cta">Comprar ➜</div>' +
        '</div>';
    }
    if (o.t === 'upgrade') {
      return '<div class="offer-card" data-offer="' + i + '">' +
        '<div class="oc-ic">🔨</div>' +
        '<div class="oc-name">Refinamiento de Hefesto</div>' +
        '<div class="oc-desc">Sube 1 nivel a una carta a tu elección</div>' +
        '<div class="oc-cost gold">🪙 ' + U.fmt(o.cost.gold) + '</div>' +
        '<div class="oc-cta">Comprar ➜</div>' +
        '</div>';
    }
    return '<div class="offer-card" data-offer="' + i + '">' +
      '<div class="oc-ic">🌾</div>' +
      '<div class="oc-name">Bendición de Deméter</div>' +
      '<div class="oc-desc">+500% ingreso del Ágora durante 12 h</div>' +
      '<div class="oc-cost gold">🪙 ' + U.fmt(o.cost.gold) + '</div>' +
      '<div class="oc-cta">Comprar ➜</div>' +
      '</div>';
  }

  function buyOffer(i) {
    var st = OU.STATE.state;
    var o = st.shopItems[i];
    if (!o) return;
    // validar (excepto 'upgrade', que se cobra al confirmar la carta)
    if (o.t === 'upgrade') {
      openUpgradePicker(o);
      return;
    }
    if (o.cost.gold !== undefined) {
      if (st.gold < o.cost.gold) return I.toast('No tienes suficiente oro 🪙');
      st.gold -= o.cost.gold;
    } else {
      if (st.gems < o.cost.gems) return I.toast('No tienes suficientes gemas 💎');
      st.gems -= o.cost.gems;
    }
    if (o.t === 'card') {
      if (!st.cards[o.id]) st.cards[o.id] = { lvl: 1, dup: 0, xp: 0 };
      else st.cards[o.id].dup++;
      st.seen[o.id] = true;
      I.toast('🎴 Obtuviste ' + OU.CARD_BY_ID[o.id].n + (st.cards[o.id].dup ? ' (+1 dup)' : ''));
    } else if (o.t === 'gold') {
      st.gold += o.g;
      I.toast('🪙 +' + U.fmt(o.g) + ' oro');
    } else if (o.t === 'gems') {
      st.gems += o.g;
      I.toast('💎 +' + o.g + ' gemas');
    } else if (o.t === 'xpAll') {
      Object.keys(st.cards).forEach(function (id) { st.cards[id].xp = (st.cards[id].xp || 0) + o.xp; });
      I.toast('📚 +' + U.fmt(o.xp) + ' XP en todas tus cartas');
    } else if (o.t === 'boost') {
      st.boostUntil = Math.max(st.boostUntil, Date.now() + OU.CONST.BOOST_MS);
      I.toast('🌾 Ingreso del Ágora +' + Math.round((OU.CONST.BOOST_MULT - 1) * 100) + '% durante 12 h');
    }
    st.shopItems.splice(i, 1);
    OU.STATE.save();
    I.updateTopRes();
    OU.MAIN.render();
  }

  function openUpgradePicker(o) {
    var st = OU.STATE.state;
    var owned = OU.STATE.ownedList().filter(function (id) {
      return st.cards[id].lvl < OU.CONST.MAX_LEVEL;
    }).sort(function (a, b) { return U.rarityOrder(a, b); });
    I.openModal(
      '<div class="sec-title" style="margin-top:8px">🔨 Elige qué carta subirá de nivel</div>' +
      '<div class="up-cost">Coste: ' + (o.cost.gold !== undefined ? '🪙 ' + U.fmt(o.cost.gold) : '💎 ' + U.fmt(o.cost.gems)) + '</div>' +
      (owned.length ? owned.map(function (id) {
        var c = OU.CARD_BY_ID[id], r = OU.RAR[c.r];
        return '<div class="picker-row" data-up="' + id + '">' +
          '<div class="pr-icon" style="border-color:' + r.color + '">' + I.artHTML(id, 'pick-art') + '</div>' +
          '<div class="pr-info">' +
          '<div class="pr-name" style="color:' + r.color + '">' + c.n + '</div>' +
          '<div class="pr-meta">' + r.name + ' · NV ' + st.cards[id].lvl + '</div>' +
          '</div>' +
          '<div class="pr-check" style="color:var(--gold2)">Subir ➜</div>' +
          '</div>';
      }).join('') : '<div class="empty-msg">No hay cartas mejorables (tope NL MAX)</div>') +
      '<button class="btn btn-ghost btn-block" id="upClose" style="margin-top:12px">Cancelar</button>', true);
    U.$$('[data-up]', U.$('#overlay')).forEach(function (r) {
      r.addEventListener('click', function () {
        if (o.cost.gold !== undefined) {
          if (st.gold < o.cost.gold) { I.toast('No tienes suficiente oro 🪙'); return; }
          st.gold -= o.cost.gold;
        } else {
          if (st.gems < o.cost.gems) { I.toast('No tienes suficientes gemas 💎'); return; }
          st.gems -= o.cost.gems;
        }
        var id = r.dataset.up;
        st.cards[id].lvl++;
        var idx = st.shopItems.indexOf(o);
        if (idx >= 0) st.shopItems.splice(idx, 1);
        OU.STATE.save(); I.updateTopRes();
        I.closeModal();
        I.toast('🔨 ' + OU.CARD_BY_ID[id].n + ' subió a nivel ' + st.cards[id].lvl);
        OU.MAIN.render();
      });
    });
    var cl = U.$('#upClose'); if (cl) cl.addEventListener('click', I.closeModal);
  }

  function timeLeftLabel() {
    var st = OU.STATE.state;
    var diff = Math.max(0, st.shopRefresh - Date.now());
    var h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000);
    return '⏳ Renovación en ' + h + 'h ' + m + 'm';
  }

  /* ---------- TIENDA (sobres y Bazar) ---------- */

  function viewShop() {
    ensureBazaar();
    var st = OU.STATE.state;
    var packs = Object.keys(OU.PACKS).map(function (k) {
      var p = OU.PACKS[k];
      var cost = p.cost.gold ? '<span class="gold">🪙 ' + U.fmt(p.cost.gold) + '</span>' : '<span class="gem">💎 ' + U.fmt(p.cost.gems) + '</span>';
      var oddsRows = p.odds.map(function (o) {
        var l = o[0], v = o[1];
        var col = l === 'Primordial' ? OU.RAR.primordial.color : l === 'Titán' ? OU.RAR.titan.color : l === 'Dios' ? OU.RAR.god.color : l === 'Héroe' ? OU.RAR.hero.color : 'var(--gray)';
        return '<div class="o-row"><span class="o-l">' + l + '</span><span class="o-v" style="color:' + col + '">' + v + '</span></div>';
      }).join('');
      return '<div class="pack-card ' + p.cls + '" data-pack="' + k + '">' +
        '<div class="pc-ic">🎁</div>' +
        '<div class="pc-name ' + p.cls + '">' + p.name + '</div>' +
        '<div class="pc-cost">' + cost + '</div>' +
        '<div class="pc-desc">' + p.desc + ' · ' + p.count + ' cartas.</div>' +
        '<div class="odds">' + oddsRows + '</div>' +
        '</div>';
    }).join('');

    return '<div class="sec-title">Bazar · Ofertas por tiempo limitado</div>' +
      '<div class="bazaar-head">' +
      '<span class="bazaar-timer" id="bazaarTimer">' + timeLeftLabel() + '</span>' +
      '<button class="btn btn-sm btn-blue" id="refreshShopBtn">🔄 Refrescar · 💎 ' + OU.CONST.SHOP_REFRESH_GEMS + '</button>' +
      '</div>' +
      '<div class="offer-grid">' + st.shopItems.map(function (o, i) { return offerHTML(o, i); }).join('') + '</div>' +
      '<div class="sec-title">Tienda de Sobres</div>' +
      '<div class="shop-grid">' + packs + '</div>' +
      '<div class="sec-title">Canje de gemas</div>' +
      '<div class="exchange-card">' +
      '<div class="ex-item" data-ex="10"><div class="ei-ic">💎→🪙</div><div class="ei-body">10 gemas = <span class="g">' + U.fmt(1500) + ' oro</span></div></div>' +
      '<div class="ex-item" data-ex="25"><div class="ei-ic">💎→🪙</div><div class="ei-body">25 gemas = <span class="g">' + U.fmt(3900) + ' oro</span></div></div>' +
      '<div class="ex-item" data-ex="50"><div class="ei-ic">💎→🪙</div><div class="ei-body">50 gemas = <span class="g">' + U.fmt(8000) + ' oro</span></div></div>' +
      '</div>' +
      '<p class="battle-hint">💎 Las gemas también sirven para refrescar el Bazar y para completar entrenamientos al instante.</p>';
  }

  function bindShop(root) {
    U.$$('[data-pack]', root).forEach(function (e) {
      e.addEventListener('click', function () { buyPack(e.dataset.pack); });
    });
    U.$$('[data-ex]', root).forEach(function (e) {
      e.addEventListener('click', function () { doExchange(parseInt(e.dataset.ex, 10)); });
    });
    U.$$('[data-offer]', root).forEach(function (e) {
      e.addEventListener('click', function () { buyOffer(parseInt(e.dataset.offer, 10)); });
    });
    var rf = U.$('#refreshShopBtn');
    if (rf) rf.addEventListener('click', refreshBazaar);
  }

  function buyPack(packKey) {
    if (openingBusy) return;
    var p = OU.PACKS[packKey];
    var st = OU.STATE.state;
    if (p.cost.gold !== undefined) {
      if (st.gold < p.cost.gold) return I.toast('No tienes suficiente oro 🪙');
      st.gold -= p.cost.gold;
    } else {
      if (st.gems < p.cost.gems) return I.toast('No tienes suficientes gemas 💎');
      st.gems -= p.cost.gems;
    }
    OU.STATE.save();
    I.updateTopRes();
    var pulls = U.generatePulls(p);
    pulls.forEach(function (pid) {
      if (!st.cards[pid]) st.cards[pid] = { lvl: 1, dup: 0, xp: 0 };
      else st.cards[pid].dup++;
      st.seen[pid] = true;
    });
    OU.STATE.save();
    showPackOpening(p, pulls);
  }

  function isNew(id) {
    return OU.STATE.state.cards[id] && OU.STATE.state.cards[id].dup === 0;
  }

  function bigCardHTML(pid) {
    var c = OU.CARD_BY_ID[pid], r = OU.RAR[c.r];
    return '<div class="rv-big" style="--glow:' + r.glow + ';border-color:' + r.color + '">' +
      (isNew(pid) ? '<div class="new-tag">NUEVA</div>' : '') +
      '<div class="rv-big-art">' + I.artHTML(pid, 'big-art') + '</div>' +
      '<div class="rv-big-in">' +
      '<div class="rv-big-n" style="color:' + r.color + '">' + c.n + '</div>' +
      '<div class="rv-big-r" style="color:' + r.color + '">' + r.name.toUpperCase() + '</div>' +
      '</div></div>';
  }

  function rvMiniHTML(pid) {
    var c = OU.CARD_BY_ID[pid], r = OU.RAR[c.r];
    return '<div class="rv-mini" style="--glow:' + r.glow + ';border-color:' + r.color + '">' +
      (isNew(pid) ? '<div class="new-tag">NUEVA</div>' : '') +
      '<div class="rv-mini-art">' + I.artHTML(pid, 'big-art') + '</div>' +
      '<div class="rv-mini-n" style="color:' + r.color + '">' + c.n + '</div>' +
      '</div>';
  }

  async function showPackOpening(p, pulls) {
    openingBusy = true;
    var cls = p.cls;
    I.openModal(
      '<div class="pack-stage">' +
      '<div class="pc-name" style="font-size:20px;font-weight:800;letter-spacing:0.5px;color:var(--gold2)">' + p.name + '</div>' +
      '<div class="pack-box ' + cls + '" id="packBox">' +
      '<div class="pb-ray"></div><div class="pb-inner"><div class="pb-glyph">⚡</div></div><div class="pb-vib"></div>' +
      '</div>' +
      '<div class="pack-msg" id="packMsg">Toca el sobre para abrirlo</div>' +
      '<div class="reveal-big" id="revealBig"></div>' +
      '<div class="reveal-count" id="revealCount"></div>' +
      '<div class="reveal-grid" id="revealGrid"></div>' +
      '<div class="pack-costs" id="packCosts"></div>' +
      '</div>', false);

    var box = U.$('#packBox'), msg = U.$('#packMsg'), big = U.$('#revealBig');
    var grid = U.$('#revealGrid'), count = U.$('#revealCount');

    var opened = false;
    box.addEventListener('click', function () { opened = true; });
    // espera al toque
    var guard = 60000;
    while (!opened && guard > 0) {
      await U.sleep(120); guard -= 120;
    }
    if (!opened) { openingBusy = false; I.closeModal(); return; }

    box.classList.add('shake');
    await U.sleep(900);
    box.style.animation = 'none';
    box.style.transform = 'scale(0)';
    box.style.transition = 'transform .45s ease';
    box.style.display = 'none';
    msg.textContent = '¡Se revelan los augurios del destino...!';
    await U.sleep(500);

    for (var i = 0; i < pulls.length; i++) {
      var pid = pulls[i];
      big.innerHTML = bigCardHTML(pid);
      big.classList.remove('show'); void big.offsetWidth; big.classList.add('show');
      count.textContent = 'Carta ' + (i + 1) + ' de ' + pulls.length;
      playPop();
      await U.sleep(950);
      grid.insertAdjacentHTML('beforeend', rvMiniHTML(pid));
      playPop();
      big.classList.remove('show');
      await U.sleep(250);
    }
    big.innerHTML = '';
    count.textContent = '';
    msg.innerHTML = '¡Recogidas añadidas a tu colección!';
    var btn = document.createElement('button');
    btn.className = 'btn btn-gold btn-block'; btn.id = 'collectBtn'; btn.style.marginTop = '14px';
    btn.textContent = 'Recoger y continuar';
    U.$('#packCosts').appendChild(btn);
    btn.addEventListener('click', function () { I.closeModal(); OU.MAIN.render(); });
    openingBusy = false;
  }

  function doExchange(gems) {
    var st = OU.STATE.state;
    var gold = { 10: 1500, 25: 3900, 50: 8000 }[gems] || 0;
    if (st.gems < gems) return I.toast('No tienes suficientes gemas 💎');
    st.gems -= gems; st.gold += gold;
    OU.STATE.save(); I.updateTopRes();
    I.toast('Canjeaste ' + gems + '💎 por ' + U.fmt(gold) + '🪙');
    OU.MAIN.render();
  }

  /* Reloj del Bazar: actualiza la cuenta atrás mientras la tienda está abierta. */
  var shopTimer = null;
  function startShopTimer() {
    if (shopTimer) return;
    shopTimer = setInterval(function () {
      if (OU.MAIN.currentTab !== 'shop') return;
      var el = U.$('#bazaarTimer');
      if (el) el.textContent = timeLeftLabel();
    }, 30000);
  }

  var audioCtx = null;
  function audio() {
    try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    return audioCtx;
  }
  function playPop() {
    try {
      var ctx = audio();
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle'; o.frequency.value = 500 + Math.random() * 300;
      g.gain.setValueAtTime(0.12, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.16);
    } catch (e) {}
  }

  OU.SHOP = {
    viewShop: viewShop,
    bindShop: bindShop,
    buyPack: buyPack,
    doExchange: doExchange,
    buyOffer: buyOffer,
    refreshBazaar: refreshBazaar,
    ensureBazaar: ensureBazaar,
    makeOffer: makeOffer,
    playPop: playPop,
    audio: audio,
    startShopTimer: startShopTimer,
    get openingBusy() { return openingBusy; }
  };
})();