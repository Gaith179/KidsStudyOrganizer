/**
 * Cambridge Checkpoint & Exam Revision Room
 * Specially designed for Ryan (Grade 8) Checkpoint Preparation
 * Features: Mock Exam Timer + Locked Teacher Answer Keys
 */

class PastPaperExamHub {
  constructor() {
    this.activeExam = null;
    this.examTimerSec = 45 * 60;
    this.examInterval = null;
    this.isExamActive = false;
  }

  getExamsList(kidId) {
    if (kidId === "ryan") {
      return [
        {
          id: "exam_g8_1",
          subject: "English Language",
          title: "Cambridge Checkpoint Mock Exam - Past Paper #3",
          durationMin: 45,
          paperFile: "school_downloads/1408_G8_past_paper_3_insert.pdf",
          answerKeyFile: "school_downloads/1334_Grade_8_Study_Guides_1_2_3_Answer_Key.pdf",
          isCompleted: false,
          score: null
        },
        {
          id: "exam_g8_2",
          subject: "Science / Physics",
          title: "Cambridge Science Paper 1 - Atomic Structure & Motion",
          durationMin: 45,
          paperFile: "school_downloads/423_2.1_Atomic_structure_and_the_periodic_table__1_.pdf",
          answerKeyFile: "school_downloads/742_Answer_key_Learner_s_book_Unit_8.pdf",
          isCompleted: false,
          score: null
        },
        {
          id: "exam_g8_3",
          subject: "ICT & Computer Science",
          title: "Pseudocode & Algorithm Testing Guide (Pages 1-24)",
          durationMin: 35,
          paperFile: "school_downloads/1182_01_Student_Study_Guide_Pseudocode_Basics_and_Selection_Pages_1_12__2_.docx.pdf",
          answerKeyFile: "school_downloads/1183_02_Student_Study_Guide_Editing_Testing_and_Debugging_Pages_13_24__2_.docx.pdf",
          isCompleted: false,
          score: null
        }
      ];
    } else {
      return [
        {
          id: "exam_g5_1",
          subject: "English Language",
          title: "Cambridge Primary Checkpoint - English (Reading & Writing Paper)",
          durationMin: 45,
          paperFile: "school_downloads/1436_G5_Midterm_Revision_Worksheet.docx",
          answerKeyFile: "school_downloads/1438_G5_Midterm_Revision_Worksheet_-_Answer_Key.docx",
          isCompleted: false,
          score: null
        },
        {
          id: "exam_g5_2",
          subject: "Science",
          title: "Cambridge Primary Checkpoint - Science (Human Body & Plant Systems)",
          durationMin: 45,
          paperFile: "school_downloads/1208_Grade_5_Quiz_2___The_Respiratory_System___The_Reproductive_System__.docx",
          answerKeyFile: "school_downloads/1206_Unit_One_Model_Answer_Workbook_G5.pdf",
          isCompleted: false,
          score: null
        },
        {
          id: "exam_g5_3",
          subject: "Mathematics",
          title: "Cambridge Primary Checkpoint - Mathematics (Fractions, Division & Numbers)",
          durationMin: 45,
          paperFile: "school_downloads/1206_Unit_One_Model_Answer_Workbook_G5.pdf",
          answerKeyFile: "school_downloads/1206_Unit_One_Model_Answer_Workbook_G5.pdf",
          isCompleted: false,
          score: null
        }
      ];
    }
  }

  startExam(examId, kidId) {
    const exams = this.getExamsList(kidId);
    this.activeExam = exams.find(e => e.id === examId);
    if (!this.activeExam) return;

    this.examTimerSec = this.activeExam.durationMin * 60;
    this.isExamActive = true;

    // Open PDF / Doc in viewer
    if (window.app) {
      window.app.openDocumentPreview(this.activeExam.paperFile, this.activeExam.title);
    }

    if (this.examInterval) clearInterval(this.examInterval);
    this.examInterval = setInterval(() => {
      if (this.examTimerSec > 0) {
        this.examTimerSec--;
        this.updateExamTimerUI();
      } else {
        this.finishExam(true);
      }
    }, 1000);

    alert(`⏱ Exam Started: ${this.activeExam.title}\n\nYou have ${this.activeExam.durationMin} minutes. The official Teacher Answer Key will unlock when you submit!`);
  }

  updateExamTimerUI() {
    const m = Math.floor(this.examTimerSec / 60);
    const s = this.examTimerSec % 60;
    const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    const el = document.getElementById("examActiveTimerDigits");
    if (el) el.innerText = timeStr;
  }

  finishExam(isAuto = false) {
    if (!this.activeExam) return;
    clearInterval(this.examInterval);
    this.isExamActive = false;

    // Unlock answer key
    const answerKey = this.activeExam.answerKeyFile;
    const examTitle = this.activeExam.title;

    // Award rewards points
    if (window.rewards) {
      rewards.awardPoints(window.app?.activeKidId || "ryan", 100, `Completed Mock Exam: ${examTitle}`);
    }

    alert(`🎉 Exam Completed! 100 Points awarded.\n\n🔓 The official Teacher Answer Key is now UNLOCKED for self-grading.`);

    // Automatically prompt to open answer key
    if (window.app && answerKey) {
      window.app.openDocumentPreview(answerKey, `[ANSWER KEY] ${examTitle}`);
    }
  }
}

// Global past paper hub instance
const pastPaperHub = new PastPaperExamHub();
