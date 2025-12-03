"use client";

import type { Metadata } from "next";
import { GeistSans, GeistMono } from 'geist/font';
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { MainSidebar } from "@/components/layout/main-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/AuthContext";
import { usePathname } from "next/navigation"; // Import usePathname
import { useIsMobile } from "@/hooks/use-mobile"; // Import useIsMobile
import { MobileSidebar } from "@/components/layout/mobile-sidebar"; // Import MobileSidebar

const geistSans = GeistSans;
const geistMono = GeistMono;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Synapse AI Dashboard",
  description: "User dashboard for Synapse AI chatbot management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  // Define paths where the sidebar should NOT be displayed
  const noSidebarPaths = ['/login', '/forgot-password', '/update-password', '/confirm-email'];
  const showSidebar = !noSidebarPaths.includes(pathname);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${poppins.variable} antialiased`}
      >
        <AuthProvider>
          <div className="flex min-h-screen">
            {showSidebar && (isMobile ? <MobileSidebar /> : <MainSidebar />)}
            <div className={`flex-1 ${showSidebar ? (isMobile ? 'ml-0' : 'ml-64') : 'ml-0'}`}>
              {children}
            </div>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}