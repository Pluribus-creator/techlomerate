import type { Metadata } from "next";
import { EB_Garamond, DM_Sans } from "next/font/google";
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
  title: "Techlomerate",
  description: "A record of the development of AI, held in stillness.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}