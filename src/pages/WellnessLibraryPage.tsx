import React, { useEffect, useState } from 'react';
import { supabase, type WellnessActivity } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Search, Filter, Star, Clock, Play, Check, ChevronDown,
  Loader2, X, Heart, Award, Zap, Wind, Brain, BookOpen, Dumbbell, Smile
} from 'lucide-react';

const CATEGORIES = ['all', 'yoga', 'meditation', 'breathing', 'mindfulness', 'relaxation', 'journaling', 'exercise'];
const DIFFICULTIES = ['all', 'beginner', 'intermediate', 'advanced'];

const categoryIcons: Record<string, React.ElementType> = {
  yoga: Dumbbell, meditation: Brain, breathing: Wind,
  mindfulness: Smile, relaxation: Heart, journaling: BookOpen,
  exercise: Zap, all: Star,
};

const categoryColors: Record<string, string> = {
  yoga: 'from-orange-400 to-rose-500',
  meditation: 'from-violet-400 to-purple-500',
  breathing: 'from-cyan-400 to-blue-500',
  mindfulness: 'from-teal-400 to-emerald-500',
  relaxation: 'from-pink-400 to-rose-400',
  journaling: 'from-amber-400 to-orange-400',
  exercise: 'from-green-400 to-teal-500',
};

type ActivityModalProps = {
  activity: WellnessActivity;
  onClose: () => void;
  onComplete: (id: string) => void;
};

function ActivityModal({ activity, onClose, onComplete }: ActivityModalProps) {
  const cat = categoryColors[activity.category] || 'from-teal-400 to-emerald-500';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className={`relative h-48 bg-gradient-to-br ${cat} overflow-hidden`}>
          {activity.thumbnail_url && (
            <img src={activity.thumbnail_url} alt={activity.title} className="w-full h-full object-cover opacity-40" />
          )}
          <div className="absolute inset-0 flex items-end p-6">
            <div>
              <span className="badge bg-white/20 text-white text-xs capitalize mb-2">{activity.category}</span>
              <h2 className="text-2xl font-bold text-white">{activity.title}</h2>
            </div>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{activity.duration_minutes} min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{activity.difficulty}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{activity.avg_rating} ({activity.total_ratings})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{activity.completions_count} completions</span>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{activity.description}</p>

          {activity.mental_health_goals.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Mental Health Goals</h3>
              <div className="flex flex-wrap gap-2">
                {activity.mental_health_goals.map(goal => (
                  <span key={goal} className="badge bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 capitalize">{goal}</span>
                ))}
              </div>
            </div>
          )}

          {activity.benefits.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Benefits</h3>
              <ul className="space-y-1.5">
                {activity.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activity.instructions.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">How to Practice</h3>
              <ol className="space-y-2">
                {activity.instructions.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <button onClick={() => { onComplete(activity.id); onClose(); }} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
            <Play className="w-5 h-5" /> Mark as Completed
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WellnessLibraryPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<WellnessActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState<WellnessActivity | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => { loadActivities(); }, []);
  useEffect(() => { if (user) loadCompletions(); }, [user]);

  async function loadActivities() {
    const { data } = await supabase.from('wellness_activities').select('*').order('is_featured', { ascending: false });
    if (data) setActivities(data as WellnessActivity[]);
    setLoading(false);
  }

  async function loadCompletions() {
    const { data } = await supabase.from('activity_completions').select('activity_id').order('completed_at', { ascending: false });
    if (data) setCompletedIds(new Set(data.map((c: { activity_id: string }) => c.activity_id)));
  }

  async function handleComplete(activityId: string) {
    if (!user) return;
    await supabase.from('activity_completions').insert({ activity_id: activityId });
    setCompletedIds(prev => new Set([...prev, activityId]));
    await supabase.from('wellness_activities').update({ completions_count: activities.find(a => a.id === activityId)!.completions_count + 1 }).eq('id', activityId);
  }

  const filtered = activities.filter(a => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || (a.description ?? '').toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || a.category === category;
    const matchDiff = difficulty === 'all' || a.difficulty === difficulty;
    return matchSearch && matchCat && matchDiff;
  });

  const featured = activities.filter(a => a.is_featured);

  return (
    <div className="page-container space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wellness Library</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Curated practices to support your mental wellness journey</p>
      </div>

      {/* Featured */}
      {!search && category === 'all' && featured.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Featured Practices</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.slice(0, 3).map(activity => {
              const cat = categoryColors[activity.category] || 'from-teal-400 to-emerald-500';
              const Icon = categoryIcons[activity.category] || Star;
              return (
                <button key={activity.id} onClick={() => setSelectedActivity(activity)} className="text-left rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`relative h-40 bg-gradient-to-br ${cat}`}>
                    {activity.thumbnail_url && (
                      <img src={activity.thumbnail_url} alt={activity.title} className="w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-300" />
                    )}
                    <div className="absolute inset-0 p-5 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className={`w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        {completedIds.has(activity.id) && (
                          <span className="badge bg-white/20 text-white text-xs backdrop-blur-sm">
                            <Check className="w-3 h-3 mr-1 inline" /> Done
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="badge bg-white/20 text-white text-xs capitalize mb-1">{activity.category}</span>
                        <h3 className="font-bold text-white text-lg leading-tight">{activity.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-white/80 text-xs">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {activity.duration_minutes} min</span>
                          <span className="capitalize">{activity.difficulty}</span>
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-white" /> {activity.avg_rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search activities..."
            className="input-field pl-10 py-2.5" />
        </div>
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="input-field w-auto py-2.5 text-sm capitalize">
          {DIFFICULTIES.map(d => <option key={d} value={d} className="capitalize">{d === 'all' ? 'All Levels' : d}</option>)}
        </select>
        {(search || category !== 'all' || difficulty !== 'all') && (
          <button onClick={() => { setSearch(''); setCategory('all'); setDifficulty('all'); }} className="btn-ghost text-sm flex items-center gap-1">
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {CATEGORIES.map(cat => {
          const Icon = categoryIcons[cat] || Star;
          return (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                category === cat
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700'
              }`}>
              <Icon className="w-4 h-4" />
              <span className="capitalize">{cat === 'all' ? 'All' : cat}</span>
            </button>
          );
        })}
      </div>

      {/* Activity Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No activities found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(activity => {
            const Icon = categoryIcons[activity.category] || Star;
            const cat = categoryColors[activity.category] || 'from-teal-400 to-emerald-500';
            const isCompleted = completedIds.has(activity.id);
            return (
              <button key={activity.id} onClick={() => setSelectedActivity(activity)}
                className="text-left card overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group">
                <div className="relative h-36 overflow-hidden">
                  {activity.thumbnail_url ? (
                    <img src={activity.thumbnail_url} alt={activity.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${cat} flex items-center justify-center`}>
                      <Icon className="w-10 h-10 text-white/60" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {isCompleted && (
                    <div className="absolute top-2 right-2 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {activity.is_featured && (
                    <div className="absolute top-2 left-2 badge bg-amber-400/90 text-amber-900 text-xs backdrop-blur-sm">
                      <Star className="w-3 h-3 mr-1 inline fill-current" /> Featured
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{activity.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {activity.duration_minutes}m</span>
                    <span className="capitalize">{activity.difficulty}</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {activity.avg_rating}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {activity.mental_health_goals.slice(0, 2).map(g => (
                      <span key={g} className="badge bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 text-xs capitalize">{g}</span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedActivity && (
        <ActivityModal activity={selectedActivity} onClose={() => setSelectedActivity(null)} onComplete={handleComplete} />
      )}
    </div>
  );
}
