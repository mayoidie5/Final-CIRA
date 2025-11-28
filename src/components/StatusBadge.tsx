import React from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle, FileText, Wrench } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showIcon = false, size = 'md' }) => {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: any; label: string }> = {
      submitted: {
        color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400',
        icon: FileText,
        label: 'Submitted'
      },
      requested: {
        color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400',
        icon: Clock,
        label: 'Requested'
      },
      in_progress: {
        color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400',
        icon: Wrench,
        label: 'In Progress'
      },
      pending_resolution: {
        color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400',
        icon: AlertCircle,
        label: 'Pending Resolution'
      },
      request_for_resolution: {
        color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400',
        icon: AlertCircle,
        label: 'Request For Resolution'
      },
      resolved: {
        color: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400',
        icon: CheckCircle,
        label: 'Resolved'
      },
      rejected: {
        color: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400',
        icon: XCircle,
        label: 'Rejected'
      }
    };

    return configs[status] || configs.submitted;
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full ${config.color} ${sizeClasses[size]}`}>
      {showIcon && <Icon size={iconSizes[size]} />}
      {config.label}
    </span>
  );
};
