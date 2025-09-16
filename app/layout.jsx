import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { dark } from "@clerk/themes";
import UserContextProvider from "@/contexts/UserContextProvider";

const dmSans = DM_Sans({
    // variable: "--font-DM_Sans",
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
                <body className={`${dmSans.className} antialiased`}>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                        <UserContextProvider>{children}</UserContextProvider>
                        <Toaster />
                    </ThemeProvider>
                </body>
            </ClerkProvider>
        </html>
    );
}
