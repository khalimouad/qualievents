import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QualiEvents - Premium Event Management",
  description:
    "Manage events with style. Landing pages, registration, QR badges, invitations, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
