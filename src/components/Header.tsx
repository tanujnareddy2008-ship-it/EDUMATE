import React from 'react';
import {
  Sparkles,
  Award,
  Star,
  Volume2,
  VolumeX,
  Clock,
  Gamepad2,
  GraduationCap,
  BarChart3,
  Video,
  GitBranch,
  ShieldAlert,
  Flame,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    points,
    totalStars,
    isNotificationsMuted,
    toggleNotificationsMute,
    activeTab,
    setActiveTab,
    isPracticeSessionActive,
    practiceSecondsLeft,
    targetExam,
    userGoal,
    gamesArcadeUnlocked,
  } = useApp();

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-xs">
      {/* Top Banner / Status Strip */}
      <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white text-xs py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase">
              <Sparkles className="w-3 h-3 text-amber-200" /> EDUMATE Smart AI Engine
            </span>
            <span className="hidden sm:inline text-white/90">
              {userGoal === 'competitive' ? `Targeting: ${targetExam || 'Competitive Exam'}` : 'Adaptive Exam & Concept Mastery'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isPracticeSessionActive && (
              <div className="flex items-center gap-1.5 bg-rose-600/90 text-white px-2.5 py-0.5 rounded-full text-xs font-semibold animate-pulse shadow-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>30-Min Prep: {formatTimer(practiceSecondsLeft)}</span>
                <span className="hidden md:inline text-[10px] opacity-80">(Leaving locks 1 game)</span>
              </div>
            )}

            <button
              onClick={toggleNotificationsMute}
              title={isNotificationsMuted ? 'Focus Mode Active: Notifications & Sound Muted' : 'Sound & Notifications Active'}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer text-[11px]"
            >
              {isNotificationsMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-amber-200" />
                  <span className="hidden md:inline">Focus Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-200" />
                  <span className="hidden md:inline">Sound On</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                EDU<span className="text-amber-500">MATE</span>
              </span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Smart Education & Exam Mastery</p>
          </div>
        </div>

        {/* Global Gamification & Rewards Header Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Star Rating Badge */}
          <div
            title="Total Stars Earned across Quizzes"
            className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl shadow-xs"
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-xs font-bold text-amber-950">{totalStars}</span>
              <span className="text-[9px] text-amber-700 font-medium">Stars</span>
            </div>
          </div>

          {/* Points Badge */}
          <div
            title="Points system: 5★ = 10 pts, 4★ = 8 pts, 3★ = 6 pts, 2★ = 4 pts, 1★ = 2 pts"
            className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-xl shadow-xs"
          >
            <Award className="w-4 h-4 text-indigo-600" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-sm font-black text-indigo-950">{points} pts</span>
              <span className="text-[9px] text-indigo-600 font-semibold">Available</span>
            </div>
          </div>

          {/* Games Unlock Status */}
          <button
            onClick={() => setActiveTab('games')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
              gamesArcadeUnlocked
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-emerald-600" />
            <span>{gamesArcadeUnlocked ? 'Arcade (50 Lvls)' : `Unlock Games (50 pts)`}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-slate-100 py-1.5 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Dashboard & Study</span>
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'practice'
              ? 'bg-indigo-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>30-Min Practice Room</span>
          {isPracticeSessionActive && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'quiz'
              ? 'bg-indigo-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Adaptive Quiz (PYQs)</span>
        </button>

        <button
          onClick={() => setActiveTab('weekly-test')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'weekly-test'
              ? 'bg-rose-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          <span>2-Hr Weekly Mock Exam</span>
        </button>

        <button
          onClick={() => setActiveTab('flowchart')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'flowchart'
              ? 'bg-indigo-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Diagrammatic Flowcharts</span>
        </button>

        <button
          onClick={() => setActiveTab('games')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'games'
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Games Arcade (50 Lvls)</span>
        </button>

        <button
          onClick={() => setActiveTab('youtube')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'youtube'
              ? 'bg-indigo-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>YouTube Lectures</span>
        </button>

        {/* Note Requirement 14: Performance chart based on weekly performance must NOT be on dashboard! */}
        <button
          onClick={() => setActiveTab('weekly-performance')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'weekly-performance'
              ? 'bg-violet-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-violet-500" />
          <span>Weekly Performance</span>
        </button>
      </nav>
    </header>
  );
};
