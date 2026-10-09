import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';

interface ConceptTier {
  tier: number;
  name: string;
  emoji: string;
  bg: string;
  points: number;
}

const TIERS: ConceptTier[] = [
  { tier: 1, name: 'Quark', emoji: '⚛️', bg: 'bg-indigo-100 text-indigo-800 border-indigo-300', points: 4 },
  { tier: 2, name: 'Atom', emoji: '🔬', bg: 'bg-cyan-100 text-cyan-800 border-cyan-300', points: 8 },
  { tier: 3, name: 'Molecule', emoji: '🧪', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', points: 16 },
  { tier: 4, name: 'Cell', emoji: '🦠', bg: 'bg-lime-100 text-lime-800 border-lime-300', points: 32 },
  { tier: 5, name: 'Organ', emoji: '🫀', bg: 'bg-rose-100 text-rose-800 border-rose-300', points: 64 },
  { tier: 6, name: 'Organism', emoji: '🐾', bg: 'bg-amber-100 text-amber-800 border-amber-300', points: 128 },
  { tier: 7, name: 'Planet', emoji: '🌍', bg: 'bg-blue-100 text-blue-800 border-blue-300', points: 256 },
  { tier: 8, name: 'Star', emoji: '☀️', bg: 'bg-yellow-100 text-yellow-900 border-yellow-400', points: 512 },
  { tier: 9, name: 'Galaxy', emoji: '🌌', bg: 'bg-purple-100 text-purple-900 border-purple-400', points: 1024 },
  { tier: 10, name: 'Cosmos', emoji: '🪐', bg: 'bg-pink-100 text-pink-900 border-pink-400', points: 2048 },
  { tier: 11, name: 'Singularity', emoji: '💥', bg: 'bg-slate-900 text-amber-300 border-amber-400', points: 4096 },
];

export const MelonMergeGame: React.FC<{
  level: number;
  onBack: () => void;
  onNextLevel: () => void;
}> = ({ level, onBack, onNextLevel }) => {
  const { awardDirectPoints } = useApp();

  const numCols = 5;
  const maxRows = 6;

  // Level target tier (Level 1: tier 3 Molecule, Level 5: tier 5 Organ, Level 50: tier 11)
  const targetTier = Math.min(3 + Math.floor((level - 1) / 5), 11);
  const targetConcept = TIERS[targetTier - 1];

  // Grid state: columns of tiers (bottom-to-top)
  const [columns, setColumns] = useState<number[][]>(() => Array.from({ length: numCols }, () => []));
  const [nextTier, setNextTier] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const initGame = () => {
    setColumns(Array.from({ length: numCols }, () => []));
    setScore(0);
    setIsWon(false);
    setIsGameOver(false);
    setNextTier(Math.floor(Math.random() * 2) + 1);
  };

  useEffect(() => {
    initGame();
  }, [level]);

  // Handle drop into column
  const handleDrop = (colIndex: number) => {
    if (isGameOver || isWon) return;

    const col = columns[colIndex];
    if (col.length >= maxRows) {
      // Column full
      return;
    }

    let updatedCol = [...col, nextTier];
    let pointsGained = 0;
    let didReachTarget = false;

    // Check merge chain: if last two elements are identical, merge!
    let merged = true;
    while (merged) {
      merged = false;
      if (updatedCol.length >= 2) {
        const top = updatedCol[updatedCol.length - 1];
        const secondTop = updatedCol[updatedCol.length - 2];
        if (top === secondTop) {
          const newTier = top + 1;
          updatedCol.splice(updatedCol.length - 2, 2, newTier);
          pointsGained += (TIERS[newTier - 1]?.points || 10);
          merged = true;

          if (newTier >= targetTier) {
            didReachTarget = true;
          }
        }
      }
    }

    const newColumns = columns.map((c, i) => (i === colIndex ? updatedCol : c));
    setColumns(newColumns);
    setScore((s) => s + pointsGained);

    // Pick next item (tier 1..3)
    const nextRandom = Math.floor(Math.random() * Math.min(3, targetTier)) + 1;
    setNextTier(nextRandom);

    if (didReachTarget && !isWon) {
      setIsWon(true);
      awardDirectPoints(10, 'Cleared Melon Merge Level');
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } catch (e) {
        // ignore
      }
    } else {
      // Check if all columns full
      const allFull = newColumns.every((c) => c.length >= maxRows);
      if (allFull) {
        setIsGameOver(true);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Games
        </button>

        <div className="flex items-center gap-4">
          <span className="text-xs font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl">
            Melon Merge Level {level} / 50
          </span>
          <span className="text-xs font-black text-slate-900">Score: {score}</span>
          <button
            onClick={initGame}
            className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Reset Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Goal Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-indigo-50 border border-amber-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-slate-800">
            Level {level} Objective: Merge & Reach{' '}
            <span className="text-indigo-700 font-extrabold">
              {targetConcept.emoji} {targetConcept.name} (Tier {targetTier})
            </span>
          </span>
        </div>

        {/* Next Drop Item Preview */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 font-medium">Next Drop:</span>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-lg">{TIERS[nextTier - 1]?.emoji}</span>
            <span className="font-bold text-slate-800">{TIERS[nextTier - 1]?.name}</span>
          </div>
        </div>
      </div>

      {/* Drop Container Board */}
      <div className="max-w-md mx-auto bg-slate-900 p-4 rounded-3xl border-4 border-slate-800 shadow-2xl relative">
        {/* Drop Column Buttons */}
        <div className="grid grid-cols-5 gap-2 mb-2">
          {Array.from({ length: numCols }).map((_, colIdx) => (
            <button
              key={colIdx}
              onClick={() => handleDrop(colIdx)}
              className="py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white transition-colors cursor-pointer flex justify-center items-center group shadow-xs"
              title={`Drop in column ${colIdx + 1}`}
            >
              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </button>
          ))}
        </div>

        {/* 5 Column Pit */}
        <div className="grid grid-cols-5 gap-2 h-80 bg-slate-950 rounded-2xl p-2 border border-slate-800 flex items-end">
          {columns.map((col, cIdx) => (
            <div
              key={cIdx}
              onClick={() => handleDrop(cIdx)}
              className="h-full flex flex-col-reverse gap-1.5 cursor-pointer rounded-xl hover:bg-slate-900/60 transition-colors p-1"
            >
              {col.map((tNumber, rIdx) => {
                const info = TIERS[tNumber - 1];
                return (
                  <div
                    key={rIdx}
                    className={`h-11 rounded-xl border flex items-center justify-center font-bold text-base shadow-sm animate-scaleUp select-none ${info.bg}`}
                    title={`${info.name} (Tier ${info.tier})`}
                  >
                    <span>{info.emoji}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tier Evolution Guide */}
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Concept Evolution Hierarchy:
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          {TIERS.slice(0, targetTier).map((t, idx) => (
            <span key={t.tier} className="flex items-center gap-1">
              <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 font-medium">
                {t.emoji} {t.name}
              </span>
              {idx < targetTier - 1 && <span className="text-slate-400">→</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Victory Notification */}
      {isWon && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-indigo-600 text-white text-center space-y-3 animate-scaleUp">
          <Trophy className="w-10 h-10 mx-auto text-amber-300 animate-bounce" />
          <h3 className="text-lg font-black">
            Objective Reached! Created {targetConcept.emoji} {targetConcept.name}!
          </h3>
          <p className="text-xs text-emerald-100">+10 Points Awarded to your balance!</p>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={initGame}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Play Again
            </button>
            {level < 50 && (
              <button
                onClick={onNextLevel}
                className="px-5 py-2 bg-white text-indigo-900 hover:bg-emerald-50 rounded-xl text-xs font-black transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <span>Level {level + 1}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Game Over Container Full */}
      {isGameOver && !isWon && (
        <div className="p-6 rounded-2xl bg-rose-600 text-white text-center space-y-3 animate-scaleUp">
          <h3 className="text-lg font-black">Columns Full!</h3>
          <p className="text-xs text-rose-100">Plan merges carefully so the container doesn&apos;t overflow.</p>
          <button
            onClick={initGame}
            className="px-5 py-2 bg-white text-rose-900 rounded-xl text-xs font-bold cursor-pointer"
          >
            Try Level Again
          </button>
        </div>
      )}
    </div>
  );
};
