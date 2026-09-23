# Sprite de personaje — prompt

Adjunta la imagen de la carta del personaje como referencia y usa este prompt:

```
Genera un sprite de batalla de este personaje usando la imagen adjunta como
referencia exacta de su diseño, vestimenta y colores. Estilo chibi-heroico de
juego móvil, contorno grueso y limpio, sombreado plano con luz de filo,
inspiración anime-griega. Fondo transparente, PNG, sin texto ni marca de agua.

Formato: hoja de sprites de 6 columnas x 5 filas = 30 celdas de 128x128 px
(hoja total 768x640 px). Personaje de cuerpo completo, centrado y apoyado en la
base de cada celda, mirando a la izquierda.

FILA 1: reposo (bucle de 6 frames con respiración y balanceo).
FILA 2: avance (6 frames corriendo/embistiendo).
FILA 3: ataque (6 frames: carga, golpe con estela, impacto y retorno).
FILA 4: daño (3 frames de retroceso) + muerte (3 frames de caída).
FILA 5: habilidad (6 frames de hechizo con glow y mandala bajo los pies).
```

Guárdalo en `img/sprites/<id>/sprite.png` (carpeta por personaje) y yo lo integro en la batalla.