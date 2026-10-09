import React, { useState, useEffect } from 'react';
import { RotateCcw, Award, CheckCircle2, Trophy, ArrowRight, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';

interface CardItem {
  id: number;
  pairId: number;
  text: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const CONCEPT_PAIRS = [
  { term: "Newton's 2nd Law", match: 'Σ F = m · a' },
  { term: 'Kinetic Energy', match: 'E_k = ½ m · v²' },
  { term: 'Momentum Conservation', match: 'p_initial = p_final' },
  { term: "Ohm's Law", match: 'V = I · R' },
  { term: 'Gravitational Force', match: 'F = G·(m₁m₂)/r²' },
  { term: 'Work-Energy Theorem', match: 'W_net = ΔK' },
  { term: 'Wave Velocity', match: 'v = f · λ' },
  { term: 'Electric Potential', match: 'V = W / q' },
  { term: 'Thermodynamics 1st Law', match: 'ΔU = Q - W' },
  { term: 'Power Definition', match: 'P = W / Δt = F · v' },
  { term: 'Ideal Gas Law', match: 'P·V = n·R·T' },
  { term: 'Centripetal Force', match: 'F_c = m·v² / r' },
];

export const MemoryMatchGame: React.FC<{
  level: number;
  onBack: () => void;
  onNextLevel: () => void;
}> = ({ level, onBack, onNextLevel }) => {
  const { awardDirectPoints, unlockedLevels } = useApp();

  const [cards, setCards] = useState<CardItem[]>([]);
  const [selectedCards, setSelectedCards] = useState<CardItem[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);

  // Number of pairs increases with level (Level 1: 3 pairs, Level 2: 4 pairs, Level 5+: 6 pairs)
  const numPairs = Math.min(3 + Math.floor((level - 1) / 3), 6);

  const initGame = () => {
    const selected = CONCEPT_PAIRS.slice(0, numPairs);
    const deck: CardItem[] = [];

    selected.forEach((p, idx) => {
      deck.push({
        id: idx * 2,
        pairId: idx,
        text: p.term,
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        id: idx * 2 + 1,
        pairId: idx,
        text: p.match,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle deck
    const shuffled = deck.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setSelectedCards([]);
    setMoves(0);
    setIsWon(false);
  };

  useEffect(() => {
    initGame();
  }, [level]);

  const handleCardClick = (card: CardItem) => {
    if (card.isFlipped || card.isMatched || selectedCards.length === 2) return;

    const flippedCard = { ...card, isFlipped: true };
    const updatedCards = cards.map((c) => (c.id === card.id ? flippedCard : c));
    setCards(updatedCards);

    const newSelected = [...selectedCards, flippedCard];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newSelected;

      if (first.pairId === second.pairId) {
        // Match!
        setTimeout(() => {
          setCards((prev) => {
            const matchedCards = prev.map((c) =>
              c.pairId === first.pairId ? { ...c, isMatched: true } : c
            );
            const allDone = matchedCards.every((c) => c.isMatched);
            if (allDone) {
              setIsWon(true);
              awardDirectPoints(5, 'Cleared Memory Match Level');
              try {
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
              } catch (e) {
                // ignore
              }
            }
            return matchedCards;
          });
          setSelectedCards([]);
        }, 500);
      } else {
        // No match: flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.id === first.id || c.id === second.id ? { ...c, isFlipped: false } : c))
          );
          setSelectedCards([]);
        }, 900);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      {/* Top Controls */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Games
        </button>

        <div className="flex items-center gap-4">
          <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl">
            Level {level} / 50
          </span>
          <span className="text-xs font-semibold text-slate-500">Moves: {moves}</span>
          <button
            onClick={initGame}
            className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Reset cards"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
        {cards.map((card) => {
          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`h-24 sm:h-28 rounded-2xl p-3 flex items-center justify-center text-center cursor-pointer transition-all duration-300 font-bold select-none text-xs ${
                card.isMatched
                  ? 'bg-emerald-100 border-2 border-emerald-400 text-emerald-950 scale-95 shadow-inner'
                  : card.isFlipped
                  ? 'bg-indigo-600 text-white shadow-md scale-100'
                  : 'bg-gradient-to-br from-indigo-50 to-amber-50 hover:from-indigo-100 hover:to-amber-100 border-2 border-slate-200 text-slate-400 hover:shadow-xs'
              }`}
            >
              {card.isFlipped || card.isMatched ? (
                <span className="leading-snug">{card.text}</span>
              ) : (
                <span className="text-xl">🎴</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Victory Card */}
      {isWon && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-indigo-600 text-white text-center space-y-3 animate-scaleUp">
          <Trophy className="w-10 h-10 mx-auto text-amber-300 animate-bounce" />
          <h3 className="text-lg font-black">Level {level} Completed in {moves} Moves!</h3>
          <p className="text-xs text-emerald-100">+5 Points Awarded to your balance!</p>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={initGame}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Replay Level
            </button>
            {level < 50 && (
              <button
                onClick={onNextLevel}
                className="px-5 py-2 bg-white text-indigo-900 hover:bg-emerald-50 rounded-xl text-xs font-black transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <span>Play Level {level + 1}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
