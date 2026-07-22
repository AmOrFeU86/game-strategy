# Plan: Bases HQ y Victoria/Derrota

## Resumen
Añadir HQ para ambos bandos con sistema de victoria/derrota y IA enemiga mejorada.

---

## 1. Estructuras HQ

### HQ Jugador (rojo)
- **Ubicación**: Esquina inferior izquierda
- **HP**: 50
- **Visual**: Edificio grande con bandera roja
- **Tamaño**: 3x3 celdas

### HQ Enemigo (gris)
- **Ubicación**: Esquina superior derecha
- **HP**: 50
- **Visual**: Edificio grande con bandera gris
- **Tamaño**: 3x3 celdas
- **Defensas**: 2 torretas

---

## 2. Torretas Enemigas

| Torreta | HP | Daño | Rango | Cadencia |
|---------|-----|------|-------|----------|
| Torreta | 8 | 1 | 4.0 | 1500ms |

- Atacan automáticamente unidades rojas cercanas
- Se pueden destruir
- Ubicadas cerca del HQ enemigo

---

## 3. IA Enemiga Mejorada

```
Enemigo spawna
    │
    ├─ ¿Tropas rojas en rango 6?
    │       ↓ Sí
    │   Atacar tropas
    │       ↓ No
    │
    └─ Moverse hacia HQ jugador
            │
        Al llegar → Atacar HQ
```

### Prioridades:
1. **Defensa propia**: Si hay tropas en rango 6, atacarlas
2. **Objetivo principal**: Moverse hacia HQ jugador
3. **Oportunismo**: Si tropas bloquean camino, atacarlas

---

## 4. Condiciones Victoria/Derrota

| Condición | Resultado |
|-----------|-----------|
| HQ enemigo HP = 0 | **VICTORIA** |
| Tu HQ HP = 0 | **DERROTA** |

---

## 5. Cambios en Código

### Nuevas variables
```javascript
let playerHQ = null;
let enemyHQ = null;
```

### Nuevas constantes
```javascript
const HQ_HP = 50;
const TURRET_HP = 8;
const TURRET_DAMAGE = 1;
const TURRET_RANGE = 4.0;
const TURRET_COOLDOWN = 1500;
```

### Nuevas funciones
- `createHQ(x, z, team)` - Crear HQ
- `createTurret(x, z, team)` - Crear torreta
- `attackStructure(unit, structure)` - Atacar estructura
- `checkHQDestroyed()` - Verificar HQ destruido

### Modificaciones
- `moveUnit()` - IA enemiga ataca HQ
- `checkGameOver()` - Condiciones victoria/derrota
- `spawnWaveEnemy()` - Enemigos van hacia HQ
- `animate()` - Torretas disparan

---

## 6. Flujo del Juego

```
Inicio
  │
  ├─ HQ jugador (abajo-izq) + HQ enemigo (arriba-der)
  │
  ├─ Enemigos spawnean y van hacia tu HQ
  │
  ├─ Tú defiendes y compras unidades
  │
  ├─ Si tropas enemigas te ven → te atacan
  │
  ├─ Si destruyes HQ enemigo → VICTORIA
  │
  └─ Si tu HQ es destruido → DERROTA
```

---

## 7. Orden de Implementación

1. **Crear HQ** (jugador y enemigo)
2. **Crear torretas** enemigas
3. **Modificar IA** enemiga para atacar HQ
4. **Añadir ataque a estructuras** (HP)
5. **Condiciones victoria/derrota**
6. **UI de victoria/derrota**

---

## 8. Preguntas

- ¿Las torretas se regeneran o se destruyen permanentemente?
- ¿Qué pasa cuando ganas/pierdes? ¿Reiniciar o menú?
- ¿Quieres que los enemigos dejen de spawnean cuando destruyes su HQ?
