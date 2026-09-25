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

  /** Si existe su versión optimizada (img/optimized/…, generada con
      npm run images), devuelve esa ruta ligera en lugar de la original.
      El fallback onerror de artHTML llevará a la imagen completa. */
  function optOf(src) {
    if (!src || src.indexOf('img/') !== 0) return src;
    if (!/^img\/(personajes|extras\/icons|minijuegos|sobres)\//.test(src)) return src;
    return 'img/optimized/' + src.slice(4);
  }

  /** Renderiza el arte de una carta con fallback en cadena (local→web→emoji). */
  function artHTML(cardId, sizeCls) {
    var c = OU.CARD_BY_ID[cardId];
    var chain = OU.IMG[cardId] || [];
    if (!chain.length) {
      return '<span class="card-emo" style="display:flex">' + c.ic + '</span>';
    }
    var src = optOf(chain[0]);
    var rest = chain.slice(1);
    var fb;
    if (rest.length) {
      fb = ' data-fb="' + encodeURIComponent(JSON.stringify(rest)) + '" onerror="window.OU.UI.imgNext(this)"';
    } else {
      fb = ' onerror="this.style.display=\'none\';this.nextSibling.style.display=\'flex\'"';
    }
    return '<img class="card-art ' + (sizeCls || '') + '" src="' + src + '" alt="' + c.n + '" loading="lazy" decoding="async"' + fb + '>' +
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

  /* ---------- SPRITES ANIMADOS (inicio + detalle de carta) ----------
     Solo algunos personajes tienen hoja de sprite (OU.SPRITES). Para que no
     se vean borrosos al ampliarse, se re-renderizan en un canvas 2× con
     suavizado de alta calidad + máscara de enfoque (unsharp). Un único
     temporizador anima los fotogramas de reposo de todos los elementos vivos. */
  var sprEls = new Map();      // el -> { spr, url, frames, f }
  var sprTimer = null;
  var hqCache = new Map();     // spr.src -> { canvas, frames } (fotogramas ×2)

  function applySpriteFrame(el, st) {
    var frames = st.frames;
    if (!frames || !frames.length) frames = st.spr.frames;
    var mw = 0, mh = 0, i;
    for (i = 0; i < 6; i++) {
      var f = frames[i];
      if (!f) break;
      if (f[2] > mw) mw = f[2];
      if (f[3] > mh) mh = f[3];
    }
    var cur = frames[Math.min(st.f, frames.length - 1)];
    el.style.backgroundImage = 'url(' + st.url + ')';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.width = mw + 'px';
    el.style.height = mh + 'px';
    el.style.backgroundPosition = (-cur[0]) + 'px ' + (-cur[1]) + 'px';
  }

  function tickSprites() {
    sprEls.forEach(function (st, el) {
      if (!document.documentElement || !document.documentElement.contains(el)) { sprEls.delete(el); return; }
      st.f = (st.f + 1) % 6;
      applySpriteFrame(el, st);
    });
  }

  /** Convierte la hoja original a 2×, suavizada y con enfoque. */
  function boxBlur(data, w, h) {
    var out = new Uint8ClampedArray(data.length);
    var x, y, dx, dy, idx, nx, ny, ri, gi, bi, ai;
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        ri = gi = bi = ai = 0;
        for (dy = -1; dy <= 1; dy++) {
          for (dx = -1; dx <= 1; dx++) {
            nx = Math.max(0, Math.min(w - 1, x + dx));
            ny = Math.max(0, Math.min(h - 1, y + dy));
            idx = (ny * w + nx) * 4;
            ri += data[idx]; gi += data[idx + 1]; bi += data[idx + 2]; ai += data[idx + 3];
          }
        }
        idx = (y * w + x) * 4;
        out[idx] = ri / 9; out[idx + 1] = gi / 9; out[idx + 2] = bi / 9; out[idx + 3] = ai / 9;
      }
    }
    return out;
  }

  function sharpenCanvas(cv, w, h) {
    var cx = cv.getContext('2d');
    if (!cx) return;
    var src = cx.getImageData(0, 0, w, h);
    var data = src.data;
    var blur = boxBlur(data, w, h);
    var i;
    for (i = 0; i < data.length; i += 4) {
      var lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      var blum = 0.299 * blur[i] + 0.587 * blur[i + 1] + 0.114 * blur[i + 2];
      var d = lum - blum;
      if (Math.abs(d) > 10) {
        data[i] = Math.max(0, Math.min(255, data[i] + 0.6 * d));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + 0.6 * d));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + 0.6 * d));
      }
    }
    src.data.set(data);
    cx.putImageData(src, 0, 0);
  }

  function prepSpriteHQ(spr) {
    if (!spr || hqCache.has(spr.src) || typeof Image !== 'function' || typeof document === 'undefined' || !document.createElement) return;
    var S = 2;
    var img = new Image();
    img.onload = function () {
      try {
        var big = document.createElement('canvas');
        big.width = img.width * S * 2;
        big.height = img.height * S * 2;
        var bx = big.getContext('2d');
        if (!bx) return;
        bx.imageSmoothingEnabled = true;
        if ('imageSmoothingQuality' in bx) bx.imageSmoothingQuality = 'high';
        bx.drawImage(img, 0, 0, big.width, big.height);
        var cv = document.createElement('canvas');
        cv.width = img.width * S;
        cv.height = img.height * S;
        var cx = cv.getContext('2d');
        if (!cx) return;
        cx.imageSmoothingEnabled = true;
        if ('imageSmoothingQuality' in cx) cx.imageSmoothingQuality = 'high';
        cx.drawImage(big, 0, 0, cv.width, cv.height);
        sharpenCanvas(cv, cv.width, cv.height);
        hqCache.set(spr.src, {
          canvas: cv,
          frames: spr.frames.map(function (f) { return [f[0] * S, f[1] * S, f[2] * S, f[3] * S]; })
        });
        var hq = hqCache.get(spr.src);
        sprEls.forEach(function (st, el) {
          if (st.spr === spr) { st.url = hq.canvas.toDataURL(); st.frames = hq.frames; applySpriteFrame(el, st); }
        });
      } catch (e) { /* entra sin canvas: se sigue usando la hoja original */ }
    };
    img.onerror = function () {};
    img.src = spr.src;
  }

  /** Activa el bucle de reposo de un sprite. Reutilizable: inicio y detalle. */
  function spriteIdle(el, spr) {
    if (!el || !spr || sprEls.has(el)) return;
    var hq = hqCache.get(spr.src);
    sprEls.set(el, {
      spr: spr,
      url: hq ? hq.canvas.toDataURL() : spr.src,
      frames: hq ? hq.frames : spr.frames.slice(0, 6),
      f: 0
    });
    applySpriteFrame(el, sprEls.get(el));
    prepSpriteHQ(spr);
    if (!sprTimer) sprTimer = setInterval(tickSprites, 150);
  }

  /** Hub del inicio: personajes con sprite (reposo animado). */
  function spriteHub(root) {
    if (!OU.SPRITES) return;
    U.$$('.hub-hero.has-spr', root).forEach(function (h) {
      var el = U.$('.hu-spr', h);
      if (!el) return;
      var spr = OU.SPRITES[el.dataset.spr || h.dataset.hero];
      spriteIdle(el, spr);
    });
  }

  OU.UI = {
    artHTML: artHTML,
    optOf: optOf,
    rarityHTML: rarityHTML,
    dailyInfo: dailyInfo,
    updateTopRes: updateTopRes,
    toast: toast,
    openModal: openModal,
    closeModal: closeModal,
    cardBadge: cardBadge,
    sprite: spriteIdle,
    spriteHub: spriteHub,
    imgNext: imgNext
  };
})();