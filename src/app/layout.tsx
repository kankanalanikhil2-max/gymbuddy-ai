import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "GymBuddy AI – Your Personal Workout & Nutrition Plan",
  description:
    "Get a clear, realistic workout and nutrition plan tailored to your goals, schedule, and equipment. No guesswork—just a plan that fits you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <AppErrorBoundary>{children}</AppErrorBoundary>
      </body>
    </html>
  );
}
