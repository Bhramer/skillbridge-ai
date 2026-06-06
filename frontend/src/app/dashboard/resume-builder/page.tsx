"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Download, FileText, AlertCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ScoreRing from "@/components/ui/ScoreRing";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function ResumeBuilderPage() {
  const user = useAuthStore((s) => s.user);
  const [targetRole, setTargetRole] = useState(user?.target_role || "Software Engineer");
  const [targetCompany, setTargetCompany] = useState("");
  const [result, setResult] = useState<any>(null);
  const [name, setName] = useState(user?.name || "");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");

  const { data: dashData } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await api.get("/dashboard");
      return res.data.data;
    },
  });

  useEffect(() => {
    if (dashData?.skills_found?.length) {
      setSkills(dashData.skills_found.join(", "));
    }
  }, [dashData]);

  const buildMutation = useMutation({
    mutationFn: async () => {
      const skillsList = skills.split(",").map((s: string) => s.trim()).filter(Boolean);
      const res = await api.post("/resume/build", {
        target_role: targetRole,
        target_company: targetCompany || null,
        user_data: {
          name: name || user?.name || "Candidate",
          title: targetRole,
          summary: summary || `Experienced ${targetRole} with skills in ${skillsList.slice(0, 5).join(", ")}.`,
          experience: [],
          education: {},
          skills: skillsList,
        },
      });
      return res.data.resume;
    },
    onSuccess: (data) => setResult(data),
  });

  const downloadResume = async (format: "pdf" | "docx") => {
    if (!result?.id) return;
    const res = await api.get(`/resume/download/${result.id}`, {
      params: { format },
      responseType: "blob",
    });
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
        <h2 className="page-title">Resume Builder</h2>
        <p className="page-subtitle">Generate ATS-optimized resumes tailored to your target role</p>
      </div>

      {!dashData?.skills_found?.length && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">Upload a resume in the Resume Analyzer first for best results. The builder will use your detected skills.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="John Doe" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Role</label>
          <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Company (Optional)</label>
          <input type="text" value={targetCompany} onChange={(e) => setTargetCompany(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Google" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Skills (comma-separated)</label>
          <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="React, Python, AWS..." />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Professional Summary</label>
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Brief professional summary (AI will expand this)..." />
      </div>

      <button
        onClick={() => buildMutation.mutate()}
        disabled={buildMutation.isPending}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        {buildMutation.isPending ? "Generating..." : "Generate Resume"}
      </button>

      {buildMutation.isError && (
        <div className="bg-rose-50 text-rose-700 text-sm px-4 py-3 rounded-lg border border-rose-200">
          {(buildMutation.error as any)?.response?.data?.detail || "Generation failed"}
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-slate-900">{result.version_name}</h3>
            </div>
            <div className="flex items-center gap-3">
              <ScoreRing score={result.ats_score || 0} size={60} strokeWidth={5} />
              <div className="flex gap-2">
                <button onClick={() => downloadResume("pdf")} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                  <Download className="w-4 h-4" /> PDF
                </button>
                <button onClick={() => downloadResume("docx")} className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-700 rounded-lg text-sm border border-slate-200 hover:bg-slate-50">
                  <Download className="w-4 h-4" /> DOCX
                </button>
              </div>
            </div>
          </div>

          <Card>
            <div className="prose prose-sm max-w-none">
              {result.content?.name && <h2 className="text-xl font-bold text-slate-900">{result.content.name}</h2>}
              {result.content?.title && <p className="text-slate-500">{result.content.title}</p>}
              {result.content?.summary && (
                <>
                  <h3 className="text-lg font-semibold text-slate-800 mt-4">Summary</h3>
                  <p className="text-slate-700">{result.content.summary}</p>
                </>
              )}
              {result.content?.experience?.map((exp: any, i: number) => (
                <div key={i} className="mt-4">
                  <h4 className="font-semibold text-slate-800">{exp.role} at {exp.company}</h4>
                  <p className="text-xs text-slate-500">{exp.period}</p>
                  <ul className="list-disc list-inside mt-1">
                    {exp.bullets?.map((b: string, j: number) => <li key={j} className="text-sm text-slate-700">{b}</li>)}
                  </ul>
                </div>
              ))}
              {result.content?.skills && (
                <>
                  <h3 className="text-lg font-semibold text-slate-800 mt-4">Skills</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {result.content.skills.map((s: string) => <Badge key={s} variant="indigo">{s}</Badge>)}
                  </div>
                </>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
