import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Award, ShieldCheck, FileBadge } from "lucide-react";
import { SceneFrame } from "../components/SceneFrame";
import { SectionLabel } from "../components/SectionLabel";
import { theme } from "../theme";

const DURATION = 270;

const CertificateMockup: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - delay);
  const s = spring({ frame: f, fps, config: { damping: 12, stiffness: 100 } });
  const opacity = interpolate(f, [0, 16], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(s, [0, 1], [0.7, 1]);
  const tilt = interpolate(s, [0, 1], [-10, -3]);

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale}) rotate(${tilt}deg)`,
        width: 720,
        height: 510,
        background: "linear-gradient(135deg, #faf6e8 0%, #ffffff 100%)",
        borderRadius: 16,
        padding: 36,
        border: `8px solid ${theme.primary}`,
        boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        position: "relative",
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: theme.primary,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
        }}
      >
        Certificat
      </div>
      <div
        style={{
          fontSize: 38,
          fontWeight: 900,
          color: "#1a1a2e",
          letterSpacing: "-0.02em",
          textAlign: "center",
        }}
      >
        Lead Implementer
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: "#1a1a2e",
          fontStyle: "italic",
        }}
      >
        Décerné à Mariam Diop
      </div>
      <div
        style={{
          width: 140,
          height: 3,
          background: theme.primary,
          margin: "8px 0",
        }}
      />
      <div
        style={{
          fontSize: 16,
          color: "#444",
          fontFamily: "monospace",
        }}
      >
        Vérifier : qualiconnect.com/verify/J7K9M2P4Q
      </div>
      {/* Mock QR */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          width: 88,
          height: 88,
          background: "#fff",
          padding: 6,
          borderRadius: 8,
          border: "2px solid #1a1a2e",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundImage: `repeating-linear-gradient(0deg, #1a1a2e 0 4px, transparent 4px 8px), repeating-linear-gradient(90deg, #1a1a2e 0 4px, transparent 4px 8px)`,
            backgroundBlendMode: "multiply",
          }}
        />
      </div>
    </div>
  );
};

export const Certificates: React.FC = () => {
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
        <SectionLabel text="Certificats vérifiables" />

        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleLift}px)`,
            fontSize: 70,
            fontWeight: 900,
            color: theme.text,
            letterSpacing: "-0.03em",
            textAlign: "center",
            lineHeight: 1.05,
            fontFamily:
              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          PDF authentifiable
          <br />
          en un scan
        </div>

        <CertificateMockup delay={32} />

        <div
          style={{
            display: "flex",
            gap: 60,
            marginTop: 16,
            opacity: interpolate(frame, [120, 150], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {[
            { Icon: Award, label: "Code unique" },
            { Icon: ShieldCheck, label: "Vérification publique" },
            { Icon: FileBadge, label: "Anti-falsification" },
          ].map(({ Icon, label }) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Icon color={theme.primary} size={48} strokeWidth={2.2} />
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: theme.textMuted,
                  textAlign: "center",
                  letterSpacing: "0.02em",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
