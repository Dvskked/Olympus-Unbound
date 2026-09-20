/**
 * ==== ÍNDICE DE LEYENDAS ====
 * Muestra TODAS las cartas del juego, desbloqueadas y por desbloquear,
 * ordenadas de la más poderosa a la más débil (poder máximo posible).
 * @module index
 */
(function () {
  'use strict';
  var OU = window.OU = window.OU || {};
  var U = OU.UTIL, I = OU.UI;

  var idxRar = 'all';     // filtro por rareza
  var idxState = 'all';   // all | unlocked | locked

  function wasSeen(id) { return !!OU.STATE.state.cards[id]; }

  /** Poder máximo posible de una carta (sus stats en el nivel máximo). */
  function maxPower(id) { return U.powerOf(id, OU.CONST.MAX_LEVEL); }

  function viewIndex() {
    var st = OU.STATE.state;
    var all = OU.CARDS.slice();
    var owned = all.filter(function (c) { return st.cards[c.id]; }).length;

    all.sort(function (a, b) { return maxPower(b.id) - maxPower(a.id); });

    var cards = all
      .filter(function (c) { return idxRar === 'all' || c.r === idxRar; })
      .filter(function (c) {
        if (idxState === 'unlocked') return wasSeen(c.id);
        if (idxState === 'locked') return !wasSeen(c.id);
        return true;
      });

    var countByRar = {};
    var totalByRar = {};
    OU.CARDS.forEach(function (c) {
      totalByRar[c.r] = (totalByRar[c.r] || 0) + 1;
    });
    Object.keys(st.cards).forEach(function (id) {
      var c = OU.CARD_BY_ID[id];
      if (c) countByRar[c.r] = (countByRar[c.r] || 0) + 1;
    });

    var rarFilters = [['all', 'Todas'], ['normal', 'Normales'], ['hero', 'Héroes'], ['god', 'Dioses'], ['titan', 'Titanes'], ['primordial', 'Primordiales']];
    var stateFilters = [['all', 'Todas'], ['unlocked', 'Desbloqueadas'], ['locked', 'No desbloqueadas']];

    var fbar = '<div class="filter-bar">' + rarFilters.map(function (f) {
      return '<button class="fbtn ' + (idxRar === f[0] ? 'active' : '') + '" data-idx-rar="' + f[0] + '">' + f[1] + '</button>';
    }).join('') + '</div>';
    var sbar = '<div class="filter-bar">' + stateFilters.map(function (f) {
      return '<button class="fbtn ' + (idxState === f[0] ? 'active' : '') + '" data-idx-state="' + f[0] + '">' + f[1] + '</button>';
    }).join('') + '</div>';

    var prog = '<div class="idx-progress">' +
      '<div class="idx-prog-val">📖 Desbloqueadas: <b>' + owned + ' / ' + OU.CARDS.length + '</b></div>' +
      '<div class="ib-bar"><div class="ib-fill" style="width:' + Math.round(owned / OU.CARDS.length * 100) + '%"></div></div>' +
      Object.keys(totalByRar).map(function (r) {
        var got = countByRar[r] || 0;
        return '<span class="idx-rar-pill" style="color:' + OU.RAR[r].color + '">' + OU.RAR[r].name + ' · ' + got + '/' + totalByRar[r] + '</span>';
      }).join('') +
      '</div>';

    var grid = cards.map(function (c) {
      return indexCardHTML(c);
    }).join('');

    return '<div class="sec-title">Índice de Leyendas</div>' +
      prog +
      fbar + sbar +
      '<p class="battle-hint">Ordenadas de la más poderosa a la más débil (poder máximo). Toca una desbloqueada para ver tus progresos.</p>' +
      (grid ? '<div class="ccard-grid">' + grid + '</div>' : '<div class="empty-msg">No hay cartas en esta categoría.</div>');
  }

  function indexCardHTML(c) {
    var st = OU.STATE.state;
    var have = st.cards[c.id];
    var r = OU.RAR[c.r];
    var pMax = maxPower(c.id);
    if (!have) {
      return '<div class="ccard index-card locked _rar-' + c.r + '" style="--rar-b:' + r.color + ';border-color:' + r.color + '22">' +
        '<div class="c-top">' +
        '<span class="rar-badge" style="color:' + r.color + ';border:1px solid ' + r.color + ';background:rgba(0,0,0,0.4)">' + r.name.toUpperCase() + '</span>' +
        '<span class="c-dup">🔒</span>' +
        '</div>' +
        '<div class="c-icon-wrap idx-lock-wrap">' +
        '<span class="idx-lock">❓<small>sin desbloquear</small></span>' +
        '</div>' +
        '<div class="c-name">???</div>' +
        '<div class="c-lv">Poder máx: ' + U.fmt(pMax) + '</div>' +
        '</div>';
    }
    var v = U.valuesAt(c.id, have.lvl);
    return '<div class="ccard index-card _rar-' + c.r + '" data-card="' + c.id + '" style="--rar-b:' + r.color + ';border-color:' + r.color + '">' +
      '<div class="c-top">' +
      '<span class="rar-badge" style="color:' + r.color + ';border:1px solid ' + r.color + ';background:rgba(0,0,0,0.4)">' + r.name.toUpperCase() + '</span>' +
      '<span class="c-dup">' + (have.dup ? '+' + have.dup + ' dup' : 'Única') + '</span>' +
      '</div>' +
      '<div class="c-icon-wrap" style="border-color:' + r.color + '55">' + I.artHTML(c.id, 'c-art') + '</div>' +
      '<div class="c-name">' + c.n + '</div>' +
      '<div class="c-lv">' + I.cardBadge(c, have.lvl) + ' · 💪 ' + U.fmt(U.powerOf(c.id, have.lvl)) + '</div>' +
      '<div class="c-stats">' +
      '<span class="c-hp">♥ ' + U.fmt(v.hp) + '</span>' +
      '<span class="c-atk">⚔ ' + U.fmt(v.atk) + '</span>' +
      '<span class="c-def">⛨ ' + U.fmt(v.def) + '</span>' +
      '</div></div>';
  }

  function bindIndex(root) {
    U.$$('[data-idx-rar]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        U.$$('[data-idx-rar]', root).forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        idxRar = b.dataset.idxRar;
        OU.MAIN.render();
      });
    });
    U.$$('[data-idx-state]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        U.$$('[data-idx-state]', root).forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        idxState = b.dataset.idxState;
        OU.MAIN.render();
      });
    });
    U.$$('.index-card[data-card]', root).forEach(function (el) {
      el.addEventListener('click', function () { OU.COLLECTION.openCardDetail(el.dataset.card); });
    });
  }

  OU.INDEX = {
    viewIndex: viewIndex,
    bindIndex: bindIndex,
    maxPower: maxPower
  };
})();