import { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Star, ArrowUpDown, ExternalLink } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { githubLanguages, githubRepos } from '../data/mock';

export default function GitHubAnalysis() {
  const [sortKey, setSortKey] = useState('stars');
  const [sortDir, setSortDir] = useState('desc');

  const sorted = [...githubRepos].sort((a, b) => {
    if (sortKey === 'stars') return sortDir === 'desc' ? b.stars - a.stars : a.stars - b.stars;
    if (sortKey === 'name') return sortDir === 'desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
    return 0;
  });

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  return (
    <motion.div className="page-container" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
      <div>
        <h2 className="page-title">GitHub Analysis</h2>
        <p className="page-subtitle">Skills detected from your repositories</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 flex flex-col items-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 self-start">Language Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={githubLanguages} dataKey="value" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
                {githubLanguages.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => `${val}%`} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {githubLanguages.map((l) => (
              <span key={l.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                {l.name} ({l.value}%)
              </span>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="p-5 pb-0">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Repositories</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-5 py-3 font-medium text-slate-500">
                    <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-slate-700">
                      Repo <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                  </th>
                  <th className="px-5 py-3 font-medium text-slate-500">
                    <button onClick={() => toggleSort('stars')} className="flex items-center gap-1 hover:text-slate-700">
                      Stars <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                  </th>
                  <th className="px-5 py-3 font-medium text-slate-500">Language</th>
                  <th className="px-5 py-3 font-medium text-slate-500">Updated</th>
                  <th className="px-5 py-3 font-medium text-slate-500">Skills</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((repo) => (
                  <tr key={repo.name} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="font-medium text-indigo-600 flex items-center gap-1">
                        {repo.name} <ExternalLink className="w-3 h-3" />
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {repo.stars}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{repo.language}</td>
                    <td className="px-5 py-3 text-slate-500">{repo.updated}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {repo.skills.map((s) => <Badge key={s} variant="indigo">{s}</Badge>)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
