import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SignIn } from './components/SignIn';
import { SignUp } from './components/SignUp';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ReportIssue } from './components/ReportIssue';
import { TicketList } from './components/TicketList';
import { UserManagement } from './components/UserManagement';
import { FormEditor } from './components/FormEditor';
import { Archive } from './components/Archive';
import { Settings } from './components/Settings';
import { Tutorial } from './components/Tutorial';
import { LayoutDashboard, FileText, Plus, Users, Edit, Archive as ArchiveIcon, Menu, X, HelpCircle, CheckCircle } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [authView, setAuthView] = useState<'signin' | 'signup' | 'forgot-password' | 'reset-password'>('signin');
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('lastPage') || 'dashboard';
  });
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [resetPasswordCode, setResetPasswordCode] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Sidebar closed by default on mobile (< 1024px), open on desktop
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  });
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [processingVerification, setProcessingVerification] = useState(false);

  // Check for verification link on mount
  useEffect(() => {
    const url = new URL(window.location.href);
    const pathname = url.pathname;
    const mode = url.searchParams.get('mode');
    const oobCode = url.searchParams.get('oobCode');
    const verifying = url.searchParams.get('verifying');
    
    // Check if AuthContext has already processed email verification
    const showSuccess = localStorage.getItem('showVerificationSuccess');
    if (showSuccess === 'true') {
      localStorage.removeItem('showVerificationSuccess');
      setVerificationSuccess(true);
      return;
    }
    
    // Handle password reset code from email link
    // MUST be checked FIRST to prevent auto-close
    if (mode === 'resetPassword' && oobCode) {
      console.log('🔐 Detected password reset link');
      setResetPasswordCode(oobCode);
      setAuthView('reset-password');
      return; // EARLY RETURN - stops all other checks
    }
    
    // Handle email verification code from email link
    // Email verification is handled automatically by AuthContext
    // Wait for AuthContext to process it and set the success flag
    if (mode === 'verifyEmail' && oobCode) {
      console.log('📧 Detected email verification link - waiting for AuthContext');
      setProcessingVerification(true);
      // AuthContext's handleVerificationLink effect runs in parallel
      // It will set the showVerificationSuccess flag when done
      // Check for the flag periodically
      const checkFlag = setInterval(() => {
        const success = localStorage.getItem('showVerificationSuccess');
        if (success === 'true') {
          localStorage.removeItem('showVerificationSuccess');
          setVerificationSuccess(true);
          setProcessingVerification(false);
          clearInterval(checkFlag);
        }
      }, 100);
      
      // Clear interval after 5 seconds if flag is not set
      setTimeout(() => {
        clearInterval(checkFlag);
        setProcessingVerification(false);
      }, 5000);
      
      return;
    }
    
    // Handle route-based navigation for logged-in users
    if (user && pathname !== '/') {
      if (pathname.startsWith('/tickets/')) {
        // Extract ticket ID from /tickets/{ticketId}
        const ticketId = pathname.split('/')[2];
        setSelectedTicketId(ticketId);
        setCurrentPage('tickets');
        return;
      } else if (pathname.startsWith('/')) {
        // Navigate to page (remove leading slash)
        const page = pathname.substring(1);
        if (page) {
          setCurrentPage(page);
          return;
        }
      }
    }
    
    // Handle route-based navigation for non-authenticated users
    if (!user) {
      if (pathname === '/signup') {
        setAuthView('signup');
        return;
      } else if (pathname === '/forgot-password') {
        setAuthView('forgot-password');
        return;
      } else if (pathname === '/auth/action' || pathname === '/resend-email-verification') {
        // Don't navigate away from auth action pages (handles both email verification and password reset)
        return;
      } else if (pathname === '/reset-password') {
        // Don't navigate away from reset-password page
        return;
      } else if (pathname === '/' || pathname === '/signin') {
        // Default to signin if on root or signin path
        window.history.replaceState({}, '', '/signin');
        setAuthView('signin');
        return;
      }
    }
    
    // Check if user came from Firebase verification (verifying=true means they just verified)
    // Don't close if this is a password reset page
    if (verifying === 'true' && pathname !== '/reset-password') {
      console.log('✅ User returned from Firebase verification');
      setVerificationSuccess(true);
      
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Close tab after 2 seconds
      setTimeout(() => {
        window.close();
      }, 2000);
      return;
    }
    
    // Check if this is a direct verification code link
    if (mode === 'verifyEmail' && oobCode) {
      // Show success message after a brief delay to ensure verification is complete
      setTimeout(() => {
        setVerificationSuccess(true);
      }, 500);
    }
  }, [user]);

  // Save current page to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('lastPage', currentPage);
  }, [currentPage]);

  // Handle window resize to manage sidebar visibility
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // Desktop: keep sidebar open
        setSidebarOpen(true);
      } else {
        // Mobile: close sidebar
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize localStorage with required data on first load
  useEffect(() => {
    if (!localStorage.getItem('notifications')) {
      localStorage.setItem('notifications', JSON.stringify([]));
    }
  }, []);

  // Show verification success screen
  if (verificationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6 animate-pulse" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Email Verified!</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">Your email has been successfully verified.</p>
          <p className="text-gray-500 dark:text-gray-500">This tab will close automatically in a moment...</p>
        </div>
      </div>
    );
  }

  // Show loading screen while processing verification link
  if (processingVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authView === 'signin') {
      return (
        <>
          <SignIn
            onSwitchToSignUp={() => {
              setAuthView('signup');
              window.history.pushState({}, '', '/signup');
            }}
            onSwitchToForgotPassword={() => {
              setAuthView('forgot-password');
              window.history.pushState({}, '', '/forgot-password');
            }}
            onSignInSuccess={() => setCurrentPage('dashboard')}
          />
        </>
      );
    } else if (authView === 'signup') {
      return (
        <>
          <SignUp onSwitchToSignIn={() => {
            setAuthView('signin');
            window.history.pushState({}, '', '/signin');
          }} />
        </>
      );
    } else if (authView === 'forgot-password') {
      return (
        <>
          <ForgotPassword onBackToLogin={() => {
            setAuthView('signin');
            window.history.pushState({}, '', '/signin');
          }} />
        </>
      );
    } else if (authView === 'reset-password') {
      return (
        <>
          <ResetPassword oobCode={resetPasswordCode || undefined} />
        </>
      );
    }
  }

  // Handle page navigation, with special handling for ticket URLs
  const handleNavigate = (page: string) => {
    console.log('🧭 handleNavigate called with:', page);
    if (page.startsWith('tickets/')) {
      // Extract ticket ID from "tickets/{ticketId}"
      const ticketId = page.split('/')[1];
      console.log('🎫 Extracted ticketId:', ticketId);
      setSelectedTicketId(ticketId);
      setCurrentPage('tickets');
      window.history.pushState({}, '', `/tickets/${ticketId}`);
      console.log('📄 Set currentPage to: tickets');
    } else {
      setSelectedTicketId(null);
      setCurrentPage(page);
      window.history.pushState({}, '', `/${page}`);
    }
  };

  const getNavItems = () => {
    if (user.role === 'admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'tickets', label: 'Ticket List', icon: FileText },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'form-editor', label: 'Form Editor', icon: Edit },
        { id: 'archive', label: 'Archive', icon: ArchiveIcon },
      ];
    } else if (user.role === 'class_rep' && !user.isPending) {
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
        return <Dashboard onNavigate={handleNavigate} />;
      case 'report':
        return <ReportIssue onSuccess={() => setCurrentPage('dashboard')} />;
      case 'tickets':
        return <TicketList view="all" selectedTicketId={selectedTicketId} />;
      case 'my-tickets':
        return <TicketList view="my-tickets" selectedTicketId={selectedTicketId} />;
      case 'review':
        return <TicketList view="review" selectedTicketId={selectedTicketId} />;
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
        onNavigate={handleNavigate}
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
            className="lg:hidden fixed inset-0 bg-black/50 z-30 top-16"
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
                    setSelectedTicketId(null);
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
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
