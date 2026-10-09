export type UserGoal = 'competitive' | 'academic' | 'skill' | 'general';

export interface ExamInfo {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface ImportantTopic {
  id: string;
  title: string;
  importance: 'High' | 'Medium' | 'Core Essential';
  description: string;
  keyTerms: string[];
}

export interface KeyConcept {
  term: string;
  definition: string;
  example: string;
}

export interface FlowchartStep {
  step: number;
  title: string;
  description: string;
  connections: string[];
}

export interface FlowchartNode {
  id: string;
  title: string;
  subtitle?: string;
  category: 'start' | 'process' | 'decision' | 'outcome';
  details: string;
  keyFormulaOrRule?: string;
  next: string[];
}

export interface FlowchartData {
  title: string;
  conceptOverview?: string;
  flowchart?: {
    nodes: FlowchartNode[];
  };
  steps?: FlowchartStep[];
  mnemonic?: {
    acronym: string;
    expansion: string;
    memoryTrick: string;
  };
}

export interface RecommendedChannel {
  name?: string;
  channelName?: string;
  subscribersEstimate?: string;
  specialty?: string;
  reason?: string;
  recommendedPlaylists?: string;
  directSearchQuery?: string;
  searchQuery?: string;
}

export interface MaterialAnalysis {
  summary: string;
  importantTopics: ImportantTopic[];
  keyConcepts: KeyConcept[];
  flowchart?: FlowchartData;
  recommendedChannels: RecommendedChannel[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
  isPyq?: boolean;
  pyqExam?: string;
  pyqYear?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  commonMistake?: string;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  stars: 0 | 1 | 2 | 3 | 4 | 5;
  pointsEarned: number;
  knowledgeLevel: 'Mastery' | 'Proficient' | 'Competent' | 'Developing' | 'Novice';
  weakTopics: string[];
  strongTopics: string[];
  timestamp: string;
  topic: string;
  userAnswers: { [questionId: number]: number };
}

export interface WeeklyTest {
  testTitle: string;
  durationMinutes: number;
  totalMarks: number;
  instructions: string[];
  sections: {
    name: string;
    questions: QuizQuestion[];
  }[];
}

export interface TestSubmissionResult {
  score: number;
  totalMarks: number;
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  percentage: number;
  stars: 0 | 1 | 2 | 3 | 4 | 5;
  pointsEarned: number;
  weakTopics: string[];
  solutions: {
    question: QuizQuestion;
    userAnswer: number | null;
    isCorrect: boolean;
  }[];
}

export interface DailyActivity {
  day: string;
  minutes: number;
  points: number;
  quizzesTaken: number;
  accuracy: number;
}

export interface PenaltyLog {
  id: string;
  timestamp: string;
  reason: string;
  gameLocked: string;
}

export type GameId = 'memory' | 'crossword' | 'rpg' | 'melon';

export interface GameInfo {
  id: GameId;
  name: string;
  description: string;
  icon: string;
  maxLevels: number;
  unlockedLevels: number;
  badge: string;
}
