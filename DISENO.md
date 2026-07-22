# Diseño - Juego de Estrategia Isométrico

## Concepto
Juego de estrategia en tiempo real (RTS) sencillo con vista isométrica, inspirado en Age of Empires / Command & Conquer. Se ejecuta en el navegador con Three.js.

## Mecánicas Principales

### Unidades
- **Soldados Rojos**: unidades del jugador
- **Soldados Grises**: unidades enemigas
- Cada soldado es un cubo simple con una "cabeza" (esfera) encima
- Barra de vida sobre cada unidad

### Selección
- Click izquierdo: seleccionar una unidad
- Click izquierdo + arrastrar: selección rectangular (como en RTS clásicos)
- Shift+click: añadir/quitar unidad de la selección
- Las unidades seleccionadas muestran un anillo verde debajo

### Movimiento
- Click derecho en el terreno: las unidades seleccionadas se mueven en formación
- Formación en cuadrícula: las unidades se distribuyen alrededor del punto objetivo
- **Pathfinding A***: las unidades rodean obstáculos y se mueven por el grid
- Click derecho sobre un enemigo: unidades van a atacar a ese enemigo concreto

### Combate
- Solo atacan cuando el jugador lo ordena (click derecho sobre enemigo)
- Rango de ataque: ~2.5 unidades de distancia
- Daño por golpe: 1 punto de vida
- Vida por soldado: 3 puntos
- Cadena de ataque: 1 golpe por segundo
- **Los enemigos se defienden**: al recibir daño, persiguen y atacan al agresor
- Al morir un enemigo: el jugador gana 1 soldado rojo (spawnea cerca del asesino)

### Sistema de Oleadas
- Cada 18 segundos aparece una oleada de enemigos
- Cada oleada tiene más enemigos: base 3 + (oleada-1) * 2
- Los enemigos spawnean en los bordes del mapa (derecha, arriba, o esquina)
- Spawnean en subgrupos con 800ms de separación entre cada uno
- **Los enemigos usan pathfinding** para llegar al jugador
- Los enemigos atacan la unidad roja más cercana automáticamente

### Condiciones de Victoria/Derrota
- Victoria: no existe (las oleadas son infinitas, aguanta lo más posible)
- Derrota: perder todos los soldados rojos
- Mensaje en pantalla al perder

## Tecnología
- **Three.js** (vía CDN): renderizado 3D
- **Cámara ortográfica**: vista isométrica
- **Raycasting**: para detectar clicks en el suelo y selección de unidades
- **A***: pathfinding en grid para movimiento de unidades
- **Servidor**: Python http.server en puerto 3002

## Estructura de Archivos
```
game_strategy/
├── DISENO.md          # Este archivo
├── index.html         # Página principal
├── css/
│   └── style.css      # Estilos
└── js/
    └── game.js        # Toda la lógica del juego
```

## Configuración del Terreno
- Grid de 20x20 casillas
- Tamaño de cada casilla: 2 unidades
- Superficie verde (hierba)
- Unidades rojas empiezan en el lado izquierdo
- Unidades grises empiezan en el lado derecho

## Unidades Iniciales
- 5 soldados rojos (jugador)
- 5 soldados grises (enemigo)

## Controles
- **Click izquierdo**: Seleccionar unidad / Selección rectangular
- **Click derecho**: Mover unidades en formación / Atacar enemigo
- **Shift+click**: Añadir/quitar de selección
- **Escape**: Deseleccionar todas las unidades
