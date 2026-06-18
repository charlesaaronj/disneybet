// ===========================================================
//  Who Said Diz — game.js
// ===========================================================

const $ = id => document.getElementById(id);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const medal = i => ["🥇 ","🥈 ","🥉 "][i] || "";

// ---------------- Core helpers ----------------

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

// NOTE: still hard-resets everything; we can later change this to keep players.
function resetGame() { localStorage.removeItem("whoSaidDiz"); location.reload(); }

// tracks what the confirm modal is for: "end" or "restart"
let confirmAction = null;

function confirmThenReset(message, action) {
  confirmAction = action || "restart";
  const body = $("modal-confirm-reset-body");
  if (body) body.textContent = message || "This will end the current game and all progress will be lost.";
  const modalEl = $("modal-confirm-reset");
  if (modalEl && typeof bootstrap !== "undefined") {
    new bootstrap.Modal(modalEl).show();
  }
}

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
  "Hollywood Studios":{hero:"linear-gradient(180deg,#3b3b3b,#ffcc00)",nav:"rgba(59,59,59,0.95)",avatar:"linear-gradient(135deg,#ffcc00,#c6a530)"},
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
if (typeof PARK_HOLLYWOOD_STUDIOS !== "undefined") {
  PARKS[PARK_HOLLYWOOD_STUDIOS.name] = PARK_HOLLYWOOD_STUDIOS;
  if (typeof PARK_ANIMAL_KINGDOM !== "undefined") {
  PARKS[PARK_ANIMAL_KINGDOM.name] = PARK_ANIMAL_KINGDOM;
}

}


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
    ["#modal-no-correct .modal-header","color",t?"#fff":""],
    ["#modal-confirm-reset .modal-header","backgroundImage",t?.hero||""],
    ["#modal-confirm-reset .modal-header","color",t?"#fff":""]
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
  updatePlayerInputLock();
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
  updateQuestionLock();
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

// -------- renderAnswerProgress BEFORE proceedToAnswers --------

function renderAnswerProgress(){
  const r=gameState.currentRound,idx=r.answerIndex||0;
  const prog=$("wsd-answer-progress"),label=$("wsd-current-player-label");
  const player=gameState.players[idx];
  if(prog)prog.textContent=`Player ${idx+1} of ${gameState.players.length}`;
  if(label)label.textContent=player?`${player.name}'s answer`:"Done";
}

function proceedToAnswers(){
  const err = $("wsd-setupq-error");
  if (err) err.textContent = "";

  if (!gameState) return;

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

// -------------- Answers, wagers, scoring --------------

function saveAnswerForCurrentPlayer(skip){
  const r=gameState.currentRound,idx=r.answerIndex||0,player=gameState.players[idx];
  const ansInp=$("wsd-answer-input"),err=$("wsd-answers-error");
  const text=ansInp?ansInp.value.trim():"";
  if(err)err.textContent="";
  if(!skip&&!text){if(err)err.textContent="Please enter an answer or skip.";return;}
  if(!skip)r.answers.push({playerId:player.id,text});
  if(ansInp)ansInp.value="";
  r.answerIndex=idx+1;
  if(r.answerIndex>=gameState.players.length){
    if(!r.answers.length){if(err)err.textContent="No answers were entered. Abandon or go back.";return;}
    saveState();
    showPickOverlay(()=>{pickRandomAnswer();renderSelectAnswerScreen();showScreen("select-answer");});
  }else{
    renderAnswerProgress();saveState();
  }
}
function pickRandomAnswer(){
  const pool=gameState.currentRound.answers;
  gameState.currentRound.selectedAnswer=pool[Math.floor(Math.random()*pool.length)];
}
function renderSelectAnswerScreen(){
  const r=gameState.currentRound,qEl=$("wsd-select-question"),ansEl=$("wsd-selected-answer");
  if(qEl)qEl.textContent=r.question;
  if(!ansEl)return;
  ansEl.classList.remove("wsd-anim-pop");void ansEl.offsetWidth;
  ansEl.textContent=`"${r.selectedAnswer.text}"`;
  ansEl.classList.add("wsd-anim-pop");
}
function showPickOverlay(onDone){
  const overlay=$("wsd-pick-overlay");
  if(!overlay){onDone();return;}
  const labelEl=$("wsd-pick-label");
  if(labelEl)labelEl.textContent="Selecting an answer...";
  overlay.style.display="flex";
  overlay.style.opacity="1";
  setTimeout(()=>{
    overlay.style.transition="opacity 0.35s ease";
    overlay.style.opacity="0";
    setTimeout(()=>{
      overlay.style.display="none";
      overlay.style.opacity="1";
      overlay.style.transition="";
      onDone();
    },350);
  },1400);
}

function goToGuessWager(){
  const errEl=$("wsd-gw-error");if(errEl)errEl.textContent="";
  const hb=$("wsd-house-bonus");if(hb)hb.value="0";
  const r=gameState.currentRound,qEl=$("wsd-gw-question"),ansEl=$("wsd-gw-answer");
  if(qEl)qEl.textContent=r.question;
  if(ansEl)ansEl.textContent=`"${r.selectedAnswer.text}"`;
  const container=$("wsd-gw-players");
  if(!container)return;
  container.innerHTML="";
  gameState.players.forEach(p=>{
    const row=document.createElement("div");
    row.className="mb-3 pb-2 border-bottom";
    const playerLabel=document.createElement("div");
    playerLabel.className="wsd-score-row mb-1";
    playerLabel.innerHTML=`
      <div>
        <div class="wsd-score-name">${p.name}</div>
        <div class="wsd-score-meta">Current score: ${p.score}</div>
      </div>`;
    row.appendChild(playerLabel);
    const inner=document.createElement("div");
    inner.className="d-flex gap-2";
    const guessSel=document.createElement("select");
    guessSel.className="form-select wsd-form-select";
    guessSel.dataset.playerId=p.id;
    gameState.players.forEach(p2=>{
      const opt=document.createElement("option");
      opt.value=p2.id;
      opt.textContent=p2.name;
      guessSel.appendChild(opt);
    });
    const wagerInput=document.createElement("input");
    wagerInput.type="number";wagerInput.min=0;wagerInput.max=p.score;
    wagerInput.value=Math.min(1,p.score);
    wagerInput.inputMode="numeric";wagerInput.pattern="[0-9]*";
    wagerInput.className="form-control wsd-form-control";
    wagerInput.style.maxWidth="90px";wagerInput.dataset.playerId=p.id;
    inner.appendChild(guessSel);inner.appendChild(wagerInput);
    row.appendChild(inner);
    container.appendChild(row);
  });
  showScreen("guess-wager");
}
function clearWagersUI(){
  $$("#wsd-gw-players select").forEach(s=>{s.selectedIndex=0;});
  $$("#wsd-gw-players input[type=number]").forEach(inp=>{
    const p=gameState.players.find(pl=>pl.id===parseInt(inp.dataset.playerId,10));
    inp.value=Math.min(1,p?p.score:1);
  });
  const hb=$("wsd-house-bonus");if(hb)hb.value="0";
}
function lockWagers(){
  const err=$("wsd-gw-error");if(err)err.textContent="";
  const hbInput=$("wsd-house-bonus");
  let houseBonus=hbInput?parseInt(hbInput.value,10):0;
  if(isNaN(houseBonus)||houseBonus<0)houseBonus=0;
  const wagers=[];
  $$("#wsd-gw-players select").forEach(sel=>{
    const pid=parseInt(sel.dataset.playerId,10);
    const wInp=document.querySelector(`#wsd-gw-players input[data-player-id="${pid}"]`);
    let amount=wInp?parseInt(wInp.value,10):0;
    if(isNaN(amount)||amount<0)amount=0;
    const player=gameState.players.find(pl=>pl.id===pid);
    if(player&&amount>player.score)amount=player.score;
    wagers.push({playerId:pid,guessedAuthorId:parseInt(sel.value,10),amount});
  });
  if(wagers.filter(w=>w.amount>0).length<2){
    if(err)err.textContent="At least two players must wager more than 0.";return;
  }
  gameState.currentRound.houseBonusAmount=houseBonus;
  gameState.currentRound.wagers=wagers;
  computeRevealAndScoring();
  showScreen("reveal");
  runRevealAnimation();
  saveState();
}

function computeRevealAndScoring(){
  const r=gameState.currentRound,authorId=r.selectedAnswer.playerId;
  const payouts=[];let wrong=0;
  gameState.players.forEach(p=>{
    const we=r.wagers.find(w=>w.playerId===p.id);
    let delta=0;
    if(we){
      const amount=Math.max(0,parseInt(we.amount,10)||0);
      ensurePlayerStats(p);
      p.stats.totalRisked+=amount;
      if(amount>0){
        if(parseInt(we.guessedAuthorId,10)===authorId)delta+=amount;
        else{delta-=amount;wrong++;}
      }
    }
    payouts.push({playerId:p.id,delta});
  });
  r.wrongGuessCount=wrong;
  r.authorBonus=wrong;
  if(wrong>0){
    const ap=payouts.find(pt=>pt.playerId===authorId);
    if(ap)ap.delta+=wrong;
  }
  r.correctGuessers=r.wagers
    .filter(w=>Math.max(0,parseInt(w.amount,10)||0)>0&&parseInt(w.guessedAuthorId,10)===authorId)
    .map(w=>w.playerId);
  const hb=Math.max(0,parseInt(r.houseBonusAmount,10)||0);
  r.houseBonusResolved=0;r.houseBonusRecipients=[];r.houseBonusApplied=false;r.houseBonusReason="";
  if(hb>0){
    const cc=r.correctGuessers.length;
    if(cc===0){
      r.houseBonusReason="No house bonus: No correct guesses.";
    }else if(hb%cc!==0){
      r.houseBonusReason="No house bonus: it could not be split evenly among correct guessers.";
    }else{
      const share=hb/cc;
      r.correctGuessers.forEach(pid=>{
        const pt=payouts.find(p=>p.playerId===pid);
        if(pt){pt.delta+=share;r.houseBonusRecipients.push({playerId:pid,extra:share});}
      });
      r.houseBonusResolved=hb;r.houseBonusApplied=true;r.houseBonusReason="House bonus applied evenly.";
    }
  }
  r.payouts=payouts;r.pot=0;
  applyRoundResults(authorId);
}
function applyRoundResults(authorId){
  const r=gameState.currentRound,scoreBefore={},scoreAfter={};
  gameState.players.forEach(p=>{
    const payout=r.payouts.find(x=>x.playerId===p.id);
    scoreBefore[p.id]=p.score;
    p.score+=payout?payout.delta:0;
    if(p.score<gameState.settings.minPoints)p.score=gameState.settings.minPoints;
    scoreAfter[p.id]=p.score;
  });
  r.scoreBefore=scoreBefore;r.scoreAfter=scoreAfter;
  r.correctGuessers.forEach(pid=>{
    const p=gameState.players.find(pl=>pl.id===pid);
    if(!p)return;
    p.wins++;ensurePlayerStats(p);
    p.stats.correctGuesses=(p.stats.correctGuesses||0)+1;
  });
  r.collectionsThisRound=[];
  if(r.attraction){
    r.correctGuessers.forEach(pid=>{
      const p=gameState.players.find(pl=>pl.id===pid);
      if(!p)return;
      if(!p.collected.includes(r.attraction.name)){
        p.collected.push(r.attraction.name);
        r.collectionsThisRound.push(pid);
      }
      ensurePlayerStats(p);
      if(r.attraction.land&&!p.stats.uniqueLands.includes(r.attraction.land)){
        p.stats.uniqueLands.push(r.attraction.land);
      }
    });
  }
  gameState.history.push({
    roundNumber:gameState.roundNumber,
    park:gameState.settings.park,
    land:r.attraction?.land||"",
    attraction:r.attraction?.name||"",
    question:r.question,
    questionType:r.questionType,
    selectedAnswerText:r.selectedAnswer.text,
    authorId,
    wagers:r.wagers,
    correctGuessers:r.correctGuessers,
    payouts:r.payouts,
    collectionsThisRound:r.collectionsThisRound,
    manualAdjustments:[],
    scoreBefore,scoreAfter,
    houseBonusResolved:r.houseBonusResolved,
    houseBonusRecipients:r.houseBonusRecipients,
    houseBonusApplied:r.houseBonusApplied,
    houseBonusReason:r.houseBonusReason,
    authorBonus:r.authorBonus,
    wrongGuessCount:r.wrongGuessCount,
    houseBonusAmount:r.houseBonusAmount
  });
}

// -------------- Reveal animation & summary modal --------------

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
      const authorLineSummary=$("wsd-no-correct-author-line");
      if(authorLineSummary){
        if(r.wrongGuessCount>0){
          const b=r.authorBonus||0,w=r.wrongGuessCount;
          authorLineSummary.textContent=
            `✍️ ${author?author.name:"the author"} earned +${b} point${b===1?"":"s"} from ${w} wrong guess${w===1?"":"es"}.`;
        }else authorLineSummary.textContent="";
      }
      const houseLineText=$("wsd-house-bonus-line");
      if(houseLineText){
        if(r.houseBonusApplied){
          const names=r.houseBonusRecipients.map(hr=>{
            const p=gameState.players.find(pl=>pl.id===hr.playerId);
            return p?`${p.name} (+${hr.extra})`:`Player ${hr.playerId} (+${hr.extra})`;
          }).join(", ");
          houseLineText.textContent=`🏠 House bonus +${r.houseBonusResolved} was split evenly between: ${names}.`;
        }else if(r.houseBonusAmount>0){
          houseLineText.textContent=`🏠 ${r.houseBonusReason||"House bonus was not applied."}`;
        }else houseLineText.textContent="";
      }

      try {
        const modalEl = $("modal-no-correct");
        if (modalEl && typeof bootstrap !== "undefined") {
          const titleEl = modalEl.querySelector(".modal-title");
          if (titleEl) titleEl.textContent = "Summary";

          const authorLine = $("wsd-no-correct-author-line");
          const houseLine  = $("wsd-house-bonus-line");

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

          let bonusLine = document.getElementById("wsd-author-bonus-line");
          if (bonusLine) bonusLine.remove();

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

function spawnConfetti(container){
  if(!container)return;
  const colors=["#ff3b30","#ffcc00","#34c759","#007aff","#ff9500","#af52de"];
  container.style.height="0";
  for(let i=0;i<18;i++){
    const dot=document.createElement("div");
    dot.className="wsd-confetti-dot";
    dot.style.left=`${Math.random()*100}%`;
    dot.style.top=`${Math.random()*-30}px`;
    dot.style.background=colors[Math.floor(Math.random()*colors.length)];
    dot.style.animationDelay=`${Math.random()*0.6}s`;
    dot.style.animationDuration=`${0.9+Math.random()*0.6}s`;
    container.appendChild(dot);
  }
}

// -------------- Scores, history, final bonuses --------------

function maybeRenderCollectionsScreen(){
  if(typeof window.renderCollectionsScreen==="function")window.renderCollectionsScreen();
}
function renderScoresScreen(){
  const list=$("wsd-scores-list");if(!list)return;
  list.innerHTML="";
  [...gameState.players].sort((a,b)=>b.score-a.score||b.wins-a.wins)
    .forEach((p,i)=>{
      const row=document.createElement("div");
      row.className="wsd-score-row wsd-anim-fade-up";
      row.style.animationDelay=`${i*0.05}s`;
      row.innerHTML=`
        <div>
          <div class="wsd-score-name">${medal(i)}${p.name}</div>
          <div class="wsd-score-meta">Wins: ${p.wins} · Attractions: ${p.collected.length} · Lands: ${getPlayerUniqueLandCount(p)}</div>
        </div>
        <div class="wsd-score-value">${p.score}</div>`;
      list.appendChild(row);
    });
  renderBonusProgress();
  renderManualAdjustmentsUI();
  maybeRenderCollectionsScreen();
}
function renderBonusProgress(){
  const el = $("wsd-bonus-progress");
  if (!el) return;

  const players = gameState.players;
  players.forEach(ensurePlayerStats);

  const categories = [
    {
      icon: "🗺️",
      label: "Top Land Collector",
      bonus: FINAL_BONUS_POINTS.topLandCollector,
      getValue: p => getPlayerUniqueLandCount(p),
    },
    {
      icon: "🎢",
      label: "Top Attraction Collector",
      bonus: FINAL_BONUS_POINTS.topAttractionCollector,
      getValue: p => p.collected.length,
    },
    {
      icon: "🧠",
      label: "Best Guesser",
      bonus: FINAL_BONUS_POINTS.bestGuesser,
      getValue: p => p.stats.correctGuesses || 0,
    },
    {
      icon: "🎲",
      label: "Most Risky Player",
      bonus: FINAL_BONUS_POINTS.mostRiskyPlayer,
      getValue: p => p.stats.totalRisked || 0,
    }
  ];

  let html = "";

  categories.forEach(cat => {
    const scored = players
      .map(p => ({ name: p.name, val: cat.getValue(p) }))
      .sort((a, b) => b.val - a.val);

    const best = scored[0]?.val || 0;

    let rankingHtml = "";

    if (!scored.length || best === 0) {
      rankingHtml = `<div class="wsd-score-meta" style="margin-top:6px">No leader yet</div>`;
    } else {
      let rank = 1;
      let i = 0;

      while (i < scored.length) {
        const tierVal = scored[i].val;
        const tierPlayers = scored.filter(s => s.val === tierVal);
        const isLeader = tierVal === best;
        const gap = best - tierVal;

        const names = tierPlayers.map(s => s.name).join(" & ");
        const gapLabel = isLeader || gap === 0 ? "" : ` (-${gap})`;

        rankingHtml += `
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:6px">
            <div class="wsd-score-meta">
              <span style="opacity:0.5;margin-right:8px">#${rank}</span>
              <strong style="${isLeader ? "" : "font-weight:normal"}">${names}</strong>
              <span style="opacity:0.7">${gapLabel}</span>
            </div>
          </div>
        `;

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
      </div>
    `;
  });

  html += `
    <div class="wsd-text-small mt-2 text-center">
      <a href="#" data-bs-toggle="modal" data-bs-target="#modal-bonuses">How are bonuses calculated?</a>
    </div>
  `;

  el.innerHTML = html || "<div class='wsd-text-small'>No rounds played yet.</div>";
}

function renderManualAdjustmentsUI(){
  const c=$("wsd-manual-adjustments");if(!c)return;
  c.innerHTML="";
  gameState.players.forEach(p=>{
    const row=document.createElement("div");
    row.className="wsd-score-row";
    row.innerHTML=`
      <div class="wsd-score-name">${p.name}</div>
      <div>
        <button type="button" class="btn btn-sm btn-outline-secondary me-1" data-adj="-1" data-player="${p.id}">−1</button>
        <button type="button" class="btn btn-sm btn-outline-secondary me-1" data-adj="1"  data-player="${p.id}">+1</button>
      </div>`;
    c.appendChild(row);
  });
  c.querySelectorAll("button").forEach(btn=>{
    btn.addEventListener("click",()=>adjustPlayerScore(parseInt(btn.dataset.player,10),parseInt(btn.dataset.adj,10)));
  });
}
function adjustPlayerScore(pid,delta){
  const p=gameState.players.find(pl=>pl.id===pid);if(!p)return;
  p.score+=delta;
  if(p.score<gameState.settings.minPoints)p.score=gameState.settings.minPoints;
  if(gameState.history.length>0){
    const last=gameState.history[gameState.history.length-1];
    (last.manualAdjustments||[]).push({playerId:pid,delta,note:"Manual"});
  }
  saveState();renderScoresScreen();
}
function invertCurrentScores(){
  if(!gameState||gameState.players.length<2)return;
  const ranked=[...gameState.players].sort((a,b)=>b.score-a.score||b.wins-a.wins||a.id-b.id);
  const scoreValues=ranked.map(p=>p.score).sort((a,b)=>a-b);
  const before={};
  ranked.forEach((p,i)=>{before[p.id]=p.score;p.score=scoreValues[i];});
  if(gameState.history.length>0){
    const last=gameState.history[gameState.history.length-1];
    (last.manualAdjustments||[]).push({type:"invertScores",before,note:"Invert scores"});
  }
  saveState();renderScoresScreen();
}
function renderHistoryScreen(){
  const c=$("wsd-history-list");if(!c)return;
  c.innerHTML="";
  if(!gameState.history.length){c.textContent="No rounds played yet.";return;}
  [...gameState.history].reverse().forEach(h=>{
    const author=gameState.players.find(p=>p.id===h.authorId);
    const wrap=document.createElement("div");
    wrap.className="mb-3 pb-2 border-bottom";
    let html=`<div><strong>Round ${h.roundNumber}</strong>`;
    if(h.park)html+=` — ${h.park}`;
    if(h.land)html+=` · ${h.land}`;
    if(h.attraction)html+=` · <em>${h.attraction}</em>`;
    html+=`</div>`;
    html+=`<div class="wsd-text-small">Q: ${h.question}</div>`;
    html+=`<div class="wsd-text-small">Answer: &ldquo;${h.selectedAnswerText}&rdquo;</div>`;
    html+=`<div class="wsd-text-small">Author: <strong>${author?author.name:"Unknown"}</strong></div>`;
    h.payouts.forEach(pt=>{
      const pl=gameState.players.find(x=>x.id===pt.playerId);
      const wager=h.wagers.find(w=>w.playerId===pt.playerId);
      const guess=wager&&gameState.players.find(x=>x.id===wager.guessedAuthorId);
      const ok=h.correctGuessers.includes(pt.playerId);
      html+=`<div class="wsd-text-small">&nbsp;&nbsp;${pl?pl.name:"?"}: guess ${guess?guess.name:"—"}, wager ${wager?wager.amount:0}, ${ok?"✅":"❌"}, ${pt.delta>=0?"+":""}${pt.delta} pts</div>`;
    });
    if(h.authorBonus>0){
      html+=`<div class="wsd-text-small">&nbsp;&nbsp;Author bonus: +${h.authorBonus}</div>`;
    }
    if(h.houseBonusAmount>0||h.houseBonusResolved>0||h.houseBonusReason){
      const names=(h.houseBonusRecipients||[]).map(hr=>{
        const pl=gameState.players.find(x=>x.id===hr.playerId);
        return pl?`${pl.name} (+${hr.extra})`:`Player ${hr.playerId} (+${hr.extra})`;
      }).join(", ");
      html+=`<div class="wsd-text-small">&nbsp;&nbsp;House bonus: ${h.houseBonusApplied?`+${h.houseBonusResolved} split evenly: ${names}`:(h.houseBonusReason||"Not applied")}</div>`;
    }
    (h.manualAdjustments||[]).forEach(adj=>{
      if(adj.type==="invertScores"){
        html+=`<div class="wsd-text-small">&nbsp;&nbsp;Manual: scores inverted</div>`;
      }else{
        const pl=gameState.players.find(x=>x.id===adj.playerId);
        html+=`<div class="wsd-text-small">&nbsp;&nbsp;Manual: ${pl?pl.name:"?"} ${adj.delta>=0?"+":""}${adj.delta}</div>`;
      }
    });
    wrap.innerHTML=html;
    c.appendChild(wrap);
  });
}
function computeFinalBonusesAndShow(){
  if(gameState.finalBonusesApplied){renderFinalResults();return;}
  const players=gameState.players;players.forEach(ensurePlayerStats);
  const maxLand=Math.max(0,...players.map(getPlayerUniqueLandCount));
  const maxAttr=Math.max(0,...players.map(p=>p.collected.length));
  const maxCorr=Math.max(0,...players.map(p=>p.stats.correctGuesses||0));
  const maxRisk=Math.max(0,...players.map(p=>p.stats.totalRisked||0));
  players.forEach(p=>{
    p.bonusTotal=0;
    p.finalBonusBreakdown={topLandCollector:0,topAttractionCollector:0,bestGuesser:0,mostRiskyPlayer:0};
    const lc=getPlayerUniqueLandCount(p);
    const ac=p.collected.length;
    const cc=p.stats.correctGuesses||0;
    const rc=p.stats.totalRisked||0;
    if(lc>0&&lc===maxLand){p.bonusTotal+=FINAL_BONUS_POINTS.topLandCollector;p.finalBonusBreakdown.topLandCollector=FINAL_BONUS_POINTS.topLandCollector;}
    if(ac>0&&ac===maxAttr){p.bonusTotal+=FINAL_BONUS_POINTS.topAttractionCollector;p.finalBonusBreakdown.topAttractionCollector=FINAL_BONUS_POINTS.topAttractionCollector;}
    if(cc>0&&cc===maxCorr){p.bonusTotal+=FINAL_BONUS_POINTS.bestGuesser;p.finalBonusBreakdown.bestGuesser=FINAL_BONUS_POINTS.bestGuesser;}
    if(rc>0&&rc===maxRisk){p.bonusTotal+=FINAL_BONUS_POINTS.mostRiskyPlayer;p.finalBonusBreakdown.mostRiskyPlayer=FINAL_BONUS_POINTS.mostRiskyPlayer;}
  });
  players.forEach(p=>{p.score+=p.bonusTotal;});
  gameState.finalBonusesApplied=true;
  saveState();
  renderFinalResults();
}
function renderFinalResults(){
  const sorted=[...gameState.players].sort((a,b)=>b.score===a.score?b.wins-a.wins:b.score-a.score);
  const topScore=sorted[0].score,topWins=sorted[0].wins;
  const winners=sorted.filter(p=>p.score===topScore&&p.wins===topWins);
  const banner=$("wsd-winner-banner");
  if(banner){
    banner.innerHTML=`🎉 ${winners.map(w=>w.name).join(" & ")} wins! Time to collect that snack!`;
    banner.classList.remove("wsd-anim-pop");void banner.offsetWidth;
    banner.classList.add("wsd-anim-pop");
  }
  spawnConfetti($("wsd-confetti-wrap-end"));
  const c=$("wsd-final-results");if(!c)return;
  c.innerHTML="";
  sorted.forEach((p,i)=>{
    const row=document.createElement("div");
    row.className="wsd-score-row wsd-anim-fade-up";
    row.style.animationDelay=`${i*0.08}s`;
    const bd=p.finalBonusBreakdown||{};
    row.innerHTML=`
      <div>
        <div class="wsd-score-name">${medal(i)}${p.name}</div>
        <div class="wsd-score-meta">Wins: ${p.wins} · Attractions: ${p.collected.length} · Lands: ${getPlayerUniqueLandCount(p)} · Bonus: +${p.bonusTotal}</div>
        <div class="wsd-text-small">🗺️ +${bd.topLandCollector||0} · 🎢 +${bd.topAttractionCollector||0} · 🧠 +${bd.bestGuesser||0} · 🎲 +${bd.mostRiskyPlayer||0}</div>
      </div>
      <div class="wsd-score-value">${p.score}</div>`;
    c.appendChild(row);
  });
}

// -------------- abandonRound (must exist before wireEvents) --------------

function abandonRound(){
  if(gameState)gameState.roundNumber=Math.max(0,gameState.roundNumber-1);
  startNewRoundCore();
  if(gameState&&gameState.history.length>0){
    renderScoresScreen();showScreen("scores");
  }else{
    showScreen("setup-question");startNewRoundCore();
  }
}

// -------------- Wire events & bootstrap --------------

function wireEvents(){
  debugLog("wireEvents starting");
  $("wsd-start-game").addEventListener("click",startGameFromSetup);
  $("wsd-reset-setup").addEventListener("click",()=>{
    const err=$("wsd-setup-error"),ps=$("wsd-park-select"),label=$("wsd-park-label");
    if(err)err.textContent="";
    if(ps)ps.value="";
    if(label)label.textContent="Not set";
    $$("#wsd-player-inputs input").forEach((el,i)=>{if(i<3)el.value="";else el.remove();});
    applyParkTheme("");
    updatePlayerInputLock();
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

  // End game: confirm and then go to final scores (no hard reset)
  $("wsd-end-game").addEventListener("click", () => {
    confirmThenReset(
      "End this game and show final scores? You cannot keep playing this game afterward.",
      "end"
    );
  });

  // Restart: confirm and then hard reset
  $("wsd-restart-game").addEventListener("click", () => {
    confirmThenReset(
      "Restart this game and clear all scores and history?",
      "restart"
    );
  });

  // Play again: immediate new game (no confirm)
  $("wsd-play-again").addEventListener("click", resetGame);

  $("wsd-view-history-end").addEventListener("click",()=>{renderHistoryScreen();showScreen("history");});
  $("wsd-close-history").addEventListener("click",()=>{
    const fb=gameState? (gameState.screen==="history"?"scores":gameState.screen):"setup-game";
    if(fb==="scores")renderScoresScreen();
    if(fb==="game-end")renderFinalResults();
    showScreen(fb);
  });
const invertBtn = $("wsd-invert-scores");
if (invertBtn) {
  invertBtn.addEventListener("click", () => {
    invertCurrentScores();                      // just do the invert
    invertBtn.classList.add("wsd-invert-active");
    setTimeout(() => invertBtn.classList.remove("wsd-invert-active"), 250);
  });
} 
  // Confirmation modal YES button
  const confirmYes = $("modal-confirm-reset-yes");
  if (confirmYes) confirmYes.addEventListener("click", () => {
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
