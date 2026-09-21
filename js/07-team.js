/**
 * ==== EQUIPO ====
 * Gestión de las 5 ranuras, selector de cartas y poder total.
 * @module team
 */
(function () {
  'use strict';
  var OU = window.OU = window.OU || {};
  var U = OU.UTIL, I = OU.UI;

  function viewTeam() {
    var st = OU.STATE.state;
    var slots = st.team.map(function (id, i) { return teamSlotHTML(id, i); }).join('');
    var ids = st.team.filter(Boolean);
    var pow = ids.reduce(function (s, id) { return s + U.powerOf(id, st.cards[id].lvl); }, 0);
    var cnt = ids.length;
    return '<div class="power-box">' +
      '<div><div class="pb-label">Poder total del equipo</div><div class="pb-val">' + U.fmt(pow) + '</div></div>' +
      '<div style="text-align:right"><div class="pb-label">Miembros</div><div class="pb-val" style="font-size:18px;color:var(--text)">' + cnt + '/' + OU.CONST.MAX_TEAM + '</div></div>' +
      '</div>' +
      '<button class="btn btn-blue btn-block" id="equipBest" style="margin-bottom:14px">⚡ Equipar los mejores</button>' +
      '<div class="squad-wrap">' + slots + '</div>' +
      '<p class="battle-hint">Toca una ranura para asignar o cambiar una carta. «Equipar los mejores» completa el equipo con tus cartas de mayor poder.</p>' +
      (cnt > 0 && OU.STAGES.length > 0 ? '<button class="btn btn-gold btn-block" style="margin-top:14px" onclick="OU.MAIN.setTab(\'home\')">⚔️ Ir a la batalla</button>' : '');
  }

  function teamSlotHTML(id, i) {
    var st = OU.STATE.state;
    if (!id || !st.cards[id]) {
      return '<div class="slot" data-slot="' + i + '"><div class="slot-plus">+</div><div class="slot-txt">Ranura ' + (i + 1) + '</div></div>';
    }
    var c = OU.CARD_BY_ID[id], lvl = st.cards[id].lvl, v = U.valuesAt(id, lvl), r = OU.RAR[c.r];
    return '<div class="slot filled" data-slot="' + i + '" style="--glow:' + r.color + ';border-color:' + r.color + '">' +
      '<div class="s-lvl">NV ' + lvl + '</div>' +
      '<div class="s-art">' + I.artHTML(id, 'slot-art') + '</div>' +
      '<div class="s-name">' + c.n + '</div>' +
      '<div class="s-role">' + OU.ROLES[c.role] + '</div>' +
      '<div style="font-size:8px;color:var(--dim);margin-top:2px">💪 ' + U.fmt(v.hp) + ' · ⚔️ ' + U.fmt(v.atk) + ' · 🛡️ ' + U.fmt(v.def) + '</div>' +
      '<div class="s-bar" style="transform:scaleX(' + U.clamp(v.hp / 1500, 0.15, 1) + ')"></div>' +
      '</div>';
  }

  /** Renderiza el "Mi Equipo" del centro de la ciudad: hasta 5 cartas con su aura. */
  function teamHubHTML() {
    var st = OU.STATE.state;
    var out = [];
    for (var i = 0; i < OU.CONST.MAX_TEAM; i++) {
      var id = st.team[i];
      if (!id || !st.cards[id]) {
        out.push('<button class="hub-hero empty" data-gotab="team">' +
          '<span class="hu-ring"></span><span class="hu-plus">+</span>' +
          '<span class="hu-name">Ranura ' + (i + 1) + '</span></button>');
        continue;
      }
      var c = OU.CARD_BY_ID[id], lvl = st.cards[id].lvl, r = OU.RAR[c.r];
      out.push('<button class="hub-hero _rar-' + c.r + '" data-hero="' + id + '" title="' + c.n + ' · ' + r.name + '">' +
        '<span class="hu-lvl">NV ' + lvl + '</span>' +
        '<span class="hu-disc">' + I.artHTML(id, 'hub-art') + '</span>' +
        '<span class="hu-name" style="color:' + r.color + '">' + c.n + '</span></button>');
    }
    return out.join('');
  }

  function openTeamPicker(slotIdx) {
    var st = OU.STATE.state;
    var owned = OU.STATE.ownedList();
    var inTeam = new Set(st.team.filter(Boolean));
    if (st.team[slotIdx]) inTeam.delete(st.team[slotIdx]);
    var rows = owned.sort(function (a, b) { return U.rarityOrder(a, b); }).map(function (id) {
      var c = OU.CARD_BY_ID[id], lvl = st.cards[id].lvl, r = OU.RAR[c.r];
      var on = inTeam.has(id);
      return '<div class="picker-row ' + (on ? 'disabled' : '') + '" data-pick="' + id + '"' + (on ? ' data-nosel="1"' : '') + '>' +
        '<div class="pr-icon" style="border-color:' + r.color + '">' + I.artHTML(id, 'pick-art') + '</div>' +
        '<div class="pr-info">' +
        '<div class="pr-name" style="color:' + r.color + '">' + c.n + '</div>' +
        '<div class="pr-meta">' + r.name + ' · NV ' + lvl + ' · ' + OU.ROLES[c.role] + ' · Poder ' + U.fmt(U.powerOf(id, lvl)) + '</div>' +
        '</div>' +
        (on ? '<div class="pr-check" style="color:var(--dim)">En equipo ✓</div>' : '<div class="pr-check" style="color:var(--gold2)">Asignar ➜</div>') +
        '</div>';
    }).join('');
    I.openModal(
      '<div class="sec-title" style="margin-top:8px">Asignar ranura ' + (slotIdx + 1) + '</div>' +
      (owned.length ? rows : '<div class="empty-msg">Aún no tienes cartas. Abre sobres en la tienda 🏛️</div>') +
      '<div style="display:flex;gap:8px;margin-top:12px">' +
      (st.team[slotIdx] ? '<button class="btn btn-red btn-sm" id="removePick">✖ Quitar carta</button>' : '') +
      '<button class="btn btn-gold btn-block" id="closePick">Listo</button>' +
      '</div>', true);

    U.$$('[data-pick]', U.$('#overlay')).forEach(function (r) {
      r.addEventListener('click', function () {
        if (r.dataset.nosel) return;
        st.team[slotIdx] = r.dataset.pick;
        OU.STATE.save();
        I.closeModal();
        OU.MAIN.setTab('team');
      });
    });
    var rm = U.$('#removePick');
    if (rm) rm.addEventListener('click', function () {
      st.team[slotIdx] = null;
      OU.STATE.save();
      I.closeModal();
      OU.MAIN.setTab('team');
    });
    var cl = U.$('#closePick');
    if (cl) cl.addEventListener('click', I.closeModal);
  }

  function equipBest() {
    var st = OU.STATE.state;
    var owned = OU.STATE.ownedList();
    if (!owned.length) return I.toast('Aún no tienes cartas en la colección');
    owned.sort(function (a, b) {
      return U.powerOf(b, st.cards[b].lvl) - U.powerOf(a, st.cards[a].lvl);
    });
    var n = Math.min(OU.CONST.MAX_TEAM, owned.length);
    st.team = new Array(OU.CONST.MAX_TEAM).fill(null);
    for (var i = 0; i < n; i++) st.team[i] = owned[i];
    OU.STATE.save();
    I.toast('⚡ Equipo completado con tus ' + n + ' cartas más poderosas');
    OU.MAIN.render();
  }

  function bindTeam(root) {
    U.$$('.slot', root).forEach(function (s) {
      s.addEventListener('click', function () { openTeamPicker(parseInt(s.dataset.slot, 10)); });
    });
    var eq = U.$('#equipBest', root);
    if (eq) eq.addEventListener('click', equipBest);
  }

  OU.TEAM = {
    viewTeam: viewTeam,
    bindTeam: bindTeam,
    teamHubHTML: teamHubHTML,
    openTeamPicker: openTeamPicker,
    equipBest: equipBest
  };
})();