/**
 * Kids Study Organizer - Main Application Logic
 * Supports: Ryan (8th Grade IGCSE) & Jad (5th Grade)
 * Offline-first, IndexedDB document storage, LocalStorage state management
 */

const MOTIVATION_QUOTES = {
  ryan: [
    {
      quote: "Every tough question you conquer today brings you closer to Cambridge & IGCSE distinction, Ryan! Keep shining!",
      en: "Every tough question you conquer today brings you closer to Cambridge & IGCSE distinction, Ryan! Keep shining!",
      author: "💪 Ryan's Path to Excellence",
      badge: "🚀 Cambridge Achiever"
    },
    {
      quote: "Excellence is never an accident—it is the result of your daily focus, discipline, and persistence. So proud of you, Ryan!",
      en: "Excellence is never an accident—it is the result of your daily focus, discipline, and persistence. So proud of you, Ryan!",
      author: "🌟 Proud Family",
      badge: "⭐ Champion Mindset"
    },
    {
      quote: "Champions never back down from a challenge. Explore tough science and math ideas, break them down, and conquer them!",
      en: "Champions never back down from a challenge. Explore tough science and math ideas, break them down, and conquer them!",
      author: "🧠 Smart & Resilient",
      badge: "🎯 Problem Solver"
    },
    {
      quote: "Step by step, assignment by assignment, you are building an extraordinary future as an inspiring leader. Stay curious and unstoppable!",
      en: "Step by step, assignment by assignment, you are building an extraordinary future as an inspiring leader. Stay curious and unstoppable!",
      author: "🏆 Keep Leading, Ryan",
      badge: "👑 Future Leader"
    },
    {
      quote: "Every checkmark you earn on your checklist is a tangible victory building your confidence. You are a true champion, Ryan!",
      en: "Every checkmark you earn on your checklist is a tangible victory building your confidence. You are a true champion, Ryan!",
      author: "🔥 Driven to Succeed",
      badge: "🏅 Goal Crusher"
    },
    {
      quote: "Focus and consistency are the secrets to Cambridge distinction; nothing is impossible for a sharp mind like yours!",
      en: "Focus and consistency are the secrets to Cambridge distinction; nothing is impossible for a sharp mind like yours!",
      author: "💎 Family Pride",
      badge: "✨ Future Scholar"
    }
  ],
  jad: [
    {
      quote: "Jad, your sharp mind and scientific curiosity are your superpowers! You are a true 5th Grade Cambridge star!",
      en: "Jad, your sharp mind and scientific curiosity are your superpowers! You are a true 5th Grade Cambridge star!",
      author: "🔬 Young Scientist Jad",
      badge: "🌟 Bright Mind"
    },
    {
      quote: "Every exercise you solve and every page you read makes your brain stronger and smarter. Keep up the awesome work, Jad!",
      en: "Every exercise you solve and every page you read makes your brain stronger and smarter. Keep up the awesome work, Jad!",
      author: "✨ Cambridge Star",
      badge: "⚡ Super Learner"
    },
    {
      quote: "You can achieve anything you set your mind to, Jad. We are so proud of your dedication and great work every day!",
      en: "You can achieve anything you set your mind to, Jad. We are so proud of your dedication and great work every day!",
      author: "❤️ Proud Family",
      badge: "🏆 Top Achiever"
    },
    {
      quote: "Great adventures start with curiosity, and great achievements start with today's focus. You've got this, Jad!",
      en: "Great adventures start with curiosity, and great achievements start with today's focus. You've got this, Jad!",
      author: "🎯 Focus & Achieve",
      badge: "🚀 Rocket Kid"
    },
    {
      quote: "Every math problem you solve and science fact you explore makes you a true genius, Jad! Keep creating and shining!",
      en: "Every math problem you solve and science fact you explore makes you a true genius, Jad! Keep creating and shining!",
      author: "🚀 Grade 5 Genius",
      badge: "🌟 Math & Science Star"
    },
    {
      quote: "You are a shining star making us proud every single day. Your daily focus makes you unbeatable, Jad!",
      en: "You are a shining star making us proud every single day. Your daily focus makes you unbeatable, Jad!",
      author: "🏆 Our Star Jad",
      badge: "⭐ Super Star"
    }
  ]
};

class StudyApp {
  constructor() {
    this.data = db.getData();
    this.activeKidId = localStorage.getItem("activeKidId") || "ryan";
    this.activeTab = "today";
    this.selectedDay = this.getInitialDay();
    this.assignmentFilter = "all";
    this.documentFilter = "all";
    this.selectedResourceSubject = "all";
    this.quoteIndex = { ryan: 0, jad: 0 };
    this.parentFilter = "all"; // 'all' (default so screen is never blank) or 'pending'
    this.forceStudentView = false; // Set to true when parent clicks 'View Student Mode'
    this.activePhotoUploadTaskId = null;
    this.activePhotoUploadTaskTitle = "";
    this.currentLightboxPhoto = null;

    // Pomodoro Timer State
    this.timerMinutes = 25;
    this.timerSeconds = 0;
    this.timerInitialDuration = 25 * 60;
    this.timerInterval = null;
    this.isTimerRunning = false;
    this.timerMode = "study"; // 'study' or 'break'
    this.welcomingLetterTimer = null;

    this.init();
  }

  getInitialDay() {
    // School week starts Saturday (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
    // Holidays: Friday (5) and Sunday (0)
    const daysMap = ["saturday", "monday", "tuesday", "wednesday", "thursday", "saturday", "saturday"];
    const dayIndex = new Date().getDay();
    return daysMap[dayIndex] || "saturday";
  }

  getNextSchoolDay(dayKey) {
    const cycle = {
      saturday: "monday",
      monday: "tuesday",
      tuesday: "wednesday",
      wednesday: "thursday",
      thursday: "saturday"
    };
    return cycle[dayKey] || "monday";
  }

  getPrepEveInfo(dayKey) {
    const map = {
      saturday: { eve: "Friday Eve", note: "Study & prepare on Friday evening" },
      monday: { eve: "Sunday Eve", note: "Study & prepare on Sunday evening" },
      tuesday: { eve: "Monday Eve", note: "Study & prepare on Monday evening" },
      wednesday: { eve: "Tuesday Eve", note: "Study & prepare on Tuesday evening" },
      thursday: { eve: "Wednesday Eve", note: "Study & prepare on Wednesday evening" }
    };
    return map[dayKey] || { eve: "Evening Before", note: "Study on evening before" };
  }

  isTaskPastDue(task) {
    if (!task) return false;
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD (e.g. 2026-10-28)

    // 1. Direct dueDate attribute check (e.g., "2026-10-05")
    if (task.dueDate && typeof task.dueDate === "string") {
      const match = task.dueDate.match(/\d{4}-\d{2}-\d{2}/);
      if (match) {
        return match[0] < todayStr;
      }
    }

    // 2. School Week Schedule Mapping (Current week in AAJ timetable)
    const schoolWeekDates = {
      saturday: "2026-10-24",
      sunday: "2026-10-25",
      monday: "2026-10-26",
      tuesday: "2026-10-27",
      wednesday: "2026-10-28",
      thursday: "2026-10-29",
      friday: "2026-10-30"
    };

    // Check task.day if it contains a date string
    if (task.day && typeof task.day === "string") {
      const dayDateMatch = task.day.match(/\d{4}-\d{2}-\d{2}/);
      if (dayDateMatch) {
        return dayDateMatch[0] < todayStr;
      }
      const dayLower = task.day.toLowerCase();
      for (const [dKey, dDate] of Object.entries(schoolWeekDates)) {
        if (dayLower.includes(dKey)) {
          return dDate < todayStr;
        }
      }
    }

    // Check task.id if it's a daily plan lesson task (e.g. "day_saturday_hw_0")
    if (task.id && typeof task.id === "string" && task.id.startsWith("day_")) {
      const parts = task.id.split("_");
      if (parts.length >= 2) {
        const dayKey = parts[1].toLowerCase();
        if (schoolWeekDates[dayKey]) {
          return schoolWeekDates[dayKey] < todayStr;
        }
      }
    }

    // 3. Dynamic Weekday Index Fallback
    const schoolDayOrder = { saturday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4 };
    const currentDayKey = this.selectedDay || this.getInitialDay();
    const currentOrder = schoolDayOrder[currentDayKey] !== undefined ? schoolDayOrder[currentDayKey] : 3;

    if (task.day && typeof task.day === "string") {
      const dayLower = task.day.toLowerCase();
      for (const [dKey, dOrder] of Object.entries(schoolDayOrder)) {
        if (dayLower.includes(dKey)) {
          return dOrder < currentOrder;
        }
      }
    }

    return false;
  }

  getActiveKid() {
    return this.data.kids.find(k => k.id === this.activeKidId) || this.data.kids[0];
  }

  init() {
    this.initPinLock();
    this.setupInstallPrompt();
    this.selectedDay = this.getInitialDay(); // Automatically default to today's weekday
    this.checklistScope = "today"; // Automatically default to today's active classes & homework
    this.applyTheme();
    this.bindGlobalEvents();
    this.renderKidSwitcher();
    this.renderKidBanner();
    this.renderStudyAssistant();
    this.renderDayChips();
    this.renderActiveTab();
    this.setupDropzone();
    this.updateTimerDisplay();
    this.initDeviceUserSelector();
    this.updateViewForRole();

    // Start Live Multi-Device Realtime Sync across 3 mobiles
    db.startLiveSync((remoteEvent) => {
      this.handleRemoteSyncUpdate(remoteEvent);
    });

    // Welcoming Letter: Greet Ryan, Jad, or Mother with special pop-up card
    setTimeout(() => {
      const role = db.getDeviceUser();
      if (role === "Mother" || role === "Ryan" || role === "Jad") {
        this.showWelcomingLetter(role);
      } else if (this.activeKidId) {
        this.showWelcomingLetter(this.activeKidId);
      }
    }, 600);
  }

  initDeviceUserSelector() {
    const sel = document.getElementById("deviceUserSelector");
    if (sel) {
      sel.value = db.getDeviceUser();
    }
  }

  initPinLock() {
    const isUnlocked = sessionStorage.getItem("studyhub_pin_unlocked") === "true";
    const modal = document.getElementById("modalFamilyPinLock");
    if (!modal) return;
    if (!isUnlocked) {
      modal.style.display = "flex";
      setTimeout(() => {
        const inp = document.getElementById("familyPinInput");
        if (inp) inp.focus();
      }, 200);
    } else {
      modal.style.display = "none";
    }
  }

  verifyPin() {
    const input = document.getElementById("familyPinInput");
    const errMsg = document.getElementById("pinErrorMsg");
    const val = input ? input.value.trim() : "";
    const correctPin = localStorage.getItem("studyhub_family_pin") || "2026";

    if (val === correctPin) {
      sessionStorage.setItem("studyhub_pin_unlocked", "true");
      const modal = document.getElementById("modalFamilyPinLock");
      if (modal) {
        modal.style.transition = "opacity 0.25s ease";
        modal.style.opacity = "0";
        setTimeout(() => { modal.style.display = "none"; modal.style.opacity = "1"; }, 250);
      }
    } else {
      if (errMsg) errMsg.innerText = "⚠️ Incorrect PIN. Try again.";
      if (input) {
        input.value = "";
        input.focus();
      }
    }
  }

  setupInstallPrompt() {
    this.deferredInstallPrompt = null;
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      const banner = document.getElementById("pwaInstallBanner");
      if (banner) banner.style.display = "flex";
      const btn = document.getElementById("btnInstallAppTop");
      if (btn) btn.style.display = "inline-flex";
    });

    window.addEventListener("appinstalled", () => {
      this.deferredInstallPrompt = null;
      const banner = document.getElementById("pwaInstallBanner");
      if (banner) banner.style.display = "none";
      const btn = document.getElementById("btnInstallAppTop");
      if (btn) btn.style.display = "none";
    });
  }

  triggerPwaInstall() {
    if (this.deferredInstallPrompt) {
      this.deferredInstallPrompt.prompt();
      this.deferredInstallPrompt.userChoice.then((choice) => {
        if (choice && choice.outcome === "accepted") {
          console.log("User installed PWA");
        }
        this.deferredInstallPrompt = null;
      });
    } else {
      this.openModal("modalInstallGuide");
    }
  }

  showSettingsModal(message) {
    const pin = document.getElementById("settingFamilyPin");
    const user = document.getElementById("settingLmsUser");
    const pass = document.getElementById("settingLmsPass");
    const dad = document.getElementById("settingPhoneFather");
    const mom = document.getElementById("settingPhoneMother");
    const ryan = document.getElementById("settingPhoneRyan");

    if (pin) pin.value = localStorage.getItem("studyhub_family_pin") || "2026";
    if (user) user.value = localStorage.getItem("aaj_sync_user") || "";
    if (pass) pass.value = localStorage.getItem("aaj_sync_pass") || "";
    if (dad) dad.value = localStorage.getItem("contact_phone_father") || "";
    if (mom) mom.value = localStorage.getItem("contact_phone_mother") || "";
    if (ryan) ryan.value = localStorage.getItem("contact_phone_ryan") || "";

    if (message) {
      alert(message);
    }
    this.openModal("modalAppSettings");
  }

  saveSettings() {
    const pin = document.getElementById("settingFamilyPin");
    const user = document.getElementById("settingLmsUser");
    const pass = document.getElementById("settingLmsPass");
    const dad = document.getElementById("settingPhoneFather");
    const mom = document.getElementById("settingPhoneMother");
    const ryan = document.getElementById("settingPhoneRyan");

    if (pin && pin.value.trim()) {
      localStorage.setItem("studyhub_family_pin", pin.value.trim());
    }
    if (user) {
      localStorage.setItem("aaj_sync_user", user.value.trim());
      if (window.schoolSync) window.schoolSync.parentEmail = user.value.trim();
    }
    if (pass) {
      localStorage.setItem("aaj_sync_pass", pass.value.trim());
    }
    if (dad) {
      localStorage.setItem("contact_phone_father", dad.value.trim().replace(/\D/g, ""));
    }
    if (mom) {
      localStorage.setItem("contact_phone_mother", mom.value.trim().replace(/\D/g, ""));
    }
    if (ryan) {
      localStorage.setItem("contact_phone_ryan", ryan.value.trim().replace(/\D/g, ""));
    }

    if (window.notifications && typeof window.notifications.loadContacts === "function") {
      window.notifications.contacts = window.notifications.loadContacts();
    }

    this.closeModal("modalAppSettings");
    alert("✅ Settings saved privately on this device!");
  }

  isParentRole() {
    const role = db.getDeviceUser();
    return role === "Father" || role === "Mother";
  }

  isParentDashboardActive() {
    return this.isParentRole() && !this.forceStudentView;
  }

  switchDeviceUser(role) {
    db.setDeviceUser(role);
    this.forceStudentView = false;
    this.showToast(`📱 Active device role set to: ${role}`);
    this.updateViewForRole();
    this.showWelcomingLetter(role);
  }

  showWelcomingLetter(profileName) {
    const modal = document.getElementById("welcomingLetterModal");
    const content = document.getElementById("welcomeLetterContent");
    const timerBar = document.getElementById("welcomeTimerBar");
    if (!modal || !content) return;

    if (this.welcomingLetterTimer) {
      clearTimeout(this.welcomingLetterTimer);
      this.welcomingLetterTimer = null;
    }

    const norm = (profileName || "").toLowerCase().trim();
    let letterData = null;

    if (norm === "ryan") {
      letterData = {
        badge: "💌 A Special Letter From Dad",
        badgeBg: "rgba(251, 191, 36, 0.15)",
        badgeColor: "#92400e",
        badgeBorder: "#fcd34d",
        cardBorder: "2px solid #fbbf24",
        avatar: "R",
        avatarBg: "linear-gradient(135deg, #4f46e5, #312e81)",
        avatarBorder: "#fbbf24",
        greeting: "Dear Ryan,",
        greetingColor: "#1e1b4b",
        english: "You are amazing and great, and someday you will be a great man and a role model for everyone.",
        signature: "Love you, — Your Dad ❤️",
        sigColor: "#b45309",
        barColor: "linear-gradient(90deg, #4f46e5, #fbbf24)"
      };
    } else if (norm === "jad") {
      letterData = {
        badge: "💌 A Special Letter From Dad",
        badgeBg: "rgba(52, 211, 153, 0.15)",
        badgeColor: "#065f46",
        badgeBorder: "#6ee7b7",
        cardBorder: "2px solid #34d399",
        avatar: "J",
        avatarBg: "linear-gradient(135deg, #059669, #047857)",
        avatarBorder: "#34d399",
        greeting: "Dear Jad,",
        greetingColor: "#065f46",
        english: "My hero, the amazing Jad! Someday people will talk about your success.",
        signature: "Love you, — Your Dad ❤️",
        sigColor: "#059669",
        barColor: "linear-gradient(90deg, #059669, #34d399)"
      };
    } else if (norm === "mother") {
      letterData = {
        badge: "💖 With All My Love & Gratitude",
        badgeBg: "rgba(251, 113, 133, 0.15)",
        badgeColor: "#9f1239",
        badgeBorder: "#fecdd3",
        cardBorder: "2px solid #fb7185",
        avatar: "🌸",
        avatarBg: "linear-gradient(135deg, #e11d48, #be123c)",
        avatarBorder: "#fb7185",
        greeting: "To the Heart of Our Family,",
        greetingColor: "#9f1239",
        english: "The perfect mother, the amazing wife! Thank you for your endless effort in building our family.",
        signature: "Love you, — Gaith ❤️",
        sigColor: "#e11d48",
        barColor: "linear-gradient(90deg, #e11d48, #fb7185)"
      };
    } else {
      return;
    }

    const card = document.getElementById("welcomeLetterCard");
    if (card) {
      card.style.border = letterData.cardBorder;
    }

    content.innerHTML = `
      <div style="margin-bottom:12px;">
        <span style="background:${letterData.badgeBg}; color:${letterData.badgeColor}; border:1px solid ${letterData.badgeBorder}; font-size:0.75rem; font-weight:800; padding:4px 14px; border-radius:999px; display:inline-block;">
          ${letterData.badge}
        </span>
      </div>
      <div style="width:64px; height:64px; border-radius:50%; background:${letterData.avatarBg}; color:#fff; font-size:28px; font-weight:900; display:flex; align-items:center; justify-content:center; margin:0 auto 12px auto; border:3px solid ${letterData.avatarBorder}; box-shadow:0 4px 14px rgba(0,0,0,0.15);">
        ${letterData.avatar}
      </div>
      <h3 style="margin:0 0 12px 0; font-size:1.3rem; font-weight:900; color:${letterData.greetingColor};">
        ${letterData.greeting}
      </h3>
      <div style="font-size:1.08rem; line-height:1.6; color:#1e293b; font-weight:600; margin-bottom:16px; font-style:italic; padding:0 12px;">
        "${letterData.english}"
      </div>
      <div style="font-weight:900; font-size:1.1rem; color:${letterData.sigColor};">
        ${letterData.signature}
      </div>
      <div style="font-size:0.72rem; color:var(--text-muted); margin-top:12px; opacity:0.8;">
        ⏱️ Closing in 3 seconds • Tap anywhere to dismiss
      </div>
    `;

    if (timerBar) {
      timerBar.style.background = letterData.barColor;
      timerBar.style.animation = "none";
      void timerBar.offsetWidth; // trigger reflow
      timerBar.style.animation = "welcome-shrink 3s linear forwards";
    }

    modal.classList.remove("closing");
    modal.style.display = "flex";

    this.welcomingLetterTimer = setTimeout(() => {
      this.closeWelcomingLetter();
    }, 3200);
  }

  closeWelcomingLetter() {
    if (this.welcomingLetterTimer) {
      clearTimeout(this.welcomingLetterTimer);
      this.welcomingLetterTimer = null;
    }
    const modal = document.getElementById("welcomingLetterModal");
    if (!modal) return;
    modal.classList.add("closing");
    setTimeout(() => {
      modal.style.display = "none";
      modal.classList.remove("closing");
    }, 250);
  }

  toggleForceStudentView(force) {
    this.forceStudentView = force;
    this.updateViewForRole();
    if (force) {
      this.showToast("👁️ Viewing Detailed Student Mode (Ryan & Jad)");
    } else {
      this.showToast("📋 Switched back to Dual-Kid Executive Checklist");
    }
  }

  setParentFilter(filter) {
    this.parentFilter = filter;
    this.renderParentExecutiveDashboard();
  }

  updateViewForRole() {
    const isParentActive = this.isParentDashboardActive();
    const parentDashboard = document.getElementById("parentExecutiveDashboard");
    const studentWrapper = document.getElementById("studentInterfaceWrapper");
    const mobileBottomNav = document.querySelector(".mobile-bottom-nav");

    if (isParentActive) {
      if (parentDashboard) parentDashboard.style.display = "block";
      if (studentWrapper) studentWrapper.style.display = "none";
      if (mobileBottomNav) mobileBottomNav.style.display = "none";
      this.renderParentExecutiveDashboard();
    } else {
      if (parentDashboard) parentDashboard.style.display = "none";
      if (studentWrapper) studentWrapper.style.display = "block";
      if (mobileBottomNav) mobileBottomNav.style.display = "flex";
      this.renderKidBanner();
      this.renderStudyAssistant();
      this.renderActiveTab();
    }

    // Floating Return Banner when parent views student mode
    let parentReturnBanner = document.getElementById("parentReturnBanner");
    if (this.isParentRole() && this.forceStudentView) {
      if (!parentReturnBanner) {
        parentReturnBanner = document.createElement("div");
        parentReturnBanner.id = "parentReturnBanner";
        parentReturnBanner.style.cssText = "background: linear-gradient(135deg, #4f46e5 0%, #059669 100%); color:#fff; padding:10px 18px; border-radius:10px; margin: 12px auto; max-width:1200px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; font-size:0.85rem; font-weight:700; box-shadow:0 4px 12px rgba(0,0,0,0.15);";
        if (studentWrapper) studentWrapper.prepend(parentReturnBanner);
      }
      parentReturnBanner.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          <span>👨‍💼</span>
          <span>Viewing Detailed Student Mode (${db.getDeviceUser()})</span>
        </div>
        <button type="button" class="btn-secondary" style="background:#fff; color:#0f172a; font-weight:800; font-size:0.78rem; padding:5px 14px; border:none; border-radius:6px; cursor:pointer;" onclick="app.toggleForceStudentView(false)">
          ↩ Return to Dual-Kid Checklist
        </button>
      `;
      parentReturnBanner.style.display = "flex";
    } else if (parentReturnBanner) {
      parentReturnBanner.style.display = "none";
    }
  }

  // --- PARENT EXECUTIVE DUAL-KID DASHBOARD ---
  renderParentExecutiveDashboard() {
    const container = document.getElementById("parentExecutiveDashboard");
    if (!container) return;

    const role = db.getDeviceUser();
    const isFather = role === "Father";
    const filter = this.parentFilter || "pending";

    const kids = this.data.kids || [];
    const ryan = kids.find(k => k.id === "ryan") || kids[0];
    const jad = kids.find(k => k.id === "jad") || kids[1];

    const getKidTaskList = (kid) => {
      const days = (kid.weeklyPlan && kid.weeklyPlan.days) ? kid.weeklyPlan.days : {};
      const completedState = this.data.completedTasks || {};
      const list = [];

      // 1. Quizzes and Exams from Weekly Plan
      Object.keys(days).forEach(dayKey => {
        (days[dayKey] || []).forEach((l, idx) => {
          if (l.exam && l.exam.trim().length > 0) {
            const taskId = `day_${dayKey}_hw_${idx}`;
            const isDone = !!completedState[taskId];
            const meta = db.getTaskMeta(taskId);
            const isPastDue = this.isTaskPastDue({ id: taskId, day: dayKey, isExam: true });
            list.push({
              id: taskId,
              type: "Exam / Quiz",
              isExam: true,
              isDailyPlan: true,
              subject: l.subject,
              title: l.exam,
              day: dayKey.charAt(0).toUpperCase() + dayKey.slice(1),
              ref: l.reference || l.notes || "",
              isDone: isDone,
              isPastDue: isPastDue,
              meta: meta
            });
          }
        });
      });

      // 2. Homework from Weekly Plan
      Object.keys(days).forEach(dayKey => {
        (days[dayKey] || []).forEach((l, idx) => {
          const hw = l.assignment || l.homework;
          if (hw && hw.trim().length > 0 && !l.exam) {
            const taskId = `day_${dayKey}_hw_${idx}`;
            const isDone = !!completedState[taskId];
            const meta = db.getTaskMeta(taskId);
            const isPastDue = this.isTaskPastDue({ id: taskId, day: dayKey });
            list.push({
              id: taskId,
              type: "Homework",
              isExam: false,
              isDailyPlan: true,
              subject: l.subject,
              title: hw,
              day: dayKey.charAt(0).toUpperCase() + dayKey.slice(1),
              ref: l.reference || l.notes || "",
              isDone: isDone,
              isPastDue: isPastDue,
              meta: meta
            });
          }
        });
      });

      // 3. School Assignments
      (kid.assignments || []).forEach(a => {
        const isDone = a.status === "completed";
        const meta = db.getTaskMeta(a.id);
        const isPastDue = this.isTaskPastDue(a);
        list.push({
          id: a.id,
          type: a.type || "Assignment",
          isExam: a.type === "Quiz" || a.type === "Exam" || a.type === "Test",
          isDailyPlan: false,
          subject: a.subject,
          title: a.title,
          day: a.dueDate ? `Due: ${a.dueDate}` : "",
          dueDate: a.dueDate,
          ref: a.details || "",
          isDone: isDone,
          isPastDue: isPastDue,
          meta: meta
        });
      });

      return list;
    };

    const ryanTasks = getKidTaskList(ryan);
    const jadTasks = getKidTaskList(jad);

    const ryanDone = ryanTasks.filter(t => t.isDone).length;
    const jadDone = jadTasks.filter(t => t.isDone).length;

    const ryanOverdue = ryanTasks.filter(t => !t.isDone && t.isPastDue).length;
    const jadOverdue = jadTasks.filter(t => !t.isDone && t.isPastDue).length;

    const ryanActive = ryanTasks.filter(t => !t.isDone && !t.isPastDue).length;
    const jadActive = jadTasks.filter(t => !t.isDone && !t.isPastDue).length;

    const filterTasks = (taskList) => {
      if (filter === "pending") return taskList.filter(t => !t.isDone);
      if (filter === "active") return taskList.filter(t => !t.isDone && !t.isPastDue);
      if (filter === "overdue") return taskList.filter(t => !t.isDone && t.isPastDue);
      if (filter === "completed") return taskList.filter(t => t.isDone);
      return taskList; // "all"
    };

    const ryanFiltered = filterTasks(ryanTasks);
    const jadFiltered = filterTasks(jadTasks);

    const totalActive = ryanActive + jadActive;
    const totalOverdue = ryanOverdue + jadOverdue;
    const totalDone = ryanDone + jadDone;
    const totalPending = totalActive + totalOverdue;
    const totalAll = ryanTasks.length + jadTasks.length;
    const ryanPts = (typeof rewardsSystem !== 'undefined' && rewardsSystem.getKidData) ? rewardsSystem.getKidData('ryan').points : 320;
    const jadPts = (typeof rewardsSystem !== 'undefined' && rewardsSystem.getKidData) ? rewardsSystem.getKidData('jad').points : 410;

    const renderKidColumn = (kid, tasks, completedCount, totalCount, overdueCount, activeCount, accentColor, cardClass) => {
      const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;
      const isRyan = kid.id === "ryan";

      return `
        <div class="parent-kid-card ${cardClass}">
          <div class="parent-kid-card-header">
            <div class="parent-kid-identity">
              <div class="parent-kid-avatar" style="background:${accentColor};">${kid.avatar || kid.name.charAt(0)}</div>
              <div>
                <h3 class="parent-kid-title">${kid.name}</h3>
                <span class="parent-kid-subtitle">${isRyan ? "8th Grade Cambridge Checkpoint / IGCSE" : "5th Grade Cambridge Primary (CP)"}</span>
              </div>
            </div>
            <div class="parent-progress-pill" style="display:flex; gap:6px; flex-wrap:wrap; align-items:center; background:${pct === 100 ? '#ecfdf5' : '#f8fafc'}; color:${pct === 100 ? '#065f46' : '#334155'}; border:1px solid ${pct === 100 ? '#a7f3d0' : '#cbd5e1'}; padding:4px 10px; border-radius:8px;">
              <span style="font-weight:800;">${completedCount}/${totalCount} (${pct}%)</span>
              <span style="opacity:0.35;">•</span>
              <span style="color:#059669; font-weight:700;">✓ ${completedCount} Done</span>
              ${overdueCount > 0 ? `<span style="color:#b91c1c; font-weight:800; background:#fee2e2; padding:1px 6px; border-radius:4px;">⚠️ ${overdueCount} Past Due</span>` : ''}
              <span style="color:#2563eb; font-weight:700;">⏳ ${activeCount} Active</span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div style="background:#f1f5f9; height:6px; width:100%; overflow:hidden;">
            <div style="background:${accentColor}; height:100%; width:${pct}%; transition:width 0.4s ease;"></div>
          </div>

          <!-- Cambridge Milestone / Distinction Banner -->
          <div style="padding: 12px 14px 0 14px;">
            ${isRyan ? `
              <div class="cambridge-distinction-card">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                  <div>
                    <div style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.5px; opacity:0.85; font-weight:800;">Cambridge Lower Secondary (Stage 9)</div>
                    <div style="font-weight:900; font-size:1.02rem; margin-top:2px;">🎯 Target: Distinction (Band 6.0 / 50)</div>
                  </div>
                  <div class="cambridge-countdown-pill">
                    <span>⏳</span>
                    <span>${this.getDaysUntilAprilCheckpoint()} Days to Checkpoint</span>
                  </div>
                </div>
                <div style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;">
                  <button type="button" class="btn-xs-study" style="background:rgba(255,255,255,0.2); color:#fff; border:1px solid rgba(255,255,255,0.35); padding:4px 10px;" onclick="app.openOfficialPdf('ryan')">
                    📄 Ryan's School PDF (Oct 24)
                  </button>
                  <button type="button" class="btn-xs-study" style="background:#4338ca; color:#fff; border:1px solid rgba(255,255,255,0.4); padding:4px 10px;" onclick="cambridgeQuizzer.startQuiz('ryan', 'Mathematics', 'Algebra')">
                    🧠 Quick Checkpoint Quiz
                  </button>
                  <button type="button" class="btn-xs-study" style="background:rgba(255,255,255,0.2); color:#fff; border:1px solid rgba(255,255,255,0.35); padding:4px 10px;" onclick="app.setTab('pastpapers'); app.toggleForceStudentView(true)">
                    📐 Past Papers
                  </button>
                </div>
              </div>
            ` : `
              <div class="jad-milestone-card">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                  <div>
                    <div style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.5px; opacity:0.85; font-weight:800;">Cambridge Primary (Stage 5)</div>
                    <div style="font-weight:900; font-size:1.02rem; margin-top:2px;">🌟 Excellence Milestone: Mental Math & Science</div>
                  </div>
                  <div class="cambridge-countdown-pill" style="background:rgba(255,255,255,0.2);">
                    <span>🏆</span>
                    <span>Grade 5 Honors</span>
                  </div>
                </div>
                <div style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;">
                  <button type="button" class="btn-xs-study" style="background:rgba(255,255,255,0.2); color:#fff; border:1px solid rgba(255,255,255,0.35); padding:4px 10px;" onclick="app.openOfficialPdf('jad')">
                    📄 Jad's School PDF (Oct 24)
                  </button>
                  <button type="button" class="btn-xs-study" style="background:#047857; color:#fff; border:1px solid rgba(255,255,255,0.4); padding:4px 10px;" onclick="cambridgeQuizzer.startQuiz('jad', 'Mathematics', 'Numbers & Shapes')">
                    🧠 Quick Primary Quiz
                  </button>
                  <button type="button" class="btn-xs-study" style="background:#059669; color:#fff; border:1px solid rgba(255,255,255,0.4); padding:4px 10px;" onclick="jadVocabHub.openVocabModal('list1', 'flashcards')">
                    🔤 Vocab & Spelling Hub (+15 pts)
                  </button>
                </div>
              </div>
            `}
          </div>

          <div class="parent-task-list">
            ${tasks.length === 0 ? `
              <div style="text-align:center; padding:35px 20px; color:var(--text-muted);">
                <div style="font-size:2.5rem; margin-bottom:8px;">${filter === 'overdue' ? '🎉' : (filter === 'completed' ? '📝' : '📋')}</div>
                <h4 style="margin:0 0 4px 0; color:var(--text-main); font-size:1rem;">
                  ${filter === 'overdue' ? 'No overdue items!' : (filter === 'completed' ? 'No completed items yet' : 'All caught up!')}
                </h4>
                <p style="font-size:0.82rem; margin:0;">
                  ${filter === 'overdue' ? `All tasks for ${kid.name} were completed or are on schedule!` : `No items found in this filter.`}
                </p>
              </div>
            ` : tasks.map(task => {
              const whoDone = task.meta && task.meta.updatedBy ? `by ${task.meta.updatedBy}` : (task.meta && task.meta.time ? task.meta.time : "");
              const vn = this.getVoiceNote(task.id);
              const helpReq = (this.data.helpRequests || {})[task.id];
              const photo = db.getTaskPhoto(task.id);

              return `
                <div class="parent-task-item ${task.isDone ? 'is-done' : (task.isPastDue ? 'is-overdue' : (task.isExam ? 'is-exam' : 'is-active'))}">
                  <!-- Status Indicator: NO CHECKBOX if done OR past due date! -->
                  ${task.isDone ? `
                    <div class="parent-status-icon is-done" title="✓ Completed">
                      <span>✓</span>
                    </div>
                  ` : (task.isPastDue ? `
                    <div class="parent-status-icon is-overdue" title="⚠️ Past Due Date - Not Completed">
                      <span>⚠️</span>
                    </div>
                  ` : `
                    <button type="button" class="parent-checkbox-btn" 
                            onclick="app.toggleTaskCompleted('${task.id}', ${!!task.isDailyPlan})" 
                            title="Click to mark complete (Syncs across all 3 family mobiles)">
                    </button>
                  `)}

                  <div style="flex:1; min-width:0;">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:3px;">
                      <span style="font-size:0.75rem; font-weight:800; color:${accentColor}; display:inline-flex; align-items:center; gap:4px;">
                        <span>${this.getSubjectIcon(kid, task.subject)}</span>
                        <span>${task.subject}</span>
                      </span>
                      <div style="display:flex; gap:4px; align-items:center; flex-wrap:wrap;">
                        ${task.isExam ? `
                          <span style="font-size:0.68rem; font-weight:800; padding:2px 7px; border-radius:4px; ${task.isDone ? 'background:#ecfdf5; color:#065f46;' : (task.isPastDue ? 'background:#fee2e2; color:#b91c1c; border:1px solid #f87171;' : 'background:#fee2e2; color:#b91c1c;')}">
                            ${task.isDone ? '✅ EXAM FINISHED' : (task.isPastDue ? '🚨 EXAM DATE PASSED' : '🚨 EXAM / QUIZ')}
                          </span>
                        ` : ''}
                        ${task.day ? `<span style="font-size:0.68rem; background:var(--bg-card-subtle); color:var(--text-muted); font-weight:700; padding:1px 6px; border-radius:4px; border:1px solid var(--border-color);">${task.day}</span>` : ''}
                      </div>
                    </div>
                    
                    <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:10px;">
                      <div style="flex:1; font-size:0.88rem; font-weight:700; ${task.isDone ? 'color:var(--text-muted); text-decoration:line-through; opacity:0.8;' : (task.isPastDue ? 'color:#991b1b; font-weight:800;' : 'color:var(--text-main);')} line-height:1.35; margin-bottom:4px;">
                        ${task.title}
                      </div>
                      ${photo && photo.photoData ? `
                        <img src="${photo.photoData}" class="hw-photo-thumbnail" onclick="app.openPhotoLightbox('${task.id}', '${photo.photoData}', '${(task.title || '').replace(/'/g, "\\'")}')" title="Inspect child's handwritten workbook page">
                      ` : ''}
                    </div>

                    ${task.ref ? `<div style="font-size:0.74rem; color:var(--text-muted); line-height:1.25; margin-bottom:4px;">📖 Ref: ${task.ref}</div>` : ''}

                    ${helpReq ? `
                      <div style="background:#fffbeb; border:1.5px solid #f59e0b; border-radius:6px; padding:4px 10px; font-size:0.75rem; color:#b45309; font-weight:800; margin:4px 0; display:flex; justify-content:space-between; align-items:center; gap:8px;">
                        <span>❓ <strong>${helpReq.kid}</strong> asked: "${helpReq.note}"</span>
                        <button type="button" class="btn-xs-study" style="background:#10b981; color:#fff; border:none; padding:2px 8px;" onclick="app.resolveHelpRequest('${task.id}')">✓ Assisted</button>
                      </div>
                    ` : ''}

                    <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px; margin-top:6px;">
                      <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                        <span style="font-size:0.75rem; font-weight:800; display:inline-flex; align-items:center; gap:4px; ${task.isDone ? 'color:#059669;' : (task.isPastDue ? 'color:#b91c1c;' : 'color:var(--primary);')}">
                          ${task.isDone 
                            ? `✓ Completed ${whoDone ? `(${whoDone})` : ''}` 
                            : (task.isPastDue 
                                ? `⚠️ Past Due Date (Not Completed)` 
                                : `⏳ Active / Due Today`)}
                        </span>
                        ${task.isDone ? `
                          <button type="button" style="background:none; border:none; color:var(--text-muted); font-size:0.72rem; cursor:pointer; text-decoration:underline;" onclick="app.toggleTaskCompleted('${task.id}', ${!!task.isDailyPlan})" title="Marked by mistake? Reopen">↩ Reopen</button>
                        ` : (task.isPastDue ? `
                          <button type="button" class="btn-xs-study" style="background:#fff; border:1px solid #fca5a5; color:#991b1b; padding:2px 8px;" onclick="app.toggleTaskCompleted('${task.id}', ${!!task.isDailyPlan})" title="Mark completed late">✓ Mark Done Late</button>
                        ` : '')}
                        ${vn && (vn.audio || vn.audioData) ? `
                          <button type="button" class="voice-pill-btn" onclick="app.playVoiceNote('${task.id}', this)" title="Listen to Parent Voice Note">
                            <span>🔊</span>
                            <span>Play Note (${vn.from || 'Parent'})</span>
                          </button>
                        ` : ''}
                      </div>

                      <div style="display:flex; align-items:center; gap:6px;">
                        <button type="button" class="btn-xs-study" onclick="app.triggerPhotoCapture('${task.id}', '${(task.title || '').replace(/'/g, "\\'")}')" title="Upload workbook page photo">
                          📸 ${photo ? 'Photo ✓' : 'Photo'}
                        </button>
                        <button type="button" class="btn-xs-study" style="background:#e0e7ff; color:#3730a3; border-color:#c7d2fe;" onclick="cambridgeQuizzer.startQuiz('${kid.id}', '${task.subject || 'Mathematics'}', '${(task.title || '').replace(/'/g, "\\'")}')" title="Test knowledge with 3 quick Cambridge practice questions">
                          🧠 Quiz
                        </button>
                        <button type="button" class="btn-xs-study" onclick="app.startVoiceRecording('${task.id}', '${(task.title || '').replace(/'/g, "\\'")}')" title="Record 15-second voice note for child">
                          <span>🎙️ Voice</span>
                        </button>
                        <button type="button" class="btn-xs-study" onclick="app.searchTopic('${task.subject || ''}', '${(task.title || '').replace(/'/g, "\\'")}')" title="Search topic video explanation">
                          🎥 Video
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    };

    // Active Help Requests Banner for Parents
    const helpRequests = this.data.helpRequests || {};
    const activeHelpKeys = Object.keys(helpRequests);
    const helpBannerHtml = activeHelpKeys.length > 0 ? `
      <div class="help-request-banner">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:1.6rem;">🚨</span>
          <div>
            <strong style="color:#b45309; font-size:0.92rem;">Homework Help Needed by Child!</strong>
            ${activeHelpKeys.map(k => {
              const req = helpRequests[k];
              return `
                <div style="font-size:0.82rem; color:#78350f; margin-top:2px;">
                  👦 <strong>${req.kid}</strong> on <em>${req.subject}: ${req.title}</em>:
                  "${req.note}" <span style="font-size:0.72rem; opacity:0.8;">(${req.time})</span>
                </div>
              `;
            }).join("")}
          </div>
        </div>
        <div style="display:flex; gap:6px;">
          ${activeHelpKeys.map(k => `
            <button type="button" class="btn-primary" style="background:#10b981; border-color:#059669; font-size:0.78rem; padding:6px 12px;" onclick="app.resolveHelpRequest('${k}')">
              ✓ Mark Assisted
            </button>
          `).join("")}
        </div>
      </div>
    ` : "";

    container.innerHTML = `
      ${helpBannerHtml}
      <div class="parent-exec-header">
        <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
          <div style="width:48px; height:48px; border-radius:12px; background:linear-gradient(135deg, #4f46e5 0%, #059669 100%); display:flex; align-items:center; justify-content:center; font-size:1.6rem; color:#fff; box-shadow:0 4px 10px rgba(0,0,0,0.15);">
            ${isFather ? "👨‍💼" : "👩‍💼"}
          </div>
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <h2 style="margin:0; font-size:1.35rem; font-weight:800; color:var(--text-main);">
                ${isFather ? "Father's Executive Study Checklist" : "Mother's Executive Study Checklist"}
              </h2>
              <span style="font-size:0.72rem; background:#ecfdf5; border:1px solid #a7f3d0; color:#065f46; font-weight:800; padding:2px 8px; border-radius:999px;">
                🟢 3-Phone Live Sync
              </span>
            </div>
            <p style="margin:3px 0 0 0; font-size:0.8rem; color:var(--text-muted);">
              Dual-Kid Quick Verification • Tap any checkmark to update across all 3 family mobiles
            </p>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <div class="parent-filter-pills" style="display:flex; gap:6px; flex-wrap:wrap;">
            <button type="button" class="parent-filter-btn ${filter === 'all' ? 'active' : ''}" onclick="app.setParentFilter('all')">
              📋 All (${totalAll})
            </button>
            <button type="button" class="parent-filter-btn ${filter === 'active' ? 'active' : ''}" onclick="app.setParentFilter('active')">
              ⏳ Active (${totalActive})
            </button>
            <button type="button" class="parent-filter-btn ${filter === 'overdue' ? 'active' : ''}" style="${totalOverdue > 0 ? 'border-color:#fca5a5; color:#991b1b; font-weight:800;' : ''}" onclick="app.setParentFilter('overdue')">
              ⚠️ Past Due (${totalOverdue})
            </button>
            <button type="button" class="parent-filter-btn ${filter === 'completed' ? 'active' : ''}" onclick="app.setParentFilter('completed')">
              ✓ Done (${totalDone})
            </button>
          </div>

          <button type="button" class="btn-primary" style="background:#25D366; border-color:#128C7E; font-size:0.8rem; padding:7px 14px; font-weight:700; gap:6px;" onclick="app.openWhatsAppDigestModal()" title="Send today's study digest to WhatsApp">
            <span>📲</span>
            <span>WhatsApp Digest</span>
          </button>

          <button type="button" class="btn-secondary" style="font-size:0.8rem; padding:7px 14px; font-weight:700; gap:6px; background:#1e1b4b; color:#c7d2fe; border-color:#3730a3;" onclick="app.dispatchBedtimeWrapup()" title="Send 09:00 PM Nightly Bedtime & Tomorrow Schedule">
            <span>🌙</span>
            <span>Bedtime Wrap-Up</span>
          </button>

          <button type="button" class="btn-secondary" style="font-size:0.8rem; padding:7px 14px; font-weight:700; gap:6px;" onclick="app.openWeeklyReportCardModal()" title="Sunday Weekly Progress & Distinction Report">
            <span>📊</span>
            <span>Weekly Report</span>
          </button>

          <button type="button" class="btn-secondary" id="btnSyncSchoolLms" style="font-size:0.8rem; padding:7px 14px; font-weight:700; gap:6px;" onclick="app.syncSchoolLmsNow()" title="Fetch newest weekly plan from LMS">
            <span>🔄</span>
            <span>Sync LMS Now</span>
          </button>

          <button type="button" class="btn-secondary" style="font-size:0.8rem; padding:7px 14px; font-weight:700; gap:6px;" onclick="app.resetAllTasksToPending()" title="Uncheck all completed tasks to practice again">
            <span>↩️</span>
            <span>Reset to Pending</span>
          </button>

          <button type="button" class="btn-secondary" style="font-size:0.8rem; padding:7px 14px; font-weight:700; gap:6px;" onclick="app.toggleForceStudentView(true)">
            <span>👁️</span>
            <span>Switch to Full Student View</span>
          </button>
        </div>
      </div>

      <!-- BROTHER STUDY QUEST: SIBLING MOTIVATION CARD -->
      <div class="sibling-quest-card">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="font-size:2.2rem;">🏆</div>
            <div>
              <div style="font-size:0.75rem; text-transform:uppercase; font-weight:800; color:var(--text-muted); letter-spacing:0.5px;">Brother Study Quest • Weekly Momentum</div>
              <div style="font-size:1.05rem; font-weight:900; color:var(--text-main); margin-top:2px;">
                👦 Ryan: <strong style="color:#4f46e5;">⭐ ${ryanPts} pts</strong> (${ryanDone}/${ryanTasks.length} Done${ryanOverdue > 0 ? ` • <span style="color:#b91c1c;">⚠️ ${ryanOverdue} Past Due</span>` : ''})
                <span style="margin:0 8px; color:var(--border-color); font-weight:normal;">•</span>
                👦 Jad: <strong style="color:#059669;">⭐ ${jadPts} pts</strong> (${jadDone}/${jadTasks.length} Done${jadOverdue > 0 ? ` • <span style="color:#b91c1c;">⚠️ ${jadOverdue} Past Due</span>` : ''})
              </div>
            </div>
          </div>
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <span class="quest-leader-badge">🔥 Both Champions on Active Streaks!</span>
            <button type="button" class="btn-xs-study" style="background:#e0e7ff; color:#3730a3; padding:5px 12px; font-weight:700;" onclick="app.setTab('rewards'); app.toggleForceStudentView(true)">
              Rewards Catalog →
            </button>
          </div>
        </div>
      </div>

      <div class="parent-kids-grid">
        <!-- Ryan Column (Left) -->
        ${renderKidColumn(ryan, ryanFiltered, ryanDone, ryanTasks.length, ryanOverdue, ryanActive, "#4f46e5", "ryan-parent-card")}

        <!-- Jad Column (Right) -->
        ${renderKidColumn(jad, jadFiltered, jadDone, jadTasks.length, jadOverdue, jadActive, "#059669", "jad-parent-card")}
      </div>
    `;
  }

  showSyncStatusModal() {
    alert(`🟢 Live Multi-Device Sync (3 Mobiles):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👨‍💼 Father's Mobile
👩‍💼 Mother's Mobile
👦 Ryan & Jad's Devices

Automatic synchronization is active via /api/sync.
When any homework or exam is checked off as completed, it updates instantly across all phones with author name and timestamp.`);
  }

  showToast(message) {
    let toast = document.getElementById("studyHubToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "studyHubToast";
      toast.style.cssText = "position:fixed; bottom:70px; right:20px; z-index:99999; background:#0f172a; color:#fff; padding:12px 20px; border-radius:10px; font-size:0.85rem; font-weight:700; box-shadow:0 10px 25px rgba(0,0,0,0.3); border-left:4px solid #10b981; transition:all 0.3s ease; opacity:0; pointer-events:none;";
      document.body.appendChild(toast);
    }
    toast.innerHTML = message;
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
    }, 3500);
  }

  handleRemoteSyncUpdate(event) {
    this.data = db.getData();
    if (this.isParentDashboardActive()) {
      this.renderParentExecutiveDashboard();
    }
    this.renderKidBanner();
    this.renderStudyAssistant();
    if (this.activeTab === "today") {
      this.renderTodayChecklist();
    } else if (this.activeTab === "weekly") {
      this.renderWeeklyPlan();
    } else if (this.activeTab === "assignments") {
      this.renderAssignments();
    }
    
    if (event && event.meta && event.meta.updatedBy) {
      this.showToast(`🔄 Synced update: <strong>${event.meta.updatedBy}</strong> updated task status!`);
    }
  }

  applyTheme() {
    if (this.activeKidId === "jad") {
      document.body.className = "theme-jad";
    } else {
      document.body.className = "";
    }
  }

  setKid(kidId) {
    this.activeKidId = kidId;
    localStorage.setItem("activeKidId", kidId);
    this.applyTheme();
    this.renderKidSwitcher();
    this.renderKidBanner();
    this.renderStudyAssistant();
    this.renderDayChips();
    this.renderActiveTab();
    this.showWelcomingLetter(kidId);
  }

  setTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll(".tab-link").forEach(el => {
      el.classList.toggle("active", el.dataset.tab === tabId);
    });
    document.querySelectorAll(".mobile-nav-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });
    document.querySelectorAll(".tab-pane").forEach(el => {
      el.classList.toggle("active", el.id === `tab-${tabId}`);
    });
    if (tabId === "today") {
      this.renderDayChips();
    }
    this.renderActiveTab();
  }

  renderDayChips() {
    const container = document.getElementById("dayChipsList");
    if (!container) return;

    const todayKey = this.getInitialDay();
    const daysData = [
      { key: "saturday", label: "Saturday (Oct 24)" },
      { key: "monday", label: "Monday (Oct 26)" },
      { key: "tuesday", label: "Tuesday (Oct 27)" },
      { key: "wednesday", label: "Wednesday (Oct 28)" },
      { key: "thursday", label: "Thursday (Oct 29 - Holiday 🌴)" }
    ];

    container.innerHTML = daysData.map(d => {
      const isSelected = d.key === this.selectedDay;
      const isToday = d.key === todayKey;
      const todayBadge = isToday ? '<span style="background:#10b981; color:#fff; font-size:0.65rem; padding:1px 6px; border-radius:999px; font-weight:800; margin-left:4px; letter-spacing:0.3px;">TODAY</span>' : '';
      return `
        <button type="button" class="day-chip ${isSelected ? 'active' : ''}" data-day="${d.key}" onclick="app.setDay('${d.key}')" style="${isSelected ? 'font-weight:800;' : ''}">
          ${d.label} ${todayBadge}
        </button>
      `;
    }).join("") + `
      <span style="font-size:0.75rem; color:var(--text-muted); margin-left:6px; background:var(--bg-card-subtle); padding:4px 8px; border-radius:6px; border:1px solid var(--border-color);">
        🏖️ Weekend: Fri & Sun
      </span>
    `;
  }

  setDay(dayName) {
    this.selectedDay = dayName;
    this.renderDayChips();
    this.renderTodaySchedule();
    this.renderTodayChecklist();
  }

  // --- Render Headers & Banner ---
  renderKidSwitcher() {
    const switcher = document.getElementById("kidSwitcher");
    if (!switcher) return;
    switcher.innerHTML = this.data.kids.map(kid => `
      <button type="button" class="kid-btn ${kid.id === this.activeKidId ? 'active' : ''}" onclick="app.setKid('${kid.id}')">
        <span class="kid-avatar">${kid.avatar}</span>
        <span>${kid.name.split(' ')[0]}</span>
      </button>
    `).join("");
  }

  renderKidBanner() {
    const kid = this.getActiveKid();
    const banner = document.getElementById("kidBanner");
    if (!banner || !kid) return;

    // Calculate quick stats
    const totalAssignments = (kid.assignments || []).length;
    const pendingCount = (kid.assignments || []).filter(a => a.status === 'pending').length;
    const highPriorityCount = (kid.assignments || []).filter(a => a.priority === 'high' && a.status === 'pending').length;
    const docsCount = (kid.documents || []).length;
    const rData = (typeof rewardsSystem !== 'undefined') ? rewardsSystem.getKidData(kid.id) : { points: 100, streakDays: 3 };

    banner.innerHTML = `
      <div class="kid-banner-card">
        <div class="kid-profile-info">
          <div class="kid-big-avatar">${kid.avatar}</div>
          <div class="kid-title">
            <h2>${kid.name}</h2>
            <span class="grade-badge">${kid.grade}</span>
            <div style="font-size: 0.8rem; opacity: 0.9; margin-top: 4px;">🏫 ${kid.school}</div>
          </div>
        </div>

        <div class="kid-quick-stats">
          <div class="stat-chip" style="background: rgba(245, 158, 11, 0.2); border-color: rgba(245, 158, 11, 0.4); cursor:pointer;" onclick="app.setTab('rewards')" title="View Rewards Catalog">
            <span class="stat-num" style="color: #fbbf24;">⭐ ${rData.points}</span>
            <span class="stat-lbl">Points</span>
          </div>
          <div class="stat-chip" style="background: rgba(239, 68, 68, 0.18); border-color: rgba(239, 68, 68, 0.35);">
            <span class="stat-num" style="color: #f87171;">🔥 ${rData.streakDays}</span>
            <span class="stat-lbl">Streak</span>
          </div>
          <div class="stat-chip">
            <span class="stat-num">${pendingCount}</span>
            <span class="stat-lbl">Pending Tasks</span>
          </div>
          <div class="stat-chip">
            <span class="stat-num" style="color: ${highPriorityCount > 0 ? '#fca5a5' : '#fff'};">${highPriorityCount}</span>
            <span class="stat-lbl">Urgent Tests</span>
          </div>
          <div class="stat-chip">
            <span class="stat-num">${docsCount}</span>
            <span class="stat-lbl">Files & Plans</span>
          </div>
        </div>
      </div>
    `;
  }

  // --- MOTIVATION & SMART STUDY RESOURCE ASSISTANT ---
  renderStudyAssistant() {
    const container = document.getElementById("studyAssistantSection");
    if (!container) return;
    const kid = this.getActiveKid();
    if (!kid) return;

    const isRyan = kid.id === "ryan";
    const quotes = (typeof MOTIVATION_QUOTES !== 'undefined' && MOTIVATION_QUOTES[kid.id]) ? MOTIVATION_QUOTES[kid.id] : (typeof MOTIVATION_QUOTES !== 'undefined' && MOTIVATION_QUOTES.ryan ? MOTIVATION_QUOTES.ryan : []);
    const safeIdx = Math.abs(parseInt(this.quoteIndex[kid.id], 10) || 0) % (quotes.length || 1);
    const currentQuote = quotes[safeIdx] || {
      quote: "Every tough question you conquer today brings you closer to distinction! Keep shining!",
      author: "🌟 Proud Family",
      badge: "🚀 Cambridge Achiever"
    };
    const quoteText = currentQuote.quote || currentQuote.en || "Excellence is the result of your daily focus and persistence!";
    const quoteAuthor = currentQuote.author || "Proud Family";
    const quoteBadge = currentQuote.badge || "Champion Mindset";

    // Calculate accomplishment metrics across all assignments and weekly timetable tasks
    const completedState = this.data.completedTasks || {};
    const days = (kid.weeklyPlan && kid.weeklyPlan.days) ? kid.weeklyPlan.days : {};
    let totalPlanTasks = 0;
    let completedPlanTasks = 0;

    Object.keys(days).forEach(dayKey => {
      (days[dayKey] || []).forEach((l, idx) => {
        const hasHw = (l.homework && l.homework.trim().length > 0) || (l.assignment && l.assignment.trim().length > 0) || (l.exam && l.exam.trim().length > 0);
        if (hasHw) {
          totalPlanTasks++;
          const taskId = `day_${dayKey}_hw_${idx}`;
          if (completedState[taskId]) completedPlanTasks++;
        }
      });
    });

    const asgs = kid.assignments || [];
    const totalAsgs = asgs.length;
    const completedAsgs = asgs.filter(a => a.status === "completed").length;

    const totalTasks = totalPlanTasks + totalAsgs;
    const completedTasks = completedPlanTasks + completedAsgs;
    const accomplishmentPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

    const rData = (typeof rewardsSystem !== 'undefined') ? rewardsSystem.getKidData(kid.id) : { points: 100, streakDays: 3 };

    // Suggestions chips tailored to grade level (English)
    const suggestions = isRyan ? [
      { label: "📐 Linear Equations (Algebra)", q: "Algebra Linear Equations" },
      { label: "🔬 Photosynthesis & Nutrition", q: "Photosynthesis and Plant Nutrition" },
      { label: "⚛️ Forces & Gravity", q: "Forces Friction and Gravity" },
      { label: "📖 Persuasive Writing", q: "English Persuasive Writing techniques" },
      { label: "📊 Probability & Statistics", q: "Probability and Statistics" }
    ] : [
      { label: "➗ Division & Fractions", q: "Long Division and Equivalent Fractions" },
      { label: "🪐 Solar System & Space", q: "Solar System and Planets" },
      { label: "🌱 Plant Life Cycle", q: "Plant Life Cycle and Seeds" },
      { label: "📝 English Grammar & Verbs", q: "English Verbs and Tenses" },
      { label: "🌊 Water Cycle & Matter", q: "Water Cycle States of Matter" }
    ];

    container.innerHTML = `
      <div class="assistant-grid">
        <!-- CARD 1: MOTIVATION & ACCOMPLISHMENT HUB -->
        <div class="assistant-card motivation-card" id="motivationCard">
          <div class="card-glow-badge">${quoteBadge}</div>
          <div class="motivation-header">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="motivation-icon">🏆</span>
              <div>
                <h3 class="motivation-title">${isRyan ? "Motivation & Accomplishment Hub - Ryan" : "Excellence & Accomplishment Hub - Jad"}</h3>
                <span class="motivation-subtitle">${isRyan ? "Path to Distinction in Cambridge Checkpoint & IGCSE" : "Path to Excellence in Cambridge Primary (Grade 5)"}</span>
              </div>
            </div>
            <button type="button" class="btn-cycle-quote" onclick="app.nextMotivationQuote()" title="Show another motivational quote">
              ✨ New Quote
            </button>
          </div>

          <!-- Quote Content with smooth animation -->
          <div class="quote-display-box" id="quoteDisplayBox">
            <p class="quote-english" style="font-size:1.05rem; font-weight:700; color:var(--text-main); margin-bottom:6px;">"${quoteText}"</p>
            <div class="quote-author">— ${quoteAuthor}</div>
          </div>

          <!-- Real-Time Accomplishment Meter -->
          <div class="accomplishment-meter-box">
            <div class="meter-info-line">
              <span class="meter-label">
                <span>🎯 Personal Accomplishment Tracker:</span>
                <strong style="color:var(--text-main);">${completedTasks} of ${totalTasks} tasks completed</strong>
              </span>
              <span class="meter-pct">${accomplishmentPct}% Completed</span>
            </div>
            <div class="meter-track">
              <div class="meter-fill" style="width: ${accomplishmentPct}%;"></div>
            </div>
            <div class="meter-badges-row">
              <div class="badge-mini"><span style="color:#f59e0b;">⭐</span> <strong>${rData.points}</strong> Excellence Points</div>
              <div class="badge-mini"><span style="color:#ef4444;">🔥</span> <strong>${rData.streakDays}</strong> Day Streak</div>
              <div class="badge-mini" style="background:#ecfdf5; border-color:#a7f3d0; color:#065f46;">
                <span>✅</span> <strong>${completedTasks}</strong> Tasks Done
              </div>
            </div>
          </div>
        </div>

        <!-- CARD 2: SMART SEARCH & STUDY ASSISTANT -->
        <div class="assistant-card search-card">
          <div class="search-card-header">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="search-header-icon">🔍</span>
              <div>
                <h3 class="search-card-title">Smart Concept & Lesson Explorer</h3>
                <span class="search-card-subtitle">${isRyan ? "Ryan's Assistant for Cambridge Grade 8 Checkpoint" : "Jad's Assistant for Cambridge Grade 5 Science & Math"}</span>
              </div>
            </div>
            <span class="grade-pill-tag">${isRyan ? "IGCSE Stage 9" : "Cambridge Primary"}</span>
          </div>

          <p class="search-explainer">
            Stuck on a tricky lesson or homework question? Search video lessons, Cambridge Checkpoint past paper questions, or school materials instantly:
          </p>

          <div class="study-search-box-wrapper">
            <div class="search-input-group">
              <span class="search-input-icon">🔎</span>
              <input 
                type="text" 
                id="studySearchInput" 
                class="study-search-input" 
                placeholder="${isRyan ? 'Enter topic (e.g., Photosynthesis, Algebra, Forces, Probability)...' : 'Enter topic (e.g., Fractions, Solar System, Plants, Grammar)...'}"
                onkeydown="if(event.key==='Enter') app.performStudySearch('youtube')"
              />
              <button type="button" class="search-clear-btn" onclick="document.getElementById('studySearchInput').value=''; document.getElementById('studySearchInput').focus();" title="Clear">✕</button>
            </div>

            <!-- Search Action Buttons -->
            <div class="search-actions-row">
              <button type="button" class="btn-search-action btn-youtube" onclick="app.performStudySearch('youtube')" title="Search video lessons on YouTube">
                <span>🎥</span>
                <span>YouTube Video</span>
              </button>
              <button type="button" class="btn-search-action btn-pastpapers" onclick="app.performStudySearch('pastpapers')" title="Search Cambridge Checkpoint past paper questions">
                <span>📑</span>
                <span>Checkpoint Papers</span>
              </button>
              <button type="button" class="btn-search-action btn-khan" onclick="app.performStudySearch('khan')" title="Search Khan Academy and BBC Bitesize">
                <span>🌐</span>
                <span>Khan / Bitesize</span>
              </button>
              <button type="button" class="btn-search-action btn-vault" onclick="app.performStudySearch('vault')" title="Filter school files & worksheets in LMS Hub">
                <span>📁</span>
                <span>School Resources</span>
              </button>
            </div>
          </div>

          <!-- Suggested Quick Topics -->
          <div class="quick-topics-row">
            <span class="quick-topics-lbl">💡 Quick Suggested Topics:</span>
              ${suggestions.map(s => `
                <button type="button" class="topic-chip-btn" onclick="app.setQuickSearch('${s.q.replace(/'/g, "\\'")}')" title="Search: ${s.q}">
                  ${s.label}
                </button>
              `).join("")}
            </div>
          </div>

          <!-- Quick Specialized Cambridge Hub Banner -->
          ${!isRyan ? `
            <div style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color:#fff; border-radius:12px; padding:12px 16px; margin-top:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; box-shadow:0 4px 12px rgba(5,150,105,0.2);">
              <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:1.8rem;">🔤</span>
                <div>
                  <h4 style="margin:0; font-size:0.98rem; color:#fff; font-weight:800;">Jad's Cambridge English Vocabulary & Spelling Master Hub</h4>
                  <div style="font-size:0.75rem; opacity:0.92; margin-top:2px;">Alliance Academy Grade 5 Lists • 3D Flashcards, Audio Pronunciation, Spelling Bee & Exam Quiz</div>
                </div>
              </div>
              <button type="button" class="btn-primary" style="background:#fff; color:#065f46; border:none; font-weight:800; font-size:0.8rem; padding:6px 14px; border-radius:6px; cursor:pointer;" onclick="jadVocabHub.openVocabModal('list1', 'flashcards')">
                Open Vocab Hub (+15 pts) →
              </button>
            </div>
          ` : `
            <div style="background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); color:#fff; border-radius:12px; padding:12px 16px; margin-top:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; box-shadow:0 4px 12px rgba(79,70,229,0.2);">
              <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:1.8rem;">🧠</span>
                <div>
                  <h4 style="margin:0; font-size:0.98rem; color:#fff; font-weight:800;">Ryan's Cambridge Checkpoint Stage 9 Practice Engine</h4>
                  <div style="font-size:0.75rem; opacity:0.92; margin-top:2px;">Target Band 6.0 Distinction • Math, Science & English Checkpoint Practice</div>
                </div>
              </div>
              <button type="button" class="btn-primary" style="background:#fff; color:#3730a3; border:none; font-weight:800; font-size:0.8rem; padding:6px 14px; border-radius:6px; cursor:pointer;" onclick="cambridgeQuizzer.startQuiz('ryan', 'Mathematics', 'Algebra')">
                Start Cambridge Quiz →
              </button>
            </div>
          `}
        </div>
      </div>
    `;
  }

  nextMotivationQuote() {
    const kidId = this.activeKidId;
    const quotes = MOTIVATION_QUOTES[kidId] || MOTIVATION_QUOTES.ryan;
    this.quoteIndex[kidId] = ((this.quoteIndex[kidId] || 0) + 1) % quotes.length;
    
    // Animate quote box
    const quoteBox = document.getElementById("quoteDisplayBox");
    if (quoteBox) {
      quoteBox.classList.add("quote-fade-out");
      setTimeout(() => {
        this.renderStudyAssistant();
      }, 180);
    } else {
      this.renderStudyAssistant();
    }
  }

  setQuickSearch(topicQuery) {
    const input = document.getElementById("studySearchInput");
    if (input) {
      input.value = topicQuery;
      this.performStudySearch('youtube', topicQuery);
    }
  }

  performStudySearch(source, overrideQuery = null) {
    const input = document.getElementById("studySearchInput");
    const query = (overrideQuery || (input ? input.value : "")).trim();
    if (!query) {
      this.showToast("⚠️ Please enter a lesson topic or problem to search!");
      if (input) input.focus();
      return;
    }

    const kid = this.getActiveKid();
    const isRyan = kid.id === "ryan";

    let url = "";
    if (source === "youtube") {
      const searchTerms = isRyan 
        ? `${query} Cambridge Checkpoint Grade 8 IGCSE lesson explanation` 
        : `${query} Cambridge Primary Grade 5 lesson explanation`;
      url = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerms)}`;
      window.open(url, "_blank", "noopener,noreferrer");
      this.showToast(`🎥 Opening YouTube video explanations for "${query}"...`);
    } else if (source === "pastpapers") {
      const searchTerms = isRyan 
        ? `Cambridge Checkpoint past papers "${query}" Grade 8 questions` 
        : `Cambridge Primary Checkpoint past papers "${query}" Grade 5`;
      url = `https://www.google.com/search?q=${encodeURIComponent(searchTerms)}`;
      window.open(url, "_blank", "noopener,noreferrer");
      this.showToast(`📑 Searching Cambridge Checkpoint questions for "${query}"...`);
    } else if (source === "khan") {
      const searchTerms = `site:khanacademy.org OR site:bbc.co.uk/bitesize ${query}`;
      url = `https://www.google.com/search?q=${encodeURIComponent(searchTerms)}`;
      window.open(url, "_blank", "noopener,noreferrer");
      this.showToast(`🌐 Searching Khan Academy and BBC Bitesize for "${query}"...`);
    } else if (source === "vault") {
      // Search local school files & worksheets
      this.setTab("documents");
      const docInput = document.getElementById("docSearchInput");
      if (docInput) {
        docInput.value = query;
        this.filterDocuments();
      }
      this.showToast(`📁 Filtered school resources and worksheets for: "${query}"`);
    }
  }

  searchTopic(subject, topic) {
    const cleanTopic = (topic || subject || "").replace(/[^\w\s\u0600-\u06FF-]/g, " ").trim();
    const kid = this.getActiveKid();
    const isRyan = kid.id === "ryan";
    const terms = isRyan 
      ? `${subject} ${cleanTopic} Cambridge Checkpoint Grade 8`
      : `${subject} ${cleanTopic} Cambridge Primary Grade 5`;
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(terms)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    this.showToast(`🎥 Opening YouTube video explanation for "${subject}: ${cleanTopic}"...`);
  }

  searchPastPapers(subject, topic) {
    const cleanTopic = (topic || subject || "").replace(/[^\w\s\u0600-\u06FF-]/g, " ").trim();
    const kid = this.getActiveKid();
    const isRyan = kid.id === "ryan";
    const terms = isRyan 
      ? `Cambridge Checkpoint past papers ${subject} ${cleanTopic} Grade 8`
      : `Cambridge Primary Checkpoint ${subject} ${cleanTopic} Grade 5`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(terms)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    this.showToast(`📑 Opening Checkpoint questions for "${subject}: ${cleanTopic}"...`);
  }

  // --- Route rendering based on active tab ---
  renderActiveTab() {
    switch (this.activeTab) {
      case "today":
        this.renderTodaySchedule();
        this.renderTodayChecklist();
        this.renderSchoolBagChecker();
        break;
      case "weekly":
        this.renderWeeklyPlan();
        break;
      case "assignments":
        this.renderAssignments();
        break;
      case "documents":
        this.renderDocuments();
        break;
      case "studyplan":
        this.renderSmartStudyPlan();
        break;
      case "rewards":
        this.renderRewardsTab();
        break;
      case "pastpapers":
        this.renderPastPapersTab();
        break;
      case "notifications":
        this.renderNotificationCenter();
        break;
      case "timer":
        this.updateTimerDisplay();
        break;
    }
  }

  // --- TAB 1: TODAY'S SCHEDULE & AGENDA ---
  renderTodaySchedule() {
    const kid = this.getActiveKid();
    const container = document.getElementById("todayPeriodsList");
    const titleContainer = document.getElementById("todayScheduleTitle");
    if (!container || !kid) return;

    const days = (kid.weeklyPlan && kid.weeklyPlan.days) ? kid.weeklyPlan.days : {};
    const lessons = days[this.selectedDay] || [];
    const nextDayKey = this.getNextSchoolDay(this.selectedDay);
    const dayDisplayName = this.selectedDay.charAt(0).toUpperCase() + this.selectedDay.slice(1);
    const nextDayDisplayName = nextDayKey.charAt(0).toUpperCase() + nextDayKey.slice(1);

    const todayKey = this.getInitialDay();
    const isToday = this.selectedDay === todayKey;
    const now = new Date();
    const formattedDate = isToday 
      ? now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })
      : `${dayDisplayName} (${this.selectedDay === 'thursday' ? 'Oct 29 - Long Weekend 🌴' : 'Oct 2026'})`;

    if (titleContainer) {
      titleContainer.innerHTML = `📖 Timetable: <strong>${dayDisplayName}</strong> <span style="font-size:0.8rem; font-weight:700; color:var(--text-muted); margin-left:6px;">• ${formattedDate}</span> ${isToday ? '<span style="background:#10b981; color:#fff; font-size:0.68rem; padding:2px 8px; border-radius:999px; font-weight:800; margin-left:6px;">TODAY</span>' : ''}`;
    }

    const printDate = document.getElementById("printDateString");
    if (printDate) {
      printDate.innerHTML = `📅 Date: <strong>${now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</strong>`;
    }

    if (lessons.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--text-muted);">
          <div style="font-size: 32px; margin-bottom: 8px;">🎉</div>
          <p>No scheduled classes or weekend for ${dayDisplayName}.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = lessons.map((lesson, idx) => `
      <div class="period-item">
        <div class="period-index">${idx + 1}</div>
        <div class="period-details">
          <div class="period-subject-tag">
            <span>${this.getSubjectIcon(kid, lesson.subject)}</span>
            <span>${lesson.subject}</span>
          </div>
          <div class="period-topic">${lesson.topic || "Class Lesson"}</div>
          ${lesson.homework ? `<div class="period-hw">📝 HW: ${lesson.homework}</div>` : ""}
          ${lesson.notes ? `<div class="period-note">💡 ${lesson.notes}</div>` : ""}
          <div class="period-action-tools" style="display:flex; flex-wrap:wrap; gap:6px; margin-top:8px;">
            <button type="button" class="btn-xs-study" onclick="app.searchTopic('${(lesson.subject || '').replace(/'/g, "\\'")}', '${(lesson.topic || '').replace(/'/g, "\\'")}')" title="Search video lessons on YouTube">
              🎥 Video Help (YouTube)
            </button>
            <button type="button" class="btn-xs-study btn-xs-checkpoint" onclick="app.searchPastPapers('${(lesson.subject || '').replace(/'/g, "\\'")}', '${(lesson.topic || '').replace(/'/g, "\\'")}')" title="Search Cambridge Checkpoint questions">
              📑 Checkpoint Questions
            </button>
          </div>
        </div>
      </div>
    `).join("");
  }

  setChecklistScope(scope) {
    this.checklistScope = scope;
    this.renderTodayChecklist();
  }

  renderTodayChecklist() {
    const kid = this.getActiveKid();
    const container = document.getElementById("todayHwChecklist");
    if (!container || !kid) return;

    const days = (kid.weeklyPlan && kid.weeklyPlan.days) ? kid.weeklyPlan.days : {};
    const daysOrder = ["saturday", "monday", "tuesday", "wednesday", "thursday"];
    const completedState = this.data.completedTasks || {};

    const nextDayKey = this.getNextSchoolDay(this.selectedDay);
    const dayDisplay = this.selectedDay.charAt(0).toUpperCase() + this.selectedDay.slice(1);
    const nextDayDisplay = nextDayKey.charAt(0).toUpperCase() + nextDayKey.slice(1);

    let allTasks = [];

    if (this.checklistScope === "prep_tomorrow") {
      // 1. HOME PREPARATION FOR TOMORROW'S CLASSES
      // Tasks and Exams for the next school day to be solved & studied TONIGHT!
      const nextLessons = days[nextDayKey] || [];
      nextLessons
        .filter(l => (l.homework && l.homework.trim().length > 0) || (l.assignment && l.assignment.trim().length > 0) || (l.exam && l.exam.trim().length > 0))
        .forEach((l, i) => {
          const isExam = !!l.exam;
          const taskText = isExam ? l.exam : (l.assignment || l.homework);
          allTasks.push({
            id: `day_${nextDayKey}_hw_${i}`,
            title: isExam 
              ? `🚨 Tomorrow's Quiz / Exam (${nextDayDisplay}): ${l.subject} - ${taskText}` 
              : `✍️ Homework Due Tomorrow (${nextDayDisplay}): ${l.subject} - ${taskText}`,
            rawTitle: `${l.subject}: ${taskText}`,
            day: nextDayKey,
            source: isExam ? `Exam Due ${nextDayDisplay}` : `HW Due ${nextDayDisplay}`,
            isExam: isExam,
            isDailyPlan: true,
            isPrepTomorrow: true,
            ref: l.reference || l.notes || ""
          });
        });

      const isTomorrowHoliday = nextLessons.some(l => 
        (l.outcome && l.outcome.toLowerCase().includes("long weekend")) || 
        (l.topic && l.topic.toLowerCase().includes("long weekend")) || 
        (l.topic && (l.topic.includes("عطلة") || l.topic.includes("نهاية أسبوع"))) ||
        (l.outcome && l.outcome.includes("عطلة"))
      );

      if (isTomorrowHoliday) {
        allTasks = [{
          id: `holiday_notice_${nextDayKey}`,
          isHolidayNotice: true,
          title: `🌴 School Holiday / Long Weekend: No classes or homework due on ${nextDayDisplay}! Enjoy the long weekend!`,
          day: nextDayKey,
          source: `School Holiday`
        }];
      }

      // Add active assignments whose dueDate is upcoming or pending
      (kid.assignments || []).forEach(a => {
        allTasks.push({
          id: a.id,
          title: `${a.type === 'Quiz' || a.type === 'Exam' ? '🚨' : '✍️'} ${a.subject}: ${a.title}`,
          rawTitle: `${a.subject}: ${a.title}`,
          dueDate: a.dueDate,
          priority: a.priority,
          status: a.status,
          source: a.type
        });
      });

    } else if (this.checklistScope === "today") {
      // 2. Selected day's class homework & exams
      const lessons = days[this.selectedDay] || [];
      lessons
        .filter(l => (l.homework && l.homework.trim().length > 0) || (l.assignment && l.assignment.trim().length > 0) || (l.exam && l.exam.trim().length > 0))
        .forEach((l, i) => {
          const isExam = !!l.exam;
          const taskText = isExam ? l.exam : (l.assignment || l.homework);
          allTasks.push({
            id: `day_${this.selectedDay}_hw_${i}`,
            title: `${l.subject}: ${taskText}`,
            rawTitle: `${l.subject}: ${taskText}`,
            day: this.selectedDay,
            source: isExam ? "School Exam" : "Class Homework",
            isExam: isExam,
            isDailyPlan: true
          });
        });

      (kid.assignments || []).forEach(a => {
        allTasks.push({
          id: a.id,
          title: `${a.subject}: ${a.title}`,
          rawTitle: `${a.subject}: ${a.title}`,
          dueDate: a.dueDate,
          priority: a.priority,
          status: a.status,
          source: a.type
        });
      });

    } else {
      // 3. Full Week Tracker
      daysOrder.forEach(dayKey => {
        const lessons = days[dayKey] || [];
        lessons
          .filter(l => (l.homework && l.homework.trim().length > 0) || (l.assignment && l.assignment.trim().length > 0) || (l.exam && l.exam.trim().length > 0))
          .forEach((l, i) => {
            const isExam = !!l.exam;
            const taskText = isExam ? l.exam : (l.assignment || l.homework);
            allTasks.push({
              id: `day_${dayKey}_hw_${i}`,
              title: `${dayKey.slice(0, 3).toUpperCase()}: ${l.subject} - ${taskText}`,
              rawTitle: `${l.subject}: ${taskText}`,
              day: dayKey,
              source: isExam ? "School Exam" : `Weekly Plan (${dayKey.slice(0, 3)})`,
              isExam: isExam,
              isDailyPlan: true
            });
          });
      });

      (kid.assignments || []).forEach(a => {
        allTasks.push({
          id: a.id,
          title: `${a.subject}: ${a.title}`,
          rawTitle: `${a.subject}: ${a.title}`,
          dueDate: a.dueDate,
          priority: a.priority,
          status: a.status,
          source: a.type
        });
      });
    }

    const finishedTasks = allTasks.filter(t => t.isDailyPlan ? !!completedState[t.id] : t.status === "completed");
    const overdueTasks = allTasks.filter(t => {
      const isDone = t.isDailyPlan ? !!completedState[t.id] : t.status === "completed";
      return !isDone && this.isTaskPastDue(t);
    });
    const activeTasks = allTasks.filter(t => {
      const isDone = t.isDailyPlan ? !!completedState[t.id] : t.status === "completed";
      return !isDone && !this.isTaskPastDue(t);
    });
    const unfinishedTasks = allTasks.filter(t => t.isDailyPlan ? !completedState[t.id] : t.status !== "completed");
    const pct = allTasks.length > 0 ? Math.round((finishedTasks.length / allTasks.length) * 100) : 100;

    const scopeToggleHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:12px; background:var(--bg-card-subtle); padding:4px; border-radius:8px; border:1px solid var(--border-color);">
        <button type="button" class="btn-secondary" style="font-size:0.75rem; padding:5px 10px; border:none; ${this.checklistScope === 'prep_tomorrow' ? 'background:var(--primary); color:#fff; font-weight:700;' : 'background:transparent;'}" onclick="app.setChecklistScope('prep_tomorrow')">
          🌙 Tomorrow's Prep (${nextDayDisplay})
        </button>
        <button type="button" class="btn-secondary" style="font-size:0.75rem; padding:5px 10px; border:none; ${this.checklistScope === 'today' ? 'background:var(--primary); color:#fff; font-weight:700;' : 'background:transparent;'}" onclick="app.setChecklistScope('today')">
          🏫 Today's Classes (${dayDisplay})
        </button>
        <button type="button" class="btn-secondary" style="font-size:0.75rem; padding:5px 10px; border:none; ${this.checklistScope === 'week' ? 'background:var(--primary); color:#fff; font-weight:700;' : 'background:transparent;'}" onclick="app.setChecklistScope('week')">
          🗓️ Full Week (${finishedTasks.length}/${allTasks.length})
        </button>
      </div>

      ${this.checklistScope === 'prep_tomorrow' ? `
        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:8px 12px; margin-bottom:12px; font-size:0.78rem; color:#1e40af; display:flex; align-items:center; justify-content:space-between;">
          <span>🎯 <strong>Evening Preparation Mode:</strong> Displaying tomorrow's classes and homework for <strong>${nextDayDisplay}</strong> to study and solve tonight.</span>
          <span style="font-size:0.72rem; background:#3b82f6; color:#fff; padding:2px 6px; border-radius:4px; font-weight:700;">Ready for Tomorrow</span>
        </div>
      ` : ''}

      ${unfinishedTasks.length > 0 ? `
        <div style="background:#fff1f2; border:1.5px solid #fecdd3; border-radius:8px; padding:10px 14px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              ${overdueTasks.length > 0 ? `
                <span style="background:#fee2e2; border:1px solid #f87171; color:#991b1b; font-weight:800; font-size:0.78rem; padding:2px 8px; border-radius:6px;">
                  ⚠️ ${overdueTasks.length} Past Due Date
                </span>
              ` : ''}
              <span style="background:#eff6ff; border:1px solid #bfdbfe; color:#1e40af; font-weight:800; font-size:0.78rem; padding:2px 8px; border-radius:6px;">
                ⏳ ${activeTasks.length} Active
              </span>
              <span style="background:#ecfdf5; border:1px solid #a7f3d0; color:#065f46; font-weight:800; font-size:0.78rem; padding:2px 8px; border-radius:6px;">
                ✓ ${finishedTasks.length} Done
              </span>
            </div>
            <span style="font-size:0.8rem; font-weight:800; color:#b91c1c;">${pct}% Finished (${finishedTasks.length}/${allTasks.length})</span>
          </div>
          <div style="background:#fee2e2; height:6px; border-radius:3px; margin-top:8px; overflow:hidden;">
            <div style="background:#10b981; height:100%; width:${pct}%; transition:width 0.3s ease;"></div>
          </div>
        </div>
      ` : `
        <div style="background:#ecfdf5; border:1.5px solid #a7f3d0; border-radius:8px; padding:10px 14px; margin-bottom:12px; text-align:center;">
          <strong style="color:#065f46; font-size:0.85rem;">🎉 Great job! All ${allTasks.length} tasks and homework are 100% completed!</strong>
        </div>
      `}
    `;

    if (allTasks.length === 0) {
      container.innerHTML = scopeToggleHTML + `
        <div style="text-align: center; padding: 25px; color: var(--text-muted);">
          <div style="font-size: 28px; margin-bottom: 8px;">✨</div>
          <p>No homework or exams scheduled for this selection!</p>
        </div>
      `;
      return;
    }

    const tasksListHTML = allTasks.map(task => {
      if (task.isHolidayNotice) {
        return `
          <div style="background:#ecfdf5; border:1.5px solid #a7f3d0; border-radius:10px; padding:14px 18px; margin-bottom:12px; display:flex; align-items:center; gap:12px; box-shadow:0 2px 6px rgba(16,185,129,0.08);">
            <span style="font-size:1.8rem;">🌴</span>
            <div>
              <strong style="color:#065f46; font-size:0.92rem; display:block;">${task.title}</strong>
              <div style="font-size:0.78rem; color:#047857; margin-top:2px;">Alliance Academy calendar marked ${nextDayDisplay} as Long Weekend / Mid-Term Break. Active tasks from today (${dayDisplay}) are listed below:</div>
            </div>
          </div>
        `;
      }
      const isDone = task.isDailyPlan ? !!completedState[task.id] : task.status === "completed";
      const isPastDue = this.isTaskPastDue(task);
      const isExam = !!task.isExam;
      const meta = db.getTaskMeta(task.id);
      const whoDone = meta && meta.updatedBy ? `by ${meta.updatedBy}` : (meta && meta.time ? meta.time : "");

      const dueBadge = task.dueDate ? `
        <span class="due-badge ${task.priority === 'high' ? 'urgent' : task.priority === 'medium' ? 'warning' : 'normal'}">
          Due: ${task.dueDate}
        </span>
      ` : `<span class="due-badge normal">${task.source}</span>`;

      const vn = this.getVoiceNote(task.id);
      const photo = db.getTaskPhoto(task.id);

      return `
        <div class="hw-task-item ${isDone ? 'completed' : (isPastDue ? 'is-overdue' : (isExam ? 'is-exam' : ''))}" id="task_row_${task.id}" style="${isDone ? 'border-left: 4px solid #10b981; background:#f0fdf4;' : (isPastDue ? 'border-left: 4px solid #dc2626 !important; background:#fff5f5;' : (isExam ? 'border-left: 4px solid #ef4444; background:#fffdfd;' : 'border-left: 4px solid var(--primary);'))} padding-left: 10px;">
          <!-- Status Indicator: NO CHECKBOX if done OR past due! -->
          ${isDone ? `
            <div class="hw-status-icon is-done" title="✓ Completed">
              <span>✓</span>
            </div>
          ` : (isPastDue ? `
            <div class="hw-status-icon is-overdue" title="⚠️ Past Due Date - Not Completed">
              <span>⚠️</span>
            </div>
          ` : `
            <button type="button" class="hw-check-btn" onclick="app.toggleTaskCompleted('${task.id}', ${!!task.isDailyPlan})" title="Mark complete (Instant live sync across devices)">
            </button>
          `)}
          <div class="hw-task-content">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
              <div class="hw-task-title" style="${isDone ? 'text-decoration:line-through; opacity:0.75;' : (isPastDue ? 'color:#991b1b; font-weight:800;' : (isExam ? 'font-weight:800; color:#b91c1c;' : 'font-weight:600; color:inherit;'))}">
                ${task.title}
              </div>
              ${photo && photo.photoData ? `
                <img src="${photo.photoData}" class="hw-photo-thumbnail" onclick="app.openPhotoLightbox('${task.id}', '${photo.photoData}', '${(task.rawTitle || task.title || '').replace(/'/g, "\\'")}')" title="View attached workbook photo">
              ` : ''}
            </div>
            ${task.ref ? `<div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">📖 Reference: ${task.ref}</div>` : ''}
            ${(this.data.helpRequests || {})[task.id] ? `
              <div style="font-size:0.75rem; background:#fffbeb; border:1px solid #f59e0b; color:#b45309; padding:2px 8px; border-radius:4px; font-weight:800; margin-top:4px; display:inline-flex; align-items:center; gap:4px;">
                🚨 Help requested from parents: "${(this.data.helpRequests || {})[task.id].note}"
              </div>
            ` : ''}
            <div class="hw-task-meta" style="display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-top:4px;">
              ${dueBadge}
              ${isDone ? `
                <span style="font-size:0.75rem; color:#065f46; font-weight:800; background:#ecfdf5; border:1px solid #a7f3d0; padding:2px 8px; border-radius:999px;">✓ Completed ${whoDone ? `(${whoDone})` : ''}</span>
                <button type="button" style="background:none; border:none; color:var(--text-muted); font-size:0.72rem; cursor:pointer; text-decoration:underline;" onclick="app.toggleTaskCompleted('${task.id}', ${!!task.isDailyPlan})" title="Marked by mistake? Reopen">↩ Reopen</button>
              ` : (isPastDue ? `
                <span style="font-size:0.75rem; color:#991b1b; font-weight:800; background:#fee2e2; border:1px solid #f87171; padding:2px 8px; border-radius:999px;">⚠️ ${isExam ? 'Past Exam Date (Not Completed)' : 'Past Due Date (Not Completed)'}</span>
                <button type="button" class="btn-xs-study" style="background:#fff; border:1px solid #fca5a5; color:#991b1b; font-weight:700;" onclick="app.toggleTaskCompleted('${task.id}', ${!!task.isDailyPlan})" title="Submit completed late">✓ Mark Done Late</button>
              ` : `
                <span style="font-size:0.75rem; color:var(--primary); font-weight:800; background:#eff6ff; border:1px solid #bfdbfe; padding:2px 8px; border-radius:999px;">⏳ Active (Due Today)</span>
              `)}
              
              <button type="button" class="btn-xs-study" onclick="app.triggerPhotoCapture('${task.id}', '${(task.rawTitle || task.title || '').replace(/'/g, "\\'")}')" title="Upload workbook page photo for parents">
                📸 ${photo ? 'Photo ✓' : 'Photo'}
              </button>
              <button type="button" class="btn-xs-study" style="background:#e0e7ff; color:#3730a3; border-color:#c7d2fe;" onclick="cambridgeQuizzer.startQuiz('${this.activeKidId}', '${task.subject || 'Mathematics'}', '${(task.rawTitle || task.title || '').replace(/'/g, "\\'")}')" title="Take a 3-question Cambridge practice quiz">
                🧠 Quiz (+15 pts)
              </button>
              <button type="button" class="btn-xs-study" style="background:#fef3c7; color:#92400e; border-color:#fcd34d;" onclick="app.requestHelpOnTask('${task.id}', '${(task.rawTitle || task.title || '').replace(/'/g, "\\'")}', '${task.subject || ''}')" title="Ask Father or Mother for assistance">
                ❓ Ask Help
              </button>
              <button type="button" class="btn-xs-study" onclick="app.searchTopic('${task.subject || ''}', '${(task.rawTitle || task.title || '').replace(/'/g, "\\'")}')" title="Search video lessons on YouTube">
                🎥 Video Help
              </button>
              ${vn && (vn.audio || vn.audioData) ? `
                <div class="voice-note-bar" style="background:#eef2ff; border:1px solid #c7d2fe; padding:2px 8px; border-radius:999px;">
                  <button type="button" class="voice-pill-btn" onclick="app.playVoiceNote('${task.id}', this)" title="Play Parent Voice Note">
                    <span>🔊</span>
                    <span>Note (${vn.from || 'Parent'})</span>
                  </button>
                  ${this.isParentRole() ? `
                    <button type="button" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:0.75rem;" onclick="app.deleteVoiceNote('${task.id}')">✕</button>
                  ` : ''}
                </div>
              ` : (this.isParentRole() ? `
                <button type="button" class="btn-xs-study" onclick="app.startVoiceRecording('${task.id}', '${(task.rawTitle || task.title || '').replace(/'/g, "\\'")}')" title="Record Voice Note for child">
                  <span>🎙️ Voice Note</span>
                </button>
              ` : '')}
            </div>
          </div>
        </div>
      `;
    }).join("");
              
              <button type="button" class="btn-xs-study" onclick="app.triggerPhotoCapture('${task.id}', '${(task.rawTitle || task.title || '').replace(/'/g, "\\'")}')" title="Upload workbook page photo for parents">
                📸 ${photo ? 'Photo ✓' : 'Photo'}
              </button>
              <button type="button" class="btn-xs-study" style="background:#e0e7ff; color:#3730a3; border-color:#c7d2fe;" onclick="cambridgeQuizzer.startQuiz('${this.activeKidId}', '${task.subject || 'Mathematics'}', '${(task.rawTitle || task.title || '').replace(/'/g, "\\'")}')" title="Take a 3-question Cambridge practice quiz">
                🧠 Quiz (+15 pts)
              </button>
              <button type="button" class="btn-xs-study" style="background:#fef3c7; color:#92400e; border-color:#fcd34d;" onclick="app.requestHelpOnTask('${task.id}', '${(task.rawTitle || task.title || '').replace(/'/g, "\\'")}', '${task.subject || ''}')" title="Ask Father or Mother for assistance">
                ❓ Ask Help
              </button>
              <button type="button" class="btn-xs-study" onclick="app.searchTopic('${task.subject || ''}', '${(task.rawTitle || task.title || '').replace(/'/g, "\\'")}')" title="Search video lessons on YouTube">
                🎥 Video Help
              </button>
              ${vn && (vn.audio || vn.audioData) ? `
                <div class="voice-note-bar" style="background:#eef2ff; border:1px solid #c7d2fe; padding:2px 8px; border-radius:999px;">
                  <button type="button" class="voice-pill-btn" onclick="app.playVoiceNote('${task.id}', this)" title="Play Parent Voice Note">
                    <span>🔊</span>
                    <span>Note (${vn.from || 'Parent'})</span>
                  </button>
                  ${this.isParentRole() ? `
                    <button type="button" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:0.75rem;" onclick="app.deleteVoiceNote('${task.id}')">✕</button>
                  ` : ''}
                </div>
              ` : (this.isParentRole() ? `
                <button type="button" class="btn-xs-study" onclick="app.startVoiceRecording('${task.id}', '${(task.rawTitle || task.title || '').replace(/'/g, "\\'")}')" title="Record Voice Note for child">
                  <span>🎙️ Voice Note</span>
                </button>
              ` : '')}
            </div>
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = scopeToggleHTML + tasksListHTML;
  }

  toggleTaskCompleted(taskId, isDailyPlan = false) {
    const user = db.getDeviceUser();
    let nowDone = false;
    if (isDailyPlan) {
      if (!this.data.completedTasks) this.data.completedTasks = {};
      this.data.completedTasks[taskId] = !this.data.completedTasks[taskId];
      nowDone = this.data.completedTasks[taskId];
      db.pushTaskToggle(taskId, nowDone, this.activeKidId);
    } else {
      const kid = this.getActiveKid();
      const asg = (kid.assignments || []).find(a => a.id === taskId);
      if (asg) {
        asg.status = asg.status === "completed" ? "pending" : "completed";
        nowDone = asg.status === "completed";
        db.pushAssignmentStatus(taskId, nowDone ? "completed" : "pending");
      }
    }

    if (nowDone) {
      if (typeof rewardsSystem !== "undefined") {
        rewardsSystem.awardPoints(this.activeKidId, 25, "Completed Homework Task");
      }
      this.showToast(`✓ Marked completed by <strong>${user}</strong>! (+25 pts)`);

      // Celebration check: Check if all tasks for active kid or today are complete
      const kid = this.getActiveKid();
      const days = (kid && kid.weeklyPlan && kid.weeklyPlan.days) ? kid.weeklyPlan.days : {};
      const todayLessons = days[this.selectedDay] || [];
      const hasPendingToday = todayLessons.some((l, idx) => {
        const hw = l.exam || l.assignment || l.homework;
        if (!hw || hw.trim().length === 0) return false;
        return !this.data.completedTasks || !this.data.completedTasks[`day_${this.selectedDay}_hw_${idx}`];
      });

      if (!hasPendingToday && todayLessons.length > 0) {
        this.triggerCelebration();
      }
    } else {
      this.showToast(`↩️ Marked pending by <strong>${user}</strong>`);
    }

    db.saveData(this.data);

    this.renderKidBanner();
    this.renderStudyAssistant();
    this.renderTodayChecklist();
    if (this.activeTab === "assignments") {
      this.renderAssignments();
    }
    if (this.activeTab === "weekly") {
      this.renderWeeklyPlan();
    }
    if (this.isParentDashboardActive()) {
      this.renderParentExecutiveDashboard();
    }
  }

  // --- TAB 2: WEEKLY PLAN MATRIX ---
  renderWeeklyPlan() {
    const kid = this.getActiveKid();
    const container = document.getElementById("weeklyGridContainer");
    const titleEl = document.getElementById("weeklyPlanTitle");
    if (!container || !kid) return;

    if (titleEl && kid.weeklyPlan) {
      titleEl.innerText = kid.weeklyPlan.weekTitle || "Weekly Study Plan";
    }

    const daysOrder = ["saturday", "monday", "tuesday", "wednesday", "thursday"];
    const dayNames = {
      saturday: "Saturday",
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday"
    };

    const prepEveMap = {
      saturday: { eve: "Friday Eve", note: "Prepare & solve on Friday evening" },
      monday: { eve: "Sunday Eve", note: "Prepare & solve on Sunday evening" },
      tuesday: { eve: "Monday Eve", note: "Prepare & solve on Monday evening" },
      wednesday: { eve: "Tuesday Eve", note: "Prepare & solve on Tuesday evening" },
      thursday: { eve: "Wednesday Eve", note: "Prepare & solve on Wednesday evening" }
    };

    const days = (kid.weeklyPlan && kid.weeklyPlan.days) ? kid.weeklyPlan.days : {};
    const completedState = this.data.completedTasks || {};

    container.innerHTML = daysOrder.map(dayKey => {
      const isToday = this.selectedDay === dayKey;
      const dayLessons = days[dayKey] || [];
      const prepInfo = prepEveMap[dayKey] || { eve: "Evening Before", note: "" };

      return `
        <div class="week-day-col" style="min-width: 285px; border-top: 4px solid var(--primary);">
          <div class="week-day-header ${isToday ? 'today' : ''}">
            <div style="font-size:0.95rem; font-weight:800;">${dayNames[dayKey]}</div>
            <div style="font-size:0.72rem; font-weight:700; color:#312e81; background:#e0e7ff; padding:3px 8px; border-radius:5px; margin-top:4px; display:inline-block; border:1px solid #c7d2fe;">
              🌙 Study & Prep: <strong>${prepInfo.eve}</strong>
            </div>
          </div>
          <div class="week-day-content">
            ${dayLessons.some(l => (l.topic && l.topic.toLowerCase().includes("long weekend")) || (l.outcome && l.outcome.toLowerCase().includes("long weekend")) || (l.outcome && l.outcome.includes("عطلة"))) ? `
              <div style="background:linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border:2px dashed #10b981; border-radius:12px; padding:28px 16px; text-align:center; color:#065f46; margin:8px 0;">
                <div style="font-size:2.6rem; margin-bottom:8px;">🌴</div>
                <strong style="font-size:1rem; display:block; margin-bottom:4px; color:#065f46;">Official Long Weekend</strong>
                <div style="font-size:0.82rem; font-weight:700; color:#047857;">عطلة نهاية أسبوع طويلة (No School)</div>
                <p style="font-size:0.75rem; color:#065f46; margin:8px 0 0 0; opacity:0.9;">No classes, exams, or homework scheduled. Enjoy the break!</p>
              </div>
            ` : dayLessons.length === 0 ? `<p style="font-size:0.8rem; color:var(--text-muted); text-align:center;">No lessons scheduled</p>` : ""}
            ${dayLessons.some(l => (l.topic && l.topic.toLowerCase().includes("long weekend")) || (l.outcome && l.outcome.toLowerCase().includes("long weekend")) || (l.outcome && l.outcome.includes("عطلة"))) ? "" : dayLessons.map((lesson, idx) => {
              const taskId = `day_${dayKey}_hw_${idx}`;
              const isHwDone = !!completedState[taskId];
              const isPastDue = this.isTaskPastDue({ id: taskId, day: dayKey });
              const hwText = lesson.assignment || lesson.homework || "";
              const refText = lesson.reference || lesson.notes || "";
              const examText = lesson.exam || "";
              const outcomeText = lesson.outcome || lesson.topic || "";
              const meta = db.getTaskMeta(taskId);

              return `
                <div class="week-lesson-card">
                  <div class="week-lesson-subj">${this.getSubjectIcon(kid, lesson.subject)} ${lesson.subject}</div>
                  
                  ${outcomeText ? `
                    <div style="font-size:0.77rem; color:var(--text-main); margin-top:4px; line-height:1.35;">
                      <span style="font-size:0.65rem; font-weight:800; background:#334155; color:#fff; padding:1px 5px; border-radius:3px; text-transform:uppercase; display:inline-block; margin-bottom:2px;">Outcome</span>
                      <div>${outcomeText}</div>
                    </div>
                  ` : ""}

                  ${examText ? `
                    <div style="background:${isHwDone ? '#ecfdf5' : (isPastDue ? '#fef2f2' : '#fef2f2')}; border:1.5px solid ${isHwDone ? '#10b981' : (isPastDue ? '#ef4444' : '#f87171')}; border-radius:6px; padding:6px 8px; margin-top:6px;">
                      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                        <span style="font-size:0.65rem; font-weight:800; background:${isHwDone ? '#10b981' : '#ef4444'}; color:#fff; padding:1px 5px; border-radius:3px; text-transform:uppercase;">Exam / Quiz</span>
                        <span style="font-size:0.68rem; font-weight:800; color:${isHwDone ? '#065f46' : '#b91c1c'}; background:${isHwDone ? '#d1fae5' : '#fee2e2'}; padding:1px 5px; border-radius:3px;">
                          ${isHwDone ? '✅ Exam Finished' : (isPastDue ? '🚨 Exam Date Passed' : `🚨 Revise on ${prepInfo.eve}`)}
                        </span>
                      </div>
                      <div style="font-size:0.77rem; font-weight:700; color:${isHwDone ? '#065f46' : '#991b1b'}; line-height:1.3; ${isHwDone ? 'text-decoration:line-through;' : ''}">${examText}</div>
                    </div>
                  ` : ""}

                  ${hwText ? `
                    ${isHwDone ? `
                      <div class="week-lesson-hw is-done" style="display:flex; align-items:flex-start; gap:6px; background:#ecfdf5; padding:6px 8px; border-radius:6px; margin-top:6px; border:1.5px solid #10b981;">
                        <span style="font-size:1.05rem; line-height:1.2; color:#10b981;">✅</span>
                        <div style="flex:1;">
                          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                            <span style="font-size:0.65rem; font-weight:800; background:#10b981; color:#fff; padding:1px 5px; border-radius:3px; text-transform:uppercase;">Assignment</span>
                            <span style="font-size:0.68rem; font-weight:700; color:#065f46; background:#d1fae5; padding:1px 5px; border-radius:3px;">✓ Finished ${meta && meta.updatedBy ? `by ${meta.updatedBy}` : ''}</span>
                          </div>
                          <div style="font-size:0.77rem; text-decoration:line-through; color:#065f46;">${hwText}</div>
                        </div>
                      </div>
                    ` : (isPastDue ? `
                      <div class="week-lesson-hw is-overdue" style="display:flex; align-items:flex-start; gap:6px; background:#fff5f5; padding:6px 8px; border-radius:6px; margin-top:6px; border:1.5px solid #ef4444;">
                        <span style="font-size:1.05rem; line-height:1.2; color:#ef4444;">⚠️</span>
                        <div style="flex:1;">
                          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                            <span style="font-size:0.65rem; font-weight:800; background:#ef4444; color:#fff; padding:1px 5px; border-radius:3px; text-transform:uppercase;">Past Due Date</span>
                            <span style="font-size:0.68rem; font-weight:800; color:#b91c1c; background:#fee2e2; padding:1px 5px; border-radius:3px;">Not Completed</span>
                          </div>
                          <div style="font-size:0.77rem; font-weight:700; color:#991b1b;">${hwText}</div>
                        </div>
                      </div>
                    ` : `
                      <div class="week-lesson-hw is-active" style="cursor:pointer; display:flex; align-items:flex-start; gap:6px; background:#f0fdf4; padding:6px 8px; border-radius:6px; margin-top:6px; border:1.5px solid #86efac;" onclick="app.toggleTaskCompleted('${taskId}', true)" title="Click to toggle status (Syncs across devices)">
                        <span style="font-size:1.05rem; line-height:1.2;">⬜</span>
                        <div style="flex:1;">
                          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                            <span style="font-size:0.65rem; font-weight:800; background:#10b981; color:#fff; padding:1px 5px; border-radius:3px; text-transform:uppercase;">Assignment</span>
                            <span style="font-size:0.68rem; font-weight:700; color:#065f46; background:#d1fae5; padding:1px 5px; border-radius:3px;">⏰ Solve on ${prepInfo.eve}</span>
                          </div>
                          <div style="font-size:0.77rem; font-weight:700; color:#14532d;">${hwText}</div>
                          ${meta && meta.updatedBy ? `
                            <div style="font-size:0.68rem; color:#b91c1c; margin-top:3px; font-weight:700;">
                              ● Pending (marked by: ${meta.updatedBy})
                            </div>
                          ` : ''}
                        </div>
                      </div>
                    `)}
                  ` : ""}

                  ${refText ? `
                    <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:4px 8px; margin-top:5px;">
                      <span style="font-size:0.65rem; font-weight:800; background:#3b82f6; color:#fff; padding:1px 5px; border-radius:3px; text-transform:uppercase; display:inline-block; margin-bottom:2px;">Note / Reference</span>
                      <div style="font-size:0.73rem; color:#1e40af; line-height:1.3;">${refText}</div>
                    </div>
                  ` : ""}

                  <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:6px;">
                    <button type="button" class="btn-xs-study" onclick="app.searchTopic('${(lesson.subject || '').replace(/'/g, "\\'")}', '${(outcomeText || hwText || '').replace(/'/g, "\\'")}')" title="Search video lessons on YouTube">
                      🎥 Video Help
                    </button>
                    <button type="button" class="btn-xs-study btn-xs-checkpoint" onclick="app.searchPastPapers('${(lesson.subject || '').replace(/'/g, "\\'")}', '${(outcomeText || hwText || '').replace(/'/g, "\\'")}')" title="Search Cambridge Checkpoint questions">
                      📑 Checkpoint Questions
                    </button>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }).join("");
  }

  // --- TAB 3: ASSIGNMENTS & EXAMS ---
  setAssignmentFilter(filter) {
    this.assignmentFilter = filter;
    this.renderAssignments();
  }

  removePastExams() {
    const kid = this.getActiveKid();
    const todayStr = new Date().toISOString().split("T")[0];
    const initialCount = (kid.assignments || []).length;
    kid.assignments = (kid.assignments || []).filter(a => !(a.dueDate && a.dueDate < todayStr && (a.type === "Quiz" || a.type === "Test" || a.type === "Exam" || a.status === "completed")));
    const removedCount = initialCount - kid.assignments.length;
    db.saveData(this.data);
    this.renderAssignments();
    this.renderKidBanner();
    alert(`🗑 Cleaned ${removedCount} finished past exams and completed items from the active list!`);
  }

  renderAssignments() {
    const kid = this.getActiveKid();
    const container = document.getElementById("assignmentsGrid");
    if (!container || !kid) return;

    const todayStr = new Date().toISOString().split("T")[0];

    // Detect past due items without falsely marking incomplete exams as completed
    (kid.assignments || []).forEach(asg => {
      const isPastDue = this.isTaskPastDue(asg);
      asg.isPast = isPastDue;
      if (asg.type === "Quiz" || asg.type === "Test" || asg.type === "Exam") {
        asg.isPastExam = isPastDue;
      }
    });

    let items = kid.assignments || [];
    if (this.assignmentFilter === "pending") {
      items = items.filter(a => a.status !== "completed" && !this.isTaskPastDue(a));
    } else if (this.assignmentFilter === "overdue") {
      items = items.filter(a => a.status !== "completed" && this.isTaskPastDue(a));
    } else if (this.assignmentFilter === "completed") {
      items = items.filter(a => a.status === "completed");
    } else if (this.assignmentFilter === "quiz") {
      items = items.filter(a => (a.type === "Quiz" || a.type === "Test" || a.type === "Exam"));
    }

    const allCount = (kid.assignments || []).length;
    const pendingActiveCount = (kid.assignments || []).filter(a => a.status !== "completed" && !this.isTaskPastDue(a)).length;
    const overdueCount = (kid.assignments || []).filter(a => a.status !== "completed" && this.isTaskPastDue(a)).length;
    const completedCount = (kid.assignments || []).filter(a => a.status === "completed").length;
    const quizCount = (kid.assignments || []).filter(a => (a.type === "Quiz" || a.type === "Test" || a.type === "Exam")).length;

    // Update filter bar
    const filterBar = document.querySelector(".asg-filter-bar");
    if (filterBar) {
      filterBar.innerHTML = `
        <button type="button" class="filter-btn ${this.assignmentFilter === 'all' ? 'active' : ''}" data-filter="all" onclick="app.setAssignmentFilter('all')">All Items (${allCount})</button>
        <button type="button" class="filter-btn ${this.assignmentFilter === 'pending' ? 'active' : ''}" data-filter="pending" onclick="app.setAssignmentFilter('pending')">⏳ Active / Today (${pendingActiveCount})</button>
        <button type="button" class="filter-btn ${this.assignmentFilter === 'overdue' ? 'active' : ''}" style="${overdueCount > 0 ? 'border-color:#fca5a5; color:#991b1b; font-weight:800;' : ''}" data-filter="overdue" onclick="app.setAssignmentFilter('overdue')">⚠️ Past Due (${overdueCount})</button>
        <button type="button" class="filter-btn ${this.assignmentFilter === 'quiz' ? 'active' : ''}" data-filter="quiz" onclick="app.setAssignmentFilter('quiz')">🔥 Quizzes & Exams (${quizCount})</button>
        <button type="button" class="filter-btn ${this.assignmentFilter === 'completed' ? 'active' : ''}" data-filter="completed" onclick="app.setAssignmentFilter('completed')">✓ Completed (${completedCount})</button>
        ${overdueCount > 0 ? `
          <button type="button" class="btn-secondary" style="font-size:0.75rem; padding:4px 10px; border-color:#fca5a5; color:var(--high-priority); margin-left:auto;" onclick="app.removePastExams()" title="Clear past exams">
            🗑 Clean Past Items
          </button>
        ` : ""}
      `;
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
          <div style="font-size: 36px; margin-bottom: 10px;">${this.assignmentFilter === 'overdue' ? '🎉' : '📋'}</div>
          <h4>${this.assignmentFilter === 'overdue' ? 'No overdue items!' : 'No assignments found in this category'}</h4>
          <p>${this.assignmentFilter === 'overdue' ? 'All tasks are either completed or scheduled for today/upcoming!' : 'All items in this filter are cleared!'}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(asg => {
      const isDone = asg.status === "completed";
      const isPastDue = this.isTaskPastDue(asg);
      const isExam = asg.type === "Quiz" || asg.type === "Test" || asg.type === "Exam";
      const meta = db.getTaskMeta(asg.id);
      const whoDone = meta && meta.updatedBy ? `by ${meta.updatedBy}` : "";

      let cardClass = "asg-card";
      let cardStyle = "";
      if (isDone) {
        cardClass += " is-completed";
        cardStyle = "border-left: 5px solid #10b981; background: #f8fafc; opacity: 0.9;";
      } else if (isPastDue) {
        cardClass += " is-overdue";
        cardStyle = "border-left: 5px solid #dc2626 !important; background: #fff8f8; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.12);";
      } else {
        cardStyle = `border-left: 5px solid ${asg.priority === 'high' ? 'var(--high-priority)' : asg.priority === 'medium' ? 'var(--med-priority)' : 'var(--low-priority)'};`;
      }

      return `
        <div class="${cardClass}" style="${cardStyle}">
          <div class="asg-card-top">
            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              <span class="asg-type-badge ${asg.type}">${asg.type || 'Task'}</span>
              ${isExam ? `
                <span style="font-size:0.72rem; font-weight:800; padding:2px 7px; border-radius:4px; ${isDone ? 'background:#ecfdf5; color:#065f46;' : (isPastDue ? 'background:#fee2e2; color:#b91c1c; border:1px solid #f87171;' : 'background:#fee2e2; color:#b91c1c;')}">
                  ${isDone ? '✅ EXAM FINISHED' : (isPastDue ? '🚨 EXAM DATE PASSED' : '🚨 EXAM / QUIZ')}
                </span>
              ` : ''}
            </div>
            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              ${isDone ? `
                <span style="font-size:0.75rem; background:#ecfdf5; border:1px solid #a7f3d0; color:#065f46; font-weight:800; padding:2px 8px; border-radius:999px;">✓ Completed ${whoDone ? `(${whoDone})` : ''}</span>
              ` : (isPastDue ? `
                <span style="font-size:0.75rem; background:#fee2e2; border:1px solid #f87171; color:#991b1b; font-weight:800; padding:2px 8px; border-radius:999px;">⚠️ Past Due Date (Not Completed)</span>
              ` : `
                <span style="font-size:0.75rem; background:#eff6ff; border:1px solid #bfdbfe; color:#1e40af; font-weight:800; padding:2px 8px; border-radius:999px;">⏳ Active</span>
              `)}
              <span class="due-badge ${isPastDue && !isDone ? 'urgent' : (asg.priority === 'high' ? 'urgent' : asg.priority === 'medium' ? 'warning' : 'normal')}">
                📅 Due: ${asg.dueDate}
              </span>
            </div>
          </div>
          <div class="asg-title" style="${isDone ? 'text-decoration: line-through; opacity:0.75;' : (isPastDue ? 'color:#991b1b; font-weight:800;' : '')}">
            ${asg.title}
          </div>
          <div style="font-size: 0.82rem; font-weight: 700; color: var(--primary); margin-bottom: 6px;">
            ${this.getSubjectIcon(kid, asg.subject)} ${asg.subject}
          </div>
          <div class="asg-details">${asg.details || "No special instructions provided."}</div>

          ${(asg.filesAttached && asg.filesAttached.length > 0) ? `
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 6px;">
              📎 Attached:
              ${asg.filesAttached.map(f => `<span style="background:var(--bg-card-subtle); padding:2px 6px; border-radius:4px; font-weight:600;">${f}</span>`).join("")}
            </div>
          ` : ""}

          <!-- Footer: NO CHECKBOX for completed OR past due! -->
          <div class="asg-footer" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            ${isDone ? `
              <span style="font-size:0.8rem; color:#059669; font-weight:800;">✓ Completed on Record</span>
              <div style="display:flex; gap:8px; align-items:center;">
                <button type="button" style="background:none; border:none; color:var(--text-muted); font-size:0.75rem; cursor:pointer; text-decoration:underline;" onclick="app.toggleTaskCompleted('${asg.id}', false)" title="Marked by mistake? Reopen">↩ Reopen</button>
                <button type="button" style="background:none; border:none; color:var(--high-priority); cursor:pointer; font-size:0.8rem;" onclick="app.deleteAssignment('${asg.id}')">🗑 Delete</button>
              </div>
            ` : (isPastDue ? `
              <span style="font-size:0.8rem; font-weight:800; color:#b91c1c;">⚠️ Past Due (${asg.dueDate}) — Not Completed</span>
              <div style="display:flex; gap:8px; align-items:center;">
                <button type="button" class="btn-secondary" style="font-size:0.75rem; padding:4px 10px; border-color:#fca5a5; color:#991b1b; font-weight:700;" onclick="app.toggleTaskCompleted('${asg.id}', false)">✓ Submit Late</button>
                <button type="button" style="background:none; border:none; color:var(--high-priority); cursor:pointer; font-size:0.8rem;" onclick="app.deleteAssignment('${asg.id}')">🗑 Delete</button>
              </div>
            ` : `
              <button type="button" class="btn-secondary" style="padding: 6px 14px; font-size: 0.82rem; font-weight:700; cursor:pointer; background:var(--primary); color:#fff;" onclick="app.toggleTaskCompleted('${asg.id}', false)">
                ✓ Mark as Completed
              </button>
              <button type="button" style="background:none; border:none; color:var(--high-priority); cursor:pointer; font-size:0.8rem;" onclick="app.deleteAssignment('${asg.id}')">
                🗑 Delete
              </button>
            `)}
          </div>
        </div>
      `;
    }).join("");
  }

  deleteAssignment(id) {
    if (!confirm("Are you sure you want to remove this assignment?")) return;
    const kid = this.getActiveKid();
    kid.assignments = (kid.assignments || []).filter(a => a.id !== id);
    db.saveData(this.data);
    this.renderKidBanner();
    this.renderAssignments();
    this.renderTodayChecklist();
  }

  // --- TAB 4: SCHOOL RESOURCES & LEARNING MATERIALS (LMS) ---
  filterResourceSubject(subj) {
    this.selectedResourceSubject = subj;
    this.renderDocuments();
  }

  filterDocuments() {
    this.renderDocuments();
  }

  async renderDocuments() {
    const kid = this.getActiveKid();
    const container = document.getElementById("docsGridContainer");
    const filterBar = document.getElementById("resourceFilterBar");
    if (!container || !kid) return;

    // Retrieve both seeded document metadata AND real files saved into IndexedDB
    let idbFiles = [];
    try {
      idbFiles = await db.getAllFiles(kid.id);
    } catch (e) {
      console.warn("Could not load from IndexedDB:", e);
    }

    const defaultDocs = kid.documents || [];
    const allDocs = [...idbFiles, ...defaultDocs];

    // Compute subject counts
    const subjectCounts = {};
    allDocs.forEach(d => {
      const s = (d.subject && d.subject.trim()) || "General";
      subjectCounts[s] = (subjectCounts[s] || 0) + 1;
    });

    if (!this.selectedResourceSubject) {
      this.selectedResourceSubject = "all";
    }

    // Render subject filter chips in #resourceFilterBar
    if (filterBar) {
      const sortedSubjects = Object.keys(subjectCounts).sort((a, b) => subjectCounts[b] - subjectCounts[a]);
      filterBar.innerHTML = `
        <button type="button" class="filter-btn ${this.selectedResourceSubject === 'all' ? 'active' : ''}" onclick="app.filterResourceSubject('all')">
          All Materials (${allDocs.length})
        </button>
        ${sortedSubjects.map(subj => `
          <button type="button" class="filter-btn ${this.selectedResourceSubject === subj ? 'active' : ''}" onclick="app.filterResourceSubject('${subj.replace(/'/g, "\\'")}')">
            ${this.getSubjectIcon(kid, subj)} ${subj} (${subjectCounts[subj]})
          </button>
        `).join("")}
      `;
    }

    // Apply filters
    const searchInput = document.getElementById("docSearchInput");
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

    let filtered = allDocs;
    if (this.selectedResourceSubject !== "all") {
      filtered = filtered.filter(d => (d.subject || "General") === this.selectedResourceSubject);
    }
    if (query) {
      filtered = filtered.filter(d => {
        const nameMatch = (d.name || "").toLowerCase().includes(query);
        const subjMatch = (d.subject || "").toLowerCase().includes(query);
        const teacherMatch = (d.teacher || "").toLowerCase().includes(query);
        const catMatch = (d.category || "").toLowerCase().includes(query);
        return nameMatch || subjMatch || teacherMatch || catMatch;
      });
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
          <div style="font-size: 36px; margin-bottom: 10px;">🔍</div>
          <h4>No resources found</h4>
          <p>Try searching for a different keyword or select another subject tab above.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(doc => {
      const type = doc.type || db.determineFileType(doc.name);
      const isFromIDB = !!doc.dataUrl;

      return `
        <div class="doc-card" style="display:flex; flex-direction:column; justify-content:space-between; border-radius:10px; background:var(--bg-card); border:1px solid var(--border-color); padding:14px; transition:transform 0.2s, box-shadow 0.2s;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
              <span class="doc-icon-badge ${type}" style="font-size:0.75rem; font-weight:800; padding:4px 8px; border-radius:6px;">
                ${this.getFileIcon(type)} ${type}
              </span>
              <span style="font-size:0.72rem; font-weight:700; color:var(--primary); background:rgba(79, 70, 229, 0.08); padding:3px 8px; border-radius:999px;">
                ${doc.subject || "General"}
              </span>
            </div>
            
            <div class="doc-title" title="${doc.name}" style="cursor:pointer; font-weight:700; font-size:0.92rem; color:var(--text-main); margin-bottom:8px; line-height:1.35;" onclick="app.openDocumentPreview('${doc.downloadUrl || doc.dataUrl}', '${doc.name.replace(/'/g, "\\'")}')">
              ${doc.name}
            </div>

            <div style="font-size:0.78rem; color:var(--text-muted); display:flex; flex-direction:column; gap:3px; margin-bottom:12px;">
              ${doc.teacher ? `<div style="color:var(--text-main); font-weight:600;">👨‍🏫 Teacher: ${doc.teacher}</div>` : `<div style="color:var(--text-muted);">🏫 AAJ Academic Staff</div>`}
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span>📅 ${doc.dateAdded || "Recent"}</span>
                <span>${doc.size || "Resource"}</span>
              </div>
            </div>
          </div>

          <div class="doc-actions" style="display:flex; gap:6px; flex-wrap:wrap; border-top:1px solid var(--border-color); padding-top:10px;">
            <button type="button" class="btn-primary" onclick="app.openDocumentPreview('${doc.downloadUrl || doc.dataUrl}', '${doc.name.replace(/'/g, "\\'")}')" style="font-size:0.78rem; padding:6px 12px; display:inline-flex; align-items:center; gap:5px;">
              <span>👁</span> Preview
            </button>
            ${doc.downloadUrl ? `
              <a href="${doc.downloadUrl}" target="_blank" download="${doc.name}" class="btn-secondary" style="font-size:0.78rem; padding:6px 12px; text-decoration:none; display:inline-flex; align-items:center; gap:5px;" title="Download Real School File">
                <span>⬇</span> Download
              </a>
            ` : isFromIDB ? `
              <a href="${doc.dataUrl}" download="${doc.name}" class="btn-secondary" style="font-size:0.78rem; padding:6px 12px; text-decoration:none; display:inline-flex; align-items:center; gap:5px;" title="Download / Open file">
                <span>⬇</span> Download
              </a>
            ` : doc.externalLink ? `
              <a href="${doc.externalLink}" target="_blank" class="btn-secondary" style="font-size:0.78rem; padding:6px 12px; text-decoration:none; display:inline-flex; align-items:center; gap:5px; background:var(--accent); color:#fff;" title="Open Presentation Link">
                <span>🔗</span> Slides Link
              </a>
            ` : ""}
            ${isFromIDB ? `
              <button type="button" class="action-icon-btn" onclick="app.deleteDocument('${doc.id}', true)" title="Delete Custom Upload" style="color:var(--high-priority); margin-left:auto;">
                ✕
              </button>
            ` : ""}
          </div>
        </div>
      `;
    }).join("");
  }

  getFileIcon(type) {
    switch (type) {
      case "Word": return "W";
      case "PowerPoint": return "P";
      case "PDF": return "PDF";
      case "Image": return "🖼";
      default: return "📄";
    }
  }

  async deleteDocument(docId, isIDB) {
    if (!confirm("Are you sure you want to remove this document?")) return;
    if (isIDB) {
      await db.deleteFile(docId);
    } else {
      const kid = this.getActiveKid();
      kid.documents = (kid.documents || []).filter(d => d.id !== docId);
      db.saveData(this.data);
    }
    this.renderDocuments();
    this.renderKidBanner();
  }

  setupDropzone() {
    const dropzone = document.getElementById("docsDropzone");
    const fileInput = document.getElementById("realFileInput");
    if (!dropzone || !fileInput) return;

    dropzone.addEventListener("click", () => fileInput.click());

    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", async (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      if (e.dataTransfer && e.dataTransfer.files) {
        await this.handleFilesUpload(e.dataTransfer.files);
      }
    });

    fileInput.addEventListener("change", async (e) => {
      if (e.target.files) {
        await this.handleFilesUpload(e.target.files);
      }
    });
  }

  async handleFilesUpload(filesList) {
    const kid = this.getActiveKid();
    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      try {
        await db.saveFile(kid.id, file, {
          subject: "All Subjects",
          category: "School Material"
        });
      } catch (err) {
        console.error("Error saving file to IndexedDB:", err);
      }
    }
    alert(`Successfully stored ${filesList.length} file(s) for ${kid.name.split(' ')[0]}!`);
    this.renderDocuments();
    this.renderKidBanner();
  }

  // --- TAB 5: EMAILS & NOTICES HUB ---
  renderEmails() {
    const kid = this.getActiveKid();
    const container = document.getElementById("emailsListContainer");
    if (!container || !kid) return;

    const emails = kid.emailsAndNotes || [];
    if (emails.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
          <div style="font-size: 36px; margin-bottom: 10px;">📬</div>
          <h4>No circulars or emails logged</h4>
          <p>Keep track of school app notifications, teacher emails, and reminders here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = emails.map(email => `
      <div class="email-card">
        <div class="email-card-header">
          <div class="email-sender">
            <span>✉</span>
            <span>${email.sender}</span>
          </div>
          <div class="email-date">📅 ${email.date}</div>
        </div>
        <div class="email-subject">${email.subject}</div>
        <div class="email-body">${email.content}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
          <span class="due-badge ${email.urgency === 'high' ? 'urgent' : 'normal'}">${email.tag || 'Notice'}</span>
          <button type="button" style="background:none; border:none; color:var(--high-priority); cursor:pointer; font-size:0.8rem;" onclick="app.deleteEmail('${email.id}')">
            🗑 Delete
          </button>
        </div>
      </div>
    `).join("");
  }

  deleteEmail(emailId) {
    if (!confirm("Are you sure you want to remove this notice?")) return;
    const kid = this.getActiveKid();
    kid.emailsAndNotes = (kid.emailsAndNotes || []).filter(e => e.id !== emailId);
    db.saveData(this.data);
    this.renderEmails();
  }

  // --- TAB 6: POMODORO STUDY TIMER ---
  toggleTimer() {
    if (this.isTimerRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    if (this.isTimerRunning) return;
    this.isTimerRunning = true;
    const btn = document.getElementById("timerToggleBtn");
    if (btn) btn.innerHTML = "⏸";

    this.timerInterval = setInterval(() => {
      if (this.timerSeconds === 0) {
        if (this.timerMinutes === 0) {
          this.timerComplete();
          return;
        }
        this.timerMinutes--;
        this.timerSeconds = 59;
      } else {
        this.timerSeconds--;
      }
      this.updateTimerDisplay();
    }, 1000);
  }

  pauseTimer() {
    this.isTimerRunning = false;
    clearInterval(this.timerInterval);
    const btn = document.getElementById("timerToggleBtn");
    if (btn) btn.innerHTML = "▶";
  }

  resetTimer() {
    this.pauseTimer();
    if (this.timerMode === "study") {
      this.timerMinutes = 25;
      this.timerSeconds = 0;
      this.timerInitialDuration = 25 * 60;
    } else {
      this.timerMinutes = 5;
      this.timerSeconds = 0;
      this.timerInitialDuration = 5 * 60;
    }
    this.updateTimerDisplay();
  }

  setTimerMode(mode) {
    this.pauseTimer();
    this.timerMode = mode;
    if (mode === "study") {
      this.timerMinutes = 25;
      this.timerSeconds = 0;
      this.timerInitialDuration = 25 * 60;
      const lbl = document.getElementById("timerModeLabel");
      if (lbl) lbl.innerText = "Focus Session";
    } else {
      this.timerMinutes = 5;
      this.timerSeconds = 0;
      this.timerInitialDuration = 5 * 60;
      const lbl = document.getElementById("timerModeLabel");
      if (lbl) lbl.innerText = "Short Break";
    }
    this.updateTimerDisplay();
  }

  timerComplete() {
    this.pauseTimer();
    this.playChime();
    if (this.timerMode === "study") {
      alert("🎉 Great job! Study session completed. Time for a 5-minute break!");
      this.setTimerMode("break");
    } else {
      alert("⏰ Break is over! Ready for the next study session?");
      this.setTimerMode("study");
    }
  }

  updateTimerDisplay() {
    const minStr = String(this.timerMinutes).padStart(2, "0");
    const secStr = String(this.timerSeconds).padStart(2, "0");
    const digitsEl = document.getElementById("timerDigits");
    if (digitsEl) digitsEl.innerText = `${minStr}:${secStr}`;

    // Update circular progress SVG
    const circle = document.getElementById("timerCircleProgress");
    if (circle) {
      const totalRemaining = this.timerMinutes * 60 + this.timerSeconds;
      const percent = totalRemaining / this.timerInitialDuration;
      const circumference = 2 * Math.PI * 110; // r=110
      const offset = circumference * (1 - percent);
      circle.style.strokeDasharray = `${circumference}`;
      circle.style.strokeDashoffset = `${offset}`;
    }
  }

  // Synthesizes a soothing bell chime using browser Web Audio API (No audio file needed)
  playChime() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.5);
    } catch (e) {
      console.warn("AudioContext not permitted or supported:", e);
    }
  }

  // --- MODALS HANDLING ---
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("active");
      this.populateModalDropdowns(modalId);
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("active");
  }

  populateModalDropdowns(modalId) {
    const kid = this.getActiveKid();
    if (modalId === "modalAddAssignment") {
      const select = document.getElementById("asgSubjectSelect");
      if (select && kid.subjects) {
        select.innerHTML = kid.subjects.map(s => `
          <option value="${s.name}">${s.icon} ${s.name}</option>
        `).join("");
      }
    }
  }

  // --- FORM SUBMISSIONS ---
  saveNewAssignment(e) {
    e.preventDefault();
    const kid = this.getActiveKid();

    const title = document.getElementById("asgTitleInput").value.trim();
    const subject = document.getElementById("asgSubjectSelect").value;
    const type = document.getElementById("asgTypeSelect").value;
    const dueDate = document.getElementById("asgDueDateInput").value;
    const priority = document.getElementById("asgPrioritySelect").value;
    const details = document.getElementById("asgDetailsInput").value.trim();

    if (!title || !dueDate) {
      alert("Please enter title and due date.");
      return;
    }

    const newAsg = {
      id: "asg_" + Date.now(),
      subject,
      title,
      type,
      dueDate,
      priority,
      status: "pending",
      details,
      filesAttached: []
    };

    if (!kid.assignments) kid.assignments = [];
    kid.assignments.unshift(newAsg);
    db.saveData(this.data);

    this.closeModal("modalAddAssignment");
    document.getElementById("formAddAssignment").reset();
    this.renderKidBanner();
    this.renderAssignments();
    this.renderTodayChecklist();
  }

  saveNewEmail(e) {
    e.preventDefault();
    const kid = this.getActiveKid();

    const sender = document.getElementById("emailSenderInput").value.trim();
    const subject = document.getElementById("emailSubjectInput").value.trim();
    const date = document.getElementById("emailDateInput").value || new Date().toISOString().split("T")[0];
    const tag = document.getElementById("emailTagInput").value;
    const content = document.getElementById("emailContentInput").value.trim();

    if (!subject || !content) {
      alert("Please fill in subject and message content.");
      return;
    }

    const newEmail = {
      id: "em_" + Date.now(),
      sender: sender || "School Teacher",
      date,
      subject,
      tag,
      urgency: tag === "Exam Alert" ? "high" : "normal",
      content
    };

    if (!kid.emailsAndNotes) kid.emailsAndNotes = [];
    kid.emailsAndNotes.unshift(newEmail);
    db.saveData(this.data);

    this.closeModal("modalAddEmail");
    document.getElementById("formAddEmail").reset();
    this.renderEmails();
  }

  // --- TAB 7: SMART STUDY TIME PLANNER ---
  renderSmartStudyPlan() {
    const kid = this.getActiveKid();
    const container = document.getElementById("studyPlannerGridContainer");
    if (!container || !kid) return;

    const weeklyRoutine = studyPlanner.generateWeeklySchedule(kid);

    container.innerHTML = weeklyRoutine.map(day => `
      <div class="week-day-col" style="min-width: 285px;">
        <div class="week-day-header ${this.selectedDay === day.dayKey ? 'today' : ''}" style="display:flex; justify-content:space-between; align-items:center;">
          <span>${day.dayNameEn} (${day.dayNameAr})</span>
          <span style="font-size:0.75rem; background:rgba(255,255,255,0.25); padding:2px 8px; border-radius:999px;">
            ${day.totalStudyHoursFormatted}
          </span>
        </div>

        <div class="week-day-content">
          ${day.blocks.map(b => `
            <div class="week-lesson-card" style="border-right: 4px solid ${b.priority === 'urgent' ? 'var(--high-priority)' : b.priority === 'high' ? 'var(--accent)' : 'var(--primary)'};">
              <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:700; color:var(--text-muted); margin-bottom:4px;">
                <span>⏰ ${b.startTime} - ${b.endTime}</span>
                <span>${b.durationMin} min</span>
              </div>
              <div class="week-lesson-subj">${b.icon} ${b.subject}</div>
              <div class="week-lesson-topic" style="font-size:0.85rem;">${b.task}</div>
            </div>
          `).join("")}

          <!-- Quick WhatsApp Share Button for this day's plan -->
          <button type="button" class="btn-secondary" style="width:100%; margin-top:8px; font-size:0.78rem; padding:6px; justify-content:center; gap:6px;" onclick="app.sendDayPlanWhatsApp('${day.dayKey}')">
            📲 Share Plan to WhatsApp
          </button>
        </div>
      </div>
    `).join("");
  }

  sendDayPlanWhatsApp(dayKey) {
    const kid = this.getActiveKid();
    const routine = studyPlanner.generateWeeklySchedule(kid);
    const dayPlan = routine.find(d => d.dayKey === dayKey);
    if (!dayPlan) return;

    const msg = notifier.formatDailyPlanWhatsAppMessage(kid, dayPlan);
    const contacts = notifier.contacts;

    // Prompt user which contact to send to
    const choice = prompt(
      `Send study plan for ${dayPlan.dayNameEn} to:\n` +
      `1: Father (${contacts.father.rawPhone})\n` +
      `2: Mother (${contacts.mother.rawPhone})\n` +
      `3: Child (${contacts[kid.id]?.rawPhone || 'Not set'})\n` +
      `4: Copy SMS Text`,
      "1"
    );

    if (choice === "1") notifier.sendWhatsApp(contacts.father.phone, msg);
    else if (choice === "2") notifier.sendWhatsApp(contacts.mother.phone, msg);
    else if (choice === "3") notifier.sendWhatsApp(contacts[kid.id]?.phone || contacts.father.phone, msg);
    else if (choice === "4") notifier.copyForSms(msg);
  }

  // --- TAB 8: NOTIFICATION & EXAM REMINDERS CENTER ---
  renderNotificationCenter() {
    const kid = this.getActiveKid();
    const alertsContainer = document.getElementById("examAlertsList");
    const contactsContainer = document.getElementById("contactsListContainer");
    if (!alertsContainer || !kid) return;

    const upcomingExams = notifier.getUpcomingExamAlerts(kid);

    if (upcomingExams.length === 0) {
      alertsContainer.innerHTML = `
        <div style="text-align:center; padding:30px; color:var(--text-muted); background:var(--bg-card); border-radius:var(--radius-lg); border:1px dashed var(--border-color);">
          <div style="font-size:32px; margin-bottom:8px;">✅</div>
          <h4>No immediate exams or quizzes due tomorrow</h4>
          <p>Upcoming tests will automatically trigger 1-day-before alerts here and via WhatsApp.</p>
        </div>
      `;
    } else {
      alertsContainer.innerHTML = upcomingExams.map(alertItem => {
        const asg = alertItem.assignment;
        return `
          <div class="card" style="border-left:5px solid var(--high-priority); margin-bottom:14px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px;">
              <div>
                <span class="due-badge urgent">🚨 1-Day Before Exam Alert</span>
                <span class="due-badge warning" style="margin-left:6px;">Due: ${asg.dueDate}</span>
                <h4 style="font-size:1.1rem; font-weight:800; margin:8px 0 4px 0;">${asg.title}</h4>
                <div style="font-size:0.85rem; font-weight:700; color:var(--primary);">${asg.subject}</div>
                <p style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">${asg.details || "Prepare notes and past papers."}</p>
              </div>
            </div>

            <!-- One-Tap Dispatch Buttons -->
            <div style="display:flex; gap:8px; margin-top:14px; flex-wrap:wrap;">
              <button type="button" class="btn-primary" style="background:#25d366; font-size:0.8rem; padding:7px 12px;" onclick="app.sendExamAlert('${asg.id}', 'father')">
                📱 Send to Father
              </button>
              <button type="button" class="btn-primary" style="background:#128c7e; font-size:0.8rem; padding:7px 12px;" onclick="app.sendExamAlert('${asg.id}', 'mother')">
                📱 Send to Mother
              </button>
              <button type="button" class="btn-primary" style="background:#075e54; font-size:0.8rem; padding:7px 12px;" onclick="app.sendExamAlert('${asg.id}', '${kid.id}')">
                📱 Send to Child (${kid.name.split(' ')[0]})
              </button>
              <button type="button" class="btn-secondary" style="font-size:0.8rem; padding:7px 12px;" onclick="app.copyExamSms('${asg.id}')">
                📋 Copy SMS
              </button>
            </div>
          </div>
        `;
      }).join("");
    }

    // Render registered family contacts
    if (contactsContainer) {
      const c = notifier.contacts;
      contactsContainer.innerHTML = `
        <div class="card">
          <div class="card-header-line">
            <h4>📱 Registered Family Mobile Numbers</h4>
            <button type="button" class="btn-secondary" style="font-size:0.78rem; padding:4px 10px;" onclick="app.openModal('modalEditContacts')">
              ✏ Edit Numbers
            </button>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:12px;">
            <div style="background:var(--bg-card-subtle); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
              <div style="font-size:0.78rem; color:var(--text-muted);">Father (Ghaith)</div>
              <div style="font-size:1rem; font-weight:800; color:var(--text-main);">${c.father.rawPhone}</div>
              <span style="font-size:0.75rem; color:#10b981; font-weight:700;">✓ WhatsApp Active</span>
            </div>
            <div style="background:var(--bg-card-subtle); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
              <div style="font-size:0.78rem; color:var(--text-muted);">Mother</div>
              <div style="font-size:1rem; font-weight:800; color:var(--text-main);">${c.mother.rawPhone}</div>
              <span style="font-size:0.75rem; color:#10b981; font-weight:700;">✓ WhatsApp Active</span>
            </div>
            <div style="background:var(--bg-card-subtle); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
              <div style="font-size:0.78rem; color:var(--text-muted);">Ryan</div>
              <div style="font-size:1rem; font-weight:800; color:var(--text-main);">${c.ryan?.rawPhone || 'Not set'}</div>
              <span style="font-size:0.75rem; color:var(--text-muted);">Child Mobile</span>
            </div>
            <div style="background:var(--bg-card-subtle); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
              <div style="font-size:0.78rem; color:var(--text-muted);">Jad</div>
              <div style="font-size:1rem; font-weight:800; color:var(--text-main);">${c.jad?.rawPhone || 'Not set'}</div>
              <span style="font-size:0.75rem; color:var(--text-muted);">Child Mobile</span>
            </div>
          </div>
        </div>
      `;
    }
  }

  sendExamAlert(asgId, recipientKey) {
    const kid = this.getActiveKid();
    const asg = (kid.assignments || []).find(a => a.id === asgId);
    if (!asg) return;

    const msg = notifier.formatExamWhatsAppMessage(kid, asg);
    const targetPhone = notifier.contacts[recipientKey]?.phone || notifier.contacts.father.phone;
    notifier.sendWhatsApp(targetPhone, msg);
  }

  copyExamSms(asgId) {
    const kid = this.getActiveKid();
    const asg = (kid.assignments || []).find(a => a.id === asgId);
    if (!asg) return;
    const msg = notifier.formatExamWhatsAppMessage(kid, asg);
    notifier.copyForSms(msg);
  }

  saveFamilyContactsForm(e) {
    e.preventDefault();
    const c = notifier.contacts;
    c.father.rawPhone = document.getElementById("contactFatherInput").value.trim();
    c.father.phone = c.father.rawPhone;
    c.mother.rawPhone = document.getElementById("contactMotherInput").value.trim();
    c.mother.phone = c.mother.rawPhone;
    c.ryan.rawPhone = document.getElementById("contactRyanInput").value.trim();
    c.ryan.phone = c.ryan.rawPhone;
    c.jad.rawPhone = document.getElementById("contactJadInput").value.trim();
    c.jad.phone = c.jad.rawPhone;

    notifier.saveContacts(c);
    this.closeModal("modalEditContacts");
    alert("✅ Family contact numbers saved successfully!");
    this.renderNotificationCenter();
  }


  // --- HELPER METHODS ---
  getSubjectIcon(kid, subjectName) {
    if (!kid || !kid.subjects) return "📘";
    const found = kid.subjects.find(s => s.name.toLowerCase() === (subjectName || "").toLowerCase());
    return found ? found.icon : "📘";
  }

  printChecklist() {
    const kid = this.getActiveKid();
    const studentBadge = document.getElementById("printStudentBadge");
    const dateStr = document.getElementById("printDateString");
    const nextDayKey = this.getNextSchoolDay(this.selectedDay);
    const dayDisplayName = this.selectedDay.charAt(0).toUpperCase() + this.selectedDay.slice(1);
    const nextDayDisplayName = nextDayKey.charAt(0).toUpperCase() + nextDayKey.slice(1);
    
    if (studentBadge && kid) {
      studentBadge.innerText = `${kid.name} • ${kid.grade} (Alliance Academy Jordan)`;
    }
    if (dateStr) {
      dateStr.innerText = `🌙 Prep Evening: ${dayDisplayName} Eve | 🎯 Ready for School Day: ${nextDayDisplayName} | 📅 ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    
    window.print();
  }

  exportData() {
    db.exportJSON();
  }

  importDataTrigger() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const success = db.importJSON(evt.target.result);
        if (success) {
          alert("Data restored successfully!");
          this.data = db.getData();
          this.init();
        } else {
          alert("Invalid backup file.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  // --- TAB 9: GAMIFICATION & REWARDS ---
  renderRewardsTab() {
    const kid = this.getActiveKid();
    const hero = document.getElementById("rewardsHeroBanner");
    const catalogGrid = document.getElementById("rewardsCatalogGrid");
    if (!hero || !catalogGrid) return;

    const rData = (typeof rewardsSystem !== "undefined") ? rewardsSystem.getKidData(kid.id) : { points: 100, streakDays: 3, badges: [] };
    const catalog = (typeof rewardsSystem !== "undefined") ? rewardsSystem.data.rewardsCatalog : [];

    hero.innerHTML = `
      <div>
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
          <span style="font-size:2.2rem;">🎮</span>
          <div>
            <h2 style="font-size:1.4rem; font-weight:800; color:#fff;">Study Champions & Rewards</h2>
            <p style="font-size:0.85rem; opacity:0.9;">Motivating ${kid.name} through daily study streaks and achievements.</p>
          </div>
        </div>
        <div class="badges-row">
          <span class="badge-chip">🏅 Homework Hero</span>
          <span class="badge-chip">🔥 ${rData.streakDays}-Day Streak</span>
          <span class="badge-chip">🎯 Focus Champion</span>
          <span class="badge-chip">📚 Cambridge Scholar</span>
        </div>
      </div>
      <div class="rewards-stats-grid">
        <div class="rewards-stat-box">
          <div class="rewards-stat-val">⭐ ${rData.points}</div>
          <div class="rewards-stat-lbl">Points Balance</div>
        </div>
        <div class="rewards-stat-box">
          <div class="rewards-stat-val">🔥 ${rData.streakDays}</div>
          <div class="rewards-stat-lbl">Daily Streak</div>
        </div>
      </div>
    `;

    catalogGrid.innerHTML = catalog.map(item => `
      <div class="reward-card">
        <div>
          <span class="reward-cost-tag">⭐ ${item.pointsCost} Points</span>
          <h4 style="font-size:1.05rem; font-weight:700; margin-bottom:8px;">${item.title}</h4>
          <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:16px;">
            Claim this family reward when you reach the required study points.
          </p>
        </div>
        <button type="button" class="btn-primary" style="width:100%; justify-content:center; ${rData.points < item.pointsCost ? 'opacity:0.6;' : ''}" onclick="app.claimReward('${item.id}')">
          ${rData.points >= item.pointsCost ? '🎁 Claim Reward' : `Locked (${item.pointsCost - rData.points} pts left)`}
        </button>
      </div>
    `).join("");
  }

  claimReward(rewardId) {
    if (typeof rewardsSystem !== "undefined") {
      rewardsSystem.claimReward(rewardId, this.activeKidId);
    }
  }

  saveNewReward(e) {
    e.preventDefault();
    const title = document.getElementById("rewardTitleInput").value.trim();
    const points = parseInt(document.getElementById("rewardPointsInput").value, 10);
    if (!title || !points) return;
    if (typeof rewardsSystem !== "undefined") {
      rewardsSystem.addCustomReward(title, points);
    }
    this.closeModal("modalAddReward");
    this.renderRewardsTab();
  }

  // --- TAB 10: PAST PAPERS & MOCK EXAMS HUB ---
  renderPastPapersTab() {
    const kid = this.getActiveKid();
    const container = document.getElementById("pastPapersListContainer");
    const heading = document.getElementById("pastPapersHeading");
    if (!container) return;

    if (heading) {
      heading.innerText = kid.id === "ryan" 
        ? "🎯 Cambridge Checkpoint & IGCSE Mock Exam Room (Ryan - Grade 8)"
        : "🎯 Upper Primary Exam Revision & Practice Sheets (Jad - Grade 5)";
    }

    const exams = (typeof examHub !== "undefined") ? examHub.getExamsList(kid.id) : [];

    container.innerHTML = exams.map(exam => {
      const isRyan = kid.id === "ryan";
      const unlocked = (this.unlockedKeys && this.unlockedKeys[exam.id]) || false;

      return `
        <div class="exam-card ${isRyan ? 'ryan-checkpoint' : 'jad-revision'}">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <span class="asg-type-badge ${isRyan ? 'Quiz' : 'Homework'}">${exam.subject}</span>
              <span class="badge-chip" style="font-size:0.75rem;">⏱ ${exam.durationMin} Minutes</span>
            </div>
            <h4 style="font-size:1.05rem; font-weight:800; margin-bottom:6px;">${exam.title}</h4>
            <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:14px;">
              Simulate actual examination timing with official Cambridge & school materials.
            </p>
          </div>

          <div>
            <div style="display:flex; gap:8px; margin-bottom:12px;">
              <button type="button" class="btn-primary" style="flex:1; justify-content:center;" onclick="app.startMockExam('${exam.id}', '${exam.paperFile}', '${exam.title.replace(/'/g, "\\'")}', ${exam.durationMin})">
                🚀 Start Mock Exam
              </button>
              <button type="button" class="btn-secondary" onclick="app.openDocumentPreview('${exam.paperFile}', '${exam.title.replace(/'/g, "\\'")}')" title="Preview Paper">
                👁
              </button>
            </div>

            <!-- Locked / Unlocked Answer Key -->
            ${unlocked ? `
              <div class="answer-key-unlocked">
                <span style="font-weight:700;">🔓 Official Answer Key Unlocked!</span>
                <button type="button" class="btn-secondary" style="font-size:0.75rem; padding:4px 8px;" onclick="app.openDocumentPreview('${exam.answerKeyFile}', 'Answer Key: ${exam.title.replace(/'/g, "\\'")}')">
                  View Key →
                </button>
              </div>
            ` : `
              <div class="answer-key-locked">
                <span>🔒 Official Answer Key (Locked)</span>
                <button type="button" style="background:none; border:none; color:var(--primary); font-size:0.78rem; font-weight:800; cursor:pointer;" onclick="app.unlockAnswerKey('${exam.id}')">
                  Unlock Key
                </button>
              </div>
            `}
          </div>
        </div>
      `;
    }).join("");
  }

  startMockExam(examId, paperFile, title, durationMin) {
    if (confirm(`Start timed Mock Exam: "${title}"?\n\nYou will have ${durationMin} minutes under exam conditions.`)) {
      if (typeof examHub !== "undefined") {
        examHub.startExam(examId, this.activeKidId);
      }
      this.openDocumentPreview(paperFile, title);
    }
  }

  unlockAnswerKey(examId) {
    if (!this.unlockedKeys) this.unlockedKeys = {};
    const code = prompt("Enter parent PIN to unlock Answer Key immediately (or type 'unlock'):", "");
    if (code) {
      this.unlockedKeys[examId] = true;
      this.renderPastPapersTab();
      alert("🔓 Official Teacher Answer Key unlocked!");
    }
  }

  // --- DOCUMENT PREVIEW MODAL ---
  openDocumentPreview(fileUrl, title) {
    const modal = document.getElementById("modalDocPreview");
    const container = document.getElementById("docPreviewContainer");
    const titleEl = document.getElementById("docPreviewTitle");
    const extLink = document.getElementById("docPreviewExternalLink");
    if (!modal || !container) return;

    if (titleEl) titleEl.innerText = `👁 ${title || 'Document Preview'}`;
    if (extLink) extLink.href = fileUrl;

    const lower = (fileUrl || "").toLowerCase();
    const isPdf = lower.includes(".pdf");
    const isWord = lower.includes(".docx") || lower.includes(".doc");
    const isPpt = lower.includes(".pptx") || lower.includes(".ppt");
    const isHttp = (fileUrl || "").startsWith("http");

    if (isPdf) {
      container.innerHTML = `
        <div style="display:flex; flex-direction:column; height:100%; gap:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-card-subtle); padding:8px 12px; border-radius:8px;">
            <span style="font-size:0.8rem; font-weight:700; color:var(--text-muted);">📄 Official School PDF</span>
            <div style="display:flex; gap:8px;">
              <a href="${fileUrl}" target="_blank" class="btn-xs-study" style="text-decoration:none; padding:4px 10px;">↗ Open Full Screen</a>
              <a href="${fileUrl}" download class="btn-xs-study" style="text-decoration:none; padding:4px 10px; background:var(--primary); color:#fff;">⬇ Download</a>
            </div>
          </div>
          <iframe class="doc-preview-iframe" src="${fileUrl}#toolbar=1" style="width:100%; height:550px; border:none; border-radius:8px;" title="${title}"></iframe>
        </div>
      `;
    } else if (isWord || isPpt) {
      const icon = isWord ? "📝" : "📊";
      const docType = isWord ? "Microsoft Word Worksheet" : "PowerPoint Presentation";
      const officeViewerUrl = isHttp 
        ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}` 
        : "";
      const googleDocsViewerUrl = isHttp 
        ? `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true` 
        : "";

      container.innerHTML = `
        <div class="doc-preview-fallback" style="padding:20px; text-align:center;">
          <div style="font-size: 52px; margin-bottom: 12px;">${icon}</div>
          <h3 style="margin-bottom: 6px;">${title}</h3>
          <p style="color: var(--text-muted); margin-bottom: 20px; font-size:0.88rem;">
            Official <strong>${docType}</strong> streamed directly from Alliance Academy Jordan LMS.
          </p>
          <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-bottom:16px;">
            <a href="${fileUrl}" target="_blank" class="btn-primary" style="padding:10px 18px; text-decoration:none; font-size:0.85rem; font-weight:700;">
              <span>⬇ Open School File</span>
            </a>
            ${isHttp ? `
              <a href="${officeViewerUrl}" target="_blank" class="btn-secondary" style="padding:10px 18px; text-decoration:none; font-size:0.85rem; font-weight:700;">
                <span>👁 View in Office Online</span>
              </a>
              <a href="${googleDocsViewerUrl}" target="_blank" class="btn-secondary" style="padding:10px 18px; text-decoration:none; font-size:0.85rem; font-weight:700;">
                <span>🌐 View in Google Docs</span>
              </a>
            ` : ""}
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted);">
            💡 Streams live from school server • Consumes 0 MB on mobile storage
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="doc-preview-fallback" style="padding:24px; text-align:center;">
          <div style="font-size: 52px; margin-bottom: 12px;">📄</div>
          <h3 style="margin-bottom: 6px;">${title}</h3>
          <p style="color: var(--text-muted); margin-bottom: 20px;">School Learning Material</p>
          <a href="${fileUrl}" target="_blank" class="btn-primary" style="padding:10px 20px; text-decoration:none;">
            <span>↗ Open Document</span>
          </a>
        </div>
      `;
    }

    this.openModal("modalDocPreview");
  }

  // --- CAMBRIDGE CHECKPOINT DISTINCTION TARGET ---
  getDaysUntilAprilCheckpoint() {
    const target = new Date("2027-04-15T09:00:00");
    const diff = target - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 170;
  }

  // --- OFFICIAL SCHOOL PDF VIEWER ---
  openOfficialPdf(kidId) {
    const targetKid = kidId || this.activeKidId;
    if (targetKid === "jad") {
      this.openDocumentPreview("data/Jad_WeekPlan_Oct24.pdf", "Jad's Official Weekly Plan (Grade 5 Primary)");
    } else {
      this.openDocumentPreview("data/Rayan_WeekPlan_Oct24.pdf", "Ryan's Official Weekly Plan (Grade 8 Checkpoint)");
    }
  }

  // --- AUTOMATED & ON-DEMAND LMS SYNC ---
  async syncSchoolLmsNow() {
    const btn = document.getElementById("btnSyncSchoolLms");
    const origHtml = btn ? btn.innerHTML : "";
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="spin">⏳</span> Connecting to LMS...`;
    }
    this.showToast("🔄 Connecting to Alliance Academy Jordan LMS API...");

    try {
      const res = await fetch("/api/sync-lms", { method: "POST" });
      const data = await res.json();
      if (data.status === "ok") {
        this.showToast("✅ <strong>LMS Sync Complete!</strong> Latest weekly plans downloaded.");
        setTimeout(() => window.location.reload(), 1400);
      } else {
        this.showToast("⚠️ LMS Sync: " + (data.message || "Completed"));
      }
    } catch (e) {
      this.showToast("⚠️ LMS sync initiated in background.");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origHtml;
      }
    }
  }

  // --- PARENT VOICE NOTES ON TASKS ---
  getVoiceNotes() {
    try {
      const fromDb = (this.data && this.data.voiceNotes) ? this.data.voiceNotes : {};
      const fromLocal = JSON.parse(localStorage.getItem("aaj_voice_notes") || "{}");
      return Object.assign({}, fromDb, fromLocal);
    } catch (e) {
      return (this.data && this.data.voiceNotes) || {};
    }
  }

  getVoiceNote(taskId) {
    return this.getVoiceNotes()[taskId];
  }

  async startVoiceRecording(taskId, taskTitle) {
    this.currentVoiceTaskId = taskId;
    const taskTitleEl = document.getElementById("voiceRecorderTaskTitle");
    if (taskTitleEl) taskTitleEl.innerText = `Task: ${taskTitle || 'Homework Instructions'}`;
    
    const timerEl = document.getElementById("voiceRecordingTimer");
    if (timerEl) timerEl.innerText = "00:00 / 00:15";

    this.openModal("modalVoiceRecorder");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.voiceStream = stream;
      this.mediaRecorder = new MediaRecorder(stream);
      this.voiceChunks = [];

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.voiceChunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        clearInterval(this.voiceTimerInterval);
        const audioBlob = new Blob(this.voiceChunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result;
          const user = db.getDeviceUser();
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          if (!this.data.voiceNotes) this.data.voiceNotes = {};
          this.data.voiceNotes[this.currentVoiceTaskId] = {
            audio: base64Data,
            from: user,
            timestamp: timestamp
          };

          const localNotes = JSON.parse(localStorage.getItem("aaj_voice_notes") || "{}");
          localNotes[this.currentVoiceTaskId] = this.data.voiceNotes[this.currentVoiceTaskId];
          localStorage.setItem("aaj_voice_notes", JSON.stringify(localNotes));

          db.pushVoiceNote(this.currentVoiceTaskId, base64Data);

          this.closeModal("modalVoiceRecorder");
          this.showToast("🎙️ Voice note saved & synced to all 3 mobiles!");

          if (this.isParentDashboardActive()) {
            this.renderParentExecutiveDashboard();
          } else {
            this.renderTodayChecklist();
          }
        };
        reader.readAsDataURL(audioBlob);
        if (this.voiceStream) {
          this.voiceStream.getTracks().forEach(t => t.stop());
        }
      };

      this.mediaRecorder.start();
      let seconds = 0;
      this.voiceTimerInterval = setInterval(() => {
        seconds++;
        if (timerEl) {
          const formatted = (seconds < 10 ? "0" : "") + seconds;
          timerEl.innerText = `00:${formatted} / 00:15`;
        }
        if (seconds >= 15) {
          this.stopAndSaveVoiceRecording();
        }
      }, 1000);

    } catch (err) {
      console.warn("Microphone access not available:", err);
      this.closeModal("modalVoiceRecorder");
      const noteText = prompt("Leave an encouragement or instruction note for this task:", "Read carefully and check your formulas!");
      if (noteText) {
        const user = db.getDeviceUser();
        if (!this.data.voiceNotes) this.data.voiceNotes = {};
        this.data.voiceNotes[this.currentVoiceTaskId] = {
          text: noteText,
          from: user,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const localNotes = JSON.parse(localStorage.getItem("aaj_voice_notes") || "{}");
        localNotes[this.currentVoiceTaskId] = this.data.voiceNotes[this.currentVoiceTaskId];
        localStorage.setItem("aaj_voice_notes", JSON.stringify(localNotes));

        if (this.isParentDashboardActive()) {
          this.renderParentExecutiveDashboard();
        } else {
          this.renderTodayChecklist();
        }
        this.showToast("📝 Note saved for your child!");
      }
    }
  }

  stopAndSaveVoiceRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.stop();
    }
  }

  cancelVoiceRecording() {
    clearInterval(this.voiceTimerInterval);
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.stop();
    }
    if (this.voiceStream) {
      this.voiceStream.getTracks().forEach(t => t.stop());
    }
    this.closeModal("modalVoiceRecorder");
  }

  playVoiceNote(taskId, btnEl) {
    const vn = this.getVoiceNote(taskId);
    if (!vn) return;

    if (this.activeVoiceAudio) {
      this.activeVoiceAudio.pause();
      this.activeVoiceAudio = null;
      document.querySelectorAll(".voice-pill-btn").forEach(b => b.classList.remove("is-playing"));
      if (this.activeVoiceTaskId === taskId) {
        this.activeVoiceTaskId = null;
        return;
      }
    }

    const audioSrc = vn.audio || vn.audioData;
    if (audioSrc) {
      const audio = new Audio(audioSrc);
      this.activeVoiceAudio = audio;
      this.activeVoiceTaskId = taskId;

      if (btnEl) btnEl.classList.add("is-playing");

      audio.onended = () => {
        if (btnEl) btnEl.classList.remove("is-playing");
        this.activeVoiceAudio = null;
        this.activeVoiceTaskId = null;
      };

      audio.onerror = () => {
        if (btnEl) btnEl.classList.remove("is-playing");
        this.activeVoiceAudio = null;
        this.activeVoiceTaskId = null;
      };

      audio.play().catch(e => console.warn("Audio play prevented:", e));
    } else if (vn.text) {
      alert(`📝 Parent Note (${vn.from || 'Parent'}): "${vn.text}"`);
    }
  }

  deleteVoiceNote(taskId) {
    if (!confirm("Are you sure you want to delete this voice note?")) return;
    if (this.data.voiceNotes) {
      delete this.data.voiceNotes[taskId];
    }
    const notes = JSON.parse(localStorage.getItem("aaj_voice_notes") || "{}");
    delete notes[taskId];
    localStorage.setItem("aaj_voice_notes", JSON.stringify(notes));

    if (this.isParentDashboardActive()) {
      this.renderParentExecutiveDashboard();
    } else {
      this.renderTodayChecklist();
    }
    this.showToast("🗑️ Voice note deleted");
  }

  // --- WHATSAPP DAILY DIGEST ---
  openWhatsAppDigestModal() {
    const kids = this.data.kids || [];
    const ryan = kids.find(k => k.id === "ryan") || kids[0];
    const jad = kids.find(k => k.id === "jad") || kids[1];
    const completedState = this.data.completedTasks || {};

    const summarizeKid = (kid) => {
      const days = (kid.weeklyPlan && kid.weeklyPlan.days) ? kid.weeklyPlan.days : {};
      const allTasks = [];
      Object.keys(days).forEach(d => {
        (days[d] || []).forEach((l, idx) => {
          const hw = l.exam || l.assignment || l.homework;
          if (hw && hw.trim().length > 0) {
            allTasks.push({
              title: hw,
              subject: l.subject,
              isExam: !!l.exam,
              done: !!completedState[`day_${d}_hw_${idx}`]
            });
          }
        });
      });
      (kid.assignments || []).forEach(a => {
        allTasks.push({
          title: a.title,
          subject: a.subject,
          isExam: a.type === "Quiz" || a.type === "Exam",
          done: a.status === "completed"
        });
      });
      const doneCount = allTasks.filter(t => t.done).length;
      const pending = allTasks.filter(t => !t.done);
      return { total: allTasks.length, done: doneCount, pending: pending };
    };

    const ryanSummary = summarizeKid(ryan);
    const jadSummary = summarizeKid(jad);

    const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
    const appUrl = "https://purposes-track-cons-casey.trycloudflare.com";

    let text = `🏫 *Alliance Academy Jordan (AAJ)*\n`;
    text += `📅 *Daily Study Digest • ${todayStr}*\n\n`;

    text += `👦 *Ryan (8th Grade Cambridge Checkpoint)*\n`;
    text += `✅ Progress: ${ryanSummary.done}/${ryanSummary.total} Done (${ryanSummary.total > 0 ? Math.round((ryanSummary.done / ryanSummary.total) * 100) : 100}%)\n`;
    if (ryanSummary.pending.length > 0) {
      text += `⚠️ *Pending Homework & Exams:*\n`;
      ryanSummary.pending.slice(0, 5).forEach(t => {
        text += `• ${t.isExam ? '🔴 [EXAM] ' : ''}[${t.subject}] ${t.title}\n`;
      });
      if (ryanSummary.pending.length > 5) {
        text += `• ... and ${ryanSummary.pending.length - 5} more items\n`;
      }
    } else {
      text += `🎉 All tasks completed for today! Awesome work!\n`;
    }
    text += `🎯 Checkpoint Distinction Goal: Band 6.0 (${this.getDaysUntilAprilCheckpoint()} Days to Checkpoint)\n\n`;

    text += `👦 *Jad (5th Grade Cambridge Primary)*\n`;
    text += `✅ Progress: ${jadSummary.done}/${jadSummary.total} Done (${jadSummary.total > 0 ? Math.round((jadSummary.done / jadSummary.total) * 100) : 100}%)\n`;
    if (jadSummary.pending.length > 0) {
      text += `⚠️ *Pending Homework:*\n`;
      jadSummary.pending.slice(0, 5).forEach(t => {
        text += `• ${t.isExam ? '🔴 [EXAM] ' : ''}[${t.subject}] ${t.title}\n`;
      });
      if (jadSummary.pending.length > 5) {
        text += `• ... and ${jadSummary.pending.length - 5} more items\n`;
      }
    } else {
      text += `🎉 All tasks completed for today! Awesome work!\n`;
    }

    text += `\n📱 *Open Live Study Hub (3-Phone Sync):*\n${appUrl}`;

    const preview = document.getElementById("whatsappDigestPreviewText");
    if (preview) preview.value = text;

    this.openModal("modalWhatsAppDigest");
  }

  dispatchWhatsApp(recipient) {
    const phones = {
      ryan: localStorage.getItem("contact_phone_ryan") || "",
      mother: localStorage.getItem("contact_phone_mother") || "",
      father: localStorage.getItem("contact_phone_father") || ""
    };

    let phone = phones[recipient] || "";
    if (!phone || recipient === "custom") {
      const defaultPhone = phone || "";
      const input = prompt("Enter WhatsApp phone number with country code:", defaultPhone);
      if (!input) return;
      phone = input.replace(/\D/g, "");
      if (recipient !== "custom") {
        localStorage.setItem(`contact_phone_${recipient}`, phone);
      }
    }

    const preview = document.getElementById("whatsappDigestPreviewText");
    const text = preview ? preview.value : "";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  copyDigestToClipboard() {
    const preview = document.getElementById("whatsappDigestPreviewText");
    if (!preview) return;
    navigator.clipboard.writeText(preview.value).then(() => {
      this.showToast("📋 WhatsApp digest copied to clipboard!");
    }).catch(() => {
      preview.select();
      document.execCommand("copy");
      this.showToast("📋 Copied to clipboard!");
    });
  }

  // --- CELEBRATION CHIME & CONFETTI ---
  triggerCelebration() {
    this.playCelebrationChime();
    this.launchConfetti();
    this.showToast("🎉 <strong>Outstanding Work!</strong> All homework & study items are 100% completed!");
  }

  playCelebrationChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 Fanfare
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.12);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.12 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + index * 0.12);
        osc.stop(ctx.currentTime + index * 0.12 + 0.45);
      });
    } catch (e) {
      console.warn("Celebration chime:", e);
    }
  }

  launchConfetti() {
    const canvas = document.getElementById("confettiCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = "block";

    const particles = [];
    const colors = ["#4f46e5", "#10b981", "#f59e0b", "#ec4899", "#3b82f6", "#8b5cf6", "#ef4444"];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 50,
        r: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngle: 0,
        tiltAngleInc: Math.random() * 0.07 + 0.05,
        speed: Math.random() * 3 + 2,
        opacity: 1
      });
    }

    let animationFrame;
    const startTime = Date.now();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = Date.now() - startTime;
      if (elapsed > 4000) {
        canvas.style.display = "none";
        cancelAnimationFrame(animationFrame);
        return;
      }

      particles.forEach(p => {
        p.tiltAngle += p.tiltAngleInc;
        p.y += p.speed;
        p.x += Math.sin(p.tiltAngle);
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });

      animationFrame = requestAnimationFrame(draw);
    };
    draw();
  }


  // --- MODAL CONTROLS & MANUAL ADD HANDLERS ---
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // If opening modalAddAssignment, populate subjects dropdown for active kid
    if (modalId === "modalAddAssignment") {
      const kid = this.getActiveKid();
      const select = document.getElementById("asgSubjectSelect");
      if (select && kid && kid.subjects) {
        select.innerHTML = kid.subjects.map(s => `
          <option value="${s.name}">${s.icon} ${s.name}</option>
        `).join("");
      }
      const dueDateInput = document.getElementById("asgDueDateInput");
      if (dueDateInput && !dueDateInput.value) {
        dueDateInput.value = new Date().toISOString().split("T")[0];
      }
    }
    
    modal.classList.add("active");
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("active");
    }
  }

  saveNewAssignment(e) {
    e.preventDefault();
    const kid = this.getActiveKid();
    if (!kid) return;

    const title = document.getElementById("asgTitleInput").value.trim();
    const subject = document.getElementById("asgSubjectSelect").value;
    const type = document.getElementById("asgTypeSelect").value;
    const dueDate = document.getElementById("asgDueDateInput").value;
    const priority = document.getElementById("asgPrioritySelect").value;
    const details = document.getElementById("asgDetailsInput").value.trim();

    if (!title || !dueDate) {
      alert("Please fill in the title and due date.");
      return;
    }

    if (!kid.assignments) kid.assignments = [];

    const newAsg = {
      id: "asg_custom_" + Date.now(),
      title: title,
      subject: subject,
      type: type,
      dueDate: dueDate,
      priority: priority,
      status: "pending",
      details: details,
      filesAttached: [],
      isCustom: true
    };

    kid.assignments.unshift(newAsg);
    db.saveData(this.data);

    this.closeModal("modalAddAssignment");
    document.getElementById("formAddAssignment").reset();

    this.renderKidBanner();
    this.renderTodayChecklist();
    if (this.activeTab === "assignments") {
      this.renderAssignments();
    }
    alert("✅ Task added successfully!");
  }

  saveNewEmail(e) {
    e.preventDefault();
    const kid = this.getActiveKid();
    if (!kid) return;

    const sender = document.getElementById("emailSenderInput").value.trim() || "Teacher / School Admin";
    const subject = document.getElementById("emailSubjectInput").value.trim();
    const date = document.getElementById("emailDateInput").value || new Date().toISOString().split("T")[0];
    const tag = document.getElementById("emailTagInput").value;
    const content = document.getElementById("emailContentInput").value.trim();

    if (!subject || !content) {
      alert("Please enter subject and message content.");
      return;
    }

    if (!kid.emailsAndNotes) kid.emailsAndNotes = [];

    const newNotice = {
      id: "em_custom_" + Date.now(),
      sender: sender,
      subject: subject,
      date: date,
      tag: tag,
      urgency: tag === "Exam Alert" ? "high" : "normal",
      content: content
    };

    kid.emailsAndNotes.unshift(newNotice);
    db.saveData(this.data);

    this.closeModal("modalAddEmail");
    document.getElementById("formAddEmail").reset();

    if (this.activeTab === "emails") {
      this.renderEmails();
    }
  }

  // --- NEXT-DAY SCHOOL BAG & 06:00-07:00 AM DEPARTURE CHECKER ---
  renderSchoolBagChecker() {
    const container = document.getElementById("schoolBagCheckerCard");
    const kid = this.getActiveKid();
    if (!container || !kid) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const isMorningRush = currentHour === 6 || (currentHour === 7 && currentMinute <= 15);
    const activeMode = this.bagViewMode || (isMorningRush ? "morning" : "evening");

    const nextDayKey = this.getNextSchoolDay(this.selectedDay);
    const nextDayDisplayName = nextDayKey.charAt(0).toUpperCase() + nextDayKey.slice(1);
    const days = (kid.weeklyPlan && kid.weeklyPlan.days) ? kid.weeklyPlan.days : {};
    const tomorrowLessons = days[nextDayKey] || [];
    const tomorrowSubjects = [...new Set(tomorrowLessons.map(l => l.subject))];

    const kidId = kid.id || "ryan";
    const bagState = this.data.schoolBag || {};

    let bagItems = [];
    let headerTitle = "";
    let headerSubtitle = "";
    let schedulePill = "";

    if (activeMode === "morning") {
      headerTitle = "🌅 Morning Departure Checklist (06:00 AM – 07:00 AM)";
      headerSubtitle = `Wakeup: 06:00 AM • Departure: 07:00 AM Sharp • Alliance Academy Jordan`;
      
      const minsRemaining = currentHour === 6 ? Math.max(0, 60 - currentMinute) : 0;
      schedulePill = currentHour === 6 
        ? `⏰ Departure at 07:00 AM (${minsRemaining}m left)` 
        : `🚀 School Transit / On Time!`;

      bagItems = [
        { id: `morn_lunch_${kidId}`, text: "🥪 Fresh Lunchbox & Morning Snack (Grab fresh from fridge)" },
        { id: `morn_water_${kidId}`, text: "💧 Fresh Cold Water Bottle (Filled and placed in side pocket)" },
        { id: `morn_bag_${kidId}`, text: "🎒 Packed School Bag & Homework Folders (Grab from desk/door)" },
        { id: `morn_uniform_${kidId}`, text: "👔 School Uniform & Alliance Academy Jordan ID Card / Badge" },
        { id: `morn_shoes_${kidId}`, text: "👟 School Shoes on & Jacket zipped (Ready to leave by 07:00 AM)" }
      ];
    } else {
      headerTitle = "🎒 Next-Day School Bag & Book Checker (Evening Routine)";
      headerSubtitle = `Packing for ${nextDayDisplayName} • Wakeup is 06:00 AM & departure 07:00 AM • Pack tonight for a calm morning!`;
      schedulePill = `🌙 Pack Tonight for ${nextDayDisplayName}`;

      // Daily Essentials
      bagItems.push({ id: `bag_pencils_${kidId}`, text: "✏️ Pencil Case (Blue & Black Pens, Pencils, Eraser, Sharpener)" });

      // Tomorrow's Subject Workbooks & Supplies
      tomorrowSubjects.forEach(subj => {
        const sLower = subj.toLowerCase();
        if (sLower.includes("math")) {
          bagItems.push({ id: `bag_math_${kidId}`, text: `${subj}: Cambridge Math Workbook & Geometry Protractor Set` });
        } else if (sLower.includes("science") || sLower.includes("biology") || sLower.includes("physic") || sLower.includes("chem")) {
          bagItems.push({ id: `bag_sci_${kidId}`, text: `${subj}: Science Coursebook & Lab Safety Notebook` });
        } else if (sLower.includes("eng")) {
          bagItems.push({ id: `bag_eng_${kidId}`, text: `${subj}: Cambridge English Anthology & Reading Notebook` });
        } else if (sLower.includes("arab")) {
          bagItems.push({ id: `bag_ar_${kidId}`, text: `${subj}: كتاب اللغة العربية ودفتر القواعد والتعبير` });
        } else if (sLower.includes("french") || sLower.includes("français")) {
          bagItems.push({ id: `bag_fr_${kidId}`, text: `${subj}: French Cahier d'activités & Vocabulary Book` });
        } else if (sLower.includes("social") || sLower.includes("history") || sLower.includes("geog")) {
          bagItems.push({ id: `bag_soc_${kidId}`, text: `${subj}: Jordan Social Studies & Atlas` });
        } else if (sLower.includes("p.e") || sLower.includes("sport") || sLower.includes("physical")) {
          bagItems.push({ id: `bag_pe_${kidId}`, text: `P.E. Physical Education: School Sports Uniform & Sports Shoes` });
        } else if (sLower.includes("art")) {
          bagItems.push({ id: `bag_art_${kidId}`, text: `Art Class: Sketchbook & Drawing Colors` });
        } else if (sLower.includes("comput") || sLower.includes("ict")) {
          bagItems.push({ id: `bag_ict_${kidId}`, text: `Computing: ICT Project Workbook & USB` });
        } else {
          bagItems.push({ id: `bag_${subj.replace(/\s+/g, '_')}_${kidId}`, text: `${subj}: Textbook & Homework Notebook` });
        }
      });
    }

    const packedCount = bagItems.filter(i => bagState[i.id] && bagState[i.id].checked).length;
    const isAllPacked = bagItems.length > 0 && packedCount === bagItems.length;

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:1.6rem;">${activeMode === 'morning' ? '🌅' : '🎒'}</span>
          <div>
            <h4 style="margin:0; font-size:1.05rem; font-weight:800; color:var(--text-main);">
              ${headerTitle}
            </h4>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
              ${headerSubtitle}
            </div>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <div class="parent-filter-pills">
            <button type="button" class="parent-filter-btn ${activeMode === 'morning' ? 'active' : ''}" onclick="app.setBagViewMode('morning')">
              🌅 06:00-07:00 AM Departure
            </button>
            <button type="button" class="parent-filter-btn ${activeMode === 'evening' ? 'active' : ''}" onclick="app.setBagViewMode('evening')">
              🌙 Evening Bag Packing
            </button>
          </div>

          <div style="font-size:0.78rem; font-weight:800; padding:4px 12px; border-radius:999px; background:${isAllPacked ? '#ecfdf5' : '#fffbeb'}; color:${isAllPacked ? '#065f46' : '#b45309'}; border:1px solid ${isAllPacked ? '#10b981' : '#f59e0b'};">
            ${isAllPacked ? "✓ 100% Ready!" : `${packedCount}/${bagItems.length} Ready`}
          </div>
        </div>
      </div>

      <!-- Schedule Reminder Banner -->
      <div style="background:${activeMode === 'morning' ? '#eff6ff' : '#f8fafc'}; border:1px solid ${activeMode === 'morning' ? '#bfdbfe' : '#e2e8f0'}; border-radius:8px; padding:6px 12px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; font-size:0.78rem; font-weight:700; color:${activeMode === 'morning' ? '#1e40af' : '#475569'};">
        <span>⏰ Schedule: Wakeup 06:00 AM • Departure 07:00 AM Sharp</span>
        <span>${schedulePill}</span>
      </div>

      <div class="bag-pack-grid">
        ${bagItems.map(item => {
          const isPacked = bagState[item.id] && bagState[item.id].checked;
          return `
            <div class="bag-pack-item ${isPacked ? 'packed' : ''}" onclick="app.toggleBagItem('${item.id}')">
              <div class="bag-checkbox-btn">${isPacked ? '✓' : ''}</div>
              <div style="flex:1; font-size:0.84rem; font-weight:700; color:var(--text-main); ${isPacked ? 'text-decoration:line-through; opacity:0.75;' : ''}">
                ${item.text}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  setBagViewMode(mode) {
    this.bagViewMode = mode;
    this.renderSchoolBagChecker();
  }

  toggleBagItem(itemId) {
    if (!this.data.schoolBag) this.data.schoolBag = {};
    const current = this.data.schoolBag[itemId] && this.data.schoolBag[itemId].checked;
    const newChecked = !current;
    this.data.schoolBag[itemId] = {
      checked: newChecked,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    db.pushBagItemToggle(itemId, newChecked);
    db.saveData(this.data);
    this.renderSchoolBagChecker();
    if (newChecked) {
      this.showToast("🎒 Item marked ready!");
    }
  }

  // --- "ASK DAD / ASK MOM" HOMEWORK HELP PING ---
  requestHelpOnTask(taskId, taskTitle, subject) {
    const kid = this.getActiveKid();
    const kidName = kid ? kid.name : "Ryan";
    const note = prompt(`❓ What question or step do you need help with in [${subject}]?`, "I'm stuck on this problem. Can you explain how to solve it?");
    if (!note) return;

    if (!this.data.helpRequests) this.data.helpRequests = {};
    this.data.helpRequests[taskId] = {
      kid: kidName,
      title: taskTitle,
      subject: subject,
      note: note,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    db.pushHelpRequest(taskId, kidName, taskTitle, subject, note);
    db.saveData(this.data);
    this.renderTodayChecklist();
    this.showToast(`🚨 Help request sent to Father & Mother's phones! They can see it instantly.`);
  }

  resolveHelpRequest(taskId) {
    if (this.data.helpRequests && this.data.helpRequests[taskId]) {
      delete this.data.helpRequests[taskId];
    }
    db.pushResolveHelp(taskId);
    db.saveData(this.data);
    if (this.isParentDashboardActive()) {
      this.renderParentExecutiveDashboard();
    } else {
      this.renderTodayChecklist();
    }
    this.showToast("✅ Marked help request as assisted!");
  }

  // --- SUNDAY WEEKLY STUDY & CAMBRIDGE REPORT CARD ---
  openWeeklyReportCardModal() {
    const kids = this.data.kids || [];
    const ryan = kids.find(k => k.id === "ryan") || kids[0];
    const jad = kids.find(k => k.id === "jad") || kids[1];
    const completedState = this.data.completedTasks || {};

    const calcKidStats = (kid) => {
      const days = (kid.weeklyPlan && kid.weeklyPlan.days) ? kid.weeklyPlan.days : {};
      let total = 0;
      let done = 0;
      Object.keys(days).forEach(d => {
        (days[d] || []).forEach((l, idx) => {
          if (l.exam || l.assignment || l.homework) {
            total++;
            if (completedState[`day_${d}_hw_${idx}`]) done++;
          }
        });
      });
      (kid.assignments || []).forEach(a => {
        total++;
        if (a.status === "completed") done++;
      });
      const pct = total > 0 ? Math.round((done / total) * 100) : 100;
      return { total, done, pct };
    };

    const rStats = calcKidStats(ryan);
    const jStats = calcKidStats(jad);

    const container = document.getElementById("weeklyReportCardBody");
    if (!container) return;

    container.innerHTML = `
      <div style="text-align:center; margin-bottom:16px;">
        <div style="font-size:2.2rem; margin-bottom:4px;">🏆</div>
        <h3 style="margin:0; font-size:1.2rem; font-weight:800; color:var(--text-main);">
          Alliance Academy Jordan • Weekly Study Report
        </h3>
        <p style="font-size:0.8rem; color:var(--text-muted); margin:4px 0 0 0;">
          Dual-Student Academic & Checkpoint Readiness Summary
        </p>
      </div>

      <!-- Ryan Section -->
      <div class="report-kid-summary" style="border-left:4px solid #4f46e5;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <div>
            <strong style="font-size:1rem; color:#4f46e5;">👦 Ryan</strong>
            <div style="font-size:0.75rem; color:var(--text-muted);">8th Grade Cambridge Lower Secondary Checkpoint</div>
          </div>
          <span style="font-size:0.8rem; font-weight:800; background:#e0e7ff; color:#3730a3; padding:3px 10px; border-radius:999px;">
            ${rStats.pct}% Weekly Completion
          </span>
        </div>
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px;">
          <div class="report-metric-box">
            <div style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">Tasks Done</div>
            <div style="font-size:1.2rem; font-weight:900; color:var(--text-main);">${rStats.done}/${rStats.total}</div>
          </div>
          <div class="report-metric-box">
            <div style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">Checkpoint Band</div>
            <div style="font-size:1.2rem; font-weight:900; color:#4f46e5;">6.0 Goal</div>
          </div>
          <div class="report-metric-box">
            <div style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">Consistency</div>
            <div style="font-size:1.2rem; font-weight:900; color:#10b981;">5-Day 🔥</div>
          </div>
        </div>
      </div>

      <!-- Jad Section -->
      <div class="report-kid-summary" style="border-left:4px solid #059669;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <div>
            <strong style="font-size:1rem; color:#059669;">👦 Jad</strong>
            <div style="font-size:0.75rem; color:var(--text-muted);">5th Grade Cambridge Primary (CP)</div>
          </div>
          <span style="font-size:0.8rem; font-weight:800; background:#dcfce7; color:#166534; padding:3px 10px; border-radius:999px;">
            ${jStats.pct}% Weekly Completion
          </span>
        </div>
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px;">
          <div class="report-metric-box">
            <div style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">Tasks Done</div>
            <div style="font-size:1.2rem; font-weight:900; color:var(--text-main);">${jStats.done}/${jStats.total}</div>
          </div>
          <div class="report-metric-box">
            <div style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">Honors Level</div>
            <div style="font-size:1.2rem; font-weight:900; color:#059669;">Grade 5 ⭐</div>
          </div>
          <div class="report-metric-box">
            <div style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">Study Routine</div>
            <div style="font-size:1.2rem; font-weight:900; color:#10b981;">Active 🌟</div>
          </div>
        </div>
      </div>
    `;

    this.openModal("modalWeeklyReportCard");
  }

  getWeeklyReportText() {
    const kids = this.data.kids || [];
    const ryan = kids.find(k => k.id === "ryan") || kids[0];
    const jad = kids.find(k => k.id === "jad") || kids[1];
    const completedState = this.data.completedTasks || {};

    const calc = (kid) => {
      const days = (kid.weeklyPlan && kid.weeklyPlan.days) ? kid.weeklyPlan.days : {};
      let total = 0, done = 0;
      Object.keys(days).forEach(d => {
        (days[d] || []).forEach((l, idx) => {
          if (l.exam || l.assignment || l.homework) {
            total++;
            if (completedState[`day_${d}_hw_${idx}`]) done++;
          }
        });
      });
      (kid.assignments || []).forEach(a => {
        total++;
        if (a.status === "completed") done++;
      });
      return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 100 };
    };

    const r = calc(ryan);
    const j = calc(jad);

    let msg = `🏆 *Alliance Academy Jordan (AAJ) - Sunday Family Report Card*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    msg += `👦 *Ryan (8th Grade Cambridge Checkpoint):*\n`;
    msg += `• Completion: ${r.done}/${r.total} Tasks (${r.pct}%)\n`;
    msg += `• Target: Cambridge Checkpoint Distinction 6.0\n`;
    msg += `• Status: On track for April Checkpoint Exams! 🎓\n\n`;

    msg += `👦 *Jad (5th Grade Cambridge Primary):*\n`;
    msg += `• Completion: ${j.done}/${j.total} Tasks (${j.pct}%)\n`;
    msg += `• Status: Cambridge Primary Stage 5 Honors! ⭐\n\n`;

    msg += `👨‍👩‍👦 *Family Study Hub (Live Sync):*\n`;
    msg += `https://purposes-track-cons-casey.trycloudflare.com`;
    return msg;
  }

  dispatchWeeklyReportWhatsApp() {
    const text = this.getWeeklyReportText();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  // --- SNAP & CHECK HOMEWORK PHOTO ATTACHMENTS ---
  triggerPhotoCapture(taskId, taskTitle) {
    this.activePhotoUploadTaskId = taskId;
    this.activePhotoUploadTaskTitle = taskTitle;
    const fileInput = document.getElementById("cameraPhotoInput");
    if (fileInput) {
      fileInput.value = "";
      fileInput.click();
    }
  }

  handlePhotoUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file || !this.activePhotoUploadTaskId) return;

    const taskId = this.activePhotoUploadTaskId;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Compress using off-screen canvas (max 1200px width/height, JPEG 0.78)
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.78);

        // Save locally and push to sync server
        const local = db.getData();
        if (!local.taskPhotos) local.taskPhotos = {};
        local.taskPhotos[taskId] = {
          photoData: compressedDataUrl,
          uploadedBy: db.getDeviceUser(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        db.saveData(local);
        db.pushTaskPhoto(taskId, compressedDataUrl);

        this.showToast("📸 Workbook photo attached & synced to family phones!");
        this.renderTodayChecklist();
        if (this.isParentDashboardActive()) {
          this.renderParentExecutiveDashboard();
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  openPhotoLightbox(taskId, photoData, title) {
    this.currentLightboxPhoto = { taskId, photoData, title };
    const modal = document.getElementById("modalPhotoLightbox");
    const imgEl = document.getElementById("photoLightboxImg");
    const titleEl = document.getElementById("photoLightboxTitle");
    const metaEl = document.getElementById("photoLightboxMeta");

    if (imgEl) imgEl.src = photoData;
    if (titleEl) titleEl.innerText = `📸 Homework Page: ${title}`;
    const photo = db.getTaskPhoto(taskId);
    if (metaEl && photo) {
      metaEl.innerText = `Uploaded by ${photo.uploadedBy || 'Child'} at ${photo.time || 'recently'}`;
    }
    if (modal) modal.classList.add("active");
  }

  closePhotoLightbox() {
    const modal = document.getElementById("modalPhotoLightbox");
    if (modal) modal.classList.remove("active");
  }

  downloadActivePhoto() {
    if (!this.currentLightboxPhoto) return;
    const a = document.createElement("a");
    a.href = this.currentLightboxPhoto.photoData;
    a.download = `Workbook_${this.currentLightboxPhoto.taskId}.jpg`;
    a.click();
  }

  // --- 09:00 PM BEDTIME WRAP-UP ---
  dispatchBedtimeWrapup() {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    const msg = `🌙 *Alliance Academy Jordan - 09:00 PM Bedtime Wrap-Up*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📅 *Date:* ${today} (Nightly Routine)\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👦 *Ryan (8th Grade Cambridge Checkpoint):* Homework checked & bag ready\n` +
      `👦 *Jad (5th Grade Cambridge Primary):* English vocabulary drilled & school bag packed\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `⏰ *Tomorrow Morning Schedule:*\n` +
      `• 06:00 AM: Wakeup & Morning routine\n` +
      `• 06:40 AM: Fresh lunchbox from fridge\n` +
      `• 07:00 AM: Departure for AAJ School\n\n` +
      `Rest well and get good sleep, champions! 🌟\n` +
      `📱 *Study Hub:* https://purposes-track-cons-casey.trycloudflare.com`;

    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    this.showToast("🌙 Bedtime wrap-up opened in WhatsApp!");
  }

  // --- RESET ALL TASKS TO PENDING ---
  resetAllTasksToPending() {
    if (!confirm("Are you sure you want to reset all tasks back to pending for today?")) return;
    const local = db.getData();
    local.completedTasks = {};
    db.saveData(local);
    db.pushFullMerge({});
    this.showToast("↩️ All tasks reset to pending!");
    this.renderTodayChecklist();
    if (this.isParentDashboardActive()) {
      this.renderParentExecutiveDashboard();
    }
  }

  bindGlobalEvents() {
    // Close modal on click outside
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.classList.remove("active");
        }
      });
    });
  }
}

// Instantiate global app instance once DOM is loaded
let app = null;
function startStudyApp() {
  if (app) return;
  try {
    console.log("Starting StudyApp...");
    app = new StudyApp();
    window.app = app;
  } catch (err) {
    console.error("FATAL ERROR initializing StudyApp:", err);
    var errBox = document.createElement("div");
    errBox.id = "fatal_init_error";
    errBox.style.cssText = "position:fixed; top:0; left:0; width:100%; background:#fee2e2; color:#b91c1c; border-bottom:3px solid #ef4444; padding:20px; z-index:999999; font-size:16px; font-weight:bold;";
    errBox.innerHTML = "⚠️ App Initialization Failed: " + (err.stack ? err.stack.replace(/\n/g, "<br>") : err.message);
    if (document.body) {
      document.body.prepend(errBox);
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startStudyApp);
} else {
  startStudyApp();
}
