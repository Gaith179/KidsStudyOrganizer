/**
 * WhatsApp & SMS Notifications & Exam Reminder Service
 * Dispatches alerts to Father, Mother, and Child mobiles
 */

class NotificationService {
  constructor() {
    this.contacts = this.loadContacts();
    this.settings = this.loadSettings();
  }

  loadContacts() {
    const defaultContacts = {
      father: {
        name: "Father",
        phone: localStorage.getItem("contact_phone_father") || "",
        rawPhone: localStorage.getItem("contact_phone_father_raw") || "",
        enabled: true
      },
      mother: {
        name: "Mother",
        phone: localStorage.getItem("contact_phone_mother") || "",
        rawPhone: localStorage.getItem("contact_phone_mother_raw") || "",
        enabled: true
      },
      ryan: {
        name: "Ryan",
        phone: localStorage.getItem("contact_phone_ryan") || "",
        rawPhone: localStorage.getItem("contact_phone_ryan_raw") || "",
        enabled: true
      },
      jad: {
        name: "Jad",
        phone: localStorage.getItem("contact_phone_jad") || "",
        rawPhone: localStorage.getItem("contact_phone_jad_raw") || "",
        enabled: false
      }
    };

    try {
      const stored = localStorage.getItem("aaj_family_contacts");
      return stored ? JSON.parse(stored) : defaultContacts;
    } catch (e) {
      return defaultContacts;
    }
  }

  saveContacts(contacts) {
    this.contacts = contacts;
    localStorage.setItem("aaj_family_contacts", JSON.stringify(contacts));
  }

  loadSettings() {
    const defaultSettings = {
      remind1DayBeforeExam: true,
      notifyNewAssignments: true,
      dailyScheduleMorningAlert: true,
      webhookUrl: localStorage.getItem("aaj_whatsapp_webhook") || ""
    };
    try {
      const stored = localStorage.getItem("aaj_notification_settings");
      return stored ? JSON.parse(stored) : defaultSettings;
    } catch (e) {
      return defaultSettings;
    }
  }

  saveSettings(settings) {
    this.settings = settings;
    localStorage.setItem("aaj_notification_settings", JSON.stringify(settings));
  }

  /**
   * Identifies all exams, quizzes, or assignments due within the next 24 to 48 hours
   */
  getUpcomingExamAlerts(kid) {
    if (!kid || !kid.assignments) return [];

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const todayStr = today.toISOString().split("T")[0];
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const alerts = [];

    kid.assignments.forEach(asg => {
      if (asg.status !== "completed") {
        const isExam = asg.type === "Quiz" || asg.priority === "high" || /quiz|exam|test/i.test(asg.title);
        // Due today or tomorrow
        const isDueSoon = (asg.dueDate === tomorrowStr || asg.dueDate === todayStr || asg.priority === "high");

        if (isDueSoon || isExam) {
          alerts.push({
            assignment: asg,
            kid: kid,
            isTomorrow: (asg.dueDate === tomorrowStr),
            isToday: (asg.dueDate === todayStr),
            isUrgent: true
          });
        }
      }
    });

    return alerts;
  }

  /**
   * Generates a beautifully formatted WhatsApp message for upcoming exam
   */
  formatExamWhatsAppMessage(kid, asg) {
    const kidName = kid.name || (kid.id === "ryan" ? "Ryan" : "Jad");
    const dateText = asg.dueDate || "Tomorrow";
    
    return `🚨 *Alliance Academy Jordan (AAJ) - Exam Reminder* 🚨
━━━━━━━━━━━━━━━━━
👨‍🎓 *Student:* ${kidName}
📚 *Subject:* ${asg.subject}
🎯 *Exam / Quiz:* ${asg.title}
📅 *Due Date / Exam Date:* ${dateText}
🔥 *Priority:* ${asg.priority === 'high' ? 'High / Urgent' : 'Normal'}
━━━━━━━━━━━━━━━━━
📝 *Teacher Instructions & Details:*
${asg.details || "Please review chapters, notes, and attached worksheets."}

⏰ *Tonight's Recommendation:* Allocate 45 minutes to practice past papers and solve revision sheets.
━━━━━━━━━━━━━━━━━
_Sent via Kids Study Hub (Multi-Device Family Sync)_`;
  }

  /**
   * Formats a daily study schedule summary for WhatsApp
   */
  formatDailyPlanWhatsAppMessage(kid, dayPlan) {
    const kidName = kid.name || (kid.id === "ryan" ? "Ryan" : "Jad");
    let tasksList = "";

    if (dayPlan && dayPlan.blocks) {
      tasksList = dayPlan.blocks.map(b => `⏱ *${b.startTime} - ${b.endTime}:* ${b.icon} ${b.subject}\n   └ ${b.task}`).join("\n\n");
    }

    return `📅 *Daily Study Schedule - ${dayPlan ? dayPlan.dayNameEn : "Today"}*
👨‍🎓 *Student:* ${kidName}
━━━━━━━━━━━━━━━━━
${tasksList || "Review daily subjects and complete homework tasks."}
━━━━━━━━━━━━━━━━━
💡 *Total Scheduled Study Time:* ${dayPlan ? dayPlan.totalStudyHoursFormatted : "1.5 hrs"}
_Wishing you outstanding focus and great success!_`;
  }

  /**
   * Open WhatsApp with pre-filled message for specific phone number
   */
  sendWhatsApp(phone, message) {
    // Format phone to international without leading zeros or plus
    let cleanPhone = String(phone).replace(/[^\d]/g, "");
    if (cleanPhone.startsWith("07")) {
      cleanPhone = "962" + cleanPhone.substring(1);
    }

    const encodedText = encodeURIComponent(message);
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    window.open(url, "_blank");
  }

  /**
   * Copies message to clipboard for SMS
   */
  copyForSms(message) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message).then(() => {
        alert("✅ Message copied to clipboard! You can paste it into SMS now.");
      });
    } else {
      const ta = document.createElement("textarea");
      ta.value = message;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      alert("✅ Message copied to clipboard! You can paste it into SMS now.");
    }
  }
}

// Global instance
const notifier = new NotificationService();
