import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Claude Code Skills — Furihata",
  description:
    "Skills curadas do Claude Code. Selecione, copie o prompt e instale no seu Claude Code com auto-update.",
  openGraph: {
    title: "Claude Code Skills — Furihata",
    description:
      "Skills curadas do Claude Code. Selecione, copie o prompt e instale no seu Claude Code com auto-update.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--color-surface)",
              border: "1px solid var(--color-border-strong)",
              color: "var(--color-text)",
            },
          }}
        />
      </body>
    </html>
  );
}
