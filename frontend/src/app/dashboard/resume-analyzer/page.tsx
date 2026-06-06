"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Upload, CheckCircle, AlertCircle, AlertTriangle, Info, FileText } from "lucide-react";
import ScoreRing from "@/components/ui/ScoreRing";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import api from "@/lib/api";
import type { AnalysisResult } from "@/types";

const severityConfig: Record<string, { icon: typeof AlertCircle; bg: string; border: string; color: string; variant: string }> = {
  error: { icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", variant: "rose" },
  warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", variant: "amber" },
  success: { icon: Info, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", variant: "emerald" },
};

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [mode, setMode] = useState("full");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const mutation = useMutation({
    mutationFn: async (uploadFile: File) => {
      const form = new FormData();
      form.append("resume", uploadFile);
      form.append("target_role", targetRole);
      form.append("mode", mode);
      const res = await api.post("/resume/upload", form);
      return res.data.analysis as AnalysisResult;
    },
    onSuccess: (data) => setResult(data),
  });

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length) {
        setFile(accepted[0]);
        setResult(null);
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
  });

  const handleAnalyze = () => {
    if (file) mutation.mutate(file);
  };

  const metrics = result?.sub_metrics;

  return (
    <motion.div className="page-container" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div>
        <h2 className="page-title">Resume Analyzer</h2>
        <p className="page-subtitle">Upload your resume for instant ATS analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Role</label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Frontend Engineer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Analysis Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="full">Full Analysis</option>
            <option value="ats">ATS Score Only</option>
            <option value="skill_gap">Skill Gap Only</option>
          </select>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-indigo-400 bg-indigo-50" : file ? "border-emerald-300 bg-emerald-50" : "border-slate-300 bg-white hover:border-indigo-300"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          {file ? (
            <>
              <CheckCircle className="w-12 h-12 text-emerald-500" />
              <p className="text-lg font-medium text-slate-900">{file.name}</p>
              <p className="text-sm text-slate-500">Click to replace</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-slate-400" />
              <p className="text-lg font-medium text-slate-700">{isDragActive ? "Drop here" : "Drag & drop your resume"}</p>
              <p className="text-sm text-slate-500">PDF or DOCX</p>
            </>
          )}
        </div>
      </div>

      {file && !result && (
        <button
          onClick={handleAnalyze}
          disabled={mutation.isPending}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {mutation.isPending ? "Analyzing..." : "Analyze Resume"}
        </button>
      )}

      {mutation.isError && (
        <div className="bg-rose-50 text-rose-700 text-sm px-4 py-3 rounded-lg border border-rose-200">
          {Array.isArray((mutation.error as any)?.response?.data?.detail)
            ? (mutation.error as any).response.data.detail.map((item: any) => item?.msg || item).join(", ")
            : (mutation.error as any)?.response?.data?.detail || "Analysis failed"}
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">ATS Breakdown</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics && Object.entries(metrics).map(([key, value]) => (
              <Card key={key} className="flex flex-col items-center gap-3 py-6">
                <ScoreRing score={value as number} size={90} strokeWidth={8} />
                <span className="text-sm font-medium text-slate-700 capitalize">{key.replace("_", " ")}</span>
              </Card>
            ))}
          </div>

          {result.suggestions && result.suggestions.length > 0 && (
            <>
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> AI Suggestions
              </h3>
              <div className="space-y-3">
                {result.suggestions.map((s, i) => {
                  const cfg = severityConfig[s.severity] || severityConfig.success;
                  const Icon = cfg.icon;
                  return (
                    <div key={i} className={`flex items-start gap-3 p-4 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                      <p className="text-sm text-slate-800 flex-1">{s.text}</p>
                      <Badge variant={cfg.variant} className="capitalize flex-shrink-0">{s.severity}</Badge>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {result.skills_found && result.skills_found.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Skills Detected</h3>
              <div className="flex flex-wrap gap-2">
                {result.skills_found.map((s) => (
                  <Badge key={s} variant="indigo">{s}</Badge>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
