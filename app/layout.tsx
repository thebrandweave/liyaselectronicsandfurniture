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
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
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
