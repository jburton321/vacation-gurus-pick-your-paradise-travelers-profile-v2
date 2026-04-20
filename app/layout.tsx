import type { Metadata, Viewport } from "next";
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
  metadataBase: new URL("https://vacationgurus.com"),
  title: "Pick Your Paradise - Claim Your Bonus Cruise | Vacation Gurus",
  description:
    "Complete your traveler profile and claim your complimentary Caribbean cruise certificate. Your paradise is waiting - Vacation Gurus.",
  authors: [{ name: "Vacation Gurus" }],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    type: "website",
    title: "You're In. Now Claim Your Bonus Cruise.",
    description:
      "Complete your traveler profile and we'll add a complimentary cruise certificate to your package - on us.",
    siteName: "Vacation Gurus",
    url: "https://vacationgurus.com/pick-your-paradise",
    images: [
      {
        url: "https://vacationgurus.com/wp-content/uploads/Primary-Logo-Full-Color.svg",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "You're In. Now Claim Your Bonus Cruise.",
    description:
      "Complete your traveler profile and claim your complimentary Caribbean cruise certificate.",
  },
  icons: {
    icon: "https://vacationgurus.com/wp-content/uploads/Primary-Logo-Full-Color.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
      {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          async
          defer
        />
      )}
    </html>
  );
}
