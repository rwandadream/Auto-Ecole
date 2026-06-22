import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster as SonnerToaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SARAH AUTO - ERP Auto-École",
  description: "Plateforme SaaS de gestion d'auto-école : élèves, moniteurs, véhicules, planning, examens, facturation et comptabilité.",
  keywords: ["SARAH AUTO", "auto-école", "ERP", "conduite", "permis", "élèves"],
  authors: [{ name: "SARAH AUTO" }],
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <SonnerToaster theme="light" position="top-right" />
      </body>
    </html>
  );
}
