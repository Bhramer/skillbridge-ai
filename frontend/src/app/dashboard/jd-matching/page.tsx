"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Upload, CheckCircle } from "lucide-react";
import ScoreRing from "@/components/ui/ScoreRing";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import SkillChip from "@/components/ui/SkillChip";
import api from "@/lib/api";
import type { MatchResult } from "@/types";

export default function JDMatchingPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const form = new FormData();
      if (file) form.append("resume", file);
      form.append("jd_text", jdText);
      const res = await api.post("/analyze/match", form);
      return res.data.match as MatchResult;
    },
    onSuccess: (data) => setResult(data),
  });

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] },
    maxFiles: 1,
  });

  return (
    <motion.div className="page-container" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div>
        <h2 className="page-title">JD Matching</h2>
        <p className="page-subtitle">Match your resume against a job description</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            file ? "border-emerald-300 bg-emerald-50" : "border-slate-300 bg-white hover:border-indigo-300"
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
              <p className="font-medium text-slate-900">{file.name}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-10 h-10 text-slate-400" />
              <p className="font-medium text-slate-700">Upload Resume</p>
              <p className="text-sm text-slate-500">PDF or DOCX</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Description</label>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="Paste the job description here..."
          />
        </div>
      </div>

      <button
        onClick={() => mutation.mutate()}
        disabled={!file || !jdText.trim() || mutation.isPending}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        {mutation.isPending ? "Matching..." : "Analyze Match"}
      </button>

      {mutation.isError && (
        <div className="bg-rose-50 text-rose-700 text-sm px-4 py-3 rounded-lg border border-rose-200">
          {Array.isArray((mutation.error as any)?.response?.data?.detail)
            ? (mutation.error as any).response.data.detail.map((item: any) => item?.msg || item).join(", ")
            : (mutation.error as any)?.response?.data?.detail || "Match failed"}
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="flex flex-col items-center py-6 lg:col-span-1">
              <ScoreRing score={result.scores.composite_score} size={100} strokeWidth={10} />
              <span className="text-sm font-medium text-slate-700 mt-2">Overall</span>
            </Card>
            {(["semantic_score", "keyword_score", "skill_score", "experience_score"] as const).map((key) => (
              <Card key={key} className="flex flex-col items-center py-6">
                <ScoreRing score={result.scores[key]} size={80} strokeWidth={8} />
                <span className="text-xs font-medium text-slate-600 mt-2 capitalize">{key.replace("_", " ")}</span>
              </Card>
            ))}
          </div>

          <Card>
            <div className={`text-center py-4 rounded-lg ${result.scores.composite_score >= 80 ? "bg-emerald-50" : result.scores.composite_score >= 60 ? "bg-amber-50" : "bg-rose-50"}`}>
              <p className="text-lg font-semibold">{result.verdict}</p>
              <p className="text-sm text-slate-600 mt-1">{result.verdict_detail}</p>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-semibold text-slate-900 mb-3">Matched Skills</h3>
              <div className="flex flex-wrap gap-2">
                {result.matched_skills.map((s) => <SkillChip key={s} name={s} variant="matched" />)}
                {result.matched_skills.length === 0 && <p className="text-sm text-slate-400">None</p>}
              </div>
            </Card>
            <Card>
              <h3 className="font-semibold text-slate-900 mb-3">Missing Skills</h3>
              <div className="flex flex-wrap gap-2">
                {result.missing_skills.map((s) => <SkillChip key={s} name={s} variant="missing" />)}
                {result.missing_skills.length === 0 && <p className="text-sm text-slate-400">None</p>}
              </div>
            </Card>
          </div>

          {result.suggestions.length > 0 && (
            <Card>
              <h3 className="font-semibold text-slate-900 mb-3">Suggestions</h3>
              <ul className="space-y-2">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-slate-700 flex gap-2">
                    <span className="text-indigo-600 flex-shrink-0">-</span> {s}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
