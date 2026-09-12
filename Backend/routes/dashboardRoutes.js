import express from 'express';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const router = express.Router();
const progressPath = fileURLToPath(new URL('../data/learning-progress.json', import.meta.url));

const dailyModules = [
  {
    id: 'm1',
    title: 'Intro to Integers',
    subject: 'Mathematics',
    time: '25 min',
    icon: '∑',
    description: 'Start the daily path with essential integer concepts, number sense, and quick practice questions.',
    learningGoals: ['Understand positive and negative numbers', 'Solve simple integer problems', 'Review key classroom examples'],
    difficulty: 'Foundational',
    rewardPoints: 10,
    resources: ['Warm-up worksheet', 'Practice quiz', 'Short teacher recap'],
    unlockMessage: 'Open now',
  },
  {
    id: 'm2',
    title: 'Science: Plant Life Cycles',
    subject: 'Science',
    time: '35 min',
    icon: '◈',
    description: 'Explore the stages of plant growth, from seeds to seedlings to flowering plants.',
    learningGoals: ['Identify each stage of plant development', 'Understand the role of sunlight and water', 'Connect theory with real-life examples'],
    difficulty: 'Core',
    rewardPoints: 12,
    resources: ['Video explanation', 'Diagram notes', 'Mini quiz'],
    unlockMessage: 'Open now',
  },
  {
    id: 'm3',
    title: 'History: Ancient India',
    subject: 'History',
    time: '42 min',
    icon: '▤',
    description: 'Discover major dynasties, ideas, and cultural achievements of ancient India.',
    learningGoals: ['Map major historical periods', 'Compare civilizations and leaders', 'Build revision-friendly notes'],
    difficulty: 'Intermediate',
    rewardPoints: 15,
    resources: ['Timeline notes', 'Story-based recap', 'Revision checklist'],
    unlockMessage: 'Open now',
  },
  {
    id: 'm4',
    title: 'English: Writing Skills',
    subject: 'English',
    time: '30 min',
    icon: 'Aa',
    description: 'Strengthen paragraph structure, sentence clarity, and everyday writing confidence.',
    learningGoals: ['Write well-structured paragraphs', 'Use grammar correctly in context', 'Practice short writing tasks'],
    difficulty: 'Core',
    rewardPoints: 11,
    resources: ['Writing prompt bank', 'Grammar worksheet', 'Feedback tips'],
    unlockMessage: 'Open now',
  },
  {
    id: 'm5',
    title: 'Geography: Resources',
    subject: 'Geography',
    time: '28 min',
    icon: '◎',
    description: 'Learn how natural and human resources shape life, development, and planning.',
    learningGoals: ['Classify different resource types', 'Understand conservation and use', 'Link geography to daily life'],
    difficulty: 'Core',
    rewardPoints: 10,
    resources: ['Map activity', 'Resource chart', 'Summary notes'],
    unlockMessage: 'Open now',
  },
  {
    id: 'm6',
    title: 'Computer Science: Networks',
    subject: 'Computer Science',
    time: '32 min',
    icon: '⌘',
    description: 'Understand computer networks, internet basics, and how devices communicate.',
    learningGoals: ['Explain how networks connect devices', 'Differentiate between LAN and WAN', 'Recognize common internet terms'],
    difficulty: 'Intermediate',
    rewardPoints: 13,
    resources: ['Concept poster', 'Simple diagram', 'Quick-check quiz'],
    unlockMessage: 'Open now',
  },
  {
    id: 'm7',
    title: 'Civics: Democratic Rights',
    subject: 'Civics',
    time: '26 min',
    icon: '◫',
    description: 'Study democratic values, rights, responsibilities, and active citizenship in society.',
    learningGoals: ['Recognize key fundamental rights', 'Understand the role of citizens', 'Link civic ideas to everyday actions'],
    difficulty: 'Foundational',
    rewardPoints: 9,
    resources: ['Case-study notes', 'Rights chart', 'Reflection prompts'],
    unlockMessage: 'Open now',
  },
];

const audioLessons = [
  { title: 'Chemical Reactions', subject: 'Science', duration: '24 min', tone: 'orange' },
  { title: 'Nationalism in India', subject: 'History', duration: '42 min', tone: 'blue' },
  { title: 'Quadratic Equations', subject: 'Mathematics', duration: '31 min', tone: 'purple' },
];

const alerts = [
  { type: 'danger', title: 'Scholarship Deadline', text: 'Pre-Matric Scholarship portal closes in 2 days.', action: 'Apply now' },
  { type: 'info', title: 'Government Update', text: 'New disability grant forms are available.', action: 'Read more' },
  { type: 'success', title: 'Assignment Graded', text: 'Math Homework 3: You scored 9/10.', action: 'View result' },
];

async function readProgress() {
  try {
    const raw = await fs.readFile(progressPath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDay(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getStreak(entries) {
  const completedDays = new Set(
    entries
      .filter((entry) => entry.completed)
      .map((entry) => formatDay(entry.updatedAt || Date.now()))
  );

  if (completedDays.size === 0) return 0;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentDay = new Date(today);
  let streak = 0;

  if (!completedDays.has(formatDay(currentDay))) {
    currentDay.setDate(currentDay.getDate() - 1);
  }

  while (completedDays.has(formatDay(currentDay))) {
    streak += 1;
    currentDay.setDate(currentDay.getDate() - 1);
  }

  return streak;
}

router.get('/', async (req, res) => {
  const studentId = req.query.studentId || 'student-1';

  try {
    const entries = await readProgress();
    const studentEntries = entries.filter((entry) => entry.studentId === studentId);

    const latestByModule = new Map();

    for (const entry of studentEntries) {
      const current = latestByModule.get(entry.moduleId);
      if (!current || new Date(entry.updatedAt || 0) > new Date(current.updatedAt || 0)) {
        latestByModule.set(entry.moduleId, entry);
      }
    }

    const modules = dailyModules.map((module) => {
      const record = latestByModule.get(module.id);
      const progress = Math.max(0, Math.min(100, Number(record?.progress ?? 0)));
      const completed = Boolean(record?.completed) || progress >= 100;

      return {
        ...module,
        status: completed ? 'completed' : 'current',
        progress,
        isUnlocked: true,
        locked: false,
        unlockMessage: 'Unlocked for today',
      };
    });

    const completedCount = modules.filter((module) => module.status === 'completed').length;

    return res.json({
      success: true,
      data: {
        modules,
        audioLessons,
        streak: getStreak(studentEntries),
        completed: completedCount,
        total: modules.length,
        alerts,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to load dashboard data',
    });
  }
});

export default router;
