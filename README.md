# 🏛️ Olympus Unbound

**Un juego de cartas y colección de mitología griega** — jugable directamente en el navegador, sin instalación ni servidor.

Forja tu legado entre mortales, héroes, dioses y titanes en un auto-battler con arte local de tu carpeta `img/`, modo entrenamiento, economía pasiva y una estética oscura vibrante con acentos dorados, azules y púrpuras inspirada en títulos como *Dungeon Crusher* y *AFK Arena*.

> 🎮 **Juega ahora:** abre `index.html` en cualquier navegador moderno (móvil o desktop). Tu progreso se guarda automáticamente con `localStorage`.

---

## ✨ Características

| Sistema | Descripción |
|---|---|
| 🖼️ **102 cartas con arte local** | Ilustraciones de tu carpeta `img/` (`img/<id>.png|jpg|webp`) para cada criatura, héroe, dios, titán y primordial (con fallback a emoji) |
| 🃏 **5 rangos de cartas** | Normales, Héroes, Dioses, Titanes y Primordiales, cada uno con su propio **aura**: gris sencilla (Normal), azul radiante (Héroe), dorada muy visible (Dios), rojo/negro peculiar (Titán) y blanca cegadora palpitante (Primordial) — además de brillos y probabilidades diferenciadas |
| 🎁 **7 sobres** | Bronce, Plata, Oro, Épico, Olimpo, Divino y Cósmico con animaciones de apertura y garantías por rareza. Los **Primordiales** solo aparecen en el Cósmico |
| 📖 **Índice de Leyendas** | Muestra TODAS las cartas del juego (desbloqueadas y por desbloquear) ordenadas de la más poderosa a la más débil, con filtros por rareza y estado |
| 🎮 **Minijuegos** | 3 modos para ganar oro y gemas al instante: el Oráculo (7 monedas), el Desafío del Dios (piedra, papel o tijera) y la Ruleta del Destino (¡un giro gratis por día!) |
| 🪙 **Economía doble + pasiva** | Oro y Gemas, más un **Ágora** que genera oro pasivo por minuto (con reloj offline) |
| 🏋️ **Modo Entrenamiento** | Entrena una carta en tiempo real (1, 3, 8, 20 o 60 min) para ganar XP, oro y gemas sin gastar duplicados |
| 📜 **Colección** | Inventario completo, contador de duplicados, subida de nivel con oro + duplicados, subida solo con oro (sin duplicados) y subida por XP de entrenamiento |
| 🛡️ **Mi Equipo** | 5 ranuras de batalla y poder total calculado en tiempo real |
| ⚔️ **Modo Batalla** | Auto-battler visual con fichas circulares, barras de vida/energía, poderes especiales, números voladores y **30 fases** de campaña |
| 📈 **Progresión más dura** | Nivel máximo 30, costos crecientes por nivel y rareza |
| 💾 **Guardado** | Todo el progreso persistido con `localStorage` (clave `olympus_unbound_v2`) |
| 🖥️ **Responsive** | Interfaz adaptada a móviles y desktop con barra de navegación inferior |

---

## 🎮 Cómo jugar

1. **Compra sobres** 🏛️ en la Tienda para conseguir cartas (empiezas con 🪙 3.000 y 💎 50, además de 3 cartas de arranque).
2. **Asigna cartas** a "Mi Equipo" 🛡️ (máximo 5 integrantes) tocando cada ranura.
3. **Combate** ⚔️ en la campaña y vence las 30 fases de dificultad creciente.
4. **Entrena** 🏋️ una carta antes de una batalla difícil: vuelve cuando el reloj acabe y recoge XP, 🪙 y a veces 💎.
5. **Recoge el Ágora** 💰 cada vez que estés fuera: el oro pasivo se acumula hasta un tope.
6. **Mejora tus cartas** 📜 consumiendo duplicados + oro, o con XP de entrenamiento (¡no gasta duplicados!), o pagando solo oro como acceso directo.
7. **Gana oro rápido** 🎮 en los Minijuegos: el Oráculo (apuesta x1.9), el Desafío del Dios o la Ruleta del Destino con su giro gratis diario.
8. **Completa tu Índice** 📖 consultando qué cartas te faltan, de la más fuerte a la más débil.
9. **Cada carta** tiene un rol (Tanque, Guerrero, Mago o Soporte) y una habilidad especial que se activa al llenar la barra de energía 💫.

### Probabilidades de los sobres

| Sobre | Coste | Cartas | Normales | Héroes | Dioses | Titanes | Primordiales | Garantía |
|---|---|---|---|---|---|---|---|---|
| **Bronce** | 🪙 200 | 3 | 86% | 13.3% | 0.6% | 0.1% | — | — |
| **Plata** | 🪙 450 | 4 | 71% | 27.8% | 1.1% | 0.1% | — | — |
| **Oro** | 🪙 900 | 5 | 55% | 42.4% | 2.4% | 0.2% | — | — |
| **Épico** | 🪙 1.800 | 5 | 44% | 50.2% | 5.5% | 0.3% | — | ≥1 Héroe |
| **Olimpo** | 💎 40 | 5 | 22% | 64% | 13.4% | 0.6% | — | ≥1 Héroe |
| **Divino** | 💎 90 | 6 | 12% | 53.4% | 32.2% | 2.4% | — | ≥1 Dios |
| **Cósmico** | 💎 160 | 6 | 10% | 42% | 34% | 10% | 4% | ≥1 Dios |

Las gemas también pueden canjearse por oro: 💎 10 → 🪙 1.200 · 💎 25 → 🪙 3.000 · 💎 50 → 🪙 6.000.

### Entrenamiento (descripción de sesiones)

| Sesión | Duración | XP | Oro | Gemas |
|---|---|---|---|---|
| Rápido | 1 min | 45 | 90 | — |
| Activo | 3 min | 150 | 280 | — |
| Élite | 8 min | 480 | 840 | 2 |
| Legendario | 20 min | 1.350 | 2.400 | 5 |
| Primordial | 60 min | 4.800 | 8.000 | 12 |

El progreso de entrenamiento se basa en timestamps, así que **sigue avanzando aunque cierres el juego** (igual que el Ágora).

---

## 🛡️ Roles y habilidades

- **Tanque** 🏰 — Alta vida y defensa. Habilidad: escudo que absorbe daño.
- **Guerrero** ⚔️ — Ataque equilibrado. Habilidad: golpe devastador o daño en área.
- **Mago** 🔮 — Daño masivo. Habilidad: ataca a todos los enemigos.
- **Soporte** ✨ — Cura y potencia aliados. Habilidad: sanación o aumento de ATK.

## ✨ Auras por rareza

Cada carta emana un aura visible según su rango, tanto en la colección como en el campo de batalla:

| Rango | Aura |
|---|---|
| **Normal** | Borde gris sutil y tenue, casi plano |
| **Héroe** | Aura azul radiante que late con un anillo pulsante |
| **Dios** | Aura dorada intensa, muy visible, con pulso brillante constante |
| **Titán** | Aura rojo sangre con negro y un anillo dentado (cuadrado girado) que rota lentamente: difícil de conseguir, difícil de ignorar |
| **Primordial** | Aura blanca cegadora que late como un sol interno, con brillo expandiéndose y contrayéndose: solo en el Sobre Cósmico |

## 👑 Cartas incluidas (102)

> ⚡ **No todo el poder sigue la rareza**: héroes legendarios como Aquiles, Hércules, Héctor o Ayax superan en combate a dioses menores (mensajeros y auroras como Eos o Iris), tal como manda la mitología. La rareza marca el piso, pero el individuo define el techo.

- **Normales (24):** Hoplita Espartano, Guardia Troyana, Arquero Cretense, Peltasta Tracio, Sátiro Arremetedor, Sacerdotisa de Delfos, Guardia Cretense, Fiel Mirmidón, Antíloco, Palamedes, Casandra, Telémaco, Laertes, Pirítoo, Podalirio, Macaón, Protesilao, Dríade del Roble, Teucro el Arquero, Frixo, Hele la Náufraga, Teoclímeno, Idomeneo, Pólux.
- **Héroes (24):** Aquiles, Hércules, Perseo, Teseo, Ulises, Atalanta, Orfeo, Andrómeda, Jasón, Héctor, Ayax el Grande, Diomedes, Menelao, Belerofonte, Eneas, Peleo, Meleagro, Antíope, Quirón, Sirena, Arpía, Gorgona, Filoctetes, Néstor.
- **Dioses (22):** Zeus, Poseidón, Hades, Atenea, Ares, Artemisa, Hefesto, Apolo, Hera, Hermes, Dioniso, Deméter, Afrodita, Éolo, Eos, Iris, Pan, Hécate, Niké, Eris, Hebe, Hipnos.
- **Titanes (22):** Cronos, Océano, Hiperión, Jápeto, Atlas, Crío, Gea, Urano, Nix, Érebo, Tártaro, Tetis, Temis, Mnemósine, Réa, Febe, Prometeo, Epimeteo, Astreo, Perses, Dione, Ponto.
- **Primordiales (10):** Caos, Éter, Hemera, Eros, Ananké, Tifón, Ofión, Eurínome, Fanes, Équidna.

---

## ⚔️ Sistema de combate

- Combate **automático por turnos** con orden de iniciativa (velocidad) en un campo visual: tu equipo se alinea en la **izquierda** y los enemigos a la **derecha**, cada uno como una ficha circular (avatar, barra de vida y barra de energía).
- Al atacar, la ficha **embiste** hacia su objetivo; al recibir daño se muestra un **temblor**, un anillo de impacto y **números voladores** de daño.
- Barras de **energía** que se llenan con cada golpe recibido/infligido; al 100% la ficha **destella**, lanza una **onda expansiva** y libera su poder especial.
- Cuando la vida de una ficha llega a 0, esta se **desvanece** del campo de batalla.
- Botón de **velocidad ×1 / ×2**, sonido sintetizado y opción de retirarse.
- **Recompensas** por victoria: oro, XP y posiblemente gemas. Al perder puedes **reintentar** la fase.
- **30 fases**: desde *Bandidos de la Ruta* hasta *Tifón, el Devorador de Dioses*, coronado por los Primordiales.

---

## 🖥️ Stack técnico

- **HTML5 + CSS3 + JavaScript** modular: HTML, CSS y JS separados, sin dependencias ni build steps.
- Código organizado en un namespace global `window.OU` con IIFEs cargados en orden vía etiquetas `<script>` (compatible con `file://` — sin ES modules).
- **Listo para TypeScript**: configuración `tsconfig.json` + JSDoc en cada módulo. Ejecuta `npx tsc` (o `npm run check`) para validar tipos.
- Pack de test `node tests/run-all.js` (`npm test`) valida datos, probabilidades, mecánicas y el motor de combate con DOM simulado.
- Tipografía *sans-serif* del sistema (sin dependencias externas).
- Arte de las cartas en cadena de fallbacks: primero la carpeta local `img/` (crea `img/<id>.png`, `.jpg` o `.webp`), y si no existe, se muestra el emoji de la carta.
- Persistencia mediante `localStorage` (clave `olympus_unbound_v2`).

---

## 🚀 Puesta en marcha

```bash
# Opción 1: simplemente abre el archivo
start index.html       # Windows
open index.html        # macOS / Linux
```

```bash
# Opción 2: sirvelo con cualquier servidor estático
npx serve .
# y visita http://localhost:3000
```

> **Nota:** el arte de las cartas se busca primero en la carpeta `img/` (offline, `img/<id>.png|jpg|webp`); si no existe la imagen local, el juego usa emoji. Todo funciona 100% offline, sin fuentes ni recursos externos.

---

## 🗂️ Estructura

```
Olympus Unbound/
├── index.html          # Esqueleto: carga CSS + módulos JS en orden
├── css/
│   └── style.css       # Tema oscuro vibrante: una sola fuente sans, acentos dorado/azul/púrpura
├── img/                # (Opcional) arte local de cartas: img/<id>.png|jpg|webp
├── js/                 # Módulos (namespace global window.OU)
│   ├── 00-img.js       # Mapa de arte real por carta (OU.IMG)
│   ├── 01-data.js      # Constantes, cartas, sobres, fases, entrenamiento (OU.CONST/RAR/PACKS/CARDS/STAGES/TRAIN)
│   ├── 02-state.js     # Estado, guardado/carga, timestamps, ingreso pasivo (OU.STATE)
│   ├── 03-utils.js     # Cálculos: nivel, costos, probabilidades, formato (OU.UTIL)
│   ├── 04-ui.js        # Arte, chips, toast, modales (OU.UI)
│   ├── 05-shop.js      # Tienda, apertura de sobres, canje de gemas (OU.SHOP)
│   ├── 06-collection.js# Colección, filtros, detalle y mejoras (OU.COLLECTION)
│   ├── 07-team.js      # Equipo y selector de ranuras (OU.TEAM)
│   ├── 08-battle.js    # Motor de combate y campaña (OU.BATTLE)
│   ├── 09-training.js  # Ágora + entrenamiento en tiempo real (OU.TRAIN)
│   ├── 10-main.js      # Pestañas, render y arranque (OU.MAIN)
│   ├── 11-index.js     # Índice de Leyendas: todas las cartas por poder (OU.INDEX)
│   └── 12-games.js     # Minijuegos: Oráculo, Desafío del Dios y Ruleta (OU.GAMES)
├── tests/
│   └── run-all.js      # Suite de pruebas (Node: DOM simulado)
├── tsconfig.json       # Chequeo TypeScript sobre el JS (npx tsc)
└── README.md           # Este documento
```

---

## 🧪 Pruebas

```bash
npm test          # ejecuta tests/run-all.js (valida datos, mecánicas y motor)
npm run check     # npx tsc — valida tipos sobre los módulos JS
```

---

## 🛣️ Roadmap (ideas)

- [x] **Minijuegos** para ganar oro y gemas al instante (Oráculo, RPS, Ruleta).
- [ ] Modo PvP contra equipos de otros reinos.
- [ ] Eventos diarios y misiones con recompensas.
- [ ] BGM de ambientación y más efectos de sonido.
- [ ] Más cartas épicas y jefes mitológicos.
- [ ] Arena de todos contra todos con reclutamiento automático de NPCs.
- [ ] Soporte multilenguaje (ES / EN).

---

## 🎨 Arte

Las ilustraciones de las cartas se cargan desde la carpeta local `img/` (`img/<id>.png`, `.jpg` o `.webp`). Sin conexión ni imágenes, el juego usa emojis; todo lo demás funciona 100% offline.

---

Hecho con ⚡ por y para amantes de la mitología griega. **¡Que los dioses te sean propicios!**