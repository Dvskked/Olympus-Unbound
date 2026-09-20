/**
 * ==== DATOS DEL JUEGO ====
 * Definiciones puras: cartas, rarezas, sobres, fases, entrenamiento e ingresos.
 * @module data
 */
(function () {
  'use strict';
  var OU = window.OU = window.OU || {};

  OU.CONST = {
    SAVE_KEY: 'olympus_unbound_v2',
    MAX_LEVEL: 15,
    MAX_TEAM: 5,
    INITIAL_GOLD: 2000,
    INITIAL_GEMS: 50,
    START_CARDS: ['hop', 'pela', 'delf'],
    TRAIN_XP_NEED: 160,
    INCOME_BASE: 18,
    INCOME_PER_STAGE: 8,
    INCOME_CAP: 600
  };

  OU.RAR = {
    normal: { name: 'Normal', color: '#aeb6c8', glow: 'rgba(174,182,200,0.55)', order: 0 },
    hero:   { name: 'Héroe',  color: '#3fb6ff', glow: 'rgba(63,182,255,0.6)',   order: 1 },
    god:    { name: 'Dios',   color: '#ffd257', glow: 'rgba(255,210,87,0.6)',   order: 2 },
    titan:  { name: 'Titán',  color: '#b14dff', glow: 'rgba(177,77,255,0.7)',   order: 3 }
  };

  OU.ROLES = { tanque: 'Tanque', guerrero: 'Guerrero', mago: 'Mago', soporte: 'Soporte' };

  OU.RARITY_FACTOR = { normal: 1, hero: 2, god: 4, titan: 7 };

  /**
   * Sobres. `w` es la probabilidad por rareza, `guarantee` fuerza al
   * menos `order` de rareza en una extraccion.
   * @type {Object<string,{cls:string,name:string,cost:{gold?:number,gems?:number},count:number,desc:string,odds:Array<[string,string]>,w:Object<string,number>,guarantee?:number}>}
   */
  OU.PACKS = {
    bronze: {
      cls: 'bronze', name: 'Sobre de Bronce', cost: { gold: 300 }, count: 3,
      desc: '3 cartas. Ideal para empezar tu colección.', guarantee: 0,
      odds: [['Normal', '78%'], ['Héroe', '20%'], ['Dios', '1.8%'], ['Titán', '0.2%']],
      w: { normal: .78, hero: .20, god: .018, titan: .002 }
    },
    silver: {
      cls: 'silver', name: 'Sobre de Plata', cost: { gold: 650 }, count: 4,
      desc: '4 cartas con mejores probabilidades de Héroe.', guarantee: 0,
      odds: [['Normal', '62%'], ['Héroe', '32%'], ['Dios', '5.4%'], ['Titán', '0.6%']],
      w: { normal: .62, hero: .32, god: .054, titan: .006 }
    },
    gold: {
      cls: 'goldc', name: 'Sobre de Oro', cost: { gold: 1600 }, count: 5,
      desc: '5 cartas con alta probabilidad de Héroes y Dioses.', guarantee: 0,
      odds: [['Normal', '50%'], ['Héroe', '37%'], ['Dios', '11.5%'], ['Titán', '1.5%']],
      w: { normal: .50, hero: .37, god: .115, titan: .015 }
    },
    epic: {
      cls: 'epic', name: 'Sobre Épico', cost: { gold: 3500 }, count: 5,
      desc: '5 cartas y al menos 1 Héroe garantizado.', guarantee: 1,
      odds: [['Normal', '42%'], ['Héroe', '38%'], ['Dios', '17%'], ['Titán', '3%']],
      w: { normal: .42, hero: .38, god: .17, titan: .03 }
    },
    olympus: {
      cls: 'olympus', name: 'Sobre Olimpo', cost: { gems: 50 }, count: 5,
      desc: '5 cartas. Garantiza al menos 1 Héroe. Probabilidad aumentada de Dioses y Titanes.', guarantee: 1,
      odds: [['Normal', '22%'], ['Héroe', '49.5%'], ['Dios', '22.5%'], ['Titán', '6%']],
      w: { normal: .22, hero: .495, god: .225, titan: .06 }
    },
    divine: {
      cls: 'divine', name: 'Sobre Divino', cost: { gems: 120 }, count: 6,
      desc: '6 cartas. Garantiza al menos 1 Dios. Las mejores probabilidades de Titanes.', guarantee: 2,
      odds: [['Normal', '12%'], ['Héroe', '42%'], ['Dios', '36%'], ['Titán', '10%']],
      w: { normal: .12, hero: .42, god: .36, titan: .10 }
    }
  };

  OU.TRAIN = {
    quick:   { name: 'Entrenamiento Rápido', mins: 1,   xp: 30,  gold: 60,   gems: 0 },
    normal:  { name: 'Entrenamiento Activo', mins: 3,   xp: 100, gold: 190,  gems: 0 },
    intense: { name: 'Entrenamiento Élite',  mins: 8,   xp: 320, gold: 560,  gems: 1 },
    epic:    { name: 'Ritual Legendario',    mins: 20,  xp: 900, gold: 1600, gems: 3 }
  };

  OU.CARDS = [
    { id: 'hop',  n: 'Hoplita Espartano',    r: 'normal', role: 'guerrero', ic: '⚔️', hp: 440, atk: 96,  def: 20, spd: 72, ab: { n: 'Lanza de Bronce', t: 'strike', s: 1.5 } },
    { id: 'gt',   n: 'Guardia Troyana',      r: 'normal', role: 'tanque',   ic: '🛡️', hp: 550, atk: 55,  def: 38, spd: 42, ab: { n: 'Falange Defensiva', t: 'shield', s: 1 } },
    { id: 'arq',  n: 'Arquero Cretense',     r: 'normal', role: 'guerrero', ic: '🏹', hp: 380, atk: 108, def: 14, spd: 84, ab: { n: 'Flecha Certera', t: 'strike', s: 1.8 } },
    { id: 'pela', n: 'Peltasta Tracio',      r: 'normal', role: 'guerrero', ic: '🪓', hp: 410, atk: 92,  def: 16, spd: 75, ab: { n: 'Jabalina Letal', t: 'strike', s: 1.5 } },
    { id: 'sat',  n: 'Sátiro Arremetedor',   r: 'normal', role: 'guerrero', ic: '🐐', hp: 360, atk: 100, def: 12, spd: 88, ab: { n: 'Embestida Salvaje', t: 'strike', s: 2.0 } },
    { id: 'delf', n: 'Sacerdotisa de Delfos', r: 'normal', role: 'soporte', ic: '🔮', hp: 420, atk: 72, def: 16, spd: 58, ab: { n: 'Presagio Curativo', t: 'heal', s: 1.6 } },
    { id: 'gc',   n: 'Guardia Cretense',    r: 'normal', role: 'tanque',   ic: '🏺', hp: 520, atk: 58,  def: 34, spd: 44, ab: { n: 'Escudo de Cobre', t: 'shield', s: 1 } },
    { id: 'mirm', n: 'Fiel Mirmidón',       r: 'normal', role: 'guerrero', ic: '🗡️', hp: 430, atk: 90,  def: 18, spd: 70, ab: { n: 'Estocada Mirmidón', t: 'strike', s: 1.5 } },

    { id: 'aqu',  n: 'Aquiles',  r: 'hero', role: 'guerrero', ic: '⚔️', hp: 620, atk: 150, def: 30, spd: 88, ab: { n: 'Furia del Talón', t: 'strike', s: 2.6 } },
    { id: 'her',  n: 'Hércules', r: 'hero', role: 'guerrero', ic: '🦁', hp: 740, atk: 160, def: 42, spd: 70, ab: { n: 'Mano del León de Nemea', t: 'strike', s: 3.0 } },
    { id: 'per',  n: 'Perseo',   r: 'hero', role: 'guerrero', ic: '🗡️', hp: 560, atk: 140, def: 26, spd: 92, ab: { n: 'Cabeza de Medusa', t: 'strike', s: 2.4 } },
    { id: 'tes',  n: 'Teseo',    r: 'hero', role: 'guerrero', ic: '🧶', hp: 580, atk: 136, def: 28, spd: 78, ab: { n: 'Hilo del Laberinto', t: 'strike', s: 2.2 } },
    { id: 'uli',  n: 'Ulises',   r: 'hero', role: 'guerrero', ic: '🏹', hp: 540, atk: 132, def: 24, spd: 86, ab: { n: 'El Caballo de Madera', t: 'aoe', s: 0.85 } },
    { id: 'ata',  n: 'Atalanta', r: 'hero', role: 'guerrero', ic: '🐆', hp: 500, atk: 150, def: 20, spd: 96, ab: { n: 'Carrera Veloz', t: 'strike', s: 2.6 } },
    { id: 'orf',  n: 'Orfeo',    r: 'hero', role: 'mago',     ic: '🎶', hp: 460, atk: 150, def: 18, spd: 80, ab: { n: 'Melodía Hipnótica', t: 'aoe', s: 0.9 } },
    { id: 'and',  n: 'Andrómeda', r: 'hero', role: 'soporte', ic: '🌟', hp: 520, atk: 100, def: 24, spd: 62, ab: { n: 'Vínculo Sagrado', t: 'heal', s: 1.8 } },
    { id: 'jas',  n: 'Jasón',    r: 'hero', role: 'guerrero', ic: '🐏', hp: 560, atk: 132, def: 26, spd: 76, ab: { n: 'Vellocino de Oro', t: 'buff', s: 1 } },

    { id: 'zus',  n: 'Zeus',     r: 'god', role: 'mago',      ic: '⚡', hp: 560, atk: 210, def: 22, spd: 88, ab: { n: 'Rayo del Olimpo', t: 'aoe', s: 1.2 } },
    { id: 'pos',  n: 'Poseidón', r: 'god', role: 'mago',      ic: '🔱', hp: 640, atk: 195, def: 28, spd: 70, ab: { n: 'Terremoto Marino', t: 'aoe', s: 1.0 } },
    { id: 'had',  n: 'Hades',    r: 'god', role: 'mago',      ic: '💀', hp: 600, atk: 205, def: 26, spd: 74, ab: { n: 'Aliento del Inframundo', t: 'aoe', s: 1.1 } },
    { id: 'ate',  n: 'Atenea',   r: 'god', role: 'soporte',   ic: '🦉', hp: 560, atk: 120, def: 30, spd: 64, ab: { n: 'Sabiduría de Guerra', t: 'buff', s: 1 } },
    { id: 'ars',  n: 'Ares',     r: 'god', role: 'guerrero',  ic: '🔥', hp: 660, atk: 200, def: 36, spd: 82, ab: { n: 'Degüello de Guerra', t: 'strike', s: 2.8 } },
    { id: 'art',  n: 'Artemisa', r: 'god', role: 'guerrero',  ic: '🌙', hp: 580, atk: 190, def: 32, spd: 90, ab: { n: 'Lluvia de Flechas', t: 'aoe', s: 0.9 } },
    { id: 'hef',  n: 'Hefesto',  r: 'god', role: 'tanque',    ic: '⚒️', hp: 920, atk: 130, def: 60, spd: 46, ab: { n: 'Forja Celestial', t: 'shield', s: 1 } },
    { id: 'apo',  n: 'Apolo',    r: 'god', role: 'mago',      ic: '☀️', hp: 540, atk: 200, def: 20, spd: 86, ab: { n: 'Sol Abrasador', t: 'aoe', s: 1.1 } },

    { id: 'cro',  n: 'Cronos',    r: 'titan', role: 'mago',    ic: '⏳', hp: 760, atk: 260, def: 34, spd: 72, ab: { n: 'Devorador del Tiempo', t: 'aoe', s: 1.3 } },
    { id: 'oce',  n: 'Océano',    r: 'titan', role: 'tanque',  ic: '🌊', hp: 1150, atk: 150, def: 72, spd: 44, ab: { n: 'Abismo de las Aguas', t: 'shield', s: 1 } },
    { id: 'hip',  n: 'Hiperión',  r: 'titan', role: 'guerrero', ic: '🌅', hp: 820, atk: 250, def: 44, spd: 80, ab: { n: 'Fuego del Sol', t: 'strike', s: 3.0 } },
    { id: 'jap',  n: 'Jápeto',    r: 'titan', role: 'tanque',  ic: '⛓️', hp: 1080, atk: 140, def: 70, spd: 46, ab: { n: 'Cadenas Primordiales', t: 'shield', s: 1 } },
    { id: 'atl',  n: 'Atlas',     r: 'titan', role: 'tanque',  ic: '🌍', hp: 1250, atk: 170, def: 80, spd: 40, ab: { n: 'Sostén del Cielo', t: 'shield', s: 1 } },
    { id: 'cri',  n: 'Crío',      r: 'titan', role: 'guerrero', ic: '🦾', hp: 790, atk: 240, def: 40, spd: 84, ab: { n: 'Tormenta del Norte', t: 'aoe', s: 1.0 } }
  ];

  OU.CARD_BY_ID = {};
  OU.CARDS.forEach(function (c) { OU.CARD_BY_ID[c.id] = c; });

  OU.CARDS_BY_RAR = {};
  OU.CARDS.forEach(function (c) {
    (OU.CARDS_BY_RAR[c.r] = OU.CARDS_BY_RAR[c.r] || []).push(c);
  });

  OU.STAGES = [
    { n: 'Bandidos de la Ruta',        roster: ['pela', 'sat', 'arq', 'gt', 'hop'],      level: 1 },
    { n: 'Piratas del Egeo',           roster: ['mirm', 'hop', 'arq', 'pela', 'gt'],     level: 2 },
    { n: 'Sátiros Alborotadores',      roster: ['sat', 'sat', 'pela', 'arq', 'gc'],      level: 3 },
    { n: 'Orgullo de Troya',           roster: ['hop', 'gt', 'arq', 'gc', 'mirm'],       level: 4 },
    { n: 'Cazadores Legendarios',      roster: ['ata', 'orf', 'uli', 'per', 'and'],      level: 6 },
    { n: 'El Laberinto de Creta',      roster: ['tes', 'per', 'and', 'jas', 'ata'],      level: 8 },
    { n: 'Furia del Olimpo',           roster: ['ars', 'art', 'apo', 'hef', 'ate'],      level: 10 },
    { n: 'Asalto al Olimpo',           roster: ['zus', 'pos', 'had', 'art', 'ate'],      level: 12 },
    { n: 'Puertas del Inframundo',     roster: ['had', 'apo', 'ars', 'oce', 'cro'],      level: 14 },
    { n: 'Conspiración de los Titanes', roster: ['cro', 'hip', 'jap', 'atl', 'cri'],     level: 16 },
    { n: 'La Titanomaquia',            roster: ['oce', 'cro', 'atl', 'hip', 'zus'],      level: 18 },
    { n: 'Cronos, el Devorador',       roster: ['cro', 'cro', 'atl', 'oce', 'hip'],      level: 20 }
  ];
})();