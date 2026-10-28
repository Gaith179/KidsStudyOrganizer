import os
import sys
import zipfile
import shutil
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def build_package():
    current_dir = Path(__file__).resolve().parent
    output_zip = current_dir / "KidsStudyOrganizer_Mobile_App.zip"

    print(f"📦 Packaging Kids Study Organizer into {output_zip.name}...")

    include_files = [
        "index.html",
        "manifest.json",
        "sw.js",
        "sync_server.py",
        "launch_tunnel.py",
        "mobile_install.html",
        "mobile_qr.png",
        "auto_whatsapp_scheduler.py",
        "sync_school.ps1",
        "README_MOBILE_INSTALL.md"
    ]

    include_dirs = [
        "css",
        "js",
        "icons"
    ]

    count = 0
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for f in include_files:
            file_path = current_dir / f
            if file_path.exists():
                zipf.write(file_path, arcname=f)
                count += 1
                print(f"  + Added file: {f}")

        for d in include_dirs:
            dir_path = current_dir / d
            if dir_path.exists():
                for root, _, files in os.walk(dir_path):
                    for file in files:
                        p = Path(root) / file
                        rel_path = p.relative_to(current_dir)
                        zipf.write(p, arcname=str(rel_path))
                        count += 1

    zip_size_mb = os.path.getsize(output_zip) / (1024 * 1024)
    print(f"✅ Successfully created {output_zip.name}!")
    print(f"   Total items packaged: {count}")
    print(f"   Archive size: {zip_size_mb:.2f} MB")

if __name__ == "__main__":
    build_package()
