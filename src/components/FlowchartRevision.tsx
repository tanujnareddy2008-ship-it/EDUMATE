import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  Layers,
  Sparkles,
  RotateCcw,
  BookOpen,
  ArrowDown,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateFlowchart } from '../services/api';
import { FlowchartData, FlowchartNode } from '../types';

export const FlowchartRevision: React.FC = () => {
  const { topic, subject, activeDocument, weakTopicsGlobal, setTopic } = useApp();

  const [flowchartData, setFlowchartData] = useState<FlowchartData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<FlowchartNode | null>(null);
  const [revisionTopic, setRevisionTopic] = useState<string>(topic);

  const loadFlowchart = async (t: string) => {
    setIsLoading(true);
    try {
      const data = await generateFlowchart({
        topic: t || topic,
        subject,
        documentText: activeDocument?.content,
      });
      setFlowchartData(data);
      if (data?.flowchart?.nodes && data.flowchart.nodes.length > 0) {
        setSelectedNode(data.flowchart.nodes[0]);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFlowchart(topic);
    setRevisionTopic(topic);
  }, [topic]);

  const handleSelectTopic = (t: string) => {
    setRevisionTopic(t);
    setTopic(t);
    loadFlowchart(t);
  };

  const nodes = flowchartData?.flowchart?.nodes || [
    {
      id: 'node-1',
      title: '1. Foundation State & Coordinate Definition',
      subtitle: 'Starting Axiom',
      category: 'start' as const,
      details: 'Define system boundary, coordinates (x,y,z), and state variables at t=0.',
      keyFormulaOrRule: 'Reference frame: Σ F_ext = dp/dt',
      next: ['node-2'],
    },
    {
      id: 'node-2',
      title: '2. Equation Transformation & Free Body Analysis',
      subtitle: 'Core Process',
      category: 'process' as const,
      details: 'Resolve orthogonal forces and write independent scalar components along each axis.',
      keyFormulaOrRule: 'N = mg cos(θ), F_net = mg sin(θ) - f_k',
      next: ['node-3', 'node-4'],
    },
    {
      id: 'node-3',
      title: '3A. Conservative Exchange Path',
      subtitle: 'Zero Dissipation',
      category: 'decision' as const,
      details: 'If no non-conservative work is done, total mechanical energy is strictly conserved.',
      keyFormulaOrRule: 'E_total = K_i + U_i = K_f + U_f',
      next: ['node-5'],
    },
    {
      id: 'node-4',
      title: '3B. Dissipative Friction Path',
      subtitle: 'Non-Ideal Conditions',
      category: 'process' as const,
      details: 'Account for work done by friction W_f = -f_k · d converting mechanical into thermal energy.',
      keyFormulaOrRule: 'ΔE_mech = W_non_conservative',
      next: ['node-5'],
    },
    {
      id: 'node-5',
      title: '4. Final Exam Verification & Unit Sanity Check',
      subtitle: 'Outcome',
      category: 'outcome' as const,
      details: 'Check limiting values (e.g., angle θ=0 and θ=90°) and verify SI dimensional balance.',
      keyFormulaOrRule: '[T] = [M][L][T]^-2',
      next: [],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header and Quick Topic Revision Selector */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <GitBranch className="w-3.5 h-3.5" />
              Interactive Diagrammatic Flowchart
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Repeated Visual Revision Engine
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">
            {flowchartData?.title || `Visual Architecture: ${revisionTopic}`}
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl mt-1">
            {flowchartData?.conceptOverview ||
              'Step-by-step visual pathways break down abstract concepts into intuitive, memorable logic trees.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadFlowchart(revisionTopic)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Regenerate Diagram</span>
          </button>
        </div>
      </div>

      {/* Repeated Revision Selector: Switch quickly between weak topics */}
      {weakTopicsGlobal.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-amber-950 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-600" /> Revise Your Weak Topics Repeatedly:
          </span>
          {weakTopicsGlobal.map((wt, i) => (
            <button
              key={i}
              onClick={() => handleSelectTopic(wt)}
              className={`text-xs px-3 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                revisionTopic === wt
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100'
              }`}
            >
              {wt}
            </button>
          ))}
        </div>
      )}

      {/* Main Flowchart Visual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Diagram Flow Column */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Logic Flow Nodes (Click any node to inspect equations)</span>
            </h2>
            <span className="text-[11px] text-slate-400">Sequential Execution</span>
          </div>

          {isLoading ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-700">Synthesizing Visual Diagram...</p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {nodes.map((node, idx) => {
                const isSelected = selectedNode?.id === node.id;

                let borderTheme = 'border-slate-200 hover:border-indigo-300';
                let tagBg = 'bg-slate-100 text-slate-700';

                if (node.category === 'start') {
                  tagBg = 'bg-emerald-100 text-emerald-800';
                } else if (node.category === 'process') {
                  tagBg = 'bg-blue-100 text-blue-800';
                } else if (node.category === 'decision') {
                  tagBg = 'bg-amber-100 text-amber-800';
                } else if (node.category === 'outcome') {
                  tagBg = 'bg-indigo-100 text-indigo-800';
                }

                if (isSelected) {
                  borderTheme = 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/30';
                }

                return (
                  <React.Fragment key={node.id || idx}>
                    <div
                      onClick={() => setSelectedNode(node)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${borderTheme} shadow-xs group`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${tagBg}`}>
                              {node.category}
                            </span>
                            {node.subtitle && (
                              <span className="text-xs font-semibold text-slate-400">
                                {node.subtitle}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {node.title}
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed pt-1">
                            {node.details}
                          </p>
                        </div>

                        <div className="shrink-0 text-slate-400 group-hover:text-indigo-600 transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Formula preview strip */}
                      {node.keyFormulaOrRule && (
                        <div className="mt-3 p-2.5 rounded-xl bg-slate-900 text-amber-300 font-mono text-xs flex items-center justify-between">
                          <span className="truncate">{node.keyFormulaOrRule}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-sans">Formula</span>
                        </div>
                      )}
                    </div>

                    {/* Flow arrow between sequential nodes */}
                    {idx < nodes.length - 1 && (
                      <div className="flex justify-center my-1 text-indigo-400">
                        <ArrowDown className="w-5 h-5 animate-bounce" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Node Detail Inspector & Mnemonic Anchor */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Node Inspector */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-indigo-700">
              <Lightbulb className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-900">Node Deep-Dive Inspector</h3>
            </div>

            {selectedNode ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Selected Node Phase
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">{selectedNode.title}</h4>
                  <p className="text-slate-600 mt-1 leading-relaxed">{selectedNode.details}</p>
                </div>

                {selectedNode.keyFormulaOrRule && (
                  <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 space-y-1">
                    <span className="font-bold text-indigo-950 block text-[11px]">
                      Governing Equation / Rule:
                    </span>
                    <p className="font-mono text-indigo-900 text-xs font-semibold">
                      {selectedNode.keyFormulaOrRule}
                    </p>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 leading-snug">
                  <span className="font-bold text-slate-900 block mb-0.5">Exam Application Tip:</span>
                  Always isolate variables before substitution. Keep coordinate signs consistent throughout the derivation.
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Click any flowchart node to view deep equations and tips.</p>
            )}
          </div>

          {/* Mnemonic Memory Box */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-3xl p-6 shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-200" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Exam Retention Mnemonic
              </h3>
            </div>

            <div className="space-y-1.5">
              <div className="text-xl font-black tracking-wider text-amber-100">
                {flowchartData?.mnemonic?.acronym || 'F.A.S.T'}
              </div>
              <div className="text-xs font-bold text-white">
                {flowchartData?.mnemonic?.expansion || 'Formula, Assumptions, Substitution, Tolerances'}
              </div>
              <p className="text-xs text-amber-100 leading-relaxed pt-1">
                {flowchartData?.mnemonic?.memoryTrick ||
                  'Repeat this acronym before solving any problem on this chapter to avoid calculation omissions!'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
