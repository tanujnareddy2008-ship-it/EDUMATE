import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldAlert,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { generateWeeklyTest } from '../services/api';
import { QuizQuestion, WeeklyTest, TestSubmissionResult } from '../types';

export const WeeklyTestView: React.FC = () => {
  const {
    targetExam,
    subject,
    topic,
    addQuizPoints,
    startFlowchartRevision,
    setActiveTab,
  } = useApp();

  const [testData, setTestData] = useState<WeeklyTest | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testError, setTestError] = useState<string | null>(null);

  // 2-hour timer (120 minutes = 7200 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(7200);
  const [isTestActive, setIsTestActive] = useState<boolean>(false);

  // Question navigation
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});

  // Submission result
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<TestSubmissionResult | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'mistakes'>('all');

  // Load test
  const loadTest = async () => {
    setIsLoading(true);
    setTestError(null);
    setIsSubmitted(false);
    setUserAnswers({});
    setMarkedForReview({});
    setCurrentQuestionIndex(0);
    setSecondsRemaining(7200); // 2 hours

    try {
      const data = await generateWeeklyTest({
        targetExam: targetExam || 'Competitive Examination',
        subject: subject || 'Science & Engineering',
        topics: [topic, 'Core Mechanics', 'Thermodynamics', 'Analytical Reasoning'],
      });
      setTestData(data);
      setIsTestActive(true);
    } catch (err: any) {
      console.error(err);
      setTestError(err.message || 'Failed to generate weekly competitive test.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTest();
  }, [targetExam, subject]);

  // 2-hour timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTestActive && !isSubmitted && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((s) => {
          if (s <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTestActive, isSubmitted, secondsRemaining]);

  const formatTimer = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const allQuestions: QuizQuestion[] = testData?.sections.flatMap((s) => s.questions) || [];

  const handleSelectOption = (qId: number, optIdx: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: optIdx,
    }));
  };

  const handleToggleReview = (qId: number) => {
    setMarkedForReview((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const handleSubmitTest = () => {
    if (!testData) return;
    setIsTestActive(false);

    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;
    const weakTopics: string[] = [];

    const solutions = allQuestions.map((q) => {
      const ans = userAnswers[q.id];
      if (ans === undefined || ans === null) {
        unattemptedCount++;
        return { question: q, userAnswer: null, isCorrect: false };
      } else if (ans === q.correctIndex) {
        correctCount++;
        return { question: q, userAnswer: ans, isCorrect: true };
      } else {
        wrongCount++;
        weakTopics.push(q.topic);
        return { question: q, userAnswer: ans, isCorrect: false };
      }
    });

    // Marking scheme: +4 for correct, -1 for wrong, 0 for unattempted
    const rawScore = correctCount * 4 - wrongCount * 1;
    const maxScore = allQuestions.length * 4;
    const percentage = Math.max(0, Math.round((rawScore / maxScore) * 100));

    // Convert to stars and points
    let stars: 0 | 1 | 2 | 3 | 4 | 5 = 0;
    if (percentage >= 85) stars = 5;
    else if (percentage >= 70) stars = 4;
    else if (percentage >= 55) stars = 3;
    else if (percentage >= 40) stars = 2;
    else if (percentage > 0) stars = 1;
    else stars = 0;

    const { pointsEarned } = addQuizPoints(stars);

    setSubmissionResult({
      score: rawScore,
      totalMarks: maxScore,
      correctCount,
      wrongCount,
      unattemptedCount,
      percentage,
      stars,
      pointsEarned,
      weakTopics: Array.from(new Set(weakTopics)),
      solutions,
    });

    setIsSubmitted(true);

    if (stars >= 4) {
      try {
        confetti({
          particleCount: 80,
          spread: 90,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const handleAutoSubmit = () => {
    handleSubmitTest();
  };

  const currentQ = allQuestions[currentQuestionIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Test Title & Instructions Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              2-Hour Competitive Exam Simulator
            </span>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
              Target: {targetExam || 'National Competitive Exam'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">
            {testData?.testTitle || 'Weekly National Mock Test'}
          </h1>
          <p className="text-xs text-slate-500">
            Marking Scheme: +4 marks for correct • -1 negative marking for incorrect • 0 for unattempted
          </p>
        </div>

        {/* 2-Hour Countdown Clock */}
        <div className="flex items-center gap-4">
          <div className="text-center px-6 py-2.5 bg-slate-900 text-white rounded-2xl shadow-inner">
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" /> Exam Timer (2 Hours)
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
              {formatTimer(secondsRemaining)}
            </div>
          </div>

          {!isSubmitted && (
            <button
              onClick={handleSubmitTest}
              className="py-3 px-5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-black text-xs transition-all shadow-md cursor-pointer"
            >
              Submit Exam
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            Synthesizing 2-Hour Competitive Exam with PYQs...
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Configuring negative marking, high-weightage topics, and authentic previous year test questions.
          </p>
        </div>
      ) : testError ? (
        <div className="p-8 text-center space-y-4 bg-white rounded-3xl border border-rose-200 shadow-xs">
          <p className="text-sm font-bold text-rose-900">{testError}</p>
          <button
            onClick={loadTest}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer"
          >
            Retry Exam Generation
          </button>
        </div>
      ) : isSubmitted && submissionResult ? (
        /* Detailed Results & Mistakes Breakdown (Requirement 15) */
        <div className="space-y-6 animate-fadeIn">
          {/* Score Summary Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-indigo-200 shadow-lg space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-700">
                Weekly Test Evaluation & Scorecard
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                {submissionResult.score} / {submissionResult.totalMarks} Marks
              </h2>
              <p className="text-xs text-slate-500">
                Net Score (Correct: {submissionResult.correctCount} × 4 = +{submissionResult.correctCount * 4} | Wrong: {submissionResult.wrongCount} × -1 = -{submissionResult.wrongCount})
              </p>
            </div>

            {/* Performance Stats Pill Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-xl font-black text-emerald-900">{submissionResult.correctCount}</div>
                <div className="text-xs text-emerald-700 font-semibold">Correct (+4 each)</div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <div className="text-xl font-black text-rose-900">{submissionResult.wrongCount}</div>
                <div className="text-xs text-rose-700 font-semibold">Incorrect (-1 penalty)</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xl font-black text-slate-900">{submissionResult.unattemptedCount}</div>
                <div className="text-xs text-slate-600 font-semibold">Unattempted (0 pts)</div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="text-xl font-black text-amber-900">+{submissionResult.pointsEarned} pts</div>
                <div className="text-xs text-amber-700 font-semibold">{submissionResult.stars} Stars Awarded</div>
              </div>
            </div>

            {/* Mistakes & Low Topics Callout */}
            {submissionResult.weakTopics.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-950">
                    High-Yield Revision Required on Mistakes ({submissionResult.weakTopics.length}):
                  </span>
                  <button
                    onClick={() => startFlowchartRevision(submissionResult.weakTopics[0])}
                    className="text-xs font-bold text-indigo-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>Open Flowcharts for these topics</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {submissionResult.weakTopics.map((wt, i) => (
                    <span
                      key={i}
                      className="text-xs bg-white text-rose-800 border border-rose-200 px-2.5 py-1 rounded-lg font-medium"
                    >
                      ⚠️ {wt}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Bar: View All or Only Mistakes */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <h3 className="text-sm font-bold text-slate-900">
                Full Solution Key & Mistake Derivations
              </h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    filterMode === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Questions ({submissionResult.solutions.length})
                </button>

                <button
                  onClick={() => setFilterMode('mistakes')}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    filterMode === 'mistakes'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Show Mistakes Only ({submissionResult.wrongCount})
                </button>
              </div>
            </div>

            {/* Solution List */}
            <div className="space-y-4 pt-2">
              {submissionResult.solutions
                .filter((sol) => filterMode === 'all' || !sol.isCorrect)
                .map((sol, index) => {
                  const q = sol.question;
                  const isWrong = sol.userAnswer !== null && !sol.isCorrect;
                  const isUnattempted = sol.userAnswer === null;

                  return (
                    <div
                      key={q.id}
                      className={`p-5 rounded-2xl border text-xs space-y-3 ${
                        sol.isCorrect
                          ? 'bg-emerald-50/30 border-emerald-200'
                          : isWrong
                          ? 'bg-rose-50/40 border-rose-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">Q{index + 1}.</span>
                          <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                            {q.pyqExam || targetExam || 'PYQ'} {q.pyqYear ? `(${q.pyqYear})` : ''}
                          </span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                            {q.topic}
                          </span>
                        </div>

                        <div>
                          {sol.isCorrect ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                              <CheckCircle2 className="w-4 h-4" /> Correct (+4)
                            </span>
                          ) : isWrong ? (
                            <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-xs">
                              <XCircle className="w-4 h-4" /> Incorrect (-1)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-500 font-bold text-xs">
                              Unattempted (0)
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="font-bold text-slate-900 text-sm">{q.question}</p>

                      {/* Options breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => {
                          const isCorrectOption = oIdx === q.correctIndex;
                          const wasChosen = oIdx === sol.userAnswer;

                          return (
                            <div
                              key={oIdx}
                              className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between ${
                                isCorrectOption
                                  ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold'
                                  : wasChosen
                                  ? 'bg-rose-100 border-rose-400 text-rose-950 font-bold'
                                  : 'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              <span>
                                {String.fromCharCode(65 + oIdx)}. {opt}
                              </span>
                              {isCorrectOption && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                              {wasChosen && !isCorrectOption && (
                                <XCircle className="w-3.5 h-3.5 text-rose-700" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Common Mistake Trap Callout */}
                      {q.commonMistake && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                          <span className="font-bold text-amber-950 block text-[11px]">
                            ⚠️ Common Mistake / Trap Done by Students:
                          </span>
                          <p className="text-[11px] leading-relaxed">{q.commonMistake}</p>
                        </div>
                      )}

                      {/* Full Pedagogical Explanation */}
                      <div className="p-3 rounded-xl bg-slate-100/70 border border-slate-200 text-slate-700 space-y-1">
                        <span className="font-bold text-slate-900 block text-[11px]">
                          Complete Step-by-Step Derivation & Solution:
                        </span>
                        <p className="text-[11px] leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      ) : (
        /* Live 2-Hour Exam Interface */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Question View */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            {currentQ && (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-xl">
                      Question {currentQuestionIndex + 1} of {allQuestions.length}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-semibold">
                      {currentQ.topic}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleReview(currentQ.id)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                      markedForReview[currentQ.id]
                        ? 'bg-purple-100 text-purple-900 border border-purple-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>
                      {markedForReview[currentQ.id] ? 'Marked for Review' : 'Mark for Review'}
                    </span>
                  </button>
                </div>

                <div className="space-y-2">
                  {currentQ.isPyq && (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md">
                      [PYQ {currentQ.pyqExam || targetExam} {currentQ.pyqYear || ''}]
                    </span>
                  )}
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {currentQ.question}
                  </h2>
                </div>

                {/* Options Selection */}
                <div className="space-y-3">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = userAnswers[currentQ.id] === optIdx;

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(currentQ.id, optIdx)}
                        className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'border-rose-600 bg-rose-50 text-rose-950 font-bold ring-2 ring-rose-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white text-slate-800'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Question Navigation Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((c) => c - 1)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition-colors disabled:opacity-40 flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  <button
                    type="button"
                    disabled={currentQuestionIndex === allQuestions.length - 1}
                    onClick={() => setCurrentQuestionIndex((c) => c + 1)}
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-40"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Question Palette (1..N) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900">
              Exam Question Palette ({allQuestions.length} Total)
            </h3>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500" /> Attempted
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-purple-500" /> For Review
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-200" /> Unattempted
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded border-2 border-indigo-600" /> Current
              </div>
            </div>

            {/* Grid of question buttons */}
            <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto p-1">
              {allQuestions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const isAnswered = userAnswers[q.id] !== undefined;
                const isMarked = markedForReview[q.id];

                let bgClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                if (isAnswered) bgClass = 'bg-emerald-500 text-white hover:bg-emerald-600';
                if (isMarked) bgClass = 'bg-purple-600 text-white hover:bg-purple-700';

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-9 rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center justify-center ${bgClass} ${
                      isCurrent ? 'ring-2 ring-indigo-600 ring-offset-2 scale-105' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSubmitTest}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer transition-all"
              >
                End & Submit 2-Hour Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
