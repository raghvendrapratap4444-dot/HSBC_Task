import type { Metadata } from "next";
import { NavBar } from "@/components/NavBar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "Homestead Portal",
  description: "Unified portal for property valuation and market analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <NavBar />
        <main className="mx-auto min-h-[calc(100vh-4.5rem)] max-w-7xl px-4 py-8 sm:px-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </body>
    </html>
  );
}
