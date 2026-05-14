import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const noto = Noto_Sans_KR({ subsets: ["latin"], weight: ["400", "500", "700"] });

export const metadata: Metadata = {
  title: "CBT Repository Platform",
  description: "자격시험 CBT 저장소 생성·운영 플랫폼",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${noto.className} bg-gray-950 text-gray-100 min-h-screen`}>
        <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-indigo-400 text-lg">
              📚 CBT Repository
            </Link>
            <nav className="flex gap-4 text-sm text-gray-400">
              <Link href="/" className="hover:text-white transition-colors">저장소 목록</Link>
              <Link href="/repositories/new" className="hover:text-white transition-colors">저장소 생성</Link>
            </nav>
          </div>
        </header>
        <main className="pt-14 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
// trigger rebuild
