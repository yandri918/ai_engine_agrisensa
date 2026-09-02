import React from "react";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Sprout, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-10 px-4">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header & Logo */}
      <div className="text-center mb-8 space-y-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all group"
        >
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sprout className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          <div className="text-left">
            <span className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition-colors">
              AgriSensa AI
            </span>
            <p className="text-[10px] text-slate-400 font-medium">
              Smart Agriculture & MLOps Engine
            </p>
          </div>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-4">
          Selamat Datang Kembali
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Masuk ke akun Anda untuk mengakses 25+ modul analitik cerdas, simulasi risiko Monte Carlo, dan asisten agronomi AI.
        </p>
      </div>

      {/* Clerk Sign In Component */}
      <div className="w-full max-w-md flex justify-center">
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/"
        />
      </div>

      {/* Footer Features Info & Back Link */}
      <div className="mt-8 text-center space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Enkripsi 256-bit Terproteksi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>DeepSeek-V3 Integrated</span>
          </div>
        </div>

        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Utama</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
