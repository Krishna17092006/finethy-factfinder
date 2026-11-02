import type { Metadata, Viewport } from "next";
import { Anek_Latin } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// Anek Latin (Ek Type, Mumbai). Self-hosted by next/font at build time, so it works offline.
const anek = Anek_Latin({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-anek",
});

export const metadata: Metadata = {
  title: { default: "FINETHY Fact-Finder", template: "%s | FINETHY Fact-Finder" },
  description: "Share your financial picture with FINETHY before your consultation. Takes about 10 minutes.",
  applicationName: "FINETHY Fact-Finder",
  icons: { icon: "/favicon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2f5aa8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={anek.variable}>
      <body className="flex min-h-dvh flex-col">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
