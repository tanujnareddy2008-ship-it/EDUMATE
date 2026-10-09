import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Star,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  GitBranch,
  Flame,
  Zap,
  Target,
  Sliders,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { generateQuiz } from '../services/api';
import { QuizQuestion, QuizResult } from '../types';

export const QuizView: React.FC = () => {
  const {
    topic,
    subject,
    targetExam,
    activeDocument,
    addQuizPoints,
    recordQuizResult,
    startFlowchartRevision,
    weakTopicsGlobal,
    setActiveTab,
  } = useApp();

  // Quiz configuration
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [includePyq, setIncludePyq] = useState<boolean>(true);
  const [difficulty, setDifficulty] = useState<string>('Medium');
  const [isDrillingWeakTopics, setIsDrillingWeakTopics] = useState<boolean>(false);

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [quizSummary, setQuizSummary] = useState<QuizResult | null>(null);

  // Fetch or regenerate quiz
  const loadQuestions = async (count: number = 10, isWeakDrill: boolean = false) => {
    setIsLoading(true);
    setQuizError(null);
    setSubmitted(false);
    setUserAnswers({});
    setCurrentIndex(0);
    setQuizSummary(null);

    try {
      const qList = await generateQuiz({
        topic,
        subject,
        difficulty,
        questionCount: count,
        isPyq: includePyq,
        targetExam,
        documentText: activeDocument?.content,
        pdfBase64: activeDocument?.base64,
        lowKnowledgeTopics: isWeakDrill ? weakTopicsGlobal : undefined,
      });

      if (!qList || qList.length === 0) {
        throw new Error('No questions received');
      }
      setQuestions(qList);
    } catch (err: any) {
      console.error(err);
      setQuizError(err.message || 'Failed to load questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions(10, false);
  }, [topic, subject]);

  const handleSelectOption = (qId: number, optIdx: number) => {
    if (submitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: optIdx,
    }));
  };

  // Submit and calculate star rating, points, knowledge level
  const handleSubmitQuiz = () => {
    let correct = 0;
    const weakT: string[] = [];
    const strongT: string[] = [];

    questions.forEach((q) => {
      const ans = userAnswers[q.id];
      if (ans === q.correctIndex) {
        correct++;
        strongT.push(q.topic);
      } else {
        weakT.push(q.topic);
      }
    });

    const total = questions.length;
    const percentage = Math.round((correct / total) * 100);

    // Requirement 7: Star rating and conversion into points
    // 5 star - 10 points (90-100%)
    // 4 star - 8 points (75-89%)
    // 3 star - 6 points (60-74%)
    // 2 star - 4 points (40-59%)
    // 1 star - 2 points (1-39%)
    // 0 star - 0 points (0%)
    let stars: 0 | 1 | 2 | 3 | 4 | 5 = 0;
    if (percentage >= 90) stars = 5;
    else if (percentage >= 75) stars = 4;
    else if (percentage >= 60) stars = 3;
    else if (percentage >= 40) stars = 2;
    else if (percentage > 0) stars = 1;
    else stars = 0;

    const { pointsEarned } = addQuizPoints(stars);

    // Requirement 11: Estimate knowledge level
    let knowledgeLevel: 'Mastery' | 'Proficient' | 'Competent' | 'Developing' | 'Novice' = 'Novice';
    if (percentage >= 90) knowledgeLevel = 'Mastery';
    else if (percentage >= 75) knowledgeLevel = 'Proficient';
    else if (percentage >= 60) knowledgeLevel = 'Competent';
    else if (percentage >= 40) knowledgeLevel = 'Developing';
    else knowledgeLevel = 'Novice';

    const result: QuizResult = {
      totalQuestions: total,
      correctAnswers: correct,
      scorePercentage: percentage,
      stars,
      pointsEarned,
      knowledgeLevel,
      weakTopics: Array.from(new Set(weakT)),
      strongTopics: Array.from(new Set(strongT)),
      timestamp: new Date().toLocaleTimeString(),
      topic,
      userAnswers,
    };

    setQuizSummary(result);
    recordQuizResult(result);
    setSubmitted(true);

    if (stars >= 4) {
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
    }
  };

  // Requirement 13: Re-quiz on low-knowledge topics roughly 20 questions (or user customizable)
  const handleStartWeakTopicReQuiz = (customCount: number = 20) => {
    setIsDrillingWeakTopics(true);
    setQuestionCount(customCount);
    loadQuestions(customCount, true);
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {isDrillingWeakTopics ? '🎯 Targeted Weak-Topic Drill' : 'Adaptive 10-Question Quiz'}
            </span>
            {activeDocument && (
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Strict PDF Mode
              </span>
            )}
          </div>
          <h1 className="text-xl font-black text-slate-900 mt-1">
            {topic}
          </h1>
          <p className="text-xs text-slate-500">
            {subject} {targetExam ? `• Targeted for ${targetExam}` : ''}
          </p>
        </div>

        {/* Configuration Bar */}
        {!submitted && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadQuestions(10, false)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="p-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            Generating High-Yield Questions with EDUMATE AI...
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeDocument
              ? `Extracting questions strictly from ${activeDocument.name}`
              : `Synthesizing conceptual questions and previous year archetypes`}
          </p>
        </div>
      ) : quizError ? (
        <div className="p-8 text-center space-y-4 bg-white rounded-3xl border border-rose-200 shadow-xs">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <p className="text-sm font-bold text-rose-900">{quizError}</p>
          <button
            onClick={() => loadQuestions(questionCount, isDrillingWeakTopics)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer shadow-sm"
          >
            Retry Generation
          </button>
        </div>
      ) : submitted && quizSummary ? (
        /* Results View (Star Rating, Points, Knowledge Level, Weak Topics) */
        <div className="space-y-6 animate-fadeIn">
          {/* Main Scorecard */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-amber-200 shadow-lg text-center space-y-6 relative overflow-hidden">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
                Quiz Evaluation Completed
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                {quizSummary.scorePercentage}% Score
              </h2>
              <p className="text-xs text-slate-500">
                {quizSummary.correctAnswers} of {quizSummary.totalQuestions} Questions Correct
              </p>
            </div>

            {/* Star Rating Display (Requirement 7) */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-10 h-10 transition-all ${
                    s <= quizSummary.stars
                      ? 'text-amber-500 fill-amber-400 scale-110 drop-shadow-md'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Points Credited & Star Conversion Table */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-amber-50 border border-indigo-200/60 max-w-md mx-auto space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5 text-indigo-700">
                  <Award className="w-4 h-4" /> Performance Credit:
                </span>
                <span className="text-sm font-black text-indigo-900">
                  +{quizSummary.pointsEarned} Points Added!
                </span>
              </div>
              <p className="text-[11px] text-slate-500 text-left">
                Conversion Rule: {quizSummary.stars} Stars = {quizSummary.pointsEarned} Points credited to your EDUMATE account balance.
              </p>
            </div>

            {/* Knowledge Level Estimation (Requirement 11) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Estimated Knowledge Level on &ldquo;{topic}&rdquo;
              </span>
              <div className="flex items-center justify-center gap-2">
                <span
                  className={`text-base font-black px-3 py-1 rounded-xl uppercase tracking-wider ${
                    quizSummary.knowledgeLevel === 'Mastery'
                      ? 'bg-emerald-100 text-emerald-800'
                      : quizSummary.knowledgeLevel === 'Proficient'
                      ? 'bg-blue-100 text-blue-800'
                      : quizSummary.knowledgeLevel === 'Competent'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {quizSummary.knowledgeLevel} Level
                </span>
              </div>
              <p className="text-[11px] text-slate-600 pt-1">
                {quizSummary.knowledgeLevel === 'Mastery' && 'Exceptional command of both theory and numerical boundary conditions.'}
                {quizSummary.knowledgeLevel === 'Proficient' && 'Strong conceptual baseline with minor precision gaps.'}
                {quizSummary.knowledgeLevel === 'Competent' && 'Adequate understanding; recommended to review formula derivations.'}
                {(quizSummary.knowledgeLevel === 'Developing' || quizSummary.knowledgeLevel === 'Novice') &&
                  'Core concepts require structured revision using interactive flowcharts and targeted drills.'}
              </p>
            </div>

            {/* Action Recommendations: Weak Topics Revision & Re-Quiz (Requirements 12 & 13) */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              {quizSummary.weakTopics.length > 0 && (
                <div className="text-left space-y-2">
                  <span className="text-xs font-bold text-rose-700 block">
                    Identified Low-Knowledge Topics ({quizSummary.weakTopics.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {quizSummary.weakTopics.map((wt, i) => (
                      <span
                        key={i}
                        className="text-xs bg-rose-50 border border-rose-200 text-rose-800 px-2.5 py-1 rounded-lg font-medium"
                      >
                        ⚠️ {wt}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Requirement 12: Revise via Diagrammatic Flowcharts */}
                <button
                  onClick={() => startFlowchartRevision(topic)}
                  className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <GitBranch className="w-4 h-4" />
                  <span>Revise Topic with Flowchart & Diagrams</span>
                </button>

                {/* Requirement 13: Again conduct a quiz on topics felt low by ~20 questions (or more if requested) */}
                <div className="space-y-1">
                  <button
                    onClick={() => handleStartWeakTopicReQuiz(20)}
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Target className="w-4 h-4" />
                    <span>Take 20-Question Weak Topic Re-Quiz</span>
                  </button>
                  <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
                    <span>Need more questions?</span>
                    <button
                      onClick={() => handleStartWeakTopicReQuiz(25)}
                      className="underline font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
                    >
                      25 Qs
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => handleStartWeakTopicReQuiz(30)}
                      className="underline font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
                    >
                      30 Qs
                    </button>
                  </div>
                </div>
              </div>

              {/* Back to Games or Dashboard */}
              <div className="pt-2 flex justify-center gap-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('games')}
                  className="text-emerald-700 hover:underline cursor-pointer"
                >
                  🎮 Spend points to unlock Game Levels (50 levels)
                </button>
                <span>•</span>
                <button
                  onClick={() => loadQuestions(10, false)}
                  className="text-slate-600 hover:underline cursor-pointer"
                >
                  Retake 10-Question Standard Quiz
                </button>
              </div>
            </div>
          </div>

          {/* Solutions & Explanation Breakdown */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Detailed Question Review & Mistake Breakdown
            </h3>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const userSel = userAnswers[q.id];
                const isCorrect = userSel === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border text-xs space-y-2.5 transition-all ${
                      isCorrect ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">Q{idx + 1}.</span>
                        {q.isPyq && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                            {q.pyqExam || 'PYQ'}
                          </span>
                        )}
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                          {q.topic}
                        </span>
                      </div>

                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4" /> Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-xs">
                          <XCircle className="w-4 h-4" /> Mistake
                        </span>
                      )}
                    </div>

                    <p className="font-bold text-slate-900 text-sm">{q.question}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, oIdx) => {
                        const isCorrectOpt = oIdx === q.correctIndex;
                        const isSelectedByStudent = oIdx === userSel;

                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between ${
                              isCorrectOpt
                                ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold'
                                : isSelectedByStudent
                                ? 'bg-rose-100 border-rose-400 text-rose-950 font-bold'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <span>
                              {String.fromCharCode(65 + oIdx)}. {opt}
                            </span>
                            {isCorrectOpt && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                            {isSelectedByStudent && !isCorrectOpt && <XCircle className="w-3.5 h-3.5 text-rose-700" />}
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1">
                      <span className="font-bold text-slate-900 block text-[11px]">
                        Pedagogical Explanation:
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
        /* Live Quiz Player */
        currentQ && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            {/* Progress & Question Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl">
                  Question {currentIndex + 1} of {questions.length}
                </span>

                {currentQ.isPyq && (
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
                    {currentQ.pyqExam || 'Previous Year Question (PYQ)'}
                  </span>
                )}
              </div>

              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-semibold">
                {currentQ.difficulty || 'Medium'}
              </span>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400">
                Topic: {currentQ.topic}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {currentQ.question}
              </h2>
            </div>

            {/* Options */}
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
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white text-slate-800'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((c) => c - 1)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition-colors disabled:opacity-40"
              >
                Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((c) => c + 1)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-black text-xs cursor-pointer transition-all shadow-md flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>Submit Quiz & Earn Stars</span>
                </button>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};
