// =====================================================================
// CAMBRIDGE CHECKPOINT & PRIMARY INTERACTIVE PRACTICE QUIZZER
// Interactive practice questions for Ryan (Grade 8 Stage 9) and Jad (Grade 5 CP)
// =====================================================================

class CambridgeQuizzer {
  constructor() {
    this.currentKidId = "ryan";
    this.currentSubject = "Mathematics";
    this.currentTopic = "Algebra";
    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;

    // Comprehensive Cambridge Question Bank
    this.questionBank = {
      ryan: {
        Mathematics: [
          {
            q: "Simplify the algebraic expression: 4(2x - 3) - 3(x - 5)",
            options: ["5x + 3", "5x - 3", "5x + 27", "11x - 3"],
            correct: 0,
            explanation: "Expand brackets: 4(2x) - 4(3) = 8x - 12. Then -3(x) - 3(-5) = -3x + 15. Combine like terms: (8x - 3x) + (-12 + 15) = 5x + 3."
          },
          {
            q: "Solve for x in the linear equation: 5x - 7 = 3x + 9",
            options: ["x = 1", "x = 4", "x = 8", "x = 16"],
            correct: 2,
            explanation: "Subtract 3x from both sides: 2x - 7 = 9. Add 7 to both sides: 2x = 16. Divide by 2: x = 8."
          },
          {
            q: "In a right-angled triangle, the two perpendicular sides measure 6 cm and 8 cm. Find the hypotenuse.",
            options: ["10 cm", "12 cm", "14 cm", "100 cm"],
            correct: 0,
            explanation: "By Pythagoras' theorem: a² + b² = c². 6² + 8² = 36 + 64 = 100. Hypotenuse c = √100 = 10 cm."
          },
          {
            q: "Evaluate: (2/3) ÷ (4/9)",
            options: ["8/27", "3/2 (or 1 ½)", "2/3", "6/12"],
            correct: 1,
            explanation: "To divide fractions, multiply by the reciprocal: (2/3) × (9/4) = 18/12 = 3/2 = 1.5."
          },
          {
            q: "Factorise completely: 6x² + 9x",
            options: ["3(2x² + 3x)", "3x(2x + 3)", "x(6x + 9)", "3x(3x + 2)"],
            correct: 1,
            explanation: "The highest common factor of 6 and 9 is 3, and of x² and x is x. So 3x(2x + 3)."
          }
        ],
        Science: [
          {
            q: "Which cell organelle is found in plant cells but NOT in animal cells?",
            options: ["Mitochondria", "Nucleus", "Cell Wall & Chloroplast", "Cell Membrane"],
            correct: 2,
            explanation: "Plant cells possess a rigid cellulose cell wall and chloroplasts for photosynthesis. Animal cells do not."
          },
          {
            q: "What is the balanced word equation for aerobic respiration in human cells?",
            options: [
              "Glucose + Oxygen → Carbon Dioxide + Water + Energy",
              "Carbon Dioxide + Water → Glucose + Oxygen",
              "Glucose → Lactic Acid + Energy",
              "Glucose + Carbon Dioxide → Oxygen + Energy"
            ],
            correct: 0,
            explanation: "Aerobic respiration breaks down glucose in the presence of oxygen to release energy, producing carbon dioxide and water as waste products."
          },
          {
            q: "An object with a mass of 12 kg accelerates at 3 m/s². What resultant force acts on it?",
            options: ["4 N", "15 N", "36 N", "108 N"],
            correct: 2,
            explanation: "By Newton's second law: Force = mass × acceleration (F = m × a). F = 12 kg × 3 m/s² = 36 N."
          },
          {
            q: "What is the pH of a neutral solution such as pure water at 25°C?",
            options: ["pH 1", "pH 7", "pH 14", "pH 0"],
            correct: 1,
            explanation: "A neutral solution has a pH of exactly 7. Acids have pH < 7, and alkalis have pH > 7."
          }
        ],
        English: [
          {
            q: "Identify the figure of speech: 'The ancient classroom clock ticked loudly, staring down at the anxious students.'",
            options: ["Metaphor", "Personification", "Hyperbole", "Alliteration"],
            correct: 1,
            explanation: "Giving human qualities ('staring down') to an inanimate object (a clock) is personification."
          },
          {
            q: "Which sentence is correctly punctuated with a semicolon?",
            options: [
              "Ryan studied hard; because the exam was tomorrow.",
              "Ryan solved the algebra problem; then he checked his working.",
              "Ryan studied hard; and passed with distinction.",
              "Ryan, studied; with focus."
            ],
            correct: 1,
            explanation: "A semicolon connects two independent clauses that are closely related without using a coordinating conjunction."
          }
        ]
      },
      jad: {
        Mathematics: [
          {
            q: "What is the value of the digit 7 in the number 47,825?",
            options: ["70", "700", "7,000", "70,000"],
            correct: 2,
            explanation: "In 47,825, the 7 is in the thousands place, so its value is 7,000."
          },
          {
            q: "Calculate: 34 × 20",
            options: ["68", "680", "640", "720"],
            correct: 1,
            explanation: "Multiply 34 by 2 = 68, then add the zero = 680."
          },
          {
            q: "Find the perimeter of a rectangle with length 9 cm and width 4 cm.",
            options: ["13 cm", "26 cm", "36 cm", "18 cm"],
            correct: 1,
            explanation: "Perimeter = 2 × (length + width) = 2 × (9 + 4) = 2 × 13 = 26 cm."
          },
          {
            q: "Which fraction is equivalent to 3/4?",
            options: ["6/8", "4/3", "6/10", "9/15"],
            correct: 0,
            explanation: "Multiply numerator and denominator by 2: (3×2)/(4×2) = 6/8."
          }
        ],
        Science: [
          {
            q: "How does sound travel from a musical instrument to our ears?",
            options: ["Through light waves", "Through vibrations in particles of matter", "Through magnetic force", "Through electricity"],
            correct: 1,
            explanation: "Sound is produced by vibrations that travel through a medium (solid, liquid, or gas) as longitudinal sound waves."
          },
          {
            q: "Which of the following materials is a good thermal insulator (keeps things warm)?",
            options: ["Copper wire", "Steel spoon", "Wool fabric", "Aluminum foil"],
            correct: 2,
            explanation: "Wool traps air and prevents heat transfer, making it an excellent thermal insulator."
          },
          {
            q: "What process causes water on a sunny sidewalk to turn into water vapour?",
            options: ["Condensation", "Evaporation", "Freezing", "Melting"],
            correct: 1,
            explanation: "Evaporation is when liquid water gains heat energy and turns into water vapour gas."
          }
        ],
        English: [
          {
            q: "Identify the adverb in this sentence: 'Jad quickly completed his homework before dinner.'",
            options: ["Jad", "Quickly", "Completed", "Dinner"],
            correct: 1,
            explanation: "'Quickly' describes how the action (completed) was done, so it is an adverb."
          },
          {
            q: "Which word is spelled correctly?",
            options: ["Tomorow", "Tomorrow", "Tommorrow", "Tommorow"],
            correct: 1,
            explanation: "The correct spelling is 'Tomorrow' (one 'm', double 'r')."
          }
        ]
      }
    };
  }

  startQuiz(kidId = "ryan", subject = "Mathematics", topic = "") {
    this.currentKidId = kidId;
    this.currentSubject = subject;
    this.currentTopic = topic;
    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;

    // Pick questions
    const kidBank = this.questionBank[kidId] || this.questionBank["ryan"];
    let subjList = kidBank[subject] || kidBank["Mathematics"] || [];
    
    // Shuffle and pick 3
    const shuffled = [...subjList].sort(() => 0.5 - Math.random());
    this.questions = shuffled.slice(0, 3);

    // If less than 3, fallback
    if (this.questions.length === 0) {
      this.questions = [
        {
          q: `Cambridge ${subject} Practice: Which formula or step applies to ${topic || subject}?`,
          options: ["Check definitions & units", "Apply standard formula", "Solve step by step", "All of the above"],
          correct: 3,
          explanation: "In Cambridge examinations, always verify units, show every working step, and double-check calculations."
        }
      ];
    }

    this.renderQuizModal();
    if (typeof app !== "undefined") {
      app.openModal("modalPracticeQuiz");
    }
  }

  renderQuizModal() {
    const modal = document.getElementById("modalPracticeQuiz");
    if (!modal) return;

    const q = this.questions[this.currentIndex];
    const total = this.questions.length;
    const isRyan = this.currentKidId === "ryan";
    const kidName = isRyan ? "Ryan" : "Jad";
    const levelLabel = isRyan ? "Grade 8 Cambridge Checkpoint" : "Grade 5 Cambridge Primary";

    const contentContainer = document.getElementById("practiceQuizBody");
    if (!contentContainer) return;

    this.answered = false;

    contentContainer.innerHTML = `
      <div style="margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div>
          <span style="font-size:0.75rem; font-weight:800; background:${isRyan ? '#e0e7ff' : '#dcfce7'}; color:${isRyan ? '#3730a3' : '#166534'}; padding:3px 8px; border-radius:6px;">
            ${levelLabel} • ${this.currentSubject}
          </span>
          <div style="font-size:0.8rem; color:var(--text-muted); margin-top:3px;">
            Question ${this.currentIndex + 1} of ${total} • ${kidName}'s Challenge
          </div>
        </div>
        <div style="font-size:0.85rem; font-weight:800; color:var(--primary); background:var(--bg-card-subtle); padding:4px 10px; border-radius:8px; border:1px solid var(--border-color);">
          ⭐ Score: ${this.score}/${this.currentIndex}
        </div>
      </div>

      <!-- Question Card -->
      <div style="background:var(--bg-card); border:1.5px solid var(--border-color); border-radius:12px; padding:18px 20px; margin-bottom:16px; box-shadow:0 2px 6px rgba(0,0,0,0.04);">
        <h3 style="font-size:1.05rem; font-weight:800; color:var(--text-main); line-height:1.45; margin:0 0 16px 0;">
          ${q.q}
        </h3>

        <!-- Options Grid -->
        <div style="display:flex; flex-direction:column; gap:10px;" id="quizOptionsList">
          ${q.options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            return `
              <button type="button" class="quiz-option-btn" id="quiz_opt_${idx}" onclick="cambridgeQuizzer.selectOption(${idx})">
                <span class="quiz-opt-letter">${letter}</span>
                <span class="quiz-opt-text">${opt}</span>
              </button>
            `;
          }).join("")}
        </div>

        <!-- Explanation box (hidden initially) -->
        <div id="quizExplanationBox" style="display:none; margin-top:14px; padding:12px 14px; border-radius:8px; font-size:0.85rem; line-height:1.45;"></div>
      </div>

      <!-- Footer Buttons -->
      <div style="display:flex; justify-content:space-between; align-items:center;" id="quizActionFooter">
        <span style="font-size:0.75rem; color:var(--text-muted);">
          💡 Tip: Solve carefully before choosing your answer
        </span>
        <button type="button" class="btn-primary" id="btnNextQuizQuestion" style="display:none; font-weight:700; padding:8px 20px;" onclick="cambridgeQuizzer.nextQuestion()">
          ${this.currentIndex + 1 === total ? "Finish & View Results 🏆" : "Next Question ➔"}
        </button>
      </div>
    `;
  }

  selectOption(selectedIndex) {
    if (this.answered) return;
    this.answered = true;

    const q = this.questions[this.currentIndex];
    const isCorrect = selectedIndex === q.correct;
    if (isCorrect) this.score++;

    const options = document.querySelectorAll(".quiz-option-btn");
    options.forEach((btn, idx) => {
      btn.style.pointerEvents = "none";
      if (idx === q.correct) {
        btn.classList.add("correct");
      } else if (idx === selectedIndex && !isCorrect) {
        btn.classList.add("incorrect");
      } else {
        btn.style.opacity = "0.5";
      }
    });

    const expBox = document.getElementById("quizExplanationBox");
    if (expBox) {
      expBox.style.display = "block";
      if (isCorrect) {
        expBox.style.background = "#ecfdf5";
        expBox.style.border = "1.5px solid #10b981";
        expBox.style.color = "#065f46";
        expBox.innerHTML = `<strong>✓ Correct! Distinction Level! 🌟</strong><div style="margin-top:4px;">${q.explanation}</div>`;
        this.playCorrectTone();
      } else {
        expBox.style.background = "#fef2f2";
        expBox.style.border = "1.5px solid #ef4444";
        expBox.style.color = "#991b1b";
        expBox.innerHTML = `<strong>⚠️ Keep Practicing!</strong><div style="margin-top:4px;">${q.explanation}</div>`;
      }
    }

    const nextBtn = document.getElementById("btnNextQuizQuestion");
    if (nextBtn) {
      nextBtn.style.display = "inline-flex";
    }
  }

  nextQuestion() {
    this.currentIndex++;
    if (this.currentIndex < this.questions.length) {
      this.renderQuizModal();
    } else {
      this.renderResults();
    }
  }

  renderResults() {
    const contentContainer = document.getElementById("practiceQuizBody");
    if (!contentContainer) return;

    const total = this.questions.length;
    const isPerfect = this.score === total;
    const earnedPoints = this.score * 10;
    const isRyan = this.currentKidId === "ryan";
    const kidName = isRyan ? "Ryan" : "Jad";

    if (earnedPoints > 0 && typeof rewardsSystem !== "undefined") {
      rewardsSystem.awardPoints(this.currentKidId, earnedPoints, `Cambridge Practice Quiz (${this.currentSubject})`);
    }

    if (isPerfect && typeof app !== "undefined") {
      app.triggerCelebration();
    }

    contentContainer.innerHTML = `
      <div style="text-align:center; padding:20px 10px;">
        <div style="font-size:3.5rem; margin-bottom:8px;">
          ${isPerfect ? "🏆" : this.score >= 2 ? "🎉" : "📚"}
        </div>
        <h2 style="font-size:1.4rem; font-weight:800; color:var(--text-main); margin:0 0 6px 0;">
          ${isPerfect ? "Outstanding Cambridge Distinction!" : this.score >= 2 ? "Great Effort & Progress!" : "Review & Try Again!"}
        </h2>
        <p style="font-size:0.85rem; color:var(--text-muted); margin:0 0 16px 0;">
          ${kidName} scored <strong>${this.score} out of ${total}</strong> on ${this.currentSubject}.
        </p>

        <div style="background:var(--bg-card-subtle); border:1.5px solid var(--border-color); border-radius:12px; padding:16px; max-width:320px; margin:0 auto 20px auto;">
          <div style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Study Rewards Earned</div>
          <div style="font-size:1.8rem; font-weight:900; color:#10b981; margin:4px 0;">
            +${earnedPoints} Points ⭐
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted);">
            Added to ${kidName}'s family reward catalog balance!
          </div>
        </div>

        <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
          <button type="button" class="btn-secondary" onclick="app.closeModal('modalPracticeQuiz')">
            Close Quiz
          </button>
          <button type="button" class="btn-primary" onclick="cambridgeQuizzer.startQuiz('${this.currentKidId}', '${this.currentSubject}', '${this.currentTopic}')">
            🔄 Try Another 3 Questions
          </button>
        </div>
      </div>
    `;
  }

  playCorrectTone() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.38);
    } catch (e) {}
  }
}

// Global instance
const cambridgeQuizzer = new CambridgeQuizzer();
