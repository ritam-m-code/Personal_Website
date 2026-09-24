import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ritammukherjee.ca"),
  title: "Ritam Mukherjee — Mechatronics Engineer",
  description:
    "Mechatronics engineer working across hardware and software — production ML and robotics research at the University of Waterloo.",
  openGraph: {
    title: "Ritam Mukherjee — Mechatronics Engineer",
    description:
      "Mechatronics engineer working across hardware and software — production ML and robotics research at the University of Waterloo.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
