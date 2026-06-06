import { Bell, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/': 'Career Dashboard',
  '/resume-analyzer': 'Resume Analyzer',
  '/jd-matching': 'JD Matching',
  '/skill-gap': 'Skill Gap Analysis',
  '/learning-roadmap': 'Learning Roadmap',
  '/interview-prep': 'Interview Prep',
  '/github-analysis': 'GitHub Analysis',
  '/job-market': 'Job Market',
  '/company-matching': 'Company Matching',
  '/resume-builder': 'Resume Builder',
  '/version-history': 'Version History',
};

export default function TopBar() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>
        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
          <User className="w-5 h-5 text-indigo-600" />
        </div>
      </div>
    </header>
  );
}
