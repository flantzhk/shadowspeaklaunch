#!/usr/bin/env python3
"""Download all phrase audio from cantonese.ai TTS API using curl."""

import json
import os
import subprocess
import sys
import time

API_URL = "https://cantonese.ai/api/tts"
API_KEY = "sk-3dD2dtv4X8g53a3jx27D3mj9x4xsaw8v"
VOICE_ID = "c09e3009-5aa6-4aab-aa94-a3621032bcc4"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TOPICS_DIR = os.path.join(SCRIPT_DIR, "..", "src", "data", "topics", "cantonese")
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "..", "public", "audio", "cantonese")

def load_all_phrases():
    phrases = []
    for fname in sorted(os.listdir(TOPICS_DIR)):
        if not fname.endswith(".json"):
            continue
        with open(os.path.join(TOPICS_DIR, fname)) as f:
            topics = json.load(f)
        for topic in topics:
            for phrase in topic.get("phrases", []):
                phrases.append({"id": phrase["id"], "chinese": phrase["chinese"]})
    return phrases

def download_one(phrase_id, chinese_text):
    out_path = os.path.join(OUTPUT_DIR, f"{phrase_id}.mp3")
    if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
        return "skip", 0

    payload = json.dumps({
        "api_key": API_KEY,
        "text": chinese_text,
        "speed": 1.0,
        "language": "cantonese",
        "output_extension": "mp3",
        "voice_id": VOICE_ID,
        "frame_rate": "24000",
    })

    for attempt in range(3):
        try:
            result = subprocess.run(
                [
                    "curl", "-s", "-X", "POST", API_URL,
                    "-H", "Content-Type: application/json",
                    "-H", f"User-Agent: {UA}",
                    "-d", payload,
                    "-o", out_path,
                    "-w", "%{http_code}",
                    "--max-time", "30",
                ],
                capture_output=True, text=True, timeout=35,
            )
            http_code = result.stdout.strip()
            if http_code == "200" and os.path.exists(out_path) and os.path.getsize(out_path) > 500:
                return "ok", os.path.getsize(out_path)
            else:
                if os.path.exists(out_path):
                    os.remove(out_path)
                if attempt < 2:
                    time.sleep(2)
        except Exception as e:
            if attempt < 2:
                time.sleep(2)

    return "error", 0

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    phrases = load_all_phrases()
    print(f"Downloading audio for {len(phrases)} phrases...")

    ok = skip = err = 0
    for i, p in enumerate(phrases):
        status, size = download_one(p["id"], p["chinese"])
        if status == "ok":
            ok += 1
            print(f"  [{i+1}/{len(phrases)}] {p['id']} OK ({size} bytes)")
        elif status == "skip":
            skip += 1
        else:
            err += 1
            print(f"  [{i+1}/{len(phrases)}] {p['id']} FAILED")

        if status == "ok":
            time.sleep(1.0)
        elif status == "error":
            time.sleep(3.0)

        # Progress update every 50
        if (i + 1) % 50 == 0:
            print(f"  --- Progress: {i+1}/{len(phrases)} ({ok} ok, {skip} skip, {err} err) ---")

    print(f"\nDone: {ok} downloaded, {skip} skipped, {err} errors")
    print(f"Files in {OUTPUT_DIR}: {len(os.listdir(OUTPUT_DIR))}")

if __name__ == "__main__":
    main()
