import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter, Poppins } from "next/font/google"; // Import new fonts
import "./globals.css";
import { MainSidebar } from "@/components/layout/main-sidebar";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
        <div className="flex min-h-screen">
          <MainSidebar />
          <div className="flex-1 ml-64">
            {children}
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}