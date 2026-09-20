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
    MAX_LEVEL: 30,
    MAX_TEAM: 5,
    INITIAL_GOLD: 3000,
    INITIAL_GEMS: 50,
    START_CARDS: ['hop', 'pela', 'delf'],
    TRAIN_XP_NEED: 160,
    INCOME_BASE: 35,
    INCOME_PER_STAGE: 14,
    INCOME_CAP: 4000
  };

  OU.RAR = {
    normal:     { name: 'Normal',     color: '#aeb6c8', glow: 'rgba(174,182,200,0.55)',     order: 0 },
    hero:       { name: 'Héroe',      color: '#3fb6ff', glow: 'rgba(63,182,255,0.6)',       order: 1 },
    god:        { name: 'Dios',       color: '#ffd257', glow: 'rgba(255,210,87,0.6)',       order: 2 },
    titan:      { name: 'Titán',      color: '#b14dff', glow: 'rgba(177,77,255,0.7)',       order: 3 },
    primordial: { name: 'Primordial', color: '#f2f7ff', glow: 'rgba(240,247,255,0.9)',      order: 4 }
  };

  OU.ROLES = { tanque: 'Tanque', guerrero: 'Guerrero', mago: 'Mago', soporte: 'Soporte' };

  // Los dioses y titanes se mejoran MÁS BARATO que antes (factores reducidos),
  // aunque siguen siendo los más caros individuales. A cambio, cuesta más sacarlos.
  OU.RARITY_FACTOR = { normal: 1, hero: 1.5, god: 2.0, titan: 2.6, primordial: 3.2 };

  /**
   * Sobres. `w` es la probabilidad por rareza, `guarantee` fuerza al
   * menos `order` de rareza en una extraccion.
   * @type {Object<string,{cls:string,name:string,cost:{gold?:number,gems?:number},count:number,desc:string,badge?:string,odds:Array<[string,string]>,w:Object<string,number>,guarantee?:number}>}
   */
  OU.PACKS = {
    bronze: {
      cls: 'bronze', name: 'Sobre de Bronce', cost: { gold: 200 }, count: 3,
      desc: '3 cartas. Ideal para empezar tu colección.', guarantee: 0,
      odds: [['Normal', '86%'], ['Héroe', '13.3%'], ['Dios', '0.6%'], ['Titán', '0.1%']],
      w: { normal: .860, hero: .133, god: .006, titan: .001 }
    },
    silver: {
      cls: 'silver', name: 'Sobre de Plata', cost: { gold: 450 }, count: 4,
      desc: '4 cartas con mejores probabilidades de Héroe.', guarantee: 0,
      odds: [['Normal', '71%'], ['Héroe', '27.8%'], ['Dios', '1.1%'], ['Titán', '0.1%']],
      w: { normal: .710, hero: .278, god: .011, titan: .001 }
    },
    gold: {
      cls: 'goldc', name: 'Sobre de Oro', cost: { gold: 900 }, count: 5,
      desc: '5 cartas con alta probabilidad de Héroes y Dioses.', guarantee: 0,
      odds: [['Normal', '55%'], ['Héroe', '42.4%'], ['Dios', '2.4%'], ['Titán', '0.2%']],
      w: { normal: .550, hero: .424, god: .024, titan: .002 }
    },
    epic: {
      cls: 'epic', name: 'Sobre Épico', cost: { gold: 1800 }, count: 5,
      desc: '5 cartas y al menos 1 Héroe garantizado.', guarantee: 1,
      odds: [['Normal', '44%'], ['Héroe', '50.2%'], ['Dios', '5.5%'], ['Titán', '0.3%']],
      w: { normal: .440, hero: .502, god: .055, titan: .003 }
    },
    olympus: {
      cls: 'olympus', name: 'Sobre Olimpo', cost: { gems: 40 }, count: 5,
      desc: '5 cartas. Garantiza al menos 1 Héroe. Probabilidad de Dioses y Titanes.', guarantee: 1,
      odds: [['Normal', '22%'], ['Héroe', '64%'], ['Dios', '13.4%'], ['Titán', '0.6%']],
      w: { normal: .220, hero: .640, god: .134, titan: .006 }
    },
    divine: {
      cls: 'divine', name: 'Sobre Divino', cost: { gems: 90 }, count: 6,
      desc: '6 cartas. Garantiza al menos 1 Dios. Las mejores probabilidades de Titanes.', guarantee: 2,
      odds: [['Normal', '12%'], ['Héroe', '53.4%'], ['Dios', '32.2%'], ['Titán', '2.4%']],
      w: { normal: .120, hero: .534, god: .322, titan: .024 }
    },
    cosmic: {
      cls: 'cosmic', name: 'Sobre Cósmico', cost: { gems: 160 }, count: 6,
      desc: '6 cartas. Garantiza al menos 1 Dios. Los Primordiales solo aparecen aquí.', badge: 'PRIMORDIAL', guarantee: 2,
      odds: [['Normal', '10%'], ['Héroe', '42%'], ['Dios', '34%'], ['Titán', '10%'], ['Primordial', '4%']],
      w: { normal: .100, hero: .420, god: .340, titan: .100, primordial: .040 }
    }
  };

  OU.TRAIN = {
    quick:   { name: 'Entrenamiento Rápido', mins: 1,   xp: 45,  gold: 90,   gems: 0 },
    normal:  { name: 'Entrenamiento Activo', mins: 3,   xp: 150, gold: 280,  gems: 0 },
    intense: { name: 'Entrenamiento Élite',  mins: 8,   xp: 480, gold: 840,  gems: 2 },
    epic:    { name: 'Ritual Legendario',    mins: 20,  xp: 1350, gold: 2400, gems: 5 },
    mythic:  { name: 'Ritual Primordial',    mins: 60,  xp: 4800, gold: 8000, gems: 12 }
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
    { id: 'ant',  n: 'Antíloco',            r: 'normal', role: 'guerrero', ic: '🗡️', hp: 435, atk: 96,  def: 18, spd: 78, ab: { n: 'Furia del Ímpetu', t: 'strike', s: 1.6 } },
    { id: 'pal',  n: 'Palamedes',           r: 'normal', role: 'soporte',  ic: '🧠', hp: 400, atk: 70,  def: 20, spd: 60, ab: { n: 'Estrategia Delta', t: 'buff', s: 0.8 } },
    { id: 'cas',  n: 'Casandra',            r: 'normal', role: 'mago',     ic: '🔮', hp: 360, atk: 84,  def: 12, spd: 74, ab: { n: 'Voz Profética', t: 'aoe', s: 0.55 } },
    { id: 'tel',  n: 'Telémaco',            r: 'normal', role: 'guerrero', ic: '🗡️', hp: 400, atk: 88,  def: 16, spd: 76, ab: { n: 'Estoque del Heredero', t: 'strike', s: 1.4 } },
    { id: 'lan',  n: 'Laertes',             r: 'normal', role: 'guerrero', ic: '⚔️', hp: 425, atk: 84,  def: 18, spd: 56, ab: { n: 'Regreso del Anciano', t: 'strike', s: 1.35 } },
    { id: 'pirit', n: 'Pirítoo',            r: 'normal', role: 'guerrero', ic: '🗡️', hp: 450, atk: 92,  def: 19, spd: 66, ab: { n: 'Golpe del Lapita', t: 'strike', s: 1.5 } },
    { id: 'pod',  n: 'Podalirio',           r: 'normal', role: 'soporte',  ic: '⚕️', hp: 380, atk: 60,  def: 14, spd: 54, ab: { n: 'Cura de Asclepio', t: 'heal', s: 1.3 } },
    { id: 'mac',  n: 'Macaón',              r: 'normal', role: 'soporte',  ic: '🩺', hp: 395, atk: 62,  def: 15, spd: 52, ab: { n: 'Cirugía de Guerra', t: 'heal', s: 1.2 } },
    { id: 'prt',  n: 'Protesilao',          r: 'normal', role: 'guerrero', ic: '🛡️', hp: 420, atk: 94,  def: 16, spd: 72, ab: { n: 'Primer Salto', t: 'strike', s: 1.6 } },
    { id: 'dri',  n: 'Dríade del Roble',    r: 'normal', role: 'soporte',  ic: '🌳', hp: 390, atk: 56,  def: 16, spd: 48, ab: { n: 'Susurro del Bosque', t: 'heal', s: 1.1 } },
    { id: 'teu',  n: 'Teucro el Arquero',   r: 'normal', role: 'guerrero', ic: '🏹', hp: 415, atk: 104, def: 15, spd: 82, ab: { n: 'Flecha del Padre Escudo', t: 'strike', s: 1.7 } },
    { id: 'frix', n: 'Frixo',               r: 'normal', role: 'guerrero', ic: '🐏', hp: 430, atk: 96,  def: 17, spd: 74, ab: { n: 'Vellocino Alado', t: 'strike', s: 1.55 } },
    { id: 'hele', n: 'Hele la Náufraga',    r: 'normal', role: 'soporte',  ic: '🌊', hp: 405, atk: 66,  def: 16, spd: 56, ab: { n: 'Viento del Helesponto', t: 'heal', s: 1.35 } },
    { id: 'teocl',n: 'Teoclímeno',          r: 'normal', role: 'mago',     ic: '👁️', hp: 375, atk: 92,  def: 12, spd: 72, ab: { n: 'Presagio Errante', t: 'aoe', s: 0.5 } },
    { id: 'ido',  n: 'Idomeneo',            r: 'normal', role: 'guerrero', ic: '🗡️', hp: 455, atk: 98,  def: 19, spd: 68, ab: { n: 'Pendón de Creta', t: 'strike', s: 1.5 } },
    { id: 'polix',n: 'Pólux',               r: 'normal', role: 'guerrero', ic: '👊', hp: 470, atk: 94,  def: 20, spd: 66, ab: { n: 'Puño de Pólux', t: 'strike', s: 1.5 } },

    { id: 'aqu',  n: 'Aquiles',  r: 'hero', role: 'guerrero', ic: '⚔️', hp: 620, atk: 150, def: 30, spd: 88, ab: { n: 'Furia del Talón', t: 'strike', s: 2.6 } },
    { id: 'her',  n: 'Hércules', r: 'hero', role: 'guerrero', ic: '🦁', hp: 740, atk: 160, def: 42, spd: 70, ab: { n: 'Mano del León de Nemea', t: 'strike', s: 3.0 } },
    { id: 'per',  n: 'Perseo',   r: 'hero', role: 'guerrero', ic: '🗡️', hp: 560, atk: 140, def: 26, spd: 92, ab: { n: 'Cabeza de Medusa', t: 'strike', s: 2.4 } },
    { id: 'tes',  n: 'Teseo',    r: 'hero', role: 'guerrero', ic: '🧶', hp: 580, atk: 136, def: 28, spd: 78, ab: { n: 'Hilo del Laberinto', t: 'strike', s: 2.2 } },
    { id: 'uli',  n: 'Ulises',   r: 'hero', role: 'guerrero', ic: '🏹', hp: 540, atk: 132, def: 24, spd: 86, ab: { n: 'El Caballo de Madera', t: 'aoe', s: 0.85 } },
    { id: 'ata',  n: 'Atalanta', r: 'hero', role: 'guerrero', ic: '🐆', hp: 500, atk: 150, def: 20, spd: 96, ab: { n: 'Carrera Veloz', t: 'strike', s: 2.6 } },
    { id: 'orf',  n: 'Orfeo',    r: 'hero', role: 'mago',     ic: '🎶', hp: 460, atk: 150, def: 18, spd: 80, ab: { n: 'Melodía Hipnótica', t: 'aoe', s: 0.9 } },
    { id: 'and',  n: 'Andrómeda', r: 'hero', role: 'soporte', ic: '🌟', hp: 520, atk: 100, def: 24, spd: 62, ab: { n: 'Vínculo Sagrado', t: 'heal', s: 1.8 } },
    { id: 'jas',  n: 'Jasón',    r: 'hero', role: 'guerrero', ic: '🐏', hp: 560, atk: 132, def: 26, spd: 76, ab: { n: 'Vellocino de Oro', t: 'buff', s: 1 } },
    { id: 'hec',  n: 'Héctor',     r: 'hero', role: 'guerrero', ic: '🏛️', hp: 720, atk: 158, def: 40, spd: 74, ab: { n: 'Lanza de Héctor', t: 'strike', s: 2.6 } },
    { id: 'ajx',  n: 'Ayax el Grande', r: 'hero', role: 'guerrero', ic: '🛡️', hp: 790, atk: 150, def: 48, spd: 56, ab: { n: 'Muro de Escudos', t: 'strike', s: 2.4 } },
    { id: 'dim',  n: 'Diomedes',    r: 'hero', role: 'guerrero', ic: '🔥', hp: 690, atk: 160, def: 34, spd: 86, ab: { n: 'Furia de Tideo', t: 'strike', s: 2.5 } },
    { id: 'men',  n: 'Menelao',     r: 'hero', role: 'guerrero', ic: '⚔️', hp: 640, atk: 138, def: 30, spd: 72, ab: { n: 'Espada de Esparta', t: 'strike', s: 2.2 } },
    { id: 'bel',  n: 'Belerofonte', r: 'hero', role: 'guerrero', ic: '🐴', hp: 660, atk: 148, def: 32, spd: 80, ab: { n: 'Domar a Pegaso', t: 'strike', s: 2.4 } },
    { id: 'ene',  n: 'Eneas',       r: 'hero', role: 'guerrero', ic: '🗡️', hp: 700, atk: 146, def: 34, spd: 70, ab: { n: 'Piedad de Anquises', t: 'strike', s: 2.2 } },
    { id: 'pele', n: 'Peleo',       r: 'hero', role: 'guerrero', ic: '⚔️', hp: 670, atk: 150, def: 32, spd: 76, ab: { n: 'Lanza de Asteropea', t: 'strike', s: 2.4 } },
    { id: 'mele', n: 'Meleagro',    r: 'hero', role: 'guerrero', ic: '🐗', hp: 650, atk: 152, def: 28, spd: 82, ab: { n: 'Jabalí de Calidón', t: 'strike', s: 2.6 } },
    { id: 'anti', n: 'Antíope',     r: 'hero', role: 'guerrero', ic: '🏹', hp: 620, atk: 150, def: 30, spd: 88, ab: { n: 'Flechas de la Reina', t: 'aoe', s: 0.8 } },
    { id: 'cent', n: 'Quirón',      r: 'hero', role: 'soporte',  ic: '🏹', hp: 640, atk: 110, def: 32, spd: 68, ab: { n: 'Enseñanza del Centauro', t: 'buff', s: 1 } },
    { id: 'sire', n: 'Sirena',      r: 'hero', role: 'mago',     ic: '🎵', hp: 500, atk: 150, def: 18, spd: 88, ab: { n: 'Canto Hipnótico', t: 'aoe', s: 0.9 } },
    { id: 'arp',  n: 'Arpía',       r: 'hero', role: 'guerrero', ic: '🦅', hp: 590, atk: 160, def: 26, spd: 94, ab: { n: 'Vuelo Rasante', t: 'strike', s: 2.5 } },
    { id: 'gor',  n: 'Gorgona',     r: 'hero', role: 'mago',     ic: '🐍', hp: 560, atk: 160, def: 20, spd: 74, ab: { n: 'Mirada Petrificante', t: 'strike', s: 2.8 } },
    { id: 'qui',  n: 'Filoctetes',  r: 'hero', role: 'guerrero', ic: '🏹', hp: 600, atk: 162, def: 24, spd: 80, ab: { n: 'Arco de Hércules', t: 'strike', s: 2.6 } },
    { id: 'fil',  n: 'Néstor',      r: 'hero', role: 'soporte',  ic: '🍷', hp: 560, atk: 100, def: 20, spd: 54, ab: { n: 'Consejo del Anciano', t: 'heal', s: 1.9 } },

    { id: 'zus',  n: 'Zeus',     r: 'god', role: 'mago',      ic: '⚡', hp: 560, atk: 210, def: 22, spd: 88, ab: { n: 'Rayo del Olimpo', t: 'aoe', s: 1.2 } },
    { id: 'pos',  n: 'Poseidón', r: 'god', role: 'mago',      ic: '🔱', hp: 640, atk: 195, def: 28, spd: 70, ab: { n: 'Terremoto Marino', t: 'aoe', s: 1.0 } },
    { id: 'had',  n: 'Hades',    r: 'god', role: 'mago',      ic: '💀', hp: 600, atk: 205, def: 26, spd: 74, ab: { n: 'Aliento del Inframundo', t: 'aoe', s: 1.1 } },
    { id: 'ate',  n: 'Atenea',   r: 'god', role: 'soporte',   ic: '🦉', hp: 560, atk: 120, def: 30, spd: 64, ab: { n: 'Sabiduría de Guerra', t: 'buff', s: 1 } },
    { id: 'ars',  n: 'Ares',     r: 'god', role: 'guerrero',  ic: '🔥', hp: 660, atk: 200, def: 36, spd: 82, ab: { n: 'Degüello de Guerra', t: 'strike', s: 2.8 } },
    { id: 'art',  n: 'Artemisa', r: 'god', role: 'guerrero',  ic: '🌙', hp: 580, atk: 190, def: 32, spd: 90, ab: { n: 'Lluvia de Flechas', t: 'aoe', s: 0.9 } },
    { id: 'hef',  n: 'Hefesto',  r: 'god', role: 'tanque',    ic: '⚒️', hp: 920, atk: 130, def: 60, spd: 46, ab: { n: 'Forja Celestial', t: 'shield', s: 1 } },
    { id: 'apo',  n: 'Apolo',    r: 'god', role: 'mago',      ic: '☀️', hp: 540, atk: 200, def: 20, spd: 86, ab: { n: 'Sol Abrasador', t: 'aoe', s: 1.1 } },
    { id: 'hera', n: 'Hera',      r: 'god', role: 'soporte',   ic: '🌟', hp: 600, atk: 120, def: 34, spd: 64, ab: { n: 'Favor Divino', t: 'heal', s: 1.6 } },
    { id: 'herm', n: 'Hermes',    r: 'god', role: 'guerrero',  ic: '🪽', hp: 540, atk: 170, def: 26, spd: 98, ab: { n: 'Vuelo del Mensajero', t: 'strike', s: 2.2 } },
    { id: 'dion', n: 'Dioniso',   r: 'god', role: 'mago',      ic: '🍷', hp: 560, atk: 185, def: 24, spd: 72, ab: { n: 'Éxtasis Báquico', t: 'aoe', s: 0.85 } },
    { id: 'dem',  n: 'Deméter',   r: 'god', role: 'soporte',   ic: '🌾', hp: 620, atk: 110, def: 32, spd: 56, ab: { n: 'Cosecha Abundante', t: 'heal', s: 1.7 } },
    { id: 'afr',  n: 'Afrodita',  r: 'god', role: 'soporte',   ic: '🌹', hp: 540, atk: 100, def: 22, spd: 70, ab: { n: 'Encanto Arrebatador', t: 'buff', s: 1 } },
    { id: 'eol',  n: 'Éolo',      r: 'god', role: 'mago',      ic: '🌬️', hp: 540, atk: 175, def: 22, spd: 80, ab: { n: 'Tormentas Encadenadas', t: 'aoe', s: 0.95 } },
    { id: 'eos',  n: 'Eos',       r: 'god', role: 'guerrero',  ic: '🌅', hp: 520, atk: 150, def: 24, spd: 84, ab: { n: 'Aurora Carmesí', t: 'strike', s: 1.9 } },
    { id: 'iris', n: 'Iris',      r: 'god', role: 'guerrero',  ic: '🌈', hp: 500, atk: 145, def: 22, spd: 92, ab: { n: 'Arcoíris Fugaz', t: 'strike', s: 2.0 } },
    { id: 'pan',  n: 'Pan',       r: 'god', role: 'guerrero',  ic: '🐐', hp: 640, atk: 185, def: 30, spd: 78, ab: { n: 'Pánico Silvestre', t: 'aoe', s: 0.85 } },
    { id: 'hekat',n: 'Hécate',    r: 'god', role: 'mago',      ic: '🌘', hp: 600, atk: 215, def: 24, spd: 76, ab: { n: 'Encrucijada Triforme', t: 'aoe', s: 1.1 } },
    { id: 'nike', n: 'Niké',      r: 'god', role: 'guerrero',  ic: '🏆', hp: 540, atk: 195, def: 26, spd: 96, ab: { n: 'Victoria Alada', t: 'strike', s: 2.6 } },
    { id: 'eris', n: 'Eris',      r: 'god', role: 'guerrero',  ic: '🍎', hp: 560, atk: 190, def: 26, spd: 86, ab: { n: 'Manzana de la Discordia', t: 'aoe', s: 0.9 } },
    { id: 'hebe', n: 'Hebe',      r: 'god', role: 'soporte',   ic: '🥂', hp: 580, atk: 110, def: 28, spd: 68, ab: { n: 'Néctar de Juventud', t: 'heal', s: 1.8 } },
    { id: 'hipno',n: 'Hipnos',    r: 'god', role: 'mago',      ic: '🌙', hp: 520, atk: 180, def: 22, spd: 80, ab: { n: 'Sueño Eterno', t: 'aoe', s: 0.9 } },

    { id: 'cro',  n: 'Cronos',    r: 'titan', role: 'mago',    ic: '⏳', hp: 760, atk: 260, def: 34, spd: 72, ab: { n: 'Devorador del Tiempo', t: 'aoe', s: 1.3 } },
    { id: 'oce',  n: 'Océano',    r: 'titan', role: 'tanque',  ic: '🌊', hp: 1150, atk: 150, def: 72, spd: 44, ab: { n: 'Abismo de las Aguas', t: 'shield', s: 1 } },
    { id: 'hip',  n: 'Hiperión',  r: 'titan', role: 'guerrero', ic: '🌅', hp: 820, atk: 250, def: 44, spd: 80, ab: { n: 'Fuego del Sol', t: 'strike', s: 3.0 } },
    { id: 'jap',  n: 'Jápeto',    r: 'titan', role: 'tanque',  ic: '⛓️', hp: 1080, atk: 140, def: 70, spd: 46, ab: { n: 'Cadenas Primordiales', t: 'shield', s: 1 } },
    { id: 'atl',  n: 'Atlas',     r: 'titan', role: 'tanque',  ic: '🌍', hp: 1250, atk: 170, def: 80, spd: 40, ab: { n: 'Sostén del Cielo', t: 'shield', s: 1 } },
    { id: 'cri',  n: 'Crío',      r: 'titan', role: 'guerrero', ic: '🦾', hp: 790, atk: 240, def: 40, spd: 84, ab: { n: 'Tormenta del Norte', t: 'aoe', s: 1.0 } },
    { id: 'gaya', n: 'Gea',       r: 'titan', role: 'tanque',   ic: '🌍', hp: 1400, atk: 190, def: 90, spd: 36, ab: { n: 'Alma de la Tierra', t: 'shield', s: 1 } },
    { id: 'our',  n: 'Urano',     r: 'titan', role: 'mago',     ic: '🌌', hp: 1100, atk: 270, def: 48, spd: 64, ab: { n: 'Bóveda Celestial', t: 'aoe', s: 1.2 } },
    { id: 'nix',  n: 'Nix',       r: 'titan', role: 'mago',     ic: '🌑', hp: 980, atk: 280, def: 44, spd: 70, ab: { n: 'Noche Eterna', t: 'aoe', s: 1.35 } },
    { id: 'ereb', n: 'Érebo',     r: 'titan', role: 'mago',     ic: '🌒', hp: 900, atk: 240, def: 40, spd: 66, ab: { n: 'Oscuridad Primordial', t: 'aoe', s: 1.1 } },
    { id: 'tar',  n: 'Tártaro',   r: 'titan', role: 'mago',     ic: '🕳️', hp: 1040, atk: 260, def: 46, spd: 60, ab: { n: 'Abismo sin Fondo', t: 'aoe', s: 1.25 } },
    { id: 'teth', n: 'Tetis',     r: 'titan', role: 'soporte',  ic: '🌊', hp: 880, atk: 170, def: 38, spd: 58, ab: { n: 'Corrientes del Mar', t: 'heal', s: 2.0 } },
    { id: 'thes', n: 'Temis',     r: 'titan', role: 'soporte',  ic: '⚖️', hp: 840, atk: 160, def: 36, spd: 54, ab: { n: 'Balanza del Destino', t: 'buff', s: 1.2 } },
    { id: 'mnem', n: 'Mnemósine', r: 'titan', role: 'soporte',  ic: '📜', hp: 820, atk: 150, def: 34, spd: 52, ab: { n: 'Memoria Ancestral', t: 'heal', s: 1.8 } },
    { id: 'rhoa', n: 'Réa',       r: 'titan', role: 'tanque',   ic: '👑', hp: 1250, atk: 180, def: 80, spd: 46, ab: { n: 'Madre de los Dioses', t: 'shield', s: 1 } },
    { id: 'phoeb', n: 'Febe',     r: 'titan', role: 'mago',     ic: '🌙', hp: 780, atk: 200, def: 30, spd: 68, ab: { n: 'Corona Lunar', t: 'aoe', s: 1.0 } },
    { id: 'prom', n: 'Prometeo',  r: 'titan', role: 'mago',     ic: '🔥', hp: 900, atk: 285, def: 40, spd: 76, ab: { n: 'Fuego Robado', t: 'aoe', s: 1.25 } },
    { id: 'epim', n: 'Epimeteo',  r: 'titan', role: 'soporte',  ic: '📦', hp: 860, atk: 180, def: 38, spd: 56, ab: { n: 'Don Tardío', t: 'buff', s: 1.1 } },
    { id: 'astra',n: 'Astreo',    r: 'titan', role: 'guerrero', ic: '🌟', hp: 900, atk: 275, def: 46, spd: 86, ab: { n: 'Estrella del Alba', t: 'strike', s: 3.1 } },
    { id: 'pers', n: 'Perses',    r: 'titan', role: 'guerrero', ic: '💫', hp: 850, atk: 265, def: 44, spd: 82, ab: { n: 'Violencia Estelar', t: 'strike', s: 3.0 } },
    { id: 'dion2',n: 'Dione',     r: 'titan', role: 'soporte',  ic: '🌺', hp: 1000, atk: 170, def: 40, spd: 50, ab: { n: 'Oráculo de Dodona', t: 'heal', s: 2.1 } },
    { id: 'ponto',n: 'Ponto',     r: 'titan', role: 'tanque',   ic: '🌊', hp: 1300, atk: 160, def: 78, spd: 42, ab: { n: 'Profundidades Marinas', t: 'shield', s: 1 } },

    { id: 'chaos', n: 'Caos',     r: 'primordial', role: 'mago',     ic: '🌌', hp: 1750, atk: 330, def: 58, spd: 70, ab: { n: 'Vacío Absoluto', t: 'aoe', s: 1.5 } },
    { id: 'eter',  n: 'Éter',     r: 'primordial', role: 'mago',     ic: '✨', hp: 1600, atk: 320, def: 56, spd: 84, ab: { n: 'Luz Primordial', t: 'aoe', s: 1.4 } },
    { id: 'hemer', n: 'Hemera',   r: 'primordial', role: 'soporte',  ic: '🌅', hp: 1400, atk: 200, def: 48, spd: 78, ab: { n: 'Alba Eterna', t: 'heal', s: 2.3 } },
    { id: 'eros',  n: 'Eros',     r: 'primordial', role: 'guerrero', ic: '❤️', hp: 1500, atk: 305, def: 50, spd: 92, ab: { n: 'Flecha Cósmica', t: 'strike', s: 3.4 } },
    { id: 'anank', n: 'Ananké',   r: 'primordial', role: 'mago',     ic: '⛓️', hp: 1700, atk: 295, def: 54, spd: 62, ab: { n: 'Inevitable Necesidad', t: 'aoe', s: 1.35 } },
    { id: 'tifon', n: 'Tifón',    r: 'primordial', role: 'guerrero', ic: '🌪️', hp: 1900, atk: 325, def: 70, spd: 74, ab: { n: 'Tormenta del Juicio', t: 'aoe', s: 1.3 } },
    { id: 'ofion', n: 'Ofión',    r: 'primordial', role: 'tanque',   ic: '🐍', hp: 2050, atk: 240, def: 84, spd: 48, ab: { n: 'Anillos del Olimpo', t: 'shield', s: 1 } },
    { id: 'eurin', n: 'Eurínome', r: 'primordial', role: 'soporte',  ic: '🎭', hp: 1550, atk: 210, def: 50, spd: 72, ab: { n: 'Danza del Destino', t: 'buff', s: 1.3 } },
    { id: 'fanes', n: 'Fanes',    r: 'primordial', role: 'mago',     ic: '🥚', hp: 1580, atk: 340, def: 52, spd: 88, ab: { n: 'Huevo Cósmico', t: 'aoe', s: 1.45 } },
    { id: 'ekidna',n: 'Équidna',  r: 'primordial', role: 'guerrero', ic: '🐲', hp: 1800, atk: 300, def: 62, spd: 76, ab: { n: 'Madre de Monstruos', t: 'aoe', s: 1.2 } }
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
    { n: 'La Horda de Esparta',        roster: ['hop', 'hop', 'mirm', 'mirm', 'gt'],     level: 5 },
    { n: 'Cazadores Legendarios',      roster: ['ata', 'orf', 'uli', 'per', 'and'],      level: 6 },
    { n: 'El Laberinto de Creta',      roster: ['tes', 'per', 'and', 'jas', 'ata'],      level: 7 },
    { n: 'Canto de las Sirenas',       roster: ['sire', 'gor', 'arp', 'cent', 'fil'],    level: 8 },
    { n: 'La Caza de Calidón',         roster: ['mele', 'ata', 'orf', 'jas', 'bel'],     level: 9 },
    { n: 'Furia del Olimpo',           roster: ['ars', 'art', 'apo', 'hef', 'ate'],      level: 10 },
    { n: 'Asalto al Olimpo',           roster: ['zus', 'pos', 'had', 'art', 'ate'],      level: 11 },
    { n: 'La Ascensión de Hera',       roster: ['hera', 'dion', 'dem', 'afr', 'eol'],    level: 12 },
    { n: 'Puertas del Inframundo',     roster: ['had', 'apo', 'ars', 'oce', 'cro'],      level: 13 },
    { n: 'Los Hijos de la Noche',      roster: ['nix', 'ereb', 'tar', 'thes', 'teth'],   level: 14 },
    { n: 'La Ruptura del Cielo',       roster: ['our', 'gaya', 'atl', 'rhoa', 'cri'],    level: 14 },
    { n: 'Cadenas Primordiales',       roster: ['jap', 'atl', 'cri', 'hip', 'oce'],      level: 15 },
    { n: 'Conspiración de los Titanes',roster: ['cro', 'hip', 'jap', 'atl', 'cri'],      level: 16 },
    { n: 'El Fuego Robado',            roster: ['prom', 'epim', 'dion2', 'astra', 'pers'], level: 17 },
    { n: 'La Titanomaquia',            roster: ['oce', 'cro', 'atl', 'hip', 'zus'],      level: 18 },
    { n: 'Cronos, el Devorador',       roster: ['cro', 'cro', 'atl', 'oce', 'hip'],      level: 19 },
    { n: 'Venganza de los Titanes',    roster: ['gaya', 'our', 'nix', 'ereb', 'tar'],    level: 20 },
    { n: 'El Despertar del Caos',      roster: ['chaos', 'eter', 'anank', 'eros', 'fanes'], level: 21 },
    { n: 'La Noche y el Día',          roster: ['nix', 'hemer', 'ereb', 'anank', 'eter'], level: 22 },
    { n: 'La Llegada de Tifón',        roster: ['tifon', 'ekidna', 'ofion', 'eurin', 'chaos'], level: 22 },
    { n: 'El Abismo sin Fondo',        roster: ['tifon', 'chaos', 'anank', 'fanes', 'eter'], level: 23 },
    { n: 'El Umbral del Eón',          roster: ['fanes', 'hemer', 'ofion', 'ekidna', 'anank'], level: 23 },
    { n: 'El Colapso de los Cielos',   roster: ['eter', 'anank', 'fanes', 'chaos', 'tifon'], level: 24 },
    { n: 'La Noche Definitiva',        roster: ['chaos', 'chaos', 'tifon', 'anank', 'hemer'], level: 25 },
    { n: 'El Juicio Primordial',       roster: ['anank', 'fanes', 'eter', 'eurin', 'ofion'], level: 25 },
    { n: 'Tifón, el Devorador de Dioses', roster: ['tifon', 'tifon', 'chaos', 'anank', 'eter'], level: 26 }
  ];
})();