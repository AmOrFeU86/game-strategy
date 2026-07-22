import * as THREE from 'three';

const GRID_SIZE = 20;
const CELL_SIZE = 2;
const HALF_GRID = (GRID_SIZE * CELL_SIZE) / 2;
const SOLDIER_SPEED = 8;
const ATTACK_RANGE = 2.5;
const ATTACK_DAMAGE = 1;
const ATTACK_COOLDOWN = 1000;
const SOLDIER_HP = 3;

const WAVE_INTERVAL = 18;
const WAVE_BASE_COUNT = 3;
const WAVE_GROWTH = 2;
const SUBGROUP_DELAY = 800;

// Unit type configurations
const UNIT_TYPES = {
    soldier: {
        name: 'Soldado',
        hp: 3,
        speed: 8,
        damage: 1,
        attackRange: 2.5,
        attackCooldown: 1000,
        scale: 1.0,
        color: 0xcc3333,
        canHeal: false
    },
    tank: {
        name: 'Tanque',
        hp: 8,
        speed: 4,
        damage: 2,
        attackRange: 2.0,
        attackCooldown: 1500,
        scale: 1.4,
        color: 0x8b4513,
        canHeal: false
    },
    sniper: {
        name: 'Francotirador',
        hp: 2,
        speed: 6,
        damage: 3,
        attackRange: 6.0,
        attackCooldown: 2000,
        scale: 0.9,
        color: 0x2e8b57,
        canHeal: false
    },
    medic: {
        name: 'Médico',
        hp: 2,
        speed: 7,
        damage: 0,
        attackRange: 3.0,
        attackCooldown: 1000,
        scale: 0.95,
        color: 0xffffff,
        canHeal: true,
        healAmount: 1,
        healCooldown: 2000
    }
};

let scene, camera, renderer, raycaster, mouse;
let ground;
let units = [];
let selectedUnits = [];
let selectionStart = null;
let isDragging = false;
let gameOver = false;

let waveNumber = 0;
let waveTimer = WAVE_INTERVAL;
let waveSpawning = false;
let waveQueue = [];

const selectionBox = document.getElementById('selection-box');
const redCountEl = document.getElementById('red-count');
const grayCountEl = document.getElementById('gray-count');
const messageEl = document.getElementById('message');

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 30;
    camera = new THREE.OrthographicCamera(
        frustumSize * aspect / -2,
        frustumSize * aspect / 2,
        frustumSize / 2,
        frustumSize / -2,
        0.1,
        1000
    );

    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -25;
    directionalLight.shadow.camera.right = 25;
    directionalLight.shadow.camera.top = 25;
    directionalLight.shadow.camera.bottom = -25;
    scene.add(directionalLight);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    createGround();
    spawnInitialUnits();
    setupEventListeners();
    animate();
}

function createGround() {
    const groundGeom = new THREE.PlaneGeometry(GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x4a7c3f });
    ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.name = 'ground';
    scene.add(ground);

    const lineMat = new THREE.LineBasicMaterial({ color: 0x3d6b35, transparent: true, opacity: 0.3 });
    for (let i = 0; i <= GRID_SIZE; i++) {
        const pos = i * CELL_SIZE - HALF_GRID;
        const points1 = [new THREE.Vector3(pos, 0.01, -HALF_GRID), new THREE.Vector3(pos, 0.01, HALF_GRID)];
        const points2 = [new THREE.Vector3(-HALF_GRID, 0.01, pos), new THREE.Vector3(HALF_GRID, 0.01, pos)];
        const lineGeom1 = new THREE.BufferGeometry().setFromPoints(points1);
        const lineGeom2 = new THREE.BufferGeometry().setFromPoints(points2);
        scene.add(new THREE.Line(lineGeom1, lineMat));
        scene.add(new THREE.Line(lineGeom2, lineMat));
    }
}

function createSoldier(x, z, team, unitType = 'soldier') {
    const group = new THREE.Group();
    const isRed = team === 'red';
    const typeConfig = UNIT_TYPES[unitType];
    const scale = typeConfig.scale;

    // Body colors based on type
    let bodyColor, helmetColor;
    if (unitType === 'tank') {
        bodyColor = isRed ? 0x8b2500 : 0x3d3d3d;
        helmetColor = isRed ? 0x6b1c00 : 0x2d2d2d;
    } else if (unitType === 'sniper') {
        bodyColor = isRed ? 0x228b22 : 0x2e572e;
        helmetColor = isRed ? 0x1a6b1a : 0x1d3d1d;
    } else if (unitType === 'medic') {
        bodyColor = isRed ? 0xcc3333 : 0xffffff;
        helmetColor = isRed ? 0xaa2222 : 0xdddddd;
    } else {
        bodyColor = isRed ? 0xcc3333 : 0x556b2f;
        helmetColor = isRed ? 0x993333 : 0x3d5c3d;
    }
    const skinColor = isRed ? 0xffccaa : 0xddb899;
    const bootColor = isRed ? 0x8b4513 : 0x3d2b1f;
    const gunColor = 0x222222;

    // Body (torso)
    const bodyGeom = new THREE.BoxGeometry(0.35 * scale, 0.45 * scale, 0.25 * scale);
    const bodyMat = new THREE.MeshLambertMaterial({ color: bodyColor });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = 0.72 * scale;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeom = new THREE.SphereGeometry(0.14 * scale, 8, 8);
    const headMat = new THREE.MeshLambertMaterial({ color: skinColor });
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = 1.12 * scale;
    head.castShadow = true;
    group.add(head);

    // Helmet
    const helmetGeom = new THREE.SphereGeometry(0.17 * scale, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.6);
    const helmetMat = new THREE.MeshLambertMaterial({ color: helmetColor });
    const helmet = new THREE.Mesh(helmetGeom, helmetMat);
    helmet.position.y = 1.18 * scale;
    helmet.castShadow = true;
    group.add(helmet);

    // Left Arm
    const armGeom = new THREE.BoxGeometry(0.12 * scale, 0.35 * scale, 0.12 * scale);
    const leftArm = new THREE.Mesh(armGeom, bodyMat);
    leftArm.position.set(-0.28 * scale, 0.7 * scale, 0);
    leftArm.castShadow = true;
    group.add(leftArm);

    // Right Arm
    const rightArm = new THREE.Mesh(armGeom, bodyMat);
    rightArm.position.set(0.28 * scale, 0.7 * scale, 0);
    rightArm.castShadow = true;
    group.add(rightArm);

    // Left Leg
    const legGeom = new THREE.BoxGeometry(0.13 * scale, 0.35 * scale, 0.13 * scale);
    const bootGeom = new THREE.BoxGeometry(0.14 * scale, 0.12 * scale, 0.18 * scale);
    const leftLeg = new THREE.Mesh(legGeom, new THREE.MeshLambertMaterial({ color: bodyColor }));
    leftLeg.position.set(-0.1 * scale, 0.25 * scale, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);
    const leftBoot = new THREE.Mesh(bootGeom, new THREE.MeshLambertMaterial({ color: bootColor }));
    leftBoot.position.set(-0.1 * scale, 0.06 * scale, 0.02);
    leftBoot.castShadow = true;
    group.add(leftBoot);

    // Right Leg
    const rightLeg = new THREE.Mesh(legGeom, new THREE.MeshLambertMaterial({ color: bodyColor }));
    rightLeg.position.set(0.1 * scale, 0.25 * scale, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);
    const rightBoot = new THREE.Mesh(bootGeom, new THREE.MeshLambertMaterial({ color: bootColor }));
    rightBoot.position.set(0.1 * scale, 0.06 * scale, 0.02);
    rightBoot.castShadow = true;
    group.add(rightBoot);

    // Weapon based on type
    let gun;
    if (unitType === 'sniper') {
        // Long sniper rifle
        const rifleBarrel = new THREE.CylinderGeometry(0.015, 0.015, 0.8, 6);
        gun = new THREE.Mesh(rifleBarrel, new THREE.MeshLambertMaterial({ color: gunColor }));
        gun.position.set(0.32 * scale, 0.7 * scale, 0.25);
        gun.rotation.x = Math.PI / 2;
    } else if (unitType === 'tank') {
        // Heavy machine gun
        const mgBarrel = new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8);
        gun = new THREE.Mesh(mgBarrel, new THREE.MeshLambertMaterial({ color: gunColor }));
        gun.position.set(0.35 * scale, 0.65 * scale, 0.15);
        gun.rotation.x = Math.PI / 2;
    } else if (unitType === 'medic') {
        // Medkit (white box with cross)
        const medkitGeom = new THREE.BoxGeometry(0.15, 0.12, 0.08);
        gun = new THREE.Mesh(medkitGeom, new THREE.MeshLambertMaterial({ color: 0xffffff }));
        gun.position.set(0.35 * scale, 0.6 * scale, 0.1);
    } else {
        // Standard rifle
        const rifleBarrel = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6);
        gun = new THREE.Mesh(rifleBarrel, new THREE.MeshLambertMaterial({ color: gunColor }));
        gun.position.set(0.32 * scale, 0.65 * scale, 0.2);
        gun.rotation.x = Math.PI / 2;
    }
    gun.castShadow = true;
    group.add(gun);

    // Medic cross on helmet
    if (unitType === 'medic') {
        const crossMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.02), crossMat);
        crossH.position.set(0, 1.25 * scale, 0.15 * scale);
        group.add(crossH);
        const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.02), crossMat);
        crossV.position.set(0, 1.25 * scale, 0.15 * scale);
        group.add(crossV);
    }

    // Selection ring
    const selGeom = new THREE.RingGeometry(0.28 * scale, 0.38 * scale, 16);
    const selMat = new THREE.MeshBasicMaterial({ color: isRed ? 0x00ff00 : 0xff0000, side: THREE.DoubleSide });
    const selRing = new THREE.Mesh(selGeom, selMat);
    selRing.rotation.x = -Math.PI / 2;
    selRing.position.y = 0.02;
    selRing.visible = false;
    group.add(selRing);

    // HP Bar background
    const hpBarBgGeom = new THREE.PlaneGeometry(0.5, 0.06);
    const hpBarBgMat = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
    const hpBarBg = new THREE.Mesh(hpBarBgGeom, hpBarBgMat);
    hpBarBg.position.y = 1.45 * scale;
    hpBarBg.rotation.x = -Math.PI / 4;
    group.add(hpBarBg);

    // HP Bar
    const hpBarGeom = new THREE.PlaneGeometry(0.5, 0.06);
    const hpBarMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const hpBar = new THREE.Mesh(hpBarGeom, hpBarMat);
    hpBar.position.y = 1.45;
    hpBar.position.z = 0.001;
    hpBar.rotation.x = -Math.PI / 4;
    group.add(hpBar);

    group.position.set(x, 0, z);

    const unit = {
        mesh: group,
        team,
        unitType,
        typeConfig,
        hp: typeConfig.hp,
        maxHp: typeConfig.hp,
        speed: typeConfig.speed,
        damage: typeConfig.damage,
        attackRange: typeConfig.attackRange,
        attackCooldown: typeConfig.attackCooldown,
        canHeal: typeConfig.canHeal,
        healAmount: typeConfig.healAmount || 0,
        healCooldown: typeConfig.healCooldown || 2000,
        lastHealTime: 0,
        selected: false,
        selRing,
        hpBar,
        target: null,
        path: [],
        pathIndex: 0,
        attackTarget: null,
        lastAttackTime: 0,
        lastAttacker: null,
        alive: true,
        // Animation parts
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
        leftBoot,
        rightBoot,
        gun,
        walkPhase: Math.random() * Math.PI * 2,
        isMoving: false
    };

    scene.add(group);
    units.push(unit);
    return unit;
}

function spawnInitialUnits() {
    // Red team (player) - mixed units
    createSoldier(-HALF_GRID + 4, -2, 'red', 'soldier');
    createSoldier(-HALF_GRID + 6, -2, 'red', 'soldier');
    createSoldier(-HALF_GRID + 8, -2, 'red', 'tank');
    createSoldier(-HALF_GRID + 4, 0, 'red', 'sniper');
    createSoldier(-HALF_GRID + 6, 0, 'red', 'medic');

    // Gray team (enemy) - mixed units
    createSoldier(HALF_GRID - 4, -2, 'gray', 'soldier');
    createSoldier(HALF_GRID - 6, -2, 'gray', 'soldier');
    createSoldier(HALF_GRID - 8, -2, 'gray', 'tank');
    createSoldier(HALF_GRID - 4, 0, 'gray', 'sniper');
    createSoldier(HALF_GRID - 6, 0, 'gray', 'medic');
}

function worldToGrid(x, z) {
    return {
        gx: Math.floor((x + HALF_GRID) / CELL_SIZE),
        gz: Math.floor((z + HALF_GRID) / CELL_SIZE)
    };
}

function gridToWorld(gx, gz) {
    return {
        x: gx * CELL_SIZE - HALF_GRID + CELL_SIZE / 2,
        z: gz * CELL_SIZE - HALF_GRID + CELL_SIZE / 2
    };
}

function isValidCell(gx, gz) {
    return gx >= 0 && gx < GRID_SIZE && gz >= 0 && gz < GRID_SIZE;
}

function heuristic(a, b) {
    const dx = Math.abs(a.gx - b.gx);
    const dz = Math.abs(a.gz - b.gz);
    return Math.max(dx, dz) + (Math.SQRT2 - 1) * Math.min(dx, dz);
}

function aStar(startWorld, endWorld) {
    const start = worldToGrid(startWorld.x, startWorld.z);
    const end = worldToGrid(endWorld.x, endWorld.z);

    if (!isValidCell(start.gx, start.gz) || !isValidCell(end.gx, end.gz)) return [];

    const openSet = [start];
    const cameFrom = {};
    const gScore = {};
    const fScore = {};
    const key = (gx, gz) => `${gx},${gz}`;

    gScore[key(start.gx, start.gz)] = 0;
    fScore[key(start.gx, start.gz)] = heuristic(start, end);

    const closedSet = new Set();

    while (openSet.length > 0) {
        openSet.sort((a, b) => (fScore[key(a.gx, a.gz)] || Infinity) - (fScore[key(b.gx, b.gz)] || Infinity));
        const current = openSet.shift();
        const ck = key(current.gx, current.gz);

        if (current.gx === end.gx && current.gz === end.gz) {
            const path = [current];
            let k = ck;
            while (cameFrom[k]) {
                path.unshift(cameFrom[k]);
                k = key(cameFrom[k].gx, cameFrom[k].gz);
            }
            return path.map(c => {
                const w = gridToWorld(c.gx, c.gz);
                return new THREE.Vector3(w.x, 0, w.z);
            });
        }

        closedSet.add(ck);

        const neighborDefs = [
            { gx: 1, gz: 0, cost: 1 },
            { gx: -1, gz: 0, cost: 1 },
            { gx: 0, gz: 1, cost: 1 },
            { gx: 0, gz: -1, cost: 1 },
            { gx: 1, gz: 1, cost: Math.SQRT2 },
            { gx: -1, gz: 1, cost: Math.SQRT2 },
            { gx: 1, gz: -1, cost: Math.SQRT2 },
            { gx: -1, gz: -1, cost: Math.SQRT2 },
        ];

        for (const nd of neighborDefs) {
            const n = { gx: current.gx + nd.gx, gz: current.gz + nd.gz };
            if (!isValidCell(n.gx, n.gz)) continue;
            const nk = key(n.gx, n.gz);
            if (closedSet.has(nk)) continue;

            const tentativeG = (gScore[ck] || 0) + nd.cost;
            if (tentativeG < (gScore[nk] || Infinity)) {
                cameFrom[nk] = current;
                gScore[nk] = tentativeG;
                fScore[nk] = tentativeG + heuristic(n, end);
                if (!openSet.some(o => o.gx === n.gx && o.gz === n.gz)) {
                    openSet.push(n);
                }
            }
        }
    }

    return [];
}

function getGroundIntersection(clientX, clientY) {
    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(ground);
    return intersects.length > 0 ? intersects[0].point : null;
}

function getUnitsInRect(x1, y1, x2, y2) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    return units.filter(u => {
        if (!u.alive || u.team !== 'red') return false;
        const screenPos = u.mesh.position.clone().project(camera);
        const sx = (screenPos.x + 1) / 2 * window.innerWidth;
        const sy = (-screenPos.y + 1) / 2 * window.innerHeight;
        return sx >= minX && sx <= maxX && sy >= minY && sy <= maxY;
    });
}

function selectUnit(unit) {
    if (unit.team !== 'red') return;
    unit.selected = true;
    unit.selRing.visible = true;
    if (!selectedUnits.includes(unit)) selectedUnits.push(unit);
}

function deselectAll() {
    selectedUnits.forEach(u => {
        u.selected = false;
        u.selRing.visible = false;
    });
    selectedUnits = [];
}

function findNearestEnemy(unit) {
    let nearest = null;
    let minDist = Infinity;
    for (const other of units) {
        if (!other.alive || other.team === unit.team) continue;
        const dist = unit.mesh.position.distanceTo(other.mesh.position);
        if (dist < minDist) {
            minDist = dist;
            nearest = other;
        }
    }
    return nearest;
}

function computeFormationPositions(center, count) {
    const positions = [];
    if (count === 1) {
        positions.push(center.clone());
        return positions;
    }

    const cols = Math.ceil(Math.sqrt(count));
    const spacing = 1.5;
    const offsetX = (cols - 1) * spacing / 2;

    for (let i = 0; i < count; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        positions.push(new THREE.Vector3(
            center.x + col * spacing - offsetX,
            0,
            center.z + row * spacing
        ));
    }
    return positions;
}

function moveUnit(unit, dt) {
    // Medic healing logic
    if (unit.canHeal && unit.team === 'red') {
        const now = Date.now();
        if (now - unit.lastHealTime >= unit.healCooldown) {
            // Find nearby injured allies
            for (const other of units) {
                if (!other.alive || other.team !== unit.team || other === unit) continue;
                if (other.hp >= other.maxHp) continue;
                const dist = unit.mesh.position.distanceTo(other.mesh.position);
                if (dist <= unit.attackRange) {
                    other.hp = Math.min(other.hp + unit.healAmount, other.maxHp);
                    unit.lastHealTime = now;
                    // Visual feedback - flash green
                    other.hpBar.material.color.setHex(0x00ff00);
                    break;
                }
            }
        }
    }

    if (unit.attackTarget && unit.attackTarget.alive) {
        const dist = unit.mesh.position.distanceTo(unit.attackTarget.mesh.position);
        if (dist <= unit.attackRange) {
            unit.path = [];
            unit.pathIndex = 0;
            unit.target = null;
            const now = Date.now();
            if (now - unit.lastAttackTime >= unit.attackCooldown) {
                // Medics don't attack enemies
                if (!unit.canHeal) {
                    unit.attackTarget.hp -= unit.damage;
                    unit.attackTarget.lastAttacker = unit;
                    unit.lastAttackTime = now;
                    if (unit.attackTarget.hp <= 0) {
                        killUnit(unit.attackTarget);
                        unit.attackTarget = null;
                    }
                }
            }
            return;
        } else {
            unit.target = unit.attackTarget.mesh.position.clone();
            if (unit.path.length === 0) {
                unit.path = aStar(unit.mesh.position, unit.target);
                unit.pathIndex = 0;
            }
        }
    } else if (unit.attackTarget && !unit.attackTarget.alive) {
        unit.attackTarget = null;
        unit.path = [];
        unit.pathIndex = 0;
    }

    if (unit.team === 'gray' && !unit.attackTarget && !unit.target) {
        const nearest = findNearestEnemy(unit);
        if (nearest) {
            unit.attackTarget = nearest;
        }
        return;
    }

    if (unit.path.length > 0) {
        const waypoint = unit.path[unit.pathIndex];
        const dir = new THREE.Vector3().subVectors(waypoint, unit.mesh.position);
        dir.y = 0;
        const dist = dir.length();

        if (dist < 0.3) {
            unit.pathIndex++;
            if (unit.pathIndex >= unit.path.length) {
                unit.path = [];
                unit.pathIndex = 0;
            }
            return;
        }

        dir.normalize();
        unit.mesh.position.add(dir.multiplyScalar(unit.speed * dt));
        unit.mesh.rotation.y = Math.atan2(dir.x, dir.z);
        unit.isMoving = true;
        return;
    }

    if (!unit.target) return;

    const dir = new THREE.Vector3().subVectors(unit.target, unit.mesh.position);
    dir.y = 0;
    const dist = dir.length();

    if (dist < 0.3) {
        unit.target = null;
        return;
    }

    dir.normalize();
    unit.mesh.position.add(dir.multiplyScalar(unit.speed * dt));
    unit.mesh.rotation.y = Math.atan2(dir.x, dir.z);
    unit.isMoving = true;
}

function animateUnit(unit, dt) {
    if (!unit.alive) return;

    // Animate target indicator (flashing red ring)
    if (unit.targetIndicator && unit.targetIndicator.visible) {
        unit.targetFlashTime += dt;
        const flash = Math.sin(unit.targetFlashTime * 12) * 0.3 + 0.5;
        unit.targetIndicator.material.opacity = flash;
        unit.targetIndicator.rotation.z += dt * 3;

        // Hide after 2 seconds
        if (unit.targetFlashTime > 2) {
            unit.targetIndicator.visible = false;
        }
    }

    const speed = 10;
    const limbSwing = 0.6;
    const armSwing = 0.5;

    if (unit.isMoving) {
        unit.walkPhase += dt * speed;

        const legSwing = Math.sin(unit.walkPhase) * limbSwing;
        const armSwingVal = Math.sin(unit.walkPhase) * armSwing;

        // Legs
        if (unit.leftLeg) unit.leftLeg.rotation.x = legSwing;
        if (unit.rightLeg) unit.rightLeg.rotation.x = -legSwing;
        if (unit.leftBoot) unit.leftBoot.position.z = 0.02 + Math.sin(unit.walkPhase) * 0.1;
        if (unit.rightBoot) unit.rightBoot.position.z = 0.02 - Math.sin(unit.walkPhase) * 0.1;

        // Arms
        if (unit.leftArm) unit.leftArm.rotation.x = -armSwingVal;
        if (unit.rightArm) unit.rightArm.rotation.x = armSwingVal;

        // Gun follows right arm
        if (unit.gun) unit.gun.rotation.x = Math.PI / 2 + armSwingVal * 0.5;

        // Body bob
        unit.mesh.children[0].position.y = 0.72 + Math.abs(Math.sin(unit.walkPhase * 2)) * 0.03;

        unit.isMoving = false;
    } else {
        // Smooth return to idle
        if (unit.leftLeg) unit.leftLeg.rotation.x *= 0.85;
        if (unit.rightLeg) unit.rightLeg.rotation.x *= 0.85;
        if (unit.leftArm) unit.leftArm.rotation.x *= 0.85;
        if (unit.rightArm) unit.rightArm.rotation.x *= 0.85;
        if (unit.leftBoot) unit.leftBoot.position.z += (0.02 - unit.leftBoot.position.z) * 0.15;
        if (unit.rightBoot) unit.rightBoot.position.z += (0.02 - unit.rightBoot.position.z) * 0.15;
        unit.mesh.children[0].position.y += (0.72 - unit.mesh.children[0].position.y) * 0.15;
    }
}

function killUnit(unit) {
    unit.alive = false;
    scene.remove(unit.mesh);

    const idx = units.indexOf(unit);
    if (idx !== -1) units.splice(idx, 1);

    const selIdx = selectedUnits.indexOf(unit);
    if (selIdx !== -1) selectedUnits.splice(selIdx, 1);

    if (unit.team === 'gray') {
        const killer = selectedUnits.length > 0 ? selectedUnits[0] : units.find(u => u.team === 'red' && u.alive);
        if (killer) {
            const offsetX = (Math.random() - 0.5) * 2;
            const offsetZ = (Math.random() - 0.5) * 2;
            // Spawn same type as the killed unit
            const newUnit = createSoldier(
                killer.mesh.position.x + offsetX,
                killer.mesh.position.z + offsetZ,
                'red',
                unit.unitType
            );
            selectUnit(newUnit);
        }
    }

    updateUI();
}

function updateUI() {
    const redUnits = units.filter(u => u.alive && u.team === 'red');
    const grayUnits = units.filter(u => u.alive && u.team === 'gray');
    
    // Count by type
    const redCounts = {};
    const grayCounts = {};
    redUnits.forEach(u => { redCounts[u.unitType] = (redCounts[u.unitType] || 0) + 1; });
    grayUnits.forEach(u => { grayCounts[u.unitType] = (grayCounts[u.unitType] || 0) + 1; });
    
    // Format display
    const formatCounts = (counts) => {
        return Object.entries(counts).map(([type, count]) => {
            const icon = type === 'tank' ? '🛡️' : type === 'sniper' ? '🎯' : type === 'medic' ? '💊' : '⚔️';
            return `${icon}${count}`;
        }).join(' ');
    };
    
    redCountEl.textContent = `Rojos: ${redUnits.length} ${formatCounts(redCounts)}`;
    grayCountEl.textContent = `Grises: ${grayUnits.length} ${formatCounts(grayCounts)} | Oleada: ${waveNumber}`;
}

function checkGameOver() {
    const redCount = units.filter(u => u.alive && u.team === 'red').length;

    if (redCount === 0 && !gameOver) {
        gameOver = true;
        messageEl.textContent = 'DERROTA';
        messageEl.className = 'lose';
    }
}

function spawnWaveEnemy() {
    const edge = Math.floor(Math.random() * 3);
    let x, z;
    if (edge === 0) {
        x = HALF_GRID - 2;
        z = (Math.random() - 0.5) * HALF_GRID * 1.6;
    } else if (edge === 1) {
        x = (Math.random() - 0.5) * HALF_GRID * 1.6;
        z = HALF_GRID - 2;
    } else {
        x = HALF_GRID - 2;
        z = HALF_GRID - 2;
    }

    // Random unit type for waves
    const types = ['soldier', 'soldier', 'soldier', 'tank', 'sniper'];
    const unitType = types[Math.floor(Math.random() * types.length)];
    
    const unit = createSoldier(x, z, 'gray', unitType);
    const nearest = findNearestEnemy(unit);
    if (nearest) unit.attackTarget = nearest;
}

function updateWaves(dt) {
    if (waveQueue.length > 0) {
        const now = Date.now();
        while (waveQueue.length > 0 && now >= waveQueue[0].time) {
            spawnWaveEnemy();
            waveQueue.shift();
        }
    }

    waveTimer -= dt;
    if (waveTimer <= 0 && !waveSpawning) {
        waveSpawning = true;
        waveNumber++;
        const count = WAVE_BASE_COUNT + (waveNumber - 1) * WAVE_GROWTH;
        const now = Date.now();

        for (let i = 0; i < count; i++) {
            waveQueue.push({ time: now + i * SUBGROUP_DELAY });
        }

        waveTimer = WAVE_INTERVAL;
        waveSpawning = false;
    }
}

function setupEventListeners() {
    const canvas = renderer.domElement;

    canvas.addEventListener('mousedown', (e) => {
        if (gameOver) return;
        if (e.button === 0) {
            selectionStart = { x: e.clientX, y: e.clientY };
            isDragging = false;
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (gameOver) return;
        if (selectionStart && e.button === 0) {
            const dx = e.clientX - selectionStart.x;
            const dy = e.clientY - selectionStart.y;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                isDragging = true;
                selectionBox.style.display = 'block';
                const x = Math.min(selectionStart.x, e.clientX);
                const y = Math.min(selectionStart.y, e.clientY);
                const w = Math.abs(dx);
                const h = Math.abs(dy);
                selectionBox.style.left = x + 'px';
                selectionBox.style.top = y + 'px';
                selectionBox.style.width = w + 'px';
                selectionBox.style.height = h + 'px';
            }
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        if (gameOver) return;
        if (e.button === 0) {
            if (isDragging && selectionStart) {
                const selected = getUnitsInRect(selectionStart.x, selectionStart.y, e.clientX, e.clientY);
                deselectAll();
                selected.forEach(u => selectUnit(u));
            } else {
                const point = getGroundIntersection(e.clientX, e.clientY);
                if (point) {
                    const clickedUnits = units.filter(u => {
                        if (!u.alive) return false;
                        const dist = new THREE.Vector2(u.mesh.position.x - point.x, u.mesh.position.z - point.z).length();
                        return dist < 1;
                    });

                    if (clickedUnits.length > 0) {
                        const clickedUnit = clickedUnits[0];
                        if (clickedUnit.team === 'red') {
                            if (e.shiftKey) {
                                if (clickedUnit.selected) {
                                    clickedUnit.selected = false;
                                    clickedUnit.selRing.visible = false;
                                    selectedUnits = selectedUnits.filter(u => u !== clickedUnit);
                                } else {
                                    selectUnit(clickedUnit);
                                }
                            } else {
                                deselectAll();
                                selectUnit(clickedUnit);
                            }
                        }
                    } else {
                        if (!e.shiftKey) deselectAll();
                        const formationPositions = computeFormationPositions(point, selectedUnits.length);
                        selectedUnits.forEach((u, i) => {
                            u.target = formationPositions[i];
                            u.attackTarget = null;
                            u.path = aStar(u.mesh.position, formationPositions[i]);
                            u.pathIndex = 0;
                        });
                    }
                }
            }
            selectionStart = null;
            isDragging = false;
            selectionBox.style.display = 'none';
        }

        if (e.button === 2) {
            e.preventDefault();
            if (selectedUnits.length === 0) return;
            const point = getGroundIntersection(e.clientX, e.clientY);
            if (!point) return;

            const clickedEnemy = units.find(u => {
                if (!u.alive || u.team !== 'gray') return false;
                const dist = new THREE.Vector2(u.mesh.position.x - point.x, u.mesh.position.z - point.z).length();
                return dist < 1.2;
            });

            if (clickedEnemy) {
                // Remove previous target indicator
                selectedUnits.forEach(u => {
                    if (u.attackTarget && u.attackTarget.targetIndicator) {
                        u.attackTarget.targetIndicator.visible = false;
                    }
                    u.attackTarget = clickedEnemy;
                    u.path = [];
                    u.pathIndex = 0;
                });

                // Create or show target indicator on enemy
                if (!clickedEnemy.targetIndicator) {
                    const indicatorGeom = new THREE.RingGeometry(0.5, 0.65, 16);
                    const indicatorMat = new THREE.MeshBasicMaterial({
                        color: 0xff0000,
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: 0.8
                    });
                    const indicator = new THREE.Mesh(indicatorGeom, indicatorMat);
                    indicator.rotation.x = -Math.PI / 2;
                    indicator.position.y = 0.03;
                    clickedEnemy.mesh.add(indicator);
                    clickedEnemy.targetIndicator = indicator;
                    clickedEnemy.targetFlashTime = 0;
                }
                clickedEnemy.targetIndicator.visible = true;
                clickedEnemy.targetFlashTime = 0;
            } else {
                // Hide any target indicators when moving
                selectedUnits.forEach(u => {
                    if (u.attackTarget && u.attackTarget.targetIndicator) {
                        u.attackTarget.targetIndicator.visible = false;
                    }
                });

                const formationPositions = computeFormationPositions(point, selectedUnits.length);
                selectedUnits.forEach((u, i) => {
                    u.target = formationPositions[i];
                    u.attackTarget = null;
                    u.path = aStar(u.mesh.position, formationPositions[i]);
                    u.pathIndex = 0;
                });
            }
        }
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') deselectAll();
    });

    window.addEventListener('resize', () => {
        const aspect = window.innerWidth / window.innerHeight;
        const frustumSize = 30;
        camera.left = frustumSize * aspect / -2;
        camera.right = frustumSize * aspect / 2;
        camera.top = frustumSize / 2;
        camera.bottom = frustumSize / -2;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

let lastTime = 0;
function animate(time = 0) {
    requestAnimationFrame(animate);

    const dt = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;

    if (!gameOver) {
        updateWaves(dt);

        units.forEach(u => {
            if (u.alive) moveUnit(u, dt);
        });

        units.forEach(u => {
            if (u.alive) animateUnit(u, dt);
        });

        units.forEach(u => {
            if (u.alive && u.hp < u.maxHp) {
                const ratio = u.hp / u.maxHp;
                u.hpBar.scale.x = ratio;
                u.hpBar.position.x = -(1 - ratio) * 0.3;
                u.hpBar.material.color.setHex(ratio > 0.5 ? 0x00ff00 : ratio > 0.25 ? 0xffff00 : 0xff0000);
            }
        });

        checkGameOver();
    }

    renderer.render(scene, camera);
}

init();
