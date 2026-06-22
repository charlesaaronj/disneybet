const GAME_QUESTIONS = {
  "categories": [
    {
      "id": 1,
      "name": "Role",
      "description": "Players imagine themselves inside {{attraction}} taking on a job or part.",
      "questions": [
        "If you worked at {{attraction}}, what job would you want?",
        "If you played a live character in {{attraction}}, what would your character be called?",
        "If {{attraction}} broke a rule of {{land}}, what do you think it would be?",
        "If your name appeared on a name tag inside {{attraction}}, what role would be under it?",
        "If you replaced one animatronic in {{attraction}}, which part would you play and why?"
      ]
    },
    {
      "id": 2,
      "name": "What-If",
      "description": "Change one rule or condition inside {{attraction}}, then say what happens.",
      "questions": [
        "If you could change one rule of physics inside {{attraction}}, what would you change?",
        "If one scene in {{attraction}} had to repeat every time you ride, which scene would loop?",
        "If everyone in {{attraction}} had to follow one new silly rule, what would the rule be?",
        "If one ordinary object in {{attraction}} suddenly controlled the whole story, what object would it be?",
        "If {{attraction}} were locked into one time of day or weather forever, which would you choose?"
      ]
    },
    {
      "id": 3,
      "name": "Mash-up",
      "description": "Combine {{attraction}} with some other IP, park, or genre.",
      "questions": [
        "If {{attraction}} crossed over with another show or movie, what would you mash it with?",
        "If {{attraction}} turned into a competition, which scene would be the final challenge?",
        "If {{attraction}} became a comic-book crossover, which moment would be the big splash page?",
        "If {{attraction}} were re-themed as a horror version, which scene would become the scare scene?",
        "If {{attraction}} did a cozy baking crossover, where would they put the kitchen?"
      ]
    },
    {
      "id": 4,
      "name": "Location Swap",
      "description": "Move {{attraction}} somewhere else and ask what changes.",
      "questions": [
        "If {{attraction}} moved to a totally different kind of park, what type of place would fit it best?",
        "If {{attraction}} were dropped into an empty mall, which part would feel the weirdest?",
        "If {{attraction}} were rebuilt in another country, what part would look strangest there?",
        "If {{attraction}} swapped scenery with another land, which scene would feel most wrong?",
        "If {{attraction}} ran as a temporary ride at a county fair, what would feel the most awkward?"
      ]
    },
    {
      "id": 5,
      "name": "Memory",
      "description": "Prompt players to share a real memory linked to {{attraction}}.",
      "questions": [
        "What’s the funniest or strangest real memory you have from {{attraction}}?",
        "What one moment from {{attraction}} do you think you’ll remember in 20 years?",
        "What’s the most unexpected thing you’ve ever seen on {{attraction}}?",
        "What’s the first story you tell a friend who’s never ridden {{attraction}}?",
        "You find an old photo near {{attraction}}. What specific memory comes back?"
      ]
    },
    {
      "id": 6,
      "name": "Trivia",
      "description": "Invite “I know a thing” answers without needing strict accuracy.",
      "questions": [
        "What “insider fact” about {{attraction}} do you like to share, real or made up?",
        "What tiny detail in {{attraction}} do you love pointing out to people?",
        "What oddly specific fact about {{attraction}} would you use to win trivia night?",
        "What’s one thing about {{attraction}} you think most guests totally miss?",
        "What’s your favorite wild fan theory you could make up about {{attraction}}?"
      ]
    },
    {
      "id": 7,
      "name": "Comparison",
      "description": "Compare {{attraction}} to another attraction, land, park, or company.",
      "questions": [
        "If a rival park copied {{attraction}} and tried to improve it, what’s the first thing they’d change?",
        "Which other ride in the park is {{attraction}} most like, and why?",
        "Which other ride feels like {{attraction}}’s sibling or weird cousin?",
        "Which ride would make the best double feature with {{attraction}}?",
        "What movie or TV show does {{attraction}} feel most like?"
      ]
    },
    {
      "id": 8,
      "name": "Characters",
      "description": "Zoom in on one character, animatronic, or performer choice.",
      "questions": [
        "Which character from {{attraction}} deserves their own spin-off story?",
        "Which character in {{attraction}} feels most out of place in the story?",
        "Which underused character in {{attraction}} deserves more attention?",
        "If you had to cosplay one character from {{attraction}}, who would you choose?",
        "If one {{attraction}} character were played by a live actor for a day, who should it be?"
      ]
    },
    {
      "id": 9,
      "name": "Line",
      "description": "Focus on a specific line, sound, or vocal moment from {{attraction}}.",
      "questions": [
        "What line or sound from {{attraction}} would you want as a text alert?",
        "What line, joke, or sound from {{attraction}} would you turn into a ringtone?",
        "If you had to perform one line from {{attraction}} on stage, which line would you pick?",
        "What single quote from {{attraction}} belongs on a wall outside the ride?",
        "What short line or sound from {{attraction}} would make the funniest endless meme loop?"
      ]
    },
    {
      "id": 10,
      "name": "Elements",
      "description": "Pick a peak and/or low point: scene, effect, setpiece, etc.",
      "questions": [
        "What’s the single best moment in {{attraction}}?",
        "What’s the weakest scene in {{attraction}}?",
        "What’s one moment in {{attraction}} that is both great and flawed at the same time?",
        "What’s the one part of {{attraction}} you always look forward to?",
        "What’s one small thing in {{attraction}} you wouldn’t miss if it disappeared?"
      ]
    },
    {
      "id": 11,
      "name": "Storytelling",
      "description": "Ask where {{attraction}}’s storytelling soars or collapses.",
      "questions": [
        "During {{attraction}}, when do you most forget you’re in a theme park?",
        "Where does the illusion break the hardest in {{attraction}}?",
        "If you froze {{attraction}} on one image that sums up the story, what would it show?",
        "At what moment does the story of {{attraction}} finally “click” for you?",
        "What’s something in {{attraction}} that suddenly reminds you it’s just a ride?"
      ]
    },
    {
      "id": 12,
      "name": "Tech",
      "description": "Focus on effects, tech, and “magic” (or lack thereof) in {{attraction}}.",
      "questions": [
        "Which effect in {{attraction}} would you upgrade to be absolutely mind-blowing?",
        "If you could permanently fix one broken thing in {{attraction}}, what would it be?",
        "What piece of tech in {{attraction}} would be funniest if it malfunctioned?",
        "If you could watch one part of {{attraction}} from the control room, what would you watch?",
        "What’s the one effect in {{attraction}} you hope never breaks?"
      ]
    },
    {
      "id": 13,
      "name": "Pacing",
      "description": "Ask about what feels too fast, too slow, or just right in {{attraction}}.",
      "questions": [
        "Which moment in {{attraction}} deserves 10 extra seconds?",
        "Which scene in {{attraction}} would be funniest if it suddenly ran too fast?",
        "What part of {{attraction}} always feels too slow or too rushed?",
        "Where in {{attraction}} should the ride pause just a bit longer?",
        "If you cut one slower stretch from {{attraction}}, what would you remove?"
      ]
    },
    {
      "id": 14,
      "name": "Music",
      "description": "Lean into audio, songs, and iconic loops from {{attraction}}.",
      "questions": [
        "What musical moment from {{attraction}} would you save forever?",
        "Which sound effect from {{attraction}} would be funniest if it played in the wrong scene?",
        "What song or musical moment from {{attraction}} would you put on a karaoke playlist?",
        "What tiny audio clip from {{attraction}} would make a good lo-fi loop?",
        "What voice or line from {{attraction}} gets stuck in your head?"
      ]
    },
    {
      "id": 15,
      "name": "Pre/Post",
      "description": "Focus on phases around {{attraction}}: queue, preshow, postshow.",
      "questions": [
        "What recurring detail or gag in {{attraction}}’s queue is your favorite?",
        "Where before {{attraction}} would you drop in a quick surprise to wake people up?",
        "If the postshow became a tiny museum, what’s the first thing you’d display?",
        "What’s one detail in the {{attraction}} line you tell a bored friend to look for?",
        "What simple audience participation bit would you add to the preshow?"
      ]
    },
    {
      "id": 16,
      "name": "Sensory",
      "description": "Ask about non-visual sensory details inside {{attraction}}.",
      "questions": [
        "If {{attraction}} got one new signature smell, what would it be?",
        "Where in {{attraction}} would a sudden blast of wind be funniest?",
        "Which scene in {{attraction}} would be most chaotic with way too much mist, vibration, or heat?",
        "If {{attraction}} had a “guess the scent” moment, what smell should they use?",
        "If guests could touch one surprising texture in {{attraction}}, what should it feel like?"
      ]
    },
    {
      "id": 17,
      "name": "Hot Take",
      "description": "Invite spicy opinions and debates about {{attraction}}.",
      "questions": [
        "What opinion about {{attraction}} would probably get you booed?",
        "What small moment in {{attraction}} is more special than people realize?",
        "What part of {{attraction}} do people hype that you just don’t get?",
        "Is {{attraction}} better in the daytime or at night, and why?",
        "For you, is {{attraction}} a must-do or skippable, and why?"
      ]
    },
    {
      "id": 18,
      "name": "Redesign",
      "description": "Let players act as Imagineers making surgical changes to {{attraction}}.",
      "questions": [
        "If you could fully redo one scene in {{attraction}}, which would you choose?",
        "If one scene in {{attraction}} had to be cut, which one would you remove?",
        "What small moment in {{attraction}} would you blow up into a huge setpiece?",
        "What tiny change would most improve the flow of {{attraction}}?",
        "If budget didn’t matter, what wild upgrade would you add to {{attraction}}?"
      ]
    },
    {
      "id": 19,
      "name": "New",
      "description": "Add a new element that fits inside {{attraction}}.",
      "questions": [
        "If you added one new scene to {{attraction}}, where would it go and what happens?",
        "What new side character would you add to {{attraction}} so guests instantly love them?",
        "What ridiculous prop would you sneak into a serious scene in {{attraction}}?",
        "What small holiday moment would you add to {{attraction}} as a seasonal overlay?",
        "What would a one-time Easter egg character in {{attraction}} look like?"
      ]
    },
    {
      "id": 20,
      "name": "Backstage",
      "description": "Peel back the curtain or imagine a “secret level” of {{attraction}}.",
      "questions": [
        "What extra scene or rule would you add to an after-hours staff version of {{attraction}}?",
        "If you could freeze {{attraction}} and walk through one scene with the lights on, which scene?",
        "In which scene would a lights-on breakdown tour of {{attraction}} be most interesting?",
        "What inside joke would you hide in a cast-party version of {{attraction}}?",
        "If a hidden door in {{attraction}} led to a tiny secret room, what would be inside?"
      ]
    },
    {
      "id": 21,
      "name": "Marketing",
      "description": "Turn {{attraction}} into a brand or piece of key art.",
      "questions": [
        "What tagline would you write for a big {{attraction}} poster?",
        "If you renamed {{attraction}} for one day to attract thrill-seekers, what would you call it?",
        "If {{attraction}} were marketed like a blockbuster movie, what title would you give it?",
        "What short phrase would you print under {{attraction}} on a minimalist t-shirt?",
        "What headline would you put on a retro travel poster for {{attraction}}?"
      ]
    },
    {
      "id": 22,
      "name": "Tie-In",
      "description": "Attach food, merch, or collectibles to {{attraction}}.",
      "questions": [
        "What exclusive snack would you sell only at the exit of {{attraction}}?",
        "What’s the most over-the-top souvenir you can imagine for {{attraction}}?",
        "What would be the first item in a mystery box themed to {{attraction}}?",
        "What on-theme drink would you serve in the {{attraction}} queue?",
        "What wearable item would instantly mark someone as a {{attraction}} superfan?"
      ]
    },
    {
      "id": 23,
      "name": "Emotions",
      "description": "Ask about feelings, moods, and vibes of {{attraction}}.",
      "questions": [
        "What three words best describe {{attraction}}’s vibe?",
        "At what exact moment on {{attraction}} do you feel the strongest emotion?",
        "How would you finish this sentence: “{{attraction}} feels like ___”?",
        "Without spoilers, what feeling do you promise {{attraction}} will give a friend?",
        "What’s the first single word that comes to mind when you step off {{attraction}}?"
      ]
    },
    {
      "id": 24,
      "name": "Time Travel",
      "description": "Shift {{attraction}} into a different time period.",
      "questions": [
        "If {{attraction}} were redesigned as a 1980s version, what’s the biggest change?",
        "If {{attraction}} jumped 50 years into the future, what futuristic detail must appear?",
        "Which scene in {{attraction}} would look funniest half-modern and half another decade?",
        "What old-fashioned detail would you expect in a vintage version of {{attraction}}?",
        "If {{attraction}} ran as a “historical documentary,” what time period would it cover?"
      ]
    },
    {
      "id": 25,
      "name": "Content Creator",
      "description": "Answer as if you’re making a TikTok, vlog, or photo about {{attraction}}.",
      "questions": [
        "What 10-second moment from {{attraction}} would make the best viral clip?",
        "What one photo inside {{attraction}} perfectly captures its personality?",
        "If someone filmed you mid-ride and said, “Explain this in one sentence,” what would you say?",
        "Where is the perfect selfie spot for {{attraction}}?",
        "What short caption would you use to describe {{attraction}} in a post?"
      ]
    },
    {
      "id": 26,
      "name": "Lessons",
      "description": "Treat {{attraction}} like a fable or parable.",
      "questions": [
        "If {{attraction}} had a moral like a storybook, what would it be?",
        "What advice would {{attraction}} give a nervous kid?",
        "What motivational quote could you write that sums up {{attraction}}?",
        "If {{attraction}} were a fable, what’s the quick lesson at the end?",
        "When someone asks, “What does {{attraction}} actually teach you?” what do you say?"
      ]
    },
    {
      "id": 27,
      "name": "Lore",
      "description": "Fix plot holes or extend {{attraction}}’s story.",
      "questions": [
        "What one extra sentence would you add to {{attraction}}’s official backstory?",
        "What big unanswered question about {{attraction}} would you fix with a single line?",
        "At what moment in {{attraction}} would you pause to reveal a hidden backstory detail?",
        "What short lore line would you add under {{attraction}} on the park map?",
        "What mystery from {{attraction}} would you finally explain in a prequel?"
      ]
    },
    {
      "id": 28,
      "name": "Disruption",
      "description": "Players imagine themselves causing harmless chaos inside {{attraction}}.",
      "questions": [
        "If you could trigger harmless chaos in {{attraction}}, what small thing would you change?",
        "If something fell out of your bag and stayed in {{attraction}} forever, what would it be?",
        "Where would you hide a silly object in {{attraction}} so it almost fits the story?",
        "What badly timed shout would accidentally make a moment in {{attraction}} funnier?",
        "What silly thing could your whole group do in sync during {{attraction}}?"
      ]
    },
    {
      "id": 29,
      "name": "Cast Members",
      "description": "Imagine {{attraction}} from a staff member’s point of view.",
      "questions": [
        "What imaginary “I worked {{attraction}}” story would you tell?",
        "What hard situation would you use to train new {{attraction}} staff?",
        "What fun behind-the-scenes story would you invent about working {{attraction}}?",
        "What moment in {{attraction}} would most stress out a brand-new Cast Member?",
        "What do guests do on {{attraction}} that would always make you laugh as a Cast Member?"
      ]
    },
    {
      "id": 30,
      "name": "Sponsor",
      "description": "Treat {{attraction}} like an over-sponsored TV show.",
      "questions": [
        "What fake company would be the funniest sponsor for {{attraction}}?",
        "What silly fake commercial would you play before {{attraction}} starts?",
        "What kind of company would be the most absurd sponsor for {{attraction}}?",
        "What cheesy line would you add to the spiel to squeeze in the sponsor name?",
        "What everyday grocery item would be funniest with a {{attraction}} tie-in?"
      ]
    },
    {
      "id": 31,
      "name": "Movie Title",
      "description": "Come up with a movie name based on {{attraction}}.",
      "questions": [
        "What dramatic title and cheesy subtitle would you give a {{attraction}} movie?",
        "What would the VHS label say for a cult-classic movie based on {{attraction}}?",
        "What over-the-top title would you give a horror or comedy version of {{attraction}}?",
        "What corny title would you give a holiday special based on {{attraction}}?",
        "What would a mockumentary about {{attraction}} superfans be called?"
      ]
    },
    {
      "id": 32,
      "name": "Music Gig",
      "description": "Come up with band names, songs, or albums inspired by {{attraction}}.",
      "questions": [
        "What would you title a hit song about {{attraction}}?",
        "What would you rename your band for a {{attraction}}-themed show?",
        "What is the name of a band that only sings about {{attraction}}, and what’s their first album called?",
        "What would a pop single inspired by {{attraction}} be titled?",
        "What would a tour be called if a band only played {{attraction}}-inspired music?"
      ]
    }
  ]
};
