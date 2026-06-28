// ===========================================================
//  Who Said Diz — game.js (refactored, commented, same behavior)
// ===========================================================

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

function ensureResumeModal() {
  let modalEl = $("modal-resume-game");
  if (modalEl) return modalEl;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <div class="modal fade" id="modal-resume-game" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Resume game?</h5>
          </div>
          <div class="modal-body">
            <p>You have a saved game in progress.</p>
            <p>Press OK to reload the saved game state.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="resume-start-over">Start over</button>
            <button type="button" class="btn btn-primary" id="resume-ok">OK</button>
          </div>
        </div>
      </div>
    </div>`;

  modalEl = wrapper.firstElementChild;
  document.body.appendChild(modalEl);
  return modalEl;
}

function promptResumeGame(onResume) {
  const modalEl = ensureResumeModal();
  if (!modalEl || typeof bootstrap === "undefined") {
    onResume();
    return;
  }

  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  const okBtn = $("resume-ok");
  const startOverBtn = $("resume-start-over");

  okBtn?.addEventListener("click", () => {
    modal.hide();
    onResume();
  }, { once: true });

  startOverBtn?.addEventListener("click", () => {
    modal.hide();
    resetGame();
  }, { once: true });

  modal.show();
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
      "All - guess who said diz & wager points. Add house points to increase the stakes."
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

// Spotlight localStorage key
const SPOTLIGHT_KEY = "wsd_hero_panel_spotlight_shown";
let firstSetupGameShown = false;

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

  ["correctGuessers", "payouts", "houseBonusRecipients", "collectionsThisRound"]
    .forEach(k => {
      r[k] ||= [];
    });

  if (typeof r.houseBonusApplied !== "boolean") r.houseBonusApplied = false;
  r.houseBonusReason ||= "";
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

    // NEW: park-themed headers
    ["#modal-scoring .modal-header", "backgroundImage", t?.hero || ""],
    ["#modal-scoring .modal-header", "color", t ? "#fff" : ""],
    ["#modal-bonuses .modal-header", "backgroundImage", t?.hero || ""],
    ["#modal-bonuses .modal-header", "color", t ? "#fff" : ""],
    ["#modal-wager-help .modal-header", "backgroundImage", t?.hero || ""],
    ["#modal-wager-help .modal-header", "color", t ? "#fff" : ""],
    ["#modal-welcome .modal-header", "backgroundImage", t?.hero || ""],
