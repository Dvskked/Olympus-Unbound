# 🏛️ Olympus Unbound

**Un juego de cartas y colección de mitología griega** — jugable directamente en el navegador, sin instalación ni servidor.

Forja tu legado entre mortales, héroes, dioses y titanes en un auto-battler con arte real de Wikipedia, modo entrenamiento, economía pasiva y estética oscura de mármol y oro inspirada en títulos como *Dungeon Crusher* y *AFK Arena*.

> 🎮 **Juega ahora:** abre `index.html` en cualquier navegador moderno (móvil o desktop). Tu progreso se guarda automáticamente con `localStorage`.

---

## ✨ Características

| Sistema | Descripción |
|---|---|
| 🖼️ **31 cartas con arte real** | Ilustraciones locales (carpeta `img/`) o de Wikipedia para cada criatura, héroe, dios y titán (con fallback a emoji) |
| 🃏 **4 rangos de cartas** | Normales, Héroes, Dioses y Titanes con brillos y probabilidades diferenciadas |
| 🎁 **6 sobres** | Bronce, Plata, Oro, Épico, Olimpo y Divino con animaciones de apertura y garantías por rareza |
| 🪙 **Economía doble + pasiva** | Oro y Gemas, más un **Ágora** que genera oro pasivo por minuto (con reloj offline) |
| 🏋️ **Modo Entrenamiento** | Entrena una carta en tiempo real (1, 3, 8 o 20 min) para ganar XP, oro y gemas sin gastar duplicados |
| 📜 **Colección** | Inventario completo, contador de duplicados, subida de nivel con oro + duplicados, y subida por XP de entrenamiento |
| 🛡️ **Mi Equipo** | 5 ranuras de batalla y poder total calculado en tiempo real |
| ⚔️ **Modo Batalla** | Auto-battler con barras de vida/energía, poderes especiales, números voladores y 12 fases de campaña |
| 📈 **Progresión más dura** | Nivel máximo 15, costos crecientes por nivel y rareza |
| 💾 **Guardado** | Todo el progreso persistido con `localStorage` (clave `olympus_unbound_v2`) |
| 🖥️ **Responsive** | Interfaz adaptada a móviles y desktop con barra de navegación inferior |

---

## 🎮 Cómo jugar

1. **Compra sobres** 🏛️ en la Tienda para conseguir cartas (empiezas con 🪙 2.000 y 💎 50, además de 3 cartas de arranque).
2. **Asigna cartas** a "Mi Equipo" 🛡️ (máximo 5 integrantes) tocando cada ranura.
3. **Combate** ⚔️ en la campaña y vence las 12 fases de dificultad creciente.
4. **Entrena** 🏋️ una carta antes de una batalla difícil: vuelve cuando el reloj acabe y recoge XP, 🪙 y a veces 💎.
5. **Recoge el Ágora** 💰 cada vez que estés fuera: el oro pasivo se acumula hasta un tope.
6. **Mejora tus cartas** 📜 consumiendo duplicados + oro, o con XP de entrenamiento (¡no gasta duplicados!).
7. **Cada carta** tiene un rol (Tanque, Guerrero, Mago o Soporte) y una habilidad especial que se activa al llenar la barra de energía 💫.

### Probabilidades de los sobres

| Sobre | Coste | Cartas | Normales | Héroes | Dioses | Titanes | Garantía |
|---|---|---|---|---|---|---|---|
| **Bronce** | 🪙 300 | 3 | 78% | 20% | 1.8% | 0.2% | — |
| **Plata** | 🪙 650 | 4 | 62% | 32% | 5.4% | 0.6% | — |
| **Oro** | 🪙 1.600 | 5 | 50% | 37% | 11.5% | 1.5% | — |
| **Épico** | 🪙 3.500 | 5 | 42% | 38% | 17% | 3% | ≥1 Héroe |
| **Olimpo** | 💎 50 | 5 | 22% | 49.5% | 22.5% | 6% | ≥1 Héroe |
| **Divino** | 💎 120 | 6 | 12% | 42% | 36% | 10% | ≥1 Dios |

Las gemas también pueden canjearse por oro: 💎 10 → 🪙 1.200 · 💎 25 → 🪙 3.000 · 💎 50 → 🪙 6.000.

### Entrenamiento (descripción de sesiones)

| Sesión | Duración | XP | Oro | Gemas |
|---|---|---|---|---|
| Rápido | 1 min | 30 | 60 | — |
| Activo | 3 min | 100 | 190 | — |
| Élite | 8 min | 320 | 560 | 1 |
| Legendario | 20 min | 900 | 1.600 | 3 |

El progreso de entrenamiento se basa en timestamps, así que **sigue avanzando aunque cierres el juego** (igual que el Ágora).

---

## 🛡️ Roles y habilidades

- **Tanque** 🏰 — Alta vida y defensa. Habilidad: escudo que absorbe daño.
- **Guerrero** ⚔️ — Ataque equilibrado. Habilidad: golpe devastador o daño en área.
- **Mago** 🔮 — Daño masivo. Habilidad: ataca a todos los enemigos.
- **Soporte** ✨ — Cura y potencia aliados. Habilidad: sanación o aumento de ATK.

## 👑 Cartas incluidas (31)

- **Normales:** Hoplita Espartano, Guardia Troyana, Arquero Cretense, Peltasta Tracio, Sátiro Arremetedor, Sacerdotisa de Delfos, Guardia Cretense, Fiel Mirmidón.
- **Héroes:** Aquiles, Hércules, Perseo, Teseo, Ulises, Atalanta, Orfeo, Andrómeda, Jasón.
- **Dioses:** Zeus, Poseidón, Hades, Atenea, Ares, Artemisa, Hefesto, Apolo.
- **Titanes:** Cronos, Océano, Hiperión, Jápeto, Atlas, Crío.

---

## ⚔️ Sistema de combate

- Combate **automático por turnos** con orden de iniciativa (velocidad).
- Barras de **energía** que se llenan con cada golpe recibido/infligido; al 100% se activa la habilidad especial.
- **Números de daño voladores**, efectos de escudo/cura/boost, animaciones de golpe y barras animadas.
- Botón de **velocidad ×1 / ×2**, sonido sintetizado y opción de retirarse.
- **Recompensas** por victoria: oro, XP y posiblemente gemas. Al perder puedes **reintentar** la fase.
- 12 fases: desde *Bandidos de la Ruta* hasta *Cronos, el Devorador*.

---

## 🖥️ Stack técnico

- **HTML5 + CSS3 + JavaScript** modular: HTML, CSS y JS separados, sin dependencias ni build steps.
- Código organizado en un namespace global `window.OU` con IIFEs cargados en orden vía etiquetas `<script>` (compatible con `file://` — sin ES modules).
- **Listo para TypeScript**: configuración `tsconfig.json` + JSDoc en cada módulo. Ejecuta `npx tsc` (o `npm run check`) para validar tipos.
- Pack de test `node tests/run-all.js` (`npm test`) valida datos, probabilidades, mecánicas y el motor de combate con DOM simulado.
- Tipografía *Cinzel* (Google Fonts) con fallback a serif si no hay conexión.
- Arte de las cartas en cadena de fallbacks: primero la carpeta local `img/` (crea `img/<id>.png`, `.jpg` o `.webp`), luego Wikimedia/Wikipedia, y por último emojis.
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

> **Nota:** el arte de las cartas se busca primero en la carpeta `img/` (offline); si no existe la imagen local, se descarga de Wikipedia y la fuente *Cinzel* proviene de Google Fonts — ambos requieren conexión a internet la primera vez. Sin conexión, el juego usa emojis y fuente serif; todo lo demás funciona 100% offline.

---

## 🗂️ Estructura

```
Olympus Unbound/
├── index.html          # Esqueleto: carga CSS + módulos JS en orden
├── css/
│   └── style.css       # Tema oscuro: mármol, oro y azul olímpico (una sola fuente: Cinzel)
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
│   └── 10-main.js      # Pestañas, render y arranque (OU.MAIN)
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

- [ ] Modo PvP contra equipos de otros reinos.
- [ ] Eventos diarios y misiones con recompensas.
- [ ] BGM de ambientación y más efectos de sonido.
- [ ] Más cartas épicas y jefes mitológicos.
- [ ] Arena de todos contra todos con reclutamiento automático de NPCs.
- [ ] Soporte multilenguaje (ES / EN).

---

## 🙏 Créditos de arte

Las ilustraciones de las cartas provienen de **Wikimedia Commons / Wikipedia** y son obra de sus respectivos autores (dominio público o licencias libres), accedidas a través de la API REST de Wikipedia. Fallbacks emoji: Twemoji / sistema operativo.

---

Hecho con ⚡ por y para amantes de la mitología griega. **¡Que los dioses te sean propicios!**