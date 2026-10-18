import type { Metadata } from "next";
import { Geist, JetBrains_Mono, Tinos } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });
const tinos = Tinos({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"], variable: "--font-tinos" });

export const metadata: Metadata = {
  title: "MoukawilOS",
  description: "Fiscal OS for Algerian auto-entrepreneurs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${jetbrainsMono.variable} ${tinos.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
