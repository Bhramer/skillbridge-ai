"use client";

interface SkillBarProps {
  name: string;
  level: number;
  color?: string;
}

export default function SkillBar({ name, level, color = "bg-indigo-500" }: SkillBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-slate-700">{name}</span>
        <span className="text-slate-500">{level}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${level}%` }}
        />
      </div>
    </div>
  );
}
