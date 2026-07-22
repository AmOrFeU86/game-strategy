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

// Economy
const STARTING_MONEY = 100;
const KILL_BONUS = 5;
const MONEY_INTERVAL = 5000;

// Game Mode: 'study' or 'exercise'
let gameMode = 'study';

// Exercise rewards
const EXERCISE_REWARDS = { 1: 10, 2: 25, 3: 50 };
const exercises = [
    { name: '1 Sentadilla', description: 'Haz 1 sentadilla', difficulty: 1 },
    { name: '1 Flexión', description: 'Haz 1 flexión', difficulty: 1 },
    { name: '5 Segundos Plancha', description: 'Mantén la plancha 5 segundos', difficulty: 1 }
];

// German Vocabulary Quiz
const QUIZ_REWARDS = { 1: 5, 2: 15, 3: 30 };
const vocabulary = [
    // Level 1 - Basic (5 coins)
    { word: 'Haus', answer: 'casa', difficulty: 1 },
    { word: 'Hund', answer: 'perro', difficulty: 1 },
    { word: 'Katze', answer: 'gato', difficulty: 1 },
    { word: 'Wasser', answer: 'agua', difficulty: 1 },
    { word: 'Essen', answer: 'comida', difficulty: 1 },
    { word: 'Sonne', answer: 'sol', difficulty: 1 },
    { word: 'Mond', answer: 'luna', difficulty: 1 },
    { word: 'Auto', answer: 'coche', difficulty: 1 },
    { word: 'Buch', answer: 'libro', difficulty: 1 },
    { word: 'Hand', answer: 'mano', difficulty: 1 },
    { word: 'Auge', answer: 'ojo', difficulty: 1 },
    { word: 'Rot', answer: 'rojo', difficulty: 1 },
    { word: 'Blau', answer: 'azul', difficulty: 1 },
    { word: 'Grün', answer: 'verde', difficulty: 1 },
    
    // Level 2 - Medium (15 coins)
    { word: 'Freund', answer: 'amigo', difficulty: 2 },
    { word: 'Familie', answer: 'familia', difficulty: 2 },
    { word: 'Schule', answer: 'escuela', difficulty: 2 },
    { word: 'Baum', answer: 'arbol', difficulty: 2 },
    { word: 'Stern', answer: 'estrella', difficulty: 2 },
    { word: 'Herz', answer: 'corazon', difficulty: 2 },
    { word: 'Zeit', answer: 'tiempo', difficulty: 2 },
    { word: 'Tag', answer: 'dia', difficulty: 2 },
    { word: 'Nacht', answer: 'noche', difficulty: 2 },
    { word: 'Groß', answer: 'grande', difficulty: 2 },
    { word: 'Klein', answer: 'pequeño', difficulty: 2 },
    { word: 'Gut', answer: 'bueno', difficulty: 2 },
    { word: 'Schlecht', answer: 'malo', difficulty: 2 },
    { word: 'Glücklich', answer: 'feliz', difficulty: 2 },
    { word: 'Traurig', answer: 'triste', difficulty: 2 },
    
    // Level 3 - Hard (30 coins)
    { word: 'Schön', answer: 'hermoso', difficulty: 3 },
    { word: 'Wichtig', answer: 'importante', difficulty: 3 },
    { word: 'Gefährlich', answer: 'peligroso', difficulty: 3 },
    { word: 'Abenteuer', answer: 'aventura', difficulty: 3 },
    { word: 'Wissen', answer: 'conocimiento', difficulty: 3 },
    { word: 'Berg', answer: 'montaña', difficulty: 3 },
    { word: 'Fluss', answer: 'río', difficulty: 3 },
    { word: 'Ozean', answer: 'océano', difficulty: 3 },
    { word: 'Blume', answer: 'flor', difficulty: 3 },
    { word: 'Schmetterling', answer: 'mariposa', difficulty: 3 }
];

// HQ and Turrets
const HQ_HP = 50;
const TURRET_HP = 8;
const TURRET_DAMAGE = 1;
const TURRET_RANGE = 4.0;
const TURRET_COOLDOWN = 1500;

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
        canHeal: false,
        cost: 30
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
        canHeal: false,
        cost: 100
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
        canHeal: false,
        cost: 75
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
        healCooldown: 2000,
        cost: 50
    }
};

// Structure types
const STRUCTURE_TYPES = {
    wall: {
        name: 'Muro',
        hp: 10,
        cost: 20,
        size: 1,
        color: 0x666666
    },
    mine: {
        name: 'Mina',
        hp: 5,
        cost: 50,
        size: 1,
        color: 0xdaa520,
        income: 10
    },
    refinery: {
        name: 'Refinería',
        hp: 8,
        cost: 150,
        size: 2,
        color: 0xcd853f,
        income: 30
    }
};

let scene, camera, renderer, raycaster, mouse;
let ground;
let units = [];
let structures = [];
let selectedUnits = [];
let selectionStart = null;
let isDragging = false;
let gameOver = false;

let money = STARTING_MONEY;
let lastMoneyTime = 0;

let waveNumber = 0;
let waveTimer = WAVE_INTERVAL;
let waveSpawning = false;
let waveQueue = [];

// Building mode
let buildMode = null; // null, 'wall', 'mine', 'refinery'
let buildPreview = null;

// HQ references
let playerHQ = null;
let enemyHQ = null;

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
    
    // Create HQs
    playerHQ = createHQ(-HALF_GRID + 4, -HALF_GRID + 4, 'red');
    enemyHQ = createHQ(HALF_GRID - 4, HALF_GRID - 4, 'gray');
    
    // Create enemy turrets
    createTurret(HALF_GRID - 8, HALF_GRID - 4, 'gray');
    createTurret(HALF_GRID - 4, HALF_GRID - 8, 'gray');
    
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

function checkCollision(x, z, excludeStructure = null) {
    for (const s of structures) {
        if (!s.alive || s === excludeStructure) continue;
        const halfSize = (s.size || 1) * CELL_SIZE / 2;
        const sx = s.mesh.position.x;
        const sz = s.mesh.position.z;
        
        if (Math.abs(x - sx) < halfSize + 0.5 && Math.abs(z - sz) < halfSize + 0.5) {
            return true;
        }
    }
    return false;
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

function alertNearbyAllies(attackedUnit, attacker) {
    if (!attackedUnit || !attacker || !attacker.alive) return;
    
    const alertRange = 8;
    
    for (const unit of units) {
        if (!unit.alive || unit.team !== attackedUnit.team) continue;
        if (unit === attackedUnit) continue;
        if (unit.attackTarget && unit.attackTarget.alive) continue; // Already fighting
        
        const dist = unit.mesh.position.distanceTo(attackedUnit.mesh.position);
        if (dist <= alertRange) {
            unit.attackTarget = attacker;
            unit.path = [];
            unit.pathIndex = 0;
        }
    }
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
                    
                    // Alert nearby allies when attacking
                    if (unit.attackTarget.hp > 0) {
                        alertNearbyAllies(unit.attackTarget, unit);
                    }
                    
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
        // Check for nearby player troops first (rango 6)
        const nearestTroop = findNearestEnemy(unit);
        if (nearestTroop) {
            const distToTroop = unit.mesh.position.distanceTo(nearestTroop.mesh.position);
            if (distToTroop <= 6) {
                unit.attackTarget = nearestTroop;
                return;
            }
        }
        
        // If no nearby troops, target player HQ
        if (playerHQ && playerHQ.alive) {
            unit.target = playerHQ.mesh.position.clone();
            if (unit.path.length === 0) {
                unit.path = aStar(unit.mesh.position, unit.target);
                unit.pathIndex = 0;
            }
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
        const newPos = unit.mesh.position.clone().add(dir.clone().multiplyScalar(unit.speed * dt));
        
        // Check collision before moving
        if (!checkCollision(newPos.x, newPos.z)) {
            unit.mesh.position.copy(newPos);
            unit.mesh.rotation.y = Math.atan2(dir.x, dir.z);
            unit.isMoving = true;
        } else {
            // Skip this waypoint and try next
            unit.pathIndex++;
            if (unit.pathIndex >= unit.path.length) {
                unit.path = [];
                unit.pathIndex = 0;
            }
        }
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
    const newPos = unit.mesh.position.clone().add(dir.clone().multiplyScalar(unit.speed * dt));
    
    // Check collision before moving
    if (!checkCollision(newPos.x, newPos.z)) {
        unit.mesh.position.copy(newPos);
        unit.mesh.rotation.y = Math.atan2(dir.x, dir.z);
        unit.isMoving = true;
    }
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

    // Give money for killing enemies
    if (unit.team === 'gray') {
        addMoney(KILL_BONUS);
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
    // Check HQ destruction
    if (playerHQ && !playerHQ.alive && !gameOver) {
        endGame(false);
    }
    if (enemyHQ && !enemyHQ.alive && !gameOver) {
        endGame(true);
    }
}

function endGame(victory) {
    if (gameOver) return;
    gameOver = true;
    
    if (victory) {
        messageEl.textContent = '¡VICTORIA!';
        messageEl.className = 'win';
    } else {
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
        
        // Build mode preview
        if (buildMode && buildPreview) {
            const point = getGroundIntersection(e.clientX, e.clientY);
            if (point) {
                const { gx, gz } = worldToGrid(point.x, point.z);
                const config = STRUCTURE_TYPES[buildMode];
                const x = gx * CELL_SIZE - HALF_GRID + (config.size * CELL_SIZE) / 2;
                const z = gz * CELL_SIZE - HALF_GRID + (config.size * CELL_SIZE) / 2;
                buildPreview.position.set(x, 0.25, z);
                buildPreview.visible = true;
            }
        }
        
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
            // Handle build mode
            if (buildMode) {
                const point = getGroundIntersection(e.clientX, e.clientY);
                if (point) {
                    const { gx, gz } = worldToGrid(point.x, point.z);
                    placeStructure(gx, gz);
                }
                return;
            }
            
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

    // Buy button listeners
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            if (UNIT_TYPES[type]) {
                buyUnit(type);
            } else if (STRUCTURE_TYPES[type]) {
                enterBuildMode(type);
            }
        });
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (buildMode) {
                exitBuildMode();
            } else {
                deselectAll();
            }
        }
        // Number keys for quick buy
        if (e.key === '1') buyUnit('soldier');
        if (e.key === '2') buyUnit('tank');
        if (e.key === '3') buyUnit('sniper');
        if (e.key === '4') buyUnit('medic');
        if (e.key === '5') enterBuildMode('wall');
        if (e.key === '6') enterBuildMode('mine');
        if (e.key === '7') enterBuildMode('refinery');
    });

    // Mode toggle
    const modeSwitch = document.getElementById('mode-switch');
    if (modeSwitch) {
        modeSwitch.addEventListener('change', (e) => {
            gameMode = e.target.checked ? 'exercise' : 'study';
            console.log('Game mode:', gameMode);
        });
    }

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

// Money system
function updateMoneyUI() {
    const moneyEl = document.getElementById('money-display');
    if (moneyEl) moneyEl.textContent = `💰 ${money}`;
    
    // Update buy buttons
    document.querySelectorAll('.buy-btn').forEach(btn => {
        const type = btn.dataset.type;
        const config = UNIT_TYPES[type] || STRUCTURE_TYPES[type];
        if (config) {
            btn.classList.toggle('disabled', money < config.cost);
        }
    });
}

function addMoney(amount) {
    money += amount;
    updateMoneyUI();
}

function canAfford(cost) {
    return money >= cost;
}

function spendMoney(amount) {
    if (canAfford(amount)) {
        money -= amount;
        updateMoneyUI();
        return true;
    }
    return false;
}

// Income generation
function generateIncome() {
    const now = Date.now();
    if (now - lastMoneyTime >= MONEY_INTERVAL) {
        structures.forEach(s => {
            if (s.alive && s.income) {
                addMoney(s.income);
            }
        });
        lastMoneyTime = now;
    }
}

// Create structure
function createStructure(type, gx, gz, team) {
    const config = STRUCTURE_TYPES[type];
    if (!config) return null;
    
    const size = config.size;
    const x = gx * CELL_SIZE - HALF_GRID + (size * CELL_SIZE) / 2;
    const z = gz * CELL_SIZE - HALF_GRID + (size * CELL_SIZE) / 2;
    
    const group = new THREE.Group();
    
    // Main body
    const bodyGeom = new THREE.BoxGeometry(
        size * CELL_SIZE * 0.9,
        config.hp * 0.15 + 0.3,
        size * CELL_SIZE * 0.9
    );
    const bodyMat = new THREE.MeshLambertMaterial({ color: config.color });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = (config.hp * 0.15 + 0.3) / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);
    
    // Income indicator for mines/refineries
    if (config.income) {
        const indicatorGeom = new THREE.SphereGeometry(0.2, 8, 8);
        const indicatorMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
        const indicator = new THREE.Mesh(indicatorGeom, indicatorMat);
        indicator.position.y = config.hp * 0.15 + 0.6;
        group.add(indicator);
    }
    
    // HP Bar
    const hpBarBgGeom = new THREE.PlaneGeometry(size * CELL_SIZE * 0.8, 0.1);
    const hpBarBgMat = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
    const hpBarBg = new THREE.Mesh(hpBarBgGeom, hpBarBgMat);
    hpBarBg.position.y = config.hp * 0.15 + 0.8;
    hpBarBg.rotation.x = -Math.PI / 4;
    group.add(hpBarBg);
    
    const hpBarGeom = new THREE.PlaneGeometry(size * CELL_SIZE * 0.8, 0.1);
    const hpBarMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const hpBar = new THREE.Mesh(hpBarGeom, hpBarMat);
    hpBar.position.y = config.hp * 0.15 + 0.8;
    hpBar.position.z = 0.001;
    hpBar.rotation.x = -Math.PI / 4;
    group.add(hpBar);
    
    group.position.set(x, 0, z);
    
    const structure = {
        mesh: group,
        type,
        team,
        hp: config.hp,
        maxHp: config.hp,
        income: config.income || 0,
        alive: true,
        hpBar,
        gx,
        gz,
        size
    };
    
    scene.add(group);
    structures.push(structure);
    return structure;
}

// Create HQ (Headquarters)
function createHQ(x, z, team) {
    const group = new THREE.Group();
    const isRed = team === 'red';
    const color = isRed ? 0xcc3333 : 0x555555;
    
    // Main building
    const bodyGeom = new THREE.BoxGeometry(5, 3, 5);
    const bodyMat = new THREE.MeshLambertMaterial({ color });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = 1.5;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);
    
    // Roof
    const roofGeom = new THREE.ConeGeometry(3.5, 1.5, 4);
    const roofMat = new THREE.MeshLambertMaterial({ color: isRed ? 0x991111 : 0x333333 });
    const roof = new THREE.Mesh(roofGeom, roofMat);
    roof.position.y = 3.75;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);
    
    // Flag pole
    const poleGeom = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
    const pole = new THREE.Mesh(poleGeom, poleMat);
    pole.position.set(0, 4.5, 0);
    group.add(pole);
    
    // Flag
    const flagGeom = new THREE.PlaneGeometry(0.8, 0.5);
    const flagMat = new THREE.MeshBasicMaterial({ color: isRed ? 0xff0000 : 0x888888, side: THREE.DoubleSide });
    const flag = new THREE.Mesh(flagGeom, flagMat);
    flag.position.set(0.4, 5, 0);
    group.add(flag);
    
    // HP Bar background
    const hpBarBgGeom = new THREE.PlaneGeometry(4, 0.3);
    const hpBarBgMat = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
    const hpBarBg = new THREE.Mesh(hpBarBgGeom, hpBarBgMat);
    hpBarBg.position.y = 3.5;
    hpBarBg.rotation.x = -Math.PI / 4;
    group.add(hpBarBg);
    
    // HP Bar
    const hpBarGeom = new THREE.PlaneGeometry(4, 0.3);
    const hpBarMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const hpBar = new THREE.Mesh(hpBarGeom, hpBarMat);
    hpBar.position.y = 3.5;
    hpBar.position.z = 0.001;
    hpBar.rotation.x = -Math.PI / 4;
    group.add(hpBar);
    
    group.position.set(x, 0, z);
    
    const structure = {
        mesh: group,
        type: 'hq',
        team,
        hp: HQ_HP,
        maxHp: HQ_HP,
        income: 0,
        alive: true,
        hpBar,
        isHQ: true,
        size: 3
    };
    
    scene.add(group);
    structures.push(structure);
    return structure;
}

// Create Turret
function createTurret(x, z, team) {
    const group = new THREE.Group();
    const isRed = team === 'red';
    const color = isRed ? 0xcc3333 : 0x444444;
    
    // Base
    const baseGeom = new THREE.CylinderGeometry(0.6, 0.8, 0.5, 8);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.position.y = 0.25;
    base.castShadow = true;
    group.add(base);
    
    // Turret body
    const bodyGeom = new THREE.CylinderGeometry(0.4, 0.5, 0.8, 8);
    const bodyMat = new THREE.MeshLambertMaterial({ color });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = 0.9;
    body.castShadow = true;
    group.add(body);
    
    // Barrel
    const barrelGeom = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
    const barrelMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const barrel = new THREE.Mesh(barrelGeom, barrelMat);
    barrel.position.set(0, 1, 0.5);
    barrel.rotation.x = Math.PI / 2;
    barrel.castShadow = true;
    group.add(barrel);
    
    // HP Bar background
    const hpBarBgGeom = new THREE.PlaneGeometry(1.2, 0.1);
    const hpBarBgMat = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
    const hpBarBg = new THREE.Mesh(hpBarBgGeom, hpBarBgMat);
    hpBarBg.position.y = 1.8;
    hpBarBg.rotation.x = -Math.PI / 4;
    group.add(hpBarBg);
    
    // HP Bar
    const hpBarGeom = new THREE.PlaneGeometry(1.2, 0.1);
    const hpBarMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const hpBar = new THREE.Mesh(hpBarGeom, hpBarMat);
    hpBar.position.y = 1.8;
    hpBar.position.z = 0.001;
    hpBar.rotation.x = -Math.PI / 4;
    group.add(hpBar);
    
    group.position.set(x, 0, z);
    
    const structure = {
        mesh: group,
        type: 'turret',
        team,
        hp: TURRET_HP,
        maxHp: TURRET_HP,
        income: 0,
        alive: true,
        hpBar,
        isTurret: true,
        lastAttackTime: 0,
        size: 1
    };
    
    scene.add(group);
    structures.push(structure);
    return structure;
}

// Attack structure
function attackStructure(unit, structure) {
    if (!structure || !structure.alive) return false;
    if (unit.canHeal) return false; // Medics don't attack
    
    const dist = unit.mesh.position.distanceTo(structure.mesh.position);
    const attackRange = unit.attackRange || 2.5;
    
    if (dist <= attackRange) {
        const now = Date.now();
        if (now - unit.lastAttackTime >= unit.attackCooldown) {
            structure.hp -= unit.damage;
            unit.lastAttackTime = now;
            
            if (structure.hp <= 0) {
                structure.alive = false;
                scene.remove(structure.mesh);
                const idx = structures.indexOf(structure);
                if (idx !== -1) structures.splice(idx, 1);
                
                // Check if HQ destroyed
                if (structure === playerHQ) {
                    endGame(false);
                } else if (structure === enemyHQ) {
                    endGame(true);
                }
            }
            return true;
        }
    }
    return false;
}

// Buy unit
function showQuiz() {
    return new Promise((resolve) => {
        const vocab = vocabulary[Math.floor(Math.random() * vocabulary.length)];
        const reward = QUIZ_REWARDS[vocab.difficulty];
        const stars = '★'.repeat(vocab.difficulty) + '☆'.repeat(3 - vocab.difficulty);
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'quizModal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1a1a2e;
            border: 2px solid #e94560;
            border-radius: 10px;
            padding: 20px;
            z-index: 10000;
            text-align: center;
            color: white;
            font-family: 'Courier New', monospace;
            min-width: 300px;
        `;
        
        modal.innerHTML = `
            <h3 style="color: #e94560; margin-bottom: 10px;">Quiz Alemán</h3>
            <p style="color: #ffd700; font-size: 16px; margin-bottom: 10px;">${stars}</p>
            <p style="font-size: 18px; margin-bottom: 15px;">¿Qué significa "<b>${vocab.word}</b>" en español?</p>
            <input type="text" id="quizAnswer" style="
                width: 80%;
                padding: 10px;
                font-size: 16px;
                border: 2px solid #e94560;
                border-radius: 5px;
                background: #16213e;
                color: white;
                text-align: center;
                margin-bottom: 15px;
            " placeholder="Escribe tu respuesta..." autofocus>
            <br>
            <button id="quizSubmit" style="
                padding: 10px 30px;
                font-size: 16px;
                background: #e94560;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                margin-right: 10px;
            ">Enviar</button>
            <button id="quizCancel" style="
                padding: 10px 30px;
                font-size: 16px;
                background: #666;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">Cancelar</button>
            <p style="font-size: 14px; color: #ffd700; margin-top: 10px;">+${reward} monedas si aciertas</p>
        `;
        
        document.body.appendChild(modal);
        
        const input = document.getElementById('quizAnswer');
        const submitBtn = document.getElementById('quizSubmit');
        const cancelBtn = document.getElementById('quizCancel');
        
        input.focus();
        
        const cleanup = () => {
            modal.remove();
        };
        
        const checkAnswer = () => {
            const userAnswer = input.value.trim().toLowerCase();
            const expected = vocab.answer.toLowerCase();
            const isCorrect = userAnswer === expected;
            console.log('Quiz: user typed "' + userAnswer + '", expected "' + expected + '", match:', isCorrect);
            
            if (isCorrect) {
                cleanup();
                resolve({ correct: true, reward });
            } else {
                // Show correct answer
                modal.innerHTML = `
                    <h3 style="color: #e94560; margin-bottom: 15px;">❌ Incorrecto</h3>
                    <p style="font-size: 16px; margin-bottom: 10px;">La palabra "<b>${vocab.word}</b>" significa:</p>
                    <p style="font-size: 24px; color: #00ff00; margin-bottom: 15px;"><b>${vocab.answer}</b></p>
                    <button id="quizClose" style="
                        padding: 10px 30px;
                        font-size: 16px;
                        background: #e94560;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    ">OK</button>
                `;
                
                document.getElementById('quizClose').onclick = () => {
                    cleanup();
                    resolve({ correct: false, reward: 0 });
                };
            }
        };
        
        submitBtn.onclick = checkAnswer;
        input.onkeypress = (e) => {
            if (e.key === 'Enter') checkAnswer();
        };
        cancelBtn.onclick = () => {
            cleanup();
            resolve({ correct: false, reward: 0 });
        };
    });
}

function calculateAngle(a, b, c) {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let degrees = Math.abs(radians * 180 / Math.PI);
    if (degrees > 180) degrees = 360 - degrees;
    return degrees;
}

function detectSquat(landmarks) {
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];
    const rightHip = landmarks[24];
    const rightKnee = landmarks[26];
    const rightAnkle = landmarks[28];
    
    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    
    return leftKneeAngle < 90 && rightKneeAngle < 90;
}

function detectPushUp(landmarks) {
    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];
    const rightShoulder = landmarks[12];
    const rightElbow = landmarks[14];
    const rightWrist = landmarks[16];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    
    const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    
    const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const hipY = (leftHip.y + rightHip.y) / 2;
    const bodyHorizontal = Math.abs(shoulderY - hipY) < 0.15;
    
    return leftElbowAngle < 90 && rightElbowAngle < 90 && bodyHorizontal;
}

function detectPlank(landmarks) {
    const leftShoulder = landmarks[11];
    const leftHip = landmarks[23];
    const leftAnkle = landmarks[27];
    const rightShoulder = landmarks[12];
    const rightHip = landmarks[24];
    const rightAnkle = landmarks[28];
    
    const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const hipY = (leftHip.y + rightHip.y) / 2;
    const ankleY = (leftAnkle.y + rightAnkle.y) / 2;
    
    const bodyStraight = Math.abs(shoulderY - hipY) < 0.1 && Math.abs(hipY - ankleY) < 0.15;
    const armsStraight = leftShoulder.y < leftHip.y && rightShoulder.y < rightHip.y;
    
    return bodyStraight && armsStraight;
}

function showExercise() {
    return new Promise((resolve) => {
        const exercise = exercises[Math.floor(Math.random() * exercises.length)];
        const reward = EXERCISE_REWARDS[exercise.difficulty];
        const stars = '★'.repeat(exercise.difficulty) + '☆'.repeat(3 - exercise.difficulty);
        
        const modal = document.createElement('div');
        modal.id = 'quizModal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1a1a2e;
            border: 2px solid #00cc66;
            border-radius: 10px;
            padding: 20px;
            z-index: 10000;
            text-align: center;
            color: white;
            font-family: 'Courier New', monospace;
            min-width: 400px;
        `;
        
        modal.innerHTML = `
            <h3 style="color: #00cc66; margin-bottom: 10px;">💪 Ejercicio</h3>
            <p style="color: #ffd700; font-size: 16px; margin-bottom: 10px;">${stars}</p>
            <p style="font-size: 18px; margin-bottom: 10px;"><b>${exercise.name}</b></p>
            <p style="font-size: 12px; color: #888; margin-bottom: 10px;">${exercise.description}</p>
            <div style="position: relative; display: inline-block;">
                <video id="webcam" style="width: 320px; height: 240px; border-radius: 8px; transform: scaleX(-1);"></video>
                <canvas id="poseCanvas" style="position: absolute; top: 0; left: 0; width: 320px; height: 240px; transform: scaleX(-1);"></canvas>
            </div>
            <p id="exerciseStatus" style="font-size: 16px; color: #00cc66; margin: 10px 0;">Esperando cámara...</p>
            <p id="repCount" style="font-size: 24px; color: #ffd700; margin: 10px 0;">0 / ${exercise.difficulty === 1 ? 1 : exercise.difficulty === 2 ? 3 : exercise.difficulty === 3 ? 5 : exercise.difficulty}</p>
            <button id="exerciseCancel" style="
                padding: 10px 30px;
                font-size: 16px;
                background: #666;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">Cancelar</button>
            <p style="font-size: 14px; color: #ffd700; margin-top: 10px;">+${reward} monedas</p>
        `;
        
        document.body.appendChild(modal);
        
        const video = document.getElementById('webcam');
        const canvas = document.getElementById('poseCanvas');
        const ctx = canvas.getContext('2d');
        const statusEl = document.getElementById('exerciseStatus');
        const repCountEl = document.getElementById('repCount');
        
        let reps = 0;
        let wasDetected = false;
        const requiredReps = exercise.difficulty === 1 ? 1 : exercise.difficulty === 2 ? 3 : 5;
        
        const cleanup = () => {
            if (window.currentPoseCamera) {
                window.currentPoseCamera.stop();
                window.currentPoseCamera = null;
            }
            if (video.srcObject) {
                video.srcObject.getTracks().forEach(track => track.stop());
            }
            modal.remove();
        };
        
        document.getElementById('exerciseCancel').onclick = () => {
            cleanup();
            resolve({ correct: false, reward: 0 });
        };
        
        const pose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });
        
        pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        
        pose.onResults((results) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (results.poseLandmarks) {
                drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
                drawLandmarks(ctx, results.poseLandmarks, { color: '#FF0000', lineWidth: 1, radius: 3 });
                
                let detected = false;
                if (exercise.name.includes('Sentadilla')) {
                    detected = detectSquat(results.poseLandmarks);
                } else if (exercise.name.includes('Flexión')) {
                    detected = detectPushUp(results.poseLandmarks);
                } else if (exercise.name.includes('Plancha')) {
                    detected = detectPlank(results.poseLandmarks);
                }
                
                if (detected && !wasDetected) {
                    reps++;
                    repCountEl.textContent = `${reps} / ${requiredReps}`;
                    
                    if (reps >= requiredReps) {
                        statusEl.textContent = '¡Completado!';
                        statusEl.style.color = '#00ff00';
                        setTimeout(() => {
                            cleanup();
                            resolve({ correct: true, reward });
                        }, 1000);
                    }
                }
                wasDetected = detected;
                statusEl.textContent = detected ? '¡Detectado!' : 'Realiza el ejercicio...';
                statusEl.style.color = detected ? '#00ff00' : '#ffd700';
            }
        });
        
        navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
            .then((stream) => {
                video.srcObject = stream;
                video.onloadedmetadata = () => {
                    video.play();
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    
                    const camera = new Camera(video, {
                        onFrame: async () => {
                            await pose.send({ image: video });
                        },
                        width: 320,
                        height: 240
                    });
                    window.currentPoseCamera = camera;
                    camera.start();
                    statusEl.textContent = 'Cámara activa - Realiza el ejercicio';
                };
            })
            .catch((err) => {
                statusEl.textContent = 'Error: No se pudo acceder a la cámara';
                statusEl.style.color = '#ff6b6b';
                console.error('Camera error:', err);
            });
    });
}

function showChallenge() {
    if (gameMode === 'study') {
        return showQuiz();
    } else {
        return showExercise();
    }
}

function buyUnit(unitType) {
    const config = UNIT_TYPES[unitType];
    if (!config) return false;
    
    showChallenge().then(({ correct, reward }) => {
        console.log('Quiz result:', correct, 'reward:', reward, 'for', unitType);
        if (correct) {
            money += reward;
            updateMoneyUI();
            
            // Spawn unit
            const spawnX = -HALF_GRID + 6 + Math.random() * 4;
            const spawnZ = -HALF_GRID + 6 + Math.random() * 4;
            const unit = createSoldier(spawnX, spawnZ, 'red', unitType);
            selectUnit(unit);
            console.log('Unit created:', unitType);
        }
    });
    
    return true;
}

// Enter build mode
function enterBuildMode(type) {
    const config = STRUCTURE_TYPES[type];
    if (!config) return false;
    
    showChallenge().then(({ correct, reward }) => {
        if (correct) {
            money += reward;
            updateMoneyUI();
            
            buildMode = type;
            
            // Create preview
            const previewGeom = new THREE.BoxGeometry(
                config.size * CELL_SIZE * 0.9,
                0.5,
                config.size * CELL_SIZE * 0.9
            );
            const previewMat = new THREE.MeshBasicMaterial({
                color: config.color,
                transparent: true,
                opacity: 0.5
            });
            buildPreview = new THREE.Mesh(previewGeom, previewMat);
            buildPreview.position.y = 0.25;
            buildPreview.visible = false;
            scene.add(buildPreview);
            
            document.getElementById('build-info').textContent = `Construyendo: ${config.name} - Click para colocar, ESC cancelar`;
        }
    });
    
    return true;
}

// Exit build mode
function exitBuildMode() {
    buildMode = null;
    if (buildPreview) {
        scene.remove(buildPreview);
        buildPreview = null;
    }
    document.getElementById('build-info').textContent = 'Selecciona una estructura para construir';
}

// Place structure
function placeStructure(gx, gz) {
    if (!buildMode) return false;
    
    const config = STRUCTURE_TYPES[buildMode];
    if (!config || !canAfford(config.cost)) return false;
    
    // Check if cell is free
    const size = config.size;
    for (let dx = 0; dx < size; dx++) {
        for (let dz = 0; dz < size; dz++) {
            if (!isValidCell(gx + dx, gz + dz)) return false;
            // Check for existing structures
            if (structures.some(s => s.alive &&
                gx + dx >= s.gx && gx + dx < s.gx + s.size &&
                gz + dz >= s.gz && gz + dz < s.gz + s.size)) {
                return false;
            }
        }
    }
    
    if (spendMoney(config.cost)) {
        createStructure(buildMode, gx, gz, 'red');
        exitBuildMode();
        return true;
    }
    return false;
}

let lastTime = 0;
function animate(time = 0) {
    requestAnimationFrame(animate);

    const dt = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;

    if (!gameOver) {
        updateWaves(dt);
        generateIncome();

        // Turret attack logic
        structures.forEach(s => {
            if (!s.alive || !s.isTurret) return;
            const now = Date.now();
            if (now - s.lastAttackTime < TURRET_COOLDOWN) return;
            
            // Find nearest enemy unit
            let nearestEnemy = null;
            let minDist = TURRET_RANGE;
            for (const u of units) {
                if (!u.alive || u.team === s.team) continue;
                const dist = s.mesh.position.distanceTo(u.mesh.position);
                if (dist < minDist) {
                    minDist = dist;
                    nearestEnemy = u;
                }
            }
            
            if (nearestEnemy) {
                nearestEnemy.hp -= TURRET_DAMAGE;
                s.lastAttackTime = now;
                if (nearestEnemy.hp <= 0) {
                    killUnit(nearestEnemy);
                }
            }
        });

        units.forEach(u => {
            if (u.alive) moveUnit(u, dt);
        });

        units.forEach(u => {
            if (u.alive) animateUnit(u, dt);
        });

        // Enemy units attack HQ when nearby
        units.forEach(u => {
            if (!u.alive || u.team !== 'gray') return;
            
            // Check if near player HQ
            if (playerHQ && playerHQ.alive) {
                const dist = u.mesh.position.distanceTo(playerHQ.mesh.position);
                if (dist <= u.attackRange) {
                    const now = Date.now();
                    if (now - u.lastAttackTime >= u.attackCooldown) {
                        playerHQ.hp -= u.damage;
                        u.lastAttackTime = now;
                        if (playerHQ.hp <= 0) {
                            playerHQ.alive = false;
                            scene.remove(playerHQ.mesh);
                        }
                    }
                }
            }
        });

        units.forEach(u => {
            if (u.alive && u.hp < u.maxHp) {
                const ratio = u.hp / u.maxHp;
                u.hpBar.scale.x = ratio;
                u.hpBar.position.x = -(1 - ratio) * 0.3;
                u.hpBar.material.color.setHex(ratio > 0.5 ? 0x00ff00 : ratio > 0.25 ? 0xffff00 : 0xff0000);
            }
        });

        // Update structure HP bars
        structures.forEach(s => {
            if (s.alive && s.hp < s.maxHp) {
                const ratio = s.hp / s.maxHp;
                s.hpBar.scale.x = ratio;
                s.hpBar.position.x = -(1 - ratio) * 0.4;
                s.hpBar.material.color.setHex(ratio > 0.5 ? 0x00ff00 : ratio > 0.25 ? 0xffff00 : 0xff0000);
            }
        });

        checkGameOver();
    }

    renderer.render(scene, camera);
}

init();
