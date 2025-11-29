import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SignIn } from './components/SignIn';
import { SignUp } from './components/SignUp';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ReportIssue } from './components/ReportIssue';
import { TicketList } from './components/TicketList';
import { UserManagement } from './components/UserManagement';
import { FormEditor } from './components/FormEditor';
import { Archive } from './components/Archive';
import { Settings } from './components/Settings';
import { Tutorial } from './components/Tutorial';
import { LayoutDashboard, FileText, Plus, Users, Edit, Archive as ArchiveIcon, Menu, X, HelpCircle } from 'lucide-react';
import { MOCK_USERS, MOCK_PASSWORDS, DEFAULT_FORM_CONFIG } from './utils/mockData';
import { SAMPLE_TICKETS } from './utils/sampleData';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signin');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Initialize localStorage with required data on first load
  useEffect(() => {
    if (!localStorage.getItem('formConfig')) {
      localStorage.setItem('formConfig', JSON.stringify(DEFAULT_FORM_CONFIG));
    }
    if (!localStorage.getItem('notifications')) {
      localStorage.setItem('notifications', JSON.stringify([]));
    }
  }, []);

  if (!user) {
    if (authView === 'signin') {
      return (
        <SignIn
          onSwitchToSignUp={() => setAuthView('signup')}
          onSignInSuccess={() => setCurrentPage('dashboard')}
        />
      );
    } else {
      return (
        <SignUp onSwitchToSignIn={() => setAuthView('signin')} />
      );
    }
  }

  const getNavItems = () => {
    if (user.role === 'admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'tickets', label: 'Ticket List', icon: FileText },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'form-editor', label: 'Form Editor', icon: Edit },
        { id: 'archive', label: 'Archive', icon: ArchiveIcon },
      ];
    } else if (user.role === 'class_rep') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'report', label: 'Report Issue', icon: Plus },
        { id: 'my-tickets', label: 'My Tickets', icon: FileText },
        { id: 'review', label: 'Review Tickets', icon: FileText },
        { id: 'archive', label: 'Archive', icon: ArchiveIcon },
      ];
    } else {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'report', label: 'Report Issue', icon: Plus },
        { id: 'tickets', label: 'My Tickets', icon: FileText },
        { id: 'archive', label: 'Archive', icon: ArchiveIcon },
      ];
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'report':
        return <ReportIssue onSuccess={() => setCurrentPage('dashboard')} />;
      case 'tickets':
        return <TicketList view="all" />;
      case 'my-tickets':
        return <TicketList view="my-tickets" />;
      case 'review':
        return <TicketList view="review" />;
      case 'users':
        return <UserManagement />;
      case 'form-editor':
        return <FormEditor />;
      case 'archive':
        return <Archive />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        onOpenSettings={() => setShowSettings(true)} 
        onNavigate={setCurrentPage}
        onOpenTutorial={() => setShowTutorial(true)}
      />

      <div className="flex">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 top-16"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:sticky top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform z-40 overflow-y-auto`}
        >
          <nav className="p-4 space-y-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            {/* Tutorial Button */}
            <button
              onClick={() => setShowTutorial(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 mt-4 border-t border-gray-200 dark:border-gray-700 pt-4"
            >
              <HelpCircle size={20} />
              <span>Tutorial</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          {renderPage()}
        </main>
      </div>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
