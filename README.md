# 🏛️ Olympus Unbound

**Un juego de cartas y colección de mitología griega** — jugable directamente en el navegador, sin instalación ni servidor.

Forja tu legado entre mortales, héroes, dioses y titanes en un auto-battler oscuro, elegante y pulido inspirado en títulos como *Dungeon Crusher*, *Clash Royale* y *AFK Arena*.

> 🎮 **Juega ahora:** abre `index.html` en cualquier navegador moderno (móvil o desktop). Tu progreso se guarda automáticamente con `localStorage`.

---

## ✨ Características

| Sistema | Descripción |
|---|---|
| 🃏 **4 rangos de cartas** | Normales (65%), Héroes Griegos (25%), Dioses Griegos (8.5%) y Titanes (1.5%) |
| 🪙 **Economía doble** | Monedas de Oro (compras y mejoras) y Gemas (sobres divinos y canje por oro) |
| 🎁 **Tienda de sobres** | Sobre de Bronce, Sobre de Oro y Sobre Olimpo con animaciones de apertura y brillos por rareza |
| 📜 **Colección** | Inventario completo, contador de duplicados y sistema de subida de nivel con Oro + duplicados |
| 🛡️ **Mi Equipo** | 5 ranuras de batalla, poder total del equipo calculado en tiempo real |
| ⚔️ **Modo Batalla** | Auto-battler por turnos con barras de vida/energía, poderes especiales, números de daño voladores y 12 fases de campaña |
| 💾 **Guardado** | Todo el progreso persistido con `localStorage` |
| 🖥️ **Responsive** | Interfaz adaptada a móviles y desktop con barra de navegación inferior |

---

## 🎮 Cómo jugar

1. **Compra sobres** en la Tienda 🏛️ para conseguir tus primeras cartas (empiezas con 🪙 2.000 y 💎 50).
2. **Asigna cartas** a "Mi Equipo" 🛡️ (máximo 5 integrantes).
3. **Combate** en la campaña ⚔️ y vence las 12 fases de dificultad creciente.
4. **Mejora tus cartas** 📜 consumiendo duplicados + oro para aumentar HP, ATK y DEF.
5. **Cada carta** tiene un rol (Tanque, Guerrero, Mago o Soporte) y una habilidad especial que se activa al llenar la barra de energía 💫.

### Probabilidades de los sobres

| Sobre | Coste | Cartas | Normales | Héroes | Dioses | Titanes |
|---|---|---|---|---|---|---|
| **Bronce** | 🪙 300 | 3 | 78% | 20% | 1.8% | 0.2% |
| **Oro** | 🪙 1.000 | 5 | 50% | 37% | 11.5% | 1.5% |
| **Olimpo** | 💎 50 | 5 | 22% | 49.5% * | 22.5% | 6% |

\* El Sobre Olimpo **garantiza al menos 1 Héroe** por apertura.

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
- **Números de daño voladores**, efectos visuales de escudo/cura/boost y barras de vida animadas.
- Botón de **velocidad ×1 / ×2** y opción de retirarse.
- **Recompensas** por victoria: oro, XP y posiblemente gemas. Al perder puedes **reintentar** la fase.
- 12 fases: desde *Bandidos de la Ruta* hasta *Cronos, el Devorador*.

---

## 🖥️ Stack técnico

- **HTML5 + CSS3 + JavaScript** en un solo archivo (`index.html`), sin dependencias ni build steps.
- Tipografía *Cinzel* (Google Fonts) con fallback a serif si no hay conexión.
- Persistencia mediante `localStorage` (clave `olympus_unbound_v1`).
- Sin frameworks, sin npm, sin servidor — solo abre el archivo.

---

## 🚀 Puesta en marcha

```bash
# Opción 1: simplemente abre el archivo
open index.html        # macOS / Linux
start index.html       # Windows
```

```bash
# Opción 2: sirvelo con cualquier servidor estático
npx serve .
# y visita http://localhost:3000
```

> **Nota:** la fuente *Cinzel* se carga desde Google Fonts. Sin conexión el juego usa una fuente serif de respaldo; el resto funciona 100% offline.

---

## 🗂️ Estructura

```
Olympus Unbound/
├── index.html   # Juego completo (HTML + CSS + JS embebidos)
└── README.md    # Este documento
```

---

## 🛣️ Roadmap (ideas)

- [ ] Modo PvP contra equipos de otros reinos.
- [ ] Eventos diarios y misiones con recompensas.
- [ ] Efectos de sonido y BGM de ambientación.
- [ ] Más cartas épicas y jefes mitológicos.
- [ ] Arena de todos contra todos con reclutamiento automático de NPCs.
- [ ] Soporte multilenguaje (ES / EN).

---

Hecho con ⚡ por y para amantes de la mitología griega. **¡Que los dioses te sean propicios!**