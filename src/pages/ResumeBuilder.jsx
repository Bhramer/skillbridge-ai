import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Eye, Download, Plus, FileText, Mail, Phone, MapPin } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { resumeVersions, resumeContent } from '../data/mock';

const statusVariant = { active: 'emerald', draft: 'amber', archived: 'slate' };

export default function ResumeBuilder() {
  const [preview, setPreview] = useState(null);

  return (
    <motion.div className="page-container" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Resume Builder</h2>
          <p className="page-subtitle">Manage and preview resume versions</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> New Version
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Versions</h3>
          {resumeVersions.map((v) => (
            <Card key={v.id} className={`hover:shadow-md transition-shadow ${preview === v.id ? 'ring-2 ring-indigo-200' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{v.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{v.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant[v.status]}>{v.status}</Badge>
                  <Badge variant={v.atsScore >= 80 ? 'emerald' : v.atsScore >= 65 ? 'amber' : 'rose'}>ATS: {v.atsScore}</Badge>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors">
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => setPreview(preview === v.id ? null : v.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </Card>
          ))}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Live Preview</h3>
          {preview ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="bg-white shadow-lg border-slate-200">
                <div className="space-y-5 text-left">
                  <div className="border-b border-slate-200 pb-4">
                    <h2 className="text-2xl font-bold text-slate-900">{resumeContent.name}</h2>
                    <p className="text-indigo-600 font-medium">{resumeContent.title}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {resumeContent.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {resumeContent.phone}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {resumeContent.location}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Summary</h3>
                    <p className="text-sm text-slate-700 leading-relaxed">{resumeContent.summary}</p>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Experience</h3>
                    {resumeContent.experience.map((exp) => (
                      <div key={exp.company} className="mb-4">
                        <div className="flex justify-between items-baseline">
                          <h4 className="font-semibold text-slate-900 text-sm">{exp.role}</h4>
                          <span className="text-xs text-slate-500">{exp.period}</span>
                        </div>
                        <p className="text-sm text-indigo-600 mb-1">{exp.company}</p>
                        <ul className="space-y-1">
                          {exp.bullets.map((b, i) => (
                            <li key={i} className="text-xs text-slate-600 flex gap-2">
                              <span className="text-slate-400 mt-0.5">•</span> {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Education</h3>
                    <p className="text-sm text-slate-900 font-medium">{resumeContent.education.degree}</p>
                    <p className="text-xs text-slate-500">{resumeContent.education.school} · {resumeContent.education.year}</p>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {resumeContent.skills.map((s) => (
                        <span key={s} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
              <Eye className="w-10 h-10 mb-2" />
              <p className="text-sm">Select a version to preview</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
