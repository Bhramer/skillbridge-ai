import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Target, BarChart3, Map, Mic,
  Code2, Briefcase, Building2, Zap, History, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/resume-analyzer', icon: FileText, label: 'Resume Analyzer' },
  { to: '/jd-matching', icon: Target, label: 'JD Matching' },
  { to: '/skill-gap', icon: BarChart3, label: 'Skill Gap' },
  { to: '/learning-roadmap', icon: Map, label: 'Roadmap' },
  { to: '/interview-prep', icon: Mic, label: 'Interview Prep' },
  { to: '/github-analysis', icon: Code2, label: 'GitHub' },
  { to: '/job-market', icon: Briefcase, label: 'Job Market' },
  { to: '/company-matching', icon: Building2, label: 'Companies' },
  { to: '/resume-builder', icon: Zap, label: 'Resume Builder' },
  { to: '/version-history', icon: History, label: 'History' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-200 flex flex-col z-40 transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-60'}`}>
      <div className="h-16 flex items-center px-4 border-b border-slate-200 gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && <span className="font-bold text-lg text-slate-900 truncate">ATS Pro</span>}
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 mx-2 mb-0.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-2 mb-3 p-2.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors flex items-center justify-center"
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
    </aside>
  );
}
