import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Geist, JetBrains_Mono, Noto_Sans_Arabic, Tinos } from "next/font/google";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { I18nProvider } from "@/lib/i18n/provider";
import { DEFAULT_LANG, LANG_COOKIE, LANG_META, isLang } from "@/lib/i18n/config";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });
const notoArabic = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-arabic", preload: false });
const tinos = Tinos({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"], variable: "--font-tinos" });

export const metadata: Metadata = {
  title: "MoukawilOS",
  description: "Fiscal OS for Algerian auto-entrepreneurs",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const themeInit = `try{var t=localStorage.getItem("moukawil_theme");if(t==="dark")document.documentElement.classList.add("dark");else document.documentElement.classList.remove("dark")}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const stored = (await cookies()).get(LANG_COOKIE)?.value;
  const lang = isLang(stored) ? stored : DEFAULT_LANG;

  return (
    <html lang={lang} dir={LANG_META[lang].dir} suppressHydrationWarning className={`${geist.variable} ${jetbrainsMono.variable} ${tinos.variable} ${notoArabic.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="antialiased min-h-dvh overflow-x-hidden">
        <I18nProvider initialLang={lang}>
          <NavigationProgress />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
