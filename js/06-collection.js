/**
 * ==== COLECCIÓN ====
 * Grid de cartas, filtros, detalle y mejoras de nivel.
 * @module collection
 */
(function () {
  'use strict';
  var OU = window.OU = window.OU || {};
  var U = OU.UTIL, I = OU.UI;

  var collFilter = 'all';
  var collRole = 'all';
  var collSort = 'rare';

  var COLL_RAR_OPTS = [
    ['all', 'Todas'],
    ['normal', 'Normales'],
    ['hero', 'Héroes'],
    ['god', 'Dioses'],
    ['titan', 'Titanes'],
    ['primordial', 'Primordiales'],
    ['creator', 'Creadores']
  ];
  var COLL_ROLE_OPTS = [
    ['all', '🌌 Todo'],
    ['tanque', '🛡️ Tanques'],
    ['guerrero', '⚔️ Guerreros'],
    ['mago', '🔮 Magos'],
    ['soporte', '✨ Soportes']
  ];
  var COLL_SORT_OPTS = [
    ['rare', '🎴 Por rareza'],
    ['power', '⚡ Mejores']
  ];

  function viewCollection() {
    var st = OU.STATE.state;
    var cards = OU.STATE.ownedList();
    if (!cards.length) {
      return '<div class="empty-msg">📜 Tu colección está vacía.<br><br><button class="btn btn-gold" onclick="OU.MAIN.setTab(\'shop\')">Abrir tu primer sobre</button></div>';
    }
    var fbar =
      '<div class="coll-toolbar">' +
      '<div class="fb-label">Rareza</div>' +
      '<div class="filter-bar">' + COLL_RAR_OPTS.map(function (f) {
        return '<button class="fbtn ' + (collFilter === f[0] ? 'active' : '') + '" data-f="' + f[0] + '">' + f[1] + '</button>';
      }).join('') + '</div>' +
      '<div class="fb-label">Rol</div>' +
      '<div class="filter-bar">' + COLL_ROLE_OPTS.map(function (f) {
        return '<button class="fbtn ' + (collRole === f[0] ? 'active' : '') + '" data-r="' + f[0] + '">' + f[1] + '</button>';
      }).join('') + '</div>' +
      '<div class="fb-label">Orden</div>' +
      '<div class="filter-bar sort-bar">' + COLL_SORT_OPTS.map(function (f) {
        return '<button class="fbtn ' + (collSort === f[0] ? 'active' : '') + '" data-s="' + f[0] + '">' + f[1] + '</button>';
      }).join('') + '</div>' +
      '</div>';
    var list = cards
      .map(function (id) { return [id, OU.CARD_BY_ID[id]]; })
      .filter(function (ab) {
        if (collFilter !== 'all' && ab[1].r !== collFilter) return false;
        if (collRole !== 'all' && ab[1].role !== collRole) return false;
        return true;
      })
      .sort(function (a, b) {
        if (collSort === 'power') {
          var pa = U.powerOf(a[0], st.cards[a[0]].lvl);
          var pb = U.powerOf(b[0], st.cards[b[0]].lvl);
          return (pb - pa) || U.rarityOrder(a[0], b[0]);
        }
        return U.rarityOrder(a[0], b[0]);
      });
    var grid = list.map(function (ab) { return collectionCardHTML(ab[0], ab[1]); }).join('');
    return fbar + (grid ? '<div class="ccard-grid">' + grid + '</div>' : '<div class="empty-msg">Sin cartas en esta categoría.</div>');
  }

  function collectionCardHTML(id, c) {
    var st = OU.STATE.state;
    var rc = st.cards[id], r = OU.RAR[c.r], v = U.valuesAt(id, rc.lvl);
    return '<div class="ccard _rar-' + c.r + '" data-card="' + id + '" style="--rar-b:' + r.color + ';--glow:' + r.glow + ';border-color:' + r.color + ';box-shadow:0 4px 14px ' + r.glow + '33">' +
      '<div class="c-top">' +
      '<span style="color:' + r.color + ';border:1px solid ' + r.color + ';background:rgba(0,0,0,0.4);padding:2px 7px;border-radius:5px;font-size:8.5px;font-weight:900;letter-spacing:1.5px">' + r.name.toUpperCase() + '</span>' +
      '<span class="c-dup">' + (rc.dup ? '+' + rc.dup + ' dup' : 'Única') + '</span>' +
      '</div>' +
      '<div class="c-icon-wrap" style="border-color:' + r.color + '55">' + I.artHTML(id, 'c-art') + '</div>' +
      '<div class="c-name">' + c.n + '</div>' +
      '<div class="c-lv">' + I.cardBadge(c, rc.lvl) + '</div>' +
      '<div class="c-stats">' +
      '<span class="c-hp">♥ ' + U.fmt(v.hp) + '</span>' +
      '<span class="c-atk">⚔ ' + U.fmt(v.atk) + '</span>' +
      '<span class="c-def">⛨ ' + U.fmt(v.def) + '</span>' +
      '</div></div>';
  }

  function renderCollection() {
    OU.MAIN.render();
  }

  function openCardDetail(id) {
    var st = OU.STATE.state;
    var c = OU.CARD_BY_ID[id], rc = st.cards[id], r = OU.RAR[c.r], v = U.valuesAt(id, rc.lvl);
    var maxed = rc.lvl >= OU.CONST.MAX_LEVEL;
    var cost = U.upgradeCost(id, rc.lvl);
    var goldCost = U.goldOnlyCost(id, rc.lvl);
    var tcost = U.trainCost(id, rc.lvl);
    var canUp = !maxed && rc.dup >= cost.dupes && st.gold >= cost.gold;
    var canGold = !maxed && st.gold >= goldCost;
    var next = maxed ? null : U.valuesAt(id, rc.lvl + 1);
    var costHtml;
    if (maxed) {
      costHtml = '<div class="up-cost" style="color:var(--gold2)">NIVEL MÁXIMO ALCANZADO</div>';
    } else {
      costHtml =
        '<div>' +
        '<div class="up-cost">Requiere <span class="' + (rc.dup >= cost.dupes ? 'ok' : 'bad') + '">' + cost.dupes + ' duplicado(s)</span> · Tienes <span class="' + (rc.dup >= cost.dupes ? 'ok' : 'bad') + '">' + rc.dup + '</span></div>' +
        '<div class="up-cost">Costo en oro: <span class="' + (st.gold >= cost.gold ? 'ok' : 'bad') + '">🪙 ' + U.fmt(cost.gold) + '</span> · Tienes 🪙 ' + U.fmt(st.gold) + '</div>' +
        '<div class="up-cost">Solo con oro: <span class="' + (st.gold >= goldCost ? 'ok' : 'bad') + '">🪙 ' + U.fmt(goldCost) + '</span> (sin duplicados)</div>' +
        (next ? '<div class="up-preview">HP ' + U.fmt(v.hp) + '→' + U.fmt(next.hp) + ' · ATK ' + U.fmt(v.atk) + '→' + U.fmt(next.atk) + ' · DEF ' + U.fmt(v.def) + '→' + U.fmt(next.def) + '</div>' : '') +
        (rc.xp ? '<div class="train-xp">🏋️ XP de entrenamiento: ' + rc.xp + ' / ' + tcost + '</div>' : '') +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:6px;align-items:stretch">' +
        '<button class="btn btn-gold btn-sm" ' + (canUp ? '' : 'disabled') + ' id="upBtn">⬆ Subir a NV ' + (rc.lvl + 1) + '</button>' +
        '<button class="btn btn-blue btn-sm" ' + (canGold ? '' : 'disabled') + ' id="goldBtn">💰 Mejorar solo con oro</button>' +
        '</div>';
    }
I.openModal(
      '<div class="detail-ig">' +
      '<div class="detail-hero _rar-' + c.r + '" style="--glow:' + r.glow + ';border-color:' + r.color + '">' +
      '<div class="detail-icon _rar-' + c.r + '" style="--glow:' + r.glow + ';border-color:' + r.color + '">' + I.artHTML(id, 'detail-art') + '</div>' +
      '<div class="detail-name" style="color:' + r.color + '">' + c.n + '</div>' +
      '<div class="detail-badges">' +
      '<span class="badge" style="color:' + r.color + ';border:1px solid ' + r.color + ';background:rgba(0,0,0,0.4)">' + r.name + '</span>' +
      '<span class="badge badge-role">' + OU.ROLES[c.role] + '</span>' +
      '<span class="badge" style="background:#151c38;border:1px solid var(--line);color:var(--gold2)">' + I.cardBadge(c, rc.lvl) + '</span>' +
      '</div>' +
      '</div>' +
      '<div class="detail-sec">' +
      '<div class="ds-title">⚡ Atributos</div>' +
      '<div class="stat-grid">' +
      '<div class="stat-box hp"><span class="lb">Vida</span><span class="va">' + U.fmt(v.hp) + '</span></div>' +
      '<div class="stat-box atk"><span class="lb">Ataque</span><span class="va">' + U.fmt(v.atk) + '</span></div>' +
      '<div class="stat-box def"><span class="lb">Defensa</span><span class="va">' + U.fmt(v.def) + '</span></div>' +
      '<div class="stat-box spd"><span class="lb">Velocidad</span><span class="va">' + v.spd + '</span></div>' +
      '</div>' +
      '</div>' +
      '<div class="detail-sec">' +
      '<div class="ds-title">✨ Habilidad especial</div>' +
      '<div class="abil-box">' +
      '<div class="ab-name">' + c.ab.n + '</div>' +
      '<div class="ab-desc">' + U.abDesc(c.ab, id) + '</div>' +
      '</div>' +
      '</div>' +
      '<div class="detail-sec">' +
      '<div class="ds-title">📜 Leyenda</div>' +
      '<div class="tale-box">' + (c.d || 'Su leyenda se ha perdido en el tiempo.') + '</div>' +
      '</div>' +
      '<div class="detail-sec">' +
      '<div class="ds-title">⬆ Mejora</div>' +
      '<div class="upgrade-row">' + costHtml + '</div>' +
      '</div>', true);

    var up = U.$('#upBtn');
    if (up) up.addEventListener('click', function () {
      if (st.gold < cost.gold || rc.dup < cost.dupes) return I.toast('No tienes suficientes recursos');
      st.gold -= cost.gold; rc.dup -= cost.dupes; rc.lvl++;
      OU.STATE.save();
      I.toast('⬆ ' + c.n + ' subió a nivel ' + rc.lvl);
      openCardDetail(id);
      OU.MAIN.render();
    });

    var goldBtn = U.$('#goldBtn');
    if (goldBtn) goldBtn.addEventListener('click', function () {
      if (st.gold < goldCost) return I.toast('No tienes suficiente oro 🪙');
      st.gold -= goldCost; rc.lvl++;
      OU.STATE.save();
      I.toast('💰 ' + c.n + ' subió a nivel ' + rc.lvl + ' sin duplicados');
      openCardDetail(id);
      OU.MAIN.render();
    });
  }

  function bindCollection(root) {
    U.$$('[data-f]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        U.$$('[data-f]', root).forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        collFilter = b.dataset.f;
        OU.MAIN.render();
      });
    });
    U.$$('[data-r]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        U.$$('[data-r]', root).forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        collRole = b.dataset.r;
        OU.MAIN.render();
      });
    });
    U.$$('[data-s]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        U.$$('[data-s]', root).forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        collSort = b.dataset.s;
        OU.MAIN.render();
      });
    });
    U.$$('[data-card]', root).forEach(function (cEl) {
      cEl.addEventListener('click', function () { openCardDetail(cEl.dataset.card); });
    });
  }

  OU.COLLECTION = {
    viewCollection: viewCollection,
    bindCollection: bindCollection,
    openCardDetail: openCardDetail
  };
})();