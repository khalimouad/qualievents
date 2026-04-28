import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

interface Props {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  delay: number;
  color?: string;
}

/** A bullet card with a coloured icon block on the left, animates in from bottom. */
export const FeatureBullet: React.FC<Props> = ({
  icon,
  title,
  subtitle,
  delay,
  color = theme.primary,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - delay);
  const s = spring({ frame: f, fps, config: { damping: 14, stiffness: 130 } });
  const opacity = interpolate(f, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const x = interpolate(s, [0, 1], [-60, 0]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 28,
        background: theme.surfaceLight,
        borderRadius: 24,
        padding: "26px 36px",
        border: `1px solid ${theme.border}`,
        boxShadow: `0 12px 40px ${color}22`,
        opacity,
        transform: `translateX(${x}px)`,
      }}
    >
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: 20,
          background: `linear-gradient(135deg, ${color} 0%, ${theme.primaryDark} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          flexShrink: 0,
          boxShadow: `0 8px 24px ${color}66`,
        }}
      >
        {icon}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        <div
          style={{
            fontSize: 38,
            fontWeight: 800,
            color: theme.text,
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: 24,
              fontWeight: 500,
              color: theme.textMuted,
              lineHeight: 1.3,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
