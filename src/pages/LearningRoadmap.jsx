import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Lock, Clock, BookOpen } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { roadmapItems } from '../data/mock';

const statusConfig = {
  done: { icon: CheckCircle2, color: 'text-emerald-500', line: 'bg-emerald-400', variant: 'emerald', label: 'Completed' },
  active: { icon: Circle, color: 'text-indigo-500', line: 'bg-indigo-400', variant: 'indigo', label: 'In Progress' },
  pending: { icon: Lock, color: 'text-slate-400', line: 'bg-slate-200', variant: 'slate', label: 'Upcoming' },
};

export default function LearningRoadmap() {
  return (
    <motion.div className="page-container" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
      <div>
        <h2 className="page-title">Learning Roadmap</h2>
        <p className="page-subtitle">Your personalized path to career growth</p>
      </div>

      <div className="flex gap-4 mb-2">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {roadmapItems.filter(i => i.status === 'done').length} Completed
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Circle className="w-4 h-4 text-indigo-500" /> {roadmapItems.filter(i => i.status === 'active').length} Active
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Lock className="w-4 h-4 text-slate-400" /> {roadmapItems.filter(i => i.status === 'pending').length} Pending
        </div>
      </div>

      <div className="relative">
        {roadmapItems.map((item, idx) => {
          const cfg = statusConfig[item.status];
          const Icon = cfg.icon;
          const isLast = idx === roadmapItems.length - 1;

          return (
            <motion.div
              key={item.id}
              className="flex gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 bg-white ${
                  item.status === 'active' ? 'border-indigo-500 shadow-md shadow-indigo-100' : item.status === 'done' ? 'border-emerald-500' : 'border-slate-200'
                }`}>
                  {item.status === 'active' ? (
                    <div className="relative">
                      <div className="absolute inset-0 w-10 h-10 -m-[5px] rounded-full bg-indigo-400 opacity-30 animate-pulse-ring" />
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                    </div>
                  ) : (
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  )}
                </div>
                {!isLast && <div className={`w-0.5 flex-1 min-h-[32px] ${cfg.line}`} />}
              </div>

              <Card className={`flex-1 mb-4 ${item.status === 'active' ? 'ring-2 ring-indigo-100' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-slate-900">{item.title}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {item.duration}</span>
                      <span>Skill: {item.skill}</span>
                    </div>
                  </div>
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                </div>

                {item.status === 'active' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Progress</span><span>{item.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-indigo-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
