import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ritam Mukherjee | Portfolio",
  description: "Interactive portfolio experience",
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
