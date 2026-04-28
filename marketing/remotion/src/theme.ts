/** Brand palette for QualiConnect — keep in sync with the web app's primary tokens. */
export const theme = {
  primary: "#ff7a00",
  primaryDark: "#ff5e00",
  primaryLight: "#ffb072",
  accent: "#7c3aed",
  bg: "#0a0a0f",
  surface: "#14141f",
  surfaceLight: "#1f1f2e",
  text: "#ffffff",
  textMuted: "#a0a0b0",
  textDim: "#6b6b7e",
  success: "#10b981",
  border: "rgba(255,255,255,0.08)",
};

export const fps = 30;
export const totalFrames = 90 * fps; // 90s at 30fps = 2700 frames
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;

/** Scene boundaries in frames. Each value = duration of that scene. */
export const sceneDurations = {
  logoIntro: 90,         //  3.0s — 0 → 90
  tagline: 120,          //  4.0s — 90 → 210
  eventTypes: 270,       //  9.0s — 210 → 480
  registration: 270,     //  9.0s — 480 → 750
  badges: 270,           //  9.0s — 750 → 1020
  communication: 270,    //  9.0s — 1020 → 1290
  certificates: 270,     //  9.0s — 1290 → 1560
  security: 270,         //  9.0s — 1560 → 1830
  useCases: 300,         // 10.0s — 1830 → 2130
  callToAction: 270,     //  9.0s — 2130 → 2400
  outro: 300,            // 10.0s — 2400 → 2700
} as const;

export const sceneStarts = (() => {
  const out: Record<keyof typeof sceneDurations, number> = {} as never;
  let cursor = 0;
  for (const k of Object.keys(sceneDurations) as (keyof typeof sceneDurations)[]) {
    out[k] = cursor;
    cursor += sceneDurations[k];
  }
  return out;
})();
