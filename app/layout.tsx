import type { Metadata } from "next";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { PrivyProvider } from "./providers/privy-provider";
import AIChat from "./components/ai-chat";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Nirvana Digital Protocol",
  description:
    "Precision Vesting & Automated Token Streams for high-growth projects.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable} min-h-screen antialiased`}
      >
        <PrivyProvider>
          {children}
          <AIChat />
        </PrivyProvider>
      </body>
    </html>
  );
}
