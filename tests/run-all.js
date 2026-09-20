const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DIR = path.resolve(__dirname, '..', 'js');
const files = [
  '00-img.js', '01-data.js', '02-state.js', '03-utils.js', '04-ui.js',
  '05-shop.js', '06-collection.js', '07-team.js', '08-battle.js',
  '09-training.js', '10-main.js'
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

global.localStorage = {
  store: {},
  getItem(k){ return this.store[k] || null; },
  setItem(k, v){ this.store[k] = v; },
  removeItem(){}
};
global.window = { addEventListener(){}, AudioContext: undefined, webkitAudioContext: undefined };
global.document = {
  readyState: 'complete',
  querySelector: () => makeEl(),
  querySelectorAll: () => [],
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

(async () => {
  const CARDS = o.CARDS, STAGES = o.STAGES, PACKS = o.PACKS;
  const CARD_BY_ID = o.CARD_BY_ID, CARDS_BY_RAR = o.CARDS_BY_RAR, RAR = o.RAR;

  check('cards have unique ids', new Set(CARDS.map(c => c.id)).size === CARDS.length, CARDS.length + ' cards');
  check('rarity distribution', CARDS_BY_RAR.normal.length > 0 && CARDS_BY_RAR.titan.length > 0,
    `n=${CARDS_BY_RAR.normal.length} h=${CARDS_BY_RAR.hero.length} g=${CARDS_BY_RAR.god.length} t=${CARDS_BY_RAR.titan.length}`);
  check('all stage card ids exist', STAGES.every(s => s.roster.every(id => CARD_BY_ID[id])), STAGES.length + ' stages');
  check('all cards have images', CARDS.every(c => o.IMG[c.id] !== undefined), 'IMG map = ' + Object.keys(o.IMG).length);
  check('six packs defined', Object.keys(PACKS).length === 6, 'bronze/silver/gold/epic/olympus/divine');
  check('pack probability sums to 1', Object.values(PACKS).every(p => Math.abs(Object.values(p.w).reduce((a, b) => a + b, 0) - 1) < 0.01), '6 packs');

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

  let hits = { normal: 0, hero: 0, god: 0, titan: 0 };
  for (let i = 0; i < 20000; i++) hits[U.rollRarity(PACKS.bronze)]++;
  check('bronze odds sane', hits.normal > 14000 && hits.normal < 17000 && hits.titan > 5, JSON.stringify(hits));

  const r1 = U.rewardOf(0), r11 = U.rewardOf(11);
  check('rewards scale', r11.gold > r1.gold && r11.xp > r1.xp, `stage1=${r1.gold}g stage12=${r11.gold}g`);

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
    const count0 = Object.keys(st.cards).length;
    o.SHOP.buyPack('bronze');  // animación síncrona con sleep stub? no, es async real
    const deduct = st.gold === gold0 - 300;
    const gained = Object.keys(st.cards).length >= count0;
    // la apertura real añade cartas tras el cálculo; aquí ya se dedujo y se guardó
    return deduct && gained;
  })(), 'cards=' + Object.keys(st.cards).length);
  for (let i = 0; i < 5; i++) await new Promise(r => setImmediate(r)); // deja terminar la animación → openingBusy=false
  check('exchange gems', (() => {
    const gold0 = st.gold;
    st.gems = Math.max(st.gems, 10);
    o.SHOP.doExchange(10);
    return o.STATE.state.gold === gold0 + 1200 && o.STATE.state.gems === Math.max(st.gems, 10) - 10 || o.STATE.state.gold > gold0;
  })());

  // Entrenamiento: iniciar y recolectar (con nivel de carta)
  check('training flow', (() => {
    const id = CONST.START_CARDS[0];
    st.trainCard = null; st.trainType = null; st.trainUntil = 0;
    const gold0 = st.gold;
    const lvl0 = st.cards[id].lvl;
    o.TRAIN.startTraining(id, 'quick');
    const started = st.trainCard === id && st.trainUntil > Date.now();
    st.trainUntil = Date.now() - 1; // ya terminó
    o.TRAIN.collectTraining();
    const rewarded = st.gold > gold0;
    const cleared = st.trainCard === null;
    const lvlKept = st.cards[id].lvl >= lvl0;
    return started && rewarded && cleared && lvlKept;
  })(), 'quick=' + JSON.stringify(o.TRAIN.quick));

  // Entrenamiento que cruza el tope de XP → sube de nivel sin duplicados
  check('training crosses xp threshold → level up', (() => {
    const id = CONST.START_CARDS[0];
    st.trainCard = null; st.trainType = null; st.trainUntil = 0;
    const c = st.cards[id];
    c.lvl = 1; c.xp = U.trainCost(id, 1) - 1; // justo debajo del tope
    const lvl0 = c.lvl;
    o.TRAIN.startTraining(id, 'epic'); // +900 XP
    st.trainUntil = Date.now() - 1;
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

  console.log(fails === 0 ? '\nALL PASSED' : `\n${fails} FAILURES`);
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });