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

const themeInit = `try{var t=localStorage.getItem("moukawil_theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${jetbrainsMono.variable} ${tinos.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
