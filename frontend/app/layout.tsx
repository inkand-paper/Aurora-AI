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
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      </head>
      <body style={{ margin: 0, padding: 0, width: "100%", overflowX: "hidden" }}>
        {children}
      </body>
    </html>
  );
}