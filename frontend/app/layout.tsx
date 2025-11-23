import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
        /* suppressHydrationWarning={true} 
          Bu, brauzer əlavələrinin (Dark Reader, Grammarly və s.) 
          koda müdaxilə etməsi zamanı çıxan qırmızı xətaları gizlədir.
        */
        <html lang="az" suppressHydrationWarning={true}>
            <body className={inter.className} suppressHydrationWarning={true}>
                {/* bg-slate-900 və ya bg-[#0F172A] sildik */}
                {children}
               
            </body>
        </html>
    );
}