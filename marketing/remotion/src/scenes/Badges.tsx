import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { QrCode, ScanLine, Smartphone, BarChart3 } from "lucide-react";
import { SceneFrame } from "../components/SceneFrame";
import { SectionLabel } from "../components/SectionLabel";
import { theme } from "../theme";

const DURATION = 270;

const Stat: React.FC<{ value: string; label: string; delay: number; color: string }> = ({
  value,
  label,
  delay,
  color,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - delay);
  const s = spring({ frame: f, fps, config: { damping: 14, stiffness: 120 } });
  const opacity = interpolate(f, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(s, [0, 1], [0.7, 1]);
  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        flex: 1,
        background: theme.surfaceLight,
        border: `1px solid ${theme.border}`,
        borderRadius: 28,
        padding: "32px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "center",
        boxShadow: `0 12px 32px ${color}33`,
      }}
    >
      <div
        style={{
          fontSize: 64,
          fontWeight: 900,
          color,
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: theme.textMuted,
          textAlign: "center",
          letterSpacing: "0.02em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
};

const QRBlock: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - delay);
  const s = spring({ frame: f, fps, config: { damping: 12, stiffness: 100 } });
  const opacity = interpolate(f, [0, 16], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(s, [0, 1], [0.5, 1]);

  // Scan-line sweep
  const sweep = interpolate(f, [40, 100], [-100, 100], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        position: "relative",
        width: 380,
        height: 380,
        borderRadius: 36,
        background: "#fff",
        padding: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 24px 80px ${theme.primary}66`,
        overflow: "hidden",
      }}
    >
      <QrCode color="#0a0a0f" size={300} strokeWidth={1.5} />
      {/* Scan-line */}
      <div
        style={{
          position: "absolute",
          left: 36,
          right: 36,
          top: `${sweep}%`,
          height: 4,
          background: theme.primary,
          boxShadow: `0 0 20px ${theme.primary}, 0 0 40px ${theme.primary}`,
          borderRadius: 4,
          opacity: f > 30 && f < 100 ? 1 : 0,
        }}
      />
    </div>
  );
};

export const Badges: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const titleLift = interpolate(frame, [0, 16], [30, 0], { extrapolateRight: "clamp" });

  return (
    <SceneFrame durationInFrames={DURATION} glowColor={theme.primary}>
      <AbsoluteFill
        style={{
          flexDirection: "column",
          paddingTop: 180,
          paddingInline: 60,
          gap: 30,
          alignItems: "center",
        }}
      >
        <SectionLabel text="Badges & accueil" />

        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleLift}px)`,
            fontSize: 76,
            fontWeight: 900,
            color: theme.text,
            letterSpacing: "-0.03em",
            textAlign: "center",
            lineHeight: 1.05,
            fontFamily:
              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          QR codes &
          <br />
          <span style={{ color: theme.primary }}>scan instantané</span>
        </div>

        <QRBlock delay={36} />

        <div
          style={{
            display: "flex",
            gap: 22,
            width: "100%",
            marginTop: 16,
          }}
        >
          <Stat value="< 1s" label="Temps de scan" delay={120} color={theme.primary} />
          <Stat value="100%" label="Anti-fraude" delay={140} color={theme.success} />
          <Stat value="📱" label="Mobile-first" delay={160} color={theme.accent} />
        </div>

        {/* Tiny icon row */}
        <div
          style={{
            opacity: interpolate(frame, [180, 210], [0, 1], { extrapolateRight: "clamp" }),
            display: "flex",
            gap: 38,
            marginTop: 8,
          }}
        >
          <ScanLine color={theme.textMuted} size={36} />
          <Smartphone color={theme.textMuted} size={36} />
          <BarChart3 color={theme.textMuted} size={36} />
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
