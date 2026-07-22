# Plan: Sistema de Economía, Construcción y Bases

## Resumen
Convertir el juego en un RTS/Tower Defense híbrido con:
- Economía basada en construcción de estructuras generadoras
- Sistema de compra de unidades y murallas
- Base del jugador para defender
- Base enemiga para destruir

---

## 1. Sistema de Economía

### Estructuras generadoras de dinero
| Estructura | Coste | Dinero/5s | HP | Tamaño |
|------------|-------|-----------|-----|--------|
| **Mina** | 50 | +10 | 5 | 1x1 |
| **Refinería** | 150 | +30 | 8 | 2x2 |

### Recursos iniciales
- Jugador empieza con **100 monedas**
- Matar enemigos da **+5 monedas** (bonus)

---

## 2. Unidades comprables

| Unidad | Coste | HP | Daño | Vel | Rango |
|--------|-------|-----|------|-----|-------|
| Soldado | 30 | 3 | 1 | 8 | 2.5 |
| Tanque | 100 | 8 | 2 | 4 | 2.0 |
| Francotirador | 75 | 2 | 3 | 6 | 6.0 |
| Médico | 50 | 2 | 0 | 7 | 3.0 |

---

## 3. Estructuras defensivas

### Murallas
| Tipo | Coste | HP | Tamaño |
|------|-------|-----|--------|
| Muro | 20 | 10 | 1x1 |
| Puerta | 40 | 10 | 1x1 (abrible) |

---

## 4. Sistema de Base

### Base del jugador (HQ)
- Ubicación: esquina inferior izquierda
- HP: 50
- Si se destruye → DERROTA

### Base enemiga (HQ + defensas)
- Ubicación: esquina superior derecha
- HP: 50
- Torretas defensivas: 3 torretas con HP
- Si se destruye → VICTORIA

---

## 5. Interfaz de Usuario

### Panel de compra (parte inferior)
```
┌─────────────────────────────────────────────────┐
│ 💰 150   ⚔️Soldado(30) 🛡️Tanque(100) 🎯Sniper(75) │
│         💊Médico(50)  🧱Muro(20)  🏭Mina(50)    │
└─────────────────────────────────────────────────┘
```

### Controles
- **Click izquierdo**: Seleccionar unidad
- **Click derecho**: Mover/Atacar
- **Tecla 1-6**: Comprar unidad/estructura
- **Click en grid**: Colocar estructura (modo construcción)
- **ESC**: Cancelar construcción

---

## 6. Flujo del juego

```
Inicio
  │
  ├─ Jugador tiene: 100 monedas, 3 soldados
  │
  ├─ Construye mina → genera dinero cada 5s
  │
  ├─ Compra más unidades
  │
  ├─ Construye murallas defensivas
  │
  ├─ Oleadas enemigas atacan
  │
  ├─ Jugador ataca base enemiga
  │
  └─ Victoria/Derrota
```

---

## 7. Cambios en el código

### Nuevas constantes
```javascript
const STARTING_MONEY = 100;
const KILL_BONUS = 5;
const MONEY_INTERVAL = 5000; // 5 segundos
```

### Nuevas funciones
- `createStructure(type, x, z, team)` - Crear edificio
- `buyUnit(type)` - Comprar unidad
- `placeStructure(type, gx, gz)` - Colocar estructura
- `updateMoney()` - Actualizar UI de dinero
- `generateIncome()` - Generar dinero pasivo
- `checkBaseDestroyed()` - Verificar condición victoria/derrota

### Modificaciones
- `createSoldier()` → añadir coste
- `killUnit()` → dar dinero por kill
- `animate()` → llamar generateIncome()
- UI → panel de compras

---

## 8. Ordene de implementación

1. **Dinero y UI** (base)
   - Variable money, display UI
   - Función buyUnit()
   
2. **Estructuras generadoras**
   - Mina y Refinería
   - Generación pasiva
   
3. **Murallas**
   - Colocación en grid
   - HP y destrucción
   
4. **Bases (HQ)**
   - HQ jugador y enemigo
   - Condiciones victoria/derrota
   
5. **Panel de compras**
   - Interfaz visual
   - Atajos de teclado
   
6. **Base enemiga**
   - Torretas defensivas
   - IA enemiga mejorada

---

## 9. Preguntas para el usuario

- ¿Empezamos con una mina ya construida?
- ¿Las torretas enemigas se pueden destruir?
- ¿Quieres que los enemigos también construyan?
