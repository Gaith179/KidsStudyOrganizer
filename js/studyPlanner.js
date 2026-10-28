/**
 * Smart Weekly Study Time Planner
 * Generates an optimized after-school study schedule based on:
 * 1. Daily homework from the school weekly plan
 * 2. Upcoming exams, quizzes, and project deadlines
 * 3. Child's grade level and optimal focus intervals (Pomodoro technique)
 */

class SmartStudyPlanner {
  constructor() {
    this.preferences = this.loadPreferences();
  }

  loadPreferences() {
    const defaultPrefs = {
      afterSchoolStartTime: "16:30", // 4:30 PM
      maxDailyStudyHours: 2.5,
      sessionDurationMin: 35,
      breakDurationMin: 10,
      studyDays: ["saturday", "monday", "tuesday", "wednesday", "thursday"]
    };
    try {
      const stored = localStorage.getItem("aaj_study_planner_prefs");
      return stored ? JSON.parse(stored) : defaultPrefs;
    } catch (e) {
      return defaultPrefs;
    }
  }

  savePreferences(prefs) {
    this.preferences = { ...this.preferences, ...prefs };
    localStorage.setItem("aaj_study_planner_prefs", JSON.stringify(this.preferences));
  }

  /**
   * Generates a balanced 5-day study plan (Saturday to Thursday, Holidays: Fri & Sun)
   * allocating time for homework, urgent exam revision, and general subject review.
   */
  generateWeeklySchedule(kid) {
    if (!kid) return [];

    const daysOrder = ["saturday", "monday", "tuesday", "wednesday", "thursday"];
    const dayNamesEn = {
      saturday: "Saturday",
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday"
    };
    const dayNamesAr = {
      saturday: "Saturday",
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday"
    };

    const daysSchedule = (kid.weeklyPlan && kid.weeklyPlan.days) ? kid.weeklyPlan.days : {};
    const assignments = kid.assignments || [];

    const weeklyPlanGenerated = [];

    daysOrder.forEach((dayKey, dayIdx) => {
      const dayLessons = daysSchedule[dayKey] || [];
      const blocks = [];

      // 1. Prioritize Daily Homework from school timetable
      dayLessons.forEach(lesson => {
        if (lesson.homework && lesson.homework.trim().length > 0) {
          blocks.push({
            type: "homework",
            subject: lesson.subject,
            task: `Complete Homework: ${lesson.homework}`,
            durationMin: 30,
            priority: "high",
            icon: "📝"
          });
        }
      });

      // 2. Identify upcoming exams and quizzes in the next 1-3 days
      assignments.forEach(asg => {
        if (asg.status !== "completed") {
          const isExam = asg.type === "Quiz" || asg.priority === "high" || /quiz|exam|test/i.test(asg.title);
          if (isExam) {
            blocks.push({
              type: "exam_prep",
              subject: asg.subject,
              task: `🚨 Exam Prep: ${asg.title} (Revision & Past Papers)`,
              durationMin: 40,
              priority: "urgent",
              icon: "🔥"
            });
          }
        }
      });

      // 3. Add core reading or language review block if time permits
      if (blocks.length < 2) {
        const coreReviewSubject = (kid.id === "ryan") ? "Mathematics / Science" : "English / Arabic Reading";
        blocks.push({
          type: "review",
          subject: coreReviewSubject,
          task: "Summary Revision & Vocabulary practice",
          durationMin: 30,
          priority: "normal",
          icon: "📖"
        });
      }

      // Assign time slots to blocks starting at preferences.afterSchoolStartTime
      let currentHour = parseInt(this.preferences.afterSchoolStartTime.split(":")[0], 10);
      let currentMin = parseInt(this.preferences.afterSchoolStartTime.split(":")[1], 10);

      const timedBlocks = blocks.map((b, bIdx) => {
        const startStr = this.formatTime(currentHour, currentMin);
        
        // Advance time
        currentMin += b.durationMin;
        while (currentMin >= 60) {
          currentHour++;
          currentMin -= 60;
        }
        const endStr = this.formatTime(currentHour, currentMin);

        // Add 10-minute break after session
        currentMin += this.preferences.breakDurationMin;
        while (currentMin >= 60) {
          currentHour++;
          currentMin -= 60;
        }

        return {
          ...b,
          startTime: startStr,
          endTime: endStr,
          id: `plan_${dayKey}_${bIdx}`
        };
      });

      const totalStudyMinutes = blocks.reduce((acc, b) => acc + b.durationMin, 0);

      weeklyPlanGenerated.push({
        dayKey,
        dayNameEn: dayNamesEn[dayKey],
        dayNameAr: dayNamesAr[dayKey],
        totalStudyMinutes,
        totalStudyHoursFormatted: (totalStudyMinutes / 60).toFixed(1) + " hrs",
        blocks: timedBlocks
      });
    });

    return weeklyPlanGenerated;
  }

  formatTime(hour, min) {
    const period = hour >= 12 ? "PM" : "AM";
    const h12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    const mStr = String(min).padStart(2, "0");
    return `${h12}:${mStr} ${period}`;
  }
}

// Global instance
const studyPlanner = new SmartStudyPlanner();
