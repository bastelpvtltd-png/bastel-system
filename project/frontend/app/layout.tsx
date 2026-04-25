"use client";

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BASTEL PVT LTD - Security System",
  description: "High Security Monitoring System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-950 text-white">
        {children}
      </body>
    </html>
  );
}