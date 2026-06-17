// ===========================================================
//  Who Said Diz — game.js
// ===========================================================

const $ = id => document.getElementById(id);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const medal = i => ["🥇 ","🥈 ","🥉 "][i] || "";

function debugLog(msg) {
  try { console.log(msg); } catch(e){}
  const box = $("wsd-debug");
  if (!box) return;
  const line = document.createElement("div");
  line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}
function shuffle(a) {
  a = a.slice();
  for (let i=a.length-1;i>0;i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

// NOTE: this still hard-resets everything via localStorage.
// If you want restart to keep players, we can replace this later.
function resetGame() { localStorage.removeItem("whoSaidDiz"); location.reload(); }

function requireState(fn){return()=>{if(!gameState){showScreen("setup-game");return;}fn();};}

const MIN_POINTS=3, START_POINTS=10;
const FINAL_BONUS_POINTS = {
  topLandCollector:3, topAttractionCollector:3, bestGuesser:2, mostRiskyPlayer:2
};
const SCREEN_META = {
  "setup-game":     {icon:"🎮",title:"Setup game",instruction:"Pick your park, add players, and choose your settings."},
  "setup-question": {icon:"🎢",title:"Choose attraction",instruction:"Pick your attraction. A question will be selected for you."},
  "enter-answers":  {icon:"✏️",title:"Enter answers",instruction:"Pass the phone around. Each player secretly types their answer."},
  "select-answer":  {icon:"🎲",title:"Selected answer",instruction:"A random answer has been chosen. No peeking at who wrote it!"},
  "guess-wager":    {icon:"💰",title:"Guess & wager",instruction:"Everyone guesses the author and places their bet."},
  "reveal":         {icon:"🔍",title:"Reveal",instruction:"Find out who really said that!"},
  "scores":         {icon:"📊",title:"Scores",instruction:"Check standings and bonus progress. Start the next round when ready."},
  "game-end":       {icon:"🏆",title:"Game over",instruction:"Bonuses applied! The player with most points wins the snack."},
  "history":        {icon:"📋",title:"Round history",instruction:"A full log of every round played."}
};
const PARK_THEMES = {
  "Magic Kingdom":    {hero:"linear-gradient(180deg,#4b0082,#ff69b4)",nav:"rgba(75,0,130,0.95)",avatar:"linear-gradient(135deg,#ff69b4,#800080)"},
  "EPCOT":            {hero:"linear-gradient(180deg,#003366,#66ccff)",nav:"rgba(0,51,102,0.95)",avatar:"linear-gradient(135deg,#66ccff,#ffffff)"},
  "Hollywood Studios":{hero:"linear-gradient(180deg,#3b3b3b,#ffcc00)",nav:"rgba(59,59,59,0.95)",avatar:"linear-gradient(135deg,#ffcc00,#ff4081)"},
  "Animal Kingdom":   {hero:"linear-gradient(180deg,#014422,#8bc34a)",nav:"rgba(1,68,34,0.95)",avatar:"linear-gradient(135deg,#8bc34a,#ffe082)"}
};
const NAV_MAP = {
  "setup-game":"wsd-nav-home","setup-question":"wsd-nav-round","enter-answers":"wsd-nav-round",
  "select-answer":"wsd-nav-round","guess-wager":"wsd-nav-round","reveal":"wsd-nav-round",
  "scores":"wsd-nav-scores","game-end":"wsd-nav-scores","history":"wsd-nav-history"
};
const ROUND_SCREENS = ["setup-question","enter-answers","select-answer","guess-wager","reveal"];

const PARKS = {};
if (typeof PARK_MAGIC_KINGDOM!=="undefined") PARKS[PARK_MAGIC_KINGDOM.name]=PARK_MAGIC_KINGDOM;
if (typeof PARK_EPCOT!=="undefined") PARKS[PARK_EPCOT.name]=PARK_EPCOT;

let gameState=null;

function saveState(){if(!gameState)return;try{localStorage.setItem("whoSaidDiz",JSON.stringify(gameState));}catch(e){}}
function loadState(){try{const raw=localStorage.getItem("whoSaidDiz");if(raw)gameState=JSON.parse(raw);}catch(e){gameState=null;}}
function ensurePlayerStats(p){
  p.stats??={correctGuesses:0,totalRisked:0,uniqueLands:[]};
  if(!Array.isArray(p.stats.uniqueLands))p.stats.uniqueLands=[];
}
function ensureStateShape(){
  if(!gameState)return;
  gameState.settings??={};
  gameState.settings.startingPoints||=START_POINTS;
  gameState.settings.minPoints||=MIN_POINTS;
  gameState.players||=[];
  gameState.history||=[];
  gameState.players.forEach(p=>{
    if(!Array.isArray(p.collected))p.collected=[];
    if(typeof p.wins!=="number")p.wins=0;
    if(typeof p.bonusTotal!=="number")p.bonusTotal=0;
    ensurePlayerStats(p);
  });
  if(!gameState.currentRound)return;
  const r=gameState.currentRound;
  ["correctGuessers","payouts","houseBonusRecipients","collectionsThisRound"].forEach(k=>{r[k]||=[];});
  if(typeof r.houseBonusApplied!=="boolean")r.houseBonusApplied=false;
  r.houseBonusReason||="";
}
const getAttractionByName=name=>gameState.attractions.find(a=>a.name===name);
function getPlayerUniqueLandCount(player){
  const s=new Set();
  player.collected.forEach(name=>{const a=getAttractionByName(name);if(a?.land)s.add(a.land);});
  return s.size;
}
function applyParkTheme(parkName){
  const t=PARK_THEMES[parkName];
  [
    [".wsd-hero","backgroundImage",t?.hero||""],
    [".wsd-bottom-nav","backgroundColor",t?.nav||"rgba(255,255,255,0.9)"],
    [".wsd-avatar","backgroundImage",t?.avatar||""],
    ["#modal-no-correct .modal-header","backgroundImage",t?.hero||""],
    ["#modal-no-correct .modal-header","color",t?"#fff":""]
  ].forEach(([sel,prop,val])=>{const el=document.querySelector(sel);if(el)el.style[prop]=val;});
}
const ALL_SCREENS=Object.keys(SCREEN_META);
function showScreen(name){
  ALL_SCREENS.forEach(key=>{
    const el=$(`screen-${key}`);
    if(el)el.classList.toggle("wsd-screen-active",key===name);
  });
  if(gameState){gameState.screen=name;saveState();}
  const m=SCREEN_META[name]||SCREEN_META["setup-game"];
  [["wsd-step-icon",m.icon],["wsd-step-title",m.title],["wsd-step-instruction",m.instruction]]
    .forEach(([id,val])=>{const el=$(id);if(el)el.textContent=val;});
  $$(".wsd-nav-item").forEach(b=>b.classList.remove("wsd-nav-item-active"));
  const navId=NAV_MAP[name];
  if(navId&&$(navId))$(navId).classList.add("wsd-nav-item-active");
}

// --------- NEW LOCK HELPERS ---------

function updatePlayerInputLock(){
  const parkSel = $("wsd-park-select");
  const selected = !!(parkSel && parkSel.value);
  const hint = $("wsd-park-hint");
  if (hint) hint.style.display = selected ? "none" : "block";
  $$("#wsd-player-inputs input").forEach(inp=>{
    inp.disabled = !selected;
    inp.placeholder = selected ? "Player name" : "Select a park first";
  });
  const addBtn = $("wsd-add-player");
  if (addBtn) addBtn.disabled = !selected;
}

function updateQuestionLock(){
  const attrSel = $("wsd-attraction-select");
  const hasAttraction = !!(attrSel && attrSel.value);

  const hint = $("wsd-attraction-hint");
  if (hint) hint.style.display = hasAttraction ? "none" : "block";

  const qTxt = $("wsd-question-text");
  if (qTxt) {
    qTxt.disabled = !hasAttraction;
    qTxt.placeholder = hasAttraction ? "" : "Select an attraction first";
  }

  const genBtn    = $("wsd-generate-question");
  const customBtn = $("wsd-enter-custom-question");
  const nextBtn   = $("wsd-to-answers");
  [genBtn, customBtn, nextBtn].forEach(btn=>{
    if (btn) btn.disabled = !hasAttraction;
  });
}

// ----------------- Setup screen -----------------

function initSetupScreen(){
  debugLog("initSetupScreen starting");
  const sel=$("wsd-park-select"),container=$("wsd-player-inputs");
  debugLog(`wsd-park-select exists? ${!!sel}`);
  debugLog(`wsd-player-inputs exists? ${!!container}`);
  if(!sel||!container)return;
  sel.innerHTML='<option value="">Select a park</option>';
  Object.keys(PARKS).forEach(name=>{
    const opt=document.createElement("option");
    opt.value=name;opt.textContent=name;sel.appendChild(opt);
  });
  if(!container.querySelectorAll("input").length){
    for(let i=0;i<3;i++)addPlayerInput(container);
  }
  updatePlayerInputLock();  // lock until a park is picked
  debugLog("Setup screen ready");
}
function addPlayerInput(container){
  const inp=document.createElement("input");
  inp.type="text";
  inp.className="form-control wsd-form-control wsd-player-input";
  inp.placeholder="Player name";
  container.appendChild(inp);
}
function startGameFromSetup(){
  const errEl=$("wsd-setup-error"),parkSel=$("wsd-park-select");
  const parkName=parkSel?parkSel.value:"";
  if(errEl)errEl.textContent="";
  if(!parkName||!PARKS[parkName]){
    if(errEl)errEl.textContent="Please select a park.";return;
  }

  const names=$$("#wsd-player-inputs input").map(i=>i.value.trim()).filter(Boolean);
  if(names.length<3){
    if(errEl)errEl.textContent="Please enter at least three player names.";return;
  }

  // prevent duplicate names (case-insensitive)
  const uniqueNames=new Set(names.map(n=>n.toLowerCase()));
  if(uniqueNames.size!==names.length){
    if(errEl)errEl.textContent="Each player must have a unique name.";
    return;
  }

  const parkData=PARKS[parkName];
  const players=names.map((name,id)=>({
    id,name,score:START_POINTS,wins:0,collected:[],bonusTotal:0,
    stats:{correctGuesses:0,totalRisked:0,uniqueLands:[]}
  }));
  
  const usedQuestions={attractions:{},generic:shuffle(parkData.genericQuestions),genericIndex:0};
  parkData.attractions.forEach(a=>{
    usedQuestions.attractions[a.name]={questions:shuffle(a.questions),index:0};
  });
  gameState={
    screen:"setup-question",roundNumber:0,
    settings:{park:parkName,startingPoints:START_POINTS,minPoints:MIN_POINTS},
    players,
    lands:[...new Set(parkData.attractions.map(a=>a.land).filter(Boolean))],
    attractions:parkData.attractions,genericQuestions:parkData.genericQuestions,
    usedQuestions,currentRound:null,history:[],finalBonusesApplied:false
  };
  const parkLabel=$("wsd-park-label"); if(parkLabel)parkLabel.textContent=parkName;
  applyParkTheme(parkName);
  const summary=$("wsd-player-summary"); if(summary)summary.textContent=`${players.length} players`;
  renderAttractionOptions();
  saveState();
  showScreen("setup-question");
  startNewRoundCore();
}

// -------------- Question setup --------------

function renderAttractionOptions(){
  const sel=$("wsd-attraction-select");
  if(!sel||!gameState)return;
  sel.innerHTML='<option value="">Select an attraction</option>';
  gameState.attractions.forEach((a,i)=>{
    const opt=document.createElement("option");
    opt.value=String(i);opt.textContent=a.name;sel.appendChild(opt);
  });
}
function startNewRoundCore(){
  if(!gameState)return;
  gameState.roundNumber+=1;
  gameState.currentRound={
    attraction:null,question:"",questionType:"",answers:[],
    selectedAnswer:null,answerIndex:0,houseBonusAmount:0,
    wagers:[],pot:0,correctGuessers:[],payouts:[],
    scoreBefore:{},scoreAfter:{},collectionsThisRound:[],
    wrongGuessCount:0,authorBonus:0,houseBonusResolved:0,
    houseBonusRecipients:[],houseBonusApplied:false,houseBonusReason:""
  };
  saveState();
  [
    ["wsd-house-bonus",el=>{el.value="0";}],
    ["wsd-question-text",el=>{el.readOnly=true;el.value="";}],
    ["wsd-question-type-badge",el=>{el.textContent="";}],
    ["wsd-attraction-select",el=>{el.value="";}],
    ["wsd-attraction-meta",el=>{el.textContent="";}],
    ["wsd-setupq-error",el=>{el.textContent="";}]
  ].forEach(([id,fn])=>{const el=$(id);if(el)fn(el);});
  updateQuestionLock(); // lock question controls until attraction chosen
}

function onAttractionChange(){
  if(!gameState)return;
  const attrSel=$("wsd-attraction-select");
  const idx=attrSel?parseInt(attrSel.value,10):NaN;
  const meta=$("wsd-attraction-meta"),qTxt=$("wsd-question-text"),badge=$("wsd-question-type-badge");
  if(meta)meta.textContent="";if(qTxt)qTxt.value="";if(badge)badge.textContent="";
  if(isNaN(idx)||!gameState.attractions[idx]){
    gameState.currentRound.attraction=null;gameState.currentRound.question="";updateQuestionLock();return;
  }
  const attraction=gameState.attractions[idx];
  gameState.currentRound.attraction=attraction;
  if(meta)meta.textContent=`${attraction.park} • ${attraction.land}`;
  const {q,type}=drawQuestion(attraction);
  gameState.currentRound.question=q;gameState.currentRound.questionType=type;
  if(qTxt)qTxt.value=q; if(badge)badge.textContent=labelForType(type);
  saveState();
  updateQuestionLock();
}
function drawQuestion(attraction){
  const uq=gameState.usedQuestions,entry=uq.attractions[attraction.name];
  if(entry&&entry.index<entry.questions.length) return{q:entry.questions[entry.index++],type:"attraction"};
  if(uq.genericIndex<uq.generic.length)         return{q:uq.generic[uq.genericIndex++],type:"generic"};
  const pool=gameState.genericQuestions;
  return pool.length
    ? {q:pool[Math.floor(Math.random()*pool.length)],type:"generic"}
    : {q:"No questions available.",type:"generic"};
}
const labelForType=t=>t==="attraction"?"Attraction question":t==="generic"?"Generic question":"Custom question";
function onGenerateNewQuestion(){
  const err=$("wsd-setupq-error");
  if(!gameState||!gameState.currentRound.attraction){
    if(err)err.textContent="Select an attraction first.";return;
  }
  if(err)err.textContent="";
  const {q,type}=drawQuestion(gameState.currentRound.attraction);
  gameState.currentRound.question=q;gameState.currentRound.questionType=type;
  const qTxt=$("wsd-question-text"),badge=$("wsd-question-type-badge");
  if(qTxt)qTxt.value=q;if(badge)badge.textContent=labelForType(type);
  saveState();
}
function onEnterCustomQuestion(){
  const qTxt=$("wsd-question-text");if(!qTxt)return;
  qTxt.readOnly=false;qTxt.value="";
  const badge=$("wsd-question-type-badge");if(badge)badge.textContent="Custom question";
  gameState.currentRound.questionType="custom";qTxt.focus();saveState();
}
function proceedToAnswers(){
  const err=$("wsd-setupq-error");if(err)err.textContent="";
  if(!gameState||!gameState.currentRound.attraction){
    if(err)err.textContent="Please select an attraction.";return;
  }
  const qTxt=$("wsd-question-text"),q=qTxt?qTxt.value.trim():"";
  if(!q){if(err)err.textContent="Please enter a question.";return;}
  gameState.currentRound.question=q;
  gameState.currentRound.answers=[];
  gameState.currentRound.answerIndex=0;
  saveState();
  const enterQ=$("wsd-enter-question"),ansInp=$("wsd-answer-input");
  if(enterQ)enterQ.textContent=q;
  if(ansInp)ansInp.value="";
  renderAnswerProgress();
  showScreen("enter-answers");
}

// -------------- Answer entry, wagers, scoring --------------
// (unchanged content from your current file down to runRevealAnimation)
// ... for brevity, everything from renderAnswerProgress through computeRevealAndScoring
// remains exactly as in your last paste, until runRevealAnimation.

// Keep your existing implementations here (no changes made),
// then replace runRevealAnimation with this version:

function runRevealAnimation(){
  const r=gameState.currentRound;
  const author=gameState.players.find(p=>p.id===r.selectedAnswer.playerId);
  const countEl=$("wsd-reveal-countdown"),authWrap=$("wsd-reveal-author-wrap"),
        authEl=$("wsd-reveal-author"),resultsEl=$("wsd-reveal-results"),
        nextWrap=$("wsd-reveal-next-wrap"),confettiEl=$("wsd-confetti-wrap"),
        qEl=$("wsd-reveal-question"),ansEl=$("wsd-reveal-answer-text");
  if(qEl)qEl.textContent=r.question;
  if(ansEl)ansEl.textContent=`"${r.selectedAnswer.text}"`;
  if(authWrap)authWrap.style.display="none";
  if(resultsEl)resultsEl.innerHTML="";
  if(nextWrap)nextWrap.style.display="none";
  if(confettiEl)confettiEl.innerHTML="";
  ["3","2","1"].forEach((n,i)=>{
    setTimeout(()=>{
      if(!countEl)return;
      countEl.textContent=n;
      countEl.classList.remove("wsd-anim-pop");void countEl.offsetWidth;
      countEl.classList.add("wsd-anim-pop");
    },i*700);
  });
  setTimeout(()=>{
    if(countEl)countEl.textContent="";
    if(authEl)authEl.textContent=author?author.name:"Unknown";
    if(authWrap){
      authWrap.style.display="block";
      authWrap.classList.remove("wsd-anim-pop");void authWrap.offsetWidth;
      authWrap.classList.add("wsd-anim-pop");
    }
    if(r.correctGuessers.length>0&&confettiEl)spawnConfetti(confettiEl);

    if(r.wrongGuessCount>0||r.houseBonusAmount>0){
      const authorLineForSummary=$("wsd-no-correct-author-line");
      if(authorLineForSummary){
        if(r.wrongGuessCount>0){
          const b=r.authorBonus||0,w=r.wrongGuessCount;
          authorLineForSummary.textContent=
            `✍️ ${author?author.name:"the author"} earned +${b} point${b===1?"":"s"} from ${w} wrong guess${w===1?"":"es"}.`;
        }else authorLineForSummary.textContent="";
      }
      const houseLine=$("wsd-house-bonus-line");
      if(houseLine){
        if(r.houseBonusApplied){
          const names=r.houseBonusRecipients.map(hr=>{
            const p=gameState.players.find(pl=>pl.id===hr.playerId);
            return p?`${p.name} (+${hr.extra})`:`Player ${hr.playerId} (+${hr.extra})`;
          }).join(", ");
          houseLine.textContent=`🏠 House bonus +${r.houseBonusResolved} was split evenly between: ${names}.`;
        }else if(r.houseBonusAmount>0){
          houseLine.textContent=`🏠 ${r.houseBonusReason||"House bonus was not applied."}`;
        }else houseLine.textContent="";
      }

      try {
        const modalEl = $("modal-no-correct");
        if (modalEl && typeof bootstrap !== "undefined") {
          // Header: always just "Summary"
          const titleEl = modalEl.querySelector(".modal-title");
          if (titleEl) titleEl.textContent = "Summary";

          // Body elements
          const authorLine = $("wsd-no-correct-author-line");
          const houseLine  = $("wsd-house-bonus-line");

          // Winner / nobody line
          if (authorLine) {
            const winnerNames = r.correctGuessers.length
              ? r.correctGuessers
                  .map(pid => gameState.players.find(p => p.id === pid)?.name)
                  .filter(Boolean)
                  .join(" & ")
              : null;

            authorLine.textContent = winnerNames
              ? `✅ ${winnerNames} got it right this round.`
              : `❌ Nobody guessed ${author ? author.name : "the author"} this round.`;
          }

          // Author bonus line: separate element, same style as house bonus
          let bonusLine = document.getElementById("wsd-author-bonus-line");
          if (bonusLine) bonusLine.remove(); // clear old one

          if (r.authorBonus > 0) {
            const b = r.authorBonus;
            const w = r.wrongGuessCount;

            bonusLine = document.createElement("p");
            bonusLine.id = "wsd-author-bonus-line";
            bonusLine.className = houseLine ? houseLine.className : "wsd-text-small";

            bonusLine.textContent =
              `✍️ ${author ? author.name : "The author"} earned ` +
              `+${b} point${b === 1 ? "" : "s"} from ` +
              `${w} wrong guess${w === 1 ? "" : "es"}.`;

            if (authorLine) authorLine.insertAdjacentElement("afterend", bonusLine);
          }

          setTimeout(() => new bootstrap.Modal(modalEl).show(), 400);
        }
      } catch (e) {}
    }

    r.payouts.forEach((payout,i)=>{
      setTimeout(()=>{
        const p=gameState.players.find(pl=>pl.id===payout.playerId);
        const wager=r.wagers.find(w=>w.playerId===payout.playerId);
        const guess=wager&&gameState.players.find(pl=>pl.id===wager.guessedAuthorId);
        const ok=r.correctGuessers.includes(payout.playerId);
        const dStr=`${payout.delta>=0?"+":""}${payout.delta}`;
        const row=document.createElement("div");
        row.className="wsd-result-row";
        row.style.animationDelay=`${i*0.07}s`;
        row.innerHTML=`
          <div>
            <div class="wsd-score-name">${p.name} ${ok?"✅":"❌"}</div>
            <div class="wsd-score-meta">Guess: ${guess?guess.name:"—"} • Wager: ${wager?wager.amount:0}</div>
          </div>
          <div class="wsd-score-value ${payout.delta>=0?"text-success":"text-danger"}">${dStr}</div>`;
        if(resultsEl)resultsEl.appendChild(row);
      },i*120);
    });
    setTimeout(()=>{if(nextWrap)nextWrap.style.display="block";},r.payouts.length*120+300);
  },2100);
}

// ... keep spawnConfetti, maybeRenderCollectionsScreen, renderScoresScreen,
// renderBonusProgress, renderManualAdjustmentsUI, adjustPlayerScore,
// invertCurrentScores, renderHistoryScreen, computeFinalBonusesAndShow,
// renderFinalResults, abandonRound exactly as they are in your file.

// ----------------- wireEvents with reset & locks -----------------

function wireEvents(){
  debugLog("wireEvents starting");
  $("wsd-start-game").addEventListener("click",startGameFromSetup);
  $("wsd-reset-setup").addEventListener("click",()=>{
    const err=$("wsd-setup-error"),ps=$("wsd-park-select"),label=$("wsd-park-label");
    if(err)err.textContent="";
    if(ps)ps.value="";
    if(label)label.textContent="Not set";
    $$("#wsd-player-inputs input").forEach((el,i)=>{if(i<3)el.value="";else el.remove();});
    applyParkTheme("");      // reset theme to neutral
    updatePlayerInputLock(); // lock names again until park selected
  });
  $("wsd-add-player").addEventListener("click",()=>{
    const c=$("wsd-player-inputs");if(!c||c.querySelectorAll("input").length>=8)return;
    addPlayerInput(c);
  });
  $("wsd-park-select").addEventListener("change",()=>{
    const name=$("wsd-park-select").value,label=$("wsd-park-label");
    if(label)label.textContent=name||"Not set";
    applyParkTheme(name);
    updatePlayerInputLock();
  });
  $("wsd-attraction-select").addEventListener("change",()=>{
    onAttractionChange();
    updateQuestionLock();
  });
  $("wsd-generate-question").addEventListener("click",onGenerateNewQuestion);
  $("wsd-enter-custom-question").addEventListener("click",onEnterCustomQuestion);
  $("wsd-to-answers").addEventListener("click",proceedToAnswers);
  $("wsd-abandon-from-setupq").addEventListener("click",abandonRound);
  $("wsd-save-answer").addEventListener("click",()=>saveAnswerForCurrentPlayer(false));
  $("wsd-skip-player").addEventListener("click",()=>saveAnswerForCurrentPlayer(true));
  $("wsd-abandon-from-answers").addEventListener("click",abandonRound);
  $("wsd-select-again").addEventListener("click",()=>{
    showPickOverlay(()=>{pickRandomAnswer();renderSelectAnswerScreen();saveState();});
  });
  $("wsd-to-wagers").addEventListener("click",goToGuessWager);
  $("wsd-abandon-from-select").addEventListener("click",abandonRound);
  $("wsd-lock-wagers").addEventListener("click",lockWagers);
  $("wsd-clear-wagers").addEventListener("click",clearWagersUI);
  $("wsd-abandon-from-gw").addEventListener("click",abandonRound);
  $("wsd-to-scores").addEventListener("click",()=>{renderScoresScreen();showScreen("scores");});
  $("wsd-start-round").addEventListener("click",()=>{startNewRoundCore();showScreen("setup-question");});
  $("wsd-view-history").addEventListener("click",()=>{renderHistoryScreen();showScreen("history");});
  $("wsd-end-game").addEventListener("click",()=>{computeFinalBonusesAndShow();showScreen("game-end");});
  $("wsd-restart-game").addEventListener("click",resetGame);
  $("wsd-play-again").addEventListener("click",resetGame);
  $("wsd-view-history-end").addEventListener("click",()=>{renderHistoryScreen();showScreen("history");});
  $("wsd-close-history").addEventListener("click",()=>{
    const fb=gameState? (gameState.screen==="history"?"scores":gameState.screen):"setup-game";
    if(fb==="scores")renderScoresScreen();
    if(fb==="game-end")renderFinalResults();
    showScreen(fb);
  });
  const invertBtn=$("wsd-invert-scores");
  if(invertBtn)invertBtn.addEventListener("click",invertCurrentScores);
  $("wsd-nav-home").addEventListener("click",()=>showScreen("setup-game"));
  $("wsd-nav-round").addEventListener("click",requireState(()=>{
    showScreen(ROUND_SCREENS.includes(gameState.screen)?gameState.screen:"setup-question");
  }));
  $("wsd-nav-scores").addEventListener("click",requireState(()=>{renderScoresScreen();showScreen("scores");}));
  $("wsd-nav-history").addEventListener("click",requireState(()=>{renderHistoryScreen();showScreen("history");}));
}

document.addEventListener("DOMContentLoaded",()=>{
  loadState();
  ensureStateShape();
  initSetupScreen();
  wireEvents();
  if(gameState){
    const parkName=gameState.settings?.park||"Not set";
    const parkLabel=$("wsd-park-label");if(parkLabel)parkLabel.textContent=parkName;
    applyParkTheme(parkName);
    renderAttractionOptions();
    const scr=gameState.screen||"setup-game";
    if(scr==="scores")renderScoresScreen();
    if(scr==="history")renderHistoryScreen();
    if(scr==="game-end")renderFinalResults();
    showScreen(scr);
  }else{
    showScreen("setup-game");
  }
});
