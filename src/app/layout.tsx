import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { THEME_KEY, themeCss } from "@/lib/themes";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "avan",
  description: "say hi :)",
  openGraph: {
    title: "i'm avan",
    description:
      "high functioning insomniac. 20 y/o weirdo who does things based on instincts and intuition.",
    siteName: "avan's portfolio",
    locale: "en_US",
    type: "website",
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
      </head>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
