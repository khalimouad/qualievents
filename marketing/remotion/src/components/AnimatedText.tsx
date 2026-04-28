import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface Props {
  text: string;
  delay?: number;
  size?: number;
  weight?: number;
  color?: string;
  letterSpacing?: string;
  align?: "left" | "center" | "right";
  lineHeight?: number;
}

/** Headline that fades + slides up with a spring. */
export const AnimatedText: React.FC<Props> = ({
  text,
  delay = 0,
  size = 64,
  weight = 800,
  color = "#ffffff",
  letterSpacing = "-0.02em",
  align = "center",
  lineHeight = 1.1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - delay);

  const opacity = interpolate(f, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const lift = spring({ frame: f, fps, config: { damping: 14, stiffness: 120 } });
  const y = interpolate(lift, [0, 1], [40, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        fontSize: size,
        fontWeight: weight,
        color,
        letterSpacing,
        lineHeight,
        textAlign: align,
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {text}
    </div>
  );
};
