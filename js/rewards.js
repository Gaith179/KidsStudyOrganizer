/**
 * Kids Study Hub - Gamification & Rewards System
 * Encourages daily study habits, task completion, and focus streaks
 */

class StudyRewardsSystem {
  constructor() {
    this.data = this.loadRewardsData();
  }

  loadRewardsData() {
    const defaultData = {
      ryan: {
        points: 320,
        streakDays: 4,
        lastCompletedDate: new Date().toISOString().split("T")[0],
        badges: ["homework_hero", "streak_starter", "focus_champion"]
      },
      jad: {
        points: 410,
        streakDays: 5,
        lastCompletedDate: new Date().toISOString().split("T")[0],
        badges: ["homework_hero", "streak_starter", "story_writer", "star_reader"]
      },
      rewardsCatalog: [
        { id: "rew_1", title: "🎮 1 Hour Extra Gaming / iPad Time", pointsCost: 250, claimed: false },
        { id: "rew_2", title: "🍕 Choose Friday Family Dinner", pointsCost: 350, claimed: false },
        { id: "rew_3", title: "🎬 Weekend Cinema / Fun Outing", pointsCost: 500, claimed: false },
        { id: "rew_4", title: "🍦 Special Ice Cream Treat", pointsCost: 150, claimed: false }
      ]
    };

    try {
      const stored = localStorage.getItem("aaj_study_rewards_data");
      return stored ? JSON.parse(stored) : defaultData;
    } catch (e) {
      return defaultData;
    }
  }

  saveData() {
    localStorage.setItem("aaj_study_rewards_data", JSON.stringify(this.data));
  }

  getKidData(kidId) {
    if (!this.data[kidId]) {
      this.data[kidId] = {
        points: 100,
        streakDays: 1,
        lastCompletedDate: new Date().toISOString().split("T")[0],
        badges: ["streak_starter"]
      };
      this.saveData();
    }
    return this.data[kidId];
  }

  awardPoints(kidId, points, reason) {
    const kid = this.getKidData(kidId);
    kid.points += points;
    this.saveData();

    // Trigger celebration toast
    if (window.app) {
      this.showRewardCelebration(`🎉 +${points} Points! (${reason})`);
      window.app.renderKidBanner();
      if (window.app.activeTab === "rewards") {
        window.app.renderRewardsTab();
      }
    }
  }

  addPoints(kidId, points, reason) {
    return this.awardPoints(kidId, points, reason);
  }

  claimReward(rewardId, kidId) {
    const kid = this.getKidData(kidId);
    const reward = this.data.rewardsCatalog.find(r => r.id === rewardId);
    if (!reward) return;

    if (kid.points < reward.pointsCost) {
      alert(`⚠️ You need ${reward.pointsCost - kid.points} more points to claim this reward! Keep studying!`);
      return;
    }

    if (confirm(`Claim "${reward.title}" for ${reward.pointsCost} points?`)) {
      kid.points -= reward.pointsCost;
      this.saveData();
      alert(`🎉 Congratulations! You claimed: ${reward.title}. Show this to Mom and Dad!`);
      if (window.app) {
        window.app.renderKidBanner();
        window.app.renderRewardsTab();
      }
    }
  }

  addCustomReward(title, pointsCost) {
    this.data.rewardsCatalog.push({
      id: "rew_" + Date.now(),
      title: title,
      pointsCost: parseInt(pointsCost, 10) || 200,
      claimed: false
    });
    this.saveData();
  }

  showRewardCelebration(message) {
    let toast = document.getElementById("rewardToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "rewardToast";
      toast.style.cssText = `
        position: fixed;
        top: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: #fff;
        padding: 14px 26px;
        border-radius: 999px;
        font-weight: 800;
        font-size: 1rem;
        box-shadow: 0 10px 30px rgba(245, 158, 11, 0.4);
        z-index: 99999;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        opacity: 0;
      `;
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>🌟</span> <span>${message}</span>`;
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";

    // Synthesize victory chime
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.3); // C6
      gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {}

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(-20px)";
    }, 3500);
  }
}

// Global rewards instances (for compatibility with app.js, quizzer.js, vocabHub.js, pastPapers.js)
const rewards = new StudyRewardsSystem();
const rewardsSystem = rewards;
window.rewards = rewards;
window.rewardsSystem = rewards;
