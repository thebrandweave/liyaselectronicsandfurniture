import type { Metadata } from "next";
import "./fonts.css";
import "./globals.css";
import "./showroom.css";

export const metadata: Metadata = {
  title: "Liyas Electronics & Furniture | Thirthahalli",
  description:
    "Discover electronics, home appliances and furniture at Liyas, Sheshashayi Complex, Seebinakere, Sagara Road, Thirthahalli.",

  other: {
    "codex-preview": "development",
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}