const GAME_QUESTIONS = {
  "categories": [
    {
      "id": 1,
      "name": "Role",
      "description": "Players imagine themselves taking on a role inside {{attraction}}'s world.",
      "questions": [
        "The {{land}} VP posts numerous job openings for {{attraction}} — what job would you want if available?",
        "A scout from StarTube Originals decides {{attraction}} needs a live actor and picks you. What is your character's name?",
        "The {{land}} HOA cites {{attraction}} for a violation. What's the violation?",
        "The casting board for {{attraction}} suddenly has one blank name tag, and it magically prints your name on it. What role appears under your name?",
        "{{attraction}} needs an animatronic, but the {{land}} VP won’t pay for it. How much would you charge to take its place?"
]
    },
    {
      "id": 2,
      "name": What-If",
      "description": "One magical or absurd change is applied to {{attraction}}, and players decide the outcome.",
      "questions": [
        "Cosmic Carpentry Co. misreads the blueprints and changes one rule of physics inside {{attraction}}. What rule changes?",
        "A bad update from Glitchware Solutions breaks one piece of logic in {{attraction}}. What suddenly makes no sense?",
        "An intern at Quantum Fun Labs flips \"experimental mode,\" and one normal rule in {{attraction}} is now enforced by the characters. What’s the new rule?",
        "A reality ripple passes through {{attraction}} so that one everyday object suddenly becomes super powerful. What object takes over the story?",
        "A time-of-day bug means {{attraction}} gets stuck in one weird lighting or weather effect forever. What extreme setting does it get stuck on?"
      ]
    },
    {
      "id": 3,
      "name": "Mash-up",
      "description": "Combine {{attraction}} with some other IP, park, or genre.",
      "questions": [
        "FlickFuzz buys {{attraction}} and forces a crossover with \"Detective Grandma.\" Where does she appear in {{attraction}}?",
        "A producer from \"Win or Spin\" thinks {{attraction}} should be a competition. Which scene becomes the final challenge?",
        "Neon Possum Press licenses {{attraction}} for a comic crossover. Which moment becomes the big team-up splash page?",
        "A visiting horror director decides to film a low-budget scare special inside {{attraction}}. Which scene becomes the new horror set?",
        "A cozy baking show does a crossover episode in {{attraction}}. Where do they set up the kitchen?"
      ]
    },
    {
      "id": 4,
      "name": "Location Swap",
      "description": "Move {{attraction}} somewhere else and ask what changes.",
      "questions": [
        "A storm from WeatherWrong Inc. blows {{attraction}} into a totally different kind of park. Where does it land?",
        "Dusty Fork, Nevada drops {{attraction}} into their dying mall. Which part clashes the hardest with the mall?",
        "A glitch swaps {{attraction}}'s scenery with another land for a day. Which scene now looks the most wrong?",
        "{{attraction}} is accidentally shipped to the wrong country as a giant crate. When they unpack it, what part looks the strangest there?",
        "The park decides to run {{attraction}} as a pop-up at a county fair. What’s the most awkward thing about the new location?"
      ]
    },
    {
      "id": 5,
      "name": "Memory",
      "description": "Prompt players to share a real memory linked to {{attraction}}.",
      "questions": [
        "The podcast \"Queue Confessions\" asks for your strangest or funniest memory from {{attraction}}. What story do you tell?",
        "Dr. Beatrice Noodle from the Institute of Theme Memory asks for the one moment in {{attraction}} you’ll remember in 20 years. What do you pick?",
        "The documentary \"One Ride, One Story\" asks for the most unexpected thing you’ve seen in {{attraction}}. What do you describe?",
        "A friend who has never ridden {{attraction}} asks, \"What’s the one story you always tell about it?\" What do you share first?",
        "You find an old photo of yourself near {{attraction}} and instantly remember a specific moment. What memory comes back?"
      ]
    },
    {
      "id": 6,
      "name": "Trivia",
      "description": "Invite “I know a thing” answers without needing strict accuracy.",
      "questions": [
        "\"Lore Lords Live\" corners you and demands one \"insider fact\" about {{attraction}}, real or invented. What do you give them?",
        "Professor Milo Gloss is hunting tiny ride secrets. What blink-and-you-miss-it detail in {{attraction}} do you brag about?",
        "Trivia night at The Rusty Turnstile has a {{attraction}} bonus, and your team shoves you up. What oddly specific fact do you share?",
        "A new fan in line asks, \"What’s one thing about {{attraction}} most people miss?\" What detail do you point out?",
        "A rumor thread online wants your best wild theory about {{attraction}}. What theory do you post?"
      ]
    },
    {
      "id": 7,
      "name": "Comparison",
      "description": "Compare {{attraction}} to another attraction, land, park, or company.",
      "questions": [
        "Rival park Adventure Junction tries to copy {{attraction}} but \"improve\" it. What’s the first thing they brag about changing?",
        "\"Ride Rankings Monthly\" asks you to compare {{attraction}} to one other ride in the park. Which ride do you choose?",
        "Debate show \"Ride or Wrong\" asks if {{attraction}} is the older sibling, younger sibling, or weird cousin of another ride. What do you call it?",
        "A park survey asks which ride would make the best double-feature with {{attraction}}. What do you pair it with?",
        "Your friend says {{attraction}} is basically the theme-park version of some movie or TV show. What do you say it is?"
      ]
    },
    {
      "id": 8,
      "name": "Characters",
      "description": "Zoom in on one character, animatronic, or performer choice.",
      "questions": [
        "SideQuest Cinema offers one character from {{attraction}} a low-budget spin-off. Who gets the movie?",
        "StoryFix Consultants asks which character in {{attraction}} you’d politely fire for not fitting the story. Who gets the boot?",
        "RideCon holds a \"Most Underappreciated Character\" award just for {{attraction}}. Who do you nominate?",
        "A cosplay contest based on {{attraction}} lets you pick one character to design. Who do you choose?",
        "A surprise live performer appears in one scene of {{attraction}} for a special event. Which character should suddenly be played by a real person?"
      ]
    },
    {
      "id": 9,
      "name": "Line",
      "description": "Focus on a specific line, sound, or vocal moment from {{attraction}}.",
      "questions": [
        "Messaging app BlipBlop lets attractions send you one text after you ride. What line or soundbite from {{attraction}} shows up?",
        "LoopTone Labs makes a \"Ride Remix Pack.\" Which line, joke, scream, or sound from {{attraction}} becomes your ringtone?",
        "\"Talk O’Clock\" wants you to dramatically read one line from {{attraction}} on TV. Which line do you perform?",
        "A quote wall goes up outside {{attraction}} and needs one line from inside. What line do they paint on it?",
        "A meme account grabs an audio clip from {{attraction}} to loop forever. What bit of dialogue or sound do they use?"
      ]
    },
    {
      "id": 10,
      "name": "Elements",
      "description": "Pick a peak and/or low point: scene, effect, setpiece, etc.",
      "questions": [
        "Fake awards show \"The Trackies\" gives one trophy to the best moment in {{attraction}}. What moment wins?",
        "Review channel \"Mildly Disappointed\" makes you pick the weakest scene in {{attraction}}. Which scene do you roast?",
        "The suggestion box system glitches and only accepts answers that are both a compliment and a complaint about {{attraction}}. What one moment do you pick?",
        "A first-time rider asks, \"What’s the one part of {{attraction}} you always look forward to?\" What do you tell them?",
        "Another friend asks, \"If they quietly removed one tiny thing from {{attraction}}, what would you not miss?\" What do you name?"
      ]
    },
    {
      "id": 11,
      "name": "Storytelling",
      "description": "Ask where {{attraction}}’s storytelling soars or collapses.",
      "questions": [
        "Lila Page from StoryForge Studios asks when you most forget you’re in a park during {{attraction}}. What exact second is it?",
        "ImmersiTech’s Reality Leak Inspectors ask where the illusion breaks hardest in {{attraction}}. What moment do you point to?",
        "\"In or Out?\" pauses a ride-through of {{attraction}} and asks for the frame where the story works best. Which image do you choose?",
        "A script doctor watches {{attraction}} and asks where the story first really clicks for you. What moment do you point out?",
        "During a slow day, you ride {{attraction}} and suddenly notice something that reminds you it’s all just a ride. What do you notice?"
      ]
    },
    {
      "id": 12,
      "name": "Tech",
      "description": "Focus on effects, tech, and “magic” (or lack thereof) in {{attraction}}.",
      "questions": [
        "Marvelo Systems offers to super-charge one effect in {{attraction}} to \"mind-blowing.\" Which effect gets the upgrade?",
        "Rico \"Sparks\" Delgado from Patch & Pray Repair gives you one guaranteed fix just for {{attraction}}. What do you fix?",
        "A bad update from BetaByte Labs makes one piece of tech in {{attraction}} act hilariously wrong. What goes weird?",
        "A behind-the-scenes tour shows you the control room screen for {{attraction}}. What piece of tech are you most curious to watch?",
        "A kid in line asks, \"What’s the most magical effect in {{attraction}} that you hope never breaks?\" What do you answer?"
      ]
    },
    {
      "id": 13,
      "name": "Pacing",
      "description": "Ask about what feels too fast, too slow, or just right in {{attraction}}.",
      "questions": [
        "Dr. Tess Tempo from FlowCraft Inc. hands you 10 bonus seconds of ride time for {{attraction}}. Which moment do you stretch?",
        "The speed slider on {{attraction}} sticks on \"too fast\" for one scene. Which scene turns into a blur?",
        "The Society of Smooth Rides wants one moment in {{attraction}} that’s always too slow or too rushed. What do you name?",
        "A redesign team asks where {{attraction}} should pause just a little longer. What moment would you slow down?",
        "An editor cuts a quick trailer-style version of {{attraction}} and removes one slower bit. What would you sacrifice?"
      ]
    },
    {
      "id": 14,
      "name": "Music",
      "description": "Lean into audio, songs, and iconic loops from {{attraction}}.",
      "questions": [
        "Kiko Rumble from SonicSpell Studios gives you a magic remote to save one musical moment from {{attraction}} forever. What do you pick?",
        "The soundboard at {{attraction}} glitches so one sound effect plays at the wrong time all day. Which sound gets misplaced?",
        "Karaoke bar Off-Key Oasis hosts \"Attraction Night\" and needs one song or musical moment from {{attraction}} for everyone to sing. What do you choose?",
        "A lo-fi remix on a streaming app loops one bit of {{attraction}}’s audio. Which tiny clip becomes the track?",
        "An announcer’s voice from {{attraction}} starts living rent-free in your head. What line do you keep hearing?"
      ]
    },
    {
      "id": 15,
      "name": Pre/Post",
      "description": "Focus on phases around {{attraction}}: queue, preshow, postshow.",
      "questions": [
        "QueueTube’s \"Lines We Loved\" gives {{attraction}}’s queue an episode. What recurring gag, detail, or mini-story do they feature?",
        "Darren Dramatic from StageRight Co. adds one surprise to wake everyone up before {{attraction}}. Where does it hit?",
        "The postshow of {{attraction}} becomes a tiny museum curated by an overexcited intern. What do they proudly put on display?",
        "A bored guest in the queue asks, \"What’s the one detail in this line I should be watching for?\" What do you tell them?",
        "The preshow suddenly needs a quick audience participation moment. What simple thing do you have the crowd do?"
      ]
    },
    {
      "id": 16,
      "name": "Sensory",
      "description": "Ask about non-visual sensory details inside {{attraction}}.",
      "questions": [
        "AromaVerse adds one brand-new signature smell to {{attraction}}. What does it smell like?",
        "A wind machine from GustyWorks is installed in the wrong spot and fires at full blast sometimes. Where in {{attraction}} would it be funniest?",
        "A 4D test cranks one physical sensation in {{attraction}} (vibration, mist, heat, etc.) way too high. Which scene does it overwhelm?",
        "A \"mystery scent\" game in {{attraction}} challenges you to guess one smell. What scent should they use?",
        "One scene in {{attraction}} suddenly adds a surprising texture to the ride vehicle or set. What do guests reach out and feel?"
      ]
    },
    {
      "id": 17,
      "name": "Hot Take",
      "description": "Invite spicy opinions and debates about {{attraction}}.",
      "questions": [
        "The podcast \"Spicy Queue Takes\" hands you a mic after {{attraction}} and wants one opinion that might get you booed. What do you say?",
        "UnderRated Rides Weekly asks for one tiny moment in {{attraction}} that deserves more love. What do you pick?",
        "Review app BluntPark asks, \"What’s one thing about {{attraction}} everyone praises that you just don’t get?\" What’s your answer?",
        "A debate thread asks, \"Is {{attraction}} better in the daytime or at night?\" What’s your stance?",
        "Your group argues over whether {{attraction}} is a must-do or skippable. What’s your hottest take?"
      ]
    },
    {
      "id": 18,
      "name": "Redesign",
      "description": "Let players act as Imagineers making surgical changes to {{attraction}}.",
      "questions": [
        "Tweak & Tinker Imagineering gives you just enough budget to redesign one scene in {{attraction}}. Which scene do you pick?",
        "BeanCounter Enterprises demands that one scene in {{attraction}} be cut entirely. Which one goes?",
        "The Grand Council of Overbuilding lets you turn a small moment in {{attraction}} into a giant setpiece. What gets promoted?",
        "A quick-fix team asks for one tiny change that would make {{attraction}} flow better. What do you suggest?",
        "A blue-sky meeting asks for one wild, unrealistic upgrade to {{attraction}}. What’s your big swing?"
      ]
    },
    {
      "id": 19,
      "name": "New",
      "description": "Add a new element that fits inside {{attraction}}.",
      "questions": [
        "Hannah Draft from StoryGlue Studios says there’s room for one new scene in {{attraction}}. Where do you insert it?",
        "Character Crafter Co. wants one new side character that guests instantly love in {{attraction}}. Who do you invent?",
        "A prop artist from OddObject Outfitters sneaks a ridiculous object into a serious scene in {{attraction}}. What prop do they hide?",
        "A holiday overlay adds one seasonal moment into {{attraction}} without changing the whole ride. What small scene do you add?",
        "A tiny Easter egg character appears only once in {{attraction}} for fans to hunt for. What do they look like?"
      ]
    },
    {
      "id": 20,
      "name": "Backstage",
      "description": "Peel back the curtain or imagine a “secret level” of {{attraction}}.",
      "questions": [
        "Night shift supervisor Gus Lantern reveals a secret \"after hours\" version of {{attraction}} just for staff. What extra rule or scene do they add?",
        "BehindTheRide Tours lets you freeze {{attraction}} anywhere and walk through it backstage. Which moment do you pause?",
        "A power outage stops {{attraction}} with lights on, and a Backstage Buddy Co. guide explains what you see. In which scene is that tour most fascinating?",
        "A \"cast party\" version of {{attraction}} runs once a year with inside jokes hidden everywhere. What’s one inside joke you’d add?",
        "A secret maintenance door in {{attraction}} opens into a tiny hidden room. What’s inside that only staff usually see?"
      ]
    },
    {
      "id": 21,
      "name": "Marketing",
      "description": "Turn {{attraction}} into a brand or piece of key art.",
      "questions": [
        "Slogan & Soda wins the {{attraction}} ad contract and needs a dramatic tagline. What line goes on the posters?",
        "For one day, you can rename {{attraction}} to lure thrill seekers. What new name goes on the marquee?",
        "\"Rides Rebranded\" wants you to pitch {{attraction}} like a blockbuster. What title do you give it?",
        "A minimalist t-shirt design prints just the name of {{attraction}} and a short phrase. What phrase do they use?",
        "A retro-style travel poster advertises {{attraction}} like a vacation spot. What headline do they print?"
      ]
    },
    {
      "id": 22,
      "name": "Tie-In",
      "description": "Attach food, merch, or collectibles to {{attraction}}.",
      "questions": [
        "CraveCarts Co. gets to make one exclusive treat for {{attraction}}. What snack do they sell at the exit?",
        "BoldPossum Goods wants the most over-the-top souvenir for {{attraction}}. What ridiculous item do fans buy?",
        "A limited \"Ride Crate\" subscription sends one mystery item themed to {{attraction}}. What’s the first item?",
        "A snack cart in the queue for {{attraction}} can serve one on-theme drink. What are people sipping?",
        "A wearable piece of merch instantly tells other fans you love {{attraction}}. What’s the item?"
      ]
    },
    {
      "id": 23,
      "name": "Emotions",
      "description": "Ask about feelings, moods, and vibes of {{attraction}}.",
      "questions": [
        "Daria Glow from FeelFactor Labs asks for three words that sum up {{attraction}}’s vibe. What are they?",
        "A \"ride mood ring\" app tracks your peak joy, fear, or awe on {{attraction}}. When does your meter spike?",
        "The zine \"Theme Feels Quarterly\" wants a one-sentence line: \"{{attraction}} feels like ___.\" How do you fill it in?",
        "You’re describing {{attraction}} to a friend who hates spoilers. What feeling do you promise it will give them?",
        "After riding {{attraction}}, what’s the first single word that pops into your head?"
      ]
    },
    {
      "id": 24,
      "name": "Time Travel",
      "description": "Shift {{attraction}} into a different time period.",
      "questions": [
        "Vince Meridian from Epoch Rides pitches a \"1989 Edition\" of {{attraction}}. What’s the most obvious change?",
        "A \"future week\" overlay jumps {{attraction}} 50 years ahead. What futuristic detail has to show up?",
        "ChronoGo Tours accidentally blends two eras inside {{attraction}}. Which scene is funniest half-modern and half another decade?",
        "A vintage version of {{attraction}} from decades ago suddenly appears. What old-fashioned detail do you immediately notice?",
        "For one day, {{attraction}} runs as a \"historical documentary\" version. What era does it focus on?"
      ]
    },
    {
      "id": 25,
      "name": "Content Creator",
      "description": "Answer as if you’re making a TikTok, vlog, or photo about {{attraction}}.",
      "questions": [
        "ClipStorm hires you to capture one 10-second viral clip from {{attraction}}. What moment do you film?",
        "FlashFable wants one photo inside {{attraction}} that nails its personality. What are you shooting?",
        "\"Queue Chaos Live\" shoves the camera at you mid-ride and says, \"Explain this in one sentence.\" What do you say?",
        "A photo spot sign for {{attraction}} marks one perfect selfie location. Where is it?",
        "A caption challenge asks you to sum up {{attraction}} in one short post. What’s your caption?"
      ]
    },
    {
      "id": 26,
      "name": "Lessons",
      "description": "Treat {{attraction}} like a fable or parable.",
      "questions": [
        "Jasper Glow’s book \"Everything I Needed to Know I Learned in a Theme Park\" needs the lesson of {{attraction}}. What moral do you give him?",
        "A school counselor using rides as metaphors asks what advice {{attraction}} would give a nervous kid. What would it say?",
        "PeakCheese Prints wants a motivational quote that sums up {{attraction}} over a sunset. What line do you write?",
        "A teacher asks you to explain {{attraction}} as if it were a fable. What’s the quick lesson at the end?",
        "A friend says, \"Okay, but what does {{attraction}} actually teach you?\" What’s your answer?"
      ]
    },
    {
      "id": 27,
      "name": "Lore",
      "description": "Fix plot holes or extend {{attraction}}’s story.",
      "questions": [
        "Nia Ledger from The Lore Library gives you one sentence to add to {{attraction}}’s official backstory. What sentence do you add?",
        "Fan forum PlotHole Patrol has one big unanswered question about {{attraction}}. What detail would you fix with a single line?",
        "A \"director’s cut\" of {{attraction}} gets a commentary track. At which moment would you pause to reveal a secret backstory?",
        "A new official map needs one extra line of lore text about {{attraction}}. What do you write under its name?",
        "A prequel comic explains one mystery from {{attraction}}. What mystery finally gets an answer?"
      ]
    },
    {
      "id": 28,
      "name": "Disruption",
      "description": "Players imagine themselves causing harmless chaos inside {{attraction}}.",
      "questions": [
        "ChaosCo Simulations lets one guest push a big red \"Mild Mayhem\" button on {{attraction}}. You’re picked. What harmless chaos happens?",
        "You trip in the queue and something flies out of your bag into {{attraction}}, stuck there forever. What did you accidentally donate?",
        "Mischief gang The Banana Bandits sneaks into {{attraction}} and leaves bananas everywhere. Where do you hide them so they sort of fit the story?",
        "A tired dad in your group yells something at exactly the wrong time in {{attraction}} and accidentally makes it funnier. What does he yell?",
        "You and your friends all react in the same silly way at one moment in {{attraction}}. What do you all do at once?"
      ]
    },
    {
      "id": 29,
      "name": "Cast Members",
      "description": "Imagine {{attraction}} from a staff member’s point of view.",
      "questions": [
        "The tell-all \"I Worked That Ride\" collects wild staff stories. As a {{attraction}} Cast Member, what story would you submit?",
        "CalmChaos Coaching needs a \"hardest part of the job\" scenario for new hires on {{attraction}}. What situation do you design?",
        "\"Ride Staff Confessions\" asks for one imaginary behind-the-scenes story from working {{attraction}}. What do you confess?",
        "A training video shows the moment most likely to make a new Cast Member panic on {{attraction}}. What’s happening?",
        "A veteran Cast Member says, \"There’s one thing guests do on {{attraction}} that always makes me laugh.\" What is it?"
      ]
    },
    {
      "id": 30,
      "name": "Sponsor",
      "description": "Treat {{attraction}} like an over-sponsored TV show.",
      "questions": [
        "MegaMirth Corp. slaps a huge sponsor on {{attraction}}. Which fake company takes over, and what do they plug?",
        "A joke \"commercial break\" plays before {{attraction}} during a special event. What fake ad runs?",
        "The park sends the {{attraction}} sponsorship pitch to the wrong company (dentist chain, sock brand, salad dressing, etc.). Which absurd sponsor signs on?",
        "A cheesy announcer has to mention the sponsor during the ride spiel for {{attraction}}. What ridiculous line do they add?",
        "Limited-edition packaging for a random grocery product suddenly features {{attraction}}. What product is it on?"
      ]
    },
    {
      "id": 31,
      "name": "Movie Title",
      "description": "Come up with a movie name based on {{attraction}}.",
      "questions": [
        "Turnstile Pictures adapts {{attraction}} into a movie with a dramatic title and cheesy subtitle. What full name do you give it?",
        "Film fest \"From Queue to Screen\" wants a fake cult classic movie based on {{attraction}}. What’s on the VHS tape label?",
        "Midnight Popcorn Films orders a low-budget horror or comedy spin on {{attraction}}. What delightfully over-the-top title do you use?",
        "A straight-to-streaming holiday special is loosely based on {{attraction}}. What’s its corny title?",
        "A mockumentary about superfans of {{attraction}} gets made. What’s the movie called?"
      ]
    },
    {
      "id": 32,
      "name": "Music Gig",
      "description": "Come up with band names, songs, or albums inspired by {{attraction}}.",
      "questions": [
        "Your band The Junkoids must write a hit song about {{attraction}} for Broken Turnstile Records. What’s the song’s title?",
        "RideStock asks you to rename your band for a show on a {{attraction}}-themed stage. What name do you use?",
        "Station 99.9 The Queue introduces a tribute band that only sings about {{attraction}}. What’s the band called, and what’s their first album called?",
        "A pop star drops a surprise single inspired by {{attraction}}. What’s the track called?",
        "A cover band plays nothing but reworked ride music from {{attraction}}. What do they call their tour?"
      ]
    }
  ]
};
