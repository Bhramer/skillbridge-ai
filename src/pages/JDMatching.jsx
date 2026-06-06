import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Search, Upload, CheckCircle, FileText, BookOpen, ExternalLink,
  Target, Brain, Sparkles, AlertTriangle, TrendingUp, Award,
  Layers, GraduationCap, Clock, ChevronDown, ChevronUp, Loader2,
} from 'lucide-react';
import ScoreRing from '../components/ui/ScoreRing';
import Card from '../components/ui/Card';
import SkillChip from '../components/ui/SkillChip';
import Badge from '../components/ui/Badge';
import { analyzeMatch, analyzeJD } from '../services/api';

const TABS = [
  { key: 'match', label: 'Resume + JD Match', icon: Target },
  { key: 'jd', label: 'JD Analysis & Resources', icon: BookOpen },
];

const verdictConfig = {
  'Strong Match': { variant: 'emerald', icon: Award },
  'Good Match': { variant: 'indigo', icon: TrendingUp },
  'Needs Improvement': { variant: 'amber', icon: AlertTriangle },
  'Weak Match': { variant: 'rose', icon: AlertTriangle },
};

const difficultyColors = {
  beginner: 'emerald',
  intermediate: 'amber',
  advanced: 'rose',
};

const scoreColor = (v) => (v >= 80 ? '#059669' : v >= 60 ? '#d97706' : '#dc2626');

function ExpandableSection({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Icon className="w-5 h-5 text-indigo-600" /> {title}
        </h3>
        {open ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="mt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function JDMatching() {
  const [activeTab, setActiveTab] = useState('match');
  const [jd, setJd] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [jdResult, setJdResult] = useState(null);

  const onDrop = useCallback((accepted) => {
    if (accepted.length) {
      setFile(accepted[0]);
      setMatchResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  const handleMatchAnalyze = async () => {
    if (!file || jd.trim().length <= 10) return;
    setLoading(true);
    setError(null);
    setMatchResult(null);
    try {
      const data = await analyzeMatch(file, jd);
      setMatchResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJDAnalyze = async () => {
    if (jd.trim().length <= 10) return;
    setLoading(true);
    setError(null);
    setJdResult(null);
    try {
      const data = await analyzeJD(jd);
      setJdResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (key) => {
    setActiveTab(key);
    setError(null);
  };

  return (
    <motion.div className="page-container" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
      <div>
        <h2 className="page-title">JD Matching</h2>
        <p className="page-subtitle">ML-powered resume analysis and learning resources</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => switchTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Mode 1: Resume + JD Match */}
      {activeTab === 'match' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resume upload */}
            <Card>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" /> Upload Resume
              </h3>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-indigo-400 bg-indigo-50' : file ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 hover:border-indigo-300 hover:bg-indigo-50/30'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
                  {file ? (
                    <>
                      <CheckCircle className="w-10 h-10 text-emerald-500" />
                      <p className="text-sm font-medium text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-500">Click or drag to replace</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-slate-400" />
                      <p className="text-sm font-medium text-slate-700">
                        {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                      </p>
                      <p className="text-xs text-slate-500">PDF or DOCX</p>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* JD textarea */}
            <Card>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" /> Job Description
              </h3>
              <textarea
                value={jd}
                onChange={(e) => { setJd(e.target.value); setMatchResult(null); }}
                placeholder="Paste the full job description here..."
                className="w-full h-48 p-4 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50"
              />
            </Card>
          </div>

          <button
            onClick={handleMatchAnalyze}
            disabled={!file || jd.trim().length <= 10 || loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            {loading ? 'Analyzing with ML Models...' : 'Analyze Match'}
          </button>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          {/* Match Results */}
          {matchResult && <MatchResults data={matchResult} />}
        </div>
      )}

      {/* Mode 2: JD Only */}
      {activeTab === 'jd' && (
        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" /> Job Description
            </h3>
            <textarea
              value={jd}
              onChange={(e) => { setJd(e.target.value); setJdResult(null); }}
              placeholder="Paste the full job description here to get skill analysis and learning resources..."
              className="w-full h-48 p-4 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50"
            />
          </Card>

          <button
            onClick={handleJDAnalyze}
            disabled={jd.trim().length <= 10 || loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Analyzing JD...' : 'Analyze JD & Get Resources'}
          </button>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          {jdResult && <JDResults data={jdResult} />}
        </div>
      )}
    </motion.div>
  );
}


function MatchResults({ data }) {
  const m = data.match;
  const s = m.scores;
  const cfg = verdictConfig[m.verdict] || verdictConfig['Good Match'];
  const VerdictIcon = cfg.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">

      {/* Verdict banner */}
      <Card className="!bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-100">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <ScoreRing score={s.composite_score} size={100} strokeWidth={10} color={scoreColor(s.composite_score)} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <VerdictIcon className="w-5 h-5 text-indigo-600" />
                <Badge variant={cfg.variant} className="text-sm">{m.verdict}</Badge>
              </div>
              <p className="text-sm text-slate-600 max-w-md">{m.verdict_detail}</p>
            </div>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p>{data.resume_skills_count} skills in resume</p>
            <p>{data.jd_skills_count} skills in JD</p>
          </div>
        </div>
      </Card>

      {/* Score breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Semantic Similarity', value: s.semantic_score, icon: Brain },
          { label: 'Keyword Match', value: s.keyword_score, icon: Search },
          { label: 'Skill Overlap', value: s.skill_score, icon: Target },
          { label: 'Experience Fit', value: s.experience_score, icon: Clock },
        ].map((item) => (
          <Card key={item.label} className="flex flex-col items-center gap-3 py-6">
            <ScoreRing score={item.value} size={80} strokeWidth={8} color={scoreColor(item.value)} />
            <div className="text-center">
              <item.icon className="w-4 h-4 text-slate-400 mx-auto mb-1" />
              <span className="text-xs font-medium text-slate-600">{item.label}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpandableSection title={`Matched Skills (${m.matched_skills.length})`} icon={CheckCircle}>
          {m.matched_skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {m.matched_skills.map((s) => <SkillChip key={s} label={s} matched />)}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No matching skills found</p>
          )}
        </ExpandableSection>

        <ExpandableSection title={`Missing Skills (${m.missing_skills.length})`} icon={AlertTriangle}>
          {m.missing_skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {m.missing_skills.map((s) => <SkillChip key={s} label={s} matched={false} />)}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No missing skills -- great coverage!</p>
          )}
        </ExpandableSection>
      </div>

      {/* Experience detail */}
      {m.experience_detail && (
        <ExpandableSection title="Experience Analysis" icon={Clock} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Your Experience</p>
              <p className="text-2xl font-bold text-slate-900">{m.experience_detail.resume_years ?? '?'} <span className="text-sm font-normal text-slate-500">years</span></p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Required</p>
              <p className="text-2xl font-bold text-slate-900">{m.experience_detail.jd_required_years ?? 'N/A'} <span className="text-sm font-normal text-slate-500">years</span></p>
            </div>
          </div>
          {m.experience_detail.note && <p className="text-sm text-slate-500 mt-3">{m.experience_detail.note}</p>}
        </ExpandableSection>
      )}

      {/* Suggestions */}
      {m.suggestions?.length > 0 && (
        <ExpandableSection title="AI Suggestions" icon={Sparkles}>
          <div className="space-y-3">
            {m.suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                <Sparkles className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-700">{s}</p>
              </div>
            ))}
          </div>
        </ExpandableSection>
      )}
    </motion.div>
  );
}


function JDResults({ data }) {
  const a = data.analysis;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">

      {/* Overview */}
      <Card className="!bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-100">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Seniority Level</p>
              <p className="text-lg font-bold text-slate-900">{a.seniority}</p>
            </div>
          </div>
          {a.experience_years && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Experience Required</p>
                <p className="text-lg font-bold text-slate-900">{a.experience_years}+ years</p>
              </div>
            </div>
          )}
          {a.education_level && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Award className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Education</p>
                <p className="text-lg font-bold text-slate-900">{a.education_level}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
              <Layers className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Skills</p>
              <p className="text-lg font-bold text-slate-900">{a.skills_must_have.length + a.skills_nice_to_have.length}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Skill categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-rose-700 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5" /> Must-Have Skills ({a.skills_must_have.length})
          </h3>
          {a.skills_must_have.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {a.skills_must_have.map((s) => (
                <span key={s} className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-sm font-medium">{s}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">None detected</p>
          )}
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-amber-700 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Nice-to-Have Skills ({a.skills_nice_to_have.length})
          </h3>
          {a.skills_nice_to_have.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {a.skills_nice_to_have.map((s) => (
                <span key={s} className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-sm font-medium">{s}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">None detected</p>
          )}
        </Card>
      </div>

      {/* Learning resources per skill */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" /> Learning Resources by Skill
        </h3>
        <div className="space-y-4">
          {a.skill_resources.map((sr) => (
            <Card key={sr.skill}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-900">{sr.skill}</h4>
                  <Badge variant={sr.importance === 'must-have' ? 'rose' : 'amber'} className="text-xs">{sr.importance}</Badge>
                  <span className="text-xs text-slate-400">{sr.category}</span>
                </div>
              </div>

              {sr.resources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sr.resources.map((r, i) => (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors group"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 group-hover:text-indigo-700 truncate">{r.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">{r.platform}</span>
                          <span className="text-slate-300">|</span>
                          <Badge variant={difficultyColors[r.difficulty] || 'slate'} className="text-xs capitalize">{r.difficulty}</Badge>
                          <span className="text-slate-300">|</span>
                          <span className="text-xs text-slate-400 capitalize">{r.type}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No curated resources available for this skill yet.</p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
