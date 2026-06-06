"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Mic, MicOff, Volume2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ScoreRing from "@/components/ui/ScoreRing";
import api from "@/lib/api";
import type { InterviewQuestion, InterviewEval } from "@/types";

const categories = [
  { key: "technical", label: "Technical" },
  { key: "hr", label: "HR" },
  { key: "system_design", label: "System Design" },
  { key: "behavioral", label: "Behavioral" },
];
const difficultyVariant: Record<string, string> = { Easy: "emerald", Medium: "amber", Hard: "rose" };

export default function InterviewPrepPage() {
  const [role, setRole] = useState("Software Engineer");
  const [questions, setQuestions] = useState<Record<string, InterviewQuestion[]> | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [evaluation, setEvaluation] = useState<InterviewEval | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const recognitionRef = useRef<any>(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/interview/questions", { role, skills: [], categories: categories.map((c) => c.key) });
      return res.data.questions as Record<string, InterviewQuestion[]>;
    },
    onSuccess: (data) => setQuestions(data),
  });

  const evalMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/interview/evaluate", { question: selectedQuestion, transcript });
      return res.data.evaluation as InterviewEval;
    },
    onSuccess: (data) => setEvaluation(data),
  });

  useEffect(() => {
    return () => { recognitionRef.current?.stop(); };
  }, []);

  const toggleRecording = () => {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported"); return; }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (e: any) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      setTranscript(text);
    };
    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
    setTranscript("");
    setEvaluation(null);
  };

  return (
    <motion.div className="page-container" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div>
        <h2 className="page-title">Interview Prep</h2>
        <p className="page-subtitle">Practice with AI-generated questions and voice recording</p>
      </div>

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Role</label>
          <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
          {generateMutation.isPending ? "Generating..." : "Generate Questions"}
        </button>
      </div>

      <Card className="flex flex-col items-center py-6">
        <p className="text-sm text-slate-600 mb-4">Record your practice answer</p>
        <button
          onClick={toggleRecording}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-colors ${recording ? "bg-rose-100 text-rose-600" : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"}`}
        >
          {recording && <><span className="absolute inset-0 rounded-full bg-rose-400 opacity-20 animate-pulse-ring" /><span className="absolute inset-0 rounded-full bg-rose-400 opacity-10 animate-pulse-ring" style={{ animationDelay: "0.4s" }} /></>}
          {recording ? <MicOff className="w-8 h-8 relative z-10" /> : <Mic className="w-8 h-8" />}
        </button>
        <p className="text-sm text-slate-500 mt-3">{recording ? "Recording... Click to stop" : "Click to start recording"}</p>

        {transcript && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 w-full max-w-xl">
            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-700"><Volume2 className="w-4 h-4" /> Transcript</div>
            <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-4 border border-slate-200">{transcript}</p>
            {selectedQuestion && (
              <button onClick={() => evalMutation.mutate()} disabled={evalMutation.isPending} className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                {evalMutation.isPending ? "Evaluating..." : "Evaluate Answer"}
              </button>
            )}
          </motion.div>
        )}

        {evaluation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 w-full max-w-xl">
            <div className="grid grid-cols-4 gap-4 mb-4">
              {(["confidence", "clarity", "relevance", "pacing"] as const).map((key) => (
                <div key={key} className="flex flex-col items-center">
                  <ScoreRing score={evaluation[key]} size={70} strokeWidth={6} />
                  <span className="text-xs text-slate-600 mt-1 capitalize">{key}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-700 bg-indigo-50 rounded-lg p-4 border border-indigo-100">{evaluation.feedback}</p>
          </motion.div>
        )}
      </Card>

      {questions && categories.map((cat) => (
        <div key={cat.key}>
          <h3 className="text-lg font-semibold text-slate-900 mb-3">{cat.label}</h3>
          <div className="space-y-2">
            {(questions[cat.key] || []).map((q) => (
              <Card key={q.id} className="p-0 overflow-hidden">
                <button
                  onClick={() => { setOpenId(openId === q.id ? null : q.id); setSelectedQuestion(q.question); }}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-sm font-medium text-slate-800 flex-1">{q.question}</span>
                    <Badge variant={difficultyVariant[q.difficulty]}>{q.difficulty}</Badge>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 ml-3 transition-transform ${openId === q.id ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openId === q.id && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 pt-0 border-t border-slate-100">
                        <p className="text-sm text-slate-600 leading-relaxed mt-3">{q.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
