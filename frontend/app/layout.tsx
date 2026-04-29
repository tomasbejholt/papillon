import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Papillon — Butterfly Classifier",
  description: "AI-powered classification of butterflies and moths using MLP, CNN, and pretrained models.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="gradient-bg min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20">{children}</main>
      </body>
    </html>
  );
}
