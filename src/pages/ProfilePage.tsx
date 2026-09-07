import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Mail, Calendar, Edit3, Save, Loader2, Camera, Shield, Bell, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    date_of_birth: profile?.date_of_birth || '',
    timezone: profile?.timezone || 'UTC',
  });

  async function handleSave() {
    setSaving(true);
    await updateProfile(form);
    setSaving(false);
    setEditing(false);
  }

  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';

  return (
    <div className="page-container max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        {!editing ? (
          <button onClick={() => { setForm({ full_name: profile?.full_name || '', bio: profile?.bio || '', date_of_birth: profile?.date_of_birth || '', timezone: profile?.timezone || 'UTC' }); setEditing(true); }} className="btn-secondary flex items-center gap-2 text-sm">
            <Edit3 className="w-4 h-4" /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
            <button onClick={() => setEditing(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="card p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-glow">
              {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-teal-600 transition-colors shadow-sm">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center sm:text-left">
            {editing ? (
              <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Your full name" className="input-field text-2xl font-bold w-full sm:w-auto mb-2" />
            ) : (
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.full_name || 'Your Name'}</h2>
            )}
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 justify-center sm:justify-start mt-1">
              <Mail className="w-4 h-4" /> {user?.email}
            </p>
            <div className="flex items-center gap-3 mt-3 justify-center sm:justify-start">
              <span className={`badge capitalize ${profile?.role === 'admin' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                {profile?.role || 'user'}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Member since {memberSince}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl mb-6">
          {[
            { label: 'Wellness Score', value: profile?.wellness_score ?? 50 },
            { label: 'Day Streak', value: `${profile?.streak_count ?? 0} 🔥` },
            { label: 'Journal Entries', value: profile?.total_journal_entries ?? 0 },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Bio */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Bio</label>
            {editing ? (
              <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell us about yourself and your wellness journey..." className="input-field min-h-[100px] resize-none" />
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-sm">{profile?.bio || 'No bio added yet.'}</p>
            )}
          </div>

          {editing && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Date of Birth
                </label>
                <input type="date" value={form.date_of_birth} onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Timezone</label>
                <select value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))} className="input-field">
                  <option value="UTC">UTC</option>
                  <option value="Asia/Kolkata">India (IST)</option>
                  <option value="America/New_York">Eastern (ET)</option>
                  <option value="America/Los_Angeles">Pacific (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Asia/Singapore">Singapore (SGT)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Security */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-teal-500" /> Account & Security
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Email Address</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
            <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Verified</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Password</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Last changed: Never</p>
            </div>
            <button className="text-sm text-teal-600 dark:text-teal-400 font-medium hover:underline">Change</button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Auth</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Adds an extra layer of security</p>
            </div>
            <button className="text-sm text-teal-600 dark:text-teal-400 font-medium hover:underline">Enable</button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-teal-500" /> Notification Preferences
        </h2>
        <div className="space-y-3">
          {[
            { label: 'Journal reminders', desc: 'Daily prompts to write in your journal', key: 'journal' },
            { label: 'Mood check-ins', desc: 'Gentle nudges to log your daily mood', key: 'mood' },
            { label: 'Community activity', desc: 'Replies to your posts and new support', key: 'community' },
            { label: 'Wellness insights', desc: 'Weekly AI analysis of your patterns', key: 'insights' },
          ].map((pref, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{pref.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{pref.desc}</p>
              </div>
              <button className="relative w-11 h-6 bg-teal-500 rounded-full transition-colors">
                <span className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sign Out */}
      <div className="card p-6">
        <button onClick={signOut} className="flex items-center gap-3 text-red-600 dark:text-red-400 font-medium hover:text-red-700 dark:hover:text-red-300 transition-colors">
          <LogOut className="w-5 h-5" /> Sign Out of Inner Vaani
        </button>
      </div>
    </div>
  );
}
