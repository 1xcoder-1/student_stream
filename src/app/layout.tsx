import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { LoadingProvider } from "@/contexts/loading-context";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/error-boundary";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://student-stream.vercel.app"),
  title: {
    default: "StudentStream - Student Budget & Expense Coach",
    template: "%s | StudentStream",
  },
  description:
    "Track and manage your student allowance and expenses effortlessly with Gemini AI powered insights. Designed for Pakistani university and hostel students.",
  keywords: [
    "student budget",
    "student expense tracker",
    "hostel rent tracker",
    "allowance budget",
    "AI expense coach",
    "Pakistan students",
    "free",
  ],
  authors: [{ name: "1xcoder" }],
  creator: "1xcoder",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://student-stream.vercel.app/",
    title: "StudentStream - AI Powered Student Budget Ledger",
    description:
      "Track student expenses with AI powered insights. 100% free, secure, and private.",
    siteName: "StudentStream",
  },
  twitter: {
    card: "summary_large_image",
    title: "StudentStream - AI Powered Student Budget Ledger",
    description:
      "Track student expenses with AI powered insights. 100% free, secure, and private.",
    creator: "1xcoder",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("dark", inter.variable, jetbrainsMono.variable)}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#22c55e" />
      </head>
      <body className="font-body antialiased">
        <ErrorBoundary>
          <AuthProvider>
            <LoadingProvider>
              <ThemeProvider>{children}</ThemeProvider>
            </LoadingProvider>
          </AuthProvider>
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
