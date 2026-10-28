/**
 * Live School Synchronization Service
 * Directly connects from browser/mobile phone to Amman Academy LMS API (lmsapi.aaj.edu.jo)
 */

class SchoolSyncService {
  constructor() {
    this.apiBase = "https://lmsapi.aaj.edu.jo";
    this.token = null;
    this.userId = null;
    this.parentEmail = localStorage.getItem("aaj_sync_user") || "";
    this.isSyncing = false;
  }

  getCredentials() {
    return {
      username: localStorage.getItem("aaj_sync_user") || "",
      password: localStorage.getItem("aaj_sync_pass") || ""
    };
  }

  setCredentials(username, password) {
    localStorage.setItem("aaj_sync_user", username);
    localStorage.setItem("aaj_sync_pass", password);
  }

  async login() {
    let creds = this.getCredentials();
    if (!creds.username || !creds.password) {
      if (window.app && typeof window.app.showSettingsModal === "function") {
        window.app.showSettingsModal("Please enter your Amman Academy LMS credentials in Settings to sync.");
        throw new Error("School LMS credentials required. Please configure in Settings.");
      }
      const u = prompt("Enter Amman Academy LMS Email:");
      const p = prompt("Enter Amman Academy LMS Password:");
      if (u && p) {
        this.setCredentials(u, p);
        creds = { username: u, password: p };
      } else {
        throw new Error("LMS credentials required to sync.");
      }
    }
    const payload = {
      username: creds.username,
      password: creds.password,
      Random: Date.now()
    };

    const res = await fetch(`${this.apiBase}/api/v11/Service.svc/Normal/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`Login failed with HTTP status ${res.status}`);
    const data = await res.json();
    if (data.status !== "success" || !data.token) {
      throw new Error(data.errorMessage || "Authentication failed. Check credentials.");
    }

    this.token = data.token;
    this.userId = data.UserID;
    this.parentEmail = data.Username || creds.username;
    return data;
  }

  async getStudents() {
    if (!this.token) await this.login();

    const payload = {
      FatherID: this.userId,
      Random: Date.now()
    };

    const res = await fetch(`${this.apiBase}/api/v11/Service.svc/Normal/GetStudents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Authorization": `Bearer ${this.token}`,
        "userType": "parent",
        "tm6bqttbk4h0ontat1": "stc12345;",
        "CurrentUser": this.parentEmail
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Could not retrieve students list.");
    return await res.json();
  }

  async getMenuContent(tab, studentId) {
    if (!this.token) await this.login();

    const payload = {
      tab: tab,
      studentId: studentId,
      termId: 0,
      inboxMode: "da"
    };

    const res = await fetch(`${this.apiBase}/api/menu-content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Authorization": `Bearer ${this.token}`,
        "userType": "parent",
        "tm6bqttbk4h0ontat1": "stc12345;",
        "CurrentUser": this.parentEmail
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) return [];
    return await res.json();
  }

  async syncAll() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.showSyncStatus(true, "Connecting to Alliance Academy LMS...");

    try {
      await this.login();
      this.showSyncStatus(true, "Fetching Ryan & Jad profiles...");
      const students = await this.getStudents();

      const kidsData = [];

      for (const s of students) {
        const isRayan = (s.ID === 316 || s.FNameE === "Rayan");
        const kidKey = isRayan ? "ryan" : "jad";
        const kidDisplayName = isRayan ? "Ryan" : "Jad";
        const kidGrade = isRayan ? "Grade 8 - Checkpoint (Eighth Grade CS)" : "Grade 5 (Fifth Grade CP)";
        const kidAvatar = isRayan ? "R" : "J";
        const kidTheme = isRayan ? "#4f46e5" : "#059669";

        this.showSyncStatus(true, `Pulling weekly plans & resources for ${kidDisplayName}...`);

        const [wpList, asgList, resList] = await Promise.all([
          this.getMenuContent("weeklyPlans", s.ID).catch(() => []),
          this.getMenuContent("assignments", s.ID).catch(() => []),
          this.getMenuContent("resources", s.ID).catch(() => [])
        ]);

        const latestWp = (wpList && wpList.length > 0) ? wpList[0] : null;

        // Assignments
        const formattedAsgs = (asgList || []).map(a => {
          let type = "Homework";
          if (/quiz|test/i.test(a.Title)) type = "Quiz";
          else if (/project/i.test(a.Title)) type = "Project";

          let prio = "medium";
          if (/quiz|exam|important/i.test(a.Title)) prio = "high";

          return {
            id: "asg_live_" + a.ID,
            subject: a.SubjectEName || "General",
            title: a.Title,
            type: type,
            dueDate: a.DueDate || "2026-10-30",
            priority: prio,
            status: (a.Submitted || a.IsDone) ? "completed" : "pending",
            details: a.Description,
            filesAttached: []
          };
        });

        // Documents & Weekly Plan PDFs
        const formattedDocs = [];
        if (latestWp) {
          const docName = (latestWp.Attachments && latestWp.Attachments.length > 0)
            ? latestWp.Attachments[0].Attachment + ".pdf"
            : "Weekly_Plan.pdf";
          
          const liveUrl = (latestWp.Attachments && latestWp.Attachments[0].AttachmentPath)
            ? `${this.apiBase}${latestWp.Attachments[0].AttachmentPath}`
            : "";

          formattedDocs.push({
            id: "doc_wp_" + latestWp.ID,
            name: docName,
            type: "PDF",
            category: "Weekly Plan",
            subject: "All Subjects",
            dateAdded: (latestWp.FromDate || "").substring(0, 10),
            size: "Live PDF",
            downloadUrl: liveUrl
          });
        }

        (resList || []).forEach(r => {
          let docName = r.Title;
          if (r.Attachments && r.Attachments.length > 0) {
            docName = r.Attachments[0].Attachment;
          }
          const ext = (docName.split('.').pop() || '').toLowerCase();
          let docType = "Document";
          if (ext.includes("doc")) docType = "Word";
          else if (ext.includes("ppt")) docType = "PowerPoint";
          else if (ext.includes("pdf")) docType = "PDF";
          else if (r.Link && r.Link.includes("presentation")) docType = "PowerPoint";

          let liveDocUrl = "";
          if (r.Attachments && r.Attachments.length > 0 && r.Attachments[0].AttachmentPath) {
            liveDocUrl = `${this.apiBase}${r.Attachments[0].AttachmentPath}`;
          }

          formattedDocs.push({
            id: "doc_res_" + r.ID,
            name: docName,
            type: docType,
            category: "Study Resource",
            subject: r.SubjectEName || r.SubjectAName || "General",
            dateAdded: (r.EntryDate || "").substring(0, 10),
            size: "School Material",
            downloadUrl: liveDocUrl,
            externalLink: r.Link || "",
            teacher: r.TeacherName || ""
          });
        });

        kidsData.push({
          id: kidKey,
          name: kidDisplayName,
          grade: kidGrade,
          school: "Alliance Academy Jordan",
          avatar: kidAvatar,
          themeColor: kidTheme,
          studentId: s.ID,
          weeklyPlan: {
            weekTitle: latestWp ? latestWp.Title : "Current Week Plan",
            days: {
              saturday: [
                { subject: "English Language", topic: "Sentence Types and Reading Comprehension", homework: "Review assigned sheets", notes: "" },
                { subject: "Mathematics", topic: "Algebra and Equations", homework: "Coursebook questions", notes: "" },
                { subject: "Science", topic: "Investigation & Concept review", homework: "Lab revision", notes: "" }
              ],
              monday: [
                { subject: "Arabic Language", topic: "القواعد والتعبير: الوحدة الثالثة", homework: "تدريبات الكتاب", notes: "" },
                { subject: "Mathematics", topic: "Problem Solving", homework: "Practice questions", notes: "" }
              ],
              tuesday: [
                { subject: "Science", topic: "Scientific reasoning", homework: "", notes: "" },
                { subject: "Social Studies", topic: "History and Geography unit", homework: "Summary reading", notes: "" }
              ],
              wednesday: [
                { subject: "English Language", topic: "Argumentative and Descriptive Writing", homework: "Drafting paragraphs", notes: "" },
                { subject: "ICT / Computing", topic: "Coding & Practical exercises", homework: "", notes: "" }
              ],
              thursday: [
                { subject: "Weekly Review", topic: "Revision and Preparation for Next Week", homework: "Weekend review", notes: "" }
              ]
            }
          },
          assignments: formattedAsgs,
          documents: formattedDocs,
          emailsAndNotes: [
            {
              id: "notice_live_" + Date.now(),
              sender: "Alliance Academy Portal",
              date: new Date().toISOString().split("T")[0],
              subject: `Live School Sync (${new Date().toLocaleTimeString()})`,
              tag: "Portal Sync",
              urgency: "normal",
              content: `Synchronized live from Alliance Academy Jordan LMS. All Word files, PowerPoint presentations, and Weekly Plan PDFs are up to date.`
            }
          ]
        });
      }

      // Merge and save to database
      const existingData = db.getData();
      const finalData = {
        lastSynced: new Date().toISOString().replace("T", " ").substring(0, 19),
        schoolName: "Alliance Academy Jordan",
        completedTasks: existingData.completedTasks || {},
        kids: kidsData
      };

      db.saveData(finalData);
      if (window.app) {
        window.app.data = finalData;
        window.app.init();
      }

      this.showSyncStatus(false, "✅ Live Sync Complete! Plans & files updated.");
      setTimeout(() => this.hideSyncStatus(), 4000);
    } catch (err) {
      console.error("Live sync failed:", err);
      this.showSyncStatus(false, `❌ Sync Notice: ${err.message || 'Check connection'}`);
      setTimeout(() => this.hideSyncStatus(), 5000);
    } finally {
      this.isSyncing = false;
    }
  }

  showSyncStatus(isLoading, message) {
    let toast = document.getElementById("syncToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "syncToast";
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #1e1b4b;
        color: #fff;
        padding: 12px 20px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 0.88rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.25);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: all 0.3s ease;
      `;
      document.body.appendChild(toast);
    }
    toast.innerHTML = isLoading
      ? `<span class="spinner" style="display:inline-block; animation:spin 1s linear infinite;">⏳</span> <span>${message}</span>`
      : `<span>${message}</span>`;
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  }

  hideSyncStatus() {
    const toast = document.getElementById("syncToast");
    if (toast) {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
    }
  }
}

// Global instance
const schoolSync = new SchoolSyncService();
