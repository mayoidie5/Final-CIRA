import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface PendingDeletionAlertProps {
  userName: string;
  deletionDate: string;
  deletionReason: string;
  onClose: () => void;
}

export const PendingDeletionAlert: React.FC<PendingDeletionAlertProps> = ({
  userName,
  deletionDate,
  deletionReason,
  onClose,
}) => {
  // Parse deletion date safely
  let parsedDate = new Date(deletionDate);
  if (isNaN(parsedDate.getTime())) {
    // If date is invalid, try parsing as different formats
    try {
      parsedDate = new Date(parseInt(deletionDate));
    } catch {
      parsedDate = new Date(); // Fallback to today
    }
  }

  const daysUntilDeletion = Math.ceil(
    (parsedDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full animate-in slide-in-from-top">
        <div className="p-6 border-b border-red-200 dark:border-red-900 flex items-start gap-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Deletion Notice</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your account is scheduled for deletion</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span className="font-semibold">Account Name:</span> {userName}
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-2">
            <p className="text-sm text-red-700 dark:text-red-300">
              <span className="font-semibold">Deletion Date:</span>
            </p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">
              {isNaN(parsedDate.getTime()) ? 'Invalid Date' : parsedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-sm text-red-600 dark:text-red-400">
              {daysUntilDeletion > 0 
                ? `${daysUntilDeletion} day${daysUntilDeletion !== 1 ? 's' : ''} remaining`
                : 'Deletion scheduled for today'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span className="font-semibold">Reason:</span>
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded p-3">
              {deletionReason}
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              ⚠️ <span className="font-semibold">Important:</span> Your account will be permanently deleted on the date shown above. 
              All your data will be removed from the system. If you believe this is a mistake, contact the administrator.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
