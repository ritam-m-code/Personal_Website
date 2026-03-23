import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ritam-m.work";

export const metadata: Metadata = {
  title: "Ritam Mukherjee | Portfolio",
  description: "Portfolio of Ritam Mukherjee - mechatronics, robotics, and software projects.",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ritam Mukherjee | Portfolio",
    description: "Mechatronics student building reliable robotics and software systems.",
    url: "/",
    siteName: "Ritam Mukherjee Portfolio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ritam Mukherjee | Portfolio",
    description: "Mechatronics student building reliable robotics and software systems.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/icon?v=2", type: "image/png" },
      { url: "/favicon.svg?v=2", type: "image/svg+xml" },
    ],
    shortcut: "/icon?v=2",
    apple: "/icon?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
