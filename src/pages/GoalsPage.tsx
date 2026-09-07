import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, type WellnessGoal } from '../lib/supabase';
import { Plus, Target, Edit3, Trash2, CheckCircle, X, Save, Loader2, TrendingUp, Calendar } from 'lucide-react';

const CATEGORIES = ['mental', 'physical', 'social', 'spiritual', 'emotional', 'habit'];
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  paused: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  abandoned: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

type WellnessGoalRow = WellnessGoal & { id: string };

export default function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<WellnessGoalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: 'mental', target_value: 30,
    current_value: 0, unit: 'days', deadline: '', status: 'active' as const,
  });

  useEffect(() => { if (user) loadGoals(); }, [user]);

  async function loadGoals() {
    const { data } = await supabase.from('wellness_goals').select('*').order('created_at', { ascending: false });
    if (data) setGoals(data as WellnessGoalRow[]);
    setLoading(false);
  }

  function openAdd() {
    setForm({ title: '', description: '', category: 'mental', target_value: 30, current_value: 0, unit: 'days', deadline: '', status: 'active' });
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(goal: WellnessGoalRow) {
    setForm({ title: goal.title, description: goal.description ?? '', category: goal.category ?? 'mental', target_value: goal.target_value ?? 30, current_value: goal.current_value ?? 0, unit: goal.unit ?? 'days', deadline: goal.deadline ?? '', status: goal.status as any ?? 'active' });
    setEditingId(goal.id);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = { ...form, deadline: form.deadline || null, description: form.description || null };
    if (editingId) {
      await supabase.from('wellness_goals').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editingId);
    } else {
      await supabase.from('wellness_goals').insert(payload);
    }
    await loadGoals();
    setSaving(false);
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    await supabase.from('wellness_goals').delete().eq('id', id);
    setGoals(prev => prev.filter(g => g.id !== id));
  }

  async function incrementProgress(goal: WellnessGoalRow) {
    const newVal = Math.min((goal.current_value ?? 0) + 1, goal.target_value ?? 999);
    const newStatus = newVal >= (goal.target_value ?? 999) ? 'completed' : goal.status;
    await supabase.from('wellness_goals').update({ current_value: newVal, status: newStatus }).eq('id', goal.id);
    setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, current_value: newVal, status: newStatus as any } : g));
  }

  const active = goals.filter(g => g.status === 'active');
  const completed = goals.filter(g => g.status === 'completed');

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Wellness Goals</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{active.length} active · {completed.length} completed</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Goals', value: active.length, color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20' },
          { label: 'Completed', value: completed.length, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Total', value: goals.length, color: 'text-gray-600 bg-gray-50 dark:bg-gray-800' },
        ].map((s, i) => (
          <div key={i} className={`card p-4 flex items-center gap-3 ${s.color}`}>
            <Target className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs opacity-80">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6 animate-slide-up">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{editingId ? 'Edit Goal' : 'New Wellness Goal'}</h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Goal Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g., Meditate for 30 days" className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field capitalize">
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Deadline</label>
              <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} min={new Date().toISOString().split('T')[0]} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Target Value</label>
              <input type="number" min="1" value={form.target_value} onChange={e => setForm(f => ({ ...f, target_value: parseInt(e.target.value) || 1 }))} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Unit</label>
              <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="days, sessions, minutes..." className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Why is this goal important to you?" className="input-field min-h-[80px] resize-none" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.title} className="btn-primary text-sm flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Goal
            </button>
          </div>
        </div>
      )}

      {/* Goals List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
      ) : goals.length === 0 ? (
        <div className="text-center py-16">
          <Target className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No goals yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">Set clear wellness goals to give your journey direction and purpose.</p>
          <button onClick={openAdd} className="btn-primary">Create Your First Goal</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map(goal => {
            const pct = goal.target_value ? Math.min(100, Math.round(((goal.current_value ?? 0) / goal.target_value) * 100)) : 0;
            return (
              <div key={goal.id} className={`card p-5 hover:shadow-md transition-all group ${goal.status === 'completed' ? 'opacity-80' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge text-xs capitalize ${STATUS_COLORS[goal.status]}`}>{goal.status}</span>
                      <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs capitalize">{goal.category}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                  </div>
                  <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(goal)} className="p-1.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 text-gray-400 hover:text-teal-600">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(goal.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {goal.description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{goal.description}</p>}

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Progress</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{goal.current_value ?? 0} / {goal.target_value} {goal.unit}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${goal.status === 'completed' ? 'bg-emerald-500' : 'bg-gradient-to-r from-teal-500 to-emerald-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{pct}% complete</span>
                    {goal.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>

                {goal.status === 'active' && (
                  <button onClick={() => incrementProgress(goal)} className="w-full py-2 rounded-xl bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-sm font-medium hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Log Progress +1
                  </button>
                )}
                {goal.status === 'completed' && (
                  <div className="w-full py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Goal Achieved!
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
