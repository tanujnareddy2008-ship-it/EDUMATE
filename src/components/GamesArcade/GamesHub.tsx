import React, { useState } from 'react';
import {
  Gamepad2,
  Lock,
  Unlock,
  Award,
  Sparkles,
  Trophy,
  ArrowRight,
  ShieldAlert,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GameId } from '../../types';
import { MemoryMatchGame } from './MemoryMatchGame';
import { CrosswordGame } from './CrosswordGame';
import { BossBattleGame } from './BossBattleGame';
import { MelonMergeGame } from './MelonMergeGame';

export const GamesHub: React.FC = () => {
  const {
    points,
    gamesArcadeUnlocked,
    unlockedLevels,
    unlockNextLevel,
    awardDirectPoints,
    setActiveTab,
  } = useApp();

  // Active game view state
  const [activeGameId, setActiveGameId] = useState<GameId | null>(null);
  const [selectedPlayLevel, setSelectedPlayLevel] = useState<number>(1);
  const [unlockFeedback, setUnlockFeedback] = useState<string | null>(null);

  const gamesConfig: {
    id: GameId;
    name: string;
    description: string;
    icon: string;
    theme: string;
    accent: string;
  }[] = [
    {
      id: 'memory',
      name: 'Memory Match Cards',
      description: 'Pair formulas and principles with their definitions across 50 progressive difficulty levels.',
      icon: '🎴',
      theme: 'from-indigo-600 to-blue-700',
      accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      id: 'crossword',
      name: 'Auto-Generated Crossword',
      description: 'Interactive concept crossword with Across & Down clues dynamically themed to the curriculum.',
      icon: '📝',
      theme: 'from-amber-500 to-orange-600',
      accent: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      id: 'rpg',
      name: 'Boss Battle RPG',
      description: 'Turn-based academic RPG: answer syllabus questions to unleash critical attacks on Exam Titans.',
      icon: '⚔️',
      theme: 'from-rose-600 to-red-700',
      accent: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    {
      id: 'melon',
      name: 'Melon Merge / Drop Puzzle',
      description: 'Educational drop & merge physics puzzle: merge Quarks into Atoms, Molecules, Stars, and Singularity!',
      icon: '🍉',
      theme: 'from-emerald-600 to-teal-700',
      accent: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
  ];

  const handleUnlockLevel = (gameId: GameId) => {
    const res = unlockNextLevel(gameId);
    setUnlockFeedback(res.message);
    setTimeout(() => setUnlockFeedback(null), 3500);
  };

  const handlePlayLevel = (gameId: GameId, lvl: number) => {
    setActiveGameId(gameId);
    setSelectedPlayLevel(lvl);
  };

  // If a game is actively running, render its component
  if (activeGameId === 'memory') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <MemoryMatchGame
          level={selectedPlayLevel}
          onBack={() => setActiveGameId(null)}
          onNextLevel={() => {
            const nextLvl = selectedPlayLevel + 1;
            if (nextLvl <= (unlockedLevels.memory || 1)) {
              setSelectedPlayLevel(nextLvl);
            } else {
              handleUnlockLevel('memory');
              setSelectedPlayLevel(nextLvl);
            }
          }}
        />
      </div>
    );
  }

  if (activeGameId === 'crossword') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <CrosswordGame
          level={selectedPlayLevel}
          onBack={() => setActiveGameId(null)}
          onNextLevel={() => {
            const nextLvl = selectedPlayLevel + 1;
            if (nextLvl <= (unlockedLevels.crossword || 1)) {
              setSelectedPlayLevel(nextLvl);
            } else {
              handleUnlockLevel('crossword');
              setSelectedPlayLevel(nextLvl);
            }
          }}
        />
      </div>
    );
  }

  if (activeGameId === 'rpg') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <BossBattleGame
          level={selectedPlayLevel}
          onBack={() => setActiveGameId(null)}
          onNextLevel={() => {
            const nextLvl = selectedPlayLevel + 1;
            if (nextLvl <= (unlockedLevels.rpg || 1)) {
              setSelectedPlayLevel(nextLvl);
            } else {
              handleUnlockLevel('rpg');
              setSelectedPlayLevel(nextLvl);
            }
          }}
        />
      </div>
    );
  }

  if (activeGameId === 'melon') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <MelonMergeGame
          level={selectedPlayLevel}
          onBack={() => setActiveGameId(null)}
          onNextLevel={() => {
            const nextLvl = selectedPlayLevel + 1;
            if (nextLvl <= (unlockedLevels.melon || 1)) {
              setSelectedPlayLevel(nextLvl);
            } else {
              handleUnlockLevel('melon');
              setSelectedPlayLevel(nextLvl);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-800/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-300">
            <Gamepad2 className="w-3.5 h-3.5" /> Educational Games Arcade (50 Levels Each)
          </div>

          <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-2xl backdrop-blur-md border border-white/10 text-xs font-bold text-amber-300">
            <Award className="w-4 h-4" />
            <span>Balance: {points} Points</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Unlock Games & Master 50 Levels
        </h1>

        <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Requirement rules: Arcade unlocks at <strong>50 points</strong>. Level 1 of each game is unlocked by default. Each subsequent level requires <strong>10 points</strong> to unlock!
        </p>

        {/* Feedback Alert Pill */}
        {unlockFeedback && (
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold animate-fadeIn">
            ✨ {unlockFeedback}
          </div>
        )}
      </div>

      {/* Arcade Unlock Gating Card (Requirement 21) */}
      {!gamesArcadeUnlocked ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 text-center space-y-5 shadow-sm max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">
              Games Arcade Locked ({points} / 50 Points)
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              According to the system rules, the user unlocks the games through gaining <strong>50 points</strong>. You currently have {points} points. Complete quizzes to earn stars and convert them to points!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('quiz')}
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Take Quiz to Earn Points</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Helper to grant points for testing */}
            <button
              onClick={() => awardDirectPoints(50, 'Admin Test Grant')}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Instant Test Unlock (+50 pts)
            </button>
          </div>
        </div>
      ) : (
        /* Arcade Games Browser: All 4 Games with 50 Levels Selector */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {gamesConfig.map((game) => {
            const unlockedUpTo = unlockedLevels[game.id] || 1;
            const nextLevel = unlockedUpTo + 1;
            const canUnlockNext = points >= 10 && unlockedUpTo < 50;

            return (
              <div
                key={game.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shadow-xs">
                        {game.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900">{game.name}</h3>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${game.accent}`}>
                          Level 1 to {unlockedUpTo} Unlocked
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePlayLevel(game.id, unlockedUpTo)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Play (Lvl {unlockedUpTo})</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {game.description}
                  </p>

                  {/* 50 Levels Grid (Requirement 21: At least 50 levels, Level 1 unlocked by default, 10 points for next level) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">
                        Select from 50 Levels:
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {unlockedUpTo}/50 unlocked
                      </span>
                    </div>

                    {/* Level Numbers (Display first 15 visibly + scroll/expand) */}
                    <div className="grid grid-cols-10 gap-1.5 max-h-40 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-100">
                      {Array.from({ length: 50 }).map((_, idx) => {
                        const lvlNum = idx + 1;
                        const isUnlocked = lvlNum <= unlockedUpTo;

                        return (
                          <button
                            key={lvlNum}
                            disabled={!isUnlocked}
                            onClick={() => handlePlayLevel(game.id, lvlNum)}
                            className={`h-8 rounded-lg font-bold text-xs transition-all flex items-center justify-center ${
                              isUnlocked
                                ? 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-2xs cursor-pointer'
                                : 'bg-slate-200/60 text-slate-400 border border-transparent cursor-not-allowed'
                            }`}
                            title={
                              isUnlocked
                                ? `Play Level ${lvlNum}`
                                : `Level ${lvlNum} locked. Unlock for 10 points.`
                            }
                          >
                            {isUnlocked ? lvlNum : <Lock className="w-2.5 h-2.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Unlock Next Level Button (Requirement 21: 10 points to unlock next level) */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    Next: <strong className="text-slate-800">Level {nextLevel}</strong> (Costs 10 pts)
                  </div>

                  {unlockedUpTo < 50 ? (
                    <button
                      onClick={() => handleUnlockLevel(game.id)}
                      disabled={!canUnlockNext}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        canUnlockNext
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs cursor-pointer'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Unlock Level {nextLevel} (10 pts)</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                      All 50 Levels Unlocked! 🎉
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
