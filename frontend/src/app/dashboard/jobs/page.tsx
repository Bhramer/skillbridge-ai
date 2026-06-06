"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPin, ExternalLink } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import SkillChip from "@/components/ui/SkillChip";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import api from "@/lib/api";
import type { Job } from "@/types";

export default function JobsPage() {
  const [role, setRole] = useState("Software Engineer");
  const [location, setLocation] = useState("India");
  const [searchParams, setSearchParams] = useState({ role: "", location: "" });

  const { data, isLoading } = useQuery<{ jobs: Job[]; total: number }>({
    queryKey: ["jobs", searchParams],
    queryFn: async () => {
      const res = await api.get("/jobs/search", { params: searchParams });
      return res.data;
    },
    enabled: !!searchParams.role,
  });

  const handleSearch = () => setSearchParams({ role, location });

  return (
    <motion.div className="page-container" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div>
        <h2 className="page-title">Job Market</h2>
        <p className="page-subtitle">Find jobs matched to your skills</p>
      </div>

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
          <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <button onClick={handleSearch} disabled={isLoading} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
          {isLoading ? "Searching..." : "Search Jobs"}
        </button>
      </div>

      {isLoading && <LoadingSkeleton className="h-32" count={3} />}

      {data && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">{data.total} jobs found</p>
          {data.jobs.map((job, i) => (
            <Card key={i}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                      {job.company?.charAt(0) || "?"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{job.title}</h3>
                      <p className="text-sm text-slate-500">{job.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                    <span>{job.salary}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {job.matched_skills?.map((s) => <SkillChip key={s} name={s} variant="matched" />)}
                    {job.missing_skills?.map((s) => <SkillChip key={s} name={s} variant="missing" />)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {job.match_pct !== undefined && (
                    <Badge variant={job.match_pct >= 80 ? "emerald" : job.match_pct >= 60 ? "amber" : "rose"}>
                      {job.match_pct}% match
                    </Badge>
                  )}
                  {job.url && job.url !== "#" && (
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm flex items-center gap-1">
                      Apply <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
