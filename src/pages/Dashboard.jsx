import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Send, CalendarCheck, Gift, MapPin } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import ScoreRing from '../components/ui/ScoreRing';
import SkillBar from '../components/ui/SkillBar';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { dashboardStats, skills, scoreTrend, jobMatches } from '../data/mock';

export default function Dashboard() {
  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
    >
      <div>
        <h2 className="page-title">Welcome back, Alex</h2>
        <p className="page-subtitle">Here's your career snapshot for this week</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Trophy} label="ATS Score" value={dashboardStats.atsScore} delta={dashboardStats.deltas.atsScore} deltaLabel="vs last month" />
        <StatCard icon={Send} label="Applications" value={dashboardStats.applications} delta={dashboardStats.deltas.applications} deltaLabel="this month" />
        <StatCard icon={CalendarCheck} label="Interviews" value={dashboardStats.interviews} delta={dashboardStats.deltas.interviews} deltaLabel="scheduled" />
        <StatCard icon={Gift} label="Offers" value={dashboardStats.offers} delta={dashboardStats.deltas.offers} deltaLabel="received" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">ATS Score Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={scoreTrend}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13 }} />
              <YAxis domain={[40, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)' }} />
              <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ r: 4, fill: '#4f46e5' }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Overall Score</h3>
          <ScoreRing score={dashboardStats.atsScore} size={160} strokeWidth={14} />
          <p className="text-sm text-slate-500 mt-3">Top 15% of applicants</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Skills</h3>
          <div className="space-y-4">
            {skills.slice(0, 6).map((s) => (
              <SkillBar key={s.name} name={s.name} level={s.level} color={s.color} />
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Live Job Matches</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {jobMatches.slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                  {job.company.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{job.title}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {job.company} · {job.location}
                  </p>
                </div>
                <Badge variant={job.match >= 85 ? 'emerald' : job.match >= 70 ? 'amber' : 'slate'}>
                  {job.match}%
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
