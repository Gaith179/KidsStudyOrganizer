/**
 * Cambridge Primary Grade 5 - English Vocabulary & Spelling Master Hub
 * Alliance Academy Jordan (AAJ) - First Semester Curricula for Jad
 * Features:
 * 1. 📇 3D Interactive Flashcards with Web Speech API audio pronunciation
 * 2. ✍️ Spelling Bee Drill (Hear the word, type to spell with instant feedback)
 * 3. 🎯 Cambridge Exam Practice Quiz (Antonyms, Synonyms, Parts of Speech, Sentence Context)
 * 4. 📚 Comprehensive Printable Review Table
 */

const JAD_VOCABULARY_DATA = {
  list1: {
    id: "list1",
    title: "Vocabulary List #1 (Story & Descriptive Language)",
    description: "Explore the meanings of new words, synonyms, antonyms, and parts of speech",
    words: [
      {
        word: "Increase",
        pos: "Verb",
        meaning: "To become or make something greater or larger in size, amount, or degree",
        synonyms: ["grow", "rise"],
        antonyms: ["decrease", "reduce"],
        example: "The temperature began to increase as the sun came out.",
        examSentence: "The boat began to increase its speed as it moved down the river."
      },
      {
        word: "Precious",
        pos: "Adjective",
        meaning: "Very valuable, important, or treasured",
        synonyms: ["valuable", "treasured", "cherished"],
        antonyms: ["worthless", "ordinary"],
        example: "The necklace was a precious gift from her grandmother.",
        examSentence: "A synonym for precious is valuable."
      },
      {
        word: "Despair",
        pos: "Noun",
        meaning: "A complete feeling of having no hope; loss of hope",
        synonyms: ["sadness", "hopelessness"],
        antonyms: ["hope", "optimism"],
        example: "After losing the map, the explorers began to feel despair.",
        examSentence: "The team refused to give in to despair even when they were losing."
      },
      {
        word: "Clanging",
        pos: "Verb",
        meaning: "Making a loud, ringing metal sound",
        synonyms: ["banging", "ringing", "clattering"],
        antonyms: ["silence"],
        example: "The clanging of the metal gate woke everyone up.",
        examSentence: "The clanging pots in the kitchen startled the dog."
      },
      {
        word: "Propel",
        pos: "Verb",
        meaning: "To push or drive something forward with force",
        synonyms: ["push", "drive", "thrust"],
        antonyms: ["pull back", "halt"],
        example: "The strong wind propelled the boat across the lake.",
        examSentence: "Rockets propel spacecraft high into Earth's orbit."
      },
      {
        word: "Intriguing",
        pos: "Adjective",
        meaning: "Very interesting; makes you want to know more",
        synonyms: ["interesting", "mysterious", "fascinating"],
        antonyms: ["boring", "dull"],
        example: "The detective found an intriguing clue inside the old house.",
        examSentence: "The book had an intriguing plot that kept me reading all night."
      },
      {
        word: "Flicker",
        pos: "Verb",
        meaning: "Shone or moved in an unsteady, wavering way like a flame",
        synonyms: ["flashed", "wavered", "glimmered"],
        antonyms: ["steady"],
        example: "The candle flickered in the breeze.",
        examSentence: "The campfire flickered gently in the dark forest."
      },
      {
        word: "Fascinating",
        pos: "Adjective",
        meaning: "Extremely interesting and captivating",
        synonyms: ["captivating", "engrossing", "enchanting"],
        antonyms: ["dull", "uninteresting"],
        example: "The documentary about space was fascinating.",
        examSentence: "The museum was absolutely fascinating to all the students."
      },
      {
        word: "Unique",
        pos: "Adjective",
        meaning: "One of a kind; unlike anything else",
        synonyms: ["extraordinary", "distinctive", "rare"],
        antonyms: ["ordinary", "common"],
        example: "Each snowflake has a unique shape.",
        examSentence: "She proudly displayed her unique artwork at the school exhibition."
      },
      {
        word: "Suspense",
        pos: "Noun",
        meaning: "A feeling of excited expectation or worry about what will happen next",
        synonyms: ["tension", "anticipation"],
        antonyms: ["certainty", "calm"],
        example: "The movie was full of suspense, as we waited to see what will happen.",
        examSentence: "The suspense was almost unbearable as the winner was announced."
      },
      {
        word: "Accidentally",
        pos: "Adverb",
        meaning: "By mistake; without intending or planning to",
        synonyms: ["unintentionally", "mistakenly"],
        antonyms: ["deliberately", "on purpose"],
        example: "Sara accidentally spilled water on her book.",
        examSentence: "He accidentally dropped his glass on the floor."
      },
      {
        word: "Shattered",
        pos: "Verb",
        meaning: "Broken suddenly into many small pieces",
        synonyms: ["smashed", "fractured", "broken"],
        antonyms: ["repaired", "intact"],
        example: "The glass shattered when it hit the floor.",
        examSentence: "The mirror shattered with a loud crash."
      },
      {
        word: "Alert",
        pos: "Adjective",
        meaning: "Paying close attention and ready to notice danger or emergencies",
        synonyms: ["attentive", "watchful", "vigilant"],
        antonyms: ["unaware", "distracted", "sleepy"],
        example: "The guard remained alert throughout the night.",
        examSentence: "The guard remained alert while watching the dark hallway."
      },
      {
        word: "Ominous",
        pos: "Adjective",
        meaning: "Suggesting that something bad or unpleasant might happen",
        synonyms: ["gloomy", "threatening", "sinister"],
        antonyms: ["promising", "bright", "cheerful"],
        example: "The ominous dark clouds made us think a storm was coming.",
        examSentence: "What is the meaning of ominous? Suggesting that something bad might happen."
      },
      {
        word: "Blare",
        pos: "Verb",
        meaning: "To make a very loud, harsh, ringing sound",
        synonyms: ["blast", "roar", "bellow"],
        antonyms: ["whisper", "murmur"],
        example: "The car horn began to blare when the driver saw danger.",
        examSentence: "Sirens began to blare across the street."
      },
      {
        word: "Nervously",
        pos: "Adverb",
        meaning: "In an anxious, worried, or uneasy way",
        synonyms: ["anxiously", "uneasily", "timidly"],
        antonyms: ["calmly", "confidently"],
        example: "He nervously waited for his turn to speak.",
        examSentence: "The student glanced nervously at the clock during the exam."
      }
    ]
  },

  spelling1: {
    id: "spelling1",
    title: "Spelling List #1 (/k/ Sound Spelling Patterns)",
    description: "Words with /k/ sound formed by que, c, k, ch, or ck",
    words: [
      {
        word: "antique",
        pos: "Adjective",
        meaning: "Very old and often valuable",
        synonyms: ["vintage", "historic"],
        antonyms: ["modern", "contemporary"],
        example: "Grandfather keeps an antique clock on his desk.",
        pattern: "-que pattern for /k/"
      },
      {
        word: "mosquito",
        pos: "Noun",
        meaning: "A small flying insect that bites people and animals to drink blood",
        synonyms: ["gnat"],
        antonyms: [],
        example: "A mosquito buzzed around the garden at sunset.",
        pattern: "-qui- pattern for /k/"
      },
      {
        word: "technique",
        pos: "Noun",
        meaning: "A special, skillful way of doing something",
        synonyms: ["method", "skill", "procedure"],
        antonyms: [],
        example: "The painter used a special technique with watercolor.",
        pattern: "-que pattern for /k/"
      },
      {
        word: "kettle",
        pos: "Noun",
        meaning: "A metal or electric container used for boiling water",
        synonyms: ["pot", "boiler"],
        antonyms: [],
        example: "Mother put the kettle on the stove for afternoon tea.",
        pattern: "k- pattern"
      },
      {
        word: "volcano",
        pos: "Noun",
        meaning: "A mountain that can erupt with hot lava, ash, and gases",
        synonyms: ["crater", "peak"],
        antonyms: [],
        example: "The volcano released plumes of smoke into the sky.",
        pattern: "c for /k/ sound"
      },
      {
        word: "bike",
        pos: "Noun",
        meaning: "A bicycle with two wheels that you pedal and ride",
        synonyms: ["bicycle", "cycle"],
        antonyms: [],
        example: "Jad rode his bike around the neighborhood park.",
        pattern: "k with silent e"
      },
      {
        word: "speck",
        pos: "Noun",
        meaning: "A tiny spot, particle, or small piece of something",
        synonyms: ["dot", "grain", "particle"],
        antonyms: ["chunk"],
        example: "There was not a single speck of dust on the clean table.",
        pattern: "-ck pattern"
      },
      {
        word: "orchestra",
        pos: "Noun",
        meaning: "A large group of musicians who play classical instruments together",
        synonyms: ["ensemble", "symphony band"],
        antonyms: [],
        example: "The school orchestra played a beautiful piece at the assembly.",
        pattern: "-ch- for /k/ sound"
      },
      {
        word: "accident",
        pos: "Noun",
        meaning: "Something unexpected that happens by mistake and causes damage or injury",
        synonyms: ["mishap", "crash"],
        antonyms: ["deliberate act"],
        example: "The spill was a complete accident.",
        pattern: "-cc- before vowel"
      },
      {
        word: "attack",
        pos: "Verb",
        meaning: "To try to hurt, strike, or fight against someone or something",
        synonyms: ["strike", "charge", "assault"],
        antonyms: ["defend", "protect"],
        example: "The lion leaped to attack its prey.",
        pattern: "-ck pattern"
      },
      {
        word: "mechanic",
        pos: "Noun",
        meaning: "A skilled person who repairs machines, especially cars and engines",
        synonyms: ["technician", "repairer"],
        antonyms: [],
        example: "The mechanic carefully repaired the damaged engine before the journey.",
        pattern: "-ch- for /k/ sound"
      },
      {
        word: "unique",
        pos: "Adjective",
        meaning: "One of a kind; unlike anything else in the world",
        synonyms: ["singular", "distinctive"],
        antonyms: ["common", "ordinary"],
        example: "She proudly displayed her unique artwork at the school exhibition.",
        pattern: "-que pattern for /k/"
      },
      {
        word: "chaos",
        pos: "Noun",
        meaning: "Complete confusion, disorder, or lack of order",
        synonyms: ["disorder", "pandemonium", "turmoil"],
        antonyms: ["order", "peace", "calm"],
        example: "The classroom quickly descended into chaos when the bell suddenly rang.",
        pattern: "ch- for /k/ sound"
      }
    ]
  },

  spelling2: {
    id: "spelling2",
    title: "Spelling List #2 (Space, Motion & Exploration)",
    description: "Key vocabulary words for Grade 5 narratives and science fiction",
    words: [
      {
        word: "despair",
        pos: "Noun",
        meaning: "Complete loss or absence of hope",
        synonyms: ["hopelessness"],
        antonyms: ["hope"],
        example: "He overcame despair through hard work and courage."
      },
      {
        word: "shattered",
        pos: "Verb",
        meaning: "Broke suddenly into many pieces",
        synonyms: ["smashed", "fractured"],
        antonyms: ["repaired"],
        example: "The dropped vase shattered on the tile floor."
      },
      {
        word: "propelled",
        pos: "Verb",
        meaning: "Drove or pushed forward with force",
        synonyms: ["pushed", "thrust", "launched"],
        antonyms: ["pulled back"],
        example: "Powerful rocket thrusters propelled the spacecraft into orbit."
      },
      {
        word: "increase",
        pos: "Verb",
        meaning: "To become greater in size, amount, or degree",
        synonyms: ["grow", "expand"],
        antonyms: ["decrease"],
        example: "Practice will increase your speed and accuracy."
      },
      {
        word: "precious",
        pos: "Adjective",
        meaning: "Of great value; dearly loved and treasured",
        synonyms: ["valuable", "cherished"],
        antonyms: ["worthless"],
        example: "Every moment with family is precious."
      },
      {
        word: "instincts",
        pos: "Noun",
        meaning: "Natural or intuitive ways of behaving, thinking, or reacting",
        synonyms: ["intuition", "gut feeling"],
        antonyms: [],
        example: "Birds fly south for the winter by natural instincts."
      },
      {
        word: "intriguing",
        pos: "Adjective",
        meaning: "Very interesting; arousing curiosity and wonder",
        synonyms: ["fascinating", "compelling"],
        antonyms: ["boring"],
        example: "The scientist made an intriguing discovery in the cave."
      },
      {
        word: "trajectory",
        pos: "Noun",
        meaning: "The curved path followed by a projectile or flying object through space",
        synonyms: ["flight path", "course", "arc"],
        antonyms: [],
        example: "The astronomers calculated the rocket's exact flight trajectory."
      },
      {
        word: "captivating",
        pos: "Adjective",
        meaning: "Holding one's interest completely; charming and attractive",
        synonyms: ["fascinating", "enchanting", "gripping"],
        antonyms: ["dull", "repulsive"],
        example: "The author told a captivating story about underwater sea life."
      },
      {
        word: "astronaut",
        pos: "Noun",
        meaning: "A person trained to travel and work in outer space",
        synonyms: ["spaceman", "cosmonaut"],
        antonyms: [],
        example: "The astronaut conducted experiments floating aboard the Space Station."
      },
      {
        word: "disappear",
        pos: "Verb",
        meaning: "To stop being visible; to vanish completely",
        synonyms: ["vanish", "fade away"],
        antonyms: ["appear", "emerge"],
        example: "The magician made the rabbit disappear in a puff of smoke."
      },
      {
        word: "flickered",
        pos: "Verb",
        meaning: "Shone or burned unsteadily; wavered softly",
        synonyms: ["twinkled", "wavered"],
        antonyms: ["shone steadily"],
        example: "The candle flickered gently in the dark room."
      },
      {
        word: "fascinating",
        pos: "Adjective",
        meaning: "Extremely interesting and appealing",
        synonyms: ["captivating", "absorbing"],
        antonyms: ["boring"],
        example: "The museum was absolutely fascinating to all the students."
      }
    ]
  }
};

class JadVocabHub {
  constructor() {
    this.currentListKey = "list1";
    this.currentFilterPos = "all";
    this.currentMode = "flashcards"; // 'flashcards', 'spelling', 'quiz', 'table'
    this.currentCardIndex = 0;
    this.isCardFlipped = false;
    
    // Spelling Drill State
    this.spellingIndex = 0;
    this.spellingScore = 0;
    this.spellingStreak = 0;
    
    // Quiz State
    this.quizQuestions = [];
    this.quizIndex = 0;
    this.quizScore = 0;
    this.quizAnswered = false;
  }

  getAllCurrentWords() {
    const list = JAD_VOCABULARY_DATA[this.currentListKey];
    if (!list) return [];
    if (this.currentFilterPos === "all") return list.words;
    return list.words.filter(w => (w.pos || "").toLowerCase() === this.currentFilterPos.toLowerCase());
  }

  openVocabModal(listKey = "list1", mode = "flashcards") {
    this.currentListKey = listKey;
    this.currentMode = mode;
    this.currentCardIndex = 0;
    this.isCardFlipped = false;
    this.currentFilterPos = "all";

    const modal = document.getElementById("modalJadVocabHub");
    if (!modal) return;
    modal.classList.add("active");
    this.render();
  }

  closeVocabModal() {
    const modal = document.getElementById("modalJadVocabHub");
    if (modal) modal.classList.remove("active");
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  setList(key) {
    this.currentListKey = key;
    this.currentCardIndex = 0;
    this.isCardFlipped = false;
    this.render();
  }

  setPosFilter(pos) {
    this.currentFilterPos = pos;
    this.currentCardIndex = 0;
    this.isCardFlipped = false;
    this.render();
  }

  setMode(mode) {
    this.currentMode = mode;
    if (mode === "quiz") {
      this.initQuiz();
    } else if (mode === "spelling") {
      this.initSpelling();
    }
    this.render();
  }

  // --- Web Speech API Pronunciation ---
  speakWord(text) {
    if (!("speechSynthesis" in window)) {
      alert("Pronunciation: " + text);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9; // clear, comfortable pace for 5th grader
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  }

  // --- Flashcard Navigation ---
  flipCard() {
    this.isCardFlipped = !this.isCardFlipped;
    const cardEl = document.getElementById("vocabFlashcard");
    if (cardEl) {
      if (this.isCardFlipped) {
        cardEl.classList.add("flipped");
      } else {
        cardEl.classList.remove("flipped");
      }
    }
  }

  nextCard() {
    const words = this.getAllCurrentWords();
    if (this.currentCardIndex < words.length - 1) {
      this.currentCardIndex++;
      this.isCardFlipped = false;
      this.render();
    }
  }

  prevCard() {
    if (this.currentCardIndex > 0) {
      this.currentCardIndex--;
      this.isCardFlipped = false;
      this.render();
    }
  }

  // --- Spelling Bee Drill ---
  initSpelling() {
    this.spellingIndex = 0;
    this.spellingScore = 0;
    this.spellingStreak = 0;
  }

  checkSpelling() {
    const input = document.getElementById("spellingInput");
    const resultBox = document.getElementById("spellingResult");
    if (!input || !resultBox) return;

    const words = this.getAllCurrentWords();
    const targetWord = words[this.spellingIndex];
    if (!targetWord) return;

    const userAttempt = input.value.trim().toLowerCase();
    const correctWord = targetWord.word.toLowerCase();

    if (userAttempt === correctWord) {
      this.spellingScore += 10;
      this.spellingStreak++;
      resultBox.innerHTML = `
        <div style="background:#ecfdf5; border:1.5px solid #10b981; color:#065f46; padding:12px; border-radius:10px; font-weight:800; font-size:1rem; margin-top:12px; text-align:center;">
          🎉 BINGO! Perfectly Spelled: <span style="font-size:1.15rem; color:#047857; text-transform:uppercase;">${targetWord.word}</span> (+10 pts)
        </div>
      `;
      this.playFanfare(true);
      if (typeof rewardsSystem !== 'undefined') {
        rewardsSystem.addPoints("jad", 10, `Spelling Master: ${targetWord.word}`);
      }
      setTimeout(() => {
        if (this.spellingIndex < words.length - 1) {
          this.spellingIndex++;
          this.render();
        } else {
          resultBox.innerHTML = `
            <div style="background:#eff6ff; border:2px solid #3b82f6; color:#1e40af; padding:16px; border-radius:12px; text-align:center; font-weight:800; margin-top:12px;">
              🏆 Champion! You mastered all ${words.length} words in this list! Total Score: ${this.spellingScore} pts!
            </div>
          `;
        }
      }, 1400);
    } else {
      this.spellingStreak = 0;
      resultBox.innerHTML = `
        <div style="background:#fef2f2; border:1.5px solid #ef4444; color:#991b1b; padding:12px; border-radius:10px; font-weight:700; font-size:0.92rem; margin-top:12px; text-align:center;">
          ❌ Not quite! Correct spelling is: <strong style="text-transform:uppercase; letter-spacing:1px; color:#b91c1c;">${targetWord.word}</strong>
          <div style="font-size:0.8rem; margin-top:4px; opacity:0.85;">Listen again and type carefully!</div>
        </div>
      `;
      this.playFanfare(false);
      this.speakWord(targetWord.word);
    }
  }

  // --- Cambridge Exam Quizzer Generator ---
  initQuiz() {
    const words = this.getAllCurrentWords();
    this.quizQuestions = [];
    this.quizIndex = 0;
    this.quizScore = 0;
    this.quizAnswered = false;

    // Generate 5 questions matching AAJ test format:
    // 1. Antonym question
    // 2. Synonym question
    // 3. Meaning / Definition question
    // 4. In-sentence context question
    // 5. Part of speech question

    const pool = [...words];
    // Shuffle
    pool.sort(() => Math.random() - 0.5);

    // Q1: Antonym (e.g. increase -> decrease, precious -> worthless, alert -> unaware)
    const withAnt = pool.find(w => w.antonyms && w.antonyms.length > 0) || pool[0];
    if (withAnt && withAnt.antonyms.length > 0) {
      const correct = withAnt.antonyms[0];
      const distractors = ["enormous", "colorful", "loudly", "peaceful", "cheerful"].filter(d => d !== correct).slice(0, 3);
      const opts = [correct, ...distractors].sort(() => Math.random() - 0.5);
      this.quizQuestions.push({
        q: `What is the correct ANTONYM (opposite) for the word: "${withAnt.word}"?`,
        options: opts,
        correctIndex: opts.indexOf(correct),
        explanation: `The opposite of "${withAnt.word}" is "${correct}". (From AAJ Vocabulary Task 3).`
      });
    }

    // Q2: Synonym (e.g. precious -> valuable, fascinating -> captivating, propel -> push)
    const withSyn = pool.find(w => w !== withAnt && w.synonyms && w.synonyms.length > 0) || pool[1];
    if (withSyn && withSyn.synonyms.length > 0) {
      const correct = withSyn.synonyms[0];
      const distractors = ["worthless", "broken", "ordinary", "slowly", "dark"].filter(d => d !== correct).slice(0, 3);
      const opts = [correct, ...distractors].sort(() => Math.random() - 0.5);
      this.quizQuestions.push({
        q: `Which of the following is a SYNONYM for "${withSyn.word}"?`,
        options: opts,
        correctIndex: opts.indexOf(correct),
        explanation: `"${withSyn.word}" has the same meaning as "${correct}". (AAJ Task 4).`
      });
    }

    // Q3: Correct sentence usage (Task 4 in AAJ exam)
    this.quizQuestions.push({
      q: `Which sentence uses the word "propel" correctly?`,
      options: [
        "The strong wind propelled the boat across the lake.",
        "She propelled quietly because she was tired.",
        "The propel was shining brightly in the sky.",
        "He propelled the answer on his worksheet."
      ],
      correctIndex: 0,
      explanation: `"Propel" means to push or drive forward with force. Wind pushes a boat forward!`
    });

    // Q4: Meaning of ominous (direct AAJ question)
    this.quizQuestions.push({
      q: `What is the meaning of "ominous"?`,
      options: [
        "Suggesting that something bad might happen",
        "Very bright and cheerful",
        "Extremely interesting and funny",
        "Moving slowly and carefully"
      ],
      correctIndex: 0,
      explanation: `"Ominous" dark clouds or sounds suggest that something bad or dangerous is coming.`
    });

    // Q5: Part of Speech sorting (Task 2 in AAJ exam)
    this.quizQuestions.push({
      q: `In the sentence "Sara accidentally spilled water on her book", what part of speech is "accidentally"?`,
      options: [
        "Adverb (tells how the action happened)",
        "Noun (name of a person or object)",
        "Verb (shows an action)",
        "Adjective (describes what something is like)"
      ],
      correctIndex: 0,
      explanation: `Words ending in "-ly" that explain HOW an action happened are Adverbs!`
    });
  }

  answerQuiz(idx) {
    if (this.quizAnswered) return;
    this.quizAnswered = true;

    const q = this.quizQuestions[this.quizIndex];
    if (!q) return;

    const isCorrect = idx === q.correctIndex;
    if (isCorrect) {
      this.quizScore += 20;
      this.playFanfare(true);
      if (typeof rewardsSystem !== 'undefined') {
        rewardsSystem.addPoints("jad", 15, "Cambridge English Quiz Distinction");
      }
    } else {
      this.playFanfare(false);
    }

    const optButtons = document.querySelectorAll(".vocab-quiz-opt");
    optButtons.forEach((btn, i) => {
      if (i === q.correctIndex) {
        btn.classList.add("correct");
      } else if (i === idx) {
        btn.classList.add("incorrect");
      }
      btn.disabled = true;
    });

    const expBox = document.getElementById("vocabQuizExplanation");
    if (expBox) {
      expBox.style.display = "block";
      expBox.innerHTML = `
        <div style="background:${isCorrect ? '#ecfdf5' : '#fef2f2'}; border:1px solid ${isCorrect ? '#10b981' : '#ef4444'}; padding:12px; border-radius:8px; margin-top:12px; font-size:0.85rem; color:${isCorrect ? '#065f46' : '#991b1b'};">
          <strong>${isCorrect ? '🌟 Correct!' : '💡 Learning Point:'}</strong> ${q.explanation}
        </div>
      `;
    }

    const nextBtn = document.getElementById("btnVocabQuizNext");
    if (nextBtn) nextBtn.style.display = "inline-flex";
  }

  nextQuizQuestion() {
    if (this.quizIndex < this.quizQuestions.length - 1) {
      this.quizIndex++;
      this.quizAnswered = false;
      this.render();
    } else {
      const container = document.getElementById("jadVocabBody");
      if (container) {
        container.innerHTML = `
          <div style="text-align:center; padding:40px 20px;">
            <div style="font-size:3.5rem; margin-bottom:12px;">🏆</div>
            <h3 style="margin:0; font-size:1.4rem; color:var(--text-main);">Awesome Work, Jad!</h3>
            <p style="font-size:1.05rem; color:#047857; font-weight:800; margin:8px 0 16px 0;">
              Your Cambridge English Score: ${this.quizScore} / 100 Points!
            </p>
            <p style="font-size:0.85rem; color:var(--text-muted); max-width:450px; margin:0 auto 20px auto;">
              You practiced synonyms, antonyms, parts of speech, and exam sentences matching Alliance Academy tests.
            </p>
            <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
              <button type="button" class="btn-primary" onclick="jadVocabHub.initQuiz(); jadVocabHub.render();">
                🔄 Practice Again
              </button>
              <button type="button" class="btn-secondary" onclick="jadVocabHub.setMode('flashcards')">
                📇 Back to Flashcards
              </button>
            </div>
          </div>
        `;
      }
    }
  }

  playFanfare(correct) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (correct) {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch(e) {}
  }

  // --- Main HTML Render ---
  render() {
    const container = document.getElementById("jadVocabBody");
    if (!container) return;

    const list = JAD_VOCABULARY_DATA[this.currentListKey];
    const words = this.getAllCurrentWords();
    const totalWords = words.length;

    // Header tabs (List 1, Spelling 1, Spelling 2)
    const listTabsHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; border-bottom:1px solid var(--border-color); padding-bottom:12px; margin-bottom:16px;">
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button type="button" class="btn-secondary" style="font-size:0.8rem; padding:6px 12px; ${this.currentListKey === 'list1' ? 'background:var(--primary); color:#fff; font-weight:800;' : ''}" onclick="jadVocabHub.setList('list1')">
            📖 Vocab List #1 (16 Words)
          </button>
          <button type="button" class="btn-secondary" style="font-size:0.8rem; padding:6px 12px; ${this.currentListKey === 'spelling1' ? 'background:var(--primary); color:#fff; font-weight:800;' : ''}" onclick="jadVocabHub.setList('spelling1')">
            🔤 Spelling List #1 (/k/ Sound)
          </button>
          <button type="button" class="btn-secondary" style="font-size:0.8rem; padding:6px 12px; ${this.currentListKey === 'spelling2' ? 'background:var(--primary); color:#fff; font-weight:800;' : ''}" onclick="jadVocabHub.setList('spelling2')">
            🚀 Spelling List #2 (Story Words)
          </button>
        </div>

        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button type="button" class="btn-secondary" style="font-size:0.78rem; padding:5px 10px; ${this.currentMode === 'flashcards' ? 'background:#059669; color:#fff; font-weight:800;' : ''}" onclick="jadVocabHub.setMode('flashcards')">
            📇 Flashcards
          </button>
          <button type="button" class="btn-secondary" style="font-size:0.78rem; padding:5px 10px; ${this.currentMode === 'spelling' ? 'background:#059669; color:#fff; font-weight:800;' : ''}" onclick="jadVocabHub.setMode('spelling')">
            ✍️ Spelling Bee
          </button>
          <button type="button" class="btn-secondary" style="font-size:0.78rem; padding:5px 10px; ${this.currentMode === 'quiz' ? 'background:#059669; color:#fff; font-weight:800;' : ''}" onclick="jadVocabHub.setMode('quiz')">
            🎯 Exam Quiz
          </button>
          <button type="button" class="btn-secondary" style="font-size:0.78rem; padding:5px 10px; ${this.currentMode === 'table' ? 'background:#059669; color:#fff; font-weight:800;' : ''}" onclick="jadVocabHub.setMode('table')">
            📋 Full Table
          </button>
        </div>
      </div>
    `;

    // Part of speech filter chips
    const posFilterHTML = (this.currentMode === "flashcards" || this.currentMode === "table") ? `
      <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:14px; font-size:0.75rem;">
        <span style="color:var(--text-muted); font-weight:700;">Filter by:</span>
        <button type="button" class="btn-secondary" style="padding:3px 8px; font-size:0.75rem; ${this.currentFilterPos === 'all' ? 'background:var(--primary); color:#fff;' : ''}" onclick="jadVocabHub.setPosFilter('all')">All (${list.words.length})</button>
        <button type="button" class="btn-secondary" style="padding:3px 8px; font-size:0.75rem; ${this.currentFilterPos === 'noun' ? 'background:var(--primary); color:#fff;' : ''}" onclick="jadVocabHub.setPosFilter('noun')">Nouns</button>
        <button type="button" class="btn-secondary" style="padding:3px 8px; font-size:0.75rem; ${this.currentFilterPos === 'verb' ? 'background:var(--primary); color:#fff;' : ''}" onclick="jadVocabHub.setPosFilter('verb')">Verbs</button>
        <button type="button" class="btn-secondary" style="padding:3px 8px; font-size:0.75rem; ${this.currentFilterPos === 'adjective' ? 'background:var(--primary); color:#fff;' : ''}" onclick="jadVocabHub.setPosFilter('adjective')">Adjectives</button>
        <button type="button" class="btn-secondary" style="padding:3px 8px; font-size:0.75rem; ${this.currentFilterPos === 'adverb' ? 'background:var(--primary); color:#fff;' : ''}" onclick="jadVocabHub.setPosFilter('adverb')">Adverbs</button>
      </div>
    ` : '';

    let contentHTML = "";

    // 1. FLASHCARDS MODE
    if (this.currentMode === "flashcards") {
      const currentWord = words[this.currentCardIndex] || words[0];
      if (!currentWord) {
        contentHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted);">No words match this filter.</div>`;
      } else {
        contentHTML = `
          <div style="text-align:center; margin-bottom:10px;">
            <span style="font-size:0.8rem; font-weight:800; color:var(--text-muted);">Card ${this.currentCardIndex + 1} of ${totalWords}</span>
          </div>

          <div class="vocab-card-container" onclick="jadVocabHub.flipCard()" style="perspective:1000px; max-width:540px; margin:0 auto; cursor:pointer;">
            <div id="vocabFlashcard" class="vocab-flip-card ${this.isCardFlipped ? 'flipped' : ''}" style="transition:transform 0.6s; transform-style:preserve-3d; position:relative; min-height:260px; border-radius:16px; box-shadow:0 10px 25px rgba(0,0,0,0.1); border:1.5px solid var(--border-color); background:var(--bg-card);">
              
              <!-- FRONT OF CARD -->
              <div class="vocab-card-face vocab-card-front" style="position:absolute; width:100%; height:100%; backface-visibility:hidden; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:24px; text-align:center; border-radius:16px; background:linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%);">
                <span style="font-size:0.75rem; font-weight:800; letter-spacing:0.5px; text-transform:uppercase; background:#e0e7ff; color:#3730a3; padding:3px 10px; border-radius:999px; margin-bottom:12px;">
                  ${currentWord.pos || 'Word'}
                </span>
                <h2 style="font-size:2.2rem; margin:0; color:#0f172a; font-weight:900; letter-spacing:0.5px;">
                  ${currentWord.word}
                </h2>
                ${currentWord.pattern ? `<div style="font-size:0.8rem; color:#64748b; margin-top:6px; font-weight:600;">Spelling Rule: ${currentWord.pattern}</div>` : ''}
                
                <div style="margin-top:20px; display:flex; gap:10px; align-items:center;" onclick="event.stopPropagation();">
                  <button type="button" class="btn-primary" style="background:#4f46e5; border-color:#4338ca; font-size:0.82rem; padding:6px 14px; gap:6px;" onclick="jadVocabHub.speakWord('${currentWord.word}')">
                    <span>🔊</span>
                    <span>Listen English</span>
                  </button>
                  <span style="font-size:0.75rem; color:#94a3b8;">(Tap card to see meaning)</span>
                </div>
              </div>

              <!-- BACK OF CARD -->
              <div class="vocab-card-face vocab-card-back" style="position:absolute; width:100%; height:100%; backface-visibility:hidden; transform:rotateY(180deg); display:flex; flex-direction:column; justify-content:center; padding:22px; text-align:left; border-radius:16px; background:var(--bg-card); overflow-y:auto;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <span style="font-weight:900; font-size:1.15rem; color:var(--primary);">${currentWord.word}</span>
                  <span style="font-size:0.7rem; background:#ecfdf5; color:#065f46; font-weight:800; padding:2px 8px; border-radius:4px;">${currentWord.pos || ''}</span>
                </div>
                
                <div style="font-size:0.88rem; color:var(--text-main); margin-bottom:10px; line-height:1.4;">
                  <strong>Meaning:</strong> ${currentWord.meaning}
                </div>

                ${currentWord.synonyms && currentWord.synonyms.length > 0 ? `
                  <div style="font-size:0.8rem; color:#047857; margin-bottom:4px;">
                    <strong>Synonyms:</strong> ${currentWord.synonyms.join(", ")}
                  </div>
                ` : ''}

                ${currentWord.antonyms && currentWord.antonyms.length > 0 ? `
                  <div style="font-size:0.8rem; color:#b91c1c; margin-bottom:8px;">
                    <strong>Antonyms:</strong> ${currentWord.antonyms.join(", ")}
                  </div>
                ` : ''}

                <div style="font-size:0.8rem; color:var(--text-muted); background:var(--bg-card-subtle); padding:8px 10px; border-radius:6px; border-left:3px solid var(--primary); margin-top:4px;">
                  <em>"${currentWord.example}"</em>
                </div>
              </div>

            </div>
          </div>

          <!-- Flashcard Controls -->
          <div style="display:flex; justify-content:center; align-items:center; gap:14px; margin-top:18px;">
            <button type="button" class="btn-secondary" style="padding:8px 18px; font-weight:700;" onclick="jadVocabHub.prevCard()" ${this.currentCardIndex === 0 ? 'disabled' : ''}>
              ← Previous
            </button>
            <button type="button" class="btn-primary" style="background:#059669; border-color:#047857; padding:8px 22px; font-weight:800;" onclick="jadVocabHub.flipCard()">
              🔄 Flip Card
            </button>
            <button type="button" class="btn-secondary" style="padding:8px 18px; font-weight:700;" onclick="jadVocabHub.nextCard()" ${this.currentCardIndex >= totalWords - 1 ? 'disabled' : ''}>
              Next →
            </button>
          </div>
        `;
      }
    }

    // 2. SPELLING BEE DRILL MODE
    else if (this.currentMode === "spelling") {
      const currentWord = words[this.spellingIndex] || words[0];
      contentHTML = `
        <div style="max-width:520px; margin:0 auto; text-align:center; padding:10px 0;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <span style="font-size:0.82rem; font-weight:800; color:var(--text-muted);">Word ${this.spellingIndex + 1} of ${totalWords}</span>
            <span style="font-size:0.85rem; font-weight:800; color:#059669; background:#ecfdf5; padding:3px 10px; border-radius:999px;">
              ⭐ Score: ${this.spellingScore} pts
            </span>
          </div>

          <div style="background:var(--bg-card); border:1.5px solid var(--border-color); border-radius:16px; padding:24px; box-shadow:0 4px 14px rgba(0,0,0,0.06);">
            <div style="font-size:2.5rem; margin-bottom:10px;">🎧</div>
            <h3 style="margin:0 0 6px 0; font-size:1.15rem; color:var(--text-main);">Listen & Spell the Word</h3>
            <p style="font-size:0.82rem; color:var(--text-muted); margin:0 0 16px 0;">
              Hint: <em>${currentWord.meaning}</em> (${currentWord.pos})
            </p>

            <button type="button" class="btn-primary" style="background:#4f46e5; border-color:#4338ca; font-size:0.92rem; padding:10px 22px; gap:8px; margin-bottom:18px;" onclick="jadVocabHub.speakWord('${currentWord.word}')">
              <span>🔊</span>
              <span>Click to Hear Word</span>
            </button>

            <div style="display:flex; gap:8px; max-width:380px; margin:0 auto;">
              <input type="text" id="spellingInput" placeholder="Type word here..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" 
                     style="flex:1; font-size:1.15rem; font-weight:800; text-align:center; padding:10px; border-radius:8px; border:2px solid var(--border-color); background:var(--bg-card); color:var(--text-main);"
                     onkeydown="if(event.key === 'Enter') jadVocabHub.checkSpelling();">
              <button type="button" class="btn-primary" style="background:#059669; border-color:#047857; font-weight:800; padding:10px 18px;" onclick="jadVocabHub.checkSpelling()">
                Check
              </button>
            </div>

            <div id="spellingResult"></div>
          </div>
        </div>
      `;
    }

    // 3. CAMBRIDGE EXAM QUIZ MODE
    else if (this.currentMode === "quiz") {
      const q = this.quizQuestions[this.quizIndex];
      if (!q) {
        contentHTML = `<div style="text-align:center; padding:30px;">Loading exam questions...</div>`;
      } else {
        contentHTML = `
          <div style="max-width:580px; margin:0 auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <span style="font-size:0.82rem; font-weight:800; color:var(--text-muted);">Question ${this.quizIndex + 1} of ${this.quizQuestions.length}</span>
              <span style="font-size:0.85rem; font-weight:800; color:#059669; background:#ecfdf5; padding:3px 10px; border-radius:999px;">
                ⭐ Score: ${this.quizScore} / 100
              </span>
            </div>

            <div style="background:var(--bg-card); border:1.5px solid var(--border-color); border-radius:14px; padding:20px; box-shadow:0 4px 12px rgba(0,0,0,0.06);">
              <h4 style="margin:0 0 16px 0; font-size:1.05rem; line-height:1.4; color:var(--text-main);">
                ${q.q}
              </h4>

              <div style="display:flex; flex-direction:column; gap:8px;">
                ${q.options.map((opt, i) => `
                  <button type="button" class="vocab-quiz-opt" onclick="jadVocabHub.answerQuiz(${i})" 
                          style="text-align:left; font-size:0.9rem; padding:12px 16px; border-radius:8px; border:1.5px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-weight:600; cursor:pointer; transition:all 0.2s ease;">
                    <span style="font-weight:800; color:var(--primary); margin-right:8px;">${String.fromCharCode(65 + i)}.</span>
                    <span>${opt}</span>
                  </button>
                `).join("")}
              </div>

              <div id="vocabQuizExplanation" style="display:none;"></div>

              <div style="text-align:right; margin-top:16px;">
                <button type="button" id="btnVocabQuizNext" class="btn-primary" style="display:none; background:#059669; border-color:#047857; font-weight:800;" onclick="jadVocabHub.nextQuizQuestion()">
                  Next Question →
                </button>
              </div>
            </div>
          </div>
        `;
      }
    }

    // 4. PRINTABLE / REVIEW TABLE MODE
    else if (this.currentMode === "table") {
      contentHTML = `
        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:0.82rem; text-align:left;">
            <thead>
              <tr style="background:var(--bg-card-subtle); border-bottom:2px solid var(--border-color);">
                <th style="padding:10px 12px;">Word</th>
                <th style="padding:10px 12px;">Part of Speech</th>
                <th style="padding:10px 12px;">Meaning</th>
                <th style="padding:10px 12px;">Synonyms / Antonyms</th>
                <th style="padding:10px 12px;">Example Sentence</th>
                <th style="padding:10px 12px; text-align:center;">Listen</th>
              </tr>
            </thead>
            <tbody>
              ${words.map(w => `
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td style="padding:10px 12px; font-weight:800; color:var(--primary);">${w.word}</td>
                  <td style="padding:10px 12px;"><span style="background:#e0e7ff; color:#3730a3; padding:2px 6px; border-radius:4px; font-weight:700; font-size:0.75rem;">${w.pos || '-'}</span></td>
                  <td style="padding:10px 12px; max-width:240px;">${w.meaning}</td>
                  <td style="padding:10px 12px;">
                    ${w.synonyms && w.synonyms.length ? `<div style="color:#047857;">Syn: ${w.synonyms.join(', ')}</div>` : ''}
                    ${w.antonyms && w.antonyms.length ? `<div style="color:#b91c1c;">Ant: ${w.antonyms.join(', ')}</div>` : ''}
                  </td>
                  <td style="padding:10px 12px; font-style:italic; color:var(--text-muted); max-width:240px;">"${w.example}"</td>
                  <td style="padding:10px 12px; text-align:center;">
                    <button type="button" class="btn-xs-study" onclick="jadVocabHub.speakWord('${w.word}')" title="Listen English">
                      🔊
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    container.innerHTML = `
      ${listTabsHTML}
      ${posFilterHTML}
      ${contentHTML}
    `;
  }
}

// Global instance
window.jadVocabHub = new JadVocabHub();
