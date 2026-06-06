"use client";

import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string | null;
  delta?: number;
  deltaLabel?: string;
}

export default function StatCard({ icon: Icon, label, value, delta, deltaLabel }: StatCardProps) {
  const isPositive = delta !== undefined && delta >= 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-start gap-4">
      <div className="w-11 h-11 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-indigo-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 truncate">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value ?? "--"}</p>
        {delta !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            )}
            <span className={`text-xs font-medium ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
              {isPositive ? "+" : ""}
              {delta}%
            </span>
            {deltaLabel && <span className="text-xs text-slate-400">{deltaLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
