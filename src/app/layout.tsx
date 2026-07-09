import type { Metadata } from "next";
import { Noto_Sans_Devanagari, Noto_Sans_Oriya } from "next/font/google";

import { Providers } from "@/app/providers";
import "./globals.css";

const notoOriya = Noto_Sans_Oriya({
  subsets: ["oriya"],
  variable: "--font-oriya",
  display: "swap",
});

const notoHindi = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-hindi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jana Samadhan",
  description: "Odisha citizen grievance portal — Jana Samadhan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${notoOriya.variable} ${notoHindi.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
