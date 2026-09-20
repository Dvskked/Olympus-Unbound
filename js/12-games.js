/**
 * ==== MINIJUEGOS ====
 * Minijuegos para ganar monedas de forma rápida y divertida:
 *  🔮 El Oráculo · 🪨📄✂️ Desafío del Dios · 🎡 Ruleta del Destino
 *  🎲 Dado de Zeus · 🧠 Memoria de Orfeo
 * @module games
 */
(function () {
  'use strict';
  var OU = window.OU = window.OU || {};
  var U = OU.UTIL, I = OU.UI;

  // ---------- utilidad interna ----------
  function mgStats() {
    var st = OU.STATE.state;
    if (!st.mgStats) st.mgStats = {};
    var d = st.mgStats;
    if (!d.oracle) d.oracle = { wins: 0, best: 0 };
    if (!d.ppt) d.ppt = { wins: 0, losses: 0 };
    if (!d.wheel) d.wheel = { spins: 0, lastFree: '', wins: 0 };
    if (!d.dice) d.dice = { wins: 0, losses: 0 };
    if (!d.mem) d.mem = { games: 0, wins: 0, best: 0 };
    return d;
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  // ---------- VISTA PRINCIPAL ----------
  function viewGames() {
    var mg = mgStats();
    var freeLeft = mg.wheel.lastFree !== todayStr();
    return '<div class="sec-title">Minijuegos</div>' +
      '<p class="battle-hint">Gana oro poco a poco para mejorar tus cartas más rápido. Minijuegos avanzados también dan 💎 gemas.</p>' +
      '<div class="games-grid">' +
      gameCard('oracle', '🔮', 'El Oráculo', 'Adivina el veredicto de 7 monedas. Apuesta y gana x2 si aciertas la mayoría.', 'Por 🪙 150', oracleWinsHTML(mg)) +
      gameCard('ppt', '🪨📄✂️', 'Desafío del Dios', 'Enfréntate a un Dios en Piedra, Papel o Tijera. Empatar te devuelve la apuesta.', 'Gana x2.1', pptWinsHTML(mg)) +
      gameCard('wheel', '🎡', 'Ruleta del Destino', 'Gira la ruleta para ganar oro o gemas. ¡Un giro gratis por día!', freeLeft ? '¡Giro gratis!' : '🪙 80 por giro', wheelWinsHTML(mg, freeLeft)) +
      gameCard('dice', '🎲', 'Dado de Zeus', 'Apostó Zeus los dados del destino. El 7 triplica, dobles y pares pagan.', 'Apuesta 🪙 50-600', diceWinsHTML(mg)) +
      gameCard('mem', '🧠', 'Memoria de Orfeo', 'Encuentra las parejas de símbolos. Cada acierto da oro; completa todo para ganar gemas.', 'Entrar por 🪙 25', memWinsHTML(mg)) +
      '</div>' +
      '<div class="sec-title">Historial</div>' +
      '<div class="mg-stats">' +
      '<span>🔮 Aciertos: <b>' + (mg.oracle.wins || 0) + '</b></span>' +
      '<span>🪨📄✂️ Victorias: <b>' + (mg.ppt.wins || 0) + '</b></span>' +
      '<span>🪨📄✂️ Derrotas: <b>' + (mg.ppt.losses || 0) + '</b></span>' +
      '<span>🎡 Giros: <b>' + (mg.wheel.spins || 0) + '</b></span>' +
      '<span>🎲 Victorias: <b>' + (mg.dice.wins || 0) + '</b></span>' +
      '<span>🧠 Partidas: <b>' + (mg.mem.games || 0) + '</b></span>' +
      '</div>';
  }

  function gameCard(id, ic, name, desc, cta, winsHtml) {
    return '<div class="game-card" data-game="' + id + '">' +
      '<div class="gc-ic">' + ic + '</div>' +
      '<div class="gc-name">' + name + '</div>' +
      '<div class="gc-desc">' + desc + '</div>' +
      '<div class="gc-cta">' + cta + '</div>' +
      '<div class="gc-wins">' + winsHtml + '</div>' +
      '</div>';
  }

  function oracleWinsHTML(mg) {
    if (!mg.oracle.best) return 'Juega para batir tu récord';
    return 'Racha récord: ' + mg.oracle.best + ' aciertos';
  }
  function pptWinsHTML(mg) {
    if (!mg.ppt.wins && !mg.ppt.losses) return 'Primera vez contra un Dios';
    return 'Victorias: ' + mg.ppt.wins + ' · Derrotas: ' + mg.ppt.losses;
  }
  function wheelWinsHTML(mg, freeLeft) {
    if (freeLeft) return 'Te espera un giro gratis';
    return 'Odios: ' + mg.wheel.wins + ' premios';
  }
  function diceWinsHTML(mg) {
    if (!mg.dice.wins && !mg.dice.losses) return 'La Fortuna te observa';
    return 'Victorias: ' + mg.dice.wins + ' · Derrotas: ' + mg.dice.losses;
  }
  function memWinsHTML(mg) {
    if (!mg.mem.games) return 'Primera vez con la lira';
    return 'Completadas: ' + mg.mem.wins + '/' + mg.mem.games;
  }

  function bindGames(root) {
    U.$$('[data-game]', root).forEach(function (el) {
      el.addEventListener('click', function () {
        var g = el.dataset.game;
        if (g === 'oracle') openOracle();
        else if (g === 'ppt') openPPT();
        else if (g === 'wheel') openWheel();
        else if (g === 'dice') openDice();
        else if (g === 'mem') openMemory();
      });
    });
  }

  // ---------- 🔮 EL ORÁCULO (7 monedas, adivina mayoría) ----------
  var ORACLE_BET = 150;

  function tossHeads(n) {
    var h = 0;
    for (var i = 0; i < n; i++) if (Math.random() < 0.5) h++;
    return h;
  }

  /** Resultado puro de una partida: { heads, guess, won } (7 monedas impar: sin empate). */
  function oraclePlay(guessHeads) {
    var heads = tossHeads(7);
    var majorityHeads = heads >= 4;
    return { heads: heads, guess: guessHeads, won: majorityHeads === !!guessHeads };
  }

  function openOracle() {
    var st = OU.STATE.state;
    I.openModal(
      '<div class="sec-title" style="margin-top:8px">🔮 El Oráculo</div>' +
      '<p style="font-size:13px;color:var(--dim);line-height:1.6">El Oráculo lanza <b>7 monedas</b>. ¿Crees que caerán <b>más CARA</b> o más <b>CRUZ</b>?<br>Acierta y multiplica tu apuesta por <b>2</b>. Sin empates.</p>' +
      '<div class="oracle-bet"><span>Apuesta:</span><b>🪙 ' + U.fmt(ORACLE_BET) + '</b><span> · Tienes: 🪙 ' + U.fmt(st.gold) + '</span></div>' +
      '<div class="oracle-cta">' +
      '<button class="btn btn-gold" id="oracleHead">👑 Cara</button>' +
      '<button class="btn btn-blue" id="oracleTail">🪙 Cruz</button>' +
      '</div>' +
      '<div id="oracleResult"></div>', true);

    var choose = function (guess) {
      if (st.gold < ORACLE_BET) { I.toast('No tienes suficiente oro 🪙'); return; }
      var r = oraclePlay(guess);
      st.gold -= ORACLE_BET;
      var mg = mgStats();
      var msg;
      if (r.won) {
        var prize = Math.round(ORACLE_BET * 2);
        st.gold += prize;
        mg.oracle.wins++;
        if (mg.oracle.wins > mg.oracle.best) mg.oracle.best = mg.oracle.wins;
        msg = '<div class="mg-result win">✨ ¡El Oráculo te bendice! +' + U.fmt(prize) + ' 🪙</div>';
      } else {
        mg.oracle.wins = 0;
        msg = '<div class="mg-result lose">🌧️ El Oráculo estaba en silencio. Perdiste tu apuesta.</div>';
      }
      OU.STATE.save(); I.updateTopRes();
      U.$('#oracleResult').innerHTML = msg +
        '<div class="mg-coins">Salieron ' + r.heads + ' 👑 y ' + (7 - r.heads) + ' 🪙</div>' +
        '<button class="btn btn-ghost btn-block" style="margin-top:10px" id="oracleAgain">Otra vez 🔮</button>';
      U.$('#oracleAgain').addEventListener('click', function () {
        I.closeModal(); openOracle();
      });
    };
    U.$('#oracleHead').addEventListener('click', function () { choose(true); });
    U.$('#oracleTail').addEventListener('click', function () { choose(false); });
  }

  // ---------- 🪨📄✂️ DESAFÍO DEL DIOS ----------
  var PPT_BETS = [50, 200, 500];
  var PPT_WIN = 2.1;
  var RPS = { 0: '🪨 Piedra', 1: '📄 Papel', 2: '✂️ Tijera' };

  /** Resultado puro: 1 gana el jugador, 0 empate, -1 pierde. */
  function rpsResolve(player, cpu) {
    if (player === cpu) return 0;
    if ((player + 2) % 3 === cpu) return 1; // player gana
    return -1;
  }

  function openPPT() {
    var st = OU.STATE.state;
    var bet = PPT_BETS[0];
    I.openModal(
      '<div class="sec-title" style="margin-top:8px">🪨📄✂️ Desafío del Dios</div>' +
      '<p style="font-size:13px;color:var(--dim);line-height:1.6">Elige tu apuesta y enfrenta a un Dios. Si ganas, te llevas <b>x' + PPT_WIN + '</b>. Si empatas, recuperas tu apuesta.</p>' +
      '<div class="ppt-bets">' + PPT_BETS.map(function (b, i) {
        return '<button class="btn btn-sm ' + (i === 0 ? 'btn-gold' : 'btn-ghost') + '" data-bet="' + b + '" data-idx="' + i + '">🪙 ' + b + '</button>';
      }).join('') + '</div>' +
      '<div class="ppt-hands" id="pptHands">' +
      [0, 1, 2].map(function (ch) { return '<button class="ppt-hand" data-ch="' + ch + '">' + RPS[ch] + '</button>'; }).join('') +
      '</div>' +
      '<div id="pptResult"></div>', true);

    U.$$('[data-bet]', U.$('#overlay')).forEach(function (b) {
      b.addEventListener('click', function () {
        bet = parseInt(b.dataset.bet, 10);
        U.$$('[data-bet]', U.$('#overlay')).forEach(function (x) {
          x.classList.toggle('btn-gold', x === b);
          x.classList.toggle('btn-ghost', x !== b);
        });
      });
    });
    U.$$('[data-ch]', U.$('#overlay')).forEach(function (h) {
      h.addEventListener('click', function () {
        var ch = parseInt(h.dataset.ch, 10);
        if (st.gold < bet) { I.toast('No tienes suficiente oro 🪙'); return; }
        var cpu = Math.floor(Math.random() * 3);
        var res = rpsResolve(ch, cpu);
        var mg = mgStats();
        var row;
        st.gold -= bet;
        if (res === 1) {
          var prize = Math.round(bet * PPT_WIN);
          st.gold += prize;
          mg.ppt.wins++;
          row = '<div class="mg-result win">🎉 ¡Venciste al Dios! +' + U.fmt(prize) + ' 🪙</div>';
        } else if (res === 0) {
          st.gold += bet;
          row = '<div class="mg-result tie">🤝 Empate. Recuperas tu apuesta.</div>';
        } else {
          mg.ppt.losses++;
          row = '<div class="mg-result lose">😤 El Dios se enfada. Perdiste ' + U.fmt(bet) + ' 🪙.</div>';
        }
        OU.STATE.save(); I.updateTopRes();
        U.$('#pptResult').innerHTML = row +
          '<div class="mg-coins">Tú: ' + RPS[ch] + ' · Dios: ' + RPS[cpu] + '</div>' +
          '<button class="btn btn-ghost btn-block" style="margin-top:10px" id="pptAgain">Otra ronda 🪨📄✂️</button>';
        U.$('#pptAgain').addEventListener('click', function () { I.closeModal(); openPPT(); });
      });
    });
  }

  // ---------- 🎡 RULETA DEL DESTINO ----------
  var WHEEL_SEGS = [
    { label: '🪙 +50', type: 'gold', v: 50, w: 15 },
    { label: '🪙 +100', type: 'gold', v: 100, w: 13 },
    { label: '🪙 +180', type: 'gold', v: 180, w: 10 },
    { label: '🪙 +300', type: 'gold', v: 300, w: 8 },
    { label: '🪙 +500', type: 'gold', v: 500, w: 6 },
    { label: '🪙 +900', type: 'gold', v: 900, w: 4 },
    { label: '💎 +1', type: 'gem', v: 1, w: 8 },
    { label: '💎 +3', type: 'gem', v: 3, w: 5 },
    { label: '💎 +10', type: 'gem', v: 10, w: 2 },
    { label: '😡 Nada', type: 'none', v: 0, w: 22 },
    { label: '🪙 +150', type: 'gold', v: 150, w: 5 },
    { label: '💎 +2', type: 'gem', v: 2, w: 2 }
  ];

  /** Índice del segmento dado un rng (0..1). Testable. */
  function wheelPick(rng) {
    var total = WHEEL_SEGS.reduce(function (a, s) { return a + s.w; }, 0);
    var r = rng() * total;
    for (var i = 0; i < WHEEL_SEGS.length; i++) {
      r -= WHEEL_SEGS[i].w;
      if (r <= 0) return i;
    }
    return WHEEL_SEGS.length - 1;
  }

  var WHEEL_COST = 80;

  function wheelFree() {
    var mg = mgStats();
    return mg.wheel.lastFree !== todayStr();
  }

  function openWheel() {
    var st = OU.STATE.state;
    var mg = mgStats();
    var free = wheelFree();
    I.openModal(
      '<div class="sec-title" style="margin-top:8px">🎡 Ruleta del Destino</div>' +
      '<p style="font-size:13px;color:var(--dim);line-height:1.6">Un giro <b>gratis</b> por día. Los siguientes cuestan 🪙 ' + WHEEL_COST + '. ¡El premio puede ser oro o gemas!</p>' +
      '<div class="wheel-zone">' +
      '<div class="wheel-dial" id="wheelDial"><span class="wd-glyph">🎡</span><span class="wd-seg">?</span></div>' +
      '<button class="btn btn-gold btn-block" id="spinBtn">' + (free ? '🎡 Girar gratis' : '🎡 Girar por 🪙 ' + WHEEL_COST) + '</button>' +
      '</div>' +
      '<div id="wheelResult"></div>', true);

    U.$('#spinBtn').addEventListener('click', function () {
      var freeNow = wheelFree();
      var cost = freeNow ? 0 : WHEEL_COST;
      if (!freeNow && st.gold < cost) { I.toast('No tienes suficiente oro 🪙'); return; }
      if (!freeNow) st.gold -= cost;

      var idx = wheelPick(Math.random);
      var seg = WHEEL_SEGS[idx];
      mg = mgStats();
      mg.wheel.spins++;

      var msg;
      if (seg.type === 'gold') {
        st.gold += seg.v;
        mg.wheel.wins++;
        msg = '<div class="mg-result win">🪙 +' + U.fmt(seg.v) + ' oro</div>';
      } else if (seg.type === 'gem') {
        st.gems += seg.v;
        mg.wheel.wins++;
        msg = '<div class="mg-result win">💎 +' + seg.v + ' gemas</div>';
      } else {
        msg = '<div class="mg-result lose">😡 La suerte no sonríe hoy...</div>';
      }
      if (freeNow) {
        mg.wheel.lastFree = todayStr();
        freeNow = false;
      }
      OU.STATE.save(); I.updateTopRes();

      U.$('#wheelDial').classList.add('spin');
      setTimeout(function () {
        U.$('#wheelDial').classList.remove('spin');
        var segEl = document.querySelector('#wheelDial .wd-seg');
        if (segEl) segEl.textContent = seg.label;
        var res = U.$('#wheelResult');
        if (res) res.innerHTML = msg +
          '<button class="btn btn-ghost btn-block" style="margin-top:10px" id="spinAgain">🤞 Otra vez</button>';
        var again = U.$('#spinAgain');
        if (again) again.addEventListener('click', function () { I.closeModal(); openWheel(); });
      }, 650);
    });
  }

  // ---------- 🎲 DADO DE ZEUS ----------
  var DICE_BETS = [50, 150, 300, 600];

  /** Lanzamiento puro: 7 → x3, dobles (2/12) → x4, par → x1.6, impar → 0. */
  function dicePlay() {
    var d1 = 1 + Math.floor(Math.random() * 6);
    var d2 = 1 + Math.floor(Math.random() * 6);
    var s = d1 + d2;
    var mult = s === 7 ? 3 : (s === 2 || s === 12) ? 4 : (s % 2 === 0) ? 1.6 : 0;
    return { d1: d1, d2: d2, sum: s, mult: mult };
  }

  function openDice() {
    var st = OU.STATE.state;
    var bet = DICE_BETS[0];
    I.openModal(
      '<div class="sec-title" style="margin-top:8px">🎲 Dado de Zeus</div>' +
      '<p style="font-size:13px;color:var(--dim);line-height:1.6">Lanza los dados del Olimpo. El <b>7</b> triplica tu apuesta, dobles (<b>2</b> o <b>12</b>) la cuadruplican, un <b>par</b> paga <b>x1.6</b> y un impar... la pierdes.</p>' +
      '<div class="ppt-bets">' + DICE_BETS.map(function (b, i) {
        return '<button class="btn btn-sm ' + (i === 0 ? 'btn-gold' : 'btn-ghost') + '" data-bet="' + b + '" data-idx="' + i + '">🪙 ' + b + '</button>';
      }).join('') + '</div>' +
      '<div class="dice-zone" id="diceZone">' +
      '<div class="dice-face d1">?</div><div class="dice-face d2">?</div>' +
      '</div>' +
      '<button class="btn btn-gold btn-block" id="rollBtn">🎲 Lanzar los dados</button>' +
      '<div id="diceResult"></div>', true);

    U.$$('[data-bet]', U.$('#overlay')).forEach(function (b) {
      b.addEventListener('click', function () {
        bet = parseInt(b.dataset.bet, 10);
        U.$$('[data-bet]', U.$('#overlay')).forEach(function (x) {
          x.classList.toggle('btn-gold', x === b);
          x.classList.toggle('btn-ghost', x !== b);
        });
      });
    });

    U.$('#rollBtn').addEventListener('click', function () {
      if (st.gold < bet) { I.toast('No tienes suficiente oro 🪙'); return; }
      st.gold -= bet;
      var r = dicePlay();
      var mg = mgStats();
      var msg;
      if (r.mult > 0) {
        var prize = Math.round(bet * r.mult);
        st.gold += prize;
        mg.dice.wins++;
        msg = '<div class="mg-result win">⚡ ¡Zeus sonríe! +' + U.fmt(prize) + ' 🪙</div>';
      } else {
        mg.dice.losses++;
        msg = '<div class="mg-result lose">⛈️ Zeus truena. Perdiste ' + U.fmt(bet) + ' 🪙.</div>';
      }
      OU.STATE.save(); I.updateTopRes();

      var dd = U.$$('.dice-face');
      dd[0].classList.add('roll'); dd[1].classList.add('roll');
      setTimeout(function () {
        dd[0].classList.remove('roll');
        dd[1].classList.remove('roll');
        dd[0].textContent = r.d1;
        dd[1].textContent = r.d2;
        U.$('#diceResult').innerHTML = '<div class="mg-coins">Suma: ' + r.sum + '</div>' + msg;
      }, 500);
    });
  }

  // ---------- 🧠 MEMORIA DE ORFEO ----------
  var MEM_SYMS = ['⚡', '🔥', '🌊', '🦉', '🌹', '🏺'];
  var MEM_MATCH_GOLD = 20;
  var MEM_ENTRY = 25;
  var MEM_BONUS_GEMS = 1;

  /** Baraja de parejas (12 fichas / 6 pares). Testable. */
  function memDeck() {
    var tiles = [];
    MEM_SYMS.forEach(function (sym, i) {
      tiles.push({ i: i * 2, sym: sym });
      tiles.push({ i: i * 2 + 1, sym: sym });
    });
    for (var k = tiles.length - 1; k > 0; k--) {
      var j = Math.floor(Math.random() * (k + 1));
      var tmp = tiles[k]; tiles[k] = tiles[j]; tiles[j] = tmp;
    }
    return tiles;
  }

  function memMatch(a, b) { return a !== b && a.sym === b.sym; }

  function openMemory() {
    var st = OU.STATE.state;
    var mg = mgStats();
    if (st.gold < MEM_ENTRY) { I.toast('Entrar cuesta 🪙 ' + MEM_ENTRY); return; }
    st.gold -= MEM_ENTRY;
    mg.mem.games++;
    OU.STATE.save(); I.updateTopRes();

    var deck = memDeck();
    var opened = [];           // índice de la primera ficha abierta
    var matched = 0;
    var matchedSet = {};
    var locked = false;
    var earned = 0;

    I.openModal(
      '<div class="sec-title" style="margin-top:8px">🧠 Memoria de Orfeo</div>' +
      '<p style="font-size:13px;color:var(--dim);line-height:1.6">Encuentra las <b>6 parejas</b>. Cada acierto te da 🪙 ' + MEM_MATCH_GOLD + ' y completar todo suma 💎 +' + MEM_BONUS_GEMS + '.</p>' +
      '<div class="mem-total" id="memTotal">🪙 +' + U.fmt(earned) + ' · Parejas ' + matched + '/6</div>' +
      '<div class="mem-board" id="memBoard"></div>' +
      '<div id="memResult"></div>', true);

    var board = U.$('#memBoard');
    deck.forEach(function (tile, idx) {
      var el = document.createElement('div');
      el.className = 'mem-tile';
      el.dataset.idx = idx;
      el.innerHTML = '<div class="m-in"><div class="m-f">❓</div><div class="m-b">' + tile.sym + '</div></div>';
      el.addEventListener('click', function () {
        if (locked || matchedSet[idx] || opened[0] === idx) return;
        el.classList.add('flip');
        if (opened.length === 0) { opened[0] = idx; return; }
        // segundo tap: comparar
        var a = opened[0];
        locked = true;
        var ta = deck[a], tb = deck[idx];
        var els = board.children;
        if (memMatch(ta, tb)) {
          matchedSet[a] = true; matchedSet[idx] = true;
          matched++;
          earned += MEM_MATCH_GOLD;
          st.gold += MEM_MATCH_GOLD;
          el.classList.add('ok'); els[a].classList.add('ok');
          OU.STATE.save(); I.updateTopRes();
          var totalEl = U.$('#memTotal'); if (totalEl) totalEl.textContent = '🪙 +' + U.fmt(earned) + ' · Parejas ' + matched + '/6';
          if (matched === MEM_SYMS.length) {
            st.gems += MEM_BONUS_GEMS;
            mg.mem.wins++;
            if (mg.mem.wins > mg.mem.best) mg.mem.best = mg.mem.wins;
            OU.STATE.save(); I.updateTopRes();
            var res = U.$('#memResult');
            if (res) res.innerHTML = '<div class="mg-result win">🏆 ¡Lira completa! +' + U.fmt(earned) + ' 🪙 · 💎 +' + MEM_BONUS_GEMS + '</div>' +
              '<button class="btn btn-gold btn-block" style="margin-top:10px" id="memAgain">Otra ronda 🧠</button>';
            var ag = U.$('#memAgain'); if (ag) ag.addEventListener('click', function () { I.closeModal(); openMemory(); });
          }
          opened = [];
          locked = false;
        } else {
          setTimeout(function () {
            el.classList.remove('flip'); els[a].classList.remove('flip');
            opened = [];
            locked = false;
          }, 700);
        }
      });
      board.appendChild(el);
    });
  }

  OU.GAMES = {
    viewGames: viewGames,
    bindGames: bindGames,
    oraclePlay: oraclePlay,
    rpsResolve: rpsResolve,
    wheelPick: wheelPick,
    wheelFree: wheelFree,
    dicePlay: dicePlay,
    memDeck: memDeck,
    memMatch: memMatch,
    WHEEL_COST: WHEEL_COST
  };
})();