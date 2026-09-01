"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquareCode,
  FlaskConical,
  TrendingUp,
  Calculator,
  LineChart,
  Leaf,
  ExternalLink,
  Cpu,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: "Command Center", href: "/", icon: LayoutDashboard },
    { name: "Asisten AI Agronomi", href: "/chat", icon: MessageSquareCode, badge: "DeepSeek" },
    { name: "Laboratorium MLOps", href: "/mlops", icon: FlaskConical, badge: "Port 8000" },
    { name: "Simulasi Monte Carlo", href: "/monte-carlo", icon: TrendingUp, badge: "10k Runs" },
    { name: "Generator RAB Otomatis", href: "/rab", icon: Calculator },
    { name: "Intelijen Pasar (ID/JP)", href: "/market", icon: LineChart },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#070b14]/95 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Modul Utama
          </p>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-emerald-500/30 text-emerald-200"
                          : "bg-slate-800 text-slate-400 group-hover:text-slate-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Infrastruktur Cloud
          </p>
          <div className="space-y-1">
            <a
              href="https://n8n-production-999a.up.railway.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-900/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                <span>n8n Canvas Editor</span>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <a
              href="https://mlops-api-production-afaf.up.railway.app/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-900/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
                <span>Swagger MLOps API</span>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <a
              href="https://ai-engine-production-cc99.up.railway.app/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-900/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>Swagger AI Engine</span>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800/80 m-2 rounded-xl bg-slate-900/40">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <div>
            <p className="text-xs font-semibold text-white">Railway Production</p>
            <p className="text-[10px] text-slate-400">Environment: Stable</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
