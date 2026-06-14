// ==== Data registry (parks) ====

const PARKS = {};

if (typeof PARK_MAGIC_KINGDOM !== "undefined") {
  PARKS[PARK_MAGIC_KINGDOM.name] = PARK_MAGIC_KINGDOM;
}

// Later you can add:
// if (typeof PARK_EPCOT !== "undefined") PARKS[PARK_EPCOT.name] = PARK_EPCOT;


// ==== Game state ====

let gameState = null;

const DEFAULT_SETTINGS = {
  startingPoints: 10,
  minPoints: 3
};


// ==== Utility helpers ====

function $(id) {
  return document.getElementById(id);
}

function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function saveState() {
  if (!gameState) return;
  try {
    localStorage.setItem("whoSaidDiz", JSON.stringify(gameState));
  } catch (e) {
    // ignore if storage not available
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem("whoSaidDiz");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    gameState = parsed;
  } catch (e) {
    gameState = null;
  }
}


// ==== Screen navigation ====

const screens = [
  "setup-game",
  "setup-question",
  "enter-answers",
  "select-answer",
  "guess-wager",
  "reveal",
  "scores",
  "game-end",
  "history"
];

function showScreen(name) {
  screens.forEach(key => {
    const el = $("screen-" + key);
    if (!el) return;
    if (key === name) {
      el.classList.add("wsd-screen-active");
    } else {
      el.classList.remove("wsd-screen-active");
    }
  });

  if (gameState) {
    gameState.screen = name;
    saveState();
  }

  // Bottom nav highlighting (coarse)
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

  document
    .querySelectorAll(".wsd-nav-item")
    .forEach(btn => btn.classList.remove("wsd-nav-item-active"));

  const activeNavId = navMap[name];
  if (activeNavId) {
    $(activeNavId).classList.add("wsd-nav-item-active");
  }
}


// ==== Initialization ====

function initSetupScreen() {
  // Populate park select
  const parkSelect = $("wsd-park-select");
  Object.keys(PARKS).forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    parkSelect.appendChild(opt);
  });

  // Seed three player inputs
  const container = $("wsd-player-inputs");
  for (let i = 0; i < 3; i++) {
    addPlayerInput(container);
  }
}

function addPlayerInput(container) {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "form-control wsd-form-control wsd-player-input";
  input.placeholder = "Player name";
  container.appendChild(input);
}


// ==== Starting a game ====

function startGameFromSetup() {
  const parkName = $("wsd-park-select").value;
  const errorEl = $("wsd-setup-error");
  errorEl.textContent = "";

  if (!parkName || !PARKS[parkName]) {
    errorEl.textContent = "Please select a park.";
    return;
  }

  const playerInputs = Array.from(
    document.querySelectorAll("#wsd-player-inputs input")
  );
  const names = playerInputs
    .map(i => i.value.trim())
    .filter(name => name.length > 0);

  if (names.length < 3) {
    errorEl.textContent = "Please enter at least three player names.";
    return;
  }

  const tableStakes =
    document.querySelector('input[name="wsd-table-stakes"]:checked').value ===
    "yes";

  let bonusPointValue = parseInt($("wsd-bonus-value").value, 10);
  if (Number.isNaN(bonusPointValue) || bonusPointValue < 0) {
    bonusPointValue = 1;
  }

  const parkData = PARKS[parkName];

  // Build initial players
  const players = names.map((name, index) => ({
    id: index,
    name,
    score: DEFAULT_SETTINGS.startingPoints,
    wins: 0,
    collected: [],
    bonusTotal: 0
  }));

  // Prepare usedQuestions as shuffled arrays
  const usedQuestions = {
    attractions: {},
    generic: shuffle(parkData.genericQuestions),
    genericIndex: 0
  };

  parkData.attractions.forEach(attr => {
    usedQuestions.attractions[attr.name] = {
      questions: shuffle(attr.questions),
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
      startingPoints: DEFAULT_SETTINGS.startingPoints,
      minPoints: DEFAULT_SETTINGS.minPoints
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
  $("wsd-player-summary").textContent = players.length + " players";

  // Fill attraction select
  renderAttractionOptions();

  saveState();
  showScreen("setup-question");
  startNewRoundCore();
}

function renderAttractionOptions() {
  const select = $("wsd-attraction-select");
  select.innerHTML = '<option value="">Select an attraction</option>';

  if (!gameState) return;
  gameState.attractions.forEach((a, idx) => {
    const opt = document.createElement("option");
    opt.value = String(idx);
    opt.textContent = a.name;
    select.appendChild(opt);
  });
}


// ==== Round lifecycle ====

function startNewRoundCore() {
  if (!gameState) return;
  gameState.roundNumber += 1;
  gameState.currentRound = {
    attraction: null,
    question: "",
    questionType: "",
    answers: [],
    selectedAnswer: null,
    houseBonusAmount: 0,
    wagers: [],
    pot: 0,
    correctGuessers: [],
    payouts: []
  };
  saveState();
  $("wsd-house-bonus").value = "0";
  $("wsd-question-text").readOnly = true;
  $("wsd-question-text").value = "";
  $("wsd-question-type-badge").textContent = "";
  $("wsd-attraction-select").value = "";
  $("wsd-attraction-meta").textContent = "";
  $("wsd-setupq-error").textContent = "";
}

function onAttractionChange() {
  if (!gameState) return;
  const idx = parseInt($("wsd-attraction-select").value, 10);
  const metaEl = $("wsd-attraction-meta");
  const qText = $("wsd-question-text");
  const badge = $("wsd-question-type-badge");
  metaEl.textContent = "";
  qText.value = "";
  badge.textContent = "";

  if (Number.isNaN(idx) || !gameState.attractions[idx]) {
    gameState.currentRound.attraction = null;
    gameState.currentRound.question = "";
    return;
  }

  const attraction = gameState.attractions[idx];
  gameState.currentRound.attraction = attraction;

  metaEl.textContent = `${attraction.park} • ${attraction.land}`;

  const { q, type } = drawQuestionForAttraction(attraction);
  gameState.currentRound.question = q;
  gameState.currentRound.questionType = type;
  qText.value = q;
  badge.textContent =
    type === "attraction"
      ? "Attraction question"
      : type === "generic"
      ? "Generic question"
      : "Custom";
  saveState();
}

function drawQuestionForAttraction(attraction) {
  const uq = gameState.usedQuestions;
  const entry = uq.attractions[attraction.name];

  if (entry && entry.index < entry.questions.length) {
    const q = entry.questions[entry.index];
    entry.index += 1;
    return { q, type: "attraction" };
  }

  // use generic
  if (uq.genericIndex < uq.generic.length) {
    const q = uq.generic[uq.genericIndex];
    uq.genericIndex += 1;
    return { q, type: "generic" };
  }

  // fallback: allow repeat generic
  if (gameState.genericQuestions.length > 0) {
    const q =
      gameState.genericQuestions[
        Math.floor(Math.random() * gameState.genericQuestions.length)
      ];
    return { q, type: "generic" };
  }

  return { q: "No questions available.", type: "generic" };
}

function onGenerateNewQuestion() {
  if (!gameState || !gameState.currentRound.attraction) {
    $("wsd-setupq-error").textContent =
      "Select an attraction before generating a question.";
    return;
  }
  $("wsd-setupq-error").textContent = "";
  const { q, type } = drawQuestionForAttraction(gameState.currentRound.attraction);
  gameState.currentRound.question = q;
  gameState.currentRound.questionType = type;
  $("wsd-question-text").value = q;
  $("wsd-question-type-badge").textContent =
    type === "attraction"
      ? "Attraction question"
      : type === "generic"
      ? "Generic question"
      : "Custom";
  saveState();
}

function onEnterCustomQuestion() {
  $("wsd-question-text").readOnly = false;
  $("wsd-question-text").value = "";
  $("wsd-question-type-badge").textContent = "Custom question";
  gameState.currentRound.questionType = "custom";
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
  saveState();

  $("wsd-enter-question").textContent = q;
  $("wsd-answer-input").value = "";
  gameState.currentRound.answerIndex = 0;

  renderAnswerProgress();
  renderCurrentAnswerPlayer();
  showScreen("enter-answers");
}

function renderAnswerProgress() {
  const idx = gameState.currentRound.answerIndex || 0;
  const total = gameState.players.length;
  $("wsd-answer-progress").textContent = `Player ${idx + 1} of ${total}`;
}

function renderCurrentAnswerPlayer() {
  const idx = gameState.currentRound.answerIndex || 0;
  const p = gameState.players[idx];
  $("wsd-current-player-label").textContent = `Answer: ${p.name}`;
}

function saveAnswerForCurrentPlayer(skip) {
  const idx = gameState.currentRound.answerIndex || 0;
  const player = gameState.players[idx];
  const text = $("wsd-answer-input").value.trim();
  $("wsd-answers-error").textContent = "";

  if (!skip && !text) {
    $("wsd-answers-error").textContent = "Please enter an answer or skip.";
    return;
  }

  if (!skip) {
    gameState.currentRound.answers.push({
      playerId: player.id,
      text
    });
  }

  // advance
  $("wsd-answer-input").value = "";
  gameState.currentRound.answerIndex = idx + 1;

  if (gameState.currentRound.answerIndex >= gameState.players.length) {
    // done
    if (gameState.currentRound.answers.length === 0) {
      $("wsd-answers-error").textContent =
        "No answers were entered. Abandon or go back.";
      return;
    }
    selectRandomAnswer();
    showScreen("select-answer");
    renderSelectAnswerScreen();
    saveState();
  } else {
    renderAnswerProgress();
    renderCurrentAnswerPlayer();
  }
}

function selectRandomAnswer() {
  const answers = gameState.currentRound.answers;
  const choice = answers[Math.floor(Math.random() * answers.length)];
  gameState.currentRound.selectedAnswer = choice;
}

function renderSelectAnswerScreen() {
  $("wsd-select-question").textContent = gameState.currentRound.question;
  $("wsd-selected-answer").textContent =
    gameState.currentRound.selectedAnswer.text;
}


// ==== Guess & wager ====

function goToGuessWager() {
  $("wsd-gw-error").textContent = "";
  $("wsd-house-bonus").value =
    gameState.currentRound.houseBonusAmount.toString() || "0";
  $("wsd-gw-question").textContent = gameState.currentRound.question;
  $("wsd-gw-answer").textContent =
    "Selected answer: " + gameState.currentRound.selectedAnswer.text;

  const container = $("wsd-gw-players");
  container.innerHTML = "";

  gameState.players.forEach(p => {
    const row = document.createElement("div");
    row.className = "mb-2";

    const label = document.createElement("div");
    label.className = "wsd-score-row";
    label.innerHTML = `
      <div>
        <div class="wsd-score-name">${p.name}</div>
        <div class="wsd-score-meta">Score: ${p.score}</div>
      </div>
    `;
    row.appendChild(label);

    const rowInner = document.createElement("div");
    rowInner.className = "d-flex gap-2";

    const guessSel = document.createElement("select");
    guessSel.className = "form-select wsd-form-select";
    guessSel.dataset.playerId = p.id;
    gameState.players.forEach(p2 => {
      const opt = document.createElement("option");
      opt.value = p2.id;
      opt.textContent = p2.name;
      guessSel.appendChild(opt);
    });

    const wagerInput = document.createElement("input");
    wagerInput.type = "number";
    wagerInput.min = 0;
    wagerInput.max = p.score;
    wagerInput.value = 0;
    wagerInput.className = "form-control wsd-form-control";
    wagerInput.dataset.playerId = p.id;

    rowInner.appendChild(guessSel);
    rowInner.appendChild(wagerInput);
    row.appendChild(rowInner);

    container.appendChild(row);
  });

  showScreen("guess-wager");
}

function clearWagersUI() {
  document
    .querySelectorAll("#wsd-gw-players select, #wsd-gw-players input")
    .forEach(el => {
      if (el.tagName === "SELECT") {
        el.selectedIndex = 0;
      } else {
        el.value = "0";
      }
    });
  $("wsd-house-bonus").value = "0";
}

function lockWagers() {
  const err = $("wsd-gw-error");
  err.textContent = "";
  const tableStakes = gameState.settings.tableStakes;

  let houseBonus = parseInt($("wsd-house-bonus").value, 10);
  if (Number.isNaN(houseBonus) || houseBonus < 0) houseBonus = 0;

  const wagers = [];
  document
    .querySelectorAll("#wsd-gw-players select")
    .forEach(guessSel => {
      const playerId = parseInt(guessSel.dataset.playerId, 10);
      const wagerInput = document.querySelector(
        `#wsd-gw-players input[data-player-id="${playerId}"]`
      );
      let amount = parseInt(wagerInput.value, 10);
      if (Number.isNaN(amount) || amount < 0) amount = 0;
      const player = gameState.players.find(p => p.id === playerId);
      if (amount > player.score) amount = player.score;

      wagers.push({
        playerId,
        guessedAuthorId: parseInt(guessSel.value, 10),
        amount
      });
    });

  // enforce participation rules
  let participants = [];
  if (tableStakes) {
    const max = Math.max(...wagers.map(w => w.amount));
    if (max <= 0) {
      err.textContent =
        "At least two players must wager more than 0 to play this round.";
      return;
    }
    participants = wagers.filter(w => w.amount === max);
    if (participants.length < 2) {
      err.textContent =
        "At least two players must match the top bet to play this round.";
      return;
    }
    // zero out non-participants
    wagers.forEach(w => {
      if (w.amount !== max) w.amount = 0;
    });
  } else {
    participants = wagers.filter(w => w.amount > 0);
    if (participants.length < 2) {
      err.textContent =
        "At least two players must wager more than 0 to play this round.";
      return;
    }
  }

  // store house bonus and wagers
  gameState.currentRound.houseBonusAmount = houseBonus;
  gameState.currentRound.wagers = wagers;

  // go to reveal (and compute scoring)
  computeRevealAndScoring();
  showScreen("reveal");
  renderRevealScreen();
  saveState();
}


// ==== Scoring & reveal ====

function computeRevealAndScoring() {
  const round = gameState.currentRound;
  const authorId = round.selectedAnswer.playerId;
  const tableStakes = gameState.settings.tableStakes;

  const allWagers = round.wagers;

  let participants;
  if (tableStakes) {
    const max = Math.max(...allWagers.map(w => w.amount));
    participants = allWagers.filter(w => w.amount === max && w.amount > 0);
  } else {
    participants = allWagers.filter(w => w.amount > 0);
  }

  const pot =
    participants.reduce((sum, w) => sum + w.amount, 0) +
    round.houseBonusAmount;

  // Correct guessers among participants
  const correct = participants.filter(
    w => w.guessedAuthorId === authorId
  );
  round.correctGuessers = correct.map(w => w.playerId);

  const payouts = [];
  if (correct.length === 0) {
    // Everyone loses their wager, author gets full pot
    gameState.players.forEach(p => {
      const wagerEntry = participants.find(w => w.playerId === p.id);
      let delta = 0;
      if (wagerEntry) {
        delta -= wagerEntry.amount;
      }
      if (p.id === authorId) {
        delta += pot;
      }
      payouts.push({ playerId: p.id, delta });
    });
  } else {
    const share = Math.floor(pot / correct.length);
    const remainder = pot - share * correct.length;
    const firstCorrectId = correct[0].playerId;

    gameState.players.forEach(p => {
      const wagerEntry = participants.find(w => w.playerId === p.id);
      let delta = 0;
      if (wagerEntry) {
        // everyone who participated loses their wager
        delta -= wagerEntry.amount;
      }

      if (correct.some(w => w.playerId === p.id)) {
        // correct guesser gets equal share (+ remainder if first)
        const bonus = p.id === firstCorrectId ? remainder : 0;
        delta += share + bonus;
      }

      payouts.push({ playerId: p.id, delta });
    });
  }

  round.pot = pot;
  round.payouts = payouts;

  // apply deltas and minimum points, and track wins/collections
  applyRoundResults(authorId);
}

function applyRoundResults(authorId) {
  const round = gameState.currentRound;

  // snapshot scores before
  const scoreBefore = {};
  const scoreAfter = {};

  // update players
  gameState.players.forEach(p => {
    const payout = round.payouts.find(x => x.playerId === p.id);
    const delta = payout ? payout.delta : 0;
    scoreBefore[p.id] = p.score;
    p.score += delta;

    // minimum
    if (p.score < gameState.settings.minPoints) {
      p.score = gameState.settings.minPoints;
    }

    scoreAfter[p.id] = p.score;
  });

  round.scoreBefore = scoreBefore;
  round.scoreAfter = scoreAfter;

  // wins (correct guesses)
  round.correctGuessers.forEach(pid => {
    const p = gameState.players.find(pl => pl.id === pid);
    if (p) p.wins += 1;
  });

  // collection: any correct guesser collects the attraction
  if (round.attraction) {
    round.collectionsThisRound = [];
    round.correctGuessers.forEach(pid => {
      const p = gameState.players.find(pl => pl.id === pid);
      if (!p) return;
      if (!p.collected.includes(round.attraction.name)) {
        p.collected.push(round.attraction.name);
        round.collectionsThisRound.push(pid);
      }
    });
  } else {
    round.collectionsThisRound = [];
  }

  // push to history
  const histEntry = {
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
  };
  gameState.history.push(histEntry);
  saveState();
}

function renderRevealScreen() {
  const round = gameState.currentRound;
  const author = gameState.players.find(
    p => p.id === round.selectedAnswer.playerId
  );
  $("wsd-reveal-question").textContent = round.question;
  $("wsd-reveal-answer").textContent =
    "Selected answer: " + round.selectedAnswer.text;

  const countdownEl = $("wsd-reveal-countdown");
  const authorEl = $("wsd-reveal-author");
  const resultsEl = $("wsd-reveal-results");

  countdownEl.textContent = "3...";
  authorEl.textContent = "";
  resultsEl.innerHTML = "";

  setTimeout(() => {
    countdownEl.textContent = "2...";
  }, 700);
  setTimeout(() => {
    countdownEl.textContent = "1...";
  }, 1400);
  setTimeout(() => {
    countdownEl.textContent = "";
    authorEl.textContent = "Author: " + (author ? author.name : "Unknown");

    // render results
    const table = document.createElement("div");
    round.payouts.forEach(payout => {
      const p = gameState.players.find(pl => pl.id === payout.playerId);
      const wagerEntry = round.wagers.find(w => w.playerId === payout.playerId);
      const guessName =
        wagerEntry &&
        gameState.players.find(pl => pl.id === wagerEntry.guessedAuthorId);
      const correct = round.correctGuessers.includes(payout.playerId);

      const row = document.createElement("div");
      row.className = "wsd-score-row";
      row.innerHTML = `
        <div>
          <div class="wsd-score-name">${p.name}</div>
          <div class="wsd-score-meta">
            Guess: ${guessName ? guessName.name : "-"},
            Wager: ${wagerEntry ? wagerEntry.amount : 0},
            ${correct ? "Correct" : "Wrong"}
          </div>
        </div>
        <div class="wsd-score-value ${
          payout.delta >= 0 ? "text-success" : "text-danger"
        }">
          ${payout.delta >= 0 ? "+" : ""}${payout.delta}
        </div>
      `;
      table.appendChild(row);
    });
    resultsEl.appendChild(table);
  }, 2100);
}


// ==== Scores screen ==== 

function renderScoresScreen() {
  const listEl = $("wsd-scores-list");
  listEl.innerHTML = "";

  // sort players by score desc
  const playersSorted = [...gameState.players].sort(
    (a, b) => b.score - a.score
  );

  playersSorted.forEach(p => {
    const row = document.createElement("div");
    row.className = "wsd-score-row";
    row.innerHTML = `
      <div>
        <div class="wsd-score-name">${p.name}</div>
        <div class="wsd-score-meta">
          Wins: ${p.wins} • Attractions: ${p.collected.length}
        </div>
      </div>
      <div class="wsd-score-value">${p.score}</div>
    `;
    listEl.appendChild(row);
  });

  renderBonusProgress();
  renderManualAdjustmentsUI();
}

function renderBonusProgress() {
  const bonusEl = $("wsd-bonus-progress");
  const landsUsed = [
    ...new Set(gameState.history.map(h => h.land).filter(Boolean))
  ];
  const bpv = gameState.settings.bonusPointValue;

  // compute projected bonuses
  const projections = computeProjectedBonuses(landsUsed, bpv);

  let html = "";
  projections.forEach(entry => {
    html += `<div><strong>${entry.name}</strong>: projected +${entry.totalBonus} (A:${entry.A}, B:${entry.B}, C:${entry.C})</div>`;
  });
  bonusEl.innerHTML = html || "No rounds yet.";
}

function computeProjectedBonuses(landsUsed, bonusPointValue) {
  const results = [];

  // counts for most attractions
  const maxCollected = Math.max(
    0,
    ...gameState.players.map(p => p.collected.length)
  );

  gameState.players.forEach(p => {
    // map attraction name -> land
    const landCounts = {};
    const landsOwned = new Set();
    p.collected.forEach(name => {
      const attr = gameState.attractions.find(a => a.name === name);
      if (!attr) return;
      landsOwned.add(attr.land);
      landCounts[attr.land] = (landCounts[attr.land] || 0) + 1;
    });

    // A: at least one in every land used
    let A = 0;
    if (
      landsUsed.length > 0 &&
      landsUsed.every(l => landsOwned.has(l))
    ) {
      A = bonusPointValue;
    }

    // B: per land with 2+ attractions
    let B = 0;
    Object.values(landCounts).forEach(count => {
      if (count >= 2) B += bonusPointValue;
    });

    // C: most attractions overall
    let C = 0;
    if (p.collected.length > 0 && p.collected.length === maxCollected) {
      C = bonusPointValue;
    }

    results.push({
      name: p.name,
      A,
      B,
      C,
      totalBonus: A + B + C
    });
  });

  return results;
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
        <button type="button" class="btn btn-sm btn-outline-secondary me-1" data-adj="-1" data-player="${p.id}">-1</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" data-adj="1" data-player="${p.id}">+1</button>
      </div>
    `;
    container.appendChild(row);
  });

  container.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const delta = parseInt(btn.dataset.adj, 10);
      const pid = parseInt(btn.dataset.player, 10);
      adjustPlayerScore(pid, delta);
    });
  });
}

function adjustPlayerScore(playerId, delta) {
  const p = gameState.players.find(pl => pl.id === playerId);
  if (!p) return;
  p.score += delta;
  if (p.score < gameState.settings.minPoints) {
    p.score = gameState.settings.minPoints;
  }

  // record in last history entry if exists
  if (gameState.history.length > 0) {
    const last = gameState.history[gameState.history.length - 1];
    last.manualAdjustments = last.manualAdjustments || [];
    last.manualAdjustments.push({
      playerId,
      delta,
      note: "Manual"
    });
  }

  saveState();
  renderScoresScreen();
}


// ==== History ====

function renderHistoryScreen() {
  const container = $("wsd-history-list");
  container.innerHTML = "";

  if (!gameState.history.length) {
    container.textContent = "No rounds played yet.";
    return;
  }

  gameState.history.forEach(h => {
    const author =
      gameState.players.find(p => p.id === h.authorId) || {};
    const wrapper = document.createElement("div");
    wrapper.className = "mb-3";

    let html = `<div><strong>Round ${h.roundNumber}</strong> — ${h.park}`;
    if (h.land || h.attraction) {
      html += ` • ${h.land || ""} • ${h.attraction || ""}`;
    }
    html += `</div>`;
    html += `<div>Q: ${h.question}</div>`;
    html += `<div>Answer: ${h.selectedAnswerText}</div>`;
    html += `<div>Author: ${author.name || "Unknown"}</div>`;

    html += `<div class="wsd-mt-1">Results:</div>`;
    h.payouts.forEach(pt => {
      const p = gameState.players.find(pl => pl.id === pt.playerId);
      const wager = h.wagers.find(w => w.playerId === pt.playerId);
      const guess =
        wager &&
        gameState.players.find(pl => pl.id === wager.guessedAuthorId);
      const correct = h.correctGuessers.includes(pt.playerId);
      html += `<div class="wsd-text-small">
        ${p.name}: guess ${guess ? guess.name : "-"}, wager ${
        wager ? wager.amount : 0
      }, ${correct ? "correct" : "wrong"}, delta ${
        pt.delta >= 0 ? "+" : ""
      }${pt.delta}
      </div>`;
    });

    if (h.manualAdjustments && h.manualAdjustments.length) {
      html += `<div class="wsd-text-small wsid-mt-1">Manual adjustments:</div>`;
      h.manualAdjustments.forEach(adj => {
        const p = gameState.players.find(pl => pl.id === adj.playerId);
        html += `<div class="wsd-text-small">
          ${p ? p.name : "Player"}: ${
          adj.delta >= 0 ? "+" : ""
        }${adj.delta} (${adj.note})
        </div>`;
      });
    }

    wrapper.innerHTML = html;
    container.appendChild(wrapper);
  });
}


// ==== Game end ====

function computeFinalBonusesAndShow() {
  const landsUsed = [
    ...new Set(gameState.history.map(h => h.land).filter(Boolean))
  ];
  const bpv = gameState.settings.bonusPointValue;

  // reset any previous bonusTotal
  gameState.players.forEach(p => {
    p.bonusTotal = 0;
  });

  // A and B per player
  gameState.players.forEach(p => {
    const landCounts = {};
    const landsOwned = new Set();

    p.collected.forEach(name => {
      const attr = gameState.attractions.find(a => a.name === name);
      if (!attr) return;
      landsOwned.add(attr.land);
      landCounts[attr.land] = (landCounts[attr.land] || 0) + 1;
    });

    // A: at least one in every land used
    if (
      landsUsed.length > 0 &&
      landsUsed.every(l => landsOwned.has(l))
    ) {
      p.bonusTotal += bpv;
    }

    // B: per land with 2+ attractions
    Object.values(landCounts).forEach(count => {
      if (count >= 2) p.bonusTotal += bpv;
    });
  });

  // C: most attractions overall
  const maxCollected = Math.max(
    0,
    ...gameState.players.map(p => p.collected.length)
  );
  gameState.players.forEach(p => {
    if (p.collected.length > 0 && p.collected.length === maxCollected) {
      p.bonusTotal += bpv;
    }
  });

  // apply bonuses to scores
  gameState.players.forEach(p => {
    p.score += p.bonusTotal;
  });

  saveState();
  renderFinalResults();
}

function renderFinalResults() {
  const container = $("wsd-final-results");
  container.innerHTML = "";

  // sort players by score desc, then wins desc
  const playersSorted = [...gameState.players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.wins - a.wins;
  });

  const topScore = playersSorted[0].score;
  const topWins = playersSorted[0].wins;

  // determine winners (could be co-winners)
  const winners = playersSorted.filter(
    p => p.score === topScore && p.wins === topWins
  );

  let html = "";
  html += `<div class="mb-3"><strong>Winner${
    winners.length > 1 ? "s" : ""
  }:</strong> ${winners.map(w => w.name).join(", ")}</div>`;

  playersSorted.forEach(p => {
    html += `<div class="wsd-score-row">
      <div>
        <div class="wsd-score-name">${p.name}</div>
        <div class="wsd-score-meta">
          Wins: ${p.wins},
          Attractions: ${p.collected.length},
          Bonuses: +${p.bonusTotal}
        </div>
      </div>
      <div class="wsd-score-value">${p.score}</div>
    </div>`;
  });

  container.innerHTML = html;
}


// ==== Event wiring ====

function wireEvents() {
  // Setup
  $("wsd-start-game").addEventListener("click", startGameFromSetup);
  $("wsd-reset-setup").addEventListener("click", () => {
    $("wsd-setup-error").textContent = "";
    $("wsd-park-select").value = "";
    $("wsd-bonus-value").value = "1";
    document.querySelectorAll("#wsd-player-inputs input").forEach((el, idx) => {
      el.value = "";
      if (idx >= 3) el.remove();
    });
  });
  $("wsd-add-player").addEventListener("click", () => {
    const container = $("wsd-player-inputs");
    if (container.querySelectorAll("input").length >= 8) return;
    addPlayerInput(container);
  });

  // Setup question
  $("wsd-attraction-select").addEventListener("change", onAttractionChange);
  $("wsd-generate-question").addEventListener("click", onGenerateNewQuestion);
  $("wsd-enter-custom-question").addEventListener("click", onEnterCustomQuestion);
  $("wsd-to-answers").addEventListener("click", proceedToAnswers);
  $("wsd-abandon-from-setupq").addEventListener("click", () => {
    startNewRoundCore();
    showScreen("scores");
    renderScoresScreen();
  });

  // Enter answers
  $("wsd-save-answer").addEventListener("click", () =>
    saveAnswerForCurrentPlayer(false)
  );
  $("wsd-skip-player").addEventListener("click", () =>
    saveAnswerForCurrentPlayer(true)
  );
  $("wsd-abandon-from-answers").addEventListener("click", () => {
    startNewRoundCore();
    showScreen("scores");
    renderScoresScreen();
  });

  // Select answer
  $("wsd-select-again").addEventListener("click", () => {
    selectRandomAnswer();
    renderSelectAnswerScreen();
    saveState();
  });
  $("wsd-to-wagers").addEventListener("click", goToGuessWager);
  $("wsd-abandon-from-select").addEventListener("click", () => {
    startNewRoundCore();
    showScreen("scores");
    renderScoresScreen();
  });

  // Guess & wager
  $("wsd-lock-wagers").addEventListener("click", lockWagers);
  $("wsd-clear-wagers").addEventListener("click", clearWagersUI);
  $("wsd-abandon-from-gw").addEventListener("click", () => {
    startNewRoundCore();
    showScreen("scores");
    renderScoresScreen();
  });

  // Reveal
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
    gameState = null;
    location.reload();
  });

  // Game end
  $("wsd-view-history-end").addEventListener("click", () => {
    renderHistoryScreen();
    showScreen("history");
  });
  $("wsd-play-again").addEventListener("click", () => {
    localStorage.removeItem("whoSaidDiz");
    gameState = null;
    location.reload();
  });

  // History
  $("wsd-close-history").addEventListener("click", () => {
    const fallback = gameState ? gameState.screen || "scores" : "setup-game";
    showScreen(fallback === "history" ? "scores" : fallback);
  });

  // Bottom nav
  $("wsd-nav-home").addEventListener("click", () => showScreen("setup-game"));
  $("wsd-nav-round").addEventListener("click", () => {
    if (!gameState) showScreen("setup-game");
    else showScreen("setup-question");
  });
  $("wsd-nav-scores").addEventListener("click", () => {
    if (!gameState) showScreen("setup-game");
    else {
      renderScoresScreen();
      showScreen("scores");
    }
  });
  $("wsd-nav-history").addEventListener("click", () => {
    if (!gameState) showScreen("setup-game");
    else {
      renderHistoryScreen();
      showScreen("history");
    }
  });
}


// ==== Bootstrapping ====

document.addEventListener("DOMContentLoaded", () => {
  initSetupScreen();
  wireEvents();
  loadState();

  if (gameState) {
    $("wsd-park-label").textContent = gameState.settings.park || "No park";
    $("wsd-player-summary").textContent =
      gameState.players.length + " players";
    renderAttractionOptions();

    if (gameState.screen === "scores") {
      renderScoresScreen();
    } else if (gameState.screen === "reveal") {
      renderRevealScreen();
    } else if (gameState.screen === "history") {
      renderHistoryScreen();
    } else if (gameState.screen === "game-end") {
      renderFinalResults();
    }
    showScreen(gameState.screen || "setup-game");
  } else {
    showScreen("setup-game");
  }
});
