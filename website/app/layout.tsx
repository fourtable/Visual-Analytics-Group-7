import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";
import { MotionReady } from "@/components/motion/MotionReady";
import { site } from "@/content/site";
import { EMBEDDING_API_SRC } from "@/lib/tableau";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

// Absolute base for the social-preview image. Vercel provides the production host.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: site.metaTitle,
  description: site.description,
  icons: { icon: { url: "/favicon.svg", type: "image/svg+xml" } },
  openGraph: {
    type: "website",
    title: site.metaTitle,
    description: site.description,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: site.ogImageAlt }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.metaTitle,
    description: site.description,
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

/*
 * Motion flag (Build Plan › How it's built in React): adds `motion` to <html> before
 * first paint, only when reduced motion isn't requested. If the app never starts
 * (MotionReady didn't run), the class is removed after 4 s so nothing stays hidden.
 */
const motionFlag =
  "if(!matchMedia('(prefers-reduced-motion: reduce)').matches){var d=document.documentElement;d.classList.add('motion');setTimeout(function(){if(!d.dataset.ready)d.classList.remove('motion')},4000)}";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionFlag }} />
        <link rel="preconnect" href="https://public.tableau.com" />
      </head>
      <body>
        {children}
        <MotionReady />
        {/* Tableau Embedding API v3, loaded once for every dashboard on the page. */}
        <Script type="module" src={EMBEDDING_API_SRC} strategy="afterInteractive" />
      </body>
    </html>
  );
}
