import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, type MoodLog } from '../lib/supabase';
import {
  Plus, TrendingUp, TrendingDown, Minus, Calendar,
  Moon, Sun, Zap, Wind, Brain, Activity, Loader2,
  ChevronLeft, ChevronRight, BarChart2, Target, Check
} from 'lucide-react';

const EMOTIONS = [
  'Happy', 'Calm', 'Grateful', 'Hopeful', 'Confident',
  'Sad', 'Anxious', 'Frustrated', 'Lonely', 'Overwhelmed',
  'Excited', 'Motivated', 'Peaceful', 'Confused', 'Tired',
];

type LogFormData = {
  mood_score: number;
  stress_level: number;
  sleep_hours: number;
  sleep_quality: number;
  energy_level: number;
  anxiety_level: number;
  productivity_level: number;
  emotions: string[];
  notes: string;
  activities_done: string[];
};

const defaultForm: LogFormData = {
  mood_score: 5, stress_level: 5, sleep_hours: 7,
  sleep_quality: 5, energy_level: 5, anxiety_level: 3,
  productivity_level: 5, emotions: [], notes: '',
  activities_done: [],
};

const ACTIVITIES = ['Yoga', 'Meditation', 'Exercise', 'Journaling', 'Reading', 'Walking', 'Breathing', 'Social', 'Creative', 'Rest'];

function ScaleInput({ label, icon: Icon, value, onChange, color = 'teal', description }: {
  label: string; icon: React.ElementType; value: number;
  onChange: (v: number) => void; color?: string; description?: string;
}) {
  const colorMap: Record<string, string> = {
    teal: 'bg-teal-500', blue: 'bg-blue-500', amber: 'bg-amber-500',
    green: 'bg-green-500', red: 'bg-red-500', violet: 'bg-violet-500',
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 text-${color}-500`} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        </div>
        <span className="text-sm font-bold text-gray-900 dark:text-white">{value}/10</span>
      </div>
      <input
        type="range" min="1" max="10" value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: color === 'teal' ? '#14b8a6' : color === 'amber' ? '#f59e0b' : color === 'red' ? '#ef4444' : '#14b8a6' }}
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>Low</span>
        {description && <span className="text-center text-teal-600 dark:text-teal-400 font-medium">{description}</span>}
        <span>High</span>
      </div>
    </div>
  );
}

export default function MoodTrackerPage() {
  const { user, updateProfile, profile } = useAuth();
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<LogFormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [todayLog, setTodayLog] = useState<MoodLog | null>(null);
  const [activeTab, setActiveTab] = useState<'week' | 'month'>('week');

  useEffect(() => { if (user) loadLogs(); }, [user]);

  async function loadLogs() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('mood_logs').select('*').gte('log_date', thirtyDaysAgo).order('log_date', { ascending: false });
    if (data) {
      setLogs(data as MoodLog[]);
      const todayData = (data as MoodLog[]).find(l => l.log_date === today);
      setTodayLog(todayData ?? null);
      if (todayData) {
        setForm({
          mood_score: todayData.mood_score,
          stress_level: todayData.stress_level ?? 5,
          sleep_hours: todayData.sleep_hours ?? 7,
          sleep_quality: todayData.sleep_quality ?? 5,
          energy_level: todayData.energy_level ?? 5,
          anxiety_level: todayData.anxiety_level ?? 3,
          productivity_level: todayData.productivity_level ?? 5,
          emotions: todayData.emotions ?? [],
          notes: todayData.notes ?? '',
          activities_done: todayData.activities_done ?? [],
        });
      }
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    const today = new Date().toISOString().split('T')[0];
    const payload = { ...form, log_date: today };

    if (todayLog) {
      await supabase.from('mood_logs').update(payload).eq('id', todayLog.id);
    } else {
      await supabase.from('mood_logs').insert(payload);
      await updateProfile({ streak_count: (profile?.streak_count ?? 0) + 1 });
    }

    await loadLogs();
    setSaving(false);
    setShowForm(false);
  }

  function toggleEmotion(emotion: string) {
    setForm(f => ({
      ...f, emotions: f.emotions.includes(emotion)
        ? f.emotions.filter(e => e !== emotion)
        : [...f.emotions, emotion]
    }));
  }

  function toggleActivity(activity: string) {
    setForm(f => ({
      ...f, activities_done: f.activities_done.includes(activity)
        ? f.activities_done.filter(a => a !== activity)
        : [...f.activities_done, activity]
    }));
  }

  const displayLogs = activeTab === 'week' ? logs.slice(0, 7) : logs;

  const avgMood = logs.length > 0 ? (logs.reduce((s, l) => s + l.mood_score, 0) / logs.length).toFixed(1) : '—';
  const avgStress = logs.filter(l => l.stress_level).length > 0
    ? (logs.filter(l => l.stress_level).reduce((s, l) => s + (l.stress_level ?? 0), 0) / logs.filter(l => l.stress_level).length).toFixed(1)
    : '—';
  const avgSleep = logs.filter(l => l.sleep_hours).length > 0
    ? (logs.filter(l => l.sleep_hours).reduce((s, l) => s + (l.sleep_hours ?? 0), 0) / logs.filter(l => l.sleep_hours).length).toFixed(1)
    : '—';

  const moodEmoji = form.mood_score >= 9 ? '😄' : form.mood_score >= 7 ? '😊' : form.mood_score >= 5 ? '😐' : form.mood_score >= 3 ? '😔' : '😢';

  if (showForm) {
    return (
      <div className="page-container max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {todayLog ? 'Update Today\'s Log' : 'Log Today\'s Mood'}
          </h1>
          <button onClick={() => setShowForm(false)} className="btn-ghost text-sm">Cancel</button>
        </div>

        <div className="space-y-6">
          {/* Mood Score */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
              How are you feeling today? <span className="text-3xl ml-2">{moodEmoji}</span>
            </h3>
            <div className="text-center mb-4">
              <span className="text-6xl font-bold text-gradient">{form.mood_score}</span>
              <span className="text-2xl text-gray-400">/10</span>
            </div>
            <input type="range" min="1" max="10" value={form.mood_score}
              onChange={e => setForm(f => ({ ...f, mood_score: parseInt(e.target.value) }))}
              className="w-full h-3 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#14b8a6' }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>😢 Very Low</span>
              <span>😊 Great</span>
              <span>😄 Amazing</span>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="card p-6 space-y-5">
            <h3 className="font-semibold text-gray-900 dark:text-white">Wellness Metrics</h3>
            <ScaleInput label="Stress Level" icon={Wind} value={form.stress_level} onChange={v => setForm(f => ({ ...f, stress_level: v }))} color="amber" />
            <ScaleInput label="Energy Level" icon={Zap} value={form.energy_level} onChange={v => setForm(f => ({ ...f, energy_level: v }))} color="green" />
            <ScaleInput label="Anxiety Level" icon={Brain} value={form.anxiety_level} onChange={v => setForm(f => ({ ...f, anxiety_level: v }))} color="red" />
            <ScaleInput label="Productivity" icon={Target} value={form.productivity_level} onChange={v => setForm(f => ({ ...f, productivity_level: v }))} color="teal" />
          </div>

          {/* Sleep */}
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Sleep</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block flex items-center gap-2">
                  <Moon className="w-4 h-4 text-blue-500" /> Hours slept
                </label>
                <input type="number" min="0" max="24" step="0.5" value={form.sleep_hours}
                  onChange={e => setForm(f => ({ ...f, sleep_hours: parseFloat(e.target.value) || 0 }))}
                  className="input-field" />
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" /> Sleep quality
                </label>
                <input type="range" min="1" max="10" value={form.sleep_quality}
                  onChange={e => setForm(f => ({ ...f, sleep_quality: parseInt(e.target.value) }))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer mt-3"
                  style={{ accentColor: '#14b8a6' }} />
                <div className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">{form.sleep_quality}/10</div>
              </div>
            </div>
          </div>

          {/* Emotions */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Emotions you felt today</h3>
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map(emotion => (
                <button key={emotion} onClick={() => toggleEmotion(emotion)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    form.emotions.includes(emotion)
                      ? 'bg-teal-500 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                  }`}>
                  {emotion}
                </button>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Wellness activities done</h3>
            <div className="flex flex-wrap gap-2">
              {ACTIVITIES.map(activity => (
                <button key={activity} onClick={() => toggleActivity(activity)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    form.activities_done.includes(activity)
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                  }`}>
                  {form.activities_done.includes(activity) && <Check className="w-3 h-3" />}
                  {activity}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Additional Notes</h3>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Any specific events, thoughts, or observations about today..."
              className="input-field min-h-[100px] resize-none"
            />
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            {saving ? 'Saving...' : 'Save Today\'s Log'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mood Tracker</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Track your emotional patterns over time</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> {todayLog ? 'Update Today' : 'Log Today'}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg Mood (30d)', value: avgMood, icon: Activity, color: 'teal', suffix: '/10' },
          { label: 'Avg Stress', value: avgStress, icon: Wind, color: 'amber', suffix: '/10' },
          { label: 'Avg Sleep', value: avgSleep, icon: Moon, color: 'blue', suffix: 'h' },
          { label: 'Days Logged', value: logs.length, icon: Calendar, color: 'emerald', suffix: '' },
        ].map((stat, i) => (
          <div key={i} className="card p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color === 'teal' ? 'bg-teal-100 dark:bg-teal-900/30' : stat.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30' : stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
              <stat.icon className={`w-5 h-5 ${stat.color === 'teal' ? 'text-teal-600' : stat.color === 'amber' ? 'text-amber-600' : stat.color === 'blue' ? 'text-blue-600' : 'text-emerald-600'}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}{stat.suffix && typeof stat.value === 'number' && stat.suffix}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Today's status */}
      {todayLog && (
        <div className="card p-6 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border-teal-100 dark:border-teal-800/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500" /> Today's Log Saved
            </h2>
            <button onClick={() => setShowForm(true)} className="text-sm text-teal-600 dark:text-teal-400 font-medium hover:underline">Edit</button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {[
              { label: 'Mood', value: todayLog.mood_score, emoji: todayLog.mood_score >= 7 ? '😊' : '😐' },
              { label: 'Stress', value: todayLog.stress_level ?? '—' },
              { label: 'Energy', value: todayLog.energy_level ?? '—' },
              { label: 'Sleep', value: `${todayLog.sleep_hours ?? '—'}h` },
              { label: 'Anxiety', value: todayLog.anxiety_level ?? '—' },
              { label: 'Focus', value: todayLog.productivity_level ?? '—' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {'emoji' in item ? item.emoji : item.value}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
                {'emoji' in item && <div className="text-xs font-medium text-teal-600 dark:text-teal-400">{item.value}/10</div>}
              </div>
            ))}
          </div>
          {todayLog.emotions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {todayLog.emotions.map(e => (
                <span key={e} className="badge bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">{e}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mood Trend</h2>
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {(['week', 'month'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm font-medium transition-colors ${activeTab === tab ? 'bg-teal-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                {tab === 'week' ? '7 days' : '30 days'}
              </button>
            ))}
          </div>
        </div>

        {displayLogs.length === 0 ? (
          <div className="text-center py-12">
            <BarChart2 className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">No data yet. Start logging your moods!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[400px]">
              <div className="flex items-end gap-2 h-40 mb-2">
                {displayLogs.slice().reverse().map((log, i) => (
                  <div key={log.id} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      {log.log_date}: Mood {log.mood_score}/10
                    </div>
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${log.mood_score >= 7 ? 'bg-emerald-400' : log.mood_score >= 5 ? 'bg-teal-400' : log.mood_score >= 3 ? 'bg-amber-400' : 'bg-red-400'}`}
                      style={{ height: `${(log.mood_score / 10) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                {displayLogs.slice().reverse().map(log => (
                  <div key={log.id} className="flex-1 text-center text-xs text-gray-400 truncate">
                    {new Date(log.log_date + 'T00:00:00').toLocaleDateString('en', { month: 'numeric', day: 'numeric' })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent logs table */}
      {logs.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Logs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  {['Date', 'Mood', 'Stress', 'Energy', 'Sleep', 'Emotions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {logs.slice(0, 10).map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(log.log_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${log.mood_score >= 7 ? 'bg-emerald-400' : log.mood_score >= 5 ? 'bg-teal-400' : log.mood_score >= 3 ? 'bg-amber-400' : 'bg-red-400'}`} />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{log.mood_score}/10</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{log.stress_level ?? '—'}/10</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{log.energy_level ?? '—'}/10</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{log.sleep_hours ? `${log.sleep_hours}h` : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {log.emotions.slice(0, 2).map(e => (
                          <span key={e} className="badge bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs">{e}</span>
                        ))}
                        {log.emotions.length > 2 && <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs">+{log.emotions.length - 2}</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
