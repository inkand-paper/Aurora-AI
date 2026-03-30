import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google"; // [1] Import fonts
import "./globals.css";

// [2] Configure fonts
const syne = Syne({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700", "800"],
  variable: '--font-syne' 
});

const dmSans = DM_Sans({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600"],
  variable: '--font-dm-sans'
});

export const metadata: Metadata = {
  title: "AURORA — AI Academic Survival System",
  description: "AI-powered academic survival. Study smarter, understand faster, earn sooner.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // [3] Apply fonts to the HTML tag
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}