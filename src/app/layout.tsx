"use client";

import { GeistSans, GeistMono } from 'geist/font';
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { MainSidebar } from "@/components/layout/main-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/AuthContext";
import { usePathname } from "next/navigation"; // Import usePathname
import { useIsMobile } from "@/hooks/use-mobile"; // Import useIsMobile
import { MobileSidebar } from "@/components/layout/mobile-sidebar"; // Import MobileSidebar
import { useEffect, useState } from "react"; // Import useEffect and useState

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

// Removed metadata export as it's not allowed in a Client Component
// export const metadata: Metadata = {
//   title: "Synapse AI Dashboard",
//   description: "User dashboard for Synapse AI chatbot management",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false); // New state for client-side mounting

  useEffect(() => {
    setMounted(true); // Set to true once component mounts on client
  }, []);

  // Define paths where the sidebar should NOT be displayed
  const noSidebarPaths = ['/login', '/forgot-password', '/update-password', '/confirm-email'];
  const showSidebar = !noSidebarPaths.includes(pathname);

  // Determine which sidebar to show and content margin
  let sidebarComponent = null;
  let mainContentClass = 'ml-0';

  if (showSidebar) {
    if (!mounted) {
      // On server render or initial client render before useEffect,
      // default to MainSidebar (desktop version) to avoid hydration mismatch.
      sidebarComponent = <MainSidebar />;
      mainContentClass = 'ml-64'; // Assume desktop layout
    } else {
      // Once mounted on client, use the actual isMobile value
      sidebarComponent = isMobile ? <MobileSidebar /> : <MainSidebar />;
      mainContentClass = isMobile ? 'ml-0' : 'ml-64';
    }
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${poppins.variable} antialiased`}
      >
        <AuthProvider>
          <div className="flex min-h-screen">
            {sidebarComponent}
            <div className={`flex-1 ${mainContentClass}`}>
              {children}
            </div>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}