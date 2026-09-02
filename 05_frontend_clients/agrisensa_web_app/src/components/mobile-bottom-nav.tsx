"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavigation } from "./navigation-context";
import {
  LayoutDashboard,
  LineChart,
  FlaskConical,
  FileText,
  Sparkles,
  Menu,
  X,
} from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isMobileOpen, toggleMobile } = useNavigation();

  const primaryNavItems = [
    { name: "Beranda", href: "/", icon: LayoutDashboard },
    { name: "Analyst", href: "/analyst", icon: LineChart },
    { name: "Pupuk", href: "/fertilizer", icon: FlaskConical },
    { name: "SOP", href: "/sop", icon: FileText },
    { name: "AI Chat", href: "/chat", icon: Sparkles },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070b14]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        {primaryNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? "text-emerald-400 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-emerald-400 stroke-[2.5]" : ""}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.name}</span>
            </Link>
          );
        })}

        {/* Menu Drawer Toggle Button */}
        <button
          onClick={toggleMobile}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            isMobileOpen ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
          aria-label="Toggle Navigation Menu"
        >
          {isMobileOpen ? (
            <X className="w-5 h-5 text-emerald-400" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
          <span className="text-[10px] mt-0.5 tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
}
