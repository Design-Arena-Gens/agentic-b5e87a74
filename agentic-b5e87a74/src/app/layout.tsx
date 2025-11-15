import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Menschen-Wissensagent",
  description:
    "Frag den Menschen-Agenten nach Fakten zu Biologie, Psychologie, Gesundheit, Kultur und Geschichte.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-slate-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}
