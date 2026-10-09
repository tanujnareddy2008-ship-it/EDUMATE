import React, { useState, useEffect } from 'react';
import {
  Video,
  ExternalLink,
  Sparkles,
  Search,
  Play,
  RotateCcw,
  CheckCircle,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getLectureRecommendations } from '../services/api';
import { RecommendedChannel } from '../types';

export const YouTubeLecturesView: React.FC = () => {
  const { topic, subject, targetExam } = useApp();

  const [channels, setChannels] = useState<RecommendedChannel[]>([]);
  const [videoModules, setVideoModules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTopic, setSearchTopic] = useState<string>(topic);

  const loadRecommendations = async (t: string) => {
    setIsLoading(true);
    try {
      const data = await getLectureRecommendations({
        topic: t || topic,
        subject,
        targetExam,
      });
      setChannels(data.topChannels || []);
      setVideoModules(data.videoModules || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations(topic);
    setSearchTopic(topic);
  }, [topic, subject]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTopic.trim()) {
      loadRecommendations(searchTopic);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-indigo-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-rose-800/40 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-rose-300 bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
            <Video className="w-3.5 h-3.5" /> High-Yield Educational Video Curation
          </span>
          <span className="text-xs text-rose-200 hidden sm:inline">
            Ranked by Viewership & Pedagogical Excellence
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Most-Viewed YouTube Channels & Topic Lectures
        </h1>
        <p className="text-rose-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Guidance towards gold-standard educational creators (Khan Academy, MIT OCW, 3Blue1Brown, CrashCourse, and competitive exam toppers) tailored specifically to your chosen topic.
        </p>

        {/* Topic Search Input */}
        <form onSubmit={handleSearch} className="max-w-md flex gap-2 pt-2">
          <input
            type="text"
            value={searchTopic}
            onChange={(e) => setSearchTopic(e.target.value)}
            placeholder="Search lectures for any concept..."
            className="flex-1 text-xs px-4 py-2.5 rounded-xl bg-white/20 text-white placeholder:text-white/60 border border-white/20 focus:outline-hidden focus:ring-2 focus:ring-white font-medium"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-white text-rose-950 font-bold text-xs hover:bg-rose-50 transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="p-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-700">
            Fetching Top-Viewed Channels for &ldquo;{searchTopic}&rdquo;...
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Channels Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-rose-600" />
                <span>Premier Educational Channels</span>
              </h2>
              <span className="text-xs text-slate-400">Curated for maximum clarity</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(channels.length > 0
                ? channels
                : [
                    {
                      name: 'Khan Academy',
                      subscribersEstimate: '8.4M+ subscribers',
                      specialty: 'Mastery-based step-by-step chalkboard intuition with worked examples.',
                      recommendedPlaylists: 'Complete Physics & Chemistry Foundations',
                      directSearchQuery: `${searchTopic} Khan Academy`,
                    },
                    {
                      name: '3Blue1Brown',
                      subscribersEstimate: '6.1M+ subscribers',
                      specialty: 'Revolutionary mathematical animations visualizing first principles.',
                      recommendedPlaylists: 'Essence of Linear Algebra & Calculus',
                      directSearchQuery: `${searchTopic} 3Blue1Brown`,
                    },
                    {
                      name: 'CrashCourse',
                      subscribersEstimate: '15.4M+ subscribers',
                      specialty: 'High-speed, diagram-rich summaries ideal for rapid exam review.',
                      recommendedPlaylists: 'Crash Course Physics & Engineering',
                      directSearchQuery: `${searchTopic} CrashCourse`,
                    },
                    {
                      name: 'MIT OpenCourseWare',
                      subscribersEstimate: '5.2M+ subscribers',
                      specialty: 'Full MIT classroom lecture series by legendary professors.',
                      recommendedPlaylists: 'Classical Mechanics & Calculus Single Variable',
                      directSearchQuery: `${searchTopic} MIT OpenCourseWare`,
                    },
                    {
                      name: 'Physics Wallah / Unacademy',
                      subscribersEstimate: '12M+ subscribers',
                      specialty: 'Comprehensive competitive exam PYQ shortcuts and speed drills.',
                      recommendedPlaylists: 'Complete Competitive Chapter Marathon',
                      directSearchQuery: `${searchTopic} previous year questions solved`,
                    },
                    {
                      name: 'freeCodeCamp / STEM Lab',
                      subscribersEstimate: '10M+ subscribers',
                      specialty: 'In-depth exhaustive technical guides and masterclasses.',
                      recommendedPlaylists: 'Complete Engineering & Algorithm Guide',
                      directSearchQuery: `${searchTopic} full course masterclass`,
                    },
                  ]
              ).map((ch, idx) => {
                const query = ch.directSearchQuery || ch.searchQuery || `${searchTopic} ${ch.name || ch.channelName}`;
                const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

                return (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-rose-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {ch.subscribersEstimate || 'Top Ranked'}
                        </span>

                        <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                        {ch.name || ch.channelName}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {ch.specialty || ch.reason}
                      </p>

                      {ch.recommendedPlaylists && (
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                          <span className="font-bold text-slate-800 block">Recommended Series:</span>
                          {ch.recommendedPlaylists}
                        </div>
                      )}
                    </div>

                    <a
                      href={ytUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-800 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Watch Lectures on YouTube</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Generated Video Modules for the Topic */}
          {videoModules.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Generated Video Modules for &ldquo;{searchTopic}&rdquo;</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videoModules.map((mod, i) => {
                  const modUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(mod.searchQuery || mod.moduleTitle)}`;

                  return (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{mod.moduleTitle}</h4>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {mod.keyConceptsCovered?.map((c: string, ci: number) => (
                            <span
                              key={ci}
                              className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      <a
                        href={modUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800"
                      >
                        <span>Open Video Search</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
