function debugLog(msg) {
  try { console.log(msg); } catch (e) {}

  const box = document.getElementById("wsd-debug");
  if (!box) return;

  const line = document.createElement("div");
  line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}

// ===========================================================
//  Who Said Diz — game.js
// ===========================================================

const PARKS = {};

if (typeof PARK_MAGIC_KINGDOM !== "undefined") {
  PARKS[PARK_MAGIC_KINGDOM.name] = PARK_MAGIC_KINGDOM;
}

if (typeof PARK_EPCOT !== "undefined") {
  PARKS[PARK_EPCOT.name] = PARK_EPCOT;
}

let gameState = null;
const MIN_POINTS   = 3;
const START_POINTS = 10;

const FINAL_BONUS_POINTS = {
  topLandCollector: 3,
  topAttractionCollector: 3,
  bestGuesser: 2,
  mostRiskyPlayer: 2
};

const $  = id => document.getElementById(id);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const SCREEN_META = {
  "setup-game": {
    icon: "🎮",
    title: "Setup game",
    instruction: "Pick your park, add players, and choose your settings."
  },
  "setup-question": {
    icon: "🎢",
    title: "Choose attraction",
    instruction: "Pick your attraction. A question will be selected for you."
  },
  "enter-answers": {
    icon: "✏️",
    title: "Enter answers",
    instruction: "Pass the phone around. Each player secretly types their answer."
  },
  "select-answer": {
    icon: "🎲",
    title: "Selected answer",
    instruction: "A random answer has been chosen. No peeking at who wrote it!"
  },
  "guess-wager": {
    icon: "💰",
    title: "Guess & wager",
    instruction: "Everyone guesses the author and places their bet."
  },
  "reveal": {
    icon: "🔍",
    title: "Reveal",
    instruction: "Find out who really said that!"
  },
  "scores": {
    icon: "📊",
    title: "Scores",
    instruction: "Check standings and bonus progress. Start the next round when ready."
  },
  "game-end": {
    icon: "🏆",
    title: "Game over",
    instruction: "Bonuses applied! The player with most points wins the snack."
  },
  "history": {
    icon: "📋",
    title: "Round history",
    instruction: "A full log of every round played."
  }
};

const PARK_THEMES = {
  "Magic Kingdom": {
    hero:   "linear-gradient(180deg,#4b0082,#ff69b4)",
    nav:    "rgba(75,0,130,0.95)",
    avatar: "linear-gradient(135deg,#ff69b4,#800080)"
  },
  "EPCOT": {
    hero:   "linear-gradient(180deg,#003366,#66ccff)",
    nav:    "rgba(0,51,102,0.95)",
    avatar: "linear-gradient(135deg,#66ccff,#ffffff)"
  },
  "Hollywood Studios": {
    hero:   "linear-gradient(180deg,#3b3b3b,#ffcc00)",
    nav:    "rgba(59,59,59,0.95)",
    avatar: "linear-gradient(135deg,#ffcc00,#ff4081)"
  },
  "Animal Kingdom": {
    hero:   "linear-gradient(180deg,#014422,#8bc34a)",
    nav:    "rgba(1,68,34,0.95)",
    avatar: "linear-gradient(135deg,#8bc34a,#ffe082)"
  }
};

function applyParkTheme(parkName) {
  const theme = PARK_THEMES[parkName];
  const hero  = document.querySelector(".wsd-hero");
  const nav   = document.querySelector(".wsd-bottom-nav");
  const avatar = document.querySelector(".wsd-avatar");
  const bonusHeader = document.querySelector("#modal-no-correct .modal-header");

  if (theme) {
    if (hero) hero.style.backgroundImage = theme.hero;
    if (nav) nav.style.backgroundColor = theme.nav;
    if (avatar) avatar.style.backgroundImage = theme.avatar;
    if (bonusHeader) {
      bonusHeader.style.backgroundImage = theme.hero;
      bonusHeader.style.color = "#fff";
    }
  } else {
    if (hero) hero.style.backgroundImage = "";
    if (nav) nav.style.backgroundColor = "rgba(255,255,255,0.9)";
    if (avatar) avatar.style.backgroundImage = "";
    if (bonusHeader) {
      bonusHeader.style.backgroundImage = "";
      bonusHeader.style.color = "";
    }
  }
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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

function ensurePlayerStats(player) {
  player.stats ??= { correctGuesses: 0, totalRisked: 0, uniqueLands: [] };
  if (!Array.isArray(player.stats.uniqueLands)) {
    player.stats.uniqueLands = [];
  }
}

function ensureStateShape() {
  if (!gameState) return;

  gameState.settings ??= {};
  gameState.settings.startingPoints ||= START_POINTS;
  gameState.settings.minPoints      ||= MIN_POINTS;

  gameState.players ||= [];
  gameState.players.forEach(p => {
    if (!Array.isArray(p.collected)) p.collected = [];
    if (typeof p.wins !== "number") p.wins = 0;
    if (typeof p.bonusTotal !== "number") p.bonusTotal = 0;
    ensurePlayerStats(p);
  });

  gameState.history ||= [];
  if (!gameState.currentRound) return;

  const r = gameState.currentRound;
  r.correctGuessers      ||= [];
  r.payouts              ||= [];
  r.houseBonusRecipients ||= [];
  r.collectionsThisRound ||= [];
  if (typeof r.houseBonusApplied !== "boolean") r.houseBonusApplied = false;
  r.houseBonusReason ||= "";
}

const getAttractionByName = name =>
  gameState.attractions.find(a => a.name === name);

function getPlayerUniqueLandCount(player) {
  const set = new Set();
  player.collected.forEach(name => {
    const a = getAttractionByName(name);
    if (a?.land) set.add(a.land);
  });
  return set.size;
}

const ALL_SCREENS = Object.keys(SCREEN_META);

function showScreen(name) {
  ALL_SCREENS.forEach(key => {
    const el = $(`screen-${key}`);
    if (el) el.classList.toggle("wsd-screen-active", key === name);
  });

  if (gameState) {
    gameState.screen = name;
    saveState();
  }

  const meta   = SCREEN_META[name] || SCREEN_META["setup-game"];
  const iconEl = $("wsd-step-icon");
  const ttlEl  = $("wsd-step-title");
  const insEl  = $("wsd-step-instruction");
  if (iconEl) iconEl.textContent = meta.icon;
  if (ttlEl)  ttlEl.textContent  = meta.title;
  if (insEl)  insEl.textContent  = meta.instruction;

  const navMap = {
    "setup-game":     "wsd-nav-home",
    "setup-question": "wsd-nav-round",
    "enter-answers":  "wsd-nav-round",
    "select-answer":  "wsd-nav-round",
    "guess-wager":    "wsd-nav-round",
    "reveal":         "wsd-nav-round",
    "scores":         "wsd-nav-scores",
    "game-end":       "wsd-nav-scores",
    "history":        "wsd-nav-history"
  };

  $$(".wsd-nav-item").forEach(b => b.classList.remove("wsd-nav-item-active"));
  const navId = navMap[name];
  if (navId && $(navId)) $(navId).classList.add("wsd-nav-item-active");
}

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
  debugLog("Setup screen ready");
}

function addPlayerInput(container) {
  const inp = document.createElement("input");
  inp.type = "text";
  inp.className = "form-control wsd-form-control wsd-player-input";
  inp.placeholder = "Player name";
  container.appendChild(inp);
}

function startGameFromSetup() {
  const errEl = $("wsd-setup-error");
  if (errEl) errEl.textContent = "";

  const parkSel = $("wsd-park-select");
  const parkName = parkSel ? parkSel.value : "";
  if (!parkName || !PARKS[parkName]) {
    if (errEl) errEl.textContent = "Please select a park.";
    return;
  }

  const names = $$("#wsd-player-inputs input")
    .map(i => i.value.trim())
    .filter(Boolean);

  if (names.length < 3) {
    if (errEl) errEl.textContent = "Please enter at least three player names.";
    return;
  }

  const parkData = PARKS[parkName];
  const players = names.map((name, id) => ({
    id,
    name,
    score: START_POINTS,
    wins: 0,
    collected: [],
    bonusTotal: 0,
    stats: { correctGuesses: 0, totalRisked: 0, uniqueLands: [] }
  }));

  const usedQuestions = {
    attractions: {},
    generic: shuffle(parkData.genericQuestions),
    genericIndex: 0
  };

  parkData.attractions.forEach(a => {
    usedQuestions.attractions[a.name] = {
      questions: shuffle(a.questions),
      index: 0
    };
  });

  const lands = [...new Set(parkData.attractions.map(a => a.land).filter(Boolean))];

  gameState = {
    screen: "setup-question",
    roundNumber: 0,
    settings: {
      park: parkName,
      startingPoints: START_POINTS,
      minPoints: MIN_POINTS
    },
    players,
    lands,
    attractions: parkData.attractions,
    genericQuestions: parkData.genericQuestions,
    usedQuestions,
    currentRound: null,
    history: [],
    finalBonusesApplied: false
  };

  const parkLabel = $("wsd-park-label");
  if (parkLabel) parkLabel.textContent = parkName;
  applyParkTheme(parkName);

  const playerSummary = $("wsd-player-summary");
  if (playerSummary) playerSummary.textContent = `${players.length} players`;

  renderAttractionOptions();
  saveState();
  showScreen("setup-question");
  startNewRoundCore();
}

function renderAttractionOptions() {
  const sel = $("wsd-attraction-select");
  if (!sel || !gameState) return;
  sel.innerHTML = '<option value="">Select an attraction</option>';
  gameState.attractions.forEach((a, idx) => {
    const opt = document.createElement("option");
    opt.value = String(idx);
    opt.textContent = a.name;
    sel.appendChild(opt);
  });
}

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
    houseBonusAmount: 0,
    wagers: [],
    pot: 0,
    correctGuessers: [],
    payouts: [],
    scoreBefore: {},
    scoreAfter: {},
    collectionsThisRound: [],
    wrongGuessCount: 0,
    authorBonus: 0,
    houseBonusResolved: 0,
    houseBonusRecipients: [],
    houseBonusApplied: false,
    houseBonusReason: ""
  };
  saveState();

  const houseBonus = $("wsd-house-bonus");
  const qText      = $("wsd-question-text");
  const typeBadge  = $("wsd-question-type-badge");
  const attrSel    = $("wsd-attraction-select");
  const attrMeta   = $("wsd-attraction-meta");
  const setupErr   = $("wsd-setupq-error");

  if (houseBonus) houseBonus.value = "0";
  if (qText) { qText.readOnly = true; qText.value = ""; }
  if (typeBadge) typeBadge.textContent = "";
  if (attrSel)   attrSel.value = "";
  if (attrMeta)  attrMeta.textContent = "";
  if (setupErr)  setupErr.textContent = "";
}

function onAttractionChange() {
  if (!gameState) return;
  const attrSel = $("wsd-attraction-select");
  const idx = attrSel ? parseInt(attrSel.value, 10) : NaN;
  const meta  = $("wsd-attraction-meta");
  const qTxt  = $("wsd-question-text");
  const badge = $("wsd-question-type-badge");

  if (meta)  meta.textContent = "";
  if (qTxt)  qTxt.value = "";
  if (badge) badge.textContent = "";

  if (isNaN(idx) || !gameState.attractions[idx]) {
    gameState.currentRound.attraction = null;
    gameState.currentRound.question = "";
    return;
  }

  const attraction = gameState.attractions[idx];
  gameState.currentRound.attraction = attraction;
  if (meta) meta.textContent = `${attraction.park} • ${attraction.land}`;

  const { q, type } = drawQuestion(attraction);
  gameState.currentRound.question = q;
  gameState.currentRound.questionType = type;
  if (qTxt)  qTxt.value = q;
  if (badge) badge.textContent = labelForType(type);
  saveState();
}

function drawQuestion(attraction) {
  const uq = gameState.usedQuestions;
  const entry = uq.attractions[attraction.name];
  if (entry && entry.index < entry.questions.length) {
    const q = entry.questions[entry.index++];
    return { q, type: "attraction" };
  }
  if (uq.genericIndex < uq.generic.length) {
    const q = uq.generic[uq.genericIndex++];
    return { q, type: "generic" };
  }
  const pool = gameState.genericQuestions;
  if (pool.length) {
    return { q: pool[Math.floor(Math.random() * pool.length)], type: "generic" };
  }
  return { q: "No questions available.", type: "generic" };
}

function labelForType(type) {
  return type === "attraction"
    ? "Attraction question"
    : type === "generic"
    ? "Generic question"
    : "Custom question";
}

function onGenerateNewQuestion() {
  if (!gameState || !gameState.currentRound.attraction) {
    const err = $("wsd-setupq-error");
    if (err) err.textContent = "Select an attraction first.";
    return;
  }
  const err = $("wsd-setupq-error");
  if (err) err.textContent = "";

  const { q, type } = drawQuestion(gameState.currentRound.attraction);
  const qTxt  = $("wsd-question-text");
  const badge = $("wsd-question-type-badge");
  gameState.currentRound.question = q;
  gameState.currentRound.questionType = type;
  if (qTxt)  qTxt.value = q;
  if (badge) badge.textContent = labelForType(type);
  saveState();
}

function onEnterCustomQuestion() {
  const qTxt = $("wsd-question-text");
  if (!qTxt) return;
  qTxt.readOnly = false;
  qTxt.value = "";
  const badge = $("wsd-question-type-badge");
  if (badge) badge.textContent = "Custom question";
  gameState.currentRound.questionType = "custom";
  qTxt.focus();
  saveState();
}

function proceedToAnswers() {
  const err = $("wsd-setupq-error");
  if (err) err.textContent = "";
  if (!gameState || !gameState.currentRound.attraction) {
    if (err) err.textContent = "Please select an attraction.";
    return;
  }

  const qTxt = $("wsd-question-text");
  const q = qTxt ? qTxt.value.trim() : "";
  if (!q) {
    if (err) err.textContent = "Please enter a question.";
    return;
  }

  gameState.currentRound.question = q;
  gameState.currentRound.answers = [];
  gameState.currentRound.answerIndex = 0;
  saveState();

  const enterQ = $("wsd-enter-question");
  const ansInp = $("wsd-answer-input");
  if (enterQ) enterQ.textContent = q;
  if (ansInp) ansInp.value = "";

  renderAnswerProgress();
  showScreen("enter-answers");
}

function renderAnswerProgress() {
  const r = gameState.currentRound;
  const idx   = r.answerIndex || 0;
  const total = gameState.players.length;
  const progEl = $("wsd-answer-progress");
  const label  = $("wsd-current-player-label");

  if (progEl) progEl.textContent = `Player ${idx + 1} of ${total}`;
  const player = gameState.players[idx];
  if (label) label.textContent = player ? `${player.name}'s answer` : "Done";
}

function saveAnswerForCurrentPlayer(skip) {
  const r   = gameState.currentRound;
  const idx = r.answerIndex || 0;
  const player = gameState.players[idx];
  const ansInp = $("wsd-answer-input");
  const err    = $("wsd-answers-error");

  if (err) err.textContent = "";
  const text = ansInp ? ansInp.value.trim() : "";

  if (!skip && !text) {
    if (err) err.textContent = "Please enter an answer or skip.";
    return;
  }

  if (!skip) r.answers.push({ playerId: player.id, text });
  if (ansInp) ansInp.value = "";
  r.answerIndex = idx + 1;

  if (r.answerIndex >= gameState.players.length) {
    if (!r.answers.length) {
      if (err) err.textContent = "No answers were entered. Abandon or go back.";
      return;
    }
    saveState();
    showPickOverlay(() => {
      pickRandomAnswer();
      renderSelectAnswerScreen();
      showScreen("select-answer");
    });
  } else {
    renderAnswerProgress();
    saveState();
  }
}

function pickRandomAnswer() {
  const pool = gameState.currentRound.answers;
  gameState.currentRound.selectedAnswer =
    pool[Math.floor(Math.random() * pool.length)];
}

function renderSelectAnswerScreen() {
  const r = gameState.currentRound;
  const qEl   = $("wsd-select-question");
  const ansEl = $("wsd-selected-answer");

  if (qEl)  qEl.textContent  = r.question;
  if (!ansEl) return;

  ansEl.classList.remove("wsd-anim-pop");
  void ansEl.offsetWidth;
  ansEl.textContent = `“${r.selectedAnswer.text}”`;
  ansEl.classList.add("wsd-anim-pop");
}

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

function goToGuessWager() {
  const errEl = $("wsd-gw-error");
  if (errEl) errEl.textContent = "";

  const houseBonus = $("wsd-house-bonus");
  if (houseBonus) houseBonus.value = "0";

  const r = gameState.currentRound;
  const qEl   = $("wsd-gw-question");
  const ansEl = $("wsd-gw-answer");
  if (qEl)  qEl.textContent  = r.question;
  if (ansEl) ansEl.textContent = `“${r.selectedAnswer.text}”`;

  const container = $("wsd-gw-players");
  if (!container) return;
  container.innerHTML = "";

  gameState.players.forEach(p => {
    const row = document.createElement("div");
    row.className = "mb-3 pb-2 border-bottom";

    const playerLabel = document.createElement("div");
    playerLabel.className = "wsd-score-row mb-1";
    playerLabel.innerHTML = `
      <div>
        <div class="wsd-score-name">${p.name}</div>
        <div class="wsd-score-meta">Current score: ${p.score}</div>
      </div>`;
    row.appendChild(playerLabel);

    const inner = document.createElement("div");
    inner.className = "d-flex gap-2";

    const guessSel = document.createElement("select");
    guessSel.className = "form-select wsd-form-select";
    guessSel.dataset.playerId = p.id;
    gameState.players.forEach(p2 => {
      const opt = document.createElement("option");
      opt.value = p2.id;
      opt.textContent = p2.name + (p2.id === p.id ? " (you)" : "");
      guessSel.appendChild(opt);
    });

    const wagerInp = document.createElement("input");
    wagerInp.type = "number";
    wagerInp.min = 0;
    wagerInp.max = p.score;
    wagerInp.value = Math.min(1, p.score);
    wagerInp.inputMode = "numeric";
    wagerInp.pattern = "[0-9]*";
    wagerInp.className = "form-control wsd-form-control";
    wagerInp.style.maxWidth = "90px";
    wagerInp.dataset.playerId = p.id;

    inner.appendChild(guessSel);
    inner.appendChild(wagerInp);
    row.appendChild(inner);
    container.appendChild(row);
  });

  showScreen("guess-wager");
}

function clearWagersUI() {
  $$("#wsd-gw-players select").forEach(sel => { sel.selectedIndex = 0; });
  $$("#wsd-gw-players input[type=number]").forEach(inp => {
    const pid = parseInt(inp.dataset.playerId, 10);
    const p = gameState.players.find(pl => pl.id === pid);
    inp.value = Math.min(1, p ? p.score : 1);
  });
  const houseBonus = $("wsd-house-bonus");
  if (houseBonus) houseBonus.value = "0";
}

function lockWagers() {
  const err = $("wsd-gw-error");
  if (err) err.textContent = "";

  const hbInput = $("wsd-house-bonus");
  let houseBonus = hbInput ? parseInt(hbInput.value, 10) : 0;
  if (isNaN(houseBonus) || houseBonus < 0) houseBonus = 0;

  const wagers = [];
  $$("#wsd-gw-players select").forEach(sel => {
    const pid = parseInt(sel.dataset.playerId, 10);
    const wInp = document.querySelector(
      `#wsd-gw-players input[data-player-id="${pid}"]`
    );
    let amount = wInp ? parseInt(wInp.value, 10) : 0;
    if (isNaN(amount) || amount < 0) amount = 0;
    const player = gameState.players.find(pl => pl.id === pid);
    if (player && amount > player.score) amount = player.score;
    wagers.push({
      playerId: pid,
      guessedAuthorId: parseInt(sel.value, 10),
      amount
    });
  });

  const participants = wagers.filter(w => w.amount > 0);
  if (participants.length < 2) {
    if (err) err.textContent = "At least two players must wager more than 0.";
    return;
  }

  gameState.currentRound.houseBonusAmount = houseBonus;
  gameState.currentRound.wagers = wagers;
  computeRevealAndScoring();
  showScreen("reveal");
  runRevealAnimation();
  saveState();
}

function computeRevealAndScoring() {
  const r = gameState.currentRound;
  const authorId = r.selectedAnswer.playerId;
  const allWagers = r.wagers;

  const payouts = [];
  let wrongGuessCount = 0;

  gameState.players.forEach(p => {
    const we = allWagers.find(w => w.playerId === p.id);
    let delta = 0;

    if (we) {
      const amount = Math.max(0, parseInt(we.amount, 10) || 0);
      const guessedAuthorId = parseInt(we.guessedAuthorId, 10);

      ensurePlayerStats(p);
      p.stats.totalRisked += amount;

      if (amount > 0) {
        if (guessedAuthorId === authorId) {
          delta += amount;
        } else {
          delta -= amount;
          wrongGuessCount += 1;
        }
      }
    }

    payouts.push({ playerId: p.id, delta });
  });

  let authorBonus = 0;
  if (wrongGuessCount > 0) {
    authorBonus = wrongGuessCount;
    const authorPayout = payouts.find(pt => pt.playerId === authorId);
    if (authorPayout) authorPayout.delta += authorBonus;
  }

  r.wrongGuessCount = wrongGuessCount;
  r.authorBonus = authorBonus;

  r.correctGuessers = allWagers
    .filter(w => {
      const amount = Math.max(0, parseInt(w.amount, 10) || 0);
      return amount > 0 && parseInt(w.guessedAuthorId, 10) === authorId;
    })
    .map(w => w.playerId);

  const houseBonus = Math.max(0, parseInt(r.houseBonusAmount, 10) || 0);
  r.houseBonusResolved = 0;
  r.houseBonusRecipients = [];
  r.houseBonusApplied = false;
  r.houseBonusReason = "";

  if (houseBonus > 0) {
    const correctCount = r.correctGuessers.length;
    if (correctCount === 0) {
      r.houseBonusReason = "No house bonus: nobody guessed correctly.";
    } else if (houseBonus % correctCount !== 0) {
      r.houseBonusReason =
        "No house bonus: it could not be split evenly among correct guessers.";
    } else {
      const share = houseBonus / correctCount;
      r.correctGuessers.forEach(pid => {
        const pt = payouts.find(p => p.playerId === pid);
        if (pt) {
          pt.delta += share;
          r.houseBonusRecipients.push({ playerId: pid, extra: share });
        }
      });
      r.houseBonusResolved = houseBonus;
      r.houseBonusApplied = true;
      r.houseBonusReason = "House bonus applied evenly.";
    }
  }

  r.payouts = payouts;
  r.pot = 0;

  applyRoundResults(authorId);
}

function applyRoundResults(authorId) {
  const r = gameState.currentRound;
  const scoreBefore = {};
  const scoreAfter  = {};

  gameState.players.forEach(p => {
    const payout = r.payouts.find(x => x.playerId === p.id);
    scoreBefore[p.id] = p.score;
    p.score += payout ? payout.delta : 0;
    if (p.score < gameState.settings.minPoints) {
      p.score = gameState.settings.minPoints;
    }
    scoreAfter[p.id] = p.score;
  });

  r.scoreBefore = scoreBefore;
  r.scoreAfter  = scoreAfter;

  r.correctGuessers.forEach(pid => {
    const p = gameState.players.find(pl => pl.id === pid);
    if (!p) return;
    p.wins++;
    ensurePlayerStats(p);
    p.stats.correctGuesses = (p.stats.correctGuesses || 0) + 1;
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
      if (r.attraction.land && !p.stats.uniqueLands.includes(r.attraction.land)) {
        p.stats.uniqueLands.push(r.attraction.land);
      }
    });
  }

  gameState.history.push({
    roundNumber: gameState.roundNumber,
    park: gameState.settings.park,
    land: r.attraction ? r.attraction.land : "",
    attraction: r.attraction ? r.attraction.name : "",
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
    houseBonusResolved: r.houseBonusResolved,
    houseBonusRecipients: r.houseBonusRecipients,
    houseBonusApplied: r.houseBonusApplied,
    houseBonusReason: r.houseBonusReason,
    authorBonus: r.authorBonus,
    wrongGuessCount: r.wrongGuessCount,
    houseBonusAmount: r.houseBonusAmount
  });
}

function runRevealAnimation() {
  const r  = gameState.currentRound;
  const author = gameState.players.find(p => p.id === r.selectedAnswer.playerId);
  const countEl  = $("wsd-reveal-countdown");
  const authWrap = $("wsd-reveal-author-wrap");
  const authEl   = $("wsd-reveal-author");
  const resultsEl = $("wsd-reveal-results");
  const nextWrap  = $("wsd-reveal-next-wrap");
  const confettiWrap = $("wsd-confetti-wrap");

  const qEl   = $("wsd-reveal-question");
  const ansEl = $("wsd-reveal-answer-text");
  if (qEl)  qEl.textContent  = r.question;
  if (ansEl) ansEl.textContent = `“${r.selectedAnswer.text}”`;

  if (authWrap) authWrap.style.display = "none";
  if (resultsEl) resultsEl.innerHTML = "";
  if (nextWrap) nextWrap.style.display = "none";
  if (confettiWrap) confettiWrap.innerHTML = "";

  ["3", "2", "1"].forEach((n, i) => {
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
    if (authEl) authEl.textContent = author ? author.name : "Unknown";
    if (authWrap) {
      authWrap.style.display = "block";
      authWrap.classList.remove("wsd-anim-pop");
      void authWrap.offsetWidth;
      authWrap.classList.add("wsd-anim-pop");
    }

    if (r.correctGuessers.length > 0 && confettiWrap) {
      spawnConfetti(confettiWrap);
    }

    if ((r.wrongGuessCount && r.wrongGuessCount > 0) || r.houseBonusAmount > 0) {
      const name = author ? author.name : "the author";
      const authorLine = $("wsd-no-correct-author-line");
      if (authorLine) {
        if (r.wrongGuessCount > 0) {
          const bonus = r.authorBonus || 0;
          const wrong = r.wrongGuessCount;
          authorLine.textContent =
            `✍️ ${name} earned +${bonus} point${bonus === 1 ? "" : "s"} ` +
            `from ${wrong} wrong guess${wrong === 1 ? "" : "es"}.`;
        } else {
          authorLine.textContent = "";
        }
      }

      const houseLine = $("wsd-house-bonus-line");
      if (houseLine) {
        if (r.houseBonusApplied) {
          const names = r.houseBonusRecipients
            .map(hr => {
              const p = gameState.players.find(pl => pl.id === hr.playerId);
              return p ? `${p.name} (+${hr.extra})` : `Player ${hr.playerId} (+${hr.extra})`;
            })
            .join(", ");
          houseLine.textContent =
            `🏠 House bonus +${r.houseBonusResolved} was split evenly between: ${names}.`;
        } else if (r.houseBonusAmount > 0) {
          houseLine.textContent =
            `🏠 ${r.houseBonusReason || "House bonus was not applied."}`;
        } else {
          houseLine.textContent = "";
        }
      }

      try {
        const modalEl = $("modal-no-correct");
        if (modalEl && typeof bootstrap !== "undefined") {
          const titleEl = modalEl.querySelector(".modal-title");
          if (titleEl) titleEl.textContent = "Bonus Summary";
          const m = new bootstrap.Modal(modalEl);
          setTimeout(() => m.show(), 400);
        }
      } catch (e) {}
    }

    r.payouts.forEach((payout, i) => {
      setTimeout(() => {
        const p     = gameState.players.find(pl => pl.id === payout.playerId);
        const wager = r.wagers.find(w => w.playerId === payout.playerId);
        const guess = wager && gameState.players.find(pl => pl.id === wager.guessedAuthorId);
        const ok    = r.correctGuessers.includes(payout.playerId);

        const row = document.createElement("div");
        row.className = "wsd-result-row";
        row.style.animationDelay = `${i * 0.07}s`;
        const deltaStr = `${payout.delta >= 0 ? "+" : ""}${payout.delta}`;
        row.innerHTML = `
          <div>
            <div class="wsd-score-name">${p.name} ${ok ? "✅" : "❌"}</div>
            <div class="wsd-score-meta">
              Guess: ${guess ? guess.name : "—"} •
              Wager: ${wager ? wager.amount : 0}
            </div>
          </div>
          <div class="wsd-score-value ${
            payout.delta >= 0 ? "text-success" : "text-danger"
          }">${deltaStr}</div>`;
        if (resultsEl) resultsEl.appendChild(row);
      }, i * 120);
    });

    setTimeout(() => {
      if (nextWrap) nextWrap.style.display = "block";
    }, r.payouts.length * 120 + 300);
  }, 2100);
}

function spawnConfetti(container) {
  if (!container) return;
  const colors = ["#ff3b30", "#ffcc00", "#34c759", "#007aff", "#ff9500", "#af52de"];
  container.style.height = "0";
  for (let i = 0; i < 18; i++) {
    const dot = document.createElement("div");
    dot.className = "wsd-confetti-dot";
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.top = `${Math.random() * -30}px`;
    dot.style.background = colors[Math.floor(Math.random() * colors.length)];
    dot.style.animationDelay = `${Math.random() * 0.6}s`;
    dot.style.animationDuration = `${0.9 + Math.random() * 0.6}s`;
    container.appendChild(dot);
  }
}

function maybeRenderCollectionsScreen() {
  if (typeof window.renderCollectionsScreen === "function") {
    window.renderCollectionsScreen();
  }
}

function renderScoresScreen() {
  const listEl = $("wsd-scores-list");
  if (!listEl) return;
  listEl.innerHTML = "";

  const sorted = [...gameState.players].sort(
    (a, b) => b.score - a.score || b.wins - a.wins
  );

  sorted.forEach((p, i) => {
    const row = document.createElement("div");
    row.className = "wsd-score-row wsd-anim-fade-up";
    row.style.animationDelay = `${i * 0.05}s`;
    row.innerHTML = `
      <div>
        <div class="wsd-score-name">${
          i === 0 ? "🥇 " : i === 1 ? "🥈 " : i === 2 ? "🥉 " : ""
        }${p.name}</div>
        <div class="wsd-score-meta">
          Wins: ${p.wins} · Attractions: ${p.collected.length} · Lands: ${getPlayerUniqueLandCount(p)}
        </div>
      </div>
      <div class="wsd-score-value">${p.score}</div>`;
    listEl.appendChild(row);
  });

  renderBonusProgress();
  renderManualAdjustmentsUI();
  maybeRenderCollectionsScreen();
}

function renderBonusProgress() {
  const el = $("wsd-bonus-progress");
  if (!el) return;

  const players = gameState.players;
  const maxLandCount = Math.max(0, ...players.map(getPlayerUniqueLandCount));
  const maxAttractionCount = Math.max(0, ...players.map(p => p.collected.length));
  const maxCorrect = Math.max(0, ...players.map(p => {
    ensurePlayerStats(p);
    return p.stats.correctGuesses || 0;
  }));
  const maxRisked = Math.max(0, ...players.map(p => {
    ensurePlayerStats(p);
    return p.stats.totalRisked || 0;
  }));

  let html = "";
  players.forEach(p => {
    ensurePlayerStats(p);
    const landCount       = getPlayerUniqueLandCount(p);
    const attractionCount = p.collected.length;
    const correctCount    = p.stats.correctGuesses || 0;
    const risked          = p.stats.totalRisked || 0;

    const landBonus =
      landCount > 0 && landCount === maxLandCount ? FINAL_BONUS_POINTS.topLandCollector : 0;
    const attractionBonus =
      attractionCount > 0 && attractionCount === maxAttractionCount
        ? FINAL_BONUS_POINTS.topAttractionCollector
        : 0;
    const guessBonus =
      correctCount > 0 && correctCount === maxCorrect ? FINAL_BONUS_POINTS.bestGuesser : 0;
    const riskyBonus =
      risked > 0 && risked === maxRisked ? FINAL_BONUS_POINTS.mostRiskyPlayer : 0;
    const total = landBonus + attractionBonus + guessBonus + riskyBonus;

    html += `
      <div class="wsd-bonus-topic">
        <div class="wsd-bonus-topic-icon">🎯</div>
        <div>
          <div class="wsd-bonus-topic-title">${p.name} — projected +${total} pts</div>
          <div class="wsd-bonus-topic-desc">
            🗺️ Top land collector: ${landBonus > 0 ? "✅ +3" : `${landCount} lands`}<br/>
            🎢 Top attraction collector: ${attractionBonus > 0 ? "✅ +3" : `${attractionCount} attractions`}<br/>
            🧠 Best guesser: ${guessBonus > 0 ? "✅ +2" : `${correctCount} correct`}<br/>
            🎲 Most risky player: ${riskyBonus > 0 ? "✅ +2" : `${risked} risked`}
          </div>
        </div>
      </div>`;
  });

  el.innerHTML = html || "<div class='wsd-text-small'>No rounds played yet.</div>";
}

function renderManualAdjustmentsUI() {
  const container = $("wsd-manual-adjustments");
  if (!container) return;
  container.innerHTML = "";

  gameState.players.forEach(p => {
    const row = document.createElement("div");
    row.className = "wsd-score-row";
    row.innerHTML = `
      <div class="wsd-score-name">${p.name}</div>
      <div>
        <button type="button" class="btn btn-sm btn-outline-secondary me-1"
          data-adj="-1" data-player="${p.id}">−1</button>
        <button type="button" class="btn btn-sm btn-outline-secondary me-1"
          data-adj="1" data-player="${p.id}">+1</button>
      </div>`;
    container.appendChild(row);
  });

  container.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      adjustPlayerScore(
        parseInt(btn.dataset.player, 10),
        parseInt(btn.dataset.adj, 10)
      );
    });
  });
}

function adjustPlayerScore(pid, delta) {
  const p = gameState.players.find(pl => pl.id === pid);
  if (!p) return;
  p.score += delta;
  if (p.score < gameState.settings.minPoints) {
    p.score = gameState.settings.minPoints;
  }
  if (gameState.history.length > 0) {
    const last = gameState.history[gameState.history.length - 1];
    last.manualAdjustments = last.manualAdjustments || [];
    last.manualAdjustments.push({ playerId: pid, delta, note: "Manual" });
  }
  saveState();
  renderScoresScreen();
}

function invertCurrentScores() {
  if (!gameState || !gameState.players || gameState.players.length < 2) return;

  const ranked = [...gameState.players].sort(
    (a, b) => b.score - a.score || b.wins - a.wins || a.id - b.id
  );
  const scoreValues = ranked.map(p => p.score).sort((a, b) => a - b);
  const before = {};

  ranked.forEach((p, index) => {
    before[p.id] = p.score;
    p.score = scoreValues[index];
  });

  if (gameState.history.length > 0) {
    const last = gameState.history[gameState.history.length - 1];
    last.manualAdjustments = last.manualAdjustments || [];
    last.manualAdjustments.push({
      type: "invertScores",
      before,
      note: "Invert scores"
    });
  }

  saveState();
  renderScoresScreen();
}

function renderHistoryScreen() {
  const container = $("wsd-history-list");
  if (!container) return;
  container.innerHTML = "";
  if (!gameState.history.length) {
    container.textContent = "No rounds played yet.";
    return;
  }

  [...gameState.history].reverse().forEach(h => {
    const author = gameState.players.find(p => p.id === h.authorId);
    const wrap = document.createElement("div");
    wrap.className = "mb-3 pb-2 border-bottom";
    let html = `<div><strong>Round ${h.roundNumber}</strong>`;
    if (h.park)       html += ` — ${h.park}`;
    if (h.land)       html += ` · ${h.land}`;
    if (h.attraction) html += ` · <em>${h.attraction}</em>`;
    html += `</div>`;
    html += `<div class="wsd-text-small">Q: ${h.question}</div>`;
    html += `<div class="wsd-text-small">Answer: &ldquo;${h.selectedAnswerText}&rdquo;</div>`;
    html += `<div class="wsd-text-small">Author: <strong>${
      author ? author.name : "Unknown"
    }</strong></div>`;
    h.payouts.forEach(pt => {
      const pl = gameState.players.find(x => x.id === pt.playerId);
      const wager = h.wagers.find(w => w.playerId === pt.playerId);
      const guess =
        wager && gameState.players.find(x => x.id === wager.guessedAuthorId);
      const ok = h.correctGuessers.includes(pt.playerId);
      html += `<div class="wsd-text-small">
        &nbsp;&nbsp;${pl ? pl.name : "?"}: guess ${
        guess ? guess.name : "—"
      }, wager ${wager ? wager.amount : 0}, ${
        ok ? "✅" : "❌"
      }, ${pt.delta >= 0 ? "+" : ""}${pt.delta} pts
      </div>`;
    });
    if (typeof h.authorBonus === "number" && h.authorBonus > 0) {
      html += `<div class="wsd-text-small">
        &nbsp;&nbsp;Author bonus: +${h.authorBonus}
      </div>`;
    }
    if (h.houseBonusAmount > 0 || h.houseBonusResolved > 0 || h.houseBonusReason) {
      const names = (h.houseBonusRecipients || [])
        .map(hr => {
          const pl = gameState.players.find(x => x.id === hr.playerId);
          return pl ? `${pl.name} (+${hr.extra})` : `Player ${hr.playerId} (+${hr.extra})`;
        })
        .join(", ");
      html += `<div class="wsd-text-small">
        &nbsp;&nbsp;House bonus: ${
          h.houseBonusApplied
            ? `+${h.houseBonusResolved} split evenly: ${names}`
            : (h.houseBonusReason || "Not applied")
        }
      </div>`;
    }
    if (h.manualAdjustments && h.manualAdjustments.length) {
      h.manualAdjustments.forEach(adj => {
        if (adj.type === "invertScores") {
          html += `<div class="wsd-text-small">
            &nbsp;&nbsp;Manual: scores inverted
          </div>`;
        } else {
          const pl = gameState.players.find(x => x.id === adj.playerId);
          html += `<div class="wsd-text-small">
            &nbsp;&nbsp;Manual: ${pl ? pl.name : "?"} ${
            adj.delta >= 0 ? "+" : ""
          }${adj.delta}
          </div>`;
        }
      });
    }
    wrap.innerHTML = html;
    container.appendChild(wrap);
  });
}

function computeFinalBonusesAndShow() {
  if (gameState.finalBonusesApplied) {
    renderFinalResults();
    return;
  }

  const players = gameState.players;
  const maxLandCount = Math.max(0, ...players.map(getPlayerUniqueLandCount));
  const maxAttractionCount = Math.max(0, ...players.map(p => p.collected.length));
  const maxCorrect = Math.max(0, ...players.map(p => {
    ensurePlayerStats(p);
    return p.stats.correctGuesses || 0;
  }));
  const maxRisked = Math.max(0, ...players.map(p => {
    ensurePlayerStats(p);
    return p.stats.totalRisked || 0;
  }));

  players.forEach(p => {
    ensurePlayerStats(p);
    p.bonusTotal = 0;
    p.finalBonusBreakdown = {
      topLandCollector: 0,
      topAttractionCollector: 0,
      bestGuesser: 0,
      mostRiskyPlayer: 0
    };

    const landCount       = getPlayerUniqueLandCount(p);
    const attractionCount = p.collected.length;
    const correctCount    = p.stats.correctGuesses || 0;
    const risked          = p.stats.totalRisked || 0;

    if (landCount > 0 && landCount === maxLandCount) {
      p.bonusTotal += FINAL_BONUS_POINTS.topLandCollector;
      p.finalBonusBreakdown.topLandCollector = FINAL_BONUS_POINTS.topLandCollector;
    }
    if (attractionCount > 0 && attractionCount === maxAttractionCount) {
      p.bonusTotal += FINAL_BONUS_POINTS.topAttractionCollector;
      p.finalBonusBreakdown.topAttractionCollector =
        FINAL_BONUS_POINTS.topAttractionCollector;
    }
    if (correctCount > 0 && correctCount === maxCorrect) {
      p.bonusTotal += FINAL_BONUS_POINTS.bestGuesser;
      p.finalBonusBreakdown.bestGuesser = FINAL_BONUS_POINTS.bestGuesser;
    }
    if (risked > 0 && risked === maxRisked) {
      p.bonusTotal += FINAL_BONUS_POINTS.mostRiskyPlayer;
      p.finalBonusBreakdown.mostRiskyPlayer = FINAL_BONUS_POINTS.mostRiskyPlayer;
    }
  });

  players.forEach(p => { p.score += p.bonusTotal; });

  gameState.finalBonusesApplied = true;
  saveState();
  renderFinalResults();
}

function renderFinalResults() {
  const sorted = [...gameState.players].sort((a, b) =>
    b.score === a.score ? b.wins - a.wins : b.score - a.score
  );
  const topScore = sorted[0].score;
  const topWins  = sorted[0].wins;
  const winners = sorted.filter(
    p => p.score === topScore && p.wins === topWins
  );

  const banner = $("wsd-winner-banner");
  if (banner) {
    banner.innerHTML = `🎉 ${winners.map(w => w.name).join(" & ")} wins! Time to collect that snack!`;
    banner.classList.remove("wsd-anim-pop");
    void banner.offsetWidth;
    banner.classList.add("wsd-anim-pop");
  }

  spawnConfetti($("wsd-confetti-wrap-end"));

  const container = $("wsd-final-results");
  if (!container) return;
  container.innerHTML = "";
  sorted.forEach((p, i) => {
    const row = document.createElement("div");
    row.className = "wsd-score-row wsd-anim-fade-up";
    row.style.animationDelay = `${i * 0.08}s`;
    const breakdown = p.finalBonusBreakdown || {};
    row.innerHTML = `
      <div>
        <div class="wsd-score-name">${
          i === 0 ? "🥇 " : i === 1 ? "🥈 " : i === 2 ? "🥉 " : ""
        }${p.name}</div>
        <div class="wsd-score-meta">
          Wins: ${p.wins} · Attractions: ${p.collected.length}
          · Lands: ${getPlayerUniqueLandCount(p)}
          · Bonus: +${p.bonusTotal}
        </div>
        <div class="wsd-text-small">
          🗺️ +${breakdown.topLandCollector || 0}
          · 🎢 +${breakdown.topAttractionCollector || 0}
          · 🧠 +${breakdown.bestGuesser || 0}
          · 🎲 +${breakdown.mostRiskyPlayer || 0}
        </div>
      </div>
      <div class="wsd-score-value">${p.score}</div>`;
    container.appendChild(row);
  });
}

function abandonRound() {
  if (gameState) {
    gameState.roundNumber = Math.max(0, gameState.roundNumber - 1);
  }
  startNewRoundCore();
  if (gameState && gameState.history.length > 0) {
    renderScoresScreen();
    showScreen("scores");
  } else {
    showScreen("setup-question");
    startNewRoundCore();
  }
}

function wireEvents() {
  debugLog("wireEvents starting");

  $("wsd-start-game").addEventListener("click", startGameFromSetup);
  $("wsd-reset-setup").addEventListener("click", () => {
    const err = $("wsd-setup-error");
    const parkSel = $("wsd-park-select");
    if (err) err.textContent = "";
    if (parkSel) parkSel.value = "";
    $$("#wsd-player-inputs input").forEach((el, i) => {
      if (i < 3) el.value = "";
      else el.remove();
    });
  });

  $("wsd-add-player").addEventListener("click", () => {
    const c = $("wsd-player-inputs");
    if (!c) return;
    if (c.querySelectorAll("input").length >= 8) return;
    addPlayerInput(c);
  });

  $("wsd-park-select").addEventListener("change", () => {
    const parkSel = $("wsd-park-select");
    const name = parkSel ? parkSel.value : "";
    const label = $("wsd-park-label");
    if (label) label.textContent = name || "Not set";
    applyParkTheme(name);
  });

  $("wsd-attraction-select").addEventListener("change", onAttractionChange);
  $("wsd-generate-question").addEventListener("click", onGenerateNewQuestion);
  $("wsd-enter-custom-question").addEventListener("click", onEnterCustomQuestion);
  $("wsd-to-answers").addEventListener("click", proceedToAnswers);
  $("wsd-abandon-from-setupq").addEventListener("click", abandonRound);

  $("wsd-save-answer").addEventListener("click", () =>
    saveAnswerForCurrentPlayer(false)
  );
  $("wsd-skip-player").addEventListener("click", () =>
    saveAnswerForCurrentPlayer(true)
  );
  $("wsd-abandon-from-answers").addEventListener("click", abandonRound);

  $("wsd-select-again").addEventListener("click", () => {
    showPickOverlay(() => {
      pickRandomAnswer();
      renderSelectAnswerScreen();
      saveState();
    });
  });

  $("wsd-to-wagers").addEventListener("click", goToGuessWager);
  $("wsd-abandon-from-select").addEventListener("click", abandonRound);

  $("wsd-lock-wagers").addEventListener("click", lockWagers);
  $("wsd-clear-wagers").addEventListener("click", clearWagersUI);
  $("wsd-abandon-from-gw").addEventListener("click", abandonRound);

  $("wsd-to-scores").addEventListener("click", () => {
    renderScoresScreen();
    showScreen("scores");
  });

  $("wsd-start-round").addEventListener("click", () => {
    startNewRoundCore();
    showScreen("setup-question");
  });

  $("wsd-view-history").addEventListener("click", () => {
    renderHistoryScreen();
    showScreen("history");
  });

  $("wsd-end-game").addEventListener("click", () => {
    computeFinalBonusesAndShow();
    showScreen("game-end");
  });

  $("wsd-restart-game").addEventListener("click", () => {
    localStorage.removeItem("whoSaidDiz");
    location.reload();
  });

  $("wsd-view-history-end").addEventListener("click", () => {
    renderHistoryScreen();
    showScreen("history");
  });

  $("wsd-play-again").addEventListener("click", () => {
    localStorage.removeItem("whoSaidDiz");
    location.reload();
  });

  $("wsd-close-history").addEventListener("click", () => {
    const fb = gameState
      ? gameState.screen === "history"
        ? "scores"
        : gameState.screen
      : "setup-game";
    if (fb === "scores") renderScoresScreen();
    if (fb === "game-end") renderFinalResults();
    showScreen(fb);
  });

  const invertBtn = $("wsd-invert-scores");
  if (invertBtn) invertBtn.addEventListener("click", invertCurrentScores);

  $("wsd-nav-home").addEventListener("click", () =>
    showScreen("setup-game")
  );
  $("wsd-nav-round").addEventListener("click", () => {
    if (!gameState) {
      showScreen("setup-game");
      return;
    }
    const roundScreens = [
      "setup-question",
      "enter-answers",
      "select-answer",
      "guess-wager",
      "reveal"
    ];
    showScreen(roundScreens.includes(gameState.screen) ? gameState.screen : "setup-question");
  });
  $("wsd-nav-scores").addEventListener("click", () => {
    if (!gameState) {
      showScreen("setup-game");
      return;
    }
    renderScoresScreen();
    showScreen("scores");
  });
  $("wsd-nav-history").addEventListener("click", () => {
    if (!gameState) {
      showScreen("setup-game");
      return;
    }
    renderHistoryScreen();
    showScreen("history");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  ensureStateShape();
  initSetupScreen();
  wireEvents();

  if (gameState) {
    const parkName = gameState.settings?.park || "Not set";
    const parkLabel = $("wsd-park-label");
    if (parkLabel) parkLabel.textContent = parkName;
    applyParkTheme(parkName);
    renderAttractionOptions();
    const scr = gameState.screen || "setup-game";
    if (scr === "scores")  renderScoresScreen();
    if (scr === "history") renderHistoryScreen();
    if (scr === "game-end") renderFinalResults();
    showScreen(scr);
  } else {
    showScreen("setup-game");
  }
});
