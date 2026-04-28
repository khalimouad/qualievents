import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { theme } from "../theme";

const DURATION = 120;

export const Tagline: React.FC = () => {
  const frame = useCurrentFrame();
  const lineOpacity = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" });
  const lineLift = interpolate(frame, [0, 18], [40, 0], { extrapolateRight: "clamp" });

  const sub1Opacity = interpolate(frame, [22, 38], [0, 1], { extrapolateRight: "clamp" });
  const sub1Lift = interpolate(frame, [22, 40], [25, 0], { extrapolateRight: "clamp" });

  const sub2Opacity = interpolate(frame, [44, 60], [0, 1], { extrapolateRight: "clamp" });
  const sub2Lift = interpolate(frame, [44, 62], [25, 0], { extrapolateRight: "clamp" });

  const sub3Opacity = interpolate(frame, [66, 82], [0, 1], { extrapolateRight: "clamp" });
  const sub3Lift = interpolate(frame, [66, 84], [25, 0], { extrapolateRight: "clamp" });

  const baseStyle: React.CSSProperties = {
    fontSize: 56,
    fontWeight: 800,
    color: theme.text,
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
    textAlign: "center",
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  return (
    <SceneFrame durationInFrames={DURATION}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 36,
          paddingInline: 80,
        }}
      >
        <div
          style={{
            ...baseStyle,
            opacity: lineOpacity,
            transform: `translateY(${lineLift}px)`,
            fontSize: 52,
            color: theme.textMuted,
            fontWeight: 600,
          }}
        >
          De l'inscription à la certification
        </div>

        <div
          style={{
            ...baseStyle,
            opacity: sub1Opacity,
            transform: `translateY(${sub1Lift}px)`,
            color: theme.primary,
          }}
        >
          Tout-en-un.
        </div>

        <div
          style={{
            ...baseStyle,
            opacity: sub2Opacity,
            transform: `translateY(${sub2Lift}px)`,
            color: theme.primary,
          }}
        >
          Sécurisé.
        </div>

        <div
          style={{
            ...baseStyle,
            opacity: sub3Opacity,
            transform: `translateY(${sub3Lift}px)`,
            color: theme.primary,
          }}
        >
          Conforme RGPD.
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
