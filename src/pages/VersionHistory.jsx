import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { versionHistory } from '../data/mock';

const chartData = [...versionHistory].reverse().map((v) => ({ name: v.version, score: v.score }));

export default function VersionHistory() {
  return (
    <motion.div className="page-container" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
      <div>
        <h2 className="page-title">Version History</h2>
        <p className="page-subtitle">Track your ATS score improvements over time</p>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Score Progression</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13 }} />
            <YAxis domain={[40, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13 }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)' }} />
            <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 5, fill: '#4f46e5' }} activeDot={{ r: 7 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-5 pb-0">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">All Versions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="px-5 py-3 font-medium text-slate-500">Version</th>
                <th className="px-5 py-3 font-medium text-slate-500">Date</th>
                <th className="px-5 py-3 font-medium text-slate-500">ATS Score</th>
                <th className="px-5 py-3 font-medium text-slate-500">Change</th>
                <th className="px-5 py-3 font-medium text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {versionHistory.map((v) => (
                <tr key={v.version} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-900">{v.version}</td>
                  <td className="px-5 py-3 text-slate-600">{v.date}</td>
                  <td className="px-5 py-3">
                    <span className={`font-semibold ${v.score >= 75 ? 'text-emerald-600' : v.score >= 65 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {v.score}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {v.change !== 0 ? (
                      <span className={`flex items-center gap-1 text-sm font-medium ${v.change > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {v.change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {v.change > 0 ? '+' : ''}{v.change}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={v.status === 'Current' ? 'indigo' : v.status === 'Initial' ? 'slate' : 'emerald'}>
                      {v.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
}
