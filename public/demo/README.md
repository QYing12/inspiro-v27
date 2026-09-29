# Inspiro demo video

Drop your finished recording into this folder so the Landing page picks it up.

## File names the player looks for

The `<DemoVideo>` component on the Landing page references these paths, in this order:

1. `public/demo/inspiro-demo.mp4`  — primary source (H.264 recommended)
2. `public/demo/inspiro-demo.webm` — optional fallback for browsers that prefer VP9/AV1
3. `public/demo/demo-poster.jpg`   — optional poster frame shown before play

At least the `.mp4` is required. The `.webm` and poster are both optional.

## Suggested encoding

- **Resolution:** 1920×1080 (16:9) or 1280×720
- **Frame rate:** 30 fps or 60 fps
- **Codec:** H.264 / AAC inside an MP4 container
- **Bitrate:** ~6–10 Mbps (a 2-minute clip lands around 90–150 MB; fine for demo use)
- **Duration:** 90–180 seconds is the sweet spot

### Fast encode on macOS (if you recorded with QuickTime)

```bash
ffmpeg -i raw.mov \
  -vf "scale=1920:-2" \
  -c:v libx264 -preset slow -crf 20 \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  inspiro-demo.mp4
```

### Generate a poster frame

```bash
ffmpeg -ss 00:00:02 -i inspiro-demo.mp4 -vframes 1 -q:v 2 demo-poster.jpg
```

## How the player behaves

- Shows the poster + native play button until clicked
- Standard browser controls (play/pause, scrub, volume, fullscreen)
- If no video file is present, the Landing section falls back to a "Demo coming soon" placeholder automatically
