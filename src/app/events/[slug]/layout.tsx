import { prisma } from "@/lib/prisma";
import type { CSSProperties } from "react";

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

  // Override --primary (and derived shades) with the event theme color so
  // every primary-tinted utility on the public event page picks up the brand.
  const themeStyle: CSSProperties | undefined = themeColor
    ? ({
        "--primary": themeColor,
        "--primary-dark": `color-mix(in srgb, ${themeColor}, black 18%)`,
        "--primary-light": `color-mix(in srgb, ${themeColor}, white 28%)`,
      } as CSSProperties)
    : undefined;

  return <div style={themeStyle}>{children}</div>;
}
