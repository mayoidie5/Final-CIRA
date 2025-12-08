import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

interface NotificationBadgeProps {
  onClick: () => void;
  className?: string;
}

export const NotificationBadgeIcon: React.FC<NotificationBadgeProps> = ({
  onClick,
  className = '',
}) => {
  const { unreadCount } = useNotifications();

  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors ${className}`}
      title="Notifications"
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};
