import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Brain, Sun, Moon, Bell, Menu, X, ChevronDown, LogOut,
  User, Settings, LayoutDashboard, BookOpen, BarChart2,
  Heart, Users, MessageCircle, Stethoscope, Shield, Zap
} from 'lucide-react';

type Page = string;

type NavbarProps = {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
};

export default function Navbar({ currentPage, setCurrentPage }: NavbarProps) {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = [
    { label: 'Features', page: 'features' },
    { label: 'Wellness Library', page: 'library' },
    { label: 'Therapists', page: 'therapists' },
    { label: 'Community', page: 'community' },
  ];

  const dashboardItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
    { icon: BookOpen, label: 'Journal', page: 'journal' },
    { icon: BarChart2, label: 'Mood Tracker', page: 'tracker' },
    { icon: Heart, label: 'Wellness Library', page: 'library' },
    { icon: Users, label: 'Community', page: 'community' },
    { icon: MessageCircle, label: 'AI Assistant', page: 'chatbot' },
    { icon: Stethoscope, label: 'Therapists', page: 'therapists' },
    { icon: Shield, label: 'Emergency', page: 'emergency' },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => setCurrentPage(user ? 'dashboard' : 'home')} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-gray-900 dark:text-white">Inner</span>
              <span className="text-xl font-bold text-gradient">Vaani</span>
            </div>
          </button>

          {/* Desktop nav */}
          {!user ? (
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <button
                  key={item.page}
                  onClick={() => setCurrentPage(item.page)}
                  className={`nav-link px-4 py-2 rounded-lg ${currentPage === item.page ? 'text-teal-600 dark:text-teal-400' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1">
              {dashboardItems.slice(0, 5).map(item => (
                <button
                  key={item.page}
                  onClick={() => setCurrentPage(item.page)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === item.page
                      ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
                      : 'text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="btn-ghost p-2 rounded-xl">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <>
                <button onClick={() => setCurrentPage('notifications')} className="btn-ghost p-2 rounded-xl relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-teal-500 rounded-full"></span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                      {profile?.full_name || 'User'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-12 w-56 card shadow-lg py-2 animate-slide-up z-50">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{profile?.full_name || 'User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        {profile?.role === 'admin' && (
                          <span className="badge bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 mt-1">Admin</span>
                        )}
                      </div>
                      <button onClick={() => { setCurrentPage('profile'); setUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <User className="w-4 h-4" /> Profile
                      </button>
                      <button onClick={() => { setCurrentPage('settings'); setUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Settings className="w-4 h-4" /> Settings
                      </button>
                      {profile?.role === 'admin' && (
                        <button onClick={() => { setCurrentPage('admin'); setUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <Zap className="w-4 h-4" /> Admin Panel
                        </button>
                      )}
                      <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                        <button onClick={() => { signOut(); setUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button onClick={() => setCurrentPage('login')} className="btn-ghost">Sign In</button>
                <button onClick={() => setCurrentPage('signup')} className="btn-primary py-2 px-5">Get Started</button>
              </div>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden btn-ghost p-2 rounded-xl">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-gray-200/50 dark:border-gray-700/50 animate-slide-up">
          <div className="px-4 py-4 space-y-1">
            {(user ? dashboardItems : navItems.map(i => ({ ...i, icon: Brain }))).map((item) => (
              <button
                key={item.page}
                onClick={() => { setCurrentPage(item.page); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors ${
                  currentPage === item.page
                    ? 'text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {'icon' in item && <item.icon className="w-5 h-5" />}
                {item.label}
              </button>
            ))}
            {!user && (
              <div className="flex gap-2 pt-2">
                <button onClick={() => { setCurrentPage('login'); setMobileOpen(false); }} className="btn-secondary flex-1">Sign In</button>
                <button onClick={() => { setCurrentPage('signup'); setMobileOpen(false); }} className="btn-primary flex-1">Sign Up</button>
              </div>
            )}
          </div>
        </div>
      )}

      {userMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />}
    </nav>
  );
}
