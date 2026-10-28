import subprocess
import re
import sys
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def start_tunnel():
    print("🌐 Starting secure public HTTPS tunnel for mobile data access outside home...")
    cmd = ["cloudflared.exe", "tunnel", "--url", "http://localhost:8080"]
    
    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace"
    )

    tunnel_url = None
    start_time = time.time()

    while time.time() - start_time < 30:
        line = proc.stdout.readline()
        if not line:
            time.sleep(0.2)
            continue
        
        # Search for trycloudflare.com URL
        match = re.search(r"https://[a-zA-Z0-9\-]+\.trycloudflare\.com", line)
        if match:
            tunnel_url = match.group(0)
            break

    if tunnel_url:
        print("\n" + "="*70)
        print("🎉 PUBLIC MOBILE DATA ACCESS IS ACTIVE!")
        print("="*70)
        print(f"🌍 Worldwide HTTPS URL: {tunnel_url}")
        print("="*70)
        print("📱 Ryan on mobile, Jad on Blackview tablet, Mother and Father can open")
        print("   this link on 4G/5G mobile data from ANYWHERE outside the home!")
        print("   (Save to Home Screen to use as an installed app).")
        print("="*70 + "\n")
        
        # Save active URL to a text file for reference
        with open("active_tunnel_url.txt", "w", encoding="utf-8") as f:
            f.write(tunnel_url + "\n")
            
        # Keep running
        try:
            proc.wait()
        except KeyboardInterrupt:
            print("Stopping tunnel...")
            proc.terminate()
    else:
        print("⚠️ Could not capture tunnel URL within 30 seconds.")

if __name__ == "__main__":
    start_tunnel()
