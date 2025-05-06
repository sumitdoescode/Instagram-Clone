import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { dark } from "@clerk/themes";
import { SWRConfig } from "swr";
import { globalLoadingMiddleware } from "@/lib/swrMiddleware";
import { GlobalLoadingProvider } from "@/contexts/GlobalLoadingContext";
import GlobalSpinner from "@/components/GlobalSpinner";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Instagram Clone",
    description: "Created by sumitdoescode",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <ClerkProvider
                appearance={{
                    baseTheme: dark,
                }}
            >
                <Toaster />
                <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                        <GlobalLoadingProvider>
                            <SWRConfig value={{ use: [globalLoadingMiddleware] }}>
                                <GlobalSpinner />
                                {children}
                            </SWRConfig>
                        </GlobalLoadingProvider>
                        <Toaster />
                    </ThemeProvider>
                </body>
            </ClerkProvider>
        </html>
    );
}
