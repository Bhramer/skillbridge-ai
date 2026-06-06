import { useState } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { skillGapData, radarData } from '../data/mock';

const tabs = [
  { key: 'technical', label: 'Technical' },
  { key: 'softSkills', label: 'Soft Skills' },
  { key: 'tools', label: 'Tools' },
  { key: 'certifications', label: 'Certifications' },
];

const priorityVariant = { High: 'rose', Medium: 'amber', Low: 'emerald' };

export default function SkillGap() {
  const [activeTab, setActiveTab] = useState('technical');

  return (
    <motion.div className="page-container" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
      <div>
        <h2 className="page-title">Skill Gap Analysis</h2>
        <p className="page-subtitle">Identify and prioritize skills to develop</p>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Skill Radar</h3>
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 13 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Radar name="Current" dataKey="current" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} strokeWidth={2} />
            <Radar name="Target" dataKey="target" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} strokeWidth={2} strokeDasharray="4 4" />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </Card>

      <div className="flex gap-2 border-b border-slate-200 pb-0">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === t.key ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skillGapData[activeTab]?.map((item) => (
          <Card key={item.skill}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-slate-900">{item.skill}</h4>
              <Badge variant={priorityVariant[item.priority]}>{item.priority}</Badge>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Current</span><span>{item.current}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-indigo-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${item.current}%` }} transition={{ duration: 0.8 }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Required</span><span>{item.required}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-400 rounded-full" style={{ width: `${item.required}%` }} />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">Gap: {Math.max(0, item.required - item.current)} points</p>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
