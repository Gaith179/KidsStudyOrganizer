#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Alliance Academy Jordan (AAJ) - Automated WhatsApp Exam Reminder Daemon
Runs 24/7/365 in GitHub Actions Cloud or local PC.
Checks for tomorrow's quizzes & tests every day at 4:00 PM Jordan Time
and sends alerts to Father, Mother, and Ryan mobiles.
Supports CallMeBot direct WhatsApp push, Telegram channel bot, and GitHub Step Summary.
"""

import os
import sys
import time
import json
import urllib.request
import urllib.parse
from datetime import datetime, timedelta

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

API_BASE = os.environ.get("AAJ_API_BASE", "https://lmsapi.aaj.edu.jo")
USERNAME = os.environ.get("AAJ_USERNAME", "")
PASSWORD = os.environ.get("AAJ_PASSWORD", "")

# Family Contacts (configured via environment variables or settings)
CONTACTS = [
    {
        "role": "Father",
        "name": "Father",
        "phone": os.environ.get("PHONE_FATHER", ""),
        "apikey_env": "CALLMEBOT_APIKEY_FATHER"
    },
    {
        "role": "Mother",
        "name": "Mother",
        "phone": os.environ.get("PHONE_MOTHER", ""),
        "apikey_env": "CALLMEBOT_APIKEY_MOTHER"
    },
    {
        "role": "Ryan",
        "name": "Ryan",
        "phone": os.environ.get("PHONE_RYAN", ""),
        "apikey_env": "CALLMEBOT_APIKEY_RYAN"
    }
]

def get_hub_url():
    # Priority: 1. Environment variable, 2. active_tunnel_url.txt, 3. GitHub Pages default
    if os.environ.get("STUDYHUB_URL"):
        return os.environ.get("STUDYHUB_URL")
    url_file = "active_tunnel_url.txt"
    try:
        with open(url_file, "r", encoding="utf-8") as f:
            u = f.read().strip()
            if u.startswith("http"):
                return u
    except Exception:
        pass
    return "https://gaith179.github.io/KidsStudyOrganizer/"

def send_callmebot_whatsapp(phone, message, apikey):
    if not apikey:
        return False
    try:
        encoded = urllib.parse.quote(message)
        url = f"https://api.callmebot.com/whatsapp.php?phone={phone}&text={encoded}&apikey={apikey}"
        req = urllib.request.Request(url, headers={"User-Agent": "StudyHubBot/1.0"})
        with urllib.request.urlopen(req, timeout=20) as resp:
            res = resp.read().decode("utf-8")
            print(f"    [CallMeBot Direct Push] Sent to {phone}: {res[:80]}")
            return True
    except Exception as e:
        print(f"    [CallMeBot] Could not deliver to {phone}: {e}")
        return False

def send_telegram_alert(message):
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID")
    if not bot_token or not chat_id:
        return False
    try:
        encoded = urllib.parse.quote(message)
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage?chat_id={chat_id}&text={encoded}&parse_mode=Markdown"
        req = urllib.request.Request(url, headers={"User-Agent": "StudyHubBot/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            print("    [Telegram Push] Delivered alert to Telegram family group.")
            return True
    except Exception as e:
        print(f"    [Telegram] Failed: {e}")
        return False

def record_github_step_summary(kid_name, exam_item, links):
    summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
    if not summary_file:
        return
    try:
        with open(summary_file, "a", encoding="utf-8") as f:
            f.write(f"### 🚨 Exam Alert: {kid_name} - {exam_item.get('Title')}\n")
            f.write(f"- **Subject**: {exam_item.get('SubjectEName', 'General')}\n")
            f.write(f"- **Due Date**: {exam_item.get('DueDate', 'Tomorrow')}\n")
            f.write(f"- **Teacher Notes**: {exam_item.get('Description', 'N/A')[:200]}\n")
            f.write(f"- **1-Click WhatsApp Dispatch Links**:\n")
            for role, phone, link in links:
                f.write(f"  - [{role} ({phone})]({link})\n")
            f.write("\n")
    except Exception:
        pass

def login():
    url = f"{API_BASE}/api/v11/Service.svc/Normal/login"
    payload = json.dumps({
        "username": USERNAME,
        "password": PASSWORD,
        "Random": int(time.time() * 1000)
    }).encode("utf-8")

    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json;charset=UTF-8"})
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("status") == "success" and data.get("token"):
                return data["token"], data["UserID"]
    except Exception as e:
        print(f"Login error: {e}")
    return None, None

def check_upcoming_exams(token, student_id):
    url = f"{API_BASE}/api/menu-content"
    payload = json.dumps({
        "tab": "assignments",
        "studentId": student_id,
        "termId": 0,
        "inboxMode": "da"
    }).encode("utf-8")

    headers = {
        "Content-Type": "application/json;charset=UTF-8",
        "Authorization": f"Bearer {token}",
        "userType": "parent",
        "tm6bqttbk4h0ontat1": "stc12345;",
        "CurrentUser": USERNAME
    }

    req = urllib.request.Request(url, data=payload, headers=headers)
    tomorrow_str = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

    urgent_exams = []
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            items = json.loads(resp.read().decode("utf-8"))
            for item in items:
                due = item.get("DueDate", "")
                title = item.get("Title", "")
                is_urgent = (due == tomorrow_str) or any(k in title.lower() for k in ["quiz", "exam", "test"])
                if is_urgent and not item.get("Submitted") and not item.get("IsDone"):
                    urgent_exams.append(item)
    except Exception as e:
        print(f"Error checking exams: {e}")
    return urgent_exams

def build_whatsapp_message(kid_name, exam_item):
    title = exam_item.get("Title", "School Quiz")
    subj = exam_item.get("SubjectEName", "General")
    due = exam_item.get("DueDate", "Tomorrow")
    desc = exam_item.get("Description", "Please review class notes.")

    msg = (
        f"🚨 *Alliance Academy Jordan (AAJ) - Exam Alert* 🚨\n"
        f"━━━━━━━━━━━━━━━━━\n"
        f"👨‍🎓 *Student:* {kid_name}\n"
        f"📚 *Subject:* {subj}\n"
        f"🎯 *Exam / Quiz:* {title}\n"
        f"📅 *Date Due:* {due}\n"
        f"━━━━━━━━━━━━━━━━━\n"
        f"📝 *Teacher Notes:*\n{desc[:250]}\n\n"
        f"⏰ *Recommended Evening Study:* 4:30 PM - 5:30 PM\n"
        f"📱 *Study Hub:* {get_hub_url()}\n"
        f"_Kids Study Hub - Ryan & Jad_"
    )
    return msg

def dispatch_alerts():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 🚀 Running AAJ cloud exam check...")
    token, user_id = login()
    if not token:
        print("❌ Login to AAJ LMS failed.")
        return

    # Check Ryan (316) & Jad (589)
    ryan_exams = check_upcoming_exams(token, 316)
    jad_exams = check_upcoming_exams(token, 589)

    all_alerts = []
    for ex in ryan_exams:
        all_alerts.append(("Ryan (ريان)", ex))
    for ex in jad_exams:
        all_alerts.append(("Jad (جاد)", ex))

    if not all_alerts:
        print("✅ No urgent exams due tomorrow. Family is on track!")
        summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
        if summary_file:
            try:
                with open(summary_file, "a", encoding="utf-8") as f:
                    f.write("### ✅ AAJ Daily Check: All clear! No urgent exams due tomorrow.\n")
            except Exception:
                pass
        return

    print(f"⚠️ Found {len(all_alerts)} upcoming exam alert(s)!")
    for kid_name, ex in all_alerts:
        msg = build_whatsapp_message(kid_name, ex)
        links = []
        for contact in CONTACTS:
            phone = contact["phone"]
            role = contact["role"]
            apikey = os.environ.get(contact["apikey_env"], "")
            encoded = urllib.parse.quote(msg)
            link = f"https://api.whatsapp.com/send?phone={phone}&text={encoded}"
            links.append((role, phone, link))

            print(f" -> Prepared WhatsApp alert for {role} ({phone}):")
            print(f"    {link[:90]}...\n")

            # If CallMeBot API key is present in secrets, send directly
            if apikey:
                send_callmebot_whatsapp(phone, msg, apikey)

        # Send Telegram push if configured
        send_telegram_alert(msg)

        # Record to GitHub Step Summary
        record_github_step_summary(kid_name, ex, links)

def dispatch_morning_departure_alert():
    now = datetime.now()
    today_name = now.strftime("%A, %b %d")
    msg = (
        f"🌅 *Alliance Academy Jordan - Morning Departure Checklist*\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        f"⏰ *Wakeup:* 06:00 AM (Complete!)\n"
        f"🚀 *Departure:* 07:00 AM Sharp ({today_name})\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        f"Checklist before leaving the door:\n"
        f"✅ 🥪 Fresh Lunchbox & Morning Snack (from fridge)\n"
        f"✅ 💧 Cold Fresh Water Bottle filled\n"
        f"✅ 🎒 Packed School Bag & Worksheets grabbed\n"
        f"✅ 👔 School Uniform & AAJ ID Card / Badge on\n"
        f"✅ 👟 School Shoes on & ready by the door!\n\n"
        f"Have a brilliant day of learning, Ryan & Jad! 🌟\n"
        f"📱 *Study Hub:* {get_hub_url()}"
    )
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 🌅 Generating 06:00-07:00 AM Morning Departure WhatsApp alerts...")
    for contact in CONTACTS:
        phone = contact["phone"]
        role = contact["role"]
        apikey = os.environ.get(contact["apikey_env"], "")
        encoded = urllib.parse.quote(msg)
        link = f"https://api.whatsapp.com/send?phone={phone}&text={encoded}"
        print(f" -> Prepared Morning Departure alert for {role} ({phone}):")
        print(f"    {link[:90]}...\n")
        if apikey:
            send_callmebot_whatsapp(phone, msg, apikey)
    send_telegram_alert(msg)

def dispatch_bedtime_wrapup():
    now = datetime.now()
    today_name = now.strftime("%A, %b %d")
    msg = (
        f"🌙 *Alliance Academy Jordan - 09:00 PM Bedtime Wrap-Up*\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        f"📅 *Date:* {today_name} (Nightly Check)\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        f"👦 *Ryan (Grade 8 CS):* Homework checked & bag ready\n"
        f"👦 *Jad (Grade 5 CP):* Vocabulary drilled & bag packed\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        f"⏰ *Tomorrow Morning Schedule:*\n"
        f"• 06:00 AM: Wakeup & Morning routine\n"
        f"• 06:40 AM: Fresh lunchbox from fridge\n"
        f"• 07:00 AM: Departure for AAJ School\n\n"
        f"Rest well and get good sleep, champions! 🌟\n"
        f"📱 *Study Hub:* {get_hub_url()}"
    )
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 🌙 Generating 09:00 PM Bedtime Wrap-Up WhatsApp alerts...")
    for contact in CONTACTS:
        phone = contact["phone"]
        role = contact["role"]
        apikey = os.environ.get(contact["apikey_env"], "")
        encoded = urllib.parse.quote(msg)
        link = f"https://api.whatsapp.com/send?phone={phone}&text={encoded}"
        print(f" -> Prepared Bedtime Wrap-Up for {role} ({phone}):")
        print(f"    {link[:90]}...\n")
        if apikey:
            send_callmebot_whatsapp(phone, msg, apikey)
    send_telegram_alert(msg)

if __name__ == "__main__":
    if "--morning" in sys.argv:
        dispatch_morning_departure_alert()
    elif "--bedtime" in sys.argv:
        dispatch_bedtime_wrapup()
    elif "--now" in sys.argv:
        dispatch_alerts()
    else:
        print("Automated WhatsApp Scheduler active. Running exam check now...")
        dispatch_alerts()
