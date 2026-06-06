"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Star, GitFork, Users } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import SkillChip from "@/components/ui/SkillChip";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import api from "@/lib/api";
import type { GitHubProfile } from "@/types";

const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#6b7280"];

export default function GitHubAnalysisPage() {
  const [username, setUsername] = useState("");
  const [searchUser, setSearchUser] = useState("");

  const { data, isLoading, isError, error } = useQuery<GitHubProfile>({
    queryKey: ["github", searchUser],
    queryFn: async () => {
      const res = await api.get(`/github/${searchUser}`);
      return res.data.data;
    },
    enabled: !!searchUser,
  });

  const langData = data
    ? Object.entries(data.languages).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }))
    : [];

  return (
    <motion.div className="page-container" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div>
        <h2 className="page-title">GitHub Analysis</h2>
        <p className="page-subtitle">Analyze your GitHub profile and discover skills</p>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter GitHub username"
          className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onKeyDown={(e) => e.key === "Enter" && setSearchUser(username)}
        />
        <button
          onClick={() => setSearchUser(username)}
          disabled={!username.trim() || isLoading}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {isError && (
        <div className="bg-rose-50 text-rose-700 text-sm px-4 py-3 rounded-lg border border-rose-200">
          {(error as any)?.response?.data?.detail || "Failed to fetch GitHub data"}
        </div>
      )}

      {isLoading && <LoadingSkeleton className="h-64" count={2} />}

      {data && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center">
              <p className="text-3xl font-bold text-slate-900">{data.repos_count}</p>
              <p className="text-sm text-slate-500 flex items-center justify-center gap-1 mt-1"><GitFork className="w-4 h-4" /> Repositories</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-amber-600">{data.total_stars}</p>
              <p className="text-sm text-slate-500 flex items-center justify-center gap-1 mt-1"><Star className="w-4 h-4" /> Total Stars</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-indigo-600">{data.followers}</p>
              <p className="text-sm text-slate-500 flex items-center justify-center gap-1 mt-1"><Users className="w-4 h-4" /> Followers</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-semibold text-slate-900 mb-4">Language Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={langData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name} ${value}%`}>
                    {langData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <h3 className="font-semibold text-slate-900 mb-3">Skills Detected</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {data.skills_detected.map((s) => <SkillChip key={s} name={s} variant="matched" />)}
              </div>
              {data.skills_missing_from_resume.length > 0 && (
                <>
                  <h4 className="font-medium text-slate-700 mb-2 text-sm">Missing from Resume</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.skills_missing_from_resume.map((s) => <SkillChip key={s} name={s} variant="missing" />)}
                  </div>
                </>
              )}
            </Card>
          </div>

          <Card>
            <h3 className="font-semibold text-slate-900 mb-4">Repositories</h3>
            <div className="space-y-3">
              {data.repos.slice(0, 10).map((repo) => (
                <div key={repo.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div>
                    <a href={repo.url} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:underline text-sm">{repo.name}</a>
                    <p className="text-xs text-slate-500 mt-0.5">{repo.description?.slice(0, 80) || "No description"}</p>
                    <div className="flex gap-1.5 mt-1.5">
                      {repo.skills.map((s) => <Badge key={s} variant="slate">{s}</Badge>)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Star className="w-3.5 h-3.5" /> {repo.stars}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
