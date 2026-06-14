function debugLog(msg) {
  // Also try real console if it exists
  try { console.log(msg); } catch (e) {}

  // Mirror to on-page debug div
  var box = document.getElementById("wsd-debug");
  if (!box) return;
  var line = document.createElement("div");
  var now  = new Date();
  var ts   = now.toLocaleTimeString();
  line.textContent = "[" + ts + "] " + msg;
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}

// ===========================================================
//  Who Said Diz — game.js
// ===========================================================

// ---- Park registry ----------------------------------------
const PARKS = {};

if (typeof PARK_MAGIC_KINGDOM !== "undefined") {
  PARKS[PARK_MAGIC_KINGDOM.name] = PARK_MAGIC_KINGDOM;
}

if (typeof PARK_EPCOT !== "undefined") {
  PARKS[PARK_EPCOT.name] = PARK_EPCOT;
}

// Add more parks the same way:
// if (typeof PARK_HOLLYWOOD_STUDIOS !== "undefined") {
//   PARKS[PARK_HOLLYWOOD_STUDIOS.name] = PARK_HOLLYWOOD_STUDIOS;
// }

// ---- State ------------------------------------------------
let gameState = null;
const MIN_POINTS   = 3;
const START_POINTS = 10;

// ---- DOM helper -------------------------------------------
function $(id) {
  return document.getElementById(id);
}

// ---- Shuffle ----------------------------------------------
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---- Persistence ------------------------------------------
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

// ---- Screen / instruction card data -----------------------
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
    avatar: "linear-gradient(135deg,#ff69b4,#800080)"  // pink → gold
  },
  "EPCOT": {
    hero:   "linear-gradient(180deg,#003366,#66ccff)",
    nav:    "rgba(0,51,102,0.95)",
    avatar: "linear-gradient(135deg,#66ccff,#ffffff)"  // blue → white
  },
  "Hollywood Studios": {
    hero:   "linear-gradient(180deg,#3b3b3b,#ffcc00)",
    nav:    "rgba(59,59,59,0.95)",
    avatar: "linear-gradient(135deg,#ffcc00,#ff4081)"  // gold → magenta
  },
  "Animal Kingdom": {
    hero:   "linear-gradient(180deg,#014422,#8bc34a)",
    nav:    "rgba(1,68,34,0.95)",
    avatar: "linear-gradient(135deg,#8bc34a,#ffe082)"  // green → light gold
  }
};


function applyParkTheme(parkName) {
  const theme = PARK_THEMES[parkName];
  const hero  = document.querySelector(".wsd-hero");
  const nav   = document.querySelector(".wsd-bottom-nav");
  const avatar = document.querySelector(".wsd-avatar");

  if (!hero || !nav || !avatar) return;

  if (theme) {
    hero.style.backgroundImage = theme.hero;
    nav.style.backgroundColor  = theme.nav;
    avatar.style.backgroundImage = theme.avatar;
  } else {
    // Fallback to default colors from CSS
    hero.style.backgroundImage = "";
    nav.style.backgroundColor  = "rgba(255,255,255,0.9)";
    avatar.style.backgroundImage = "";  // uses .wsd-avatar default
  }
}

const ALL_SCREENS = Object.keys(SCREEN_META);

function showScreen(name) {
  ALL_SCREENS.forEach(key => {
    const el = $("screen-" + key);
    if (el) el.classList.toggle("wsd-screen-active", key === name);
  });

  if (gameState) {
    gameState.screen = name;
    saveState();
  }

  // Update instruction card
  const meta = SCREEN_META[name] || SCREEN_META["setup-game"];
  $("wsd-step-icon").textContent        = meta.icon;
  $("wsd-step-title").textContent       = meta.title;
  $("wsd-step-instruction").textContent = meta.instruction;

  // Bottom nav highlight
  const navMap = {
    "setup-game": "wsd-nav-home",
    "setup-question": "wsd-nav-round",
    "enter-answers": "wsd-nav-round",
    "select-answer": "wsd-nav-round",
    "guess-wager": "wsd-nav-round",
    "reveal": "wsd-nav-round",
    "scores": "wsd-nav-scores",
    "game-end": "wsd-nav-scores",
    "history": "wsd-nav-history"
  };
  document.querySelectorAll(".wsd-nav-item")
    .forEach(b => b.classList.remove("wsd-nav-item-active"));
  const navId = navMap[name];
  if (navId) $(navId).classList.add("wsd-nav-item-active");
}

// ---- Setup screen init ------------------------------------
function initSetupScreen() {
  debugLog("initSetupScreen starting");
  const sel = $("wsd-park-select");
  const container = $("wsd-player-inputs");
  debugLog("wsd-park-select exists? " + !!sel);
  debugLog("wsd-player-inputs exists? " + !!container);
  if (!sel || !container) return;

  Object.keys(PARKS).forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    sel.appendChild(opt);
  });
  debugLog("Added park options: " + JSON.stringify(Object.keys(PARKS)));

  for (let i = 0; i < 3; i++) addPlayerInput(container);
  debugLog("Seeded 3 player inputs");
}

function addPlayerInput(container) {
  const inp = document.createElement("input");
  inp.type = "text";
  inp.className = "form-control wsd-form-control wsd-player-input";
  inp.placeholder = "Player name";
  container.appendChild(inp);
}

// ---- Start game -------------------------------------------
function startGameFromSetup() {
  const errEl = $("wsd-setup-error");
  errEl.textContent = "";

  const parkName = $("wsd-park-select").value;
  if (!parkName || !PARKS[parkName]) {
    errEl.textContent = "Please select a park.";
    return;
  }

  const names = Array.from(
    document.querySelectorAll("#wsd-player-inputs input")
  )
    .map(i => i.value.trim())
    .filter(Boolean);
  if (names.length < 3) {
    errEl.textContent = "Please enter at least three player names.";
    return;
  }

  const tableStakes =
    document.querySelector('input[name="wsd-table-stakes"]:checked').value ===
    "yes";
  let bonusPointValue = parseInt($("wsd-bonus-value").value, 10);
  if (isNaN(bonusPointValue) || bonusPointValue < 0) bonusPointValue = 1;

  const parkData = PARKS[parkName];
  const players = names.map((name, id) => ({
    id,
    name,
    score: START_POINTS,
    wins: 0,
    collected: [],
    bonusTotal: 0
  }));

  // Shuffle question pools once
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

  const lands = [
    ...new Set(parkData.attractions.map(a => a.land).filter(Boolean))
  ];

  gameState = {
    screen: "setup-question",
    roundNumber: 0,
    settings: {
      park: parkName,
      tableStakes,
      bonusPointValue,
      startingPoints: START_POINTS,
      minPoints: MIN_POINTS
    },
    players,
    lands,
    attractions: parkData.attractions,
    genericQuestions: parkData.genericQuestions,
    usedQuestions,
    currentRound: null,
    history: []
  };

  $("wsd-park-label").textContent = parkName;
  applyParkTheme(parkName);   // <-- add this
  if ($("wsd-player-summary")) {
    $("wsd-player-summary").textContent = players.length + " players";
  }
  renderAttractionOptions();
  saveState();
  showScreen("setup-question");
  startNewRoundCore();
}

function renderAttractionOptions() {
  const sel = $("wsd-attraction-select");
  sel.innerHTML = '<option value="">Select an attraction</option>';
  if (!gameState) return;
  gameState.attractions.forEach((a, idx) => {
    const opt = document.createElement("option");
    opt.value = String(idx);
    opt.textContent = a.name;
    sel.appendChild(opt);
  });
}

// ---- Round lifecycle --------------------------------------
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
    collectionsThisRound: []
  };
  saveState();
  if ($("wsd-house-bonus")) $("wsd-house-bonus").value = "0";
  if ($("wsd-question-text")) {
    $("wsd-question-text").readOnly = true;
    $("wsd-question-text").value = "";
  }
  if ($("wsd-question-type-badge")) {
    $("wsd-question-type-badge").textContent = "";
  }
  if ($("wsd-attraction-select")) $("wsd-attraction-select").value = "";
  if ($("wsd-attraction-meta")) $("wsd-attraction-meta").textContent = "";
  if ($("wsd-setupq-error")) $("wsd-setupq-error").textContent = "";
}

function onAttractionChange() {
  if (!gameState) return;
  const idx = parseInt($("wsd-attraction-select").value, 10);
  const meta = $("wsd-attraction-meta");
  const qTxt = $("wsd-question-text");
  const badge = $("wsd-question-type-badge");
  meta.textContent = "";
  qTxt.value = "";
  badge.textContent = "";

  if (isNaN(idx) || !gameState.attractions[idx]) {
    gameState.currentRound.attraction = null;
    gameState.currentRound.question = "";
    return;
  }
  const attraction = gameState.attractions[idx];
  gameState.currentRound.attraction = attraction;
  meta.textContent = attraction.park + " • " + attraction.land;
  const { q, type } = drawQuestion(attraction);
  gameState.currentRound.question = q;
  gameState.currentRound.questionType = type;
  qTxt.value = q;
  badge.textContent = labelForType(type);
  saveState();
}

function drawQuestion(attraction) {
  const uq = gameState.usedQuestions;
  const entry = uq.attractions[attraction.name];
  if (entry && entry.index < entry.questions.length) {
    const q = entry.questions[entry.index];
    entry.index++;
    return { q, type: "attraction" };
  }
  if (uq.genericIndex < uq.generic.length) {
    const q = uq.generic[uq.genericIndex];
    uq.genericIndex++;
    return { q, type: "generic" };
  }
  const pool = gameState.genericQuestions;
  if (pool.length) {
    return {
      q: pool[Math.floor(Math.random() * pool.length)],
      type: "generic"
    };
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
    $("wsd-setupq-error").textContent = "Select an attraction first.";
    return;
  }
  $("wsd-setupq-error").textContent = "";
  const { q, type } = drawQuestion(gameState.currentRound.attraction);
  gameState.currentRound.question = q;
  gameState.currentRound.questionType = type;
  $("wsd-question-text").value = q;
  $("wsd-question-type-badge").textContent = labelForType(type);
  saveState();
}

function onEnterCustomQuestion() {
  const qTxt = $("wsd-question-text");
  qTxt.readOnly = false;
  qTxt.value = "";
  $("wsd-question-type-badge").textContent = "Custom question";
  gameState.currentRound.questionType = "custom";
  qTxt.focus();
  saveState();
}

function proceedToAnswers() {
  const err = $("wsd-setupq-error");
  err.textContent = "";
  if (!gameState || !gameState.currentRound.attraction) {
    err.textContent = "Please select an attraction.";
    return;
  }
  const q = $("wsd-question-text").value.trim();
  if (!q) {
    err.textContent = "Please enter a question.";
    return;
  }
  gameState.currentRound.question = q;
  gameState.currentRound.answers = [];
  gameState.currentRound.answerIndex = 0;
  saveState();
  $("wsd-enter-question").textContent = q;
  $("wsd-answer-input").value = "";
  renderAnswerProgress();
  showScreen("enter-answers");
}

function renderAnswerProgress() {
  const idx = gameState.currentRound.answerIndex || 0;
  const total = gameState.players.length;
  $("wsd-answer-progress").textContent =
    "Player " + (idx + 1) + " of " + total;
  const player = gameState.players[idx];
  $("wsd-current-player-label").textContent = player
    ? player.name + "'s answer"
    : "Done";
}

function saveAnswerForCurrentPlayer(skip) {
  const idx = gameState.currentRound.answerIndex || 0;
  const player = gameState.players[idx];
  const text = $("wsd-answer-input").value.trim();
  $("wsd-answers-error").textContent = "";

  if (!skip && !text) {
    $("wsd-answers-error").textContent =
      "Please enter an answer or skip.";
    return;
  }
  if (!skip) {
    gameState.currentRound.answers.push({ playerId: player.id, text });
  }

  $("wsd-answer-input").value = "";
  gameState.currentRound.answerIndex = idx + 1;

  if (gameState.currentRound.answerIndex >= gameState.players.length) {
    if (gameState.currentRound.answers.length === 0) {
      $("wsd-answers-error").textContent =
        "No answers were entered. Abandon or go back.";
      return;
    }
    saveState();
    // Loading flourish before selecting answer
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
  $("wsd-select-question").textContent = gameState.currentRound.question;
  const el = $("wsd-selected-answer");
  el.classList.remove("wsd-anim-pop");
  void el.offsetWidth;
  el.textContent =
    "“" + gameState.currentRound.selectedAnswer.text + "”";
  el.classList.add("wsd-anim-pop");
}

// ---- Answer pick overlay flourish -------------------------
function showPickOverlay(onDone) {
  const overlay = $("wsd-pick-overlay");
  if (!overlay) {
    onDone();
    return;
  }

  const labels = [
    "Selecting an answer..."
  ];
  const labelEl = $("wsd-pick-label");
  if (labelEl) {
    labelEl.textContent =
      labels[Math.floor(Math.random() * labels.length)];
  }

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

// ---- Guess & wager ----------------------------------------
function goToGuessWager() {
  $("wsd-gw-error").textContent = "";
  $("wsd-house-bonus").value = "0";
  $("wsd-gw-question").textContent = gameState.currentRound.question;
  const gwAns = $("wsd-gw-answer");
  gwAns.textContent =
    "“" + gameState.currentRound.selectedAnswer.text + "”";

  const container = $("wsd-gw-players");
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
      opt.textContent = p2.name;
      if (p2.id === p.id) opt.textContent += " (you)";
      guessSel.appendChild(opt);
    });

    const wagerInp = document.createElement("input");
    wagerInp.type = "number";
    wagerInp.min = 0;
    wagerInp.max = p.score;
    wagerInp.value = Math.min(1, p.score); // default 1
    // iPhone numeric keypad hints
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
  document
    .querySelectorAll("#wsd-gw-players select")
    .forEach(sel => (sel.selectedIndex = 0));

  document
    .querySelectorAll("#wsd-gw-players input[type=number]")
    .forEach(inp => {
      const pid = parseInt(inp.dataset.playerId, 10);
      const p = gameState.players.find(pl => pl.id === pid);
      inp.value = Math.min(1, p ? p.score : 1);
    });

  $("wsd-house-bonus").value = "0";
}

function lockWagers() {
  const err = $("wsd-gw-error");
  err.textContent = "";
  const tableStakes = gameState.settings.tableStakes;

  let houseBonus = parseInt($("wsd-house-bonus").value, 10);
  if (isNaN(houseBonus) || houseBonus < 0) houseBonus = 0;

  const wagers = [];
  document
    .querySelectorAll("#wsd-gw-players select")
    .forEach(sel => {
      const pid = parseInt(sel.dataset.playerId, 10);
      const wInp = document.querySelector(
        `#wsd-gw-players input[data-player-id="${pid}"]`
      );
      let amount = parseInt(wInp.value, 10);
      if (isNaN(amount) || amount < 0) amount = 0;
      const player = gameState.players.find(pl => pl.id === pid);
      if (player && amount > player.score) amount = player.score;
      wagers.push({
        playerId: pid,
        guessedAuthorId: parseInt(sel.value, 10),
        amount
      });
    });

  let participants;
  if (tableStakes) {
    const max = Math.max(...wagers.map(w => w.amount));
    if (max <= 0) {
      err.textContent =
        "At least two players must wager more than 0.";
      return;
    }
    participants = wagers.filter(w => w.amount === max);
    if (participants.length < 2) {
      err.textContent =
        "At least two players must match the top bet to play this round.";
      return;
    }
    wagers.forEach(w => {
      if (w.amount !== max) w.amount = 0;
    });
  } else {
    participants = wagers.filter(w => w.amount > 0);
    if (participants.length < 2) {
      err.textContent =
        "At least two players must wager more than 0.";
      return;
    }
  }

  gameState.currentRound.houseBonusAmount = houseBonus;
  gameState.currentRound.wagers = wagers;
  computeRevealAndScoring();
  showScreen("reveal");
  runRevealAnimation();
  saveState();
}

// ---- Scoring ----------------------------------------------
function computeRevealAndScoring() {
  const round = gameState.currentRound;
  const authorId = round.selectedAnswer.playerId;

  const allWagers = round.wagers;

  // Track per-player deltas
  const payouts = [];
  let wrongGuessCount = 0;

  // 1) Apply wager risk to each player
  gameState.players.forEach(p => {
    const we = allWagers.find(w => w.playerId === p.id);
    let delta = 0;

    if (we) {
      const amount = Math.max(0, parseInt(we.amount, 10) || 0);
      const guessedAuthorId = parseInt(we.guessedAuthorId, 10);

      if (amount > 0) {
        if (guessedAuthorId === authorId) {
          // Correct guess: win what you wagered
          delta += amount;
        } else {
          // Wrong guess: lose what you wagered
          delta -= amount;
          wrongGuessCount += 1;
        }
      }
    }

    payouts.push({ playerId: p.id, delta });
  });

  // 2) Author bonus: +1 per wrong wagering player
  if (wrongGuessCount > 0) {
    const authorPayout = payouts.find(pt => pt.playerId === authorId);
    if (authorPayout) authorPayout.delta += wrongGuessCount;
  }

  // 3) Save round results & apply to gameState
  round.payouts = payouts;
  round.correctGuessers = allWagers
    .filter(w => {
      const amount = Math.max(0, parseInt(w.amount, 10) || 0);
      return amount > 0 && parseInt(w.guessedAuthorId, 10) === authorId;
    })
    .map(w => w.playerId);

  // We no longer use a pot, but keep a field for UI consistency
  round.pot = 0;

  applyRoundResults(authorId);
}

function applyRoundResults(authorId) {
  const round = gameState.currentRound;
  const scoreBefore = {};
  const scoreAfter = {};

  gameState.players.forEach(p => {
    const payout = round.payouts.find(x => x.playerId === p.id);
    scoreBefore[p.id] = p.score;
    p.score += payout ? payout.delta : 0;
    if (p.score < gameState.settings.minPoints) {
      p.score = gameState.settings.minPoints;
    }
    scoreAfter[p.id] = p.score;
  });

  round.scoreBefore = scoreBefore;
  round.scoreAfter = scoreAfter;

  // wins
  round.correctGuessers.forEach(pid => {
    const p = gameState.players.find(pl => pl.id === pid);
    if (p) p.wins++;
  });

  // collections
  round.collectionsThisRound = [];
  if (round.attraction) {
    round.correctGuessers.forEach(pid => {
      const p = gameState.players.find(pl => pl.id === pid);
      if (!p) return;
      if (!p.collected.includes(round.attraction.name)) {
        p.collected.push(round.attraction.name);
        round.collectionsThisRound.push(pid);
      }
    });
  }

  // history entry
  gameState.history.push({
    roundNumber: gameState.roundNumber,
    park: gameState.settings.park,
    land: round.attraction ? round.attraction.land : "",
    attraction: round.attraction ? round.attraction.name : "",
    question: round.question,
    questionType: round.questionType,
    selectedAnswerText: round.selectedAnswer.text,
    authorId,
    wagers: round.wagers,
    correctGuessers: round.correctGuessers,
    payouts: round.payouts,
    collectionsThisRound: round.collectionsThisRound,
    manualAdjustments: [],
    scoreBefore,
    scoreAfter
  });
}

// ---- Reveal animation -------------------------------------
function runRevealAnimation() {
  const round = gameState.currentRound;
  const author = gameState.players.find(
    p => p.id === round.selectedAnswer.playerId
  );
  const countEl = $("wsd-reveal-countdown");
  const authWrap = $("wsd-reveal-author-wrap");
  const authEl = $("wsd-reveal-author");
  const resultsEl = $("wsd-reveal-results");
  const nextWrap = $("wsd-reveal-next-wrap");

  $("wsd-reveal-question").textContent = round.question;
  $("wsd-reveal-answer-text").textContent =
    "“" + round.selectedAnswer.text + "”";

  authWrap.style.display = "none";
  resultsEl.innerHTML = "";
  nextWrap.style.display = "none";
  $("wsd-confetti-wrap").innerHTML = "";

  const steps = ["3", "2", "1"];
  steps.forEach((n, i) => {
    setTimeout(() => {
      countEl.textContent = n;
      countEl.classList.remove("wsd-anim-pop");
      void countEl.offsetWidth;
      countEl.classList.add("wsd-anim-pop");
    }, i * 700);
  });

  setTimeout(() => {
    countEl.textContent = "";
    authEl.textContent = author ? author.name : "Unknown";
    authWrap.style.display = "block";
    authWrap.classList.remove("wsd-anim-pop");
    void authWrap.offsetWidth;
    authWrap.classList.add("wsd-anim-pop");

    // Confetti only if someone got it right
    if (round.correctGuessers.length > 0) {
      spawnConfetti($("wsd-confetti-wrap"));
    } else {
      // No correct guessers: show modal explaining author gets the pot
      const line = $("wsd-no-correct-author-line");
      if (line) {
        const name = author ? author.name : "the author";
        const pot  = round.pot;
        line.textContent =
          name + " collects the full pot of " + pot + " points this round.";
      }
      try {
        const modalEl = $("modal-no-correct");
        if (modalEl && typeof bootstrap !== "undefined") {
          const m = new bootstrap.Modal(modalEl);
          setTimeout(() => m.show(), 400);
        }
      } catch (e) {}
    }

    round.payouts.forEach((payout, i) => {
      setTimeout(() => {
        const p = gameState.players.find(
          pl => pl.id === payout.playerId
        );
        const wager = round.wagers.find(
          w => w.playerId === payout.playerId
        );
        const guess =
          wager &&
          gameState.players.find(
            pl => pl.id === wager.guessedAuthorId
          );
        const ok = round.correctGuessers.includes(payout.playerId);
        const row = document.createElement("div");
        row.className = "wsd-result-row";
        row.style.animationDelay = i * 0.07 + "s";
        const deltaStr =
          (payout.delta >= 0 ? "+" : "") + payout.delta;
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
        resultsEl.appendChild(row);
      }, i * 120);
    });

    setTimeout(() => {
      nextWrap.style.display = "block";
    }, round.payouts.length * 120 + 300);
  }, 2100);
}

function spawnConfetti(container) {
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
    dot.style.left = Math.random() * 100 + "%";
    dot.style.top = Math.random() * -30 + "px";
    dot.style.background =
      colors[Math.floor(Math.random() * colors.length)];
    dot.style.animationDelay = Math.random() * 0.6 + "s";
    dot.style.animationDuration = 0.9 + Math.random() * 0.6 + "s";
    container.appendChild(dot);
  }
}

// ---- Scores screen ----------------------------------------
function renderScoresScreen() {
  const listEl = $("wsd-scores-list");
  listEl.innerHTML = "";
  const sorted = [...gameState.players].sort(
    (a, b) => b.score - a.score
  );
  sorted.forEach((p, i) => {
    const row = document.createElement("div");
    row.className = "wsd-score-row wsd-anim-fade-up";
    row.style.animationDelay = i * 0.05 + "s";
    row.innerHTML = `
      <div>
        <div class="wsd-score-name">${
          i === 0 ? "🥇 " : i === 1 ? "🥈 " : i === 2 ? "🥉 " : ""
        }${p.name}</div>
        <div class="wsd-score-meta">
          Wins: ${p.wins} · Attractions: ${p.collected.length}
        </div>
      </div>
      <div class="wsd-score-value">${p.score}</div>`;
    listEl.appendChild(row);
  });

  renderBonusProgress();
  renderManualAdjustmentsUI();
}

function renderBonusProgress() {
  const el = $("wsd-bonus-progress");
  const landsUsed = [
    ...new Set(gameState.history.map(h => h.land).filter(Boolean))
  ];
  const bpv = gameState.settings.bonusPointValue;
  const maxColl = Math.max(
    0,
    ...gameState.players.map(p => p.collected.length)
  );

  let html = "";
  gameState.players.forEach(p => {
    const landCounts = {};
    const landsOwned = new Set();
    p.collected.forEach(name => {
      const a = gameState.attractions.find(x => x.name === name);
      if (!a) return;
      landsOwned.add(a.land);
      landCounts[a.land] = (landCounts[a.land] || 0) + 1;
    });

    const A =
      landsUsed.length > 0 &&
      landsUsed.every(l => landsOwned.has(l))
        ? bpv
        : 0;
    let B = 0;
    Object.values(landCounts).forEach(c => {
      if (c >= 2) B += bpv;
    });
    const C =
      p.collected.length > 0 &&
      p.collected.length === maxColl
        ? bpv
        : 0;
    const total = A + B + C;

    html += `
      <div class="wsd-bonus-topic">
        <div class="wsd-bonus-topic-icon">🎯</div>
        <div>
          <div class="wsd-bonus-topic-title">
            ${p.name} — projected +${total} pts
          </div>
          <div class="wsd-bonus-topic-desc">
  🗺️ Lands covered:
  ${
    A > 0
      ? "✅"
      : landsUsed.length === 0
      ? "(no rounds yet)"
      : "❌ (" +
        [...landsOwned].length +
        " of " +
        landsUsed.length +
        " lands)"
  }<br/>
  ⭐ Deep lands: +${B}<br/>
  🏆 Top collector: ${C > 0 ? "✅" : "❌"}
</div>

        </div>
      </div>`;
  });
  el.innerHTML =
    html || "<div class='wsd-text-small'>No rounds played yet.</div>";
}

function renderManualAdjustmentsUI() {
  const container = $("wsd-manual-adjustments");
  container.innerHTML = "";
  gameState.players.forEach(p => {
    const row = document.createElement("div");
    row.className = "wsd-score-row";
    row.innerHTML = `
      <div class="wsd-score-name">${p.name}</div>
      <div>
        <button type="button"
          class="btn btn-sm btn-outline-secondary me-1"
          data-adj="-1" data-player="${p.id}">−1</button>
        <button type="button"
          class="btn btn-sm btn-outline-secondary me-1"
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
    last.manualAdjustments.push({
      playerId: pid,
      delta,
      note: "Manual"
    });
  }
  saveState();
  renderScoresScreen();
}

// ---- History screen ---------------------------------------
function renderHistoryScreen() {
  const container = $("wsd-history-list");
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
    if (h.park) html += ` — ${h.park}`;
    if (h.land) html += ` · ${h.land}`;
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
        wager &&
        gameState.players.find(x => x.id === wager.guessedAuthorId);
      const ok = h.correctGuessers.includes(pt.playerId);
      html += `<div class="wsd-text-small">
        &nbsp;&nbsp;${pl ? pl.name : "?"}: guess ${
        guess ? guess.name : "—"
      }, wager ${wager ? wager.amount : 0}, ${
        ok ? "✅" : "❌"
      }, ${pt.delta >= 0 ? "+" : ""}${pt.delta} pts
      </div>`;
    });
    if (h.manualAdjustments && h.manualAdjustments.length) {
      h.manualAdjustments.forEach(adj => {
        const pl = gameState.players.find(x => x.id === adj.playerId);
        html += `<div class="wsd-text-small">
          &nbsp;&nbsp;Manual: ${pl ? pl.name : "?"} ${
          adj.delta >= 0 ? "+" : ""
        }${adj.delta}
        </div>`;
      });
    }
    wrap.innerHTML = html;
    container.appendChild(wrap);
  });
}

// ---- Game end --------------------------------------------
function computeFinalBonusesAndShow() {
  const landsUsed = [
    ...new Set(gameState.history.map(h => h.land).filter(Boolean))
  ];
  const bpv = gameState.settings.bonusPointValue;
  gameState.players.forEach(p => {
    p.bonusTotal = 0;
  });

  gameState.players.forEach(p => {
    const landCounts = {};
    const landsOwned = new Set();
    p.collected.forEach(name => {
      const a = gameState.attractions.find(x => x.name === name);
      if (!a) return;
      landsOwned.add(a.land);
      landCounts[a.land] = (landCounts[a.land] || 0) + 1;
    });
    if (
      landsUsed.length > 0 &&
      landsUsed.every(l => landsOwned.has(l))
    ) {
      p.bonusTotal += bpv;
    }
    Object.values(landCounts).forEach(c => {
      if (c >= 2) p.bonusTotal += bpv;
    });
  });

  const maxColl = Math.max(
    0,
    ...gameState.players.map(p => p.collected.length)
  );
  gameState.players.forEach(p => {
    if (p.collected.length > 0 && p.collected.length === maxColl) {
      p.bonusTotal += bpv;
    }
  });

  gameState.players.forEach(p => {
    p.score += p.bonusTotal;
  });
  saveState();
  renderFinalResults();
}

function renderFinalResults() {
  const sorted = [...gameState.players].sort((a, b) =>
    b.score === a.score ? b.wins - a.wins : b.score - a.score
  );
  const topScore = sorted[0].score;
  const topWins = sorted[0].wins;
  const winners = sorted.filter(
    p => p.score === topScore && p.wins === topWins
  );

  const banner = $("wsd-winner-banner");
  banner.innerHTML = `🎉 ${winners
    .map(w => w.name)
    .join(" & ")} wins! Time to collect that snack!`;
  banner.classList.remove("wsd-anim-pop");
  void banner.offsetWidth;
  banner.classList.add("wsd-anim-pop");

  spawnConfetti($("wsd-confetti-wrap-end"));

  const container = $("wsd-final-results");
  container.innerHTML = "";
  sorted.forEach((p, i) => {
    const row = document.createElement("div");
    row.className = "wsd-score-row wsd-anim-fade-up";
    row.style.animationDelay = i * 0.08 + "s";
    row.innerHTML = `
      <div>
        <div class="wsd-score-name">${
          i === 0 ? "🥇 " : i === 1 ? "🥈 " : i === 2 ? "🥉 " : ""
        }${p.name}</div>
        <div class="wsd-score-meta">
          Wins: ${p.wins} · Attractions: ${p.collected.length}
          · Bonus: +${p.bonusTotal}
        </div>
      </div>
      <div class="wsd-score-value">${p.score}</div>`;
    container.appendChild(row);
  });
}

function abandonRound() {
  if (gameState)
    gameState.roundNumber = Math.max(0, gameState.roundNumber - 1);
  startNewRoundCore();
  if (gameState && gameState.history.length > 0) {
    renderScoresScreen();
    showScreen("scores");
  } else {
    showScreen("setup-question");
    startNewRoundCore();
  }
}

// ---- Event wiring -----------------------------------------
function wireEvents() {
  debugLog("wireEvents starting");
  // Setup
  $("wsd-start-game").addEventListener("click", startGameFromSetup);
  $("wsd-reset-setup").addEventListener("click", () => {
    $("wsd-setup-error").textContent = "";
    $("wsd-park-select").value = "";
    $("wsd-bonus-value").value = "1";
    const inputs = document.querySelectorAll("#wsd-player-inputs input");
    inputs.forEach((el, i) => {
      if (i < 3) el.value = "";
      else el.remove();
    });
  });
  $("wsd-add-player").addEventListener("click", () => {
    const c = $("wsd-player-inputs");
    if (c.querySelectorAll("input").length >= 8) return;
    addPlayerInput(c);
  });
  
    // Park select → update theme + label immediately
  $("wsd-park-select").addEventListener("change", () => {
    const name = $("wsd-park-select").value;
    $("wsd-park-label").textContent = name || "Not set";
    applyParkTheme(name);
  });


  // Setup question
  $("wsd-attraction-select").addEventListener(
    "change",
    onAttractionChange
  );
  $("wsd-generate-question").addEventListener(
    "click",
    onGenerateNewQuestion
  );
  $("wsd-enter-custom-question").addEventListener(
    "click",
    onEnterCustomQuestion
  );
  $("wsd-to-answers").addEventListener("click", proceedToAnswers);
  $("wsd-abandon-from-setupq").addEventListener(
    "click",
    abandonRound
  );

  // Enter answers
  $("wsd-save-answer").addEventListener("click", () =>
    saveAnswerForCurrentPlayer(false)
  );
  $("wsd-skip-player").addEventListener("click", () =>
    saveAnswerForCurrentPlayer(true)
  );
  $("wsd-abandon-from-answers").addEventListener(
    "click",
    abandonRound
  );

  // Select answer
$("wsd-select-again").addEventListener("click", () => {
  // Replay the loading flourish, then pick a new answer
  showPickOverlay(() => {
    pickRandomAnswer();
    renderSelectAnswerScreen();
    saveState();
  });
});

  $("wsd-to-wagers").addEventListener("click", goToGuessWager);
  $("wsd-abandon-from-select").addEventListener(
    "click",
    abandonRound
  );

  // Guess & wager
  $("wsd-lock-wagers").addEventListener("click", lockWagers);
  $("wsd-clear-wagers").addEventListener("click", clearWagersUI);
  $("wsd-abandon-from-gw").addEventListener("click", abandonRound);

  // Reveal → scores
  $("wsd-to-scores").addEventListener("click", () => {
    renderScoresScreen();
    showScreen("scores");
  });

  // Scores
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

  // Game end
  $("wsd-view-history-end").addEventListener("click", () => {
    renderHistoryScreen();
    showScreen("history");
  });
  $("wsd-play-again").addEventListener("click", () => {
    localStorage.removeItem("whoSaidDiz");
    location.reload();
  });

  // History
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

  // Bottom nav
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
    showScreen(
      roundScreens.includes(gameState.screen)
        ? gameState.screen
        : "setup-question"
    );
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

// ---- Bootstrap --------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  debugLog("DOMContentLoaded fired");
  initSetupScreen();
  wireEvents();
  loadState();
  debugLog("loadState ran; gameState present? " + !!gameState);

  if (gameState) {
  const parkName = gameState.settings?.park || "Not set";
  $("wsd-park-label").textContent = parkName;
  applyParkTheme(parkName);          // <-- add this
  renderAttractionOptions();
  const scr = gameState.screen || "setup-game";
  // ...

    if (scr === "scores") renderScoresScreen();
    if (scr === "game-end") renderFinalResults();
    if (scr === "history") renderHistoryScreen();
    if (scr === "reveal") runRevealAnimation();
    showScreen(scr);
    debugLog("Resumed existing game on screen: " + scr);
  } else {
    showScreen("setup-game");
    debugLog("No saved game; showing setup-game");
    try {
      const modal = new bootstrap.Modal($("modal-welcome"));
      modal.show();
    } catch (e) {
      debugLog("Bootstrap modal error: " + e.message);
    }
  }
});
