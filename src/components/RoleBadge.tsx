import React from 'react';
import { Shield, Users, User } from 'lucide-react';

interface RoleBadgeProps {
  role: 'admin' | 'class_rep' | 'student';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md', showIcon = true }) => {
  const roleConfig = {
    admin: {
      label: 'Admin',
      color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400',
      icon: Shield
    },
    class_rep: {
      label: 'Class Representative',
      color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400',
      icon: Users
    },
    student: {
      label: 'Student',
      color: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400',
      icon: User
    }
  };

  const config = roleConfig[role];
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
