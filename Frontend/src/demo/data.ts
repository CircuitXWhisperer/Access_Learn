export type Role = 'student' | 'admin';
export type User = { id: string; name: string; email: string; role: Role; className?: string; level?: number };

export const demoUsers: Record<Role, User> = {
  student: { id: 'student-1', name: 'Arjun Kumar', email: 'arjun@accesslearn.demo', role: 'student', className: 'Class 10', level: 12 },
  admin: { id: 'admin-1', name: 'Dr. Priya Sharma', email: 'admin@accesslearn.demo', role: 'admin' },
};

export type LearningModule = {
  id:string;
  title:string;
  subject:string;
  status:'completed'|'current'|'locked';
  progress:number;
  time:string;
  icon:string;
  description:string;
  learningGoals:string[];
  difficulty:'Foundational'|'Core'|'Intermediate';
  rewardPoints:number;
  resources:string[];
  unlockMessage:string;
  isUnlocked:boolean;
  locked:boolean;
};
export type AudioLesson = { title:string; subject:string; duration:string; tone:string };
export type Scheme = { name:string; category:string; deadline:string; description:string };
export type Student = { name:string; className:string; support:string; progress:number; status:'On track'|'Needs review' };

export const modules: LearningModule[] = [
  {
    id: 'm1',
    title: 'Intro to Integers',
    subject: 'Mathematics',
    status: 'completed',
    progress: 100,
    time: '25 min',
    icon: '∑',
    description: 'Start the daily path with essential integer concepts, number sense, and quick practice questions.',
    learningGoals: ['Understand positive and negative numbers', 'Solve simple integer problems', 'Review key classroom examples'],
    difficulty: 'Foundational',
    rewardPoints: 10,
    resources: ['Warm-up worksheet', 'Practice quiz', 'Short teacher recap'],
    unlockMessage: 'Unlocked for today',
    isUnlocked: true,
    locked: false,
  },
  {
    id: 'm2',
    title: 'Science: Plant Life Cycles',
    subject: 'Science',
    status: 'current',
    progress: 65,
    time: '35 min',
    icon: '◈',
    description: 'Explore the stages of plant growth, from seeds to seedlings to flowering plants.',
    learningGoals: ['Identify each stage of plant development', 'Understand the role of sunlight and water', 'Connect theory with real-life examples'],
    difficulty: 'Core',
    rewardPoints: 12,
    resources: ['Video explanation', 'Diagram notes', 'Mini quiz'],
    unlockMessage: 'Unlocked for today',
    isUnlocked: true,
    locked: false,
  },
  {
    id: 'm3',
    title: 'History: Ancient India',
    subject: 'History',
    status: 'current',
    progress: 0,
    time: '42 min',
    icon: '▤',
    description: 'Discover major dynasties, ideas, and cultural achievements of ancient India.',
    learningGoals: ['Map major historical periods', 'Compare civilizations and leaders', 'Build revision-friendly notes'],
    difficulty: 'Intermediate',
    rewardPoints: 15,
    resources: ['Timeline notes', 'Story-based recap', 'Revision checklist'],
    unlockMessage: 'Unlocked for today',
    isUnlocked: true,
    locked: false,
  },
  {
    id: 'm4',
    title: 'English: Writing Skills',
    subject: 'English',
    status: 'current',
    progress: 0,
    time: '30 min',
    icon: 'Aa',
    description: 'Strengthen paragraph structure, sentence clarity, and everyday writing confidence.',
    learningGoals: ['Write well-structured paragraphs', 'Use grammar correctly in context', 'Practice short writing tasks'],
    difficulty: 'Core',
    rewardPoints: 11,
    resources: ['Writing prompt bank', 'Grammar worksheet', 'Feedback tips'],
    unlockMessage: 'Unlocked for today',
    isUnlocked: true,
    locked: false,
  },
  {
    id: 'm5',
    title: 'Geography: Resources',
    subject: 'Geography',
    status: 'current',
    progress: 0,
    time: '28 min',
    icon: '◎',
    description: 'Learn how natural and human resources shape life, development, and planning.',
    learningGoals: ['Classify different resource types', 'Understand conservation and use', 'Link geography to daily life'],
    difficulty: 'Core',
    rewardPoints: 10,
    resources: ['Map activity', 'Resource chart', 'Summary notes'],
    unlockMessage: 'Unlocked for today',
    isUnlocked: true,
    locked: false,
  },
  {
    id: 'm6',
    title: 'Computer Science: Networks',
    subject: 'Computer Science',
    status: 'current',
    progress: 0,
    time: '32 min',
    icon: '⌘',
    description: 'Understand computer networks, internet basics, and how devices communicate.',
    learningGoals: ['Explain how networks connect devices', 'Differentiate between LAN and WAN', 'Recognize common internet terms'],
    difficulty: 'Intermediate',
    rewardPoints: 13,
    resources: ['Concept poster', 'Simple diagram', 'Quick-check quiz'],
    unlockMessage: 'Unlocked for today',
    isUnlocked: true,
    locked: false,
  },
  {
    id: 'm7',
    title: 'Civics: Democratic Rights',
    subject: 'Civics',
    status: 'current',
    progress: 0,
    time: '26 min',
    icon: '◫',
    description: 'Study democratic values, rights, responsibilities, and active citizenship in society.',
    learningGoals: ['Recognize key fundamental rights', 'Understand the role of citizens', 'Link civic ideas to everyday actions'],
    difficulty: 'Foundational',
    rewardPoints: 9,
    resources: ['Case-study notes', 'Rights chart', 'Reflection prompts'],
    unlockMessage: 'Unlocked for today',
    isUnlocked: true,
    locked: false,
  },
];

export const audioLessons: AudioLesson[] = [
  { title: 'Chemical Reactions', subject: 'Science', duration: '24 min', tone: 'orange' },
  { title: 'Nationalism in India', subject: 'History', duration: '42 min', tone: 'blue' },
  { title: 'Quadratic Equations', subject: 'Mathematics', duration: '31 min', tone: 'purple' },
];

export const schemes: Scheme[] = [
  { name: 'Pre-Matric Scholarship', category: 'Scholarship', deadline: '2 days', description: 'Financial support for eligible school students.' },
  { name: 'Disability Grant', category: 'Accessibility', deadline: 'Open', description: 'Support for assistive learning and accessibility needs.' },
  { name: 'National Means-cum-Merit Scholarship', category: 'Scholarship', deadline: '18 days', description: 'Scholarship support for continuation of secondary education.' },
];

export const students: Student[] = [
  { name: 'Aarav Mehta', className: '10-A', support: 'Screen reader', progress: 78, status: 'On track' },
  { name: 'Meera Joshi', className: '10-A', support: 'Audio-first', progress: 64, status: 'Needs review' },
  { name: 'Kabir Patil', className: '10-B', support: 'Sign language', progress: 91, status: 'On track' },
  { name: 'Ananya Rao', className: '10-B', support: 'Simplified mode', progress: 55, status: 'Needs review' },
];
