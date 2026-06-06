export const dashboardStats = {
  atsScore: 78,
  applications: 24,
  interviews: 8,
  offers: 3,
  deltas: { atsScore: 5, applications: 12, interviews: -3, offers: 50 },
};

export const skills = [
  { name: 'React', level: 90, color: 'bg-indigo-500' },
  { name: 'TypeScript', level: 82, color: 'bg-blue-500' },
  { name: 'Python', level: 75, color: 'bg-emerald-500' },
  { name: 'Node.js', level: 70, color: 'bg-green-500' },
  { name: 'SQL', level: 65, color: 'bg-amber-500' },
  { name: 'AWS', level: 55, color: 'bg-orange-500' },
  { name: 'Docker', level: 50, color: 'bg-cyan-500' },
  { name: 'GraphQL', level: 45, color: 'bg-purple-500' },
];

export const scoreTrend = [
  { month: 'Oct', score: 58 },
  { month: 'Nov', score: 62 },
  { month: 'Dec', score: 65 },
  { month: 'Jan', score: 70 },
  { month: 'Feb', score: 73 },
  { month: 'Mar', score: 78 },
];

export const jobMatches = [
  { id: 1, title: 'Senior Frontend Engineer', company: 'Stripe', location: 'San Francisco, CA', salary: '$160k-$200k', match: 92 },
  { id: 2, title: 'Full Stack Developer', company: 'Vercel', location: 'Remote', salary: '$140k-$180k', match: 87 },
  { id: 3, title: 'React Developer', company: 'Shopify', location: 'Toronto, CA', salary: '$130k-$170k', match: 84 },
  { id: 4, title: 'Software Engineer II', company: 'Netflix', location: 'Los Gatos, CA', salary: '$180k-$240k', match: 79 },
  { id: 5, title: 'Frontend Architect', company: 'Figma', location: 'New York, NY', salary: '$170k-$220k', match: 76 },
  { id: 6, title: 'UI Engineer', company: 'Linear', location: 'Remote', salary: '$140k-$180k', match: 73 },
  { id: 7, title: 'Platform Engineer', company: 'Datadog', location: 'Boston, MA', salary: '$150k-$190k', match: 68 },
  { id: 8, title: 'Staff Engineer', company: 'Notion', location: 'San Francisco, CA', salary: '$200k-$260k', match: 65 },
];

export const atsMetrics = {
  keywordMatch: 82,
  formatScore: 91,
  sectionStructure: 75,
  readability: 88,
};

export const aiSuggestions = [
  { id: 1, severity: 'critical', text: 'Add measurable achievements with specific metrics (e.g., "Increased conversion by 35%")' },
  { id: 2, severity: 'critical', text: 'Include relevant keywords: "CI/CD", "microservices", "system design" from top job postings' },
  { id: 3, severity: 'warning', text: 'Your summary section is too generic. Tailor it to your target role.' },
  { id: 4, severity: 'warning', text: 'Add links to your GitHub profile and portfolio website' },
  { id: 5, severity: 'info', text: 'Consider using a single-column layout for better ATS parsing' },
  { id: 6, severity: 'info', text: 'Move education section below experience for senior roles' },
];

export const matchedSkills = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'REST APIs',
  'Git', 'Agile', 'CSS/Tailwind', 'Testing', 'HTML5',
];

export const missingSkills = [
  'Kubernetes', 'GraphQL', 'Redis', 'System Design', 'AWS Lambda',
];

export const skillGapData = {
  technical: [
    { skill: 'React', current: 90, required: 90, priority: 'Low' },
    { skill: 'System Design', current: 40, required: 85, priority: 'High' },
    { skill: 'TypeScript', current: 82, required: 90, priority: 'Medium' },
    { skill: 'Kubernetes', current: 20, required: 70, priority: 'High' },
    { skill: 'GraphQL', current: 45, required: 75, priority: 'High' },
    { skill: 'CI/CD', current: 55, required: 80, priority: 'Medium' },
  ],
  softSkills: [
    { skill: 'Communication', current: 80, required: 85, priority: 'Low' },
    { skill: 'Leadership', current: 55, required: 80, priority: 'High' },
    { skill: 'Mentoring', current: 45, required: 70, priority: 'Medium' },
    { skill: 'Problem Solving', current: 85, required: 90, priority: 'Low' },
  ],
  tools: [
    { skill: 'Docker', current: 50, required: 80, priority: 'High' },
    { skill: 'AWS', current: 55, required: 85, priority: 'High' },
    { skill: 'Jira', current: 75, required: 70, priority: 'Low' },
    { skill: 'Figma', current: 60, required: 65, priority: 'Low' },
  ],
  certifications: [
    { skill: 'AWS Solutions Architect', current: 0, required: 100, priority: 'High' },
    { skill: 'Kubernetes (CKA)', current: 0, required: 100, priority: 'Medium' },
    { skill: 'Google Cloud Professional', current: 0, required: 100, priority: 'Low' },
  ],
};

export const radarData = [
  { subject: 'Frontend', current: 90, target: 90 },
  { subject: 'Backend', current: 70, target: 85 },
  { subject: 'DevOps', current: 45, target: 80 },
  { subject: 'System Design', current: 40, target: 85 },
  { subject: 'Soft Skills', current: 75, target: 85 },
  { subject: 'Cloud', current: 55, target: 80 },
];

export const roadmapItems = [
  { id: 1, title: 'JavaScript Fundamentals', skill: 'JavaScript', duration: '2 weeks', status: 'done', progress: 100 },
  { id: 2, title: 'React Advanced Patterns', skill: 'React', duration: '3 weeks', status: 'done', progress: 100 },
  { id: 3, title: 'TypeScript Deep Dive', skill: 'TypeScript', duration: '2 weeks', status: 'done', progress: 100 },
  { id: 4, title: 'System Design Fundamentals', skill: 'System Design', duration: '4 weeks', status: 'active', progress: 45 },
  { id: 5, title: 'Docker & Containerization', skill: 'Docker', duration: '2 weeks', status: 'pending', progress: 0 },
  { id: 6, title: 'Kubernetes Essentials', skill: 'Kubernetes', duration: '3 weeks', status: 'pending', progress: 0 },
  { id: 7, title: 'AWS Cloud Practitioner', skill: 'AWS', duration: '4 weeks', status: 'pending', progress: 0 },
  { id: 8, title: 'GraphQL Mastery', skill: 'GraphQL', duration: '2 weeks', status: 'pending', progress: 0 },
];

export const interviewQuestions = {
  behavioral: [
    { id: 1, question: 'Tell me about a time you led a challenging project.', answer: 'Use the STAR method: Describe the Situation where you were leading a complex migration project. Explain the Task of coordinating 5 engineers across 3 time zones. Detail the Actions you took including daily standups, clear documentation, and risk mitigation. Share the Result: delivered 2 weeks early with zero downtime.', difficulty: 'Medium' },
    { id: 2, question: 'Describe a conflict with a coworker and how you resolved it.', answer: 'Focus on: the disagreement about technical approach, how you listened to understand their perspective, proposed a POC to test both approaches objectively, and how the data-driven resolution strengthened the working relationship.', difficulty: 'Medium' },
    { id: 3, question: 'How do you handle tight deadlines?', answer: 'Emphasize prioritization framework: identify must-haves vs nice-to-haves, communicate trade-offs to stakeholders early, break work into smaller deliverables, and demonstrate a track record of on-time delivery.', difficulty: 'Easy' },
    { id: 4, question: 'Tell me about a time you failed and what you learned.', answer: 'Share a genuine failure: pushed a deployment without adequate testing that caused a brief outage. What you learned: implemented pre-deployment checklists, automated integration tests, and canary deployments. Show growth mindset.', difficulty: 'Hard' },
  ],
  technical: [
    { id: 5, question: 'Explain the virtual DOM and reconciliation in React.', answer: 'The Virtual DOM is a lightweight JavaScript representation of the actual DOM. When state changes, React creates a new virtual DOM tree, diffs it against the previous one (reconciliation), and applies only the minimal set of actual DOM operations needed. Key concepts: fiber architecture, keys for list reconciliation, batched updates.', difficulty: 'Medium' },
    { id: 6, question: 'What is the difference between SQL and NoSQL databases?', answer: 'SQL databases are relational with structured schemas (ACID compliance, JOINs, normalization). NoSQL databases offer flexible schemas with horizontal scaling. Types: document (MongoDB), key-value (Redis), column-family (Cassandra), graph (Neo4j). Choice depends on data structure, scale, and consistency requirements.', difficulty: 'Easy' },
    { id: 7, question: 'How would you optimize a slow React application?', answer: 'Profiling first with React DevTools. Common optimizations: React.memo for expensive renders, useMemo/useCallback for referential equality, code splitting with React.lazy, virtualization for long lists, avoiding unnecessary re-renders by lifting state properly.', difficulty: 'Hard' },
  ],
  systemDesign: [
    { id: 8, question: 'Design a URL shortener like bit.ly.', answer: 'Key components: API gateway, hashing service (base62 encoding), distributed key-value store, redirect service (301 vs 302), analytics pipeline. Scale considerations: read-heavy (100:1 ratio), caching layer (Redis), database sharding by hash prefix, rate limiting.', difficulty: 'Hard' },
    { id: 9, question: 'Design a real-time chat application.', answer: 'Architecture: WebSocket connections via load balancer, message queue (Kafka) for async processing, Redis pub/sub for real-time delivery, PostgreSQL for message persistence, S3 for media. Key decisions: message ordering guarantees, read receipts, typing indicators, offline message delivery.', difficulty: 'Hard' },
  ],
};

export const githubLanguages = [
  { name: 'TypeScript', value: 42, color: '#3178c6' },
  { name: 'JavaScript', value: 25, color: '#f1e05a' },
  { name: 'Python', value: 18, color: '#3572A5' },
  { name: 'CSS', value: 8, color: '#563d7c' },
  { name: 'HTML', value: 5, color: '#e34c26' },
  { name: 'Other', value: 2, color: '#8b8b8b' },
];

export const githubRepos = [
  { name: 'react-dashboard', stars: 234, language: 'TypeScript', updated: '2 days ago', skills: ['React', 'TypeScript', 'Tailwind'] },
  { name: 'api-gateway', stars: 156, language: 'TypeScript', updated: '1 week ago', skills: ['Node.js', 'Express', 'Redis'] },
  { name: 'ml-pipeline', stars: 89, language: 'Python', updated: '2 weeks ago', skills: ['Python', 'TensorFlow', 'Docker'] },
  { name: 'e-commerce-app', stars: 67, language: 'JavaScript', updated: '3 weeks ago', skills: ['React', 'Node.js', 'MongoDB'] },
  { name: 'cli-toolkit', stars: 45, language: 'TypeScript', updated: '1 month ago', skills: ['Node.js', 'TypeScript', 'CLI'] },
  { name: 'data-viz', stars: 34, language: 'JavaScript', updated: '1 month ago', skills: ['D3.js', 'SVG', 'Canvas'] },
  { name: 'auth-service', stars: 28, language: 'Python', updated: '2 months ago', skills: ['FastAPI', 'JWT', 'PostgreSQL'] },
];

export const companies = [
  { id: 1, name: 'Stripe', fit: 88, culture: 85, tech: 92, growth: 87, gaps: ['System Design', 'Distributed Systems'] },
  { id: 2, name: 'Vercel', fit: 85, culture: 90, tech: 88, growth: 78, gaps: ['Edge Computing', 'Rust'] },
  { id: 3, name: 'Shopify', fit: 82, culture: 80, tech: 85, growth: 82, gaps: ['Ruby', 'GraphQL'] },
  { id: 4, name: 'Figma', fit: 79, culture: 88, tech: 80, growth: 70, gaps: ['C++', 'WebAssembly'] },
  { id: 5, name: 'Linear', fit: 76, culture: 92, tech: 78, growth: 60, gaps: ['Rust', 'Real-time Sync'] },
  { id: 6, name: 'Notion', fit: 73, culture: 85, tech: 75, growth: 60, gaps: ['Kotlin', 'iOS'] },
];

export const resumeVersions = [
  { id: 1, name: 'Software Engineer - General', date: '2026-04-05', atsScore: 78, status: 'active' },
  { id: 2, name: 'Frontend Specialist', date: '2026-03-28', atsScore: 85, status: 'active' },
  { id: 3, name: 'Full Stack Developer', date: '2026-03-15', atsScore: 72, status: 'draft' },
  { id: 4, name: 'Tech Lead Resume', date: '2026-03-01', atsScore: 68, status: 'archived' },
];

export const resumeContent = {
  name: 'Alex Morgan',
  title: 'Senior Software Engineer',
  email: 'alex.morgan@email.com',
  phone: '(555) 123-4567',
  location: 'San Francisco, CA',
  summary: 'Senior Software Engineer with 6+ years of experience building scalable web applications. Expertise in React, TypeScript, and Node.js. Passionate about developer experience and performance optimization.',
  experience: [
    { company: 'TechCorp', role: 'Senior Software Engineer', period: '2023 - Present', bullets: ['Led migration of legacy jQuery app to React, improving load time by 60%', 'Architected shared component library used by 5 product teams', 'Mentored 3 junior engineers through technical growth plans'] },
    { company: 'StartupXYZ', role: 'Software Engineer', period: '2020 - 2023', bullets: ['Built real-time analytics dashboard processing 1M+ events/day', 'Implemented CI/CD pipeline reducing deployment time by 75%', 'Developed REST API serving 50k+ daily active users'] },
  ],
  education: { school: 'UC Berkeley', degree: 'B.S. Computer Science', year: '2020' },
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker', 'Git'],
};

export const versionHistory = [
  { version: 'v4.0', date: '2026-04-05', score: 78, change: 6, status: 'Current' },
  { version: 'v3.0', date: '2026-03-28', score: 72, change: 4, status: 'Previous' },
  { version: 'v2.1', date: '2026-03-15', score: 68, change: -2, status: 'Previous' },
  { version: 'v2.0', date: '2026-03-01', score: 70, change: 8, status: 'Previous' },
  { version: 'v1.1', date: '2026-02-15', score: 62, change: 4, status: 'Previous' },
  { version: 'v1.0', date: '2026-02-01', score: 58, change: 0, status: 'Initial' },
];
