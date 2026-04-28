import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { UserPlus, CreditCard, Building2, Tag } from "lucide-react";
import { SceneFrame } from "../components/SceneFrame";
import { SectionLabel } from "../components/SectionLabel";
import { FeatureBullet } from "../components/FeatureBullet";
import { theme } from "../theme";

const DURATION = 270;

export const Registration: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const titleLift = interpolate(frame, [0, 16], [30, 0], { extrapolateRight: "clamp" });

  return (
    <SceneFrame durationInFrames={DURATION} glowColor={theme.primary}>
      <AbsoluteFill
        style={{
          flexDirection: "column",
          paddingTop: 200,
          paddingInline: 70,
          gap: 28,
          alignItems: "center",
        }}
      >
        <SectionLabel text="Inscription & paiement" />

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
            paddingInline: 30,
            fontFamily:
              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          Vendez vos places
          <br />
          en quelques clics
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 26,
            marginTop: 40,
            width: "100%",
          }}
        >
          <FeatureBullet
            delay={30}
            icon={<UserPlus color="#fff" size={48} strokeWidth={2.4} />}
            title="Inscription publique"
            subtitle="Formulaire fluide, mobile-first"
          />
          <FeatureBullet
            delay={56}
            icon={<Tag color="#fff" size={48} strokeWidth={2.4} />}
            title="Tarifs multiples"
            subtitle="Early bird, étudiant, groupe…"
          />
          <FeatureBullet
            delay={82}
            icon={<CreditCard color="#fff" size={48} strokeWidth={2.4} />}
            title="Paiement CinetPay"
            subtitle="Mobile Money, carte, Wave"
          />
          <FeatureBullet
            delay={108}
            icon={<Building2 color="#fff" size={48} strokeWidth={2.4} />}
            title="Réservations groupées"
            subtitle="Facture PDF B2B automatique"
          />
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
