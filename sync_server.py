#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Kids Study Organizer - Multi-Device Realtime Sync Server
Author: Study Hub Automation
Port: 8080 (Dual Wi-Fi & Cloudflare Tunnel compatible)

Features:
- Static file serving (HTML, JS, CSS, Media, PDFs)
- REST Sync API (/api/sync) for instantaneous 3-device synchronization (Father, Mother, Ryan/Jad)
- Persistent shared state in shared_sync.json
- Live heartbeat & active devices tracker (/api/devices)
- Full CORS support for cross-origin and tunnel requests
"""

import os
import sys
import json
import time
from datetime import datetime
from http.server import HTTPServer, SimpleHTTPRequestHandler

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SYNC_FILE = os.path.join(BASE_DIR, "shared_sync.json")

# Ensure initial sync file exists
def load_shared_state():
    if not os.path.exists(SYNC_FILE):
        initial_state = {
            "version": 1,
            "lastUpdated": datetime.now().isoformat(),
            "completedTasks": {},
            "assignmentsStatus": {},
            "rewards": {
                "ryan": {"points": 125, "streakDays": 4},
                "jad": {"points": 100, "streakDays": 3}
            },
            "voiceNotes": {},
            "activeDevices": {}
        }
        with open(SYNC_FILE, "w", encoding="utf-8") as f:
            json.dump(initial_state, f, indent=2, ensure_ascii=False)
        return initial_state
    try:
        with open(SYNC_FILE, "r", encoding="utf-8") as f:
            st = json.load(f)
            if "helpRequests" not in st: st["helpRequests"] = {}
            if "schoolBag" not in st: st["schoolBag"] = {}
            if "taskPhotos" not in st: st["taskPhotos"] = {}
            return st
    except Exception as e:
        print(f"Error reading shared_sync.json: {e}")
        return {"version": 0, "completedTasks": {}, "assignmentsStatus": {}, "rewards": {}, "voiceNotes": {}, "activeDevices": {}, "helpRequests": {}, "schoolBag": {}, "taskPhotos": {}}

def save_shared_state(state):
    state["lastUpdated"] = datetime.now().isoformat()
    state["version"] = state.get("version", 0) + 1
    temp_file = SYNC_FILE + ".tmp"
    with open(temp_file, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)
    os.replace(temp_file, SYNC_FILE)
    return state["version"]

class MultiDeviceSyncHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        # Enable CORS and disable aggressive caching for API
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Device-Role, X-Device-Name")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed_path = self.path.split("?")[0]
        if parsed_path == "/api/sync":
            self.handle_get_sync()
        elif parsed_path == "/api/devices":
            self.handle_get_devices()
        elif parsed_path == "/manifest.json":
            self.handle_manifest()
        else:
            # Fallback to standard static file server
            super().do_GET()

    def do_POST(self):
        parsed_path = self.path.split("?")[0]
        if parsed_path == "/api/sync":
            self.handle_post_sync()
        elif parsed_path == "/api/heartbeat":
            self.handle_post_heartbeat()
        elif parsed_path == "/api/sync-lms":
            self.handle_sync_lms()
        else:
            self.send_error(404, "Endpoint not found")

    def handle_sync_lms(self):
        try:
            import auto_thursday_sync
            ok = auto_thursday_sync.run_lms_sync()
            resp = json.dumps({"status": "success" if ok else "error", "message": "Synced successfully from LMS"}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(resp)))
            self.end_headers()
            self.wfile.write(resp)
        except Exception as e:
            self.send_error(500, f"Sync error: {e}")

    def handle_get_sync(self):
        state = load_shared_state()
        data = json.dumps(state, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def handle_get_devices(self):
        state = load_shared_state()
        devices = state.get("activeDevices", {})
        data = json.dumps({"devices": devices}, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def handle_manifest(self):
        manifest_path = os.path.join(BASE_DIR, "manifest.json")
        try:
            with open(manifest_path, "rb") as f:
                data = f.read()
            self.send_response(200)
            self.send_header("Content-Type", "application/manifest+json; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            self.send_error(404, f"Manifest not found: {e}")

    def handle_post_heartbeat(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length > 0 else b"{}"
        try:
            payload = json.loads(body.decode("utf-8"))
            dev_name = payload.get("deviceName", "Unknown Mobile")
            dev_role = payload.get("role", "Child")
            
            state = load_shared_state()
            if "activeDevices" not in state:
                state["activeDevices"] = {}
                
            state["activeDevices"][dev_name] = {
                "role": dev_role,
                "lastSeen": datetime.now().strftime("%I:%M:%S %p"),
                "timestamp": time.time()
            }
            save_shared_state(state)
            
            resp = json.dumps({"status": "ok"}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(resp)))
            self.end_headers()
            self.wfile.write(resp)
        except Exception as e:
            self.send_error(400, f"Invalid JSON payload: {e}")

    def handle_post_sync(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length > 0 else b"{}"
        try:
            payload = json.loads(body.decode("utf-8"))
            action = payload.get("action")
            user_label = payload.get("user", "Someone")
            
            state = load_shared_state()
            
            if action == "toggleTask":
                task_id = payload.get("taskId")
                completed = bool(payload.get("completed"))
                kid_id = payload.get("kidId", "ryan")
                state["completedTasks"][task_id] = {
                    "completed": completed,
                    "updatedBy": user_label,
                    "updatedAt": datetime.now().strftime("%Y-%m-%d %I:%M %p"),
                    "kidId": kid_id
                }
                print(f"🔄 [Sync] Task '{task_id}' -> {'DONE' if completed else 'PENDING'} by {user_label}")
                
            elif action == "updateAssignment":
                asg_id = payload.get("assignmentId")
                status = payload.get("status")
                state["assignmentsStatus"][asg_id] = {
                    "status": status,
                    "updatedBy": user_label,
                    "updatedAt": datetime.now().strftime("%Y-%m-%d %I:%M %p")
                }
                print(f"🔄 [Sync] Assignment '{asg_id}' -> {status} by {user_label}")
                
            elif action == "awardPoints":
                kid_id = payload.get("kidId", "ryan")
                pts = int(payload.get("points", 25))
                if kid_id not in state["rewards"]:
                    state["rewards"][kid_id] = {"points": 100, "streakDays": 3}
                state["rewards"][kid_id]["points"] += pts
                print(f"⭐ [Sync] Awarded {pts} points to {kid_id} (Total: {state['rewards'][kid_id]['points']})")
                
            elif action == "saveVoiceNote":
                task_id = payload.get("taskId")
                state["voiceNotes"][task_id] = {
                    "audio": payload.get("audio"),
                    "from": user_label,
                    "timestamp": datetime.now().strftime("%I:%M %p")
                }
                print(f"🎙️ [Sync] Voice Note saved for {task_id} by {user_label}")

            elif action == "fullMerge":
                # Merge full completed tasks dictionary from client
                incoming_tasks = payload.get("completedTasks", {})
                for k, v in incoming_tasks.items():
                    if isinstance(v, bool):
                        state["completedTasks"][k] = {
                            "completed": v,
                            "updatedBy": user_label,
                            "updatedAt": datetime.now().strftime("%Y-%m-%d %I:%M %p")
                        }
                    elif isinstance(v, dict):
                        state["completedTasks"][k] = v

            elif action == "requestHelp":
                task_id = payload.get("taskId")
                state["helpRequests"][task_id] = {
                    "kid": payload.get("kid", "Child"),
                    "title": payload.get("title", ""),
                    "subject": payload.get("subject", ""),
                    "note": payload.get("note", "Needs assistance"),
                    "time": datetime.now().strftime("%I:%M %p")
                }
                print(f"🚨 [Sync] Help requested on {task_id} by {payload.get('kid')}")

            elif action == "resolveHelp":
                task_id = payload.get("taskId")
                if task_id in state["helpRequests"]:
                    del state["helpRequests"][task_id]
                print(f"✅ [Sync] Help resolved for {task_id} by {user_label}")

            elif action == "toggleBagItem":
                item_id = payload.get("itemId")
                checked = payload.get("checked", False)
                state["schoolBag"][item_id] = {
                    "checked": checked,
                    "updatedBy": user_label,
                    "time": datetime.now().strftime("%I:%M %p")
                }
                print(f"🎒 [Sync] Bag item {item_id} -> {checked} by {user_label}")

            elif action == "saveTaskPhoto":
                task_id = payload.get("taskId")
                photo_data = payload.get("photoData")
                if "taskPhotos" not in state: state["taskPhotos"] = {}
                state["taskPhotos"][task_id] = {
                    "photoData": photo_data,
                    "uploadedBy": user_label,
                    "time": datetime.now().strftime("%I:%M %p")
                }
                print(f"📸 [Sync] Photo attached to {task_id} by {user_label}")

            elif action == "deleteTaskPhoto":
                task_id = payload.get("taskId")
                if "taskPhotos" in state and task_id in state["taskPhotos"]:
                    del state["taskPhotos"][task_id]
                print(f"🗑️ [Sync] Photo removed for {task_id}")

            new_version = save_shared_state(state)
            
            resp = json.dumps({
                "status": "success",
                "version": new_version,
                "serverTime": datetime.now().isoformat(),
                "state": state
            }, ensure_ascii=False).encode("utf-8")
            
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(resp)))
            self.end_headers()
            self.wfile.write(resp)
            
        except Exception as e:
            print(f"Sync error: {e}")
            self.send_error(500, f"Error processing sync: {e}")

def run_server(port=8080):
    server_address = ("0.0.0.0", port)
    httpd = HTTPServer(server_address, MultiDeviceSyncHandler)
    print("=" * 65)
    print(f"🚀 Kids Study Organizer Realtime Sync Server running on port {port}")
    print(f"   Local Wi-Fi Access:  http://192.168.8.2:{port}")
    print(f"   Localhost:           http://127.0.0.1:{port}")
    print(f"   3-Device Sync:       ACTIVE (/api/sync)")
    print("=" * 65)
    httpd.serve_forever()

if __name__ == "__main__":
    load_shared_state()
    run_server()
