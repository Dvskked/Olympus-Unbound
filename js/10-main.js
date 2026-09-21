/**
 * ==== MAIN ====
 * Arranque de la aplicación y pantalla principal rediseñada (estilo boceto):
 *  · Perfil del jugador arriba-izquierda (foto circular + nombre).
 *  · Oro y Gemas arriba-derecha.
 *  · «Mi Equipo» (hasta 5 cartas) en el centro, sobre el fondo ilustrado.
 *  · «Mercadeo» a la izquierda, «Campaña» a la derecha.
 *  · Libro flotante del «Índice» abajo-izquierda.
 *  · Barra inferior con Historia · Personajes · Noticias · Recompensas.
 * Incluye el onboarding de primer uso (nombre + foto local vía FileReader),
 * el perfil editable y las vistas de Recompensas, Historia y Noticias.
 * @module main
 */
(function () {
  'use strict';
  var OU = window.OU = window.OU || {};
  var U = OU.UTIL, I = OU.UI;

  var currentTab = 'home';

  /* =============== REGISTRO DE PANTALLAS =============== */
  /* Cualquier sección distinta de «home» se envuelve con un botón
     «← Volver al Inicio» para regresar a la pantalla principal. */

  var SCREENS = {};
  function screen(name, title, view, bind) {
    SCREENS[name] = { title: title, view: view, bind: bind || null };
  }
  screen('campaign', '⚔️ Campaña', function () { return OU.BATTLE.viewHome(); }, function (root) { OU.BATTLE.bindHome(root); });
  screen('shop', '🛍️ Mercadeo', function () { return OU.SHOP.viewShop(); }, function (root) { OU.SHOP.bindShop(root); });
  screen('index', '📖 Índice de Leyendas', function () { return OU.INDEX.viewIndex(); }, function (root) { OU.INDEX.bindIndex(root); });
  screen('collection', '🃏 Personajes', function () { return OU.COLLECTION.viewCollection(); }, function (root) { OU.COLLECTION.bindCollection(root); });
  screen('training', '🏋️ Entrenamiento', function () { return OU.TRAIN.viewTraining(); }, function (root) { OU.TRAIN.bindTraining(root); });
  screen('team', '🛡️ Mi Equipo', function () { return OU.TEAM.viewTeam(); }, function (root) { OU.TEAM.bindTeam(root); });
  screen('games', '🎪 Minijuegos', function () { return OU.GAMES.viewGames(); }, function (root) { OU.GAMES.bindGames(root); });
  screen('daily', '🎁 Recompensas', viewDaily, bindDaily);
  screen('story', '🏺 Historia', viewStory, null);
  screen('news', '📰 Noticias', viewNews, null);

  function setTab(name) {
    if (OU.BATTLE.running) OU.BATTLE.running = false;
    currentTab = name;
    U.$$('#tabs .tab').forEach(function (t) {
      t.classList.toggle('active', t.dataset.tab === name);
    });
    render();
  }

  function render() {
    OU.STATE.tickIncome();
    I.updateTopRes();
    updateUserHUD();
    var v = U.$('#view');
    if (!v) return;
    if (currentTab === 'battle') return; // la arena de combate se dibuja sola
    var sc = SCREENS[currentTab];
    if (currentTab === 'home' || !sc) {
      v.innerHTML = viewHome();
      bindHome(v);
      return;
    }
    v.innerHTML =
      '<div class="page">' +
      '<div class="sub-head">' +
      '<button class="btn btn-ghost btn-sm jsBack">← Volver al Inicio</button>' +
      '<div class="sub-title">' + sc.title + '</div>' +
      '<span class="sub-sp"></span>' +
      '</div>' +
      sc.view() +
      '</div>';
    var bk = U.$('.jsBack', v);
    if (bk) bk.addEventListener('click', function () { setTab('home'); });
    if (sc.bind) sc.bind(v);
  }

  /* =============== PERFIL DE JUGADOR (primera partida) =============== */

  var PROF_KEY = 'ou_profile';

  function loadProfile() {
    try { return JSON.parse(localStorage.getItem(PROF_KEY) || '{}') || {}; } catch (e) { return {}; }
  }

  function saveProfile(name, avatar) {
    var p = { name: name || '', avatar: avatar || '' };
    try { localStorage.setItem(PROF_KEY, JSON.stringify(p)); } catch (e) { /* cuota superada */ }
    updateUserHUD();
    return p;
  }

  function isNewUser() { return !loadProfile().name; }

  function updateUserHUD() {
    var p = loadProfile();
    var a = U.$('#uhAvatar'), n = U.$('#uhName');
    if (a) a.innerHTML = p.avatar ? '<img class="uh-img" src="' + p.avatar + '" alt="Foto de perfil">' : '👤';
    if (n) n.textContent = p.name || 'Héroe';
  }

  /** Lee una imagen local y la devuelve en Base64 (recortada y comprimida). */
  function readProfileImage(file, cb) {
    function done(url) { if (cb) cb(url || ''); }
    if (typeof FileReader === 'undefined' || typeof Image === 'undefined' || !file) { done(''); return; }
    var fr = new FileReader();
    fr.onload = function () {
      var img = new Image();
      img.onload = function () {
        try {
          var size = 128;
          var cv = document.createElement('canvas');
          var cx = cv.getContext('2d');
          if (!cx) { done(fr.result); return; }
          cv.width = cv.height = size;
          var s = Math.min(img.width, img.height);
          var sx = (img.width - s) / 2, sy = (img.height - s) / 2;
          cx.drawImage(img, sx, sy, s, s, 0, 0, size, size);
          done(cv.toDataURL('image/jpeg', 0.85));
        } catch (e) { done(fr.result); }
      };
      img.onerror = function () { done(fr.result); };
      img.src = fr.result;
    };
    fr.onerror = function () { done(''); };
    fr.readAsDataURL(file);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function welcomeHTML() {
    return '<div class="ob-wrap">' +
      '<div class="ob-herald">⚡</div>' +
      '<div class="ob-t">Bienvenido al Olimpo</div>' +
      '<div class="ob-d">Antes de forjar tu leyenda, dinos quién eres, héroe.</div>' +
      '<div class="ob-avatar" id="obAvatar">👤</div>' +
      '<label class="btn btn-ghost btn-sm ob-file">🖼️ Elegir foto de perfil' +
      '<input type="file" class="ob-file-in" id="obFile" accept="image/*"></label>' +
      '<input type="text" id="obName" class="ob-input" maxlength="20" placeholder="Tu nombre de héroe" autocomplete="off">' +
      '<button class="btn btn-gold btn-block" id="obStart" disabled>⚡ Empezar</button>' +
      '<div class="ob-foot">Tu nombre y tu foto se guardan solo en este dispositivo.</div>' +
      '</div>';
  }

  /** Onboarding: se muestra la primera vez que no hay perfil guardado. */
  function showOnboarding() {
    I.openModal(welcomeHTML(), false);
    var nameEl = U.$('#obName'), start = U.$('#obStart'), av = U.$('#obAvatar');
    var tmpAvatar = '';
    function enable() { if (start) start.disabled = !(nameEl && nameEl.value.trim()); }
    if (nameEl) nameEl.addEventListener('input', enable);
    if (av) {
      var fileIn = U.$('#obFile');
      if (fileIn) fileIn.addEventListener('change', function () {
        var f = fileIn.files && fileIn.files[0];
        if (!f) return;
        readProfileImage(f, function (url) {
          if (!url) return;
          tmpAvatar = url;
          if (av) av.innerHTML = '<img src="' + url + '" alt="Foto de perfil">';
        });
      });
    }
    if (start) start.addEventListener('click', function () {
      var nm = nameEl ? nameEl.value.trim() : '';
      if (!nm) { enable(); return; }
      saveProfile(nm, tmpAvatar);
      I.closeModal();
      I.toast('⚡ ¡' + nm + ', el Olimpo te espera!');
      OU.STATE.save();
      startTutorialOnce();
    });
  }

  /** Modal para editar el perfil (título y foto) desde el HUD. */
  function openProfileModal() {
    var p = loadProfile();
    I.openModal(
      '<div class="ob-wrap">' +
      '<div class="ob-t">Tu perfil</div>' +
      '<div class="ob-d">Edita tu nombre y tu foto de héroe.</div>' +
      '<div class="ob-avatar" id="obAvatar">' + (p.avatar ? '<img src="' + p.avatar + '" alt="Foto de perfil">' : '👤') + '</div>' +
      '<label class="btn btn-ghost btn-sm ob-file">🖼️ Cambiar foto' +
      '<input type="file" class="ob-file-in" id="obFile" accept="image/*"></label>' +
      '<input type="text" id="obName" class="ob-input" maxlength="20" value="' + esc(p.name) + '" placeholder="Tu nombre de héroe" autocomplete="off">' +
      '<button class="btn btn-gold btn-block" id="obSave">Guardar</button>' +
      '<button class="btn btn-ghost btn-block ob-clear" id="obClear">🗑️ Quitar foto</button>' +
      '</div>', true);
    var nameEl = U.$('#obName'), av = U.$('#obAvatar'), save = U.$('#obSave');
    var tmp = p.avatar || '';
    var fileIn = U.$('#obFile');
    if (fileIn) fileIn.addEventListener('change', function () {
      var f = fileIn.files && fileIn.files[0];
      if (!f) return;
      readProfileImage(f, function (url) {
        if (!url) return;
        tmp = url;
        if (av) av.innerHTML = '<img src="' + url + '" alt="Foto de perfil">';
      });
    });
    var clr = U.$('#obClear');
    if (clr) clr.addEventListener('click', function () {
      tmp = '';
      if (av) av.innerHTML = '👤';
    });
    if (save) save.addEventListener('click', function () {
      var nm = nameEl ? nameEl.value.trim() : '';
      saveProfile(nm || 'Héroe', tmp);
      I.closeModal();
      I.toast('✅ Perfil actualizado');
    });
  }

  /* =============== PANTALLA PRINCIPAL (boceto) =============== */

  function viewHome() {
    var st = OU.STATE.state;
    var stag = Math.min(st.stage, OU.STAGES.length - 1);
    return '<div class="home" id="homeView">' +
      '<div class="home-bg" aria-hidden="true"></div>' +
      '<div class="home-shade" aria-hidden="true"></div>' +
      '<div class="home-body">' +
      '<section class="home-cell home-team">' +
      '<div class="home-team-title">Mi Equipo</div>' +
      '<div class="hub-squad">' + OU.TEAM.teamHubHTML() + '</div>' +
      '</section>' +
      '<button class="home-cell home-card home-merk" data-go="shop" title="Abrir el Mercadeo">' +
      '<span class="hc-ic">🛍️</span>' +
      '<span class="hc-t">Mercadeo</span>' +
      '<span class="hc-d">Sobres · ofertas · El Creador</span>' +
      '</button>' +
      '<button class="home-cell home-card home-camp" data-go="campaign" title="Ir a la Campaña">' +
      '<span class="hc-ic">⚔️</span>' +
      '<span class="hc-t">Campaña</span>' +
      '<span class="hc-d">Fase ' + (stag + 1) + ' · ' + OU.STAGES[stag].n + '</span>' +
      '</button>' +
      '<button class="home-cell home-idx" data-go="index" title="Índice de Leyendas">' +
      '<span class="idx-book">📖</span>' +
      '<span class="idx-lb">Índice</span>' +
      '</button>' +
      '</div>' +
      '<div class="home-foot">' + OU.TRAIN.incomeBannerHTML() + '</div>' +
      '</div>';
  }

  function bindHome(root) {
    U.$$('[data-go]', root).forEach(function (b) {
      b.addEventListener('click', function () { setTab(b.dataset.go); });
    });
    U.$$('[data-gotab]', root).forEach(function (b) {
      b.addEventListener('click', function () { setTab(b.dataset.gotab); });
    });
    U.$$('[data-hero]', root).forEach(function (h) {
      h.addEventListener('click', function () { OU.COLLECTION.openCardDetail(h.dataset.hero); });
    });
    OU.TRAIN.bindIncome(root);
  }

  /* =============== RECOMPENSAS DIARIAS =============== */

  var MISSIONS = [
    { k: 'campaign', ic: '⚔️', t: 'Conquistador', d: 'Supera la fase de campaña en la que estás hoy.', gold: 400 },
    { k: 'games', ic: '🎪', t: 'Gloria en la arena', d: 'Gana una partida en cualquier minijuego hoy.', gems: 3 },
    { k: 'bazaar', ic: '🛒', t: 'Cazador de tesoros', d: 'Abre un sobre en el Mercadeo hoy.', gold: 300 }
  ];

  function winsTotal() {
    var mg = OU.STATE.state.mgStats || {};
    return ['oracle', 'ppt', 'wheel', 'dice', 'mem'].reduce(function (s, k) {
      var x = mg[k];
      return s + ((x && x.wins) || 0);
    }, 0);
  }

  /** Snapshot diario para saber si hoy se progresó (sin tocar el motor). */
  function ensureMissions() {
    var st = OU.STATE.state;
    var rec = st.missions = st.missions || {};
    var today = OU.STATE.todayStr(0);
    if (rec.day !== today) {
      rec.day = today;
      rec.snapStage = st.stage;
      rec.snapWins = winsTotal();
      rec.snapCards = Object.keys(st.cards).length;
      rec.claimed = [];
    }
    return rec;
  }

  function missionMet(k, rec) {
    var st = OU.STATE.state;
    if (k === 'campaign') return st.stage > rec.snapStage;
    if (k === 'games') return winsTotal() > rec.snapWins;
    if (k === 'bazaar') return Object.keys(st.cards).length > rec.snapCards;
    return false;
  }

  function claimMission(k) {
    var st = OU.STATE.state;
    var rec = ensureMissions();
    if (rec.claimed.indexOf(k) !== -1) return;
    var m = null;
    MISSIONS.forEach(function (x) { if (x.k === k) m = x; });
    if (!m) return;
    if (!missionMet(k, rec)) { I.toast('Misión «' + m.t + '» aún no completada'); return; }
    rec.claimed.push(k);
    if (m.gold) st.gold += m.gold;
    if (m.gems) st.gems += m.gems;
    OU.STATE.save();
    I.updateTopRes();
    I.toast('✅ Misión «' + m.t + '» cumplida: ' + (m.gold ? '+' + U.fmt(m.gold) + ' 🪙' : '') + (m.gems ? '+' + m.gems + ' 💎' : ''));
    render();
  }

  function missionRows() {
    var rec = ensureMissions();
    return MISSIONS.map(function (m) {
      var claimed = rec.claimed.indexOf(m.k) !== -1;
      var met = missionMet(m.k, rec);
      var chip = claimed
        ? '<span class="m-st ok">✔ Reclamada</span>'
        : (met ? '<span class="m-st met">✓ ¡Cumplida!</span>' : '<span class="m-st lock">En curso…</span>');
      var btn = claimed
        ? ''
        : (met
          ? '<button class="btn btn-gold btn-sm" data-mission="' + m.k + '">Reclamar</button>'
          : '<button class="btn btn-ghost btn-sm" disabled>Pendiente</button>');
      return '<div class="mission-row ' + (claimed ? 'claimed' : (met ? 'ready' : '')) + '">' +
        '<div class="m-ic">' + m.ic + '</div>' +
        '<div class="m-info"><div class="m-t">' + m.t + '</div><div class="m-d">' + m.d + '</div></div>' +
        '<div class="m-re">' + (m.gold ? U.fmt(m.gold) + ' 🪙' : '') + (m.gems ? ' +' + m.gems + ' 💎' : '') + '</div>' +
        '<div class="m-side">' + chip + btn + '</div>' +
        '</div>';
    }).join('');
  }

  function viewDaily() {
    var di = I.dailyInfo();
    var prev = OU.STATE.state.daily.streak || 0;
    var lit = di.claimed ? di.streak : prev;
    var cand = [];
    for (var i = 0; i < 7; i++) {
      var rw = Math.min(OU.CONST.DAILY_GEMS_BASE + (i + 1), OU.CONST.DAILY_GEMS_CAP);
      var cls = i < lit ? 'lit' : (i === lit ? 'now' : '');
      cand.push('<div class="cand ' + cls + '">' +
        '<div class="cand-re">+' + rw + ' 💎</div>' +
        '<div class="cand-ic">' + (i < lit ? '✔' : (i === lit ? '🎯' : '·')) + '</div>' +
        '</div>');
    }
    return '<div class="sec-title">🎁 Recompensas Diarias</div>' +
      '<div class="daily-panel ' + (di.claimed ? 'done' : '') + '">' +
      '<div class="dp-row">' +
      '<div class="dp-icon">' + (di.claimed ? '🔥' : '📅') + '</div>' +
      '<div class="dp-info">' +
      '<div class="dp-t">Racha de <b>' + di.streak + '</b> día' + (di.streak === 1 ? '' : 's') + '</div>' +
      '<div class="dp-d">Cada día reclamado suma más gemas, hasta +' + OU.CONST.DAILY_GEMS_CAP + ' 💎.</div>' +
      '</div>' +
      '<div class="dp-cta">' +
      (di.claimed
        ? '<div class="dp-claimed">✔ Reclamado hoy</div><div class="dp-next">Mañana: +' + di.nextReward + ' 💎</div>'
        : '<button class="btn btn-gold" id="claimDaily">Reclamar +' + di.reward + ' 💎</button>') +
      '</div>' +
      '</div>' +
      '<div class="dp-cal">' + cand.join('') + '</div>' +
      '</div>' +
      '<div class="sec-title">Misiones del día</div>' +
      '<p class="battle-hint" style="text-align:left;margin-top:0">Completa objetivos jugando. Las misiones se renuevan cada día al abrir esta pestaña.</p>' +
      missionRows() +
      '<div class="sec-title">Más acciones</div>' +
      '<div class="quick-row">' +
      '<button class="qbtn" data-go="games">🎪 Minijuegos</button>' +
      '<button class="qbtn" data-go="training">🏋️ Entrenar</button>' +
      '<button class="qbtn" data-go="team">🛡️ Gestionar equipo</button>' +
      '</div>';
  }

  function bindDaily(root) {
    var cd = U.$('#claimDaily', root);
    if (cd) cd.addEventListener('click', function () {
      var r = OU.STATE.checkDaily();
      if (r.reward > 0) {
        I.updateTopRes();
        I.toast('🎁 Reclamada: +' + r.reward + ' 💎 · racha de ' + r.streak + ' día' + (r.streak === 1 ? '' : 's'));
        render();
      } else {
        I.toast('Ya reclamaste la recompensa de hoy');
      }
    });
    U.$$('[data-mission]', root).forEach(function (b) {
      b.addEventListener('click', function () { claimMission(b.dataset.mission); });
    });
    U.$$('[data-go]', root).forEach(function (b) {
      b.addEventListener('click', function () { setTab(b.dataset.go); });
    });
  }

  /* =============== HISTORIA (mitología) =============== */

  var MYTHS = [
    { ic: '⚡', t: 'El rayo de Zeus', d: 'Zeus, rey del Olimpo, empuña un rayo forjado por los Cíclopes. Con él castiga a quienes desafían la voluntad divina.' },
    { ic: '🦉', t: 'Atenea, nacida del pensamiento', d: 'Atenea, diosa de la sabiduría y la guerra justa, nació ya adulta y con armadura desde la cabeza de Zeus.' },
    { ic: '🌊', t: 'Poseidón y el primer caballo', d: 'Poseidón, señor de mares y terremotos, hizo brotar el primer caballo de una roca con su tridente.' },
    { ic: '⛓️', t: 'Hades no es el diablo', d: 'Hades gobierna el inframundo con justicia y serenidad; no era malvado, sino el guardián equilibrado de los muertos.' },
    { ic: '🌅', t: 'El nacimiento de Afrodita', d: 'Afrodita, diosa del amor y la belleza, nació de la espuma del mar alrededor de la isla de Chipre.' },
    { ic: '🔥', t: 'Prometeo, el amigo de los mortales', d: 'Prometeo robó el fuego a los dioses y se lo dio a la humanidad. Zeus lo encadenó a una roca donde un águila devoraba su hígado cada día.' },
    { ic: '📦', t: 'La caja de Pandora', d: 'Pandora abrió la caja prohibida y liberó todos los males. En el fondo quedó una cosa: la esperanza.' },
    { ic: '🪞', t: 'Narciso y el estanque', d: 'Narciso, hermoso y orgulloso, se enamoró de su reflejo en un lago y se consumió mirándolo. Ahí nació la flor del narciso.' },
    { ic: '☀️', t: 'Ícaro y las alas de cera', d: 'Ícaro escapó del laberinto con alas de cera, pero voló tan alto que el sol las derritió y cayó al mar.' },
    { ic: '🛡️', t: 'Perseo y la mirada de Medusa', d: 'Perseo venció a Medusa guiándose por su reflejo en un escudo pulido, sin mirarla jamás de frente.' },
    { ic: '💪', t: 'Los doce trabajos de Heracles', d: 'Heracles, el héroe más fuerte de Grecia, cumplió 12 trabajos imposibles: desde el león de Nemea hasta el can Cerbero.' },
    { ic: '🗡️', t: 'Teseo y el Minotauro', d: 'Teseo venció al Minotauro en el laberinto de Creta siguiendo el hilo de Ariadna para no perderse.' },
    { ic: '🎶', t: 'Orfeo y Eurídice', d: 'Orfeo conmovió a Hades con su lira para rescatar a Eurídice, pero la perdió al girarse antes de salir del inframundo.' },
    { ic: '🦶', t: 'El talón de Aquiles', d: 'Aquiles era invencible salvo por el talón por el que su madre lo sostuvo al bañarlo en el río Estigia.' },
    { ic: '🐴', t: 'El caballo de Troya', d: 'Odiseo ocultó guerreros dentro de un enorme caballo de madera; los troyanos lo aceptaron y así cayó la ciudad.' },
    { ic: '⏳', t: 'El viaje de Odiseo', d: 'Tras la guerra de Troya, Odiseo tardó diez años en volver a Ítaca: cíclopes, sirenas y magas poblaron su regreso.' },
    { ic: '⌛', t: 'Cronos y la Titanomaquia', d: 'Cronos devoraba a sus hijos al nacer. Zeus, salvado por su madre, lo destronó y derrocó a los Titanes.' },
    { ic: '🎭', t: 'Las nueve Musas', d: 'Las Musas, hijas de Zeus y Mnemósine, protegen las artes y las ciencias: poesía, historia, astronomía y más.' },
    { ic: '🌑', t: 'El río Estigia', d: 'El Estigia rodeaba el Hades. Los dioses juraban por él y, si rompían el juramento, caían del Olimpo nueve años.' },
    { ic: '🐏', t: 'El vellocino de oro', d: 'Era la piel de un carnero alado enviado por Hermes. Jasón y los Argonautas remaron hasta conseguirlo.' },
    { ic: '🌺', t: 'Perséfone y las estaciones', d: 'Perséfone pasa medio año con Hades: por eso llega el invierno. Al volver con su madre, la tierra reverdece.' },
    { ic: '⛰️', t: 'Los Titanes', d: 'Eran hijos de Urano (el Cielo) y Gea (la Tierra), y precedieron a los dioses olímpicos tras la gran guerra.' },
    { ic: '👢', t: 'Hermes, el mensajero', d: 'Con sus sándalos alados era mensajero de los dioses, y también patrón de viajeros, comerciantes y astutos.' },
    { ic: '🌍', t: 'Atlas y el cielo', d: 'Atlas fue condenado a sostener la bóveda del cielo sobre sus hombros por luchar contra Zeus.' },
    { ic: '🐍', t: 'La Hidra de Lerna', d: 'La Hidra regeneraba cada cabeza que le cortaban. Heracles la venció quemando los cuellos con una antorcha.' },
    { ic: '👁️', t: 'Las tres Gorgonas', d: 'Eran tres hermanas de cabellera de serpientes; Medusa, la única mortal, convertía en piedra a quien la mirara.' },
    { ic: '🕷️', t: 'Aracne, la tejedora retada', d: 'Aracne retó a Atenea a un concurso de tejido. Ofendida, la diosa la transformó en araña.' },
    { ic: '🏹', t: 'Quirón, el centauro sabio', d: 'Quirón fue mentor de Aquiles, Jasón y Heracles, y renunció a su inmortalidad para curar a Prometeo.' },
    { ic: '💨', t: 'Eolo y los vientos', d: 'Eolo, señor de los vientos, guardaba las tormentas en un odre de cuero y las soltaba a voluntad.' },
    { ic: '🏺', t: 'La ambrosía y el néctar', d: 'La ambrosía era el alimento de los dioses y el néctar su bebida: ambos otorgaban inmortalidad.' }
  ];

  function storyIndex() {
    var m = new Date();
    var start = new Date(m.getFullYear(), 0, 0);
    var day = Math.floor((m - start) / 86400000);
    return day % MYTHS.length;
  }

  function viewStory() {
    var cur = MYTHS[storyIndex()];
    var list = MYTHS.map(function (x) {
      return '<div class="myth-row">' +
        '<div class="my-ic">' + x.ic + '</div>' +
        '<div class="my-info"><div class="my-t">' + x.t + '</div><div class="my-d">' + x.d + '</div></div>' +
        '</div>';
    }).join('');
    return '<div class="sec-title">🏺 Historias del Olimpo</div>' +
      '<div class="story-today">' +
      '<div class="st-tag">Dato curioso del día</div>' +
      '<div class="st-ic">' + cur.ic + '</div>' +
      '<div class="st-t">' + cur.t + '</div>' +
      '<div class="st-d">' + cur.d + '</div>' +
      '</div>' +
      '<p class="battle-hint" style="text-align:left;margin-top:12px">Descubre cada día una leyenda de la mitología griega que inspira las cartas del juego.</p>' +
      '<div class="sec-title">El eco de la mitología</div>' +
      '<div class="story-list">' + list + '</div>';
  }

  /* =============== NOTICIAS (novedades y cambios) =============== */

  var NEWS = [
    { d: 'Hoy', ic: '🏛️', t: 'Tu hogar ha amanecido', x: 'Pantalla principal rediseñada: tu «Mi Equipo» luce en el centro, con el Mercadeo a la izquierda y la Campaña a la derecha. Toca el libro flotante para abrir el Índice de Leyendas.' },
    { d: 'Hoy', ic: '👤', t: 'Ponle cara a tu leyenda', x: 'Elige tu nombre y una foto de perfil al empezar (o toca tu nombre arriba para editarlo). Todo se guarda solo en tu dispositivo, sin subir nada a ningún servidor.' },
    { d: 'Semana', ic: '⚔️', t: '100 fases de guerra divina', x: 'Desde los Campos Elíseos hasta Tifón, el Devorador de Dioses. Derrota a los 10 jefes de acto y reclama gemas extra.' },
    { d: 'Semana', ic: '🎁', t: 'Racha diaria de gemas', x: 'Reclama cada día para sumar gemas: +2, +3… hasta +10 💎. Si fallas un día, la racha se reinicia.' },
    { d: 'Semana', ic: '🎪', t: 'El Ágora ya tiene espectáculos', x: 'Oráculo, Piedra-Papel-Tijera, la Ruleta de Morfeo, el Dado de Zeus y la Memoria de Orfeo te esperan en Minijuegos.' },
    { d: 'Próximamente', ic: '🗓️', t: 'Eventos de doble oro', x: 'Se acercan fines de semana con oro duplicado, jefes semanales y nuevas cartas primordiales. Vuelve a esta sección para no perdértelo.' }
  ];

  function viewNews() {
    var rows = NEWS.map(function (n) {
      return '<div class="news-row">' +
        '<div class="news-ic">' + n.ic + '</div>' +
        '<div class="news-body">' +
        '<div class="news-t">' + n.t + '</div>' +
        '<div class="news-x">' + n.x + '</div>' +
        '<div class="news-d">' + n.d + '</div>' +
        '</div>' +
        '</div>';
    }).join('');
    return '<div class="sec-title">📰 Noticias del Olimpo</div>' +
      '<p class="battle-hint" style="text-align:left;margin-top:0">Aquí encontrarás todas las novedades y cambios del juego.</p>' +
      '<div class="news-list">' + rows + '</div>';
  }

  /* =============== INICIO =============== */

  function startTutorialOnce() {
    var st = OU.STATE.state;
    if (!st._tutorial) {
      st._tutorial = true;
      OU.STATE.save();
      setTimeout(showTutorial, 400);
    }
  }

  function init() {
    OU.STATE.load();
    updateUserHUD();
    U.$$('#tabs .tab').forEach(function (t) {
      t.addEventListener('click', function () { setTab(t.dataset.tab); });
    });
    window.addEventListener('beforeunload', OU.STATE.save);
    var uh = U.$('#userHud');
    if (uh) uh.addEventListener('click', openProfileModal);
    U.$$('#resRow .chip').forEach(function (c) {
      c.addEventListener('click', function (e) {
        e.stopPropagation();
        setTab(c.dataset.goto || 'shop');
      });
    });
    OU.TRAIN.startTimer();
    OU.SHOP.startShopTimer();
    setInterval(function () {
      OU.STATE.tickIncome();
    }, 30000); // guardado periódico del ingreso pasivo
    setTab('home');
    if (isNewUser()) {
      setTimeout(showOnboarding, 600);
      return;
    }
    var hasLoader = !!(document.getElementById && document.getElementById('loader'));
    if (hasLoader) {
      var di = I.dailyInfo();
      if (!di.claimed && di.reward > 0) {
        setTimeout(function () { I.toast('🎁 ¡+' + di.reward + ' 💎 te esperan en «Recompensas»!'); }, 900);
      }
    }
    startTutorialOnce();
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
    { ic: '🏛️', t: 'Tu hogar', d: 'Esta es tu pantalla principal. Tu <b>«Mi Equipo»</b> brilla en el centro: toca cualquier carta para verla en Personajes.' },
    { ic: '🛍️', t: 'Mercadeo', d: 'El módulo de la <b>izquierda</b> abre el Mercadeo: sobres, ofertas y El Creador. Ábrelo cuando quieras conseguir cartas nuevas.' },
    { ic: '⚔️', t: 'Campaña', d: 'A la <b>derecha</b> tienes la Campaña: vence sus 100 fases para ganar oro, XP y gemas. Tu equipo de 5 cartas pelea solo.' },
    { ic: '📖', t: 'Índice', d: 'El <b>libro flotante</b> abajo a la izquierda abre el Índice de Leyendas: todas las cartas, desbloqueadas y por descubrir.' },
    { ic: '🃏', t: 'Personajes', d: 'En el menú inferior, <b>Personajes</b> guarda tus cartas: mejóralas con duplicados y oro, entrénalas y gestiona tu equipo.' },
    { ic: '🎁', t: 'Recompensas', d: '<b>Recompensas</b> te da una racha diaria de gemas 💎 y misiones que se renuevan cada día. También encontrarás los minijuegos.' },
    { ic: '📰', t: 'Noticias', d: 'En <b>Noticias</b> seguiremos contándote novedades, eventos y cambios del juego.' }
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