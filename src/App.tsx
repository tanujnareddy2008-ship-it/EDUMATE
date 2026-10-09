import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { PracticeRoom } from './components/PracticeRoom';
import { QuizView } from './components/QuizView';
import { WeeklyTestView } from './components/WeeklyTestView';
import { FlowchartRevision } from './components/FlowchartRevision';
import { GamesHub } from './components/GamesArcade/GamesHub';
import { YouTubeLecturesView } from './components/YouTubeLecturesView';
import { WeeklyPerformanceView } from './components/WeeklyPerformanceView';
import {
  GraduationCap,
  Sparkles,
  Shield,
  Heart,
  BookOpen,
  Award,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, points, totalStars } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header />

      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'practice' && <PracticeRoom />}
        {activeTab === 'quiz' && <QuizView />}
        {activeTab === 'weekly-test' && <WeeklyTestView />}
        {activeTab === 'flowchart' && <FlowchartRevision />}
        {activeTab === 'games' && <GamesHub />}
        {activeTab === 'youtube' && <YouTubeLecturesView />}
        {activeTab === 'weekly-performance' && <WeeklyPerformanceView />}
      </main>

      {/* Modern Bright Educational Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-slate-900">
              EDUMATE <span className="text-amber-500">Smart Education System</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-slate-400">
              Document Grounding • 30-Min Monitored Prep • 50-Level Educational Games
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="hover:text-indigo-600 cursor-pointer"
            >
              Study Hub
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className="hover:text-indigo-600 cursor-pointer"
            >
              Adaptive Quizzes
            </button>
            <button
              onClick={() => setActiveTab('games')}
              className="hover:text-emerald-600 cursor-pointer"
            >
              Games Arcade (50 Lvls)
            </button>
            <button
              onClick={() => setActiveTab('weekly-performance')}
              className="hover:text-violet-600 cursor-pointer"
            >
              Weekly Analytics
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
