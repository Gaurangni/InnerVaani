import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import JournalPage from './pages/JournalPage';
import MoodTrackerPage from './pages/MoodTrackerPage';
import WellnessLibraryPage from './pages/WellnessLibraryPage';
import CommunityPage from './pages/CommunityPage';
import ChatbotPage from './pages/ChatbotPage';
import TherapistsPage from './pages/TherapistsPage';
import EmergencyPage from './pages/EmergencyPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPanel from './pages/AdminPanel';
import GoalsPage from './pages/GoalsPage';
import { Loader2 } from 'lucide-react';

type Page = string;

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');

  useEffect(() => {
    if (!loading) {
      if (user && (currentPage === 'home' || currentPage === 'login' || currentPage === 'signup' || currentPage === 'forgot')) {
        setCurrentPage('dashboard');
      } else if (!user && !['home', 'login', 'signup', 'forgot', 'library', 'therapists', 'community', 'features'].includes(currentPage)) {
        setCurrentPage('home');
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading your wellness space...</p>
        </div>
      </div>
    );
  }

  const isAuthPage = ['login', 'signup', 'forgot'].includes(currentPage);
  const isPublicPage = ['home', 'features', 'library', 'therapists', 'community'].includes(currentPage);
  const showSidebar = user && !isAuthPage && !isPublicPage;

  const renderPage = () => {
    switch (currentPage) {
      case 'home': case 'features':
        return <LandingPage setCurrentPage={setCurrentPage} />;
      case 'login':
        return <AuthPage mode="login" setCurrentPage={setCurrentPage} />;
      case 'signup':
        return <AuthPage mode="signup" setCurrentPage={setCurrentPage} />;
      case 'forgot':
        return <AuthPage mode="forgot" setCurrentPage={setCurrentPage} />;
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} />;
      case 'journal':
        return <JournalPage />;
      case 'tracker':
        return <MoodTrackerPage />;
      case 'library':
        return <WellnessLibraryPage />;
      case 'community':
        return <CommunityPage />;
      case 'chatbot':
        return <ChatbotPage setCurrentPage={setCurrentPage} />;
      case 'therapists':
        return <TherapistsPage />;
      case 'emergency':
        return <EmergencyPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'goals':
        return <GoalsPage />;
      case 'admin':
        return <AdminPanel />;
      case 'settings':
        return <ProfilePage />;
      default:
        return <LandingPage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <div className={`flex ${!isAuthPage && !isPublicPage.toString() ? 'pt-16' : ''}`}>
        {showSidebar && (
          <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        )}

        <main className={`flex-1 ${showSidebar ? 'lg:ml-64' : ''} ${isAuthPage ? '' : 'pt-16'}`}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
