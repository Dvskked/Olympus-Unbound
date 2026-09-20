/**
 * ==== TIENDA ====
 * Compra de sobres, animación de apertura y canje de gemas.
 * @module shop
 */
(function () {
  'use strict';
  var OU = window.OU = window.OU || {};
  var U = OU.UTIL, I = OU.UI;

  var openingBusy = false;

  function viewShop() {
    var st = OU.STATE.state;
    var packs = Object.keys(OU.PACKS).map(function (k) {
      var p = OU.PACKS[k];
      var cost = p.cost.gold ? '<span class="gold">🪙 ' + U.fmt(p.cost.gold) + '</span>' : '<span class="gem">💎 ' + U.fmt(p.cost.gems) + '</span>';
      var oddsRows = p.odds.map(function (o) {
        var l = o[0], v = o[1];
        var col = l === 'Titán' ? OU.RAR.titan.color : l === 'Dios' ? OU.RAR.god.color : l === 'Héroe' ? OU.RAR.hero.color : 'var(--gray)';
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

    return '<div class="sec-title">Tienda de Sobres</div>' +
      '<div class="shop-grid">' + packs + '</div>' +
      '<div class="sec-title">Canje de gemas</div>' +
      '<div class="exchange-card">' +
      '<div class="ex-item" data-ex="10"><div class="ei-ic">💎→🪙</div><div class="ei-body">10 gemas = <span class="g">' + U.fmt(1200) + ' oro</span></div></div>' +
      '<div class="ex-item" data-ex="25"><div class="ei-ic">💎→🪙</div><div class="ei-body">25 gemas = <span class="g">' + U.fmt(3000) + ' oro</span></div></div>' +
      '<div class="ex-item" data-ex="50"><div class="ei-ic">💎→🪙</div><div class="ei-body">50 gemas = <span class="g">' + U.fmt(6000) + ' oro</span></div></div>' +
      '</div>' +
      '<p class="battle-hint">Las gemas se obtienen al completar campaña y subir de nivel.</p>';
  }

  function bindShop(root) {
    U.$$('[data-pack]', root).forEach(function (e) {
      e.addEventListener('click', function () { buyPack(e.dataset.pack); });
    });
    U.$$('[data-ex]', root).forEach(function (e) {
      e.addEventListener('click', function () { doExchange(parseInt(e.dataset.ex, 10)); });
    });
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
      '<div class="reveal-grid ' + (pulls.length === 3 ? 'count3' : pulls.length === 4 ? 'count4' : pulls.length === 6 ? 'count6' : '') + '" id="revealGrid"></div>' +
      '<div class="pack-costs" id="packCosts"></div>' +
      '</div>', true);

    var box = U.$('#packBox'), msg = U.$('#packMsg'), grid = U.$('#revealGrid');
    await U.sleep(500);
    box.classList.add('shake');
    await U.sleep(900);
    box.style.animation = 'none';
    box.style.transform = 'scale(0)';
    box.style.transition = 'transform .45s ease';
    msg.textContent = '¡Se revelan los augurios del destino...!';
    await U.sleep(600);

    var slots = [];
    pulls.forEach(function (pid, i) {
      var el = document.createElement('div');
      el.className = 'rv-card';
      el.style.setProperty('--glow', OU.RAR[OU.CARD_BY_ID[pid].r].glow);
      el.dataset.new = isNew(pid) ? '1' : '0';
      el.innerHTML =
        '<div class="rv-face rv-back"><div class="rv-pip"></div><div class="rv-glyph">O</div></div>' +
        '<div class="rv-face rv-front" style="border:1px solid ' + OU.RAR[OU.CARD_BY_ID[pid].r].color + '">' +
        '<div class="rv-art">' + I.artHTML(pid, 'rv-img') + '</div>' +
        '<div class="rv-n" style="color:' + OU.RAR[OU.CARD_BY_ID[pid].r].color + '">' + OU.CARD_BY_ID[pid].n + '</div>' +
        '<div class="rv-r" style="color:' + OU.RAR[OU.CARD_BY_ID[pid].r].color + '">' + OU.RAR[OU.CARD_BY_ID[pid].r].name + '</div>' +
        '</div>';
      grid.appendChild(el);
      slots.push(el);
    });

    for (var i = 0; i < slots.length; i++) {
      await U.sleep(420);
      slots[i].classList.add('revealed', 'flash');
      if (slots[i].dataset.new === '1') {
        var tag = document.createElement('div');
        tag.className = 'new-tag'; tag.textContent = 'NUEVA';
        slots[i].appendChild(tag);
      }
      var sh = document.createElement('div');
      sh.className = 'rv-shine'; slots[i].appendChild(sh);
      playPop();
    }

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
    var gold = gems * 120;
    if (st.gems < gems) return I.toast('No tienes suficientes gemas 💎');
    st.gems -= gems; st.gold += gold;
    OU.STATE.save(); I.updateTopRes();
    I.toast('Canjeaste ' + gems + '💎 por ' + U.fmt(gold) + '🪙');
    OU.MAIN.render();
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
    playPop: playPop,
    audio: audio,
    get openingBusy() { return openingBusy; }
  };
})();