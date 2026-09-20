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

  /** Renderiza el arte de una carta. Devuelve <img> con fallback a emoji. */
  function artHTML(cardId, sizeCls) {
    var c = OU.CARD_BY_ID[cardId];
    var url = OU.IMG[cardId];
    if (url) {
      return '<img class="card-art ' + (sizeCls || '') + '" src="' + url + '" alt="' + c.n + '" loading="lazy" onerror="this.style.display=\'none\';this.nextSibling.style.display=\'flex\'">' +
        '<span class="card-emo" style="display:none">' + c.ic + '</span>';
    }
    return '<span class="card-emo" style="display:flex">' + c.ic + '</span>';
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
    cardBadge: cardBadge
  };
})();