import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import JDMatching from './pages/JDMatching';
import SkillGap from './pages/SkillGap';
import LearningRoadmap from './pages/LearningRoadmap';
import InterviewPrep from './pages/InterviewPrep';
import GitHubAnalysis from './pages/GitHubAnalysis';
import JobMarket from './pages/JobMarket';
import CompanyMatching from './pages/CompanyMatching';
import ResumeBuilder from './pages/ResumeBuilder';
import VersionHistory from './pages/VersionHistory';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 ml-60 flex flex-col">
          <TopBar />
          <main className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
                <Route path="/jd-matching" element={<JDMatching />} />
                <Route path="/skill-gap" element={<SkillGap />} />
                <Route path="/learning-roadmap" element={<LearningRoadmap />} />
                <Route path="/interview-prep" element={<InterviewPrep />} />
                <Route path="/github-analysis" element={<GitHubAnalysis />} />
                <Route path="/job-market" element={<JobMarket />} />
                <Route path="/company-matching" element={<CompanyMatching />} />
                <Route path="/resume-builder" element={<ResumeBuilder />} />
                <Route path="/version-history" element={<VersionHistory />} />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
