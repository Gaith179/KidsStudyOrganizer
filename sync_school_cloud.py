#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Amman Academy Jordan (AAJ) LMS Cloud Sync Engine
Pure Python - runs on Windows, Linux, and GitHub Actions Cloud (24/7/365)
Fetches weekly plans, assignments, and resources, updating js/syncedData.js
with zero-storage direct streaming URLs.
"""

import os
import sys
import json
import time
import urllib.request
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

API_BASE = os.environ.get("AAJ_API_BASE", "https://lmsapi.aaj.edu.jo")
USERNAME = os.environ.get("AAJ_USERNAME", "")
PASSWORD = os.environ.get("AAJ_PASSWORD", "")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_JS = os.path.join(BASE_DIR, "js", "syncedData.js")

def login():
    url = f"{API_BASE}/api/v11/Service.svc/Normal/login"
    payload = json.dumps({
        "username": USERNAME,
        "password": PASSWORD,
        "Random": int(time.time() * 1000)
    }).encode("utf-8")

    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json;charset=UTF-8"})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("status") == "success" and data.get("token"):
                return data["token"], data["UserID"]
    except Exception as e:
        print(f"Login error: {e}")
    return None, None

def get_menu_content(token, tab, student_id):
    url = f"{API_BASE}/api/menu-content"
    payload = json.dumps({
        "tab": tab,
        "studentId": student_id,
        "termId": 0,
        "inboxMode": "da"
    }).encode("utf-8")

    req = urllib.request.Request(url, data=payload, headers={
        "Content-Type": "application/json;charset=UTF-8",
        "Authorization": f"Bearer {token}",
        "userType": "parent",
        "tm6bqttbk4h0ontat1": "stc12345;",
        "CurrentUser": USERNAME
    })
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"Error fetching {tab} for student {student_id}: {e}")
        return []

def run_sync():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 🚀 Connecting to Amman Academy LMS Cloud API...")
    token, user_id = login()
    if not token:
        print("❌ Authentication failed. Keeping existing syncedData.js.")
        return False

    print("✅ Authenticated successfully.")

    # Kids mapping: Ryan (316) Grade 8, Jad (589) Grade 5
    students = [
        {
            "id": "ryan",
            "studentId": 316,
            "name": "Ryan",
            "grade": "Grade 8 - Checkpoint (Eighth Grade CS)",
            "avatar": "R",
            "themeColor": "#4f46e5"
        },
        {
            "id": "jad",
            "studentId": 589,
            "name": "Jad",
            "grade": "Grade 5 (Fifth Grade CP)",
            "avatar": "J",
            "themeColor": "#059669"
        }
    ]

    # Load existing synced data as baseline for timetable lessons
    existing_kids = {}
    if os.path.exists(OUTPUT_JS):
        try:
            with open(OUTPUT_JS, "r", encoding="utf-8") as f:
                t = f.read()
            clean_json = t.split("const SYNCED_SCHOOL_DATA = ")[1].rsplit(";", 1)[0].strip()
            old_data = json.loads(clean_json)
            for k in old_data.get("kids", []):
                existing_kids[k["id"]] = k
        except Exception:
            pass

    kids_result = []

    for s_info in students:
        sid = s_info["studentId"]
        kid_id = s_info["id"]
        print(f"📡 Syncing live school data for {s_info['name']} (ID: {sid})...")

        time.sleep(1) # respectful pause between API calls
        wp_list = get_menu_content(token, "weeklyPlans", sid)
        time.sleep(1)
        asg_list = get_menu_content(token, "assignments", sid)
        time.sleep(1)
        res_list = get_menu_content(token, "resources", sid)

        # Baseline kid object from existing data
        base_kid = existing_kids.get(kid_id, {})
        weekly_plan = base_kid.get("weeklyPlan", {
            "weekTitle": "Current Week Plan",
            "days": {
                "saturday": [], "monday": [], "tuesday": [], "wednesday": [], "thursday": []
            }
        })

        latest_wp_file = ""
        if wp_list and len(wp_list) > 0:
            latest_wp = wp_list[0]
            weekly_plan["weekTitle"] = latest_wp.get("Title", weekly_plan.get("weekTitle", "Weekly Study Plan"))
            atts = latest_wp.get("Attachments", [])
            if atts and atts[0].get("AttachmentPath"):
                latest_wp_file = f"{API_BASE}{atts[0]['AttachmentPath']}"

        # Format live assignments
        formatted_asgs = []
        for a in (asg_list or []):
            title = a.get("Title", "")
            type_str = "Quiz" if any(k in title.lower() for k in ["quiz", "exam", "test"]) else "Homework"
            prio = "high" if type_str == "Quiz" else "medium"
            formatted_asgs.append({
                "id": f"asg_live_{a.get('ID')}",
                "subject": a.get("SubjectEName") or a.get("SubjectAName") or "General",
                "title": title,
                "type": type_str,
                "dueDate": a.get("DueDate", "2026-10-30"),
                "priority": prio,
                "status": "completed" if (a.get("Submitted") or a.get("IsDone")) else "pending",
                "details": a.get("Description", ""),
                "filesAttached": []
            })

        # Format live documents (Direct streaming URLs)
        formatted_docs = []
        if latest_wp_file:
            formatted_docs.append({
                "id": f"doc_wp_{latest_wp.get('ID', 'latest')}",
                "name": f"{s_info['name']}_Weekly_Plan_Latest.pdf",
                "type": "PDF",
                "category": "Weekly Plan",
                "subject": "All Subjects",
                "dateAdded": (latest_wp.get("FromDate") or "2026-10-24")[:10],
                "size": "School Plan",
                "downloadUrl": latest_wp_file,
                "liveUrl": latest_wp_file
            })

        for r in (res_list or []):
            doc_name = r.get("Title", "School Resource")
            atts = r.get("Attachments", [])
            live_url = ""
            if atts and atts[0].get("AttachmentPath"):
                live_url = f"{API_BASE}{atts[0]['AttachmentPath']}"
                if atts[0].get("Attachment"):
                    doc_name = atts[0]["Attachment"]

            ext = doc_name.split(".")[-1].lower() if "." in doc_name else ""
            doc_type = "Word" if "doc" in ext else "PowerPoint" if "ppt" in ext else "PDF" if "pdf" in ext else "Document"

            formatted_docs.append({
                "id": f"doc_res_{r.get('ID')}",
                "name": doc_name,
                "type": doc_type,
                "category": "Study Resource",
                "subject": r.get("SubjectEName") or r.get("SubjectAName") or "General",
                "dateAdded": (r.get("EntryDate") or "2026-10-27")[:10],
                "size": "Resource",
                "downloadUrl": live_url,
                "liveUrl": live_url,
                "externalLink": r.get("Link", ""),
                "teacher": r.get("TeacherName", "")
            })

        # Keep existing past papers & emails if present
        past_papers = base_kid.get("pastPapers", [])
        emails = base_kid.get("emailsAndNotes", [
            {
                "id": f"notice_{int(time.time())}",
                "sender": "Alliance Academy Portal",
                "date": datetime.now().strftime("%Y-%m-%d"),
                "subject": f"Cloud Sync ({datetime.now().strftime('%I:%M %p')})",
                "tag": "Portal Sync",
                "urgency": "normal",
                "content": "Synchronized live from Alliance Academy Jordan LMS. All worksheets, plans, and materials stream directly with zero local storage."
            }
        ])

        kids_result.append({
            "id": kid_id,
            "name": s_info["name"],
            "grade": s_info["grade"],
            "school": "Alliance Academy Jordan (مدارس التحالف الدولية)",
            "avatar": s_info["avatar"],
            "themeColor": s_info["themeColor"],
            "studentId": sid,
            "weeklyPlan": weekly_plan,
            "assignments": formatted_asgs if formatted_asgs else base_kid.get("assignments", []),
            "documents": formatted_docs if formatted_docs else base_kid.get("documents", []),
            "pastPapers": past_papers,
            "emailsAndNotes": emails
        })

    final_payload = {
        "lastSynced": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "schoolName": "Alliance Academy Jordan",
        "kids": kids_result
    }

    with open(OUTPUT_JS, "w", encoding="utf-8") as f:
        f.write("const SYNCED_SCHOOL_DATA = " + json.dumps(final_payload, indent=2, ensure_ascii=False) + ";\n")

    print(f"✅ Successfully updated {OUTPUT_JS}")
    return True

if __name__ == "__main__":
    run_sync()
