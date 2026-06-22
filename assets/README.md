# Friction Frog: site assets

Everything the site loads at runtime lives here. Filenames are referenced directly in the HTML,
so **keep the names exactly as below** when you swap a file (just overwrite it in place).

| File | Used by | Spec / notes |
|------|---------|--------------|
| `app-store-badge.svg` | Hero + final CTA + (fallback for) all download buttons | Official Apple "Download on the App Store" black badge (SVG, scales to any size; rendered ~54px tall). If this file is missing, `app.js` draws a styled black-pill fallback automatically. |
| `app-store-badge-white.svg` | _unused_ | White variant of the Apple badge, kept for future use (e.g. a dark section). Not referenced anywhere yet. |
| `grayscale-demo.mp4` | Hero phone mockup | Vertical screen recording of the grayscale feature. Current file: H.264, 1206×2622 (≈9:19.5), muted-friendly. Keep it short and small (≤~3 MB), and it autoplays muted + looped. |
| `grayscale-poster.png` | Hero phone mockup (`poster`) | First frame of `grayscale-demo.mp4`, same aspect ratio. Shown before/while the video loads. |
| `breathing-demo.mp4` | Demo section phone mockup | Vertical recording of the breathing gate. Same specs as the grayscale demo. |
| `breathing-poster.png` | Demo section phone mockup (`poster`) | First frame of `breathing-demo.mp4`, same aspect ratio. |
| `og-image.png` | Social link previews (Open Graph + Twitter), all pages | **1200×630 PNG.** This is what shows when the site URL is pasted into iMessage, Slack, X, etc. |

## Not in this folder (intentionally)
- `frog.png` lives in the **project root**. It's the temporary 32×32 pixel logo/mascot and the
  favicon/apple-touch-icon. The site references it through the `--logo-url` CSS variable in
  `styles.css`, so when the new hi-res logo is ready you can swap it in one place (and delete the
  `image-rendering: pixelated` line on `.logo`, which only exists to keep the tiny sprite crisp).

## Optional, not yet used
- `feature-1.png` / `feature-2.png` / `feature-3.png`: optional images for the three feature
  cards. The cards currently use emoji icons; drop these in later if you want real screenshots.
