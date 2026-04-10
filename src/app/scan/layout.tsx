import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "QualiEvents Scanner",
  description: "Scan attendee badges at the event entrance",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "QE Scanner",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

export default function ScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-secondary text-white overflow-hidden">
      {children}
    </div>
  );
}
