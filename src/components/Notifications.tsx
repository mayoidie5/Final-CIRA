import React from 'react';
import { PageHeader } from './PageHeader';
import { NotificationList } from './NotificationList';

interface NotificationsProps {
  onNavigate?: (page: string) => void;
}

export const Notifications: React.FC<NotificationsProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="View and manage all your notifications"
      />
      <NotificationList onNavigate={onNavigate} />
    </div>
  );
};
