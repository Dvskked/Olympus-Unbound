/**
 * ==== DATOS DEL JUEGO ====
 * Definiciones puras: cartas, rarezas, sobres, fases, entrenamiento, ingresos
 * y tecnologías. Las rarezas SIGUEN a la mitología: los héroes nunca superan
 * a los dioses, los dioses nunca superan a los titanes y los primordiales son
 * la cúspide absoluta del poder.
 * @module data
 */
(function () {
  'use strict';
  var OU = window.OU = window.OU || {};

  OU.CONST = {
    SAVE_KEY: 'olympus_unbound_v2',
    MAX_LEVEL: 100,
    MAX_TEAM: 5,
    MAX_TRAIN: 3,
    INITIAL_GOLD: 3000,
    INITIAL_GEMS: 50,
    START_CARDS: ['hop', 'pela', 'delf'],
    TRAIN_XP_NEED: 160,
    INCOME_BASE: 60,
    INCOME_PER_STAGE: 25,
    INCOME_CAP: 500000,
    SHOP_REFRESH_MS: 12 * 60 * 60 * 1000,
    SHOP_REFRESH_GEMS: 8,
    BOOST_MULT: 1.5,
    BOOST_MS: 12 * 60 * 60 * 1000,
    // Entrenamiento: ciclo de 12 h con stock y tope de mejoras por carta.
    TRAIN_CYCLE_MS: 12 * 60 * 60 * 1000,
    TRAIN_STOCK: 5,           // sesiones de entrenamiento por carta y ciclo
    TRAIN_MAX_SAME: 3,        // veces que puedes entrenar la misma carta a la vez
    TRAIN_MAX_UPS: 10,        // niveles máx. ganados por entrenamiento en 12 h
    TRAIN_UPS_CONSEC: 3,      // niveles máx. que saltan de una sola recogida
    // Recompensa diaria: gemas al entrar al juego (2 + racha, hasta 10).
    DAILY_GEMS_BASE: 2,
    DAILY_GEMS_CAP: 10,
    // Creador exclusivo: solo se desbloquea siguiendo estos perfiles.
    CREATOR_GITHUB: 'https://github.com/Dvskked',
    CREATOR_INSTAGRAM: 'https://www.instagram.com/_andres.nox/'
  };

  OU.RAR = {
    // Colores calibrados para ser legibles tanto en superficies claras
    // (texto, bordes) como en el globo que rodea el arte de cada carta.
    normal:     { name: 'Normal',     color: '#7d8798', glow: 'rgba(125,135,152,0.5)',       order: 0 },
    hero:       { name: 'Héroe',      color: '#2b83c9', glow: 'rgba(43,131,201,0.55)',       order: 1 },
    god:        { name: 'Dios',       color: '#c8891a', glow: 'rgba(200,137,26,0.55)',       order: 2 },
    titan:      { name: 'Titán',      color: '#8e3ae0', glow: 'rgba(142,58,224,0.6)',        order: 3 },
    primordial: { name: 'Primordial', color: '#3f7fd6', glow: 'rgba(84,150,220,0.85)',       order: 4 },
    creator:    { name: 'Creator',    color: '#e02020', glow: 'rgba(224,32,32,0.85)',        order: 5 }
  };

  OU.ROLES = { tanque: 'Tanque', guerrero: 'Guerrero', mago: 'Mago', soporte: 'Soporte' };

  // Jerarquía mitológica: cada rareza está SIEMPRE por encima de la anterior.
  // El Creador (creator) es exclusivo e inalcanzable: nunca aparece en sobres ni en el Bazar.
  OU.RARITY_FACTOR = { normal: 1, hero: 1.5, god: 2.0, titan: 2.6, primordial: 3.2, creator: 4.2 };

  /**
   * Tecnologías del Templo del Conocimiento: mejoras globales permanentes.
   * `id` referencia el campo `state.techs[id]`; `max` es el nivel máximo.
   * `base` es el oro base de investigación del primer nivel.
   */
  OU.TECHS = [
    { id: 'comercio',  n: 'Comercio',      ic: '🪙', base: 1200, max: 20, desc: '+5% de ingreso del Ágora por nivel' },
    { id: 'tactica',   n: 'Tácticas',      ic: '⚔️', base: 1500, max: 20, desc: '+3% de ATK de todas tus cartas por nivel' },
    { id: 'fortaleza', n: 'Fortaleza',     ic: '🛡️', base: 1500, max: 20, desc: '+3% de DEF de todas tus cartas por nivel' },
    { id: 'vitalidad', n: 'Vitalidad',     ic: '❤️', base: 1500, max: 20, desc: '+3% de HP de todas tus cartas por nivel' },
    { id: 'alquimia',  n: 'Alquimia',      ic: '🧪', base: 1700, max: 20, desc: '+4% de oro en recompensas de batalla por nivel' },
    { id: 'sabiduria', n: 'Sabiduría',     ic: '📚', base: 1600, max: 20, desc: '+4% de XP (batallas y entrenamiento) por nivel' },
    { id: 'augurio',   n: 'Augurio',       ic: '🔮', base: 2500, max: 10, desc: '+1.5% de suerte de rarezas altas en sobres por nivel' }
  ];

  /* ----------------------------------------------------------------------
   * Sobres. `w` es la probabilidad por rareza, `guarantee` fuerza al menos
   * `order` de rareza. Los sobres premium se pueden pagar con ORO (mucho) o
   * con gemas; `cost.gold` opcional y `cost.gems` opcional.
   * -------------------------------------------------------------------- */
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
      cls: 'olympus', name: 'Sobre Olimpo', cost: { gems: 40, gold: 25000 }, count: 5,
      desc: '5 cartas. Garantiza al menos 1 Héroe. Probabilidad de Dioses y Titanes.', guarantee: 1,
      odds: [['Normal', '22%'], ['Héroe', '64%'], ['Dios', '13.4%'], ['Titán', '0.6%']],
      w: { normal: .220, hero: .640, god: .134, titan: .006 }
    },
    divine: {
      cls: 'divine', name: 'Sobre Divino', cost: { gems: 90, gold: 70000 }, count: 6,
      desc: '6 cartas. Garantiza al menos 1 Dios. Las mejores probabilidades de Titanes.', guarantee: 2,
      odds: [['Normal', '12%'], ['Héroe', '53.4%'], ['Dios', '32.2%'], ['Titán', '2.4%']],
      w: { normal: .120, hero: .534, god: .322, titan: .024 }
    },
    cosmic: {
      cls: 'cosmic', name: 'Sobre Cósmico', cost: { gems: 500, gold: 1000000 }, count: 6,
      desc: '6 cartas. Garantiza al menos 1 Dios. Máximo 1 Titán y 1 Primordial por sobre.', badge: 'PRIMORDIAL', guarantee: 2,
      cap: { titan: 1, primordial: 1 },
      odds: [['Normal', '0.5%'], ['Héroe', '4.5%'], ['Dios', '25%'], ['Titán', '30%'], ['Primordial', '40%']],
      w: { normal: .005, hero: .045, god: .250, titan: .300, primordial: .400 }
    }
  };

  OU.TRAIN = {
    quick:   { name: 'Entrenamiento Rápido', mins: 1,   xp: 45,  gold: 90,   gems: 0 },
    normal:  { name: 'Entrenamiento Activo', mins: 3,   xp: 150, gold: 280,  gems: 0 },
    intense: { name: 'Entrenamiento Élite',  mins: 8,   xp: 480, gold: 840,  gems: 2 },
    epic:    { name: 'Ritual Legendario',    mins: 20,  xp: 1350, gold: 2400, gems: 5 },
    mythic:  { name: 'Ritual Primordial',    mins: 60,  xp: 4800, gold: 8000, gems: 12 }
  };

  /* ----------------------------------------------------------------------
   * Cartas. Campo `d` = descripción mitológica (leyenda).
   * El poder sigue a la mitología: héroes legendarios (Aquiles, Hércules,
   * Ayax) son la cima de su rango, pero NUNCA superan a los dioses.
   * -------------------------------------------------------------------- */
  OU.CARDS = [
    // ------------------------------------------------------- NORMALES (24)
    { id: 'hop',   n: 'Hoplita Espartano',   r: 'normal', role: 'guerrero', ic: '⚔️', hp: 440, atk: 96,  def: 20, spd: 72, d: 'Ciudadano soldado de Esparta, disciplinado y letal con la lanza y el escudo de bronce.', ab: { n: 'Lanza de Bronce', t: 'strike', s: 1.5 } },
    { id: 'gt',    n: 'Guardia Troyana',     r: 'normal', role: 'tanque',   ic: '🛡️', hp: 550, atk: 55,  def: 38, spd: 42, d: 'Defensor de las murallas de Troya, hierro y lealtad al servicio del rey Príamo.', ab: { n: 'Falange Defensiva', t: 'shield', s: 1 } },
    { id: 'arq',   n: 'Arquero Cretense',    r: 'normal', role: 'guerrero', ic: '🏹', hp: 380, atk: 108, def: 14, spd: 84, d: 'Tirador nato de la isla de Creta, famoso por su puntería de flecha certera.', ab: { n: 'Flecha Certera', t: 'strike', s: 1.8 } },
    { id: 'pela',  n: 'Peltasta Tracio',     r: 'normal', role: 'guerrero', ic: '🪓', hp: 410, atk: 92,  def: 16, spd: 75, d: 'Guerrero ágil de Tracia, armado de jabalinas y un escudo en media luna.', ab: { n: 'Jabalina Letal', t: 'strike', s: 1.5 } },
    { id: 'sat',   n: 'Sátiro Arremetedor',  r: 'normal', role: 'guerrero', ic: '🐐', hp: 360, atk: 100, def: 12, spd: 88, d: 'Criatura salvaje de los bosques, ebria de música y de furia.', ab: { n: 'Embestida Salvaje', t: 'strike', s: 2.0 } },
    { id: 'delf',  n: 'Sacerdotisa de Delfos', r: 'normal', role: 'soporte', ic: '🔮', hp: 420, atk: 72, def: 16, spd: 58, d: 'Voz del oráculo y canal de Apolo, presagia el destino a quien la escuche.', ab: { n: 'Presagio Curativo', t: 'heal', s: 1.6 } },
    { id: 'gc',    n: 'Guardia Cretense',    r: 'normal', role: 'tanque',   ic: '🏺', hp: 520, atk: 58,  def: 34, spd: 44, d: 'Soldado del rey Minos, guarda laberintos y palacios de la isla de Creta.', ab: { n: 'Escudo de Cobre', t: 'shield', s: 1 } },
    { id: 'mirm',  n: 'Fiel Mirmidón',       r: 'normal', role: 'guerrero', ic: '🗡️', hp: 430, atk: 90,  def: 18, spd: 70, d: 'Leal soldado de Aquiles: las hormigas de Egina se volvieron guerreros.', ab: { n: 'Estocada Mirmidón', t: 'strike', s: 1.5 } },
    { id: 'ant',   n: 'Antíloco',            r: 'normal', role: 'guerrero', ic: '🗡️', hp: 435, atk: 96,  def: 18, spd: 78, d: 'Hijo de Néstor, veloz y valiente entre las filas aqueas.', ab: { n: 'Furia del Ímpetu', t: 'strike', s: 1.6 } },
    { id: 'pal',   n: 'Palamedes',           r: 'normal', role: 'soporte',  ic: '🧠', hp: 400, atk: 70,  def: 20, spd: 60, d: 'Sabio griego, inventó las letras y alzó mil ingenios de guerra.', ab: { n: 'Estrategia Delta', t: 'buff', s: 0.8 } },
    { id: 'cas',   n: 'Casandra',            r: 'normal', role: 'mago',     ic: '🔮', hp: 360, atk: 84,  def: 12, spd: 74, d: 'Princesa troyana profetisa, condenada a que nadie crea sus augurios.', ab: { n: 'Voz Profética', t: 'aoe', s: 0.55 } },
    { id: 'tel',   n: 'Telémaco',            r: 'normal', role: 'guerrero', ic: '🗡️', hp: 400, atk: 88,  def: 16, spd: 76, d: 'Hijo de Ulises, creció buscando al padre y forjó su propio acero.', ab: { n: 'Estoque del Heredero', t: 'strike', s: 1.4 } },
    { id: 'lan',   n: 'Laertes',             r: 'normal', role: 'guerrero', ic: '⚔️', hp: 425, atk: 84,  def: 18, spd: 56, d: 'Anciano rey de Ítaca y padre de Ulises, aún con fuerza en el brazo.', ab: { n: 'Regreso del Anciano', t: 'strike', s: 1.35 } },
    { id: 'pirit', n: 'Pirítoo',             r: 'normal', role: 'guerrero', ic: '🗡️', hp: 450, atk: 92,  def: 19, spd: 66, d: 'Rey de los lápitas, amigo de Teseo y el atrevimiento hecho carne.', ab: { n: 'Golpe del Lapita', t: 'strike', s: 1.5 } },
    { id: 'pod',   n: 'Podalirio',           r: 'normal', role: 'soporte',  ic: '⚕️', hp: 380, atk: 60,  def: 14, spd: 54, d: 'Médico aqueo que alivia las heridas de guerra entre lanzas y gritos.', ab: { n: 'Cura de Asclepio', t: 'heal', s: 1.3 } },
    { id: 'mac',   n: 'Macaón',              r: 'normal', role: 'soporte',  ic: '🩺', hp: 395, atk: 62,  def: 15, spd: 52, d: 'Hijo del sanador divino Asclepio, sus manos salvan vidas en pleno fragor.', ab: { n: 'Cirugía de Guerra', t: 'heal', s: 1.2 } },
    { id: 'prt',   n: 'Protesilao',          r: 'normal', role: 'guerrero', ic: '🛡️', hp: 420, atk: 94,  def: 16, spd: 72, d: 'El primer aqueo en saltar a suelo troyano... y el primero en caer.', ab: { n: 'Primer Salto', t: 'strike', s: 1.6 } },
    { id: 'dri',   n: 'Dríade del Roble',    r: 'normal', role: 'soporte',  ic: '🌳', hp: 390, atk: 56,  def: 16, spd: 48, d: 'Espíritu de los árboles que cura y protege el bosque sagrado.', ab: { n: 'Susurro del Bosque', t: 'heal', s: 1.1 } },
    { id: 'teu',   n: 'Teucro el Arquero',   r: 'normal', role: 'guerrero', ic: '🏹', hp: 415, atk: 104, def: 15, spd: 82, d: 'Hijo del rey Telamón, el mejor arquero de Grecia, flecha tras flecha.', ab: { n: 'Flecha del Padre Escudo', t: 'strike', s: 1.7 } },
    { id: 'frix',  n: 'Frixo',               r: 'normal', role: 'guerrero', ic: '🐏', hp: 430, atk: 96,  def: 17, spd: 74, d: 'Joven héroe que cruzó el mar a lomos del carnero del vellocino dorado.', ab: { n: 'Vellocino Alado', t: 'strike', s: 1.55 } },
    { id: 'hele',  n: 'Hele la Náufraga',    r: 'normal', role: 'soporte',  ic: '🌊', hp: 405, atk: 66,  def: 16, spd: 56, d: 'Hermana de Frixo, cayó al mar que hoy lleva su nombre: el Helesponto.', ab: { n: 'Viento del Helesponto', t: 'heal', s: 1.35 } },
    { id: 'teocl', n: 'Teoclímeno',          r: 'normal', role: 'mago',     ic: '👁️', hp: 375, atk: 92,  def: 12, spd: 72, d: 'Adivino errante cuyos ojos ven la vida y la muerte por igual.', ab: { n: 'Presagio Errante', t: 'aoe', s: 0.5 } },
    { id: 'ido',   n: 'Idomeneo',            r: 'normal', role: 'guerrero', ic: '🗡️', hp: 455, atk: 98,  def: 19, spd: 68, d: 'Rey de Creta entre los aqueos, su lanza luce en las playas de Troya.', ab: { n: 'Pendón de Creta', t: 'strike', s: 1.5 } },
    { id: 'polix', n: 'Pólux',               r: 'normal', role: 'guerrero', ic: '👊', hp: 470, atk: 94,  def: 20, spd: 66, d: 'Gemelo inmortal de Cástor, su puño de boxeador nunca conoció derrota.', ab: { n: 'Puño de Pólux', t: 'strike', s: 1.5 } },

    // ------------------------------------------------------- HÉROES (24)
    { id: 'aqu',   n: 'Aquiles',              r: 'hero', role: 'guerrero', ic: '⚔️', hp: 720, atk: 172, def: 40, spd: 88, d: 'El mayor guerrero de Grecia, semidiós de talón vulnerable y furia incomparable.', ab: { n: 'Furia del Talón', t: 'strike', s: 2.6 } },
    { id: 'her',   n: 'Hércules',             r: 'hero', role: 'guerrero', ic: '🦁', hp: 800, atk: 170, def: 44, spd: 70, d: 'Hijo de Zeus, fuerza divina que completó los doce trabajos.', ab: { n: 'Mano del León de Nemea', t: 'strike', s: 3.0 } },
    { id: 'per',   n: 'Perseo',               r: 'hero', role: 'guerrero', ic: '🗡️', hp: 560, atk: 140, def: 26, spd: 92, d: 'Matador de Medusa, voló con sandalias aladas y segó con la hoz de Cronos.', ab: { n: 'Cabeza de Medusa', t: 'strike', s: 2.4 } },
    { id: 'tes',   n: 'Teseo',                r: 'hero', role: 'guerrero', ic: '🧶', hp: 580, atk: 136, def: 28, spd: 78, d: 'Héroe de Atenas, vencedor del Minotauro y unificador de la ciudad.', ab: { n: 'Hilo del Laberinto', t: 'strike', s: 2.2 } },
    { id: 'uli',   n: 'Ulises',               r: 'hero', role: 'guerrero', ic: '🏹', hp: 540, atk: 132, def: 24, spd: 86, d: 'Rey de Ítaca, la astucia personificada que con su ingenio venció a Troya.', ab: { n: 'El Caballo de Madera', t: 'aoe', s: 0.85 } },
    { id: 'ata',   n: 'Atalanta',             r: 'hero', role: 'guerrero', ic: '🐆', hp: 500, atk: 150, def: 20, spd: 96, d: 'Cazadora incomparable, más veloz que el viento y los pretendientes.', ab: { n: 'Carrera Veloz', t: 'strike', s: 2.6 } },
    { id: 'orf',   n: 'Orfeo',                r: 'hero', role: 'mago',     ic: '🎶', hp: 460, atk: 150, def: 18, spd: 80, d: 'Músico cuya lira conmueve a dioses, bestias y al mismísimo inframundo.', ab: { n: 'Melodía Hipnótica', t: 'aoe', s: 0.9 } },
    { id: 'and',   n: 'Andrómeda',            r: 'hero', role: 'soporte',  ic: '🌟', hp: 520, atk: 100, def: 24, spd: 62, d: 'Princesa etíope rescatada del monstruo marino, convertida en constelación.', ab: { n: 'Vínculo Sagrado', t: 'heal', s: 1.8 } },
    { id: 'jas',   n: 'Jasón',                r: 'hero', role: 'guerrero', ic: '🐏', hp: 560, atk: 132, def: 26, spd: 76, d: 'Líder de los argonautas, conquistó el vellocino de oro en la lejana Cólquide.', ab: { n: 'Vellocino de Oro', t: 'buff', s: 1 } },
    { id: 'hec',   n: 'Héctor',               r: 'hero', role: 'guerrero', ic: '🏛️', hp: 720, atk: 160, def: 42, spd: 74, d: 'Príncipe de Troya, el mejor defensor de su ciudad y paladín del honor.', ab: { n: 'Lanza de Héctor', t: 'strike', s: 2.6 } },
    { id: 'ajx',   n: 'Ayax el Grande',       r: 'hero', role: 'guerrero', ic: '🛡️', hp: 740, atk: 152, def: 46, spd: 56, d: 'Muro de escudos de Grecia, de fuerza colosal y alma demasiado orgullosa.', ab: { n: 'Muro de Escudos', t: 'strike', s: 2.4 } },
    { id: 'dim',   n: 'Diomedes',             r: 'hero', role: 'guerrero', ic: '🔥', hp: 690, atk: 160, def: 34, spd: 86, d: 'El domador de corceles que hirió a Afrodita y a Ares en plena guerra.', ab: { n: 'Furia de Tideo', t: 'strike', s: 2.5 } },
    { id: 'men',   n: 'Menelao',              r: 'hero', role: 'guerrero', ic: '⚔️', hp: 640, atk: 138, def: 30, spd: 72, d: 'Rey de Esparta y esposo de Helena, su espada partió rumbo a Troya.', ab: { n: 'Espada de Esparta', t: 'strike', s: 2.2 } },
    { id: 'bel',   n: 'Belerofonte',          r: 'hero', role: 'guerrero', ic: '🐴', hp: 660, atk: 148, def: 32, spd: 80, d: 'Domador de Pegaso y vencedor de la Quimera, mortal demasiado atrevido.', ab: { n: 'Domar a Pegaso', t: 'strike', s: 2.4 } },
    { id: 'ene',   n: 'Eneas',                r: 'hero', role: 'guerrero', ic: '🗡️', hp: 700, atk: 146, def: 34, spd: 70, d: 'Príncipe troyano piadoso, llevó a su pueblo hacia el futuro de Roma.', ab: { n: 'Piedad de Anquises', t: 'strike', s: 2.2 } },
    { id: 'pele',  n: 'Peleo',                r: 'hero', role: 'guerrero', ic: '⚔️', hp: 670, atk: 150, def: 32, spd: 76, d: 'Padre de Aquiles y cazador de la jabalina de Calidón.', ab: { n: 'Lanza de Asteropea', t: 'strike', s: 2.4 } },
    { id: 'mele',  n: 'Meleagro',             r: 'hero', role: 'guerrero', ic: '🐗', hp: 650, atk: 152, def: 28, spd: 82, d: 'Héroe de la jabalina de Calidón, cuya vida ardía en una astilla del fuego.', ab: { n: 'Jabalí de Calidón', t: 'strike', s: 2.6 } },
    { id: 'anti',  n: 'Antíope',              r: 'hero', role: 'guerrero', ic: '🏹', hp: 620, atk: 150, def: 30, spd: 88, d: 'Reina amazona de arco infalible y escudo de hierro.', ab: { n: 'Flechas de la Reina', t: 'aoe', s: 0.8 } },
    { id: 'cent',  n: 'Quirón',               r: 'hero', role: 'soporte',  ic: '🏹', hp: 640, atk: 110, def: 32, spd: 68, d: 'El centauro sabio, maestro de héroes y herbolario inmortal.', ab: { n: 'Enseñanza del Centauro', t: 'buff', s: 1 } },
    { id: 'sire',  n: 'Sirena',               r: 'hero', role: 'mago',     ic: '🎵', hp: 500, atk: 150, def: 18, spd: 88, d: 'Cantora del mar que hechiza a los marineros hacia su propio final.', ab: { n: 'Canto Hipnótico', t: 'aoe', s: 0.9 } },
    { id: 'arp',   n: 'Arpía',                r: 'hero', role: 'guerrero', ic: '🦅', hp: 590, atk: 160, def: 26, spd: 94, d: 'Alas negras y garras que arrebatan comida, tesoros y almas.', ab: { n: 'Vuelo Rasante', t: 'strike', s: 2.5 } },
    { id: 'gor',   n: 'Gorgona',              r: 'hero', role: 'mago',     ic: '🐍', hp: 560, atk: 160, def: 20, spd: 74, d: 'Cabellera de serpientes que petrifica con la mirada, terror de mortales.', ab: { n: 'Mirada Petrificante', t: 'strike', s: 2.8 } },
    { id: 'qui',   n: 'Filoctetes',           r: 'hero', role: 'guerrero', ic: '🏹', hp: 620, atk: 164, def: 24, spd: 80, d: 'Guardián del arco de Hércules, marcado por la mordedura sin cura.', ab: { n: 'Arco de Hércules', t: 'strike', s: 2.6 } },
    { id: 'fil',   n: 'Néstor',               r: 'hero', role: 'soporte',  ic: '🍷', hp: 560, atk: 100, def: 20, spd: 54, d: 'Sabio anciano rey de Pilos, consejero eterno de los aqueos.', ab: { n: 'Consejo del Anciano', t: 'heal', s: 1.9 } },

    // ------------------------------------------------------- DIOSES (22)
    { id: 'zus',   n: 'Zeus',        r: 'god', role: 'mago',      ic: '⚡', hp: 560, atk: 210, def: 22, spd: 88, d: 'Rey del Olimpo, señor del trueno y el relámpago, padre de dioses y hombres.', ab: { n: 'Rayo del Olimpo', t: 'aoe', s: 1.2 } },
    { id: 'pos',   n: 'Poseidón',    r: 'god', role: 'mago',      ic: '🔱', hp: 640, atk: 195, def: 28, spd: 70, d: 'Dios de los mares y los terremotos, furia encarnada en su tridente.', ab: { n: 'Terremoto Marino', t: 'aoe', s: 1.0 } },
    { id: 'had',   n: 'Hades',       r: 'god', role: 'mago',      ic: '💀', hp: 600, atk: 205, def: 26, spd: 74, d: 'Dios del inframundo, rey de los muertos y guardián de los tesoros de la tierra.', ab: { n: 'Aliento del Inframundo', t: 'aoe', s: 1.1 } },
    { id: 'ate',   n: 'Atenea',      r: 'god', role: 'soporte',   ic: '🦉', hp: 560, atk: 120, def: 30, spd: 64, d: 'Diosa de la sabiduría y la estrategia, nacida armada de la cabeza de Zeus.', ab: { n: 'Sabiduría de Guerra', t: 'buff', s: 1 } },
    { id: 'ars',   n: 'Ares',        r: 'god', role: 'guerrero',  ic: '🔥', hp: 660, atk: 200, def: 36, spd: 82, d: 'Dios de la guerra, la sed de batalla y la carnicería encarnada.', ab: { n: 'Degüello de Guerra', t: 'strike', s: 2.8 } },
    { id: 'art',   n: 'Artemisa',    r: 'god', role: 'guerrero',  ic: '🌙', hp: 580, atk: 190, def: 32, spd: 90, d: 'Diosa de la caza y la luna, flecha plateada y pureza salvaje.', ab: { n: 'Lluvia de Flechas', t: 'aoe', s: 0.9 } },
    { id: 'hef',   n: 'Hefesto',     r: 'god', role: 'tanque',    ic: '⚒️', hp: 920, atk: 130, def: 60, spd: 46, d: 'Dios del fuego y la forja, artífice de las armas y tronos de los dioses.', ab: { n: 'Forja Celestial', t: 'shield', s: 1 } },
    { id: 'apo',   n: 'Apolo',       r: 'god', role: 'mago',      ic: '☀️', hp: 540, atk: 200, def: 20, spd: 86, d: 'Dios de la luz, la música y la profecía, el mismísimo sol del Olimpo.', ab: { n: 'Sol Abrasador', t: 'aoe', s: 1.1 } },
    { id: 'hera',  n: 'Hera',        r: 'god', role: 'soporte',   ic: '🌟', hp: 600, atk: 120, def: 34, spd: 64, d: 'Reina de los dioses, diosa del matrimonio y esposa de Zeus.', ab: { n: 'Favor Divino', t: 'heal', s: 1.6 } },
    { id: 'herm',  n: 'Hermes',      r: 'god', role: 'guerrero',  ic: '🪽', hp: 540, atk: 170, def: 26, spd: 98, d: 'Mensajero alado, patrón de viajeros, ladrones y comerciantes.', ab: { n: 'Vuelo del Mensajero', t: 'strike', s: 2.2 } },
    { id: 'dion',  n: 'Dioniso',     r: 'god', role: 'mago',      ic: '🍷', hp: 560, atk: 185, def: 24, spd: 72, d: 'Dios del vino y el éxtasis, alegría desatada y locura festiva.', ab: { n: 'Éxtasis Báquico', t: 'aoe', s: 0.85 } },
    { id: 'dem',   n: 'Deméter',     r: 'god', role: 'soporte',   ic: '🌾', hp: 620, atk: 110, def: 32, spd: 56, d: 'Diosa de la cosecha, madre tierra de granos, frutos y estaciones.', ab: { n: 'Cosecha Abundante', t: 'heal', s: 1.7 } },
    { id: 'afr',   n: 'Afrodita',    r: 'god', role: 'soporte',   ic: '🌹', hp: 540, atk: 100, def: 22, spd: 70, d: 'Diosa del amor y la belleza, nacida de la espuma del mar.', ab: { n: 'Encanto Arrebatador', t: 'buff', s: 1 } },
    { id: 'eol',   n: 'Éolo',        r: 'god', role: 'mago',      ic: '🌬️', hp: 540, atk: 175, def: 22, spd: 80, d: 'Señor de los vientos, guardián de las tormentas en su fortaleza flotante.', ab: { n: 'Tormentas Encadenadas', t: 'aoe', s: 0.95 } },
    { id: 'eos',   n: 'Eos',         r: 'god', role: 'guerrero',  ic: '🌅', hp: 520, atk: 150, def: 24, spd: 84, d: 'La Aurora, diosa del amanecer rosado que abre las puertas del día.', ab: { n: 'Aurora Carmesí', t: 'strike', s: 1.9 } },
    { id: 'iris',  n: 'Iris',        r: 'god', role: 'guerrero',  ic: '🌈', hp: 500, atk: 145, def: 22, spd: 92, d: 'Mensajera del arcoíris, el puente viviente entre el cielo y la tierra.', ab: { n: 'Arcoíris Fugaz', t: 'strike', s: 2.0 } },
    { id: 'pan',   n: 'Pan',         r: 'god', role: 'guerrero',  ic: '🐐', hp: 640, atk: 185, def: 30, spd: 78, d: 'Dios de los bosques y del pánico, flauta de caña y manada de cabras.', ab: { n: 'Pánico Silvestre', t: 'aoe', s: 0.85 } },
    { id: 'hekat', n: 'Hécate',      r: 'god', role: 'mago',      ic: '🌘', hp: 600, atk: 215, def: 24, spd: 76, d: 'Diosa de la magia y las encrucijadas, con tres rostros vigila la noche.', ab: { n: 'Encrucijada Triforme', t: 'aoe', s: 1.1 } },
    { id: 'nike',  n: 'Niké',        r: 'god', role: 'guerrero',  ic: '🏆', hp: 540, atk: 195, def: 26, spd: 96, d: 'La Victoria alada, corona a los vencedores del campo de batalla.', ab: { n: 'Victoria Alada', t: 'strike', s: 2.6 } },
    { id: 'eris',  n: 'Eris',        r: 'god', role: 'guerrero',  ic: '🍎', hp: 560, atk: 190, def: 26, spd: 86, d: 'Diosa de la discordia, su manzana dorada encendió la guerra de Troya.', ab: { n: 'Manzana de la Discordia', t: 'aoe', s: 0.9 } },
    { id: 'hebe',  n: 'Hebe',        r: 'god', role: 'soporte',   ic: '🥂', hp: 580, atk: 110, def: 28, spd: 68, d: 'Diosa de la juventud, escanciadora del néctar del Olimpo.', ab: { n: 'Néctar de Juventud', t: 'heal', s: 1.8 } },
    { id: 'hipno', n: 'Hipnos',      r: 'god', role: 'mago',      ic: '🌙', hp: 520, atk: 180, def: 22, spd: 80, d: 'Dios del sueño, hermano de la muerte y aliento quieto de la noche.', ab: { n: 'Sueño Eterno', t: 'aoe', s: 0.9 } },

    // ------------------------------------------------------- TITANES (20)
    { id: 'cro',   n: 'Cronos',      r: 'titan', role: 'mago',    ic: '⏳', hp: 760, atk: 260, def: 34, spd: 72, d: 'Rey de los titanes, hijo del cielo que devoró a sus hijos para conservar el trono.', ab: { n: 'Devorador del Tiempo', t: 'aoe', s: 1.3 } },
    { id: 'oce',   n: 'Océano',      r: 'titan', role: 'tanque',  ic: '🌊', hp: 1150, atk: 150, def: 72, spd: 44, d: 'El océano primordial que rodea el mundo, titán de las aguas infinitas.', ab: { n: 'Abismo de las Aguas', t: 'shield', s: 1 } },
    { id: 'hip',   n: 'Hiperión',    r: 'titan', role: 'guerrero', ic: '🌅', hp: 820, atk: 250, def: 44, spd: 80, d: 'Titán de la luz, padre del Sol, de la Luna y de la Aurora.', ab: { n: 'Fuego del Sol', t: 'strike', s: 3.0 } },
    { id: 'jap',   n: 'Jápeto',      r: 'titan', role: 'tanque',  ic: '⛓️', hp: 1080, atk: 140, def: 70, spd: 46, d: 'Titán de las cadenas, padre de Prometeo y de Atlas.', ab: { n: 'Cadenas Primordiales', t: 'shield', s: 1 } },
    { id: 'atl',   n: 'Atlas',       r: 'titan', role: 'tanque',  ic: '🌍', hp: 1250, atk: 170, def: 80, spd: 40, d: 'Condenado a sostener el cielo sobre sus hombros por toda la eternidad.', ab: { n: 'Sostén del Cielo', t: 'shield', s: 1 } },
    { id: 'cri',   n: 'Crío',        r: 'titan', role: 'guerrero', ic: '🦾', hp: 790, atk: 240, def: 40, spd: 84, d: 'Titán del tormentoso norte, abuelo de los vientos de la travesía.', ab: { n: 'Tormenta del Norte', t: 'aoe', s: 1.0 } },
    { id: 'gaya',  n: 'Gea',         r: 'primordial', role: 'tanque',  ic: '🌍', hp: 1400, atk: 190, def: 90, spd: 36, d: 'La Tierra madre, primera fuerza de la creación y abuela de todos los dioses.', ab: { n: 'Alma de la Tierra', t: 'shield', s: 1 } },
    { id: 'our',   n: 'Urano',       r: 'primordial', role: 'mago',    ic: '🌌', hp: 1100, atk: 270, def: 48, spd: 64, d: 'El cielo estrellado, primer soberano del universo antes de Cronos.', ab: { n: 'Bóveda Celestial', t: 'aoe', s: 1.2 } },
    { id: 'nix',   n: 'Nix',         r: 'primordial', role: 'mago',    ic: '🌑', hp: 980, atk: 280, def: 44, spd: 70, d: 'La Noche primordial, madre del sueño, de la muerte y del destino.', ab: { n: 'Noche Eterna', t: 'aoe', s: 1.35 } },
    { id: 'ereb',  n: 'Érebo',       r: 'primordial', role: 'mago',    ic: '🌒', hp: 900, atk: 240, def: 40, spd: 66, d: 'La Oscuridad primordial, del seno de la sombra surgió toda luz.', ab: { n: 'Oscuridad Primordial', t: 'aoe', s: 1.1 } },
    { id: 'tar',   n: 'Tártaro',     r: 'primordial', role: 'mago',    ic: '🕳️', hp: 1040, atk: 260, def: 46, spd: 60, d: 'El abismo sin fondo, prisión eterna de titanes y monstruos.', ab: { n: 'Abismo sin Fondo', t: 'aoe', s: 1.25 } },
    { id: 'teth',  n: 'Tetis',       r: 'titan', role: 'soporte', ic: '🌊', hp: 880, atk: 170, def: 38, spd: 58, d: 'Titánide de las corrientes, nodriza de las aguas del mundo.', ab: { n: 'Corrientes del Mar', t: 'heal', s: 2.0 } },
    { id: 'thes',  n: 'Temis',       r: 'titan', role: 'soporte', ic: '⚖️', hp: 840, atk: 160, def: 36, spd: 54, d: 'Titánide de la justicia y el orden divino, balanza del destino.', ab: { n: 'Balanza del Destino', t: 'buff', s: 1.2 } },
    { id: 'mnem',  n: 'Mnemósine',   r: 'titan', role: 'soporte', ic: '📜', hp: 820, atk: 150, def: 34, spd: 52, d: 'Titánide de la memoria, madre de las nueve musas.', ab: { n: 'Memoria Ancestral', t: 'heal', s: 1.8 } },
    { id: 'rhoa',  n: 'Réa',         r: 'titan', role: 'tanque',  ic: '👑', hp: 1250, atk: 180, def: 80, spd: 46, d: 'Madre de los dioses olímpicos, salvó a Zeus del vientre de Cronos.', ab: { n: 'Madre de los Dioses', t: 'shield', s: 1 } },
    { id: 'phoeb', n: 'Febe',        r: 'titan', role: 'mago',    ic: '🌙', hp: 780, atk: 200, def: 30, spd: 68, d: 'Titánide de la corona lunar y del saber de los oráculos.', ab: { n: 'Corona Lunar', t: 'aoe', s: 1.0 } },
    { id: 'prom',  n: 'Prometeo',    r: 'titan', role: 'mago',    ic: '🔥', hp: 900, atk: 285, def: 40, spd: 76, d: 'El titán que robó el fuego divino para la humanidad, señor de la previsión.', ab: { n: 'Fuego Robado', t: 'aoe', s: 1.25 } },
    { id: 'epim',  n: 'Epimeteo',    r: 'titan', role: 'soporte', ic: '📦', hp: 860, atk: 180, def: 38, spd: 56, d: 'El que piensa después, esposo de Pandora y dueño de la caja fatal.', ab: { n: 'Don Tardío', t: 'buff', s: 1.1 } },
    { id: 'astra', n: 'Astreo',      r: 'titan', role: 'guerrero', ic: '🌟', hp: 900, atk: 275, def: 46, spd: 86, d: 'Titán de los astros y las constelaciones, padre de los vientos.', ab: { n: 'Estrella del Alba', t: 'strike', s: 3.1 } },
    { id: 'pers',  n: 'Perses',      r: 'titan', role: 'guerrero', ic: '💫', hp: 850, atk: 265, def: 44, spd: 82, d: 'Titán de la destrucción y la violencia estelar.', ab: { n: 'Violencia Estelar', t: 'strike', s: 3.0 } },
    { id: 'dion2', n: 'Dione',       r: 'titan', role: 'soporte', ic: '🌺', hp: 1000, atk: 170, def: 40, spd: 50, d: 'Titánide del oráculo de Dodona, mar divina y madre de Afrodita.', ab: { n: 'Oráculo de Dodona', t: 'heal', s: 2.1 } },
    { id: 'ponto', n: 'Ponto',       r: 'primordial', role: 'tanque',  ic: '🌊', hp: 1300, atk: 160, def: 78, spd: 42, d: 'El mar primordial, padre de todas las profundidades marinas.', ab: { n: 'Profundidades Marinas', t: 'shield', s: 1 } },

    // ------------------------------------------------------- PRIMORDIALES (12)
    { id: 'chaos', n: 'Caos',        r: 'primordial', role: 'mago',     ic: '🌌', hp: 1750, atk: 330, def: 58, spd: 70, d: 'El vacío primigenio, principio de todo lo que existe y existirá.', ab: { n: 'Vacío Absoluto', t: 'aoe', s: 1.5 } },
    { id: 'eter',  n: 'Éter',        r: 'primordial', role: 'mago',     ic: '✨', hp: 1600, atk: 320, def: 56, spd: 84, d: 'La luz de arriba, el cielo superior donde respiran los inmortales.', ab: { n: 'Luz Primordial', t: 'aoe', s: 1.4 } },
    { id: 'hemer', n: 'Hemera',      r: 'primordial', role: 'soporte',  ic: '🌅', hp: 1400, atk: 200, def: 48, spd: 78, d: 'El Día encarnado, hija de la Noche y de la Oscuridad, luz que todo lo ve.', ab: { n: 'Alba Eterna', t: 'heal', s: 2.3 } },
    { id: 'eros',  n: 'Eros',        r: 'primordial', role: 'guerrero', ic: '❤️', hp: 1500, atk: 305, def: 50, spd: 92, d: 'El Amor primordial, fuerza creadora que unió a la primera pareja.', ab: { n: 'Flecha Cósmica', t: 'strike', s: 3.4 } },
    { id: 'anank', n: 'Ananké',      r: 'primordial', role: 'mago',     ic: '⛓️', hp: 1700, atk: 295, def: 54, spd: 62, d: 'La Necesidad inevitable, ciclo eterno al que hasta los dioses obedecen.', ab: { n: 'Inevitable Necesidad', t: 'aoe', s: 1.35 } },
    { id: 'tifon', n: 'Tifón',       r: 'titan', role: 'guerrero', ic: '🌪️', hp: 1900, atk: 325, def: 70, spd: 74, d: 'El monstruo de las tormentas, hijo de Gea y Tártaro, terror de los dioses.', ab: { n: 'Tormenta del Juicio', t: 'aoe', s: 1.3 } },
    { id: 'ofion', n: 'Ofión',       r: 'titan', role: 'tanque',   ic: '🐍', hp: 2050, atk: 240, def: 84, spd: 48, d: 'La serpiente primordial que gobernó el Olimpo antes que los titanes.', ab: { n: 'Anillos del Olimpo', t: 'shield', s: 1 } },
    { id: 'eurin', n: 'Eurínome',    r: 'titan', role: 'soporte',  ic: '🎭', hp: 1550, atk: 210, def: 50, spd: 72, d: 'La creadora del cosmos danzante, madre del viento del norte.', ab: { n: 'Danza del Destino', t: 'buff', s: 1.3 } },
    { id: 'fanes', n: 'Fanes',       r: 'primordial', role: 'mago',     ic: '🥚', hp: 1580, atk: 340, def: 52, spd: 88, d: 'El primero en emerger del huevo cósmico, dios de la luz naciente.', ab: { n: 'Huevo Cósmico', t: 'aoe', s: 1.45 } },
    { id: 'ekidna',n: 'Équidna',     r: 'titan', role: 'guerrero', ic: '🐲', hp: 1800, atk: 300, def: 62, spd: 76, d: 'Madre de todos los monstruos, medio mujer y serpiente.', ab: { n: 'Madre de Monstruos', t: 'aoe', s: 1.2 } },

    /* ---- CREADOR (1) · EXCLUSIVO. Andrés, el desarrollador supremo. ---- */
    // `locked: true` · imposible de soltar por sobres o Bazar: ninguna
    // mecánica normal llega a la rareza `creator` (los sobres solo usan
    // probabilidades para normal/hero/god/titan/primordial).
    { id: 'andre', n: 'Andrés',     r: 'creator', role: 'mago',     ic: '⚡', hp: 2600, atk: 520, def: 130, spd: 120, locked: true, d: 'El Arquitecto que escribió el código del Olimpo. Vive por encima de toda probabilidad: ningún sobre, Bazar ni ritual puede contener su esencia.', ab: { n: 'Diseño Absoluto', t: 'aoe', s: 2.6 } }
  ];

  /* ----------------------------------------------------------------------
   * EQUILIBRIO MITOLÓGICO.
   * Reajusta las estadísticas en bruto para que cada rareza ocupe SIEMPRE
   * su propio escalón de poder, sin superposiciones (héroes < dioses <
   * titanes < primordiales). El rango más alto de una rareza jamás alcanza
   * al más débil de la siguiente. Se preserva la identidad de cada carta
   * (tanques altos en HP/DEF, magos en ATK, etc.).
   * -------------------------------------------------------------------- */
  OU.BRACKETS = {
    normal:     { lo: 215, hi: 285 },
    hero:       { lo: 330, hi: 435 },
    god:        { lo: 490, hi: 625 },
    titan:      { lo: 690, hi: 850 },
    primordial: { lo: 940, hi: 1120 },
    creator:    { lo: 1500, hi: 1900 }
  };

  (function normalizeStats() {
    function rawPower(c) { return c.hp * 0.2 + c.atk + c.def * 1.2; }
    Object.keys(OU.BRACKETS).forEach(function (r) {
      var list = OU.CARDS.filter(function (c) { return c.r === r; })
        .sort(function (a, b) { return rawPower(b) - rawPower(a); });
      var n = Math.max(1, list.length - 1);
      list.forEach(function (c, i) {
        var t = OU.BRACKETS[r].lo + (OU.BRACKETS[r].hi - OU.BRACKETS[r].lo) * (i / n);
        var k = t / Math.max(1, rawPower(c));
        c.hp = Math.max(1, Math.round(c.hp * k));
        c.atk = Math.max(1, Math.round(c.atk * k));
        c.def = Math.max(1, Math.round(c.def * k));
      });
    });
  })();

  OU.CARD_BY_ID = {};
  OU.CARDS.forEach(function (c) { OU.CARD_BY_ID[c.id] = c; });

  OU.CARDS_BY_RAR = {};
  OU.CARDS.forEach(function (c) {
    (OU.CARDS_BY_RAR[c.r] = OU.CARDS_BY_RAR[c.r] || []).push(c);
  });

  /* ----------------------------------------------------------------------
   * CAMPAÑA: 100 fases en 10 actos, cada una con su propia historia.
   * La dificultad se genera por índice (nivel = fase; escala +12% al final)
   * para que el jugador NUNCA se quede contra una pared infinita: subiendo
   * cartas y tecnologías siempre hay camino hacia delante.
   * -------------------------------------------------------------------- */
  OU.STAGE_ROWS = [
    // ---- ACTO I · El Despertar de los Mortales (1-10) ----
    ['Bandidos de la Ruta', 'Los caminos de Grecia arden: los bandidos exigen su peaje en sangre.', ['pela', 'sat', 'arq', 'gt', 'hop']],
    ['Mercaderes Asaltados', 'Los carros de especias caen ante la horda de salteadores del monte.', ['pela', 'arq', 'sat', 'hop', 'gt']],
    ['Sátiros Alborotadores', 'Un aquelarre de sátiros arrasa la aldea al son de flautas salvajes.', ['sat', 'sat', 'pela', 'arq', 'gc']],
    ['Guardia Cretense', 'Los soldados de Minos custodian el peaje del mar Egeo.', ['gc', 'hop', 'arq', 'gt', 'mirm']],
    ['La Horda de Esparta', 'Esparta lanza su falange: escudos unidos, lanzas al frente.', ['hop', 'hop', 'mirm', 'mirm', 'gt']],
    ['Peltastas de Tracia', 'Jabalinas tracias llueven desde la colina boscosa.', ['pela', 'pela', 'sat', 'ant', 'pal']],
    ['Pólux y los Atletas', 'El púgil de Olimpia y sus atletas defienden el templo de Hera.', ['polix', 'sat', 'ant', 'prt', 'ido']],
    ['Flechas de Creta', 'Los arqueros cretenses disparan tras cada piedra del desfiladero.', ['arq', 'arq', 'teu', 'pela', 'gt']],
    ['Príncipe de Troya', 'Los escoltas troyanos juran lealtad ante las puertas; el camino está cortado.', ['gt', 'gt', 'hop', 'mirm', 'arq']],
    ['El General de la Falange', 'Un veterano espartano reúne a sus mejores tropas en el cruce del río.', ['hop', 'hop', 'hop', 'mirm', 'gt']],

    // ---- ACTO II · La Sombra de las Bestias (11-20) ----
    ['El Bosque de las Dríades', 'Las dríades despiertan contra los leñadores del rey.', ['dri', 'dri', 'sat', 'pela', 'arq']],
    ['La Voz de lo Invisible', 'El adivino Teoclímeno ahuyenta a los intrusos con malos augurios.', ['teocl', 'cas', 'pal', 'sat', 'gc']],
    ['Ecos de la Guerra', 'Los veteranos de Troya regresan como sombras de metal.', ['prt', 'lan', 'pal', 'gt', 'hop']],
    ['Presagios de Casandra', 'La profetisa grita el desastre; nadie la cree hasta que llega.', ['cas', 'teocl', 'dri', 'arq', 'pela']],
    ['Herederos en Lucha', 'Los jóvenes príncipes disputan la corona de sus padres.', ['tel', 'prt', 'ido', 'ant', 'polix']],
    ['La Danza de los Fuegos', 'Sátiros y criaturas del bosque bailan alrededor del fuego sagrado.', ['sat', 'sat', 'sat', 'dri', 'pal']],
    ['Puertas de la Ciudad', 'Los guardias tracios y cretenses sellan la ciudad por decreto real.', ['gc', 'gc', 'gt', 'hop', 'mirm']],
    ['El Muro de Escudos', 'Una falange compacta avanza sin piedad por la llanura.', ['mirm', 'mirm', 'hop', 'hop', 'gt']],
    ['Vuelo de la Grulla', 'Los peltastas imitan a las grullas: giro, sombra y acero.', ['pela', 'pela', 'arq', 'arq', 'sat']],
    ['El Campeón de la Liga', 'El campeón de las aldeas reta a todo aquel que cruce su puente.', ['hop', 'hop', 'mirm', 'mirm', 'prt']],

    // ---- ACTO III · La Era de los Héroes (21-30) ----
    ['Las Yeguas de Tracia', 'Los guerreros de Diomedes protegen a sus caballos carniceros.', ['dim', 'pela', 'sat', 'hop', 'men']],
    ['La Carrera de Atalanta', 'Atalanta desafía: quien no la alcance, jamás pasará.', ['ata', 'tes', 'per', 'and', 'uli']],
    ['El Vellocino en Peligro', 'Los argonautas repelen a los invasores del vellocino de oro.', ['jas', 'and', 'orf', 'men', 'uli']],
    ['El Jabalí de Calidón', 'La bestia de Calidón deja un surco de sangre por el bosque.', ['mele', 'ata', 'orf', 'jas', 'bel']],
    ['Los Sabios de Pilos', 'Los soldados de Néstor juran defender el palacio hasta el último aliento.', ['fil', 'men', 'pal', 'lan', 'tel']],
    ['Los Gemelos del Cielo', 'Cástor y Pólux brillan en el campo, uno mortal y otro inmortal.', ['polix', 'polix', 'ant', 'ido', 'mirm']],
    ['La Mano de Perseo', 'Perseo blande la cabeza de Medusa; nadie mira su escudo sin temblar.', ['per', 'tes', 'and', 'ata', 'uli']],
    ['El Cazador Estrellado', 'Cazadores legendarios persiguen constelaciones sobre la llanura.', ['ata', 'arp', 'sire', 'gor', 'cent']],
    ['El Último Arco de Quirón', 'Quirón enseña su postrera lección; sus aprendices disparan a muerte.', ['cent', 'ata', 'teu', 'arq', 'arp']],
    ['Los Tres Campeones', 'Tres grandes héroes de Grecia lanzan el desafío de los trabajos.', ['her', 'aqu', 'ajx', 'per', 'tes']],

    // ---- ACTO IV · El Favor de los Dioses (31-40) ----
    ['El Arco de Artemisa', 'Artemisa prueba a los mortales con una lluvia de flechas de plata.', ['art', 'eos', 'iris', 'nike', 'hebe']],
    ['Los Vientos de Éolo', 'Éolo suelta los vientos: el sendero entero se vuelve tormenta.', ['eol', 'pan', 'herm', 'art', 'apo']],
    ['El Taller de Hefesto', 'Los autómatas de bronce de Hefesto custodian su forja en llamas.', ['hef', 'eol', 'pan', 'nike', 'hebe']],
    ['La Fiesta de Dioniso', 'Ménades y sátiros hechizan a los viajeros entre racimos y vino.', ['dion', 'sat', 'sat', 'dri', 'pan']],
    ['El Sol de Apolo', 'Apolo incendia el mediodía y los prados arden a su paso.', ['apo', 'art', 'iris', 'eos', 'herm']],
    ['El Néctar Divino', 'Hebe escancia el néctar mientras sus guardianes sonríen al asediar.', ['hebe', 'hebe', 'nike', 'eos', 'iris']],
    ['La Aurora Carmesí', 'Eos abre las puertas del nuevo día... y con él, una batalla.', ['eos', 'iris', 'eol', 'pan', 'art']],
    ['Pánico en los Bosques', 'El dios Pan siembra el pánico entre las filas enemigas.', ['pan', 'pan', 'sat', 'dri', 'art']],
    ['La Corona de la Victoria', 'Niké corona a quien se atreva a arrebatarle la victoria.', ['nike', 'hebe', 'iris', 'eos', 'apo']],
    ['El Juicio de los Inmortales', 'Los dioses menores juzgan si eres digno de seguir avanzando.', ['art', 'apo', 'hef', 'herm', 'nike']],

    // ---- ACTO V · La Ira del Olimpo (41-50) ----
    ['El Trueno del Rey', 'Zeus descarga un rayo que parte la montaña en dos.', ['zus', 'ars', 'herm', 'apo', 'ate']],
    ['La Guarida de Poseidón', 'Poseidón agita el mar y las olas traen a sus hijos con tridente.', ['pos', 'dion', 'dem', 'hekat', 'eris']],
    ['Las Puertas de Hades', 'Hades abre la grieta del suelo y los muertos ascienden en fila.', ['had', 'hipno', 'hekat', 'eris', 'dem']],
    ['La Discordia Divina', 'Hera interviene y la guerra se enciende entre hermanos.', ['hera', 'pos', 'dem', 'afr', 'hekat']],
    ['El Campo de Ares', 'Ares desata la carnicería total en el valle.', ['ars', 'ars', 'art', 'apo', 'herm']],
    ['El Vino del Éxtasis', 'Las bacanales de Dioniso arrastran a los soldados al frenesí.', ['dion', 'dion', 'sat', 'sire', 'pan']],
    ['La Cosecha de Deméter', 'Deméter marchita la tierra de alimento a quien ose desafiarla.', ['dem', 'hebe', 'afr', 'hera', 'hekat']],
    ['La Manzana de la Discordia', 'Eris lanza su manzana dorada: «para la más hermosa».', ['eris', 'hekat', 'hipno', 'nike', 'afr']],
    ['La Encrucijada de Hécate', 'Los tres rostros de Hécate vigilan cada sendero hacia el Olimpo.', ['hekat', 'hekat', 'hipno', 'eris', 'dem']],
    ['Concilio del Olimpo', 'Los seis grandes dioses descienden en pleno concilio.', ['zus', 'pos', 'had', 'ate', 'ars']],

    // ---- ACTO VI · Descenso al Inframundo (51-60) ----
    ['La Nave de Caronte', 'Caronte exige su óbolo: quienes no pagan cruzan entre lamentos.', ['had', 'hipno', 'hekat', 'eris', 'dem']],
    ['Los Sueños de Hipnos', 'Hipnos mece a todo el ejército hasta arrancarles los sueños.', ['hipno', 'hipno', 'hekat', 'had', 'eris']],
    ['El Río del Olvido', 'Quien bebe del Lete olvida su fuerza; resiste y sobrevive.', ['hipno', 'had', 'hekat', 'eris', 'hebe']],
    ['Los Jueces del Tártaro', 'Los jueces del inframundo pesan tu destino en la balanza.', ['had', 'had', 'hipno', 'hekat', 'eris']],
    ['La Senda de Cerbero', 'El perro de tres cabezas guarda la salida; nadie escapa ileso.', ['had', 'had', 'hipno', 'hekat', 'eris']],
    ['Las Erinias', 'Las furias vuelan con llamas en el cabello y culpa en los ojos.', ['eris', 'eris', 'hekat', 'hipno', 'had']],
    ['El Sueño Eterno', 'Recuerda: quien duerme en el inframundo no despierta jamás.', ['hipno', 'hipno', 'hipno', 'hekat', 'had']],
    ['La Reina de la Noche', 'Hécate abre el velo y sus perros negros cazan sombras.', ['hekat', 'hekat', 'eris', 'hipno', 'had']],
    ['La Niebla sin Nombre', 'La bruma del Lete se espesa hasta borrar el camino.', ['hekat', 'hipno', 'had', 'eris', 'hebe']],
    ['El Trono de Hades', 'Hades exige tu nombre, tu fuerza y tu silencio para siempre.', ['had', 'had', 'had', 'hekat', 'hipno']],

    // ---- ACTO VII · El Despertar de los Titanes (61-70) ----
    ['La Cadena de Jápeto', 'Las cadenas de Jápeto rechinan al romperse una tras otra.', ['jap', 'atl', 'cri', 'oce', 'hip']],
    ['El Hombro del Mundo', 'Atlas se alza y el cielo entero pesa sobre sus hombros.', ['atl', 'atl', 'cri', 'hip', 'jap']],
    ['El Fuego del Mar', 'Océano hierve sobre su trono de corrientes interminables.', ['oce', 'jap', 'atl', 'cri', 'hip']],
    ['La Tormenta del Norte', 'Crío desata vientos helados que congelan el valle.', ['cri', 'cri', 'jap', 'oce', 'astra']],
    ['La Estrella del Alba', 'Astreo enciende constelaciones que caen como jabalinas.', ['astra', 'pers', 'cri', 'hip', 'jap']],
    ['La Corona Lunar', 'Febe tiñe la luna de rojo y la usa como conjuro.', ['phoeb', 'pers', 'astra', 'cri', 'oce']],
    ['Las Corrientes de Tetis', 'Tetis levanta mareas que tragan ejércitos enteros.', ['teth', 'oce', 'phoeb', 'jap', 'cri']],
    ['La Memoria Antigua', 'Mnemósine recuerda tus victorias... y las repite contra ti.', ['mnem', 'teth', 'phoeb', 'oce', 'jap']],
    ['El Juicio de Temis', 'La balanza de Temis declara tu guerra injusta; aun así, avanzas.', ['thes', 'mnem', 'teth', 'phoeb', 'oce']],
    ['La Estirpe del Cielo', 'Seis titanes se alinean para recordar el origen del mundo.', ['gaya', 'our', 'atl', 'rhoa', 'cro']],

    // ---- ACTO VIII · La Titanomaquia (71-80) ----
    ['La Madre de los Dioses', 'Réa protege a sus hijos en retirada; los mortales se interponen.', ['rhoa', 'dion2', 'thes', 'mnem', 'teth']],
    ['El Fuego Robado', 'Prometeo empuña su fuego robado: un titán con corazón de hombre.', ['prom', 'epim', 'dion2', 'astra', 'pers']],
    ['El Don Tardío', 'Epimeteo abre la caja; lo que sale no puede volver a entrar.', ['epim', 'epim', 'prom', 'dion2', 'thes']],
    ['Las Profundidades Marinas', 'Ponto se levanta del abismo, velas negras y sonido de conchas.', ['ponto', 'oce', 'teth', 'dion2', 'rhoa']],
    ['La Bóveda Celestial', 'Urano y Gea conjuran el eco de su antigua profecía.', ['our', 'gaya', 'atl', 'rhoa', 'cro']],
    ['El Abismo sin Fondo', 'El Tártaro se abre para tragarte de una vez.', ['tar', 'ereb', 'ponto', 'our', 'nix']],
    ['La Noche y la Luz', 'Nix y Érebo envuelven el mundo; solo el fuego de Prometeo alumbra.', ['nix', 'ereb', 'prom', 'dion2', 'tar']],
    ['El Mar de las Tormentas', 'Los marinos del Ponto predicen tempestades en cada ola.', ['ponto', 'tar', 'nix', 'ereb', 'oce']],
    ['Las Raíces de la Tierra', 'Gea impulsa a sus hijos: raíces que aplastan murallas.', ['gaya', 'our', 'rhoa', 'atl', 'cro']],
    ['El Trono de Cronos', 'Cronos alza la guadaña que una vez devoró al tiempo.', ['cro', 'cro', 'atl', 'hip', 'jap']],

    // ---- ACTO IX · El Retorno de lo Primitivo (81-90) ----
    ['El Eco del Caos', 'El vacío comienza a respirar y las estrellas titubean.', ['chaos', 'fanes', 'eter', 'anank', 'eros']],
    ['La Luz del Éter', 'El cielo superior se derrama como un mar blanco de energía.', ['eter', 'hemer', 'fanes', 'eros', 'anank']],
    ['El Alba Eterna', 'Hemera detiene la noche: el día que no termina para nadie.', ['hemer', 'eter', 'fanes', 'anank', 'eros']],
    ['La Flecha Cósmica', 'Eros lanza su flecha al corazón del destino.', ['eros', 'ofion', 'eurin', 'fanes', 'hemer']],
    ['El Huevo Primordial', 'Fanes rompe su cáscara cósmica y el mundo reordena su centro.', ['fanes', 'fanes', 'eter', 'hemer', 'eros']],
    ['La Serpiente del Olimpo', 'Ofión se enrolla en las cimas del antiguo Olimpo.', ['ofion', 'ofion', 'eurin', 'fanes', 'eter']],
    ['La Danza de Eurínome', 'Eurínome baila sobre las aguas y teje el viento del norte.', ['eurin', 'eurin', 'ofion', 'anank', 'eter']],
    ['La Necesidad Inevitable', 'Ananké teje el movimiento del cosmos; nadie lo deshace.', ['anank', 'anank', 'fanes', 'eter', 'hemer']],
    ['La Madre de los Monstruos', 'Équidna suelta a sus hijos: quimeras, perros y serpientes.', ['ekidna', 'ofion', 'anank', 'eros', 'fanes']],
    ['El Vientre del Caos', 'El caos primordial reabre la grieta del mundo.', ['chaos', 'chaos', 'anank', 'fanes', 'eter']],

    // ---- ACTO X · El Fin de los Tiempos (91-100) ----
    ['El Cáliz del Vacío', 'El vacío bebe el color de los cielos.', ['eter', 'chaos', 'hemer', 'anank', 'fanes']],
    ['La Tormenta del Juicio', 'El viento de Tifón arranca montañas de sus cimientos.', ['tifon', 'ekidna', 'chaos', 'eter', 'anank']],
    ['Los Anillos del Mundo', 'Ofión se enrolla alrededor de los pilares del cosmos.', ['ofion', 'ekidna', 'tifon', 'eurin', 'chaos']],
    ['La Última Luz', 'Hemera y el éter luchan por un amanecer que no llega.', ['hemer', 'eter', 'chaos', 'anank', 'fanes']],
    ['Las Mil Caras del Caos', 'El caos adopta la forma de tus peores recuerdos.', ['chaos', 'chaos', 'chaos', 'anank', 'eter']],
    ['El Abismo Despertó', 'El Tártaro y el vacío son ahora uno solo.', ['tar', 'chaos', 'anank', 'tifon', 'eter']],
    ['La Noche que lo Apagó Todo', 'Nix extingue el último sol; solo queda la fe.', ['nix', 'chaos', 'anank', 'eter', 'fanes']],
    ['El Canto de la Creación', 'Fanes entona el primer himno del cosmos y el mundo tiembla.', ['fanes', 'chaos', 'eter', 'anank', 'hemer']],
    ['Los Dioses Huyen', 'Los olímpicos se ocultan; solo tú permaneces frente al vacío.', ['tifon', 'chaos', 'anank', 'eter', 'ekidna']],
    ['Tifón, el Devorador de Dioses', 'La última prueba: enfrenta al monstruo que hizo temblar al Olimpo.', ['tifon', 'tifon', 'chaos', 'anank', 'eter']]
  ];

  OU.STAGES = OU.STAGE_ROWS.map(function (row, i) {
    var idx = i + 1;
    var scale = 1 + i * 0.0012;
    if (idx % 10 === 0) scale *= 1.05;   // jefes de acto, más duros
    if (i === OU.STAGE_ROWS.length - 1) scale *= 1.02; // jefe final
    return {
      n: row[0],
      story: row[1],
      roster: row[2],
      level: Math.min(OU.CONST.MAX_LEVEL, idx),
      scale: Math.round(scale * 1000) / 1000
    };
  });
})();