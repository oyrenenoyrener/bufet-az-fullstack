import { geistMono } from "./geistMono";
import { geistSans } from "./geistSans";


export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                {children}
            </body>
            suppressHydrationWarning
        </html>
    );
}
