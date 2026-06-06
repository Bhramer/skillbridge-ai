"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Play } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import api from "@/lib/api";
import type { Roadmap, RoadmapStep } from "@/types";

const statusIcons = {
  done: CheckCircle,
  in_progress: Play,
  pending: Clock,
};
const statusColors = {
  done: "text-emerald-600",
  in_progress: "text-indigo-600",
  pending: "text-slate-400",
};

export default function LearningRoadmapPage() {
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/roadmap/generate", { target_role: targetRole, skills_gap: [] });
      return res.data.roadmap as Roadmap;
    },
    onSuccess: (data) => setRoadmap(data),
  });

  const updateStepMutation = useMutation({
    mutationFn: async ({ stepId, status }: { stepId: number; status: string }) => {
      await api.patch(`/roadmap/${roadmap!.id}/steps/${stepId}`, { status });
    },
  });

  const toggleStatus = (step: RoadmapStep) => {
    const nextStatus = step.status === "pending" ? "in_progress" : step.status === "in_progress" ? "done" : "pending";
    if (roadmap) {
      setRoadmap({
        ...roadmap,
        steps: roadmap.steps.map((s) => (s.id === step.id ? { ...s, status: nextStatus } : s)),
      });
      updateStepMutation.mutate({ stepId: step.id, status: nextStatus });
    }
  };

  const doneCount = roadmap?.steps.filter((s) => s.status === "done").length ?? 0;
  const totalSteps = roadmap?.steps.length ?? 1;
  const progress = Math.round((doneCount / totalSteps) * 100);

  return (
    <motion.div className="page-container" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div>
        <h2 className="page-title">Learning Roadmap</h2>
        <p className="page-subtitle">AI-generated structured learning plan</p>
      </div>

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Role</label>
          <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {generateMutation.isPending ? "Generating..." : "Generate Roadmap"}
        </button>
      </div>

      {roadmap && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            {roadmap.steps.map((step) => {
              const Icon = statusIcons[step.status] || Clock;
              return (
                <Card key={step.id} className="flex items-start gap-4">
                  <button onClick={() => toggleStatus(step)} className={`mt-1 flex-shrink-0 ${statusColors[step.status]}`}>
                    <Icon className="w-6 h-6" />
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900">{step.title}</h4>
                      <Badge variant="slate">Week {step.week}</Badge>
                      <Badge variant={step.status === "done" ? "emerald" : step.status === "in_progress" ? "indigo" : "slate"}>
                        {step.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">{step.description}</p>
                    <p className="text-xs text-slate-400 mt-1">{step.skill} · {step.duration}</p>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="space-y-4">
            <Card>
              <h3 className="font-semibold text-slate-900 mb-3">Progress</h3>
              <div className="text-center">
                <p className="text-4xl font-bold text-indigo-600">{progress}%</p>
                <p className="text-sm text-slate-500 mt-1">{doneCount}/{totalSteps} steps done</p>
              </div>
              <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </Card>

            {roadmap.project_ideas && roadmap.project_ideas.length > 0 && (
              <Card>
                <h3 className="font-semibold text-slate-900 mb-3">Project Ideas</h3>
                <ul className="space-y-2">
                  {roadmap.project_ideas.map((idea, i) => (
                    <li key={i} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-indigo-600 flex-shrink-0">{i + 1}.</span> {idea}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
