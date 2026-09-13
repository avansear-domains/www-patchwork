import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { THEME_KEY, themeCss } from "@/lib/themes";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://avansear.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "avan",
  description: "say hi :)",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favi.png", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favi.png",
  },
  openGraph: {
    title: "i'm avan",
    description:
      "high functioning insomniac. 20 y/o weirdo who does things based on instincts and intuition.",
    siteName: "avan's portfolio",
    url: baseUrl,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${baseUrl}/og?title=${encodeURIComponent("i'm avan")}&v=2`,
        width: 1200,
        height: 630,
        alt: "avan's portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "i'm avan",
    description:
      "high functioning insomniac. 20 y/o weirdo who does things based on instincts and intuition.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// Runs before paint so a saved theme applies without a flash.
const themeInit = `try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});if(t)document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geist.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        {process.env.RYBBIT_SITE_ID && (
          <script
            src="https://app.rybbit.io/api/script.js"
            data-site-id={process.env.RYBBIT_SITE_ID}
            defer
          />
        )}
      </head>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
