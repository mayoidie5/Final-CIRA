import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SignIn } from './components/SignIn';
import { SignUp } from './components/SignUp';
import { Header } from './components/Header';
import { EmailVerificationModal } from './components/EmailVerification';
import { Dashboard } from './components/Dashboard';
import { ReportIssue } from './components/ReportIssue';
import { TicketList } from './components/TicketList';
import { UserManagement } from './components/UserManagement';
import { FormEditor } from './components/FormEditor';
import { Archive } from './components/Archive';
import { Settings } from './components/Settings';
import { Tutorial } from './components/Tutorial';
import { LayoutDashboard, FileText, Plus, Users, Edit, Archive as ArchiveIcon, Menu, X, HelpCircle } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signin');
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('lastPage') || 'dashboard';
  });
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Sidebar closed by default on mobile (< 1024px), open on desktop
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  });
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);

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
    console.log('🚀 App.tsx useEffect - checking for verification link');
    console.log('📍 Current URL:', window.location.href);
    console.log('📍 Pathname:', window.location.pathname);
    console.log('📍 Search:', window.location.search);
    console.log('📍 Hash:', window.location.hash);
    
    if (!localStorage.getItem('notifications')) {
      localStorage.setItem('notifications', JSON.stringify([]));
    }

    // Check if user arrived from email verification link
    const pathname = window.location.pathname;
    const pathParts = pathname.split('/').filter(p => p); // Split and remove empty parts
    
    console.log('🔍 Path parts:', pathParts);
    
    // Try to extract token and email from path: /verify/TOKEN/EMAIL
    let token = null;
    let email = null;
    
    if (pathParts[0] === 'verify' && pathParts.length >= 3) {
      token = decodeURIComponent(pathParts[1]);
      email = decodeURIComponent(pathParts[2]);
      console.log('✅ Verification link detected from path');
      console.log('   Token:', token);
      console.log('   Email:', email);
    } else {
      // Fallback: try query params or hash
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      token = urlParams.get('token') || hashParams.get('token');
      email = urlParams.get('email') || hashParams.get('email');
      
      if (token && email) {
        console.log('✅ Verification link detected from query/hash params');
      }
    }
    
    if (token && email) {
      console.log('✅ Verification link detected, opening modal');
      console.log('   Setting showEmailVerificationModal = true');
      setShowEmailVerificationModal(true);
      return;
    }
    
    console.log('⚠️ No token/email found in URL');
    
    // Check for /verify path and redirect from localhost if needed
    if (pathname.includes('/verify')) {
      console.log('✅ /verify path detected');
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isLocalhost) {
        // If on localhost, redirect to network IP
        const networkIP = localStorage.getItem('networkIP');
        const networkPort = localStorage.getItem('networkPort') || '3000';
        
        if (networkIP && networkIP !== 'localhost' && networkIP !== '127.0.0.1') {
          const newUrl = `http://${networkIP}:${networkPort}${pathname}${window.location.search}${window.location.hash}`;
          console.log('🔄 Redirecting verification to network IP:', newUrl);
          window.location.href = newUrl;
          return;
        }
      }
      
      setShowEmailVerificationModal(true);
    }
  }, []);

  if (!user) {
    if (authView === 'signin') {
      return (
        <>
          <SignIn
            onSwitchToSignUp={() => setAuthView('signup')}
            onSignInSuccess={() => setCurrentPage('dashboard')}
          />
          <EmailVerificationModal 
            isOpen={showEmailVerificationModal} 
            onClose={() => {
              setShowEmailVerificationModal(false);
              // Clear URL parameters after verification
              window.history.replaceState({}, document.title, window.location.pathname);
            }} 
          />
        </>
      );
    } else {
      return (
        <>
          <SignUp onSwitchToSignIn={() => setAuthView('signin')} />
          <EmailVerificationModal 
            isOpen={showEmailVerificationModal} 
            onClose={() => {
              setShowEmailVerificationModal(false);
              window.history.replaceState({}, document.title, window.location.pathname);
            }} 
          />
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
      console.log('📄 Set currentPage to: tickets');
    } else {
      setSelectedTicketId(null);
      setCurrentPage(page);
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
      <EmailVerificationModal 
        isOpen={showEmailVerificationModal} 
        onClose={() => setShowEmailVerificationModal(false)} 
      />
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
