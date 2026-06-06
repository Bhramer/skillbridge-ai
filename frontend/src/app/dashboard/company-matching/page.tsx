"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import SkillChip from "@/components/ui/SkillChip";
import ScoreRing from "@/components/ui/ScoreRing";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import api from "@/lib/api";
import type { CompanyMatch } from "@/types";

export default function CompanyMatchingPage() {
  const [role, setRole] = useState("Software Engineer");
  const [searchRole, setSearchRole] = useState("");

  const { data, isLoading } = useQuery<CompanyMatch[]>({
    queryKey: ["companies", searchRole],
    queryFn: async () => {
      const res = await api.get("/companies/match", { params: { role: searchRole } });
      return res.data.companies;
    },
    enabled: !!searchRole,
  });

  return (
    <motion.div className="page-container" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div>
        <h2 className="page-title">Company Matching</h2>
        <p className="page-subtitle">See how your skills match with different companies</p>
      </div>

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Role</label>
          <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <button onClick={() => setSearchRole(role)} disabled={isLoading} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
          {isLoading ? "Matching..." : "Match Companies"}
        </button>
      </div>

      {isLoading && <LoadingSkeleton className="h-40" count={3} />}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((company) => (
            <Card key={company.name}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">{company.name}</h3>
                  <p className="text-sm text-slate-500">{company.job_count} position{company.job_count !== 1 ? "s" : ""}</p>
                </div>
                <ScoreRing score={company.match_pct} size={70} strokeWidth={6} />
              </div>

              <div className="space-y-3">
                {company.matched_skills.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-emerald-600 mb-1.5">Matched</p>
                    <div className="flex flex-wrap gap-1.5">
                      {company.matched_skills.map((s) => <SkillChip key={s} name={s} variant="matched" />)}
                    </div>
                  </div>
                )}
                {company.missing_skills.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-rose-600 mb-1.5">Missing</p>
                    <div className="flex flex-wrap gap-1.5">
                      {company.missing_skills.map((s) => <SkillChip key={s} name={s} variant="missing" />)}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
