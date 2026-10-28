/**
 * Kids Study Organizer - Enhanced Storage & Realtime Multi-Device Sync Layer
 * Supports:
 * 1. Multi-Device Realtime Sync (Father, Mother, Ryan, Jad) via /api/sync
 * 2. LocalStorage for offline-first resilience & instant UI reactions
 * 3. IndexedDB for storing school files (Word, PowerPoint, PDF)
 */

const DB_STORAGE_KEY = "IGCSE_KIDS_STUDY_ORGANIZER_V9";
const INDEXED_DB_NAME = "KidsStudyFilesDB";
const INDEXED_DB_VERSION = 1;
const FILE_STORE_NAME = "school_files";

class StudyDatabase {
  constructor() {
    this.idb = null;
    this.initIndexedDB();
    this.serverVersion = 0;
    this.syncInterval = null;
    this.onRemoteChangeCallbacks = [];
    this.isSyncing = false;
    this.lastSyncTime = null;
    try {
      this.metaStore = JSON.parse(localStorage.getItem("KIDS_STUDY_META_STORE") || "{}");
    } catch(e) {
      this.metaStore = {};
    }
  }

  // --- Device Profile & Role ---
  getDeviceUser() {
    const role = localStorage.getItem("KIDS_STUDY_USER_ROLE");
    if (!role) return "Ryan";
    if (role.includes("Father")) return "Father";
    if (role.includes("Mother")) return "Mother";
    if (role.includes("Jad")) return "Jad";
    return "Ryan";
  }

  setDeviceUser(role) {
    localStorage.setItem("KIDS_STUDY_USER_ROLE", role);
    this.sendHeartbeat();
  }

  // --- Realtime Multi-Device Cloud Sync ---
  startLiveSync(onRemoteCallback) {
    if (onRemoteCallback) {
      this.onRemoteChangeCallbacks.push(onRemoteCallback);
    }

    // Initial sync
    this.fetchServerState(true);

    // Heartbeat & polling every 3.5 seconds
    if (!this.syncInterval) {
      this.syncInterval = setInterval(() => {
        this.fetchServerState(false);
      }, 3500);
    }

    // Heartbeat every 30 seconds
    setInterval(() => {
      this.sendHeartbeat();
    }, 30000);
    this.sendHeartbeat();
  }

  async sendHeartbeat() {
    try {
      const devName = this.getDeviceUser();
      await fetch("/api/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceName: devName,
          role: devName,
          time: new Date().toISOString()
        })
      });
    } catch (e) {
      // offline or tunnel sleeping
    }
  }

  async fetchServerState(isInitial = false) {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const res = await fetch("/api/sync?t=" + Date.now(), {
        cache: "no-store",
        headers: { "Accept": "application/json" }
      });
      if (!res.ok) throw new Error("Sync server returned " + res.status);

      const serverState = await res.json();
      const localData = this.getData();
      let hasChanges = false;
      let lastRemoteEvent = null;

      if (!localData.completedTasks) localData.completedTasks = {};

      // Merge completed tasks
      if (serverState.completedTasks) {
        for (const [taskId, meta] of Object.entries(serverState.completedTasks)) {
          const remoteDone = typeof meta === "boolean" ? meta : !!meta.completed;
          const localDone = !!localData.completedTasks[taskId];

          if (typeof meta === "object") {
            this.setTaskMeta(taskId, meta);
          }

          if (remoteDone !== localDone) {
            localData.completedTasks[taskId] = remoteDone;
            hasChanges = true;
            lastRemoteEvent = {
              type: "task",
              taskId: taskId,
              completed: remoteDone,
              meta: meta
            };
          }
        }
      }

      // Merge assignments status
      if (serverState.assignmentsStatus) {
        (localData.kids || []).forEach(kid => {
          (kid.assignments || []).forEach(asg => {
            const remoteAsg = serverState.assignmentsStatus[asg.id];
            if (remoteAsg) {
              this.setTaskMeta(asg.id, remoteAsg);
            }
            if (remoteAsg && remoteAsg.status && remoteAsg.status !== asg.status) {
              asg.status = remoteAsg.status;
              hasChanges = true;
              lastRemoteEvent = {
                type: "assignment",
                assignmentId: asg.id,
                status: remoteAsg.status,
                meta: remoteAsg
              };
            }
          });
        });
      }

      // Merge voice notes
      if (serverState.voiceNotes) {
        localData.voiceNotes = Object.assign({}, localData.voiceNotes || {}, serverState.voiceNotes);
      }

      // Merge help requests & school bag & task photos
      if (serverState.helpRequests) {
        localData.helpRequests = serverState.helpRequests;
      }
      if (serverState.schoolBag) {
        localData.schoolBag = serverState.schoolBag;
      }
      if (serverState.taskPhotos) {
        localData.taskPhotos = serverState.taskPhotos;
      }

      this.serverVersion = serverState.version || this.serverVersion;
      this.lastSyncTime = new Date();

      if (hasChanges) {
        this.saveData(localData);
        this.onRemoteChangeCallbacks.forEach(cb => cb(lastRemoteEvent));
      }

      // If initial run and local had completed items that server didn't have, push merge
      if (isInitial && Object.keys(localData.completedTasks || {}).length > 0) {
        const needsUpload = Object.keys(localData.completedTasks).some(k => !serverState.completedTasks || !(k in serverState.completedTasks));
        if (needsUpload) {
          this.pushFullMerge(localData.completedTasks);
        }
      }

      this.updateSyncUIStatus("live");
    } catch (e) {
      this.updateSyncUIStatus("offline");
    } finally {
      this.isSyncing = false;
    }
  }

  updateSyncUIStatus(status) {
    const pill = document.getElementById("syncStatusPill");
    if (!pill) return;
    if (status === "live") {
      pill.style.background = "#ecfdf5";
      pill.style.borderColor = "#10b981";
      pill.style.color = "#065f46";
      pill.innerHTML = `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981; margin-right:4px;"></span> Synced (3 Devices)`;
    } else {
      pill.style.background = "#fffbeb";
      pill.style.borderColor = "#f59e0b";
      pill.style.color = "#92400e";
      pill.innerHTML = `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#f59e0b; margin-right:4px;"></span> Offline (Local)`;
    }
  }

  setTaskMeta(taskId, meta) {
    this.metaStore[taskId] = meta;
    try {
      localStorage.setItem("KIDS_STUDY_META_STORE", JSON.stringify(this.metaStore));
    } catch(e) {}
  }

  getTaskMeta(taskId) {
    return this.metaStore[taskId] || null;
  }

  async pushTaskToggle(taskId, completed, kidId) {
    const user = this.getDeviceUser();
    this.setTaskMeta(taskId, {
      completed: completed,
      updatedBy: user,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      kidId: kidId
    });

    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggleTask",
          taskId: taskId,
          completed: completed,
          kidId: kidId,
          user: user
        })
      });
      if (res.ok) {
        const data = await res.json();
        this.serverVersion = data.version;
        this.updateSyncUIStatus("live");
      }
    } catch (e) {
      console.warn("Could not push task toggle immediately (will retry on next sync):", e);
      this.updateSyncUIStatus("offline");
    }
  }

  async pushAssignmentStatus(assignmentId, status) {
    const user = this.getDeviceUser();
    this.setTaskMeta(assignmentId, {
      status: status,
      updatedBy: user,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    try {
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateAssignment",
          assignmentId: assignmentId,
          status: status,
          user: user
        })
      });
    } catch (e) {
      console.warn("Could not push assignment status:", e);
    }
  }

  async pushVoiceNote(taskId, audioBase64) {
    const user = this.getDeviceUser();
    try {
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "saveVoiceNote",
          taskId: taskId,
          audio: audioBase64,
          user: user
        })
      });
    } catch (e) {
      console.warn("Could not push voice note:", e);
    }
  }

  async pushHelpRequest(taskId, kidName, title, subject, note) {
    try {
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "requestHelp",
          taskId: taskId,
          kid: kidName,
          title: title,
          subject: subject,
          note: note,
          user: this.getDeviceUser()
        })
      });
    } catch (e) {
      console.warn("Could not push help request:", e);
    }
  }

  async pushResolveHelp(taskId) {
    try {
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resolveHelp",
          taskId: taskId,
          user: this.getDeviceUser()
        })
      });
    } catch (e) {
      console.warn("Could not resolve help request:", e);
    }
  }

  async pushBagItemToggle(itemId, checked) {
    try {
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggleBagItem",
          itemId: itemId,
          checked: checked,
          user: this.getDeviceUser()
        })
      });
    } catch (e) {
      console.warn("Could not push bag item toggle:", e);
    }
  }

  async pushTaskPhoto(taskId, photoData) {
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "saveTaskPhoto",
          taskId: taskId,
          photoData: photoData,
          user: this.getDeviceUser()
        })
      });
      return res.ok;
    } catch (e) {
      console.warn("Could not push photo:", e);
      return false;
    }
  }

  async deleteTaskPhoto(taskId) {
    try {
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleteTaskPhoto",
          taskId: taskId,
          user: this.getDeviceUser()
        })
      });
    } catch (e) {}
  }

  getTaskPhoto(taskId) {
    const local = this.getData();
    return (local.taskPhotos && local.taskPhotos[taskId]) ? local.taskPhotos[taskId] : null;
  }

  async pushFullMerge(completedTasks) {
    try {
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "fullMerge",
          completedTasks: completedTasks,
          user: this.getDeviceUser()
        })
      });
    } catch (e) {
      // offline
    }
  }

  getTaskMeta(taskId) {
    return this.metaStore[taskId] || null;
  }

  // --- IndexedDB for Real Documents (Word, PPT, PDF) ---
  initIndexedDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn("IndexedDB not supported on this browser.");
        resolve(null);
        return;
      }
      const req = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(FILE_STORE_NAME)) {
          const store = db.createObjectStore(FILE_STORE_NAME, { keyPath: "id" });
          store.createIndex("kidId", "kidId", { unique: false });
          store.createIndex("dateAdded", "dateAdded", { unique: false });
        }
      };
      req.onsuccess = (e) => {
        this.idb = e.target.result;
        resolve(this.idb);
      };
      req.onerror = (e) => {
        console.error("IndexedDB error:", e);
        reject(e);
      };
    });
  }

  // --- LocalStorage State Management ---
  getData() {
    try {
      const stored = localStorage.getItem(DB_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.kids && parsed.kids.length > 0 && parsed.kids[0].documents && parsed.kids[0].documents.length > 0) {
          parsed.kids.forEach(k => {
            if (k.weeklyPlan && k.weeklyPlan.days) {
              if (k.weeklyPlan.days.sunday && !k.weeklyPlan.days.saturday) {
                k.weeklyPlan.days.saturday = k.weeklyPlan.days.sunday;
                delete k.weeklyPlan.days.sunday;
              }
            }
          });
        }
        return parsed;
      }
    } catch (e) {
      console.error("Error reading LocalStorage:", e);
    }
    const sourceData = (typeof SYNCED_SCHOOL_DATA !== "undefined" && SYNCED_SCHOOL_DATA) ? SYNCED_SCHOOL_DATA : DEFAULT_STUDY_DATA;
    const fresh = JSON.parse(JSON.stringify(sourceData));
    this.saveData(fresh);
    return fresh;
  }

  saveData(data) {
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("Error saving to LocalStorage:", e);
      return false;
    }
  }

  // --- IndexedDB File Operations ---
  async saveFile(kidId, file, meta = {}) {
    if (!this.idb) await this.initIndexedDB();
    return new Promise((resolve, reject) => {
      if (!this.idb) {
        reject(new Error("IndexedDB not available"));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const fileId = "file_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
        const record = {
          id: fileId,
          kidId: kidId,
          name: file.name,
          type: this.determineFileType(file.name),
          category: meta.category || "General",
          subject: meta.subject || "All Subjects",
          size: this.formatBytes(file.size),
          dateAdded: new Date().toISOString().split("T")[0],
          mimeType: file.type || "application/octet-stream",
          dataUrl: reader.result
        };

        const tx = this.idb.transaction(FILE_STORE_NAME, "readwrite");
        const store = tx.objectStore(FILE_STORE_NAME);
        const req = store.put(record);

        req.onsuccess = () => resolve(record);
        req.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  async getFile(fileId) {
    if (!this.idb) await this.initIndexedDB();
    return new Promise((resolve, reject) => {
      if (!this.idb) return resolve(null);
      const tx = this.idb.transaction(FILE_STORE_NAME, "readonly");
      const store = tx.objectStore(FILE_STORE_NAME);
      const req = store.get(fileId);
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => reject(e);
    });
  }

  async getAllFiles(kidId) {
    if (!this.idb) await this.initIndexedDB();
    return new Promise((resolve, reject) => {
      if (!this.idb) return resolve([]);
      const tx = this.idb.transaction(FILE_STORE_NAME, "readonly");
      const store = tx.objectStore(FILE_STORE_NAME);
      const index = store.index("kidId");
      const req = index.getAll(kidId);
      req.onsuccess = (e) => resolve(e.target.result || []);
      req.onerror = (e) => reject(e);
    });
  }

  async deleteFile(fileId) {
    if (!this.idb) await this.initIndexedDB();
    return new Promise((resolve, reject) => {
      if (!this.idb) return resolve(false);
      const tx = this.idb.transaction(FILE_STORE_NAME, "readwrite");
      const store = tx.objectStore(FILE_STORE_NAME);
      const req = store.delete(fileId);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  }

  determineFileType(fileName) {
    const ext = fileName.split(".").pop().toLowerCase();
    if (ext === "doc" || ext === "docx") return "Word";
    if (ext === "ppt" || ext === "pptx") return "PowerPoint";
    if (ext === "pdf") return "PDF";
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return "Image";
    if (ext === "xlsx" || ext === "xls") return "Excel";
    return "Document";
  }

  formatBytes(bytes) {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  exportJSON() {
    const data = this.getData();
    const str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const dl = document.createElement("a");
    dl.setAttribute("href", str);
    dl.setAttribute("download", `KidsStudyOrganizer_Backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && parsed.kids && Array.isArray(parsed.kids)) {
        this.saveData(parsed);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Invalid JSON import:", e);
      return false;
    }
  }

  resetData() {
    const fresh = JSON.parse(JSON.stringify(DEFAULT_STUDY_DATA));
    this.saveData(fresh);
    return fresh;
  }
}

// Global DB instance
const db = new StudyDatabase();
