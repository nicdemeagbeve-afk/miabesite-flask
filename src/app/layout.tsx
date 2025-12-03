import type { Metadata } from "next";
import { GeistSans, GeistMono } from 'geist/font'; // Corrected import path for Geist fonts
import { Inter, Poppins } from "next/font/google"; // Import new fonts
import "./globals.css";
import { MainSidebar } from "@/components/layout/main-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/AuthContext"; // Import AuthProvider

const geistSans = GeistSans; // Use directly from geist/font
const geistMono = GeistMono; // Use directly from geist/font

// Configure Inter for body text
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Configure Poppins for headings
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Specify weights you need
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
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${poppins.variable} antialiased`}
      >
        <AuthProvider> {/* Wrap the entire app with AuthProvider */}
          <div className="flex min-h-screen">
            <MainSidebar />
            <div className="flex-1 ml-64">
              {children}
            </div>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}