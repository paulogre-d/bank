import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthStoreInitializer } from "@/components/AuthStoreInitializer";
import { QueryProvider } from "@/components/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://vertexpremium.com"
  ),
  title: {
    default: "Vertex Premium - Banking for the Digital Age",
    template: "%s | Vertex Premium",
  },
  description:
    "Experience secure, seamless, and smart banking designed for your lifestyle. Join over 2 million users trusting Vertex Premium.",
  keywords: [
    "banking",
    "digital banking",
    "online banking",
    "Vertex Premium",
    "fintech",
    "mobile banking",
  ],
  authors: [{ name: "Vertex Premium" }],
  creator: "Vertex Premium",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Vertex Premium",
    title: "Vertex Premium - Banking for the Digital Age",
    description:
      "Experience secure, seamless, and smart banking designed for your lifestyle. Join over 2 million users trusting Vertex Premium.",
    images: ["/images/sidebar/logo-icon.svg"],
  },
  twitter: {
    card: "summary",
    title: "Vertex Premium - Banking for the Digital Age",
    description:
      "Experience secure, seamless, and smart banking designed for your lifestyle. Join over 2 million users trusting Vertex Premium.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/images/sidebar/logo-icon.svg",
    shortcut: "/images/sidebar/logo-icon.svg",
    apple: "/images/sidebar/logo-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <QueryProvider>
            <AuthStoreInitializer />
            {children}
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
