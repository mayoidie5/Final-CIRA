import React, { useState } from 'react';
import { MoreVertical, LucideIcon } from 'lucide-react';

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success';
  disabled?: boolean;
}

interface QuickActionsProps {
  actions: QuickAction[];
  position?: 'left' | 'right';
}

export const QuickActions: React.FC<QuickActionsProps> = ({ 
  actions, 
  position = 'right' 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getVariantClasses = (variant: QuickAction['variant'] = 'default') => {
    switch (variant) {
      case 'danger':
        return 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20';
      case 'success':
        return 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20';
      default:
        return 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
      >
        <MoreVertical size={20} />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className={`absolute ${position === 'right' ? 'right-0' : 'left-0'} mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden`}>
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => {
                    if (!action.disabled) {
                      action.onClick();
                      setShowMenu(false);
                    }
                  }}
                  disabled={action.disabled}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                    action.disabled
                      ? 'opacity-50 cursor-not-allowed'
                      : getVariantClasses(action.variant)
                  }`}
                >
                  <Icon size={18} />
                  {action.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
