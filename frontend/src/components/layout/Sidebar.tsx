"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileSearch,
  GitCompare,
  BarChart3,
  Map,
  MessageSquare,
  Github,
  Briefcase,
  Building2,
  FileEdit,
  History,
  Sparkles,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/resume-analyzer", label: "Resume Analyzer", icon: FileSearch },
  { href: "/dashboard/jd-matching", label: "JD Matching", icon: GitCompare },
  { href: "/dashboard/skill-gap", label: "Skill Gap", icon: BarChart3 },
  { href: "/dashboard/learning-roadmap", label: "Learning Roadmap", icon: Map },
  { href: "/dashboard/interview-prep", label: "Interview Prep", icon: MessageSquare },
  { href: "/dashboard/github-analysis", label: "GitHub Analysis", icon: Github },
  { href: "/dashboard/jobs", label: "Job Market", icon: Briefcase },
  { href: "/dashboard/company-matching", label: "Company Match", icon: Building2 },
  { href: "/dashboard/resume-builder", label: "Resume Builder", icon: FileEdit },
  { href: "/dashboard/version-history", label: "Version History", icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-slate-200 flex flex-col z-30">
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-100">
        <Sparkles className="w-7 h-7 text-indigo-600" />
        <span className="text-lg font-bold text-slate-900">SkillBridge AI</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
