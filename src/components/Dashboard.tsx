import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  BookOpen,
  Target,
  Clock,
  Zap,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Search,
  ArrowRight,
  Shield,
  Layers,
  Video,
  FileUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { analyzeMaterial, askDoubt } from '../services/api';
import { UserGoal } from '../types';

const COMMON_EXAMS = [
  'JEE Main & Advanced',
  'NEET Medical Exam',
  'UPSC Civil Services (IAS)',
  'GATE Engineering',
  'SAT / ACT College Board',
  'GRE / GMAT International',
  'CBSE Class 12 Boards',
  'State Board High School',
  'SSC / Banking Exam',
  'University Semester Exams',
];

export const Dashboard: React.FC = () => {
  const {
    userGoal,
    setUserGoal,
    targetExam,
    setTargetExam,
    subject,
    setSubject,
    topic,
    setTopic,
    allSubjects,
    activeDocument,
    setActiveDocument,
    clearDocument,
    materialAnalysis,
    setMaterialAnalysis,
    importantTopics,
    setImportantTopics,
    setIsPracticeSessionActive,
    setPracticeSecondsLeft,
    setActiveTab,
    startQuickQuizForTopic,
    startFlowchartRevision,
  } = useApp();

  const [pastedText, setPastedText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  // In-dashboard Doubt Solver
  const [doubtInput, setDoubtInput] = useState<string>('');
  const [doubtAnswer, setDoubtAnswer] = useState<{ answer: string; source: string } | null>(null);
  const [isAnsweringDoubt, setIsAnsweringDoubt] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handler (PDF or Text)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isText = file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md');

    if (isPdf) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Extract base64 without prefix
        const base64Data = result.includes(',') ? result.split(',')[1] : result;
        setActiveDocument({
          name: file.name,
          type: 'pdf',
          base64: base64Data,
          size: file.size,
        });
        setAnalyzeError(null);
      };
      reader.readAsDataURL(file);
    } else if (isText) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        setActiveDocument({
          name: file.name,
          type: 'text',
          content: text,
          size: file.size,
        });
        setPastedText(text);
        setAnalyzeError(null);
      };
      reader.readAsText(file);
    } else {
      // General file reading as text
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        setActiveDocument({
          name: file.name,
          type: 'text',
          content: text,
          size: file.size,
        });
        setAnalyzeError(null);
      };
      reader.readAsText(file);
    }
  };

  // Trigger Material Analysis
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalyzeError(null);

    try {
      const result = await analyzeMaterial({
        textContent: pastedText || activeDocument?.content,
        pdfBase64: activeDocument?.type === 'pdf' ? activeDocument?.base64 : undefined,
        fileName: activeDocument?.name,
        userGoal,
        targetExam,
        subject,
        topic,
      });

      setMaterialAnalysis(result);
      if (result.importantTopics && result.importantTopics.length > 0) {
        setImportantTopics(result.importantTopics);
      }
    } catch (err: any) {
      console.error(err);
      setAnalyzeError(err.message || 'Failed to analyze content. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Quick Doubt Question Handler
  const handleAskDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtInput.trim()) return;

    setIsAnsweringDoubt(true);
    try {
      const res = await askDoubt({
        question: doubtInput,
        documentText: activeDocument?.content || pastedText,
        pdfBase64: activeDocument?.type === 'pdf' ? activeDocument.base64 : undefined,
        subject,
        topic,
      });
      setDoubtAnswer(res);
    } catch (err: any) {
      console.error(err);
      setDoubtAnswer({
        answer: 'Could not fetch solution at this moment. Please check your query or connection.',
        source: 'Error',
      });
    } finally {
      setIsAnsweringDoubt(false);
    }
  };

  // Start 30-min Monitored Practice
  const handleStartPractice = () => {
    setPracticeSecondsLeft(1800); // 30 minutes
    setIsPracticeSessionActive(true);
    setActiveTab('practice');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-amber-900 text-white p-6 sm:p-10 shadow-xl border border-indigo-700/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Adaptive Education Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Learn Smarter with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-rose-300">EDUMATE</span>
          </h1>

          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
            Upload course PDFs, textbook chapters, or type any subject. EDUMATE extracts high-yield topics, enforces 30-minute monitored focus sessions, creates adaptive PYQ quizzes, generates visual flowcharts, and unlocks 50-level educational games!
          </p>

          {/* Strict Grounding Indicator Banner */}
          <div className="pt-2">
            {activeDocument ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs sm:text-sm font-medium backdrop-blur-xs">
                <Shield className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>
                  <strong>Strict Document Mode Active:</strong> Grounded 100% inside{' '}
                  <span className="underline font-bold text-white">{activeDocument.name}</span>. Solutions & quizzes will strictly adhere to this file.
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs sm:text-sm font-medium backdrop-blur-xs">
                <BookOpen className="w-4 h-4 text-amber-300 shrink-0" />
                <span>
                  <strong>Universal Knowledge Mode:</strong> No file uploaded. Solutions and PYQ quizzes draw from authoritative comprehensive subject curriculum.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Left Column (Guidance & Inputs) | Right Column (Analysis & Fast Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Guidance & Document Intake */}
        <div className="lg:col-span-5 space-y-6">
          {/* Step 1: Guided Purpose & Goal Setting */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Your Study Goal & Purpose</h2>
                <p className="text-xs text-slate-500">Guides the difficulty, format, and PYQs</p>
              </div>
            </div>

            {/* Goal Selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'competitive', label: 'Competitive Exam', icon: Target, desc: 'JEE, NEET, UPSC' },
                { id: 'academic', label: 'Academic Exam', icon: BookOpen, desc: 'School & College' },
                { id: 'skill', label: 'Skill Mastery', icon: Zap, desc: 'Self-Paced' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setUserGoal(item.id as UserGoal)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    userGoal === item.id
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${userGoal === item.id ? 'text-indigo-600' : 'text-slate-500'}`} />
                  <div className="mt-2">
                    <div className="text-xs font-bold text-slate-900">{item.label}</div>
                    <div className="text-[10px] text-slate-500">{item.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Target Exam Input / Selection */}
            {userGoal === 'competitive' && (
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-slate-700 block">Target Competitive Exam:</label>
                <input
                  type="text"
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  placeholder="e.g. JEE Main, NEET, UPSC, GATE, SAT"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium bg-slate-50/50"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {COMMON_EXAMS.slice(0, 4).map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setTargetExam(ex)}
                      className={`text-[11px] px-2 py-0.5 rounded-md border cursor-pointer transition-colors ${
                        targetExam === ex ? 'bg-indigo-600 text-white border-indigo-600 font-bold' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Subject & Specific Topic */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Select Subject & Topic</h2>
                <p className="text-xs text-slate-500">All academic disciplines & engineering covered</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Subject:</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium bg-slate-50/50"
              >
                {allSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Specific Topic You Are Preparing For:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Electromagnetic Induction, Organic Mechanisms, Thermodynamics..."
                  className="w-full text-xs px-3 py-2.5 pl-8 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium bg-slate-50/50"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>
          </div>

          {/* Step 3: File / PDF Intake or Text */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Upload PDF or Document</h2>
                  <p className="text-xs text-slate-500">Takes PDF, TXT, or pasted study material</p>
                </div>
              </div>

              {activeDocument && (
                <button
                  onClick={clearDocument}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium underline cursor-pointer"
                >
                  Clear File
                </button>
              )}
            </div>

            {/* File Drag / Select Box */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.txt,.md,.doc,.docx"
              className="hidden"
            />

            {activeDocument ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-emerald-950 truncate max-w-[200px] sm:max-w-xs">
                      {activeDocument.name}
                    </h3>
                    <p className="text-[11px] text-emerald-700">
                      {activeDocument.type.toUpperCase()} •{' '}
                      {activeDocument.size ? `${(activeDocument.size / 1024).toFixed(1)} KB` : 'Attached'}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-1 rounded-full font-bold">
                  Grounded
                </span>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3 transition-colors">
                  <FileUp className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Click to Upload PDF or Textbook Chapter
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supports PDF, TXT, or documents. Strict grounding is enforced!
                </p>
              </div>
            )}

            {/* Optional Manual Text Paste */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-600">
                  Or paste syllabus / chapter text directly:
                </label>
                {pastedText && (
                  <span className="text-[10px] text-slate-400">{pastedText.length} characters</span>
                )}
              </div>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={3}
                placeholder="Paste chapter notes, syllabus bullet points, or lecture transcript..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-amber-600 hover:from-indigo-700 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing Material with EDUMATE AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Analyze Input & Extract Important Topics</span>
                </>
              )}
            </button>

            {analyzeError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{analyzeError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Analysis Output & Study Launchers */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Action Decision Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Action 1: 30-Min Monitored Practice Session */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-black">30-Min Monitored Practice</h3>
                <p className="text-xs text-amber-100 leading-relaxed">
                  Continuous focus with flashcards, active engagement tracking, and timer. Concludes with quiz readiness prompt (+30 min extension option).
                </p>
              </div>

              <button
                onClick={handleStartPractice}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-amber-900 font-bold text-xs hover:bg-amber-50 transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Enter Practice Room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Action 2: Requirement 18 - Quick Quiz Without Practice */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-amber-300" />
                </div>
                <h3 className="text-base font-black">Decide Topic & Take Quick Quiz</h3>
                <p className="text-xs text-indigo-100 leading-relaxed">
                  Skip the 30-min practice session! Jump straight into a 10-Question adaptive quiz with star ratings & points on: &ldquo;{topic.slice(0, 28)}...&rdquo;
                </p>
              </div>

              <button
                onClick={() => startQuickQuizForTopic(topic)}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-indigo-900 font-bold text-xs hover:bg-indigo-50 transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Start 10-Question Quiz Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* AI Analyzed Solution & Important Topics (Requirement 2 & 4) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Important Topics & Concept Summary
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeDocument
                      ? `Extracted strictly from: ${activeDocument.name}`
                      : `Universal Curriculum Guide for: ${topic || subject}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => startFlowchartRevision(topic)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>View Flowchart</span>
                </button>
              </div>
            </div>

            {/* Overview Summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900 block mb-1">Pedagogical Overview:</span>
              <p>
                {materialAnalysis?.summary ||
                  `Welcome to EDUMATE. You are exploring "${topic}" under "${subject}". This module structures foundational principles, high-weightage formulas, and typical examination question archetypes. Use the practice room for monitored review or test yourself via adaptive quizzes.`}
              </p>
            </div>

            {/* Important Topics List (Requirement 4) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Important Topics ({importantTopics.length || (materialAnalysis?.importantTopics.length ?? 2)})
                </h4>
                <span className="text-[11px] text-slate-400">Ranked by exam weightage</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(materialAnalysis?.importantTopics || [
                  {
                    id: 'top-1',
                    title: topic || 'Core Governing Principles',
                    importance: 'Core Essential' as const,
                    description: 'Primary equations and boundary condition behaviors tested in 80% of exams.',
                    keyTerms: ['Governing Laws', 'Equilibrium', 'Coordinate Frame', 'Conserved Quantities'],
                  },
                  {
                    id: 'top-2',
                    title: 'Analytical Deduction & Problem Archetypes',
                    importance: 'High' as const,
                    description: 'Algorithmic approach to solving complex multi-variable problems.',
                    keyTerms: ['Free Body Diagrams', 'Vector Components', 'Derivative Relations'],
                  },
                ]).map((t, idx) => (
                  <div
                    key={t.id || idx}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          t.importance === 'Core Essential'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.importance}
                      </span>

                      <button
                        onClick={() => startQuickQuizForTopic(t.title)}
                        title="Quiz on this specific topic"
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-1"
                      >
                        Quiz this <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {t.title}
                    </h5>
                    <p className="text-[11px] text-slate-600 leading-snug">{t.description}</p>

                    {t.keyTerms && t.keyTerms.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {t.keyTerms.map((term, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                          >
                            #{term}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Instant Doubt / Question Solver */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900">
                  Ask a Doubt / Query ({activeDocument ? 'Strict PDF Query' : 'Curriculum Doubt'})
                </h4>
              </div>

              <form onSubmit={handleAskDoubt} className="flex gap-2">
                <input
                  type="text"
                  value={doubtInput}
                  onChange={(e) => setDoubtInput(e.target.value)}
                  placeholder={
                    activeDocument
                      ? `Ask any doubt strictly from ${activeDocument.name}...`
                      : 'Ask a formula derivation, doubt, or conceptual question...'
                  }
                  className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                />
                <button
                  type="submit"
                  disabled={isAnsweringDoubt || !doubtInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  {isAnsweringDoubt ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Solve</span>
                  )}
                </button>
              </form>

              {doubtAnswer && (
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">
                      EDUMATE Solution
                    </span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded text-indigo-700 border border-indigo-200">
                      Source: {doubtAnswer.source}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                    {doubtAnswer.answer}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Footer Guides for Lectures & Competitive Mock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setActiveTab('youtube')}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                  Recommended YouTube Lectures
                </h4>
                <p className="text-[11px] text-slate-500">
                  Most viewed channels (Khan Academy, 3Blue1Brown, MIT OCW)
                </p>
              </div>
            </div>

            <div
              onClick={() => setActiveTab('weekly-test')}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-rose-300 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                  2-Hour Competitive Weekly Test
                </h4>
                <p className="text-[11px] text-slate-500">
                  Full 120-minute simulation with PYQs & detailed solutions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
