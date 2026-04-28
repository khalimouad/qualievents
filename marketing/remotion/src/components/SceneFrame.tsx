import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";

/** Wraps a scene with a vertical gradient background and a subtle radial glow.
 *  Adds an in-fade and out-fade so cuts between scenes are buttery. */
export const SceneFrame: React.FC<{
  durationInFrames: number;
  glowColor?: string;
  children: React.ReactNode;
}> = ({ durationInFrames, glowColor = theme.primary, children }) => {
  const frame = useCurrentFrame();
  const inFade = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const outFade = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const opacity = Math.min(inFade, outFade);

  return (
    <AbsoluteFill
      style={{
        opacity,
        background: `linear-gradient(180deg, ${theme.bg} 0%, ${theme.surface} 100%)`,
      }}
    >
      {/* Soft radial glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 30%, ${glowColor}33 0%, transparent 55%)`,
        }}
      />
      {/* Diagonal grid lines, very faint */}
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            ${theme.border} 0px,
            ${theme.border} 1px,
            transparent 1px,
            transparent 80px
          )`,
          opacity: 0.4,
        }}
      />
      {children}
    </AbsoluteFill>
  );
};
