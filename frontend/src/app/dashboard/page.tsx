"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Trophy, Target, Briefcase, Zap, MapPin } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import ScoreRing from "@/components/ui/ScoreRing";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { DashboardData } from "@/types";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await api.get("/dashboard");
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="page-container">
        <LoadingSkeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4 mt-6">
          <LoadingSkeleton className="h-28" count={4} />
        </div>
      </div>
    );
  }

  const d = data;

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div>
        <h2 className="page-title">Welcome back, {user?.name || "User"}</h2>
        <p className="page-subtitle">Here&apos;s your career snapshot</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Trophy} label="ATS Score" value={d?.ats_score ? Math.round(d.ats_score) : "--"} />
        <StatCard icon={Target} label="Skill Match" value={d?.skill_match_pct ? `${Math.round(d.skill_match_pct)}%` : "--"} />
        <StatCard icon={Briefcase} label="Job Matches" value={d?.job_matches_count ?? 0} />
        <StatCard icon={Zap} label="Confidence" value={d?.confidence_score ? Math.round(d.confidence_score) : "--"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">ATS Score Trend</h3>
          {d?.skill_trends && d.skill_trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={d.skill_trends}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 13 }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 13 }} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ r: 4, fill: "#4f46e5" }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-slate-400 text-sm">
              Upload a resume to start tracking your ATS score
            </div>
          )}
        </Card>

        <Card className="flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Overall Score</h3>
          <ScoreRing score={d?.ats_score ?? 0} size={160} strokeWidth={14} />
          <p className="text-sm text-slate-500 mt-3">
            {d?.ats_score ? `${d.skills_found?.length ?? 0} skills detected` : "No analysis yet"}
          </p>
        </Card>
      </div>

      {d?.ai_recommendations && d.ai_recommendations.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">AI Recommendations</h3>
          <div className="space-y-3">
            {d.ai_recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                <Zap className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-700">{rec.text}</p>
                <Badge variant={rec.priority === "high" ? "rose" : rec.priority === "medium" ? "amber" : "slate"} className="flex-shrink-0">
                  {rec.priority}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {d?.top_jobs && d.top_jobs.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Job Matches</h3>
          <div className="space-y-3">
            {d.top_jobs.slice(0, 5).map((job, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                  {job.company?.charAt(0) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{job.title}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {job.company} · {job.location}
                  </p>
                </div>
                {job.match_pct !== undefined && (
                  <Badge variant={job.match_pct >= 80 ? "emerald" : job.match_pct >= 60 ? "amber" : "slate"}>
                    {job.match_pct}%
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
}
