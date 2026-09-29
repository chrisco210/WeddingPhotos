#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="${1:-.}"
OUT_FILE="${2:-manifest.json}"

# Pick whichever ImageMagick binary is available
if command -v magick &>/dev/null; then
  IDENTIFY="magick identify"
elif command -v identify &>/dev/null; then
  IDENTIFY="identify"
else
  echo "Error: neither 'magick' nor 'identify' found in PATH" >&2
  exit 1
fi

TMP_JSONL="$(mktemp)"
trap 'rm -f "$TMP_JSONL"' EXIT

find "$SRC_DIR" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \
  -o -iname '*.gif' -o -iname '*.webp' -o -iname '*.tiff' -o -iname '*.bmp' \) | while read -r filepath; do

  rel_path="${filepath#"$SRC_DIR"/}"
  dir=$(dirname "$rel_path")
  filename=$(basename "$rel_path")

  # Get width and height (first frame only, in case of multi-frame gifs)
  dims=$($IDENTIFY -format "%w %h" "${filepath}[0]" 2>/dev/null) || {
    echo "Warning: could not read dimensions for $filepath, skipping" >&2
    continue
  }
  width=$(echo "$dims" | awk '{print $1}')
  height=$(echo "$dims" | awk '{print $2}')

  # Reduce width:height to simplest ratio using gcd, and keep decimal ratio too
  gcd() { (( $2 == 0 )) && echo "$1" || gcd "$2" "$(( $1 % $2 ))"; }
  g=$(gcd "$width" "$height")
  ratio_w=$(( width / g ))
  ratio_h=$(( height / g ))
  decimal_ratio=$(awk -v w="$width" -v h="$height" 'BEGIN { printf "%.4f", w/h }')

  jq -n -c \
    --arg dir "$dir" \
    --arg name "$filename" \
    --argjson width "$width" \
    --argjson height "$height" \
    --arg ratio "${ratio_w}:${ratio_h}" \
    --argjson decimal "$decimal_ratio" \
    '{dir: $dir, name: $name, width: $width, height: $height, aspect_ratio: $ratio, aspect_ratio_decimal: $decimal}' \
    >> "$TMP_JSONL"
done

# Group by directory into the final manifest structure
jq -s '
  group_by(.dir) |
  map({
    key: .[0].dir,
    value: map({name: .name, aspect_ratio: .aspect_ratio_decimal})
  }) |
  from_entries
' "$TMP_JSONL" > "$OUT_FILE"

echo "Manifest written to $OUT_FILE"