import type { Metadata } from "next";
import { Allison, Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "500"],
});

const allison = Allison({
  variable: "--font-allison",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "themodumaliq photography",
  description: "themodumaliq photography",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${cormorant.variable} ${allison.variable} h-full bg-background antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">{children}</body>
    </html>
  );
}
