const GAME_QUESTIONS = {
  "categories": [
    {
      "id": 1,
      "name": "Cast Member Roleplay",
      "description": "Imagine you work at {{attraction}} and step into onstage roles.",
      "questions": [
        "You’ve just been hired at {{attraction}}—what would your dream cast member role be?",
        "You’re filling out your new name tag at {{attraction}}—what fake name are you putting on it?",
        "If you were the replacement for a character in {{attraction}}, who would it be?",
        "You’re a greeter at {{attraction}} - what is your go‑to line?",
        "What cast member role on {{attraction}} would you least like to have?",
        "Starting with “Back when I worked {{attraction}}…”, what imaginary story do you tell?"
      ]
    },
    {
      "id": 2,
      "name": "What-Ifs",
      "description": "Break the rules inside {{attraction}} and imagine outrageous twists.",
      "questions": [
        "What outlandish activity would you love to do on {{attraction}}?",
        "If you were asked to make {{attraction}} sad, what would you change?",
        "If you were asked to make {{attraction}} scary, what would you change?",
        "What opinion about {{attraction}} would probably get you booed by other fans?",
        "What’s your absolute hottest take about {{attraction}}?",
        "What single change to {{attraction}} do you think would make fans furious?",
        "If you could delete one annoyance from {{attraction}}, what would it be?"
      ]
    },
    {
      "id": 3,
      "name": "Mash-Ups & Crossovers",
      "description": "Blend {{attraction}} with other stories, parks, and formats.",
      "questions": [
        "If {{attraction}} crossed over with any other IP, what mash‑up would you create?",
        "What character from another attraction in {{park}} would you bring to {{attraction}}?",
        "If {{attraction}} crossed over with any other attraction, what mash‑up would you create?",
        "If you had to pick up {{attraction}} and moved it to another park, where would it fit best?",
        "If {{attraction}} were a direct-to-streaming movie, what would its title be?",
        "If {{attraction}} were a song, what would its title be?",
        "If you could drop any other character into {{attraction}}, who joins the story?",
        "Where in {{attraction}} would you add the character YOU to the attraction?",
        "What other attraction do you rank exactly the same as this one?"
      ]
    },
    {
      "id": 4,
      "name": "Reimagining the attraction",
      "description": "Change the attraction system, structure, or major scenes.",
      "questions": [
        "If you could turn {{attraction}} into a totally different attraction type, what would it become?",
        "How would you change the beginning of {{attraction}}?",
        "How would you change the ending of {{attraction}}?",
        "What is the one part of {{attraction}} you’d most like to redesign from scratch?",
        "Where would you add a brand new scene in {{attraction}}, and what would happen in it?",
        "What holiday overlay scene would you add to {{attraction}} for a seasonal version?",
        "Which scene in {{attraction}} deserves to be expanded into its own mini‑attraction?",
        "If budget didn’t matter at all, what wild upgrade would you add to {{attraction}}?"
      ]
    },
    {
      "id": 5,
      "name": "Marketing & Branding",
      "description": "Turn {{attraction}} into shows, brands, and slogans.",
      "questions": [
        "If {{attraction}} were a roadside attraction, what would the big billboard outside say?",
        "If {{attraction}} became a stage musical, what would its over‑the‑top title be?",
        "If {{attraction}} were a 90s sitcom, what would its title be?",
        "What’s the hottest souvenir you can imagine for {{attraction}}?",
        "What three words best describe the overall vibe of {{attraction}}?",
        "What quote could you write that sums up {{attraction}}?",
        "What fake company would be the funniest sponsor for {{attraction}}?",
        "What fake sponsor line would you add to {{attraction}}?"
      ]
    },
    {
      "id": 6,
      "name": "Food & Flavor",
      "description": "Snacks, eateries, and the taste and smell of {{attraction}}.",
      "questions": [
        "If you built a themed eatery next to {{attraction}}, what would you call it?",
        "What’s your ideal snack to eat right before or after riding {{attraction}}?",
        "What would you serve at a snack stand based on {{attraction}}?",
        "You’re designing a quick‑service spot beside {{attraction}} - what’s the signature dish?",
        "If {{attraction}} got its own fragrance, what would it be called?",
        "Describe the smell of {{attraction}} in three words or less."
      ]
    },
    {
      "id": 7,
      "name": "Memories & Feelings",
      "description": "Share personal stories and emotional reactions to {{attraction}}.",
      "questions": [
        "What’s the strongest real memory you have from your first time on {{attraction}}?",
        "What moment from {{attraction}} do you think you’ll still remember in 20 years?",
        "What’s the first single word that comes to mind when you step off {{attraction}}?",
        "When do you feel the most completely immersed on {{attraction}}?",
        "When does the illusion totally fall apart for you on {{attraction}}?"
      ]
    },
    {
      "id": 8,
      "name": "Trivia & Hidden Details",
      "description": "Dig into facts, rumors, and Easter eggs around {{attraction}}.",
      "questions": [
        "What detail in {{attraction}} do you love pointing out to people?",
        "What little element in {{attraction}} do you think almost everyone misses?",
        "What’s your favorite real trivia fact about {{attraction}}?",
        "What completely fake trivia fact about {{attraction}} do you wish were true?",
        "What’s your favorite hidden Mickey in {{attraction}}, real or one you just made up?",
        "Where would you hide a hidden Mickey inside {{attraction}}?"
        "What easter egg would you add to {{attraction}}?"
      ]
    },
    {
      "id": 9,
      "name": "Music & Voice",
      "description": "Turn {{attraction}} into songs, bands, and performances.",
      "questions": [
        "If {{attraction}} were a song, what would its title be?",
        "What melody or musical moment from {{attraction}} gets stuck in your head all day?",
        "Whose voice performance in {{attraction}} is the absolute best?",
        "What would you name a band that only sings about {{attraction}}?",
        "What would you call a pop single that’s inspired by {{attraction}}?",
        "What celebrity would you get to narrate {{attraction}}?"
      ]
    },
    {
      "id": 10,
      "name": "Characters & Casting",
      "description": "Recast, spotlight, or cut the characters of {{attraction}}.",
      "questions": [
        "Which character from {{attraction}} deserves their own spin‑off attraction?",
        "Which underused character in {{attraction}} needs way more spotlight?",
        "Which existing character in {{attraction}} would you remove entirely?",
        "Which animatronic in {{attraction}} is your favorite?",
        "What kind of animatronic would you add to {{attraction}}?",
        "Which animatronic in {{attraction}} deserves an entire scene built around them?"
      ]
    },
    {
      "id": 11,
      "name": "Queue & Preshow",
      "description": "Focus on the build‑up to {{attraction}}: line, preshow, and post‑show.",
      "questions": [
        "What do you like the most about the preshow for {{attraction}}?",
         "What annoys you the most about the preshow for {{attraction}}?",
        "What preshow moment from {{attraction}} sticks with you the most?",
        "If you could completely swap out the preshow for {{attraction}}, what would happen instead?",
        "What simple audience participation bit would you add to the preshow for {{attraction}}?",
        "What’s the best part of the queue for {{attraction}}?",
        "What’s the most pointless or boring part of the queue for {{attraction}}?",
        "What queue detail in {{attraction}} do you always look for every time?",
        "If you could completely swap out the post‑show for {{attraction}}, what would you put there instead?",
        "If the post‑show for {{attraction}} became a mini museum, what’s the first {{land}} artifact you’d display?"
      ]
    },
    {
      "id": 12,
      "name": "Scenes & Setpieces",
      "description": "Zoom in on best, worst, and most memorable moments in {{attraction}}.",
      "questions": [
        "What’s the single best moment inside {{attraction}}?",
        "What’s the weakest scene in {{attraction}} that you’d call out?",
        "What’s the one moment in {{attraction}} you always look forward to?",
        "What’s the coolest setpiece inside {{attraction}}?",
        "What’s the least impressive or most boring setpiece in {{attraction}}?",
        "What {{attraction}} moment do you think is the most overrated?",
        "What {{attraction}} moment do you think is the most underrated?",
        "What part of {{attraction}} always drags and feels too long?",
        "What part of {{attraction}} should hang just a little bit longer?",
        "What’s the best part of {{attraction}} to get evacuated from?"
      ]
    },
    {
      "id": 13,
      "name": "Tech & Effects",
      "description": "Talk about the illusions, effects, and show tech in {{attraction}}.",
      "questions": [
        "Which effect in {{attraction}} really needs an upgrade?",
        "Which effect in {{attraction}} impresses you the most?",
        "Which effect in {{attraction}} looks the fakest to you?"
      ]
    },
    {
      "id": 14,
      "name": "Comparisons & Rankings",
      "description": "Compare {{attraction}} to lines, lands, and other attractions.",
      "questions": [
        "How does {{attraction}} stack up against the other attractions in {{land}}?",
        "How does {{attraction}} stack up against the other attractions in {{park}}?",
        "How does {{attraction}} compare to the last attraction you rode in {{park}} today?",
        "Where does {{attraction}} rank among the attractions in {{land}} and why?",
        "What’s the longest you would wait in line for {{attraction}}?"
      ]
    },
    {
      "id": 15,
      "name": "Story & Theme",
      "description": "Treat {{attraction}} like a story, poem, or fable.",
      "questions": [
        "If {{attraction}} were a fable, what moral would appear at the end?",
        "Write a one‑line poem about {{attraction}}."
      ]
    },
    {
      "id": 16,
      "name": "Media & Moments",
      "description": "Capture {{attraction}} in clips, photos, and social posts.",
      "questions": [
        "What 10‑second moment from {{attraction}} would make the best viral clip?",
        "What single photo from {{attraction}} would you enter in a photo contest?"
      ]
    },
    {
      "id": 17,
      "name": "Props & Chaos",
      "description": "Swap, steal, or joke about props inside {{attraction}}.",
      "questions": [
        "If someone stole a prop from {{attraction}}, what would you replace it with?",
        "If someone stole a prop from {{attraction}}'s queue, what would you replace it with?",
        "If someone stole a prop from {{attraction}}, what prop from another {{land}} would you put in its place?"
      ]
    },
    {
      "id": 18,
      "name": "Legacy & Classic",
      "description": "Decide what should stay or go in {{attraction}}’s legacy.",
      "questions": [
        "What classic element in {{attraction}} should never, ever be changed?",
        "What classic element in {{attraction}} do you think should finally go?"
      ]
    },
    {
      "id": 19,
      "name": "Meta & Location",
      "description": "Step outside the attraction and imagine new ways to experience {{attraction}}.",
      "questions": [
        "What location on {{attraction}} would you most want to do a podcast from?"
      ]
    },
     {
      "id": 20,
  "name": "Showtime & Performance",
  "description": "Questions that treat {{attraction}} like a live show or performance.",
  "questions": [
    // Cast Member Roleplay / performer POV
    "You’ve just been hired at {{attraction}}—what would your dream cast member role be?",
    "You’re filling out your new name tag at {{attraction}}—what fake name are you putting on it?",
    "If you were the replacement for a character in {{attraction}}, who would it be?",
    "You’re a greeter at {{attraction}} - what is your go‑to line?",
    "Starting with “Back when I worked {{attraction}}…”, what imaginary story do you tell?",

    // Show format / medium
    "If {{attraction}} became a stage musical, what would its over‑the‑top title be?",
    "If {{attraction}} were a 90s sitcom, what would its title be?",
    "If {{attraction}} were a song, what would its title be?",
    "If {{attraction}} were a direct-to-streaming movie, what would its title be?",

    // Music & Voice
    "What melody or musical moment from {{attraction}} gets stuck in your head all day?",
    "Whose voice performance in {{attraction}} is the absolute best?",
    "What celebrity would you get to narrate {{attraction}}?",

    // Characters & Casting
    "Which character from {{attraction}} deserves their own spin‑off attraction?",
    "Which underused character in {{attraction}} needs way more spotlight?",
    "Which animatronic in {{attraction}} is your favorite?",
    "Which animatronic in {{attraction}} deserves an entire scene built around them?",

    // Queue, preshow, and “show before the show”
    "What preshow moment from {{attraction}} sticks with you the most?",
    "What simple audience participation bit would you add to the preshow for {{attraction}}?",

    // Media moments / capturing the performance
    "What 10‑second moment from {{attraction}} would make the best viral clip?",
    "What single photo from {{attraction}} would you enter in a photo contest?",

    // Story framing / big takeaway
    "If {{attraction}} were a fable, what moral would appear at the end?",
    "Write a one‑line poem about {{attraction}}.",

    // Lasting “show” memory
    "What moment from {{attraction}} do you think you’ll still remember in 20 years?",

    // Marquee / tagline
    "If {{attraction}} were a roadside attraction, what would the big billboard outside say?",
    "What quote could you write that sums up {{attraction}}?"
  ]
    }
  ]
};
