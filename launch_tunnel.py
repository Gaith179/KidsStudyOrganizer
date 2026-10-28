import os
import subprocess
import re
import time
import sys

CLOUDFLARED_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cloudflared.exe")
if not os.path.exists(CLOUDFLARED_PATH):
    CLOUDFLARED_PATH = "cloudflared.exe"

# Kill any existing cloudflared
subprocess.run(["taskkill", "/F", "/IM", "cloudflared.exe"], capture_output=True)

print("Starting cloudflared tunnel with:", CLOUDFLARED_PATH)
proc = subprocess.Popen(
    [CLOUDFLARED_PATH, "tunnel", "--url", "http://127.0.0.1:8080"],
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
    encoding="utf-8",
    errors="replace"
)

url = None
start = time.time()
while time.time() - start < 25:
    line = proc.stdout.readline()
    if not line:
        time.sleep(0.1)
        continue
    # print line for debugging
    if "trycloudflare.com" in line:
        match = re.search(r"https://[a-zA-Z0-9\-]+\.trycloudflare\.com", line)
        if match:
            url = match.group(0)
            print("Found URL:", url)
            url_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "active_tunnel_url.txt")
            with open(url_file, "w", encoding="utf-8") as f:
                f.write(url + "\n")
            break

if url:
    print("Tunnel active successfully!")
    # Keep running
    try:
        proc.wait()
    except KeyboardInterrupt:
        proc.terminate()
else:
    print("Could not find trycloudflare URL.")
    proc.terminate()
