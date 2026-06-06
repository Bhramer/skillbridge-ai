import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import ScoreRing from '../components/ui/ScoreRing';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { atsMetrics, aiSuggestions } from '../data/mock';

const severityConfig = {
  critical: { icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', variant: 'rose' },
  warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', variant: 'amber' },
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', variant: 'indigo' },
};

const metricLabels = {
  keywordMatch: { label: 'Keyword Match', color: '#4f46e5' },
  formatScore: { label: 'Format Score', color: '#059669' },
  sectionStructure: { label: 'Section Structure', color: '#d97706' },
  readability: { label: 'Readability', color: '#7c3aed' },
};

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [analyzed, setAnalyzed] = useState(false);

  const onDrop = useCallback((accepted) => {
    if (accepted.length) {
      setFile(accepted[0]);
      setTimeout(() => setAnalyzed(true), 800);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
  });

  return (
    <motion.div className="page-container" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
      <div>
        <h2 className="page-title">Resume Analyzer</h2>
        <p className="page-subtitle">Upload your resume for instant ATS analysis</p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-indigo-400 bg-indigo-50' : file ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 bg-white hover:border-indigo-300 hover:bg-indigo-50/30'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          {file ? (
            <>
              <CheckCircle className="w-12 h-12 text-emerald-500" />
              <p className="text-lg font-medium text-slate-900">{file.name}</p>
              <p className="text-sm text-slate-500">File uploaded successfully. Click to replace.</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-slate-400" />
              <p className="text-lg font-medium text-slate-700">
                {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
              </p>
              <p className="text-sm text-slate-500">Supports PDF and DOCX files</p>
            </>
          )}
        </div>
      </div>

      {analyzed && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">ATS Breakdown</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(atsMetrics).map(([key, value]) => (
              <Card key={key} className="flex flex-col items-center gap-3 py-6">
                <ScoreRing score={value} size={90} strokeWidth={8} color={metricLabels[key].color} />
                <span className="text-sm font-medium text-slate-700">{metricLabels[key].label}</span>
              </Card>
            ))}
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> AI Suggestions
          </h3>
          <div className="space-y-3">
            {aiSuggestions.map((s) => {
              const cfg = severityConfig[s.severity];
              const Icon = cfg.icon;
              return (
                <div key={s.id} className={`flex items-start gap-3 p-4 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                  <div className="flex-1">
                    <p className="text-sm text-slate-800">{s.text}</p>
                  </div>
                  <Badge variant={cfg.variant} className="capitalize flex-shrink-0">{s.severity}</Badge>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
