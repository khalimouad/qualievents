import { prisma } from "@/lib/prisma";
import type { CSSProperties } from "react";

// Mix a hex colour with white or black by `amount` (0..1) and return a hex string.
function mix(hex: string, target: "black" | "white", amount: number): string {
  const m = hex.replace("#", "").match(/.{1,2}/g);
  if (!m || m.length < 3) return hex;
  const [r, g, b] = m.slice(0, 3).map((c) => parseInt(c.length === 1 ? c + c : c, 16));
  const t = target === "black" ? 0 : 255;
  const mixOne = (c: number) => Math.round(c + (t - c) * amount);
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(mixOne(r))}${toHex(mixOne(g))}${toHex(mixOne(b))}`;
}

export default async function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    select: { themeColor: true },
  });

  const themeColor = event?.themeColor;

  // Override --primary (and derived shades) so every primary-tinted utility on
  // the public event routes (page, register, badge, checkout) picks up the
  // event's brand colour without relying on color-mix() at runtime.
  const themeStyle: CSSProperties | undefined = themeColor
    ? ({
        "--primary": themeColor,
        "--primary-dark": mix(themeColor, "black", 0.18),
        "--primary-light": mix(themeColor, "white", 0.28),
      } as CSSProperties)
    : undefined;

  return <div style={themeStyle}>{children}</div>;
}
