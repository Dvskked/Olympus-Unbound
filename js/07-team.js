/**
 * ==== EQUIPO ====
 * Gestión de las 6 ranuras en formación 1-2-2-1, selector de cartas con
 * rol fijo por ranura y poder total.
 * @module team
 */
(function () {
  'use strict';
  var OU = window.OU = window.OU || {};
  var U = OU.UTIL, I = OU.UI;

  /** Minidiagrama de la formación 1-2-2-1: tanque al frente, soporte atrás. */
  function formationHTML() {
    return '<div class="formation-hint">' +
      '<div class="fh-row fh-back"><span>Soporte</span></div>' +
      '<div class="fh-row"><span>Mago</span><span>Mago</span></div>' +
      '<div class="fh-row"><span>Guerrero</span><span>Guerrero</span></div>' +
      '<div class="fh-row fh-front"><span>Tanque</span></div>' +
      '</div>';
  }

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
      formationHTML() +
      '<div class="squad-wrap">' + slots + '</div>' +
      '<p class="battle-hint">Formación 1-2-2-1: el tanque al frente, los 2 guerreros a los lados, los 2 magos detrás y el soporte al final. Cada ranura acepta un rol fijo. «Equipar los mejores» arma la mejor formación con tus cartas.</p>' +
      (cnt > 0 && OU.STAGES.length > 0 ? '<button class="btn btn-gold btn-block" style="margin-top:14px" onclick="OU.MAIN.setTab(\'home\')">⚔️ Ir a la batalla</button>' : '');
  }

  function teamSlotHTML(id, i) {
    var st = OU.STATE.state;
    var role = OU.CONST.TEAM_SLOT_ROLES[i];
    if (!id || !st.cards[id]) {
      return '<div class="slot" data-slot="' + i + '"><div class="slot-plus">+</div><div class="slot-txt">' + OU.ROLES[role] + '</div></div>';
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
          '<span class="hu-name">' + OU.ROLES[OU.CONST.TEAM_SLOT_ROLES[i]] + '</span></button>');
        continue;
      }
      var c = OU.CARD_BY_ID[id], lvl = st.cards[id].lvl, r = OU.RAR[c.r];
      if (OU.SPRITES && OU.SPRITES[id]) {
        var ts = c.role === 'tanque' ? 1.3 : c.role === 'soporte' ? 1.15 : 1;
        out.push('<button class="hub-hero has-spr" data-hero="' + id + '" title="' + c.n + ' · ' + r.name + '">' +
          '<span class="hu-lvl">NV ' + lvl + '</span>' +
          '<span class="hu-spr" data-spr="' + id + '" style="--ts:' + ts + '"></span>' +
          '<span class="hu-name" style="color:' + r.color + '">' + c.n + '</span></button>');
        continue;
      }
      out.push('<button class="hub-hero _rar-' + c.r + '" data-hero="' + id + '" title="' + c.n + ' · ' + r.name + '">' +
        '<span class="hu-lvl">NV ' + lvl + '</span>' +
        '<span class="hu-disc">' + I.artHTML(id, 'hub-art') + '</span>' +
        '<span class="hu-name" style="color:' + r.color + '">' + c.n + '</span></button>');
    }
    return out.join('');
  }

  function openTeamPicker(slotIdx) {
    var st = OU.STATE.state;
    var slotRole = OU.CONST.TEAM_SLOT_ROLES[slotIdx];
    var cap = OU.CONST.ROLE_CAPS[slotRole];
    var owned = OU.STATE.ownedList();
    var inTeam = new Set(st.team.filter(Boolean));
    if (st.team[slotIdx]) inTeam.delete(st.team[slotIdx]);
    var counts = { tanque: 0, guerrero: 0, mago: 0, soporte: 0 };
    st.team.forEach(function (id, i) {
      if (id && i !== slotIdx && st.cards[id]) counts[OU.CARD_BY_ID[id].role]++;
    });
    var slotsLeft = Math.max(0, cap - counts[slotRole]);
    var allowed = !!st.team[slotIdx] || slotsLeft > 0;
    var rows = owned.filter(function (id) {
      return OU.CARD_BY_ID[id].role === slotRole;
    }).sort(function (a, b) { return U.rarityOrder(a, b); }).map(function (id) {
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
    var emptyMsg = owned.length
      ? 'No tienes cartas de rol «' + OU.ROLES[slotRole] + '» en la colección. Abre sobres o entrena para conseguirlas 🏛️'
      : 'Aún no tienes cartas. Abre sobres en la tienda 🏛️';
    I.openModal(
      '<div class="sec-title" style="margin-top:8px">Asignar ranura ' + (slotIdx + 1) + ' · ' + OU.ROLES[slotRole] + '</div>' +
      '<div style="text-align:center;font-size:11px;color:var(--dim);margin:4px 0 10px">' +
      (allowed ? 'Quedan ' + slotsLeft + ' ranura(s) de ' + OU.ROLES[slotRole] + ' por llenar' : 'Tope de ' + OU.ROLES[slotRole] + ' alcanzado: 1 tanque · 2 guerreros · 2 magos · 1 soporte') +
      '</div>' +
      (rows ? rows : '<div class="empty-msg">' + emptyMsg + '</div>') +
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

  /** Modal «Editar Mi Equipo»: desde el inicio o la colección, sin salir de la pantalla. */
  function openTeamEditorModal() {
    function draw() {
      var st = OU.STATE.state;
      var slots = st.team.map(function (id, i) { return teamSlotHTML(id, i); }).join('');
      I.openModal(
        '<div class="sec-title" style="margin-top:8px">🛡️ Editar Mi Equipo</div>' +
        '<button class="btn btn-blue btn-block" id="tEqBest" style="margin-bottom:12px">⚡ Equipar los mejores</button>' +
        formationHTML() +
        '<div class="squad-wrap">' + slots + '</div>' +
        '<p class="battle-hint">Formación 1-2-2-1: tanque al frente, 2 guerreros a los lados, 2 magos detrás y soporte al final. Toca una ranura para elegir la carta de ese rol.</p>' +
        '<button class="btn btn-gold btn-block" id="tDone">Listo</button>', true);
      U.$$('.slot', U.$('#overlay')).forEach(function (s) {
        s.addEventListener('click', function () { openTeamPicker(parseInt(s.dataset.slot, 10)); });
      });
      var eq = U.$('#tEqBest');
      if (eq) eq.addEventListener('click', function () { equipBest(); draw(); });
      var dn = U.$('#tDone');
      if (dn) dn.addEventListener('click', I.closeModal);
      OU.MAIN.render();
    }
    draw();
  }

  function equipBest() {
    var st = OU.STATE.state;
    var owned = OU.STATE.ownedList();
    if (!owned.length) return I.toast('Aún no tienes cartas en la colección');
    var byRole = { tanque: [], guerrero: [], mago: [], soporte: [] };
    owned.forEach(function (id) {
      var c = OU.CARD_BY_ID[id];
      if (byRole[c.role]) byRole[c.role].push(id);
    });
    Object.keys(byRole).forEach(function (r) {
      byRole[r].sort(function (a, b) { return U.powerOf(b, st.cards[b].lvl) - U.powerOf(a, st.cards[a].lvl); });
      byRole[r] = byRole[r].slice(0, OU.CONST.ROLE_CAPS[r]);
    });
    var used = {};
    var team = OU.CONST.TEAM_SLOT_ROLES.map(function (r) {
      var pick = null;
      for (var i = 0; i < byRole[r].length; i++) {
        if (!used[byRole[r][i]]) { pick = byRole[r][i]; used[pick] = true; break; }
      }
      return pick;
    });
    st.team = team;
    var n = team.filter(Boolean).length;
    OU.STATE.save();
    I.toast('⚡ Formación ' + n + '/6 lista: 1 tanque, 2 guerreros, 2 magos y 1 soporte');
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
    openTeamEditorModal: openTeamEditorModal,
    equipBest: equipBest
  };
})();