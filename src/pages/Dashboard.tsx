import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, type MoodLog, type JournalEntry } from '../lib/supabase';
import {
  TrendingUp, BookOpen, Target, Zap, Brain, Heart,
  BarChart2, Sun, Moon, Wind, Flame, Plus, ChevronRight,
  ArrowUp, ArrowDown, Minus, Sparkles, MessageCircle, Users, Stethoscope
} from 'lucide-react';

type DashboardProps = {
  setCurrentPage: (page: string) => void;
};

const moodEmoji: Record<string, string> = {
  very_happy: '😄', happy: '😊', neutral: '😐', sad: '😔',
  very_sad: '😢', anxious: '😰', angry: '😤', excited: '🤩',
  grateful: '🙏', confused: '😕',
};

const quickActions = [
  { icon: BookOpen, label: 'Write in Journal', page: 'journal', color: 'from-teal-500 to-emerald-500' },
  { icon: BarChart2, label: 'Log Today\'s Mood', page: 'tracker', color: 'from-blue-500 to-cyan-500' },
  { icon: Heart, label: 'Wellness Library', page: 'library', color: 'from-rose-500 to-pink-500' },
  { icon: MessageCircle, label: 'AI Assistant', page: 'chatbot', color: 'from-violet-500 to-purple-500' },
  { icon: Users, label: 'Community', page: 'community', color: 'from-amber-500 to-orange-500' },
  { icon: Stethoscope, label: 'Find Therapist', page: 'therapists', color: 'from-green-500 to-teal-500' },
];

const aiInsights = [
  { text: 'Your mood tends to dip on Tuesday afternoons. Try a 10-minute walking meditation around 2 PM.', icon: Brain },
  { text: 'You\'ve been journaling consistently! Your emotional vocabulary has grown by 34% this month.', icon: TrendingUp },
  { text: 'Your sleep quality score improved when you practiced breathing exercises before bed.', icon: Moon },
  { text: 'The community members in your support group are rooting for you — 3 new supportive reactions!', icon: Users },
];

export default function Dashboard({ setCurrentPage }: DashboardProps) {
  const { user, profile } = useAuth();
  const [recentMoods, setRecentMoods] = useState<MoodLog[]>([]);
  const [recentJournals, setRecentJournals] = useState<JournalEntry[]>([]);
  const [todayMood, setTodayMood] = useState<MoodLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightIndex, setInsightIndex] = useState(0);

  useEffect(() => {
    if (!user) return;
    loadData();
    const interval = setInterval(() => setInsightIndex(i => (i + 1) % aiInsights.length), 5000);
    return () => clearInterval(interval);
  }, [user]);

  async function loadData() {
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

    const [moodsRes, journalsRes, todayRes] = await Promise.all([
      supabase.from('mood_logs').select('*').gte('log_date', sevenDaysAgo).order('log_date', { ascending: false }).limit(7),
      supabase.from('journal_entries').select('id,title,mood,category,created_at,word_count').order('created_at', { ascending: false }).limit(5),
      supabase.from('mood_logs').select('*').eq('log_date', today).maybeSingle(),
    ]);

    if (moodsRes.data) setRecentMoods(moodsRes.data as MoodLog[]);
    if (journalsRes.data) setRecentJournals(journalsRes.data as JournalEntry[]);
    if (todayRes.data) setTodayMood(todayRes.data as MoodLog);
    setLoading(false);
  }

  const avgMood = recentMoods.length > 0
    ? Math.round(recentMoods.reduce((s, m) => s + m.mood_score, 0) / recentMoods.length * 10) / 10
    : null;

  const wellnessScore = profile?.wellness_score ?? 50;
  const streak = profile?.streak_count ?? 0;
  const totalJournals = profile?.total_journal_entries ?? 0;

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();

  function getMoodColor(score: number) {
    if (score >= 8) return 'bg-emerald-400';
    if (score >= 6) return 'bg-teal-400';
    if (score >= 4) return 'bg-amber-400';
    return 'bg-red-400';
  }

  return (
    <div className="page-container space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Good {today.getHours() < 12 ? 'morning' : today.getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className="text-gradient">{profile?.full_name?.split(' ')[0] || 'there'}</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {!todayMood && (
          <button onClick={() => setCurrentPage('tracker')} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Log Today's Mood
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/40 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium ${wellnessScore >= 60 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {wellnessScore >= 60 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {wellnessScore >= 60 ? '+5%' : '-2%'}
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-3">{wellnessScore}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Wellness Score</div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-2">
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 h-1.5 rounded-full" style={{ width: `${wellnessScore}%` }} />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center">
              <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="badge bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">🔥</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-3">{streak}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Day Streak</div>
          <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
            {streak >= 7 ? 'Incredible consistency!' : streak >= 3 ? 'Keep it up!' : 'Start your streak!'}
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-3">{totalJournals}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Journal Entries</div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
            {recentJournals.length > 0 ? `Latest: ${new Date(recentJournals[0]?.created_at).toLocaleDateString()}` : 'Write your first entry'}
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-3">
            {avgMood ? avgMood : '—'}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Avg Mood (7d)</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            {avgMood ? (avgMood >= 7 ? 'Feeling great!' : avgMood >= 5 ? 'Steady progress' : 'Hang in there') : 'Start tracking moods'}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(action.page)}
              className="card p-4 flex flex-col items-center gap-3 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mood Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">7-Day Mood Overview</h2>
            <button onClick={() => setCurrentPage('tracker')} className="text-sm text-teal-600 dark:text-teal-400 font-medium hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-end justify-between gap-2 h-32 mb-3">
            {recentMoods.length > 0 ? (
              [...Array(7)].map((_, i) => {
                const dayDate = new Date(Date.now() - (6 - i) * 86400000);
                const dateStr = dayDate.toISOString().split('T')[0];
                const log = recentMoods.find(m => m.log_date === dateStr);
                const score = log?.mood_score ?? 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full relative group">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-700 ${score > 0 ? getMoodColor(score) : 'bg-gray-100 dark:bg-gray-700'}`}
                        style={{ height: score > 0 ? `${(score / 10) * 100}%` : '8px', minHeight: '8px' }}
                      />
                      {score > 0 && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {score}/10
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full flex items-center justify-center text-gray-400 text-sm col-span-7">
                <div className="text-center">
                  <BarChart2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No mood data yet</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            {[...Array(7)].map((_, i) => {
              const d = new Date(Date.now() - (6 - i) * 86400000);
              return (
                <div key={i} className="flex-1 text-center text-xs text-gray-400 dark:text-gray-500">
                  {weekDays[d.getDay() === 0 ? 6 : d.getDay() - 1]}
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insight */}
        <div className="card p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Personalized for you</p>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {aiInsights.map((insight, i) => (
              <div key={i} className={`p-4 rounded-xl transition-all duration-500 ${i === insightIndex ? 'bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/50 scale-100' : 'opacity-40 scale-95'}`}>
                <div className="flex items-start gap-3">
                  <insight.icon className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{insight.text}</p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setCurrentPage('chatbot')} className="mt-4 btn-primary text-sm flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" /> Chat with AI Assistant
          </button>
        </div>
      </div>

      {/* Recent Journal & Today's Wellness */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Journal */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Journal Entries</h2>
            <button onClick={() => setCurrentPage('journal')} className="text-sm text-teal-600 dark:text-teal-400 font-medium hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {recentJournals.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">No journal entries yet</p>
              <button onClick={() => setCurrentPage('journal')} className="mt-3 btn-primary text-sm">Write First Entry</button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJournals.slice(0, 4).map(entry => (
                <div key={entry.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => setCurrentPage('journal')}>
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/40 dark:to-emerald-900/40 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {entry.mood ? moodEmoji[entry.mood] || '📝' : '📝'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{entry.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(entry.created_at).toLocaleDateString()} · {entry.word_count} words
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Wellness */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Wellness</h2>
            <button onClick={() => setCurrentPage('tracker')} className="text-sm text-teal-600 dark:text-teal-400 font-medium hover:underline">
              {todayMood ? 'Edit' : 'Log now'}
            </button>
          </div>

          {!todayMood ? (
            <div className="text-center py-8">
              <Sun className="w-12 h-12 mx-auto mb-3 text-amber-400" />
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">How are you feeling today?</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Track your mood to understand your patterns</p>
              <button onClick={() => setCurrentPage('tracker')} className="btn-primary text-sm">Log Today's Mood</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
                <div className="text-4xl">{todayMood.mood_score >= 8 ? '😄' : todayMood.mood_score >= 6 ? '😊' : todayMood.mood_score >= 4 ? '😐' : '😔'}</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Mood Score: {todayMood.mood_score}/10</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Logged today</p>
                </div>
              </div>
              {[
                { icon: Wind, label: 'Stress', value: todayMood.stress_level, color: 'text-amber-500' },
                { icon: Moon, label: 'Sleep', value: todayMood.sleep_quality, color: 'text-blue-500' },
                { icon: Zap, label: 'Energy', value: todayMood.energy_level, color: 'text-emerald-500' },
              ].filter(m => m.value != null).map(metric => (
                <div key={metric.label} className="flex items-center gap-3">
                  <metric.icon className={`w-5 h-5 ${metric.color} flex-shrink-0`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-16">{metric.label}</span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                    <div className={`h-2 rounded-full ${metric.color.replace('text-', 'bg-')}`} style={{ width: `${((metric.value ?? 0) / 10) * 100}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8 text-right">{metric.value}/10</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommended Activities */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recommended For You</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Based on your wellness patterns</p>
            </div>
          </div>
          <button onClick={() => setCurrentPage('library')} className="text-sm text-teal-600 dark:text-teal-400 font-medium hover:underline flex items-center gap-1">
            Browse all <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: '5-Min Box Breathing', time: '5 min', category: 'breathing', img: 'https://images.pexels.com/photos/3820312/pexels-photo-3820312.jpeg', goal: 'Reduce stress now' },
            { title: 'Morning Sun Salutation', time: '15 min', category: 'yoga', img: 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg', goal: 'Boost energy' },
            { title: 'Loving Kindness Meditation', time: '15 min', category: 'meditation', img: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg', goal: 'Build compassion' },
          ].map((act, i) => (
            <button key={i} onClick={() => setCurrentPage('library')} className="text-left rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
              <div className="relative h-32 overflow-hidden">
                <img src={act.img} alt={act.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-3">
                  <span className="badge bg-white/20 text-white backdrop-blur-sm text-xs capitalize">{act.category}</span>
                </div>
              </div>
              <div className="p-3">
                <p className="font-medium text-gray-900 dark:text-white text-sm">{act.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{act.time}</span>
                  <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">{act.goal}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
