import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { AuthProvider } from "../lib/auth";
import { ThemeProvider } from "../components/theme-provider";
import "./globals.css";

const poppins = Poppins({
  weight: ["100", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BuddyScript",
  description: "Social media application built with Django and Next.js",
  icons: {
    icon: "/assets/images/logo-copy.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
