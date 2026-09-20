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

  function updateTopRes() {
    var st = OU.STATE.state;
    var g = U.$('#goldTxt'), gm = U.$('#gemsTxt');
    if (g) g.textContent = U.fmt(st.gold);
    if (gm) gm.textContent = U.fmt(st.gems);
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

  OU.UI = {
    artHTML: artHTML,
    rarityHTML: rarityHTML,
    updateTopRes: updateTopRes,
    toast: toast,
    openModal: openModal,
    closeModal: closeModal,
    cardBadge: cardBadge,
    imgNext: imgNext
  };
})();