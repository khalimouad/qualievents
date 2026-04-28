import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  GraduationCap,
  Mic2,
  Video,
  Users,
  Wrench,
  Network,
} from "lucide-react";
import { SceneFrame } from "../components/SceneFrame";
import { SectionLabel } from "../components/SectionLabel";
import { theme } from "../theme";

const DURATION = 270;

const TYPES = [
  { icon: GraduationCap, label: "Séminaires de formation", color: "#ff7a00" },
  { icon: Mic2, label: "Conférences", color: "#7c3aed" },
  { icon: Video, label: "Webinaires", color: "#06b6d4" },
  { icon: Users, label: "Forums", color: "#10b981" },
  { icon: Wrench, label: "Ateliers", color: "#f59e0b" },
  { icon: Network, label: "Networking", color: "#ef4444" },
];

const TypeCard: React.FC<{
  Icon: typeof GraduationCap;
  label: string;
  color: string;
  delay: number;
}> = ({ Icon, label, color, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - delay);
  const s = spring({ frame: f, fps, config: { damping: 12, stiffness: 130 } });
  const scale = interpolate(s, [0, 1], [0.6, 1]);
  const opacity = interpolate(f, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        width: 280,
        height: 280,
        borderRadius: 32,
        background: theme.surfaceLight,
        border: `1px solid ${theme.border}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: 24,
        boxShadow: `0 16px 48px ${color}33`,
      }}
    >
      <div
        style={{
          width: 110,
          height: 110,
          borderRadius: 24,
          background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 8px 24px ${color}66`,
        }}
      >
        <Icon color="#fff" size={62} strokeWidth={2.2} />
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: theme.text,
          textAlign: "center",
          lineHeight: 1.2,
          letterSpacing: "-0.01em",
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const EventTypes: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const titleLift = interpolate(frame, [0, 16], [30, 0], { extrapolateRight: "clamp" });

  return (
    <SceneFrame durationInFrames={DURATION} glowColor={theme.accent}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          flexDirection: "column",
          paddingTop: 220,
          gap: 28,
        }}
      >
        <SectionLabel text="Tous formats" />

        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleLift}px)`,
            fontSize: 70,
            fontWeight: 900,
            color: theme.text,
            letterSpacing: "-0.03em",
            textAlign: "center",
            paddingInline: 60,
            lineHeight: 1.1,
            fontFamily:
              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          Présentiel · En ligne · Hybride
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 36,
            marginTop: 60,
            paddingInline: 80,
          }}
        >
          {TYPES.map((t, i) => (
            <TypeCard
              key={t.label}
              Icon={t.icon}
              label={t.label}
              color={t.color}
              delay={30 + i * 14}
            />
          ))}
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
