import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: "AgriSensa AI — Smart Agriculture & MLOps Platform",
  description:
    "Platform analitik pertanian presisi terintegrasi bertenaga DeepSeek AI, MLOps Inference Engine, simulasi risiko Monte Carlo, dan orkestrasi otomatis n8n.",
  keywords: ["Pertanian Presisi", "Smart Agriculture", "AgriSensa", "MLOps", "DeepSeek", "Monte Carlo"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#070b14] text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950 print:bg-white print:text-black">
        <div className="flex flex-col min-h-screen print:min-h-0 print:block">
          <div className="print:hidden">
            <Navbar />
          </div>
          <div className="flex flex-1 overflow-hidden print:overflow-visible print:block">
            <div className="print:hidden">
              <Sidebar />
            </div>
            <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-b from-[#070b14] via-[#090e1a] to-[#070b14] print:p-0 print:bg-none print:overflow-visible print:block">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
