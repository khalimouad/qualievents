import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ArrowRight } from "lucide-react";
import { SceneFrame } from "../components/SceneFrame";
import { theme } from "../theme";

const DURATION = 270;

export const CallToAction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const titleLift = interpolate(frame, [0, 22], [40, 0], { extrapolateRight: "clamp" });

  const subOpacity = interpolate(frame, [26, 44], [0, 1], { extrapolateRight: "clamp" });
  const subLift = interpolate(frame, [26, 46], [25, 0], { extrapolateRight: "clamp" });

  const ctaSpring = spring({ frame: Math.max(0, frame - 56), fps, config: { damping: 12, stiffness: 100 } });
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.7, 1]);
  const ctaOpacity = interpolate(frame, [56, 74], [0, 1], { extrapolateRight: "clamp" });

  // Pulse on CTA
  const pulse = interpolate(
    Math.sin((frame - 56) * 0.12),
    [-1, 1],
    [1, 1.04]
  );

  return (
    <SceneFrame durationInFrames={DURATION} glowColor={theme.primary}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 40,
          paddingInline: 70,
        }}
      >
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleLift}px)`,
            fontSize: 92,
            fontWeight: 900,
            color: theme.text,
            letterSpacing: "-0.03em",
            textAlign: "center",
            lineHeight: 1.05,
            fontFamily:
              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          Prêt à
          <br />
          <span
            style={{
              background: `linear-gradient(135deg, ${theme.primary} 0%, #ff5e00 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            transformer
          </span>
          <br />
          vos événements ?
        </div>

        <div
          style={{
            opacity: subOpacity,
            transform: `translateY(${subLift}px)`,
            fontSize: 32,
            fontWeight: 500,
            color: theme.textMuted,
            textAlign: "center",
            letterSpacing: "0.01em",
            lineHeight: 1.4,
            paddingInline: 30,
          }}
        >
          Démo gratuite · Mise en route en 24h
          <br />
          Pas d'engagement
        </div>

        <div
          style={{
            opacity: ctaOpacity,
            transform: `scale(${ctaScale * pulse})`,
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            padding: "32px 60px",
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
            borderRadius: 999,
            fontSize: 38,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.01em",
            boxShadow: `0 20px 60px ${theme.primary}88, 0 0 100px ${theme.primary}44`,
            fontFamily:
              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          Demander une démo
          <ArrowRight color="#fff" size={42} strokeWidth={2.6} />
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
