"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import api from "@/lib/api";
import type { SkillGapData } from "@/types";

const categoryTabs = ["All", "AI/ML", "Web", "DevOps", "Database", "System Design", "Cloud"];

export default function SkillGapPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [targetRole, setTargetRole] = useState("Software Engineer");

  const { data, isLoading } = useQuery<SkillGapData>({
    queryKey: ["skill-gap", targetRole],
    queryFn: async () => {
      const res = await api.get("/dashboard/skills/gap", { params: { target_role: targetRole } });
      return res.data.data;
    },
  });

  if (isLoading) return <div className="page-container"><LoadingSkeleton className="h-64" count={2} /></div>;

  const allGaps = Object.values(data?.categories || {}).flat();
  const filtered = activeTab === "All" ? allGaps : allGaps.filter((g) => g.category === activeTab);
  const chartData = filtered.map((g) => ({ name: g.skill, current: g.current_level, required: g.required_level }));

  return (
    <motion.div className="page-container" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div>
        <h2 className="page-title">Skill Gap Analysis</h2>
        <p className="page-subtitle">Compare your skills against market demand</p>
      </div>

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Role</label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-indigo-600">{data?.skills_found ?? 0}</p>
          <p className="text-sm text-slate-500 mt-1">Skills Found</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-slate-900">{data?.skills_required ?? 0}</p>
          <p className="text-sm text-slate-500 mt-1">Skills Required</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-rose-600">{data?.gap_count ?? 0}</p>
          <p className="text-sm text-slate-500 mt-1">Gaps Found</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-amber-600">{data?.gap_score ?? 0}%</p>
          <p className="text-sm text-slate-500 mt-1">Gap Score</p>
        </Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categoryTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {chartData.length > 0 && (
        <Card>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="current" fill="#818cf8" name="Current" radius={[4, 4, 0, 0]} />
              <Bar dataKey="required" fill="#e2e8f0" name="Required" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {data?.priority_list && data.priority_list.length > 0 && (
        <Card>
          <h3 className="font-semibold text-slate-900 mb-4">Priority Skills to Learn</h3>
          <div className="space-y-3">
            {data.priority_list.map((gap, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div>
                  <p className="font-medium text-slate-900">{gap.skill}</p>
                  <p className="text-xs text-slate-500">{gap.category} · {gap.time_to_learn}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">{gap.demand_pct}% demand</span>
                  <Badge variant={gap.priority === "HIGH" ? "rose" : "amber"}>{gap.priority}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
}
