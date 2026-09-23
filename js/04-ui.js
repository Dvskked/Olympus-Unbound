/**
 * ==== INTERFAZ COMÚN ====
 * Elementos compartidos: barra superior, toast, modales, tarjeta de carta,
 * renderización por imagen con fallback a emoji.
 * @module ui
 */
(function () {
  'use strict';
  var OU = window.OU = window.OU || {};
  var U = OU.UTIL;

  /** Renderiza el arte de una carta con fallback en cadena (local→web→emoji). */
  function artHTML(cardId, sizeCls) {
    var c = OU.CARD_BY_ID[cardId];
    var chain = OU.IMG[cardId] || [];
    if (!chain.length) {
      return '<span class="card-emo" style="display:flex">' + c.ic + '</span>';
    }
    var src = chain[0];
    var rest = chain.slice(1);
    var fb;
    if (rest.length) {
      fb = ' data-fb="' + encodeURIComponent(JSON.stringify(rest)) + '" onerror="window.OU.UI.imgNext(this)"';
    } else {
      fb = ' onerror="this.style.display=\'none\';this.nextSibling.style.display=\'flex\'"';
    }
    return '<img class="card-art ' + (sizeCls || '') + '" src="' + src + '" alt="' + c.n + '" loading="lazy"' + fb + '>' +
      '<span class="card-emo" style="display:none">' + c.ic + '</span>';
  }

  /** Avanza la cadena de imágenes al siguiente candidato; al final muestra el emoji. */
  function imgNext(img) {
    var raw = decodeURIComponent(img.getAttribute('data-fb') || '');
    var rest = [];
    try { rest = JSON.parse(raw); } catch (e) { rest = []; }
    if (!rest.length) {
      img.style.display = 'none';
      var s = img.nextSibling;
      if (s) s.style.display = 'flex';
      return;
    }
    img.src = rest[0];
    img.setAttribute('data-fb', encodeURIComponent(JSON.stringify(rest.slice(1))));
  }

  function rarityHTML(c, r) {
    return '<span class="rar-badge" style="color:' + r.color + ';border-color:' + r.color + '">' + r.name.toUpperCase() + '</span>';
  }

  /** Estado de la racha diaria para el HUD: cuántas gemas están por reclamar hoy. */
  function dailyInfo() {
    var st = OU.STATE.state;
    var d = st.daily = st.daily || { last: '', streak: 0 };
    var today = OU.STATE.todayStr(0), yesterday = OU.STATE.todayStr(1);
    var claimed = d.last === today;
    var streak = claimed ? d.streak : (d.last === yesterday ? d.streak + 1 : 1);
    var reward = Math.min(OU.CONST.DAILY_GEMS_BASE + streak, OU.CONST.DAILY_GEMS_CAP);
    var nextReward = Math.min(OU.CONST.DAILY_GEMS_BASE + (claimed ? d.streak + 1 : streak + 1), OU.CONST.DAILY_GEMS_CAP);
    return { claimed: claimed, streak: streak, reward: reward, nextReward: nextReward };
  }

  function updateTopRes() {
    var st = OU.STATE.state;
    var g = U.$('#goldTxt'), gm = U.$('#gemsTxt');
    var di = dailyInfo();
    if (g) g.textContent = U.fmt(st.gold);
    if (gm) gm.textContent = U.fmt(st.gems);
    var stTxt = U.$('#streakTxt'), stIc = U.$('#streakIc'), chip = U.$('.streak-chip');
    if (stIc) stIc.textContent = di.claimed ? '🔥' : '🎁';
    if (stTxt) stTxt.textContent = di.claimed ? di.streak : di.reward;
    if (chip) chip.classList.toggle('claimed', di.claimed);
  }

  var toastTimer = null;
  function toast(msg, ms) {
    var t = U.$('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, ms || 2400);
  }

  function openModal(html, closable) {
    var ov = U.$('#overlay');
    if (!ov) return;
    ov.innerHTML = '<div class="modal">' + (closable ? '<button class="modal-close" id="moClose">✕</button>' : '') + html + '</div>';
    ov.classList.add('show');
    var c = U.$('#moClose'); if (c) c.addEventListener('click', closeModal);
    var m = U.$('.modal', ov); if (m) m.addEventListener('click', function (e) { e.stopPropagation(); });
    ov.onclick = closable ? closeModal : function () {};
  }

  function closeModal() {
    var ov = U.$('#overlay');
    if (!ov) return;
    ov.classList.remove('show');
    ov.innerHTML = '';
  }

  function cardBadge(c, lvl) {
    var maxed = lvl >= OU.CONST.MAX_LEVEL;
    return 'NV ' + lvl + (maxed ? ' · MÁX' : ' / ' + OU.CONST.MAX_LEVEL);
  }

  /* ---------- SPRITES EN EL INICIO (hub «Mi Equipo») ---------- */
  var hubSprs = new Map();
  var hubSprTimer = null;

  function applyHubFrame(el) {
    var st = hubSprs.get(el); if (!st) return;
    var f = st.idle[st.f];
    el.style.backgroundPosition = (-f[0]) + 'px ' + (-f[1]) + 'px';
  }

  function spriteHub(root) {
    if (!OU.SPRITES) return;
    U.$$('.hub-hero.has-spr', root).forEach(function (h) {
      var el = U.$('.hu-spr', h);
      if (!el || hubSprs.has(el)) return;
      var spr = OU.SPRITES[el.dataset.spr || h.dataset.hero];
      if (!spr) return;
      var mw = 0, mh = 0;
      spr.frames.slice(0, 6).forEach(function (f) { if (f[2] > mw) mw = f[2]; if (f[3] > mh) mh = f[3]; });
      el.style.backgroundImage = 'url(' + spr.src + ')';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.width = mw + 'px';
      el.style.height = mh + 'px';
      hubSprs.set(el, { idle: spr.frames.slice(0, 6), f: 0 });
      applyHubFrame(el);
    });
    if (!hubSprTimer) hubSprTimer = setInterval(function () {
      hubSprs.forEach(function (st, el) {
        if (!document.documentElement.contains(el)) { hubSprs.delete(el); return; }
        st.f = (st.f + 1) % st.idle.length;
        applyHubFrame(el);
      });
    }, 150);
  }

  OU.UI = {
    artHTML: artHTML,
    rarityHTML: rarityHTML,
    dailyInfo: dailyInfo,
    updateTopRes: updateTopRes,
    toast: toast,
    openModal: openModal,
    closeModal: closeModal,
    cardBadge: cardBadge,
    spriteHub: spriteHub,
    imgNext: imgNext
  };
})();