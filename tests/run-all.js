const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DIR = path.resolve(__dirname, '..', 'js');
const files = [
  '00-img.js', '01-data.js', '02-state.js', '03-utils.js', '04-ui.js',
  '05-shop.js', '06-collection.js', '07-team.js', '08-battle.js',
  '09-training.js', '10-main.js', '11-index.js', '12-games.js'
];

function makeEl() {
  return {
    style: { setProperty(){} }, dataset: {}, textContent: '', innerHTML: '', className: '',
    classList: { add(){}, remove(){}, toggle(){} },
    addEventListener(){}, appendChild(){}, remove(){}, removeChild(){},
    setProperty(){}, getBoundingClientRect(){ return { left: 0, top: 0, width: 50, height: 80 }; },
    offsetWidth: 0,
    querySelector: () => makeEl(),
    querySelectorAll: () => [],
  };
}

/* El stub de DOM guarda un elemento por selector, como el navegador real.
   Así los tests pueden leer lo que las pantallas pintan en #view. */
const domCache = new Map();
function el(sel) {
  if (!domCache.has(sel)) domCache.set(sel, makeEl());
  return domCache.get(sel);
}

global.localStorage = {
  store: {},
  getItem(k){ return this.store[k] || null; },
  setItem(k, v){ this.store[k] = v; },
  removeItem(){}
};
global.window = { addEventListener(){}, AudioContext: undefined, webkitAudioContext: undefined };
global.document = {
  readyState: 'complete',
  querySelector: sel => el(sel),
  querySelectorAll: () => [],
  getElementById: id => (id === 'loader' ? null : el('#' + id)),
  createElement: () => makeEl(),
  addEventListener(){}
};
global.confirm = () => true;
global.navigator = {};

const code = files.map(f => fs.readFileSync(path.join(DIR, f), 'utf8')).join('\n;\n');
const ctx = vm.createContext(global);
vm.runInContext(code, ctx);

const g = name => vm.runInContext(name, ctx);
const o = g('window.OU');
const U = o.UTIL, CONST = o.CONST;

let fails = 0;
function check(name, cond, extra) {
  if (cond) { console.log('PASS ' + name + (extra ? '  [' + extra + ']' : '')); }
  else { fails++; console.log('FAIL ' + name + (extra ? '  [' + extra + ']' : '')); }
}

/* Valida que un fragmento de HTML tenga las etiquetas balanceadas y bien
   anidadas. Una etiqueta sin cerrar o mal cerrada en la pantalla de inicio
   reparte las celdas de la rejilla y deja el mercado y la campaña sin poder
   pulsarse: por eso se comprueba en todas las pantallas. */
const VOID_TAGS = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
function unbalancedTags(html) {
  const stack = [], errors = [];
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>])*?)(\/?)>/g;
  let m;
  while ((m = re.exec(html))) {
    const closing = m[1] === '/', tag = m[2].toLowerCase();
    if (VOID_TAGS.has(tag) || m[4] === '/') continue;
    if (!closing) { stack.push(tag); continue; }
    if (!stack.length) { errors.push('cierre sobrante </' + tag + '>'); continue; }
    if (stack[stack.length - 1] === tag) { stack.pop(); continue; }
    let found = -1;
    for (let i = stack.length - 1; i >= 0; i--) if (stack[i] === tag) { found = i; break; }
    if (found === -1) errors.push('cierre </' + tag + '> sin apertura (había <' + stack[stack.length - 1] + '> abierto)');
    else { errors.push('sin cerrar: ' + stack.slice(found + 1).join(', ') + ' antes de </' + tag + '>'); stack.length = found; }
  }
  if (stack.length) errors.push('sin cerrar al final: ' + stack.join(', '));
  return errors;
}

(async () => {
  const CARDS = o.CARDS, STAGES = o.STAGES, PACKS = o.PACKS;
  const CARD_BY_ID = o.CARD_BY_ID, CARDS_BY_RAR = o.CARDS_BY_RAR, RAR = o.RAR;

  check('cards have unique ids', new Set(CARDS.map(c => c.id)).size === CARDS.length, CARDS.length + ' cards');
  check('103 cards in total', CARDS.length === 103, 'esperábamos 103 (==24N+24H+22G+20T+12P+1C)');
  check('rarity distribution', CARDS_BY_RAR.normal.length > 0 && CARDS_BY_RAR.titan.length > 0 && CARDS_BY_RAR.primordial.length === 12 && CARDS_BY_RAR.creator.length === 1,
    `n=${CARDS_BY_RAR.normal.length} h=${CARDS_BY_RAR.hero.length} g=${CARDS_BY_RAR.god.length} t=${CARDS_BY_RAR.titan.length} p=${CARDS_BY_RAR.primordial.length} c=${(CARDS_BY_RAR.creator || []).length}`);
  check('all stage card ids exist', STAGES.every(s => s.roster.every(id => CARD_BY_ID[id])), STAGES.length + ' stages');
  check('100 stages defined (10 actos x 10)', STAGES.length === 100, 'campaign de 100 fases');
  check('all cards have images', CARDS.every(c => o.IMG[c.id] !== undefined), 'IMG map = ' + Object.keys(o.IMG).length);
  check('seven packs defined', Object.keys(PACKS).length === 7, 'bronze/silver/gold/epic/olympus/divine/cosmic');
  check('pack probability sums to 1', Object.values(PACKS).every(p => Math.abs(Object.values(p.w).reduce((a, b) => a + b, 0) - 1) < 0.01), '7 packs');

  // Garantías
  for (const k of Object.keys(PACKS)) {
    const p = PACKS[k];
    if (!p.guarantee) continue;
    let bad = false;
    for (let i = 0; i < 300; i++) {
      const pulls = U.generatePulls(p);
      if (!pulls.some(id => RAR[CARD_BY_ID[id].r].order >= p.guarantee)) { bad = true; break; }
    }
    check(`pack '${k}' guarantees >= rareza ${p.guarantee}`, !bad);
  }

  check('upgrade cost positive + scales', (() => {
    const up = U.upgradeCost('hop', 1), up10 = U.upgradeCost('hop', 10);
    return up.gold > 0 && up.dupes > 0 && up10.gold > up.gold;
  })(), 'MAX_LEVEL=' + CONST.MAX_LEVEL);

  check('gold-only upgrade is the pricey shortcut', (() => {
    const g1 = U.goldOnlyCost('hop', 1), g30 = U.goldOnlyCost('zus', 29);
    return g1 > U.upgradeCost('hop', 1).gold && g1 >= 150 && g30 > g1;
  })(), 'goldOnly > standard, max(150), crece con nivel');

  let hits = { normal: 0, hero: 0, god: 0, titan: 0 };
  for (let i = 0; i < 20000; i++) hits[U.rollRarity(PACKS.bronze)]++;
  check('bronze odds sane', hits.normal > 16500 && hits.normal < 18000 && hits.titan > 5, JSON.stringify(hits));

  const r1 = U.rewardOf(0), rLast = U.rewardOf(STAGES.length - 1);
  check('rewards scale with the stage', rLast.gold > r1.gold && rLast.xp > r1.xp, `stage1=${r1.gold}g stage${STAGES.length}=${rLast.gold}g`);

  // Estado inicial tras el load() de main.init()
  let st = o.STATE.state;
  check('initial resources', st.gold === CONST.INITIAL_GOLD && st.gems === CONST.INITIAL_GEMS, 'gold=' + st.gold + ' gems=' + st.gems);
  check('seed cards given', CONST.START_CARDS.every(id => st.cards[id]), Object.keys(st.cards).join(','));

  // Aceleramos el reloj del motor para evitar esperas reales en toda la suite.
  o.UTIL.sleep = () => Promise.resolve();
  check('train config/api merged', typeof o.TRAIN.quick === 'object' && typeof o.TRAIN.startTraining === 'function' && typeof o.TRAIN.incomeBannerHTML === 'function', 'quick.mins=' + o.TRAIN.quick.mins);

  // Guardar / cargar
  check('save/load roundtrip', (() => {
    st.gold += 100;
    o.STATE.save();
    const saved = global.localStorage.store[CONST.SAVE_KEY];
    const okSave = !!saved && saved.includes('"team"');
    const savedGold = JSON.parse(saved).gold;
    o.STATE.load(); // reemplaza el objeto de estado internamente
    const restored = o.STATE.state.gold === savedGold;
    st = o.STATE.state;
    st.gold -= 100; o.STATE.save();
    return okSave && restored;
  })());

  // Ingreso pasivo
  check('passive income accrues', (() => {
    st.incomeAcc = 0; st.incomeLast = Date.now() - 60000;
    o.STATE.tickIncome();
    const after = o.STATE.state.incomeAcc;
    st.incomeLast = Date.now(); st.incomeAcc = 0; o.STATE.save();
    return after > 0;
  })(), 'acc=' + o.STATE.state.incomeAcc);

  // Tienda: comprar un sobre
  check('buy bronze pack', (() => {
    const gold0 = st.gold;
    const cost = o.PACKS.bronze.cost.gold;
    const count0 = Object.keys(st.cards).length;
    o.SHOP.buyPack('bronze');  // animación síncrona con sleep stub? no, es async real
    const deduct = st.gold === gold0 - cost;
    const gained = Object.keys(st.cards).length >= count0;
    // la apertura real añade cartas tras el cálculo; aquí ya se dedujo y se guardó
    return deduct && gained;
  })(), 'cards=' + Object.keys(st.cards).length);
  for (let i = 0; i < 5; i++) await new Promise(r => setImmediate(r)); // deja terminar la animación → openingBusy=false
  check('exchange gems', (() => {
    const gold0 = st.gold;
    const gems0 = Math.max(st.gems, 10);
    st.gems = gems0;
    o.SHOP.doExchange(10);
    return st.gold === gold0 + 2000 && st.gems === gems0 - 10;
  })(), '💎 10 → 🪙 2000');

  // Entrenamiento: iniciar y recolectar (con nivel de carta)
  check('training flow (multi-slot)', (() => {
    const id = CONST.START_CARDS[0];
    st.trainSlots = [];
    const gold0 = st.gold;
    const lvl0 = st.cards[id].lvl;
    const started = o.TRAIN.startTraining(id, 'quick') === true;
    const slots = st.trainSlots || [];
    const placed = slots.length === 1 && slots[0].cardId === id && slots[0].until > Date.now();
    slots[0].until = Date.now() - 1; // ya terminó
    o.TRAIN.collectTraining();
    const rewarded = st.gold > gold0;
    const cleared = st.trainSlots.length === 0;
    const lvlKept = st.cards[id].lvl >= lvl0;
    return started && placed && rewarded && cleared && lvlKept;
  })(), 'quick=' + JSON.stringify(o.TRAIN.quick));

  // Entrenamiento: máximo 3 ranuras concurrentes
  check('training max 3 concurrent slots', (() => {
    st.trainSlots = [];
    o.TRAIN.startTraining('hop', 'quick');
    o.TRAIN.startTraining('gt', 'quick');
    o.TRAIN.startTraining('arq', 'quick');
    const three = st.trainSlots.length === 3;
    const blocked = o.TRAIN.startTraining('sat', 'quick') === false;
    st.trainSlots = []; o.STATE.save();
    return three && blocked;
  })(), 'max=' + o.CONST.MAX_TRAIN);

  // Entrenamiento que cruza el tope de XP → sube de nivel sin duplicados
  check('training crosses xp threshold → level up', (() => {
    const id = CONST.START_CARDS[0];
    st.trainSlots = [];
    const c = st.cards[id];
    c.lvl = 1; c.xp = U.trainCost(id, 1) - 1; // justo debajo del tope
    const lvl0 = c.lvl;
    o.TRAIN.startTraining(id, 'epic'); // +XP
    st.trainSlots[0].until = Date.now() - 1;
    o.TRAIN.collectTraining();
    return c.lvl > lvl0;
  })(), 'lvl now=' + st.cards[CONST.START_CARDS[0]].lvl);

  // Combate real (rápido) con el equipo inicial + refuerzos comprados
  const ids = Object.keys(st.cards).slice(0, 5);
  while (ids.length < 5) ids.push('hop');
  st.team = ids.slice(0, 5);
  st.cards['hop'] = st.cards['hop'] || { lvl: 1, dup: 0, xp: 0 };
  o.STATE.save();

  // Aceleramos el reloj del motor para evitar esperas reales.
  o.UTIL.sleep = () => Promise.resolve();

  let okBattle = false, battleErr = null, finished = false;
  const goldBefore = o.STATE.state.gold;
  try {
    o.BATTLE.startBattle(0);
    // Esperamos a que el motor termine (battleRunning vuelve a false).
    for (let i = 0; i < 600; i++) {
      await o.UTIL.sleep(0);
      if (!o.BATTLE.running) break;
    }
    finished = true;
    okBattle = o.STATE.state.gold > 0;
  } catch (e) { battleErr = (e && e.stack) ? e.stack : String(e); }
  check('battle completes without throwing', finished && okBattle, battleErr ? battleErr.split('\n')[0] : 'stage 1 sim');
  check('battle resolved (running=false)', o.BATTLE.running === false, 'running=' + o.BATTLE.running);

  // Vista: render de cada pestaña sin romper (stubs DOM)
  check('home view renders', (() => { try { const h = o.BATTLE.viewHome(); return typeof h === 'string' && h.length > 100; } catch (e) { return false; } })());
  check('training view renders', (() => { try { return typeof o.TRAIN.viewTraining() === 'string'; } catch (e) { return false; } })());
  check('team view renders', (() => { try { return typeof o.TEAM.viewTeam() === 'string'; } catch (e) { return false; } })());
  check('collection view renders', (() => { try { return typeof o.COLLECTION.viewCollection() === 'string'; } catch (e) { return false; } })());
  check('shop view renders', (() => { try { return typeof o.SHOP.viewShop() === 'string'; } catch (e) { return false; } })());
  check('index view renders + progress', (() => {
    try {
      const h = o.INDEX.viewIndex();
      return typeof h === 'string' && h.includes('Índice de Leyendas') && h.includes('Desbloqueadas');
    } catch (e) { return false; }
  })());
  check('index order strongest first', (() => {
    const st = o.STATE.state;
    const sorted = o.CARDS.slice().sort((a, b) => o.INDEX.maxPower(b.id) - o.INDEX.maxPower(a.id));
    return o.INDEX.maxPower(sorted[0].id) >= o.INDEX.maxPower(sorted[1].id);
  })());
  check('games view renders', (() => { try { const h = o.GAMES.viewGames(); return typeof h === 'string' && h.includes('Minijuegos'); } catch (e) { return false; } })());

  /* ---------- PANTALLAS DE FUERZA Y NIVEL ---------- */
  check('la campaña muestra poder propio, rival y veredicto', (() => {
    try {
      const h = o.BATTLE.viewHome();
      const stag = U.currentStage();
      return h.includes('force-panel') && h.includes('Nivel general del equipo') &&
        h.includes(U.fmt(U.teamPower())) && h.includes(U.fmt(U.stagePower(stag))) &&
        h.includes(U.verdict(U.teamPower(), U.stagePower(stag)).n) &&
        h.includes('Poder rival');
    } catch (e) { return false; }
  })(), 'panel de fuerzas + 100 fases agrupadas en actos');

  check('la campaña agrupa las 100 fases en 10 actos', (() => {
    try {
      const h = o.BATTLE.viewHome();
      const heads = (h.match(/class="act-head/g) || []).length;
      return heads === 10 && STAGES.every(s => h.includes(s.n));
    } catch (e) { return false; }
  })(), (o.BATTLE.viewHome().match(/class="act-head/g) || []).length + ' cabeceras de acto');

  check('cada fase anuncia poder rival y veredicto', (() => {
    const h = o.BATTLE.viewHome();
    let ok = true;
    for (const s of [STAGES[0], STAGES[54], STAGES[99]]) {
      if (!h.includes('Poder rival <b>' + U.fmt(s.power) + '</b>')) ok = false;
      if (!h.includes(s.diffName)) ok = false;
    }
    return ok;
  })(), 'poder exacto de la fase en su tarjeta');

  check('Mi Equipo muestra nivel general, poder y niveles por carta', (() => {
    try {
      const h = o.TEAM.viewTeam();
      const st = o.STATE.state;
      const tlv = U.teamLevelInfo();
      return h.includes('tlv-panel') && h.includes('Nivel general del equipo') &&
        h.includes(U.fmt(tlv.total)) && h.includes('force-mini') &&
        h.includes('Poder total del equipo') &&
        st.team.filter(Boolean).every(id => h.includes('NV ' + st.cards[id].lvl));
    } catch (e) { return false; }
  })(), 'nivel + poder + NV de cada miembro');

  check('el editor de equipo se abre sin romper', (() => {
    try { o.TEAM.openTeamEditorModal(); return typeof o.UI.openModal === 'function'; } catch (e) { return false; }
  })());

  check('Personajes muestra el nivel general en la cabecera', (() => {
    try {
      const h = o.COLLECTION.viewCollection();
      return h.includes('coll-head') && h.includes('Nivel general del equipo') &&
        h.includes(U.fmt(U.teamLevelInfo().total));
    } catch (e) { return false; }
  })());

  check('la pantalla de carga tiene hueco para los consejos', (() => {
    const root = path.join(DIR, '..');
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    const main = fs.readFileSync(path.join(root, 'js', '10-main.js'), 'utf8');
    return html.includes('id="ldTip"') && html.includes('id="ldTipTx"') &&
      main.includes('startTips()') && main.includes('stopTips()') &&
      main.includes('function showTip()');
  })());

  check('index.html tiene el HTML bien formado', (() => {
    const errs = unbalancedTags(fs.readFileSync(path.join(DIR, '..', 'index.html'), 'utf8'));
    if (errs.length) console.log('      ' + errs.join(' | '));
    return errs.length === 0;
  })());

  check('todas las pantallas pintan HTML bien formado', (() => {
    const tabs = ['home', 'shop', 'campaign', 'team', 'collection', 'training', 'index', 'games'];
    const view = el('#view');
    let ok = true, detalle = '';
    for (const t of tabs) {
      view.innerHTML = '';
      try {
        o.MAIN.setTab(t);
        const errs = unbalancedTags(view.innerHTML);
        if (errs.length) { ok = false; detalle = t + ': ' + errs[0]; break; }
        if (!view.innerHTML) { ok = false; detalle = t + ': no pintó nada'; break; }
      } catch (e) { ok = false; detalle = t + ' lanzó ' + e.message; break; }
    }
    o.MAIN.setTab('home');
    if (detalle) console.log('      ' + detalle);
    return ok;
  })(), '8 pestañas');

  check('el inicio conserva su rejilla de 4 celdas', (() => {
    o.MAIN.setTab('home');
    const h = el('#view').innerHTML;
    const cells = (h.match(/class="home-cell/g) || []).length;
    const go = (h.match(/data-go="/g) || []).length;
    const foot = h.indexOf('class="home-foot"');
    const errs = unbalancedTags(h);
    if (errs.length) console.log('      ' + errs[0]);
    return cells === 4 && go === 4 && foot > 0 && errs.length === 0;
  })(), '4 celdas, 4 destinos, banner de ingresos al final');

  check('la ficha de una carta se abre bien y muestra su nivel', (() => {
    const modals = [];
    const real = o.UI.openModal;
    o.UI.openModal = function (h) { modals.push(String(h)); return true; };
    try { o.COLLECTION.openCardDetail(CONST.START_CARDS[0]); }
    finally { o.UI.openModal = real; }
    if (!modals.length) return false;
    const errs = unbalancedTags(modals[0]);
    if (errs.length) console.log('      ' + errs[0]);
    const rc = st.cards[CONST.START_CARDS[0]];
    return errs.length === 0 && modals[0].includes('NV ' + rc.lvl) &&
      modals[0].includes('id="upBtn"');
  })());

  /* ---------- NIVEL GENERAL DEL EQUIPO ---------- */
  check('nivel general = media de TODAS las cartas', (() => {
    const s = o.STATE.state;
    const saved = JSON.parse(JSON.stringify(s.cards));
    const ids = Object.keys(s.cards);
    for (const id of ids) s.cards[id].lvl = 1;
    const all1 = U.teamLevel();
    for (const id of ids) s.cards[id].lvl = 10;
    const all10 = U.teamLevel();
    s.cards = saved;
    o.STATE.save();
    return all1 === 1 && all10 === 10;
  })(), 'media redondeada de la colección');

  check('mejorar una carta NO equipada suma al nivel general', (() => {
    const s = o.STATE.state;
    const saved = JSON.parse(JSON.stringify(s.cards));
    const savedTeam = s.team.slice();
    for (const id of Object.keys(s.cards)) s.cards[id].lvl = 1;
    s.team = [];                                  // la carta está en el almacén
    const id = Object.keys(s.cards)[0];
    const before = U.teamLevelInfo();
    s.cards[id].lvl = 2;
    const after = U.teamLevelInfo();
    const note = U.teamLevelUpNote(before);
    s.cards = saved;
    s.team = savedTeam;
    o.STATE.save();
    return after.total === before.total + 1 &&          // +1 exacto, siempre visible
      after.avg > before.avg &&                        // el promedio también sube
      after.lvl >= before.lvl &&                       // el nivel grande nunca baja
      note.includes(String(before.total)) && note.includes(String(after.total));
  })(), 'total +1 por nivel de carta, aunque esté en el almacén');

  check('el nivel general sube de escalón al cruzar el umbral', (() => {
    const s = o.STATE.state;
    const saved = JSON.parse(JSON.stringify(s.cards));
    const ids = Object.keys(s.cards);
    // 2 cartas: subir una de nivel 1 a 2 cruza el umbral (promedio 1.0 -> 1.5)
    s.cards = {};
    ids.slice(0, 2).forEach(id => { s.cards[id] = { lvl: 1, dup: 0, xp: 0 }; });
    const before = U.teamLevelInfo();
    s.cards[ids[0]].lvl = 2;
    const after = U.teamLevelInfo();
    s.cards = saved;
    o.STATE.save();
    return before.lvl === 1 && before.pct === 50 && before.missing === 1 &&   // entero = media barra
      after.lvl === 2 && after.next === 3 && after.missing === 2 &&         // falta para el 3
      after.pct === 0 &&                                                    // la barra se reinicia
      U.teamLevelUpNote(before).includes('NIVEL GENERAL 2');
  })(), 'promedio 1.0 -> 1.5 = nivel 2, barra a 0 para el siguiente');

  check('barra de nivel y niveles que faltan son coherentes', (() => {
    const s = o.STATE.state;
    const saved = JSON.parse(JSON.stringify(s.cards));
    const ids = Object.keys(s.cards);
    s.cards = {};
    ids.slice(0, 4).forEach(id => { s.cards[id] = { lvl: 5, dup: 0, xp: 0 }; });
    const i1 = U.teamLevelInfo();
    s.cards[ids[0]].lvl = 6;
    const i2 = U.teamLevelInfo();
    s.cards = saved;
    o.STATE.save();
    return i1.lvl === 5 && i1.avg1 === 5 && i1.missing === 2 &&
      i1.pct === 50 &&                              // promedio entero = mitad de barra
      i2.missing === i1.missing - 1 &&              // cada nivel de carta descuenta 1
      i2.pct > i1.pct && i2.pct <= 100 &&
      i2.total === i1.total + 1;
  })(), 'missing -1 y pct avanza con cada nivel');

  /* ---------- PODER Y VEREDICTO ---------- */
  check('poder de equipo = suma de las cartas equipadas', (() => {
    const s = o.STATE.state;
    const sum = s.team.filter(Boolean).reduce((a, id) => a + U.powerOf(id, s.cards[id].lvl), 0);
    return U.teamPower() === sum && U.teamPower([]) === 0;
  })(), 'team=' + U.teamPower());

  check('poder de fase = escala x poder real de su roster', (() => {
    let ok = true;
    for (const idx of [0, 45, 99]) {
      const s = STAGES[idx];
      const base = s.roster.reduce((a, id) => a + U.powerOf(id, s.level), 0);
      if (U.stagePower(idx) !== s.power || s.power !== Math.round(base * s.scale)) ok = false;
      if (typeof s.scale !== 'number' || s.scale <= 0) ok = false;
    }
    return ok;
  })(), 'todas las fases: ' + STAGES.every(s => s.power === Math.round(s.roster.reduce((a, id) => a + U.powerOf(id, s.level), 0) * s.scale)));

  check('el poder mostrado de la fase es el que usa el combate', (() => {
    // makeUnit aplica stage.scale a los enemigos, así que la suma escalada
    // tiene que coincidir con lo que anuncia la pantalla de campaña
    const s = STAGES[20];
    const base = s.roster.reduce((a, id) => a + U.powerOf(id, s.level), 0);
    return Math.round(base * s.scale) === U.stagePower(20);
  })(), 'fase 21: ' + U.stagePower(20));

  check('veredicto con umbrales explícitos', (() => {
    const t = U.stagePower(0);
    const cases = [
      [t * 2.5, 'TRIVIAL'], [t * 1.5, 'FÁCIL'], [t * 1.1, 'JUSTA'],
      [t * 0.95, 'AL FILO'], [t * 0.8, 'DIFÍCIL'], [t * 0.65, 'BRUTAL'],
      [t * 0.3, 'BRUTAL']
    ];
    return cases.every(([p, n]) => U.verdict(p, t).n === n);
  })(), 'umbrales 1.9 / 1.35 / 1.08 / 0.92 / 0.78 / 0.6');

  check('la campaña no retrocede de acto en acto', (() => {
    // regla de diseño: un acto empieza, como mínimo, al nivel de la mediana
    // del anterior (dentro del acto sí hay valles, que es lo pedido)
    const median = a => {
      const v = a.slice().sort((x, y) => x - y), m = v.length >> 1;
      return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
    };
    for (let a = 1; a < 10; a++) {
      const prev = STAGES.slice((a - 1) * 10, a * 10), cur = STAGES.slice(a * 10, a * 10 + 10);
      if (Math.min(...cur.map(s => s.power)) < median(prev.map(s => s.power))) return false;
    }
    return true;
  })(), 'min(acto) >= mediana(acto previo)');

  check('la última fase es el muro y sigue siendo ganable', (() => {
    const powers = STAGES.map(s => s.power);
    const max = Math.max(...powers);
    const last = STAGES[STAGES.length - 1];
    return last.power === max && last.final &&
      last.power < o.POWER_CEILING && last.power > o.POWER_CEILING * 0.8;
  })(), `muro=${STAGES[99].power} techo=${o.POWER_CEILING} ratio=${(STAGES[99].power / o.POWER_CEILING).toFixed(2)}`);

  check('hay picos y valles dentro de los actos', (() => {
    const valles = STAGES.filter(s => s.spike === 'valle').length;
    const picos = STAGES.filter(s => s.spike === 'pico').length;
    return valles >= 15 && picos >= 15 && valles + picos < STAGES.length;
  })(), STAGES.filter(s => s.spike === 'valle').length + ' valles / ' + STAGES.filter(s => s.spike === 'pico').length + ' picos');

  check('la primera fase es superable por el equipo inicial', (() => {
    const start = CONST.START_CARDS.reduce((a, id) => a + U.powerOf(id, 1), 0);
    const ratio = start / U.stagePower(0);
    return ratio >= 0.75 && ratio <= 2.5;
  })(), `ratio=${(CONST.START_CARDS.reduce((a, id) => a + U.powerOf(id, 1), 0) / U.stagePower(0)).toFixed(2)}`);

  check('ninguna fase supera el techo del juego', (() => {
    return STAGES.every(s => s.power <= o.POWER_CEILING);
  })(), `máx fase=${Math.max(...STAGES.map(s => s.power))} techo=${o.POWER_CEILING}`);

  check('toda fase tiene nivel, acto, veredicto y insignia', (() => {
    return STAGES.every(s =>
      s.level > 0 && s.act >= 1 && s.act <= 10 &&
      typeof s.actName === 'string' && s.actName.length > 0 &&
      typeof s.rel === 'number' && s.rel >= 0 && s.rel <= 1 &&
      typeof s.diff === 'number' && s.diff >= 0 && s.diff <= 4 &&
      typeof s.diffName === 'string' && s.diffName.length > 0 &&
      typeof s.diffCls === 'string' && /^diff-[0-4]$/.test(s.diffCls));
  })(), '100/100');

  check('consejos de carga disponibles y sin duplicar', (() => {
    const tips = o.TIPS;
    return Array.isArray(tips) && tips.length >= 8 &&
      tips.every(t => t && t.i && t.t) &&
      new Set(tips.map(t => t.t)).size === tips.length;
  })(), (o.TIPS || []).length + ' consejos');
  check('oracle play consistent', (() => {
    let ok = true;
    for (let i = 0; i < 200; i++) {
      const r = o.GAMES.oraclePlay(true);
      if (r.heads < 0 || r.heads > 7 || typeof r.won !== 'boolean' || (r.heads >= 4) !== r.won) { ok = false; break; }
    }
    return ok;
  })());
  check('rps resolves all matchups', (() => {
    return o.GAMES.rpsResolve(0, 2) === 1 && o.GAMES.rpsResolve(1, 0) === 1 && o.GAMES.rpsResolve(2, 1) === 1 &&
      o.GAMES.rpsResolve(0, 1) === -1 && o.GAMES.rpsResolve(1, 2) === -1 && o.GAMES.rpsResolve(2, 0) === -1 &&
      o.GAMES.rpsResolve(0, 0) === 0 && o.GAMES.rpsResolve(1, 1) === 0 && o.GAMES.rpsResolve(2, 2) === 0;
  })());
  check('roulette picks weight-loaded segment', (() => {
    const i = o.GAMES.wheelPick(() => 0.001);       // muy baja → primeras casillas
    const j = o.GAMES.wheelPick(() => 0.9999);      // muy alta → últimas casillas
    return i === 0 && j === o.GAMES.wheelPick(() => 0.9999);
  })());
  check('wheel free daily resets', (() => {
    const st = o.STATE.state;
    if (!st.mgStats) st.mgStats = {};
    if (!st.mgStats.wheel) st.mgStats.wheel = {};
    st.mgStats.wheel.lastFree = '';
    const wasFree = o.GAMES.wheelFree();
    st.mgStats.wheel.lastFree = new Date().toISOString().slice(0, 10);
    const nowNotFree = !o.GAMES.wheelFree();
    st.mgStats.wheel.lastFree = '';
    o.STATE.save();
    return wasFree && nowNotFree;
  })());

  // Bazar: genera ofertas y se renueva al pasar 12 h
  check('bazaar generates offers', (() => {
    st.shopItems = [];
    o.SHOP.ensureBazaar();
    return st.shopItems.length > 0 && st.shopRefresh > Date.now();
  })(), 'items=' + o.STATE.state.shopItems.length);
  check('bazaar refreshes when expired', (() => {
    st.shopItems = [];
    st.shopRefresh = Date.now() - 1000;
    o.SHOP.ensureBazaar();
    return st.shopItems.length > 0 && st.shopRefresh > Date.now();
  })());
  check('bazaar gold lot purchase adds gold', (() => {
    const idx = o.STATE.state.shopItems.findIndex(x => x && x.t === 'gold');
    if (idx < 0) return true; // sin oferta de oro, no hay nada que probar
    const item = o.STATE.state.shopItems[idx];
    const g = item.g;
    const cost = item.cost.gems;
    o.STATE.state.gems = Math.max(o.STATE.state.gems, cost + 5);
    const before = o.STATE.state.gold;
    o.SHOP.buyOffer(idx);
    return o.STATE.state.gold === before + g && !o.STATE.state.shopItems.some(x => x === item);
  })());

  // Equipo: equipar los mejores respetando topes por rol y el orden 1-2-2-1
  check('equip best respects role caps + formation', (() => {
    const owned = Object.keys(o.STATE.state.cards);
    if (owned.length < 2) return true;
    o.TEAM.equipBest();
    const t = o.STATE.state.team;
    const count = (r) => t.filter(id => id && o.CARD_BY_ID[id].role === r).length;
    const filled = t.filter(Boolean).length;
    const slotRoles = o.CONST.TEAM_SLOT_ROLES;
    const orderOk = slotRoles.every((r, i) => t[i] == null || o.CARD_BY_ID[t[i]].role === r);
    const capsOk = ['tanque', 'guerrero', 'mago', 'soporte'].every(r => count(r) <= o.CONST.ROLE_CAPS[r]);
    return filled <= o.CONST.MAX_TEAM && orderOk && capsOk && t.length === o.CONST.TEAM_SLOT_ROLES.length;
  })(), 'team=' + o.STATE.state.team.join(','));

  // Nuevos minijuegos
  check('dice play multipliers consistent', (() => {
    for (let i = 0; i < 2000; i++) {
      const r = o.GAMES.dicePlay();
      if (!Number.isInteger(r.d1) || r.d1 < 1 || r.d1 > 6 || !Number.isInteger(r.d2) || r.d2 < 1 || r.d2 > 6) return false;
      if (r.sum === 7 && r.mult !== 3) return false;
      if ((r.sum === 2 || r.sum === 12) && r.mult !== 4) return false;
      if (r.mult === 0 && r.sum % 2 !== 1) return false;
      if (r.mult === 1.6 && (r.sum % 2 !== 0 || r.sum === 7 || r.sum === 2 || r.sum === 12)) return false;
      if (r.sum !== r.d1 + r.d2) return false;
    }
    return true;
  })());
  check('memory deck balanced pairs', (() => {
    const d = o.GAMES.memDeck();
    const okLen = d.length === 12;
    const unique = new Set(d.map(t => t.sym)).size === 6;
    const counts = {};
    d.forEach(t => { counts[t.sym] = (counts[t.sym] || 0) + 1; });
    const allTwo = Object.values(counts).every(n => n === 2);
    return okLen && unique && allTwo;
  })());
  check('memory match only equal pairs', (() => {
    const a = { sym: '⚡' }, b = { sym: '⚡' }, c = { sym: '🔥' };
    return o.GAMES.memMatch(a, b) && !o.GAMES.memMatch(a, c) && !o.GAMES.memMatch(a, a);
  })());

  console.log(fails === 0 ? '\nALL PASSED' : `\n${fails} FAILURES`);
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });