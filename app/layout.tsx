import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/constants";
import { MetaPixel } from "@/components/analytics/MetaPixel";

const playfair = Playfair_Display({
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Is the Endomax Lift right for you? · Harley Street Aesthetics",
  description:
    "A 60-second suitability guide for the Endomax Lift — advanced non-surgical skin tightening at Harley Street Aesthetics, London & Glasgow.",
  openGraph: {
    title:
      "Discover if the Endomax Lift is right for you · Harley Street Aesthetics",
    description:
      "Take the 60-second Endomax Lift suitability analysis with London's premier aesthetic centre.",
    url: SITE_URL,
    siteName: "Harley Street Aesthetics",
    locale: "en_GB",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-GB"
      className={`${playfair.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <MetaPixel />
      </body>
    </html>
  );
}
