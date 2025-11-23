import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Biz yalnız standart Inter şriftini işlədirik
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "bufet.az",
  description: "Tələbələrin Rəqəmsal Məkanı",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az" suppressHydrationWarning={true}>
      <body className={inter.className} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}