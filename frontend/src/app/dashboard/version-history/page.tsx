"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { FileText, Download } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import api from "@/lib/api";
import type { ResumeVersion } from "@/types";

export default function VersionHistoryPage() {
  const { data, isLoading } = useQuery<ResumeVersion[]>({
    queryKey: ["resume-versions"],
    queryFn: async () => {
      const res = await api.get("/resume/versions");
      return res.data.versions;
    },
  });

  const chartData = data
    ?.filter((v) => v.ats_score !== null)
    .map((v) => ({
      name: v.version_name.slice(0, 20),
      score: v.ats_score,
      date: new Date(v.created_at).toLocaleDateString(),
    }))
    .reverse();

  const downloadResume = async (id: string, format: "pdf" | "docx") => {
    const res = await api.get(`/resume/download/${id}`, { params: { format }, responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = `resume.${format}`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <motion.div className="page-container" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div>
        <h2 className="page-title">Version History</h2>
        <p className="page-subtitle">Track your resume versions and ATS score progression</p>
      </div>

      {isLoading && <LoadingSkeleton className="h-64" count={2} />}

      {chartData && chartData.length > 0 && (
        <Card>
          <h3 className="font-semibold text-slate-900 mb-4">ATS Score Progression</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2.5} dot={{ fill: "#4f46e5", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {data && (
        <div className="space-y-3">
          {data.map((version) => (
            <Card key={version.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="font-medium text-slate-900">{version.version_name}</p>
                  <p className="text-xs text-slate-500">{new Date(version.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {version.ats_score !== null && (
                  <Badge variant={version.ats_score >= 80 ? "emerald" : version.ats_score >= 60 ? "amber" : "rose"}>
                    ATS: {Math.round(version.ats_score)}
                  </Badge>
                )}
                <Badge variant={version.status === "active" ? "emerald" : "slate"}>{version.status}</Badge>
                <div className="flex gap-1">
                  <button onClick={() => downloadResume(version.id, "pdf")} className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" title="Download PDF">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}

          {data.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3" />
              <p>No resume versions yet. Use the Resume Builder to create one.</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
