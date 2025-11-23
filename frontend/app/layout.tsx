import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <--- ƏN VACİB SƏTR BU İDİ (YERİNDƏDİR)

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "bufet.az",
  description: "Tələbələrin Rəqəmsal Məkanı",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // suppressHydrationWarning={true} -> Brauzer uzantılarının xətasını gizlədir
    <html lang="az" suppressHydrationWarning={true}>
      <body className={inter.className} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}