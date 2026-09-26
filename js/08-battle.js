/**
 * ==== BATALLA ====
 * Motor de combate en tiempo real con barras de vida, energía, habilidades
 * y animaciones. También la vista principal de campaña.
 * @module battle
 */
(function () {
  'use strict';
  var OU = window.OU = window.OU || {};
  var U = OU.UTIL, I = OU.UI;

  var battleFast = 1;
  var battleRunning = false;
  var myUnits = [], enUnits = [];

  /* ---------- VISTA CAMPAÑA ---------- */

  /** Puntos de dificultad (●○○○○) para la etiqueta de una fase. */
  /** 5 puntos de dificultad. `diff` va de 0 (SENCILLA) a 4 (BRUTAL). */
  function diffDots(diff) {
    var n = Math.max(0, Math.min(OU.DIFF.length - 1, diff | 0));
    var out = '<span class="diff-dots d-' + n + '" title="Dificultad ' + (n + 1) + '/' + OU.DIFF.length + '">';
    for (var i = 0; i < OU.DIFF.length; i++) out += '<i' + (i <= n ? ' class="on"' : '') + '></i>';
    return out + '</span>';
  }

  /**
   * Panel «Estado de fuerzas»: la respuesta directa a «¿somos fuertes?».
   * Nivel general del equipo + tu poder frente al poder real de la fase.
   */
  function forcePanelHTML() {
    var st = OU.STATE.state;
    var lvl = U.teamLevelInfo();
    var mine = U.teamPower();
    var idx = U.currentStage();
    var s = OU.STAGES[idx];
    var theirs = U.stagePower(idx);
    var v = U.verdict(mine, theirs);
    var cnt = st.team.filter(Boolean).length;
    /* Barra de fuerza: tu poder (verde/oro) contra el de la fase (rojo). */
    var max = Math.max(mine, theirs, 1);
    var wMe = Math.round(mine / max * 100);
    var wTh = Math.round(theirs / max * 100);
    var gap = theirs - mine;
    return '<div class="force-panel">' +
      '<div class="fp-tlv">' +
      '<div class="fp-lv-num">' + lvl.lvl + '</div>' +
      '<div class="fp-lv-info">' +
      '<div class="fp-lv-lab">Nivel general del equipo</div>' +
      '<div class="fp-lv-bar"><div class="fp-lv-fill" style="width:' + Math.max(2, lvl.pct) + '%"></div></div>' +
      '<div class="fp-lv-sub">' + (lvl.cards
        ? '<b>' + lvl.total + '</b> niveles repartidos en <b>' + lvl.cards + '</b> cartas · faltan <b>' + lvl.missing + '</b> para el <b>' + lvl.next + '</b>'
        : 'Sin cartas todavía: abre tu primer sobre 🏛️') + '</div>' +
      '</div></div>' +
      '<div class="fp-vs">' +
      '<div class="fp-side fp-mine"><div class="fp-n">' + U.fmt(mine) + '</div><div class="fp-l">Tu poder ⚔️</div></div>' +
      '<div class="fp-vs-badge ' + v.cls + '">' + v.n + '</div>' +
      '<div class="fp-side fp-theirs"><div class="fp-n">' + U.fmt(theirs) + '</div><div class="fp-l">Fase ' + (idx + 1) + ' 🛡️</div></div>' +
      '</div>' +
      '<div class="fp-bars">' +
      '<div class="fp-bar"><div class="fp-bar-me" style="width:' + wMe + '%"></div></div>' +
      '<div class="fp-bar fp-bar-en"><div class="fp-bar-th" style="width:' + wTh + '%"></div></div>' +
      '</div>' +
      '<div class="fp-verdict ' + v.cls + '">' + forceAdviceHTML(v, gap, cnt) + '</div>' +
      '</div>';
  }

  /** Texto accionable según el veredicto: siempre dice qué hacer. */
  function forceAdviceHTML(v, gap, cnt) {
    if (cnt < OU.CONST.MAX_TEAM) {
      return 'Te faltan <b>' + (OU.CONST.MAX_TEAM - cnt) + '</b> ranuras: cada carta extra suma su poder al total.';
    }
    if (v.gap <= 0) {
      return 'Tu poder supera al rival por <b>' + U.fmt(-v.gap) + '</b>. Margen amplio: entra sin miedo.';
    }
    return 'Te faltan <b>' + U.fmt(v.gap) + '</b> de poder. <b>Entrena tus cartas</b>, abre sobres y vuelve.';
  }

  function viewHome() {
    var st = OU.STATE.state;
    var unique = OU.STATE.ownedList().length;
    var mine = U.teamPower();
    var lvl = U.teamLevelInfo();
    var stag = U.currentStage();
    var last = OU.STAGES.length - 1;
    var done = stag >= last;
    var cur = OU.STAGES[stag];
    var progressPct = Math.min(100, Math.round(st.xp / U.xpNeed(st.lvl) * 100));
    var dl = st.daily || { last: '', streak: 0 };
    var today = OU.STATE.todayStr(0);
    var nextReward = Math.min(OU.CONST.DAILY_GEMS_BASE + dl.streak + 1, OU.CONST.DAILY_GEMS_CAP);
    var dailyTxt = dl.last === today
      ? '🎁 Racha diaria (día <b>' + dl.streak + '</b>): vuelve mañana por <b>+' + nextReward + ' 💎</b>'
      : '🎁 Racha diaria: <b>+2 💎</b> al entrar hoy';
    return '<div class="hero">' +
      '<div class="logo-wrap">' +
      '<img class="logo-img" src="img/extras/logo/logo-olympus.png" alt="Olympus Unbound" onerror="this.style.display=\'none\'">' +
      '</div>' +
      '<h1>OLYMPUS UNBOUND</h1>' +
      '<div class="tagline">Forja tu legado entre dioses y titanes</div>' +
      '<div class="daily-chip">' + dailyTxt + '</div>' +
      '<div class="hero-stats">' +
      '<div class="hstat"><div class="v">' + st.lvl + '</div><div class="l">Nivel</div>' +
      '<div class="xp-bar"><div class="xp-fill" style="width:' + progressPct + '%"></div></div></div>' +
      '<div class="hstat"><div class="v">' + unique + '<span style="font-size:11px;color:var(--dim)">/' + OU.CARDS.length + '</span></div><div class="l">Cartas</div></div>' +
      '<div class="hstat"><div class="v">' + lvl.lvl + '</div><div class="l">Nivel equipo</div>' +
      '<div class="xp-bar"><div class="xp-fill" style="width:' + lvl.pct + '%"></div></div></div>' +
      '<div class="hstat"><div class="v">' + U.fmt(mine) + '</div><div class="l">Poder</div></div>' +
      '<div class="hstat"><div class="v">' + (done ? OU.STAGES.length : stag + 1) + '<span style="font-size:11px;color:var(--dim)">/' + OU.STAGES.length + '</span></div><div class="l">Campaña</div></div>' +
      '</div>' +
      '<button class="btn btn-gold big-cta" data-play="' + stag + '">' + (done ? '⚔️ Volver a desafiar jefes' : '⚔️ Continuar campaña') + '</button>' +
      '<button class="btn btn-ghost btn-sm home-creator" id="goCreator">👑 El Creador</button>' +
      '</div>' +
      forcePanelHTML() +
      OU.TRAIN.incomeBannerHTML() +
      '<div class="sec-title">' + (done ? 'Todas las fases completadas' : 'Próxima batalla') + '</div>' +
      stageCardHTML(cur, stag, true, true) +
      '<div class="sec-title">Campaña · ' + OU.STAGES.length + ' fases</div>' +
      '<p class="battle-hint" style="text-align:left;margin-top:0">Cada fase muestra su <b>poder real</b> y el veredicto frente al tuyo. Los actos tienen picos (fases más duras) y valles: aprovecha los valles para entrenar.</p>' +
      campaignListHTML() +
      '<button class="btn btn-ghost btn-block" style="margin-top:6px" onclick="OU.MAIN.setTab(\'training\')">🏋️ Entrenamiento y ganancia pasiva 💰</button>';
  }

  /** Lista de fases agrupada por acto, con cabecera de acto y estado del acto. */
  function campaignListHTML() {
    var mine = U.teamPower();
    var out = [];
    var acts = [];
    OU.STAGES.forEach(function (s, i) {
      if (!acts[s.act - 1]) acts[s.act - 1] = [];
      acts[s.act - 1].push(i);
    });
    acts.forEach(function (list, k) {
      if (!list || !list.length) return;
      var act = OU.STAGES[list[0]].act;
      var name = OU.STAGES[list[0]].actName;
      var cleared = list.filter(function (i) { return i < U.currentStage(); }).length;
      var beatable = list.filter(function (i) { return mine >= U.stagePower(i) * 0.92; }).length;
      var open = list.filter(function (i) { return i <= U.currentStage(); }).length;
      out.push('<div class="act-head ' + (cleared === list.length ? 'done' : '') + '">' +
        '<span class="ah-t">ACTO ' + act + ' · ' + name + '</span>' +
        '<span class="ah-m">' + cleared + '/' + list.length + ' 🏆</span>' +
        '<span class="ah-bar"><span class="ah-fill" style="width:' + Math.round(cleared / list.length * 100) + '%"></span></span>' +
        '<span class="ah-p">' + open + ' abiertas · ' + beatable + ' a tu alcance</span>' +
        '</div>');
      out.push(list.map(function (i) {
        return stageCardHTML(OU.STAGES[i], i, i <= U.currentStage(), i === U.currentStage());
      }).join(''));
    });
    return out.join('');
  }

  function stageCardHTML(s, idx, unlocked, big) {
    var st = OU.STATE.state;
    var isCurrent = idx === U.currentStage();
    var mine = U.teamPower();
    var theirs = U.stagePower(idx);
    var v = U.verdict(mine, theirs);
    var enIcons = s.roster.map(function (id) {
      return '<span class="ep" title="' + OU.CARD_BY_ID[id].n + '">' + OU.CARD_BY_ID[id].ic + '</span>';
    }).join('');
    var rw = U.rewardOf(idx);
    var lock = unlocked ? '' : '<span class="stage-lock">🔒</span>';
    return '<div class="stage-card ' + (unlocked ? 'open' + (isCurrent ? ' current' : '') : '') + (big ? ' big' : '') + '"' +
      (unlocked ? ' data-play="' + idx + '"' : '') + '>' +
      '<div class="stage-num">' + String(idx + 1).padStart(2, '0') + '</div>' +
      '<div class="stage-info">' +
      '<div class="stage-name">' + s.n + (s.boss ? ' <span class="stage-crown">👑</span>' : '') + '</div>' +
      (big ? '<div class="stage-story">' + s.story + '</div>' : '') +
      '<div class="stage-meta">' +
      '<span>🏛️ Acto ' + s.act + '</span>' +
      '<span>⚔️ ' + U.fmt(rw.gold) + ' oro</span>' +
      '<span>✨ ' + U.fmt(rw.xp) + ' XP</span>' +
      '<span class="stage-diff ' + s.diffCls + '" title="Dificultad ' + (s.diff + 1) + '/' + OU.DIFF.length + '"> ' + s.diffName + ' ' + diffDots(s.diff) + '</span>' +
      '</div>' +
      '<div class="stage-force">' +
      '<span class="sf-enemy">🛡️ Poder rival <b>' + U.fmt(theirs) + '</b></span>' +
      (unlocked ? '<span class="sf-verdict ' + v.cls + '">' + v.n + (v.gap > 0 ? ' · faltan ' + U.fmt(v.gap) : ' · +' + U.fmt(-v.gap)) + '</span>'
                 : '<span class="sf-verdict locked">🔒 Bloqueada</span>') +
      '</div>' +
      '<div class="enemy-preview">' + enIcons + '</div>' +
      '</div>' +
      lock +
      '</div>';
  }

  /* ---------- MOTOR DE COMBATE ---------- */

  function makeUnit(cardId, level, side, scale) {
    var c = OU.CARD_BY_ID[cardId];
    var v = U.valuesAt(cardId, level);
    var m = scale || 1;
    var hp = Math.round(v.hp * m), atk = Math.round(v.atk * m), def = Math.round(v.def * m);
    return {
      uid: Math.random().toString(36).slice(2),
      cardId: cardId, name: c.n, ic: c.ic, r: c.r, role: c.role, ab: c.ab,
      level: level, side: side, baseHp: hp, baseAtk: atk,
      hp: hp, maxHp: hp, atk: atk, def: def, spd: v.spd,
      energy: 40, shield: 0, dead: false, buffAtk: 0, buffTurns: 0
    };
  }

  function startBattle(idx) {
    var st = OU.STATE.state;
    if (!st.team.some(Boolean)) { I.toast('Asigna cartas a tu equipo primero 🛡️'); OU.MAIN.setTab('team'); return; }
    if (OU.SHOP.openingBusy) return;
    var stage = OU.STAGES[idx];
    /* La escala vive en los datos de la fase: el poder que se muestra en la
       campaña es exactamente el con el que entran estos enemigos. */
    myUnits = st.team.filter(Boolean).map(function (id) { return makeUnit(id, st.cards[id].lvl, 'p'); });
    enUnits = stage.roster.map(function (id) { return makeUnit(id, stage.level, 'e', stage.scale); });
    battleScreen(stage, idx, myUnits, enUnits);
    runBattle(idx, myUnits, enUnits).catch(function (e) { console.error(e); I.toast('Error de combate'); });
  }

  function battleScreen(stage, idx, my, en) {
    OU.MAIN.currentTab = 'battle';
    var tabs = U.$$('#tabs .tab');
    tabs.forEach(function (t) { t.classList.remove('active'); });
    var v = U.$('#view');
    var mine = U.teamPower();
    var theirs = U.stagePower(idx);
    var v2 = U.verdict(mine, theirs);
    var tlv = U.teamLevelInfo();
    v.innerHTML = '<div class="arena-screen">' +
      '<div class="arena-head">' +
      '<div>' +
      '<div class="arena-stage-name">' + stage.n + (stage.boss ? ' 👑' : '') + '</div>' +
      '<div style="font-size:11px;color:var(--dim)">Fase ' + (idx + 1) + ' de ' + OU.STAGES.length +
      ' · Acto ' + stage.act + ' · ' + stage.diffName + ' ' + diffDots(stage.diff) +
      ' · Recompensa: 🪙 ' + U.fmt(U.rewardOf(idx).gold) + ' · ✨ ' + U.fmt(U.rewardOf(idx).xp) + ' XP</div>' +
      '<div style="font-size:11px;margin-top:2px">Tu poder <b style="color:var(--gold2)">' + U.fmt(mine) + '</b> · ' + U.fmt(theirs) + ' del rival · Nivel general <b style="color:var(--gold2)">' + tlv.lvl + '</b> · <span class="' + v2.cls + '">' + v2.n + '</span></div>' +
      '</div>' +
      '<div class="arena-ctrls">' +
      '<button class="btn btn-ghost btn-sm" id="speedBtn">⏩ x1</button>' +
      '<button class="btn btn-ghost btn-sm" id="quitBtn">✖ Salir</button>' +
      '</div>' +
      '</div>' +
      '<div id="arenaWrap">' +
      '<div class="arena" id="arena">' +
      '<span class="bt-label e-l">Tu equipo</span>' +
      '<span class="bt-label en-l">Enemigos</span>' +
      '<div class="bt-field">' +
      '<div class="bt-side allies" id="allyCol"></div>' +
      '<div class="bt-mid"><div class="vs-badge">VS</div></div>' +
      '<div class="bt-side enemies" id="enemyCol"></div>' +
      '</div>' +
      '<div class="fx-layer" id="fx"></div>' +
      '</div>' +
      '</div>' +
      '<div class="battle-hint">Cada golpe carga la energía (barra azul). Al 100% se libera el poder especial ✨<br><b id="vsHint">ALIADOS</b> <span style="color:var(--dim)">←</span>&nbsp;·&nbsp;<span style="color:var(--dim)">→</span> <b style="color:#ff8b7d">ENEMIGOS</b></div>' +
      '</div>';
    en.forEach(function (u) { U.$('#enemyCol').appendChild(unitEl(u)); });
    my.forEach(function (u) { U.$('#allyCol').appendChild(unitEl(u)); });
    bootSprites();
    U.$('#speedBtn').addEventListener('click', function () {
      battleFast = battleFast === 1 ? 2 : 1;
      U.$('#speedBtn').textContent = '⏩ x' + battleFast;
    });
    U.$('#quitBtn').addEventListener('click', function () {
      if (confirm('¿Abandonar la batalla?')) { battleRunning = false; OU.MAIN.setTab('home'); }
    });
    battleRunning = true;
  }

  function unitEl(u) {
    var div = document.createElement('div');
    div.className = 'btoken ' + (u.side === 'e' ? 'enemy' : 'ally') + ' r-' + u.r + ' role-' + u.role;
    div.dataset.uid = u.uid;
    div.style.setProperty('--c', OU.RAR[u.r].color);
    var spr = OU.SPRITES && OU.SPRITES[u.cardId];
    div.innerHTML =
      '<span class="bt-sd"></span>' +
      '<span class="bt-bf"></span>' +
      '<div class="bt-hpbar"><div class="bt-fill" style="width:100%"></div></div>' +
      '<div class="bt-circle">' +
      (spr ? '' : '<div class="bt-wrap">' + I.artHTML(u.cardId, 'bt-img') + '</div>') +
      '<span class="bt-rarity" style="color:' + OU.RAR[u.r].color + '"></span>' +
      '<span class="bt-lv">NV ' + u.level + '</span>' +
      '</div>' +
      '<div class="bt-name">' + u.name + '</div>' +
      '<div class="bt-hpnum">' + U.fmt(u.hp) + ' / ' + U.fmt(u.maxHp) + '</div>' +
      '<div class="bt-enbar"><div class="bt-fill" style="width:' + u.energy + '%"></div></div>';
    if (spr) initSprite(div, u, spr, u.side === 'e');
    return div;
  }

  /* ---------- SPRITES ANIMADOS ---------- */
  var sprTickMs = 110;
  var sprStates = new WeakMap();
  var sprEls = new Set();
  var sprTimer = null;

  function initSprite(el, u, spr, isEnemy) {
    var wrap = document.createElement('div');
    wrap.className = 'bt-sprite-wrap' + (isEnemy ? ' enemy-spr' : '');
    var box = document.createElement('div');
    box.className = 'bt-sprite';
    box.style.backgroundImage = 'url(' + spr.src + ')';
    box.style.backgroundRepeat = 'no-repeat';
    wrap.appendChild(box);
    el.appendChild(wrap);
    el.classList.add('has-sprite');
    sprStates.set(el, { spr: spr, box: box, row: 0, col: 0, n: 6, mode: 'idle', ready: false });
    sprEls.add(el);
    return el;
  }

  function bootSprites() {
    sprEls.forEach(function (el) {
      var st = sprStates.get(el);
      if (!st || st.ready) return;
      var token = el.offsetWidth || 64;
      st.scale = (token * 1.08) / st.spr.frames[0][3];
      st.ready = true;
      applyFrame(el);
    });
    if (!sprTimer) sprTimer = setInterval(function () {
      if (!battleRunning) return;
      sprEls.forEach(function (el) {
        if (!document.documentElement.contains(el)) { sprEls.delete(el); return; }
        stepSprite(el);
      });
    }, sprTickMs);
  }

  function stepSprite(el) {
    var st = sprStates.get(el); if (!st) return;
    if (st.mode === 'idle') {
      st.col = (st.col + 1) % 6;
    } else {
      st.col++;
      if (st.col >= st.n) { st.col = -1; st.row = 0; st.n = 6; st.mode = 'idle'; }
    }
    applyFrame(el);
  }

  function applyFrame(el) {
    var st = sprStates.get(el); if (!st || !st.ready) return;
    var f = st.spr.frames[st.row * 6 + Math.max(0, st.col)];
    st.box.style.width = f[2] + 'px';
    st.box.style.height = f[3] + 'px';
    st.box.style.backgroundPosition = (-f[0]) + 'px ' + (-f[1]) + 'px';
    st.box.style.transform = 'scale(' + st.scale + ')';
    st.box.style.transformOrigin = '50% 50%';
  }

  function sprPlay(el, row, n) {
    var st = sprStates.get(el); if (!st) return;
    st.row = row; st.col = -1; st.n = n; st.mode = 'run';
  }

  /* Helpers reutilizados del monolito */
  const $ = U.$, $$ = U.$$;
  const unitElOf = (u) => $(`[data-uid="${u.uid}"]`);
  const setHp = (u) => {
    const el = unitElOf(u); if (!el) return;
    const pct = Math.max(0, u.hp / u.maxHp * 100);
    const fill = $('.bt-hpbar .bt-fill', el);
    if (fill) {
      fill.style.width = pct + '%';
      fill.style.background = pct > 50
        ? 'linear-gradient(90deg,var(--hp),var(--hp2))'
        : 'linear-gradient(90deg,#9d2020,#e33d3d)';
    }
    const hn = $('.bt-hpnum', el);
    if (hn) hn.textContent = U.fmt(u.hp) + ' / ' + U.fmt(u.maxHp);
    const sd = $('.bt-sd', el);
    if (sd) sd.textContent = u.shield > 0 ? '🛡' : '';
    const bf = $('.bt-bf', el);
    if (bf) bf.textContent = u.buffAtk > 0 ? '⚡' : '';
  };
  const setEnergy = (u) => {
    const el = unitElOf(u); if (!el) return;
    const f = $('.bt-enbar .bt-fill', el);
    if (!f) return;
    f.style.width = Math.min(100, u.energy) + '%';
    f.classList.toggle('full', u.energy >= 100);
  };
  const floatNum = (u, msg, cls, crit) => {
    const arena = $('#arena'), fx = $('#fx');
    if (!arena || !fx) return;
    const el = unitElOf(u); if (!el) return;
    const aRect = arena.getBoundingClientRect();
    const uRect = el.getBoundingClientRect();
    const x = uRect.left - aRect.left + uRect.width / 2 + U.rnd(-12, 12);
    const y = uRect.top - aRect.top + uRect.height * 0.18 + U.rnd(-4, 10);
    const n = document.createElement('div');
    n.className = 'fnum ' + cls + (crit ? ' crit' : '');
    n.textContent = msg;
    n.style.left = x + 'px'; n.style.top = y + 'px';
    fx.appendChild(n);
    setTimeout(() => n.remove(), 1050);
  };
  const banner = (msg, isEnemy) => {
    const fx = $('#fx'); if (!fx) return; if ($('.banner', fx)) return;
    const b = document.createElement('div');
    b.className = 'banner' + (isEnemy ? ' b-enemy' : '');
    b.textContent = msg;
    fx.appendChild(b);
    setTimeout(() => b.remove(), 1300);
  };
  const lungeFx = (u, tgt) => {
    const aEl = unitElOf(u), tEl = unitElOf(tgt);
    const arena = $('#arena');
    if (!aEl || !tEl || !arena) return;
    const aR = aEl.getBoundingClientRect(), tR = tEl.getBoundingClientRect();
    const dx = (tR.left + tR.width / 2) - (aR.left + aR.width / 2);
    aEl.style.setProperty('--dx', Math.max(-160, Math.min(160, Math.round(dx * 0.4))) + 'px');
    aEl.classList.remove('dash'); void aEl.offsetWidth; aEl.classList.add('dash');
    if (sprStates.get(aEl)) sprPlay(aEl, 2, 6);
  };
  const hitFx = (u) => {
    const el = unitElOf(u); if (!el) return;
    el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
    if (sprStates.get(el)) sprPlay(el, 3, 3);
    const c = $('.bt-circle', el);
    if (c) {
      c.classList.remove('impact'); void c.offsetWidth; c.classList.add('impact');
      setTimeout(() => c.classList.remove('impact'), 520);
    }
  };
  const castFx = (u) => {
    const arena = $('#arena'), el = unitElOf(u);
    if (!arena || !el) return;
    const aR = arena.getBoundingClientRect(), uR = el.getBoundingClientRect();
    const x = uR.left - aR.left + uR.width / 2;
    const y = uR.top - aR.top + uR.height * 0.42;
    const s = document.createElement('div');
    s.className = 'shockwave';
    s.style.left = x + 'px'; s.style.top = y + 'px';
    arena.appendChild(s);
    setTimeout(() => s.remove(), 660);
    const c = $('.bt-circle', el);
    if (c) { c.classList.add('cast'); setTimeout(() => c.classList.remove('cast'), 600); }
    if (sprStates.get(el)) sprPlay(el, 4, 6);
  };
  const killUnit = (u) => {
    u.dead = true;
    const el = unitElOf(u);
    if (el) {
      el.classList.add('dead');
      if (sprStates.get(el)) sprPlay(el, 3, 6);
    }
  };
  const aliveCount = (units) => units.filter((u) => !u.dead).length;
  const randomAlive = (units) => {
    const a = units.filter((u) => !u.dead && u.shield <= 0);
    const b = units.filter((u) => !u.dead);
    const pool = a.length ? a : b;
    return pool.length ? U.pick(pool) : null;
  };
  // La formación pone al tanque al frente (primer elemento vivo): absorbe la
  // mayoría de los ataques cuerpo a cuerpo y los golpes de habilidad dirigidos.
  const pickBattleTarget = (foes) => {
    const a = foes.filter((u) => !u.dead && u.shield <= 0);
    const b = foes.filter((u) => !u.dead);
    const pool = a.length ? a : b;
    if (!pool.length) return null;
    if (pool.length >= 2 && Math.random() < 0.55) return pool[0];
    return U.pick(pool);
  };
  const calcDamage = (att, def2, mult) => {
    const variance = U.rnd(0.85, 1.15);
    return Math.max(1, Math.round(att.atk * mult * (1 + (att.buffAtk || 0) / (att.baseAtk || 1)) * variance - def2.def * 0.5));
  };
  async function dealDamage(att, tgt, dmg) {
    if (tgt.dead) return 0;
    hitFx(tgt);
    const absorbed = Math.min(tgt.shield, dmg);
    let real = dmg - absorbed;
    tgt.shield = Math.max(0, tgt.shield - absorbed);
    tgt.hp = Math.max(0, tgt.hp - real);
    floatNum(tgt, '-' + U.fmt(real), att.side === 'p' ? 'enemy-dmg' : 'player-dmg', dmg > att.atk * 1.5);
    if (absorbed > 0) floatNum(tgt, '🛡' + absorbed, 'shield');
    playHit();
    if (!att.dead) att.energy = Math.min(100, att.energy + 22);
    if (!tgt.dead) tgt.energy = Math.min(100, tgt.energy + 12);
    setHp(tgt); setEnergy(att); setEnergy(tgt);
    if (tgt.hp <= 0) killUnit(tgt);
    await U.sleep(360 / battleFast);
    return real;
  }
  async function basicAttack(u) {
    const foes = u.side === 'p' ? enUnits : myUnits;
    const t = pickBattleTarget(foes);
    if (!t) return;
    lungeFx(u, t);
    const dmg = calcDamage(u, t, 1);
    await dealDamage(u, t, dmg);
  }
  async function useAbility(u) {
    const a = u.ab;
    banner(`${u.ic} ${a.n}!`, u.side === 'e');
    if (!u.dead) u.energy = 0;
    castFx(u);
    const foes = u.side === 'p' ? enUnits : myUnits;
    const allies = u.side === 'p' ? myUnits : enUnits;
    await U.sleep(420 / battleFast);
    if (a.t === 'strike') {
      const t = pickBattleTarget(foes);
      if (t) { lungeFx(u, t); const dmg = calcDamage(u, t, a.s); await dealDamage(u, t, dmg); }
    } else if (a.t === 'aoe') {
      const alive = foes.filter((f) => !f.dead);
      for (const t of alive) { lungeFx(u, t); const dmg = calcDamage(u, t, a.s); await dealDamage(u, t, dmg); }
    } else if (a.t === 'heal') {
      const candidates = allies.filter((f) => !f.dead);
      if (candidates.length) {
        const t = candidates.reduce((m, c) => c.hp / c.maxHp < m.hp / m.maxHp ? c : m);
        const heal = Math.round(u.atk * a.s);
        t.hp = Math.min(t.maxHp, t.hp + heal);
        floatNum(t, '+' + heal, 'heal'); setHp(t);
        banner(`💚 ${t.name} recupera ${heal}`, false);
      }
    } else if (a.t === 'shield') {
      const candidates = allies.filter((f) => !f.dead && f !== u);
      const t = (candidates.length ? candidates.reduce((m, c) => c.hp / c.maxHp < m.hp / m.maxHp ? c : m) : u);
      const amount = Math.round(t.def * 6 * a.s);
      t.shield += amount;
      floatNum(t, '🛡' + amount, 'shield'); setHp(t);
    } else if (a.t === 'buff') {
      const boost = Math.round(u.baseAtk * 0.3 * a.s);
      allies.filter((f) => !f.dead).forEach((f) => { f.buffAtk = boost; f.buffTurns = 2; setHp(f); });
    }
    setEnergy(u);
    await U.sleep(320 / battleFast);
  }
  async function runBattle(idx, my, en) {
    const order = [...my, ...en].sort((a, b) => (b.spd - a.spd) || (a.side === 'p' ? 1 : -1));
    let guard = 0;
    while (battleRunning && aliveCount(my) > 0 && aliveCount(en) > 0 && guard++ < 400) {
      for (const u of order) {
        if (!battleRunning) break;
        if (u.dead) continue;
        if (u.energy >= 100) await useAbility(u);
        else await basicAttack(u);
        if (aliveCount(my) <= 0 || aliveCount(en) <= 0) break;
        await U.sleep(60 / battleFast);
      }
      order.forEach((u) => { if (!u.dead && u.buffTurns > 0) { u.buffTurns--; if (u.buffTurns <= 0) u.buffAtk = 0; setHp(u); } });
    }
    if (!battleRunning) return;
    finishBattle(idx, aliveCount(en) <= 0);
  }
  function finishBattle(idx, won) {
    battleRunning = false;
    const st = OU.STATE.state;
    const stage = OU.STAGES[idx];
    if (won) {
      const rw = U.rewardOf(idx);
      const firstClear = idx === st.stage;
      const gemChance = firstClear ? 1 : 0.45;
      const gems = gemChance >= Math.random() ? U.rndi(firstClear ? 3 : 1, firstClear ? 6 : 3) : 0;
      st.gold += rw.gold;
      addXp(rw.xp);
      if (gems > 0) st.gems += gems;
      if (firstClear && idx < OU.STAGES.length - 1) st.stage = idx + 1;
      OU.STATE.save();
      I.updateTopRes();
      const nextIdx = Math.min(idx + 1, OU.STAGES.length - 1);
      const nextV = U.stageVerdict(nextIdx);
      const nextTxt = idx < OU.STAGES.length - 1
        ? 'Siguiente fase: <b>' + U.fmt(U.stagePower(nextIdx)) + '</b> de poder rival · <span class="' + nextV.cls + '">' + nextV.n + '</span>'
        : 'Eres la leyenda más poderosa del Olimpo.';
      I.openModal(
        '<div class="result-title win">VICTORIA</div>' +
        '<div style="text-align:center;color:var(--dim);font-size:13px;margin-top:6px">Has derrotado a «' + stage.n + '»</div>' +
        '<div class="reward-grid">' +
        '<div class="reward-pill r-gold"><span class="r-ic">🪙</span> +' + U.fmt(rw.gold) + ' oro</div>' +
        '<div class="reward-pill r-xp"><span class="r-ic">✨</span> +' + rw.xp + ' XP</div>' +
        (gems > 0 ? '<div class="reward-pill r-gem"><span class="r-ic">💎</span> +' + gems + ' gemas</div>' : '') +
        '</div>' +
        '<div class="res-force">Tu poder <b>' + U.fmt(U.teamPower()) + '</b> · Rival <b>' + U.fmt(U.stagePower(idx)) + '</b></div>' +
        (firstClear ? '<div style="text-align:center;font-size:12px;color:#7fe08a;margin-bottom:6px">¡Fase superada por primera vez!</div>' : '') +
        (idx < OU.STAGES.length - 1 ? '<div class="res-next">' + nextTxt + '</div><button class="btn btn-gold btn-block" id="nextBtn">⚔️ Fase ' + (idx + 2) + ': ' + OU.STAGES[idx + 1].n + '</button>' : '<div class="lvup">🏆 ¡Has conquistado todas las fases de Olympus Unbound!</div>') +
        '<button class="btn btn-ghost btn-block" style="margin-top:8px" id="againBtn">🔁 Reintentar fase</button>' +
        '<button class="btn btn-blue btn-block" style="margin-top:8px" id="vExitBtn">🏛️ Volver al menú</button>'
      );
      const nx = U.$('#nextBtn'); if (nx) nx.addEventListener('click', () => { I.closeModal(); startBattle(idx + 1); });
      const ag = U.$('#againBtn'); if (ag) ag.addEventListener('click', () => { I.closeModal(); startBattle(idx); });
      const vx = U.$('#vExitBtn'); if (vx) vx.addEventListener('click', () => { I.closeModal(); OU.MAIN.setTab('home'); });
    } else {
      const rw = U.rewardOf(idx);
      const mine = U.teamPower(), theirs = U.stagePower(idx);
      const need = Math.max(1, Math.ceil((theirs * 0.92 - mine)));
      const weak = weakestUnitHTML();
      I.openModal(
        '<div class="result-title lose">DERROTA</div>' +
        '<div style="text-align:center;color:var(--dim);font-size:13px;margin-top:6px">«' + stage.n + '» ha sido demasiado para tu equipo</div>' +
        '<div class="res-force">Tu poder <b>' + U.fmt(mine) + '</b> · Rival <b>' + U.fmt(theirs) + '</b> · <span style="color:#ff9d6b">faltan ' + U.fmt(need) + '</span></div>' +
        '<div class="reward-grid">' +
        '<div class="reward-pill r-gold">🪙 Consuelo</div>' +
        '<div class="reward-pill r-xp">✨ +' + Math.round(rw.xp * 0.2) + ' XP</div>' +
        '</div>' +
        '<div class="lvup" style="color:#ff9d6b">💪 <b>Debes entrenar tus cartas.</b> Sube de nivel a tu equipo y vuelve a intentarlo.</div>' +
        (weak ? '<div class="res-weak">' + weak + '</div>' : '') +
        '<button class="btn btn-gold btn-block" id="retryBtn">⚔️ Reintentar</button>' +
        '<button class="btn btn-blue btn-block" style="margin-top:8px" id="trainBtn">🏋️ Entrenar cartas</button>' +
        '<button class="btn btn-ghost btn-block" style="margin-top:8px" id="backBtn">🏛️ Volver</button>'
      );
      addXp(Math.round(rw.xp * 0.2));
      OU.STATE.save();
      const rt = U.$('#retryBtn'); if (rt) rt.addEventListener('click', () => { I.closeModal(); startBattle(idx); });
      const tb = U.$('#trainBtn'); if (tb) tb.addEventListener('click', () => { I.closeModal(); OU.MAIN.setTab('training'); });
      const bk = U.$('#backBtn'); if (bk) bk.addEventListener('click', () => { I.closeModal(); OU.MAIN.setTab('home'); });
    }
    I.updateTopRes();
  }

  /** Sugerencia concreta: la carta más débil del equipo y cuánto ganaría. */
  function weakestUnitHTML() {
    var st = OU.STATE.state;
    var worst = null;
    st.team.filter(Boolean).forEach(function (id) {
      var p = U.powerOf(id, st.cards[id].lvl);
      if (!worst || p < worst.p) worst = { id: id, p: p, lvl: st.cards[id].lvl };
    });
    if (!worst) return '';
    var gain = U.powerOf(worst.id, worst.lvl + 5) - worst.p;
    return '🔻 <b>' + OU.CARD_BY_ID[worst.id].n + '</b> es tu carta más débil (NV ' + worst.lvl +
      '). Subirla 5 niveles añadiría <b>' + U.fmt(gain) + '</b> de poder a tu equipo.';
  }
  function addXp(n) {
    const st = OU.STATE.state;
    if (n <= 0) return;
    st.xp += n;
    let gained = 0;
    while (st.xp >= U.xpNeed(st.lvl) && st.lvl < 99) {
      st.xp -= U.xpNeed(st.lvl); st.lvl++; st.gems += 5; gained += 5;
    }
    if (gained) setTimeout(() => I.toast(`¡Nivel ${st.lvl} subido! +${gained}💎 gemas`), 700);
  }
  function playHit() {
    try {
      const audioCtx = OU.SHOP.audio();
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = 'sawtooth'; o.frequency.value = 180 + Math.random() * 60;
      o.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.12);
      g.gain.setValueAtTime(0.14, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.13);
      o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + 0.14);
    } catch (e) {}
  }

  OU.BATTLE = {
    viewHome: viewHome,
    bindHome: function (root) {
      U.$$('[data-play]', root).forEach((e) => e.addEventListener('click', () => startBattle(parseInt(e.dataset.play, 10))));
      var gC = U.$('#goCreator', root);
      if (gC) gC.addEventListener('click', () => OU.MAIN.setTab('shop'));
    },
    startBattle: startBattle,
    _spr: {
      framesOf: function (id) { return (OU.SPRITES && OU.SPRITES[id]) ? OU.SPRITES[id].frames : null; },
      frameOf: function (el) { return sprStates.get(el) || null; },
      play: sprPlay,
      step: stepSprite
    },
    get running() { return battleRunning; },
    set running(v) { battleRunning = v; }
  };
})();