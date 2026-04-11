import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QualiEvents — Gestion d'événements premium",
  description:
    "Gérez vos événements avec style. Pages de présentation, inscription, badges QR, invitations, et plus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-192.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
