import React from 'react';

interface NotificationBadgeProps {
  count: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count, 
  max = 99,
  size = 'md',
  position = 'top-right'
}) => {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count;

  const sizeClasses = {
    sm: 'text-xs min-w-[16px] h-4 px-1',
    md: 'text-xs min-w-[20px] h-5 px-1.5',
    lg: 'text-sm min-w-[24px] h-6 px-2'
  };

  const positionClasses = {
    'top-right': '-top-1 -right-1',
    'top-left': '-top-1 -left-1',
    'bottom-right': '-bottom-1 -right-1',
    'bottom-left': '-bottom-1 -left-1'
  };

  return (
    <span 
      className={`absolute ${positionClasses[position]} ${sizeClasses[size]} bg-red-600 text-white rounded-full flex items-center justify-center`}
    >
      {displayCount}
    </span>
  );
};
