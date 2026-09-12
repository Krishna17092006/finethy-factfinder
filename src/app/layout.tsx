import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { FinethyFooter } from "@/components/layout/FinethyFooter";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  title: "FINETHY Fact-Finder | Client Intake",
  description:
    "Pre-meeting client intake tool by FINETHY LLP. Fill your financial details before meeting your advisor.",
  keywords: ["financial planning", "CFP", "FINETHY", "client intake"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable}`}>
      <head />

      <body className="min-h-screen flex flex-col font-sans">
        <main className="flex-grow">
          {children}
        </main>
        <FinethyFooter />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
