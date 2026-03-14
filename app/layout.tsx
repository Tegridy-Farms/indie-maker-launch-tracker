import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
        {/* NavBar placeholder — replaced with real NavBar component in Stage 3 */}
        <header className="bg-surface border-b border-border-default h-14 flex items-center px-6">
          <div className="flex items-center justify-between w-full max-w-[1024px] mx-auto">
            <span className="text-primary font-semibold text-[16px]">
              Launch Tracker
            </span>
            <nav aria-label="Main navigation" className="flex items-center gap-6">
              <a
                href="/dashboard"
                className="text-text-secondary hover:text-text-primary text-[14px] transition-colors"
              >
                Dashboard
              </a>
              <a
                href="/ideas"
                className="text-text-secondary hover:text-text-primary text-[14px] transition-colors"
              >
                Ideas
              </a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
