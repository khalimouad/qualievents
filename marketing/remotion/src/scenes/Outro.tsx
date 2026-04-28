import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Calendar } from "lucide-react";
import { SceneFrame } from "../components/SceneFrame";
import { theme } from "../theme";

const DURATION = 300;

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const scale = interpolate(logoSpring, [0, 1], [0.7, 1]);
  const opacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  const titleOpacity = interpolate(frame, [22, 40], [0, 1], { extrapolateRight: "clamp" });
  const titleLift = interpolate(frame, [22, 42], [30, 0], { extrapolateRight: "clamp" });

  const urlOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" });
  const urlLift = interpolate(frame, [50, 72], [20, 0], { extrapolateRight: "clamp" });

  const taglineOpacity = interpolate(frame, [82, 102], [0, 1], { extrapolateRight: "clamp" });

  return (
    <SceneFrame durationInFrames={DURATION}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 36,
        }}
      >
        <div
          style={{
            opacity,
            transform: `scale(${scale})`,
            width: 220,
            height: 220,
            borderRadius: 56,
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 20px 80px ${theme.primary}99`,
          }}
        >
          <Calendar color="#ffffff" size={120} strokeWidth={2.4} />
        </div>

        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleLift}px)`,
            fontSize: 110,
            fontWeight: 900,
            color: theme.text,
            letterSpacing: "-0.03em",
            fontFamily:
              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          QualiConnect
        </div>

        <div
          style={{
            opacity: urlOpacity,
            transform: `translateY(${urlLift}px)`,
            fontSize: 36,
            fontWeight: 600,
            color: theme.primary,
            letterSpacing: "0.01em",
            fontFamily: "monospace",
          }}
        >
          qualiconnect.com
        </div>

        <div
          style={{
            opacity: taglineOpacity,
            fontSize: 26,
            fontWeight: 500,
            color: theme.textMuted,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            marginTop: 20,
            fontFamily:
              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          Événements · Inscriptions · Certifications
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
