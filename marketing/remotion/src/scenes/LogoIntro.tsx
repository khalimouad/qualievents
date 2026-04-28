import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Calendar } from "lucide-react";
import { SceneFrame } from "../components/SceneFrame";
import { theme } from "../theme";

const DURATION = 90;

export const LogoIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
  const scale = interpolate(logoSpring, [0, 1], [0.4, 1]);
  const rotate = interpolate(logoSpring, [0, 1], [-25, 0]);
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  const titleOpacity = interpolate(frame, [22, 34], [0, 1], { extrapolateRight: "clamp" });
  const titleLift = interpolate(frame, [22, 38], [30, 0], { extrapolateRight: "clamp" });

  const taglineOpacity = interpolate(frame, [38, 52], [0, 1], { extrapolateRight: "clamp" });
  const taglineLift = interpolate(frame, [38, 54], [20, 0], { extrapolateRight: "clamp" });

  return (
    <SceneFrame durationInFrames={DURATION}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 40,
        }}
      >
        <div
          style={{
            opacity,
            transform: `scale(${scale}) rotate(${rotate}deg)`,
            width: 260,
            height: 260,
            borderRadius: 64,
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 20px 80px ${theme.primary}99, 0 0 120px ${theme.primary}44`,
          }}
        >
          <Calendar color="#ffffff" size={140} strokeWidth={2.4} />
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
            opacity: taglineOpacity,
            transform: `translateY(${taglineLift}px)`,
            fontSize: 32,
            fontWeight: 500,
            color: theme.textMuted,
            letterSpacing: "0.02em",
            textAlign: "center",
            paddingInline: 80,
            fontFamily:
              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          La plateforme événementielle nouvelle génération
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
