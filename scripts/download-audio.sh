#!/bin/bash
# Download all phrase audio from cantonese.ai TTS API
# Usage: ./scripts/download-audio.sh

set -e

API_KEY="sk-3dD2dtv4X8g53a3jx27D3mj9x4xsaw8v"
VOICE_ID="c09e3009-5aa6-4aab-aa94-a3621032bcc4"
API_URL="https://cantonese.ai/api/tts"
OUTPUT_DIR="public/audio/cantonese"
TOPICS_DIR="src/data/topics/cantonese"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

mkdir -p "$OUTPUT_DIR"

# Extract all phrase IDs and Chinese text from topic files
python3 -c "
import json, os
for f in sorted(os.listdir('$TOPICS_DIR')):
    if not f.endswith('.json'): continue
    data = json.load(open(os.path.join('$TOPICS_DIR', f)))
    for t in data:
        for p in t.get('phrases', []):
            # Tab-separated: id \t chinese
            print(f\"{p['id']}\t{p['chinese']}\")
" | while IFS=$'\t' read -r phrase_id chinese; do
    outfile="$OUTPUT_DIR/${phrase_id}.mp3"

    # Skip if already downloaded
    if [ -f "$outfile" ] && [ "$(stat -f%z "$outfile" 2>/dev/null || stat -c%s "$outfile" 2>/dev/null)" -gt 1000 ]; then
        echo "SKIP $phrase_id"
        continue
    fi

    # Download
    http_code=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -H "User-Agent: $UA" \
        -d "{\"api_key\":\"$API_KEY\",\"text\":\"$chinese\",\"speed\":1.0,\"language\":\"cantonese\",\"output_extension\":\"mp3\",\"voice_id\":\"$VOICE_ID\",\"frame_rate\":\"24000\"}" \
        -o "$outfile" \
        -w "%{http_code}" \
        --max-time 30)

    if [ "$http_code" = "200" ]; then
        size=$(stat -f%z "$outfile" 2>/dev/null || stat -c%s "$outfile" 2>/dev/null)
        echo "OK   $phrase_id (${size} bytes)"
    else
        echo "FAIL $phrase_id (HTTP $http_code)"
        rm -f "$outfile"
    fi

    # Rate limit
    sleep 0.5
done

echo ""
echo "Done. Files in $OUTPUT_DIR:"
ls "$OUTPUT_DIR" | wc -l
