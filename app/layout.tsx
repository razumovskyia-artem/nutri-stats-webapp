import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "📊 Статистика",
  description: "Nutri Stats — Telegram Mini App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body
        className={`${inter.className} min-h-dvh bg-neutral-950 text-neutral-100 selection:bg-white/20`}
      >
        {/* мягкий градиент подложки */}
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_-10%,rgba(120,119,198,.25),rgba(0,0,0,0))]" />
        {children}
      </body>
    </html>
  );
}
