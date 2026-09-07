import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, type Notification } from '../lib/supabase';
import { Bell, Check, CheckCheck, Trash2, Loader2, Info, Target, Award, AlertTriangle, Heart } from 'lucide-react';

const typeIcons = {
  info: Info, reminder: Target, achievement: Award, alert: AlertTriangle, wellness: Heart,
};
const typeColors = {
  info: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  reminder: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
  achievement: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
  alert: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  wellness: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20',
};

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const SAMPLE_NOTIFICATIONS = [
  { type: 'reminder', title: 'Time to Journal', message: 'You haven\'t written in your journal today. Take 5 minutes to reflect on your day.', created_at: new Date(Date.now() - 3600000).toISOString(), is_read: false },
  { type: 'achievement', title: '7-Day Streak!', message: 'Congratulations! You\'ve logged your mood 7 days in a row. Your consistency is building real wellness habits!', created_at: new Date(Date.now() - 86400000).toISOString(), is_read: false },
  { type: 'wellness', title: 'Weekly Insight Ready', message: 'Your weekly mental wellness report is ready. Your average mood improved by 15% this week!', created_at: new Date(Date.now() - 172800000).toISOString(), is_read: true },
  { type: 'reminder', title: 'Morning Meditation', message: 'Start your day right! Your personalized 10-minute morning meditation is waiting.', created_at: new Date(Date.now() - 259200000).toISOString(), is_read: true },
  { type: 'info', title: 'New Therapist Match', message: 'Based on your recent journal entries, we\'ve found 2 therapists who may be a great fit for you.', created_at: new Date(Date.now() - 345600000).toISOString(), is_read: true },
];

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<(Notification | typeof SAMPLE_NOTIFICATIONS[0])[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => { if (user) loadNotifications(); }, [user]);

  async function loadNotifications() {
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50);
    if (data && data.length > 0) {
      setNotifications(data as Notification[]);
    } else {
      setNotifications(SAMPLE_NOTIFICATIONS as any);
    }
    setLoading(false);
  }

  async function markRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => (n as any).id === id ? { ...n, is_read: true } : n));
  }

  async function markAllRead() {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user!.id);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  async function deleteNotification(id: string) {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => (n as any).id !== id));
  }

  const filtered = notifications.filter(n => filter === 'all' || !n.is_read);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="page-container max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-teal-500" /> Notifications
            {unreadCount > 0 && (
              <span className="badge bg-teal-500 text-white text-xs">{unreadCount}</span>
            )}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Stay on top of your wellness journey</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-ghost text-sm flex items-center gap-1.5">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'unread'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-teal-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
            {f} {f === 'unread' && unreadCount > 0 && `(${unreadCount})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">We'll notify you about your wellness journey progress.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif, i) => {
            const type = (notif as any).type as keyof typeof typeIcons;
            const Icon = typeIcons[type] || Info;
            const colorClass = typeColors[type] || typeColors.info;
            const id = (notif as any).id || `sample-${i}`;
            return (
              <div key={id} className={`card p-4 hover:shadow-md transition-all group ${!notif.is_read ? 'border-l-4 border-teal-500' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-semibold text-sm ${!notif.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {notif.title}
                      </h3>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        {!notif.is_read && (
                          <button onClick={() => markRead(id)} title="Mark as read" className="p-1 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 text-gray-400 hover:text-teal-600 transition-colors">
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => deleteNotification(id)} title="Delete" className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{timeAgo(notif.created_at)}</p>
                  </div>
                  {!notif.is_read && <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-2" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
