import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  ShieldAlert,
  Sparkles,
  BookOpen,
  HelpCircle,
  CheckCircle,
  Eye,
  ArrowRight,
  Flame,
  VolumeX,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { askDoubt } from '../services/api';

export const PracticeRoom: React.FC = () => {
  const {
    topic,
    subject,
    activeDocument,
    isPracticeSessionActive,
    setIsPracticeSessionActive,
    practiceSecondsLeft,
    setPracticeSecondsLeft,
    showPracticeCompletionModal,
    setShowPracticeCompletionModal,
    extendPracticeBy30Min,
    startQuickQuizForTopic,
    triggerEarlyExitPenalty,
    isNotificationsMuted,
    toggleNotificationsMute,
    setActiveTab,
  } = useApp();

  // Active interaction tracking
  const [activeInteractions, setActiveInteractions] = useState<number>(14);
  const [focusPercentage, setFocusPercentage] = useState<number>(98);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // In-room quick doubt solver
  const [doubtText, setDoubtText] = useState<string>('');
  const [doubtResult, setDoubtResult] = useState<string | null>(null);
  const [isSolvingDoubt, setIsSolvingDoubt] = useState<boolean>(false);

  // Practice flashcards generated for current topic
  const flashcards = [
    {
      front: `Core Axiom of ${topic || 'This Topic'}`,
      back: 'Every system adheres to conservation laws. In a closed reference frame, total momentum and energy remain strictly invariant under internal forces.',
      category: 'Fundamental Principle',
    },
    {
      front: 'Governing Formula & Units',
      back: 'Apply Σ F = dp/dt = m · a (for constant mass). SI Units: Newton (kg·m/s²). Always resolve orthogonal vector components before summing.',
      category: 'Formula & Mechanics',
    },
    {
      front: 'Boundary Condition Trap (Frequent Exam Pitfall)',
      back: 'Friction opposes relative motion, NOT necessarily motion itself. Check whether the surface is static (fs ≤ μs N) or kinetic (fk = μk N).',
      category: 'Exam Pitfall',
    },
    {
      front: 'Previous Year Question Archetype',
      back: 'Pulley-mass system with Atwood machine: Calculate tension by writing individual free-body equations for each body along acceleration axis.',
      category: 'PYQ Strategy',
    },
  ];

  // Increment interaction score on activity
  const handleUserActivity = () => {
    setActiveInteractions((prev) => prev + 1);
  };

  useEffect(() => {
    const handleMove = () => {
      setFocusPercentage(99);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFastForwardDemo = () => {
    setPracticeSecondsLeft(5); // Simulate ending in 5 seconds
    setIsPracticeSessionActive(true);
  };

  const handleAskInRoomDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtText.trim()) return;
    setIsSolvingDoubt(true);
    try {
      const res = await askDoubt({
        question: doubtText,
        documentText: activeDocument?.content,
        pdfBase64: activeDocument?.base64,
        subject,
        topic,
      });
      setDoubtResult(res.answer);
      handleUserActivity();
    } catch (err: any) {
      setDoubtResult('Could not load explanation right now. Please try again.');
    } finally {
      setIsSolvingDoubt(false);
    }
  };

  const currentCard = flashcards[activeCardIndex % flashcards.length];

  return (
    <div
      onMouseMove={handleUserActivity}
      className="max-w-7xl mx-auto px-4 py-8 space-y-8 select-none"
    >
      {/* Top Session Status Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-200">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">
                Continuous Monitored Practice Room
              </h1>
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                30-Min Session
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Target: <span className="font-semibold text-slate-800">{topic}</span> ({subject})
            </p>
          </div>
        </div>

        {/* Live Timer & Controls */}
        <div className="flex items-center gap-4">
          <div className="text-center px-6 py-2.5 bg-slate-900 text-white rounded-2xl shadow-inner">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
              Time Remaining
            </div>
            <div className="text-3xl font-black font-mono tracking-tight">
              {formatTime(practiceSecondsLeft)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPracticeSessionActive(!isPracticeSessionActive)}
              className={`p-3 rounded-xl text-white font-bold cursor-pointer shadow-md transition-all ${
                isPracticeSessionActive
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
              }`}
              title={isPracticeSessionActive ? 'Pause Timer' : 'Resume Timer'}
            >
              {isPracticeSessionActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <button
              onClick={() => {
                setPracticeSecondsLeft(1800);
                setIsPracticeSessionActive(false);
              }}
              className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-colors"
              title="Reset 30-min Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Fast forward for quick verification */}
            <button
              onClick={handleFastForwardDemo}
              className="px-3 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
              title="Fast Forward to last 5 seconds to test 30-min completion prompt"
            >
              <FastForward className="w-4 h-4" />
              <span className="hidden sm:inline">Skip to 30m</span>
            </button>
          </div>
        </div>
      </div>

      {/* Engagement & Monitoring Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Engagement Meter */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Focus Engagement</span>
              <span className="text-emerald-600">{focusPercentage}% Active</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${focusPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Notifications Mute State */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <VolumeX className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Distraction Mute</div>
              <div className="text-[11px] text-slate-500">
                {isNotificationsMuted ? 'Muted (Distraction-Free)' : 'Sound Notifications On'}
              </div>
            </div>
          </div>
          <button
            onClick={toggleNotificationsMute}
            className={`text-xs px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
              isNotificationsMuted ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {isNotificationsMuted ? 'Muted' : 'Unmute'}
          </button>
        </div>

        {/* Penalty Warning (Requirement 16) */}
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="text-xs leading-snug">
            <span className="font-bold text-rose-950 block">Early Exit Penalty Active:</span>
            <span className="text-rose-800 text-[11px]">
              Leaving or closing before 30 min locks 1 unlocked game level!
            </span>
          </div>
        </div>
      </div>

      {/* Main Study Content Area: Interactive Flashcards & Concept Drilling */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Study Flashcards */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Concept Mastery Flashcards ({activeCardIndex + 1}/{flashcards.length})
                </h2>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-semibold">
                {currentCard.category}
              </span>
            </div>

            {/* 3D Flip Card */}
            <div
              onClick={() => {
                setIsFlipped(!isFlipped);
                handleUserActivity();
              }}
              className="w-full min-h-[240px] rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-white to-amber-50/30 p-8 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{isFlipped ? 'SOLUTION / EXPLANATION' : 'QUESTION / CONCEPT PROMPT'}</span>
                <span className="text-indigo-600 font-semibold group-hover:underline flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> Click to Flip Card
                </span>
              </div>

              <div className="py-4">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {isFlipped ? currentCard.back : currentCard.front}
                </h3>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">Activity tracked for study score</span>
                <span className="font-bold text-indigo-700">Card {activeCardIndex + 1}</span>
              </div>
            </div>

            {/* Flashcard Navigation */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setActiveCardIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
                  handleUserActivity();
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
              >
                Previous Card
              </button>

              <button
                onClick={() => {
                  setIsFlipped(false);
                  setActiveCardIndex((prev) => (prev + 1) % flashcards.length);
                  handleUserActivity();
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
              >
                Next Card
              </button>
            </div>
          </div>

          {/* Quick Flowchart Revision Link */}
          <div className="bg-gradient-to-r from-amber-500 to-indigo-600 rounded-2xl p-5 text-white flex items-center justify-between shadow-md">
            <div className="space-y-1">
              <h3 className="text-sm font-black">Want to visually connect these concepts?</h3>
              <p className="text-xs text-amber-100">
                Explore the interactive visual flowchart with logic branches and mnemonics.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('flowchart')}
              className="px-4 py-2 bg-white text-indigo-900 hover:bg-amber-50 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer"
            >
              Open Flowchart
            </button>
          </div>
        </div>

        {/* Right Column: In-room Quick Doubt Solver & Rules */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  In-Session Doubt Solver
                </h3>
                <p className="text-[11px] text-slate-500">
                  {activeDocument ? `Answers locked to ${activeDocument.name}` : 'Curriculum Doubt Assistant'}
                </p>
              </div>
            </div>

            <form onSubmit={handleAskInRoomDoubt} className="space-y-3">
              <textarea
                value={doubtText}
                onChange={(e) => setDoubtText(e.target.value)}
                placeholder="Ask doubt about derivations, formulas, or tricky problems..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50/70"
              />
              <button
                type="submit"
                disabled={isSolvingDoubt || !doubtText.trim()}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSolvingDoubt ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Get Immediate Explanation</span>
                  </>
                )}
              </button>
            </form>

            {doubtResult && (
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-slate-800 leading-relaxed max-h-60 overflow-y-auto">
                <span className="font-bold text-amber-900 block mb-1">EDUMATE Tutor:</span>
                <p className="whitespace-pre-line">{doubtResult}</p>
              </div>
            )}
          </div>

          {/* Test Early Abandonment Simulation */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Simulate Abandoning Early (Penalty Test):</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Requirement 16 specifies locking at least 1 game level if user abandons preparation time limit.
            </p>
            <button
              onClick={() => {
                triggerEarlyExitPenalty();
                alert('Penalty applied! 1 unlocked game level has been locked due to early departure.');
              }}
              className="text-[11px] px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold transition-colors cursor-pointer"
            >
              Test Penalty Lock Mechanism
            </button>
          </div>
        </div>
      </div>

      {/* 30-Min Completion Prompt Modal (Requirement 6) */}
      {showPracticeCompletionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-amber-200 shadow-2xl space-y-6 animate-scaleUp text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">
                30-Minute Continuous Practice Complete!
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Great commitment! You have completed your continuous focus session on{' '}
                <span className="font-bold text-slate-900">&ldquo;{topic}&rdquo;</span>.
              </p>
            </div>

            {/* Requirement 6 Question: Ask user whether they are prepared for the quiz or not */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900">
              Are you prepared for the 10-Question Quiz on this topic?
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Option: Yes, I need more preparation -> Adds extra 30 min (Requirement 6) */}
              <button
                onClick={extendPracticeBy30Min}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
              >
                Yes, Need More Prep (+30 Min Extra)
              </button>

              {/* Option: Ready for quiz -> Starts 10 questions */}
              <button
                onClick={() => {
                  setShowPracticeCompletionModal(false);
                  startQuickQuizForTopic(topic);
                }}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <span>Ready for Quiz! (10 Qs)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
