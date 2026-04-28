import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";

/** Small uppercase eyebrow label above a scene title. */
export const SectionLabel: React.FC<{
  text: string;
  delay?: number;
  color?: string;
}> = ({ text, delay = 0, color = theme.primary }) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - delay);
  const opacity = interpolate(f, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const lift = interpolate(f, [0, 14], [12, 0], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${lift}px)`,
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        padding: "10px 22px",
        background: `${color}22`,
        border: `1px solid ${color}55`,
        borderRadius: 999,
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color,
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: color,
          boxShadow: `0 0 12px ${color}`,
        }}
      />
      {text}
    </div>
  );
};
