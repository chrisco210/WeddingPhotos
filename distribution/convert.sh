set -euo pipefail

SRC_DIR="${1:-"content/full"}"
DEST_DIR="${2:-"content/thumb"}"
WIDTH="${3:-1024}"

# Pick whichever ImageMagick command is available
if command -v magick >/dev/null 2>&1; then
    CONVERT_CMD="magick"
elif command -v convert >/dev/null 2>&1; then
    CONVERT_CMD="convert"
else
    echo "Error: ImageMagick is not installed (need 'magick' or 'convert')." >&2
    exit 1
fi

if [ ! -d "$SRC_DIR" ]; then
    echo "Error: source directory '$SRC_DIR' does not exist." >&2
    exit 1
fi

mkdir -p "$DEST_DIR"

shopt -s nullglob nocaseglob

# Common image extensions
extensions=(jpg jpeg png gif bmp tif tiff webp)

count=0
for ext in "${extensions[@]}"; do
    for file in "$SRC_DIR"/*."$ext"; do
        [ -e "$file" ] || continue
        filename="$(basename "$file")"
        dest_file="$DEST_DIR/$filename"

        echo "Resizing: $filename -> ${WIDTH}px wide"
        "$CONVERT_CMD" "$file" -resize "${WIDTH}x" "$dest_file"

        count=$((count + 1))
    done
done

shopt -u nullglob nocaseglob

if [ "$count" -eq 0 ]; then
    echo "No images found in '$SRC_DIR'."
else
    echo "Done. Resized $count image(s) into '$DEST_DIR'."
fi