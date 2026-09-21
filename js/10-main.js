/**
 * ==== MAIN ====
 * Arranque de la aplicación: pestañas, render, bindings y guardado.
 * @module main
 */
(function () {
  'use strict';
  var OU = window.OU = window.OU || {};
  var U = OU.UTIL, I = OU.UI;

  var TABS = ['home', 'training', 'games', 'team', 'collection', 'index', 'shop'];
  var currentTab = 'home';

  function setTab(name) {
    if (OU.BATTLE.running) OU.BATTLE.running = false;
    currentTab = name;
    U.$$('#tabs .tab').forEach(function (t) {
      t.classList.toggle('active', t.dataset.tab === name);
    });
    render();
  }

  function render() {
    var st = OU.STATE.state;
    // Actualiza el ingreso pasivo en el momento del render.
    OU.STATE.tickIncome();
    I.updateTopRes();
    var v = U.$('#view');
    if (!v) return;
    if (currentTab === 'home') {
      v.innerHTML = OU.BATTLE.viewHome();
      OU.BATTLE.bindHome(v);
      OU.TRAIN.bindIncome(v);
    } else if (currentTab === 'training') {
      v.innerHTML = OU.TRAIN.viewTraining();
      OU.TRAIN.bindTraining(v);
    } else if (currentTab === 'games') {
      v.innerHTML = OU.GAMES.viewGames();
      OU.GAMES.bindGames(v);
    } else if (currentTab === 'team') {
      v.innerHTML = OU.TEAM.viewTeam();
      OU.TEAM.bindTeam(v);
    } else if (currentTab === 'collection') {
      v.innerHTML = OU.COLLECTION.viewCollection();
      OU.COLLECTION.bindCollection(v);
    } else if (currentTab === 'index') {
      v.innerHTML = OU.INDEX.viewIndex();
      OU.INDEX.bindIndex(v);
    } else if (currentTab === 'shop') {
      v.innerHTML = OU.SHOP.viewShop();
      OU.SHOP.bindShop(v);
    } else if (currentTab === 'battle') {
      // la pantalla de batalla se dibuja sola
    }
  }

  function init() {
    OU.STATE.load();
    var hasLoader = !!(document.getElementById && document.getElementById('loader'));
    var daily = hasLoader ? OU.STATE.checkDaily() : { reward: 0, streak: 0 };
    U.$$('#tabs .tab').forEach(function (t) {
      t.addEventListener('click', function () { setTab(t.dataset.tab); });
    });
    window.addEventListener('beforeunload', OU.STATE.save);
    U.$('#resRow').addEventListener('click', function () { setTab('shop'); });
    OU.TRAIN.startTimer();
    OU.SHOP.startShopTimer();
    setInterval(function () {
      OU.STATE.tickIncome();
    }, 30000); // guardado periódico del ingreso pasivo
    setTab('home');
    if (daily.reward > 0) {
      setTimeout(function () { I.toast('🎁 Recompensa diaria: +' + daily.reward + ' 💎 (racha de ' + daily.streak + ' día' + (daily.streak === 1 ? '' : 's') + ')'); }, 900);
    }
    if (hasLoader && !OU.STATE.state._tutorial) {
      OU.STATE.state._tutorial = true;
      OU.STATE.save();
      setTimeout(showTutorial, 400);
    }
  }

  /* ---------- PANTALLA DE CARGA ---------- */

  /** Anima la barra de progreso del cargador; devuelve el botón Jugar. */
  function animateLoader() {
    var fill = U.$('#ldFill'), pct = U.$('#ldPct'), play = U.$('#ldPlay'), sub = U.$('#ldSub');
    if (!play) return null;
    play.disabled = true;
    var p = 0;
    var iv = setInterval(function () {
      p = Math.min(100, p + 4 + Math.random() * 13);
      if (fill) fill.style.width = p + '%';
      if (pct) pct.textContent = Math.round(p) + '%';
      if (p >= 100) {
        clearInterval(iv);
        if (sub) sub.textContent = 'El Olimpo te espera';
        play.disabled = false;
      }
    }, 150);
    return play;
  }

  /* ---------- GUÍA DE BIENVENIDA ---------- */

  var TUT_STEPS = [
    { ic: '⚔️', t: 'Batalla', d: 'Vence las <b>100 fases</b> de la campaña para ganar oro, XP y gemas. Tu equipo de 5 cartas pelea solo.' },
    { ic: '🏋️', t: 'Entrenar', d: 'Entrena hasta <b>3 cartas a la vez</b> para ganar XP sin gastar duplicados. Cada carta tiene 5 stocks de mejora y un máximo de 10 niveles por 12 h.' },
    { ic: '🎮', t: 'Minijuegos', d: 'Oráculo, Piedra-Papel-Tijera, la <b>Ruleta de Morfeo</b> (giro gratis cada día), el Dado de Zeus y la Memoria de Orfeo.' },
    { ic: '🛡️', t: 'Equipo', d: 'Elige tus <b>5 mejores cartas</b> o usa «Equipar los mejores» para formar tu escuadrón por poder.' },
    { ic: '📜', t: 'Colección', d: 'Revisa tus cartas y mejóralas con <b>duplicados + oro</b> o <b>solo con oro</b>. Consulta sus habilidades y leyendas.' },
    { ic: '📖', t: 'Índice', d: 'Descubre las <b>103 cartas</b> del juego, ordenadas de la más fuerte a la más débil.' },
    { ic: '🏛️', t: 'Tienda', d: 'Abre sobres, reclama tu <b>dios gratis cada 12 h</b>, canjea gemas por oro y <b>desbloquea al Creador</b> siguiéndolo en GitHub e Instagram.' }
  ];

  function showTutorial() {
    var i = 0;
    function stepsHTML() {
      var s = TUT_STEPS[i];
      return '<div class="tut">' +
        '<div class="tut-ic">' + s.ic + '</div>' +
        '<div class="tut-t">' + s.t + '</div>' +
        '<div class="tut-d">' + s.d + '</div>' +
        '<div class="tut-dots">' + TUT_STEPS.map(function (x, k) { return '<span class="dot' + (k === i ? ' on' : '') + '"></span>'; }).join('') + '</div>' +
        '<div class="tut-btns">' +
        (i > 0 ? '<button class="btn btn-ghost btn-sm" id="tutBack">← Anterior</button>' : '') +
        (i < TUT_STEPS.length - 1
          ? '<button class="btn btn-gold btn-sm" id="tutNext">Siguiente →</button>'
          : '<button class="btn btn-gold btn-sm" id="tutDone">¡Entendido! ⚔️</button>') +
        '</div>' +
        '</div>';
    }
    function bind() {
      var n = U.$('#tutNext'); if (n) n.addEventListener('click', function () { i++; open(); });
      var b = U.$('#tutBack'); if (b) b.addEventListener('click', function () { i--; open(); });
      var d = U.$('#tutDone'); if (d) d.addEventListener('click', I.closeModal);
    }
    function open() { I.openModal(stepsHTML(), true); bind(); }
    i = 0;
    open();
  }

  OU.MAIN = {
    setTab: setTab,
    render: render,
    init: init,
    get currentTab() { return currentTab; },
    set currentTab(v) { currentTab = v; }
  };

  function boot() {
    // Con pantalla de carga (#loader en index.html): esperamos a «Jugar».
    if (document.getElementById && document.getElementById('loader')) {
      var play = U.$('#ldPlay');
      if (play) {
        animateLoader();
        play.addEventListener('click', function () {
          var ld = U.$('#loader');
          if (ld) {
            ld.classList.add('hide');
            setTimeout(function () { if (ld.parentNode) ld.parentNode.removeChild(ld); }, 450);
          }
          init();
        });
      } else {
        init();
      }
    } else {
      init(); // entorno sin cargador (tests, embeds)
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();