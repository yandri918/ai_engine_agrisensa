import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { NavigationProvider } from "@/components/navigation-context";
import { LanguageProvider } from "@/components/language-context";

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
    <ClerkProvider
      appearance={{
        theme: dark,
        variables: {
          colorPrimary: "#10b981",
          colorBackground: "#090e1a",
          borderRadius: "0.75rem",
        },
        elements: {
          card: "border border-slate-800/80 shadow-2xl shadow-black/80 backdrop-blur-xl bg-[#090e1a]/95",
          formFieldInput: "bg-[#070b14] border-slate-800 text-slate-100 focus:border-emerald-500",
          formButtonPrimary:
            "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/20",
          footerActionLink: "text-emerald-400 hover:text-emerald-300 font-semibold",
          userButtonAvatarBox: "h-9 w-9 ring-2 ring-emerald-500/50 hover:ring-emerald-400 transition-all",
          userButtonPopoverCard: "border border-slate-800 bg-[#090e1a] shadow-2xl",
        },
      }}
    >
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
          <LanguageProvider>
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
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

