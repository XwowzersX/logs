// ===== APERTURE SCIENCE PORTAL - GAME ENGINE =====
// Pre-Portal 1 Aperture Science Enrichment Center

(function() {
  "use strict";

  // ===== CONSTANTS =====
  const TILE = 40;
  const GRAVITY = 0.55;
  const PLAYER_SPEED = 4;
  const JUMP_FORCE = -11;
  const PORTAL_SPEED = 18;
  const FRICTION = 0.85;
  const MAX_FALL = 14;
  const PORTAL_HEIGHT = 60;
  const PORTAL_WIDTH = 10;

  // Colors - Aperture palette
  const COLORS = {
    bg: "#1a1a1a",
    wall: "#d0d0d0",
    wallDark: "#aaaaaa",
    wallLine: "#999999",
    floor: "#c8c8c8",
    ceiling: "#b8b8b8",
    panelLight: "#e8e8e8",
    panelDark: "#b0b0b0",
    panelLine: "#9a9a9a",
    hazard: "#ff6600",
    hazardGlow: "rgba(255,102,0,0.3)",
    portalBlue: "#0077ff",
    portalBlueGlow: "rgba(0,119,255,0.4)",
    portalOrange: "#ff8c00",
    portalOrangeGlow: "rgba(255,140,0,0.4)",
    player: "#e0e0e0",
    playerOutline: "#555555",
    playerVisor: "#66ccff",
    exit: "#00cc66",
    exitGlow: "rgba(0,204,102,0.3)",
    button: "#cc0000",
    buttonPressed: "#00cc00",
    cube: "#888888",
    cubeHeart: "#ff69b4",
    doorClosed: "#666666",
    doorOpen: "#333333",
    fizzler: "#9933ff",
    fizzlerGlow: "rgba(153,51,255,0.3)",
    laserRed: "#ff0000",
    laserGlow: "rgba(255,0,0,0.3)",
    checkpoint: "#ffcc00"
  };

  // Tile types
  const T = {
    EMPTY: 0,
    WALL: 1,
    PORTAL_WALL: 2,   // White panel - can place portals
    HAZARD: 3,         // Toxic goo / energy field
    EXIT: 4,           // Level exit
    BUTTON: 5,         // Floor button
    DOOR: 6,           // Door (opened by button)
    CUBE_SPAWN: 7,     // Companion cube spawn
    FIZZLER: 8,        // Emancipation grid
    PLAYER_SPAWN: 9,
    GLASS: 10,
    CHECKPOINT: 11
  };

  // ===== GLaDOS DIALOGUE =====
  const GLADOS_LINES = {
    welcome: [
      "Welcome to the Aperture Science Enrichment Center.",
      "Please proceed to the testing area.",
      "The portal will open in three... two... one.",
    ],
    chamber0: [
      "This is the first test. Proceed through the exit.",
      "The Enrichment Center promises to always provide a safe testing environment.",
      "Cake and grief counseling will be available at the conclusion of the test.",
    ],
    chamber1: [
      "You are now in possession of the Aperture Science Handheld Portal Device.",
      "With it, you can create your own portals.",
      "Please be advised that a noticeable taste of blood is not part of any test protocol.",
    ],
    chamber2: [
      "Momentum, a function of mass and velocity, is conserved between portals.",
      "In layman's terms: speedy thing goes in, speedy thing comes out.",
      "Unbelievable. You, [Subject Name Here], must be the pride of [Subject Hometown Here].",
    ],
    chamber3: [
      "This next test involves the Aperture Science Weighted Storage Cube.",
      "Please place it on the Aperture Science Heavy Duty Super-Colliding Super Button.",
      "The Enrichment Center reminds you that the Weighted Companion Cube cannot speak.",
    ],
    chamber4: [
      "Very impressive. Please note that any appearance of danger is merely a suggestion.",
      "The Enrichment Center is required to remind you that you will be baked, and then there will be cake.",
      "Congratulations. The test is now over.",
    ],
    death: [
      "Oh. You died. How... unfortunate.",
      "The Enrichment Center apologizes for the inconvenience of your death.",
      "Please try to remain alive for the duration of the test.",
    ],
    complete: [
      "Congratulations on completing all test chambers.",
      "Your results have been noted. The cake is... being prepared.",
      "Thank you for participating in this Aperture Science computer-aided enrichment activity.",
    ]
  };

  // ===== LEVEL DATA =====
  // Each level: { grid: 2D array, portalsAllowed: bool, cubes: [{x,y}], buttonDoorLinks: [{button:{x,y}, door:{x,y}}] }
  const LEVELS = [
    // Chamber 00 - Tutorial: Walk to exit (no portals)
    {
      name: "00",
      grid: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      ],
      portalsAllowed: false,
      cubes: [],
      buttonDoorLinks: [],
      dialogue: "chamber0"
    },
    // Chamber 01 - First portals: use portals to cross a gap
    {
      name: "01",
      grid: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,2,1,1],
        [1,2,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,2,1,1],
        [1,2,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,2,1,1],
        [1,2,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,2,1,1],
        [1,2,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,2,1,1],
        [1,2,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,2,1,1],
        [1,1,9,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,4,0,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,3,3,3,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,3,3,3,1,1,1,1,1,1,1,1,1,1,1,1],
      ],
      portalsAllowed: true,
      cubes: [],
      buttonDoorLinks: [],
      dialogue: "chamber1"
    },
    // Chamber 02 - Momentum: fall into portal, fly out the other
    {
      name: "02",
      grid: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,4,1],
        [1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,9,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      ],
      portalsAllowed: true,
      cubes: [],
      buttonDoorLinks: [],
      dialogue: "chamber2"
    },
    // Chamber 03 - Cube & Button puzzle
    {
      name: "03",
      grid: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,2,1],
        [1,2,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,2,1],
        [1,2,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,2,1],
        [1,2,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,2,1],
        [1,2,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,2,1],
        [1,2,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,2,1],
        [1,2,0,0,0,0,7,0,0,0,0,0,0,1,6,0,0,0,0,0,0,0,0,2,1],
        [1,1,9,0,0,0,0,0,0,0,5,0,0,1,1,0,0,0,0,0,0,4,0,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      ],
      portalsAllowed: true,
      cubes: [{x: 6, y: 7}],
      buttonDoorLinks: [{button: {x:10, y:8}, door: {x:14, y:7}}],
      dialogue: "chamber3"
    },
    // Chamber 04 - Final challenge: hazards + portals + platforming
    {
      name: "04",
      grid: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,0,0,0,0,0,0,2,1,2,0,0,0,0,0,0,0,0,0,0,0,0,2,1],
        [1,2,0,0,0,0,0,0,2,1,2,0,0,0,0,0,0,0,0,0,0,0,0,2,1],
        [1,2,0,0,0,0,0,0,2,1,2,0,0,0,0,0,0,0,0,0,0,0,0,2,1],
        [1,2,0,0,0,0,0,0,2,1,2,0,0,0,0,0,0,0,0,0,0,0,0,2,1],
        [1,2,0,0,0,0,0,0,2,1,2,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
        [1,2,0,0,0,0,0,0,2,1,2,0,0,0,0,0,0,0,0,0,0,0,0,2,1],
        [1,2,9,0,0,0,0,0,2,1,2,0,0,0,0,0,0,0,0,0,0,0,4,2,1],
        [1,1,1,1,2,2,2,2,1,1,1,1,1,1,1,1,1,1,2,2,2,2,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,3,3,3,3,3,3,3,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      ],
      portalsAllowed: true,
      cubes: [],
      buttonDoorLinks: [],
      dialogue: "chamber4"
    }
  ];

  // ===== GAME STATE =====
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");

  let state = {
    screen: "title", // title, playing, transition, complete
    level: 0,
    player: { x: 0, y: 0, vx: 0, vy: 0, w: 24, h: 36, grounded: false, facing: 1, carrying: null },
    portals: { blue: null, orange: null },
    portalProjectile: null,
    cubes: [],
    buttons: [],
    doors: [],
    grid: [],
    camera: { x: 0, y: 0 },
    mouseX: 0,
    mouseY: 0,
    keys: {},
    glados: { text: "", queue: [], timer: 0, charIndex: 0, currentLine: "" },
    particles: [],
    time: 0,
    deathTimer: 0,
    portalAnimTimer: 0
  };

  // ===== CANVAS SETUP =====
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // ===== INPUT =====
  window.addEventListener("keydown", (e) => {
    state.keys[e.key.toLowerCase()] = true;
    if (state.screen === "title" && (e.key === "Enter" || e.key === " ")) {
      startGame();
    }
    if (e.key.toLowerCase() === "r" && state.screen === "playing") {
      state.portals.blue = null;
      state.portals.orange = null;
      updatePortalIndicators();
    }
  });

  window.addEventListener("keyup", (e) => {
    state.keys[e.key.toLowerCase()] = false;
  });

  canvas.addEventListener("mousemove", (e) => {
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;
  });

  canvas.addEventListener("mousedown", (e) => {
    if (state.screen === "title") {
      startGame();
      return;
    }
    if (state.screen !== "playing") return;
    if (!LEVELS[state.level].portalsAllowed) return;

    e.preventDefault();
    const type = (e.button === 0) ? "blue" : "orange";
    firePortal(type);
  });

  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  // ===== GAME INIT =====
  function startGame() {
    state.screen = "playing";
    document.getElementById("title-screen").style.display = "none";
    document.getElementById("hud").style.display = "flex";
    loadLevel(0);
  }

  function loadLevel(index) {
    if (index >= LEVELS.length) {
      gameComplete();
      return;
    }

    state.level = index;
    const level = LEVELS[index];
    state.grid = level.grid.map(row => [...row]);
    state.portals = { blue: null, orange: null };
    state.portalProjectile = null;
    state.cubes = [];
    state.buttons = [];
    state.doors = [];
    state.particles = [];
    state.deathTimer = 0;

    // Find player spawn and set up objects
    for (let y = 0; y < state.grid.length; y++) {
      for (let x = 0; x < state.grid[y].length; x++) {
        const tile = state.grid[y][x];
        if (tile === T.PLAYER_SPAWN) {
          state.player.x = x * TILE + (TILE - state.player.w) / 2;
          state.player.y = y * TILE + (TILE - state.player.h);
          state.player.vx = 0;
          state.player.vy = 0;
          state.player.grounded = false;
          state.player.carrying = null;
          state.grid[y][x] = T.EMPTY;
        }
        if (tile === T.BUTTON) {
          state.buttons.push({ x: x, y: y, pressed: false });
        }
        if (tile === T.DOOR) {
          state.doors.push({ x: x, y: y, open: false });
        }
      }
    }

    // Spawn cubes
    level.cubes.forEach(c => {
      state.cubes.push({
        x: c.x * TILE + (TILE - 30) / 2,
        y: c.y * TILE + (TILE - 30),
        w: 30, h: 30,
        vx: 0, vy: 0,
        grounded: false
      });
    });

    // Update HUD
    document.getElementById("chamber-num").textContent = level.name;
    updatePortalIndicators();

    // GLaDOS dialogue
    if (level.dialogue && GLADOS_LINES[level.dialogue]) {
      queueGLaDOS(GLADOS_LINES[level.dialogue]);
    }
  }

  function gameComplete() {
    state.screen = "complete";
    queueGLaDOS(GLADOS_LINES.complete);
    showTransition("Testing Complete - Thank you for participating");
    setTimeout(() => {
      state.screen = "title";
      document.getElementById("title-screen").style.display = "flex";
      document.getElementById("hud").style.display = "none";
      document.getElementById("level-transition").style.display = "none";
    }, 8000);
  }

  function showTransition(text) {
    const el = document.getElementById("level-transition");
    document.getElementById("transition-text").textContent = text;
    el.style.display = "flex";
    setTimeout(() => {
      el.style.display = "none";
    }, 2500);
  }

  function nextLevel() {
    state.screen = "transition";
    showTransition("Test Chamber " + (LEVELS[state.level + 1] ? LEVELS[state.level + 1].name : "??"));
    setTimeout(() => {
      state.screen = "playing";
      loadLevel(state.level + 1);
    }, 2500);
  }

  // ===== GLaDOS TEXT SYSTEM =====
  function queueGLaDOS(lines) {
    state.glados.queue = [...lines];
    state.glados.charIndex = 0;
    state.glados.currentLine = "";
    state.glados.timer = 0;
    advanceGLaDOS();
  }

  function advanceGLaDOS() {
    if (state.glados.queue.length === 0) {
      return;
    }
    state.glados.currentLine = state.glados.queue.shift();
    state.glados.charIndex = 0;
    state.glados.text = "";
    state.glados.timer = 0;
  }

  function updateGLaDOS() {
    if (state.glados.currentLine && state.glados.charIndex < state.glados.currentLine.length) {
      state.glados.timer++;
      if (state.glados.timer % 2 === 0) {
        state.glados.charIndex++;
        state.glados.text = state.glados.currentLine.substring(0, state.glados.charIndex);
        document.getElementById("glados-text").textContent = state.glados.text;
      }
    } else if (state.glados.currentLine && state.glados.charIndex >= state.glados.currentLine.length) {
      state.glados.timer++;
      if (state.glados.timer > 180) { // 3 seconds pause
        advanceGLaDOS();
      }
    }
  }

  // ===== PORTAL INDICATORS =====
  function updatePortalIndicators() {
    const blueEl = document.getElementById("portal-blue-ind");
    const orangeEl = document.getElementById("portal-orange-ind");
    blueEl.className = state.portals.blue ? "ind-active" : "ind-empty";
    orangeEl.className = state.portals.orange ? "ind-active" : "ind-empty";
  }

  // ===== PORTAL FIRING =====
  function firePortal(type) {
    const px = state.player.x + state.player.w / 2 - state.camera.x;
    const py = state.player.y + state.player.h / 2 - state.camera.y;
    const angle = Math.atan2(state.mouseY - py, state.mouseX - px);

    state.portalProjectile = {
      x: state.player.x + state.player.w / 2,
      y: state.player.y + state.player.h / 2,
      vx: Math.cos(angle) * PORTAL_SPEED,
      vy: Math.sin(angle) * PORTAL_SPEED,
      type: type,
      life: 60
    };
  }

  function updatePortalProjectile() {
    const proj = state.portalProjectile;
    if (!proj) return;

    proj.x += proj.vx;
    proj.y += proj.vy;
    proj.life--;

    if (proj.life <= 0) {
      state.portalProjectile = null;
      return;
    }

    // Check collision with walls
    const tileX = Math.floor(proj.x / TILE);
    const tileY = Math.floor(proj.y / TILE);

    if (tileX < 0 || tileX >= state.grid[0].length || tileY < 0 || tileY >= state.grid.length) {
      state.portalProjectile = null;
      return;
    }

    const tile = state.grid[tileY][tileX];
    if (tile === T.WALL) {
      state.portalProjectile = null;
      // Particles for failed placement
      spawnParticles(proj.x, proj.y, proj.type === "blue" ? COLORS.portalBlue : COLORS.portalOrange, 5);
      return;
    }

    if (tile === T.PORTAL_WALL) {
      // Determine which face was hit
      const prevX = proj.x - proj.vx;
      const prevY = proj.y - proj.vy;
      const prevTileX = Math.floor(prevX / TILE);
      const prevTileY = Math.floor(prevY / TILE);

      let face = null;
      let portalX, portalY;

      if (prevTileX < tileX) {
        face = "left";
        portalX = tileX * TILE;
        portalY = tileY * TILE + TILE / 2;
      } else if (prevTileX > tileX) {
        face = "right";
        portalX = (tileX + 1) * TILE;
        portalY = tileY * TILE + TILE / 2;
      } else if (prevTileY < tileY) {
        face = "top";
        portalX = tileX * TILE + TILE / 2;
        portalY = tileY * TILE;
      } else if (prevTileY > tileY) {
        face = "bottom";
        portalX = tileX * TILE + TILE / 2;
        portalY = (tileY + 1) * TILE;
      } else {
        // Same tile - use velocity to determine face
        if (Math.abs(proj.vx) > Math.abs(proj.vy)) {
          if (proj.vx > 0) { face = "left"; portalX = tileX * TILE; }
          else { face = "right"; portalX = (tileX + 1) * TILE; }
          portalY = tileY * TILE + TILE / 2;
        } else {
          if (proj.vy > 0) { face = "top"; portalY = tileY * TILE; }
          else { face = "bottom"; portalY = (tileY + 1) * TILE; }
          portalX = tileX * TILE + TILE / 2;
        }
      }

      if (face) {
        state.portals[proj.type] = {
          x: portalX,
          y: portalY,
          face: face,
          tileX: tileX,
          tileY: tileY
        };
        updatePortalIndicators();
        spawnParticles(portalX, portalY, proj.type === "blue" ? COLORS.portalBlue : COLORS.portalOrange, 15);
      }

      state.portalProjectile = null;
    }
  }

  // ===== PHYSICS =====
  function isSolid(gx, gy) {
    if (gx < 0 || gx >= state.grid[0].length || gy < 0 || gy >= state.grid.length) return true;
    const tile = state.grid[gy][gx];
    return tile === T.WALL || tile === T.PORTAL_WALL || tile === T.GLASS ||
           (tile === T.DOOR && !isDoorOpen(gx, gy));
  }

  function isDoorOpen(gx, gy) {
    for (const door of state.doors) {
      if (door.x === gx && door.y === gy) return door.open;
    }
    return false;
  }

  function isHazard(gx, gy) {
    if (gx < 0 || gx >= state.grid[0].length || gy < 0 || gy >= state.grid.length) return false;
    return state.grid[gy][gx] === T.HAZARD;
  }

  function isExit(gx, gy) {
    if (gx < 0 || gx >= state.grid[0].length || gy < 0 || gy >= state.grid.length) return false;
    return state.grid[gy][gx] === T.EXIT;
  }

  function resolveCollision(entity, oldX, oldY) {
    // Horizontal
    const testLeft = Math.floor(entity.x / TILE);
    const testRight = Math.floor((entity.x + entity.w - 1) / TILE);
    const testTop = Math.floor(entity.y / TILE);
    const testBottom = Math.floor((entity.y + entity.h - 1) / TILE);

    // Check each corner
    for (let gy = testTop; gy <= testBottom; gy++) {
      for (let gx = testLeft; gx <= testRight; gx++) {
        if (isSolid(gx, gy)) {
          // Resolve by pushing out
          const overlapLeft = (entity.x + entity.w) - gx * TILE;
          const overlapRight = (gx + 1) * TILE - entity.x;
          const overlapTop = (entity.y + entity.h) - gy * TILE;
          const overlapBottom = (gy + 1) * TILE - entity.y;

          const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

          if (minOverlap === overlapTop && entity.vy >= 0) {
            entity.y = gy * TILE - entity.h;
            entity.vy = 0;
            entity.grounded = true;
          } else if (minOverlap === overlapBottom && entity.vy <= 0) {
            entity.y = (gy + 1) * TILE;
            entity.vy = 0;
          } else if (minOverlap === overlapLeft && entity.vx >= 0) {
            entity.x = gx * TILE - entity.w;
            entity.vx = 0;
          } else if (minOverlap === overlapRight && entity.vx <= 0) {
            entity.x = (gx + 1) * TILE;
            entity.vx = 0;
          }
        }
      }
    }
  }

  // ===== PORTAL TELEPORTATION =====
  function checkPortalTeleport(entity) {
    if (!state.portals.blue || !state.portals.orange) return;

    const portals = [
      { src: state.portals.blue, dst: state.portals.orange },
      { src: state.portals.orange, dst: state.portals.blue }
    ];

    for (const { src, dst } of portals) {
      if (isNearPortal(entity, src)) {
        teleportEntity(entity, src, dst);
        return;
      }
    }
  }

  function isNearPortal(entity, portal) {
    const cx = entity.x + entity.w / 2;
    const cy = entity.y + entity.h / 2;
    const dist = Math.hypot(cx - portal.x, cy - portal.y);

    if (dist > TILE * 0.9) return false;

    // Check entity is moving into the portal
    switch (portal.face) {
      case "left": return entity.vx > 0.5 && cx > portal.x - 10;
      case "right": return entity.vx < -0.5 && cx < portal.x + 10;
      case "top": return entity.vy > 0.5 && cy > portal.y - 10;
      case "bottom": return entity.vy < -0.5 && cy < portal.y + 10;
    }
    return false;
  }

  function teleportEntity(entity, src, dst) {
    const speed = Math.hypot(entity.vx, entity.vy);
    const boostedSpeed = Math.max(speed, 8); // Minimum exit speed

    // Position at destination portal
    switch (dst.face) {
      case "left":
        entity.x = dst.x - entity.w - 5;
        entity.y = dst.y - entity.h / 2;
        entity.vx = -boostedSpeed;
        entity.vy = 0;
        break;
      case "right":
        entity.x = dst.x + 5;
        entity.y = dst.y - entity.h / 2;
        entity.vx = boostedSpeed;
        entity.vy = 0;
        break;
      case "top":
        entity.x = dst.x - entity.w / 2;
        entity.y = dst.y - entity.h - 5;
        entity.vx = 0;
        entity.vy = -boostedSpeed;
        break;
      case "bottom":
        entity.x = dst.x - entity.w / 2;
        entity.y = dst.y + 5;
        entity.vx = 0;
        entity.vy = boostedSpeed;
        break;
    }

    entity.grounded = false;
    spawnParticles(dst.x, dst.y, COLORS.portalBlue, 10);
    spawnParticles(dst.x, dst.y, COLORS.portalOrange, 10);
  }

  // ===== PLAYER UPDATE =====
  function updatePlayer() {
    const p = state.player;
    const keys = state.keys;

    // Horizontal movement
    if (keys["a"] || keys["arrowleft"]) {
      p.vx -= PLAYER_SPEED * 0.3;
      p.facing = -1;
    }
    if (keys["d"] || keys["arrowright"]) {
      p.vx += PLAYER_SPEED * 0.3;
      p.facing = 1;
    }

    // Jump
    if ((keys["w"] || keys["arrowup"] || keys[" "]) && p.grounded) {
      p.vy = JUMP_FORCE;
      p.grounded = false;
    }

    // Apply friction
    p.vx *= FRICTION;

    // Apply gravity
    p.vy += GRAVITY;
    if (p.vy > MAX_FALL) p.vy = MAX_FALL;

    // Clamp horizontal speed
    if (Math.abs(p.vx) > PLAYER_SPEED) {
      p.vx = Math.sign(p.vx) * PLAYER_SPEED;
    }
    if (Math.abs(p.vx) < 0.1) p.vx = 0;

    // Save old position
    const oldX = p.x;
    const oldY = p.y;

    // Move
    p.grounded = false;
    p.x += p.vx;
    p.y += p.vy;

    // Resolve collisions
    resolveCollision(p, oldX, oldY);

    // Check portal teleport
    checkPortalTeleport(p);

    // Check hazards
    const centerX = Math.floor((p.x + p.w / 2) / TILE);
    const bottomY = Math.floor((p.y + p.h - 1) / TILE);
    const topY = Math.floor(p.y / TILE);

    for (let gy = topY; gy <= bottomY; gy++) {
      const leftX = Math.floor(p.x / TILE);
      const rightX = Math.floor((p.x + p.w - 1) / TILE);
      for (let gx = leftX; gx <= rightX; gx++) {
        if (isHazard(gx, gy)) {
          killPlayer();
          return;
        }
        if (isExit(gx, gy)) {
          nextLevel();
          return;
        }
      }
    }

    // Check fizzler - destroy portals
    for (let gy = topY; gy <= bottomY; gy++) {
      const leftX = Math.floor(p.x / TILE);
      const rightX = Math.floor((p.x + p.w - 1) / TILE);
      for (let gx = leftX; gx <= rightX; gx++) {
        if (gx >= 0 && gx < state.grid[0].length && gy >= 0 && gy < state.grid.length) {
          if (state.grid[gy][gx] === T.FIZZLER) {
            state.portals.blue = null;
            state.portals.orange = null;
            updatePortalIndicators();
            if (p.carrying !== null) {
              p.carrying = null;
            }
          }
        }
      }
    }

    // Pick up / drop cube
    if (keys["e"]) {
      keys["e"] = false; // Prevent repeat
      if (p.carrying !== null) {
        // Drop
        const cube = state.cubes[p.carrying];
        cube.x = p.x + (p.facing > 0 ? p.w + 5 : -cube.w - 5);
        cube.y = p.y + p.h - cube.h;
        p.carrying = null;
      } else {
        // Pick up nearest cube
        for (let i = 0; i < state.cubes.length; i++) {
          const cube = state.cubes[i];
          const dist = Math.hypot(
            (p.x + p.w/2) - (cube.x + cube.w/2),
            (p.y + p.h/2) - (cube.y + cube.h/2)
          );
          if (dist < TILE * 2) {
            p.carrying = i;
            break;
          }
        }
      }
    }

    // Move carried cube
    if (p.carrying !== null && state.cubes[p.carrying]) {
      const cube = state.cubes[p.carrying];
      cube.x = p.x + (p.facing > 0 ? p.w + 2 : -cube.w - 2);
      cube.y = p.y + (p.h - cube.h) / 2;
      cube.vx = 0;
      cube.vy = 0;
    }
  }

  function killPlayer() {
    if (state.deathTimer > 0) return;
    state.deathTimer = 90;
    spawnParticles(state.player.x + state.player.w/2, state.player.y + state.player.h/2, "#ff4444", 30);
    queueGLaDOS(GLADOS_LINES.death);
  }

  // ===== CUBE PHYSICS =====
  function updateCubes() {
    state.cubes.forEach((cube, i) => {
      if (state.player.carrying === i) return;

      cube.vy += GRAVITY;
      if (cube.vy > MAX_FALL) cube.vy = MAX_FALL;
      cube.vx *= 0.9;

      cube.x += cube.vx;
      cube.y += cube.vy;

      cube.grounded = false;
      resolveCollision(cube, cube.x - cube.vx, cube.y - cube.vy);
      checkPortalTeleport(cube);
    });
  }

  // ===== BUTTON / DOOR LOGIC =====
  function updateButtonsDoors() {
    const level = LEVELS[state.level];

    state.buttons.forEach(button => {
      button.pressed = false;

      // Check player on button
      const bx = button.x * TILE;
      const by = button.y * TILE;
      const p = state.player;

      if (p.x + p.w > bx && p.x < bx + TILE &&
          p.y + p.h > by && p.y < by + TILE) {
        button.pressed = true;
      }

      // Check cubes on button
      state.cubes.forEach(cube => {
        if (cube.x + cube.w > bx && cube.x < bx + TILE &&
            cube.y + cube.h > by && cube.y < by + TILE) {
          button.pressed = true;
        }
      });
    });

    // Update doors based on linked buttons
    level.buttonDoorLinks.forEach(link => {
      const button = state.buttons.find(b => b.x === link.button.x && b.y === link.button.y);
      const door = state.doors.find(d => d.x === link.door.x && d.y === link.door.y);
      if (button && door) {
        door.open = button.pressed;
      }
    });
  }

  // ===== CAMERA =====
  function updateCamera() {
    const p = state.player;
    const targetX = p.x + p.w / 2 - canvas.width / 2;
    const targetY = p.y + p.h / 2 - canvas.height / 2;

    const maxX = state.grid[0].length * TILE - canvas.width;
    const maxY = state.grid.length * TILE - canvas.height;

    state.camera.x += (targetX - state.camera.x) * 0.1;
    state.camera.y += (targetY - state.camera.y) * 0.1;

    state.camera.x = Math.max(0, Math.min(state.camera.x, maxX));
    state.camera.y = Math.max(0, Math.min(state.camera.y, maxY));
  }

  // ===== PARTICLES =====
  function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      state.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        color: color,
        size: 2 + Math.random() * 4
      });
    }
  }

  function updateParticles() {
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.vx *= 0.98;
      p.life--;
      if (p.life <= 0) {
        state.particles.splice(i, 1);
      }
    }
  }

  // ===== RENDERING =====
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (state.screen === "title" || state.screen === "complete") return;

    const cam = state.camera;

    // Background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    const startCol = Math.max(0, Math.floor(cam.x / TILE));
    const endCol = Math.min(state.grid[0].length, Math.ceil((cam.x + canvas.width) / TILE) + 1);
    const startRow = Math.max(0, Math.floor(cam.y / TILE));
    const endRow = Math.min(state.grid.length, Math.ceil((cam.y + canvas.height) / TILE) + 1);

    for (let y = startRow; y < endRow; y++) {
      for (let x = startCol; x < endCol; x++) {
        const tile = state.grid[y][x];
        const sx = x * TILE - cam.x;
        const sy = y * TILE - cam.y;

        switch (tile) {
          case T.WALL:
            drawWallTile(sx, sy);
            break;
          case T.PORTAL_WALL:
            drawPortalWallTile(sx, sy);
            break;
          case T.HAZARD:
            drawHazardTile(sx, sy);
            break;
          case T.EXIT:
            drawExitTile(sx, sy);
            break;
          case T.BUTTON:
            drawButtonTile(sx, sy, x, y);
            break;
          case T.DOOR:
            drawDoorTile(sx, sy, x, y);
            break;
          case T.FIZZLER:
            drawFizzlerTile(sx, sy);
            break;
          case T.GLASS:
            drawGlassTile(sx, sy);
            break;
          case T.CHECKPOINT:
            drawCheckpointTile(sx, sy);
            break;
        }
      }
    }

    // Draw cubes
    state.cubes.forEach((cube, i) => {
      if (state.player.carrying === i) return; // Draw carried cube with player
      drawCube(cube.x - cam.x, cube.y - cam.y, cube);
    });

    // Draw portals
    if (state.portals.blue) drawPortal(state.portals.blue, "blue");
    if (state.portals.orange) drawPortal(state.portals.orange, "orange");

    // Draw portal projectile
    if (state.portalProjectile) {
      const proj = state.portalProjectile;
      ctx.fillStyle = proj.type === "blue" ? COLORS.portalBlue : COLORS.portalOrange;
      ctx.shadowColor = proj.type === "blue" ? COLORS.portalBlueGlow : COLORS.portalOrangeGlow;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(proj.x - cam.x, proj.y - cam.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Draw player
    if (state.deathTimer <= 0) {
      drawPlayer();
    }

    // Draw carried cube
    if (state.player.carrying !== null && state.cubes[state.player.carrying]) {
      const cube = state.cubes[state.player.carrying];
      drawCube(cube.x - cam.x, cube.y - cam.y, cube);
    }

    // Draw particles
    state.particles.forEach(p => {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - cam.x - p.size/2, p.y - cam.y - p.size/2, p.size, p.size);
    });
    ctx.globalAlpha = 1;

    // Draw crosshair
    drawCrosshair();
  }

  function drawWallTile(x, y) {
    // Concrete wall
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(x, y, TILE, TILE);

    // Panel lines
    ctx.strokeStyle = COLORS.wallLine;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2);

    // Inner panel detail
    ctx.fillStyle = COLORS.wallDark;
    ctx.fillRect(x + 3, y + 3, TILE - 6, TILE - 6);
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(x + 5, y + 5, TILE - 10, TILE - 10);
  }

  function drawPortalWallTile(x, y) {
    // White portal surface
    ctx.fillStyle = COLORS.panelLight;
    ctx.fillRect(x, y, TILE, TILE);

    // Clean panel lines (Aperture style)
    ctx.strokeStyle = COLORS.panelLine;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x + 2, y + 2, TILE - 4, TILE - 4);

    // Inner bevel
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(x + 4, y + 4, TILE - 8, TILE - 8);
  }

  function drawHazardTile(x, y) {
    // Toxic goo
    const wave = Math.sin(state.time * 0.05 + x * 0.1) * 3;

    ctx.fillStyle = COLORS.hazard;
    ctx.fillRect(x, y, TILE, TILE);

    // Glow effect
    ctx.fillStyle = COLORS.hazardGlow;
    ctx.fillRect(x - 2, y + wave - 5, TILE + 4, 10);

    // Surface shine
    ctx.fillStyle = "rgba(255,200,0,0.3)";
    ctx.fillRect(x, y + wave, TILE, 2);

    // Bubbles
    if (Math.random() < 0.02) {
      spawnParticles(x + Math.random() * TILE, y, COLORS.hazard, 1);
    }
  }

  function drawExitTile(x, y) {
    // Exit door
    ctx.fillStyle = "#222";
    ctx.fillRect(x, y, TILE, TILE);

    // Glowing frame
    const pulse = 0.5 + Math.sin(state.time * 0.08) * 0.3;
    ctx.strokeStyle = COLORS.exit;
    ctx.lineWidth = 3;
    ctx.globalAlpha = pulse;
    ctx.strokeRect(x + 3, y + 3, TILE - 6, TILE - 6);
    ctx.globalAlpha = 1;

    // Arrow
    ctx.fillStyle = COLORS.exit;
    ctx.globalAlpha = pulse;
    ctx.beginPath();
    ctx.moveTo(x + TILE/2, y + 10);
    ctx.lineTo(x + TILE - 10, y + TILE/2);
    ctx.lineTo(x + TILE/2, y + TILE - 10);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // Exit sign glow
    ctx.shadowColor = COLORS.exitGlow;
    ctx.shadowBlur = 20;
    ctx.fillStyle = "transparent";
    ctx.fillRect(x, y, TILE, TILE);
    ctx.shadowBlur = 0;
  }

  function drawButtonTile(x, y, gx, gy) {
    // Floor
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(x, y, TILE, TILE);

    const button = state.buttons.find(b => b.x === gx && b.y === gy);
    const pressed = button && button.pressed;

    // Button base
    ctx.fillStyle = "#444";
    ctx.fillRect(x + 8, y + TILE - 12, TILE - 16, 8);

    // Button top
    ctx.fillStyle = pressed ? COLORS.buttonPressed : COLORS.button;
    const buttonY = pressed ? y + TILE - 8 : y + TILE - 14;
    ctx.fillRect(x + 6, buttonY, TILE - 12, 4);

    // Glow
    if (pressed) {
      ctx.shadowColor = COLORS.buttonPressed;
      ctx.shadowBlur = 10;
      ctx.fillRect(x + 6, buttonY, TILE - 12, 4);
      ctx.shadowBlur = 0;
    }
  }

  function drawDoorTile(x, y, gx, gy) {
    const door = state.doors.find(d => d.x === gx && d.y === gy);
    const open = door && door.open;

    if (open) {
      // Open door - dark passage
      ctx.fillStyle = COLORS.doorOpen;
      ctx.fillRect(x, y, TILE, TILE);
      // Door frame
      ctx.strokeStyle = "#555";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 2, y, TILE - 4, TILE);
    } else {
      // Closed door
      ctx.fillStyle = COLORS.doorClosed;
      ctx.fillRect(x, y, TILE, TILE);

      // Door panels
      ctx.strokeStyle = "#555";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + TILE/2, y);
      ctx.lineTo(x + TILE/2, y + TILE);
      ctx.stroke();

      // Lock indicator
      ctx.fillStyle = COLORS.button;
      ctx.beginPath();
      ctx.arc(x + TILE/2, y + TILE/2, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawFizzlerTile(x, y) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(x, y, TILE, TILE);

    // Fizzler field
    for (let i = 0; i < 5; i++) {
      const fy = y + (i / 5) * TILE + Math.sin(state.time * 0.1 + i) * 3;
      ctx.strokeStyle = COLORS.fizzler;
      ctx.globalAlpha = 0.3 + Math.sin(state.time * 0.15 + i * 0.5) * 0.2;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, fy);
      ctx.lineTo(x + TILE, fy);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawGlassTile(x, y) {
    ctx.fillStyle = "rgba(180,220,255,0.2)";
    ctx.fillRect(x, y, TILE, TILE);
    ctx.strokeStyle = "rgba(180,220,255,0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, TILE, TILE);
  }

  function drawCheckpointTile(x, y) {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(x, y, TILE, TILE);
    const pulse = 0.3 + Math.sin(state.time * 0.06) * 0.2;
    ctx.fillStyle = COLORS.checkpoint;
    ctx.globalAlpha = pulse;
    ctx.fillRect(x + TILE/2 - 2, y + 5, 4, TILE - 10);
    ctx.globalAlpha = 1;
  }

  function drawCube(x, y, cube) {
    // Companion cube
    ctx.fillStyle = COLORS.cube;
    ctx.fillRect(x, y, cube.w, cube.h);

    // Edge highlights
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 1, y + 1, cube.w - 2, cube.h - 2);

    // Corner circles
    const r = 4;
    ctx.fillStyle = "#999";
    [[x+6, y+6], [x+cube.w-6, y+6], [x+6, y+cube.h-6], [x+cube.w-6, y+cube.h-6]].forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Heart
    ctx.fillStyle = COLORS.cubeHeart;
    const hx = x + cube.w/2;
    const hy = y + cube.h/2;
    ctx.beginPath();
    ctx.moveTo(hx, hy + 4);
    ctx.bezierCurveTo(hx - 6, hy - 2, hx - 6, hy - 8, hx, hy - 4);
    ctx.bezierCurveTo(hx + 6, hy - 8, hx + 6, hy - 2, hx, hy + 4);
    ctx.fill();
  }

  function drawPortal(portal, type) {
    const cam = state.camera;
    const x = portal.x - cam.x;
    const y = portal.y - cam.y;
    const color = type === "blue" ? COLORS.portalBlue : COLORS.portalOrange;
    const glow = type === "blue" ? COLORS.portalBlueGlow : COLORS.portalOrangeGlow;

    ctx.save();

    // Outer glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 25;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;

    const pulse = 1 + Math.sin(state.time * 0.1) * 0.1;

    if (portal.face === "left" || portal.face === "right") {
      // Vertical portal
      ctx.beginPath();
      ctx.ellipse(x, y, PORTAL_WIDTH * 0.6 * pulse, PORTAL_HEIGHT * 0.5 * pulse, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Inner fill
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.ellipse(x, y, PORTAL_WIDTH * 0.4 * pulse, PORTAL_HEIGHT * 0.35 * pulse, 0, 0, Math.PI * 2);
      ctx.fill();

      // Event horizon
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.beginPath();
      ctx.ellipse(x, y, PORTAL_WIDTH * 0.2, PORTAL_HEIGHT * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Horizontal portal
      ctx.beginPath();
      ctx.ellipse(x, y, PORTAL_HEIGHT * 0.5 * pulse, PORTAL_WIDTH * 0.6 * pulse, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.ellipse(x, y, PORTAL_HEIGHT * 0.35 * pulse, PORTAL_WIDTH * 0.4 * pulse, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.beginPath();
      ctx.ellipse(x, y, PORTAL_HEIGHT * 0.2, PORTAL_WIDTH * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawPlayer() {
    const p = state.player;
    const cam = state.camera;
    const x = p.x - cam.x;
    const y = p.y - cam.y;

    ctx.save();

    // Chell-inspired character
    // Body (orange jumpsuit)
    ctx.fillStyle = "#ff8844";
    ctx.fillRect(x + 4, y + 12, p.w - 8, p.h - 16);

    // Long fall boots
    ctx.fillStyle = "#ddd";
    ctx.fillRect(x + 3, y + p.h - 8, 8, 8);
    ctx.fillRect(x + p.w - 11, y + p.h - 8, 8, 8);

    // Boot springs
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 7, y + p.h - 12);
    ctx.lineTo(x + 5, y + p.h - 8);
    ctx.lineTo(x + 9, y + p.h - 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + p.w - 7, y + p.h - 12);
    ctx.lineTo(x + p.w - 9, y + p.h - 8);
    ctx.lineTo(x + p.w - 5, y + p.h - 8);
    ctx.stroke();

    // Head
    ctx.fillStyle = COLORS.player;
    ctx.beginPath();
    ctx.arc(x + p.w / 2, y + 8, 8, 0, Math.PI * 2);
    ctx.fill();

    // Hair (dark ponytail)
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.arc(x + p.w / 2, y + 5, 8, -Math.PI, 0);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#333";
    const eyeOffset = p.facing > 0 ? 2 : -2;
    ctx.fillRect(x + p.w/2 + eyeOffset - 2, y + 7, 2, 2);
    ctx.fillRect(x + p.w/2 + eyeOffset + 2, y + 7, 2, 2);

    // Portal gun
    ctx.fillStyle = "#ccc";
    const gunX = p.facing > 0 ? x + p.w - 2 : x - 10;
    ctx.fillRect(gunX, y + 16, 12, 6);

    // Portal gun claws
    ctx.fillStyle = "#999";
    ctx.fillRect(gunX + (p.facing > 0 ? 10 : 0), y + 14, 4, 3);
    ctx.fillRect(gunX + (p.facing > 0 ? 10 : 0), y + 21, 4, 3);

    // Portal gun glow
    const glowColor = LEVELS[state.level].portalsAllowed ? "rgba(100,200,255,0.4)" : "rgba(100,100,100,0.2)";
    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.arc(gunX + (p.facing > 0 ? 14 : -2), y + 19, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawCrosshair() {
    const mx = state.mouseX;
    const my = state.mouseY;
    const size = 12;

    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1.5;

    // Outer ring
    ctx.beginPath();
    ctx.arc(mx, my, size, 0, Math.PI * 2);
    ctx.stroke();

    // Inner cross
    ctx.beginPath();
    ctx.moveTo(mx - 4, my);
    ctx.lineTo(mx + 4, my);
    ctx.moveTo(mx, my - 4);
    ctx.lineTo(mx, my + 4);
    ctx.stroke();

    // Portal color indicators
    if (LEVELS[state.level] && LEVELS[state.level].portalsAllowed) {
      ctx.fillStyle = COLORS.portalBlue;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(mx - size - 4, my, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = COLORS.portalOrange;
      ctx.beginPath();
      ctx.arc(mx + size + 4, my, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // ===== MAIN LOOP =====
  function update() {
    if (state.screen !== "playing") return;

    state.time++;

    if (state.deathTimer > 0) {
      state.deathTimer--;
      if (state.deathTimer <= 0) {
        loadLevel(state.level);
      }
      updateParticles();
      return;
    }

    updatePlayer();
    updateCubes();
    updateButtonsDoors();
    updatePortalProjectile();
    updateCamera();
    updateParticles();
    updateGLaDOS();
    state.portalAnimTimer += 0.02;
  }

  function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
  }

  // Start the loop
  gameLoop();

})();
