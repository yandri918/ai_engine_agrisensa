"use client";

import React from "react";
import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { ServiceStatusBadge } from "./service-status-badge";
import { LanguageSwitcher } from "./language-switcher";
import { useNavigation } from "./navigation-context";
import { useLanguage } from "./language-context";
import { Sprout, Sparkles, Menu, X, LogIn } from "lucide-react";

export function Navbar() {
  const { isMobileOpen, toggleMobile } = useNavigation();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-3 sm:px-4 md:px-8">
        {/* Left: Mobile Hamburger & Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleMobile}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-all focus:outline-none"
            aria-label="Buka Menu Navigasi"
          >
            {isMobileOpen ? (
              <X className="h-5 w-5 text-emerald-400" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sprout className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  {t("app_name", "AgriSensa AI")}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  v2.5
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden sm:block truncate max-w-[200px] lg:max-w-none">
                {t("app_subtitle", "Smart Agriculture & MLOps Engine")}
              </p>
            </div>
          </Link>
        </div>

        {/* Right: Engine Status, Language Switcher, AI Chat Quick Action & Clerk Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ServiceStatusBadge />

          {/* Language Switcher Dropdown */}
          <LanguageSwitcher />

          <div className="hidden xl:flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{t("deepseek_active", "DeepSeek-V3 Active")}</span>
          </div>

          <Link
            href="/chat"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold transition-all active:scale-95 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t("open_ai_chat", "AI Chat")}</span>
          </Link>

          {/* Clerk Auth Integration */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
            <Show when="signed-out">
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95 shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t("auth_sign_in", "Masuk")}</span>
              </Link>
            </Show>

            <Show when="signed-in">
              <div className="flex items-center gap-2">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-emerald-500/50 hover:ring-emerald-400 transition-all",
                    },
                  }}
                />
              </div>
            </Show>
          </div>
        </div>
      </div>
    </header>
  );
}


