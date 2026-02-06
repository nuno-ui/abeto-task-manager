import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Abeto Task Manager",
  description: "AI-Powered Project & Task Management for Operations teams",
  icons: {
    icon: '/abeto-logo.svg',
    shortcut: '/abeto-logo.svg',
    apple: '/abeto-logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-zinc-950 text-white`}>
        {children}
      </body>
    </html>
  );
}
