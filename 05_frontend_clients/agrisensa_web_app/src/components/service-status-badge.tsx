"use client";

import React, { useEffect, useState } from "react";
import { checkServicesHealth } from "@/lib/api-client";
import { ServiceHealth } from "@/lib/types";
import { Activity, CheckCircle2, RefreshCw } from "lucide-react";

export function ServiceStatusBadge() {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    const results = await checkServicesHealth();
    setServices(results);
    setLoading(false);
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  const allOnline = services.length > 0 && services.every((s) => s.status === "online");

  return (
    <div className="flex items-center gap-3 bg-slate-900/80 border border-emerald-500/20 rounded-full px-3.5 py-1.5 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-medium text-emerald-300 hidden sm:inline">
          {allOnline ? "Cloud Engine 100% Online" : "Checking System..."}
        </span>
      </div>

      <div className="hidden md:flex items-center gap-2 border-l border-slate-700 pl-3">
        {services.map((s) => (
          <div key={s.name} className="flex items-center gap-1.5" title={`${s.name}: ${s.url}`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-slate-300 font-mono">
              {s.name.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={fetchHealth}
        disabled={loading}
        className="text-slate-400 hover:text-emerald-400 transition-colors p-0.5 rounded-full"
        title="Refresh Status"
      >
        <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin text-emerald-400" : ""}`} />
      </button>
    </div>
  );
}
