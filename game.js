// ===========================================================
//  Who Said Diz — game.js (refactored, commented, same behavior)
// ===========================================================

const APP_VERSION = "1.4";

// ---------- Small DOM + utility helpers ----------
const $ = id => document.getElementById(id);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const medal = i => ["🥇 ", "🥈 ", "🥉 "][i] || "";

const PLAYER_BADGE_COLORS = [
  "#FFB3BA", "#FFDFBA", "#E0BBFF", "#E5E5A6",
  "#BAFFC9", "#BAE1FF", "#FFD1DC", "#C5E1A5"
];
 
function debugLog(msg) {
  try { console.log(msg); } catch (e) {}
  const box = $("wsd-debug");
  if (!box) return;
  const line = document.createElement("div");
  line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}

function shuffle(a) {
  const copy = a.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function resetGame() {
  localStorage.removeItem("whoSaidDiz");
  location.reload();
}

let confirmAction = null;

function confirmThenReset(message, action) {
  confirmAction = action || "restart";
  const body = $("modal-confirm-reset-body");
  if (body) {
    body.textContent =
      message ||
      "This will end the current game and all progress will be lost.";
  }
  const modalEl = $("modal-confirm-reset");
  if (modalEl && typeof bootstrap !== "undefined") {
    new bootstrap.Modal(modalEl).show();
  }
}

// Wraps actions that require a gameState
function requireState(fn) {
  return () => {
    if (!gameState) {
      showScreen("setup-game");
      return;
    }
    fn();
  };
}

// ---------- Constants & configuration ----------

const MIN_POINTS = 1;
const START_POINTS = 10;

const FINAL_BONUS_POINTS = {
  topLandCollector: 3,
  topAttractionCollector: 3,
  bestGuesser: 2,
  mostRiskyPlayer: 2
};

const SCREEN_META = {
  "setup-game": {
    icon: "🎮",
    title: "Get started!",
    instruction:
      "Pick the park you're in, add 3+ players, and start the game."
  },
  "setup-question": {
    icon: "🎢",
    title: "Choose attraction",
    instruction:
      "Pick the attraction you are queued for, read the selected question aloud."
  },
  "enter-answers": {
    icon: "✏️",
    title: "Enter answers",
    instruction:
      "Pass the phone around & let player secretly submit their answers."
  },
  "select-answer": {
    icon: "🎲",
    title: "Selected answer",
    instruction: "A random answer has been chosen."
  },
  "guess-wager": {
    icon: "💰",
    title: "Guess & wager",
    instruction:
      "All - guess who said diz & wager points. Add house points to increase stakes."
  },
  "reveal": {
    icon: "🔍",
    title: "Reveal",
    instruction: "Find out who said diz!"
  },
  "scores": {
    icon: "📊",
    title: "Scores",
    instruction:
      "Check standings, end game bonus progress, and start the next round when ready."
  },
  "game-end": {
    icon: "🏆",
    title: "Game over",
    instruction: "Points + end game bonuses tallied!"
  },
  "history": {
    icon: "📋",
    title: "Round history",
    instruction: "See a full history of every round played."
  },
  "faq": {
    icon: "❓",
    title: "FAQ",
    instruction: "Find quick answers about the game, privacy, and support."
  }
};

const PARK_THEMES = {
  "Magic Kingdom": {
    hero: "linear-gradient(180deg,#4A1060,#9B3A8A)",
    nav: "#f7eefff2",
    avatar: "linear-gradient(135deg,#9B3A8A,#D4A0C8)",
    btn: "linear-gradient(180deg,#4A1060,#9B3A8A)"
  },
  "EPCOT": {
    hero: "linear-gradient(180deg,#0A2E52,#1A6E8A)",
    nav: "#dbf3f9f2",
    avatar: "linear-gradient(135deg,#1A6E8A,#7ABDD4)",
    btn: "linear-gradient(180deg,#0A2E52,#1A6E8A)"
  },
  "Hollywood Studios": {
    hero: "linear-gradient(180deg,#1C1C1C,#8B6914)",
    nav: "#f9f3e8f2",
    avatar: "linear-gradient(135deg,#C4960A,#E8C84A)",
    btn: "linear-gradient(180deg,#1C1C1C,#8B6914)"
  },
  "Animal Kingdom": {
    hero: "linear-gradient(180deg,#1A3A1A,#4A7A2A)",
    nav: "#e4ebd5f2",
    avatar: "linear-gradient(135deg,#4A7A2A,#C8A83A)",
    btn: "linear-gradient(180deg,#1A3A1A,#4A7A2A)"
  },
  Dollywood: {
    hero: "linear-gradient(180deg,#7A3A10,#C47820)",
    nav: "#ffe2cff2",
    avatar: "linear-gradient(135deg,#C47820,#E8B84A)",
    btn: "linear-gradient(180deg,#7A3A10,#C47820)"
  }
};

// ---------- Global game state ----------

const NAV_MAP = {
  "setup-game": "wsd-nav-home",
  "setup-question": "wsd-nav-round",
  "enter-answers": "wsd-nav-round",
  "select-answer": "wsd-nav-round",
  "guess-wager": "wsd-nav-round",
  reveal: "wsd-nav-round",
  scores: "wsd-nav-scores",
  "game-end": "wsd-nav-scores",
  history: "wsd-nav-history"
};

const ROUND_SCREENS = [
  "setup-question",
  "enter-answers",
  "select-answer",
  "guess-wager",
  "reveal"
];

const PARKS = {};
if (typeof PARK_MAGIC_KINGDOM !== "undefined")
  PARKS[PARK_MAGIC_KINGDOM.name] = PARK_MAGIC_KINGDOM;
if (typeof PARK_EPCOT !== "undefined")
  PARKS[PARK_EPCOT.name] = PARK_EPCOT;
if (typeof PARK_HOLLYWOOD_STUDIOS !== "undefined")
  PARKS[PARK_HOLLYWOOD_STUDIOS.name] = PARK_HOLLYWOOD_STUDIOS;
if (typeof PARK_ANIMAL_KINGDOM !== "undefined")
  PARKS[PARK_ANIMAL_KINGDOM.name] = PARK_ANIMAL_KINGDOM;
if (typeof PARK_DOLLYWOOD !== "undefined")
  PARKS[PARK_DOLLYWOOD.name] = PARK_DOLLYWOOD;

let gameState = null;
let answerSaveLocked = false;

// ---------- Persistence & shape helpers ----------

function saveState() {
  if (!gameState) return;
  try {
    localStorage.setItem("whoSaidDiz", JSON.stringify(gameState));
  } catch (e) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem("whoSaidDiz");
    if (raw) gameState = JSON.parse(raw);
  } catch (e) {
    gameState = null;
  }
}

function ensurePlayerStats(p) {
  p.stats ??= { correctGuesses: 0, totalRisked: 0, uniqueLands: [] };
  if (!Array.isArray(p.stats.uniqueLands)) p.stats.uniqueLands = [];
}

// Ensures older saves still work with new fields
function ensureStateShape() {
  if (!gameState) return;

  gameState.settings ??= {};
  gameState.settings.startingPoints ||= START_POINTS;
  gameState.settings.minPoints ||= MIN_POINTS;
  gameState.players ||= [];
  gameState.history ||= [];
  gameState.ghostPool ||= [];
  gameState.questionUsage ||= {};

  gameState.players.forEach(p => {
    if (!Array.isArray(p.collected)) p.collected = [];
    if (typeof p.wins !== "number") p.wins = 0;
    if (typeof p.bonusTotal !== "number") p.bonusTotal = 0;
    ensurePlayerStats(p);
  });

  if (!gameState.currentRound) return;
  const r = gameState.currentRound;

  // Round arrays we still care about, without house bonus
  ["correctGuessers", "payouts", "collectionsThisRound"].forEach(k => {
    r[k] ||= [];
  });
if (typeof r.hunnyHotBonus !== "number") r.hunnyHotBonus = 0;
}

// Convenience lookup
const getAttractionByName = name =>
  gameState.attractions.find(a => a.name === name);

// Count unique lands collected by a player
function getPlayerUniqueLandCount(player) {
  const s = new Set();
  player.collected.forEach(name => {
    const a = getAttractionByName(name);
    if (a?.land) s.add(a.land);
  });
  return s.size;
}

// ---------- Theme application ----------

function applyParkTheme(parkName) {
  const t = parkName ? PARK_THEMES[parkName] : null;

  [
    [".wsd-hero", "backgroundImage", t?.hero || ""],
    [".wsd-bottom-nav", "backgroundColor", t?.nav || "rgba(255,255,255,0.9)"],
    [".wsd-avatar", "backgroundImage", t?.avatar || ""],
    ["#modal-no-correct .modal-header", "backgroundImage", t?.hero || ""],
    ["#modal-no-correct .modal-header", "color", t ? "#fff" : ""],
    ["#modal-confirm-reset .modal-header", "backgroundImage", t?.hero || ""],
    ["#modal-confirm-reset .modal-header", "color", t ? "#fff" : ""],
    ['#modal-first-visit .modal-header', 'backgroundImage', t?.hero],
    ['#modal-first-visit .modal-header', 'color',           t ? '#fff' : ''],
    ["#modal-resume-game .modal-header", "backgroundImage", t?.hero],
    ["#modal-resume-game .modal-header", "color", t ? "#fff" : ""],
    ["#modal-scoring .modal-header", "backgroundImage", t?.hero || ""],
    ["#modal-scoring .modal-header", "color", t ? "#fff" : ""],
    ["#modal-hunny-hot .modal-header", "backgroundImage", t?.hero],
    ["#modal-hunny-hot .modal-header", "color", t ? "#fff" : ""],
    ["#modal-bonuses .modal-header", "backgroundImage", t?.hero || ""],
    ["#modal-bonuses .modal-header", "color", t ? "#fff" : ""],
    ["#modal-wager-help .modal-header", "backgroundImage", t?.hero || ""],
    ["#modal-wager-help .modal-header", "color", t ? "#fff" : ""],
    ["#modal-welcome .modal-header", "backgroundImage", t?.hero || ""],
    ["#modal-welcome .modal-header", "color", t ? "#fff" : ""]
  ].forEach(([sel, prop, val]) => {
    const el = document.querySelector(sel);
    if (el) el.style[prop] = val;
  });

  if (t?.btn) {
    document.documentElement.style.setProperty(
      "--wsd-btn-primary-bg",
      t.btn
    );
  } else {
    document.documentElement.style.removeProperty("--wsd-btn-primary-bg");
  }
}
// ---------- Hero spotlight helpers ----------

// Spotlight per screen (after welcome)
function showHeroSpotlightForScreen(screenName) {
  if (!screenName) return;

  const storageKey = `wsd_hero_spotlight_${screenName}`;

  try {
    if (localStorage.getItem(storageKey) === "1") {
      return;
    }
  } catch (e) {}

  const heroCard = document.querySelector(".wsd-hero-card");
  const overlay = $("wsd-spotlight-overlay");
  if (!heroCard || !overlay) {
    return;
  }
  heroCard.classList.add("wsd-hero-card-spotlight");
  overlay.style.display = "block";
  heroCard.scrollIntoView({ behavior: "smooth", block: "center" });

  const backdrop = overlay.querySelector(".wsd-spotlight-backdrop");

  function clearSpotlight() {
    heroCard.classList.remove("wsd-hero-card-spotlight");
    overlay.style.display = "none";
    try {
      localStorage.setItem(storageKey, "1");
    } catch (e) {}

    if (backdrop) backdrop.removeEventListener("click", clearSpotlight);
    document.removeEventListener("click", onDocClick, true);
  }

  function onDocClick() {
    clearSpotlight();
  }

  if (backdrop) backdrop.addEventListener("click", clearSpotlight);
  document.addEventListener("click", onDocClick, true);
}

function initHeroSpotlightAfterWelcome() {
  const modalEl = $("modal-welcome");
  if (!modalEl || typeof bootstrap === "undefined") {
    return;
  }

  modalEl.addEventListener(
    "hidden.bs.modal",
    () => {
      showHeroSpotlightForScreen("setup-game");
    },
    { once: true }
  );
}

// Called once from splash after first-time onboarding completes
window.initHeroSpotlightFirstVisit = function () {
  var screenName = (window.gameState && window.gameState.screen) || "setup-game";
  showHeroSpotlightForScreen(screenName);
};

// ---------- Screen switching ----------

const ALL_SCREENS = Object.keys(SCREEN_META);

function showScreen(name) {
  // Toggle active screen
  ALL_SCREENS.forEach(key => {
    const el = document.getElementById(`screen-${key}`);
    if (el) {
      el.classList.toggle("wsd-screen-active", key === name);
    }
  });

  // Persist current screen in gameState
  if (gameState) {
    gameState.screen = name;
    saveState();
  }

  // Update step icon, title, and instruction
  const m = SCREEN_META[name] || SCREEN_META["setup-game"];
  ["wsd-step-icon", "wsd-step-title", "wsd-step-instruction"].forEach(id => {
    const el = $(id);
    if (!el) return;
    if (id === "wsd-step-icon") el.textContent = m.icon;
    if (id === "wsd-step-title") el.textContent = m.title;
    if (id === "wsd-step-instruction") el.textContent = m.instruction;
  });

  // Hero spotlight per screen (no firstSetupGameShown flag anymore)
  showHeroSpotlightForScreen(name);
}
// ---------- Setup screen + locks ----------

function updatePlayerInputLock() {
  const parkSel = $("wsd-park-select");
  const selected = !!(parkSel && parkSel.value);
  const hasStarted = !!gameState;

  const hint = $("wsd-park-hint");
  if (hint) hint.style.display = selected ? "none" : "block";

  if (parkSel) {
    parkSel.disabled = hasStarted;
  }

  document.querySelectorAll("#wsd-player-inputs input").forEach((inp) => {
    if (!selected) {
      inp.disabled = true;
      inp.placeholder = "Select a park first";
      return;
    }

    inp.disabled = hasStarted && !!inp.value.trim();
    inp.placeholder = "Player name";
  });

  const addBtn = $("wsd-add-player");
  if (addBtn) addBtn.disabled = !selected;

  const startBtn = $("wsd-start-game");
  const resetBtn = $("wsd-reset-setup");
  if (startBtn) startBtn.disabled = !selected;
  if (resetBtn) resetBtn.disabled = !selected;
}
function updateQuestionLock() {
  const attrSel = $("wsd-attraction-select");
  const hasAttraction = !!(attrSel && attrSel.value);
  const hint = $("wsd-attraction-hint");
  if (hint) hint.style.display = hasAttraction ? "none" : "block";

  ["wsd-generate-question", "wsd-enter-custom-question", "wsd-to-answers"]
    .forEach(id => {
      const btn = $(id);
      if (btn) btn.disabled = !hasAttraction;
    });
}

// Question display helpers
function flashQuestionDisplay() {
  const display = $("wsd-question-display");
  if (!display) return;
  display.classList.remove("wsd-question-pop");
  void display.offsetWidth;
  display.classList.add("wsd-question-pop");
}

function setQuestionDisplay(text) {
  const display = $("wsd-question-display");
  const textarea = $("wsd-question-text");

  if (display) {
    const isPrompt =
      !text ||
      text.trim() === "Select the attraction you're in line for above. 👆";

    display.style.display = text ? "block" : "none";
    display.textContent = text || "";

    // Persistent border state: accent only for real questions
    display.classList.toggle("wsd-question-live", !isPrompt);
  }

  if (textarea) {
    textarea.value = text || "";
    textarea.style.display = "none";
  }
}

function showCustomTextarea() {
  const display = $("wsd-question-display");
  const textarea = $("wsd-question-text");
  if (display) display.style.display = "none";
  if (textarea) {
    textarea.style.display = "block";
    textarea.value = "";
    textarea.readOnly = false;
    textarea.focus();
  }
}

// Populate parks, player inputs, and lock state
function initSetupScreen() {
  debugLog("initSetupScreen starting");
  const sel = $("wsd-park-select");
  const container = $("wsd-player-inputs");
  debugLog(`wsd-park-select exists? ${!!sel}`);
  debugLog(`wsd-player-inputs exists? ${!!container}`);
  if (!sel || !container) return;

  sel.innerHTML = '<option value="">Select a park</option>';
  Object.keys(PARKS).forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    sel.appendChild(opt);
  });

  if (!container.querySelectorAll("input").length) {
    for (let i = 0; i < 3; i++) addPlayerInput(container);
  }

  updatePlayerInputLock();
  debugLog("Setup screen ready");
}

// Add one player input row
function addPlayerInput(container, name = "") {
  const wrap = document.createElement("div");
  wrap.className = "d-flex align-items-center mb-1";

  const inp = document.createElement("input");
  inp.type = "text";
  inp.className = "form-control wsd-form-control wsd-player-input";
  inp.placeholder = "Player name";
  inp.value = name;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "×";
  btn.className = "btn btn-sm btn-outline-secondary";
  btn.style.marginLeft = "0.5rem";

  btn.addEventListener("click", () => {
    const allInputs = $$("#wsd-player-inputs input");
    if (allInputs.length <= 3) {
      const errEl = $("wsd-setup-error");
      if (errEl) errEl.textContent = "You need at least three players.";
      return;
    }
    wrap.remove();
  });

  wrap.append(inp, btn);
  container.appendChild(wrap);
}

// Validate setup and either create or update gameState
function startGameFromSetup() {
  const errEl = $("wsd-setup-error");
  const parkSel = $("wsd-park-select");
  const parkName = parkSel ? parkSel.value : "";

  if (errEl) errEl.textContent = "";

  if (!parkName || !PARKS[parkName]) {
    if (errEl) errEl.textContent = "Please select a park.";
    return;
  }

  const names = $$("#wsd-player-inputs input")
    .map(i => i.value.trim())
    .filter(Boolean);

  if (names.length < 3) {
    if (errEl) errEl.textContent =
      "Please enter at least three player names.";
    return;
  }

  const uniqueNames = new Set(names.map(n => n.toLowerCase()));
  if (uniqueNames.size !== names.length) {
    if (errEl) errEl.textContent =
      "Each player must have a unique name.";
    return;
  }

  const parkData = PARKS[parkName];

  // First-time game creation
  if (!gameState) {
    const players = names.map((name, id) => ({
      id,
      name,
      score: START_POINTS,
      wins: 0,
      collected: [],
      bonusTotal: 0,
      stats: {
        correctGuesses: 0,
        totalRisked: 0,
        uniqueLands: []
      },
      badgeColor: null
    }));

    const palette = shuffle(PLAYER_BADGE_COLORS.slice());
    players.forEach(p => {
      p.badgeColor = palette.shift() || "#999999";
    });

    gameState = {
      screen: "setup-question",
      roundNumber: 0,
      settings: {
        park: parkName,
        startingPoints: START_POINTS,
        minPoints: MIN_POINTS
      },
      players,
      lands: [
        ...new Set(
          parkData.attractions.map(a => a.land).filter(Boolean)
        )
      ],
      attractions: parkData.attractions,
      questionUsage: {}, // track questions per attraction/category
      ghostPool: [],
      currentRound: null,
      history: [],
      finalBonusesApplied: false
    };
  } else {
    // Existing game: update park + players
    const parkAttrs = parkData.attractions;
    Object.assign(gameState.settings, { park: parkName });
    Object.assign(gameState, {
      attractions: parkAttrs,
      lands: [
        ...new Set(
          parkAttrs.map(a => a.land).filter(Boolean)
        )
      ]
    });
    gameState.questionUsage ||= {};

    const existingPlayers = gameState.players || [];
    gameState.players = names.map((name, index) => {
      const old = existingPlayers.find(
        p => p.name.toLowerCase() === name.toLowerCase()
      );
      if (old) {
        old.name = name;
        return old;
      }
      const newId = existingPlayers.length
        ? Math.max(...existingPlayers.map(p => p.id)) + 1
        : index;
      return {
        id: newId,
        name,
        score:
          gameState.settings?.startingPoints ?? START_POINTS,
        wins: 0,
        collected: [],
        bonusTotal: 0,
        stats: {
          correctGuesses: 0,
          totalRisked: 0,
          uniqueLands: []
        },
        badgeColor:
          PLAYER_BADGE_COLORS[
            index % PLAYER_BADGE_COLORS.length
          ] || "#999999"
      };
    });
  }

  const parkLabel = $("wsd-park-label");
  if (parkLabel) parkLabel.textContent = parkName;

  applyParkTheme(parkName);

  const summary = $("wsd-player-summary");
  if (summary && gameState?.players) {
    summary.textContent = `${gameState.players.length} players`;
  }

  const startBtn = $("wsd-start-game");
  if (startBtn) {
    startBtn.textContent = gameState ? "Resume game" : "Start game";
  }

  renderAttractionOptions();
  saveState();
  updatePlayerInputLock();
  showScreen("setup-question");
  startNewRoundCore();
}

// ---------- Question setup ----------

// Pick a question from GAME_QUESTIONS for this attraction
function drawQuestionForAttraction(attraction) {
  const isShow = attraction?.type === "show";

  const allCategories = GAME_QUESTIONS.categories;

  let categories;
  if (isShow) {
    // Shows can use showtime + park-wide
    categories = allCategories.filter(
      cat => cat.id === 20 || cat.id === 21
    );
  } else {
    // Non-shows: everything except the show-only bucket
    categories = allCategories.filter(cat => cat.id !== 20);
  }

  if (!categories.length) {
    categories = allCategories;
  }

  // Pick a random category from the eligible list
  const category =
    categories[Math.floor(Math.random() * categories.length)];

  // Make sure we have usage tracking
  gameState.questionUsage ||= {};
  const usageMap = gameState.questionUsage;
  const questionList = category.questions;

  // Find the least-used questions in this category
  let minUsage = Infinity;
  const candidates = [];

  questionList.forEach(template => {
    const key = `${category.id}:${template}`;
    const count = usageMap[key] || 0;

    if (count < minUsage) {
      minUsage = count;
      candidates.length = 0; // reset candidate list
      candidates.push(template);
    } else if (count === minUsage) {
      candidates.push(template);
    }
  });

  // Pick randomly among the least-used questions
  const template =
    candidates[Math.floor(Math.random() * candidates.length)];

  // Increment usage for the chosen question
  const key = `${category.id}:${template}`;
  usageMap[key] = (usageMap[key] || 0) + 1;
  saveState();

  // Resolve placeholders like {{attraction}}, {{land}}, {{park}}
  const attractionName = attraction?.name || "this attraction";
  const landName = attraction?.land || "this land";
  const parkNameFromState = gameState?.settings?.park || "this park";

  const text = template
    .replace(/{{attraction}}/g, attractionName)
    .replace(/{{land}}/g, landName)
    .replace(/{{park}}/g, parkNameFromState);

  return {
    text,
    categoryId: category.id,
    categoryName: category.name
  };
}

function renderAttractionOptions() {
  const sel = $("wsd-attraction-select");
  if (!sel || !gameState) return;
  sel.innerHTML = "";

  // only add placeholder if no attraction chosen yet
  const hasAttraction = !!gameState.currentRound?.attraction;
  if (!hasAttraction) {
    sel.innerHTML = `<option value="">Select an attraction</option>`;
  }

  gameState.attractions.forEach((a, i) => {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = a.name;
    sel.appendChild(opt);
  });
}


// Initialize a fresh round state
function startNewRoundCore() {
  if (!gameState) return;

  gameState.roundNumber += 1;
 gameState.currentRound = {
  attraction: null,
  question: "",
  questionType: "",
  answers: [],
  selectedAnswer: null,
  answerIndex: 0,
  wagers: [],
  pot: 0,
  hunnyHotBonus: 0,
  correctGuessers: [],
  payouts: [],
  scoreBefore: {},
  scoreAfter: {},
  collectionsThisRound: [],
  wrongGuessCount: 0,
  authorBonus: 0,
  answerOrder: shuffle(gameState.players.map(p => p.id)),
  usedGhost: false
};

  saveState();

  [
    ["wsd-house-bonus", el => { el.value = "0"; }],
    ["wsd-attraction-select", el => { el.value = ""; }],
    ["wsd-attraction-meta", el => { el.textContent = ""; }],
    ["wsd-setupq-error", el => { el.textContent = ""; }]
  ].forEach(([id, fn]) => {
    const el = $(id);
    if (el) fn(el);
  });

  renderAttractionOptions();

  const display = $("wsd-question-display");
  if (display) {
    display.classList.remove("wsd-question-pop");
  }

  setQuestionDisplay(
    "Select the attraction you're in line for above. 👆"
  );
  const badge = $("wsd-question-type-badge");
  if (badge) badge.textContent = "Pending";

  updateQuestionLock();
}

// Handle attraction selection
function onAttractionChange() {
  if (!gameState) return;

  const attrSel = $("wsd-attraction-select");
  const idx = attrSel ? parseInt(attrSel.value, 10) : NaN;
  const meta = $("wsd-attraction-meta");
  const badge = $("wsd-question-type-badge");

  if (meta) meta.textContent = "";
  if (badge) badge.textContent = "";

  if (isNaN(idx) || !gameState.attractions[idx]) {
    Object.assign(gameState.currentRound, {
      attraction: null,
      question: "",
      questionType: ""
    });
    setQuestionDisplay("");
    updateQuestionLock();
    return;
  }

  // Once a real attraction is selected, remove the placeholder
  if (attrSel) {
    const firstOption = attrSel.querySelector('option[value=""]');
    if (firstOption) firstOption.remove();
  }

  const attraction = gameState.attractions[idx];
  gameState.currentRound.attraction = attraction;

  if (meta) {
    meta.textContent = `${attraction.park} • ${attraction.land}`;
  }

  const { q, type, categoryName } = drawQuestion(attraction);
  Object.assign(gameState.currentRound, {
    question: q,
    questionType: type
  });

  setQuestionDisplay(q);
  flashQuestionDisplay();

  if (badge) {
    badge.textContent = categoryName || labelForType(type);
  }

  saveState();
  updateQuestionLock();
}


// Wraps drawQuestionForAttraction for current round
function drawQuestion(attraction) {
  const { text, categoryId, categoryName } =
    drawQuestionForAttraction(attraction);
  return { q: text, type: "category", categoryId, categoryName };
}

const labelForType = t =>
  t === "category"
    ? "Question"
    : t === "custom"
    ? "Custom question"
    : "Question";

// Regenerate a new random question for the chosen attraction
function onGenerateNewQuestion() {
  const err = $("wsd-setupq-error");
  if (!gameState || !gameState.currentRound.attraction) {
    if (err) err.textContent = "Select an attraction first.";
    return;
  }
  if (err) err.textContent = "";

  const { q, type, categoryName } = drawQuestion(
    gameState.currentRound.attraction
  );
  Object.assign(gameState.currentRound, {
    question: q,
    questionType: type
  });

  setQuestionDisplay(q);

  const badge = $("wsd-question-type-badge");
  if (badge) badge.textContent = categoryName || labelForType(type);

  saveState();
}

// Switch to custom question mode
function onEnterCustomQuestion() {
  showCustomTextarea();
  const badge = $("wsd-question-type-badge");
  if (badge) badge.textContent = "Custom question";
  gameState.currentRound.questionType = "custom";
  saveState();
}

// Move from question screen to answer entry screen
function proceedToAnswers() {
  const err = $("wsd-setupq-error");
  if (err) err.textContent = "";

  if (!gameState) return;
  if (!gameState.currentRound?.attraction) {
    if (err) err.textContent = "Select an attraction first.";
    return;
  }

  const textarea = $("wsd-question-text");
  const display = $("wsd-question-display");
  const isCustom = textarea && textarea.style.display !== "none";

  const q = isCustom
    ? (textarea ? textarea.value.trim() : "")
    : (display ? display.textContent.trim() : "");

  if (!q) {
    if (err) err.textContent = "Please enter a question.";
    return;
  }

  Object.assign(gameState.currentRound, {
    question: q,
    answers: [],
    answerIndex: 0
  });

  // Roll Hunny Pot Hot Round bonus for this round
  const playerCount = gameState.players.length;
  const minBonus = playerCount;          // minimal # of players
  const maxBonus = playerCount * 2;      // up to double that

  // Only allow hot rounds from round 2 onward
  const roundNumber = gameState.roundNumber || 1;
  const canBeHot =
    playerCount > 0 && roundNumber > 1;

  // Decrease frequency: e.g. ~20% of eligible rounds
  const isHotRound =
    canBeHot && Math.random() < 0.15;

  let hunnyHotBonus = 0;

  if (isHotRound) {
    hunnyHotBonus =
      Math.floor(
        Math.random() * (maxBonus - minBonus + 1)
      ) + minBonus;
  }

  gameState.currentRound.hunnyHotBonus = hunnyHotBonus;

  // Show modal if this is a hot round
  if (hunnyHotBonus > 0) {
    const modalEl = $("modal-hunny-hot");
    const bodyEl = $("modal-hunny-hot-body");
    const titleEl = $("modal-hunny-hot-title");

    if (bodyEl) {
      bodyEl.textContent =
        `🔥 It's a Hunny Pot Hot Round! ` +
        `${hunnyHotBonus} extra points will be added to the Hunny pot this round.`;
    }
    if (titleEl) {
      titleEl.textContent = "Hunny Pot Hot Round!";
    }

    try {
      if (modalEl && typeof bootstrap !== "undefined") {
        new bootstrap.Modal(modalEl).show();
      }
    } catch (e) {
      console.error("Hunny Hot modal error", e);
    }
  }

  const enterQ = $("wsd-enter-question");
  if (enterQ) enterQ.textContent = q;

  const ansInp = $("wsd-answer-input");
  if (ansInp) ansInp.value = "";

  renderAnswerProgress();
  showScreen("enter-answers");
}
// ---------- Answers flow ----------

// Update the “Player X of Y” indicator and current player label
function renderAnswerProgress() {
  const r = gameState.currentRound;
  const idx = r.answerIndex || 0;
  const order =
    r.answerOrder || gameState.players.map(p => p.id);
  const playerId = order[idx];
  const player = gameState.players.find(
    p => p.id === playerId
  );

  const prog = $("wsd-answer-progress");
  const label = $("wsd-current-player-label");

  if (prog) prog.textContent =
    `Player ${idx + 1} of ${order.length}`;
  if (label) label.textContent = player ? player.name : "";
}

// Save the current player’s answer, or “skip” if requested
function saveAnswerForCurrentPlayer(skip) {
  if (answerSaveLocked) return;
  const r = gameState.currentRound;
  const idx = r.answerIndex || 0;
  const order =
    r.answerOrder || gameState.players.map(p => p.id);
  const playerId = order[idx];
  const player = gameState.players.find(
    p => p.id === playerId
  );

  const ansInp = $("wsd-answer-input");
  const err = $("wsd-answers-error");
  const text = ansInp ? ansInp.value.trim() : "";

  if (err) err.textContent = "";

  if (!skip && !text) {
    if (err) err.textContent =
      "Please enter an answer or skip.";
    return;
  }

if (!skip) r.answers.push({ playerId: player.id, text });

if (ansInp) {
  const saveBtn = $("wsd-save-answer");
  const skipBtn = $("wsd-skip-player");

  answerSaveLocked = true;
  if (saveBtn) saveBtn.disabled = true;
  if (skipBtn) skipBtn.disabled = true;

  ansInp.value = "";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (saveBtn) saveBtn.disabled = false;
      if (skipBtn) skipBtn.disabled = false;
      answerSaveLocked = false;
    });
  });
}

r.answerIndex = idx + 1;

  if (r.answerIndex >= order.length) {
  if (!r.answers.length) {
    if (err) err.textContent = "No answers were entered. Abandon or go back.";
    return;
  }

  const normalized = r.answers
    .map(a => (a.text || "").trim().toLowerCase())
    .filter(Boolean);

  const hasDuplicateAnswers = normalized.length !== new Set(normalized).size;

  saveState();

  showPickOverlay(() => {
    const labelEl = document.querySelector('#screen-select-answer .wsd-form-label');
    const qEl = $("wsd-select-question");
    const ansEl = $("wsd-selected-answer");
    const toWagers = $("wsd-to-wagers");
    const selectAgain = $("wsd-select-again");

    if (qEl) qEl.textContent = r.question || "";

    if (hasDuplicateAnswers) {
      if (labelEl) labelEl.textContent = "Round issue";
      if (ansEl) {
        ansEl.classList.remove("wsd-anim-pop", "wsd-answer-highlight");
        void ansEl.offsetWidth;
        ansEl.textContent = "Oops — two players gave the same answer. Scrap this round and try again!";
        ansEl.classList.add("wsd-anim-pop");
      }
      if (toWagers) toWagers.style.display = "none";
      if (selectAgain) selectAgain.style.display = "none";
      showScreen("select-answer");
      return;
    }

    pickRandomAnswer();
    renderSelectAnswerScreen();

    if (labelEl) labelEl.textContent = "A player said";
    if (toWagers) toWagers.style.display = "";
    if (selectAgain) selectAgain.style.display = "";

    showScreen("select-answer");
  });
} else {
  renderAnswerProgress();
  
  const nextInput = $("wsd-answer-input");
    if (nextInput) {
      nextInput.classList.add("wsd-anim-answer-refresh");
      void nextInput.offsetWidth; // force reflow so animation starts
      setTimeout(() => {
        nextInput.classList.remove("wsd-anim-answer-refresh");
      }, 200);
    }

  saveState();
}
}

// ---------- Random answer selection (with ghost pool) ----------

// Pick a random answer from current answers, maybe adding a ghost
function pickRandomAnswer() {
  const r = gameState.currentRound;
  const base = r.answers || [];
  const hasGhostPool =
    gameState.ghostPool && gameState.ghostPool.length > 0;
  let pool = base;

  let ghostIndexInPool = -1;
  let ghostSourceIndex = -1;

  if (hasGhostPool) {
    const ghostSource =
      gameState.ghostPool[
        Math.floor(Math.random() * gameState.ghostPool.length)
      ];
    ghostSourceIndex = gameState.ghostPool.indexOf(ghostSource);

    const ghostAnswer = {
      text: ghostSource.text,
      isGhost: true,
      fromRound: ghostSource.fromRound,
      fromPlayerId: ghostSource.fromPlayerId
    };

    pool = [...base, ghostAnswer];
    ghostIndexInPool = pool.length - 1;
  }

  const chosenIndex = Math.floor(Math.random() * pool.length);
  const chosen = pool[chosenIndex];
  r.selectedAnswer = chosen;

  // If we used a ghost answer, remove it from the ghost pool
  if (
    hasGhostPool &&
    ghostIndexInPool !== -1 &&
    chosenIndex === ghostIndexInPool &&
    ghostSourceIndex !== -1
  ) {
    gameState.ghostPool.splice(ghostSourceIndex, 1);
  }
}

// Animate “picking” overlay, then call onDone
function showPickOverlay(onDone) {
  const overlay = $("wsd-pick-overlay");
  if (!overlay) {
    onDone();
    return;
  }

  const labelEl = $("wsd-pick-label");
  if (labelEl) labelEl.textContent = "Selecting an answer...";

  overlay.style.display = "flex";
  overlay.style.opacity = "1";

  setTimeout(() => {
    overlay.style.transition = "opacity 0.35s ease";
    overlay.style.opacity = "0";
    setTimeout(() => {
      overlay.style.display = "none";
      overlay.style.opacity = "1";
      overlay.style.transition = "";
      onDone();
    }, 350);
  }, 1400);
}

// Show selected answer on the “Select answer” screen
function renderSelectAnswerScreen() {
  const r = gameState.currentRound;
  const qEl = $("wsd-select-question");
  const ansEl = $("wsd-selected-answer");
  if (qEl) qEl.textContent = r.question;
  if (!ansEl) return;

  ansEl.classList.remove("wsd-anim-pop");
  void ansEl.offsetWidth;
  ansEl.textContent = `"${r.selectedAnswer.text}"`;
  ansEl.classList.add("wsd-anim-pop", "wsd-answer-highlight");
}

// ---------- Guess + wager screen ----------

// Build the guess/wager rows and jump to guess-wager screen
function goToGuessWager() {
  const errEl = $("wsd-gw-error");
  if (errEl) errEl.textContent = "";

  const r = gameState.currentRound;
  const qEl = $("wsd-gw-question");
  const ansEl = $("wsd-gw-answer");

  if (qEl) qEl.textContent = r.question;
  if (ansEl) ansEl.textContent = r.selectedAnswer.text;

  const container = $("wsd-gw-players");
  if (!container) return;

  // Hard reset: remove ALL rows
  container.innerHTML = "";

  // Build rows in a fresh container each time
  const playersShuffled = shuffle(gameState.players);

  playersShuffled.forEach(p => {
    const row = document.createElement("div");
    row.className = "mb-3 pb-2 border-bottom";

    const playerLabel = document.createElement("div");
    playerLabel.className = "wsd-score-row mb-1";
    const dotColor = p.badgeColor || "#888888";
    playerLabel.innerHTML =
      `<div>` +
      `<div class="wsd-score-name">` +
      `<span class="wsd-player-dot" style="display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;background-color:${dotColor}"></span>` +
      `<span>${p.name}'s guess</span>` +
      `</div>` +
      `<div class="wsd-score-meta">Available points: ${p.score}</div>` +
      `</div>`;
    row.appendChild(playerLabel);

    const inner = document.createElement("div");
    inner.className = "d-flex gap-1";

    const guessSel = document.createElement("select");
    guessSel.className = "form-select wsd-form-select";
    guessSel.dataset.playerId = p.id;

    // Player options only
    gameState.players.forEach(p2 => {
      const opt = document.createElement("option");
      opt.value = String(p2.id);
      opt.textContent = p2.name;
      guessSel.appendChild(opt);
    });

    // Only add Ghost from round 2 onward
    if (gameState.roundNumber > 1) {
      const ghostOpt = document.createElement("option");
      ghostOpt.value = "ghost";
      ghostOpt.textContent = "Ghost";
      guessSel.appendChild(ghostOpt);
    }

    const wagerInput = document.createElement("input");
    Object.assign(wagerInput, {
      type: "number",
      min: 1,
      max: p.score,
      value: Math.min(1, p.score),
      inputMode: "numeric",
      pattern: "[0-9]*"
    });
    wagerInput.className = "form-control wsd-form-control";
    wagerInput.style.maxWidth = "90px";
    wagerInput.dataset.playerId = p.id;

    wagerInput.addEventListener("blur", () => {
      let val = parseInt(wagerInput.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      if (val > p.score) val = p.score;
      wagerInput.value = val;
    });

    inner.append(guessSel, wagerInput);
    row.appendChild(inner);
    container.appendChild(row);
  });

  showScreen("guess-wager");
}

// Reset wagers UI back to starting defaults
function clearWagersUI() {
  $$("#wsd-gw-players select").forEach(s => {
    s.selectedIndex = 0;
  });
  $$("#wsd-gw-players input[type=number]").forEach(inp => {
    const p = gameState.players.find(
      pl => pl.id === parseInt(inp.dataset.playerId, 10)
    );
    inp.value = Math.min(1, p ? p.score : 1);
  });
  const hb = $("wsd-house-bonus");
  if (hb) hb.value = "0";
}

function lockWagers() {
  const gwErr = $("wsd-gw-error");
  if (gwErr) gwErr.textContent = "";

  const hbErr = $("wsd-house-bonus-error");
  if (hbErr) {
    hbErr.textContent = "";
    hbErr.style.display = "none";
  }

  const hbInput = $("wsd-house-bonus");
  let houseBonus = hbInput ? parseInt(hbInput.value, 10) : 0;
  if (isNaN(houseBonus) || houseBonus < 0) houseBonus = 0;

  if (houseBonus > 10) {
    houseBonus = 10;
    if (hbInput) hbInput.value = 10;
    if (hbErr) {
      hbErr.textContent = "House bonus capped at 10 points.";
      hbErr.style.display = "block";
    }
    return;
  }

  const wagers = [];
  $$("#wsd-gw-players select").forEach(sel => {
    const pid = parseInt(sel.dataset.playerId, 10);
    const wInp = document.querySelector(
      `#wsd-gw-players input[data-player-id="${pid}"]`
    );

    let amount = wInp ? (parseInt(wInp.value, 10) || 1) : 1;
    if (isNaN(amount) || amount < 1) amount = 1;

    const player = gameState.players.find(pl => pl.id === pid);
    if (player) amount = Math.min(amount, player.score);

    wagers.push({
      playerId: pid,
      guessedAuthorId: sel.value,
      amount
    });
  });

  Object.assign(gameState.currentRound, {
    wagers
  });

  computeRevealAndScoring();
  showScreen("reveal");
  runRevealAnimation();
  saveState();
}
//Set house bonus name
function getHouseBonusChooser() {
  if (!gameState || !Array.isArray(gameState.players) || !gameState.players.length) {
    return null;
  }
  const index = (Math.max(1, gameState.roundNumber) - 1) % gameState.players.length;
  return gameState.players[index] || null;
}

// Compute payouts with full-pot model:
// - All wagers go into the pot.
// - Winners (author alone, or correct guessers) split the pot,
//   with the pot rounded up so it splits evenly.
// - For Ghost, only correct Ghost guessers share the pot.
function computeRevealAndScoring() {
  const r = gameState.currentRound;
  const isGhostAnswer = !!r.selectedAnswer.isGhost;
  const authorId = isGhostAnswer ? null : r.selectedAnswer.playerId;

  const payouts = [];
  let pot = 0;

  // First pass: collect wagers, build pot, and set wagerPart = -amount
  // (everyone puts their wager into the pot).
  gameState.players.forEach(p => {
    const we = r.wagers.find(w => w.playerId === p.id);
    let wagerPart = 0;

    if (we) {
      const amount = Math.max(0, parseInt(we.amount, 10) || 0);
      ensurePlayerStats(p);
      p.stats.totalRisked += amount;

      if (amount > 0) {
        wagerPart = -amount;
        pot += amount;
      }
    }

    payouts.push({
      playerId: p.id,
      wagerPart,
      potPart: 0,
      delta: 0
    });
  });

  // Add Hunny Pot Hot Round bonus (if any) ONCE
  const bonus = Math.max(0, r.hunnyHotBonus || 0);
  pot += bonus;

  // Determine winners (correct guessers)
  let winners = [];

  if (isGhostAnswer) {
    winners = r.wagers
      .filter(w => {
        const amount = Math.max(0, parseInt(w.amount, 10) || 0);
        return amount > 0 && w.guessedAuthorId === "ghost";
      })
      .map(w => w.playerId);
  } else {
    winners = r.wagers
      .filter(w => {
        const amount = Math.max(0, parseInt(w.amount, 10) || 0);
        return (
          amount > 0 &&
          parseInt(w.guessedAuthorId, 10) === authorId
        );
      })
      .map(w => w.playerId);
  }

  // Special cases for real-author rounds
  if (!isGhostAnswer && authorId != null) {
    const uniqueWinners = Array.from(new Set(winners));

    // Case A: only the author guessed themselves -> no winners at all.
    if (uniqueWinners.length === 1 && uniqueWinners[0] === authorId) {
      winners = [];
    } else {
      // Case B: author AND others guessed the author -> remove the author;
      // only non-author players can win the pot.
      winners = winners.filter(pid => pid !== authorId);
    }
  }

  r.correctGuessers = winners.slice();

  // No more author bonus / wrongGuessCount
  r.wrongGuessCount = 0;
  r.authorBonus = 0;

  // Helper: round amount up so it splits evenly among n winners
  function resolveAmountForWinners(amount, winnerCount) {
    if (!amount || winnerCount === 0) return 0;
    const remainder = amount % winnerCount;
    if (remainder === 0) return amount;
    return amount + (winnerCount - remainder);
  }

  if (isGhostAnswer) {
    // Ghost round
    if (winners.length === 0) {
      // Nobody guessed Ghost: pot stays as-is, no payouts.
      r.pot = pot;
    } else {
      const n = winners.length;
      const resolvedPot = resolveAmountForWinners(pot, n);
      const potShare = resolvedPot / n;

      winners.forEach(pid => {
        const pt = payouts.find(p => p.playerId === pid);
        if (pt) pt.potPart = potShare;
      });

      r.pot = resolvedPot;
    }
  } else {
    // Real-author round
    const n = winners.length;

    // Detect author guessed themselves and no one else hit
    const authorSelfOnly =
      !isGhostAnswer &&
      authorId != null &&
      n === 0 &&
      r.wagers.some(
        w =>
          w.playerId === authorId &&
          parseInt(w.guessedAuthorId, 10) === authorId
      );

    if (n === 0 && !authorSelfOnly) {
      // Case 1: No winners, and the author did NOT guess themselves.
      // Author gets full pot.
      r.pot = pot;
      if (authorId != null) {
        const authorPayout = payouts.find(pt => pt.playerId === authorId);
        if (authorPayout) authorPayout.potPart = pot;
      }
    } else if (n === 0 && authorSelfOnly) {
      // Case 2: Only the author guessed the author (self-guess).
      // Nobody gets pot this round.
      r.pot = pot;
      // Leave potPart as 0 for everyone.
    } else {
      // Case 3: At least one non-author winner shares the pot.
      const winnerCount = n;
      const resolvedPot = resolveAmountForWinners(pot, winnerCount);
      const potShare = resolvedPot / winnerCount;

      winners.forEach(pid => {
        const pt = payouts.find(p => p.playerId === pid);
        if (pt) pt.potPart = potShare;
      });

      r.pot = resolvedPot;
    }
  }

  // Finalize deltas (no housePart anymore)
  payouts.forEach(pt => {
    pt.delta = pt.wagerPart + pt.potPart;
  });

  r.payouts = payouts;

  applyRoundResults(authorId);
}

// Apply scoring to players, update collections, ghost pool, and history
function applyRoundResults(authorId) {
  const r = gameState.currentRound;
  const scoreBefore = {};
  const scoreAfter = {};

  gameState.players.forEach(p => {
    const payout = r.payouts.find(x => x.playerId === p.id);
    scoreBefore[p.id] = p.score;
    p.score += payout ? payout.delta : 0;
    if (p.score < gameState.settings.minPoints) {
      p.score = gameState.settings.minPoints;
    }
    scoreAfter[p.id] = p.score;
  });

  Object.assign(r, { scoreBefore, scoreAfter });

  r.correctGuessers.forEach(pid => {
    const p = gameState.players.find(pl => pl.id === pid);
    if (!p) return;
    p.wins++;
    ensurePlayerStats(p);
    p.stats.correctGuesses =
      (p.stats.correctGuesses || 0) + 1;
  });

  r.collectionsThisRound = [];

  if (r.attraction) {
    r.correctGuessers.forEach(pid => {
      const p = gameState.players.find(pl => pl.id === pid);
      if (!p) return;

      if (!p.collected.includes(r.attraction.name)) {
        p.collected.push(r.attraction.name);
        r.collectionsThisRound.push(pid);
      }

      ensurePlayerStats(p);

      if (
        r.attraction.land &&
        !p.stats.uniqueLands.includes(r.attraction.land)
      ) {
        p.stats.uniqueLands.push(r.attraction.land);
      }
    });
  }

  // History: no house bonus fields anymore
  gameState.history.push({
    roundNumber: gameState.roundNumber,
    park: gameState.settings.park,
    land: r.attraction?.land || "",
    attraction: r.attraction?.name || "",
    question: r.question,
    questionType: r.questionType,
    selectedAnswerText: r.selectedAnswer.text,
    authorId,
    wagers: r.wagers,
    correctGuessers: r.correctGuessers,
    payouts: r.payouts,
    collectionsThisRound: r.collectionsThisRound,
    manualAdjustments: [],
    scoreBefore,
    scoreAfter,
    authorBonus: r.authorBonus,
    wrongGuessCount: r.wrongGuessCount,
    hunnyHotBonus: r.hunnyHotBonus || 0,
    isGhostAnswer: !!r.selectedAnswer.isGhost
  });

  // Add unused answers from this round into ghost pool
  try {
    gameState.ghostPool ||= [];
    const rAnswers = r.answers || [];
    if (r.selectedAnswer) {
      rAnswers
        .filter(a => a.text && a !== r.selectedAnswer)
        .forEach(a => {
          gameState.ghostPool.push({
            text: a.text,
            fromRound: gameState.roundNumber,
            fromPlayerId: a.playerId
          });
        });
    }
  } catch (e) {}
}

// ---------- Reveal animation & round summary modal ----------
function runRevealAnimation() {
  const r = gameState.currentRound;
  const isGhostAnswer = !!r.selectedAnswer.isGhost;
  const author = isGhostAnswer
    ? null
    : gameState.players.find(
        p => p.id === r.selectedAnswer.playerId
      );

  const countEl = $("wsd-reveal-countdown");
  const authWrap = $("wsd-reveal-author-wrap");
  const authEl = $("wsd-reveal-author");
  const resultsEl = $("wsd-reveal-results");
  const nextWrap = $("wsd-reveal-next-wrap");
  const confettiEl = $("wsd-confetti-wrap");
  const qEl = $("wsd-reveal-question");
  const ansEl = $("wsd-reveal-answer-text");

  if (qEl) qEl.textContent = r.question;
  if (ansEl) ansEl.textContent = r.selectedAnswer.text;
  if (authWrap) authWrap.style.display = "none";
  if (resultsEl) resultsEl.innerHTML = "";
  if (nextWrap) nextWrap.style.display = "none";
  if (confettiEl) confettiEl.innerHTML = "";

  // Countdown: 3, 2, 1
  [3, 2, 1].forEach((n, i) => {
    setTimeout(() => {
      if (!countEl) return;
      countEl.textContent = n;
      countEl.classList.remove("wsd-anim-pop");
      void countEl.offsetWidth;
      countEl.classList.add("wsd-anim-pop");
    }, i * 700);
  });

  setTimeout(() => {
    if (countEl) countEl.textContent = "";

    if (authEl) {
      authEl.textContent = isGhostAnswer
        ? "👻 Ghost"
        : author
        ? author.name
        : "Unknown";
    }

    if (authWrap) {
      authWrap.style.display = "block";
      authWrap.classList.remove("wsd-anim-pop");
      void authWrap.offsetWidth;
      authWrap.classList.add("wsd-anim-pop");
    }

    if (!isGhostAnswer && r.correctGuessers.length > 0) {
      spawnConfetti(confettiEl);
    }

    // Summary text lines in the modal
    const authorLineSummary = $("wsd-no-correct-author-line");
    if (authorLineSummary) {
      const winnerNames = r.correctGuessers.length
        ? r.correctGuessers
            .map(
              pid =>
                gameState.players.find(p => p.id === pid)?.name
            )
            .filter(Boolean)
            .join(", ")
        : null;

      const authorWonRound =
        !isGhostAnswer &&
        r.correctGuessers.length === 0 &&
        !!author;

      // Did the author bet on themselves?
      const authorChoseSelf =
        !isGhostAnswer &&
        !!author &&
        r.wagers.some(
          w =>
            w.playerId === author.id &&
            parseInt(w.guessedAuthorId, 10) === author.id
        );

      // Solo self-guess: author chose self and no one else was correct
      const authorSelfOnly =
        authorChoseSelf && r.correctGuessers.length === 0;

      // Line 1: win outcome
      let line1 = "";
      if (isGhostAnswer) {
        line1 = winnerNames
          ? `🎉 ${winnerNames} correctly guessed Ghost.`
          : "😱 Nobody guessed Ghost — the house wins the Hunny pot.";
      } else if (authorSelfOnly) {
        line1 =
          "🤔 The author guessed themselves — no one wins the Hunny pot this round.";
      } else if (authorWonRound) {
        const name = author ? author.name : "The author";
        line1 = `🎯 Author not guessed — ${name} wins the Hunny pot.`;
      } else {
        // Normal winner case: only non-author winners are listed
        line1 = winnerNames
          ? `🎉 ${winnerNames} guessed the author correctly.`
          : "🤔 No winners recorded this round.";
      }

      // Line 2: Hunny pot payout (actual distributed pot)
      const potPaidOut = (r.payouts || []).reduce(
        (sum, pt) => sum + Math.max(0, pt.potPart || 0),
        0
      );
      const line2 =
        potPaidOut > 0
          ? `🍯 Hunny pot paid out: ${potPaidOut} points`
          : `🍯 Hunny pot paid out: 0 points`;

      // Line 3: removed (no house bonus anymore)

      // Line 4: explanation whenever author chose themselves
      const line4 = authorChoseSelf
        ? `ℹ️ ${author ? author.name : "The author"} guessed themselves so no payout.`
        : "";

      const parts = [];
      parts.push(
        `<p class="wsd-round-line">${line1}</p>`
      );
      parts.push(
        `<p class="wsd-round-line">${line2}</p>`
      );
      if (line4) {
        parts.push(
          `<p class="wsd-round-line wsd-round-line-note">${line4}</p>`
        );
      }

      authorLineSummary.innerHTML = parts.join("");
    }

    // Bootstrap modal: Round summary
    try {
      const modalEl = $("modal-no-correct");
      if (modalEl && typeof bootstrap !== "undefined") {
        const titleEl = modalEl.querySelector(".modal-title");
        if (titleEl) titleEl.textContent = "📝 Round summary";

        let bonusLine = $("wsd-author-bonus-line");
        if (bonusLine) bonusLine.remove();

        setTimeout(
          () => new bootstrap.Modal(modalEl).show(),
          400
        );
      }
    } catch (e) {}

    // Animate individual payout rows
    const authorSelfOnlyRows =
      !isGhostAnswer &&
      !!author &&
      r.correctGuessers.length === 0 &&
      r.wagers.some(
        w =>
          w.playerId === author.id &&
          parseInt(w.guessedAuthorId, 10) === author.id
      );

    const authorWonRoundRowFlag =
      !isGhostAnswer &&
      r.correctGuessers.length === 0 &&
      !!author &&
      !authorSelfOnlyRows;

    r.payouts.forEach((payout, i) => {
      setTimeout(() => {
        const p = gameState.players.find(
          pl => pl.id === payout.playerId
        );
        const ok = r.correctGuessers.includes(
          payout.playerId
        );

        const row = document.createElement("div");
        row.className = "wsd-result-row";
        row.style.animationDelay = `${i * 0.07}s`;

        const wagerPart = payout.wagerPart || 0;
        const potPart = payout.potPart || 0;
        const total = payout.delta || 0;

        const wagerStr =
          wagerPart >= 0 ? `+${wagerPart}` : String(wagerPart);
        const potStr =
          potPart >= 0 ? `+${potPart}` : String(potPart);
        const totalStr =
          total >= 0 ? `+${total}` : String(total);

        const isAuthor =
          !isGhostAnswer &&
          author &&
          p &&
          p.id === author.id;
        const winnerBadge =
          authorWonRoundRowFlag && isAuthor ? " 👑" : "";

        row.innerHTML = `
          <div>
            <div class="wsd-score-name">
              ${ok ? "✅ " : ""}${p ? p.name : "?"}${winnerBadge}
            </div>
            <div class="wsd-score-meta">
              Wager: ${wagerStr} · Hunny Pot: ${potStr}
            </div>
          </div>
          <div class="wsd-score-value ${
            total >= 0 ? "text-success" : "text-danger"
          }">${totalStr}</div>`;

        if (resultsEl) resultsEl.appendChild(row);
      }, i * 120);
    });

    setTimeout(() => {
      if (nextWrap) nextWrap.style.display = "block";
    }, r.payouts.length * 120 + 300);
  }, 2100);
}

// Simple confetti spawn for reveal/final screens
function spawnConfetti(container) {
  if (!container) return;
  const colors = [
    "#ff3b30",
    "#ffcc00",
    "#34c759",
    "#007aff",
    "#ff9500",
    "#af52de"
  ];
  container.style.height = "0";
  for (let i = 0; i < 18; i++) {
    const dot = document.createElement("div");
    dot.className = "wsd-confetti-dot";
    Object.assign(dot.style, {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * -30}px`,
      background:
        colors[
          Math.floor(Math.random() * colors.length)
        ],
      animationDelay: `${Math.random() * 0.6}s`,
      animationDuration: `${
        0.9 + Math.random() * 0.6
      }s`
    });
    container.appendChild(dot);
  }
}

// ---------- Scores, history, final bonuses ----------

function maybeRenderCollectionsScreen() {
  if (typeof window.renderCollectionsScreen === "function") {
    window.renderCollectionsScreen();
  }
}

// Main scores screen: leaderboard + bonus progress + manual controls
function renderScoresScreen() {
  const list = $("wsd-scores-list");
  if (!list) return;
  list.innerHTML = "";

  [...gameState.players]
    .sort(
      (a, b) => b.score - a.score || b.wins - a.wins
    )
    .forEach((p, i) => {
      const row = document.createElement("div");
      row.className =
        "wsd-score-row wsd-anim-fade-up";
      row.style.animationDelay = `${i * 0.05}s`;
      const dotColor = p.badgeColor || "#888888";

      row.innerHTML = `
        <div>
          <div class="wsd-score-name">
            <span class="wsd-player-dot" style="
              display:inline-block;
              width:8px;
              height:8px;
              border-radius:50%;
              margin-right:6px;
              background-color:${dotColor};
            "></span>
            ${medal(i)}${p.name}
          </div>
          <div class="wsd-score-meta">
            Wins: ${p.wins} · Attractions: ${
        p.collected.length
      } · Lands: ${getPlayerUniqueLandCount(p)}
          </div>
        </div>
        <div class="wsd-score-value">${p.score}</div>`;
      list.appendChild(row);
    });

  const footer = document.createElement("div");
  footer.className = "wsd-text-small mt-2 text-center";
  footer.innerHTML = `
    <a href="#" data-bs-toggle="modal" data-bs-target="#modal-scoring">
      How does scoring work?
    </a>`;
  list.appendChild(footer);

    // --- Buy Me a Coffee button ---
  const donateWrap = document.getElementById('wsd-donate-wrap');
  if (donateWrap && !donateWrap.dataset.bmcLoaded) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js';
    script.dataset.name = 'bmc-button';
    script.dataset.slug = 'Whosaiddiz';
    script.dataset.color = '#BD5FFF';
    script.dataset.emoji = '';
    script.dataset.font = 'Cookie';
    script.dataset.text = 'Buy me a coffee';
    script.dataset.outlineColor = '#000000';
    script.dataset.fontColor = '#ffffff';
    script.dataset.coffeeColor = '#FFDD00';

    donateWrap.appendChild(script);
    donateWrap.dataset.bmcLoaded = '1';
  }


  renderBonusProgress();
  renderManualAdjustmentsUI();
  maybeRenderCollectionsScreen();
}

// Show progress toward final bonus categories
function renderBonusProgress() {
  const el = $("wsd-bonus-progress");
  if (!el) return;

  const players = gameState.players;
  players.forEach(ensurePlayerStats);

  const categories = [
    {
      icon: "🗺️",
      label: "Top Land Collector",
      bonus: FINAL_BONUS_POINTS.topLandCollector,
      getValue: p => getPlayerUniqueLandCount(p)
    },
    {
      icon: "🎢",
      label: "Top Attraction Collector",
      bonus:
        FINAL_BONUS_POINTS.topAttractionCollector,
      getValue: p => p.collected.length
    },
    {
      icon: "🧠",
      label: "Best Guesser",
      bonus: FINAL_BONUS_POINTS.bestGuesser,
      getValue: p => p.stats.correctGuesses || 0
    },
    {
      icon: "🎲",
      label: "Most Risky Player",
      bonus: FINAL_BONUS_POINTS.mostRiskyPlayer,
      getValue: p => p.stats.totalRisked || 0
    }
  ];

  let html = "";

  categories.forEach(cat => {
    const scored = players
      .map(p => ({
        name: p.name,
        val: cat.getValue(p)
      }))
      .sort((a, b) => b.val - a.val);

    const best = scored[0]?.val || 0;
    let rankingHtml = "";

    if (!scored.length || best === 0) {
      rankingHtml =
        `<div class="wsd-score-meta" style="margin-top:6px">No leader yet</div>`;
    } else {
      let rank = 1;
      let i = 0;

      while (i < scored.length) {
        const tierVal = scored[i].val;
        const tierPlayers = scored.filter(
          s => s.val === tierVal
        );
        const isLeader = tierVal === best;
        const gap = best - tierVal;
        const names = tierPlayers
          .map(s => s.name)
          .join(" & ");
        const gapLabel =
          isLeader || gap === 0
            ? ""
            : ` (-${gap})`;
        const leaderClass = isLeader
          ? "wsd-bonus-leader"
          : "";

        rankingHtml += `
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:6px">
            <div class="wsd-score-meta">
              <span style="opacity:0.5;margin-right:8px">#${rank}</span>
              <span class="${leaderClass}">${names}</span>
              <span style="opacity:0.7">${gapLabel}</span>
            </div>
          </div>`;

        rank += tierPlayers.length;
        i += tierPlayers.length;
      }
    }

    html += `
      <div style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.07)">
        <div class="wsd-score-name" style="margin-bottom:4px">
          ${cat.icon} ${cat.label}
          <span style="font-weight:normal;opacity:0.6;font-size:0.8rem;margin-left:4px">(+${cat.bonus})</span>
        </div>
        <div style="margin-left:4px">
          ${rankingHtml}
        </div>
      </div>`;
  });

  html += `
    <div class="wsd-text-small mt-2 text-center">
      <a href="#" data-bs-toggle="modal" data-bs-target="#modal-bonuses">
        How are bonuses calculated?
      </a>
    </div>`;

  el.innerHTML =
    html || "<div class='wsd-text-small'>No rounds played yet.</div>";
}

// Manual +1/-1 adjustments UI on scores screen
function renderManualAdjustmentsUI() {
  const c = $("wsd-manual-adjustments");
  if (!c) return;
  c.innerHTML = "";

  gameState.players.forEach(p => {
    const row = document.createElement("div");
    row.className = "wsd-score-row";
    row.innerHTML = `
      <div class="wsd-score-name">${p.name}</div>
      <div>
        <button type="button" class="btn btn-sm btn-outline-secondary me-1" data-adj="-1" data-player="${p.id}">−1</button>
        <button type="button" class="btn btn-sm btn-outline-secondary me-1" data-adj="1" data-player="${p.id}">+1</button>
      </div>`;
    c.appendChild(row);
  });

  c.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () =>
      adjustPlayerScore(
        parseInt(btn.dataset.player, 10),
        parseInt(btn.dataset.adj, 10)
      )
    );
  });
}

// Apply a manual score adjustment and log it into last history item
function adjustPlayerScore(pid, delta) {
  const p = gameState.players.find(pl => pl.id === pid);
  if (!p) return;

  p.score += delta;
  if (p.score < gameState.settings.minPoints) {
    p.score = gameState.settings.minPoints;
  }

  if (gameState.history.length > 0) {
    const last =
      gameState.history[gameState.history.length - 1];
    (last.manualAdjustments || []).push({
      playerId: pid,
      delta,
      note: "Manual"
    });
  }

  saveState();
  renderScoresScreen();
}

// “Invert” current scores relative ranking (party rule)
function invertCurrentScores() {
  if (!gameState || gameState.players.length < 2) return;

  const ranked = [...gameState.players].sort(
    (a, b) =>
      b.score - a.score || b.wins - a.wins || a.id - b.id
  );
  const scoreValues = ranked
    .map(p => p.score)
    .sort((a, b) => a - b);

  const before = {};
  ranked.forEach((p, i) => {
    before[p.id] = p.score;
    p.score = scoreValues[i];
  });

  if (gameState.history.length) {
    const last =
      gameState.history[gameState.history.length - 1];
    (last.manualAdjustments || []).push({
      type: "invertScores",
      before,
      note: "Invert scores"
    });
  }

  saveState();
  renderScoresScreen();
}

// Show history of all rounds, latest first
function renderHistoryScreen() {
  const c = $("wsd-history-list");
  if (!c) return;
  c.innerHTML = "";

  if (!gameState.history.length) {
    c.textContent = "No rounds played yet.";
    return;
  }

  [...gameState.history].reverse().forEach(h => {
    const author = gameState.players.find(
      p => p.id === h.authorId
    );
    const isGhost = !!h.isGhostAnswer;

    const wrap = document.createElement("div");
    wrap.className = "mb-3 pb-2 border-bottom";

    let html = `<div><strong>Round ${
      h.roundNumber
    }</strong>`;
    if (h.park) html += ` — ${h.park}`;
    if (h.land) html += ` · ${h.land}`;
    if (h.attraction)
      html += ` · <em>${h.attraction}</em>`;
    html += `</div>
      <div class="wsd-text-small">Q: ${h.question}</div>
      <div class="wsd-text-small">Answer: &ldquo;${
        h.selectedAnswerText
      }&rdquo;</div>
      <div class="wsd-text-small">
        Author:${
          isGhost
            ? "👻 Ghost"
            : author
            ? author.name
            : "Unknown"
        }
      </div>`;

    h.payouts.forEach(pt => {
      const pl = gameState.players.find(
        x => x.id === pt.playerId
      );
      const ok = h.correctGuessers.includes(pt.playerId);
      const deltaStr = `${
        pt.delta >= 0 ? "+" : ""
      }${pt.delta}`;
      html += `<div class="wsd-text-small">${
        pl ? pl.name : "?"
      } ${ok ? "✅" : "❌"} (${deltaStr} pts)</div>`;
    });

    if (h.authorBonus > 0) {
      html += `<div class="wsd-text-small">Author bonus: +${h.authorBonus}</div>`;
    }

   // Hunny Pot Hot Round bonus line (if present)
    if (h.hunnyHotBonus && h.hunnyHotBonus > 0) {
      html += `<div class="wsd-text-small">Hunny Pot Hot Round bonus: +${h.hunnyHotBonus} points</div>`;
    }

    (h.manualAdjustments || []).forEach(adj => {
      if (adj.type === "invertScores") {
        html += `<div class="wsd-text-small">Manual: scores inverted</div>`;
      } else {
        const pl = gameState.players.find(
          x => x.id === adj.playerId
        );
        html += `<div class="wsd-text-small">Manual: ${
          pl ? pl.name : "?"
        } ${
          adj.delta >= 0 ? "+" : ""
        }${adj.delta}</div>`;
      }
    });

    wrap.innerHTML = html;
    c.appendChild(wrap);
  });
}
// Compute final bonuses once then show game-end screen
function computeFinalBonusesAndShow() {
  if (gameState.finalBonusesApplied) {
    renderFinalResults();
    return;
  }

  const players = gameState.players;
  players.forEach(ensurePlayerStats);

  const maxLand = Math.max(
    0,
    ...players.map(getPlayerUniqueLandCount)
  );
  const maxAttr = Math.max(
    0,
    ...players.map(p => p.collected.length)
  );
  const maxCorr = Math.max(
    0,
    ...players.map(p => p.stats.correctGuesses || 0)
  );
  const maxRisk = Math.max(
    0,
    ...players.map(p => p.stats.totalRisked || 0)
  );

  players.forEach(p => {
    p.bonusTotal = 0;
    p.finalBonusBreakdown = {
      topLandCollector: 0,
      topAttractionCollector: 0,
      bestGuesser: 0,
      mostRiskyPlayer: 0
    };

    const lc = getPlayerUniqueLandCount(p);
    const ac = p.collected.length;
    const cc = p.stats.correctGuesses || 0;
    const rc = p.stats.totalRisked || 0;

    if (lc > 0 && lc === maxLand) {
      p.bonusTotal += FINAL_BONUS_POINTS.topLandCollector;
      p.finalBonusBreakdown.topLandCollector =
        FINAL_BONUS_POINTS.topLandCollector;
    }
    if (ac > 0 && ac === maxAttr) {
      p.bonusTotal +=
        FINAL_BONUS_POINTS.topAttractionCollector;
      p.finalBonusBreakdown.topAttractionCollector =
        FINAL_BONUS_POINTS.topAttractionCollector;
    }
    if (cc > 0 && cc === maxCorr) {
      p.bonusTotal += FINAL_BONUS_POINTS.bestGuesser;
      p.finalBonusBreakdown.bestGuesser =
        FINAL_BONUS_POINTS.bestGuesser;
    }
    if (rc > 0 && rc === maxRisk) {
      p.bonusTotal += FINAL_BONUS_POINTS.mostRiskyPlayer;
      p.finalBonusBreakdown.mostRiskyPlayer =
        FINAL_BONUS_POINTS.mostRiskyPlayer;
    }
  });

  players.forEach(p => {
    p.score += p.bonusTotal;
  });

  gameState.finalBonusesApplied = true;
  saveState();
  renderFinalResults();
}


// Show final ranking with medals and bonus breakdown
function renderFinalResults() {
  const sorted = [...gameState.players].sort(
    (a, b) =>
      b.score === a.score
        ? b.wins - a.wins
        : b.score - a.score
  );
  const topScore = sorted[0].score;
  const topWins = sorted[0].wins;
  const winners = sorted.filter(
    p => p.score === topScore && p.wins === topWins
  );

  const banner = $("wsd-winner-banner");
  if (banner) {
    banner.innerHTML = `🎉 ${winners
      .map(w => w.name)
      .join(
        " & "
      )} wins! Time to collect that prize!`;
    banner.classList.remove("wsd-anim-pop");
    void banner.offsetWidth;
    banner.classList.add("wsd-anim-pop");
  }

  spawnConfetti($("wsd-confetti-wrap-end"));

  const c = $("wsd-final-results");
  if (!c) return;
  c.innerHTML = "";

  sorted.forEach((p, i) => {
    const row = document.createElement("div");
    row.className =
      "wsd-score-row wsd-anim-fade-up";
    row.style.animationDelay = `${i * 0.08}s`;
    const bd = p.finalBonusBreakdown || {};
    row.innerHTML = `
      <div>
        <div class="wsd-score-name">${medal(i)}${p.name}</div>
        <div class="wsd-score-meta">
          Wins: ${p.wins} · Attractions: ${
      p.collected.length
    } · Lands: ${getPlayerUniqueLandCount(
      p
    )} · Bonus: +${p.bonusTotal}
        </div>
        <div class="wsd-text-small">
          🗺️ +${bd.topLandCollector || 0} · 🎢 +${
      bd.topAttractionCollector || 0
    } · 🧠 +${bd.bestGuesser || 0} · 🎲 +${
      bd.mostRiskyPlayer || 0
    }
        </div>
      </div>
      <div class="wsd-score-value">${p.score}</div>`;
    c.appendChild(row);
  });
}

function abandonRound() {
  if (gameState) {
    gameState.roundNumber = Math.max(
      0,
      gameState.roundNumber - 1
    );
  }

  startNewRoundCore();
  showScreen("setup-question");
}


// ---------- Wire events & bootstrap ----------

function wireEvents() {
  debugLog("wireEvents starting");

  // Setup screen
  $("wsd-start-game").addEventListener(
    "click",
    startGameFromSetup
  );
  $("wsd-reset-setup").addEventListener("click", () => {
    confirmThenReset(
      "Restart this game and clear all scores and history?",
      "restart"
    );
  });
  $("wsd-add-player").addEventListener("click", () => {
    const c = $("wsd-player-inputs");
    if (!c || c.querySelectorAll("input").length >= 8) return;
    addPlayerInput(c);
  });

  $("wsd-park-select").addEventListener(
    "change",
    () => {
      const sel = $("wsd-park-select");
      const name = sel ? sel.value : "";
      const label = $("wsd-park-label");

      if (!name) {
        // Cleared park: reset theme + lock inputs
        if (label) label.textContent = "Not set";
        applyParkTheme(null);
        updatePlayerInputLock();
        return;
      }

      if (label) label.textContent = name;
      applyParkTheme(name);
      updatePlayerInputLock();
    }
  );

  // Question flow
  $("wsd-attraction-select").addEventListener(
    "change",
    () => {
      onAttractionChange();
      updateQuestionLock();
    }
  );
  $("wsd-generate-question").addEventListener(
    "click",
    onGenerateNewQuestion
  );
  $("wsd-enter-custom-question").addEventListener(
    "click",
    onEnterCustomQuestion
  );
  $("wsd-to-answers").addEventListener(
    "click",
    proceedToAnswers
  );
  $("wsd-abandon-from-setupq").addEventListener(
    "click",
    abandonRound
  );

  // Answers
  $("wsd-save-answer").addEventListener(
    "click",
    () => saveAnswerForCurrentPlayer(false)
  );
  $("wsd-skip-player").addEventListener(
    "click",
    () => saveAnswerForCurrentPlayer(true)
  );
  $("wsd-abandon-from-answers").addEventListener(
    "click",
    abandonRound
  );

  // Select answer
  $("wsd-select-again").addEventListener(
    "click",
    () => {
      showPickOverlay(() => {
        pickRandomAnswer();
        renderSelectAnswerScreen();
        saveState();
      });
    }
  );
  $("wsd-to-wagers").addEventListener(
    "click",
    goToGuessWager
  );
  $("wsd-abandon-from-select").addEventListener(
    "click",
    abandonRound
  );

  // Guess & wager
  $("wsd-lock-wagers").addEventListener(
    "click",
    lockWagers
  );
  $("wsd-clear-wagers").addEventListener(
    "click",
    clearWagersUI
  );
  $("wsd-abandon-from-gw").addEventListener(
    "click",
    abandonRound
  );

  // Scores / round navigation
  $("wsd-to-scores").addEventListener(
    "click",
    () => {
      renderScoresScreen();
      showScreen("scores");
    }
  );
  $("wsd-start-round").addEventListener(
    "click",
    () => {
      startNewRoundCore();
      showScreen("setup-question");
    }
  );
  $("wsd-view-history").addEventListener(
    "click",
    () => {
      renderHistoryScreen();
      showScreen("history");
    }
  );

  // End game / restart
  $("wsd-end-game").addEventListener("click", () => {
    confirmThenReset(
      "End this game and show final scores? You cannot keep playing this game afterward.",
      "end"
    );
  });
  $("wsd-restart-game").addEventListener(
    "click",
    () => {
      confirmThenReset(
        "Restart this game and clear all scores and history?",
        "restart"
      );
    }
  );
  $("wsd-play-again").addEventListener(
    "click",
    resetGame
  );
  $("wsd-view-history-end").addEventListener(
    "click",
    () => {
      renderHistoryScreen();
      showScreen("history");
    }
  );
  $("wsd-close-history").addEventListener(
    "click",
    () => {
      const fb = gameState
        ? gameState.screen === "history"
          ? "scores"
          : gameState.screen
        : "setup-game";
      if (fb === "scores") renderScoresScreen();
      if (fb === "game-end") renderFinalResults();
      showScreen(fb);
    }
  );

  // Invert scores easter egg
  const invertBtn = $("wsd-invert-scores");
  if (invertBtn) {
    invertBtn.addEventListener("click", () => {
      invertCurrentScores();
      invertBtn.classList.add("wsd-invert-active");
      setTimeout(
        () =>
          invertBtn.classList.remove("wsd-invert-active"),
        250
      );
    });
  }

  // Confirm reset modal “Yes” button
  const confirmYes = $("modal-confirm-reset-yes");
  if (confirmYes) {
    confirmYes.addEventListener("click", () => {
      const modalEl = $("modal-confirm-reset");
      if (modalEl && typeof bootstrap !== "undefined") {
        bootstrap.Modal.getInstance(modalEl)?.hide();
      }
      if (confirmAction === "end") {
        computeFinalBonusesAndShow();
        showScreen("game-end");
      } else {
        resetGame();
      }
    });
  }

  // Bottom nav
  $("wsd-nav-home")?.addEventListener("click", () => {
  rebuildSetupScreenFromState();
  showScreen("setup-game");
});
  $("wsd-nav-round")?.addEventListener("click", () => {
  rebuildRoundScreenFromState();
});
  $("wsd-nav-scores")?.addEventListener(
    "click",
    () => {
      if (!gameState) return;
      if (gameState.finalBonusesApplied) {
        renderFinalResults();
        showScreen("game-end");
      } else {
        renderScoresScreen();
        showScreen("scores");
      }
    }
  );
  $("wsd-nav-history")?.addEventListener(
    "click",
    () => {
      if (!gameState) return;
      renderHistoryScreen();
      showScreen("history");
    }
  );
  $("wsd-nav-faq")?.addEventListener("click", () => {
    showScreen("faq");
  });
}

function showResumeModal() {
  const modalEl = $("modal-resume-game");
  if (modalEl && typeof bootstrap !== "undefined") {
    new bootstrap.Modal(modalEl, {
      backdrop: "static",
      keyboard: false
    }).show();
  }
}

function rebuildCurrentScreen() {
  if (!gameState) return;

  const parkName = gameState.settings?.park || "Not set";
  const parkLabel = $("wsd-park-label");
  if (parkLabel) parkLabel.textContent = parkName;
  applyParkTheme(gameState.settings?.park || null);

  const scr = gameState.screen || "setup-game";

  if (scr === "setup-game") rebuildSetupGameScreen();
  if (scr === "setup-question") rebuildSetupQuestionScreen();
  if (scr === "enter-answers") rebuildEnterAnswersScreen();
  if (scr === "select-answer") renderSelectAnswerScreen();
  if (scr === "guess-wager") goToGuessWager();
  if (scr === "reveal") rebuildRevealScreen();
  if (scr === "scores") renderScoresScreen();
  if (scr === "history") renderHistoryScreen();
  if (scr === "game-end") renderFinalResults();

  showScreen(scr);
}
function rebuildSetupGameScreen() {
  initSetupScreen();

  const parkSel = $("wsd-park-select");
  const container = $("wsd-player-inputs");
  if (!parkSel || !container) return;

  parkSel.value = gameState?.settings?.park || "";
  container.innerHTML = "";

  (gameState.players || []).forEach(p => addPlayerInput(container, p.name));

  while (container.querySelectorAll("input").length < 3) {
    addPlayerInput(container);
  }

  updatePlayerInputLock();
}
function rebuildSetupQuestionScreen() {
  renderAttractionOptions();

  const r = gameState?.currentRound;
  if (!r) return;

  const attrSel = $("wsd-attraction-select");
  const meta = $("wsd-attraction-meta");
  const badge = $("wsd-question-type-badge");

  if (attrSel && r.attraction) {
    const idx = gameState.attractions.findIndex(a => a.name === r.attraction.name);
    if (idx >= 0) attrSel.value = String(idx);
  }

  if (meta) {
    meta.textContent = r.attraction
      ? `${r.attraction.park} • ${r.attraction.land}`
      : "";
  }

  setQuestionDisplay(r.question || "Select the attraction you're in line for above. 👆");

  if (badge) {
    badge.textContent =
      r.questionType === "custom" ? "Custom question" :
      r.question ? "Question" : "Pending";
  }

  updateQuestionLock();
}
function rebuildEnterAnswersScreen() {
  const r = gameState?.currentRound;
  if (!r) return;

  const enterQ = $("wsd-enter-question");
  if (enterQ) enterQ.textContent = r.question || "";

  renderAnswerProgress();
}
function rebuildRevealScreen() {
  const r = gameState?.currentRound;
  if (!r?.selectedAnswer) return;

  const isGhost = !!r.selectedAnswer.isGhost;
  const author = isGhost
    ? null
    : gameState.players.find(p => p.id === r.selectedAnswer.playerId);

  const qEl = $("wsd-reveal-question");
  const ansEl = $("wsd-reveal-answer-text");
  const authWrap = $("wsd-reveal-author-wrap");
  const authEl = $("wsd-reveal-author");

  if (qEl) qEl.textContent = r.question || "";
  if (ansEl) ansEl.textContent = r.selectedAnswer.text || "";
  if (authEl) authEl.textContent = isGhost ? "Ghost" : (author?.name || "Unknown");
  if (authWrap) authWrap.style.display = "block";
}
$("wsd-resume-game-btn")?.addEventListener("click", () => {
  const modalEl = $("modal-resume-game");
  if (modalEl && typeof bootstrap !== "undefined") {
    bootstrap.Modal.getInstance(modalEl)?.hide();
  }
  rebuildCurrentScreen();
});

$("wsd-start-over-btn")?.addEventListener("click", () => {
  resetGame();
});

function rebuildSetupScreenFromState() {
  initSetupScreen();

  if (!gameState) return;

  const parkSel = $("wsd-park-select");
  const parkLabel = $("wsd-park-label");
  const container = $("wsd-player-inputs");

  const parkName = gameState.settings?.park || "";

  if (parkSel) parkSel.value = parkName;
  if (parkLabel) parkLabel.textContent = parkName || "Not set";

  if (container) {
    container.innerHTML = "";

    (gameState.players || []).forEach((p) => {
      addPlayerInput(container, p.name);
    });

    while (container.querySelectorAll("input").length < 3) {
      addPlayerInput(container);
    }
  }

  applyParkTheme(parkName || null);
  updatePlayerInputLock();
}
function rebuildRoundScreenFromState() {
  if (!gameState) {
    showScreen("setup-game");
    return;
  }

  const parkName = gameState.settings?.park || "";
  const parkLabel = $("wsd-park-label");
  if (parkLabel) parkLabel.textContent = parkName || "Not set";
  applyParkTheme(parkName);
  renderAttractionOptions();

  const r = gameState.currentRound;
  const scr = ROUND_SCREENS.includes(gameState.screen) ? gameState.screen : "setup-question";

  if (!r) {
    showScreen("setup-question");
    return;
  }

  if (scr === "setup-question") {
    const attrSel = $("wsd-attraction-select");
    const meta = $("wsd-attraction-meta");
    const badge = $("wsd-question-type-badge");

    if (attrSel && r.attraction) {
  const idx = gameState.attractions.findIndex(a => a.name === r.attraction.name);
  if (idx >= 0) {
    attrSel.value = String(idx);
    // remove the placeholder "Select an attraction" option
    const placeholder = attrSel.querySelector('option[value=""]');
    if (placeholder) placeholder.remove();
  }
}


    if (meta) {
      meta.textContent = r.attraction ? `${r.attraction.park} • ${r.attraction.land}` : "";
    }

    setQuestionDisplay(r.question || "Select the attraction you're in line for above.");
    if (badge) badge.textContent = r.questionType === "custom" ? "Custom question" : (r.question ? "Question" : "Pending");
    updateQuestionLock();
    showScreen("setup-question");
    return;
  }

  if (scr === "enter-answers") {
    const enterQ = $("wsd-enter-question");
    const ansInp = $("wsd-answer-input");
    if (enterQ) enterQ.textContent = r.question || "";
    if (ansInp) ansInp.value = "";
    renderAnswerProgress();
    showScreen("enter-answers");
    return;
  }

  if (scr === "select-answer") {
    renderSelectAnswerScreen();
    showScreen("select-answer");
    return;
  }

  if (scr === "guess-wager") {
    goToGuessWager();
    return;
  }

  if (scr === "reveal") {
    showScreen("reveal");

    const isGhost = !!r.selectedAnswer?.isGhost;
    const author = isGhost ? null : gameState.players.find(p => p.id === r.selectedAnswer?.playerId);

    const qEl = $("wsd-reveal-question");
    const ansEl = $("wsd-reveal-answer-text");
    const authWrap = $("wsd-reveal-author-wrap");
    const authEl = $("wsd-reveal-author");
    const resultsEl = $("wsd-reveal-results");
    const nextWrap = $("wsd-reveal-next-wrap");
    const countEl = $("wsd-reveal-countdown");

    if (qEl) qEl.textContent = r.question || "";
    if (ansEl) ansEl.textContent = r.selectedAnswer?.text || "";
    if (countEl) countEl.textContent = "";
    if (authEl) authEl.textContent = isGhost ? "Ghost" : (author?.name || "Unknown");
    if (authWrap) authWrap.style.display = "block";
    if (nextWrap) nextWrap.style.display = "block";

    if (resultsEl) {
      resultsEl.innerHTML = "";
      (r.payouts || []).forEach((payout) => {
        const p = gameState.players.find(pl => pl.id === payout.playerId);
        const wager = (r.wagers || []).find(w => w.playerId === payout.playerId);

        let guessName = "";
        if (wager) {
          if (wager.guessedAuthorId === "ghost") {
            guessName = "Ghost";
          } else {
            const guessedPlayer = gameState.players.find(pl => pl.id === parseInt(wager.guessedAuthorId, 10));
            guessName = guessedPlayer ? guessedPlayer.name : "";
          }
        }

        const ok = (r.correctGuessers || []).includes(payout.playerId);
        const dStr = payout.delta > 0 ? `+${payout.delta}` : String(payout.delta);

        const row = document.createElement("div");
        row.className = "wsd-result-row";
        row.innerHTML = `
          <div>
            <div class="wsd-score-name">${ok ? "✅ " : ""}${p ? p.name : "?"}</div>
            <div class="wsd-score-meta">Guess: ${guessName} • Wager: ${wager ? wager.amount : 0}</div>
          </div>
          <div class="wsd-score-value ${payout.delta >= 0 ? "text-success" : "text-danger"}">${dStr}</div>
        `;
        resultsEl.appendChild(row);
      });
    }

    return;
  }

  showScreen("setup-question");
}
// ---------- Bootstrapping on DOM ready ----------

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  ensureStateShape();
  initSetupScreen();
  
  const verEl = $("wsd-version");
if (verEl) verEl.textContent = `v${APP_VERSION}`;

  wireEvents();

  const startBtn = $("wsd-start-game");
  if (startBtn) {
    startBtn.textContent = gameState ? "Resume game" : "Start game";
  }

  if (gameState) {
    const parkName = gameState.settings?.park || "Not set";
    const parkLabel = $("wsd-park-label");
    if (parkLabel) parkLabel.textContent = parkName;
    applyParkTheme(parkName);
    rebuildSetupScreenFromState();
    showResumeModal();
  } else {
    showScreen("setup-game");
  }
});
