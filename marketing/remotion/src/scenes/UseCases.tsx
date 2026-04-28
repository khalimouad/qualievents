import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { GraduationCap, Building2, Globe2, Sparkles } from "lucide-react";
import { SceneFrame } from "../components/SceneFrame";
import { SectionLabel } from "../components/SectionLabel";
import { theme } from "../theme";

const DURATION = 300;

const CASES = [
  {
    Icon: GraduationCap,
    title: "Cabinets de formation",
    subtitle: "Lead Implementer, ITIL, Risk Manager",
    color: theme.primary,
  },
  {
    Icon: Building2,
    title: "Salons & conférences B2B",
    subtitle: "Sponsors, exposants, networking",
    color: "#7c3aed",
  },
  {
    Icon: Globe2,
    title: "Tournées multi-villes",
    subtitle: "12 séminaires, 11 villes, 1 plateforme",
    color: "#06b6d4",
  },
  {
    Icon: Sparkles,
    title: "Webinaires premium",
    subtitle: "Accès payant sécurisé en ligne",
    color: theme.success,
  },
];

const CaseCard: React.FC<{
  Icon: typeof GraduationCap;
  title: string;
  subtitle: string;
  color: string;
  delay: number;
}> = ({ Icon, title, subtitle, color, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - delay);
  const s = spring({ frame: f, fps, config: { damping: 14, stiffness: 110 } });
  const opacity = interpolate(f, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(s, [0, 1], [50, 0]);
  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        background: theme.surfaceLight,
        border: `1px solid ${theme.border}`,
        borderRadius: 28,
        padding: "32px 30px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        boxShadow: `0 16px 40px ${color}33`,
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 18,
          background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 6px 20px ${color}55`,
        }}
      >
        <Icon color="#fff" size={48} strokeWidth={2.2} />
      </div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 800,
          color: theme.text,
          letterSpacing: "-0.01em",
          lineHeight: 1.15,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 500,
          color: theme.textMuted,
          lineHeight: 1.3,
        }}
      >
        {subtitle}
      </div>
    </div>
  );
};

export const UseCases: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const titleLift = interpolate(frame, [0, 16], [30, 0], { extrapolateRight: "clamp" });

  return (
    <SceneFrame durationInFrames={DURATION} glowColor={theme.accent}>
      <AbsoluteFill
        style={{
          flexDirection: "column",
          paddingTop: 200,
          paddingInline: 60,
          gap: 28,
          alignItems: "center",
        }}
      >
        <SectionLabel text="Pour qui ?" color={theme.accent} />

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
          Conçu pour
          <br />
          <span style={{ color: theme.accent }}>votre métier</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 28,
            marginTop: 36,
            width: "100%",
          }}
        >
          {CASES.map((c, i) => (
            <CaseCard
              key={c.title}
              Icon={c.Icon}
              title={c.title}
              subtitle={c.subtitle}
              color={c.color}
              delay={28 + i * 16}
            />
          ))}
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
