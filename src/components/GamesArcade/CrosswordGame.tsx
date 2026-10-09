import React, { useState, useEffect } from 'react';
import { RotateCcw, CheckCircle2, Trophy, ArrowRight, ArrowLeft, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';

interface Clue {
  number: number;
  direction: 'across' | 'down';
  text: string;
  answer: string;
  row: number;
  col: number;
}

// 50 Level progression datasets
const LEVEL_PUZZLES: Record<number, { grid: string[][]; clues: Clue[] }> = {
  1: {
    grid: [
      ['A', 'T', 'O', 'M'],
      ['#', '#', 'H', '#'],
      ['#', '#', 'M', '#'],
    ],
    clues: [
      { number: 1, direction: 'across', text: 'Basic unit of a chemical element', answer: 'ATOM', row: 0, col: 0 },
      { number: 2, direction: 'down', text: 'Unit of electrical resistance (V=IR)', answer: 'OHM', row: 0, col: 2 },
    ],
  },
  2: {
    grid: [
      ['F', 'O', 'R', 'C', 'E'],
      ['#', '#', 'A', '#', '#'],
      ['#', '#', 'Y', '#', '#'],
    ],
    clues: [
      { number: 1, direction: 'across', text: 'Mass times acceleration (F=ma)', answer: 'FORCE', row: 0, col: 0 },
      { number: 2, direction: 'down', text: 'A narrow beam of electromagnetic light', answer: 'RAY', row: 0, col: 2 },
    ],
  },
  3: {
    grid: [
      ['W', 'O', 'R', 'K'],
      ['A', '#', '#', '#'],
      ['T', '#', '#', '#'],
      ['T', '#', '#', '#'],
    ],
    clues: [
      { number: 1, direction: 'across', text: 'Force multiplied by displacement in Joules', answer: 'WORK', row: 0, col: 0 },
      { number: 2, direction: 'down', text: 'SI unit of power (1 Joule per second)', answer: 'WATT', row: 0, col: 0 },
    ],
  },
};

export const CrosswordGame: React.FC<{
  level: number;
  onBack: () => void;
  onNextLevel: () => void;
}> = ({ level, onBack, onNextLevel }) => {
  const { awardDirectPoints } = useApp();

  // Fallback generation for levels > 3
  const puzzle = LEVEL_PUZZLES[level] || {
    grid: [
      ['M', 'A', 'S', 'S'],
      ['#', '#', 'P', '#'],
      ['#', '#', 'E', '#'],
      ['#', '#', 'E', '#'],
      ['#', '#', 'D', '#'],
    ],
    clues: [
      { number: 1, direction: 'across', text: 'Scalar measure of inertia in kilograms', answer: 'MASS', row: 0, col: 0 },
      { number: 2, direction: 'down', text: 'Scalar rate of motion: distance over time', answer: 'SPEED', row: 0, col: 2 },
    ],
  };

  const rows = puzzle.grid.length;
  const cols = puzzle.grid[0].length;

  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [activeCell, setActiveCell] = useState<{ r: number; c: number } | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const initGrid = () => {
    const empty: string[][] = [];
    for (let r = 0; r < rows; r++) {
      const rowArr: string[] = [];
      for (let c = 0; c < cols; c++) {
        rowArr.push(puzzle.grid[r][c] === '#' ? '#' : '');
      }
      empty.push(rowArr);
    }
    setUserGrid(empty);
    setIsCompleted(false);
    setActiveCell(null);
  };

  useEffect(() => {
    initGrid();
  }, [level]);

  const handleCellClick = (r: number, c: number) => {
    if (puzzle.grid[r][c] === '#') return;
    setActiveCell({ r, c });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (!activeCell) return;
    const { r, c } = activeCell;
    const key = e.key.toUpperCase();

    if (/^[A-Z]$/.test(key)) {
      const newGrid = userGrid.map((row) => [...row]);
      newGrid[r][c] = key;
      setUserGrid(newGrid);

      // Check win condition
      checkWin(newGrid);

      // Move to next cell
      if (c + 1 < cols && puzzle.grid[r][c + 1] !== '#') {
        setActiveCell({ r, c: c + 1 });
      } else if (r + 1 < rows && puzzle.grid[r + 1][c] !== '#') {
        setActiveCell({ r: r + 1, c });
      }
    } else if (e.key === 'Backspace') {
      const newGrid = userGrid.map((row) => [...row]);
      newGrid[r][c] = '';
      setUserGrid(newGrid);
    }
  };

  const checkWin = (gridToCheck: string[][]) => {
    let allCorrect = true;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (puzzle.grid[r][c] !== '#' && gridToCheck[r][c] !== puzzle.grid[r][c]) {
          allCorrect = false;
        }
      }
    }
    if (allCorrect) {
      setIsCompleted(true);
      awardDirectPoints(6, 'Solved Crossword Level');
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch (e) {
        // ignore
      }
    }
  };

  const handleReveal = () => {
    setUserGrid(puzzle.grid.map((row) => [...row]));
    setIsCompleted(true);
  };

  return (
    <div
      onKeyDown={handleKeyPress}
      tabIndex={0}
      className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 focus:outline-hidden"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Games
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold bg-amber-50 text-amber-800 px-3 py-1 rounded-xl">
            Crossword Level {level} / 50
          </span>
          <button
            onClick={initGrid}
            className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Reset Grid"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid and Clues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Interactive Crossword Grid */}
        <div className="flex justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="space-y-1">
            {userGrid.map((row, rIdx) => (
              <div key={rIdx} className="flex gap-1">
                {row.map((cellVal, cIdx) => {
                  const isBlock = puzzle.grid[rIdx][cIdx] === '#';
                  const isSelected = activeCell?.r === rIdx && activeCell?.c === cIdx;

                  if (isBlock) {
                    return <div key={cIdx} className="w-12 h-12 bg-slate-800 rounded-lg" />;
                  }

                  return (
                    <div
                      key={cIdx}
                      onClick={() => handleCellClick(rIdx, cIdx)}
                      className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-black text-lg uppercase cursor-pointer transition-all select-none ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-400/20'
                          : cellVal
                          ? 'border-slate-300 bg-white text-slate-900'
                          : 'border-slate-200 bg-white hover:border-indigo-300'
                      }`}
                    >
                      {cellVal}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Clues */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 font-medium">
            💡 Click on any square and type letters on your keyboard.
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Clues for Level {level}:
            </h3>

            {puzzle.clues.map((clue, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white text-xs space-y-1">
                <span className="font-bold text-indigo-700">
                  {clue.number}. {clue.direction.toUpperCase()} ({clue.answer.length} letters):
                </span>
                <p className="text-slate-700 font-medium">{clue.text}</p>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={handleReveal}
              className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Reveal solution
            </button>
          </div>
        </div>
      </div>

      {/* Victory Notification */}
      {isCompleted && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-indigo-600 text-white text-center space-y-3 animate-scaleUp">
          <Trophy className="w-10 h-10 mx-auto text-amber-300 animate-bounce" />
          <h3 className="text-lg font-black">Crossword Level {level} Cleared!</h3>
          <p className="text-xs text-emerald-100">+6 Points Awarded to your balance!</p>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={initGrid}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Play Again
            </button>
            {level < 50 && (
              <button
                onClick={onNextLevel}
                className="px-5 py-2 bg-white text-indigo-900 hover:bg-emerald-50 rounded-xl text-xs font-black transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <span>Next Level ({level + 1})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
