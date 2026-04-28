import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Mail, Send, Bell, MailOpen } from "lucide-react";
import { SceneFrame } from "../components/SceneFrame";
import { SectionLabel } from "../components/SectionLabel";
import { FeatureBullet } from "../components/FeatureBullet";
import { theme } from "../theme";

const DURATION = 270;

export const Communication: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const titleLift = interpolate(frame, [0, 16], [30, 0], { extrapolateRight: "clamp" });

  return (
    <SceneFrame durationInFrames={DURATION} glowColor="#06b6d4">
      <AbsoluteFill
        style={{
          flexDirection: "column",
          paddingTop: 200,
          paddingInline: 70,
          gap: 28,
          alignItems: "center",
        }}
      >
        <SectionLabel text="Communication" color="#06b6d4" />

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
          Newsletter intégrée
          <br />
          <span style={{ color: "#06b6d4" }}>+ emails automatiques</span>
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
            color="#06b6d4"
            icon={<Mail color="#fff" size={48} strokeWidth={2.4} />}
            title="Confirmation immédiate"
            subtitle="Badge QR envoyé par email"
          />
          <FeatureBullet
            delay={56}
            color="#06b6d4"
            icon={<Send color="#fff" size={48} strokeWidth={2.4} />}
            title="Modèles prêts à l'emploi"
            subtitle="Rappels J-7, programme final…"
          />
          <FeatureBullet
            delay={82}
            color="#06b6d4"
            icon={<Bell color="#fff" size={48} strokeWidth={2.4} />}
            title="Envoi en arrière-plan"
            subtitle="Listes massives, sans timeout"
          />
          <FeatureBullet
            delay={108}
            color="#06b6d4"
            icon={<MailOpen color="#fff" size={48} strokeWidth={2.4} />}
            title="Désabonnement RGPD"
            subtitle="Un clic, conforme RFC 8058"
          />
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
