import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/Toast";
import { AppShellWithContext } from "@/components/AppShell";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Launch Tracker",
  description: "Track your indie maker project ideas from concept to launch",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-bg-app text-text-primary min-h-screen">
        <ToastProvider>
          <AppShellWithContext>
            {children}
          </AppShellWithContext>
        </ToastProvider>
      </body>
    </html>
  );
}
