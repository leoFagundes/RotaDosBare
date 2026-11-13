import type { Metadata, Viewport } from "next";
import { IM_Fell_English, Pirata_One } from "next/font/google";
import "./globals.css";

const pirata = Pirata_One({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-pirata-one",
});

const fell = IM_Fell_English({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-im-fell",
});

export const metadata: Metadata = {
  title: "A Rota do Tesouro",
  description: "Nove bares, nove enigmas, um tesouro.",
};

export const viewport: Viewport = {
  themeColor: "#2a1a0c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${pirata.variable} ${fell.variable} h-full antialiased`}>
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
