# Screenshot specifications

## Required sizes

### Apple App Store

| Device | Size (px) | Count |
|--------|-------------|-------|
| iPhone 6.7" | 1290 × 2796 | 3–10 |
| iPhone 6.5" | 1284 × 2778 | 3–10 |
| iPad Pro 12.9" | 2048 × 2732 | Optional |

### Google Play

| Type | Size (px) | Count |
|------|-------------|-------|
| Phone | 1080 × 1920 min | 2–8 |
| Feature graphic | 1024 × 500 | 1 |
| Icon | 512 × 512 | 1 |

## Capture workflow

1. Open `mobile/store-metadata/screenshot-generator.html` in Chrome
2. Select app (Games Hub or Freelancer Tools)
3. Use DevTools device toolbar (iPhone 14 Pro Max / Pixel 7)
4. Screenshot each frame — save to `mobile/store-metadata/games/screenshots/` or `tools/screenshots/`
5. Run preflight: `node scripts/app-store-preflight.mjs`

## Automated capture (optional, macOS)

```bash
# Requires Playwright — not in CI by default
npx playwright screenshot mobile/store-metadata/screenshot-generator.html --full-page
```

## Content guidelines

- Show actual game/tool UI — no misleading mockups
- Include app name in first screenshot caption
- All ages friendly imagery
- No fake "#1" badges or review scores
