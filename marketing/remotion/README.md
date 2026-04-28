# QualiConnect — Marketing video (Remotion)

A 90-second vertical (9:16, 1080×1920) sales reel rendered programmatically
from React via [Remotion](https://www.remotion.dev). No screen-recording, no
voice-over — just brand-consistent text + icon animations on a dark gradient
background. Drop a music track in afterwards if you want.

## Storyline (90s @ 30fps)

| Scene             | Frames        | Seconds  | Beat                                        |
|-------------------|---------------|----------|---------------------------------------------|
| `LogoIntro`       | 0 → 90        | 0 – 3    | Logo + "La plateforme événementielle…"      |
| `Tagline`         | 90 → 210      | 3 – 7    | Tout-en-un. Sécurisé. Conforme RGPD.        |
| `EventTypes`      | 210 → 480     | 7 – 16   | 6 types · présentiel/online/hybride          |
| `Registration`    | 480 → 750     | 16 – 25  | Inscription · tarifs · CinetPay · groupes   |
| `Badges`          | 750 → 1020    | 25 – 34  | QR codes + scanner mobile                    |
| `Communication`   | 1020 → 1290   | 34 – 43  | Newsletter intégrée + emails auto           |
| `Certificates`    | 1290 → 1560   | 43 – 52  | PDF vérifiable                               |
| `Security`        | 1560 → 1830   | 52 – 61  | AES-256, HMAC, audit, rôles                  |
| `UseCases`        | 1830 → 2130   | 61 – 71  | Cabinets, B2B, tournées, webinaires         |
| `CallToAction`    | 2130 → 2400   | 71 – 80  | "Demander une démo"                          |
| `Outro`           | 2400 → 2700   | 80 – 90  | Logo + URL                                   |

## Install

```bash
cd marketing/remotion
npm install
```

> Remotion downloads a headless Chromium on first run (~150 MB). On Linux
> servers also install: `apt-get install -y libnss3 libdbus-1-3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2`.

## Preview in the browser

```bash
npm run studio
```

Opens the Remotion Studio at http://localhost:3000 with timeline scrubbing,
hot-reload, and per-frame inspection.

## Render the MP4

```bash
npm run video
```

Writes `out/qualiconnect.mp4` (1080×1920, H.264, ~6-15 MB depending on motion).

## Render a poster frame

```bash
npm run still
```

Writes `out/cover.png` from frame 60 — useful as a thumbnail or Open Graph
image.

## Tweaking

- **Brand colors** → `src/theme.ts` (`primary`, `accent`, etc.).
- **Scene durations** → `src/theme.ts` (`sceneDurations`). Keep the sum at
  `90 * fps = 2700` frames.
- **Copy** → each `src/scenes/*.tsx` file owns its own French text. Edit in
  place and re-render.
- **Add a music track** → drop an MP3 in `public/`, then in `src/Video.tsx`:
  ```tsx
  import { Audio, staticFile } from "remotion";
  // …
  <Audio src={staticFile("track.mp3")} volume={0.6} />
  ```

## Performance

Default render uses 2 concurrent workers (see `remotion.config.ts`). On a
modern laptop expect 60-90 seconds to produce the full 90-second video. Bump
`Config.setConcurrency(N)` if you have CPU headroom.

## Output formats

To produce a square (1:1) version for LinkedIn or a 16:9 for YouTube, add a
second `<Composition>` in `src/Root.tsx` with the new dimensions and pass a
matching prop into `<Video>` to adapt the layout. Today the layout assumes
9:16 — most padding/grid sizes will need tweaking for other ratios.
