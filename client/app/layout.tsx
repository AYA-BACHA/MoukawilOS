import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MoukawilOS",
  description: "Operational platform for Algerian digital and creative freelancers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
