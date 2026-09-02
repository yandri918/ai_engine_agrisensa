import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { NavigationProvider } from "@/components/navigation-context";

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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#070b14] text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950 print:bg-white print:text-black overflow-x-hidden">
        <NavigationProvider>
          <div className="flex flex-col min-h-screen print:min-h-0 print:block">
            <div className="print:hidden">
              <Navbar />
            </div>

            <div className="flex flex-1 overflow-hidden print:overflow-visible print:block">
              <Sidebar />

              <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-8 pb-24 md:pb-8 bg-gradient-to-b from-[#070b14] via-[#090e1a] to-[#070b14] print:p-0 print:bg-none print:overflow-visible print:block">
                {children}
              </main>
            </div>

            <div className="print:hidden">
              <MobileBottomNav />
            </div>
          </div>
        </NavigationProvider>
      </body>
    </html>
  );
}
