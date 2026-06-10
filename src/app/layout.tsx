import type { Metadata } from "next";
import { EB_Garamond, DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const serif = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Techlomerate — AI news, clearly told",
  description: "A daily record of artificial intelligence — curated, summarized, and held in stillness. Honest reporting without hype.",
  verification: {
    google: "iWnpECzPgqlifopKrFsdrBmHJTsMedRux3UhJOB0epI",
  },
  other: {
    "google-adsense-account": "ca-pub-9158919677237359",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9158919677237359"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
