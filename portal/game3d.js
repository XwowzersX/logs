import * as THREE from 'three';

// ===== APERTURE SCIENCE PORTAL - 3D GAME ENGINE =====
const CELL = 4;
const WALL_HEIGHT = 4;
const GRAVITY = 20;
const PLAYER_SPEED = 8;
const SPRINT_SPEED = 12;
const JUMP_FORCE = 9;
const MOUSE_SENS = 0.002;
const PLAYER_HEIGHT = 1.7;
const PLAYER_RADIUS = 0.3;
const PORTAL_RADIUS = 1.2;

const T = { EMPTY:0, WALL:1, PORTAL_WALL:2, HAZARD:3, EXIT:4, BUTTON:5, DOOR:6, CUBE_SPAWN:7, FIZZLER:8, PLAYER_SPAWN:9 };

const GLADOS = {
  chamber0: ["Welcome, test subject. Please proceed to the chamberlock.","The Enrichment Center promises to always provide a safe testing environment.","Cake and grief counseling will be available at the conclusion of the test."],
  chamber1: ["You are now in possession of the Aperture Science Handheld Portal Device.","With it, you can create your own portals.","These intra-dimensional gates have proven to be completely safe. Probably."],
  chamber2: ["Momentum, a function of mass and velocity, is conserved between portals.","In layman's terms: speedy thing goes in, speedy thing comes out."],
  chamber3: ["This next test involves the Aperture Science Weighted Storage Cube.","Please place it on the Super-Colliding Super Button.","The Enrichment Center reminds you that the Weighted Companion Cube cannot speak."],
  chamber4: ["Congratulations. You have completed all test chambers.","Your results have been noted. The cake is... being prepared.","Thank you for participating in this Aperture Science enrichment activity."],
  death: ["Oh. You appear to have died.","The Enrichment Center apologizes for the inconvenience."]
};

const LEVELS = [
  { name:"00", grid:[[1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,1],[1,9,0,0,0,0,0,0,0,0,4,1],[1,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1]], portalsAllowed:false, cubes:[], buttonDoorLinks:[], dialogue:"chamber0" },
  { name:"01", grid:[[1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,2,0,0,0,0,1,1,0,0,0,0,2,1],[1,2,0,0,0,0,1,1,0,0,0,0,2,1],[1,2,9,0,0,0,1,1,0,0,0,4,2,1],[1,2,0,0,0,0,1,1,0,0,0,0,2,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1]], portalsAllowed:true, cubes:[], buttonDoorLinks:[], dialogue:"chamber1" },
  { name:"02", grid:[[1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,1,1,1,1,0,0,0,0,1],[1,9,0,0,0,1,1,1,1,0,0,0,4,1],[1,0,0,2,2,1,1,1,1,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1]], portalsAllowed:true, cubes:[], buttonDoorLinks:[], dialogue:"chamber2" },
  { name:"03", grid:[[1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,2,0,0,0,0,0,1,2,0,0,0,2,1],[1,2,0,0,0,0,0,1,2,0,0,0,2,1],[1,2,9,0,7,0,5,1,6,0,0,4,2,1],[1,2,0,0,0,0,0,1,2,0,0,0,2,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1]], portalsAllowed:true, cubes:[{x:4,y:3}], buttonDoorLinks:[{button:{x:6,y:3},door:{x:8,y:3}}], dialogue:"chamber3" },
  { name:"04", grid:[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,2,0,0,0,0,2,1,2,0,0,0,0,0,2,1],[1,2,0,0,0,0,2,1,2,0,0,0,0,0,2,1],[1,2,9,0,0,0,2,1,2,0,0,0,0,4,2,1],[1,2,0,0,0,0,2,1,2,0,0,0,0,0,2,1],[1,1,1,2,2,2,1,1,1,1,2,2,2,1,1,1]], portalsAllowed:true, cubes:[], buttonDoorLinks:[], dialogue:"chamber4" }
];

// ===== TEXTURES =====
function createCanvasTexture(w, h, drawFn) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  drawFn(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function wallTexture() {
  return createCanvasTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#888';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, w - 8, h - 8);
    ctx.fillStyle = '#7a7a7a';
    ctx.fillRect(8, 8, w - 16, h - 16);
    ctx.strokeStyle = '#707070';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.fillStyle = '#666';
    [[16, 16], [w - 16, 16], [16, h - 16], [w - 16, h - 16]].forEach(([x, y]) => {
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
    });
  });
}

function portalWallTexture() {
  return createCanvasTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.strokeRect(3, 3, w - 6, h - 6);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(6, 6, w - 12, h - 12);
    ctx.strokeStyle = '#d8d8d8';
    ctx.lineWidth = 1;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.strokeStyle = '#ddd';
    ctx.beginPath();
    ctx.moveTo(w / 2, 12); ctx.lineTo(w / 2, h - 12);
    ctx.moveTo(12, h / 2); ctx.lineTo(w - 12, h / 2);
    ctx.stroke();
  });
}

function floorTexture() {
  return createCanvasTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#606060';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 32) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); }
    for (let i = 0; i < h; i += 32) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }
    ctx.fillStyle = '#585858';
    ctx.fillRect(2, 2, 28, 28);
    ctx.fillRect(34, 2, 28, 28);
    ctx.fillRect(2, 34, 28, 28);
    ctx.fillRect(34, 34, 28, 28);
  });
}

function ceilingTexture() {
  return createCanvasTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#555';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 1;
    ctx.strokeRect(2, 2, w - 4, h - 4);
    ctx.fillStyle = '#505050';
    ctx.fillRect(4, 4, w - 8, h - 8);
    ctx.fillStyle = '#666';
    ctx.fillRect(w / 2 - 4, 4, 8, h - 8);
  });
}

function hazardTexture() {
  return createCanvasTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#553300';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = 'rgba(255,' + (100 + Math.random() * 50) + ',0,' + (0.3 + Math.random() * 0.3) + ')';
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, 10 + Math.random() * 20, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,140,0,0.4)';
    ctx.fillRect(0, 0, w, 20);
  });
}

// ===== MATERIALS =====
const wallTex = wallTexture(), portalWallTex = portalWallTexture(), floorTex = floorTexture(), ceilTex = ceilingTexture(), hazardTex = hazardTexture();
floorTex.repeat.set(1, 1); ceilTex.repeat.set(1, 1);

const MAT = {
  wall: new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.8 }),
  portalWall: new THREE.MeshStandardMaterial({ map: portalWallTex, roughness: 0.3, metalness: 0.1 }),
  floor: new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.9 }),
  ceiling: new THREE.MeshStandardMaterial({ map: ceilTex, roughness: 0.7 }),
  hazard: new THREE.MeshStandardMaterial({ map: hazardTex, emissive: new THREE.Color(0xff6600), emissiveIntensity: 0.5 }),
  exit: new THREE.MeshStandardMaterial({ color: 0x111111, emissive: new THREE.Color(0x00cc66), emissiveIntensity: 0.8 }),
  button: new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.5 }),
  buttonPressed: new THREE.MeshStandardMaterial({ color: 0x00cc00, emissive: new THREE.Color(0x00cc00), emissiveIntensity: 0.5 }),
  door: new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.6 }),
  doorOpen: new THREE.MeshStandardMaterial({ color: 0x222222, transparent: true, opacity: 0.3 }),
  cube: new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.4, metalness: 0.3 }),
  cubeHeart: new THREE.MeshStandardMaterial({ color: 0xff69b4, emissive: new THREE.Color(0xff69b4), emissiveIntensity: 0.3 }),
  portalBlue: new THREE.MeshBasicMaterial({ color: 0x0077ff, transparent: true, opacity: 0.7, side: THREE.DoubleSide }),
  portalOrange: new THREE.MeshBasicMaterial({ color: 0xff8c00, transparent: true, opacity: 0.7, side: THREE.DoubleSide }),
  portalRimBlue: new THREE.MeshBasicMaterial({ color: 0x3399ff }),
  portalRimOrange: new THREE.MeshBasicMaterial({ color: 0xffaa33 })
};

// ===== SCENE =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
scene.fog = new THREE.Fog(0x111111, 10, 60);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===== LIGHTING =====
function setupLighting() {
  scene.children.filter(c => c.isLight).forEach(l => scene.remove(l));
  scene.add(new THREE.AmbientLight(0x404050, 0.4));
  const overhead = new THREE.DirectionalLight(0xffffff, 0.6);
  overhead.position.set(5, 10, 5);
  overhead.castShadow = true;
  overhead.shadow.mapSize.width = 1024;
  overhead.shadow.mapSize.height = 1024;
  scene.add(overhead);
  scene.add(new THREE.HemisphereLight(0x4466aa, 0x222222, 0.3));
}
setupLighting();

// ===== STATE =====
const state = {
  screen: 'title', level: 0,
  player: { position: new THREE.Vector3(), velocity: new THREE.Vector3(), yaw: 0, pitch: 0, grounded: false, carrying: null, height: PLAYER_HEIGHT },
  portals: { blue: null, orange: null }, cubes: [], buttons: [], doors: [], exitPos: null, grid: [],
  wallMeshes: [], portalSurfaces: [], portalMeshes: { blue: null, orange: null },
  glados: { queue: [], currentLine: '', charIndex: 0, timer: 0, text: '' },
  keys: {}, time: 0, deathTimer: 0
};

// ===== POINTER LOCK =====
let isLocked = false;
function requestLock() { renderer.domElement.requestPointerLock(); }
document.addEventListener('pointerlockchange', () => { isLocked = document.pointerLockElement === renderer.domElement; });
document.addEventListener('mousemove', (e) => {
  if (!isLocked || state.screen !== 'playing') return;
  state.player.yaw -= e.movementX * MOUSE_SENS;
  state.player.pitch -= e.movementY * MOUSE_SENS;
  state.player.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, state.player.pitch));
});

// ===== INPUT =====
document.addEventListener('keydown', (e) => {
  state.keys[e.code] = true;
  if (e.code === 'KeyR' && state.screen === 'playing') { removePortal('blue'); removePortal('orange'); }
  if (e.code === 'KeyE' && state.screen === 'playing') handleInteract();
});
document.addEventListener('keyup', (e) => { state.keys[e.code] = false; });
document.addEventListener('mousedown', (e) => {
  if (state.screen === 'title') { startGame(); return; }
  if (state.screen !== 'playing') return;
  if (!isLocked) { requestLock(); return; }
  if (!LEVELS[state.level].portalsAllowed) return;
  e.preventDefault();
  firePortal(e.button === 0 ? 'blue' : 'orange');
});
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.getElementById('title-screen').addEventListener('click', () => { if (state.screen === 'title') startGame(); });

function startGame() {
  state.screen = 'playing';
  document.getElementById('title-screen').style.display = 'none';
  document.getElementById('hud').style.display = 'block';
  requestLock();
  loadLevel(0);
}

// ===== LEVEL =====
let levelGroup = new THREE.Group();
scene.add(levelGroup);

function clearLevel() {
  while (levelGroup.children.length) { const c = levelGroup.children[0]; levelGroup.remove(c); if (c.geometry) c.geometry.dispose(); }
  state.wallMeshes = []; state.portalSurfaces = []; state.cubes = []; state.buttons = []; state.doors = []; state.exitPos = null;
  removePortal('blue'); removePortal('orange');
}

function loadLevel(index) {
  if (index >= LEVELS.length) { gameComplete(); return; }
  clearLevel(); state.level = index;
  const level = LEVELS[index];
  state.grid = level.grid.map(r => [...r]);
  state.deathTimer = 0; state.player.carrying = null;
  const rows = state.grid.length, cols = state.grid[0].length;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const tile = state.grid[y][x], wx = x * CELL, wz = y * CELL;
      if (tile === T.WALL || tile === T.PORTAL_WALL) { buildWallCell(wx, wz, tile, x, y); }
      else {
        buildFloor(wx, wz, tile); buildCeiling(wx, wz); buildSideWalls(x, y, wx, wz);
        if (tile === T.PLAYER_SPAWN) { state.player.position.set(wx + CELL / 2, PLAYER_HEIGHT, wz + CELL / 2); state.player.velocity.set(0, 0, 0); state.player.yaw = 0; state.player.pitch = 0; state.player.grounded = false; }
        if (tile === T.EXIT) { buildExit(wx, wz); state.exitPos = new THREE.Vector3(wx + CELL / 2, PLAYER_HEIGHT, wz + CELL / 2); }
        if (tile === T.BUTTON) buildButton(wx, wz, x, y);
        if (tile === T.DOOR) buildDoor(wx, wz, x, y);
        if (tile === T.HAZARD) buildHazard(wx, wz);
      }
    }
  }
  level.cubes.forEach(c => spawnCube(c.x * CELL + CELL / 2, 1, c.y * CELL + CELL / 2));
  addChamberLights(cols, rows);
  document.getElementById('chamber-num').textContent = level.name;
  updatePortalIndicators();
  if (level.dialogue && GLADOS[level.dialogue]) queueGLaDOS(GLADOS[level.dialogue]);
}

function buildWallCell(wx, wz, tile, gx, gy) {
  const mat = tile === T.PORTAL_WALL ? MAT.portalWall : MAT.wall;
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(CELL, WALL_HEIGHT, CELL), mat);
  mesh.position.set(wx + CELL / 2, WALL_HEIGHT / 2, wz + CELL / 2);
  mesh.castShadow = true; mesh.receiveShadow = true;
  mesh.userData = { type: tile === T.PORTAL_WALL ? 'portalWall' : 'wall', gx, gy };
  levelGroup.add(mesh); state.wallMeshes.push(mesh);
  if (tile === T.PORTAL_WALL) state.portalSurfaces.push(mesh);
}

function buildFloor(wx, wz, tile) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(CELL, CELL), tile === T.HAZARD ? MAT.hazard : MAT.floor);
  mesh.rotation.x = -Math.PI / 2; mesh.position.set(wx + CELL / 2, 0, wz + CELL / 2);
  mesh.receiveShadow = true; levelGroup.add(mesh);
}

function buildCeiling(wx, wz) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(CELL, CELL), MAT.ceiling);
  mesh.rotation.x = Math.PI / 2; mesh.position.set(wx + CELL / 2, WALL_HEIGHT, wz + CELL / 2);
  mesh.receiveShadow = true; levelGroup.add(mesh);
}

function buildSideWalls(gx, gy, wx, wz) {
  [{ dx: -1, dz: 0, face: 'left' }, { dx: 1, dz: 0, face: 'right' }, { dx: 0, dz: -1, face: 'front' }, { dx: 0, dz: 1, face: 'back' }].forEach(({ dx, dz, face }) => {
    const nx = gx + dx, ny = gy + dz;
    if (nx < 0 || nx >= state.grid[0].length || ny < 0 || ny >= state.grid.length) return;
    const neighbor = state.grid[ny][nx];
    if (neighbor === T.WALL || neighbor === T.PORTAL_WALL) {
      const isP = neighbor === T.PORTAL_WALL;
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(CELL, WALL_HEIGHT), isP ? MAT.portalWall : MAT.wall);
      let normal = new THREE.Vector3();
      if (face === 'left') { mesh.position.set(wx, WALL_HEIGHT / 2, wz + CELL / 2); mesh.rotation.y = Math.PI / 2; normal.set(1, 0, 0); }
      else if (face === 'right') { mesh.position.set(wx + CELL, WALL_HEIGHT / 2, wz + CELL / 2); mesh.rotation.y = -Math.PI / 2; normal.set(-1, 0, 0); }
      else if (face === 'front') { mesh.position.set(wx + CELL / 2, WALL_HEIGHT / 2, wz); normal.set(0, 0, 1); }
      else if (face === 'back') { mesh.position.set(wx + CELL / 2, WALL_HEIGHT / 2, wz + CELL); mesh.rotation.y = Math.PI; normal.set(0, 0, -1); }
      mesh.receiveShadow = true;
      mesh.userData = { type: isP ? 'portalWall' : 'wall', normal, gx: nx, gy: ny, faceDir: face };
      levelGroup.add(mesh); state.wallMeshes.push(mesh);
      if (isP) state.portalSurfaces.push(mesh);
    }
  });
}

function buildExit(wx, wz) {
  const frame = new THREE.Mesh(new THREE.BoxGeometry(CELL * 0.8, WALL_HEIGHT * 0.9, 0.3), MAT.exit);
  frame.position.set(wx + CELL / 2, WALL_HEIGHT * 0.45, wz + CELL / 2); levelGroup.add(frame);
  const light = new THREE.PointLight(0x00cc66, 1.5, 8);
  light.position.set(wx + CELL / 2, WALL_HEIGHT - 0.5, wz + CELL / 2); levelGroup.add(light);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.4), new THREE.MeshBasicMaterial({ color: 0x00ff66, transparent: true, opacity: 0.9 }));
  sign.position.set(wx + CELL / 2, WALL_HEIGHT - 0.3, wz + CELL / 2 + 0.2); levelGroup.add(sign);
}

function buildButton(wx, wz, gx, gy) {
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.15, 16), MAT.wall);
  base.position.set(wx + CELL / 2, 0.075, wz + CELL / 2); levelGroup.add(base);
  const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16), MAT.button);
  btn.position.set(wx + CELL / 2, 0.2, wz + CELL / 2); levelGroup.add(btn);
  state.buttons.push({ gridX: gx, gridY: gy, mesh: btn, pressed: false });
}

function buildDoor(wx, wz, gx, gy) {
  const door = new THREE.Mesh(new THREE.BoxGeometry(CELL * 0.9, WALL_HEIGHT * 0.95, 0.4), MAT.door);
  door.position.set(wx + CELL / 2, WALL_HEIGHT * 0.475, wz + CELL / 2); door.castShadow = true;
  levelGroup.add(door); state.doors.push({ gridX: gx, gridY: gy, mesh: door, open: false });
  state.wallMeshes.push(door);
}

function buildHazard(wx, wz) {
  const goo = new THREE.Mesh(new THREE.PlaneGeometry(CELL, CELL), MAT.hazard);
  goo.rotation.x = -Math.PI / 2; goo.position.set(wx + CELL / 2, 0.05, wz + CELL / 2); levelGroup.add(goo);
  const light = new THREE.PointLight(0xff6600, 0.8, 5);
  light.position.set(wx + CELL / 2, 0.5, wz + CELL / 2); levelGroup.add(light);
}

function addChamberLights(cols, rows) {
  const sx = Math.max(2, Math.floor(cols / 3)), sz = Math.max(2, Math.floor(rows / 2));
  for (let x = sx; x < cols; x += sx) {
    for (let y = sz; y < rows; y += sz) {
      if (state.grid[y] && state.grid[y][x] !== T.WALL && state.grid[y][x] !== T.PORTAL_WALL) {
        const l = new THREE.PointLight(0xffeedd, 0.8, 12);
        l.position.set(x * CELL + CELL / 2, WALL_HEIGHT - 0.3, y * CELL + CELL / 2); levelGroup.add(l);
        const f = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.4), new THREE.MeshBasicMaterial({ color: 0xffffee }));
        f.position.copy(l.position); f.position.y = WALL_HEIGHT - 0.05; levelGroup.add(f);
      }
    }
  }
}

// ===== CUBES =====
function spawnCube(x, y, z) {
  const group = new THREE.Group();
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), MAT.cube);
  mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh);
  const cg = new THREE.SphereGeometry(0.08, 8, 8);
  const cm = new THREE.MeshStandardMaterial({ color: 0x777777 });
  [[-1, -1, -1], [1, -1, -1], [-1, 1, -1], [1, 1, -1], [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1]].forEach(([cx, cy, cz]) => {
    const c = new THREE.Mesh(cg, cm); c.position.set(cx * 0.3, cy * 0.3, cz * 0.3); group.add(c);
  });
  const hg = new THREE.CircleGeometry(0.12, 16);
  [{ pos: [0, 0, 0.36], rot: [0, 0, 0] }, { pos: [0, 0, -0.36], rot: [0, Math.PI, 0] }, { pos: [0.36, 0, 0], rot: [0, Math.PI / 2, 0] }, { pos: [-0.36, 0, 0], rot: [0, -Math.PI / 2, 0] }, { pos: [0, 0.36, 0], rot: [-Math.PI / 2, 0, 0] }, { pos: [0, -0.36, 0], rot: [Math.PI / 2, 0, 0] }].forEach(({ pos, rot }) => {
    const h = new THREE.Mesh(hg, MAT.cubeHeart); h.position.set(...pos); h.rotation.set(...rot); group.add(h);
  });
  group.position.set(x, y, z); levelGroup.add(group);
  state.cubes.push({ mesh: group, position: new THREE.Vector3(x, y, z), velocity: new THREE.Vector3(), grounded: false, size: 0.7 });
}

// ===== PORTALS =====
function createPortalMesh(type) {
  const group = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.TorusGeometry(PORTAL_RADIUS, 0.08, 8, 32), type === 'blue' ? MAT.portalRimBlue : MAT.portalRimOrange);
  rim.scale.set(0.6, 1, 1); group.add(rim);
  const inner = new THREE.Mesh(new THREE.CircleGeometry(PORTAL_RADIUS * 0.9, 32), type === 'blue' ? MAT.portalBlue : MAT.portalOrange);
  inner.scale.set(0.6, 1, 1); inner.position.z = 0.01; group.add(inner);
  const light = new THREE.PointLight(type === 'blue' ? 0x0077ff : 0xff8c00, 2, 6);
  light.position.z = 0.5; group.add(light);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(PORTAL_RADIUS * 0.4, 32), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.7 }));
  hole.scale.set(0.6, 1, 1); hole.position.z = 0.02; group.add(hole);
  return group;
}

function firePortal(type) {
  const rc = new THREE.Raycaster();
  rc.setFromCamera(new THREE.Vector2(0, 0), camera);
  rc.far = 50;
  const hits = rc.intersectObjects(state.portalSurfaces);
  if (!hits.length) return;
  const hit = hits[0];
  const normal = hit.face.normal.clone();
  normal.transformDirection(hit.object.matrixWorld);
  const pos = hit.point.clone().add(normal.clone().multiplyScalar(0.05));
  const other = type === 'blue' ? 'orange' : 'blue';
  if (state.portals[other] && pos.distanceTo(state.portals[other].position) < PORTAL_RADIUS * 2) return;
  removePortal(type);
  const mesh = createPortalMesh(type);
  mesh.position.copy(pos);
  mesh.lookAt(pos.clone().add(normal));
  levelGroup.add(mesh);
  state.portals[type] = { mesh, position: pos.clone(), normal: normal.clone() };
  state.portalMeshes[type] = mesh;
  updatePortalIndicators();
}

function removePortal(type) {
  if (state.portalMeshes[type]) { levelGroup.remove(state.portalMeshes[type]); state.portalMeshes[type] = null; state.portals[type] = null; }
  updatePortalIndicators();
}

function updatePortalIndicators() {
  const b = document.getElementById('ind-blue'), o = document.getElementById('ind-orange');
  if (b) b.className = 'portal-ind blue' + (state.portals.blue ? ' active' : '');
  if (o) o.className = 'portal-ind orange' + (state.portals.orange ? ' active' : '');
}

// ===== TELEPORT =====
function checkPortalTeleport(position, velocity, radius) {
  if (!state.portals.blue || !state.portals.orange) return false;
  const pairs = [{ src: state.portals.blue, dst: state.portals.orange }, { src: state.portals.orange, dst: state.portals.blue }];
  for (const { src, dst } of pairs) {
    const toP = position.clone().sub(src.position);
    const distP = toP.dot(src.normal);
    const latD = toP.clone().sub(src.normal.clone().multiplyScalar(distP)).length();
    const appSpd = velocity.dot(src.normal.clone().negate());
    if (Math.abs(distP) < 0.5 && latD < PORTAL_RADIUS * 0.7 && appSpd > 0.5) {
      const spd = Math.max(velocity.length(), 8);
      position.copy(dst.position).add(dst.normal.clone().multiplyScalar(1.0));
      velocity.copy(dst.normal.clone().multiplyScalar(spd));
      return true;
    }
  }
  return false;
}

// ===== PLAYER =====
function updatePlayer(dt) {
  const p = state.player, k = state.keys;
  const fwd = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), p.yaw);
  const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), p.yaw);
  const spd = k['ShiftLeft'] ? SPRINT_SPEED : PLAYER_SPEED;
  const md = new THREE.Vector3();
  if (k['KeyW'] || k['ArrowUp']) md.add(fwd);
  if (k['KeyS'] || k['ArrowDown']) md.sub(fwd);
  if (k['KeyA'] || k['ArrowLeft']) md.sub(right);
  if (k['KeyD'] || k['ArrowRight']) md.add(right);
  if (md.length() > 0) { md.normalize().multiplyScalar(spd); p.velocity.x = md.x; p.velocity.z = md.z; }
  else { p.velocity.x *= 0.85; p.velocity.z *= 0.85; if (Math.abs(p.velocity.x) < 0.01) p.velocity.x = 0; if (Math.abs(p.velocity.z) < 0.01) p.velocity.z = 0; }
  if (k['Space'] && p.grounded) { p.velocity.y = JUMP_FORCE; p.grounded = false; }
  p.velocity.y -= GRAVITY * dt;
  const np = p.position.clone(); np.x += p.velocity.x * dt; np.z += p.velocity.z * dt;
  if (!isBlocked(np.x, p.position.y, np.z, PLAYER_RADIUS)) { p.position.x = np.x; p.position.z = np.z; }
  else {
    if (!isBlocked(np.x, p.position.y, p.position.z, PLAYER_RADIUS)) p.position.x = np.x;
    else if (!isBlocked(p.position.x, p.position.y, np.z, PLAYER_RADIUS)) p.position.z = np.z;
    p.velocity.x = 0; p.velocity.z = 0;
  }
  p.position.y += p.velocity.y * dt; p.grounded = false;
  if (p.position.y <= PLAYER_HEIGHT) { p.position.y = PLAYER_HEIGHT; p.velocity.y = 0; p.grounded = true; }
  if (p.position.y >= WALL_HEIGHT - 0.1) { p.position.y = WALL_HEIGHT - 0.1; p.velocity.y = 0; }
  checkPortalTeleport(p.position, p.velocity, PLAYER_RADIUS);
  const gx = Math.floor(p.position.x / CELL), gy = Math.floor(p.position.z / CELL);
  if (gx >= 0 && gx < state.grid[0].length && gy >= 0 && gy < state.grid.length && state.grid[gy][gx] === T.HAZARD) killPlayer();
  if (state.exitPos && p.position.distanceTo(state.exitPos) < 1.5) nextLevel();
  camera.position.copy(p.position); camera.rotation.order = 'YXZ'; camera.rotation.y = p.yaw; camera.rotation.x = p.pitch;
  if (p.carrying !== null && state.cubes[p.carrying]) {
    const cube = state.cubes[p.carrying];
    const hd = new THREE.Vector3(0, 0, -2).applyAxisAngle(new THREE.Vector3(0, 1, 0), p.yaw);
    cube.position.copy(p.position).add(hd); cube.position.y = p.position.y - 0.5;
    cube.mesh.position.copy(cube.position); cube.velocity.set(0, 0, 0);
  }
}

function isBlocked(x, y, z, r) {
  const gx = Math.floor(x / CELL), gz = Math.floor(z / CELL);
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const cx = gx + dx, cz = gz + dy;
      if (cx < 0 || cx >= state.grid[0].length || cz < 0 || cz >= state.grid.length) return true;
      const tile = state.grid[cz][cx];
      if (tile === T.WALL || tile === T.PORTAL_WALL) {
        const mnX = cx * CELL, mxX = mnX + CELL, mnZ = cz * CELL, mxZ = mnZ + CELL;
        const clX = Math.max(mnX, Math.min(x, mxX)), clZ = Math.max(mnZ, Math.min(z, mxZ));
        if ((x - clX) ** 2 + (z - clZ) ** 2 < r * r) return true;
      }
      if (tile === T.DOOR) {
        const door = state.doors.find(d => d.gridX === cx && d.gridY === cz);
        if (door && !door.open) {
          const mnX = cx * CELL, mxX = mnX + CELL, mnZ = cz * CELL, mxZ = mnZ + CELL;
          const clX = Math.max(mnX, Math.min(x, mxX)), clZ = Math.max(mnZ, Math.min(z, mxZ));
          if ((x - clX) ** 2 + (z - clZ) ** 2 < r * r) return true;
        }
      }
    }
  }
  return false;
}

function killPlayer() { if (state.deathTimer > 0) return; state.deathTimer = 90; queueGLaDOS(GLADOS.death); }

function handleInteract() {
  const p = state.player;
  if (p.carrying !== null) { state.cubes[p.carrying].velocity.set(0, 0, 0); p.carrying = null; return; }
  for (let i = 0; i < state.cubes.length; i++) { if (p.position.distanceTo(state.cubes[i].position) < 3) { p.carrying = i; return; } }
}

// ===== CUBE PHYSICS =====
function updateCubes(dt) {
  state.cubes.forEach((cube, i) => {
    if (state.player.carrying === i) return;
    cube.velocity.y -= GRAVITY * dt;
    cube.position.add(cube.velocity.clone().multiplyScalar(dt));
    if (cube.position.y <= cube.size / 2) { cube.position.y = cube.size / 2; cube.velocity.y = 0; cube.grounded = true; cube.velocity.x *= 0.9; cube.velocity.z *= 0.9; }
    checkPortalTeleport(cube.position, cube.velocity, cube.size / 2);
    cube.mesh.position.copy(cube.position); cube.mesh.rotation.y += dt * 0.3;
  });
}

// ===== BUTTONS & DOORS =====
function updateButtonsDoors() {
  const level = LEVELS[state.level];
  state.buttons.forEach(button => {
    const bx = button.gridX * CELL + CELL / 2, bz = button.gridY * CELL + CELL / 2;
    button.pressed = false;
    if (Math.hypot(state.player.position.x - bx, state.player.position.z - bz) < 1) button.pressed = true;
    state.cubes.forEach(cube => { if (Math.hypot(cube.position.x - bx, cube.position.z - bz) < 1) button.pressed = true; });
    button.mesh.material = button.pressed ? MAT.buttonPressed : MAT.button;
    button.mesh.position.y = button.pressed ? 0.1 : 0.2;
  });
  level.buttonDoorLinks.forEach(link => {
    const button = state.buttons.find(b => b.gridX === link.button.x && b.gridY === link.button.y);
    const door = state.doors.find(d => d.gridX === link.door.x && d.gridY === link.door.y);
    if (button && door) {
      const shouldOpen = button.pressed;
      if (shouldOpen !== door.open) {
        door.open = shouldOpen; door.mesh.material = shouldOpen ? MAT.doorOpen : MAT.door; door.mesh.visible = !shouldOpen;
        if (shouldOpen) { const idx = state.wallMeshes.indexOf(door.mesh); if (idx >= 0) state.wallMeshes.splice(idx, 1); }
        else { if (!state.wallMeshes.includes(door.mesh)) state.wallMeshes.push(door.mesh); }
      }
    }
  });
}

// ===== GLaDOS =====
function queueGLaDOS(lines) { state.glados.queue = [...lines]; state.glados.charIndex = 0; state.glados.currentLine = ''; state.glados.timer = 0; state.glados.text = ''; advanceGLaDOS(); }
function advanceGLaDOS() { if (!state.glados.queue.length) { state.glados.currentLine = ''; return; } state.glados.currentLine = state.glados.queue.shift(); state.glados.charIndex = 0; state.glados.text = ''; state.glados.timer = 0; }
function updateGLaDOS(dt) {
  const g = state.glados; if (!g.currentLine) return; g.timer += dt;
  if (g.charIndex < g.currentLine.length) { if (g.timer > 0.03) { g.charIndex++; g.text = g.currentLine.substring(0, g.charIndex); document.getElementById('glados-text').textContent = g.text; g.timer = 0; } }
  else { if (g.timer > 3) advanceGLaDOS(); }
}

// ===== TRANSITIONS =====
function nextLevel() {
  state.screen = 'transition';
  const el = document.getElementById('level-transition');
  const ni = state.level + 1;
  document.getElementById('transition-text').textContent = ni < LEVELS.length ? 'Test Chamber ' + LEVELS[ni].name : 'Testing Complete';
  el.style.display = 'flex';
  setTimeout(() => { el.style.display = 'none'; state.screen = 'playing'; loadLevel(ni); }, 2500);
}

function gameComplete() {
  state.screen = 'complete'; queueGLaDOS(GLADOS.chamber4);
  const el = document.getElementById('level-transition');
  document.getElementById('transition-text').textContent = 'Testing Complete - The cake is a lie';
  el.style.display = 'flex';
  setTimeout(() => { el.style.display = 'none'; state.screen = 'title'; document.getElementById('title-screen').style.display = 'flex'; document.getElementById('hud').style.display = 'none'; }, 8000);
}

function updateInteractPrompt() {
  const prompt = document.getElementById('interact-prompt'); let show = false;
  if (state.player.carrying !== null) { prompt.textContent = 'Press E to drop'; show = true; }
  else { for (const cube of state.cubes) { if (state.player.position.distanceTo(cube.position) < 3) { prompt.textContent = 'Press E to pick up'; show = true; break; } } }
  prompt.style.display = show ? 'block' : 'none';
}

// ===== MAIN LOOP =====
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  if (state.screen === 'playing') {
    if (state.deathTimer > 0) { state.deathTimer--; if (state.deathTimer <= 0) loadLevel(state.level); }
    else { updatePlayer(dt); updateCubes(dt); updateButtonsDoors(); updateGLaDOS(dt); updateInteractPrompt(); }
  }
  state.time += dt;
  renderer.render(scene, camera);
}
animate();
