import React, { useState, useEffect } from 'react';
import {
  Shield,
  Zap,
  Sword,
  Heart,
  Trophy,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';

const BOSS_NAMES = [
  'Syllabus Sprite',
  'Formula Golem',
  'Vector Chimera',
  'Derivation Drake',
  'Calculus Behemoth',
  'Thermodynamics Gargoyle',
  'PYQ Leviathan',
  'Entropy Titan',
  'Quantum Dreadnought',
  'The All-India Exam Sovereign',
];

export const BossBattleGame: React.FC<{
  level: number;
  onBack: () => void;
  onNextLevel: () => void;
}> = ({ level, onBack, onNextLevel }) => {
  const { awardDirectPoints, topic } = useApp();

  // Boss name based on level (1..50)
  const bossNameIndex = Math.min(Math.floor((level - 1) / 5), BOSS_NAMES.length - 1);
  const bossName = BOSS_NAMES[bossNameIndex];
  const maxBossHp = 80 + level * 20;

  // Player and Boss stats
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [playerMana, setPlayerMana] = useState<number>(100);
  const [bossHp, setBossHp] = useState<number>(maxBossHp);
  const [combatLog, setCombatLog] = useState<string[]>([
    `⚔️ A wild ${bossName} (Level ${level}) emerges! Use your knowledge to strike!`,
  ]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);

  // Active question challenge when player attacks
  const [currentQuizChallenge, setCurrentQuizChallenge] = useState<{
    question: string;
    options: string[];
    correct: number;
  } | null>(null);

  const initBattle = () => {
    setPlayerHp(100);
    setPlayerMana(100);
    setBossHp(maxBossHp);
    setIsGameOver(false);
    setIsVictory(false);
    setCurrentQuizChallenge(null);
    setCombatLog([`⚔️ A wild ${bossName} (Level ${level}) emerges! Answer questions to deal critical hits.`]);
  };

  useEffect(() => {
    initBattle();
  }, [level]);

  // Boss retaliates
  const triggerBossTurn = (currentBossHp: number) => {
    if (currentBossHp <= 0) {
      setIsVictory(true);
      setIsGameOver(true);
      setCombatLog((prev) => [`🏆 VICTORY! You defeated ${bossName}!`, ...prev]);
      awardDirectPoints(8, 'Defeated RPG Boss');
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } catch (e) {
        // ignore
      }
      return;
    }

    const bossDmg = Math.floor(10 + Math.random() * 12 + level * 0.5);
    setPlayerHp((prev) => {
      const nextHp = Math.max(0, prev - bossDmg);
      if (nextHp <= 0) {
        setIsGameOver(true);
        setIsVictory(false);
        setCombatLog((log) => [`💥 ${bossName} struck with "Negative Marking Trap" for ${bossDmg} DMG! You were defeated!`, ...log]);
      } else {
        setCombatLog((log) => [`⚡ ${bossName} used "Syllabus Overload" for ${bossDmg} DMG!`, ...log]);
      }
      return nextHp;
    });

    // Mana recharge
    setPlayerMana((m) => Math.min(100, m + 15));
  };

  // Player Action 1: Strike with quiz challenge
  const handleDirectStrike = () => {
    if (isGameOver) return;
    setCurrentQuizChallenge({
      question: `Regarding ${topic || 'physics & math'}, what is the primary consequence of conservation laws in closed systems?`,
      options: [
        'Total sum of conserved quantities remains constant',
        'Continuous exponential divergence over time',
        'Complete vanishing of all kinetic energy',
        'Spontaneous arbitrary mass generation',
      ],
      correct: 0,
    });
  };

  const handleAnswerChallenge = (optIdx: number) => {
    if (!currentQuizChallenge) return;

    if (optIdx === currentQuizChallenge.correct) {
      const dmg = 35 + Math.floor(Math.random() * 15);
      const newBossHp = Math.max(0, bossHp - dmg);
      setBossHp(newBossHp);
      setCombatLog((log) => [`🎯 Direct Critical Hit! You dealt ${dmg} DMG to ${bossName}!`, ...log]);
      setCurrentQuizChallenge(null);
      setTimeout(() => triggerBossTurn(newBossHp), 500);
    } else {
      setCombatLog((log) => [`❌ Concept Missed! The attack glanced off ${bossName}.`, ...log]);
      setCurrentQuizChallenge(null);
      setTimeout(() => triggerBossTurn(bossHp), 500);
    }
  };

  // Player Action 2: Formula Blitz
  const handleFormulaBlitz = () => {
    if (isGameOver || playerMana < 30) return;
    setPlayerMana((m) => m - 30);
    const dmg = 65 + Math.floor(Math.random() * 20);
    const newBossHp = Math.max(0, bossHp - dmg);
    setBossHp(newBossHp);
    setCombatLog((log) => [`⚡ FORMULA BLITZ! You unleashed theoretical fury for ${dmg} DMG!`, ...log]);
    setTimeout(() => triggerBossTurn(newBossHp), 500);
  };

  // Player Action 3: Shield of Revision
  const handleShieldOfRevision = () => {
    if (isGameOver) return;
    setPlayerHp((h) => Math.min(100, h + 35));
    setPlayerMana((m) => Math.min(100, m + 20));
    setCombatLog((log) => [`🛡️ SHIELD OF REVISION activated! Restored +35 HP and +20 Mana.`, ...log]);
    setTimeout(() => triggerBossTurn(bossHp), 500);
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
          <span className="text-xs font-bold bg-rose-50 text-rose-700 px-3 py-1 rounded-xl">
            Boss Battle Level {level} / 50
          </span>
          <button
            onClick={initBattle}
            className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Reset Battle"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Battle Arena Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-b from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        {/* Boss Profile */}
        <div className="space-y-3 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/30 border border-rose-400 flex items-center justify-center text-3xl mx-auto shadow-md">
            👹
          </div>
          <div>
            <h3 className="text-lg font-black text-rose-300">{bossName}</h3>
            <span className="text-xs text-slate-300">Level {level} Raid Boss</span>
          </div>

          {/* Boss HP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-rose-200">
              <span>HP</span>
              <span>{bossHp} / {maxBossHp}</span>
            </div>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-rose-500/30">
              <div
                className="bg-gradient-to-r from-rose-600 to-red-400 h-full transition-all duration-300"
                style={{ width: `${Math.round((bossHp / maxBossHp) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Player Profile */}
        <div className="space-y-3 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/30 border border-indigo-400 flex items-center justify-center text-3xl mx-auto shadow-md">
            🧙‍♂️
          </div>
          <div>
            <h3 className="text-lg font-black text-indigo-300">Knowledge Scholar</h3>
            <span className="text-xs text-slate-300">Level {level} Hero</span>
          </div>

          {/* Player HP & Mana Bar */}
          <div className="space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-emerald-300">
                <span>HP</span>
                <span>{playerHp} / 100</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-emerald-500/30">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${playerHp}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-blue-300">
                <span>Mana</span>
                <span>{playerMana} / 100</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-blue-500/30">
                <div
                  className="bg-blue-400 h-full transition-all duration-300"
                  style={{ width: `${playerMana}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Combat Challenge Popover */}
      {currentQuizChallenge && (
        <div className="p-6 rounded-2xl bg-indigo-50 border-2 border-indigo-300 space-y-4 animate-scaleUp">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Answer Correctly to Strike the Boss!</span>
          </div>
          <p className="text-sm font-bold text-slate-900">{currentQuizChallenge.question}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentQuizChallenge.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswerChallenge(i)}
                className="p-3 text-xs font-semibold rounded-xl bg-white border border-indigo-200 hover:border-indigo-500 hover:bg-indigo-100/50 text-left cursor-pointer transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Player Action Buttons */}
      {!isGameOver && !currentQuizChallenge && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleDirectStrike}
            className="p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer flex flex-col items-center justify-center gap-1 group"
          >
            <Sword className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
            <span>Direct Strike (35 DMG)</span>
            <span className="text-[10px] text-indigo-200">Answer Concept Question</span>
          </button>

          <button
            onClick={handleFormulaBlitz}
            disabled={playerMana < 30}
            className="p-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all shadow-md cursor-pointer flex flex-col items-center justify-center gap-1 group disabled:opacity-50"
          >
            <Zap className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            <span>Formula Blitz (65 DMG)</span>
            <span className="text-[10px] text-amber-100">Costs 30 Mana</span>
          </button>

          <button
            onClick={handleShieldOfRevision}
            className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer flex flex-col items-center justify-center gap-1 group"
          >
            <Shield className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            <span>Shield of Revision (+35 HP)</span>
            <span className="text-[10px] text-emerald-100">Restores Health & Mana</span>
          </button>
        </div>
      )}

      {/* Victory / Defeat Overlay */}
      {isGameOver && (
        <div
          className={`p-6 rounded-2xl text-center space-y-3 animate-scaleUp text-white ${
            isVictory
              ? 'bg-gradient-to-r from-emerald-600 to-indigo-600'
              : 'bg-gradient-to-r from-rose-600 to-red-800'
          }`}
        >
          <Trophy className="w-10 h-10 mx-auto text-amber-300 animate-bounce" />
          <h3 className="text-xl font-black">
            {isVictory ? `Boss Cleared! Level ${level} Mastered!` : 'Defeated by the Boss!'}
          </h3>
          <p className="text-xs text-white/90">
            {isVictory ? '+8 Points added to your balance!' : 'Review your concepts and retry the battle!'}
          </p>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={initBattle}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Retry Level
            </button>
            {isVictory && level < 50 && (
              <button
                onClick={onNextLevel}
                className="px-5 py-2 bg-white text-indigo-900 hover:bg-emerald-50 rounded-xl text-xs font-black transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <span>Fight Level {level + 1} Boss</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Battle Log */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 max-h-36 overflow-y-auto font-mono">
        <span className="font-bold text-slate-800 block text-[11px] font-sans">Battle Log:</span>
        {combatLog.map((log, i) => (
          <p key={i} className="text-slate-600">
            {log}
          </p>
        ))}
      </div>
    </div>
  );
};
