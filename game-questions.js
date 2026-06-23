const GAME_QUESTIONS = {
  "categories": [
    {
      "id": 1,
      "name": "Cast Member Roleplay",
      "description": "Imagine you work at {{attraction}} and step into onstage roles.",
      "questions": [
        "You’ve just been hired at {{attraction}}—what would your dream cast member role be?",
        "You’re filling out your new name tag at {{attraction}}—what fake name are you putting on it?",
        "Casting gets wild and opens a role just for you—if you joined {{attraction}} as a live character, who would you be?",
        "For one day you’re turned into an animatronic—if you had to play one figure in {{attraction}}, which would you be and why?",
        "You’re stationed as the front greeter with a mic—if you were greeting at {{attraction}}’s entrance, what would be your go‑to line?"
      ]
    },
    {
      "id": 2,
      "name": "Wild What-Ifs",
      "description": "Break the rules inside {{attraction}} and imagine outrageous twists.",
      "questions": [
        "Tonight all the rules vanish inside {{attraction}}—what ridiculous activity would you love to do on the attraction?",
        "The creative team wants a more emotional version—if you had to make {{attraction}} sad and emotional, what would you change?",
        "You’re about to speak in a very opinionated fan group—what opinion about {{attraction}} would probably get you booed by other fans?",
        "Your friend says, “Give me your spiciest take”—what’s your absolute hottest take about {{attraction}}?",
        "You’re picturing the tweak that would set social media on fire—what single change to {{attraction}} do you think would make fans furious?",
        "The genie offers to remove one annoyance forever—if you could delete one annoyance from {{attraction}}, what would it be?"
      ]
    },
    {
      "id": 3,
      "name": "Mash-Ups & Crossovers",
      "description": "Blend {{attraction}} with other stories, parks, and formats.",
      "questions": [
        "The Disney multiverse is colliding—if {{attraction}} crossed over with any other Disney IP, what wild mash‑up would you create?",
        "The park is hosting a “attraction fusion festival”—if {{attraction}} crossed over with any other attraction, what wild mash‑up would you create?",
        "Management decides to relocate a headliner—if you picked up {{attraction}} and moved it to another park, where would it fit best?",
        "A film studio wants to adapt the experience—if {{attraction}} were a movie, what movie would it feel most like?",
        "A streaming service orders a new series—if {{attraction}} were a TV show, what show would it feel most like?",
        "The multiverse has opened across the park—if you could drop any other Disney character into {{attraction}}, who joins the story?",
        "You’re building your personal “same tier” list—what other attraction do you rank exactly the same as this one?"
      ]
    },
    {
      "id": 4,
      "name": "Reimagining the attraction",
      "description": "Change the attraction system, structure, or major scenes.",
      "questions": [
        "Creative leadership wants to change everything—if you could turn {{attraction}} into a totally different attraction type, what would it become?",
        "The story team wants a new opening—how would you change the beginning of {{attraction}}?",
        "The finale needs a fresh payoff—how would you change the ending of {{attraction}}?",
        "You’ve been handed the blueprints and a free hand—what is the one part of {{attraction}} you’d most like to redesign from scratch?",
        "There’s room for one more show scene on the track—where would you add a brand new scene in {{attraction}}, and what would happen in it?",
        "Holiday season is coming and overlays are on the table—what holiday overlay scene would you add to {{attraction}} for a seasonal version?",
        "A spin‑off mini‑attraction is being planned—which scene in {{attraction}} deserves to be expanded into its own mini‑attraction?",
        "A blank check lands on the Imagineers’ desk—if budget didn’t matter at all, what wild upgrade would you add to {{attraction}}?"
      ]
    },
    {
      "id": 5,
      "name": "Marketing & Branding",
      "description": "Turn {{attraction}} into shows, brands, and slogans.",
      "questions": [
        "You’re driving down a lonely highway and spot a familiar logo—if {{attraction}} were a roadside attraction, what would the big billboard outside say?",
        "A producer wants to take {{attraction}} to Broadway—if it became a stage musical, what would its over‑the‑top title be?",
        "The year is 1994 and your attraction becomes TV—if {{attraction}} were a 90s sitcom, what would its cheesy title be?",
        "Merchandising has gone absolutely wild—what’s the most over‑the‑top souvenir you can imagine for {{attraction}}?",
        "Marketing asks for a tiny tagline—what three words best describe the overall vibe of {{attraction}}?",
        "You’re designing a motivational poster for the break room—what motivational quote could you write that sums up {{attraction}}?",
        "Corporate sponsorship arrives in the funniest way—what fake company would be the funniest sponsor for {{attraction}}?",
        "You’ve been told to work the sponsor into the script—what cheesy line would you add to the spiel to awkwardly mention that sponsor?"
      ]
    },
    {
      "id": 6,
      "name": "Food & Flavor",
      "description": "Snacks, eateries, and the taste and smell of {{attraction}}.",
      "questions": [
        "A tiny kiosk spot opens right beside the exit—if you built a themed eatery next to {{attraction}}, what would you serve?",
        "You’re grabbing a bite between attraction times—what’s your ideal snack to eat right before or after riding {{attraction}}?",
        "You’ve been given the tiniest snack cart imaginable—what would you serve at a snack stand based on {{attraction}}?",
        "The park approves a full quick‑service concept—you’re designing a quick‑service spot beside {{attraction}}; what’s the signature dish?",
        "An aromatics company wants a new signature scent—if {{attraction}} got its own fragrance, what would it smell like?",
        "You’ve just stepped off and someone asks, “What does it smell like in there?”—describe the smell of {{attraction}} in three words or less."
      ]
    },
    {
      "id": 7,
      "name": "Memories & Feelings",
      "description": "Share personal stories and emotional reactions to {{attraction}}.",
      "questions": [
        "You’re telling stories to friends who’ve never been—what’s the funniest or strangest real memory you have from {{attraction}}?",
        "You’re flipping through your memories years from now—what moment from {{attraction}} do you think you’ll still remember in 20 years?",
        "You’re stepping off still catching your breath—what’s the first single word that comes to mind when you step off {{attraction}}?",
        "You’re chasing that classic Disney feeling—when does {{attraction}} hit pure “Disney magic” for you?",
        "You’re so wrapped up you forget where you are—during {{attraction}}, when do you feel the most completely immersed?",
        "The spell suddenly slips—during {{attraction}}, when does the illusion totally fall apart for you?"
      ]
    },
    {
      "id": 8,
      "name": "Trivia & Hidden Details",
      "description": "Dig into facts, rumors, and Easter eggs around {{attraction}}.",
      "questions": [
        "You’re playing tour guide in the queue—what tiny detail in {{attraction}} do you love pointing out to people?",
        "You’ve watched attractionrs sail past without noticing something great—what little element in {{attraction}} do you think almost everyone misses?",
        "You’re sharing “fun facts” with your group—what’s your favorite real trivia fact about {{attraction}}?",
        "You’re writing a parody guidebook—what completely fake trivia fact about {{attraction}} do you wish were true?",
        "You’re on a hidden‑details mission—what’s your favorite hidden Mickey in {{attraction}}, real or one you just made up?",
        "You’re hiding secrets in plain sight—where would you hide a hidden Mickey inside {{attraction}}?"
      ]
    },
    {
      "id": 9,
      "name": "Music & Voice",
      "description": "Turn {{attraction}} into songs, bands, and performances.",
      "questions": [
        "A songwriter is composing a track inspired by the attraction—if {{attraction}} were a song, what would its title be?",
        "You walk away humming without thinking—what melody or musical moment from {{attraction}} gets stuck in your head all day?",
        "You’re recasting the audio for a remaster—whose voice performance in {{attraction}} is the absolute best?",
        "You’re putting together a themed concept band—what would you name a band that only sings about {{attraction}}?",
        "A producer wants one big radio‑ready track—what would you call a pop single that’s inspired by {{attraction}}?",
        "The script is written but the narrator is your call—who would you get to narrate {{attraction}}?"
      ]
    },
    {
      "id": 10,
      "name": "Characters & Casting",
      "description": "Recast, spotlight, or cut the characters of {{attraction}}.",
      "questions": [
        "Imagine one character gets their name on the marquee—which character from {{attraction}} deserves their own spin‑off attraction or show?",
        "Casting is rebalancing screen time—which underused character in {{attraction}} needs way more spotlight?",
        "A tough cut has to be made—which existing character in {{attraction}} would you remove entirely?",
        "You’re ranking the stars of the show—which animatronic in {{attraction}} is your favorite?",
        "A new figure is being designed—what kind of animatronic would you add to {{attraction}}?",
        "One performer is about to get a much bigger moment—which animatronic in {{attraction}} deserves an entire scene built around them?"
      ]
    },
    {
      "id": 11,
      "name": "Queue & Preshow",
      "description": "Focus on the build‑up to {{attraction}}: line, preshow, and post‑show.",
      "questions": [
        "You’re stuck in the preshow yet again—what annoys you the most about the preshow for {{attraction}}?",
        "You’re replaying the “show before the show” in your head—what preshow moment from {{attraction}} sticks with you the most?",
        "The setup is getting a total reboot—if you could completely swap out the preshow for {{attraction}}, what would happen instead?",
        "The preshow needs more guest interaction—what simple audience participation bit would you add to the preshow for {{attraction}}?",
        "You’ve stood in this line more times than you can count—what’s the best part of the queue for {{attraction}}?",
        "You’re staring at a corner of the line wondering why it exists—what’s the most pointless or boring part of the queue for {{attraction}}?",
        "Every time you enter the queue you look for one thing—what queue detail in {{attraction}} do you always look for every time?",
        "You’re replaying the warm‑up in your mind—what is your all‑time favorite preshow moment for {{attraction}}?",
        "The exit area is being redesigned from scratch—if you could completely swap out the post‑show for {{attraction}}, what would you put there instead?",
        "The exit has turned into an exhibit gallery—if the post‑show for {{attraction}} became a mini museum, what’s the first artifact you’d display?"
      ]
    },
    {
      "id": 12,
      "name": "Scenes & Setpieces",
      "description": "Zoom in on best, worst, and most memorable moments in {{attraction}}.",
      "questions": [
        "You only get to keep one moment—what’s the single best moment inside {{attraction}}?",
        "A scene has to be reworked or removed—what’s the weakest scene in {{attraction}} that you’d call out?",
        "You’re half‑watching the clock, waiting for “that part”—what’s the one moment in {{attraction}} you always look forward to?",
        "You’re sketching layouts like an Imagineer—what’s the coolest setpiece inside {{attraction}}?",
        "You’re deciding which sets to refurbish first—what’s the least impressive or most boring setpiece in {{attraction}}?",
        "You scroll through fan comments and shrug—what moment in {{attraction}} do you think is the most overrated?",
        "You’re defending a deep cut on a podcast—what moment in {{attraction}} do you think is the most underrated?",
        "You attraction and catch yourself checking your watch—what part of {{attraction}} always drags and feels too long?",
        "You wish the attraction would slow down for a beat—what part of {{attraction}} should hang just a little bit longer?",
        "The attraction breaks down and you’re walked off mid‑scene—what’s the best part of {{attraction}} to get evacuated from and walk through?"
      ]
    },
    {
      "id": 13,
      "name": "Tech & Effects",
      "description": "Talk about the illusions, effects, and show tech in {{attraction}}.",
      "questions": [
        "Engineers ask which gag needs help most—which effect in {{attraction}} really needs an upgrade?",
        "You’re bragging to a friend about the wow factor—which effect in {{attraction}} impresses you the most right now?",
        "You spot a gag that just doesn’t sell the illusion—which effect in {{attraction}} looks the fakest to you?"
      ]
    },
    {
      "id": 14,
      "name": "Comparisons & Rankings",
      "description": "Compare {{attraction}} to lines, lands, and other attractions.",
      "questions": [
        "You’re ranking everything in {{land}} for a blog—how does {{attraction}} stack up against the other attractions there?",
        "You’ve just stepped off another attraction and walked straight here—how does {{attraction}} compare to the last attraction you rode today?",
        "You’re forced to rank your loyalties in {{land}}—where does {{attraction}} rank among the attractions there, and why?",
        "You’re walking past and check the wait time sign—what’s the longest you would honestly wait in line for {{attraction}}?"
      ]
    },
    {
      "id": 15,
      "name": "Story & Theme",
      "description": "Treat {{attraction}} like a story, poem, or fable.",
      "questions": [
        "You’re turning the attraction into a storybook—if {{attraction}} were a fable, what quick moral would appear at the end?",
        "You’ve been given one line to sum it all up—write a one‑line poem about {{attraction}}.",
        "You’re telling tall tales in the cast break room—starting with “Back when I worked {{attraction}}…”, what imaginary story do you tell?"
      ]
    },
    {
      "id": 16,
      "name": "Media & Moments",
      "description": "Capture {{attraction}} in clips, photos, and social posts.",
      "questions": [
        "You only get ten seconds to film—what 10‑second moment from {{attraction}} would make the best viral clip?",
        "You can snap exactly one photo inside—what single photo from {{attraction}} would perfectly capture its personality?"
      ]
    },
    {
      "id": 17,
      "name": "Props & Chaos",
      "description": "Swap, steal, or joke about props inside {{attraction}}.",
      "questions": [
        "A key prop from the preshow has mysteriously vanished—if someone stole it from {{attraction}}, what ridiculous thing would you replace it with?",
        "A set piece disappears mid‑attraction and needs a stand‑in—if someone stole a prop from inside {{attraction}}, what silly replacement would you put in?"
      ]
    },
    {
      "id": 18,
      "name": "Legacy & Classic",
      "description": "Decide what should stay or go in {{attraction}}’s legacy.",
      "questions": [
        "The preservation committee must protect one thing forever—what classic element in {{attraction}} should never, ever be changed?",
        "That same committee agrees one thing can finally retire—what classic element in {{attraction}} do you think should finally go?"
      ]
    },
    {
      "id": 19,
      "name": "Meta & Location",
      "description": "Step outside the attraction and imagine new ways to experience {{attraction}}.",
      "questions": [
        "You’re snuck in recording gear and a co‑host—what location on {{attraction}} would you most want to do a podcast from?",
        "You’re walking past and check the wait time sign—what’s the longest you would honestly wait in line for {{attraction}}?"
      ]
    }
  ]
};
