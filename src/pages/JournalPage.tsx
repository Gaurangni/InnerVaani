import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, type JournalEntry } from '../lib/supabase';
import {
  Plus, Search, Filter, Edit3, Trash2, X, Save,
  Sparkles, Tag, Lock, Unlock, Calendar, Loader2,
  ChevronDown, BookOpen, TrendingUp, BarChart2,
  Heart, Brain, AlertTriangle, Smile, Frown, Meh
} from 'lucide-react';

const MOODS = [
  { value: 'very_happy', label: 'Very Happy', emoji: '😄', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' },
  { value: 'happy', label: 'Happy', emoji: '😊', color: 'text-green-600 bg-green-50 dark:bg-green-900/30' },
  { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
  { value: 'sad', label: 'Sad', emoji: '😔', color: 'text-slate-600 bg-slate-50 dark:bg-slate-800' },
  { value: 'very_sad', label: 'Very Sad', emoji: '😢', color: 'text-gray-600 bg-gray-50 dark:bg-gray-800' },
  { value: 'anxious', label: 'Anxious', emoji: '😰', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
  { value: 'angry', label: 'Angry', emoji: '😤', color: 'text-red-600 bg-red-50 dark:bg-red-900/30' },
  { value: 'excited', label: 'Excited', emoji: '🤩', color: 'text-violet-600 bg-violet-50 dark:bg-violet-900/30' },
  { value: 'grateful', label: 'Grateful', emoji: '🙏', color: 'text-pink-600 bg-pink-50 dark:bg-pink-900/30' },
  { value: 'confused', label: 'Confused', emoji: '😕', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30' },
];

const CATEGORIES = ['general', 'gratitude', 'reflection', 'goals', 'anxiety', 'relationships', 'work', 'health', 'creativity'];

function analyzeText(text: string): {
  sentiment: string;
  summary: string;
  emotions: Record<string, number>;
  suggestions: string[];
  stressLevel: number;
  confidenceLevel: number;
} {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).length;

  const positiveWords = ['happy', 'joy', 'grateful', 'love', 'wonderful', 'amazing', 'great', 'excited', 'peaceful', 'calm', 'hopeful', 'proud', 'blessed', 'thankful', 'content'];
  const negativeWords = ['sad', 'angry', 'fear', 'anxious', 'worried', 'stress', 'depressed', 'lonely', 'hopeless', 'frustrated', 'overwhelmed', 'tired', 'exhausted', 'hurt', 'painful'];
  const anxietyWords = ['nervous', 'scared', 'panic', 'anxious', 'worried', 'fear', 'dread', 'apprehensive', 'uneasy', 'restless'];
  const confidenceWords = ['confident', 'strong', 'capable', 'proud', 'achieved', 'accomplished', 'success', 'determined', 'motivated'];

  const posScore = positiveWords.filter(w => lower.includes(w)).length;
  const negScore = negativeWords.filter(w => lower.includes(w)).length;
  const anxScore = anxietyWords.filter(w => lower.includes(w)).length;
  const confScore = confidenceWords.filter(w => lower.includes(w)).length;

  const sentiment = posScore > negScore * 1.5 ? 'positive' : negScore > posScore * 1.5 ? 'negative' : 'neutral';
  const stressLevel = Math.min(10, Math.round(2 + (negScore + anxScore) * 1.2));
  const confidenceLevel = Math.min(10, Math.round(3 + confScore * 1.5 + posScore * 0.5));

  const emotions: Record<string, number> = {
    joy: Math.min(1, posScore / 5),
    sadness: Math.min(1, negScore / 5),
    anxiety: Math.min(1, anxScore / 4),
    confidence: Math.min(1, confScore / 3),
    gratitude: lower.includes('grateful') || lower.includes('thankful') ? 0.8 : 0.1,
  };

  const summaries = {
    positive: 'Your entry reflects positive emotions and optimism. You seem to be in a good mental space.',
    negative: 'Your entry carries some emotional weight. It\'s important to acknowledge these feelings.',
    neutral: 'Your entry is balanced and reflective. You\'re processing your thoughts thoughtfully.',
  };

  const allSuggestions = {
    positive: [
      'Build on this positive momentum with a 10-minute gratitude practice',
      'Share your positive energy with someone in the community',
      'Set a new wellness goal while motivation is high',
    ],
    negative: [
      'Try the 5-minute box breathing exercise to calm your nervous system',
      'Consider reaching out to a trusted friend or our AI assistant',
      'A gentle yoga flow might help release emotional tension',
      'Writing more about what you feel can bring clarity and relief',
    ],
    neutral: [
      'Great reflection! A body scan meditation can deepen your self-awareness',
      'Consider exploring the community for shared perspectives',
      'Set a small, achievable goal for tomorrow',
    ],
  };

  return {
    sentiment,
    summary: summaries[sentiment as keyof typeof summaries],
    emotions,
    suggestions: allSuggestions[sentiment as keyof typeof allSuggestions],
    stressLevel,
    confidenceLevel,
  };
}

export default function JournalPage() {
  const { user, updateProfile, profile } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [search, setSearch] = useState('');
  const [filterMood, setFilterMood] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiResult, setAiResult] = useState<ReturnType<typeof analyzeText> | null>(null);

  const [form, setForm] = useState({
    title: '', content: '', mood: '', category: 'general', tags: '', is_private: true,
  });

  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (user) loadEntries(); }, [user]);

  async function loadEntries() {
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setEntries(data as JournalEntry[]);
    setLoading(false);
  }

  function openNewEntry() {
    setForm({ title: '', content: '', mood: '', category: 'general', tags: '', is_private: true });
    setEditingEntry(null);
    setAiResult(null);
    setShowAI(false);
    setShowEditor(true);
    setTimeout(() => contentRef.current?.focus(), 100);
  }

  function openEditEntry(entry: JournalEntry) {
    setForm({
      title: entry.title,
      content: entry.content,
      mood: entry.mood || '',
      category: entry.category,
      tags: entry.tags.join(', '),
      is_private: entry.is_private,
    });
    setEditingEntry(entry);
    setAiResult(entry.ai_emotion_score ? {
      sentiment: entry.ai_sentiment || 'neutral',
      summary: entry.ai_summary || '',
      emotions: entry.ai_emotion_score as Record<string, number>,
      suggestions: entry.ai_suggestions || [],
      stressLevel: entry.ai_stress_level || 5,
      confidenceLevel: entry.ai_confidence_level || 5,
    } : null);
    setShowAI(!!entry.ai_summary);
    setShowEditor(true);
  }

  function runAIAnalysis() {
    if (!form.content.trim()) return;
    const result = analyzeText(form.content);
    setAiResult(result);
    setShowAI(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);

    const analysis = analyzeText(form.content);
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    const wordCount = form.content.split(/\s+/).filter(Boolean).length;

    const payload = {
      title: form.title,
      content: form.content,
      mood: form.mood || null,
      category: form.category,
      tags,
      is_private: form.is_private,
      word_count: wordCount,
      ai_emotion_score: analysis.emotions,
      ai_sentiment: analysis.sentiment,
      ai_summary: analysis.summary,
      ai_suggestions: analysis.suggestions,
      ai_stress_level: analysis.stressLevel,
      ai_confidence_level: analysis.confidenceLevel,
    };

    if (editingEntry) {
      await supabase.from('journal_entries').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editingEntry.id);
    } else {
      await supabase.from('journal_entries').insert(payload);
      await updateProfile({ total_journal_entries: (profile?.total_journal_entries ?? 0) + 1 });
    }

    await loadEntries();
    setSaving(false);
    setShowEditor(false);
  }

  async function handleDelete(id: string) {
    await supabase.from('journal_entries').delete().eq('id', id);
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  const filtered = entries.filter(e => {
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.content.toLowerCase().includes(search.toLowerCase());
    const matchMood = !filterMood || e.mood === filterMood;
    const matchCat = !filterCategory || e.category === filterCategory;
    return matchSearch && matchMood && matchCat;
  });

  const moodObj = MOODS.find(m => m.value === form.mood);
  const sentimentIcon = aiResult?.sentiment === 'positive' ? Smile : aiResult?.sentiment === 'negative' ? Frown : Meh;

  if (showEditor) {
    return (
      <div className="page-container max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} disabled={saving || !form.title || !form.content} className="btn-primary flex items-center gap-2 text-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Entry'}
            </button>
            <button onClick={() => setShowEditor(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <input
              type="text" placeholder="Give your entry a meaningful title..."
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="input-field text-xl font-semibold"
            />

            <textarea
              ref={contentRef}
              placeholder="What's on your mind? Write freely — this is your safe space. The more you express, the better our AI can understand and support you..."
              value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              className="input-field min-h-[320px] resize-none leading-relaxed"
            />

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <input
                  type="text" placeholder="Tags (comma separated)"
                  value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  className="input-field w-auto text-sm py-2"
                />
              </div>
              <button onClick={() => setForm(f => ({ ...f, is_private: !f.is_private }))} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${form.is_private ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' : 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'}`}>
                {form.is_private ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                {form.is_private ? 'Private' : 'Shared'}
              </button>
            </div>

            <div className="text-xs text-gray-400 dark:text-gray-500">
              {form.content.split(/\s+/).filter(Boolean).length} words · {form.content.length} characters
            </div>
          </div>

          <div className="space-y-4">
            {/* Mood */}
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">How are you feeling?</h3>
              <div className="grid grid-cols-5 gap-2">
                {MOODS.map(mood => (
                  <button key={mood.value} onClick={() => setForm(f => ({ ...f, mood: f.mood === mood.value ? '' : mood.value }))}
                    title={mood.label}
                    className={`text-2xl p-2 rounded-xl transition-all hover:scale-110 ${form.mood === mood.value ? 'bg-teal-100 dark:bg-teal-900/40 ring-2 ring-teal-500 scale-110' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    {mood.emoji}
                  </button>
                ))}
              </div>
              {moodObj && <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-2 font-medium">{moodObj.label}</p>}
            </div>

            {/* Category */}
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Category</h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setForm(f => ({ ...f, category: cat }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${form.category === cat ? 'bg-teal-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-teal-50 dark:hover:bg-teal-900/20'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Analysis */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-500" /> AI Analysis
                </h3>
                <button onClick={runAIAnalysis} disabled={!form.content.trim()}
                  className="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline disabled:opacity-40">
                  Analyze
                </button>
              </div>

              {!showAI ? (
                <p className="text-xs text-gray-400 dark:text-gray-500">Write your entry and click Analyze to get AI insights about your emotional state.</p>
              ) : aiResult ? (
                <div className="space-y-3">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${aiResult.sentiment === 'positive' ? 'bg-emerald-50 dark:bg-emerald-900/20' : aiResult.sentiment === 'negative' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                    {React.createElement(sentimentIcon, { className: `w-4 h-4 ${aiResult.sentiment === 'positive' ? 'text-emerald-600' : aiResult.sentiment === 'negative' ? 'text-red-500' : 'text-blue-500'}` })}
                    <span className="text-xs font-medium capitalize text-gray-700 dark:text-gray-300">
                      {aiResult.sentiment} sentiment
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{aiResult.summary}</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Stress</span>
                      <span className="font-medium">{aiResult.stressLevel}/10</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                      <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${aiResult.stressLevel * 10}%` }} />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Confidence</span>
                      <span className="font-medium">{aiResult.confidenceLevel}/10</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                      <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: `${aiResult.confidenceLevel * 10}%` }} />
                    </div>
                  </div>
                  {aiResult.suggestions.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Suggestions:</p>
                      <ul className="space-y-1">
                        {aiResult.suggestions.slice(0, 2).map((s, i) => (
                          <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                            <span className="text-teal-500 mt-0.5 flex-shrink-0">•</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Journal</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{entries.length} entries · {entries.reduce((s, e) => s + e.word_count, 0).toLocaleString()} words</p>
        </div>
        <button onClick={openNewEntry} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Entry
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Entries', value: entries.length, icon: BookOpen, color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20' },
          { label: 'Words Written', value: entries.reduce((s, e) => s + e.word_count, 0).toLocaleString(), icon: Edit3, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
          { label: 'This Month', value: entries.filter(e => new Date(e.created_at).getMonth() === new Date().getMonth()).length, icon: Calendar, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Avg Stress', value: entries.filter(e => e.ai_stress_level).length > 0 ? Math.round(entries.filter(e => e.ai_stress_level).reduce((s, e) => s + (e.ai_stress_level ?? 0), 0) / entries.filter(e => e.ai_stress_level).length * 10) / 10 : '—', icon: Brain, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
        ].map((stat, i) => (
          <div key={i} className="card p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search entries..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10 py-2.5" />
        </div>
        <select value={filterMood} onChange={e => setFilterMood(e.target.value)} className="input-field w-auto py-2.5 text-sm">
          <option value="">All Moods</option>
          {MOODS.map(m => <option key={m.value} value={m.value}>{m.emoji} {m.label}</option>)}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="input-field w-auto py-2.5 text-sm capitalize">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
        </select>
        {(search || filterMood || filterCategory) && (
          <button onClick={() => { setSearch(''); setFilterMood(''); setFilterCategory(''); }} className="btn-ghost text-sm flex items-center gap-1">
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Entries */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {entries.length === 0 ? 'Your journey begins here' : 'No matching entries'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            {entries.length === 0 ? 'Writing in your journal is one of the most powerful things you can do for your mental health.' : 'Try adjusting your search filters.'}
          </p>
          {entries.length === 0 && <button onClick={openNewEntry} className="btn-primary">Write Your First Entry</button>}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(entry => {
            const mood = MOODS.find(m => m.value === entry.mood);
            return (
              <div key={entry.id} className="card p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors cursor-pointer" onClick={() => openEditEntry(entry)}>
                      {entry.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {entry.word_count} words
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditEntry(entry)} className="p-1.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 text-gray-400 hover:text-teal-600 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(entry.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3 line-clamp-3">{entry.content}</p>

                <div className="flex items-center gap-2 flex-wrap">
                  {mood && (
                    <span className={`mood-chip ${mood.color} text-xs`}>{mood.emoji} {mood.label}</span>
                  )}
                  <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 capitalize">{entry.category}</span>
                  {entry.ai_sentiment && (
                    <span className={`badge text-xs ${entry.ai_sentiment === 'positive' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : entry.ai_sentiment === 'negative' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                      AI: {entry.ai_sentiment}
                    </span>
                  )}
                  {entry.is_private && <Lock className="w-3.5 h-3.5 text-gray-400" />}
                </div>

                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 rounded-full">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
