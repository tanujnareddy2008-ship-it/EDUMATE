import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  Star,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Calendar,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WeeklyPerformanceView: React.FC = () => {
  const {
    points,
    totalStars,
    starCounts,
    weeklyActivities,
    quizHistory,
    weakTopicsGlobal,
    penaltyLogs,
    targetExam,
    userGoal,
  } = useApp();

  // Calculate weekly stats
  const totalWeeklyMinutes = weeklyActivities.reduce((acc, curr) => acc + curr.minutes, 0);
  const totalWeeklyPoints = weeklyActivities.reduce((acc, curr) => acc + curr.points, 0);
  const averageAccuracy = Math.round(
    weeklyActivities.reduce((acc, curr) => acc + curr.accuracy, 0) / weeklyActivities.length
  );
  const maxMinutes = Math.max(...weeklyActivities.map((w) => w.minutes), 60);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-violet-800/40 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-300 bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
            <BarChart3 className="w-3.5 h-3.5" /> Dedicated Weekly Performance Analytics
          </span>
          <span className="text-xs text-violet-200 hidden sm:inline">
            (Separated from Dashboard per system architecture)
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Weekly Study & Mastery Performance
        </h1>
        <p className="text-violet-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Comprehensive review of your active study hours, quiz accuracy trajectories, points accumulation, and topic diagnostic radars across the 7-day learning cycle.
        </p>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
            <div className="text-2xl sm:text-3xl font-black text-white">{totalWeeklyMinutes} m</div>
            <div className="text-[11px] text-violet-200 font-medium">Total Study Time</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
            <div className="text-2xl sm:text-3xl font-black text-amber-300">{averageAccuracy}%</div>
            <div className="text-[11px] text-violet-200 font-medium">Avg Quiz Accuracy</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
            <div className="text-2xl sm:text-3xl font-black text-emerald-300">+{totalWeeklyPoints}</div>
            <div className="text-[11px] text-violet-200 font-medium">Weekly Points Gained</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
            <div className="text-2xl sm:text-3xl font-black text-yellow-300">{totalStars} ★</div>
            <div className="text-[11px] text-violet-200 font-medium">Cumulative Stars</div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid: Weekly Practice Time & Weekly Accuracy Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Weekly Study Minutes Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span>Daily Practice Time (Mon – Sun)</span>
              </h2>
              <p className="text-xs text-slate-500">Monitored continuous study session minutes</p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-lg">
              Goal: 45 min/day
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-8 pb-2 px-2">
            {weeklyActivities.map((act) => {
              const heightPct = Math.round((act.minutes / maxMinutes) * 100);
              const reachedGoal = act.minutes >= 45;

              return (
                <div key={act.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {act.minutes}m
                  </span>

                  <div className="w-full max-w-[42px] bg-slate-100 rounded-t-2xl relative overflow-hidden h-full flex items-end">
                    <div
                      className={`w-full rounded-t-2xl transition-all duration-700 ${
                        reachedGoal
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                          : 'bg-gradient-to-t from-indigo-600 to-indigo-400'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  <span className="text-xs font-bold text-slate-700">{act.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span>Target Achieved (≥ 45 min)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-indigo-500" />
              <span>Active Study Session</span>
            </div>
          </div>
        </div>

        {/* Right: Accuracy Trajectory & Star Distribution */}
        <div className="lg:col-span-5 space-y-6">
          {/* Accuracy Trend Chart */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span>Accuracy Trajectory</span>
                </h3>
                <p className="text-xs text-slate-500">Weekly quiz performance score</p>
              </div>
              <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                {averageAccuracy}% Avg
              </span>
            </div>

            {/* Accuracy Bars */}
            <div className="space-y-3">
              {weeklyActivities.map((act) => (
                <div key={act.day} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">{act.day}</span>
                    <span className="font-semibold text-slate-600">{act.accuracy}% accuracy</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${act.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Star Distribution Breakdown (Requirement 7) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Star Rating Distribution</span>
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <div className="font-bold text-amber-900 text-lg">{starCounts[5]}</div>
                <div className="text-[11px] text-amber-700 font-semibold">5 Stars (10 pts)</div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                <div className="font-bold text-indigo-900 text-lg">{starCounts[4]}</div>
                <div className="text-[11px] text-indigo-700 font-semibold">4 Stars (8 pts)</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 text-lg">
                  {starCounts[3] + starCounts[2] + starCounts[1]}
                </div>
                <div className="text-[11px] text-slate-600 font-semibold">1-3 Stars</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weak Topics Diagnostic Matrix & Penalty History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Weak vs Strong Topics Diagnostic Matrix */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Topic Diagnostics & Knowledge Retention Radar
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
              <span className="text-xs font-bold text-rose-950 block">
                Needs Reinforcement (Weak Topics):
              </span>
              <ul className="space-y-1.5 text-xs text-rose-800">
                {weakTopicsGlobal.map((wt, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>{wt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <span className="text-xs font-bold text-emerald-950 block">
                High Mastery / Strong Topics:
              </span>
              <ul className="space-y-1.5 text-xs text-emerald-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Newtonian 1st & 2nd Laws</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dimensional Formulas & Units</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Vector Decomposition</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Penalty Logs History (Requirement 16) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>Early Exit Penalty Audit Log</span>
            </h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
              {penaltyLogs.length} Events
            </span>
          </div>

          {penaltyLogs.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 text-center text-xs text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-800">No session penalties incurred!</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Always finish the 30-min preparation session to preserve your game levels.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {penaltyLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{log.gameLocked}</span>
                    <span className="text-[10px] text-rose-600">{log.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-rose-700">{log.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
