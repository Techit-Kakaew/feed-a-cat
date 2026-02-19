import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://feedacat.click"),
  title: {
    default: "feedacat",
    template: "%s | feedacat",
  },
  description:
    "Join the global feedacat challenge! Click to serve kibbles, climb the leaderboard, and represent your country in this viral cat feeding game. Meow!",
  keywords: [
    "feedacat",
    "cat game",
    "clicker game",
    "viral game",
    "feed the cat",
    "cat feeding simulation",
    "global challenge",
  ],
  authors: [{ name: "feedacat team" }],
  openGraph: {
    title: "feedacat",
    description:
      "The World's Tastiest Clicker Challenge. Feed the cat, represent your country!",
    url: "https://feedacat.click",
    siteName: "feedacat",
    images: [
      {
        url: "/og-image.png", // Make sure this file exists in /public
        width: 1200,
        height: 630,
        alt: "feedacat - Global Cat Feeding Game",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "feedacat | Global Cat Feeding Challenge",
    description:
      "How many kibbles can you serve? Join players worldwide in the ultimate cat feeding game!",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  other: {
    "google-adsense-account": "ca-pub-3137127172905854",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3137127172905854"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
