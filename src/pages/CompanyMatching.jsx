import { motion } from 'framer-motion';
import ScoreRing from '../components/ui/ScoreRing';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { companies } from '../data/mock';

function SubScore({ label, value }) {
  const color = value >= 85 ? 'text-emerald-600' : value >= 70 ? 'text-amber-600' : 'text-rose-600';
  return (
    <div className="text-center">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function CompanyMatching() {
  return (
    <motion.div className="page-container" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
      <div>
        <h2 className="page-title">Company Matching</h2>
        <p className="page-subtitle">See how well you fit top companies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {companies.map((c, idx) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
            <Card className="flex flex-col items-center text-center h-full">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-xl mb-3">
                {c.name.charAt(0)}
              </div>
              <h4 className="font-semibold text-lg text-slate-900">{c.name}</h4>

              <div className="my-4">
                <ScoreRing score={c.fit} size={110} strokeWidth={10} color={c.fit >= 85 ? '#059669' : c.fit >= 70 ? '#d97706' : '#dc2626'} label="Overall Fit" />
              </div>

              <div className="grid grid-cols-3 gap-4 w-full border-t border-slate-100 pt-4">
                <SubScore label="Culture" value={c.culture} />
                <SubScore label="Tech" value={c.tech} />
                <SubScore label="Growth" value={c.growth} />
              </div>

              {c.gaps.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 w-full">
                  <p className="text-xs text-slate-500 mb-2">Skill Gaps</p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {c.gaps.map((g) => <Badge key={g} variant="rose">{g}</Badge>)}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
