"use client";

import { cn } from "@/lib/utils";

interface SkillChipProps {
  name: string;
  variant?: "matched" | "missing" | "default";
}

export default function SkillChip({ name, variant = "default" }: SkillChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium",
        variant === "matched" && "bg-emerald-50 text-emerald-700",
        variant === "missing" && "bg-rose-50 text-rose-700",
        variant === "default" && "bg-slate-100 text-slate-700"
      )}
    >
      {name}
    </span>
  );
}
