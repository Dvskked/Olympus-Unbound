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
    U.$$('#tabs .tab').forEach(function (t) {
      t.addEventListener('click', function () { setTab(t.dataset.tab); });
    });
    window.addEventListener('beforeunload', OU.STATE.save);
    U.$('#resRow').addEventListener('click', function () { setTab('shop'); });
    OU.TRAIN.startTimer();
    setInterval(function () {
      OU.STATE.tickIncome();
    }, 30000); // guardado periódico del ingreso pasivo
    setTab('home');
  }

  OU.MAIN = {
    setTab: setTab,
    render: render,
    init: init,
    get currentTab() { return currentTab; },
    set currentTab(v) { currentTab = v; }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();