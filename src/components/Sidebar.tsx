import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, BookOpen, BarChart2, Heart, Users,
  MessageCircle, Stethoscope, Shield, Bell, User,
  Settings, ChevronRight, Zap, Target
} from 'lucide-react';

type SidebarProps = {
  currentPage: string;
  setCurrentPage: (page: string) => void;
};

const navGroups = [
  {
    label: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
      { icon: Bell, label: 'Notifications', page: 'notifications' },
    ]
  },
  {
    label: 'Wellness',
    items: [
      { icon: BookOpen, label: 'My Journal', page: 'journal' },
      { icon: BarChart2, label: 'Mood Tracker', page: 'tracker' },
      { icon: Target, label: 'My Goals', page: 'goals' },
      { icon: Heart, label: 'Wellness Library', page: 'library' },
    ]
  },
  {
    label: 'Connect',
    items: [
      { icon: Users, label: 'Community', page: 'community' },
      { icon: MessageCircle, label: 'AI Assistant', page: 'chatbot' },
      { icon: Stethoscope, label: 'Therapists', page: 'therapists' },
    ]
  },
  {
    label: 'Support',
    items: [
      { icon: Shield, label: 'Emergency Support', page: 'emergency' },
    ]
  },
  {
    label: 'Account',
    items: [
      { icon: User, label: 'Profile', page: 'profile' },
      { icon: Settings, label: 'Settings', page: 'settings' },
    ]
  }
];

export default function Sidebar({ currentPage, setCurrentPage }: SidebarProps) {
  const { profile } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-16 bottom-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 overflow-y-auto hide-scrollbar z-40">
      <div className="flex-1 px-4 py-6 space-y-6">
        {/* Wellness Score */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Wellness Score</span>
            <span className="text-lg font-bold text-gradient">{profile?.wellness_score ?? 50}</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full transition-all duration-700"
              style={{ width: `${profile?.wellness_score ?? 50}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-gray-400">Streak: {profile?.streak_count ?? 0} days</span>
            <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
              {(profile?.wellness_score ?? 50) >= 70 ? 'Great!' : (profile?.wellness_score ?? 50) >= 50 ? 'Good' : 'Keep going'}
            </span>
          </div>
        </div>

        {/* Navigation Groups */}
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-4 mb-2">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(item => (
                <button
                  key={item.page}
                  onClick={() => setCurrentPage(item.page)}
                  className={`sidebar-link w-full text-left ${currentPage === item.page ? 'active' : ''}`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {currentPage === item.page && <ChevronRight className="w-4 h-4 opacity-50" />}
                </button>
              ))}
            </div>
          </div>
        ))}

        {profile?.role === 'admin' && (
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-4 mb-2">Admin</p>
            <button
              onClick={() => setCurrentPage('admin')}
              className={`sidebar-link w-full text-left ${currentPage === 'admin' ? 'active' : ''}`}
            >
              <Zap className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">Admin Panel</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
