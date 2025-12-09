import React, { useState, useRef, useEffect } from 'react';
import { Bell, User, LogOut, Settings, Sun, Moon, Monitor, X, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';

interface HeaderProps {
  onOpenSettings: () => void;
  onNavigate?: (page: string) => void;
  onOpenTutorial: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onNavigate, onOpenTutorial }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotif } = useNotifications();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun size={18} />;
      case 'dark': return <Moon size={18} />;
      case 'system': return <Monitor size={18} />;
    }
  };

  const handleNotificationClick = async (notification: any) => {
    try {
      await markAsRead(notification.id);
      if (notification.targetPage && onNavigate) {
        // Extract the page and ID from the targetPage (e.g., "/tickets/123" -> navigate to ticket details)
        if (notification.targetPage.startsWith('/tickets/')) {
          // For ticket notifications, we navigate to a specific ticket
          // Store the ticket ID to be displayed and navigate to tickets view
          onNavigate(`tickets/${notification.ticketId}`);
        } else {
          // For other pages, just navigate directly
          onNavigate(notification.targetPage);
        }
        setShowNotifications(false);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img 
              src={theme === 'dark' ? '/assets/MainLogoWhite.png' : '/assets/MainLogoNavyBlue.png'}
              alt="CIRA Logo" 
              className="h-8 w-auto flex-shrink-0"
            />
            <h1 className="text-blue-600 dark:text-blue-400 truncate text-base sm:text-xl md:text-2xl">
              <span className="hidden sm:inline">Comlab Issue Reporting</span>
              <span className="sm:hidden">Comlab</span>
            </h1>
          </div>

          {/* Right side - Tutorial, Notifications and Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Tutorial Button */}
            <button
              onClick={onOpenTutorial}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Tutorial"
            >
              <HelpCircle size={20} className="text-gray-600 dark:text-gray-300" />
            </button>

            {/* Notifications */}
            <div ref={notificationRef} className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Bell size={20} className="text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-gray-800 dark:text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={async () => {
                            try {
                              if (user?.id) {
                                await markAllAsRead(user.id);
                              }
                            } catch (error) {
                              console.error('Error marking all as read:', error);
                            }
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete all notifications?')) {
                            if (user?.id) {
                              // Delete all notifications one by one
                              notifications.forEach(notif => {
                                deleteNotif(notif.id).catch(err => console.error('Error deleting notification:', err));
                              });
                            }
                          }
                        }}
                        className="text-red-600 dark:text-red-400 hover:underline text-sm"
                      >
                        Delete All Notifications
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No notifications
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                            !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <p className="text-gray-800 dark:text-white">{notification.message}</p>
                          <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-gray-800 dark:text-white">{user?.firstName} {user?.lastName}</p>
                    <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                      {user?.role === 'admin' ? 'Admin' : user?.role === 'class_rep' ? 'Class Representative' : 'Student'}
                    </p>
                    {(user?.course || user?.section || user?.yearLevel) && (
                      <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {user?.course} {user?.yearLevel && `- ${user.yearLevel}`} {user?.section && `- Section ${user.section}`}
                      </p>
                    )}
                  </div>

                  <div className="p-2">
                    <div className="px-3 py-2">
                      <p className="text-gray-700 dark:text-gray-300 mb-2">Theme</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTheme('light')}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded ${
                            theme === 'light'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <Sun size={16} />
                        </button>
                        <button
                          onClick={() => setTheme('dark')}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded ${
                            theme === 'dark'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <Moon size={16} />
                        </button>
                        <button
                          onClick={() => setTheme('system')}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded ${
                            theme === 'system'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <Monitor size={16} />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={onOpenSettings}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
                    >
                      <Settings size={18} />
                      <span>Settings</span>
                    </button>

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-600 dark:text-red-400"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
