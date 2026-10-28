#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Alliance Academy Jordan (AAJ) - Automated Thursday 5:00 PM Weekly Plan Sync Daemon
Author: Study Hub Automation
Schedule: Every Thursday at 17:00 (05:00 PM) Jordan Time

Workflow:
1. Connects to https://lmsapi.aaj.edu.jo
2. Authenticates using configured Parent account
3. Fetches newly published Weekly Plans for:
   - Ryan (Grade 8 Checkpoint - CS)
   - Jad (Grade 5 Cambridge Primary - CP)
4. Downloads the official Weekly Plan PDFs directly into school_downloads/
5. Updates js/syncedData.js and sync timestamp
6. Sends WhatsApp alert to Father, Mother & Ryan informing them that next week's plan is ready!
"""

import os
import sys
import time
import json
import subprocess
import urllib.request
import urllib.parse
from datetime import datetime

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
API_BASE = os.environ.get("AAJ_API_BASE", "https://lmsapi.aaj.edu.jo")
USERNAME = os.environ.get("AAJ_USERNAME", "")
PASSWORD = os.environ.get("AAJ_PASSWORD", "")

CONTACTS = [
    {"role": "Father", "phone": os.environ.get("PHONE_FATHER", "")},
    {"role": "Mother", "phone": os.environ.get("PHONE_MOTHER", "")},
    {"role": "Ryan", "phone": os.environ.get("PHONE_RYAN", "")}
]

def run_lms_sync():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 🚀 Executing Amman Academy Live LMS Sync...")
    ps_script = os.path.join(BASE_DIR, "sync_school.ps1")
    cmd = ["powershell", "-ExecutionPolicy", "Bypass", "-File", ps_script]
    try:
        res = subprocess.run(cmd, cwd=BASE_DIR, capture_output=True, text=True, encoding="utf-8", errors="replace")
        print("Sync script output summary:")
        lines = [l for l in res.stdout.splitlines() if "Downloaded" in l or "Processing" in l or "Writing" in l or "Authenticated" in l]
        for l in lines[:10]:
            print(f"   {l}")
        if len(lines) > 10:
            print(f"   ... and {len(lines) - 10} more files downloaded.")
        
        # Write sync status
        status_file = os.path.join(BASE_DIR, "last_thursday_sync.json")
        info = {
            "lastSyncTime": datetime.now().isoformat(),
            "status": "success",
            "message": "Weekly plans for Ryan and Jad synced from lms.aaj.edu.jo"
        }
        with open(status_file, "w", encoding="utf-8") as f:
            json.dump(info, f, ensure_ascii=False, indent=2)

        notify_family_new_weekly_plan()
        return True
    except Exception as e:
        print(f"❌ Error running sync: {e}")
        return False

def notify_family_new_weekly_plan():
    now_str = datetime.now().strftime("%Y-%m-%d %I:%M %p")
    tunnel_url = "https://comm-everything-relating-receipt.trycloudflare.com"
    try:
        tfile = os.path.join(BASE_DIR, "active_tunnel_url.txt")
        if os.path.exists(tfile):
            with open(tfile, "r", encoding="utf-8") as tf:
                u = tf.read().strip()
                if u: tunnel_url = u
    except Exception:
        pass

    msg = (
        f"📢 *Alliance Academy Jordan (AAJ) - New Weekly Study Plan Ready* 📢\n"
        f"━━━━━━━━━━━━━━━━━━━━━━\n"
        f"The new weekly timetable, homework, and resources have been synced from LMS:\n\n"
        f"👨‍🎓 *Ryan (Grade 8 Checkpoint):* Weekly schedule, outcomes, and assignments ready.\n"
        f"🚀 *Jad (Grade 5 Cambridge):* Weekly schedule, homework, and quiz dates ready.\n"
        f"━━━━━━━━━━━━━━━━━━━━━━\n"
        f"📅 *Synced At:* {now_str}\n"
        f"🖨️ *Ready for 1-click home printing on Canon TS3300 printer!*\n\n"
        f"📱 *Open App (Mobile & Web):*\n"
        f"{tunnel_url}\n"
        f"_Kids Study Hub - Multi-Device Family Sync_"
    )

    print("\n📨 Generated WhatsApp Notifications for Family:")
    for c in CONTACTS:
        encoded = urllib.parse.quote(msg)
        wa_link = f"https://api.whatsapp.com/send?phone={c['phone']}&text={encoded}"
        print(f" -> {c['role']} ({c['phone']}):\n    {wa_link[:100]}...")

def monitor_loop():
    print("=" * 65)
    print("⏰ Alliance Academy Jordan Thursday 5:00 PM Sync Daemon Started")
    print("   Active target: Every Thursday at 17:00 (05:00 PM Jordan Time)")
    print("=" * 65)

    last_synced_week = None

    while True:
        now = datetime.now()
        # weekday: 0=Monday, ..., 3=Thursday, 6=Sunday
        is_thursday = (now.weekday() == 3)
        current_hour = now.hour
        current_minute = now.minute
        current_week_num = now.isocalendar()[1]

        # Trigger at 17:00 (or between 17:00 and 17:15 once per week)
        if is_thursday and current_hour == 17 and (0 <= current_minute <= 15):
            if last_synced_week != current_week_num:
                print(f"🎯 Thursday 5:00 PM reached! (Week {current_week_num}). Triggering automatic weekly plan sync...")
                run_lms_sync()
                last_synced_week = current_week_num
        
        # Sleep for 60 seconds between checks
        time.sleep(60)

if __name__ == "__main__":
    if "--now" in sys.argv:
        print("⚡ Manual trigger: Running LMS sync right now...")
        run_lms_sync()
    else:
        monitor_loop()
