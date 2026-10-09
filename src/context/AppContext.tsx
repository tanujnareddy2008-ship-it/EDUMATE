import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  UserGoal,
  ImportantTopic,
  MaterialAnalysis,
  QuizResult,
  DailyActivity,
  PenaltyLog,
  GameId,
} from '../types';

interface DocumentInfo {
  name: string;
  type: 'pdf' | 'text';
  content?: string;
  base64?: string;
  size?: number;
}

interface AppContextType {
  // Points & Stars
  points: number;
  totalStars: number;
  starCounts: { 5: number; 4: number; 3: number; 2: number; 1: number; 0: number };
  addQuizPoints: (stars: 0 | 1 | 2 | 3 | 4 | 5) => { pointsEarned: number };
  awardDirectPoints: (amount: number, reason?: string) => void;

  // Games Unlock & Levels
  gamesArcadeUnlocked: boolean;
  unlockedLevels: Record<GameId, number>; // Level number unlocked up to (1..50)
  unlockNextLevel: (gameId: GameId) => { success: boolean; message: string };
  penaltyLogs: PenaltyLog[];
  triggerEarlyExitPenalty: () => void;

  // Notifications Mute
  isNotificationsMuted: boolean;
  toggleNotificationsMute: () => void;

  // Study Setup & Profile
  userGoal: UserGoal;
  setUserGoal: (goal: UserGoal) => void;
  targetExam: string;
  setTargetExam: (exam: string) => void;
  subject: string;
  setSubject: (sub: string) => void;
  topic: string;
  setTopic: (top: string) => void;
  allSubjects: string[];

  // Uploaded Document
  activeDocument: DocumentInfo | null;
  setActiveDocument: (doc: DocumentInfo | null) => void;
  clearDocument: () => void;

  // Material Analysis Cache
  materialAnalysis: MaterialAnalysis | null;
  setMaterialAnalysis: (analysis: MaterialAnalysis | null) => void;
  importantTopics: ImportantTopic[];
  setImportantTopics: (topics: ImportantTopic[]) => void;

  // 30-min Monitored Practice Session
  isPracticeSessionActive: boolean;
  setIsPracticeSessionActive: (active: boolean) => void;
  practiceSecondsLeft: number;
  setPracticeSecondsLeft: React.Dispatch<React.SetStateAction<number>>;
  continuousFocusMinutes: number;
  addPracticeTime: (minutes: number) => void;
  showPracticeCompletionModal: boolean;
  setShowPracticeCompletionModal: (show: boolean) => void;
  extendPracticeBy30Min: () => void;

  // Quiz & Knowledge Level
  recentQuizResult: QuizResult | null;
  setRecentQuizResult: (res: QuizResult | null) => void;
  quizHistory: QuizResult[];
  recordQuizResult: (res: QuizResult) => void;
  weakTopicsGlobal: string[];
  setWeakTopicsGlobal: React.Dispatch<React.SetStateAction<string[]>>;

  // Weekly Performance Data (Dedicated page)
  weeklyActivities: DailyActivity[];

  // Navigation
  activeTab: 'dashboard' | 'practice' | 'quiz' | 'weekly-test' | 'flowchart' | 'games' | 'youtube' | 'weekly-performance';
  setActiveTab: (tab: 'dashboard' | 'practice' | 'quiz' | 'weekly-test' | 'flowchart' | 'games' | 'youtube' | 'weekly-performance') => void;

  // Quick Action
  startQuickQuizForTopic: (customTopic?: string) => void;
  startFlowchartRevision: (customTopic?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_SUBJECTS = [
  'Mathematics & Calculus',
  'Physics & Mechanics',
  'Organic & Physical Chemistry',
  'Biology & Genetics',
  'Computer Science & Algorithms',
  'Indian & World History',
  'Economics & Commerce',
  'English Literature & Verbal',
  'Electrical & Electronics Engineering',
  'Political Science & Constitution',
  'Biotechnology & Medical Sciences',
  'Civil Services Aptitude (CSAT)',
];

const INITIAL_WEEKLY: DailyActivity[] = [
  { day: 'Mon', minutes: 35, points: 14, quizzesTaken: 2, accuracy: 80 },
  { day: 'Tue', minutes: 45, points: 18, quizzesTaken: 2, accuracy: 85 },
  { day: 'Wed', minutes: 30, points: 10, quizzesTaken: 1, accuracy: 75 },
  { day: 'Thu', minutes: 60, points: 26, quizzesTaken: 3, accuracy: 90 },
  { day: 'Fri', minutes: 40, points: 16, quizzesTaken: 2, accuracy: 80 },
  { day: 'Sat', minutes: 90, points: 34, quizzesTaken: 4, accuracy: 88 },
  { day: 'Sun', minutes: 50, points: 20, quizzesTaken: 2, accuracy: 92 },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start with 60 initial points so user can test game unlocking immediately, or earn more!
  const [points, setPoints] = useState<number>(() => {
    const saved = localStorage.getItem('edumate_points');
    return saved !== null ? parseInt(saved, 10) : 50;
  });

  const [totalStars, setTotalStars] = useState<number>(() => {
    const saved = localStorage.getItem('edumate_total_stars');
    return saved !== null ? parseInt(saved, 10) : 15;
  });

  const [starCounts, setStarCounts] = useState<{ 5: number; 4: number; 3: number; 2: number; 1: number; 0: number }>({
    5: 2,
    4: 1,
    3: 0,
    2: 0,
    1: 0,
    0: 0,
  });

  // Games levels: each game has 50 levels. Level 1 is unlocked by default!
  const [unlockedLevels, setUnlockedLevels] = useState<Record<GameId, number>>(() => {
    const saved = localStorage.getItem('edumate_unlocked_levels');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      memory: 1,
      crossword: 1,
      rpg: 1,
      melon: 1,
    };
  });

  const [penaltyLogs, setPenaltyLogs] = useState<PenaltyLog[]>([]);
  const [isNotificationsMuted, setIsNotificationsMuted] = useState<boolean>(true); // Default muted during study as requested

  // Study profile
  const [userGoal, setUserGoal] = useState<UserGoal>('competitive');
  const [targetExam, setTargetExam] = useState<string>('JEE Main / Advanced');
  const [subject, setSubject] = useState<string>('Physics & Mechanics');
  const [topic, setTopic] = useState<string>("Newton's Laws of Motion & Momentum Conservation");
  const [allSubjects] = useState<string[]>(INITIAL_SUBJECTS);

  // Uploaded Document
  const [activeDocument, setActiveDocument] = useState<DocumentInfo | null>(null);
  const [materialAnalysis, setMaterialAnalysis] = useState<MaterialAnalysis | null>(null);
  const [importantTopics, setImportantTopics] = useState<ImportantTopic[]>([]);

  // 30-min Monitored Practice Room
  const [isPracticeSessionActive, setIsPracticeSessionActive] = useState<boolean>(false);
  const [practiceSecondsLeft, setPracticeSecondsLeft] = useState<number>(1800); // 30 minutes = 1800s
  const [continuousFocusMinutes, setContinuousFocusMinutes] = useState<number>(0);
  const [showPracticeCompletionModal, setShowPracticeCompletionModal] = useState<boolean>(false);

  // Quizzes & Results
  const [recentQuizResult, setRecentQuizResult] = useState<QuizResult | null>(null);
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
  const [weakTopicsGlobal, setWeakTopicsGlobal] = useState<string[]>(['Conservation of Momentum', 'Friction Coefficients']);

  // Weekly records
  const [weeklyActivities, setWeeklyActivities] = useState<DailyActivity[]>(INITIAL_WEEKLY);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'practice' | 'quiz' | 'weekly-test' | 'flowchart' | 'games' | 'youtube' | 'weekly-performance'>('dashboard');

  // Games Arcade unlocked when user reaches 50 points
  const gamesArcadeUnlocked = points >= 50;

  // Persist points and levels
  useEffect(() => {
    localStorage.setItem('edumate_points', points.toString());
  }, [points]);

  useEffect(() => {
    localStorage.setItem('edumate_total_stars', totalStars.toString());
  }, [totalStars]);

  useEffect(() => {
    localStorage.setItem('edumate_unlocked_levels', JSON.stringify(unlockedLevels));
  }, [unlockedLevels]);

  // Practice session live timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPracticeSessionActive && practiceSecondsLeft > 0) {
      interval = setInterval(() => {
        setPracticeSecondsLeft((prev) => {
          if (prev <= 1) {
            // 30 min finished!
            setIsPracticeSessionActive(false);
            setShowPracticeCompletionModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPracticeSessionActive, practiceSecondsLeft]);

  // Track page unload during active practice to penalize early exit (Requirement 16)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isPracticeSessionActive && practiceSecondsLeft > 60) {
        // Trigger penalty lock on reload/close
        triggerEarlyExitPenalty();
        e.preventDefault();
        e.returnValue = 'You have an active 30-min preparation session! Leaving early will lock an unlocked game level.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isPracticeSessionActive, practiceSecondsLeft]);

  // Points conversion according to Requirement 7:
  // 5 star - 10 points
  // 4 star - 8 points
  // 3 star - 6 points
  // 2 star - 4 points
  // 1 star - 2 points
  // 0 star - 0 points
  const addQuizPoints = (stars: 0 | 1 | 2 | 3 | 4 | 5) => {
    const pointsMap: Record<number, number> = {
      5: 10,
      4: 8,
      3: 6,
      2: 4,
      1: 2,
      0: 0,
    };
    const earned = pointsMap[stars] || 0;
    setPoints((p) => p + earned);
    setTotalStars((s) => s + stars);
    setStarCounts((prev) => ({
      ...prev,
      [stars]: prev[stars] + 1,
    }));

    if (stars >= 4) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
    }

    return { pointsEarned: earned };
  };

  const awardDirectPoints = (amount: number, _reason?: string) => {
    setPoints((p) => p + amount);
  };

  // Requirement 21: Unlock next level for 10 points (up to 50 levels)
  const unlockNextLevel = (gameId: GameId) => {
    const current = unlockedLevels[gameId] || 1;
    if (current >= 50) {
      return { success: false, message: 'All 50 levels already unlocked!' };
    }
    const cost = 10;
    if (points < cost) {
      return {
        success: false,
        message: `Insufficient points! You need ${cost} points to unlock Level ${current + 1}. Complete a quiz to earn points!`,
      };
    }

    setPoints((prev) => prev - cost);
    setUnlockedLevels((prev) => ({
      ...prev,
      [gameId]: current + 1,
    }));

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (e) {
      // ignore
    }

    return {
      success: true,
      message: `Unlocked Level ${current + 1} for ${cost} points!`,
    };
  };

  // Requirement 16: If user closes website within the time limit of preparation,
  // lock at least one unlocked game level as a penalty!
  const triggerEarlyExitPenalty = () => {
    // Find a game with unlocked level > 1, or re-lock
    const gameKeys: GameId[] = ['melon', 'rpg', 'crossword', 'memory'];
    let targetGame: GameId | null = null;

    for (const g of gameKeys) {
      if (unlockedLevels[g] > 1) {
        targetGame = g;
        break;
      }
    }

    if (targetGame) {
      setUnlockedLevels((prev) => ({
        ...prev,
        [targetGame!]: Math.max(1, prev[targetGame!] - 1),
      }));
      const logEntry: PenaltyLog = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        reason: 'Session Abandonment: Closed / exited preparation session before 30 minutes completed.',
        gameLocked: `${targetGame.toUpperCase()} Level locked as penalty`,
      };
      setPenaltyLogs((prev) => [logEntry, ...prev]);
    } else {
      // Deduct 5 penalty points if all levels are at 1
      setPoints((prev) => Math.max(0, prev - 5));
      const logEntry: PenaltyLog = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        reason: 'Session Abandonment: Left continuous study before 30-min completion. (5-point penalty deducted)',
        gameLocked: 'Points deducted (all games at base level 1)',
      };
      setPenaltyLogs((prev) => [logEntry, ...prev]);
    }
  };

  const toggleNotificationsMute = () => {
    setIsNotificationsMuted((prev) => !prev);
  };

  const clearDocument = () => {
    setActiveDocument(null);
    setMaterialAnalysis(null);
  };

  // Requirement 6: "after completing 30 min ask the user whether they are prepared for the quiz or not
  // if they enter yes then add only extra 30 min to it"
  const extendPracticeBy30Min = () => {
    setPracticeSecondsLeft(1800); // add 30 min (1800s)
    setIsPracticeSessionActive(true);
    setShowPracticeCompletionModal(false);
  };

  const addPracticeTime = (minutes: number) => {
    setContinuousFocusMinutes((m) => m + minutes);
  };

  const recordQuizResult = (res: QuizResult) => {
    setRecentQuizResult(res);
    setQuizHistory((prev) => [res, ...prev]);
    if (res.weakTopics.length > 0) {
      setWeakTopicsGlobal((prev) => Array.from(new Set([...res.weakTopics, ...prev])));
    }
  };

  // Requirement 18: Ask user to decide topic for quiz without any practice session
  const startQuickQuizForTopic = (customTopic?: string) => {
    if (customTopic) {
      setTopic(customTopic);
    }
    setActiveTab('quiz');
  };

  const startFlowchartRevision = (customTopic?: string) => {
    if (customTopic) {
      setTopic(customTopic);
    }
    setActiveTab('flowchart');
  };

  return (
    <AppContext.Provider
      value={{
        points,
        totalStars,
        starCounts,
        addQuizPoints,
        awardDirectPoints,
        gamesArcadeUnlocked,
        unlockedLevels,
        unlockNextLevel,
        penaltyLogs,
        triggerEarlyExitPenalty,
        isNotificationsMuted,
        toggleNotificationsMute,
        userGoal,
        setUserGoal,
        targetExam,
        setTargetExam,
        subject,
        setSubject,
        topic,
        setTopic,
        allSubjects,
        activeDocument,
        setActiveDocument,
        clearDocument,
        materialAnalysis,
        setMaterialAnalysis,
        importantTopics,
        setImportantTopics,
        isPracticeSessionActive,
        setIsPracticeSessionActive,
        practiceSecondsLeft,
        setPracticeSecondsLeft,
        continuousFocusMinutes,
        addPracticeTime,
        showPracticeCompletionModal,
        setShowPracticeCompletionModal,
        extendPracticeBy30Min,
        recentQuizResult,
        setRecentQuizResult,
        quizHistory,
        recordQuizResult,
        weakTopicsGlobal,
        setWeakTopicsGlobal,
        weeklyActivities,
        activeTab,
        setActiveTab,
        startQuickQuizForTopic,
        startFlowchartRevision,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
