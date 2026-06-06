export interface User {
  id: string;
  name: string;
  email: string;
  target_role: string | null;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AnalysisResult {
  id: string;
  ats_score: number;
  sub_metrics: {
    keyword_match: number;
    format_score: number;
    readability: number;
    section_structure: number;
  };
  skills_found: string[];
  suggestions: Suggestion[];
  experience_years: number | null;
  education_level: string | null;
}

export interface Suggestion {
  severity: "error" | "warning" | "success";
  text: string;
  category: string;
}

export interface DashboardData {
  ats_score: number | null;
  skill_match_pct: number | null;
  job_matches_count: number;
  confidence_score: number | null;
  skill_gap_chart: { category: string; count: number }[];
  jd_match_score: number | null;
  skill_trends: { date: string; score: number }[];
  top_jobs: Job[];
  ai_recommendations: Recommendation[];
  sub_metrics: Record<string, number>;
  skills_found: string[];
}

export interface Recommendation {
  text: string;
  priority: string;
  category: string;
}

export interface SkillGapData {
  skills_found: number;
  skills_required: number;
  gap_count: number;
  gap_score: number;
  categories: Record<string, SkillGap[]>;
  priority_list: SkillGap[];
}

export interface SkillGap {
  skill: string;
  category: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  demand_pct: number;
  time_to_learn: string;
  current_level: number;
  required_level: number;
}

export interface Roadmap {
  id: string;
  weeks: number;
  steps: RoadmapStep[];
  progress_pct: number;
  project_ideas: string[];
}

export interface RoadmapStep {
  id: number;
  week: number;
  title: string;
  skill: string;
  description: string;
  resources: string[];
  duration: string;
  status: "pending" | "in_progress" | "done";
}

export interface InterviewQuestion {
  id: number;
  question: string;
  answer: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface InterviewEval {
  confidence: number;
  clarity: number;
  relevance: number;
  pacing: number;
  feedback: string;
}

export interface GitHubProfile {
  username: string;
  avatar_url: string;
  bio: string;
  repos_count: number;
  total_stars: number;
  followers: number;
  languages: Record<string, number>;
  repos: GitHubRepo[];
  skills_detected: string[];
  skills_missing_from_resume: string[];
}

export interface GitHubRepo {
  name: string;
  stars: number;
  language: string | null;
  updated: string;
  description: string;
  url: string;
  skills: string[];
}

export interface Job {
  title: string;
  company: string;
  location: string;
  salary: string;
  url: string;
  snippet: string;
  skills: string[];
  match_pct?: number;
  matched_skills?: string[];
  missing_skills?: string[];
}

export interface CompanyMatch {
  name: string;
  match_pct: number;
  matched_skills: string[];
  missing_skills: string[];
  partial_skills: string[];
  job_count: number;
}

export interface ResumeVersion {
  id: string;
  version_name: string;
  ats_score: number | null;
  status: string;
  created_at: string;
}

export interface MatchResult {
  scores: {
    semantic_score: number;
    keyword_score: number;
    skill_score: number;
    experience_score: number;
    composite_score: number;
  };
  matched_skills: string[];
  missing_skills: string[];
  resume_only_skills: string[];
  verdict: string;
  verdict_detail: string;
  suggestions: string[];
}
