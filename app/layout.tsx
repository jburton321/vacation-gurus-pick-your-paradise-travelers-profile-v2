import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const orangeLemonade = localFont({
  src: "../public/fonts/orange-lemonade.otf",
  variable: "--font-highlight",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vacation Gurus | Pick Your Paradise",
  description:
    "Traveler profile experience for Vacation Gurus, where your adventure begins here.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${orangeLemonade.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
