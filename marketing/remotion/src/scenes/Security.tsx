import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Lock, ShieldCheck, FileLock2, Fingerprint } from "lucide-react";
import { SceneFrame } from "../components/SceneFrame";
import { SectionLabel } from "../components/SectionLabel";
import { FeatureBullet } from "../components/FeatureBullet";
import { theme } from "../theme";

const DURATION = 270;

export const Security: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const titleLift = interpolate(frame, [0, 16], [30, 0], { extrapolateRight: "clamp" });
  const color = theme.success;

  return (
    <SceneFrame durationInFrames={DURATION} glowColor={color}>
      <AbsoluteFill
        style={{
          flexDirection: "column",
          paddingTop: 200,
          paddingInline: 70,
          gap: 28,
          alignItems: "center",
        }}
      >
        <SectionLabel text="Sécurité & RGPD" color={color} />

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
          <span style={{ color }}>la conformité</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 26,
            marginTop: 36,
            width: "100%",
          }}
        >
          <FeatureBullet
            delay={30}
            color={color}
            icon={<Lock color="#fff" size={48} strokeWidth={2.4} />}
            title="Chiffrement AES-256"
            subtitle="Secrets de paiement & mots de passe"
          />
          <FeatureBullet
            delay={56}
            color={color}
            icon={<ShieldCheck color="#fff" size={48} strokeWidth={2.4} />}
            title="Webhooks signés HMAC"
            subtitle="Anti-fraude bancaire"
          />
          <FeatureBullet
            delay={82}
            color={color}
            icon={<FileLock2 color="#fff" size={48} strokeWidth={2.4} />}
            title="Journal d'audit"
            subtitle="Traçabilité complète des actions"
          />
          <FeatureBullet
            delay={108}
            color={color}
            icon={<Fingerprint color="#fff" size={48} strokeWidth={2.4} />}
            title="Rôles différenciés"
            subtitle="Admin, staff, hôte d'accueil"
          />
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
